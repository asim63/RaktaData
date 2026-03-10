import { useState, useEffect } from "react";
import Icon from "../../components/Icons";
import { staffGetDonors, staffUpdateDonor } from "../../api";

const COLORS = ["#DC2626","#7C3AED","#059669","#D97706","#2563EB","#DB2777"];
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const authHeaders = () => ({ "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` });
const fmtDate = (d) => d ? new Date(d).toLocaleDateString() : "—";

const StaffDonors = ({ setPage }) => {
  const [donors, setDonors]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [err, setErr]               = useState("");
  const [search, setSearch]         = useState("");
  const [bgFilter, setBgFilter]     = useState("");
  const [eligFilter, setEligFilter] = useState("");
  const [editModal, setEditModal]   = useState(null);
  const [editForm, setEditForm]     = useState({});
  const [toast, setToast]           = useState(null);

  // ── History ──
  const [histDonor, setHistDonor]   = useState(null);
  const [history, setHistory]       = useState([]);
  const [histLoading, setHistLoading] = useState(false);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const load = () => {
    setLoading(true);
    const params = {};
    if (search)     params.name = search;
    if (bgFilter)   params.blood_group = bgFilter;
    if (eligFilter) params.eligibility_status = eligFilter;
    staffGetDonors(params)
      .then(res => setDonors(res.data))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, bgFilter, eligFilter]);

  const handleEdit = async () => {
    try {
      await staffUpdateDonor(editModal.donor_id, editForm);
      showToast("Donor updated!");
      setEditModal(null);
      load();
    } catch(e) { showToast(e.message, "error"); }
  };

  const loadHistory = async (donor) => {
    setHistDonor(donor);
    setHistLoading(true);
    setHistory([]);
    try {
      const r = await fetch(`${BASE_URL}/staff/donations/${donor.donor_id}`, { headers: authHeaders() });
      const data = await r.json();
      setHistory(data.data || []);
    } catch { setHistory([]); }
    finally { setHistLoading(false); }
  };

  return (
    <div className="fade-in">
      <div className="panel-header">
        <h1>Donor Details</h1>
        <div className="panel-breadcrumb">Staff Panel · <span>All Donors</span></div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px", alignItems: "center" }}>
          <div className="search-bar" style={{ flex: 1 }}>
            <Icon.Search />
            <input className="form-input" placeholder="Search by name…" value={search}
              onChange={e => setSearch(e.target.value)} style={{ paddingLeft: "36px" }} />
          </div>
          <select className="form-input" style={{ width: "165px" }} value={bgFilter} onChange={e => setBgFilter(e.target.value)}>
            <option value="">All Blood Groups</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b}>{b}</option>)}
          </select>
          <select className="form-input" style={{ width: "140px" }} value={eligFilter} onChange={e => setEligFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="true">Eligible</option>
            <option value="false">Ineligible</option>
          </select>
          <button className="btn btn-primary btn-sm" style={{ whiteSpace: "nowrap", padding: "9px 16px" }} onClick={() => setPage("Staff-Register")}>
            <Icon.Plus /> Add Donor
          </button>
        </div>

        {loading ? <div style={{ padding: "32px", color: "var(--text-3)" }}>Loading…</div>
        : err     ? <div style={{ padding: "32px", color: "var(--red)" }}>{err}</div>
        : (
          <div className="card">
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.95rem" }}>Donor Details</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: "2px" }}>{donors.length} donors shown · Click a row to view donation history</div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>FULL NAME</th><th>BLOOD GROUP</th><th>CONTACT</th><th>LAST DONATION</th><th>ELIGIBILITY</th><th>ACTIONS</th></tr>
                </thead>
                <tbody>
                  {donors.map((d, i) => (
                    <tr key={d.donor_id}
                      onClick={() => loadHistory(d)}
                      style={{ cursor: "pointer" }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--bg)"}
                      onMouseLeave={e => e.currentTarget.style.background = ""}
                    >
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="donor-avatar" style={{ background: COLORS[i % COLORS.length] }}>
                            {d.donor_name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{d.donor_name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{d.donor_address}</div>
                          </div>
                        </div>
                      </td>
                      <td><div className="blood-chip blood-chip-sm">{d.donor_blood_group}</div></td>
                      <td style={{ fontSize: "0.85rem" }}>{d.donor_phone_no}</td>
                      <td style={{ fontSize: "0.85rem" }}>{fmtDate(d.last_donation_date)}</td>
                      <td><span className={`badge ${d.eligibility_status ? "badge-green" : "badge-red"}`}>{d.eligibility_status ? "Eligible" : "Ineligible"}</span></td>
                      <td>
                        {/* stop propagation so row click doesn't also fire */}
                        <button className="btn btn-edit" style={{ display: "flex", alignItems: "center", gap: "4px" }}
                          onClick={e => { e.stopPropagation(); setEditModal(d); setEditForm({ donor_name: d.donor_name, donor_phone_no: d.donor_phone_no, donor_address: d.donor_address, donor_blood_group: d.donor_blood_group }); }}>
                          <Icon.Edit />Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                  {donors.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-3)" }}>No donors found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ── Donation History Modal ── */}
      {histDonor && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setHistDonor(null)}>
          <div className="modal" style={{ maxWidth: "600px" }}>
            <div className="modal-title">
              Donation History — {histDonor.donor_name}
              <span className={`badge ${histDonor.eligibility_status ? "badge-green" : "badge-red"}`} style={{ marginLeft: "10px", fontSize: "0.7rem" }}>
                {histDonor.eligibility_status ? "Eligible" : "Ineligible"}
              </span>
            </div>

            {/* Donor summary */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "10px", padding: "12px 16px", background: "var(--bg)", borderRadius: "8px", marginBottom: "16px" }}>
              {[
                ["Blood Group", histDonor.donor_blood_group || "—"],
                ["Phone",       histDonor.donor_phone_no   || "—"],
                ["Last Donated", fmtDate(histDonor.last_donation_date)],
              ].map(([label, val]) => (
                <div key={label}>
                  <div style={{ fontSize: "0.7rem", color: "var(--text-3)", marginBottom: "2px" }}>{label}</div>
                  <div style={{ fontSize: "0.875rem", fontWeight: 600 }}>{val}</div>
                </div>
              ))}
            </div>

            {/* History table */}
            {histLoading ? (
              <div style={{ textAlign: "center", padding: "24px", color: "var(--text-3)" }}>Loading…</div>
            ) : history.length === 0 ? (
              <div style={{ textAlign: "center", padding: "24px", color: "var(--text-3)" }}>No donation records found for this donor.</div>
            ) : (
              <div className="table-wrap" style={{ maxHeight: "280px", overflowY: "auto" }}>
                <table>
                  <thead>
                    <tr><th>#</th><th>DATE</th><th>COMPONENT</th><th>UNITS</th></tr>
                  </thead>
                  <tbody>
                    {history.map((h, i) => (
                      <tr key={h.donation_id}>
                        <td style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>{history.length - i}</td>
                        <td style={{ fontSize: "0.85rem" }}>{fmtDate(h.donation_date)}</td>
                        <td style={{ fontSize: "0.85rem" }}>{h.component_type}</td>
                        <td style={{ fontSize: "0.85rem" }}>{h.quantity}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setHistDonor(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Edit Modal ── */}
      {editModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setEditModal(null)}>
          <div className="modal">
            <div className="modal-title">Edit Donor — {editModal.donor_name}</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {[["donor_name","Full Name"],["donor_phone_no","Phone"],["donor_address","Address"]].map(([k, l]) => (
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" value={editForm[k] || ""} onChange={e => setEditForm({ ...editForm, [k]: e.target.value })} />
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-input" value={editForm.donor_blood_group || ""} onChange={e => setEditForm({ ...editForm, donor_blood_group: e.target.value })}>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b => <option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setEditModal(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast${toast.type === "success" ? " toast-green" : " toast-red"}`}>{toast.msg}</div>}
    </div>
  );
};

export default StaffDonors;