import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../api/client";
import StatusBadge from "../components/StatusBadge";
import Modal from "../components/Modal";
import Input from "../components/Input";
import Select from "../components/Select";

const STATUSES = ["ALL", "WISHLIST", "APPLIED", "INTERVIEW", "OFFER", "REJECTED"];
const SORTS = [
    { value: "updated_desc", label: "Recently updated" },
    { value: "created_desc", label: "Recently created" },
    { value: "applied_desc", label: "Applied date (newest)" },
    { value: "applied_asc", label: "Applied date (oldest)" },
];

function emptyForm() {
    return {
        id: null,
        company_id: "",
        role_title: "",
        status: "APPLIED",
        applied_date: "",
        next_follow_up: "",
        job_url: "",
        salary_range: "",
        notes: "",
    };
}

export default function Applications() {
    const [companies, setCompanies] = useState([]);
    const [items, setItems] = useState([]);

    const [q, setQ] = useState("");
    const [status, setStatus] = useState("ALL");
    const [sort, setSort] = useState("updated_desc");

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

    function buildQuery() {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (status !== "ALL") params.set("status", status);
        if (sort) params.set("sort", sort);
        return `/applications?${params.toString()}`;
    }

    async function load() {
        setError("");
        setLoading(true);
        try {
            const [companiesData, appsData] = await Promise.all([
                apiFetch("/companies"),
                apiFetch(buildQuery()),
            ]);
            setCompanies(companiesData);
            setItems(appsData);
        } catch (e) {
            setError(e.message || "Failed to load applications");
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // reload when filters change (debounced)
    useEffect(() => {
        const t = setTimeout(() => load(), 250);
        return () => clearTimeout(t);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [q, status, sort]);

    const companyMap = useMemo(() => {
        const m = new Map();
        companies.forEach((c) => m.set(String(c.id), c));
        return m;
    }, [companies]);

    function openCreate() {
        const firstCompany = companies[0]?.id ? String(companies[0].id) : "";
        setForm({ ...emptyForm(), company_id: firstCompany });
        setOpen(true);
    }

    function openEdit(app) {
        setForm({
            id: app.id,
            company_id: String(app.company_id),
            role_title: app.role_title || "",
            status: app.status || "APPLIED",
            applied_date: app.applied_date || "",
            next_follow_up: app.next_follow_up || "",
            job_url: app.job_url || "",
            salary_range: app.salary_range || "",
            notes: app.notes || "",
        });
        setOpen(true);
    }

    async function save(e) {
        e.preventDefault();
        setError("");

        if (!form.company_id) {
            setError("Please create a company first, then add an application.");
            return;
        }
        if (!form.role_title.trim()) {
            setError("Role title is required.");
            return;
        }

        setSaving(true);
        try {
            const payload = {
                company_id: Number(form.company_id),
                role_title: form.role_title.trim(),
                status: form.status,
                applied_date: form.applied_date || null,
                next_follow_up: form.next_follow_up || null,
                job_url: form.job_url || null,
                salary_range: form.salary_range || null,
                notes: form.notes || null,
            };

            if (isEdit) {
                await apiFetch(`/applications/${form.id}`, {
                    method: "PUT",
                    body: JSON.stringify(payload),
                });
            } else {
                await apiFetch("/applications", {
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

    async function remove(app) {
        const ok = window.confirm(`Delete "${app.role_title}"? This cannot be undone.`);
        if (!ok) return;

        setError("");
        try {
            await apiFetch(`/applications/${app.id}`, { method: "DELETE" });
            await load();
        } catch (e) {
            setError(e.message || "Delete failed");
        }
    }

    return (
        <div>
            <div className="page-head">
                <div>
                    <h1 className="h1">Applications</h1>
                    <p className="muted">Manage your internship/job applications</p>
                </div>
                <button className="btn" onClick={openCreate} disabled={!companies.length}>
                    + Add application
                </button>
            </div>

            {!companies.length && !loading && (
                <div className="card">
                    <div className="h2">No companies yet</div>
                    <p className="muted">
                        Create a company first (Companies page), then you can add applications.
                    </p>
                </div>
            )}

            <div className="card">
                <div className="filters">
                    <label className="label" style={{ flex: 1 }}>
                        Search
                        <input
                            className="input"
                            value={q}
                            placeholder="Search by role title or notes..."
                            onChange={(e) => setQ(e.target.value)}
                        />
                    </label>

                    <label className="label">
                        Status
                        <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
                            {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                    {s}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="label">
                        Sort
                        <select className="input" value={sort} onChange={(e) => setSort(e.target.value)}>
                            {SORTS.map((s) => (
                                <option key={s.value} value={s.value}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </label>
                </div>

                {error && (
                    <div className="error" style={{ marginTop: 12 }}>
                        {error}
                    </div>
                )}

                {loading ? (
                    <p style={{ marginTop: 14 }}>Loading...</p>
                ) : items.length === 0 ? (
                    <p className="muted" style={{ marginTop: 14 }}>
                        No applications found. Try adding one.
                    </p>
                ) : (
                    <div className="apps">
                        {items.map((app) => {
                            const company = companyMap.get(String(app.company_id)) || app.company;

                            return (
                                <div className="app-row" key={app.id}>
                                    <div className="app-main">
                                        <div className="app-title">
                                            <Link to={`/applications/${app.id}`} className="app-link">
                                                {app.role_title}
                                            </Link>
                                        </div>

                                        <div className="muted app-sub">
                                            <span>{company?.name || "Company"}</span>
                                            {app.applied_date ? <span>• Applied: {app.applied_date}</span> : null}
                                            {app.next_follow_up ? (
                                                <span>• Follow-up: {app.next_follow_up}</span>
                                            ) : null}
                                        </div>
                                    </div>

                                    <div className="app-right">
                                        <StatusBadge status={app.status} />
                                        <div className="app-actions">
                                            <button className="btn secondary" onClick={() => openEdit(app)}>
                                                Edit
                                            </button>
                                            <button className="btn danger" onClick={() => remove(app)}>
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Modal
                open={open}
                title={isEdit ? "Edit application" : "New application"}
                onClose={() => setOpen(false)}
            >
                <form className="form" onSubmit={save}>
                    <Select
                        label="Company"
                        value={form.company_id}
                        onChange={(v) => setForm((f) => ({ ...f, company_id: v }))}
                    >
                        <option value="">Select company</option>
                        {companies.map((c) => (
                            <option key={c.id} value={c.id}>
                                {c.name}
                            </option>
                        ))}
                    </Select>

                    <Input
                        label="Role title"
                        value={form.role_title}
                        onChange={(v) => setForm((f) => ({ ...f, role_title: v }))}
                        placeholder="e.g., Full Stack Intern"
                    />

                    <Select
                        label="Status"
                        value={form.status}
                        onChange={(v) => setForm((f) => ({ ...f, status: v }))}
                    >
                        {STATUSES.filter((s) => s !== "ALL").map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </Select>

                    <div className="two-col">
                        <Input
                            label="Applied date"
                            type="date"
                            value={form.applied_date}
                            onChange={(v) => setForm((f) => ({ ...f, applied_date: v }))}
                        />
                        <Input
                            label="Next follow-up"
                            type="date"
                            value={form.next_follow_up}
                            onChange={(v) => setForm((f) => ({ ...f, next_follow_up: v }))}
                        />
                    </div>

                    <Input
                        label="Job URL"
                        value={form.job_url}
                        onChange={(v) => setForm((f) => ({ ...f, job_url: v }))}
                        placeholder="https://..."
                    />

                    <div className="two-col">
                        <Input
                            label="Salary range"
                            value={form.salary_range}
                            onChange={(v) => setForm((f) => ({ ...f, salary_range: v }))}
                            placeholder="e.g., 2500–3000€/mo"
                        />
                        <div />
                    </div>

                    <label className="label">
                        Notes
                        <textarea
                            className="input"
                            rows={4}
                            value={form.notes}
                            placeholder="Interview details, contact person, etc..."
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