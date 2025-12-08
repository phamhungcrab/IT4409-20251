/**
 * useAuth hook và AuthProvider.
 *
 * File này:
 *  - Tạo một React Context để lưu trạng thái đăng nhập (user + token).
 *  - Cung cấp các hàm login, logout cho toàn bộ ứng dụng.
 *  - Dùng authService để gọi API backend, userService để lấy thông tin user.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, LoginDto, UserRole } from '../services/authService';
import { userService } from '../services/userService';

/**
 * Kiểu User dùng phía frontend:
 *  - id    : id user trong hệ thống
 *  - email : email đăng nhập
 *  - role  : vai trò (Admin / Teacher / Student) dạng string
 */
export interface User {
  id: number;
  email: string;
  role: string;
}

/**
 * Kiểu dữ liệu mà AuthContext sẽ cung cấp cho các component con:
 *  - user  : thông tin người dùng hiện tại (hoặc null nếu chưa đăng nhập)
 *  - token : chuỗi token phiên làm việc (session token)
 *  - login : hàm đăng nhập (nhận LoginDto, trả về Promise<void>)
 *  - logout: hàm đăng xuất
 */
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginDto) => Promise<void>;
  logout: () => void;
}

/**
 * Tạo Context lưu thông tin auth.
 *  - Giá trị mặc định là undefined để nếu dùng useAuth bên ngoài Provider
 *    ta có thể phát hiện và ném lỗi.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider:
 *  - Là component bọc quanh toàn bộ ứng dụng (ở index.tsx).
 *  - Chịu trách nhiệm:
 *      + Lưu token + user trong state.
 *      + Đồng bộ token/user với localStorage (để F5 không bị mất login).
 *      + Cung cấp hàm login, logout cho các component con qua Context.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /**
   * State token:
   *  - Khởi tạo bằng cách đọc từ localStorage (nếu có).
   *  - Dùng function init () => ... để tránh đọc localStorage nhiều lần không cần thiết.
   */
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  // State user: thông tin người dùng hiện tại; ban đầu là null
  const [user, setUser] = useState<User | null>(null);

  /**
   * useEffect theo dõi biến token:
   *  - Khi token thay đổi:
   *      + Nếu có token: thử đọc 'user' từ localStorage (đã lưu lúc login).
   *      + Nếu đọc được: parse JSON và setUser.
   *      + Nếu parse bị lỗi: xóa user khỏi localStorage cho sạch.
   *      + Nếu không có token: setUser(null) (xem như đã logout).
   */
  useEffect(() => {
    if (token) {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch (e) {
          console.error("Lỗi parse user từ localStorage", e);
          localStorage.removeItem('user');
        }
      }
    } else {
      setUser(null);
    }
  }, [token]);

  /**
   * Hàm login:
   *  - Nhận data (email, password, ...) theo kiểu LoginDto.
   *  - Gọi authService.login để lấy token từ backend.
   *  - Lưu token vào state + localStorage.
   *  - Gọi userService.getAll() để tìm ra user hiện tại (lấy id + role).
   *  - Map role backend trả về (int/string) sang enum UserRole cho thống nhất.
   */
  const login = async (data: LoginDto) => {
    try {
      const response = await authService.login(data);
      let sessionToken = '';

      // Backend có thể trả về:
      //  - một chuỗi token (string)
      //  - hoặc object { accessToken, refreshToken }
      if (typeof response === 'string') {
        sessionToken = response;
      } else if (response && typeof response === 'object' && 'accessToken' in response) {
        sessionToken = response.accessToken;
      }

      if (sessionToken) {
        // Lưu token vào state và localStorage
        setToken(sessionToken);
        localStorage.setItem('token', sessionToken);
        localStorage.removeItem('refreshToken'); // hiện tại chưa dùng refresh token

        /**
         * Backend trả về một chuỗi session "mù" (không phải JWT nên không decode lấy role).
         * Vì vậy:
         *  - FE phải gọi API lấy danh sách user (userService.getAll()),
         *  - Sau đó tìm user có email trùng với email vừa login,
         *  - Từ đó lấy ra id + role.
         */
        try {
          const allUsers = await userService.getAll();
          // So sánh email thường (chuyển về lowercase để tránh lệch hoa/thường)
          const currentUser = allUsers.find(
            (u) => u.email.toLowerCase() === data.email.toLowerCase()
          );

          if (currentUser) {
            console.log('Tìm thấy user qua userService:', currentUser);

            /**
             * Map role từ backend sang enum UserRole.
             *  - Backend có thể trả role là số (0,1,2) hoặc string ('Admin','Teacher','Student').
             *  - Ta convert sang string trước, sau đó so sánh:
             *      '1' hoặc 'teacher' -> Teacher
             *      '0' hoặc 'admin'   -> Admin
             *      '2' hoặc 'student' -> Student
             */
            let roleStr = String(currentUser.role);
            const roleLower = roleStr.toLowerCase();

            if (roleStr === '1' || roleLower === 'teacher') roleStr = UserRole.Teacher;
            else if (roleStr === '0' || roleLower === 'admin') roleStr = UserRole.Admin;
            else if (roleStr === '2' || roleLower === 'student') roleStr = UserRole.Student;

            // Tạo object User chuẩn cho frontend
            const userObj: User = {
              id: currentUser.id,
              email: currentUser.email,
              role: roleStr,
            };

            // Lưu vào state và localStorage
            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
          } else {
            // Nếu không tìm thấy user trong danh sách (trường hợp bất thường)
            console.warn('Không tìm thấy user trong danh sách, mặc định role Student');
            const dummyUser: User = {
              id: 0,
              email: data.email,
              role: UserRole.Student,
            };
            setUser(dummyUser);
            localStorage.setItem('user', JSON.stringify(dummyUser));
          }
        } catch (e) {
          // Nếu gọi userService.getAll() bị lỗi (API lỗi, network,...)
          console.error('Lỗi khi lấy thông tin user để xác định role', e);
          // Fallback: mặc định cho họ là Student để họ vẫn login được
          const dummyUser: User = {
            id: 0,
            email: data.email,
            role: UserRole.Student,
          };
          setUser(dummyUser);
          localStorage.setItem('user', JSON.stringify(dummyUser));
        }
      }
    } catch (error) {
      console.error('Login thất bại', error);
      // Ném lại lỗi để component gọi login (LoginPage) có thể hiển thị message
      throw error;
    }
  };

  /**
   * Hàm logout:
   *  - Nếu đang có user, gọi API logout để backend ghi nhận.
   *  - Sau đó xóa token + user ở state và localStorage (dù API có lỗi hay không).
   */
  const logout = () => {
    if (user) {
      // Gọi logout API, nếu lỗi thì chỉ log ra console, không chặn việc xóa local
      authService.logout({ userId: user.id }).catch(console.error);
    }

    // Xóa token + user trong state
    setToken(null);
    setUser(null);

    // Xóa dữ liệu auth trong localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  /**
   * Lắng nghe sự kiện 'auth:logout' toàn cục:
   *  - Ở apiClient, khi gặp lỗi 401 sẽ dispatch Event('auth:logout').
   *  - Tại đây, ta bắt sự kiện đó và gọi logout().
   *  - Nhờ vậy, bất kỳ chỗ nào bị 401 (token hết hạn, sai,...) đều dẫn đến logout chung.
   */
  useEffect(() => {
    const handleLogout = () => logout();
    window.addEventListener('auth:logout', handleLogout);

    // Cleanup: bỏ đăng ký listener khi component unmount hoặc khi dependency thay đổi
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [user]);

  // Trả Context Provider, truyền xuống user, token, login, logout cho toàn bộ children
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Hook useAuth:
 *  - Giúp các component con lấy dữ liệu từ AuthContext dễ dàng.
 *  - Nếu gọi useAuth mà bên ngoài không có AuthProvider bọc quanh,
 *    ta ném Error để dev biết cấu hình sai.
 */
export default function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }
  return context;
}
