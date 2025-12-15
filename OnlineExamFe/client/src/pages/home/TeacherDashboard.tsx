import React, { useState, useEffect } from 'react';
import { classService, ClassDto } from '../../services/classService';
import { examService } from '../../services/examService';
import { ExamDto } from '../../types/exam';

interface TeacherDashboardProps {
  user: any;
}

interface StudentDto {
  id: number;
  fullName: string;
  email: string;
  mssv: string;
}

const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user }) => {
  const [teacherClasses, setTeacherClasses] = useState<ClassDto[]>([]);
  const [teacherExams, setTeacherExams] = useState<ExamDto[]>([]);
  const [selectedClassStudents, setSelectedClassStudents] = useState<StudentDto[]>([]);
  const [viewingClassId, setViewingClassId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingClassId, setCreatingClassId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    durationMinutes: 60,
    blueprintId: 1,
    startTime: '',
    endTime: ''
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const loadExamsForClasses = async (classes: ClassDto[]) => {
    const classIds = new Set(classes.map((c) => c.id));
    const allExams = await examService.getAllExams();
    const filteredExams = allExams.filter((ex) => ex.classId && classIds.has(ex.classId));
    setTeacherExams(filteredExams);
  };

  useEffect(() => {
    const fetchTeacherData = async () => {
      if (user && user.id) {
        try {
          // 1) Lấy các lớp mà teacher phụ trách
          const classes = await classService.getByTeacherAndSubject(user.id);
          setTeacherClasses(classes);

          // 2) Lấy exam thuộc các lớp của teacher
          await loadExamsForClasses(classes);
        } catch (error) {
          console.error('Không thể tải dữ liệu lớp/bài thi của giáo viên', error);
        }
      }
    };

    fetchTeacherData();
  }, [user]);

  const handleViewStudents = async (classId: number) => {
    try {
      setViewingClassId(classId);
      const students = await classService.getStudentsByClass(classId);
      setSelectedClassStudents(students);
    } catch (error) {
      console.error('Không thể tải danh sách sinh viên', error);
      alert('Không thể tải danh sách sinh viên.');
    }
  };

  const openCreateModal = (classId: number) => {
    setCreatingClassId(classId);
    setCreateError(null);
    setCreateForm({
      name: '',
      durationMinutes: 60,
      blueprintId: 1,
      startTime: '',
      endTime: ''
    });
    setShowCreateModal(true);
  };

  const handleCreateExam = async () => {
    if (!creatingClassId) return;
    const { name, durationMinutes, blueprintId, startTime, endTime } = createForm;
    if (!name || !durationMinutes || !blueprintId || !startTime || !endTime) {
      setCreateError('Vui lòng nhập đầy đủ thông tin.');
      return;
    }
    setCreating(true);
    setCreateError(null);
    try {
      const payload = {
        name,
        classId: creatingClassId,
        blueprintId: Number(blueprintId),
        durationMinutes: Number(durationMinutes),
        startTime,
        endTime
      };
      await examService.createExam(payload);
      // Reload exam list for teacher's classes to ensure data chính xác
      await loadExamsForClasses(teacherClasses);
      setShowCreateModal(false);
    } catch (err: any) {
      setCreateError(err?.message || 'Tạo kỳ thi thất bại.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold text-white">Teacher Dashboard</h1>
        <p className="text-slate-300">Quản lý lớp và bài thi</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Danh sách lớp của giáo viên */}
        <div className="glass-card p-5">
          <h2 className="text-xl font-semibold text-white mb-4">Your Classes</h2>

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
                    <p className="text-xs text-slate-400">Subject ID: {cls.subjectId}</p>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleViewStudents(cls.id)}
                      className="btn btn-ghost text-xs px-2 py-1 border border-white/20 hover:bg-white/10"
                    >
                      View Users
                    </button>

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

        {/* Danh sách sinh viên của lớp đang xem */}
        <div className="glass-card p-5">
          <h2 className="text-xl font-semibold text-white mb-4">
            {viewingClassId
              ? `Students in Class #${viewingClassId}`
              : 'Chọn một lớp để xem danh sách sinh viên'}
          </h2>

          {viewingClassId && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                  <tr>
                    <th className="py-2">ID/MSSV</th>
                    <th className="py-2">Name</th>
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

        {/* Danh sách bài thi thuộc các lớp của giáo viên */}
        <div className="glass-card p-5 md:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-slate-300">Exams</p>
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
                    <span className="tag">
                      <span className="h-2 w-2 rounded-full bg-sky-400" aria-hidden />
                      Class #{ex.classId}
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

      {/* Modal tạo kỳ thi */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Tạo kỳ thi</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-300 hover:text-white">
                ×
              </button>
            </div>

            {createError && (
              <div className="text-rose-200 text-sm border border-rose-400/40 bg-rose-500/10 rounded-lg p-3">
                {createError}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm text-slate-300 mb-1">Tên kỳ thi</label>
                <input
                  className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                  value={createForm.name}
                  onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="Midterm CSDL"
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
                    onChange={(e) => setCreateForm((f) => ({ ...f, durationMinutes: Number(e.target.value) }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Blueprint ID</label>
                  <input
                    type="number"
                    min={1}
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    value={createForm.blueprintId}
                    onChange={(e) => setCreateForm((f) => ({ ...f, blueprintId: Number(e.target.value) }))}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-slate-300 mb-1">Start Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    value={createForm.startTime}
                    onChange={(e) => setCreateForm((f) => ({ ...f, startTime: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-300 mb-1">End Time</label>
                  <input
                    type="datetime-local"
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    value={createForm.endTime}
                    onChange={(e) => setCreateForm((f) => ({ ...f, endTime: e.target.value }))}
                  />
                </div>
              </div>
            </div>

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
