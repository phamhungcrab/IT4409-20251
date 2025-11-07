import { NavLink, useNavigate } from "react-router-dom";
import { Users, BookOpen, ClipboardList, Database, BarChart3, Home, LogOut } from "lucide-react";

export function Sidebar() {
    const navigate = useNavigate();

    const menuItems = [
        { name: "Dashboard", icon: <Home size={18} />, path: "/admin/home" },
        { name: "Quản lý tài khoản", icon: <Users size={18} />, path: "/admin/accounts" },
        { name: "Quản lý lớp học", icon: <BookOpen size={18} />, path: "/admin/class" },
        { name: "Quản lý bài kiểm tra", icon: <ClipboardList size={18} />, path: "/admin/exam" },
        { name: "Ngân hàng câu hỏi", icon: <Database size={18} />, path: "/admin/questions" },
        { name: "Quản lý kết quả", icon: <BarChart3 size={18} />, path: "/admin/results" },
    ];

    const handleLogout = () => {
        localStorage.removeItem("auth-token");
        navigate("/admin/login");
    };

    return (
        <div className="w-64 bg-gray-900 text-gray-100 flex flex-col min-h-screen shadow-lg">
            <div className="p-4 text-2xl font-bold text-indigo-400 border-b border-gray-700">
                Admin CMS
            </div>
            <nav className="flex-1 p-4 space-y-1">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.name}
                        to={item.path}
                        className={({ isActive }) =>
                            `flex items-center gap-3 px-3 py-2 rounded-md transition-colors duration-150 ${isActive
                                ? "bg-indigo-800 text-white"
                                : "hover:bg-gray-800 text-gray-300"
                            }`
                        }
                    >
                        {item.icon}
                        {item.name}
                    </NavLink>
                ))}
            </nav>

            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-gray-800 hover:bg-red-600 hover:text-white transition-colors"
                >
                    <LogOut size={18} />
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}
