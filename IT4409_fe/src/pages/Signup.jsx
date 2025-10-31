// Đăng ký
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [fullname, setFullname] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const validate = () => {
        if (!email.trim()) return "Vui lòng nhập email";

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

        } catch (e) {

        }
    }

    return (
        <h1>Signup</h1>
    )
}