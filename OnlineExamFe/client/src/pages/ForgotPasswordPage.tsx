import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Email, 2: OTP, 3: New Pass
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Step 1: Gửi OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
        setError('Vui lòng nhập email.');
        return;
    }
    setLoading(true);
    setError(null);
    try {
      await authService.sendOtp({ email });
      setStep(2);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Không thể gửi OTP. Vui lòng kiểm tra email.');
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Xác thực OTP (Optional check) -> Chuyển sang nhập pass
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
        setError('Vui lòng nhập OTP.');
        return;
    }
    setLoading(true);
    setError(null);
    try {
      // Gọi API check OTP để đảm bảo mã đúng trước khi cho nhập pass
      // Backend trả về chuỗi Token (GUID) để dùng cho bước reset
      const token = await authService.checkOtp({ email, otp });
      setResetToken(token);
      setStep(3);
    } catch (err: any) {
      setError('Mã OTP không chính xác hoặc đã hết hạn.');
    } finally {
      setLoading(false);
    }
  };

  // Step 3: Đổi mật khẩu
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
        setError('Vui lòng nhập đầy đủ mật khẩu.');
        return;
    }
    if (password !== confirmPassword) {
        setError('Mật khẩu xác nhận không khớp.');
        return;
    }

    setLoading(true);
    setError(null);
    try {
      await authService.resetPassword({
        email,
        resetCode: resetToken, // Sử dụng Token trả về từ bước CheckOTP
        newPassword: password
      });
      // Success -> Redirect login
      navigate('/login', { state: { message: 'Đổi mật khẩu thành công! Vui lòng đăng nhập.' } });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Đổi mật khẩu thất bại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 bg-[url('/grid.svg')] bg-center relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/30 rounded-full blur-3xl -z-10 animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-sky-500/30 rounded-full blur-3xl -z-10 animate-pulse delay-1000" />

      <div className="w-full max-w-md p-8 glass-card">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">
            {step === 1 && 'Quên mật khẩu?'}
            {step === 2 && 'Nhập mã OTP'}
            {step === 3 && 'Đặt lại mật khẩu'}
          </h1>
          <p className="text-slate-400 text-sm">
            {step === 1 && 'Nhập email của bạn để nhận mã xác thực.'}
            {step === 2 && `Mã xác thực đã được gửi tới ${email}.`}
            {step === 3 && 'Nhập mật khẩu mới cho tài khoản của bạn.'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-sm">
            {error}
          </div>
        )}

        {/* Form Step 1 */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                placeholder="name@example.com"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-2.5 rounded-lg shadow-lg shadow-sky-500/20"
            >
              {loading ? 'Đang gửi...' : 'Gửi mã OTP'}
            </button>
            <div className="text-center pt-2">
              <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                ← Quay lại đăng nhập
              </Link>
            </div>
          </form>
        )}

        {/* Form Step 2 */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Mã OTP</label>
              <input
                type="text"
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors text-center tracking-[0.5em] font-mono text-lg"
                placeholder="••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-2.5 rounded-lg shadow-lg shadow-sky-500/20"
            >
              {loading ? 'Đang kiểm tra...' : 'Xác thực'}
            </button>
            <div className="text-center pt-2 flex justify-between px-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Gửi lại mã?
              </button>
              <Link to="/login" className="text-sm text-slate-400 hover:text-white transition-colors">
                Hủy
              </Link>
            </div>
          </form>
        )}

        {/* Form Step 3 */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Mật khẩu mới</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Xác nhận mật khẩu</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn btn-primary py-2.5 rounded-lg shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 border-emerald-500/50"
            >
              {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
