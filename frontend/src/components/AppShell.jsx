import Sidebar from "./Sidebar";
import Navbar from "./Navbar";

export default function AppShell({ children }) {
    return (
        <div className="shell">
            <Sidebar />
            <div className="shell-main">
                <Navbar />
                <main className="shell-content">{children}</main>
            </div>
        </div>
    );
}
