import React from 'react';
import { Link } from 'react-router-dom';
import { ClassSpotlightItem } from '../../services/dashboardService';
import { formatShortDateTime } from '../../utils/dateUtils';

interface ClassSpotlightCardProps {
  classes: ClassSpotlightItem[];
  isLoading: boolean;
}

const ClassSpotlightCard: React.FC<ClassSpotlightCardProps> = ({ classes, isLoading }) => {
  if (isLoading) return null;

  return (
    <div className="panel h-full flex flex-col">
       <div className="p-5 border-b border-white/5">
         <h3 className="font-semibold text-lg text-white flex items-center gap-2">
           <span className="text-amber-400">⭐</span> Lớp nổi bật
         </h3>
       </div>

       <div className="flex-1 p-4 grid gap-3">
          {classes.length === 0 ? (
             <div className="text-center text-slate-400 text-sm py-8">
                Chưa có lớp học nào nổi bật.
             </div>
          ) : (
             classes.map((cls) => (
                <Link
                   key={cls.id}
                   to={`/teacher/classes/${cls.id}`}
                   className="group block p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-purple-500/30 transition-all relative overflow-hidden"
                >
                   {/* Alert Ribbon if exists */}
                   {cls.alert && (
                       <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl text-xs font-bold
                          ${cls.alert.type === 'upcoming' ? 'bg-amber-500 text-black' : 'bg-rose-500 text-white'}`}
                       >
                          {cls.alert.text}
                       </div>
                   )}

                   <div className="mb-3 pr-8">
                      <h4 className="font-bold text-white group-hover:text-purple-400 transition-colors uppercase tracking-wide">
                         {cls.name}
                      </h4>
                      {cls.nextExam && (
                          <div className="text-xs text-sky-400 mt-1 flex items-center gap-1">
                             <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                             Kỳ thi tiếp: {formatShortDateTime(cls.nextExam)}
                          </div>
                      )}
                   </div>

                   <div className="flex items-center gap-4 text-sm text-slate-400">
                      <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                          <span>{cls.studentCount}</span>
                      </div>
                      <div className="flex items-center gap-1.5 bg-black/20 px-2 py-1 rounded-lg">
                          <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>{cls.examCount}</span>
                      </div>
                   </div>

                   {/* Hover Arrow */}
                   <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1">
                      <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                   </div>
                </Link>
             ))
          )}
       </div>
    </div>
  );
};

export default ClassSpotlightCard;
