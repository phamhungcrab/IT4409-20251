import { useState, useEffect } from "react";
import { CommonButton } from "../../components/Button";
import { getAbout } from "../../services/(admin)/AuthApi";
import toast from "react-hot-toast";

const UserProfile = () => {
    const [userData, setUserData] = useState(null);

    const getAboutData = async () => {
        const aboutRes = await getAbout();
        setUserData(aboutRes);
    }

    useEffect(() => {
        getAboutData();
    }, []);

    if (!userData) return <div className="p-6">Đang tải thông tin...</div>;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString("vi-VN");
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Hồ sơ cá nhân</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-2xl shadow-sm p-6 flex flex-col items-center border border-gray-100">
                        <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-4xl font-bold mb-4 border-4 border-white shadow-md">
                            {userData.fullName.charAt(0)}
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">{userData.fullName}</h2>
                        <p className="text-sm text-gray-500 mb-4">{userData.email}</p>

                        <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase ${userData.role === "ADMIN" ? "bg-purple-100 text-purple-700" : "bg-blue-100 text-blue-700"
                            }`}>
                            {userData.role}
                        </span>

                        <div className="w-full mt-6 space-y-3 border-t pt-6">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">MSSV:</span>
                                <span className="font-semibold text-gray-700">{userData.mssv}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-500">Ngày sinh:</span>
                                <span className="font-semibold text-gray-700">{formatDate(userData.dateOfBirth)}</span>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.040L3 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622l-.382-3.016z" />
                            </svg>
                            Quyền hạn hệ thống
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {userData.userPermission.map((permission) => (
                                <div
                                    key={permission.id}
                                    className="p-4 rounded-xl border border-gray-100 bg-gray-50 hover:border-blue-200 transition-all group"
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="text-xs font-bold text-blue-600 mb-1">{permission.code}</p>
                                            <p className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                                                {permission.name}
                                            </p>
                                        </div>
                                        <span className="text-[10px] bg-white px-2 py-0.5 rounded border text-gray-400">
                                            Index: {permission.index}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {userData.userPermission.length === 0 && (
                            <div className="text-center py-10 text-gray-400">
                                Bạn không có quyền hạn nào được gán.
                            </div>
                        )}
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;