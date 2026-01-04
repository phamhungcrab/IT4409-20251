import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useAuth from '../hooks/useAuth';

/**
 * Kiểu dữ liệu state khi điều hướng sang /login từ RoleGuard.
 *
 * RoleGuard thường điều hướng kiểu:
 * <Navigate to="/login" state={{ from: location }} replace />
 *
 * => Ở LoginPage, location.state sẽ có thể chứa:
 * - from.pathname: đường dẫn người dùng đang muốn vào (vd: "/results/16")
 */
type LoginLocationState = {
  from?: {
    pathname?: string;
  };
};

// Khai báo component LoginPage theo Function Component
const LoginPage: React.FC = () => {
  /**
   * useNavigate():
   * - Hook của react-router-dom giúp “chuyển trang” bằng code.
   * - Ví dụ: navigate('/exams') sẽ chuyển sang trang /exams
   */
  const navigate = useNavigate();

  /**
   * useLocation():
   * - Cho biết thông tin “đang ở đâu” và đặc biệt là location.state.
   * - location.state dùng để nhận dữ liệu “gửi kèm” khi điều hướng.
   */
  const location = useLocation();

  /**
   * useTranslation():
   * - Hook của i18next.
   * - Trả về hàm t('key') để lấy chữ theo ngôn ngữ hiện tại.
   */
  const { t } = useTranslation();

  /**
   * useAuth():
   * - Custom hook (hook tự viết) quản lý đăng nhập/đăng xuất.
   * - Ở đây dùng login() để gọi khi submit form.
   */
  const { login } = useAuth();

  /**
   * useState():
   * - Là hook để “lưu trạng thái” (state) trong component.
   * - Khi state thay đổi, React sẽ render lại giao diện.
   */
  const [email, setEmail] = useState(''); // Lưu email người dùng nhập
  const [password, setPassword] = useState(''); // Lưu mật khẩu người dùng nhập
  const [showPassword, setShowPassword] = useState(false); // Bật/tắt hiển thị mật khẩu
  const [error, setError] = useState<string | null>(null); // Lưu lỗi để hiển thị lên UI
  const [loading, setLoading] = useState(false); // Trạng thái đang xử lý login hay không

  /**
   * Xác định trang cần quay lại sau khi login.
   *
   * - Nếu người dùng bị RoleGuard chặn và bị đưa về /login:
   *   location.state.from.pathname sẽ là trang mà họ muốn vào.
   *
   * - Nếu không có from (vào login trực tiếp):
   *   ta sẽ điều hướng theo role sau khi đăng nhập.
   */
  const fromPath =
    (location.state as LoginLocationState | null)?.from?.pathname || '';

  /**
   * handleSubmit:
   * - Hàm xử lý khi người dùng bấm nút "Đăng nhập" (submit form).
   * - async/await: giúp viết code bất đồng bộ (gọi API) giống như tuần tự.
   *
   * Khái niệm “bất đồng bộ” (async):
   * - Gọi API cần thời gian chờ.
   * - Trong thời gian chờ, giao diện vẫn hoạt động.
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    /**
     * preventDefault():
     * - Form HTML mặc định sẽ reload trang khi submit.
     * - Trong SPA (React), ta chặn reload để xử lý bằng JavaScript.
     */
    e.preventDefault();

    // Reset lỗi trước khi xử lý
    setError(null);

    // Validate đơn giản: thiếu email hoặc password thì báo lỗi
    if (!email || !password) {
      setError(t('auth.loginFailed')); // bạn có thể tạo key riêng: auth.missingFields
      return;
    }

    try {
      // Bật loading để disable nút và hiển thị “đang tải”
      setLoading(true);

      /**
       * Thu thập thông tin thiết bị (dùng cho logging/giám sát).
       *
       * userAgent:
       * - Chuỗi mô tả trình duyệt + hệ điều hành (Chrome/Windows/iOS...)
       *
       * deviceId:
       * - Ở đây đang “tự chế” 1 chuỗi tương đối ổn định.
       * - Lưu ý: cách này KHÔNG phải định danh thiết bị chuẩn (có thể thay đổi),
       *   chỉ phù hợp để log tương đối.
       */
      const userAgent = navigator.userAgent;
      const deviceId = `device-${navigator.platform}-${navigator.language}-${screen.width}x${screen.height}`;

      /**
       * Lấy IP public (nếu được):
       * - Trình duyệt không dễ lấy IP public trực tiếp.
       * - Bạn đang gọi 1 dịch vụ bên ngoài (ipify) để lấy IP.
       *
       * Lưu ý quan trọng cho người mới:
       * - Có thể thất bại do mạng, do CORS, hoặc do policy của trình duyệt.
       * - Nếu thất bại thì vẫn login bình thường (không chặn luồng).
       */
      let ipAddress = 'Unknown IP';
      try {
        const ipRes = await fetch('https://api.ipify.org?format=json').catch(() => null);
        if (ipRes && ipRes.ok) {
          const ipData = await ipRes.json();
          ipAddress = ipData.ip;
        }
      } catch {
        // Không làm gì: lỗi IP không ảnh hưởng login
      }

      /**
       * Gọi login() từ useAuth:
       * - Thường sẽ gọi API backend để xác thực.
       * - Nếu thành công: backend trả token + user, FE lưu lại (localStorage/context).
       * - Nếu thất bại: throw error => rơi vào catch.
       */
      await login({
        email,
        password,
        userAgent,
        deviceId,
        ipAddress,
      });

      /**
       * Lấy role để điều hướng.
       *
       * Cách “đẹp” hơn: login() nên trả về user (hoặc useAuth có user ngay).
       * Nhưng vì bạn đang đọc từ localStorage, ta giữ nguyên theo hệ thống hiện tại.
       */
      const stored = localStorage.getItem('user');
      let role = '';
      if (stored) {
        try {
          role = JSON.parse(stored)?.role ?? '';
        } catch {
          role = '';
        }
      }

      /**
       * Điều hướng sau login:
       *
       * Ưu tiên 1: nếu có fromPath (đến từ RoleGuard) => quay lại đúng trang bị chặn.
       * Ưu tiên 2: nếu không có fromPath => điều hướng theo role.
       *
       * replace: true
       * - Giúp người dùng bấm “Back” không quay lại /login nữa.
       */
      if (fromPath) {
        navigate(fromPath, { replace: true });
        return;
      }

      // Tất cả user (Teacher và Student) đều về trang chủ
      navigate('/', { replace: true });
    } catch (err) {
      /**
       * catch:
       * - Nếu login() thất bại (sai mật khẩu, lỗi mạng, lỗi server...)
       * - Ta setError để hiển thị lên UI.
       */
      setError(t('auth.loginFailed'));
      console.error(err);
    } finally {
      /**
       * finally:
       * - Dù thành công hay thất bại, luôn tắt loading.
       * - Tránh UI bị “kẹt” ở trạng thái loading.
       */
      setLoading(false);
    }
  };

  return (
    // Khung ngoài: chiếm toàn bộ chiều cao màn hình, canh giữa nội dung
    <div className="min-h-screen flex items-center justify-center px-4">
      {/* Thẻ bao: card login, chia 2 cột (trái: giới thiệu, phải: form).
          Màn hình nhỏ: 1 cột; từ md trở lên: 2 cột. */}
      <div className="grid w-full max-w-4xl grid-cols-1 overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl shadow-slate-900/50 md:grid-cols-2">
        {/* Cột trái: giới thiệu (ẩn trên mobile) */}
        <div className="relative hidden bg-gradient-to-br from-sky-600 via-blue-700 to-slate-900 p-8 text-white md:flex md:flex-col">
          {/* Lớp nền trang trí (không liên quan logic) */}
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.2),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(255,255,255,0.2),transparent_35%)]" />

          <div className="relative z-10 space-y-4">
            <p className="text-sm uppercase tracking-[0.35em] text-white/80">
              Online Exam
            </p>

            {/* Bạn có thể đưa các text này vào i18n để đa ngôn ngữ */}
            <h2 className="text-3xl font-semibold leading-tight">
              Đăng nhập an toàn cho sinh viên và cán bộ giảng viên
            </h2>

            <p className="text-sm text-white/90">
              Truy cập bài thi, theo dõi tiến độ và cập nhật thông báo mới trong một không gian làm việc tập trung.
            </p>

            <div className="flex gap-2 flex-wrap pt-2">
              <span className="tag bg-white/10 border-white/20 text-white">Đồng bộ thời gian thực</span>
              <span className="tag bg-white/10 border-white/20 text-white">Hỗ trợ giám sát thi</span>
              <span className="tag bg-white/10 border-white/20 text-white">Đa ngôn ngữ</span>
            </div>
          </div>
        </div>

        {/* Cột phải: form đăng nhập */}
        <div className="p-8 space-y-6">
          {/* Tiêu đề form */}
          <div>
            <p className="text-sm text-slate-300">{t('auth.welcomeBack')}</p>
            <h1 className="text-2xl font-semibold text-white">{t('auth.loginTitle')}</h1>
          </div>

          {/* Hiển thị lỗi nếu có */}
          {error && (
            <div className="border border-rose-400/40 bg-rose-500/10 text-rose-100 px-4 py-3 rounded-xl">
              {error}
            </div>
          )}

          {/* Form: submit sẽ gọi handleSubmit */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email (input điều khiển - controlled input) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                {t('auth.email')}
              </label>

              <input
                type="email"
                className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none placeholder:text-slate-400"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="name@example.com"
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-200">
                {t('auth.password')}
              </label>

              <div className="relative">
                <input
                  // showPassword = true => hiển thị dạng text; false => ẩn dạng password
                  type={showPassword ? 'text' : 'password'}
                  className="w-full px-3 py-2 bg-white text-slate-900 rounded-lg focus:ring-2 focus:ring-sky-500 outline-none placeholder:text-slate-400 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                />

                {/* Nút bật/tắt hiển thị mật khẩu */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showPassword ? (
                    // Icon ẩn mật khẩu
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
                    // Icon hiện mật khẩu
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

            {/* Nút đăng nhập */}
            <button
              type="submit"
              className="w-full btn btn-primary text-base hover:-translate-y-0.5"
              disabled={loading}
            >
              {loading ? t('common.loading') : t('auth.loginButton')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
