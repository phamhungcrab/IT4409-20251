import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { Announcement } from '../components/AnnouncementBanner';

export const useAnnouncements = (user?: any) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Nếu user là null (chưa đăng nhập/logout), ta clear announcements.
    // Nếu user là undefined (gọi từ AdminPage không truyền arg), ta vẫn fetch ("lấy chung").
    if (user === null) {
        setAnnouncements([]);
        setLoading(false);
        return;
    }

    const fetchAnnouncements = async () => {
      try {
        // MOCK DATA: Avoid 401 for now
        const mapped: Announcement[] = [
            { id: 1, message: 'Welcome to the Online Exam System!', type: 'info' },
            { id: 2, message: 'System maintenance scheduled for Sunday.', type: 'warning' }
        ];

        // apiClient interceptor returns the data directly
        // const response = await apiClient.get<any[]>('/api/Announcements') as unknown as any[];

        // Map backend response to frontend Announcement interface
        // Backend returns: { id, title, content, type, date }
        // const mapped: Announcement[] = response.map((item: any) => ({
        //   id: item.id,
        //   message: `${item.title}: ${item.content}`,
        //   type: item.type || 'info'
        // }));

        setAnnouncements(mapped);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch announcements', err);
        setError('Failed to load announcements');
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, [user]);

  return { announcements, loading, error };
};