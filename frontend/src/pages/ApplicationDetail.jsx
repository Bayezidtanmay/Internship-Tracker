import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Select from "../components/Select";

const EVENT_TYPES = ["NOTE", "FOLLOW_UP", "INTERVIEW", "OFFER", "REJECTED", "APPLIED", "STATUS_CHANGED"];

export default function ApplicationDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [app, setApp] = useState(null);
    const [events, setEvents] = useState([]);
    const [error, setError] = useState("");

    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);

    const [type, setType] = useState("NOTE");
    const [eventDate, setEventDate] = useState("");
    const [note, setNote] = useState("");

    async function load() {
        setError("");
        try {
            const data = await apiFetch(`/applications/${id}`);
            setApp(data);
            setEvents(data.events || []);
        } catch (e) {
            setError(e.message || "Failed to load application");
        }
    }

    useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

    async function addEvent(e) {
        e.preventDefault();
        setSaving(true);
        setError("");
        try {
            const created = await apiFetch(`/applications/${id}/events`, {
                method: "POST",
                body: JSON.stringify({
                    type,
                    event_date: eventDate || null,
                    note: note || null,
                }),
            });
            setOpen(false);
            setType("NOTE");
            setEventDate("");
            setNote("");
            setEvents((prev) => [created, ...prev]);
        } catch (e2) {
            setError(e2.message || "Failed to add event");
        } finally {
            setSaving(false);
        }
    }

    async function deleteEvent(eventId) {
        const ok = window.confirm("Delete this event?");
        if (!ok) return;
        setError("");
        try {
            await apiFetch(`/applications/${id}/events/${eventId}`, { method: "DELETE" });
            setEvents((prev) => prev.filter((x) => x.id !== eventId));
        } catch (e) {
            setError(e.message || "Failed to delete event");
        }
    }

    if (error) return <div className="error">{error}</div>;
    if (!app) return <p>Loading...</p>;

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1 className="h1">{app.role_title}</h1>
                    <p className="muted">
                        <span style={{ fontWeight: 800 }}>{app.company?.name}</span>
                        {app.applied_date ? <span> • Applied: {app.applied_date}</span> : null}
                        {app.next_follow_up ? <span> • Follow-up: {app.next_follow_up}</span> : null}
                    </p>
                </div>

                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                    <StatusBadge status={app.status} />
                    <button className="btn secondary" onClick={() => navigate("/applications")}>Back</button>
                    <button className="btn" onClick={() => setOpen(true)}>+ Add event</button>
                </div>
            </div>

            {app.notes ? (
                <div className="card">
                    <h2 className="h2">Notes</h2>
                    <p className="muted">{app.notes}</p>
                    {app.job_url ? (
                        <p style={{ marginTop: 10 }}>
                            <a href={app.job_url} target="_blank" rel="noreferrer">Open job link</a>
                        </p>
                    ) : null}
                </div>
            ) : null}

            <div className="card">
                <div className="page-head" style={{ marginBottom: 10 }}>
                    <h2 className="h2" style={{ margin: 0 }}>Timeline</h2>
                    <Link className="muted" to="/applications">Go to Applications</Link>
                </div>

                {events.length === 0 ? (
                    <p className="muted">No events yet. Add your first note or follow-up.</p>
                ) : (
                    <div className="timeline">
                        {events.map((ev) => (
                            <div className="timeline-item" key={ev.id}>
                                <div className="timeline-left">
                                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                                        <span className="pill">{ev.type}</span>
                                        {ev.event_date ? <span className="muted">{ev.event_date}</span> : null}
                                    </div>
                                    {ev.note ? <div style={{ marginTop: 6 }}>{ev.note}</div> : <div className="muted">No note</div>}
                                </div>
                                <button className="btn danger" onClick={() => deleteEvent(ev.id)}>Delete</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal open={open} title="Add timeline event" onClose={() => setOpen(false)}>
                <form className="form" onSubmit={addEvent}>
                    <Select label="Type" value={type} onChange={setType}>
                        {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                    </Select>

                    <Input label="Event date (optional)" type="date" value={eventDate} onChange={setEventDate} />

                    <label className="label">
                        Note (optional)
                        <textarea className="input" rows={4} value={note} onChange={(e) => setNote(e.target.value)} />
                    </label>

                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <button type="button" className="btn secondary" onClick={() => setOpen(false)}>Cancel</button>
                        <button className="btn" type="submit" disabled={saving}>{saving ? "Saving..." : "Add event"}</button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
