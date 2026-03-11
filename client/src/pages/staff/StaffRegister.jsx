import { useState, useEffect, useRef } from "react";
import Icon from "../../components/Icons";
import { staffGetDonors, staffRegisterDonor, staffLogDonation } from "../../api";

const RadioQ = ({ field, label, value, onChange }) => (
  <div className="form-group">
    <label className="form-label">{label} <span className="req">*</span></label>
    <div className="radio-group" style={{ marginTop: "4px" }}>
      <label className="radio-label"><input type="radio" name={field} checked={value === false} onChange={() => onChange(field, false)} /> No</label>
      <label className="radio-label"><input type="radio" name={field} checked={value === true}  onChange={() => onChange(field, true)}  /> Yes</label>
    </div>
  </div>
);

const emptyForm = {
  donor_name: "", date_of_birth: "", donor_gender: "", donor_phone_no: "",
  donor_address: "", donor_blood_group: "", donor_weight: "",
  donor_blood_pressure: "", hemoglobin: "", last_donation_date: "",
  has_diabetes: null, alcohol_consumption: null,
  has_chronic_illness: null, recent_medication: null,
  quantity: "", component_type: "Whole Blood",
};

const StaffRegister = () => {
  const [mode, setMode]       = useState("new");
  const [form, setForm]       = useState(emptyForm);
  const [loading, setLoading] = useState(false);
  const [toast, setToast]     = useState(null);

  // ── Returning donor search ──
  const [query, setQuery]         = useState("");
  const [results, setResults]     = useState([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [showDrop, setShowDrop]   = useState(false);
  const searchRef                 = useRef(null);
  const debounceRef               = useRef(null);

  // ── Donation history ──
  const [historyDonor, setHistoryDonor] = useState(null);
  const [history, setHistory]           = useState([]);
  const [histLoading, setHistLoading]   = useState(false);

  const up = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3500); };
  const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : "—";

  // ── Debounced live search ──
  useEffect(() => {
    if (mode !== "returning") return;
    if (!query.trim()) { setResults([]); setShowDrop(false); return; }
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await staffGetDonors({ name: query });
        setResults(res.data || []);
        setShowDrop(true);
      } catch { setResults([]); }
      finally { setSearching(false); }
    }, 300);
  }, [query, mode]);

  // ── Click outside closes dropdown ──
  useEffect(() => {
    const handler = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Select donor from dropdown → fill form ──
  const selectDonor = (d) => {
    setSelected(d);
    setQuery(d.donor_name);
    setShowDrop(false);
    // Pre-fill all fields with donor's existing data
    setForm({
      ...emptyForm,
      donor_name:          d.donor_name        || "",
      date_of_birth:       d.date_of_birth     ? new Date(d.date_of_birth).toLocaleDateString("en-CA") : "",
      donor_gender:        d.donor_gender      || "",
      donor_phone_no:      d.donor_phone_no    || "",
      donor_address:       d.donor_address     || "",
      donor_blood_group:   d.donor_blood_group || "",
      donor_weight:        d.donor_weight      || "",
      donor_blood_pressure:d.donor_blood_pressure || "",
      hemoglobin:          d.hemoglobin        || "",
      last_donation_date:  d.last_donation_date ? new Date(d.last_donation_date).toLocaleDateString("en-CA") : "",
      has_diabetes:        d.has_diabetes      ?? null,
      alcohol_consumption: d.alcohol_consumption ?? null,
      has_chronic_illness: d.has_chronic_illness ?? null,
      recent_medication:   d.recent_medication ?? null,
      quantity: "", component_type: "Whole Blood",
    });
  };

  // ── Submit new donor ──
  const handleNew = async () => {
    if (!form.donor_name || !form.date_of_birth || !form.donor_gender || !form.donor_weight) {
      showToast("Name, DOB, gender and weight are required.", "error"); return;
    }
    if (parseFloat(form.donor_weight) < 50) { showToast("Donor must weigh at least 50 kg.", "error"); return; }
    if (!form.quantity || !form.component_type) { showToast("Quantity and component type are required.", "error"); return; }
    setLoading(true);
    try {
      await staffRegisterDonor(form);
      showToast("Donor registered and donation logged!");
      setForm(emptyForm);
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  };

  // ── Submit returning donor donation ──
  const handleReturning = async () => {
    if (!selected) { showToast("Please select a donor first.", "error"); return; }
    if (!selected.eligibility_status) { showToast("This donor is ineligible and cannot donate right now.", "error"); return; }
    if (!form.quantity || !form.component_type) { showToast("Quantity and component type are required.", "error"); return; }
    setLoading(true);
    try {
      await staffLogDonation(selected.donor_id, {
        quantity: form.quantity,
        component_type: form.component_type,
        donation_date: form.last_donation_date || undefined,
      });
      showToast(`Donation logged for ${selected.donor_name}!`);
      setSelected(null);
      setQuery("");
      setForm(emptyForm);
    } catch (e) { showToast(e.message, "error"); }
    finally { setLoading(false); }
  };

  // ── Load donation history for a donor ──
  const loadHistory = async (donor) => {
    setHistoryDonor(donor);
    setHistLoading(true);
    try {
      const res = await staffGetDonors({ name: donor.donor_name });
      // We need staffGetDonationHistory — fetch from donations endpoint
      const r = await fetch(
        `${(import.meta.env.VITE_API_URL || "http://localhost:5000/api")}/staff/donations/${donor.donor_id}`,
        { headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      const data = await r.json();
      setHistory(data.data || []);
    } catch { setHistory([]); }
    finally { setHistLoading(false); }
  };

  const sharedForm = (isReturning) => (
    <>
      <div className="reg-section">BASIC INFORMATION</div>
      <div className="form-grid-2">
        <div className="form-group"><label className="form-label">Full Name <span className="req">*</span></label>
          <input className="form-input" value={form.donor_name} onChange={e => up("donor_name", e.target.value)} placeholder="e.g. Ram Shrestha" readOnly={isReturning} style={isReturning ? { opacity: 0.7 } : {}} /></div>
        <div className="form-group"><label className="form-label">Date of Birth <span className="req">*</span></label>
          <input className="form-input" type="date" value={form.date_of_birth} onChange={e => up("date_of_birth", e.target.value)} readOnly={isReturning} style={isReturning ? { opacity: 0.7 } : {}} /></div>
      </div>
      <div className="form-grid-2">
        <div className="form-group">
          <label className="form-label">Gender <span className="req">*</span></label>
          <div className="radio-group" style={{ marginTop: "8px" }}>
            {["Male", "Female", "Other"].map(g => (
              <label key={g} className="radio-label">
                <input type="radio" name="gender" checked={form.donor_gender === g.toUpperCase()} onChange={() => !isReturning && up("donor_gender", g.toUpperCase())} />{g}
              </label>
            ))}
          </div>
        </div>
        <div className="form-group"><label className="form-label">Phone Number</label>
          <input className="form-input" value={form.donor_phone_no} onChange={e => up("donor_phone_no", e.target.value)} placeholder="98XXXXXXXX" /></div>
      </div>
      <div className="form-grid-2">
        <div className="form-group"><label className="form-label">Address</label>
          <input className="form-input" value={form.donor_address} onChange={e => up("donor_address", e.target.value)} placeholder="Street / Ward / Municipality" /></div>
        <div className="form-group">
          <label className="form-label">Blood Group</label>
          {isReturning
            ? <input className="form-input" value={form.donor_blood_group} readOnly style={{ opacity: 0.7 }} />
            : <select className="form-input" value={form.donor_blood_group} onChange={e => up("donor_blood_group", e.target.value)}>
                <option value="">Select</option>
                {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b}>{b}</option>)}
              </select>
          }
        </div>
      </div>

      <div className="reg-section" style={{ marginTop: "8px" }}>PHYSICAL ELIGIBILITY</div>
      <div className="form-grid-2">
        <div className="form-group"><label className="form-label">Weight (KG) <span className="req">*</span></label>
          <input className="form-input" type="number" value={form.donor_weight} onChange={e => up("donor_weight", e.target.value)} placeholder="Min. 50 kg" min="50" /></div>
        <div className="form-group"><label className="form-label">Blood Pressure</label>
          <input className="form-input" value={form.donor_blood_pressure} onChange={e => up("donor_blood_pressure", e.target.value)} placeholder="e.g. 120/80" /></div>
      </div>
      <div className="form-grid-2">
        <div className="form-group"><label className="form-label">Hemoglobin (g/dL)</label>
          <input className="form-input" type="number" step="0.1" value={form.hemoglobin} onChange={e => up("hemoglobin", e.target.value)} placeholder="e.g. 13.5" /></div>
        <div className="form-group"><label className="form-label">Last Donation Date</label>
          <input className="form-input" type="date" value={form.last_donation_date} onChange={e => up("last_donation_date", e.target.value)} /></div>
      </div>

      <div className="reg-section" style={{ marginTop: "8px" }}>HEALTH SCREENING</div>
      <div className="form-grid-2">
        <RadioQ field="has_diabetes"        label="Diabetes?"            value={form.has_diabetes}        onChange={up} />
        <RadioQ field="alcohol_consumption" label="Alcohol Consumption?" value={form.alcohol_consumption} onChange={up} />
      </div>
      <div className="form-grid-2">
        <RadioQ field="has_chronic_illness" label="Chronic Illness?"   value={form.has_chronic_illness} onChange={up} />
        <RadioQ field="recent_medication"   label="Recent Medication?" value={form.recent_medication}   onChange={up} />
      </div>

      <div className="reg-section" style={{ marginTop: "8px" }}>DONATION DETAILS</div>
      <div className="form-grid-2">
        <div className="form-group"><label className="form-label">Units Donated <span className="req">*</span></label>
          <input className="form-input" type="number" value={form.quantity} onChange={e => up("quantity", e.target.value)} placeholder="e.g. 1" min="1" /></div>
        <div className="form-group">
          <label className="form-label">Component Type <span className="req">*</span></label>
          <select className="form-input" value={form.component_type} onChange={e => up("component_type", e.target.value)}>
            {["Whole Blood","PRBC","Platelets","FFP"].map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
    </>
  );

  return (
    <div className="fade-in">
      <div className="panel-header">
        <h1>Donor Registration</h1>
        <div className="panel-breadcrumb">Staff Panel · <span>Register New Donor</span></div>
      </div>

      <div className="reg-form">
        <h3 style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "1rem", marginBottom: "4px" }}>Donor Registration Form</h3>
        <p style={{ fontSize: "0.8rem", color: "var(--text-3)", marginBottom: "20px" }}>Register a new donor or log a donation for a returning donor</p>

        {/* ── Mode Toggle ── */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "28px", background: "var(--bg)", borderRadius: "10px", padding: "4px", width: "fit-content", border: "1px solid var(--border-md)" }}>
          {[["new", "New Donor"], ["returning", "Returning Donor"]].map(([val, label]) => (
            <button key={val} onClick={() => { setMode(val); setSelected(null); setQuery(""); setResults([]); setForm(emptyForm); }}
              style={{ padding: "7px 20px", borderRadius: "7px", border: "none", cursor: "pointer", fontSize: "0.82rem", fontWeight: 600, transition: "all 0.15s", background: mode === val ? "var(--red)" : "transparent", color: mode === val ? "#fff" : "var(--text-3)" }}>
              {label}
            </button>
          ))}
        </div>

        {/* ════ NEW DONOR ════ */}
        {mode === "new" && (<>
          {sharedForm(false)}
          <div className="reg-form-footer">
            <button className="btn btn-secondary" onClick={() => setForm(emptyForm)}>Reset Form</button>
            <button className="btn btn-primary" onClick={handleNew} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
              {loading ? "Saving…" : "💾 Save Donor"}
            </button>
          </div>
        </>)}

        {/* ════ RETURNING DONOR ════ */}
        {mode === "returning" && (<>
          <div className="reg-section">SEARCH DONOR</div>

          {/* Search box */}
          <div ref={searchRef} style={{ position: "relative", marginBottom: "24px" }}>
            <div className="form-group">
              <label className="form-label">Search by Name</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--text-4)" }}>
                  <Icon.Search />
                </span>
                <input className="form-input" style={{ paddingLeft: "36px" }} placeholder="Type donor name…"
                  value={query} onChange={e => { setQuery(e.target.value); setSelected(null); setForm(emptyForm); }}
                  onFocus={() => results.length > 0 && setShowDrop(true)} autoComplete="off" />
                {searching && <span style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "0.75rem", color: "var(--text-3)" }}>Searching…</span>}
              </div>
            </div>

            {/* Dropdown */}
            {showDrop && results.length > 0 && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "var(--surface)", border: "1px solid var(--border-md)", borderRadius: "8px", boxShadow: "var(--shadow-lg)", maxHeight: "260px", overflowY: "auto" }}>
                {results.map(d => (
                  <div key={d.donor_id}
                    style={{ padding: "10px 14px", cursor: d.eligibility_status ? "pointer" : "not-allowed", display: "flex", alignItems: "center", gap: "12px", borderBottom: "1px solid var(--border)", opacity: d.eligibility_status ? 1 : 0.5 }}
                    onClick={() => { if (d.eligibility_status) selectDonor(d); else showToast(`${d.donor_name} is ineligible and cannot donate.`, "error"); }}
                    onMouseEnter={e => { if (d.eligibility_status) e.currentTarget.style.background = "var(--bg)"; }}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                  >
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "var(--red-light)", color: "var(--red)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "0.78rem", flexShrink: 0 }}>
                      {d.donor_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{d.donor_name}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>
                        DOB: {fmtDate(d.date_of_birth)} · {d.donor_blood_group || "Unknown BG"} · Last donated: {fmtDate(d.last_donation_date)}
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", alignItems: "flex-end" }}>
                      {d.eligibility_status
                        ? <span className="badge badge-green">Eligible</span>
                        : <span className="badge badge-red">Ineligible</span>}
                      <button className="btn btn-secondary" style={{ fontSize: "0.7rem", padding: "2px 8px", lineHeight: 1.4 }}
                        onClick={e => { e.stopPropagation(); loadHistory(d); }}>
                        History
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {showDrop && results.length === 0 && !searching && query.trim() && (
              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "var(--surface)", border: "1px solid var(--border-md)", borderRadius: "8px", padding: "14px", textAlign: "center", fontSize: "0.82rem", color: "var(--text-3)" }}>
                No donors found for "{query}"
              </div>
            )}
          </div>

          {/* Form fills after selection */}
          {selected ? (<>
            <div style={{ background: "var(--green-light)", border: "1px solid var(--green)", borderRadius: "8px", padding: "10px 14px", marginBottom: "20px", fontSize: "0.82rem", color: "var(--green)", display: "flex", alignItems: "center", gap: "8px" }}>
              <Icon.Check /> Donor selected — fields pre-filled. You can update any details below.
            </div>
            {sharedForm(true)}
            <div className="reg-form-footer">
              <button className="btn btn-secondary" onClick={() => { setSelected(null); setQuery(""); setForm(emptyForm); }}>Clear</button>
              <button className="btn btn-primary" onClick={handleReturning} disabled={loading} style={{ opacity: loading ? 0.7 : 1 }}>
                {loading ? "Logging…" : "💉 Log Donation"}
              </button>
            </div>
          </>) : (
            <div style={{ textAlign: "center", padding: "32px 20px", color: "var(--text-3)", fontSize: "0.875rem" }}>
              Search and select an eligible donor above to log their donation
            </div>
          )}
        </>)}
      </div>

      {/* ── Donation History Modal ── */}
      {historyDonor && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setHistoryDonor(null)}>
          <div className="modal" style={{ maxWidth: "580px" }}>
            <div className="modal-title">Donation History — {historyDonor.donor_name}</div>
            {histLoading ? (
              <div style={{ textAlign: "center", padding: "24px", color: "var(--text-3)" }}>Loading…</div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: "var(--text-3)" }}>No donation records found.</div>
            ) : (
              <div className="table-wrap" style={{ maxHeight: "320px", overflowY: "auto" }}>
                <table>
                  <thead>
                    <tr><th>DATE</th><th>COMPONENT</th><th>UNITS</th><th>STAFF</th></tr>
                  </thead>
                  <tbody>
                    {history.map(h => (
                      <tr key={h.donation_id}>
                        <td style={{ fontSize: "0.85rem" }}>{fmtDate(h.donation_date)}</td>
                        <td style={{ fontSize: "0.85rem" }}>{h.component_type}</td>
                        <td style={{ fontSize: "0.85rem" }}>{h.quantity}</td>
                        <td style={{ fontSize: "0.85rem" }}>{h.staff_name || "—"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setHistoryDonor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`toast${toast.type === "success" ? " toast-green" : " toast-red"}`}>
          {toast.type === "success" ? <Icon.Check /> : <Icon.X />} {toast.msg}
        </div>
      )}
    </div>
  );
};

export default StaffRegister;