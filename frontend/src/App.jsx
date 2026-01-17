import { useState } from "react";
import { apiFetch, setToken } from "./lib/api";

export default function App() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password123");
  const [me, setMe] = useState(null);
  const [msg, setMsg] = useState("");

  async function login() {
    setMsg("");
    try {
      const data = await apiFetch("/auth/login", {
        method: "POST",
        body: { email, password },
      });
      setToken(data.token);
      setMsg("Logged in ✅");
    } catch (e) {
      setMsg(e.message);
    }
  }

  async function loadMe() {
    setMsg("");
    try {
      const data = await apiFetch("/auth/me");
      setMe(data.user);
    } catch (e) {
      setMsg(e.message);
    }
  }

  return (
    <div style={{ maxWidth: 480, margin: "40px auto", fontFamily: "system-ui" }}>
      <h1>Internship Tracker</h1>

      <div style={{ display: "grid", gap: 10 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
        <button onClick={login}>Login</button>
        <button onClick={loadMe}>Get Me</button>
      </div>

      {msg && <p style={{ marginTop: 12 }}>{msg}</p>}
      {me && (
        <pre style={{ marginTop: 12, padding: 12, background: "#f6f6f6", borderRadius: 8 }}>
          {JSON.stringify(me, null, 2)}
        </pre>
      )}
    </div>
  );
}

