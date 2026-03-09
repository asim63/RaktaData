import { useState } from "react";
import Logo from "./Logo";
import { apiLogin } from "../api";

const LoginModal = ({ onClose, onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr]           = useState("");
  const [loading, setLoading]   = useState(false);

  const handleLogin = async () => {
    if (!username || !password) { setErr("Please enter username and password."); return; }
    setLoading(true); setErr("");
    try {
      const data = await apiLogin(username, password);
      localStorage.setItem("token", data.token);
      const user = data.user;
      user.name = user.name || user.staff_name || user.admin_name || user.username;
      onLogin(user);
    } catch (e) {
      setErr(e.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: "380px" }}>
        <div style={{ textAlign: "center", marginBottom: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
          <Logo />
          <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "1.2rem", margin: 0 }}>Welcome back</h2>
          <p style={{ fontSize: "0.82rem", color: "var(--text-3)", margin: 0 }}>Sign in to your account</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input className="form-input" placeholder="Enter username" value={username}
              onChange={e => setUsername(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" placeholder="Enter password" value={password}
              onChange={e => setPassword(e.target.value)} onKeyDown={e => e.key === "Enter" && handleLogin()} />
          </div>
          {err && (
            <div style={{ background: "var(--red-light)", border: "1px solid var(--red-mid)", borderRadius: "6px", padding: "9px 12px", fontSize: "0.8rem", color: "var(--red)" }}>
              {err}
            </div>
          )}
          <button className="btn btn-primary"
            style={{ width: "100%", justifyContent: "center", padding: "11px", marginTop: "4px", opacity: loading ? 0.7 : 1 }}
            onClick={handleLogin} disabled={loading}>
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
