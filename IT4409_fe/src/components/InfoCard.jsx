export const InfoCard = ({ children, className }) => {
    return (
        <div className={`rounded-2xl border bg-white shadow-sm ${className}`}>
            {children}
        </div>
    );
};

export const CardContent = ({ children, className }) => {
    return (
        <div className={`p-4 ${className}`}>
            {children}
        </div>
    );
};
