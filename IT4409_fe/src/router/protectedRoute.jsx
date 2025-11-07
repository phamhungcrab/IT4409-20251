import { useNavigate, Navigate } from "react-router-dom";
import { useState, useEffect, cloneElement } from "react";

const checkLoginApi = async () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const isAuthenticated = true;
            if (isAuthenticated) resolve();
            else reject();
        }, 800);
    });
};

const getProfileApi = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ role: "admin" });
        }, 300);
    });
};

export const ProtectedRoute = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(true);
    const [role, setRole] = useState('admin');
    const navigate = useNavigate();

    // useEffect(() => {
    //     const checkLoginStatus = async () => {
    //         try {
    //             await checkLoginApi();
    //             setIsLoggedIn(true);
    //         } catch (e) {
    //             setIsLoggedIn(false);
    //             navigate("/admin/login", { replace: true })
    //         }
    //     }

    //     const checkRole = async () => {
    //         try {
    //             let userData = await getProfileApi();
    //             let userRole = userData.role;
    //             setRole(userRole);
    //         } catch (e) {
    //             setRole('');
    //         }
    //     }

    //     checkLoginStatus();
    //     checkRole();
    // }, []);

    if (!isLoggedIn) return <Navigate to="/admin/login" replace />;

    return cloneElement(children, { role });
}