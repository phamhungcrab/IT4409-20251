import { Sidebar } from "./Sidebar";
import { Outlet } from "react-router-dom";

export function Layout() {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <Sidebar />
            <main className="ml-64 flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}
