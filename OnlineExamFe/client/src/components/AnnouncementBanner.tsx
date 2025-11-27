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

  const handleClose = (id: number) => {
    setVisible((prev) => prev.filter((a) => a.id !== id));
  };

  if (visible.length === 0) {
    return null; // Render nothing if there are no announcements
  }

  return (
    <div className="space-y-3">
      {visible.map((ann) => (
        <div
          key={ann.id}
          className={
            'glass-card flex items-start gap-3 p-4 border ' + typeToClass(ann.type)
          }
        >
          <div className="h-10 w-10 flex items-center justify-center rounded-full bg-white/10 text-lg font-bold text-white">
            !
          </div>
          <div className="flex-1">
            <p className="text-sm leading-relaxed">{ann.message}</p>
          </div>
          <button
            type="button"
            onClick={() => handleClose(ann.id)}
            className="btn btn-ghost px-3 py-2 text-sm hover:-translate-y-0.5"
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
