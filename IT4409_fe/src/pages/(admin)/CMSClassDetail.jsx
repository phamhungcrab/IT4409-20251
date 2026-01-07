import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { DataTable } from "../../components/DataTable";
import { getClassDetail, getStudentsOfClass } from "../../services/(admin)/ClassApi";

const CMSClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);
  const [activeTab, setActiveTab] = useState("students");

  const fetchData = async () => {
    try {
      const classRes = await getClassDetail(id);
      setClassInfo(classRes.data);

      const studentRes = await getStudentsOfClass(id);
      setStudents(studentRes.data || []);
    } catch (error) {
      console.error("Lỗi tải chi tiết lớp:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const studentColumns = [
    { header: "STT", accessor: "id" },
    { header: "MSSV", accessor: "mssv" },
    { header: "Họ tên", accessor: "fullName" },
    { header: "Email", accessor: "email" }
  ];

  const examColumns = [
    { header: "ID", accessor: "id" },
    { header: "Tên bài kiểm tra", accessor: "name" },
    {
      header: "Thời lượng",
      accessor: "durationMinutes",
      render: (row) => `${row.durationMinutes} phút`
    },
    {
      header: "Thời gian bắt đầu",
      accessor: "startTime",
      render: (row) => new Date(row.startTime).toLocaleString("vi-VN")
    },
    {
      header: "Thời gian kết thúc",
      accessor: "endTime",
      render: (row) => new Date(row.startTime).toLocaleString("vi-VN")
    },
  ];

  const examActions = [
    {
      label: "Chi tiết",
      color: "gray",
      onClick: (exam) => navigate(`/results/${exam.id}`)
    }
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
        >
          ← Quay lại
        </button>
      </div>

      {classInfo && (<h1 className="text-3xl font-bold text-gray-800 mb-6">{classInfo.name}</h1>)}

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4 text-blue-600">Thông tin lớp học</h2>
        {classInfo && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
            <div>
              <p className="text-gray-400 uppercase text-xs font-bold">Học phần</p>
              <p className="font-medium">{classInfo.subject?.name}</p>
            </div>
            <div>
              <p className="text-gray-400 uppercase text-xs font-bold">Giảng viên</p>
              <p className="font-medium">{classInfo.teacher?.fullName}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex space-x-1 border-b border-gray-200 mb-6">
        <button
          onClick={() => setActiveTab("students")}
          className={`py-2 px-6 text-sm font-medium transition-all ${activeTab === "students"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500 hover:bg-gray-100"
            }`}
        >
          Sinh viên ({students.length})
        </button>
        <button
          onClick={() => setActiveTab("exams")}
          className={`py-2 px-6 text-sm font-medium transition-all ${activeTab === "exams"
            ? "border-b-2 border-blue-600 text-blue-600"
            : "text-gray-500 hover:bg-gray-100"
            }`}
        >
          Bài kiểm tra ({classInfo?.exams?.length || 0})
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {activeTab === "students" ? (
          <div>
            <h2 className="text-lg font-semibold mb-4">Danh sách sinh viên</h2>
            <DataTable
              columns={studentColumns}
              data={students}
            />
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold mb-4">Danh sách bài kiểm tra</h2>
            <DataTable
              columns={examColumns}
              data={classInfo?.exams || []}
              actions={examActions}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default CMSClassDetail;