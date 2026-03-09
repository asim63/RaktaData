import { useState, useEffect } from "react";
import Logo from "../../components/Logo";
import Icon from "../../components/Icons";
import GlobalStyle from "../../styles/GlobalStyle";
import { customerGetRequests, customerSubmitRequest, customerGetBloodAvailability, customerGetDonors } from "../../api";
import TopBar from "../../components/TopBar";

// Module-level submit lock — survives re-renders AND remounts
let _requestInFlight = false;

const AVATAR_COLORS = ["#DC2626","#7C3AED","#059669","#D97706","#2563EB","#DB2777","#0891B2","#65A30D"];

const CustomerPanel = ({ user, onLogout, dark, onToggleTheme }) => {
  const [tab, setTab] = useState("requests");

  // ── My Requests ───────────────────────────────────────────────────────────
  const [requests, setRequests]     = useState([]);
  const [reqLoading, setReqLoading] = useState(true);
  const [reqErr, setReqErr]         = useState("");

  const loadRequests = () => {
    setReqLoading(true);
    customerGetRequests()
      .then(res => setRequests(res.data))
      .catch(e => setReqErr(e.message))
      .finally(() => setReqLoading(false));
  };
  useEffect(() => { loadRequests(); }, []);

  // ── New Request ───────────────────────────────────────────────────────────
  const emptyForm = { patient_name:"", blood_group:"", component_type:"Whole Blood", quantity:"", urgency:"NORMAL" };
  const [form, setForm]             = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [donorContext, setDonorContext] = useState(null);

  // ── Find Donors ───────────────────────────────────────────────────────────
  const [donors, setDonors]               = useState([]);
  const [donorLoading, setDonorLoading]   = useState(false);
  const [donorErr, setDonorErr]           = useState("");
  const [donorSearch, setDonorSearch]     = useState("");
  const [donorBgFilter, setDonorBgFilter] = useState("");
  const [donorEligFilter, setDonorEligFilter] = useState("true");

  const loadDonors = (overrides = {}) => {
    setDonorLoading(true);
    setDonorErr("");
    const params = {};
    const bg   = overrides.blood_group        ?? donorBgFilter;
    const elig = overrides.eligibility_status ?? donorEligFilter;
    const name = overrides.name               ?? donorSearch;
    if (bg)   params.blood_group        = bg;
    if (elig) params.eligibility_status = elig;
    if (name) params.name               = name;
    customerGetDonors(params)
      .then(res => setDonors(res.data))
      .catch(e => setDonorErr(e.message))
      .finally(() => setDonorLoading(false));
  };

  // ── Availability ──────────────────────────────────────────────────────────
  const [stock, setStock]               = useState([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [stockErr, setStockErr]         = useState("");

  const loadStock = () => {
    setStockLoading(true);
    customerGetBloodAvailability()
      .then(res => setStock(res.data))
      .catch(e => setStockErr(e.message))
      .finally(() => setStockLoading(false));
  };

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toast, setToast] = useState(null);
  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  };

  // ── Submit Request ────────────────────────────────────────────────────────
  const handleRequest = async () => {
    if (!form.patient_name || !form.blood_group || !form.quantity) {
      showToast("Please fill all required fields", "error");
      return;
    }
    // Module-level lock — cannot be reset by re-renders or remounts
    if (_requestInFlight) return;
    _requestInFlight = true;
    setSubmitting(true);
    try {
      const res = await customerSubmitRequest(form);
      if (res.data?.status === "REJECTED") {
        // Navigate away FIRST, then update state
        setForm(emptyForm);
        setTab("donors");
        setDonorContext({
          bloodGroup:      form.blood_group,
          componentType:   form.component_type,
          suggestedDonors: res.suggestedDonors || [],
          requestInfo:     { patient: form.patient_name, units: form.quantity, urgency: form.urgency },
        });
        setDonorBgFilter(form.blood_group);
        setDonorEligFilter("true");
        setDonors(res.suggestedDonors || []);
        loadRequests();
      } else {
        // Navigate away FIRST before any other state updates
        setForm(emptyForm);
        setTab("requests");
        showToast(res.message || "Request submitted!");
        loadRequests();
      }
    } catch(e) {
      if (!e.message?.includes("Duplicate")) {
        showToast(e.message, "error");
      }
    } finally {
      _requestInFlight = false;
      setSubmitting(false);
    }
  };

  const goToDonors = (bloodGroup = "") => {
    setDonorContext(null);
    setDonorBgFilter(bloodGroup);
    setDonorEligFilter("true");
    setDonorSearch("");
    setTab("donors");
    loadDonors({ blood_group: bloodGroup, eligibility_status: "true", name: "" });
  };

  const initials = user.name.split(" ").map(n => n[0]).join("").slice(0, 2);

  const urgencyBadge = (u) => (
    <span className={`badge ${u === "EMERGENCY" ? "badge-red badge-pulse" : "badge-blue"}`}>
      {u === "EMERGENCY" ? "🚨 Emergency" : "Normal"}
    </span>
  );

  const statusBadge = (s) => (
    <span className={`badge ${s==="APPROVED"?"badge-green":s==="REJECTED"?"badge-red":"badge-amber"}`}>{s}</span>
  );

  const navItems = [
    { key:"requests",     label:"My Requests",       icon:<Icon.ClipBoard/> },
    { key:"new",          label:"New Request",        icon:<Icon.Plus/> },
    { key:"donors",       label:"Find Donors",        icon:<Icon.Donors/> },
    { key:"availability", label:"Check Availability", icon:<Icon.BloodDrop/> },
  ];

  return (
    <>
      <GlobalStyle/>
      <div className="app-layout">

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <div className="sidebar-logo"><Logo/></div>
          <div className="sidebar-user">
            <div className="sidebar-avatar" style={{background:"#059669"}}>{initials}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <div className="sidebar-user-role">Customer</div>
            </div>
          </div>
          <div className="sidebar-section">MENU</div>
          <div className="sidebar-nav">
            {navItems.map(n => (
              <button
                key={n.key}
                className={`sidebar-item${tab===n.key?" active":""}`}
                onClick={() => {
                  if (n.key === "donors" && tab !== "donors") {
                    goToDonors(donorBgFilter);
                  } else if (n.key === "availability") {
                    setTab("availability");
                    loadStock();
                  } else {
                    setTab(n.key);
                  }
                }}
              >
                {n.icon}{n.label}
              </button>
            ))}
          </div>
          <div className="sidebar-bottom">
            <div className="sidebar-status">
              <div className="status-dot" style={{background:"#059669"}}/>
              <span>customer · online</span>
            </div>
            <button className="sidebar-item" onClick={onLogout}><Icon.Logout/>Logout</button>
          </div>
        </aside>

        <main className="main-content">
          <TopBar dark={dark} onToggleTheme={onToggleTheme} />

          {/* ══ MY REQUESTS ══════════════════════════════════════════════════ */}
          {tab === "requests" && (
            <div className="fade-in">
              <div className="panel-header">
                <h1>My Blood Requests</h1>
                <div className="panel-breadcrumb">Customer Panel · <span>Request History</span></div>
              </div>
              <div style={{padding:"24px 28px"}}>
                {reqLoading
                  ? <div style={{color:"var(--text-3)"}}>Loading…</div>
                  : reqErr
                  ? <div style={{color:"var(--red)"}}>{reqErr}</div>
                  : (
                    <div className="card">
                      <div className="table-wrap">
                        <table>
                          <thead>
                            <tr>
                              <th>PATIENT</th><th>BLOOD</th><th>UNITS</th>
                              <th>URGENCY</th><th>DATE</th><th>STATUS</th>
                              <th>REASON / ACTION</th>
                            </tr>
                          </thead>
                          <tbody>
                            {requests.map(r => (
                              <tr key={r.request_id} className={r.urgency==="EMERGENCY"?"emergency-row":""}>
                                <td style={{fontWeight:600}}>{r.patient_name}</td>
                                <td>
                                  <div style={{display:"flex",alignItems:"center",gap:"6px"}}>
                                    <div className="blood-chip blood-chip-sm">{r.blood_group}</div>
                                    <span style={{fontSize:"0.8rem",color:"var(--text-3)"}}>{r.component_type}</span>
                                  </div>
                                </td>
                                <td style={{fontWeight:600}}>{r.quantity}</td>
                                <td>{urgencyBadge(r.urgency)}</td>
                                <td style={{fontSize:"0.82rem",color:"var(--text-3)"}}>
                                  {r.request_date ? new Date(r.request_date).toLocaleDateString() : "—"}
                                </td>
                                <td>{statusBadge(r.status)}</td>
                                <td style={{fontSize:"0.78rem",color:"var(--text-4)",maxWidth:"180px"}}>
                                  {r.status === "REJECTED"
                                    ? (
                                      <div style={{display:"flex",flexDirection:"column",gap:"4px"}}>
                                        <span style={{color:"var(--text-3)"}}>{r.rejected_reason || "Insufficient stock"}</span>
                                        <button
                                          onClick={() => goToDonors(r.blood_group)}
                                          style={{background:"none",border:"1px solid var(--red)",color:"var(--red)",borderRadius:"4px",padding:"2px 8px",fontSize:"0.74rem",cursor:"pointer",fontWeight:600,width:"fit-content"}}
                                        >
                                          Find Donors →
                                        </button>
                                      </div>
                                    )
                                    : r.rejected_reason || "—"
                                  }
                                </td>
                              </tr>
                            ))}
                            {requests.length === 0 && (
                              <tr>
                                <td colSpan={7} style={{textAlign:"center",padding:"40px",color:"var(--text-3)"}}>
                                  No requests yet.{" "}
                                  <button onClick={() => setTab("new")} style={{background:"none",border:"none",color:"var(--red)",cursor:"pointer",fontWeight:600,fontSize:"inherit"}}>
                                    Submit your first request →
                                  </button>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )
                }
              </div>
            </div>
          )}

          {/* ══ NEW REQUEST ══════════════════════════════════════════════════ */}
          {tab === "new" && (
            <div className="fade-in">

              {/* Emergency top banner */}
              {form.urgency === "EMERGENCY" && (
                <div style={{
                  background:"var(--red)", color:"white",
                  padding:"11px 28px", display:"flex", alignItems:"center", gap:"9px",
                  fontSize:"0.82rem", fontWeight:600, letterSpacing:"0.02em",
                }}>
                  <Icon.Lightning/>
                  EMERGENCY REQUEST — This will be flagged as urgent and appear at the top of the admin's queue.
                </div>
              )}

              <div className="reg-form">
                <h3 style={{fontFamily:"var(--font-head)",fontWeight:700,fontSize:"1rem",marginBottom:"4px"}}>Blood Request Form</h3>
                <p style={{fontSize:"0.8rem",color:"var(--text-3)",marginBottom:"24px"}}>
                  Submit a request for blood units. If stock is unavailable, we'll direct you to eligible donors.
                </p>

                {/* 1. Urgency — first */}
                <div className="form-group" style={{marginBottom:"18px"}}>
                  <label className="form-label">REQUEST URGENCY <span className="req">*</span></label>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"10px",marginTop:"6px"}}>
                    {[
                      { val:"NORMAL",    label:"Normal",    sub:"Scheduled or non-critical need" },
                      { val:"EMERGENCY", label:"Emergency", sub:"Immediate — patient is critical" },
                    ].map(opt => {
                      const active   = form.urgency === opt.val;
                      const isEmer   = opt.val === "EMERGENCY";
                      const activeColor = isEmer ? "var(--red)" : "var(--green)";
                      return (
                        <div key={opt.val} onClick={() => setForm({...form, urgency:opt.val})} style={{
                          display:"flex", alignItems:"flex-start", gap:"10px",
                          padding:"14px 16px", borderRadius:"8px", cursor:"pointer",
                          border:`2px solid ${active ? activeColor : "var(--border-md)"}`,
                          background: active ? (isEmer ? "var(--red-light)" : "var(--green-light)") : "var(--surface)",
                          transition:"all .15s",
                        }}>
                          <div style={{
                            width:"18px", height:"18px", borderRadius:"50%", flexShrink:0, marginTop:"2px",
                            border:`2px solid ${active ? activeColor : "var(--border-md)"}`,
                            background: active ? activeColor : "transparent",
                            display:"flex", alignItems:"center", justifyContent:"center",
                          }}>
                            {active && <div style={{width:"6px",height:"6px",borderRadius:"50%",background:"white"}}/>}
                          </div>
                          <div>
                            <div style={{
                              fontWeight:700, fontSize:"0.875rem",
                              color: active ? activeColor : "var(--text-2)",
                              display:"flex", alignItems:"center", gap:"5px",
                            }}>
                              {isEmer && <Icon.Lightning/>}{opt.label}
                            </div>
                            <div style={{fontSize:"0.75rem",color:"var(--text-3)",marginTop:"2px"}}>{opt.sub}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Emergency info strip */}
                {form.urgency === "EMERGENCY" && (
                  <div style={{
                    display:"flex", alignItems:"flex-start", gap:"8px",
                    padding:"11px 14px", borderRadius:"8px", marginBottom:"18px",
                    background:"var(--red-light)", border:"1px solid var(--red-mid)",
                    fontSize:"0.8rem", color:"var(--red)", lineHeight:1.5,
                  }}>
                    <Icon.Lightning/>
                    Emergency requests are sorted to the top of the admin's queue and flagged visually. The admin will see this first.
                  </div>
                )}

                {/* 2. Patient Name + Blood Group */}
                <div className="form-grid-2" style={{marginBottom:"16px"}}>
                  <div className="form-group">
                    <label className="form-label">PATIENT NAME <span className="req">*</span></label>
                    <input className="form-input" value={form.patient_name} onChange={e=>setForm({...form,patient_name:e.target.value})} placeholder="Full name of patient"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">BLOOD GROUP <span className="req">*</span></label>
                    <select className="form-input" value={form.blood_group} onChange={e=>setForm({...form,blood_group:e.target.value})}>
                      <option value="">Select</option>
                      {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                {/* 3. Units + Component */}
                <div className="form-grid-2" style={{marginBottom:"16px"}}>
                  <div className="form-group">
                    <label className="form-label">UNITS REQUIRED <span className="req">*</span></label>
                    <input className="form-input" type="number" min="1" value={form.quantity} onChange={e=>setForm({...form,quantity:e.target.value})} placeholder="e.g. 2"/>
                  </div>
                  <div className="form-group">
                    <label className="form-label">COMPONENT</label>
                    <select className="form-input" value={form.component_type} onChange={e=>setForm({...form,component_type:e.target.value})}>
                      {["Whole Blood","PRBC","Platelets","FFP"].map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="reg-form-footer">
                  <button className="btn btn-secondary" onClick={() => setForm(emptyForm)}>Reset</button>
                  <button
                    className="btn btn-primary"
                    onClick={handleRequest}
                    disabled={submitting}
                    style={{opacity:submitting?0.7:1, background:form.urgency==="EMERGENCY"?"var(--red)":undefined}}
                  >
                    {submitting
                      ? "Submitting…"
                      : <><Icon.BloodDrop/>{form.urgency==="EMERGENCY"?"Submit Emergency Request":"Submit Request"}</>
                    }
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ══ FIND DONORS ══════════════════════════════════════════════════ */}
          {tab === "donors" && (
            <div className="fade-in">
              <div className="panel-header">
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"12px"}}>
                  <div>
                    <h1>Find Donors</h1>
                    <div className="panel-breadcrumb">Customer Panel · <span>Donor Directory</span></div>
                  </div>
                  {donorContext && (
                    <div style={{background:"var(--red-light)",border:"1.5px solid var(--red-mid)",borderRadius:"8px",padding:"10px 16px",fontSize:"0.82rem",color:"var(--text-2)",maxWidth:"420px"}}>
                      <strong style={{color:"var(--red)"}}>⚠ Insufficient stock</strong> for{" "}
                      <strong>{donorContext.requestInfo.units} units</strong> of{" "}
                      <strong>{donorContext.componentType}</strong> ({donorContext.bloodGroup}) —{" "}
                      contact an eligible donor below.
                    </div>
                  )}
                </div>
              </div>

              <div style={{padding:"20px 28px"}}>
                {/* Filters */}
                <div style={{display:"flex",gap:"10px",marginBottom:"20px",flexWrap:"wrap",alignItems:"center"}}>
                  <div style={{flex:1,minWidth:"200px",position:"relative"}}>
                    <span style={{position:"absolute",left:"10px",top:"50%",transform:"translateY(-50%)",color:"var(--text-4)",pointerEvents:"none"}}><Icon.Search/></span>
                    <input
                      className="form-input"
                      style={{paddingLeft:"34px"}}
                      placeholder="Search by name…"
                      value={donorSearch}
                      onChange={e => setDonorSearch(e.target.value)}
                      onKeyDown={e => e.key==="Enter" && loadDonors()}
                    />
                  </div>
                  <select className="form-input" style={{width:"160px"}} value={donorBgFilter} onChange={e=>setDonorBgFilter(e.target.value)}>
                    <option value="">All Blood Groups</option>
                    {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b}>{b}</option>)}
                  </select>
                  <select className="form-input" style={{width:"150px"}} value={donorEligFilter} onChange={e=>setDonorEligFilter(e.target.value)}>
                    <option value="">All Status</option>
                    <option value="true">Eligible Only</option>
                    <option value="false">Ineligible</option>
                  </select>
                  <button className="btn btn-primary" style={{padding:"9px 20px"}} onClick={() => loadDonors()}>
                    <Icon.Search/> Search
                  </button>
                  {(donorBgFilter || donorSearch || donorEligFilter !== "true") && (
                    <button
                      className="btn btn-secondary"
                      style={{padding:"9px 16px",fontSize:"0.82rem"}}
                      onClick={() => { setDonorSearch(""); setDonorBgFilter(""); setDonorEligFilter("true"); loadDonors({blood_group:"",name:"",eligibility_status:"true"}); }}
                    >
                      Clear
                    </button>
                  )}
                </div>

                {donorLoading
                  ? <div style={{color:"var(--text-3)",padding:"32px 0"}}>Loading donors…</div>
                  : donorErr
                  ? <div style={{color:"var(--red)"}}>{donorErr}</div>
                  : (
                    <>
                      <div style={{fontSize:"0.8rem",color:"var(--text-3)",marginBottom:"14px"}}>
                        {donors.length} donor{donors.length!==1?"s":""} found
                        {donorBgFilter ? ` · ${donorBgFilter}` : ""}
                        {donorEligFilter==="true" ? " · Eligible only" : ""}
                      </div>
                      <div className="donors-grid">
                        {donors.map((d, i) => (
                          <div key={d.donor_id} className="donor-card">
                            <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"14px"}}>
                              <div className="donor-avatar" style={{background:AVATAR_COLORS[i%AVATAR_COLORS.length]}}>
                                {d.donor_name.split(" ").map(n=>n[0]).join("").slice(0,2).toUpperCase()}
                              </div>
                              <div style={{flex:1,minWidth:0}}>
                                <div style={{fontWeight:600,fontSize:"0.9rem",color:"var(--text)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{d.donor_name}</div>
                                <div style={{fontSize:"0.76rem",color:"var(--text-3)",marginTop:"2px"}}>{d.donor_address || "Address not provided"}</div>
                              </div>
                              <div className="blood-chip blood-chip-sm">{d.donor_blood_group}</div>
                            </div>

                            <div style={{display:"flex",flexDirection:"column",gap:"7px",fontSize:"0.82rem"}}>
                              <div style={{display:"flex",alignItems:"center",gap:"6px",color:"var(--text-2)"}}>
                                <Icon.Phone/>
                                <span style={{fontWeight:500}}>{d.donor_phone_no || "Not provided"}</span>
                              </div>
                              <div style={{display:"flex",justifyContent:"space-between",color:"var(--text-3)"}}>
                                <span>Last Donated</span>
                                <span style={{color:"var(--text-2)",fontWeight:500}}>
                                  {d.last_donation_date ? new Date(d.last_donation_date).toLocaleDateString() : "Never"}
                                </span>
                              </div>
                              {d.days_since_donation != null && (
                                <div style={{display:"flex",justifyContent:"space-between",color:"var(--text-3)"}}>
                                  <span>Days Since</span>
                                  <span style={{color:"var(--text-2)",fontWeight:500}}>{d.days_since_donation} days</span>
                                </div>
                              )}
                              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginTop:"2px"}}>
                                <span style={{color:"var(--text-3)"}}>Status</span>
                                <span className={`badge ${d.eligibility_status?"badge-green":"badge-red"}`}>
                                  {d.eligibility_status?"Eligible":"Ineligible"}
                                </span>
                              </div>
                            </div>

                            {d.donor_phone_no && (
                              <a
                                href={`tel:${d.donor_phone_no}`}
                                style={{
                                  display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",
                                  marginTop:"14px",padding:"8px",borderRadius:"6px",
                                  background:d.eligibility_status?"var(--red-light)":"var(--border-md)",
                                  color:d.eligibility_status?"var(--red)":"var(--text-3)",
                                  fontSize:"0.82rem",fontWeight:600,textDecoration:"none",
                                  border:`1px solid ${d.eligibility_status?"var(--red-mid)":"var(--border)"}`,
                                  transition:"all .15s",
                                }}
                              >
                                <Icon.Phone/> Call Donor
                              </a>
                            )}
                          </div>
                        ))}
                        {donors.length === 0 && (
                          <div style={{gridColumn:"1/-1",textAlign:"center",padding:"48px 0",color:"var(--text-3)"}}>
                            <div style={{fontSize:"2rem",marginBottom:"10px"}}>🩸</div>
                            <div style={{fontWeight:600,marginBottom:"6px"}}>No donors found</div>
                            <div style={{fontSize:"0.85rem"}}>Try adjusting your filters or search term.</div>
                          </div>
                        )}
                      </div>
                    </>
                  )
                }
              </div>
            </div>
          )}

          {/* ══ AVAILABILITY ═════════════════════════════════════════════════ */}
          {tab === "availability" && (
            <div className="fade-in">
              <div className="panel-header">
                <h1>Blood Availability</h1>
                <div className="panel-breadcrumb">Customer Panel · <span>Check Stock</span></div>
              </div>
              <div style={{padding:"24px 28px"}}>
                {stockLoading
                  ? <div style={{color:"var(--text-3)"}}>Loading…</div>
                  : stockErr
                  ? <div style={{color:"var(--red)"}}>{stockErr}</div>
                  : (
                    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:"16px"}}>
                      {stock.map((s, i) => (
                        <div key={i} className="card" style={{padding:"20px",textAlign:"center"}}>
                          <div className="blood-chip" style={{margin:"0 auto 12px"}}>{s.blood_group}</div>
                          <div style={{fontSize:"0.82rem",color:"var(--text-3)",marginBottom:"8px"}}>{s.component_type}</div>
                          <div style={{fontFamily:"var(--font-head)",fontSize:"1.8rem",fontWeight:700,marginBottom:"8px"}}>
                            {s.total_available_units ?? 0}
                          </div>
                          <span className={`badge ${s.availability_status==="Stable"?"badge-green":s.availability_status==="Low"?"badge-amber":"badge-red"}`}>
                            {s.availability_status}
                          </span>
                          {(s.availability_status === "Critical" || s.availability_status === "Out of Stock") && (
                            <button
                              onClick={() => goToDonors(s.blood_group)}
                              style={{display:"block",width:"100%",marginTop:"12px",padding:"6px",
                                background:"var(--surface)",border:"1px solid var(--red)",
                                borderRadius:"5px",color:"var(--red)",
                                fontSize:"0.76rem",fontWeight:600,cursor:"pointer"}}
                            >
                              Find Donors →
                            </button>
                          )}
                        </div>
                      ))}
                      {stock.length === 0 && (
                        <div style={{color:"var(--text-3)"}}>No stock data available.</div>
                      )}
                    </div>
                  )
                }
              </div>
            </div>
          )}

        </main>
      </div>

      {toast && (
        <div className={`toast${toast.type==="success"?" toast-green":" toast-red"}`}>
          {toast.type==="success" ? <Icon.Check/> : <Icon.X/>}
          {toast.msg}
        </div>
      )}
    </>
  );
};

export default CustomerPanel;
