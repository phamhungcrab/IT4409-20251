import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { ConfirmModal } from '../../components/ConfirmModal';

export function Layout() {
    const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
    const navigate = useNavigate();
    const adminName = localStorage.getItem("admin-name") || "Quản trị viên";
    const userEmail = localStorage.getItem("admin-email") || "admin@system.com";
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=0ea5e9&color=fff`;

    const handleLogout = () => {
        localStorage.clear();
        navigate("/login");
    };

    return (
        <div className="min-h-screen flex">
            <Sidebar />

            <div className="flex-1 flex flex-col min-w-0 lg:ml-72">
                <header className="sticky top-0 z-40 bg-[#0f172a] border-b border-slate-800">
                    <div className="flex items-center justify-between px-8 py-4">
                        <div>
                            <h1 className="text-xl font-bold text-white uppercase tracking-tight">Hệ thống quản trị nền tảng thi trực tuyến</h1>
                        </div>

                        <div className="flex items-center gap-6">
                            <div onClick={() => navigate("/profile")} className="flex items-center gap-3 px-4 py-2 bg-slate-900 border border-slate-800 rounded-2xl cursor-pointer">
                                <div className="text-right hidden sm:block">
                                    <p className="text-xs font-bold text-white uppercase tracking-wide">{adminName}</p>
                                    <p className="text-[10px] text-slate-500 font-medium">{userEmail}</p>
                                </div>
                                <div className="relative">
                                    <img src={avatarUrl} alt="Avatar" className="w-9 h-9 rounded-xl border border-slate-700" />
                                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-[#0f172a] rounded-full"></span>
                                </div>
                            </div>

                            <button
                                onClick={() => setIsLogoutModalOpen(true)}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-red-400 bg-red-400/5 border border-red-400/10 hover:bg-red-500 hover:text-white transition-all duration-300 shadow-lg shadow-red-500/5"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                                </svg>
                                <span>ĐĂNG XUẤT</span>
                            </button>
                        </div>
                    </div>
                </header>

                <ConfirmModal
                    isOpen={isLogoutModalOpen}
                    title="Xác nhận đăng xuất"
                    message="Bạn có chắc chắn muốn rời khỏi hệ thống không?"
                    onConfirm={handleLogout}
                    onCancel={() => setIsLogoutModalOpen(false)}
                />

                <main className="flex-1 p-8 overflow-auto bg-white">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};
