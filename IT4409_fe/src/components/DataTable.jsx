import React from "react";

export const DataTable = ({ columns, data, actions }) => {
    return (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full border-collapse">
                <thead className="bg-gray-100 text-gray-700 uppercase text-sm">
                    <tr>
                        {columns.map((col) => (
                            <th key={col.accessor} className="px-6 py-3 text-left font-semibold">
                                {col.header}
                            </th>
                        ))}
                        {actions && <th className="px-6 py-3 text-center font-semibold">Thao tác</th>}
                    </tr>
                </thead>

                <tbody className="divide-y divide-gray-200 text-gray-700">
                    {data.map((row, rowIndex) => (
                        <tr key={row.id || rowIndex} className="hover:bg-indigo-50 transition-colors">
                            {columns.map((col) => (
                                <td key={col.accessor} className="px-6 py-4">
                                    {col.render ? col.render(row) : row[col.accessor]}
                                </td>
                            ))}

                            {actions && (
                                <td className="px-6 py-4 text-center">
                                    {actions.map((action, idx) => (
                                        <button
                                            key={idx}
                                            onClick={() => action.onClick(row)}
                                            className={`${action.color === "red"
                                                ? "text-red-600 hover:text-red-800"
                                                : "text-indigo-600 hover:text-indigo-800"
                                                } font-medium text-sm transition mx-1`}
                                        >
                                            {action.label}
                                        </button>
                                    ))}
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
