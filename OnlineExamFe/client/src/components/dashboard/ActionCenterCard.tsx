import React from 'react';
import { Link } from 'react-router-dom';
import { ActionItem } from '../../services/dashboardService';

interface ActionCenterCardProps {
  items: ActionItem[];
  isLoading: boolean;
}

const ActionCenterCard: React.FC<ActionCenterCardProps> = ({ items, isLoading }) => {
  if (isLoading) {
    return (
      <div className="panel p-6 h-full flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        <p className="mt-2 text-sm text-slate-400">Đang tải việc cần làm...</p>
      </div>
    );
  }

  const getPriorityConfig = (priority: string) => {
    switch(priority) {
      case 'high': return { emoji: '🔴', color: 'text-rose-400', bg: 'bg-rose-500/10', border: 'border-rose-500/20', label: 'Khẩn cấp' };
      case 'medium': return { emoji: '🟡', color: 'text-amber-400', bg: 'bg-amber-500/10', border: 'border-amber-500/20', label: 'Lưu ý' };
      case 'low': return { emoji: '🔵', color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20', label: 'Thường' };
      default: return { emoji: '⚪', color: 'text-slate-400', bg: 'bg-slate-500/10', border: 'border-slate-500/20', label: '' };
    }
  };

  return (
    <div className="panel h-full flex flex-col relative overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-rose-500/5 to-transparent">
        <h3 className="font-semibold text-lg text-white flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
          </span>
          Việc cần làm
        </h3>
        <span className="text-xs font-medium px-2 py-1 rounded bg-white/5 text-slate-300">
          {items.length} tác vụ
        </span>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {items.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-70">
             <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mb-3">
                <svg className="w-8 h-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                </svg>
             </div>
             <p className="text-white font-medium">Bạn đã hoàn thành mọi việc!</p>
             <p className="text-sm text-slate-400">Không có tác vụ nào cần xử lý ngay.</p>
          </div>
        ) : (
          items.map((item) => {
            const config = getPriorityConfig(item.priority);
            return (
              <div
                key={item.id}
                className={`group relative p-3 rounded-xl border ${config.border} ${config.bg} hover:brightness-110 transition-all cursor-pointer`}
              >
                <Link to={item.ctaLink} className="absolute inset-0 z-10" />

                <div className="flex items-start gap-3">
                  {/* Status Indicator */}
                  <div className="mt-1 shrink-0 text-lg" title={config.label}>
                    {config.emoji}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                        <h4 className="font-medium text-white truncate pr-2">{item.title}</h4>
                        {item.count && (
                             <span className="text-xs font-mono bg-black/20 px-1.5 py-0.5 rounded text-white/70">
                                {item.count}
                             </span>
                        )}
                    </div>
                    <p className="text-sm text-white/60 truncate">{item.subtitle}</p>
                  </div>

                  {/* CTA - visible on hover */}
                  <div className="shrink-0 flex items-center self-center opacity-0 group-hover:opacity-100 transition-opacity -ml-8 group-hover:ml-0">
                     <span className={`text-xs font-bold px-3 py-1.5 rounded-lg border ${config.border} bg-black/20 ${config.color}`}>
                        {item.ctaLabel} →
                     </span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ActionCenterCard;
