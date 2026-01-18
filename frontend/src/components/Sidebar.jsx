import { NavLink } from "react-router-dom";

const links = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/applications", label: "Applications" },
    { to: "/companies", label: "Companies" },
];

export default function Sidebar() {
    return (
        <aside className="sidebar">
            <div className="sidebar-brand">Internship Tracker</div>

            <nav className="sidebar-nav">
                {links.map((l) => (
                    <NavLink
                        key={l.to}
                        to={l.to}
                        className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
                    >
                        {l.label}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer muted">
                Full Stack • React + Laravel
            </div>
        </aside>
    );
}
