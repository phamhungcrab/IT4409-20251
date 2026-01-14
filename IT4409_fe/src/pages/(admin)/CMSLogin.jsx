import { useState } from "react";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginApi } from "../../services/(admin)/AuthApi";
import toast from "react-hot-toast";

const CMSLogin = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!email.trim())
            return "Vui lòng nhập email!";
        const re = /^\S+@\S+\.\S+$/;
        if (!re.test(email))
            return "Địa chỉ email không hợp lệ.";
        if (!password.trim())
            return "Vui lòng nhập mật khẩu";
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

            if (data.messageCode === 401) {
                toast.error("Sai mật khẩu. Vui lòng đăng nhập lại")
            }

            else if (data.data.sessionString !== null && data.data.user.role === "ADMIN") {
                localStorage.setItem("session", data.data.sessionString);
                localStorage.setItem("role", data.data.user.role);
                localStorage.setItem("admin-name", data.data.user.fullName);
                localStorage.setItem("admin-email", data.data.user.email);
                // console.log("Admin info: ", localStorage.getItem("admin-info"))
                toast.success("Đăng nhập thành công!");
                navigate("/", { replace: true });
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
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-[#0F1115] text-gray-200">
            <div className="lg:block relative">
                <img
                    src="/working-on-3d-render-YTDE63PFWG-w600.jpg"
                    alt="CMS Login"
                    className="absolute inset-0 w-full h-full"
                />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/70 via-black/40 to-transparent" />

            </div>

            <div className="flex items-center justify-center px-6">
                <div className="w-full max-w-md">
                    <h2 className="text-2xl font-semibold mb-2">
                        Quản trị Nền tảng thi cử trực tuyến
                    </h2>
                    <p className="text-sm text-gray-400 mb-8">
                        Vui lòng đăng nhập để tiếp tục
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="text-sm text-gray-400">
                                Email
                            </label>
                            <div className="relative mt-2">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type="email"
                                    placeholder="Nhập tên đăng nhập"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#1A1D23] text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm text-gray-400">
                                Mật khẩu
                            </label>
                            <div className="relative mt-2">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-5 h-5" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full pl-10 pr-12 py-3 rounded-xl bg-[#1A1D23] text-gray-200 placeholder-gray-500 outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-gray-400">
                                <input type="checkbox" className="accent-indigo-500" />
                                Nhớ tài khoản
                            </label>
                            <button
                                type="button"
                                className="text-indigo-400 hover:underline"
                            >
                                Quên mật khẩu?
                            </button>
                        </div> */}

                        <button
                            type="submit"
                            className="w-full py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-90 transition"
                        >
                            Đăng nhập
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default CMSLogin;
