import { useState, useEffect } from "react";
import { CommonButton } from "../../components/Button";
import { changePassword, getAbout } from "../../services/(admin)/AuthApi";
import toast from "react-hot-toast";

const UserProfile = () => {
    const [userData, setUserData] = useState(null);
    const [passwordData, setPasswordData] = useState({
        email: "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: ""
    });
    const [loading, setLoading] = useState(false);

    const getAboutData = async () => {
        const aboutRes = await getAbout();
        setUserData(aboutRes);
        setPasswordData(prev => ({ ...prev, email: aboutRes.email }));
    }

    useEffect(() => {
        getAboutData();
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setPasswordData(prev => ({ ...prev, [name]: value }));
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("Mật khẩu mới không khớp!");
            return;
        }

        setLoading(true);
        try {
            await changePassword(passwordData);
            toast.success("Đổi mật khẩu thành công!");
            setPasswordData({ ...passwordData, oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (error) {
            toast.error("Có lỗi xảy ra, vui lòng thử lại.");
        } finally {
            setLoading(false);
        }
    };

    if (!userData) return <div className="p-6">Đang tải thông tin...</div>;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    return (
        <div className="p-6 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Hồ sơ cá nhân</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 flex flex-col">
                    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center border border-gray-100 h-full">
                        <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold mb-4 border-4 border-white shadow-md">
                            {userData.fullName.charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">{userData.fullName}</h2>
                        <p className="text-sm text-gray-500 mb-4">{userData.email}</p>

                        <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${userData.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"}`}>
                            {userData.role}
                        </span>

                        <div className="w-full mt-6 space-y-3 border-t pt-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Mã số</span>
                                <span className="font-semibold text-gray-700">{userData.mssv}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Ngày sinh:</span>
                                <span className="font-semibold text-gray-700">{formatDate(userData.dateOfBirth)}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="lg:col-span-2 flex flex-col">
                    <div className="rounded-2xl shadow-sm p-8 border border-gray-100 h-full">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 00-2 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                            Đổi mật khẩu
                        </h3>

                        <form onSubmit={handleChangePassword} className="space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="email"
                                    name="email"
                                    disabled
                                    value={passwordData.email}
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 cursor-not-allowed"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu cũ</label>
                                <input
                                    type="password"
                                    name="oldPassword"
                                    required
                                    value={passwordData.oldPassword}
                                    onChange={handleInputChange}
                                    placeholder="••••••••"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                                    <input
                                        type="password"
                                        name="newPassword"
                                        required
                                        value={passwordData.newPassword}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        required
                                        value={passwordData.confirmPassword}
                                        onChange={handleInputChange}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-gray-800 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-50">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className={`w-full md:w-auto px-8 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200 flex items-center justify-center gap-2 ${loading ? "opacity-70 cursor-not-allowed" : ""}`}
                                >
                                    {loading ? "Đang xử lý..." : "Cập nhật mật khẩu"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;