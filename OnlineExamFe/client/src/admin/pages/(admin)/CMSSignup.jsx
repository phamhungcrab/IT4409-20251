// ÄÄƒng kÃ½
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const CMSSignup = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const validate = () => {
        if (!email.trim()) return "Vui lÃ²ng nháº­p email!";

        const re = /^\S+@\S+\.\S+$/;
        if (!re.test(email)) return "Äá»‹a chá»‰ email khÃ´ng há»£p lá»‡.";

        if (!password.trim()) return "Vui lÃ²ng nháº­p máº­t kháº©u";

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
            setError(e.message || "CÃ³ lá»—i xáº£y ra. Vui lÃ²ng thá»­ láº¡i");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full bg-white shadow-lg rounded-2xl p-8">
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-semibold">ÄÄƒng kÃ½</h1>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">
                            TÃªn
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Nháº­p há» tÃªn Ä‘áº§y Ä‘á»§ cá»§a báº¡n"
                            className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                            required
                            aria-required
                        />
                    </div>

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
                            Máº­t kháº©u
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nháº­p máº­t kháº©u"
                                className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                required
                                aria-required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
                                aria-label={showPassword ? "áº¨n máº­t kháº©u" : "Hiá»‡n máº­t kháº©u"}
                            >
                                {showPassword ? (<EyeOff className="w-5 h-5 text-gray-500" />) : (<Eye className="w-5 h-5 text-gray-500" />)}
                            </button>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="password">
                            Nháº­p láº¡i máº­t kháº©u
                        </label>
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="XÃ¡c nháº­n máº­t kháº©u"
                                className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                required
                                aria-required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((s) => !s)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-gray-600 hover:text-gray-800"
                                aria-label={showPassword ? "áº¨n máº­t kháº©u" : "Hiá»‡n máº­t kháº©u"}
                            >
                                {showPassword ? (<EyeOff className="w-5 h-5 text-gray-500" />) : (<Eye className="w-5 h-5 text-gray-500" />)}
                            </button>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-medium rounded-lg shadow hover:bg-indigo-700 disabled:opacity-60"
                        >
                            ÄÄƒng kÃ½
                        </button>
                    </div>

                    <p className="text-center text-sm text-gray-500 mt-3">
                        ÄÃ£ cÃ³ tÃ i khoáº£n? <a href="/login" className="text-indigo-600 hover:underline">ÄÄƒng nháº­p</a>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default CMSSignup;


