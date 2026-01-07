/**
 * AnnouncementBanner:
 * - Component hiển thị danh sách thông báo ở đầu trang.
 * - Mỗi thông báo có thể được người dùng đóng (ẩn) ngay trên giao diện.
 * - Phù hợp cho thông báo lịch thi, bảo trì hệ thống, cảnh báo quan trọng,...
 */

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Kiểu dữ liệu cho 1 thông báo.
 * - id: mã duy nhất (React dùng làm key khi render danh sách)
 * - message: nội dung thông báo hiển thị
 * - type: loại thông báo (tùy chọn) để đổi màu theo mức độ
 */
export interface Announcement {
    id: number;
    message: string;
    type?: 'info' | 'success' | 'warning' | 'error';
}

/**
 * Props của AnnouncementBanner:
 * - announcements: danh sách thông báo do component cha truyền xuống
 */
export interface AnnouncementBannerProps {
    announcements: Announcement[];
}

/**
 * AnnouncementBanner:
 * - Nhận props announcements từ cha.
 * - Tạo state visible để quản lý “những thông báo đang hiện”.
 * - Khi người dùng đóng một thông báo, ta chỉ cập nhật state visible
 *   (không sửa trực tiếp props, vì props là dữ liệu “đọc” từ cha).
 */
const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcements }) => {
    /**
     * useTranslation:
     * - Hook của i18next.
     * - t('key') sẽ trả ra text theo ngôn ngữ hiện tại.
     * - Ở đây dùng cho aria-label của nút đóng (phục vụ accessibility).
     */
    const { t } = useTranslation();

    /**
     * State visible:
     * - Lưu danh sách thông báo đang hiển thị.
     * - Khởi tạo bằng announcements từ props.
     *
     * Lưu ý quan trọng:
     * - Việc khởi tạo state từ props chỉ chạy ở lần render đầu tiên (lúc component mount).
     * - Sau này props announcements có đổi, state visible không tự đổi theo (trừ khi bạn tự xử lý).
     * - Điều này “có chủ đích” trong nhiều trường hợp: vì ta muốn người dùng đóng rồi thì nó vẫn ẩn.
     */
    const [visible, setVisible] = useState<Announcement[]>(announcements);

    /**
     * typeToClass:
     * - Chuyển type (info/success/warning/error) thành chuỗi class Tailwind tương ứng.
     * - Nếu type không có (undefined), mặc định coi như 'info'.
     *
     * Giải thích cú pháp Announcement['type']:
     * - Đây là cách TypeScript “lấy kiểu” của thuộc tính type trong interface Announcement.
     * - Nghĩa là tham số type chỉ được nhận các giá trị:
     *   'info' | 'success' | 'warning' | 'error' | undefined
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
     * - Được gọi khi người dùng bấm nút "×".
     * - Dùng filter để tạo mảng mới loại bỏ thông báo có id tương ứng.
     *
     * Giải thích setVisible((prev) => ...):
     * - Đây là “cách cập nhật theo trạng thái trước đó” (functional update).
     * - An toàn khi nhiều lần setState xảy ra gần nhau (tránh lấy nhầm state cũ).
     */
    const handleClose = (id: number) => {
        setVisible((prev) => prev.filter((a) => a.id !== id));
    };

    /**
     * Nếu không còn thông báo nào:
     * - return null nghĩa là không render gì (component tự biến mất).
     * - Đây là pattern rất phổ biến trong React.
     */
    if (visible.length === 0) return null;

    return (
        <div className="space-y-3">
            {visible.map((ann) => (
                <div
                    /**
                     * key:
                     * - React cần key để nhận diện từng phần tử trong danh sách.
                     * - key nên là giá trị ổn định, không trùng (id là tốt nhất).
                     */
                    key={ann.id}
                    className={'glass-card flex items-start gap-3 p-4 border ' + typeToClass(ann.type)}
                >
                    {/* Biểu tượng để nhấn mạnh đây là thông báo */}
                    <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white">
                        !
                    </div>

                    {/* Nội dung thông báo */}
                    <div className="flex-1">
                        <p className="text-sm leading-relaxed">{ann.message}</p>
                    </div>

                    {/* Nút đóng thông báo */}
                    <button
                        type="button"
                        onClick={() => handleClose(ann.id)}
                        className="btn btn-ghost px-3 py-2 text-sm hover:-translate-y-0.5"
                        /**
                         * aria-label:
                         * - Nhãn mô tả cho người dùng dùng trình đọc màn hình (screen reader).
                         * - Ví dụ: "Đóng", "Close", tùy ngôn ngữ.
                         */
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