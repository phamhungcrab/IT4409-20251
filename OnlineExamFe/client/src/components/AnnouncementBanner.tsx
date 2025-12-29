/**
 * AnnouncementBanner:
 * - Hiển thị danh sách thông báo dưới dạng Toast Notification.
 * - Có thanh Progress Bar tự động chạy.
 * - Tự động biến mất khi Progress Bar chạy hết.
 */

import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Kiểu dữ liệu cho 1 thông báo.
 */
export interface Announcement {
  id: number;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number; // Thời gian hiển thị (ms), mặc định 5000
}

/**
 * Props của AnnouncementBanner.
 */
export interface AnnouncementBannerProps {
  announcements: Announcement[];
}

/**
 * ToastItem: Component con quản lý logic của TỪNG thông báo riêng biệt.
 * - isActive: Nếu true thì mới chạy timer.
 */
const ToastItem: React.FC<{
  announcement: Announcement;
  onClose: (id: number) => void;
  isActive: boolean;
}> = ({ announcement, onClose, isActive }) => {
  const { t } = useTranslation();
  const DURATION = announcement.duration || 5000;
  const [progress, setProgress] = useState(100);

  // ... (typeToClass và typeToProgressClass giữ nguyên, không cần paste lại để tiết kiệm)
  const typeToClass = (type: Announcement['type']) => {
    switch (type) {
      case 'success': return 'bg-emerald-500/10 text-emerald-100 border-emerald-400/30';
      case 'warning': return 'bg-amber-500/10 text-amber-100 border-amber-400/30';
      case 'error':   return 'bg-rose-500/10 text-rose-100 border-rose-400/30';
      case 'info':
      default:        return 'bg-sky-500/10 text-sky-100 border-sky-400/30';
    }
  };

  const typeToProgressClass = (type: Announcement['type']) => {
    switch (type) {
      case 'success': return 'bg-emerald-400';
      case 'warning': return 'bg-amber-400';
      case 'error':   return 'bg-rose-400';
      case 'info':
      default:        return 'bg-sky-400';
    }
  };

  /**
   * Effect chạy thanh Progress Bar và Timer.
   * - Chỉ chạy khi isActive = true.
   */
  useEffect(() => {
    if (!isActive) return; // Nếu chưa đến lượt thì không chạy timer

    const INTERVAL = 50;
    const step = 100 / (DURATION / INTERVAL);

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          onClose(announcement.id);
          return 0;
        }
        return prev - step;
      });
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [announcement.id, DURATION, onClose, isActive]);

  return (
    <div
      className={
        'glass-card relative overflow-hidden flex items-start gap-3 p-4 border mb-3 last:mb-0 transition-all duration-300 animate-slide-in ' +
        typeToClass(announcement.type) +
        (isActive ? ' opacity-100 translate-x-0' : ' opacity-60 translate-x-2') // Làm mờ các item chưa active để tạo hiệu ứng thị giác
      }
    >
      {/* Icon */}
      <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white">
        !
      </div>

      {/* Nội dung */}
      <div className="flex-1">
        <p className="text-sm leading-relaxed">{announcement.message}</p>
      </div>

      {/* Nút đóng */}
      <button
        type="button"
        onClick={() => onClose(announcement.id)}
        className="btn btn-ghost px-3 py-2 text-sm hover:-translate-y-0.5"
        aria-label={t('common.close')}
      >
        ×
      </button>

      {/* Thanh Progress Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-white/10">
        <div
          className={`h-full transition-all duration-75 ease-linear ${typeToProgressClass(announcement.type)}`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

/**
 * AnnouncementBanner:
 * - Quản lý danh sách chung.
 * - Render từng ToastItem theo cơ chế Queue (chỉ item đầu tiên active).
 */
const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcements }) => {
  const [visible, setVisible] = useState<Announcement[]>([]);

  useEffect(() => {
    setVisible(announcements);
  }, [announcements]);

  const handleClose = (id: number) => {
    setVisible((prev) => prev.filter((a) => a.id !== id));
  };

  if (visible.length === 0) return null;

  return (
    <div className="flex flex-col gap-3">
      {visible.map((ann, index) => (
        <ToastItem
          key={ann.id}
          announcement={ann}
          onClose={handleClose}
          isActive={index === 0} // Chỉ item đầu tiên (index 0) được active
        />
      ))}
    </div>
  );
};

export default AnnouncementBanner;
