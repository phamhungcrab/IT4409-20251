import { useEffect, useRef, useState } from "react";
import { MoreHorizontal, ArrowRight, User } from "lucide-react";
import { getInitials, getColorFromText } from "../utils/helper.js";

export const ExamCard = ({
    title,
    subtitle,
    actions = [],
    status = "",
    className = "",
    onClick
}) => {
    const [showMenu, setShowMenu] = useState(false);
    const menuRef = useRef(null);

    const colorClass = {
        indigo: "text-indigo-600 hover:bg-indigo-50",
        red: "text-red-600 hover:bg-red-50",
        gray: "text-slate-600 hover:bg-slate-50",
    };

    const statusBadge = {
        ACTIVE: "bg-emerald-50 text-emerald-600 border-emerald-100",
        INACTIVE: "bg-slate-50 text-slate-400 border-slate-100",
    };

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
        <div
            onClick={onClick}
            className={`group relative p-5 rounded-2xl border border-slate-200 bg-white hover:border-indigo-400 hover:shadow-lg transition-all duration-300 cursor-pointer flex flex-col justify-center ${className}`}
        >
            <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-sm shrink-0 ${getColorFromText(title)}`}>
                    {getInitials(title)}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-[17px] font-black text-slate-800 truncate group-hover:text-indigo-600 transition-colors">
                            {title}
                        </h3>
                        {status && (
                            <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-tighter border ${statusBadge[status]}`}>
                                {status === 'ACTIVE' ? "OPEN" : "CLOSED"}
                            </span>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider border border-slate-200 uppercase">
                            {typeof subtitle === 'object' ? subtitle.props.children[0].props.children : "COURSE"}
                        </span>
                        <div className="flex items-center text-slate-400 text-[12px] gap-1.5 truncate">
                            <User size={14} className="text-slate-300" />
                            <span className="font-medium italic">
                                {typeof subtitle === 'object' ? subtitle.props.children[1].props.children[1] : subtitle}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="relative self-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setShowMenu(prev => !prev);
                        }}
                        className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors"
                    >
                        <MoreHorizontal size={20} />
                    </button>

                    {showMenu && (
                        <div
                            ref={menuRef}
                            className="absolute right-0 mt-2 bg-white shadow-2xl rounded-xl border border-slate-100 w-40 py-1.5 z-50 animate-in fade-in zoom-in duration-200"
                        >
                            {actions.map((a, idx) => (
                                <button
                                    key={idx}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        a.onClick();
                                        setShowMenu(false);
                                    }}
                                    className={`w-full text-left px-4 py-2 text-xs font-bold transition-colors ${colorClass[a.color] || colorClass.gray}`}
                                >
                                    {a.label}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="absolute bottom-3 right-5 text-indigo-200 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                <ArrowRight size={16} />
            </div>
        </div>
    );
};