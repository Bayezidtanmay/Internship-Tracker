const styles = {
    WISHLIST: { bg: "rgba(110,168,254,0.16)", border: "rgba(110,168,254,0.45)", text: "#cfe0ff" },
    APPLIED: { bg: "rgba(160,210,255,0.14)", border: "rgba(160,210,255,0.35)", text: "#dbeaff" },
    INTERVIEW: { bg: "rgba(255,214,102,0.14)", border: "rgba(255,214,102,0.40)", text: "#ffe9b3" },
    OFFER: { bg: "rgba(81,207,102,0.14)", border: "rgba(81,207,102,0.40)", text: "#c7f5cf" },
    REJECTED: { bg: "rgba(255,107,107,0.14)", border: "rgba(255,107,107,0.40)", text: "#ffd1d1" },
};

export default function StatusBadge({ status }) {
    const s = styles[status] || { bg: "rgba(255,255,255,0.08)", border: "rgba(255,255,255,0.12)", text: "#e7eefc" };

    return (
        <span
            style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "4px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                letterSpacing: 0.2,
                background: s.bg,
                border: `1px solid ${s.border}`,
                color: s.text,
                whiteSpace: "nowrap",
            }}
        >
            {status}
        </span>
    );
}
