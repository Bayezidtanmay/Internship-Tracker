import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import { useAuth } from "../auth/AuthContext";

export default function Dashboard() {
    const { user, logout } = useAuth();
    const [summary, setSummary] = useState(null);

    useEffect(() => {
        apiFetch("/dashboard/summary").then(setSummary).catch(() => setSummary({ total: 0, byStatus: {} }));
    }, []);

    return (
        <div className="page">
            <div className="topbar">
                <div>
                    <h1 className="h1">Dashboard</h1>
                    <p className="muted">Welcome, {user?.name}</p>
                </div>
                <button className="btn secondary" onClick={logout}>Logout</button>
            </div>

            {!summary ? (
                <p>Loading...</p>
            ) : (
                <div className="card">
                    <h2 className="h2">Summary</h2>
                    <p>Total applications: <b>{summary.total}</b></p>
                    <div className="grid">
                        {Object.entries(summary.byStatus || {}).map(([status, count]) => (
                            <div className="mini" key={status}>
                                <div className="muted">{status}</div>
                                <div className="big">{count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

