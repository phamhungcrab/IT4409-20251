import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, LoginDto, UserRole } from '../services/authService';
import { userService } from '../services/userService';
import { monitoringService } from '../services/monitoringService';

/**
 * Kiểu User dùng trong Frontend.
 * - id: định danh người dùng
 * - email: email đăng nhập
 * - role: vai trò (Teacher/Student)
 *
 * Lưu ý:
 * - role để dạng string vì có thể lấy từ backend trả về (string hoặc số enum)
 * - Sau đó FE tự chuẩn hoá về 'Teacher' | 'Student'
 */
export interface User {
  id: number;
  email: string;
  role: string;
  fullName?: string;
  mssv?: string;
  dateOfBirth?: string;
}

/**
 * Kiểu dữ liệu mà AuthContext sẽ cung cấp cho toàn app.
 *
 * Ý nghĩa:
 * - user: thông tin người dùng hiện tại (null nếu chưa login)
 * - token: session token (null nếu chưa login)
 * - login(): hàm đăng nhập (gọi API)
 * - logout(): hàm đăng xuất (xoá token + user)
 */
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: LoginDto) => Promise<void>;
  logout: () => void;
}

/**
 * Tạo AuthContext.
 *
 * createContext<AuthContextType | undefined>(undefined)
 * - Ban đầu để undefined để nếu ai đó gọi useAuth() mà không bọc AuthProvider
 *   thì ta sẽ throw lỗi rõ ràng.
 *
 * Khái niệm Context:
 * - Context giúp truyền dữ liệu "toàn cục" (như user/token) xuống mọi component
 *   mà không cần props truyền lòng vòng.
 */
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider: component bọc ngoài app để cung cấp AuthContext.
 *
 * Cách dùng thường thấy:
 * - index.tsx:
 *   <AuthProvider>
 *     <App />
 *   </AuthProvider>
 *
 * children: chính là toàn bộ phần UI bên trong AuthProvider (App và các trang)
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  /**
   * token:
   * - Lưu session token của người dùng.
   * - Khởi tạo bằng localStorage.getItem('token') để "nhớ đăng nhập"
   *   sau khi refresh trang.
   *
   * useState(() => ...) là lazy initializer:
   * - Hàm trong useState chỉ chạy 1 lần lúc mount (đỡ gọi localStorage nhiều lần)
   */
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));

  /**
   * user:
   * - Thông tin người dùng hiện tại.
   * - null nghĩa là chưa login hoặc đã logout.
   */
  const [user, setUser] = useState<User | null>(null);

  /**
   * useEffect theo dõi token:
   * - Nếu có token => thử đọc user từ localStorage để khôi phục phiên đăng nhập.
   * - Nếu token bị xoá => setUser(null)
   *
   * Vì sao cần localStorage 'user'?
   * - Nếu backend không trả JWT (không decode được role/id từ token),
   *   FE phải lưu lại user sau khi login để dùng cho RoleGuard, UI header,...
   */
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

  /**
   * login():
   * - Nhận email/password (LoginDto)
   * - Gọi authService.login => nhận token
   * - Lưu token vào state + localStorage
   * - Sau đó gọi userService.findByEmail(email) để lấy id/role chuẩn
   * - Chuẩn hoá role về đúng 'Teacher' | 'Student'
   *
   * Vì sao phải gọi userService.findByEmail?
   * - Trong hệ của bạn: token có thể là session string "opaque" (không phải JWT),
   *   nên FE không thể decode để biết role/id.
   * - Vì vậy login xong phải “tra cứu” user để biết quyền.
   */
  const login = async (data: LoginDto) => {
    try {
      // response đã được apiClient bóc sẵn thành { sessionString, user }
      const response = await authService.login(data);

      console.log('[DEBUG] Login response:', response); // Debug log

      let sessionToken = '';
      let userRes = null;

      // Check kiểu dữ liệu trả về để lấy token và user info
      if (typeof response === 'object' && 'sessionString' in response && 'user' in response) {
        // Case mới: LoginResponse chuẩn { sessionString, user }
        sessionToken = response.sessionString;
        userRes = response.user;
        console.log('[DEBUG] Parsed - token:', sessionToken?.slice(0, 20) + '...', 'user:', userRes);
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
          else if (roleStr === '2' || roleLower === 'student') roleStr = UserRole.Student;

          const userObj: User = {
            id: userRes.id,
            email: userRes.email,
            role: roleStr,
            fullName: userRes.fullName || userRes.email.split('@')[0],
            mssv: userRes.mssv || (userRes as any).MSSV,
            dateOfBirth: userRes.dateOfBirth || (userRes as any).DateOfBirth,
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
              else if (roleStr === '2' || roleLower === 'student') roleStr = UserRole.Student;

              const userObj: User = {
                id: currentUser.id,
                email: currentUser.email,
                role: roleStr,
                fullName: currentUser.fullName || currentUser.email.split('@')[0],
                mssv: currentUser.mssv || (currentUser as any).MSSV,
                dateOfBirth: currentUser.dateOfBirth || (currentUser as any).DateOfBirth,
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

  /**
   * logout():
   * - Nếu có user => gọi API logout (best-effort, fail cũng không sao)
   * - Xoá token/user ở state
   * - Xoá token/user ở localStorage
   *
   * Vì sao gọi logout API mà vẫn xoá local trước?
   * - FE cần logout ngay để UX phản hồi nhanh.
   * - API logout lỗi vẫn không nên giữ session UI.
   */
  const logout = () => {
    // FIX: Force disconnect mọi kết nối WebSocket (tránh treo socket khi login lại)
    monitoringService.disconnect();

    if (user) {
      authService.logout({ userId: user.id }).catch(console.error);
    }

    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
  };

  /**
   * Lắng nghe event 'auth:logout' toàn cục.
   *
   * Ý tưởng:
   * - apiClient interceptor khi gặp 401 Unauthorized sẽ dispatch event:
   *   window.dispatchEvent(new Event('auth:logout'))
   * - AuthProvider nghe event này để tự động logout toàn hệ thống.
   *
   * Đây là cách “đồng bộ trạng thái” giữa axios layer và UI layer.
   */
  useEffect(() => {
    const handleLogout = () => logout();

    window.addEventListener('auth:logout', handleLogout);

    // Cleanup để tránh leak event listener khi component unmount/re-render
    return () => window.removeEventListener('auth:logout', handleLogout);
  }, [user]);

  /**
   * Provider sẽ cung cấp { user, token, login, logout } cho toàn app.
   * Mọi component con có thể lấy ra bằng useAuth().
   */
  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * useAuth(): hook tiện dụng để lấy AuthContext.
 *
 * Vì sao cần useAuth?
 * - Thay vì viết useContext(AuthContext) ở mọi nơi,
 *   ta gói lại thành useAuth() để code sạch hơn.
 *
 * Nếu dùng useAuth() mà quên bọc AuthProvider:
 * - context sẽ undefined => throw lỗi rõ ràng.
 */
export default function useAuth(): AuthContextType {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth phải được dùng bên trong AuthProvider');
  }

  return context;
}
