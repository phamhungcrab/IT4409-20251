/**
 * AnnouncementBanner:
 *  - Component hiển thị danh sách các thông báo ở đầu trang.
 *  - Mỗi thông báo có thể được học sinh/giáo viên tự đóng lại (dismiss).
 *  - Dùng cho các thông báo quan trọng: lịch thi, bảo trì hệ thống, thông báo khẩn,...
 */

 // dùng cho thông báo tới học sinh
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Kiểu dữ liệu cho một thông báo (Announcement):
 *  - id      : mã định danh duy nhất cho từng thông báo (dùng làm key khi render).
 *  - message : nội dung thông báo hiển thị cho người dùng.
 *  - type    : loại thông báo (tùy chọn), quyết định màu sắc:
 *      + 'info'    : thông tin chung
 *      + 'success' : thông báo thành công
 *      + 'warning' : cảnh báo
 *      + 'error'   : lỗi, sự cố
 *
 * Có thể bổ sung thêm các trường khác nếu cần (vd: createdAt, creator, link,...).
 */
export interface Announcement {
  id: number;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

/**
 * Props của component AnnouncementBanner:
 *  - announcements: mảng các thông báo cần hiển thị.
 */
export interface AnnouncementBannerProps {
  announcements: Announcement[];
}

/**
 * Component AnnouncementBanner:
 *  - Nhận props là mảng thông báo.
 *  - Lưu bản sao mảng thông báo vào state local để cho phép người dùng "đóng" từng thông báo
 *    mà KHÔNG ảnh hưởng đến dữ liệu gốc ở component cha.
 */
const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcements }) => {
  // useTranslation: hook của i18next để lấy text đa ngôn ngữ (dùng cho aria-label nút đóng)
  const { t } = useTranslation();

  /**
   * State `visible`:
   *  - Lưu danh sách các thông báo đang hiển thị.
   *  - Khởi tạo bằng giá trị từ props `announcements`.
   *  - Khi người dùng bấm nút "×" để đóng một thông báo,
   *    ta sẽ cập nhật `visible` để loại bỏ thông báo đó.
   *
   * Lưu ý:
   *  - Dùng state riêng thay vì chỉnh sửa trực tiếp props (props là "readonly").
   */
  const [visible, setVisible] = useState<Announcement[]>(announcements);

  /**
   * Hàm map `type` của thông báo sang các class Tailwind CSS tương ứng.
   *  - Mỗi loại (info/success/warning/error) sẽ có màu nền + màu chữ khác nhau.
   *  - Nếu type không xác định, mặc định dùng kiểu 'info'.
   */
  const typeToClass = (type: Announcement['type']) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-500/10 text-emerald-100 border-emerald-400/30';
      case 'warning':
        return 'bg-amber-500/10 text-amber-100 border-amber-400/30';
      case 'error':
        return 'bg-rose-500/10 text-rose-100 border-rose-400/30';
      case 'info':
      default:
        return 'bg-sky-500/10 text-sky-100 border-sky-400/30';
    }
  };

  /**
   * handleClose:
   *  - Được gọi khi người dùng bấm nút "×" trên một thông báo.
   *  - Tham số `id` là id của thông báo muốn đóng.
   *  - Cập nhật state `visible` bằng cách filter bỏ phần tử có id tương ứng.
   */
  const handleClose = (id: number) => {
    setVisible((prev) => prev.filter((a) => a.id !== id));
  };

  /**
   * Nếu không còn thông báo nào trong `visible`:
   *  - Trả về null để React không render gì cả.
   *  - Đây là pattern phổ biến: component tự "ẩn" khi không có dữ liệu.
   */
  if (visible.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      {visible.map((ann) => (
        <div
          key={ann.id} // key giúp React nhận diện từng phần tử trong danh sách
          className={
            'glass-card flex items-start gap-3 p-4 border ' + typeToClass(ann.type)
          }
        >
          {/* Icon tròn chứa dấu "!" để nhấn mạnh rằng đây là thông báo */}
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white">
            !
          </div>

          {/* Phần nội dung thông báo */}
          <div className="flex-1">
            <p className="text-sm leading-relaxed">{ann.message}</p>
          </div>

          {/* Nút đóng (×) để người dùng ẩn thông báo */}
          <button
            type="button"
            onClick={() => handleClose(ann.id)}
            className="btn btn-ghost px-3 py-2 text-sm hover:-translate-y-0.5"
            // aria-label giúp tăng khả năng truy cập (accessibility) cho screen reader
            aria-label={t('common.close')}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementBanner;
