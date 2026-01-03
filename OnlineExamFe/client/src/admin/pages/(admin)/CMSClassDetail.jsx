import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CommonButton } from "../../components/Button";
import { DataTable } from "../../components/DataTable";
import { getStudentsOfClass } from "../../services/(admin)/ClassApi";

const CMSClassDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [classInfo, setClassInfo] = useState(null);
  const [students, setStudents] = useState([]);

  const fetchData = async () => {
    try {

      // const classRes = await getClassById(id);
      // setClassInfo(classRes.data);

      const studentRes = await getStudentsOfClass(id);
      const list = studentRes.data || [];
      setStudents(list);
    } catch (error) {
      console.error("Lá»—i táº£i chi tiáº¿t lá»›p:", error);
    }
  };

  const studentColumns = [
    {
      header: "STT",
      accessor: "id",
    },
    {
      header: "MÃ£ sá»‘ sinh viÃªn",
      accessor: "mssv"
    },
    {
      header: "Há» tÃªn",
      accessor: "fullName"
    },
    {
      header: "Email",
      accessor: "email"
    }
  ];

  const studentActions = [
    {
      label: "XÃ³a",
      color: "red",
      onClick: (student) => alert(student.id)
    }
  ];


  useEffect(() => {
    fetchData();
  }, [id]);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1"
        >
          â† Quay láº¡i
        </button>
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Chi tiáº¿t lá»›p há»c
      </h1>




      {/* <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">ThÃ´ng tin lá»›p</h2>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">TÃªn lá»›p</p>
            <p className="font-medium">{classInfo.name}</p>
          </div>

          <div>
            <p className="text-gray-500">Há»c pháº§n</p>
            <p className="font-medium">{classInfo.subjectId}</p>
          </div>

          <div>
            <p className="text-gray-500">Giáº£ng viÃªn</p>
            <p className="font-medium">{classInfo.teacherId}</p>
          </div>

          <div>
            <p className="text-gray-500">Sá»‘ sinh viÃªn</p>
            <p className="font-medium">{students.length}</p>
          </div>
        </div>
      </div> */}

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          Danh sÃ¡ch sinh viÃªn
        </h2>

        <DataTable
          columns={studentColumns}
          data={students}
          actions={studentActions}
        />

      </div>
    </div>
  );
};

export default CMSClassDetail


