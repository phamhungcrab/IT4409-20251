import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ClassDto } from '../../services/classService';

interface DashboardSearchProps {
  classes: ClassDto[];
}

const DashboardSearch: React.FC<DashboardSearchProps> = ({ classes }) => {
  const [activeTab, setActiveTab] = useState<'exams' | 'classes'>('exams');
  const [searchTerm, setSearchTerm] = useState('');

  // Extract all exams from classes with additional context
  const allExams = useMemo(() => {
    return classes.flatMap(cls =>
      (cls.exams || []).map(exam => ({
        ...exam,
        className: cls.name,
        classId: cls.id,
        subjectCode: cls.subject?.subjectCode
      }))
    ).sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [classes]);

  // Filter logic
  const filteredData = useMemo(() => {
    const lowerTerm = searchTerm.toLowerCase();

    if (activeTab === 'classes') {
      return classes.filter(cls =>
        cls.name.toLowerCase().includes(lowerTerm) ||
        cls.subject?.name?.toLowerCase().includes(lowerTerm) ||
        cls.subject?.subjectCode?.toLowerCase().includes(lowerTerm)
      );
    } else {
      return allExams.filter(ex =>
        ex.name.toLowerCase().includes(lowerTerm) ||
        ex.className.toLowerCase().includes(lowerTerm) ||
        ex.subjectCode?.toLowerCase().includes(lowerTerm)
      );
    }
  }, [searchTerm, activeTab, classes, allExams]);

  const getStatusColor = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return 'bg-sky-500/20 text-sky-400 border-sky-500/30';
    if (now >= start && now <= end) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 animate-pulse';
    return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  };

  const getStatusText = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (now < start) return 'Sắp diễn ra';
    if (now >= start && now <= end) return 'Đang diễn ra';
    return 'Đã kết thúc';
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <span className="text-purple-400">🔍</span> Tra cứu nhanh
        </h2>

        {/* Search Input */}
        <div className="relative w-full sm:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-white/10 rounded-lg leading-5 bg-slate-800 text-slate-300 placeholder-slate-500 focus:outline-none focus:bg-slate-900 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 sm:text-sm transition-colors"
            placeholder={`Tìm kiếm ${activeTab === 'exams' ? 'kỳ thi' : 'lớp học'}...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="panel p-0 overflow-hidden bg-slate-900/50">
        {/* Tabs */}
        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('exams')}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === 'exams'
                ? 'bg-purple-600/20 text-purple-300 border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Danh sách Kỳ thi ({allExams.length})
          </button>
          <button
            onClick={() => setActiveTab('classes')}
            className={`flex-1 py-3 text-sm font-medium text-center transition-colors ${
              activeTab === 'classes'
                ? 'bg-purple-600/20 text-purple-300 border-b-2 border-purple-500'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            Danh sách Lớp học ({classes.length})
          </button>
        </div>

        {/* Content List */}
        <div className="max-h-[400px] overflow-y-auto p-4 space-y-2 custom-scrollbar">
          {filteredData.length === 0 ? (
            <div className="text-center py-8 text-slate-500 italic">
              Không tìm thấy kết quả nào phù hợp.
            </div>
          ) : (
            filteredData.map((item: any) => (
              <div key={item.id} className="group flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-lg hover:border-purple-500/30 hover:bg-white/10 transition-all">
                <div className="flex-1 min-w-0 pr-4">
                  {activeTab === 'exams' ? (
                    // Exam Item Layout
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${getStatusColor(item.startTime, item.endTime)}`}>
                           {getStatusText(item.startTime, item.endTime)}
                        </span>
                        <span className="text-xs text-slate-400 truncate">{item.className}</span>
                      </div>
                      <h4 className="text-white font-semibold truncate group-hover:text-purple-400 transition-colors">{item.name}</h4>
                      <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                        <span>🕒 {new Date(item.startTime).toLocaleDateString('vi-VN', {hour:'2-digit', minute:'2-digit'})}</span>
                        <span>⏱️ {item.durationMinutes} phút</span>
                      </p>
                    </div>
                  ) : (
                    // Class Item Layout
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                         <span className="text-xs font-mono bg-slate-700 text-slate-300 px-1.5 py-0.5 rounded">{item.subject?.subjectCode || 'CODE'}</span>
                         <span className="text-xs text-slate-400">{item.subject?.name}</span>
                      </div>
                      <h4 className="text-white font-semibold truncate group-hover:text-purple-400 transition-colors">{item.name}</h4>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                         <span>👥 {item.studentCount || 0} SV</span>
                         <span>📄 {item.exams?.length || 0} Kỳ thi</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                   {activeTab === 'exams' ? (
                         <Link
                           to={getStatusText(item.startTime, item.endTime) === 'Đang diễn ra' ? `/teacher/classes/${item.classId}?tab=status&examId=${item.id}` : `/teacher/classes/${item.classId}?tab=exams`}
                           className="btn btn-xs bg-white/10 hover:bg-white/20 text-white hover:border-white/30"
                         >
                           Chi tiết
                         </Link>
                   ) : (
                      <Link
                        to={`/teacher/classes/${item.id}`}
                        className="btn btn-sm bg-purple-500/20 text-purple-300 border border-purple-500/30 hover:bg-purple-500/30"
                      >
                        Vào lớp →
                      </Link>
                   )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardSearch;
