import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    Users,
    BookOpen,
    ClipboardList,
    Database,
    LogOut,
    Book,
    ChevronDown,
    ChevronRight,
} from "lucide-react";
import { useState, useEffect } from "react";

export function Sidebar() {
    const navigate = useNavigate();
    const location = useLocation();
    const [openMenus, setOpenMenus] = useState({});

    const adminName = "Tài khoản";
    const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(adminName)}&background=random&color=fff`;

    const toggleMenu = (menuName) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menuName]: !prev[menuName],
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem("role");
        localStorage.removeItem("session");
        navigate("/login");
    };

    const menuItems = [
        { name: "Quản lý tài khoản", icon: <Users size={18} />, path: "/accounts" },
        { name: "Quản lý học phần", icon: <Book size={18} />, path: "/subject" },
        { name: "Quản lý lớp học", icon: <BookOpen size={18} />, path: "/class" },
        { name: "Quản lý bài kiểm tra", icon: <ClipboardList size={18} />, path: "/exam" },
        { name: "Ngân hàng câu hỏi", icon: <Database size={18} />, path: "/questions" },
    ];

    useEffect(() => {
        const newOpenMenus = {};
        menuItems.forEach((item) => {
            if (item.children?.some((child) => location.pathname.startsWith(child.path))) {
                newOpenMenus[item.name] = true;
            }
        });
        setOpenMenus(newOpenMenus);
    }, [location.pathname]);

    return (
        <div className="fixed top-0 left-0 w-64 h-screen bg-gray-900 text-gray-100 flex flex-col shadow-lg justify-between z-50 border-r border-gray-800">
            <div>
                <div className="p-5 text-center text-xl font-bold border-b border-gray-800 tracking-tighter">
                    QUẢN LÝ THI CỬ
                </div>

                <NavLink
                    to="/home"
                    className={({ isActive }) =>
                        `flex items-center gap-3 px-5 py-4 border-b border-gray-800 transition-colors hover:bg-gray-800/50 ${isActive ? "bg-gray-800/30" : ""
                        }`
                    }
                >
                    <div className="relative shrink-0">
                        <img
                            src={avatarUrl}
                            alt="Avatar"
                            className="w-10 h-10 rounded-full border border-gray-700 shadow-sm"
                        />
                        <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-gray-900 rounded-full"></div>
                    </div>
                    <div className="overflow-hidden">
                        <p className="text-sm font-semibold text-white truncate leading-tight">
                            {adminName}
                        </p>
                        <p className="text-[11px] text-gray-500 truncate mt-0.5">
                            Quản trị viên
                        </p>
                    </div>
                </NavLink>

                <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
                    {menuItems.map((item) => (
                        <div key={item.name}>
                            {item.children ? (
                                <button
                                    onClick={() => toggleMenu(item.name)}
                                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${location.pathname.startsWith(item.path)
                                        ? "bg-blue-600 text-white shadow-md"
                                        : "hover:bg-gray-800 text-gray-400"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        <span className="text-sm font-medium">{item.name}</span>
                                    </div>
                                    {openMenus[item.name] ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                                </button>
                            ) : (
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${isActive
                                            ? "bg-blue-600 text-white shadow-md"
                                            : "hover:bg-gray-800 text-gray-400 hover:text-gray-200"
                                        }`
                                    }
                                >
                                    {item.icon}
                                    <span className="text-sm font-medium">{item.name}</span>
                                </NavLink>
                            )}

                        </div>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-800 bg-gray-900/50">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border border-gray-800 text-gray-400 hover:bg-[#AA1D2B] hover:text-white hover:border-[#AA1D2B] transition-all duration-200 group"
                >
                    <LogOut size={16} className="group-hover:-translate-x-1 transition-transform" />
                    <span>Đăng xuất</span>
                </button>
            </div>
        </div>
    );
}