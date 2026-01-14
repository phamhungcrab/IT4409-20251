import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
    Users, BookOpen, ClipboardList, Database,
    Book, Menu, X, LayoutDashboard, ChevronRight, HelpCircle
} from "lucide-react";

export function Sidebar() {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        setIsOpen(false);
    }, [location.pathname]);

    const menuItems = [
        { name: "Quản lý tài khoản", icon: <Users size={20} />, path: "/" },
        { name: "Quản lý học phần", icon: <Book size={20} />, path: "/subject" },
        { name: "Quản lý lớp học", icon: <BookOpen size={20} />, path: "/class" },
        { name: "Quản lý bài kiểm tra", icon: <ClipboardList size={20} />, path: "/exam" },
        { name: "Quản lý blueprint", icon: <LayoutDashboard size={20} />, path: "/blueprint" },
        { name: "Ngân hàng câu hỏi", icon: <Database size={20} />, path: "/questions" },
    ];

    return (
        <>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed top-4 left-4 z-[70] p-3 bg-[#0f172a] text-white rounded-xl lg:hidden border border-slate-700 shadow-2xl"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-black/60 z-[60] lg:hidden" onClick={() => setIsOpen(false)} />
            )}

            <aside className={`
                fixed top-0 left-0 h-screen z-[65]
                flex w-72 flex-col bg-[#0f172a] text-slate-300
                transition-transform duration-300 ease-in-out
                ${isOpen ? "translate-x-0" : "-translate-x-full"} 
                lg:translate-x-0 border-r border-slate-800 
            `}>

                <div className="px-8 py-10">
                    <div className="mb-4">
                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-700 bg-slate-800/50 px-3 py-1 text-[10px] uppercase tracking-[0.2em] text-blue-400 font-bold">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.1)]" />
                            Live System
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-slate-500 font-medium">Dại học Bách Khoa Hà Nội</p>
                        <p className="text-xl font-black text-white tracking-tighter uppercase leading-tight">Exam Hub</p>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
                    <p className="px-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-600 mb-4">
                        Main Navigation
                    </p>

                    {menuItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `
                                flex items-center justify-between group rounded-xl px-4 py-3.5 text-sm font-bold transition-all
                                ${isActive
                                    ? 'bg-white-600 text-white shadow-xl shadow-blue-900/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                            `}
                        >
                            <div className="flex items-center gap-3">
                                {item.icon}
                                <span>{item.name}</span>
                            </div>
                            <ChevronRight size={14} className={`transition-opacity ${location.pathname === item.path ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} />
                        </NavLink>
                    ))}
                </nav>

            </aside>
        </>
    );
}