/**
 * monitoringService:
 * Module (một “khối” code) chuyên tạo kết nối WebSocket cho hệ thống giám sát/thi cử.
 *
 * Mục tiêu:
 * - Tách logic tạo WebSocket ra khỏi component/hook để code sạch hơn.
 * - Mọi nơi cần WS chỉ việc gọi monitoringService.connect(url, onMessage).
 */
export const monitoringService = {
    /**
     * connect:
     * - Tạo kết nối WebSocket tới server.
     * - Nhận callback onMessage để “đẩy dữ liệu” ra ngoài cho hook/component xử lý.
     *
     * @param url     Đường dẫn WebSocket (vd: ws://localhost:5000/ws?examId=1...)
     * @param onMessage Hàm callback: được gọi mỗi khi server gửi message lên
     * @returns WebSocket instance để bên ngoài còn gửi dữ liệu (ws.send) hoặc đóng (ws.close)
     */
    connect: (url: string, onMessage: (data: any) => void): WebSocket => {
        /**
         * new WebSocket(url):
         * - Khởi tạo kết nối WebSocket tới server.
         * - Trình duyệt sẽ tự “handshake” (bắt tay) với server.
         * - Nếu thành công, event onopen sẽ chạy.
         */
        const ws = new WebSocket(url);

        /**
         * ws.onopen:
         * - Sự kiện chạy khi kết nối WebSocket được mở thành công.
         * - Tức là từ thời điểm này, ws.readyState thường là OPEN, bạn có thể ws.send(...)
         */
        ws.onopen = () => {
            console.log('Đã kết nối WebSocket monitoring');
        };

        /**
         * ws.onmessage:
         * - Sự kiện chạy mỗi khi server gửi một message xuống client.
         * - event.data thường là string (chuỗi).
         * - Trong dự án bạn đang dùng JSON, nên parse bằng JSON.parse.
         */
        ws.onmessage = (event) => {
            try {
                /**
                 * JSON.parse(event.data):
                 * - Chuyển chuỗi JSON thành object/array trong JS.
                 *
                 * Ví dụ server gửi:
                 *   '{"status":"submitted","score":8.5}'
                 * => parse ra object { status: "submitted", score: 8.5 }
                 *
                 * Nếu server gửi không phải JSON hợp lệ, JSON.parse sẽ throw error.
                 */
                const data = JSON.parse(event.data);

                /**
                 * onMessage(data):
                 * - Gọi callback do nơi khác truyền vào (thường là hook useExam).
                 * - Tức là monitoringService chỉ “nhận message” và “đẩy message đi”.
                 * - Logic phân loại message (submitted/sync/error) nằm ở useExam.
                 */
                onMessage(data);
            } catch (error) {
                /**
                 * Nếu parse lỗi:
                 * - Có thể server gửi text thuần (không phải JSON)
                 * - Hoặc server gửi JSON nhưng bị cắt/encode sai
                 */
                console.error('Không parse được message WebSocket (không phải JSON hợp lệ)', error);

                /**
                 * Gợi ý thực tế:
                 * Nếu bạn muốn vẫn xử lý được message dạng text, có thể fallback:
                 *   onMessage(event.data)
                 * Nhưng làm vậy thì phía useExam phải xử lý 2 kiểu dữ liệu (string/object).
                 */
            }
        };

        /**
         * ws.onclose:
         * - Sự kiện chạy khi kết nối bị đóng.
         * - Có thể do:
         *   + server chủ động đóng
         *   + client gọi ws.close()
         *   + mất mạng
         *   + proxy/nginx/iis ngắt kết nối
         *
         * Lưu ý:
         * - monitoringService chỉ log.
         * - Cơ chế reconnect đang nằm ở hook useExam (đúng hướng).
         */
        ws.onclose = () => {
            console.log('WebSocket monitoring đã ngắt kết nối');
        };

        /**
         * ws.onerror:
         * - Sự kiện lỗi ở tầng WebSocket.
         * - Thường gặp khi:
         *   + URL sai
         *   + Server không hỗ trợ WS ở endpoint đó
         *   + SSL/WSS bị lỗi chứng chỉ
         *   + Proxy thiếu header Upgrade/Connection
         */
        ws.onerror = (error) => {
            console.error('Lỗi WebSocket', error);
        };

        // Trả về instance để bên ngoài dùng tiếp (send/close/readyState)
        return ws;
    },
};