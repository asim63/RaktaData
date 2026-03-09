import { useState } from "react";
import Logo from "../../components/Logo";
import PublicNav from "../../components/PublicNav";
import Icon from "../../components/Icons";
import { createPortal } from "react-dom";
import { apiRegister } from "../../api";

const RegisterPage = ({ setPage, onLogin, dark, onToggleTheme }) => {
  const [form, setForm] = useState({ name:"", date_of_birth:"", phone_no:"", email:"", address:"", username:"", password:"", confirm:"" });
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const showToast = (msg, type) => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };

  const handleReg = async () => {
    if (!form.name || !form.username || !form.password || !form.phone_no) { showToast("Fill all required fields", "error"); return; }
    if (form.password !== form.confirm) { showToast("Passwords do not match", "error"); return; }
    setLoading(true);
    try {
      await apiRegister({ name: form.name, date_of_birth: form.date_of_birth || undefined, phone_no: form.phone_no, email: form.email || undefined, address: form.address || undefined, username: form.username, password: form.password });
      showToast("Registration successful! Please log in.", "success");
      setTimeout(() => setPage("Home"), 1800);
    } catch(e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  };

  const field = (label, key, props = {}) => (
    <div className="form-group">
      <label className="form-label">{label}{props.required && <span className="req"> *</span>}</label>
      <input
        className="form-input"
        value={form[key]}
        onChange={e => up(key, e.target.value)}
        onKeyDown={e => e.key === "Enter" && handleReg()}
        {...props}
        required={undefined}
      />
    </div>
  );

  return (
    <>
      <PublicNav page="Register" setPage={setPage} onLogin={onLogin} dark={dark} onToggleTheme={onToggleTheme} />

      <div className="fade-in reg-page-bg" style={{
        minHeight: "calc(100vh - 60px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "40px 20px",
      }}>
        <div style={{
          background: "#1A1D27",
          borderRadius: "var(--radius-lg)",
          padding: "40px",
          maxWidth: "520px", width: "100%",
          border: "1px solid #2A2D3A",
          boxShadow: "0 24px 64px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.2)",
        }}>

          {/* Header */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", marginBottom: "28px" }}>
            <Logo />
            <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "1.3rem", color: "#F1F5F9", margin: 0 }}>
              Create Account
            </h2>
            <p style={{ fontSize: "0.82rem", color: "#64748B", margin: 0 }}>
              Register as a hospital or clinic
            </p>
          </div>

          {/* Divider */}
          <div style={{ borderTop: "1px solid #2A2D3A", marginBottom: "24px" }} />

          {/* Fields */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

            <div className="form-grid-2" style={{ margin: 0 }}>
              {field("Name", "name", { placeholder: "Hospital / Clinic name", required: true })}
              {field("Date of Birth", "date_of_birth", { type: "date" })}
            </div>

            <div className="form-grid-2" style={{ margin: 0 }}>
              {field("Phone", "phone_no", { placeholder: "98XXXXXXXX", required: true })}
              {field("Email", "email", { placeholder: "email@example.com", type: "email" })}
            </div>

            {field("Address", "address", { placeholder: "Street address, City" })}

            <div style={{ borderTop: "1px solid #2A2D3A", paddingTop: "16px" }}>
              <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#475569", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "12px" }}>
                Login Credentials
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                {field("Username", "username", { placeholder: "Choose a username", required: true })}
                <div className="form-grid-2" style={{ margin: 0 }}>
                  {field("Password", "password", { type: "password", placeholder: "Password", required: true })}
                  {field("Confirm Password", "confirm", { type: "password", placeholder: "Re-enter password" })}
                </div>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: "100%", justifyContent: "center", padding: "11px", marginTop: "4px", opacity: loading ? 0.7 : 1 }}
              onClick={handleReg}
              disabled={loading}
            >
              {loading ? "Registering…" : "Create Account"}
            </button>

            <div style={{ textAlign: "center", fontSize: "0.82rem", color: "#64748B" }}>
              Already have an account?{" "}
              <button
                onClick={onLogin}
                style={{ background: "none", border: "none", color: "var(--red)", fontWeight: 600, cursor: "pointer", fontSize: "0.82rem" }}
              >
                Log In
              </button>
            </div>

          </div>
        </div>
      </div>

      {toast && createPortal(
        <div className={`toast${toast.type === "success" ? " toast-green" : " toast-red"}`}>
          {toast.type === "success" ? <Icon.Check /> : <Icon.X />}{toast.msg}
        </div>,
        document.body
      )}
    </>
  );
};

export default RegisterPage;
