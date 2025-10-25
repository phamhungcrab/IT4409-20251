/**
 * useAnnouncements hook.
 *
 * Manages real-time and initial announcements for the application.  When
 * mounted, it fetches the current list of announcements from the
 * backend and stores them in local state.  It also exposes a helper
 * function to append a new announcement, which can be used by other
 * components when receiving live updates via websockets or polling.
 * Replace the stubbed fetch call with your actual API endpoint.
 */

import { useEffect, useState } from 'react';
import type { Announcement } from '../components/AnnouncementBanner';

interface UseAnnouncementsReturn {
  announcements: Announcement[];
  addAnnouncement: (announcement: Announcement) => void;
  removeAnnouncement: (id: number) => void;
}

export default function useAnnouncements(): UseAnnouncementsReturn {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    // Fetch initial announcements from the server.  This should call
    // GET /announcements or similar.  Here we use a stubbed list.
    const fetchInitial = async () => {
      // TODO: replace with API call, e.g. const data = await api.get('/announcements');
      const sampleAnnouncements: Announcement[] = [
        { id: 1, message: 'System maintenance scheduled for Friday 10 PM.', type: 'warning' },
        { id: 2, message: 'New questions have been added to the bank.', type: 'info' },
      ];
      setAnnouncements(sampleAnnouncements);
    };
    fetchInitial();
    // Optionally, set up a websocket/SignalR connection here to listen
    // for realtime announcements and call addAnnouncement on receipt.
  }, []);

  /**
   * Add a new announcement to the list.  Useful when receiving
   * realtime notifications.
   */
  const addAnnouncement = (announcement: Announcement) => {
    setAnnouncements((prev) => [...prev, announcement]);
  };

  /**
   * Remove an announcement by id.  This can be invoked by the
   * announcement banner when a user dismisses a message to ensure it is
   * not shown again.
   */
  const removeAnnouncement = (id: number) => {
    setAnnouncements((prev) => prev.filter((a) => a.id !== id));
  };

  return {
    announcements,
    addAnnouncement,
    removeAnnouncement,
  };
}