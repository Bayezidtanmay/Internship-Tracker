export default function Select({ label, value, onChange, children }) {
    return (
        <label className="label">
            {label}
            <select className="input" value={value} onChange={(e) => onChange(e.target.value)}>
                {children}
            </select>
        </label>
    );
}
