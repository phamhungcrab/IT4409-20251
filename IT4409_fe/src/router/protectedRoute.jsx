import { useNavigate, Navigate } from "react-router-dom";
import { useState, useEffect, cloneElement } from "react";

const checkLoginApi = async () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const isAuthenticated = false;
            if (isAuthenticated) resolve();
            else reject();
        }, 800);
    });
};

const getProfileApi = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ role: "student" });
        }, 300);
    });
};

export const ProtectedRoute = ({ children }) => {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [role, setRole] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                await checkLoginApi();
                setIsLoggedIn(true);
            } catch (e) {
                setIsLoggedIn(false);
                navigate("/login", { replace: true })
            }
        }

        const checkRole = async () => {
            try {
                let userData = await getProfileApi();
                let userRole = userData.role;
                setRole(userRole);
            } catch (e) {
                setRole('');
            }
        }

        checkLoginStatus();
        checkRole();
    }, []);

    if (!isLoggedIn) return <Navigate to="/login" replace />;

    return cloneElement(children, { role });
}