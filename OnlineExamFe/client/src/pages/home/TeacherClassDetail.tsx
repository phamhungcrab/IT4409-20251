import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import TeacherClassReports from './TeacherClassReports';
import useAuth from '../../hooks/useAuth';
import { classService, ClassDto } from '../../services/classService';
import { examService, ExamStudentStatus } from '../../services/examService';
import { resultService, ResultSummary } from '../../services/resultService';
import { blueprintService, Blueprint, BlueprintChapter } from '../../services/blueprintService';
import { ExamDto } from '../../types/exam';

interface StudentDto {
  id: number;
  fullName: string;
  email: string;
  mssv: string;
  dateOfBirth?: string; // Ngày sinh (optional nếu API không trả về)
}

type ClassSection = 'students' | 'exams' | 'status' | 'blueprints' | 'reports';
type ToastVariant = 'success' | 'error' | 'info';
type ToastState = { message: string; variant: ToastVariant } | null;
type ClassExam = NonNullable<ClassDto['exams']>[number];

const TeacherClassDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { classId } = useParams<{ classId: string }>();
  const { user } = useAuth();

  const numericClassId = Number(classId);
  const isInvalidClassId = Number.isNaN(numericClassId) || numericClassId <= 0;

  const [classDetail, setClassDetail] = useState<ClassDto | null>(null);
  const [loadingClass, setLoadingClass] = useState(false);
  const [classError, setClassError] = useState<string | null>(null);

  const [selectedClassStudents, setSelectedClassStudents] = useState<StudentDto[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [selectedClassExams, setSelectedClassExams] = useState<ExamDto[]>([]);
  const [loadingExams, setLoadingExams] = useState(false);

  const [examStudentsStatus, setExamStudentsStatus] = useState<ExamStudentStatus[]>([]);
  const [loadingStatus, setLoadingStatus] = useState(false);

  const [viewingStatusExamId, setViewingStatusExamId] = useState<number | null>(null);
  const [viewingStatusExamName, setViewingStatusExamName] = useState('');

  const [activeSection, setActiveSection] = useState<ClassSection>('students');

  const [studentDetailModal, setStudentDetailModal] = useState<{
    show: boolean;
    studentName: string;
    mssv: string;
    data: ResultSummary | null;
    loading: boolean;
  }>({
    show: false,
    studentName: '',
    mssv: '',
    data: null,
    loading: false
  });

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creatingClassId, setCreatingClassId] = useState<number | null>(null);
  const [createForm, setCreateForm] = useState({
    name: '',
    durationMinutes: 60,
    blueprintId: 0,
    startTime: '',
    endTime: ''
  });
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [availableBlueprints, setAvailableBlueprints] = useState<Blueprint[]>([]);
  const [selectedBlueprintDetail, setSelectedBlueprintDetail] = useState<Blueprint | null>(null);

  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [blueprintForm, setBlueprintForm] = useState<{
    subjectId: number;
    chapters: BlueprintChapter[];
  }>({
    subjectId: 0,
    chapters: [{ chapter: 1, easyCount: 0, mediumCount: 0, hardCount: 0, veryHardCount: 0 }]
  });
  const [creatingBlueprint, setCreatingBlueprint] = useState(false);
  const [blueprintError, setBlueprintError] = useState<string | null>(null);
  const [editingBlueprintId, setEditingBlueprintId] = useState<number | null>(null);
  const [editingExamId, setEditingExamId] = useState<number | null>(null); // State sửa exam
  const [toast, setToast] = useState<ToastState>(null);
  const toastTimeoutRef = useRef<number | null>(null);
  const toastClasses: Record<ToastVariant, string> = {
    success: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200',
    error: 'bg-rose-500/15 border-rose-500/40 text-rose-200',
    info: 'bg-sky-500/15 border-sky-500/40 text-sky-200'
  };

  const [deleteConfirm, setDeleteConfirm] = useState<{
    show: boolean;
    examId: number | null;
    examName: string;
  }>({ show: false, examId: null, examName: '' });
  const [deleting, setDeleting] = useState(false);

  const [deleteBlueprintConfirm, setDeleteBlueprintConfirm] = useState<{
    show: boolean;
    blueprintId: number | null;
  }>({ show: false, blueprintId: null });
  const [deletingBlueprint, setDeletingBlueprint] = useState(false);

  const mapClassExams = (classIdValue: number, exams: ClassDto['exams'] = []): ExamDto[] =>
    (exams ?? []).map((exam: ClassExam) => ({
      id: exam.id,
      name: exam.name,
      startTime: exam.startTime,
      endTime: exam.endTime,
      durationMinutes: exam.durationMinutes,
      classId: classIdValue,
      blueprintId: exam.blueprintId || (exam as any).BlueprintId || 0
    }));

  const refreshClassDetail = async () => {
    const detail = await classService.getById(numericClassId);
    setClassDetail(detail);
    setSelectedClassExams(mapClassExams(numericClassId, detail.exams || []));
    return detail;
  };

  const clearToastTimeout = () => {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
      toastTimeoutRef.current = null;
    }
  };

  const dismissToast = () => {
    clearToastTimeout();
    setToast(null);
  };

  const showToast = (message: string, variant: ToastVariant = 'info') => {
    clearToastTimeout();
    setToast({ message, variant });
    toastTimeoutRef.current = window.setTimeout(() => {
      setToast(null);
      toastTimeoutRef.current = null;
    }, 3000);
  };

  useEffect(() => {
    const fetchExamStatusFromUrl = async () => {
        const params = new URLSearchParams(location.search);
        const tab = params.get('tab');
        const examId = params.get('examId');

        if (tab === 'status' && examId) {
            const eId = Number(examId);
            if (!isNaN(eId)) {
                setActiveSection('status');
                setViewingStatusExamId(eId);
                setLoadingStatus(true);
                try {
                    // Fetch status data
                    const data = await examService.getExamStudentsStatus(eId);
                    setExamStudentsStatus(data.students);
                    // Try to finding exam name if exams are loaded, else placeholder
                    const foundExam = selectedClassExams.find(x => x.id === eId);
                    if (foundExam) {
                        setViewingStatusExamName(foundExam.name);
                    } else {
                        // Fallback: If we don't have exam list yet, we might want to fetch it or just show ID
                         setViewingStatusExamName(`Kỳ thi #${eId}`);
                    }
                } catch(err) {
                    console.error("Failed to load exam status from URL", err);
                } finally {
                    setLoadingStatus(false);
                }
            }
        } else if (tab && ['students', 'exams', 'blueprints', 'reports'].includes(tab)) {
           setActiveSection(tab as ClassSection);
        }
    };

    fetchExamStatusFromUrl();
  }, [location.search, selectedClassExams.length]); // Re-run when exams loaded to update name if needed

  useEffect(() => {
    const fetchClassDetail = async () => {
      if (isInvalidClassId || !user?.id) return;

      setLoadingClass(true);
      setClassError(null);
      console.log('[DEBUG] TeacherClassDetail: Fetching data for class', numericClassId);

      try {
        await refreshClassDetail();
        await handleViewStudents(numericClassId);
      } catch (error) {
        console.error('[DEBUG] TeacherClassDetail: Error loading class detail', error);
        setClassError('Không thể tải dữ liệu lớp học.');
      } finally {
        setLoadingClass(false);
      }
    };

    fetchClassDetail();
  }, [numericClassId, isInvalidClassId, user?.id]);

  useEffect(() => {
    if (activeSection === 'blueprints' && classDetail?.subjectId) {
      // Load blueprints nếu chưa có hoặc muốn refresh
      // Ở đây ta load nếu list rỗng. Nếu muốn luôn refresh thì bỏ check length.
      // Để UX tốt, nên có loading state cho blueprints
      console.log('[DEBUG] Loading blueprints for subject', classDetail.subjectId);
      loadBlueprintsWithDetails(classDetail.subjectId)
        .then(setAvailableBlueprints)
        .catch(err => console.error("Error loading blueprints tab", err));
    }
  }, [activeSection, classDetail?.subjectId]);

  useEffect(() => () => clearToastTimeout(), []);

  const handleViewStudents = async (classIdValue: number) => {
    try {
      setSelectedClassStudents([]);
      setViewingStatusExamId(null);
      setViewingStatusExamName('');
      setExamStudentsStatus([]);
      setActiveSection('students');
      setLoadingStudents(true);

      console.log('[DEBUG] TeacherClassDetail: Loading students for class', classIdValue);
      const students = await classService.getStudentsByClass(classIdValue);
      setSelectedClassStudents(students);
    } catch (error) {
      console.error('Không thể tải danh sách sinh viên', error);
      showToast('Không thể tải danh sách sinh viên.', 'error');
    } finally {
      setLoadingStudents(false);
    }
  };

  const handleViewExams = async (classIdValue: number) => {
    try {
      setActiveSection('exams');
      setViewingStatusExamId(null);
      setViewingStatusExamName('');
      setExamStudentsStatus([]);
      setLoadingExams(true);

      console.log('[DEBUG] TeacherClassDetail: Loading exams for class', classIdValue);
      const classDetailResponse = await classService.getById(classIdValue);
      setClassDetail(classDetailResponse);
      setSelectedClassExams(mapClassExams(classIdValue, classDetailResponse.exams || []));
    } catch (error) {
      console.error('Không thể tải danh sách kỳ thi', error);
      showToast('Không thể tải danh sách kỳ thi.', 'error');
    } finally {
      setLoadingExams(false);
    }
  };

  const handleViewExamStudentsStatus = async (examId: number, examName: string) => {
    try {
      setActiveSection('status');
      setViewingStatusExamId(examId);
      setViewingStatusExamName(examName);
      setLoadingStatus(true);

      const response = await examService.getExamStudentsStatus(examId);
      setExamStudentsStatus(response.students);
    } catch (error) {
      console.error('Không thể tải trạng thái sinh viên', error);
      showToast('Không thể tải trạng thái sinh viên.', 'error');
    } finally {
      setLoadingStatus(false);
    }
  };

  const handleViewStudentDetail = async (
    examId: number,
    studentId: number,
    studentName: string,
    mssv: string
  ) => {
    setStudentDetailModal({
      show: true,
      studentName,
      mssv,
      data: null,
      loading: true
    });

    try {
      const result = await resultService.getResultSummary(examId, studentId);
      setStudentDetailModal((prev) => ({
        ...prev,
        data: result,
        loading: false
      }));
    } catch (error) {
      console.error('Không thể tải chi tiết điểm', error);
      setStudentDetailModal((prev) => ({
        ...prev,
        loading: false
      }));
    }
  };

  const loadBlueprintsWithDetails = async (subjectId: number) => {
    const allBlueprints = await blueprintService.getAll();
    const filtered = allBlueprints.filter((bp) => bp.subjectId === subjectId);

    // Fetch chi tiết cho từng blueprint để có chapters data
    const detailedBlueprints = await Promise.all(
      filtered.map(async (bp) => {
        try {
          const detailed = await blueprintService.getById(bp.id);
          return detailed;
        } catch (err) {
          console.warn(`Không thể load chi tiết blueprint ${bp.id}`, err);
          return bp; // Fallback về blueprint cơ bản
        }
      })
    );

    return detailedBlueprints;
  };

  const openCreateModal = async (classIdValue: number) => {
    if (!classDetail || classDetail.id !== classIdValue) {
      showToast('Không tìm thấy thông tin lớp học.', 'error');
      return;
    }

    setCreatingClassId(classIdValue);
    setEditingExamId(null); // Reset edit mode
    setCreateError(null);
    setSelectedBlueprintDetail(null);
    setAvailableBlueprints([]);

    setCreateForm({
      name: '',
      durationMinutes: 60,
      blueprintId: 0,
      startTime: '',
      endTime: ''
    });

    if (classDetail.subjectId) {
      try {
        const blueprints = await loadBlueprintsWithDetails(classDetail.subjectId);
        setAvailableBlueprints(blueprints);
      } catch (error) {
        console.error('Không thể load Blueprint:', error);
      }
    }

    setShowCreateModal(true);
  };

  const openBlueprintModal = (classIdValue: number) => {
    if (!classDetail || classDetail.id !== classIdValue || !classDetail.subjectId) {
      showToast('Không tìm thấy thông tin lớp học.', 'error');
      return;
    }

    setBlueprintError(null);
    setEditingBlueprintId(null);
    setBlueprintForm({
      subjectId: classDetail.subjectId,
      chapters: [{ chapter: 1, easyCount: 0, mediumCount: 0, hardCount: 0, veryHardCount: 0 }]
    });
    setShowBlueprintModal(true);
  };

  const openEditBlueprintModal = async (blueprint: Blueprint) => {
    if (!classDetail?.subjectId) {
      showToast('Không tìm thấy thông tin lớp học.', 'error');
      return;
    }

    setBlueprintError(null);
    setEditingBlueprintId(blueprint.id);

    // Pre-populate form với data hiện tại
    setBlueprintForm({
      subjectId: blueprint.subjectId,
      chapters: blueprint.chapters && blueprint.chapters.length > 0
        ? blueprint.chapters
        : [{ chapter: 1, easyCount: 0, mediumCount: 0, hardCount: 0, veryHardCount: 0 }]
    });

    setShowBlueprintModal(true);
  };

  const handleCreateBlueprint = async () => {
    if (blueprintForm.chapters.length === 0) {
      setBlueprintError('Vui lòng thêm ít nhất 1 chương');
      return;
    }

    setCreatingBlueprint(true);
    setBlueprintError(null);

    try {
      if (editingBlueprintId) {
        // Update mode
        await blueprintService.updateBlueprint(editingBlueprintId, blueprintForm);
        showToast('Cập nhật blueprint thành công!', 'success');
      } else {
        // Create mode
        await blueprintService.create(blueprintForm);
        showToast('Tạo cấu trúc đề thành công!', 'success');
      }

      // Refresh blueprint list
      if (classDetail?.subjectId) {
        const blueprints = await loadBlueprintsWithDetails(classDetail.subjectId);
        setAvailableBlueprints(blueprints);
      }

      setShowBlueprintModal(false);
      setEditingBlueprintId(null);
    } catch (error) {
      const message = error instanceof Error ? error.message :
        (editingBlueprintId ? 'Cập nhật Blueprint thất bại' : 'Tạo Blueprint thất bại');
      setBlueprintError(message);
    } finally {
      setCreatingBlueprint(false);
    }
  };

  const handleSelectBlueprint = async (blueprintId: number) => {
    if (!blueprintId) {
      setSelectedBlueprintDetail(null);
      return;
    }

    try {
      const detail = await blueprintService.getById(blueprintId);
      setSelectedBlueprintDetail(detail);
    } catch (error) {
      console.error('Không thể load chi tiết Blueprint:', error);
    }
  };

  const openEditExamModal = async (exam: ExamDto) => {
    if (!classDetail?.subjectId) {
       showToast('Không tìm thấy thông tin lớp học.', 'error');
       return;
    }

    setEditingExamId(exam.id);
    setCreatingClassId(exam.classId || 0);
    setCreateError(null);
    setAvailableBlueprints([]);

    // Helper format DateTime local
    const formatDate = (dateStr: string) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        // Adjust local timezone
        const local = new Date(d.getTime() - (d.getTimezoneOffset() * 60000));
        return local.toISOString().slice(0, 16);
    };

    setCreateForm({
      name: exam.name,
      durationMinutes: exam.durationMinutes,
      blueprintId: exam.blueprintId || 0,
      startTime: formatDate(exam.startTime),
      endTime: formatDate(exam.endTime)
    });

    // Load available blueprints
    try {
        const blueprints = await loadBlueprintsWithDetails(classDetail.subjectId);
        setAvailableBlueprints(blueprints);
        if (exam.blueprintId) {
             handleSelectBlueprint(exam.blueprintId);
        }
    } catch(e) { console.error(e); }

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

      if (editingExamId) {
          await examService.updateExam(editingExamId, payload);
          showToast('Cập nhật kỳ thi thành công!', 'success');
      } else {
          await examService.createExam(payload);
          showToast('Tạo kỳ thi thành công!', 'success');
      }

      await refreshClassDetail();
      setShowCreateModal(false);
      setActiveSection('exams');
    } catch (error) {
      const message = error instanceof Error ? error.message : (editingExamId ? 'Cập nhật thất bại.' : 'Tạo kỳ thi thất bại.');
      setCreateError(message);
    } finally {
      setCreating(false);
    }
  };

  const handleDeleteExam = async () => {
    if (!deleteConfirm.examId) return;

    setDeleting(true);
    try {
      await examService.deleteExam(deleteConfirm.examId);
      await refreshClassDetail();
      setDeleteConfirm({ show: false, examId: null, examName: '' });
      showToast('Xóa kỳ thi thành công!', 'success');
    } catch (error) {
      console.error('Không thể xóa kỳ thi:', error);
      showToast('Xóa kỳ thi thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteBlueprint = async () => {
    if (!deleteBlueprintConfirm.blueprintId) return;

    setDeletingBlueprint(true);
    try {
      await blueprintService.deleteBlueprint(deleteBlueprintConfirm.blueprintId);
      // Refresh blueprint list
      if (classDetail?.subjectId) {
        const blueprints = await loadBlueprintsWithDetails(classDetail.subjectId);
        setAvailableBlueprints(blueprints);
      }
      setDeleteBlueprintConfirm({ show: false, blueprintId: null });
      showToast('Xóa blueprint thành công!', 'success');
    } catch (error) {
      console.error('Không thể xóa blueprint:', error);
      showToast('Xóa blueprint thất bại. Vui lòng thử lại.', 'error');
    } finally {
      setDeletingBlueprint(false);
    }
  };

  const handleViewBlueprints = async () => {
    try {
      setActiveSection('blueprints');
      if (classDetail?.subjectId) {
        const blueprints = await loadBlueprintsWithDetails(classDetail.subjectId);
        setAvailableBlueprints(blueprints);
      }
    } catch (error) {
      console.error('Không thể tải danh sách blueprint', error);
      showToast('Không thể tải danh sách blueprint.', 'error');
    }
  };

  const studentCount = classDetail?.studentCount ?? selectedClassStudents.length;
  const examCount = classDetail?.exams?.length ?? selectedClassExams.length;

  if (isInvalidClassId) {
    return (
      <div className="glass-card p-6 text-center space-y-4">
        <h2 className="text-xl font-semibold text-white">Không tìm thấy lớp học</h2>
        <p className="text-slate-400">Vui lòng quay lại danh sách lớp.</p>
        <button onClick={() => navigate('/')} className="btn btn-primary px-4 py-2 rounded-lg">
          Quay lại lớp của bạn
        </button>
      </div>
    );
  }

  if (classError) {
    return (
      <div className="glass-card p-6 text-center space-y-4">
        <h2 className="text-xl font-semibold text-white">Không thể tải dữ liệu</h2>
        <p className="text-slate-400">{classError}</p>
        <button
          onClick={() => navigate('/')}
          className="btn btn-ghost px-4 py-2 border border-white/20"
        >
          Quay lại lớp của bạn
        </button>
      </div>
    );
  }

  if (!classDetail) {
    return (
      <div className="glass-card p-6 text-center text-slate-400">
        {loadingClass ? 'Đang tải dữ liệu lớp học...' : 'Đang tải dữ liệu lớp học...'}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/')}
        className="text-sm text-slate-400 hover:text-white inline-flex items-center gap-2"
      >
        ← Lớp của bạn
      </button>

      <div className="glass-card p-6 space-y-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Chi tiết lớp</p>
            <h1 className="text-2xl font-bold text-white">
              {classDetail?.name || `Lớp #${numericClassId}`}
            </h1>
            <p className="text-sm text-slate-400">
              {classDetail?.subject?.name ||
                (classDetail?.subjectId ? `Môn #${classDetail.subjectId}` : 'Chưa có môn')}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleViewExams(numericClassId)}
              className="btn btn-ghost text-sm px-4 py-2 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 rounded-lg font-medium"
            >
              Kỳ thi
            </button>
            <button
              onClick={() => openBlueprintModal(numericClassId)}
              className="btn btn-ghost text-sm px-4 py-2 border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 hover:border-purple-500/50 rounded-lg font-medium"
            >
              Tạo cấu trúc đề
            </button>
            <button
              onClick={() => openCreateModal(numericClassId)}
              className="btn btn-primary text-sm px-4 py-2 rounded-lg font-semibold shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40"
            >
              Tạo kỳ thi
            </button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm uppercase tracking-[0.15em] text-slate-400 font-semibold">Sinh viên</p>
            <p className="text-3xl font-bold text-white">{studentCount}</p>
            <p className="text-sm text-slate-400">Danh sách và thông tin lớp</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm uppercase tracking-[0.15em] text-slate-400 font-semibold">Kỳ thi</p>
            <p className="text-3xl font-bold text-white">{examCount}</p>
            <p className="text-sm text-slate-400">Quản lý lịch thi</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm uppercase tracking-[0.15em] text-slate-400 font-semibold">Mã môn</p>
            <p className="text-3xl font-bold text-white">
              {classDetail?.subject?.subjectCode || 'N/A'}
            </p>
            <p className="text-sm text-slate-400">Theo chương trình học</p>
          </div>
        </div>
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
        <button
          type="button"
          onClick={() => handleViewStudents(numericClassId)}
          className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
            activeSection === 'students'
              ? 'bg-sky-500/20 border-sky-500/50 text-white shadow-lg shadow-sky-500/10'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
          }`}
          aria-pressed={activeSection === 'students'}
        >
          <span className="block">Sinh viên</span>
          <span className="block text-xs font-normal text-slate-400">Danh sách & thông tin</span>
        </button>
        <button
          type="button"
          onClick={() => handleViewExams(numericClassId)}
          className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
            activeSection === 'exams'
              ? 'bg-emerald-500/20 border-emerald-500/40 text-white shadow-lg shadow-emerald-500/10'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
          }`}
          aria-pressed={activeSection === 'exams'}
        >
          <span className="block">Kỳ thi</span>
          <span className="block text-xs font-normal text-slate-400">Tạo & theo dõi</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('status')}
          className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
            activeSection === 'status'
              ? 'bg-amber-500/20 border-amber-500/40 text-white shadow-lg shadow-amber-500/10'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
          }`}
          aria-pressed={activeSection === 'status'}
        >
          <span className="block">Trạng thái</span>
          <span className="block text-xs font-normal text-slate-400">Bài làm & điểm</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('blueprints')}
          className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
            activeSection === 'blueprints'
              ? 'bg-purple-500/20 border-purple-500/50 text-white shadow-lg shadow-purple-500/10'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
          }`}
          aria-pressed={activeSection === 'blueprints'}
        >
          <span className="block">Cấu trúc đề</span>
          <span className="block text-xs font-normal text-slate-400">Blueprint & Ma trận</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveSection('reports')}
          className={`rounded-xl border px-4 py-3 text-left text-sm font-semibold transition-all ${
            activeSection === 'reports'
              ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-lg shadow-emerald-500/10'
              : 'bg-white/5 border-white/10 text-slate-300 hover:bg-white/10 hover:border-white/20'
          }`}
          aria-pressed={activeSection === 'reports'}
        >
          <span className="block">Báo cáo</span>
          <span className="block text-xs font-normal text-slate-400">Thống kê & Điểm</span>
        </button>
      </div>

      <div className="glass-card p-6">
        {activeSection === 'students' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400 mb-1">Danh sách sinh viên</p>
                <h3 className="text-xl font-semibold text-white">
                  {classDetail?.name || `Lớp #${numericClassId}`}
                </h3>
                <p className="text-sm text-slate-400 mt-1">{studentCount} sinh viên</p>
              </div>
              <button
                onClick={() => handleViewExams(numericClassId)}
                className="btn btn-ghost text-sm px-4 py-2 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 rounded-lg font-medium"
              >
                Mở danh sách kỳ thi
              </button>
            </div>

            {loadingStudents ? (
              <div className="py-10 text-center text-slate-400">Đang tải danh sách sinh viên...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="border-b-2 border-white/10">
                    <tr>
                      <th className="py-3 px-4 text-sm font-semibold uppercase text-slate-400">MSSV</th>
                      <th className="py-3 px-4 text-sm font-semibold uppercase text-slate-400">Họ tên</th>
                      <th className="py-3 px-4 text-sm font-semibold uppercase text-slate-400">Ngày sinh</th>
                      <th className="py-3 px-4 text-sm font-semibold uppercase text-slate-400">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedClassStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="border-b border-white/5 last:border-0 hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="py-3 px-4 text-base font-mono text-sky-400">
                          {student.mssv || student.id}
                        </td>
                        <td className="py-3 px-4 text-base font-medium text-white">
                          {student.fullName || 'N/A'}
                        </td>
                        <td className="py-3 px-4 text-base text-slate-300">
                          {student.dateOfBirth
                            ? new Date(student.dateOfBirth).toLocaleDateString('vi-VN')
                            : '-'
                          }
                        </td>
                        <td className="py-3 px-4 text-base text-slate-300">{student.email}</td>
                      </tr>
                    ))}

                    {selectedClassStudents.length === 0 && !loadingStudents && (
                      <tr>
                        <td colSpan={3} className="py-12 text-center text-slate-400">
                          Lớp này chưa có sinh viên nào.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSection === 'exams' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm text-slate-400 mb-1">Danh sách kỳ thi</p>
                <h3 className="text-xl font-semibold text-white">
                  {classDetail?.name || `Lớp #${numericClassId}`}
                </h3>
              </div>
              <button
                onClick={() => openCreateModal(numericClassId)}
                className="btn btn-primary text-sm px-4 py-2 rounded-lg"
              >
                + Tạo kỳ thi
              </button>
            </div>

            {loadingExams ? (
              <div className="py-10 text-center text-slate-400">Đang tải danh sách kỳ thi...</div>
            ) : selectedClassExams.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-slate-400 mb-4">Lớp này chưa có kỳ thi nào</p>
                <button
                  onClick={() => openCreateModal(numericClassId)}
                  className="btn btn-primary px-4 py-2 text-sm rounded-lg"
                >
                  + Tạo kỳ thi đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {selectedClassExams.map((ex) => (
                  <div
                    key={ex.id}
                    className="group panel p-5 border border-white/10 rounded-xl bg-white/5 hover:border-sky-500/30 hover:shadow-lg hover:shadow-sky-500/10 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white flex-1 pr-2">{ex.name}</h3>
                      <span className="shrink-0 text-xs bg-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full font-semibold">
                        {ex.durationMinutes} phút
                      </span>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">Bắt đầu:</span>
                        <span className="text-slate-300 font-medium">
                          {new Date(ex.startTime).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-400">Kết thúc:</span>
                        <span className="text-slate-300 font-medium">
                          {new Date(ex.endTime).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      {ex.blueprintId ? (
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-400">Cấu trúc đề:</span>
                          <span className="text-purple-400 font-medium">#{ex.blueprintId}</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-400">Cấu trúc đề:</span>
                            <span className="text-slate-500 italic">Không có</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                       {/* Nút Sửa */}
                      <button
                        onClick={() => openEditExamModal(ex)}
                        className="btn text-sm px-4 py-2.5 bg-sky-500/20 border border-sky-500/40 text-sky-300 hover:bg-sky-500/30 hover:border-sky-500/60 rounded-lg font-medium transition-all"
                        aria-label="Sửa kỳ thi"
                      >
                         <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                         </svg>
                      </button>

                      <button
                        onClick={() => handleViewExamStudentsStatus(ex.id, ex.name)}
                        className="flex-1 btn btn-ghost text-sm px-4 py-2.5 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 rounded-lg font-medium transition-all"
                      >
                        Xem trạng thái
                      </button>
                      <button
                        onClick={() => setDeleteConfirm({ show: true, examId: ex.id, examName: ex.name })}
                        className="btn text-sm px-4 py-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 hover:border-rose-500/60 rounded-lg font-medium transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Xóa kỳ thi"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeSection === 'status' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-300">Trạng thái làm bài</p>
                <h3 className="text-xl font-semibold text-white">
                  {viewingStatusExamName || 'Chưa chọn kỳ thi'}
                </h3>
              </div>
              {viewingStatusExamId && (
                <button
                  onClick={() => {
                    setViewingStatusExamId(null);
                    setExamStudentsStatus([]);
                  }}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Đóng
                </button>
              )}
            </div>

            {!viewingStatusExamId ? (
              <div className="text-center py-10">
                <p className="text-slate-400 mb-4">Chọn một kỳ thi để xem trạng thái.</p>
                <button
                  onClick={() => handleViewExams(numericClassId)}
                  className="btn btn-ghost text-sm px-4 py-2 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 rounded-lg font-medium"
                >
                  Mở danh sách kỳ thi
                </button>
              </div>
            ) : loadingStatus ? (
              <div className="py-10 text-center text-slate-400">Đang tải trạng thái sinh viên...</div>
            ) : examStudentsStatus.length === 0 ? (
              <p className="text-slate-400">Không có dữ liệu sinh viên.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="border-b border-white/10 text-xs uppercase text-slate-400">
                    <tr>
                      <th className="py-3 px-2">MSSV</th>
                      <th className="py-3 px-2">Họ tên</th>
                      <th className="py-3 px-2">Trạng thái</th>
                      <th className="py-3 px-2">Điểm</th>
                      <th className="py-3 px-2">Thời gian nộp</th>
                      <th className="py-3 px-2">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {examStudentsStatus.map((student) => (
                      <tr
                        key={student.studentId}
                        className="border-b border-white/5 last:border-0 hover:bg-white/5"
                      >
                        <td className="py-3 px-2 text-slate-300">{student.mssv}</td>
                        <td className="py-3 px-2 text-white">{student.studentName}</td>
                        <td className="py-3 px-2">
                          {student.status === 'COMPLETED' ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full">
                              Hoàn thành
                            </span>
                          ) : student.status === 'IN_PROGRESS' ? (
                            <span className="inline-flex items-center gap-1 text-xs bg-amber-500/20 text-amber-400 px-2 py-1 rounded-full">
                              Đang làm
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs bg-slate-500/20 text-slate-400 px-2 py-1 rounded-full">
                              Chưa làm
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {student.score !== null ? (
                            <span className="font-semibold text-sky-400">{student.score}</span>
                          ) : (
                            <span className="text-slate-500">-</span>
                          )}
                        </td>
                        <td className="py-3 px-2 text-slate-400 text-xs">
                          {student.submittedAt
                            ? new Date(student.submittedAt).toLocaleString('vi-VN')
                            : '-'}
                        </td>
                        <td className="py-3 px-2">
                          {student.status === 'COMPLETED' && (
                            <button
                              onClick={() =>
                                handleViewStudentDetail(
                                  viewingStatusExamId!,
                                  student.studentId,
                                  student.studentName,
                                  student.mssv
                                )
                              }
                              className="text-xs text-sky-400 hover:text-sky-300 hover:underline"
                            >
                              Chi tiết
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeSection === 'blueprints' && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-slate-400">Danh sách Blueprint</p>
                  <div className="group relative">
                    <svg className="w-4 h-4 text-slate-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="invisible group-hover:visible absolute left-0 top-6 z-10 w-80 p-3 bg-slate-800 border border-purple-500/30 rounded-lg shadow-xl">
                      <p className="text-xs text-slate-300 leading-relaxed">
                        <span className="font-semibold text-purple-400">Blueprint (Cấu trúc đề)</span> là bản thiết kế chi tiết phân bổ câu hỏi theo <span className="text-sky-400">chương</span> và <span className="text-amber-400">độ khó</span>.
                        Mỗi blueprint định nghĩa số câu Dễ/Trung bình/Khó/Rất khó cho từng chương, giúp tạo đề thi cân đối và công bằng.
                      </p>
                    </div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white">
                  {classDetail?.subject?.name || 'Cấu trúc đề'}
                </h3>
              </div>
              <button
                onClick={() => openBlueprintModal(numericClassId)}
                className="btn btn-primary text-sm px-4 py-2 rounded-lg"
              >
                + Tạo blueprint
              </button>
            </div>

            {availableBlueprints.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-purple-500/30 rounded-xl bg-purple-500/5">
                <svg className="w-16 h-16 mx-auto mb-4 text-purple-400/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-slate-400 mb-4">Chưa có blueprint nào cho môn học này</p>
                <button
                  onClick={() => openBlueprintModal(numericClassId)}
                  className="btn btn-primary px-4 py-2 text-sm rounded-lg"
                >
                  + Tạo blueprint đầu tiên
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {availableBlueprints.map((bp) => (
                  <div
                    key={bp.id}
                    className="group panel border border-white/10 rounded-xl bg-gradient-to-br from-white/5 to-purple-500/5 hover:border-purple-500/40 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-200"
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between p-5 pb-3 border-b border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                          <svg className="w-5 h-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-white">
                            Blueprint #{bp.id}
                          </h3>
                          <p className="text-xs text-slate-400">
                            {new Date(bp.createdAt).toLocaleDateString('vi-VN')}
                          </p>
                        </div>
                      </div>
                      <span className="shrink-0 text-sm bg-purple-500/20 text-purple-300 px-3 py-1.5 rounded-full font-semibold">
                        {bp.totalQuestions || 0} câu
                      </span>
                    </div>

                    {/* Chapter Details */}
                    <div className="p-5 space-y-3">
                      {bp.chapters && bp.chapters.length > 0 ? (
                        <>
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                            <span className="text-sm font-semibold text-slate-300">
                              Cấu trúc: {bp.chapters.length} chương
                            </span>
                          </div>
                          <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                            {bp.chapters.map((ch, idx) => {
                              const total = (ch.easyCount || 0) + (ch.mediumCount || 0) + (ch.hardCount || 0) + (ch.veryHardCount || 0);
                              return (
                                <div key={idx} className="bg-white/5 rounded-lg p-3 border border-white/5">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-white">
                                      Chương {ch.chapter}
                                    </span>
                                    <span className="text-xs text-slate-400">
                                      {total} câu
                                    </span>
                                  </div>
                                  <div className="flex flex-wrap gap-1.5">
                                    {ch.easyCount > 0 && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                        {ch.easyCount} Dễ
                                      </span>
                                    )}
                                    {ch.mediumCount > 0 && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400"></span>
                                        {ch.mediumCount} TB
                                      </span>
                                    )}
                                    {ch.hardCount > 0 && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                        {ch.hardCount} Khó
                                      </span>
                                    )}
                                    {ch.veryHardCount > 0 && (
                                      <span className="inline-flex items-center gap-1 text-xs bg-rose-500/10 text-rose-400 px-2 py-0.5 rounded border border-rose-500/20">
                                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                                        {ch.veryHardCount} RKhó
                                      </span>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Chưa có chi tiết cấu trúc</p>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 p-5 pt-3 border-t border-white/5">
                      <button
                        onClick={async () => {
                          setCreateForm((f) => ({ ...f, blueprintId: bp.id }));
                          await handleSelectBlueprint(bp.id);
                          openCreateModal(numericClassId);
                        }}
                        className="flex-1 btn btn-ghost text-sm px-4 py-2.5 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10 hover:border-emerald-500/50 rounded-lg font-medium transition-all"
                      >
                        <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Tạo kỳ thi
                      </button>
                      <button
                        onClick={() => openEditBlueprintModal(bp)}
                        className="btn btn-ghost text-sm px-3 py-2.5 border border-sky-500/30 text-sky-400 hover:bg-sky-500/10 hover:border-sky-500/50 rounded-lg font-medium transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Sửa blueprint"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteBlueprintConfirm({ show: true, blueprintId: bp.id })}
                        className="btn text-sm px-3 py-2.5 bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 hover:border-rose-500/60 rounded-lg font-medium transition-all opacity-0 group-hover:opacity-100"
                        aria-label="Xóa blueprint"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed top-6 right-6 z-[60]">
          <div
            className={`rounded-xl border px-4 py-3 shadow-xl backdrop-blur ${toastClasses[toast.variant]}`}
            role="status"
            aria-live="polite"
          >
            <div className="flex items-start gap-3">
              <div className="text-sm font-medium">{toast.message}</div>
              <button
                onClick={dismissToast}
                className="ml-auto text-lg leading-none text-white/70 hover:text-white"
                aria-label="Đóng thông báo"
              >
                ×
              </button>
            </div>
          </div>
        </div>
      )}

      {studentDetailModal.show && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-white">Chi tiết điểm</h3>
                <p className="text-sm text-slate-400">
                  {studentDetailModal.studentName} ({studentDetailModal.mssv})
                </p>
              </div>
              <button
                onClick={() => setStudentDetailModal((prev) => ({ ...prev, show: false }))}
                className="text-slate-300 hover:text-white text-xl"
                aria-label="Đóng"
              >
                ×
              </button>
            </div>

            {studentDetailModal.loading ? (
              <div className="py-8 text-center text-slate-400">Đang tải...</div>
            ) : studentDetailModal.data ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-400 mb-1">Điểm số</p>
                    <p className="text-3xl font-bold text-sky-400">
                      {studentDetailModal.data.finalScore}
                    </p>
                  </div>
                  <div className="bg-white/5 rounded-lg p-4 text-center">
                    <p className="text-sm text-slate-400 mb-1">Số câu đúng</p>
                    <p className="text-3xl font-bold text-emerald-400">
                      {studentDetailModal.data.correctCount}/{studentDetailModal.data.totalQuestions}
                    </p>
                  </div>
                </div>

                <div className="bg-white/5 rounded-lg p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Tổng điểm câu hỏi:</span>
                    <span className="text-white">{studentDetailModal.data.totalQuestionPoint}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-400">Điểm đạt được:</span>
                    <span className="text-emerald-400 font-semibold">
                      {studentDetailModal.data.studentEarnedPoint}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setStudentDetailModal((prev) => ({ ...prev, show: false }))}
                  className="w-full btn btn-primary py-2 rounded-lg"
                >
                  Đóng
                </button>
              </div>
            ) : (
              <div className="py-8 text-center text-rose-400">Không thể tải dữ liệu</div>
            )}
          </div>
        </div>
      )}

      {showBlueprintModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-2xl shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold text-white">
                  {editingBlueprintId ? 'Sửa Cấu Trúc Đề' : 'Tạo Cấu Trúc Đề'}
                </h3>
                <p className="text-sm text-slate-400">
                  Môn: {classDetail?.subject?.name || `Môn #${classDetail?.subjectId ?? 'N/A'}`}
                </p>
              </div>
              <button
                onClick={() => setShowBlueprintModal(false)}
                className="text-slate-300 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            {blueprintError && (
              <div className="text-rose-200 text-sm border border-rose-400/40 bg-rose-500/10 rounded-lg p-3">
                {blueprintError}
              </div>
            )}

            <div className="space-y-4">
              {blueprintForm.chapters.map((chapter, idx) => (
                <div key={idx} className="bg-white/5 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-semibold text-white">Chương {chapter.chapter}</h4>
                    {blueprintForm.chapters.length > 1 && (
                      <button
                        onClick={() => {
                          const newChapters = blueprintForm.chapters.filter((_, i) => i !== idx);
                          setBlueprintForm((prev) => ({ ...prev, chapters: newChapters }));
                        }}
                        className="text-rose-400 hover:text-rose-300 text-sm"
                      >
                        × Xóa
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Dễ</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-sm"
                        value={chapter.easyCount}
                        onChange={(e) => {
                          const newChapters = [...blueprintForm.chapters];
                          newChapters[idx].easyCount = Number(e.target.value);
                          setBlueprintForm((prev) => ({ ...prev, chapters: newChapters }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Trung bình</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-sm"
                        value={chapter.mediumCount}
                        onChange={(e) => {
                          const newChapters = [...blueprintForm.chapters];
                          newChapters[idx].mediumCount = Number(e.target.value);
                          setBlueprintForm((prev) => ({ ...prev, chapters: newChapters }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Khó</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-sm"
                        value={chapter.hardCount}
                        onChange={(e) => {
                          const newChapters = [...blueprintForm.chapters];
                          newChapters[idx].hardCount = Number(e.target.value);
                          setBlueprintForm((prev) => ({ ...prev, chapters: newChapters }));
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-400 mb-1">Rất khó</label>
                      <input
                        type="number"
                        min="0"
                        className="w-full px-2 py-1.5 rounded bg-white/5 border border-white/10 text-white text-sm"
                        value={chapter.veryHardCount}
                        onChange={(e) => {
                          const newChapters = [...blueprintForm.chapters];
                          newChapters[idx].veryHardCount = Number(e.target.value);
                          setBlueprintForm((prev) => ({ ...prev, chapters: newChapters }));
                        }}
                      />
                    </div>
                  </div>

                  <p className="text-xs text-slate-400">
                    Tổng: {chapter.easyCount + chapter.mediumCount + chapter.hardCount + chapter.veryHardCount} câu
                  </p>
                </div>
              ))}

              <button
                onClick={() => {
                  const nextChapter = blueprintForm.chapters.length + 1;
                  setBlueprintForm((prev) => ({
                    ...prev,
                    chapters: [
                      ...prev.chapters,
                      { chapter: nextChapter, easyCount: 0, mediumCount: 0, hardCount: 0, veryHardCount: 0 }
                    ]
                  }));
                }}
                className="text-sm text-sky-400 hover:text-sky-300"
              >
                + Thêm chương
              </button>

              <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-3">
                <p className="text-sm text-sky-300">
                  Tổng số câu hỏi:{' '}
                  {blueprintForm.chapters.reduce(
                    (sum, ch) => sum + ch.easyCount + ch.mediumCount + ch.hardCount + ch.veryHardCount,
                    0
                  )}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowBlueprintModal(false)}
                className="btn btn-ghost px-4 py-2 border border-white/20"
                disabled={creatingBlueprint}
              >
                Hủy
              </button>
              <button
                onClick={handleCreateBlueprint}
                className="btn btn-primary px-4 py-2"
                disabled={creatingBlueprint}
              >
                {creatingBlueprint
                  ? (editingBlueprintId ? 'Đang cập nhật...' : 'Đang tạo...')
                  : (editingBlueprintId ? 'Cập nhật Blueprint' : 'Tạo Blueprint')
                }
              </button>
            </div>
          </div>
        </div>
      )}

      {activeSection === 'reports' && (
        <TeacherClassReports
          classId={numericClassId}
          className={classDetail?.name || ''}
          exams={selectedClassExams}
          students={selectedClassStudents}
        />
      )}

      {/* Modal tạo kỳ thi */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-white/10 rounded-xl p-6 w-full max-w-lg shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">
                {editingExamId ? 'Cập nhật kỳ thi' : 'Tạo kỳ thi'}
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-slate-300 hover:text-white"
                aria-label="Đóng"
              >
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
                  <label className="block text-sm text-slate-300 mb-1">Cấu trúc đề</label>
                  <select
                    className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white"
                    value={createForm.blueprintId}
                    onChange={(e) => {
                      const bpId = Number(e.target.value);
                      setCreateForm((f) => ({ ...f, blueprintId: bpId }));
                      handleSelectBlueprint(bpId);
                    }}
                  >
                    <option value={0}>-- Chọn Blueprint --</option>
                    {availableBlueprints.map((bp) => (
                      <option key={bp.id} value={bp.id}>
                        Blueprint #{bp.id} ({bp.totalQuestions || '?'} câu) -{' '}
                        {new Date(bp.createdAt).toLocaleDateString('vi-VN')}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedBlueprintDetail && (
                <div className="bg-sky-500/10 border border-sky-500/30 rounded-lg p-4 space-y-2">
                  <h4 className="text-sm font-semibold text-sky-300">
                    Chi tiết Blueprint #{selectedBlueprintDetail.id}
                  </h4>
                  {selectedBlueprintDetail.chapters && selectedBlueprintDetail.chapters.length > 0 ? (
                    <div className="space-y-1">
                      {selectedBlueprintDetail.chapters.map((ch, idx) => (
                        <p key={idx} className="text-xs text-slate-300">
                          • Chương {ch.chapter}:
                          {ch.easyCount > 0 && ` ${ch.easyCount} Dễ`}
                          {ch.mediumCount > 0 && ` ${ch.mediumCount} TB`}
                          {ch.hardCount > 0 && ` ${ch.hardCount} Khó`}
                          {ch.veryHardCount > 0 && ` ${ch.veryHardCount} RKhó`}
                        </p>
                      ))}
                      <p className="text-sm text-sky-400 font-semibold pt-2">
                        Tổng: {selectedBlueprintDetail.totalQuestions} câu
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400">Đang tải chi tiết...</p>
                  )}
                </div>
              )}

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
                {creating ? (editingExamId ? 'Đang cập nhật...' : 'Đang tạo...') : (editingExamId ? 'Cập nhật' : 'Tạo kỳ thi')}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm.show && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-rose-500/30 rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Xác nhận xóa kỳ thi</h3>
              <button
                onClick={() => setDeleteConfirm({ show: false, examId: null, examName: '' })}
                className="text-slate-300 hover:text-white"
                aria-label="Đóng"
                disabled={deleting}
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-slate-300 text-sm">
                Bạn có chắc chắn muốn xóa kỳ thi <span className="font-semibold text-white">"{deleteConfirm.examName}"</span> không?
              </p>
              <p className="text-rose-300 text-sm border border-rose-400/40 bg-rose-500/10 rounded-lg p-3">
                ⚠️ Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến kỳ thi sẽ bị xóa.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteConfirm({ show: false, examId: null, examName: '' })}
                className="btn btn-ghost text-sm px-4 py-2 border border-white/20 text-slate-300 hover:text-white rounded-lg"
                disabled={deleting}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteExam}
                disabled={deleting}
                className="btn btn-ghost text-sm px-4 py-2 border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/50 rounded-lg disabled:opacity-50"
              >
                {deleting ? 'Đang xóa...' : 'Xóa kỳ thi'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteBlueprintConfirm.show && (
        <div className="fixed inset-0 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-slate-900 border border-rose-500/30 rounded-xl p-6 w-full max-w-md shadow-xl space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold text-white">Xác nhận xóa Blueprint</h3>
              <button
                onClick={() => setDeleteBlueprintConfirm({ show: false, blueprintId: null })}
                className="text-slate-300 hover:text-white"
                aria-label="Đóng"
                disabled={deletingBlueprint}
              >
                ×
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-slate-300 text-sm">
                Bạn có chắc chắn muốn xóa <span className="font-semibold text-white">Blueprint #{deleteBlueprintConfirm.blueprintId}</span> không?
              </p>
              <p className="text-rose-300 text-sm border border-rose-400/40 bg-rose-500/10 rounded-lg p-3">
                ⚠️ Hành động này không thể hoàn tác. Blueprint sẽ bị xóa vĩnh viễn.
              </p>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteBlueprintConfirm({ show: false, blueprintId: null })}
                className="btn btn-ghost text-sm px-4 py-2 border border-white/20 text-slate-300 hover:text-white rounded-lg"
                disabled={deletingBlueprint}
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteBlueprint}
                disabled={deletingBlueprint}
                className="btn btn-ghost text-sm px-4 py-2 border border-rose-500/30 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20 hover:border-rose-500/50 rounded-lg disabled:opacity-50"
              >
                {deletingBlueprint ? 'Đang xóa...' : 'Xóa Blueprint'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherClassDetail;
