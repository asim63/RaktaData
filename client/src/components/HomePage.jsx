import { useState } from "react";
import Icon from "../../components/Icons";
import { customerGetBloodAvailability } from "../../api";

const HomePage = ({ setPage, onLogin }) => {
  const [bg, setBg]     = useState("");
  const [ug, setUg]     = useState("");
  const [comp, setComp] = useState("Whole Blood");
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    if (!bg) { setResult({ error: true }); return; }
    setChecking(true);
    try {
      const res = await customerGetBloodAvailability({ blood_group: bg, component_type: comp });
      const row = res.data?.[0];
      const units = row ? parseFloat(row.total_available_units ?? 0) : 0;
      setResult({ bg, comp, units, needed: parseInt(ug) || 1 });
    } catch {
      // Fallback: show login prompt if API requires auth
      setResult({ bg, comp, units: 0, needed: parseInt(ug) || 1, loginRequired: true });
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="fade-in">
      <section className="hero-section">
        <div style={{display:"grid",gridTemplateColumns:"1fr auto",gap:"48px",alignItems:"center",maxWidth:"1100px",margin:"0 auto",width:"100%"}}>
          <div>
            <div className="hero-tag"><Icon.Drop />Blood Donation Platform</div>
            <h1 className="hero-h1">Donate blood,<br/><span>Save a life.</span></h1>
            <p style={{color:"var(--text-3)",fontSize:"1rem",lineHeight:1.6,maxWidth:"440px",marginTop:"12px"}}>
              Connecting willing donors with patients in real-time — reducing the time it takes to find blood from hours to minutes.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" style={{fontSize:"0.95rem",padding:"12px 28px"}} onClick={() => setPage("Register")}>
                <Icon.User /> Register
              </button>
              {/* Blood request requires login */}
              <button className="btn btn-secondary" style={{fontSize:"0.95rem",padding:"12px 28px"}} onClick={onLogin}>
                <Icon.BloodDrop /> Request Blood
              </button>
            </div>
            <div className="hero-stats">
              {[["1,200+","Active Donors"],["340+","Lives Saved"],["8","Blood Types"]].map(([v,l]) => (
                <div key={l}>
                  <div className="hero-stat-val">{v}</div>
                  <div className="hero-stat-label">{l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="availability-widget">
            <h3>Blood Availability Checker</h3>
            <p>Check current stock levels instantly</p>
            <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-input" value={bg} onChange={e=>setBg(e.target.value)}>
                  <option value="">Select blood group</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Units Required</label>
                <input className="form-input" type="number" placeholder="e.g. 2" value={ug} onChange={e=>setUg(e.target.value)} min="1"/>
              </div>
              <div className="form-group">
                <label className="form-label">Component</label>
                <select className="form-input" value={comp} onChange={e=>setComp(e.target.value)}>
                  {["Whole Blood","PRBC","Platelets","FFP"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"11px",opacity:checking?0.7:1}} onClick={handleCheck} disabled={checking}>
                <Icon.Search /> {checking ? "Checking…" : "Check Availability"}
              </button>
              {result && (
                <div style={{borderRadius:"8px",padding:"12px 14px",background:result.error||result.loginRequired?"#FEF3C7":result.units>=(result.needed)?"#ECFDF5":"#FEF2F2",border:`1px solid ${result.error||result.loginRequired?"#FCD34D":result.units>=result.needed?"#A7F3D0":"#FECACA"}`}}>
                  {result.error
                    ? <span style={{color:"var(--red)",fontSize:"0.85rem"}}>Please select a blood group.</span>
                    : result.loginRequired
                      ? <span style={{color:"#92400E",fontSize:"0.85rem",fontWeight:600}}>
                          <button onClick={onLogin} style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",fontWeight:700,textDecoration:"underline",fontSize:"0.85rem"}}>Log in</button> to check live stock levels
                        </span>
                    : result.units >= result.needed
                      ? <span style={{color:"var(--green)",fontSize:"0.85rem",fontWeight:600}}>✓ {result.units} units of {result.bg} {result.comp} available</span>
                      : <span style={{color:"var(--red)",fontSize:"0.85rem",fontWeight:600}}>
                          ✗ Only {result.units} units available —{" "}
                          <button onClick={onLogin} style={{background:"none",border:"none",cursor:"pointer",color:"var(--red)",fontWeight:700,textDecoration:"underline",fontSize:"0.85rem"}}>login</button> to request emergency donors
                        </span>
                  }
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="how-section">
        <div style={{maxWidth:"1100px",margin:"0 auto"}}>
          <div className="how-section-title">
            <div className="section-tag">HOW IT WORKS</div>
            <h2 className="section-heading" style={{fontSize:"2rem"}}>Simple steps to <span>save a life</span></h2>
            <p className="section-sub">It only takes a few minutes to register and potentially save someone's life today.</p>
          </div>
          <div className="steps-grid">
            {[
              {n:"STEP 1",icon:"✏️",title:"Register",       desc:"Create your free account and fill in your blood type and contact details."},
              {n:"STEP 2",icon:"🔍",title:"Search & Match", desc:"Browse available donors or check blood stock availability in real time."},
              {n:"STEP 3",icon:"📞",title:"Connect",        desc:"Reach out directly to eligible donors or submit an official blood request."},
              {n:"STEP 4",icon:"❤️",title:"Save a Life",    desc:"Your donation or request gets fulfilled — every unit counts toward saving a life."},
            ].map(s=>(
              <div key={s.n} className="step-card">
                <div className="step-number">{s.n}</div>
                <div className="step-icon"><span style={{fontSize:"1.3rem"}}>{s.icon}</span></div>
                <div className="step-title">{s.title}</div>
                <p className="step-desc">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
