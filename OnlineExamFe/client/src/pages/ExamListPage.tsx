import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { examService } from '../services/examService';
import { ExamDto, ExamGenerateResultDto, StudentExamDto } from '../types/exam';
import useAuth from '../hooks/useAuth';
import TeacherExamList from './TeacherExamList';

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
    <div className="max-w-5xl mx-auto p-6 space-y-6">
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

      {/* Nếu không có bài thi -> hiển thị trạng thái rỗng */}
      {!Array.isArray(exams) || exams.length === 0 ? (
        <div className="p-6 text-slate-500 dark:text-slate-300 bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm">{t('exam.noExams')}</div>
      ) : (
        // Có bài thi -> render dạng lưới card
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <div key={exam.examId} className="p-5 flex flex-col gap-4 justify-between bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{exam.examName}</h3>

                  {/* Tag trạng thái */}
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-white/10 dark:text-slate-200 border border-gray-200 dark:border-white/10">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                    {exam.status}
                  </span>
                </div>

                {/* Thông tin thời lượng và thời gian bắt đầu */}
                <div className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
                  <p>
                    {t('exam.duration')}: {exam.durationMinutes} phút
                  </p>
                  <p>
                    {t('exam.startTime')}: {new Date(exam.startTime).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {/* Nút bắt đầu bài thi */}
                <button
                  onClick={() => handleStartExam(exam.examId, exam.examName)}
                  className="btn btn-primary hover:-translate-y-0.5 flex-1"
                >
                  {t('exam.startExam')}
                </button>
              </div>
            </div>
          ))}
        </div>
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
