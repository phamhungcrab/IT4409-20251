export const CommonButton = ({ label, onClick, color = "primary", type = "button" }) => {
    const colors = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
        danger: "bg-red-600 hover:bg-blue-800 text-white",
        outline: "border border-gray-300 hover:bg-gray-100 text-gray-700",
    };

    return (
        <button
            type={type}
            onClick={onClick}
            className={`px-4 py-2 rounded-md text-sm font-medium transition ${colors[color]}`}
        >
            {label}
        </button>
    );
}
