import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { authService } from '../services/authService';
import useAuth from '../hooks/useAuth';

const ProfilePage: React.FC = () => {
    const { t } = useTranslation();
    const { user } = useAuth(); // Giả sử hook useAuth trả về user info
    // Nếu useAuth chưa trả về đủ info, ta sẽ lấy từ localStorage
    const [userInfo, setUserInfo] = useState<any>(null);

    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState<{ type: 'success' | 'error', content: string } | null>(null);

    useEffect(() => {
        // Load user info từ localStorage (nơi lưu trữ session sau khi login)
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUserInfo(JSON.parse(storedUser));
            } catch (e) {
                console.error("Error parsing user info", e);
            }
        }
    }, []);

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg(null);

        if (!oldPassword || !newPassword || !confirmPassword) {
            setMsg({ type: 'error', content: 'Vui lòng điền đầy đủ thông tin.' });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMsg({ type: 'error', content: 'Mật khẩu xác nhận không khớp.' });
            return;
        }

        if (newPassword.length < 6) {
          setMsg({ type: 'error', content: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
          return;
        }

        setLoading(true);
        try {
            await authService.changePassword({
                email: userInfo?.email || '',
                oldPassword: oldPassword,
                newPassword: newPassword
            });
            setMsg({ type: 'success', content: 'Đổi mật khẩu thành công!' });
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        } catch (error: any) {
             const message = error.response?.data?.message || error.response?.data?.Data || 'Đổi mật khẩu thất bại. Vui lòng kiểm tra mật khẩu cũ.';
             setMsg({ type: 'error', content: message });
        } finally {
            setLoading(false);
        }
    };

    if (!userInfo) {
        return <div className="p-8 text-center text-slate-400">Đang tải thông tin...</div>;
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-2xl font-bold text-white mb-6 border-l-4 border-sky-500 pl-4">
                Hồ sơ cá nhân
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Cột trái: Thông tin cá nhân */}
                <div className="md:col-span-1 space-y-6">
                    <div className="panel bg-slate-800/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm">
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-sky-400 to-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4">
                                {userInfo.fullName ? userInfo.fullName.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <h2 className="text-xl font-semibold text-white text-center">
                                {userInfo.fullName}
                            </h2>
                            <span className="mt-1 px-3 py-1 bg-white/10 rounded-full text-xs font-medium text-sky-300 border border-sky-500/20">
                                {userInfo.role}
                            </span>
                        </div>

                        <div className="mt-6 space-y-4 pt-6 border-t border-white/5">
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-semibold">MSSV / Mã GV</label>
                                <p className="text-slate-300 font-medium">{userInfo.mssv || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-semibold">Email</label>
                                <p className="text-slate-300 font-medium break-all">{userInfo.email}</p>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 uppercase font-semibold">Ngày sinh</label>
                                <p className="text-slate-300 font-medium">
                                    {userInfo.dateOfBirth ? new Date(userInfo.dateOfBirth).toLocaleDateString('vi-VN') : 'N/A'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cột phải: Đổi mật khẩu */}
                <div className="md:col-span-2">
                   <div className="panel bg-slate-800/50 border border-white/10 rounded-xl p-6 backdrop-blur-sm h-full">
                        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-sky-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Đổi mật khẩu
                        </h3>

                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
                            {msg && (
                                <div className={`p-3 rounded-lg border text-sm ${
                                    msg.type === 'success'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                                }`}>
                                    {msg.content}
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Mật khẩu hiện tại</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors placeholder:text-slate-600"
                                    placeholder="••••••••"
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Mật khẩu mới</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors placeholder:text-slate-600"
                                    placeholder="••••••••"
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    required
                                />
                                <p className="text-xs text-slate-500 mt-1">Tối thiểu 6 ký tự.</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-1">Xác nhận mật khẩu mới</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 bg-slate-900/50 border border-white/10 rounded-lg text-white focus:border-sky-500 focus:ring-1 focus:ring-sky-500 transition-colors placeholder:text-slate-600"
                                    placeholder="••••••••"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn btn-primary px-6 py-2 rounded-lg"
                                >
                                    {loading ? 'Đang xử lý...' : 'Cập nhật mật khẩu'}
                                </button>
                            </div>
                        </form>
                   </div>
                </div>
            </div>
        </div>
    );
};

export default ProfilePage;
