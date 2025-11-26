import { useState, useEffect } from 'react';
import apiClient from '../utils/apiClient';
import { Announcement } from '../components/AnnouncementBanner';

export const useAnnouncements = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        // apiClient interceptor returns the data directly
        const response = await apiClient.get<any[]>('/api/Announcements') as unknown as any[];

        // Map backend response to frontend Announcement interface
        // Backend returns: { id, title, content, type, date }
        const mapped: Announcement[] = response.map((item: any) => ({
          id: item.id,
          message: `${item.title}: ${item.content}`,
          type: item.type || 'info'
        }));

        setAnnouncements(mapped);
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch announcements', err);
        setError('Failed to load announcements');
        setLoading(false);
      }
    };

    fetchAnnouncements();
  }, []);

  return { announcements, loading, error };
};