import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

const loginApi = async (email, password) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (email === "admin@gmail.com" && password === "123456")
                resolve({ token: "12345" });
            else reject(new Error("Sai thông tin đăng nhập"));
        }, 800);
    });
};

export const CMSLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        if (!email || !password)
            return setError("Vui lòng nhập đầy đủ thông tin");
        try {
            setLoading(true);
            const res = await loginApi(email, password);
            localStorage.setItem("auth-token", res.token);
            navigate("/");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex min-h-full flex-col justify-center bg-white px-6 py-12 lg:px-80">
            {/* Logo + Title */}
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=500"
                    alt="Logo"
                    className="mx-auto h-10 w-auto"
                />
                <h2 className="mt-10 text-center text-2xl font-bold tracking-tight">
                    Đăng nhập hệ thống quản trị
                </h2>
            </div>

            {/* Form */}
            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                {error && (
                    <div className="text-red-400 bg-red-500/10 border border-red-500/20 rounded-md p-3 mb-4 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label for="email" class="block text-sm/6 font-medium text-gray-900">Email</label>
                        <div class="mt-2">
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autocomplete="email"
                                placeholder="Nhập email..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                class="block w-full rounded-md bg-white px-3 py-2.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
                        </div>
                    </div>

                    <div>
                        <div class="flex items-center justify-between">
                            <label for="password" class="block text-sm/6 font-medium text-gray-900">Mật khẩu</label>
                        </div>
                        <div class="mt-2 relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                autocomplete="current-password"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                class="block w-full rounded-md bg-white px-3 py-2.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm/6" />
                            <button
                                type="button"
                                onClick={() => setShowPassword((prev) => !prev)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                {showPassword ? (
                                    <EyeOff className="w-5 h-5" />
                                ) : (
                                    <Eye className="w-5 h-5" />
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Button */}
                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                        >
                            Đăng nhập
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};
