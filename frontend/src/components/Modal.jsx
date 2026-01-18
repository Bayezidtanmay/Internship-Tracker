export default function Modal({ title, open, onClose, children }) {
    if (!open) return null;

    function onBackdrop(e) {
        if (e.target === e.currentTarget) onClose();
    }

    return (
        <div className="modal-backdrop" onMouseDown={onBackdrop}>
            <div className="modal">
                <div className="modal-head">
                    <div>
                        <div className="modal-title">{title}</div>
                        <div className="modal-sub muted">Press Esc or click outside to close</div>
                    </div>
                    <button className="btn secondary" onClick={onClose}>Close</button>
                </div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
}
