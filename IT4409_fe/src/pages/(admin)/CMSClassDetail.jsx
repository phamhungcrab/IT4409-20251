import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import {
  getClassDetail,
  getStudentsOfClass,
  updateClass,
  addStudentToClass,
  removeSingleStudent
} from "../../services/(admin)/ClassApi";
import { getExamStudentStatus } from "../../services/(admin)/ExamApi";
import { Modal } from "../../components/Modal";
import { Form } from "../../components/Form";
import { AddStudentToClassForm } from "../../components/AddStudentToClassForm";
import { getAllUsers } from "../../services/(admin)/UserApi";
import { getAllSubject } from "../../services/(admin)/SubjectApi";
import { CommonButton } from "../../components/Button";
import { AddUserToClassForm } from "../../components/AddUserTabsForm";
import toast from "react-hot-toast";
import { updateExam, deleteExam } from "../../services/(admin)/ExamApi";
import { ConfirmModal } from "../../components/ConfirmModal";


const CMSClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [statsData, setStatsData] = useState([]);
  const [activeTab, setActiveTab] = useState("students");
  const [loadingStats, setLoadingStats] = useState(false);

  const [openEdit, setOpenEdit] = useState(false);
  const [openUploadFile, setOpenUploadFile] = useState(false);
  const [openAddUserTab, setOpenAddUserTab] = useState(false);

  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);

  const [editExamData, setEditExamData] = useState(null);
  const [openEditExam, setOpenEditExam] = useState(false);
  const [deleteExamId, setDeleteExamId] = useState(null);

  const [deleteStudentId, setDeleteStudentId] = useState(null);

  const handleRemoveStudent = async () => {
    try {
      const res = await removeSingleStudent(id, deleteStudentId);
      if (res) {
        toast.success("Đã xóa sinh viên khỏi lớp");
        setDeleteStudentId(null);
        fetchData();
      }
    } catch (error) {
      toast.error("Lỗi khi xóa sinh viên");
    }
  };

  const handleSaveExam = async (formData) => {
    try {
      await updateExam(formData, editExamData.id);
      toast.success("Cập nhật bài thi thành công!");
      setOpenEditExam(false);
      fetchData();
    } catch (error) {
      toast.error("Lỗi khi cập nhật bài thi");
    }
  };

  const confirmDeleteExam = async () => {
    try {
      await deleteExam(deleteExamId);
      toast.success("Đã xóa bài thi");
      setDeleteExamId(null);
      fetchData();
    } catch (error) {
      toast.error("Không thể xóa bài thi này");
    }
  };

  const fetchData = async () => {
    try {
      const [classRes, studentRes] = await Promise.all([
        getClassDetail(id),
        getStudentsOfClass(id)
      ]);
      setClassInfo(classRes.data);
      setStudents(studentRes.data || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu:", error);
    }
  };

  const fetchStatistics = useCallback(async () => {
    if (!classInfo?.exams || classInfo.exams.length === 0) return;
    setLoadingStats(true);
    try {
      const results = await Promise.all(
        classInfo.exams.map(async (exam) => {
          const res = await getExamStudentStatus(exam.id);
          if (!res) return null;

          const submittedStudents = res.students.filter(s => s.status === "COMPLETED");
          const scores = submittedStudents.map(s => s.score);

          return {
            id: exam.id,
            name: exam.name,
            totalStudents: res.students.length,
            submittedCount: submittedStudents.length,
            avgScore: scores.length > 0 ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2) : 0,
            maxScore: scores.length > 0 ? Math.max(...scores) : 0,
            minScore: scores.length > 0 ? Math.min(...scores) : 0,
          };
        })
      );
      setStatsData(results.filter(r => r !== null));
    } catch (error) {
      toast.error("Lỗi khi tải thống kê bài thi");
    } finally {
      setLoadingStats(false);
    }
  }, [classInfo?.exams]);

  useEffect(() => {
    fetchData();
    fetchMetaData();
  }, [id]);

  useEffect(() => {
    if (activeTab === "stats" && statsData.length === 0) {
      fetchStatistics();
    }
  }, [activeTab, fetchStatistics, statsData.length]);

  const fetchMetaData = async () => {
    try {
      const [teacherRes, subjectRes] = await Promise.all([
        getAllUsers(),
        getAllSubject()
      ]);
      setTeachers(teacherRes.map(t => ({ value: t.id, label: t.fullName })));
      setSubjects(subjectRes.map(s => ({ value: s.id, label: `${s.subjectCode} - ${s.name}` })));
    } catch (e) {
      console.error("Lỗi tải metadata:", e);
    }
  };

  const studentColumns = [
    { header: "STT", accessor: "id" },
    { header: "MSSV", accessor: "mssv" },
    { header: "Họ tên", accessor: "fullName" },
    { header: "Email", accessor: "email" }
  ];

  const examColumns = [
    { header: "ID", accessor: "id" },
    { header: "Tên bài kiểm tra", accessor: "name" },
    { header: "Thời lượng", accessor: "durationMinutes", render: (r) => `${r.durationMinutes} phút` },
    {
      header: "Bắt đầu",
      accessor: "startTime",
      render: (r) => new Date(r.startTime).toLocaleString("vi-VN")
    },
  ];

  const statsColumns = [
    { header: "Bài thi", accessor: "name" },
    {
      header: "Tỷ lệ nộp bài",
      accessor: "submittedCount",
      render: (r) => `${r.submittedCount}/${r.totalStudents} (${((r.submittedCount / r.totalStudents) * 100).toFixed(0)}%)`
    },
    { header: "Điểm trung bình", accessor: "avgScore", render: (r) => <span className="font-bold text-blue-600">{r.avgScore}</span> },
    { header: "Cao nhất", accessor: "maxScore", render: (r) => <span className="text-green-600 font-medium">{r.maxScore}</span> },
    { header: "Thấp nhất", accessor: "minScore", render: (r) => <span className="text-red-600 font-medium">{r.minScore}</span> },
  ];

  const handleUpdateClass = async (formData) => {
    try {
      await updateClass(formData, id);
      toast.success("Cập nhật thành công!");
      setOpenEdit(false);
      fetchData();
    } catch (error) {
      toast.error("Lỗi cập nhật lớp học");
    }
  };

  const handleAddUserSubmit = async (payload) => {
    try {
      await addStudentToClass(id, payload);
      toast.success("Đã thêm thành viên!");
      setOpenAddUserTab(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi thêm thành viên");
    }
  };

  const classFields = [
    { name: "name", label: "Tên lớp học", type: "text" },
    { name: "subjectId", label: "Học phần", type: "select", options: subjects },
    { name: "teacherId", label: "Giảng viên", type: "select", options: teachers }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
        >
          ← Quay lại
        </button>

        <div className="flex gap-2">
          <CommonButton label="Sửa lớp" color="outline" onClick={() => setOpenEdit(true)} />
          <CommonButton label="Tải lên file" color="danger" onClick={() => setOpenUploadFile(true)} />
          <CommonButton label="+ Thêm thành viên" color="primary" onClick={() => setOpenAddUserTab(true)} />
        </div>
      </div>

      {classInfo && (
        <div className="mb-6">
          <h1 className="text-2xl font-bold">{classInfo.name}</h1>
          <p className="text-sm text-gray-400">ID: #{id}</p>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border p-6 mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Học phần</p>
          <p className="font-semibold text-gray-800">{classInfo?.subject?.name || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Giảng viên</p>
          <p className="font-semibold text-gray-800">{classInfo?.teacher?.fullName || "—"}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sĩ số</p>
          <p className="font-semibold text-gray-800">{students.length} thành viên</p>
        </div>
      </div>

      <div className="flex space-x-1 border-b mb-6 overflow-x-auto">
        {[
          { id: "students", label: `SINH VIÊN (${students.length})` },
          { id: "exams", label: `BÀI THI (${classInfo?.exams?.length || 0})` },
          { id: "stats", label: `THỐNG KÊ` }
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={`py-3 px-6 text-sm font-bold transition-all whitespace-nowrap ${activeTab === t.id ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-400 hover:text-gray-600"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border p-4">
        {activeTab === "students" && (
          <DataTable columns={studentColumns} data={students} actions={[
            {
              label: "Xóa",
              color: "danger",
              onClick: (st) => setDeleteStudentId(st.id)
            }
          ]} />
        )}

        {activeTab === "exams" && (
          <DataTable
            columns={examColumns}
            data={classInfo?.exams || []}
            actions={[{
              label: "Kết quả",
              color: "gray",
              onClick: (ex) => navigate(`/results/${ex.id}`)
            },
            {
              label: "Sửa",
              color: "primary",
              onClick: (ex) => {
                setEditExamData(ex);
                setOpenEditExam(true);
              }
            },
            {
              label: "Xóa",
              color: "red",
              onClick: (ex) => setDeleteExamId(ex.id)
            }]}
          />
        )}

        {activeTab === "stats" && (
          <>
            {loadingStats ? (
              <div className="py-10 text-center text-gray-500">Đang tính toán dữ liệu thống kê...</div>
            ) : statsData.length > 0 ? (
              <div className="space-y-6">
                <DataTable columns={statsColumns} data={statsData} />
              </div>
            ) : (
              <div className="py-10 text-center text-gray-400 italic">Không có dữ liệu bài thi để thống kê</div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={openEdit} onClose={() => setOpenEdit(false)} title="Sửa thông tin lớp">
        <Form
          fields={classFields}
          initialValues={{
            name: classInfo?.name,
            subjectId: classInfo?.subjectId,
            teacherId: classInfo?.teacherId
          }}
          onSubmit={handleUpdateClass}
          onCancel={() => setOpenEdit(false)}
        />
      </Modal>

      <Modal isOpen={openUploadFile} onClose={() => setOpenUploadFile(false)} title="Import danh sách">
        <AddStudentToClassForm
          classId={id}
          onSuccess={() => { setOpenUploadFile(false); fetchData(); }}
        />
      </Modal>

      <Modal isOpen={openAddUserTab} onClose={() => setOpenAddUserTab(false)} title="Thêm thành viên">
        <AddUserToClassForm
          onSubmit={handleAddUserSubmit}
          onCancel={() => setOpenAddUserTab(false)}
        />
      </Modal>

      <ConfirmModal
        isOpen={!!deleteExamId}
        title="Xác nhận xóa bài thi"
        message="Dữ liệu bài thi này sẽ bị xóa vĩnh viễn."
        onConfirm={confirmDeleteExam}
        onCancel={() => setDeleteExamId(null)}
      />

      <ConfirmModal
        isOpen={!!deleteStudentId}
        title="Xác nhận xóa sinh viên"
        message="Bạn có chắc chắn muốn xóa sinh viên này khỏi lớp học?"
        onConfirm={handleRemoveStudent}
        onCancel={() => setDeleteStudentId(null)}
      />

      <Modal isOpen={openEditExam} onClose={() => setOpenEditExam(false)} title="Chỉnh sửa bài kiểm tra">
        <Form
          fields={[
            { name: "name", label: "Tên bài kiểm tra", type: "text" },
            { name: "durationMinutes", label: "Thời gian (phút)", type: "number" },
            { name: "startTime", label: "Bắt đầu", type: "datetime-local" },
            { name: "endTime", label: "Kết thúc", type: "datetime-local" }
          ]}
          initialValues={{
            ...editExamData,
            startTime: editExamData?.startTime?.substring(0, 16),
            endTime: editExamData?.endTime?.substring(0, 16)
          }}
          onSubmit={handleSaveExam}
          onCancel={() => setOpenEditExam(false)}
        />
      </Modal>
    </div>
  );
};

export default CMSClassDetail;