import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { Announcement } from '../components/AnnouncementBanner';

/**
 * useAnnouncements: custom hook để lấy danh sách thông báo (announcements) cho giao diện.
 *
 * Mục tiêu:
 * - Trả về 3 thứ cho component dùng:
 *   1) announcements: danh sách thông báo để render
 *   2) loading: trạng thái đang tải
 *   3) error: lỗi nếu có
 *
 * Vì sao dùng "custom hook"?
 * - Để gom toàn bộ logic fetch + state management vào 1 chỗ.
 * - Nhiều trang (HomePage, AdminPage, Layout...) có thể tái sử dụng.
 */
export const useAnnouncements = (user?: any) => {
  /**
   * announcements: danh sách thông báo hiển thị trên UI
   * - Kiểu Announcement lấy từ component AnnouncementBanner để đảm bảo đúng format
   */
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  /**
   * loading: để UI biết đang tải dữ liệu hay không
   * - Ví dụ: nếu loading=true thì hiển thị "Loading..."
   */
  const [loading, setLoading] = useState(true);

  /**
   * error: nếu có lỗi khi tải thì set message vào đây
   * - UI có thể show cảnh báo/khung lỗi
   */
  const [error, setError] = useState<string | null>(null);

  /**
   * useEffect: chạy khi component sử dụng hook này được render lần đầu
   * và chạy lại mỗi khi "user" thay đổi.
   *
   * Khái niệm "dependency array" [user]:
   * - Nếu user đổi (đăng nhập / đăng xuất / đổi tài khoản) thì ta cần tải lại thông báo.
   */
  useEffect(() => {
    /**
     * Phân biệt user === null và user === undefined:
     *
     * - user === null:
     *   Nghĩa là chắc chắn đang logout/chưa đăng nhập (bạn chủ động truyền null).
     *   => Xóa announcements, tắt loading và kết thúc luôn.
     *
     * - user === undefined:
     *   Nghĩa là nơi gọi hook không truyền tham số (ví dụ AdminPage gọi useAnnouncements()).
     *   => Vẫn fetch bình thường (lấy thông báo chung).
     */
    if (user === null) {
      setAnnouncements([]);
      setLoading(false);
      return;
    }

    /**
     * Hàm fetchAnnouncements để lấy thông báo.
     *
     * Vì sao viết trong useEffect?
     * - Vì useEffect callback không nên trực tiếp là async function.
     * - Ta tạo 1 hàm async bên trong rồi gọi nó.
     */
    const fetchAnnouncements = async () => {
      try {
        /**
         * Hiện tại đang dùng MOCK DATA (dữ liệu giả lập).
         *
         * Lý do:
         * - Tránh gọi API thật bị 401 (Unauthorized) khi backend chưa có endpoint/hoặc chưa cấu hình token.
         * - Giúp UI vẫn có thông báo để demo.
         *
         * Khi backend sẵn sàng:
         * - Bỏ mock và bật phần gọi apiClient.get(...)
         */
        const mapped: Announcement[] = [
          { id: 1, message: '🎉 Chúc mừng! Bạn đã code xong tính năng bug... à nhầm, feature mới!', type: 'success' },
          { id: 2, message: '⚠️ Cảnh báo: Server sắp đi ngủ trưa, vui lòng lưu bài gấp!', type: 'warning' },
          { id: 3, message: '❌ Lỗi người dùng: Bạn quá đẹp trai để hệ thống có thể xử lý!', type: 'error' },
          { id: 4, message: '💡 Mẹo nhỏ: Uống nước và vươn vai để tránh biến thành con tôm.', type: 'info' },
        ];

        /**
         * GỌI API THẬT (đang comment lại để bạn bật sau):
         *
         * Khái niệm "apiClient interceptor":
         * - Trong apiClient.ts bạn đã viết interceptor để "gỡ wrapper" ResultApiModel
         * - Nghĩa là gọi apiClient.get(...) có thể trả về data luôn, không cần response.data
         *
         * Ví dụ bật lại:
         * const response = await apiClient.get<any[]>('/api/Announcements') as unknown as any[];
         */

        /**
         * Map dữ liệu backend về format frontend.
         *
         * Ví dụ backend trả:
         * { id, title, content, type, date }
         *
         * Frontend cần:
         * { id, message, type }
         *
         * Ví dụ:
         * const mapped: Announcement[] = response.map((item: any) => ({
         *   id: item.id,
         *   message: `${item.title}: ${item.content}`,
         *   type: item.type || 'info',
         * }));
         */

        // Cập nhật state thông báo và tắt loading
        setAnnouncements(mapped);
        setLoading(false);
      } catch (err) {
        // Nếu có lỗi khi fetch, lưu lỗi để UI hiển thị
        console.error('Không tải được announcements', err);
        setError('Không thể tải thông báo');
        setLoading(false);
      }
    };

    // Thực thi fetch
    fetchAnnouncements();
  }, [user]);

  /**
   * Trả dữ liệu ra ngoài để component sử dụng.
   * Ví dụ:
   * const { announcements, loading, error } = useAnnouncements(user);
   */
  return { announcements, loading, error };
};
