import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import FollowUpDoneModal from "../components/FollowUpDoneModal";

const STATUSES = ["WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"];

export default function Dashboard() {
    const [summary, setSummary] = useState(null);
    const [followups, setFollowups] = useState(null);

    const [range, setRange] = useState("week"); // "today" | "week"
    const [loading, setLoading] = useState(true);
    const [loadingFollowups, setLoadingFollowups] = useState(true);
    const [error, setError] = useState("");

    // modal state
    const [openDone, setOpenDone] = useState(false);
    const [selectedApp, setSelectedApp] = useState(null);

    async function loadSummary() {
        setError("");
        setLoading(true);
        try {
            const data = await apiFetch("/dashboard/summary");
            setSummary(data);
        } catch (e) {
            setError(e.message || "Failed to load dashboard summary");
        } finally {
            setLoading(false);
        }
    }

    async function loadFollowups(nextRange = range) {
        setError("");
        setLoadingFollowups(true);
        try {
            const data = await apiFetch(`/dashboard/followups?range=${nextRange}`);
            setFollowups(data);
        } catch (e) {
            setError(e.message || "Failed to load follow-ups");
        } finally {
            setLoadingFollowups(false);
        }
    }

    useEffect(() => {
        loadSummary();
        loadFollowups("week");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // refresh followups when changing range
    useEffect(() => {
        loadFollowups(range);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [range]);

    const byStatus = useMemo(() => summary?.byStatus || {}, [summary]);

    function openMarkDone(app) {
        setSelectedApp(app);
        setOpenDone(true);
    }

    async function submitDone(payload) {
        if (!selectedApp) return;
        setError("");
        try {
            await apiFetch(`/applications/${selectedApp.id}/followup/done`, {
                method: "POST",
                body: JSON.stringify(payload),
            });

            setOpenDone(false);
            setSelectedApp(null);

            // Reload both: followups list + summary counts
            await Promise.all([loadFollowups(range), loadSummary()]);
        } catch (e) {
            setError(e.message || "Failed to mark follow-up done");
        }
    }

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1 className="h1">Dashboard</h1>
                    <p className="muted">Track progress and follow-ups</p>
                </div>
                <Link className="btn" to="/applications">
                    View applications
                </Link>
            </div>

            {error && <div className="error">{error}</div>}

            {/* Summary */}
            <div className="card">
                <h2 className="h2">Summary</h2>

                {loading || !summary ? (
                    <p>Loading...</p>
                ) : (
                    <>
                        <p>
                            Total applications: <b>{summary.total}</b>
                        </p>

                        <div className="grid">
                            {STATUSES.map((s) => (
                                <div className="mini" key={s}>
                                    <div
                                        className="muted"
                                        style={{ display: "flex", justifyContent: "space-between", gap: 10 }}
                                    >
                                        <span>{s}</span>
                                        <StatusBadge status={s} />
                                    </div>
                                    <div className="big">{byStatus[s] || 0}</div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Follow-ups */}
            <div className="card">
                <div className="followups-head">
                    <div>
                        <h2 className="h2" style={{ margin: 0 }}>
                            Follow-ups
                        </h2>
                        <p className="muted" style={{ marginTop: 6 }}>
                            {followups?.from && followups?.to
                                ? `Showing ${followups.from} → ${followups.to}`
                                : " "}
                        </p>
                    </div>

                    <div className="segmented">
                        <button
                            className={`seg-btn ${range === "today" ? "active" : ""}`}
                            onClick={() => setRange("today")}
                            type="button"
                        >
                            Due today
                        </button>
                        <button
                            className={`seg-btn ${range === "week" ? "active" : ""}`}
                            onClick={() => setRange("week")}
                            type="button"
                        >
                            Due this week
                        </button>
                    </div>
                </div>

                {loadingFollowups || !followups ? (
                    <p>Loading follow-ups...</p>
                ) : followups.items.length === 0 ? (
                    <p className="muted">
                        No follow-ups due {range === "today" ? "today" : "this week"}.
                    </p>
                ) : (
                    <div className="followups">
                        {followups.items.map((a) => (
                            <div className="followup-row" key={a.id}>
                                <div className="followup-main">
                                    <div className="followup-title">
                                        <Link className="app-link" to={`/applications/${a.id}`}>
                                            {a.role_title}
                                        </Link>
                                    </div>
                                    <div className="muted" style={{ fontSize: 13 }}>
                                        <span style={{ fontWeight: 800 }}>{a.company?.name}</span>
                                        {a.next_follow_up ? <span> • Due: {a.next_follow_up}</span> : null}
                                    </div>
                                </div>

                                <div className="followup-right">
                                    <StatusBadge status={a.status} />
                                    <button className="btn secondary" onClick={() => openMarkDone(a)}>
                                        Mark done
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <FollowUpDoneModal
                open={openDone}
                onClose={() => {
                    setOpenDone(false);
                    setSelectedApp(null);
                }}
                app={selectedApp}
                onSubmit={submitDone}
            />
        </div>
    );
}


