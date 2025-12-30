import { useEffect, useRef, useState } from "react";
import { MoreHorizontal } from "lucide-react";

export const ExamCard = ({ title, subtitle, actions = [], children, status = "", className = "", onClick }) => {
    const colorClass = {
        indigo: "text-indigo-700",
        red: "text-[#AA1D2B]",
        gray: "text-gray-700",
    };
    const statusBadge = {
        ACTIVE: {
            text: "Đang mở",
            class: "bg-green-100 text-green-700 border border-green-300"
        },
        INACTIVE: {
            text: "Đã đóng",
            class: "bg-gray-200 text-gray-700 border border-gray-300"
        }
    };

    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setShowMenu(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);


    return (
        <div onClick={onClick} className={`relative p-4 rounded-xl shadow flex flex-col justify-between w-[270px] h-[150px] bg-white ${className}`}>
            <div>
                <h3 className="text-lg font-bold">{title}</h3>
                {subtitle && <p className="text-sm text-gray-500">{subtitle}</p>}
                <span
                    className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-md ${statusBadge[status]?.class}`}
                >
                    {statusBadge[status]?.text}
                </span>
                {children && <div className="mt-2">{children}</div>}
            </div>

            <button
                onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(prev => !prev)
                }}
                className="absolute bottom-2 right-3 p-2 hover:bg-gray-100 rounded-full"
            >
                <MoreHorizontal size={22} />
            </button>

            {showMenu && (
                <div
                    ref={menuRef}
                    className="absolute top-30 left-65 bg-white shadow-lg rounded-lg border border-gray-200 w-36 py-1 z-50"
                >
                    {actions.map((a, idx) => (
                        <button
                            key={idx}
                            onClick={(e) => {
                                e.stopPropagation();
                                a.onClick();
                                setShowMenu(false);
                            }}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${colorClass[a.color]}`}
                        >
                            {a.label}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
