import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';

// Khai báo component LoginPage dạng Function Component
const LoginPage: React.FC = () => {
  // useNavigate: hook của react-router-dom dùng để điều hướng (chuyển trang) bằng code
  const navigate = useNavigate();

  // useTranslation: hook của i18next, trả về hàm `t` để lấy text theo key đa ngôn ngữ
  const { t } = useTranslation();

  // useAuth: hook tự viết, quản lý logic đăng nhập/đăng xuất.
  // Từ hook này ta lấy ra hàm login để gọi khi người dùng submit form.
  const { login } = useAuth();

  // State lưu giá trị email người dùng nhập
  const [email, setEmail] = useState('');

  // State lưu password người dùng nhập
  const [password, setPassword] = useState('');

  // State để xác định có hiển thị password dạng text hay không (true = show, false = ẩn)
  const [showPassword, setShowPassword] = useState(false);

  // State lưu thông báo lỗi (nếu có). null nghĩa là không có lỗi.
  const [error, setError] = useState<string | null>(null);

  // State cho biết form đang trong trạng thái "loading" (đợi API login trả về) hay không
  const [loading, setLoading] = useState(false);

  /**
   * Hàm xử lý khi form được submit.
   * - e: là sự kiện submit form (React.FormEvent).
   * - e.preventDefault(): chặn hành vi reload trang mặc định của form.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError(t('auth.loginFailed'));
      return;
    }

    try {
      setLoading(true);

      // Thu thập thông tin thiết bị
      const userAgent = navigator.userAgent;
      const deviceId = `device-${navigator.platform}-${navigator.language}-${screen.width}x${screen.height}`;

      // Lấy IP nếu có thể, hoặc dùng placeholder
      let ipAddress = 'Unknown IP';
      try {
        // Thử lấy IP public (nếu có mạng internet và không bị chặn CORS)
        // Nếu thất bại thì vẫn login bình thường
        const ipRes = await fetch('https://api.ipify.org?format=json').catch(() => null);
        if (ipRes && ipRes.ok) {
           const ipData = await ipRes.json();
           ipAddress = ipData.ip;
        }
      } catch {
        // Ignore error
      }

      await login({
        email,
        password,
        userAgent,
        deviceId,
        ipAddress: ipAddress
      });

      const stored = localStorage.getItem('user');
      let role = '';
      if (stored) {
        try {
          role = JSON.parse(stored)?.role ?? '';
        } catch {
          role = '';
        }
      }

      if (role === 'Admin') {
        navigate('/admin');
      } else if (role === 'Teacher') {
        navigate('/');
      } else {
        navigate('/exams');
      }
    } catch (err) {
      setError(t('auth.loginFailed'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Khung ngoài: chiếm toàn bộ chiều cao màn hình, canh giữa nội dung
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Thẻ bao: card login, chia 2 cột (trái: giới thiệu, phải: form).
          Ở màn hình nhỏ (mobile) sẽ là 1 cột, màn hình md trở lên mới chia 2 cột. */}
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-slate-900/50 md:grid-cols-2">
        {/* Cột bên trái: phần giới thiệu (hidden trên mobile, chỉ hiện trên md trở lên) */}
        <div className="relative hidden bg-gradient-to-br from-sky-600 via-blue-700 to-slate-900 p-8 text-white md:flex md:flex-col">
          {/* Lớp phủ background với hiệu ứng gradient nhẹ để trang trí */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.2),transparent_35%)]" />
          <div className="relative z-10 space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-white/80">
              Online Exam
            </p>
            <h2 className="text-3xl font-semibold leading-tight">
              Secure sign-in for students and staff
            </h2>
            <p className="text-sm text-white/90">
              Access your exams, track progress, and stay updated with the latest announcements in a focused workspace.
            </p>
            <div className="flex gap-2 flex-wrap pt-2">
              {/* Các tag nhỏ mô tả tính năng (chỉ là UI, không có logic) */}
              <span className="tag bg-white/10 border-white/20 text-white">Real-time sync</span>
              <span className="tag bg-white/10 border-white/20 text-white">Proctor ready</span>
              <span className="tag bg-white/10 border-white/20 text-white">Multi-language</span>
            </div>
          </div>
        </div>

        {/* Cột bên phải: form đăng nhập */}
        <div className="p-8 space-y-6">
          {/* Phần tiêu đề nhỏ phía trên form */}
          <div>
            {/* Dòng chữ chào lại, lấy từ i18n nếu có, nếu không thì fallback 'Welcome back' */}
            <p className="text-sm text-slate-300">
              {t('auth.welcomeBack')}
            </p>
            <h1 className="text-2xl font-semibold text-white">
              {t('auth.loginTitle')}
            </h1>
          </div>

          {/* Nếu state error có giá trị thì hiển thị khung báo lỗi */}
          {error && (
            <div className="border border-rose-400/40 bg-rose-500/10 text-rose-100 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Form đăng nhập. onSubmit gọi tới handleSubmit ở trên */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nhóm input email */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                {t('auth.email')}
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none placeholder:text-slate-400"
                value={email}                           // value gắn với state email
                onChange={(e) => setEmail(e.target.value)} // mỗi lần gõ sẽ cập nhật state
                required                                // bắt buộc phải nhập
                placeholder="name@example.com"          // gợi ý định dạng email
              />
            </div>

            {/* Nhóm input password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                {t('auth.password')}
              </label>
              <div className="relative">
                <input
                  // Nếu showPassword = true thì type="text", ngược lại type="password"
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none placeholder:text-slate-400 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />
                {/* Nút bật/tắt chế độ hiển thị password (mắt mở / mắt đóng) */}
                <button
                  type="button" // type="button" để bấm không submit form
                  onClick={() => setShowPassword(!showPassword)} // đảo ngược trạng thái showPassword
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? (
                    // Icon "mắt bị gạch" (ẩn mật khẩu)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                      />
                    </svg>
                  ) : (
                    // Icon "mắt mở" (hiển thị mật khẩu)
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Nút submit form */}
            <button
              type="submit"
              className="w-full btn btn-primary text-base hover:-translate-y-0.5"
              disabled={loading} // Khi loading=true sẽ disable nút để tránh bấm nhiều lần
            >
              {/* Nếu loading thì hiện text loading, ngược lại hiện text login */}
              {loading ? t('common.loading') : t('auth.loginButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
