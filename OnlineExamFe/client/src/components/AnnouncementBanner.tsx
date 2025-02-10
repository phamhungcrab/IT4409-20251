/**
 * AnnouncementBanner component.
 *
 * This component displays a list of announcements at the top of a page. Each
 * announcement can optionally be dismissed by the user. It accepts an
 * `announcements` prop consisting of objects with an `id`, a `message`, and an
 * optional `type` to control the color (e.g. info, success, warning, error).
 * When the close button is clicked, the announcement is removed from local
 * state. See HomePage.tsx for an example of usage. For a production
 * application, you may hook this up to a real-time announcement feed via
 * SignalR.
 */
// dùng cho thông báo tới học sinh
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Defines the shape of an announcement. `type` is optional and controls
 * the banner color; supported values are 'info', 'success', 'warning' and
 * 'error'. Additional properties (e.g. createdAt) may be added as needed.
 */
export interface Announcement {
  id: number;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
}

export interface AnnouncementBannerProps {
  announcements: Announcement[];
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcements }) => {
  const { t } = useTranslation();
  // Maintain a local copy so that users can dismiss announcements without
  // affecting the prop passed from the parent. In a state management
  // scenario, you might push dismissals back up to the parent or a store.
  const [visible, setVisible] = useState<Announcement[]>(announcements);

  // Map announcement types to Tailwind CSS classes. Feel free to adjust
  // colors or use another styling solution. Unknown types default to info.
  const typeToClass = (type: Announcement['type']) => {
    switch (type) {
      case 'success':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'warning':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-50 text-red-800 border-red-200';
      case 'info':
      default:
        return 'bg-blue-50 text-blue-800 border-blue-200';
    }
  };

  const handleClose = (id: number) => {
    setVisible((prev) => prev.filter((a) => a.id !== id));
  };

  if (visible.length === 0) {
    return null; // Render nothing if there are no announcements
  }

  return (
    <div className="space-y-2">
      {visible.map((ann) => (
        <div
          key={ann.id}
          className={
            'flex items-start justify-between p-3 rounded border ' + typeToClass(ann.type)
          }
        >
          <span className="flex-1 pr-4">
            {ann.message}
          </span>
          <button
            type="button"
            onClick={() => handleClose(ann.id)}
            className="text-lg leading-none focus:outline-none"
            aria-label={t('common.close')}
          >
            &times;
          </button>
        </div>
      ))}
    </div>
  );
};

export default AnnouncementBanner;