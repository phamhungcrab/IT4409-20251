import React from 'react';
import { NavLink } from 'react-router-dom'; ``

export interface SidebarLink {
    path: string;
    label: string;
    icon?: React.ReactNode;
}

export interface SidebarProps {
    links: SidebarLink[];
}

const Sidebar: React.FC<SidebarProps> = ({ links }) => {
    return (

        <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-slate-950/60 backdrop-blur-xl px-6 py-8 text-slate-100 shadow-xl">
            {/* Phần header của sidebar: tiêu đề dashboard */}
            <div className="mb-8 space-y-2">
                {/* Tag “Live” chỉ là UI trang trí */}
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.2em] text-sky-100">
                    <span
                        className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_0_6px_rgba(16,185,129,0.2)]"
                        aria-hidden
                    />
                    Live
                </div>

                <div>
                    <p className="text-sm text-slate-300">Thi trực tuyến</p>
                    <p className="text-xl font-semibold text-white">Bảng điều khiển</p>
                </div>
            </div>

            {/* NAV: vùng chứa các link điều hướng */}
            <nav className="space-y-2">
                {/**
         * links.map(...) để render nhiều link.
         * Mỗi link phải có key duy nhất (ở đây dùng path vì thường là unique).
         */}
                {links.map((link) => (
                    <NavLink
                        key={link.path}
                        to={link.path}
                        className={({ isActive }) =>
                            [
                                'flex items-center gap-3 rounded-xl px-4 py-3 font-semibold transition',
                                isActive
                                    ? 'bg-white text-slate-900 shadow-lg shadow-blue-500/20'
                                    : 'text-slate-200 hover:bg-white/10',
                            ].join(' ')
                        }
                        aria-label={link.label}
                    >
                        {/* Nếu có icon thì render icon */}
                        {link.icon && <span className="inline-block">{link.icon}</span>}

                        {/* truncate: nếu label quá dài thì cắt ... để không phá layout */}
                        <span className="truncate">{link.label}</span>
                    </NavLink>
                ))}
            </nav>

            {/* Phần dưới cùng sidebar (đẩy xuống đáy bằng mt-auto) */}
            <div className="mt-auto pt-8">
                <div className="glass-card p-4">
                    <p className="text-xs uppercase tracking-[0.15em] text-slate-300">Cần giúp đỡ?</p>
                    <p className="text-sm text-slate-200">Hãy hỏi giảng viên hoặc tra google!</p>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;