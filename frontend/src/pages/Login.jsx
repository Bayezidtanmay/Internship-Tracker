import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();

    const [email, setEmail] = useState("test@example.com");
    const [password, setPassword] = useState("password123");
    const [error, setError] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        try {
            await login(email, password);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Login failed");
        }
    }

    return (
        <div className="auth-wrap">
            <div className="auth-card">
                <h1 className="title">Internship Tracker</h1>
                <p className="muted">Sign in to your dashboard</p>

                <form className="form" onSubmit={onSubmit}>
                    <label className="label">
                        Email
                        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </label>

                    <label className="label">
                        Password
                        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </label>

                    {error && <div className="error">{error}</div>}

                    <button className="btn" type="submit">Login</button>
                </form>

                <p className="muted" style={{ marginTop: 12 }}>
                    No account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}
