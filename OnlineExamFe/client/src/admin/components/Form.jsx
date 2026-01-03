import { useState, useEffect } from "react";

export const Form = ({ fields, initialValues = {}, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(initialValues);

    useEffect(() => {
        setFormData(initialValues);
    }, [initialValues]);

    const handleChange = (name, value) => {
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 bg-white rounded-xl p-5"
        >
            {fields.map((f) => (
                <div key={f.name} className="flex flex-col gap-1">
                    <label className="text-sm font-medium text-gray-700">
                        {f.label}
                    </label>

                    {f.type === "select" ? (
                        <select
                            value={formData[f.name] || ""}
                            onChange={(e) => handleChange(f.name, e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm 
                                       focus:ring-indigo-400 focus:border-indigo-400"
                        >
                            <option value="">Chọn</option>
                            {f.options?.map((op) => (
                                <option key={op.value} value={op.value}>
                                    {op.label}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <input
                            type={f.type}
                            value={formData[f.name] || ""}
                            onChange={(e) => handleChange(f.name, e.target.value)}
                            className="border border-gray-300 rounded-lg px-3 py-2 text-sm
                                       focus:ring-indigo-400 focus:border-indigo-400"
                        />
                    )}
                </div>
            ))}

            <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 rounded-lg bg-gray-200 text-sm hover:bg-gray-300 transition"
                >
                    Hủy
                </button>

                <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-indigo-600 text-white text-sm 
                               hover:bg-[#AA1D2B]-500 transition"
                >
                    Lưu
                </button>
            </div>
        </form>
    );
};
