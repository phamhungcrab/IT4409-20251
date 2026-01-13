import React from "react";

export const DataTable = ({ columns, data, actions }) => {
    return (
        <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto max-h-[65vh]">
                <table className="w-full border-collapse min-w-[600px]">
                    <thead className="bg-gray-100 text-gray-700 uppercase text-xs sm:text-sm sticky top-0 z-10">
                        <tr>
                            {columns.map((col) => (
                                <th key={col.accessor} className="px-4 py-3 sm:px-6 text-left font-semibold">
                                    {col.header}
                                </th>
                            ))}
                            {actions && <th className="px-4 py-3 sm:px-6 text-center font-semibold">Thao tác</th>}
                        </tr>
                    </thead>

                    <tbody className="divide-y divide-gray-200 text-gray-700">
                        {data.length > 0 ? (
                            data.map((row, rowIndex) => (
                                <tr key={row.id || rowIndex} className="hover:bg-indigo-50/50 transition-colors">
                                    {columns.map((col) => (
                                        <td key={col.accessor} className="px-4 py-3 sm:px-6 text-sm whitespace-nowrap lg:whitespace-normal">
                                            {col.render ? col.render(row) : row[col.accessor]}
                                        </td>
                                    ))}

                                    {actions && (
                                        <td className="px-4 py-3 sm:px-6 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {actions.map((action, idx) => (
                                                    <button
                                                        key={idx}
                                                        onClick={() => action.onClick(row)}
                                                        className={`whitespace-nowrap ${action.color === "red"
                                                            ? "text-red-600 hover:text-red-800"
                                                            : "text-indigo-600 hover:text-indigo-800"
                                                            } font-medium text-xs sm:text-sm transition`}
                                                    >
                                                        {action.label}
                                                    </button>
                                                ))}
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={columns.length + (actions ? 1 : 0)} className="px-6 py-10 text-center text-gray-500 italic">
                                    Không có dữ liệu hiển thị
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};