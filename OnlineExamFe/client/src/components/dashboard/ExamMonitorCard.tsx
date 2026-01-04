import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ExamMonitorItem } from '../../services/dashboardService';

interface ExamMonitorCardProps {
  upcoming: ExamMonitorItem[];
  live: ExamMonitorItem[];
  isLoading: boolean;
}

const ExamMonitorCard: React.FC<ExamMonitorCardProps> = ({ upcoming, live, isLoading }) => {
  const [activeTab, setActiveTab] = useState<'live' | 'upcoming'>('upcoming');

  // Auto switch to live tab if there are live exams
  useEffect(() => {
    if (live.length > 0) {
      setActiveTab('live');
    }
  }, [live.length]);

  if (isLoading) {
    return (
        <div className="panel p-6 h-full flex items-center justify-center">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
        </div>
    );
  }

  const renderExamList = (exams: ExamMonitorItem[], type: 'live' | 'upcoming') => {
    if (exams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-sm italic">
                {type === 'live' ? 'Không có kỳ thi nào đang diễn ra' : 'Không có kỳ thi nào sắp tới'}
            </div>
        );
    }

    return (
        <div className="space-y-3 mt-3">
            {exams.map((ex) => (
                <div key={ex.id} className="relative p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/10 transition-all group">
                    <div className="flex justify-between items-start mb-2">
                         <div>
                             <p className="text-xs text-slate-400 mb-0.5">{ex.className}</p>
                             <h4 className="font-semibold text-white">{ex.name}</h4>
                         </div>
                         {type === 'live' ? (
                             <span className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold animate-pulse">
                                 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span> LIVE
                             </span>
                         ) : (
                            <span className="px-2 py-1 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-400 text-xs font-bold">
                                {new Date(ex.startTime).toLocaleDateString('vi-VN', {day:'2-digit', month:'2-digit'})}
                            </span>
                         )}
                    </div>

                    <div className="flex items-center justify-between text-sm">
                        <div className="text-slate-300">
                           {type === 'live' ? (
                               <span>Kết thúc: <span className="text-white font-mono">{new Date(ex.endTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span></span>
                           ) : (
                               <span>Bắt đầu: <span className="text-white font-mono">{new Date(ex.startTime).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</span></span>
                           )}
                        </div>
                    </div>

                    {/* CTA Overlay */}
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-xl">
                        <Link
                           to={type === 'live'
                               ? `/teacher/classes/${ex.classId}?tab=status&examId=${ex.id}`
                               : `/teacher/classes/${ex.classId}?tab=exams`
                           }
                           className="btn btn-sm btn-primary shadow-lg shadow-sky-500/20"
                        >
                            Chi tiết
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  return (
    <div className="panel h-full flex flex-col">
       <div className="p-1 mx-4 mt-4 bg-slate-900/50 rounded-lg p-1 flex">
           <button
              onClick={() => setActiveTab('upcoming')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'upcoming'
                  ? 'bg-sky-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
           >
              Sắp tới ({upcoming.length})
           </button>
           <button
              onClick={() => setActiveTab('live')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  activeTab === 'live'
                  ? 'bg-emerald-600 text-white shadow-lg'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
           >
              Đang diễn ra ({live.length})
           </button>
       </div>

       <div className="flex-1 overflow-y-auto px-4 pb-4">
           {activeTab === 'upcoming' ? renderExamList(upcoming, 'upcoming') : renderExamList(live, 'live')}
       </div>
    </div>
  );
};

export default ExamMonitorCard;
