import { useEffect, useState } from "react";
import { apiFetch } from "../api/client";
import StatusBadge from "../components/StatusBadge";

const STATUSES = ["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [error, setError] = useState("");

    useEffect(() => {
        apiFetch("/dashboard/summary")
            .then(setSummary)
            .catch((e) => setError(e.message || "Failed to load dashboard"));
    }, []);

    if (error) return <div className="error">{error}</div>;
    if (!summary) return <p>Loading dashboard...</p>;

    const byStatus = summary.byStatus || {};

    return (
        <div>
            <h1 className="h1">Dashboard</h1>
            <p className="muted">Track progress and plan follow-ups</p>

            <div className="card">
                <h2 className="h2">Summary</h2>
                <p>Total applications: <b>{summary.total}</b></p>

                <div className="grid">
                    {STATUSES.map((s) => (
                        <div className="mini" key={s}>
                            <div className="muted" style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                                <span>{s}</span>
                                <StatusBadge status={s} />
                            </div>
                            <div className="big">{byStatus[s] || 0}</div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="card">
                <h2 className="h2">Upcoming follow-ups</h2>
                {summary.upcomingFollowUps?.length ? (
                    <div style={{ display: "grid", gap: 10 }}>
                        {summary.upcomingFollowUps.map((a) => (
                            <div className="mini" key={a.id} style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
                                <div>
                                    <div style={{ fontWeight: 800 }}>{a.role_title}</div>
                                    <div className="muted">{a.company?.name}</div>
                                </div>
                                <div style={{ textAlign: "right" }}>
                                    <div style={{ fontWeight: 800 }}>{a.next_follow_up}</div>
                                    <StatusBadge status={a.status} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="muted">No follow-ups yet. Add applications and set a follow-up date.</p>
                )}
            </div>
        </div>
    );
}


