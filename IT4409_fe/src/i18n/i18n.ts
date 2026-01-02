import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./en.json";
import vi from "./vi.json";

i18n.use(initReactI18next).init({
    resources: {
        en: { translation: en },
        vi: { translation: vi }, // ✅ thêm file tiếng Việt
    },
    lng: "vi", // ✅ ngôn ngữ mặc định (ban đầu sẽ hiển thị tiếng Việt)
    fallbackLng: "vi", // ✅ dùng tiếng Việt nếu không tìm thấy key
    interpolation: {
        escapeValue: false, // React đã tự escape
    },
});

export default i18n;