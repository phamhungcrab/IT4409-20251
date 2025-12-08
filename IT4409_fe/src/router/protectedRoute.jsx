import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";

export const ProtectedRoute = ({ children }) => {
    const [loading, setLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(true);

    useEffect(() => {
        const session = localStorage.getItem("session");
        // console.log("Token: ", token);
        setIsLoggedIn(!!session);
        setLoading(false);
    }, []);

    if (loading) return <div>Loading...</div>;

    return isLoggedIn ? children : <Navigate to="/admin/login" replace />;
};
