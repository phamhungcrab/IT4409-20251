import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, LoginDto, UserRole } from '../services/authService';
import { userService } from '../services/userService';

export interface User {
    id: number;
    email: string;
    role: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (data: LoginDto) => Promise<void>;
    logout: () => void;
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);


export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

    const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

    /**
     * user:
     * - Thông tin người dùng hiện tại.
     * - null nghĩa là chưa login hoặc đã logout.
     */
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        if (token) {
            const storedUser = localStorage.getItem('user');
            if (storedUser) {
                try {
                    setUser(JSON.parse(storedUser));
                } catch (e) {
                    // Nếu localStorage bị hỏng format JSON thì xoá đi để tránh app crash
                    console.error('Không parse được user từ localStorage', e);
                    localStorage.removeItem('user');
                }
            }
        } else {
            setUser(null);
        }
    }, [token]);

    const login = async (data: LoginDto) => {
        try {
            // response lúc này có kiểu LoginResponse (sessionString + user)
            // hoặc TokenResponse cũ (string / {accessToken...}) tuỳ vào runtime thực tế nếu BE chưa chuẩn.
            // Nhưng theo code mới BE thì response sẽ là LoginResponse.
            const response = await authService.login(data);

            let sessionToken = '';
            let userRes = null;

            // Check kiểu dữ liệu trả về để lấy token và user info
            if (typeof response === 'object' && 'sessionString' in response && 'user' in response) {
                // Case mới: LoginResponse chuẩn { sessionString, user }
                sessionToken = response.sessionString;
                userRes = response.user;
            } else if (typeof response === 'string') {
                // Case cũ (dự phòng): chỉ trả string token
                sessionToken = response;
            } else if (response && typeof response === 'object' && 'accessToken' in response) {
                // Case cũ (dự phòng): { accessToken, refreshToken }
                sessionToken = (response as any).accessToken;
            }

            // Nếu lấy được token thì lưu lại
            if (sessionToken) {
                setToken(sessionToken);
                localStorage.setItem('token', sessionToken);
                localStorage.removeItem('refreshToken'); // Xoá refreshToken cũ nếu có

                // Xử lý thông tin user
                if (userRes) {
                    // Chuẩn hoá role
                    let roleStr = String(userRes.role);
                    const roleLower = roleStr.toLowerCase();

                    if (roleStr === '1' || roleLower === 'teacher') roleStr = UserRole.Teacher;
                    else if (roleStr === '0' || roleLower === 'admin') roleStr = UserRole.Admin;
                    else if (roleStr === '2' || roleLower === 'student') roleStr = UserRole.Student;

                    const userObj: User = {
                        id: userRes.id,
                        email: userRes.email,
                        role: roleStr,
                    };

                    setUser(userObj);
                    localStorage.setItem('user', JSON.stringify(userObj));
                } else {
                    // Fallback cũ: Nếu response không có user (BE cũ), phải gọi API tìm user
                    // (Logic này giữ lại chỉ để đề phòng, thực tế BE mới đã trả user rồi)
                    try {
                        const currentUser = await userService.findByEmail(data.email);
                        if (currentUser) {
                            let roleStr = String(currentUser.role);
                            const roleLower = roleStr.toLowerCase();
                            if (roleStr === '1' || roleLower === 'teacher') roleStr = UserRole.Teacher;
                            else if (roleStr === '0' || roleLower === 'admin') roleStr = UserRole.Admin;
                            else if (roleStr === '2' || roleLower === 'student') roleStr = UserRole.Student;

                            const userObj: User = {
                                id: currentUser.id,
                                email: currentUser.email,
                                role: roleStr,
                            };
                            setUser(userObj);
                            localStorage.setItem('user', JSON.stringify(userObj));
                        }
                    } catch (e) {
                        console.error('Không lấy được user info sau login (fallback)', e);
                    }
                }
            }
        } catch (error) {
            console.error('Login thất bại', error);
            throw error;
        }
    };

    const logout = () => {
        if (user) {
            authService.logout({ userId: user.id }).catch(console.error);
        }

        setToken(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
    };


    useEffect(() => {
        const handleLogout = () => logout();

        window.addEventListener('auth:logout', handleLogout);

        // Cleanup để tránh leak event listener khi component unmount/re-render
        return () => window.removeEventListener('auth:logout', handleLogout);
    }, [user]);


    return (
        <AuthContext.Provider value={{ user, token, login, logout }
        }>
            {children}
        </AuthContext.Provider>
    );
};


export default function useAuth(): AuthContextType {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth phải được dùng bên trong AuthProvider');
    }

    return context;
}