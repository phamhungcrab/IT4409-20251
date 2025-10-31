// Đăng nhập
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const loginApi = async () => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const token = "12345";
            if (token) resolve();
            else reject();
        }, 800);
    });
};

export const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!email.trim()) return "Vui lòng nhập email!";

        const re = /^\S+@\S+\.\S+$/;
        if (!re.test(email)) return "Địa chỉ email không hợp lệ.";

        if (!password.trim()) return "Vui lòng nhập mật khẩu";

        return "";
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        const v = validate();
        if (v) {
            setError(v);
            return;
        }
        try {
            setLoading(true);
            const data = await loginApi(email, password);

            if (data.token) {
                localStorage.setItem("auth-token", data.token)
            }
        } catch (e) {
            setError(e.message || "Có lỗi xảy ra. Vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-semibold">Đăng nhập</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 p-3 rounded">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                            aria-required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                            Mật khẩu
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                                className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                required
                                aria-required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
                                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                            >
                                {showPassword ? (<EyeOff className="w-5 h-5 text-gray-500" />) : (<Eye className="w-5 h-5 text-gray-500" />)}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <a href="#" className="text-sm text-indigo-600 hover:underline">
                            Quên mật khẩu?
                        </a>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 disabled:opacity-60"
                        >
                            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-3">
                        Chưa có tài khoản? <a href="#" className="text-indigo-600 hover:underline">Đăng ký</a>
                    </p>
                </form>
            </div>
        </div>
    )
}