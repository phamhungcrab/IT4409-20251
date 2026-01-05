import { Link } from 'react-router-dom';

const ContactPage = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800 dark:text-white">
        Liên hệ
      </h1>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Thông tin liên hệ
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🏫</span>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Địa chỉ</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Đại học Bách khoa Hà Nội<br />
                Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">📧</span>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Email</h3>
              <p className="text-gray-600 dark:text-gray-300">
                support@hust.edu.vn
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <span className="text-2xl">📞</span>
            <div>
              <h3 className="font-semibold text-gray-700 dark:text-gray-200">Điện thoại</h3>
              <p className="text-gray-600 dark:text-gray-300">
                (024) 3869 2243
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Hỗ trợ kỹ thuật
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Nếu bạn gặp vấn đề khi sử dụng Hệ thống Thi Trực Tuyến HUST, vui lòng liên hệ:
        </p>
        <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-300">
          <li>Sinh viên: Liên hệ phòng Đào tạo hoặc giảng viên phụ trách môn học</li>
          <li>Giảng viên: Liên hệ bộ phận IT của khoa/viện</li>
          <li>Vấn đề kỹ thuật: Email đến địa chỉ support</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700 dark:text-gray-200">
          Góp ý & Phản hồi
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Chúng tôi luôn lắng nghe ý kiến đóng góp để cải thiện hệ thống.
          Mọi góp ý xin gửi về email hỗ trợ hoặc thông qua giảng viên phụ trách.
        </p>
      </section>

      <div className="flex gap-4 mt-8">
        <Link
          to="/login"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Đăng nhập
        </Link>
        <Link
          to="/about"
          className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Giới thiệu
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

export default ContactPage;
