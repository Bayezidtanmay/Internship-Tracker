import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch, setToken } from "../api/client";

export default function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("Test User");
    const [email, setEmail] = useState("new@example.com");
    const [password, setPassword] = useState("password123");
    const [error, setError] = useState("");

    async function onSubmit(e) {
        e.preventDefault();
        setError("");
        try {
            const data = await apiFetch("/auth/register", {
                method: "POST",
                body: JSON.stringify({
                    name,
                    email,
                    password,
                    password_confirmation: password,
                }),
            });
            setToken(data.token);
            navigate("/dashboard");
        } catch (err) {
            setError(err.message || "Register failed");
        }
    }

    return (
        <div className="auth-wrap">
            <div className="auth-card">
                <h1 className="title">Create account</h1>
                <p className="muted">Start tracking your applications</p>

                <form className="form" onSubmit={onSubmit}>
                    <label className="label">
                        Name
                        <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
                    </label>

                    <label className="label">
                        Email
                        <input className="input" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </label>

                    <label className="label">
                        Password
                        <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </label>

                    {error && <div className="error">{error}</div>}

                    <button className="btn" type="submit">Register</button>
                </form>

                <p className="muted" style={{ marginTop: 12 }}>
                    Already have an account? <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
}
