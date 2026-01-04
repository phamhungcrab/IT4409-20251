import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../../services/(admin)/AuthApi";
// import { api } from "../../lib/axiosClient";

import toast from "react-hot-toast";


const CMSLogin = () => {
    const navigate = useNavigate();
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
            const data = await loginApi({ email, password });

            console.log("Login data: ", data.data);

            if (data.data && data.status === true) {
                localStorage.setItem("token", data.data.sessionString);
                toast.success("Đăng nhập thành công!");
                navigate("/admin/home", { replace: true });


            }

            else {
                toast.error("Sai email hoặc mật khẩu!");
            }

            // api.defaults.headers.common["Authorization"] = `Bearer ${data.data}`;
        } catch (e) {
            setError(e.message || "Có lỗi xảy ra. Vui lòng thử lại");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="flex min-h-full flex-col justify-center bg-white px-6 py-12 lg:px-80">
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

            <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label for="email" className="block text-sm/6 font-medium text-gray-900">Email</label>
                        <div className="mt-2">
                            <input
                                id="email"
                                type="email"
                                name="email"
                                required
                                autocomplete="email"
                                placeholder="Nhập email..."
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full rounded-md bg-white px-3 py-2.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#AA1D2B] sm:text-sm/6" />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label for="password" className="block text-sm/6 font-medium text-gray-900">Mật khẩu</label>
                        </div>
                        <div className="mt-2 relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                required
                                autocomplete="current-password"
                                placeholder="Nhập mật khẩu"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="block w-full rounded-md bg-white px-3 py-2.5 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-[#AA1D2B] sm:text-sm/6" />
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

                    <div>
                        <button
                            type="submit"
                            className="flex w-full justify-center rounded-md bg-[#AA1D2B] px-3 py-2.5 text-sm/6 font-semibold text-white shadow-xs hover:bg-red-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600"
                        >
                            Đăng nhập
                        </button>
                    </div>
                </form>

            </div>
        </div>
    );
};

export default CMSLogin;
