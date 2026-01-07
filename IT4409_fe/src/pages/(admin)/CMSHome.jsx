// Trang chủ quản trị

import { useEffect, useState } from "react"
import { getAbout } from "../../services/(admin)/AuthApi";

const CMSHome = () => {

    const [about, setAbout] = useState(null);

    const getAboutData = async () => {
        const aboutRes = await getAbout();
        setAbout(aboutRes);
    }

    useEffect(() => {
        getAboutData();
    }, []);

    return (
        <div>
            <h1>Dashboard</h1>
        </div>
    )
}

export default CMSHome