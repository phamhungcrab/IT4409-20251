import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { examService, ExamGenerateResult } from '../services/examService';
import useAuth from '../hooks/useAuth';

/**
 * Exam (kiểu dữ liệu dùng cho danh sách bài thi):
 *  - id              : mã bài thi
 *  - name            : tên bài thi
 *  - durationMinutes : thời lượng (phút)
 *  - startTime/endTime: thời gian bắt đầu/kết thúc (chuỗi ISO từ backend)
 *  - status          : trạng thái hiển thị trên UI (Scheduled/Ongoing/Completed...)
 */
interface Exam {
  id: number;
  name: string;
  durationMinutes: number;
  startTime: string;
  endTime: string;
  status: string;
}

/**
 * ExamListPage (Trang danh sách bài thi):
 *  - Student vào đây để xem danh sách các bài thi được giao.
 *  - Khi bấm “Start exam”, FE gọi API startExam để:
 *      + Backend trả status: create / in_progress / completed / expired
 *      + Có thể trả wsUrl để kết nối WebSocket
 *      + Có thể trả exam payload (questions + duration...)
 *
 * Luồng tổng quan:
 *  1) Khi user đăng nhập (user != null) -> gọi examService.getStudentExams(user.id)
 *  2) Render danh sách exam
 *  3) Click Start exam -> handleStartExam(examId)
 *      - Gọi examService.startExam({ examId, studentId })
 *      - Fix wsUrl nếu backend trả ws://localhost... (khi deploy trên Render)
 *      - Cache exam payload vào localStorage để hỗ trợ resume (in_progress)
 *      - navigate sang /exam/:examId và truyền state { wsUrl, duration, questions }
 */
const ExamListPage: React.FC = () => {
  /**
   * i18next:
   *  - t(key): lấy text đa ngôn ngữ.
   */
  const { t } = useTranslation();

  /**
   * useAuth:
   *  - user: thông tin user hiện tại (student).
   */
  const { user } = useAuth();

  /**
   * useNavigate:
   *  - điều hướng sang trang khác bằng code.
   */
  const navigate = useNavigate();

  /**
   * exams:
   *  - danh sách bài thi của student.
   */
  const [exams, setExams] = useState<Exam[]>([]);

  /**
   * loading:
   *  - trạng thái đang tải danh sách bài thi.
   */
  const [loading, setLoading] = useState(true);

  /**
   * useEffect: tải danh sách bài thi khi đã có user.
   *  - dependency [user] => khi user thay đổi thì tải lại.
   */
  useEffect(() => {
    const fetchExams = async () => {
      // Nếu chưa có user thì không gọi API
      if (!user) return;

      try {
        // Gọi API: lấy danh sách bài thi theo studentId
        const data = await examService.getStudentExams(user.id);
        setExams(data);
      } catch (error) {
        console.error('Không thể tải danh sách bài thi', error);
      } finally {
        // Dù thành công hay thất bại, cũng tắt loading để UI không bị treo
        setLoading(false);
      }
    };

    fetchExams();
  }, [user]);

  /**
   * handleStartExam:
   *  - Xử lý khi user bấm nút “Start exam”.
   *
   * Mục tiêu:
   *  - Gọi backend để bắt đầu bài thi
   *  - Nhận wsUrl + đề thi (questions)
   *  - Điều hướng sang ExamRoomPage
   */
  const handleStartExam = async (examId: number) => {
    if (!user) return;

    try {
      /**
       * Gọi API startExam:
       *  - Backend trả về dạng: { status, wsUrl, data }
       *  - data là đề thi đã generate (questions, durationMinutes,...)
       */
      const response = await examService.startExam({
        examId,
        studentId: user.id
      });

      console.log('[ExamListPage] Start exam response:', response);

      // wsUrl: URL WebSocket để realtime sync
      let wsUrl = response.wsUrl || '';

      // examPayload: đề thi (questions...) do backend trả
      let examPayload: ExamGenerateResult | null = response.data ?? null;

      /**
       * FIX wsUrl cho môi trường deploy:
       *  - Một số backend trả ws://localhost:xxxx/... (hardcode lúc dev)
       *  - Khi deploy Render/HTTPS, FE phải dùng wss://<host>/...
       */
      const apiBase = (import.meta as any).env.VITE_API_BASE_URL || '';

      if (wsUrl) {
        // Trường hợp wsUrl trỏ localhost nhưng apiBase là domain Render
        if (wsUrl.includes('localhost') && apiBase.includes('onrender')) {
          try {
            const parsedWs = new URL(wsUrl);
            const parsedApi = new URL(apiBase);

            // Lấy host từ apiBase (domain thật), giữ pathname từ wsUrl
            wsUrl = `wss://${parsedApi.host}${parsedWs.pathname}`;
          } catch (e) {
            console.error('Không parse được URL để sửa WS', e);
          }
        }
        // Trường hợp backend trả wsUrl dạng tương đối: /ws/exam?token=...
        else if (wsUrl.startsWith('/')) {
          // apiBase: https://domain -> chuyển thành wss://domain
          wsUrl = apiBase.replace(/^http/, 'ws') + wsUrl;
        }
      }

      /**
       * Cache đề thi (examPayload) để hỗ trợ resume:
       *  - cacheKey: exam_<examId>_payload
       *
       * Nếu server trả status = in_progress mà response.data không có (null)
       *  -> ta đọc cache để lấy lại questions/duration.
       */
      const cacheKey = `exam_${examId}_payload`;

      if (!examPayload && response.status === 'in_progress') {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          try {
            examPayload = JSON.parse(cached);
          } catch (e) {
            console.warn('Không parse được cache payload', e);
          }
        }
      } else if (examPayload) {
        // Nếu server trả payload mới, ta lưu lại để lần sau resume dùng
        localStorage.setItem(cacheKey, JSON.stringify(examPayload));
      }

      /**
       * Điều hướng theo status backend:
       *  - create / in_progress: vào phòng thi
       *  - completed          : đã làm xong -> sang results
       *  - expired            : bài thi hết hạn
       */
      if (response.status === 'create' || response.status === 'in_progress') {
        if (!examPayload) {
          alert('Không tải được đề thi. Vui lòng thử lại.');
          return;
        }

        /**
         * navigate sang ExamRoomPage:
         *  - route: /exam/:examId
         *  - state: truyền wsUrl, duration, questions
         *
         * Lưu ý:
         *  - location.state sẽ mất nếu refresh (F5).
         */
        navigate(`/exam/${examId}`, {
          state: {
            wsUrl,
            duration: examPayload.durationMinutes || 60,
            questions: examPayload.questions || []
          }
        });
      } else if (response.status === 'completed') {
        alert('Bạn đã hoàn thành bài thi này!');
        navigate('/results');
      } else if (response.status === 'expired') {
        alert('Bài thi đã hết hạn!');
      } else {
        alert('Không thể bắt đầu bài thi. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Lỗi khi bắt đầu bài thi', error);
      alert('Error starting exam');
    }
  };

  /**
   * Nếu đang tải data -> hiển thị loading.
   */
  if (loading) return <div>{t('common.loading')}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      {/* Tiêu đề trang */}
      <div className="flex flex-col gap-2">
        <p className="text-sm text-slate-300">{t('exam.listTitle')}</p>
        <h1 className="text-3xl font-semibold text-white">Available exams</h1>
      </div>

      {/* Nếu không có bài thi -> hiển thị empty state */}
      {exams.length === 0 ? (
        <div className="glass-card p-6 text-slate-300">{t('exam.noExams')}</div>
      ) : (
        // Có bài thi -> render dạng grid cards
        <div className="grid gap-4 md:grid-cols-2">
          {exams.map((exam) => (
            <div key={exam.id} className="glass-card p-5 flex flex-col gap-4 justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold text-white">{exam.name}</h3>

                  {/* Tag trạng thái bài thi */}
                  <span className="tag">
                    <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
                    {exam.status}
                  </span>
                </div>

                {/* Thông tin thời lượng và thời gian bắt đầu */}
                <div className="text-sm text-slate-300 space-y-1">
                  <p>
                    {t('exam.duration')}: {exam.durationMinutes} mins
                  </p>
                  <p>
                    {t('exam.startTime')}: {new Date(exam.startTime).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                {/* Nút bắt đầu bài thi */}
                <button
                  onClick={() => handleStartExam(exam.id)}
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
 *    - Nếu student đang làm dở (in_progress), backend có thể chỉ trả wsUrl + status
 *      và không gửi lại toàn bộ questions.
 *    - FE lưu payload vào localStorage để khi resume vẫn có questions để render.
 *
 * 2) Vì sao phải sửa wsUrl (localhost -> Render)?
 *    - Backend deploy sau reverse proxy có thể trả wsUrl sai host.
 *    - FE phải “sanitize” URL để dùng domain thật (wss://it4409-20251.onrender.com/...)
 *
 * 3) location.state là gì và nhược điểm?
 *    - Là dữ liệu truyền kèm khi navigate.
 *    - Nhược điểm: refresh trang mất state, nên ExamRoomPage không còn questions.
 *    - Giải pháp tốt hơn: lưu thêm vào localStorage hoặc fetch lại theo examId.
 *
 * 4) Vì sao useEffect phụ thuộc [user]?
 *    - Vì user có thể null lúc mới load app, sau đó mới set từ localStorage.
 *    - Khi user có rồi, effect chạy để tải danh sách bài thi.
 */
