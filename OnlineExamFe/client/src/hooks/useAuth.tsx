import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, LoginDto, UserRole } from '../services/authService';
import { userService } from '../services/userService';

/**
 * Kiểu User dùng trong Frontend.
 * - id: định danh người dùng
 * - email: email đăng nhập
 * - role: vai trò (Admin/Teacher/Student)
 *
 * Lưu ý:
 * - role để dạng string vì có thể lấy từ backend trả về (string hoặc số enum)
 * - Sau đó FE tự chuẩn hoá về 'Admin' | 'Teacher' | 'Student'
 */
export interface User {
  id: number;
  email: string;
  role: string;
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
   * - Chuẩn hoá role về đúng 'Admin' | 'Teacher' | 'Student'
   *
   * Vì sao phải gọi userService.findByEmail?
   * - Trong hệ của bạn: token có thể là session string "opaque" (không phải JWT),
   *   nên FE không thể decode để biết role/id.
   * - Vì vậy login xong phải “tra cứu” user để biết quyền.
   */
  const login = async (data: LoginDto) => {
    try {
      const response = await authService.login(data);
      let sessionToken = '';

      /**
       * Backend có thể trả về:
       * - string: token trực tiếp
       * - object: { accessToken, refreshToken }
       *
       * FE phải xử lý cả 2 kiểu để không bị lỗi.
       */
      if (typeof response === 'string') {
        sessionToken = response;
      } else if (response && typeof response === 'object' && 'accessToken' in response) {
        sessionToken = response.accessToken;
      }

      // Nếu lấy được token thì lưu lại
      if (sessionToken) {
        setToken(sessionToken);
        localStorage.setItem('token', sessionToken);

        // Trong dự án hiện tại bạn chưa dùng refreshToken ổn định nên xoá để tránh rác
        localStorage.removeItem('refreshToken');

        /**
         * Bước 2: tìm user theo email để lấy id và role.
         * - Nếu BE có endpoint /me thì sẽ tốt hơn
         * - Nhưng hiện tại bạn dùng findByEmail(email) để tìm user
         */
        try {
          const currentUser = await userService.findByEmail(data.email);

          if (currentUser) {
            /**
             * currentUser.role có thể là:
             * - số enum: 0/1/2
             * - hoặc string: 'Admin'/'Teacher'/'Student'
             * => Chuẩn hoá về đúng UserRole enum của FE
             */
            let roleStr = String(currentUser.role);
            const roleLower = roleStr.toLowerCase();

            if (roleStr === '1' || roleLower === 'teacher') roleStr = UserRole.Teacher;
            else if (roleStr === '0' || roleLower === 'admin') roleStr = UserRole.Admin;
            else if (roleStr === '2' || roleLower === 'student') roleStr = UserRole.Student;

            // Tạo userObj theo format FE cần
            const userObj: User = {
              id: currentUser.id,
              email: currentUser.email,
              role: roleStr,
            };

            // Lưu vào state + localStorage để refresh trang không mất thông tin
            setUser(userObj);
            localStorage.setItem('user', JSON.stringify(userObj));
          } else {
            /**
             * Trường hợp không tìm thấy user (API lỗi logic / dữ liệu chưa seed)
             * => tạo user tạm để app vẫn chạy được
             * (nhưng có thể RoleGuard sẽ chặn nếu role không đúng)
             */
            console.warn('Không tìm thấy user theo email, mặc định role Student');
            const dummyUser: User = {
              id: 0,
              email: data.email,
              role: UserRole.Student,
            };
            setUser(dummyUser);
            localStorage.setItem('user', JSON.stringify(dummyUser));
          }
        } catch (e) {
          /**
           * Nếu gọi userService fail:
           * - Vẫn cho login thành công để user vào hệ thống,
           * - Nhưng role sẽ fallback về Student.
           */
          console.error('Lỗi lấy thông tin user sau khi login', e);
          const fallbackUser: User = {
            id: 0,
            email: data.email,
            role: UserRole.Student,
          };
          setUser(fallbackUser);
          localStorage.setItem('user', JSON.stringify(fallbackUser));
        }
      }
    } catch (error) {
      // Nếu login fail thì ném lỗi lên để LoginPage xử lý (show message)
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
