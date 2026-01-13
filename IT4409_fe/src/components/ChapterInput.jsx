export const ChapterInput = ({ chapterData, onChange, onRemove }) => {
    const levels = [
        { key: "easyCount", label: "Dễ" },
        { key: "mediumCount", label: "Trung bình" },
        { key: "hardCount", label: "Khó" },
        { key: "veryHardCount", label: "Rất khó" },
    ];

    return (
        <div className="p-4 border border-slate-200 rounded-lg bg-slate-50 space-y-3 mb-3 relative">
            <button
                onClick={onRemove}
                className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm font-bold"
            >
                ✕
            </button>

            <div className="flex items-center gap-4">
                <div className="flex-1">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Số Chương (Thứ tự)</label>
                    <input
                        type="number"
                        value={chapterData.chapter}
                        onChange={(e) => onChange("chapter", Number(e.target.value))}
                        className="w-full px-3 py-2 border rounded-md outline-none focus:border-blue-400"
                    />
                </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {levels.map((level) => (
                    <div key={level.key}>
                        <label className="block text-xs text-gray-400 mb-1">{level.label}</label>
                        <input
                            type="number"
                            min="0"
                            value={chapterData[level.key]}
                            onChange={(e) => onChange(level.key, Number(e.target.value))}
                            className="w-full px-2 py-1.5 border rounded-md text-sm outline-none focus:border-blue-400"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};