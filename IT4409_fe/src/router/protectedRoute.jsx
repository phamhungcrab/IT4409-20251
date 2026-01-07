import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";

export const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);

    useEffect(() => {
        const session = localStorage.getItem("session");
        const role = localStorage.getItem("role");

        if (session && role === "ADMIN") {
            setIsAuthorized(true);
        }

        setLoading(false);
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-500">
                Đang kiểm tra đăng nhập...
            </div>
        );
    }

    return isAuthorized ? children : <Navigate to="/login" replace />;
};
