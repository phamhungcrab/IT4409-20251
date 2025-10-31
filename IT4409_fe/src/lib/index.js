const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
}

export default handleLogout;