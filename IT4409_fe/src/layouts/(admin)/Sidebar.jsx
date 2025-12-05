import { NavLink, useNavigate, useLocation } from "react-router-dom";
import {
    Users,
    BookOpen,
    ClipboardList,
    Database,
    BarChart3,
    Home,
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

    const toggleMenu = (menuName) => {
        setOpenMenus((prev) => ({
            ...prev,
            [menuName]: !prev[menuName],
        }));
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/admin/login");
    };

    const menuItems = [
        { name: "Dashboard", icon: <Home size={18} />, path: "/admin/home" },
        { name: "Quản lý tài khoản", icon: <Users size={18} />, path: "/admin/accounts" },
        { name: "Quản lý học phần", icon: <Book size={18} />, path: "/admin/subject" },
        { name: "Quản lý lớp học", icon: <BookOpen size={18} />, path: "/admin/class", },
        { name: "Quản lý bài kiểm tra", icon: <ClipboardList size={18} />, path: "/admin/exam" },
        { name: "Ngân hàng câu hỏi", icon: <Database size={18} />, path: "/admin/questions" },
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
        <div className="w-64 bg-gray-900 text-gray-100 flex flex-col min-h-screen shadow-lg justify-between">
            <div>
                <div className="p-4 text-2xl font-bold text-[#AA1D2B]-400 border-b border-gray-700">
                    Admin CMS
                </div>

                <nav className="p-4 space-y-1 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 80px)' }}>
                    {menuItems.map((item) => (
                        <div key={item.name}>
                            {item.children ? (
                                <button
                                    onClick={() => toggleMenu(item.name)}
                                    className={`w-full flex items-center justify-between px-3 py-2 rounded-md transition-colors ${location.pathname.startsWith(item.path)
                                        ? "bg-[#AA1D2B] text-white"
                                        : "hover:bg-gray-800 text-gray-300"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        {item.icon}
                                        {item.name}
                                    </div>
                                    {openMenus[item.name] ? (
                                        <ChevronDown size={16} />
                                    ) : (
                                        <ChevronRight size={16} />
                                    )}
                                </button>
                            ) : (
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${isActive
                                            ? "bg-[#AA1D2B] text-white"
                                            : "hover:bg-gray-800 text-gray-300"
                                        }`
                                    }
                                >
                                    {item.icon}
                                    {item.name}
                                </NavLink>
                            )}

                            {item.children && openMenus[item.name] && (
                                <div className="ml-8 mt-1 space-y-1">
                                    {item.children.map((child) => (
                                        <NavLink
                                            key={child.name}
                                            to={child.path}
                                            className={({ isActive }) =>
                                                `block px-3 py-1.5 rounded-md text-sm transition-colors ${isActive
                                                    ? "bg-[#AA1D2B] text-white"
                                                    : "hover:bg-gray-800 text-gray-300"
                                                }`
                                            }
                                        >
                                            {child.name}
                                        </NavLink>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
            </div>

            <div className="p-4 border-t border-gray-700">
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-gray-800 hover:bg-[#AA1D2B] hover:text-white transition-colors"
                >
                    <LogOut size={18} />
                    Đăng xuất
                </button>
            </div>
        </div>
    );
}
