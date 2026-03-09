import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Icon from "../../components/Icons";
import { adminGetRequests, adminApproveRequest, adminRejectRequest } from "../../api";

const AdminRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  const load = () => {
    setLoading(true);
    adminGetRequests()
      .then(res => {
        console.log(res.data);
        setRequests(res.data);
      })
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleApprove = async (id) => {
    try {
      await adminApproveRequest(id);
      showToast("Request approved!");
      load();
    } catch (e) { showToast(e.message, "error"); }
  };

  const handleReject = async () => {
    try {
      await adminRejectRequest(rejectModal.request_id, rejectReason);
      setRejectModal(null); setRejectReason("");
      showToast("Request rejected.");
      load();
    } catch (e) { showToast(e.message, "error"); }
  };

  return (
    <div className="fade-in">
      <div className="panel-header">
        <h1>Blood Requests</h1>
        <div className="panel-breadcrumb">Admin Panel · <span>Request Management</span></div>
      </div>

      <div style={{ padding: "24px 28px" }}>
        {loading ? <div style={{ color: "var(--text-3)" }}>Loading…</div>
          : err ? <div style={{ color: "var(--red)" }}>{err}</div>
            : (
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr><th>PATIENT</th><th>REQUESTER</th><th>BLOOD</th><th>UNITS</th><th>URGENCY</th><th>DATE</th><th>STATUS</th><th>FULFILLMENT</th><th>ACTIONS</th></tr>
                    </thead>
                    <tbody>
                      {requests.map(r => (
                        <tr key={r.request_id} className={r.urgency === "EMERGENCY" ? "emergency-row" : ""} style={r.urgency === "EMERGENCY" ? { borderLeft: "3px solid var(--red)" } : {}}>
                          <td style={{ fontWeight: 600 }}>{r.patient_name}</td>
                          <td style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>{r.customer_name || r.requester_name}</td>
                          <td>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <div className="blood-chip blood-chip-sm">{r.blood_group}</div>
                              <span style={{ fontSize: "0.8rem", color: "var(--text-3)" }}>{r.component_type}</span>
                            </div>
                          </td>
                          <td style={{ fontWeight: 600 }}>{r.requested_quantity}</td>
                          <td><span className={`badge ${r.urgency === "EMERGENCY" ? "badge-red badge-pulse" : "badge-blue"}`}>{r.urgency === "EMERGENCY" ? "🚨 Emergency" : "Normal"}</span></td>
                          <td style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>{r.request_date ? new Date(r.request_date).toLocaleDateString() : "—"}</td>
                          <td><span className={`badge ${r.status === "APPROVED" ? "badge-green" : r.status === "REJECTED" ? "badge-red" : "badge-amber"}`}>{r.status}</span></td>
                          <td style={{ fontSize: "0.78rem" }}>
                            <span className={`badge ${r.fulfillment_status === "Can Fulfill" ? "badge-green" : "badge-amber"}`}>
                              {r.fulfillment_status || "—"}
                            </span>
                          </td>
                          <td>
                            {r.status === "PENDING" ? (
                              <div style={{ display: "flex", gap: "6px" }}>
                                <button className="btn btn-approve" style={{ display: "flex", alignItems: "center", gap: "4px" }} onClick={() => handleApprove(r.request_id)}><Icon.Check />Approve</button>
                                <button className="btn btn-danger" style={{ display: "flex", alignItems: "center", gap: "4px" }} onClick={() => setRejectModal(r)}><Icon.X />Reject</button>
                              </div>
                            ) : <span style={{ fontSize: "0.8rem", color: "var(--text-4)" }}>—</span>}
                          </td>
                        </tr>
                      ))}
                      {requests.length === 0 && <tr><td colSpan={9} style={{ textAlign: "center", padding: "32px", color: "var(--text-3)" }}>No requests found.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
      </div>

      {rejectModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setRejectModal(null)}>
          <div className="modal">
            <div className="modal-title">Reject Request</div>
            <p style={{ fontSize: "0.875rem", color: "var(--text-3)", marginBottom: "16px" }}>
              Rejecting request for <strong style={{ color: "var(--text)" }}>{rejectModal.patient_name}</strong>. Please provide a reason.
            </p>
            <div className="form-group">
              <label className="form-label">Reason <span className="req">*</span></label>
              <textarea className="form-input" rows="3" value={rejectReason} onChange={e => setRejectReason(e.target.value)} placeholder="e.g. Insufficient stock…" style={{ resize: "vertical" }} />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => { setRejectModal(null); setRejectReason(""); }}>Cancel</button>
              <button className="btn btn-primary btn-sm" style={{ background: "var(--red)" }} onClick={handleReject} disabled={!rejectReason}>Reject</button>
            </div>
          </div>
        </div>
      )}

      {toast && createPortal(
        <div className={`toast${toast.type === "success" ? " toast-green" : " toast-red"}`}>{toast.msg}</div>,
        document.body
      )}
    </div>
  );
};

export default AdminRequests;
