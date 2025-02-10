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
        // Mock implementation for now as backend might not have this endpoint yet
        // In real app: const response = await apiClient.get<Announcement[]>('/api/Announcements');
        // setAnnouncements(response.data);

        // Simulating fetch delay
        await new Promise(resolve => setTimeout(resolve, 500));

        setAnnouncements([
          { id: 1, message: 'Welcome to the Online Exam System!', type: 'info' },
          { id: 2, message: 'System maintenance scheduled for Sunday.', type: 'warning' }
        ]);
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