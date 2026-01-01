const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("session");
    window.location.href = "/auth";
}

export default handleLogout;