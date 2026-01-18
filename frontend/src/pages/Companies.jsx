import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../api/client";
import Modal from "../components/Modal";
import Input from "../components/Input";

function emptyForm() {
    return {
        id: null,
        name: "",
        website: "",
        location: "",
        notes: "",
    };
}

export default function Companies() {
    const [items, setItems] = useState([]);
    const [q, setQ] = useState("");

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [open, setOpen] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(emptyForm());
    const isEdit = !!form.id;

    // close modal on ESC
    useEffect(() => {
        function onKey(e) {
            if (e.key === "Escape") setOpen(false);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, []);

    async function load() {
        setError("");
        setLoading(true);
        try {
            const data = await apiFetch("/companies");
            setItems(data);
        } catch (e) {
            setError(e.message || "Failed to load companies");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filtered = useMemo(() => {
        const term = q.trim().toLowerCase();
        if (!term) return items;
        return items.filter((c) =>
            [c.name, c.website, c.location, c.notes].some((v) =>
                (v || "").toLowerCase().includes(term)
            )
        );
    }, [items, q]);

    function openCreate() {
        setForm(emptyForm());
        setOpen(true);
    }

    function openEdit(c) {
        setForm({
            id: c.id,
            name: c.name || "",
            website: c.website || "",
            location: c.location || "",
            notes: c.notes || "",
        });
        setOpen(true);
    }

    async function save(e) {
        e.preventDefault();
        setError("");

        if (!form.name.trim()) {
            setError("Company name is required.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                name: form.name.trim(),
                website: form.website.trim() || null,
                location: form.location.trim() || null,
                notes: form.notes.trim() || null,
            };

            if (isEdit) {
                await apiFetch(`/companies/${form.id}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
            } else {
                await apiFetch("/companies", {
                    method: "POST",
                    body: JSON.stringify(payload),
                });
            }

            setOpen(false);
            await load();
        } catch (e2) {
            setError(e2.message || "Save failed");
        } finally {
            setSaving(false);
        }
    }

    async function remove(c) {
        const ok = window.confirm(`Delete "${c.name}"? This cannot be undone.`);
        if (!ok) return;

        setError("");
        try {
            await apiFetch(`/companies/${c.id}`, { method: "DELETE" });
            await load();
        } catch (e) {
            // If backend prevents delete (foreign key), show message
            setError(e.message || "Delete failed. This company may have applications linked.");
        }
    }

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1 className="h1">Companies</h1>
                    <p className="muted">Manage the companies you apply to</p>
                </div>
                <button className="btn" onClick={openCreate}>
                    + Add company
                </button>
            </div>

            <div className="card">
                <div className="filters">
                    <label className="label" style={{ flex: 1 }}>
                        Search
                        <input
                            className="input"
                            value={q}
                            placeholder="Search by name, location, website..."
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </label>
                </div>

                {error && <div className="error" style={{ marginTop: 12 }}>{error}</div>}

                {loading ? (
                    <p style={{ marginTop: 14 }}>Loading...</p>
                ) : filtered.length === 0 ? (
                    <p className="muted" style={{ marginTop: 14 }}>
                        No companies found. Add your first company.
                    </p>
                ) : (
                    <div className="companies">
                        {filtered.map((c) => (
                            <div className="company-row" key={c.id}>
                                <div className="company-main">
                                    <div className="company-title">{c.name}</div>
                                    <div className="muted company-sub">
                                        {c.location ? <span>{c.location}</span> : null}
                                        {c.website ? (
                                            <span>
                                                •{" "}
                                                <a href={c.website} target="_blank" rel="noreferrer">
                                                    {c.website}
                                                </a>
                                            </span>
                                        ) : null}
                                    </div>
                                    {c.notes ? <div className="muted" style={{ marginTop: 6 }}>{c.notes}</div> : null}
                                </div>

                                <div className="company-actions">
                                    <button className="btn secondary" onClick={() => openEdit(c)}>
                                        Edit
                                    </button>
                                    <button className="btn danger" onClick={() => remove(c)}>
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <Modal
                open={open}
                title={isEdit ? "Edit company" : "New company"}
                onClose={() => setOpen(false)}
            >
                <form className="form" onSubmit={save}>
                    <Input
                        label="Company name"
                        value={form.name}
                        onChange={(v) => setForm((f) => ({ ...f, name: v }))}
                        placeholder="e.g., Supercell"
                    />

                    <div className="two-col">
                        <Input
                            label="Location"
                            value={form.location}
                            onChange={(v) => setForm((f) => ({ ...f, location: v }))}
                            placeholder="e.g., Helsinki"
                        />
                        <Input
                            label="Website"
                            value={form.website}
                            onChange={(v) => setForm((f) => ({ ...f, website: v }))}
                            placeholder="https://..."
                        />
                    </div>

                    <label className="label">
                        Notes
                        <textarea
                            className="input"
                            rows={4}
                            value={form.notes}
                            placeholder="Contact person, notes about company, etc..."
                            onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                        />
                    </label>

                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                        <button type="button" className="btn secondary" onClick={() => setOpen(false)}>
                            Cancel
                        </button>
                        <button className="btn" type="submit" disabled={saving}>
                            {saving ? "Saving..." : isEdit ? "Save changes" : "Create"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
