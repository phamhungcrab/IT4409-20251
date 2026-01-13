import { useState, useEffect, useCallback } from 'react';
import { announcementService, AnnouncementDto } from '../services/announcementService';
import { Announcement } from '../components/AnnouncementBanner';

/**
 * useAnnouncements: custom hook để lấy và quản lý thông báo.
 *
 * Trả về:
 * - announcements: thông báo chưa dismiss (để hiện banner)
 * - allAnnouncements: tất cả thông báo (để hiện trong chuông)
 * - unreadCount: số thông báo chưa đọc
 * - loading, error
 * - dismiss: đánh dấu banner đã hiện
 * - markAsRead: đánh dấu đã đọc (click trong chuông)
 * - refresh: tải lại danh sách
 */
export const useAnnouncements = (user?: any) => {
  const [allAnnouncements, setAllAnnouncements] = useState<AnnouncementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Lấy danh sách thông báo từ API.
   */
  const fetchAnnouncements = useCallback(async () => {
    if (user === null) {
      setAllAnnouncements([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const data = await announcementService.getForStudent();
      setAllAnnouncements(data);
      setError(null);
    } catch (err) {
      console.error('Không tải được announcements', err);
      setError('Không thể tải thông báo');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  /**
   * Đánh dấu banner đã hiển thị (không hiện lại nữa).
   */
  const dismiss = useCallback(async (id: number) => {
    try {
      await announcementService.dismiss(id);
      setAllAnnouncements(prev =>
        prev.map(a => a.id === id ? { ...a, isDismissed: true } : a)
      );
    } catch (err) {
      console.error('Không dismiss được announcement', err);
    }
  }, []);

  /**
   * Đánh dấu đã đọc (click trong chuông).
   */
  const markAsRead = useCallback(async (id: number) => {
    try {
      await announcementService.markAsRead(id);
      setAllAnnouncements(prev =>
        prev.map(a => a.id === id ? { ...a, isRead: true } : a)
      );
    } catch (err) {
      console.error('Không mark-read được announcement', err);
    }
  }, []);

  /**
   * Thông báo chưa dismiss (để hiện banner).
   * Map từ AnnouncementDto → Announcement interface của banner.
   */
  const announcements: Announcement[] = allAnnouncements
    .filter(a => !a.isDismissed)
    .map(a => ({
      id: a.id,
      message: a.title + (a.content ? `: ${a.content}` : ''),
      type: a.type,
    }));

  /**
   * Số thông báo chưa đọc (cho badge chuông).
   */
  const unreadCount = allAnnouncements.filter(a => !a.isRead).length;

  return {
    announcements,       // Cho AnnouncementBanner (chưa dismiss)
    allAnnouncements,    // Cho NotificationBell (tất cả)
    unreadCount,         // Cho badge chuông
    loading,
    error,
    dismiss,             // Gọi khi banner biến mất
    markAsRead,          // Gọi khi click trong chuông
    refresh: fetchAnnouncements,
  };
};
