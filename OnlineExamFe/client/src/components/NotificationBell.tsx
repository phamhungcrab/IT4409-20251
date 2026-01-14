/**
 * NotificationBell: Icon chuông thông báo ở header.
 * - Hiển thị badge với số thông báo chưa đọc.
 * - Click mở dropdown danh sách thông báo.
 * - Click vào thông báo → đánh dấu đã đọc.
 */

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AnnouncementDto } from '../services/announcementService';
import { formatRelativeTime } from '../utils/dateUtils';

export interface NotificationBellProps {
  announcements: AnnouncementDto[];
  unreadCount: number;
  onMarkAsRead: (id: number) => void;
}

const NotificationBell: React.FC<NotificationBellProps> = ({
  announcements,
  unreadCount,
  onMarkAsRead,
}) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const typeToColor = (type: string) => {
    switch (type) {
      case 'success': return 'text-emerald-400';
      case 'warning': return 'text-amber-400';
      case 'error': return 'text-rose-400';
      default: return 'text-sky-400';
    }
  };

  const handleNotificationClick = (id: number) => {
    onMarkAsRead(id);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-colors text-gray-300 hover:text-white"
        title={t('notifications.title') || 'Thông báo'}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
          />
        </svg>

        {/* Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-rose-500 rounded-full shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-80 max-h-96 overflow-y-auto rounded-xl border border-white/10 bg-slate-900/95 backdrop-blur-md shadow-2xl z-50">
          {/* Header */}
          <div className="sticky top-0 px-4 py-3 border-b border-white/10 bg-slate-900/95">
            <h3 className="text-sm font-semibold text-white">
              {t('notifications.title') || 'Thông báo'}
              {unreadCount > 0 && (
                <span className="ml-2 text-xs text-slate-400">
                  ({unreadCount} {t('notifications.unread') || 'chưa đọc'})
                </span>
              )}
            </h3>
          </div>

          {/* List */}
          {announcements.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-slate-400">
              {t('notifications.empty') || 'Không có thông báo'}
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {announcements.map((ann) => (
                <button
                  key={ann.id}
                  onClick={() => handleNotificationClick(ann.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-white/5 transition-colors ${
                    ann.isRead ? 'opacity-60' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Type indicator */}
                    <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${
                      ann.type === 'success' ? 'bg-emerald-400' :
                      ann.type === 'warning' ? 'bg-amber-400' :
                      ann.type === 'error' ? 'bg-rose-400' : 'bg-sky-400'
                    }`} />

                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate ${
                        ann.isRead ? 'text-slate-400' : 'text-white'
                      }`}>
                        {ann.title}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">
                        {ann.content}
                      </p>
                      <p className="text-[10px] text-slate-500 mt-1">
                        {ann.className && `${ann.className} • `}
                        {formatRelativeTime(ann.createdAt)}
                      </p>
                    </div>

                    {/* Unread dot */}
                    {!ann.isRead && (
                      <div className="w-2 h-2 rounded-full bg-sky-400 flex-shrink-0 mt-2" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
