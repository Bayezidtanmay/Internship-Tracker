export default function Input({ label, value, onChange, type = "text", placeholder }) {
    return (
        <label className="label">
            {label}
            <input
                className="input"
                type={type}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
            />
        </label>
    );
}
