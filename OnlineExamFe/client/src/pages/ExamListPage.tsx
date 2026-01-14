import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { examService } from '../services/examService';
import { ExamDto, ExamGenerateResultDto, StudentExamDto } from '../types/exam';
import useAuth from '../hooks/useAuth';
import TeacherExamList from './TeacherExamList';
import { formatLocalDateTime } from '../utils/dateUtils';

/**
 * ExamListPage (Trang danh sách bài thi):
 *
 * Mục tiêu:
 * - Sinh viên vào trang này để xem danh sách bài thi được giao.
 * - Khi bấm “Bắt đầu làm bài”, FE gọi API startExam để:
 *   + Backend trả status: create / in_progress / completed / expired
 *   + Có thể trả wsUrl để kết nối WebSocket (đồng bộ realtime)
 *   + Có thể trả payload đề thi (questions + duration...)
 *
 * Luồng tổng quan:
 * 1) Khi user đã đăng nhập (user != null) -> gọi examService.getStudentExams(user.id)
 * 2) Render danh sách exam
 * 3) Click “Bắt đầu làm bài” -> handleStartExam(examId)
 *    - Gọi examService.startExam({ examId, studentId })
 *    - Sửa wsUrl nếu backend trả sai host (localhost khi deploy)
 *    - Cache exam payload vào localStorage để hỗ trợ resume (in_progress)
 *    - navigate sang /exam/:examId và truyền state { wsUrl, duration, questions }
 */
const ExamListPage: React.FC = () => {
  /**
   * i18next:
   * - t('key') dùng để lấy text đa ngôn ngữ.
   */
  const { t } = useTranslation();

  /**
   * useAuth:
   * - user là thông tin người dùng hiện tại (ở đây thường là Student).
   * - Nếu user = null/undefined nghĩa là chưa đăng nhập hoặc đang load lại session.
   */
  const { user } = useAuth();

  if (user?.role === 'Teacher') {
    return <TeacherExamList />;
  }

  /**
   * useNavigate:
   * - Dùng để chuyển trang bằng code.
   * - Ví dụ: navigate('/results') để đi sang trang kết quả.
   */
  const navigate = useNavigate();

  /**
   * exams:
   * - Danh sách bài thi của sinh viên.
   */
  const [exams, setExams] = useState<StudentExamDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 6 items per page (2 columns x 3 rows)

  const filteredExams = useMemo(() => {
    if (!searchTerm) return exams;
    const lower = searchTerm.toLowerCase();
    return exams.filter((e) => e.examName.toLowerCase().includes(lower));
  }, [exams, searchTerm]);

  // Pagination Logic
  const totalPages = Math.ceil(filteredExams.length / itemsPerPage);
  const paginatedExams = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredExams.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredExams, currentPage, itemsPerPage]);

  // Reset to page 1 when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  /**
   * loading:
   * - Trạng thái đang tải danh sách bài thi (để hiển thị loading UI).
   */
  const [loading, setLoading] = useState(true);

  /**
   * completionNotice:
   * - Bật/tắt modal thông báo “bài thi đã làm xong”.
   * - Dùng khi backend trả status = completed.
   */
  const [completionNotice, setCompletionNotice] = useState(false);

  /**
   * errorPopup:
   * - Hiển thị lỗi đẹp mắt thay vì dùng alert()
   */
  const [errorPopup, setErrorPopup] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  /**
   * useEffect: tải danh sách bài thi khi đã có user.
   *
   * Vì sao dependency là [user]?
   * - Vì lúc app mới mở, user có thể chưa có ngay (đang đọc localStorage / gọi API).
   * - Khi user xuất hiện, useEffect chạy để tải danh sách bài thi.
   */
  useEffect(() => {
    const fetchExams = async () => {
      // Nếu chưa có user thì không gọi API (tránh lỗi user.id undefined)
      if (!user) return;

      try {
        /**
         * Gọi API lấy danh sách bài thi theo studentId.
         * - backend trả về mảng ExamDto[]
         */
        const data = await examService.getStudentExams(user.id);
        console.log('Đã tải danh sách bài thi:', data);

        /**
         * Kiểm tra chắc chắn data là mảng.
         * - Vì đôi khi backend lỗi hoặc trả về object => FE sẽ render sai.
         */
        if (Array.isArray(data)) {
          setExams(data);
        } else {
          console.error('API không trả về mảng:', data);
          setExams([]);
        }
      } catch (error) {
        console.error('Không thể tải danh sách bài thi', error);
      } finally {
        /**
         * finally:
         * - Dù thành công hay lỗi thì cũng tắt loading.
         * - Tránh UI bị “kẹt” loading mãi.
         */
        setLoading(false);
      }
    };

    fetchExams();
  }, [user]);

  /**
   * handleStartExam(examId):
   *
   * Nhiệm vụ khi bấm “Bắt đầu làm bài”:
   * 1) Gọi backend startExam để lấy:
   *    - status (create/in_progress/completed/expired)
   *    - wsUrl (kết nối WebSocket)
   *    - data (payload đề thi: questions, duration...)
   * 2) Sửa wsUrl cho đúng môi trường (localhost/dev vs onrender/production)
   * 3) Cache payload vào localStorage để resume nếu đang làm dở
   * 4) Điều hướng:
   *    - create/in_progress -> vào phòng thi /exam/:examId
   *    - completed         -> hiện thông báo và gợi ý sang results
   *    - expired           -> báo hết hạn
   */
  const handleStartExam = async (examId: number, examName?: string) => {
    if (!user) return;

    try {
      /**
       * Gọi API startExam:
       * - Backend thường trả: { status, wsUrl, data }
       * - data có thể là null tuỳ status và cách backend tối ưu.
       */
      const response = await examService.startExam({
        examId,
        studentId: user.id
      });

      console.log('[ExamListPage] Phản hồi startExam:', response);

      // wsUrl: URL WebSocket để đồng bộ realtime
      let wsUrl = response.wsUrl || '';

      // examPayload: đề thi (questions, duration...) do backend trả về
      let examPayload: ExamGenerateResultDto | null = response.data ?? null;

      /**
       * Sửa wsUrl cho môi trường deploy:
       *
       * Tình huống hay gặp:
       * - Lúc dev backend trả ws://localhost:xxxx
       * - Khi deploy lên Render, domain thật là https://xxx.onrender.com
       * => FE phải đổi wsUrl để trỏ về đúng domain và đúng protocol (ws/wss).
       *
       * apiBase lấy từ biến môi trường VITE_API_BASE_URL (cấu hình ở .env)
       */
      const apiBase = (import.meta as any).env.VITE_API_BASE_URL || '';

      if (wsUrl) {
        /**
         * Trường hợp đặc biệt ở local dev:
         * - Backend trả wss://localhost:7239 nhưng máy dev có thể không trust chứng chỉ HTTPS
         * - Bạn chuyển sang ws://localhost:7238 (HTTP) để tránh lỗi cert
         *
         * Lưu ý:
         * - Đây là “workaround” theo cấu hình dự án của bạn.
         * - Nếu dự án bạn không dùng 7238/7239 thì cần chỉnh lại.
         */
        try {
          const parsed = new URL(wsUrl);
          if (
            (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1') &&
            parsed.protocol === 'wss:'
          ) {
            parsed.protocol = 'ws:';
            // Giữ nguyên port từ backend (không chuyển đổi)
            wsUrl = parsed.toString();
          }
        } catch {
          // Nếu wsUrl không parse được thì bỏ qua, tránh crash
        }

        /**
         * Trường hợp wsUrl trỏ localhost nhưng apiBase lại là domain onrender:
         * - Ta lấy host của apiBase làm host thật.
         * - Giữ lại pathname của wsUrl để kết nối đúng endpoint WS.
         */
        if (wsUrl.includes('localhost') && apiBase.includes('onrender')) {
          try {
            const parsedWs = new URL(wsUrl);
            const parsedApi = new URL(apiBase);

            wsUrl = `wss://${parsedApi.host}${parsedWs.pathname}`;
          } catch (e) {
            console.error('Không sửa được wsUrl theo apiBase', e);
          }
        }
        /**
         * Trường hợp backend trả wsUrl dạng tương đối:
         * - Ví dụ: /ws/exam?token=...
         * - Ta ghép vào apiBase:
         *   https://domain -> wss://domain
         */
        else if (wsUrl.startsWith('/')) {
          wsUrl = apiBase.replace(/^http/, 'ws') + wsUrl;
        }
      }

      /**
       * Cache đề thi (payload) để hỗ trợ resume:
       *
       * Vì sao phải cache?
       * - Nếu đang làm dở (in_progress), backend có thể chỉ trả status + wsUrl,
       *   và không gửi lại toàn bộ questions để tiết kiệm.
       * - FE cần questions để render, nên lưu payload vào localStorage.
       */
      const cacheKey = `exam_${examId}_payload`;

      /**
       * Nếu đang in_progress mà backend không trả data:
       * 1) Thử gọi API current-question để lấy đề từ server
       * 2) Fallback: lấy từ localStorage nếu API fail
       */
      if (!examPayload && response.status === 'in_progress') {
        try {
          console.log('[ExamListPage] Gọi API current-question để khôi phục đề...');
          examPayload = await examService.getCurrentQuestion(examId, user.id);
          // Lưu vào cache để lần sau dùng
          localStorage.setItem(cacheKey, JSON.stringify(examPayload));
        } catch (apiErr) {
          console.warn('[ExamListPage] Không lấy được từ server, thử localStorage...', apiErr);

          // Fallback - lấy từ localStorage
          const cached = localStorage.getItem(cacheKey);
          if (cached) {
            try {
              examPayload = JSON.parse(cached);
            } catch (e) {
              console.warn('Không đọc được payload cache', e);
            }
          }
        }
      } else if (examPayload) {
        /**
         * Nếu backend có trả payload mới (status = create),
         * -> lưu lại để lần sau resume dùng.
         */
        localStorage.setItem(cacheKey, JSON.stringify(examPayload));
      }

      /**
       * Điều hướng theo status backend:
       * - create / in_progress: vào phòng thi
       * - completed: đã làm xong -> báo và gợi ý sang results
       * - expired: bài thi hết hạn
       */
      if (response.status === 'create' || response.status === 'in_progress') {
        // Nếu không có payload thì không thể vào phòng thi (không có câu hỏi để render)
        if (!examPayload) {
          setErrorPopup({ show: true, message: 'Không tải được đề thi. Vui lòng thử lại.' });
          return;
        }

        /**
         * navigate sang ExamRoomPage:
         * - route: /exam/:examId
         * - state: truyền wsUrl, duration, questions
         *
         * Lưu ý quan trọng:
         * - location.state sẽ mất khi refresh (F5)
         * - Vì vậy ExamRoomPage đã có “recovery logic” để tự gọi API lấy lại nếu bị mất state.
         */
        navigate(`/exam/${examId}`, {
          state: {
            wsUrl,
            duration: examPayload.durationMinutes || 60,
            questions: examPayload.questions || [],
            examName: examName || `Bài thi #${examId}`
          }
        });
      } else if (response.status === 'completed') {
        // Đã làm xong -> hiện modal thông báo
        setCompletionNotice(true);
      } else if (response.status === 'expired') {
        setErrorPopup({ show: true, message: 'Bài thi này đã hết hạn, bạn không tham gia được nữa.' });
      } else {
        setErrorPopup({ show: true, message: 'Không thể bắt đầu bài thi. Vui lòng thử lại.' });
      }
    } catch (error) {
      console.error('Lỗi khi bắt đầu bài thi', error);

      /**
       * Đây là cách lấy message lỗi “an toàn”:
       * - Nếu error là instance của Error thì lấy error.message
       * - Nếu không thì dùng message mặc định
       */
      const message = error instanceof Error ? error.message : 'Lỗi khi bắt đầu bài thi';
      setErrorPopup({ show: true, message });
    }
  };

  /**
   * Nếu đang tải danh sách bài thi -> hiển thị loading.
   */
  if (loading) return <div>{t('common.loading')}</div>;

  return (
    <div className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
      {/* Modal thông báo: bài thi đã hoàn thành */}
      {completionNotice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.3em] text-emerald-300/80">
                {t('exam.submitted')}
              </p>
              <h3 className="text-xl font-semibold text-white">
                {t('exam.completedMessage') || 'Bạn đã hoàn thành bài thi này!'}
              </h3>
            </div>

            <div className="flex justify-end gap-3">
              <button
                className="btn btn-ghost px-4 py-2 border border-white/15"
                onClick={() => setCompletionNotice(false)}
              >
                {t('common.close')}
              </button>

              <button
                className="btn btn-primary px-4 py-2"
                onClick={() => {
                  setCompletionNotice(false);
                  navigate('/results');
                }}
              >
                {t('nav.results')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal thông báo lỗi (Error Popup) */}
      {errorPopup.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-white/10 rounded-xl p-6 w-full max-w-md shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-rose-100 dark:bg-rose-500/10 flex items-center justify-center text-rose-500 text-xl font-bold">
                !
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Thông báo
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed">
                  {errorPopup.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg font-medium hover:opacity-90 transition-opacity shadow-sm"
                onClick={() => setErrorPopup({ show: false, message: '' })}
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tiêu đề trang */}
      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-500 dark:text-slate-300">{t('exam.listTitle')}</p>
        <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">Danh sách bài thi</h1>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
         </div>
         <input
            type="text"
            className="block w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-900 border border-gray-300 dark:border-white/10 rounded-lg text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            placeholder="Tìm kiếm bài thi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
         />
      </div>

      {/* Nếu không có bài thi -> hiển thị trạng thái rỗng */}
      {!Array.isArray(filteredExams) || filteredExams.length === 0 ? (
        <div className="p-6 text-slate-500 dark:text-slate-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm">
           {searchTerm ? `Không tìm thấy bài thi nào phù hợp với "${searchTerm}"` : t('exam.noExams')}
        </div>
      ) : (
        // Có bài thi -> render dạng lưới card
        <div className="grid gap-4 md:grid-cols-2">
          {paginatedExams.map((exam) => {
            const now = new Date();
            const start = exam.startTime ? new Date(exam.startTime) : null;
            const end = exam.endTime ? new Date(exam.endTime) : null;

            // Determine detailed status
            let statusLabel = 'Sắp diễn ra';
            let statusColor = 'bg-stone-100 text-stone-600 border-stone-200 dark:bg-white/5 dark:text-stone-300 dark:border-white/10';
            let dotColor = 'bg-stone-400';
            let isExpired = false;
            let isUpcoming = false;
            let isCompleted = exam.status === 'COMPLETED';
            let isOngoing = false;

            if (isCompleted) {
                statusLabel = 'Đã hoàn thành';
                statusColor = 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20';
                dotColor = 'bg-emerald-500';
            } else if (end && now > end) {
                statusLabel = 'Đã kết thúc';
                statusColor = 'bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20';
                dotColor = 'bg-rose-500';
                isExpired = true;
            } else if (start && now < start) {
                statusLabel = 'Chưa bắt đầu';
                 statusColor = 'bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20';
                dotColor = 'bg-amber-500';
                isUpcoming = true;
            } else {
                statusLabel = 'Đang diễn ra';
                statusColor = 'bg-sky-100 text-sky-700 border-sky-200 dark:bg-sky-500/10 dark:text-sky-400 dark:border-sky-500/20';
                dotColor = 'bg-sky-500';
                isOngoing = true;
            }

            return (
              <div key={exam.examId} className={`relative p-5 flex flex-col gap-4 justify-between bg-white dark:bg-white/5 border rounded-xl shadow-sm transition-all ${isExpired || isCompleted ? 'opacity-80 hover:opacity-100 border-gray-200 dark:border-white/5' : 'border-gray-200 dark:border-white/10 hover:shadow-md hover:border-emerald-500/30'}`}>
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2 leading-tight" title={exam.examName}>{exam.examName}</h3>

                    {/* Tag trạng thái */}
                    <span className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusColor}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} aria-hidden />
                      {statusLabel}
                    </span>
                  </div>

                  {/* Thông tin thời lượng và thời gian */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 text-sm text-slate-500 dark:text-slate-400">
                    <div className="col-span-2 flex items-center gap-2">
                       <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                       <span>{t('exam.duration')}: <span className="font-medium text-slate-700 dark:text-slate-200">{exam.durationMinutes} phút</span></span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-xs uppercase tracking-wider text-slate-400">Bắt đầu</span>
                       <span className="font-medium text-slate-700 dark:text-slate-200">{formatLocalDateTime(exam.startTime)}</span>
                    </div>
                    <div className="flex flex-col">
                       <span className="text-xs uppercase tracking-wider text-slate-400">Kết thúc</span>
                        <span className="font-medium text-slate-700 dark:text-slate-200">{formatLocalDateTime(exam.endTime)}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 dark:border-white/5">
                   {/* Logic render Nút bấm */}
                   {isExpired ? (
                       <button disabled className="w-full btn bg-slate-100 text-slate-400 border-slate-200 dark:bg-white/5 dark:text-slate-500 dark:border-white/5 cursor-not-allowed">
                          Đã kết thúc
                       </button>
                   ) : isCompleted ? (
                       <button
                          onClick={() => navigate('/results')}
                          className="w-full btn bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 dark:hover:bg-emerald-500/20"
                        >
                          Xem kết quả
                       </button>
                   ) : isUpcoming ? (
                       <button disabled className="w-full btn bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-500/10 dark:text-amber-500 dark:border-amber-500/20 cursor-not-allowed opacity-80">
                          Chưa đến giờ
                       </button>
                   ) : (
                       <button
                         onClick={() => handleStartExam(exam.examId, exam.examName)}
                         className="w-full btn btn-primary shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 hover:-translate-y-0.5 transition-all"
                       >
                         {t('exam.startExam')}
                       </button>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            ← Trước
          </button>

          <div className="flex items-center gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-10 h-10 rounded-lg font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white dark:bg-slate-800 border border-gray-300 dark:border-white/10 text-slate-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-2 rounded-lg border border-gray-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
          >
            Sau →
          </button>
        </div>
      )}

      {/* Info Text */}
      {filteredExams.length > 0 && (
        <p className="text-center text-sm text-slate-500 dark:text-slate-400">
          Hiển thị {paginatedExams.length} / {filteredExams.length} bài thi
        </p>
      )}
    </div>
  );
};

export default ExamListPage;

/**
 * Giải thích các khái niệm dễ vấp (người mới):
 *
 * 1) Vì sao phải cache examPayload?
 * - Vì khi đang làm dở (in_progress), backend có thể không trả lại toàn bộ questions.
 * - FE cần questions để render phòng thi, nên lưu vào localStorage để “tự cứu” khi resume/refresh.
 *
 * 2) Vì sao phải sửa wsUrl (localhost -> domain deploy)?
 * - Khi deploy, backend chạy sau proxy và domain thật không phải localhost.
 * - Nếu wsUrl vẫn là localhost => FE sẽ kết nối sai => mất realtime sync.
 *
 * 3) location.state là gì và nhược điểm?
 * - location.state là dữ liệu gửi kèm khi navigate sang trang khác.
 * - Nhược điểm: refresh trang sẽ mất state.
 * - Vì vậy phòng thi cần recovery logic hoặc fetch lại theo examId.
 *
 * 4) useEffect phụ thuộc [user] nghĩa là gì?
 * - useEffect sẽ chạy lại mỗi khi user thay đổi.
 * - Điều này hữu ích vì lúc app mới load, user có thể chưa có; khi user có rồi thì mới gọi API.
 */
