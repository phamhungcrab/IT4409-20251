import { Link } from 'react-router-dom';

const AboutPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Giới thiệu Hệ thống Thi Trực Tuyến HUST
      </h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Về chúng tôi
        </h2>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4">
          Hệ thống Thi Trực Tuyến HUST (Online Examination System) là nền tảng thi cử trực tuyến
          được phát triển dành riêng cho sinh viên và giảng viên Đại học Bách khoa Hà Nội.
          Hệ thống được xây dựng với mục tiêu hiện đại hóa quy trình kiểm tra đánh giá,
          mang lại trải nghiệm thi cử thuận tiện và công bằng.
        </p>
        <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
          Với công nghệ tiên tiến và giao diện thân thiện, hệ thống hỗ trợ tổ chức các kỳ thi
          trắc nghiệm trực tuyến một cách hiệu quả, bảo mật và chính xác.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Tính năng chính
        </h2>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
          <li>Thi trắc nghiệm trực tuyến với giao diện thân thiện</li>
          <li>Quản lý ngân hàng câu hỏi theo chương và độ khó</li>
          <li>Tự động tạo đề thi ngẫu nhiên</li>
          <li>Chấm điểm tự động và thống kê chi tiết</li>
          <li>Giám sát thời gian thực và chống gian lận</li>
          <li>Hỗ trợ đa nền tảng (PC, tablet, mobile)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Đối tượng sử dụng
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-2">Sinh viên</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Làm bài thi trực tuyến, xem kết quả và theo dõi tiến độ học tập.
            </p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
            <h3 className="font-semibold text-green-700 dark:text-green-300 mb-2">Giảng viên</h3>
            <p className="text-gray-600 dark:text-gray-300 text-sm">
              Tạo đề thi, quản lý lớp học và chấm điểm sinh viên.
            </p>
          </div>
        </div>
      </section>

      <div className="flex gap-4 mt-8">
        <Link
          to="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Đăng nhập
        </Link>
        <Link
          to="/contact"
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Liên hệ
        </Link>
        <Link
          to="/"
          className="px-6 py-2 text-gray-600 dark:text-gray-300 hover:underline"
        >
          ← Trang chủ
        </Link>
      </div>
    </div>
  );
};

export default AboutPage;
