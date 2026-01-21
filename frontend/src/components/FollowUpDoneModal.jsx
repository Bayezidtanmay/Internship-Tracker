import { useState } from "react";
import Modal from "./Modal";
import Input from "./Input";

export default function FollowUpDoneModal({ open, onClose, app, onSubmit }) {
    const [note, setNote] = useState("Sent follow-up message");
    const [nextFollowUp, setNextFollowUp] = useState("");

    // Reset when opening a different app
    if (!open) return null;

    async function handleSubmit(e) {
        e.preventDefault();
        await onSubmit({
            note: note.trim() || null,
            next_follow_up: nextFollowUp || null,
        });
    }

    return (
        <Modal
            open={open}
            title={`Mark follow-up done${app?.role_title ? `: ${app.role_title}` : ""}`}
            onClose={onClose}
        >
            <form className="form" onSubmit={handleSubmit}>
                <label className="label">
                    Note (optional)
                    <textarea
                        className="input"
                        rows={3}
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="e.g., Sent follow-up email to recruiter"
                    />
                </label>

                <Input
                    label="Set next follow-up date (optional)"
                    type="date"
                    value={nextFollowUp}
                    onChange={setNextFollowUp}
                />

                <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
                    <button type="button" className="btn secondary" onClick={onClose}>
                        Cancel
                    </button>
                    <button className="btn" type="submit">
                        Mark done
                    </button>
                </div>
            </form>
        </Modal>
    );
}
