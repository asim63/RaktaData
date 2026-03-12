import { useState } from "react";
import Logo from "../../components/Logo";
import Icon from "../../components/Icons";
import { apiRegister } from "../../api";

const RegisterPage = ({ setPage, onClose, onLogin }) => {
  const [form, setForm] = useState({name:"",date_of_birth:"",phone_no:"",email:"",address:"",username:"",password:"",confirm:""});
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);
  const up = (k,v) => setForm(f=>({...f,[k]:v}));
  const showToast = (msg,type) => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const close = () => (onClose ? onClose() : setPage?.("Home"));
  const goToLogin = () => {
    close();
    onLogin?.();
  };

  const handleReg = async () => {
    if (!form.name||!form.username||!form.password||!form.phone_no) { showToast("Fill all required fields","error"); return; }
    if (form.password!==form.confirm) { showToast("Passwords do not match","error"); return; }
    setLoading(true);
    try {
      await apiRegister({ name:form.name, date_of_birth:form.date_of_birth||undefined, phone_no:form.phone_no, email:form.email||undefined, address:form.address||undefined, username:form.username, password:form.password });
      showToast("Registration successful! Please log in.","success");
      setTimeout(close, 1800);
    } catch(e) { showToast(e.message,"error"); }
    finally { setLoading(false); }
  };

  return (
    <>
      <div className="modal-overlay" onClick={e => e.target === e.currentTarget && close()}>
        <div className="modal" style={{ maxWidth: "560px", maxHeight: "90vh", overflow: "auto" }}>
          <div style={{ textAlign: "center", marginBottom: "24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
            <Logo/>
            <h2 style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "1.2rem", margin: 0 }}>Create account</h2>
            <p style={{ fontSize: "0.82rem", color: "var(--text-3)", margin: 0 }}>Register as a customer</p>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            <div className="form-grid-2" style={{margin:0}}>
              <div className="form-group"><label className="form-label">Name <span className="req">*</span></label><input className="form-input" placeholder="Name" value={form.name} onChange={e=>up("name",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Date of Birth</label><input className="form-input" type="date" value={form.date_of_birth} onChange={e=>up("date_of_birth",e.target.value)}/></div>
            </div>
            <div className="form-grid-2" style={{margin:0}}>
              <div className="form-group"><label className="form-label">Phone <span className="req">*</span></label><input className="form-input" placeholder="98XXXXXXXX" value={form.phone_no} onChange={e=>up("phone_no",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" placeholder="email@example.com" value={form.email} onChange={e=>up("email",e.target.value)}/></div>
            </div>
            <div className="form-group"><label className="form-label">Address</label><input className="form-input" placeholder="Address" value={form.address} onChange={e=>up("address",e.target.value)}/></div>
            <div className="form-grid-2" style={{margin:0}}>
              <div className="form-group"><label className="form-label">Username <span className="req">*</span></label><input className="form-input" placeholder="Choose username" value={form.username} onChange={e=>up("username",e.target.value)}/></div>
              <div className="form-group"><label className="form-label">Password <span className="req">*</span></label><input className="form-input" type="password" placeholder="Password" value={form.password} onChange={e=>up("password",e.target.value)}/></div>
            </div>
            <div className="form-group"><label className="form-label">Confirm Password</label><input className="form-input" type="password" placeholder="Confirm password" value={form.confirm} onChange={e=>up("confirm",e.target.value)}/></div>
            <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"11px",marginTop:"4px",opacity:loading?0.7:1}} onClick={handleReg} disabled={loading}>
              {loading ? "Registering…" : "Register"}
            </button>
            <div style={{textAlign:"center",fontSize:"0.82rem",color:"var(--text-3)"}}>
              Already have an account?{" "}
              <button onClick={goToLogin} style={{background:"none",border:"none",color:"var(--red)",fontWeight:600,cursor:"pointer",fontSize:"0.82rem"}}>Log In</button>
            </div>
          </div>
        </div>
        {toast && <div className={`toast${toast.type==="success"?" toast-green":" toast-red"}`}>{toast.type==="success"?<Icon.Check/>:<Icon.X/>}{toast.msg}</div>}
      </div>
    </>
  );
};

export default RegisterPage;
