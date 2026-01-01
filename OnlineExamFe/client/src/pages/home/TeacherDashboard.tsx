import React, { useState, useEffect } from 'react';
import { classService, ClassDto } from '../../services/classService';
import { examService } from '../../services/examService';
import { ExamDto } from '../../types/exam';

/**
 * TeacherDashboardProps:
 * - Props truyền vào component TeacherDashboard.
 *
 * user:
 * - Thông tin giáo viên đang đăng nhập.
 * - Hiện bạn đang để kiểu any (nghĩa là “bất kỳ kiểu gì cũng được”).
 * - Người mới học nên hiểu: any dùng nhanh nhưng dễ lỗi vì TS không cảnh báo.
 */
interface TeacherDashboardProps {
  user: any;
}

/**
 * StudentDto:
 * - Kiểu dữ liệu sinh viên hiển thị trong bảng danh sách sinh viên của lớp.
 *
 * Giải thích trường:
 * - id: ID nội bộ (trong DB hệ thống)
 * - fullName: họ và tên
 * - email: email
 * - mssv: mã số sinh viên (nếu hệ thống có)
 */
interface StudentDto {
  id: number;
  fullName: string;
  email: string;
  mssv: string;
}

/**
 * TeacherDashboard:
 *
 * Mục tiêu của trang (giáo viên):
 * 1) Xem danh sách lớp mà giáo viên phụ trách
 * 2) Xem danh sách sinh viên trong một lớp (khi bấm “Xem sinh viên”)
 * 3) Xem danh sách bài thi thuộc các lớp của giáo viên
 * 4) Tạo kỳ thi cho một lớp (mở modal -> nhập form -> gọi API createExam)
 *
 * Lưu ý:
 * - Trang này đang làm theo mô hình “gọi API -> lưu vào state -> render UI”.
 */
const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  // =========================================================
  // 1) STATE: DỮ LIỆU + TRẠNG THÁI UI
  // =========================================================

  /**
   * teacherClasses:
   * - Danh sách lớp mà giáo viên đang phụ trách.
   */
  const [teacherClasses, setTeacherClasses] = useState<ClassDto[]>([]);

  /**
   * teacherExams:
   * - Danh sách bài thi thuộc các lớp của giáo viên.
   */
  const [teacherExams, setTeacherExams] = useState<ExamDto[]>([]);

  /**
   * selectedClassStudents:
   * - Danh sách sinh viên của lớp đang xem.
   * - Khi bấm “Xem sinh viên” ở một lớp -> gọi API -> đổ dữ liệu vào đây.
   */
  const [selectedClassStudents, setSelectedClassStudents] = useState<StudentDto[]>([]);

  /**
   * viewingClassId:
   * - Lưu classId hiện đang được chọn để xem sinh viên.
   * - null nghĩa là chưa chọn lớp nào.
   */
  const [viewingClassId, setViewingClassId] = useState<number | null>(null);

  /**
   * showCreateModal:
   * - Bật/tắt modal tạo kỳ thi.
   */
  const [showCreateModal, setShowCreateModal] = useState(false);

  /**
   * creatingClassId:
   * - ClassId mà giáo viên đang muốn tạo kỳ thi cho lớp đó.
   * - Ví dụ: bấm “+ Tạo kỳ thi” ở lớp 5 -> creatingClassId = 5.
   */
  const [creatingClassId, setCreatingClassId] = useState<number | null>(null);

  /**
   * createForm:
   * - State lưu dữ liệu form tạo kỳ thi.
   * - Người mới học nên hiểu: input value liên kết với state => gọi là “controlled inputs”.
   */
  const [createForm, setCreateForm] = useState({
    name: '',
    durationMinutes: 60,
    blueprintId: 1,
    startTime: '',
    endTime: ''
  });

  /**
   * creating:
   * - Trạng thái “đang tạo kỳ thi” (để disable nút và hiển thị text “Đang tạo...”).
   */
  const [creating, setCreating] = useState(false);

  /**
   * createError:
   * - Lưu thông báo lỗi khi tạo kỳ thi thất bại.
   */
  const [createError, setCreateError] = useState<string | null>(null);

  // =========================================================
  // 2) HÀM LOAD BÀI THI THEO CÁC LỚP CỦA GIÁO VIÊN
  // =========================================================

  /**
   * loadExamsForClasses(classes):
   *
   * Mục tiêu:
   * - Lấy tất cả exam trong hệ thống (getAllExams)
   * - Lọc ra những exam thuộc các classId mà giáo viên phụ trách
   * - Set vào teacherExams để render
   *
   * Vì sao cần lọc?
   * - Vì API getAllExams trả toàn bộ exam, bao gồm exam của giáo viên khác.
   * - Giáo viên chỉ cần xem exam của lớp mình.
   *
   * Ghi chú:
   * - Cách tối ưu hơn là backend có API riêng: getExamsByTeacher(teacherId)
   *   để khỏi phải tải “toàn bộ hệ thống” rồi lọc ở FE.
   */
  const loadExamsForClasses = async (classes: ClassDto[]) => {
    // TODO: API /api/Exam/get-all là Admin-only, cần API khác cho Teacher
    // Ví dụ: /api/Exam/class/{classId} hoặc /api/Exam/teacher/{teacherId}
    console.log('[TODO] Cần API lấy exams theo teacher/class. Tạm thời bỏ qua.');

    // Tạm thời set empty để không gọi API forbidden
    setTeacherExams([]);

    // Code cũ (admin-only):
    // const allExams = await examService.getAllExams();
    // const classIds = new Set(classes.map((c) => c.id));
    // const filteredExams = allExams.filter((ex) => ex.classId && classIds.has(ex.classId));
    // setTeacherExams(filteredExams);
  };

  // =========================================================
  // 3) useEffect: TẢI DỮ LIỆU BAN ĐẦU CHO GIÁO VIÊN
  // =========================================================

  /**
   * useEffect này chạy khi:
   * - component được render lần đầu
   * - hoặc khi user thay đổi
   *
   * Vì dependency là [user].
   */
  useEffect(() => {
    const fetchTeacherData = async () => {
      /**
       * Kiểm tra user tồn tại và có user.id
       * - Tránh gọi API khi user chưa load xong.
       */
      if (user && user.id) {
        console.log('[DEBUG] TeacherDashboard: Fetching data for user', user);
        try {
          // 1) Lấy các lớp mà giáo viên phụ trách
          console.log('[DEBUG] Calling classService.getByTeacherAndSubject...');
          const classes = await classService.getByTeacherAndSubject(user.id);
          console.log('[DEBUG] Classes loaded:', classes);
          setTeacherClasses(classes);

          // 2) Lấy các bài thi thuộc các lớp đó
          console.log('[DEBUG] Loading exams for classes...');
          await loadExamsForClasses(classes);
          console.log('[DEBUG] Exams loaded successfully');
        } catch (error) {
          console.error('[DEBUG] Error loading teacher data:', error);
        }
      }
    };

    fetchTeacherData();
  }, [user]);

  // =========================================================
  // 4) XỬ LÝ XEM SINH VIÊN CỦA 1 LỚP
  // =========================================================

  /**
   * handleViewStudents(classId):
   * - Khi bấm “Xem sinh viên” ở một lớp:
   *   1) setViewingClassId để UI biết đang xem lớp nào
   *   2) gọi API getStudentsByClass(classId)
   *   3) đổ dữ liệu vào selectedClassStudents để render bảng
   */
  const handleViewStudents = async (classId: number) => {
    try {
      setViewingClassId(classId);

      // Gọi API lấy danh sách sinh viên của lớp
      const students = await classService.getStudentsByClass(classId);

      // Cập nhật state để render danh sách sinh viên
      setSelectedClassStudents(students);
    } catch (error) {
      console.error('Không thể tải danh sách sinh viên', error);
      alert('Không thể tải danh sách sinh viên.');
    }
  };

  // =========================================================
  // 5) MỞ MODAL TẠO KỲ THI
  // =========================================================

  /**
   * openCreateModal(classId):
   * - Lưu classId đang tạo kỳ thi
   * - Reset lỗi và reset form
   * - Bật modal
   */
  const openCreateModal = (classId: number) => {
    setCreatingClassId(classId);
    setCreateError(null);

    // Reset form về mặc định để tránh dữ liệu cũ
    setCreateForm({
      name: '',
      durationMinutes: 60,
      blueprintId: 1,
      startTime: '',
      endTime: ''
    });

    setShowCreateModal(true);
  };

  // =========================================================
  // 6) TẠO KỲ THI (GỌI API)
  // =========================================================

  /**
   * handleCreateExam():
   * - Validate dữ liệu form (đủ trường hay chưa)
   * - Gọi examService.createExam(payload)
   * - Reload danh sách bài thi của giáo viên để UI cập nhật ngay
   * - Đóng modal nếu tạo thành công
   */
  const handleCreateExam = async () => {
    // Nếu chưa có lớp đang tạo -> không làm gì
    if (!creatingClassId) return;

    // Lấy dữ liệu từ form ra cho dễ đọc
    const { name, durationMinutes, blueprintId, startTime, endTime } = createForm;

    /**
     * Kiểm tra input cơ bản:
     * - thiếu trường nào thì báo lỗi
     *
     * Gợi ý:
     * - Bạn có thể kiểm tra thêm: endTime phải > startTime, duration phải > 0...
     */
    if (!name || !durationMinutes || !blueprintId || !startTime || !endTime) {
      setCreateError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }

    setCreating(true);
    setCreateError(null);

    try {
      /**
       * payload gửi lên backend:
       * - classId: lớp đang tạo kỳ thi
       * - blueprintId: id “khung đề / template đề” (tuỳ hệ thống bạn)
       * - durationMinutes: thời lượng làm bài
       * - startTime/endTime: thời gian mở/đóng kỳ thi
       */
      const payload = {
        name,
        classId: creatingClassId,
        blueprintId: Number(blueprintId),
        durationMinutes: Number(durationMinutes),
        startTime,
        endTime
      };

      // Gọi API tạo kỳ thi
      await examService.createExam(payload);

      // Tạo xong thì load lại danh sách bài thi để đảm bảo dữ liệu “chuẩn”
      await loadExamsForClasses(teacherClasses);

      // Đóng modal
      setShowCreateModal(false);
    } catch (err: any) {
      // Lỗi từ server hoặc lỗi mạng
      setCreateError(err?.message || 'Tạo kỳ thi thất bại.');
    } finally {
      setCreating(false);
    }
  };

  // =========================================================
  // 7) UI RENDER
  // =========================================================

  return (
    <div className="space-y-6">
      {/* Header trang */}
      <div>
        <h1 className="text-3xl font-semibold text-white">Bảng điều khiển giáo viên</h1>
        <p className="text-slate-300">Quản lý lớp và bài thi</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* KHỐI 1: Danh sách lớp của giáo viên */}
        <div className="glass-card p-5">
          <h2 className="text-xl font-semibold text-white mb-4">Các lớp của bạn</h2>

          {teacherClasses.length === 0 ? (
            <p className="text-slate-400">Không có lớp được phân công.</p>
          ) : (
            <ul className="space-y-3">
              {teacherClasses.map((cls) => (
                <li
                  key={cls.id}
                  className="panel p-3 flex justify-between items-center bg-white/5 rounded-lg border border-white/10"
                >
                  <div>
                    <p className="font-medium text-white">{cls.name}</p>
                    <p className="text-xs text-slate-400">Mã môn học (Subject ID): {cls.subjectId}</p>
                  </div>

                  <div className="flex gap-2">
                    {/* Xem danh sách sinh viên của lớp */}
                    <button
                      onClick={() => handleViewStudents(cls.id)}
                      className="btn btn-ghost text-xs px-2 py-1 border border-white/20 hover:bg-white/10"
                    >
                      Xem sinh viên
                    </button>

                    {/* Mở modal tạo kỳ thi cho lớp */}
                    <button
                      onClick={() => openCreateModal(cls.id)}
                      className="btn btn-primary text-xs px-2 py-1"
                    >
                      + Tạo kỳ thi
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* KHỐI 2: Danh sách sinh viên của lớp đang xem */}
        <div className="glass-card p-5">
          <h2 className="text-xl font-semibold text-white mb-4">
            {viewingClassId
              ? `Sinh viên trong lớp #${viewingClassId}`
              : 'Chọn một lớp để xem danh sách sinh viên'}
          </h2>

          {/* Chỉ render bảng khi đã chọn lớp */}
          {viewingClassId && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-2">ID/MSSV</th>
                    <th className="py-2">Họ tên</th>
                    <th className="py-2">Email</th>
                  </tr>
                </thead>

                <tbody>
                  {selectedClassStudents.map((student) => (
                    <tr
                      key={student.id}
                      className="border-b border-white/5 last:border-0 hover:bg-white/5"
                    >
                      <td className="py-2">{student.mssv || student.id}</td>
                      <td className="py-2">{student.fullName || 'N/A'}</td>
                      <td className="py-2">{student.email}</td>
                    </tr>
                  ))}

                  {selectedClassStudents.length === 0 && (
                    <tr>
                      <td colSpan={3} className="py-4 text-center text-slate-500">
                        Không có sinh viên.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* KHỐI 3: Danh sách bài thi thuộc các lớp của giáo viên */}
        <div className="glass-card p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-300">Bài thi</p>
              <h2 className="text-xl font-semibold text-white">Bài thi trong các lớp của bạn</h2>
            </div>
          </div>

          {teacherExams.length === 0 ? (
            <p className="text-slate-400">Chưa có bài thi nào cho các lớp của bạn.</p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {teacherExams.map((ex) => (
                <div
                  key={ex.id}
                  className="panel p-4 border border-white/10 rounded-xl bg-white/5"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-lg font-semibold text-white">{ex.name}</h3>

                    {/* Tag hiển thị lớp mà bài thi thuộc về */}
                    <span className="tag">
                      <span className="h-2 w-2 rounded-full bg-sky-400" aria-hidden />
                      Lớp #{ex.classId}
                    </span>
                  </div>

                  <p className="text-sm text-slate-300">
                    Thời lượng: {ex.durationMinutes} phút
                  </p>
                  <p className="text-xs text-slate-400">
                    Bắt đầu: {new Date(ex.startTime).toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-400">
                    Kết thúc: {new Date(ex.endTime).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* =====================================================
          MODAL TẠO KỲ THI
          ===================================================== */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Tạo kỳ thi</h3>

              {/* Nút đóng modal */}
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-300 hover:text-white"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            {/* Nếu createError có giá trị thì hiển thị khung lỗi */}
            {createError && (
              <div className="text-rose-200 text-sm border border-rose-400/40 bg-rose-500/10 rounded-lg p-3">
                {createError}
              </div>
            )}

            {/* Form nhập thông tin kỳ thi */}
            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Tên kỳ thi</label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Giữa kỳ CSDL"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Thời lượng (phút)</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    value={createForm.durationMinutes}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))
                    }
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">Blueprint ID</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    value={createForm.blueprintId}
                    onChange={(e) =>
                      setCreateForm((f) => ({ ...f, blueprintId: Number(e.target.value) }))
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Thời gian bắt đầu</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    value={createForm.startTime}
                    onChange={(e) => setCreateForm((f) => ({ ...f, startTime: e.target.value }))}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-300 mb-1">Thời gian kết thúc</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    value={createForm.endTime}
                    onChange={(e) => setCreateForm((f) => ({ ...f, endTime: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Nút hành động */}
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowCreateModal(false)}
                className="btn btn-ghost px-4 py-2 border border-white/20"
                disabled={creating}
              >
                Hủy
              </button>

              <button
                onClick={handleCreateExam}
                className="btn btn-primary px-4 py-2"
                disabled={creating}
              >
                {creating ? 'Đang tạo...' : 'Tạo kỳ thi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;

/**
 * Giải thích các khái niệm dễ vấp (người mới):
 *
 * 1) “State” là gì?
 * - State là biến “trạng thái” mà khi thay đổi thì React sẽ render lại UI.
 * - Ví dụ: setTeacherClasses(...) -> danh sách lớp thay đổi -> UI cập nhật.
 *
 * 2) Vì sao loadExamsForClasses dùng Set?
 * - Set giúp kiểm tra “có thuộc danh sách lớp không” nhanh hơn:
 *   classIds.has(ex.classId) chạy nhanh và code gọn.
 *
 * 3) Modal là gì?
 * - Modal là “cửa sổ nổi” (popup) nằm trên UI.
 * - Thường dùng cho form tạo/sửa để không rời khỏi trang.
 *
 * 4) Controlled input là gì?
 * - Input được “điều khiển” bởi state:
 *   value={createForm.name} và onChange={() => setCreateForm(...)}
 * - Lợi ích: dữ liệu form luôn nằm trong state, dễ validate và gửi lên server.
 */
