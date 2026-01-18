import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Navbar() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    function onLogout() {
        logout();
        navigate("/login");
    }

    return (
        <header className="topnav">
            <div className="topnav-left">
                <div className="topnav-title">Welcome, {user?.name}</div>
                <div className="muted" style={{ fontSize: 13 }}>{user?.email}</div>
            </div>

            <button className="btn secondary" onClick={onLogout}>
                Logout
            </button>
        </header>
    );
}
