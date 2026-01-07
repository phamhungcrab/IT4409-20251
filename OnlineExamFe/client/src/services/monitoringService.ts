/**
 * =========================
 * MonitoringService
 * =========================
 * Mục tiêu của class này:
 * - Quản lý 1 kết nối WebSocket (WS) dùng chung (singleton instance).
 * - Tự động reconnect khi bị rớt mạng / server restart / mất kết nối bất ngờ.
 * - Cho phép “update callbacks” (onMessage/onStatusChange/onOpen) khi component re-render
 *   mà không phải tạo socket mới nếu không cần.
 *
 * Ý tưởng kiến trúc:
 * - Đây là “service layer” thuần TS, không phụ thuộc React.
 * - Component/hook gọi connect() và truyền callback.
 * - Service giữ socket + callback hiện tại, tự handle vòng đời.
 */
class MonitoringService {
  /**
   * socket:
   * - WebSocket instance hiện tại.
   * - null nghĩa là chưa connect hoặc đã disconnect/hủy.
   */
  private socket: WebSocket | null = null;

  /**
   * url:
   * - URL WS hiện tại đang được service dùng để connect.
   * - Dùng để detect khi url đổi => phải tạo kết nối mới.
   */
  private url: string = '';

  // =========================
  // CALLBACKS (UI / nghiệp vụ)
  // =========================

  /**
   * onMessageCallback:
   * - Hàm được gọi mỗi khi nhận message từ server.
   * - data có thể là object (JSON) hoặc string/number (fallback).
   */
  private onMessageCallback: ((data: any) => void) | null = null;

  /**
   * onStatusChangeCallback:
   * - Callback để UI cập nhật trạng thái WS.
   * - Quy ước 3 trạng thái:
   *   - connecting: đang kết nối
   *   - connected: đã kết nối
   *   - disconnected: mất kết nối
   */
  private onStatusChangeCallback:
    ((status: 'connecting' | 'connected' | 'disconnected') => void) | null = null;

  /**
   * onOpenCallback:
   * - Callback chạy khi socket onopen.
   * - Dùng cho các hành động "nghiệp vụ" sau khi connect:
   *   - gửi SyncState (kéo lại answers/timer)
   *   - gửi join room
   *   - handshake...
   *
   * Ghi chú:
   * - Callback này sẽ được gọi cả khi reconnect thành công.
   */
  private onOpenCallback: (() => void) | null = null;

  // =========================
  // RECONNECT STATE
  // =========================

  /**
   * reconnectAttempts:
   * - Đếm số lần đã thử reconnect liên tiếp.
   * - Reset về 0 khi connect lại thành công.
   */
  private reconnectAttempts = 0;

  /**
   * maxReconnectAttempts:
   * - Giới hạn số lần reconnect.
   * - Tránh loop vô hạn nếu server chết hẳn hoặc URL sai.
   */
  private maxReconnectAttempts = 10;

  /**
   * isConnecting:
   * - Cờ đánh dấu đang trong quá trình tạo kết nối.
   * - Ngăn việc gọi initSocket() trùng lặp.
   */
  private isConnecting = false;

  /**
   * reconnectTimeoutId:
   * - Id timeout của setTimeout dùng để schedule reconnect.
   * - Lưu để clearTimeout khi:
   *   - disconnect chủ động
   *   - connect url mới
   */
  private reconnectTimeoutId: any = null;

  /**
   * isIntentionalClose:
   * - Cờ đánh dấu “đóng có chủ đích” (do client gọi disconnect()).
   * - Nếu true => onclose sẽ KHÔNG schedule reconnect.
   * - Nếu false => coi là disconnect ngoài ý muốn => auto reconnect.
   */
  private isIntentionalClose = false;

  /**
   * =========================
   * connect()
   * =========================
   * Tạo hoặc tái sử dụng WebSocket.
   *
   * Input:
   * - url: WS endpoint
   * - onMessage: callback xử lý message
   * - onStatusChange: callback báo trạng thái (optional)
   * - onOpen: callback chạy khi kết nối thành công (optional)
   *
   * Hành vi:
   * 1) Nếu url thay đổi hoặc socket đã CLOSED hoặc chưa có socket:
   *    - disconnect socket cũ
   *    - set url + callbacks mới
   *    - reset flags reconnect
   *    - initSocket() để tạo kết nối mới
   *
   * 2) Nếu socket vẫn đang CONNECTING/OPEN và url không đổi:
   *    - không tạo socket mới (tránh “phình” kết nối)
   *    - chỉ update callbacks để component mới nhận đúng dữ liệu
   *    - nếu có onStatusChange mới => gọi ngay status hiện tại để UI sync
   */
  public connect(
    url: string,
    onMessage: (data: any) => void,
    onStatusChange?: (status: 'connecting' | 'connected' | 'disconnected') => void,
    onOpen?: () => void
  ): WebSocket | null {

    // Nếu URL đổi hoặc socket đã chết hẳn -> Connect mới
    if (this.url !== url || !this.socket || this.socket.readyState === WebSocket.CLOSED) {
      console.log('[MonitoringService] Connecting new socket (URL changed or socket closed)');
      this.disconnect();
      this.url = url;
      this.onMessageCallback = onMessage;
      this.onStatusChangeCallback = onStatusChange || null;
      this.onOpenCallback = onOpen || null;

      // reset state reconnect
      this.isIntentionalClose = false;
      this.reconnectAttempts = 0;

      this.initSocket();
    }
    // Nếu đang connect hoặc connected rồi -> Chỉ update callback
    else {
      this.onMessageCallback = onMessage;

      // Nếu có status callback mới, gọi ngay để sync UI (khỏi chờ event)
      if (onStatusChange) {
        this.onStatusChangeCallback = onStatusChange;
        const status = this.socket.readyState === WebSocket.OPEN ? 'connected' : 'connecting';
        onStatusChange(status);
      }

      // Update onOpen nếu caller muốn thay đổi logic onOpen (SyncState mới...)
      if (onOpen) this.onOpenCallback = onOpen;
    }

    return this.socket;
  }

  /**
   * =========================
   * initSocket()
   * =========================
   * Tạo WebSocket và gắn handlers:
   * - onopen: reset reconnectAttempts, báo connected, gọi onOpenCallback
   * - onmessage: parse JSON, fallback raw string
   * - onclose: báo disconnected, nếu không intentional => schedule reconnect
   * - onerror: log lỗi (thường dẫn tới onclose)
   */
  private initSocket() {
    // Không có URL => không thể connect
    if (!this.url) return;

    // Chống tạo trùng: nếu đang connecting thì không tạo thêm
    if (this.isConnecting) {
      console.log('[MonitoringService] Already connecting, skip duplicate initSocket');
      return;
    }
    this.isConnecting = true;

    // Clear timeout cũ (tránh chạy reconnect “kép”)
    if (this.reconnectTimeoutId) clearTimeout(this.reconnectTimeoutId);

    console.log('🔌 [MonitoringService] Connecting...');

    // Báo UI: connecting
    if (this.onStatusChangeCallback) this.onStatusChangeCallback('connecting');

    // Tạo WebSocket instance (có thể throw nếu URL invalid)
    try {
      this.socket = new WebSocket(this.url);
    } catch (err) {
      console.error('Failed to create WebSocket:', err);
      this.scheduleReconnect();
      return;
    }

    // Khi kết nối thành công
    this.socket.onopen = () => {
      console.log('✅ [MonitoringService] Connected');

      // Reset flags
      this.isConnecting = false;
      this.reconnectAttempts = 0;

      // Báo UI: connected
      if (this.onStatusChangeCallback) this.onStatusChangeCallback('connected');

      // Hook nghiệp vụ sau connect (SyncState, join room...)
      if (this.onOpenCallback) this.onOpenCallback();
    };

    // Nhận message từ server
    this.socket.onmessage = (event) => {
      if (!this.onMessageCallback) return;

      try {
        // Ưu tiên parse JSON
        const data = JSON.parse(event.data);
        this.onMessageCallback(data);
      } catch {
        // Fallback: server có thể gửi plain text / number (timer)
        this.onMessageCallback(event.data);
      }
    };

    // Khi socket bị đóng
    this.socket.onclose = (event) => {
      console.log('❌ [MonitoringService] Disconnected', event.code, event.reason);

      // Reset connecting flag
      this.isConnecting = false;

      // Báo UI: disconnected
      if (this.onStatusChangeCallback) this.onStatusChangeCallback('disconnected');

      // Nếu không phải client chủ động đóng => schedule reconnect
      if (!this.isIntentionalClose) {
        this.scheduleReconnect();
      }
    };

    // Khi có lỗi
    this.socket.onerror = (error) => {
      console.error('⚠️ [MonitoringService] Error:', error);
      // Thường sau error sẽ có onclose => reconnect xử lý ở onclose
    };
  }

  /**
   * =========================
   * scheduleReconnect()
   * =========================
   * Lập lịch reconnect với exponential backoff:
   * - Lần 1: 1s
   * - Lần 2: 2s
   * - Lần 3: 4s
   * ...
   * - Giới hạn tối đa: 10s
   *
   * Mục tiêu:
   * - Tránh spam reconnect quá nhanh khi server đang down.
   * - Vẫn đảm bảo “tự hồi phục” khi mạng/BE trở lại.
   */
  private scheduleReconnect() {
    // Chạm ngưỡng tối đa => dừng reconnect
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('⛔ [MonitoringService] Max reconnect attempts reached.');
      return;
    }

    this.reconnectAttempts++;

    // Exponential backoff: 1s, 2s, 4s, 8s... max 10s
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 10000);

    console.log(`🔄 [MonitoringService] Reconnecting in ${delay}ms... (Attempt ${this.reconnectAttempts})`);

    // Sau delay => thử initSocket lại
    this.reconnectTimeoutId = setTimeout(() => {
      this.initSocket();
    }, delay);
  }

  /**
   * =========================
   * suppressReconnect()
   * =========================
   * Dùng khi client biết sẽ đóng socket (ví dụ: submit bài),
   * để tránh auto-reconnect sau khi server chủ động đóng.
   */
  public suppressReconnect(reason?: string) {
    if (reason) {
      console.log(`[MonitoringService] Suppress reconnect: ${reason}`);
    }
    this.isIntentionalClose = true;
    if (this.reconnectTimeoutId) {
      clearTimeout(this.reconnectTimeoutId);
      this.reconnectTimeoutId = null;
    }
  }

  /**
   * =========================
   * disconnect()
   * =========================
   * Ngắt kết nối chủ động từ client.
   *
   * Hành vi:
   * - Set isIntentionalClose=true để onclose không reconnect.
   * - Clear timeout reconnect nếu đang pending.
   * - Gỡ handlers để tránh memory leak / callback chạy nhầm khi component unmount.
   * - Close socket nếu đang OPEN/CONNECTING.
   * - Set socket=null để trạng thái “đã hủy”.
   */
  public disconnect() {
    console.log('[MonitoringService] Disconnect called');
    this.isIntentionalClose = true;
    this.isConnecting = false; // Reset để cho phép connect lại
    if (this.reconnectTimeoutId) clearTimeout(this.reconnectTimeoutId);

    if (this.socket) {
      // Gỡ listeners để tránh memory leak hoặc side effect
      this.socket.onopen = null;
      this.socket.onmessage = null;
      this.socket.onclose = null;
      this.socket.onerror = null;

      // Chỉ close nếu socket còn sống (OPEN/CONNECTING)
      if (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING) {
        this.socket.close();
      }

      this.socket = null;
    }
  }

  /**
   * =========================
   * send()
   * =========================
   * Gửi dữ liệu lên server qua WS.
   *
   * Quy ước payload:
   * - Nếu data là string => gửi thẳng
   * - Nếu là object => JSON.stringify
   *
   * Guard:
   * - Chỉ gửi khi socket OPEN.
   */
  public send(data: any) {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const payload = typeof data === 'string' ? data : JSON.stringify(data);
      this.socket.send(payload);
    } else {
      console.warn('⚠️ [MonitoringService] Cannot send: Socket not open');
    }
  }
}

// Export singleton instance
/**
 * monitoringService:
 * - Singleton instance để toàn app dùng chung 1 service.
 * - Import ở nơi cần: import { monitoringService } from '...'
 */
export const monitoringService = new MonitoringService();
