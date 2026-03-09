import { useState } from "react";
import Icon from "../../components/Icons";
import { customerGetBloodAvailability } from "../../api";

const BloodEnquiryPage = ({ onLogin }) => {
  const [form, setForm] = useState({
    patientName:"", contact:"", bloodGroup:"", units:"",
    component:"Whole Blood", urgency:"NORMAL"
  });
  const [searchBg, setSearchBg]         = useState("Any");
  const [searchUnits, setSearchUnits]   = useState("");
  const [stockResults, setStockResults] = useState(null);
  const [searching, setSearching]       = useState(false);
  const [toast, setToast]               = useState(null);

  const pastRequests = [
    { bg:"A+", comp:"Whole Blood", urgency:"NORMAL",    date:"Mar 01, 2026", units:3,  status:"Pending"  },
    { bg:"B+", comp:"PRBC",        urgency:"EMERGENCY", date:"Feb 28, 2026", units:12, status:"Approved" },
    { bg:"A+", comp:"Platelets",   urgency:"NORMAL",    date:"Feb 25, 2026", units:25, status:"Rejected" },
  ];

  const statusBadge = s =>
    s==="Approved" ? "badge-green" : s==="Rejected" ? "badge-red" : "badge-amber";

  const showToast = (msg, type) => {
    setToast({msg,type});
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = () => {
    if (!form.patientName || !form.bloodGroup || !form.units) {
      showToast("Please fill all required fields", "error");
      return;
    }
    onLogin && onLogin();
  };

  const handleSearchStock = async () => {
    setSearching(true);
    try {
      const params = {};
      if (searchBg && searchBg !== "Any") params.blood_group = searchBg;
      const res = await customerGetBloodAvailability(params);
      setStockResults(res.data);
    } catch {
      showToast("Failed to fetch stock data", "error");
    } finally {
      setSearching(false);
    }
  };

  const isEmergency = form.urgency === "EMERGENCY";
  const filteredStockResults = (stockResults || [])
    .filter(s => searchBg === "Any" || s.blood_group === searchBg)
    .filter(s => !searchUnits || parseFloat(s.total_available_units) >= parseFloat(searchUnits));

  return (
    <div className="fade-in">

      {/* Emergency top banner */}
      {isEmergency && (
        <div style={{
          background:"var(--red)", color:"white",
          padding:"11px 40px", display:"flex", alignItems:"center", gap:"10px",
          fontSize:"0.84rem", fontWeight:600,
        }}>
          <Icon.Lightning/>
          EMERGENCY REQUEST — This will be flagged as urgent and appear at the top of the admin's queue.
        </div>
      )}

      {/* Hero */}
      <section className="enquiry-hero" style={{paddingBottom:"28px"}}>
        <div className="section-tag">BLOOD ENQUIRY</div>
        <h1 style={{fontFamily:"var(--font-head)",fontSize:"2.5rem",fontWeight:800,marginTop:"10px",lineHeight:1.15}}>
          Request or check<br/><span style={{color:"var(--red)"}}>blood availability</span>
        </h1>
        <p style={{color:"var(--text-3)",marginTop:"12px",maxWidth:"460px",lineHeight:1.6}}>
          Submit a blood request or check current stock. Mark as{" "}
          <span style={{color:"var(--red)",fontWeight:600}}>Emergency</span> if the
          patient needs blood immediately — the admin will be alerted.
        </p>
      </section>

      <div className="enquiry-grid">

        {/* ── Left: Request Form ── */}
        <div className="card" style={{padding:"28px",display:"flex",flexDirection:"column",gap:"18px"}}>

          {/* Urgency selector — always first */}
          <div className="form-group">
            <label className="form-label">REQUEST URGENCY <span className="req">*</span></label>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginTop:"6px"}}>

              {/* Normal card */}
              <div
                onClick={() => setForm({...form, urgency:"NORMAL"})}
                style={{
                  display:"flex", alignItems:"center", gap:"12px",
                  padding:"14px 16px", borderRadius:"8px", cursor:"pointer",
                  border: !isEmergency ? "2px solid var(--green)" : "2px solid var(--border-md)",
                  background: !isEmergency ? "var(--green-light)" : "var(--surface)",
                  transition:"all .15s",
                }}
              >
                {/* Filled green circle */}
                <div style={{
                  width:"16px", height:"16px", borderRadius:"50%", flexShrink:0,
                  background: !isEmergency ? "var(--green)" : "var(--border-md)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  transition:"background .15s",
                }}>
                  {!isEmergency && <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"white"}}/>}
                </div>
                <div>
                  <div style={{
                    fontWeight:700, fontSize:"0.88rem",
                    color: !isEmergency ? "var(--green)" : "var(--text-2)",
                  }}>Normal</div>
                  <div style={{fontSize:"0.74rem",color:"var(--text-3)",marginTop:"1px"}}>
                    Scheduled or non-critical need
                  </div>
                </div>
              </div>

              {/* Emergency card */}
              <div
                onClick={() => setForm({...form, urgency:"EMERGENCY"})}
                style={{
                  display:"flex", alignItems:"center", gap:"12px",
                  padding:"14px 16px", borderRadius:"8px", cursor:"pointer",
                  border: isEmergency ? "2px solid var(--red)" : "2px solid var(--border-md)",
                  background: isEmergency ? "var(--red-light)" : "var(--surface)",
                  transition:"all .15s",
                }}
              >
                <div style={{
                  width:"16px", height:"16px", borderRadius:"50%", flexShrink:0,
                  background: isEmergency ? "var(--red)" : "var(--border-md)",
                  display:"flex", alignItems:"center", justifyContent:"center",
                }}>
                  <span style={{fontSize:"9px", lineHeight:1}}>⚡</span>
                </div>
                <div>
                  <div style={{
                    fontWeight:700, fontSize:"0.88rem",
                    color: isEmergency ? "var(--red)" : "var(--text-2)",
                    display:"flex", alignItems:"center", gap:"4px",
                  }}>
                    <Icon.Lightning/>Emergency
                  </div>
                  <div style={{fontSize:"0.74rem",color:"var(--text-3)",marginTop:"1px"}}>
                    Immediate — patient is critical
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Emergency info strip */}
          {isEmergency && (
            <div style={{
              display:"flex", alignItems:"flex-start", gap:"8px",
              padding:"11px 14px", borderRadius:"8px",
              background:"var(--red-light)", border:"1px solid var(--red-mid)",
              fontSize:"0.8rem", color:"var(--red)", lineHeight:1.55,
            }}>
              <Icon.Lightning/>
              Emergency requests are sorted to the top of the admin's queue and flagged visually. The admin will see this first.
            </div>
          )}

          {/* Patient Name + Contact */}
          <div className="form-grid-2" style={{margin:0}}>
            <div className="form-group">
              <label className="form-label">PATIENT NAME <span className="req">*</span></label>
              <input className="form-input" placeholder="Full name"
                value={form.patientName} onChange={e=>setForm({...form,patientName:e.target.value})}/>
            </div>
            <div className="form-group">
              <label className="form-label">CONTACT NUMBER</label>
              <input className="form-input" placeholder="98XXXXXXXX"
                value={form.contact} onChange={e=>setForm({...form,contact:e.target.value})}/>
            </div>
          </div>

          {/* Blood Group + Units */}
          <div className="form-grid-2" style={{margin:0}}>
            <div className="form-group">
              <label className="form-label">BLOOD GROUP <span className="req">*</span></label>
              <select className="form-input" value={form.bloodGroup} onChange={e=>setForm({...form,bloodGroup:e.target.value})}>
                <option value="">Select</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b}>{b}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">UNITS REQUIRED <span className="req">*</span></label>
              <input className="form-input" type="number" placeholder="e.g. 2" min="1"
                value={form.units} onChange={e=>setForm({...form,units:e.target.value})}/>
            </div>
          </div>

          {/* Component */}
          <div className="form-group">
            <label className="form-label">COMPONENT</label>
            <select className="form-input" value={form.component} onChange={e=>setForm({...form,component:e.target.value})}>
              {["Whole Blood","PRBC","Platelets","FFP"].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>

          <button
            className="btn btn-primary"
            style={{
              width:"100%", justifyContent:"center", padding:"14px",
              background: isEmergency ? "#DC2626" : "var(--red)",
              fontSize:"0.92rem", borderRadius:"8px",
            }}
            onClick={handleSubmit}
          >
            <Icon.BloodDrop/>
            {isEmergency ? "Submit Emergency Request" : "Submit Request"}
          </button>

          <p style={{fontSize:"0.76rem",color:"var(--text-4)",textAlign:"center",marginTop:"-6px"}}>
            <button onClick={onLogin} style={{background:"none",border:"none",color:"var(--red)",cursor:"pointer",fontWeight:600,fontSize:"inherit",padding:0}}>
              Log in
            </button>
            {" "}to submit a real request
          </p>
        </div>

        {/* ── Right column ── */}
        <div style={{display:"flex",flexDirection:"column",gap:"20px"}}>

          {/* Check Availability */}
          <div className="card" style={{padding:"24px"}}>
            <h3 style={{fontFamily:"var(--font-head)",fontWeight:700,fontSize:"1.05rem",marginBottom:"18px"}}>
              Check Availability
            </h3>
            <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
              <div className="form-grid-2" style={{margin:0}}>
                <div className="form-group">
                  <label className="form-label">BLOOD GROUP</label>
                  <select className="form-input" value={searchBg} onChange={e=>setSearchBg(e.target.value)}>
                    <option>Any</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b}>{b}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">UNITS NEEDED</label>
                  <input className="form-input" type="number" placeholder="e.g. 2"
                    value={searchUnits} onChange={e=>setSearchUnits(e.target.value)}/>
                </div>
              </div>
              <button
                onClick={handleSearchStock}
                disabled={searching}
                style={{
                  width:"100%", padding:"11px", borderRadius:"var(--radius-sm)",
                  border:"1.5px solid var(--red)", color:"var(--red)",
                  background:"transparent", fontWeight:600, fontSize:"0.875rem",
                  cursor:"pointer", display:"flex", alignItems:"center",
                  justifyContent:"center", gap:"6px", transition:"all .15s",
                }}
              >
                <Icon.Search/> {searching ? "Searching…" : "Search Stock"}
              </button>

              {stockResults && (
                <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
                  {filteredStockResults.length === 0
                    ? <p style={{fontSize:"0.82rem",color:"var(--text-3)"}}>No stock found.</p>
                    : filteredStockResults
                        .map((s,i) => (
                          <div key={i} style={{
                            display:"flex",alignItems:"center",justifyContent:"space-between",
                            padding:"10px 12px",borderRadius:"8px",
                            background:"var(--surface)",border:"1px solid var(--border)",
                          }}>
                            <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                              <div className="blood-chip blood-chip-sm">{s.blood_group}</div>
                              <span style={{fontSize:"0.82rem",color:"var(--text-2)"}}>{s.component_type}</span>
                            </div>
                            <div style={{display:"flex",alignItems:"center",gap:"8px"}}>
                              <span style={{fontWeight:700,fontSize:"0.9rem"}}>{s.total_available_units}u</span>
                              <span className={`badge ${s.availability_status==="Stable"?"badge-green":s.availability_status==="Low"?"badge-amber":"badge-red"}`}>
                                {s.availability_status}
                              </span>
                            </div>
                          </div>
                        ))
                  }
                </div>
              )}
            </div>
          </div>

          {/* Past Blood Requests */}
          <div className="card" style={{padding:"24px"}}>
            <h3 style={{fontFamily:"var(--font-head)",fontWeight:700,fontSize:"1.05rem",marginBottom:"4px"}}>
              Past Blood Requests
            </h3>
            <p style={{fontSize:"0.78rem",color:"var(--text-3)",marginBottom:"16px"}}>
              Log in to view your full request history
            </p>
            <div style={{display:"flex",flexDirection:"column"}}>
              {pastRequests.map((r,i) => (
                <div key={i} style={{
                  display:"flex", alignItems:"center", gap:"12px",
                  padding:"12px 0",
                  borderBottom: i < pastRequests.length-1 ? "1px solid var(--border)" : "none",
                }}>
                  <div style={{
                    width:"3px", alignSelf:"stretch", borderRadius:"2px", flexShrink:0,
                    background: r.urgency==="EMERGENCY" ? "var(--red)" : "transparent",
                  }}/>
                  <div className="blood-chip blood-chip-sm">{r.bg}</div>
                  <div style={{flex:1}}>
                    <div style={{fontSize:"0.875rem",fontWeight:600,color:"var(--text-2)"}}>{r.comp}</div>
                    <div style={{display:"flex",alignItems:"center",gap:"6px",marginTop:"3px",flexWrap:"wrap"}}>
                      {r.urgency==="EMERGENCY" && (
                        <span style={{
                          display:"inline-flex",alignItems:"center",gap:"3px",
                          background:"var(--red-light)",color:"var(--red)",
                          fontSize:"0.68rem",fontWeight:700,
                          padding:"1px 7px",borderRadius:"99px",
                        }}>
                          <Icon.Lightning/>EMERGENCY
                        </span>
                      )}
                      <span style={{fontSize:"0.75rem",color:"var(--text-4)"}}>
                        {r.urgency==="NORMAL" ? `Normal · ${r.date}` : `· ${r.date}`}
                      </span>
                    </div>
                  </div>
                  <div style={{fontSize:"0.875rem",fontWeight:600,color:"var(--text-2)",minWidth:"28px",textAlign:"right"}}>
                    {r.units}u
                  </div>
                  <span className={`badge ${statusBadge(r.status)}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {toast && (
        <div className={`toast${toast.type==="success"?" toast-green":" toast-red"}`}>
          {toast.type==="success" ? <Icon.Check/> : <Icon.X/>}{toast.msg}
        </div>
      )}
    </div>
  );
};

export default BloodEnquiryPage;
