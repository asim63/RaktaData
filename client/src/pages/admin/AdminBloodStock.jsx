import { useState, useEffect } from "react";
import Icon from "../../components/Icons";
import {
  adminGetBloodStock,
  adminGetBloodStockOverview,
  adminAddBloodStock,
  adminAdjustBloodStock,
} from "../../api";

// ─── helpers ────────────────────────────────────────────────────────────────
const statusBadge = (s) =>
  s === "Critical" || s === "Out of Stock"
    ? "badge-red"
    : s === "Low"
    ? "badge-amber"
    : "badge-green";

const AdminBloodStock = () => {
  // ── overview (cards) ──────────────────────────────────────────────────────
  const [overview, setOverview]     = useState([]);
  const [ovLoading, setOvLoading]   = useState(true);
  const [ovErr, setOvErr]           = useState("");

  // ── batch detail (table) ─────────────────────────────────────────────────
  const [selected, setSelected]     = useState(null);   // { blood_group, component_type }
  const [batches, setBatches]       = useState([]);
  const [btLoading, setBtLoading]   = useState(false);
  const [btErr, setBtErr]           = useState("");

  // ── modals ────────────────────────────────────────────────────────────────
  const [addModal, setAddModal]         = useState(false);
  const [adjustModal, setAdjustModal]   = useState(null);
  const [addForm, setAddForm]           = useState({ blood_group: "", component_type: "Whole Blood", units: "" });
  const [newUnits, setNewUnits]         = useState("");
  const [toast, setToast]               = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── load overview cards ───────────────────────────────────────────────────
  const loadOverview = () => {
    setOvLoading(true);
    adminGetBloodStockOverview()
      .then((res) => setOverview(res.data))
      .catch((e) => setOvErr(e.message))
      .finally(() => setOvLoading(false));
  };

  useEffect(() => { loadOverview(); }, []);

  // ── load batches for selected card ────────────────────────────────────────
  const loadBatches = (blood_group, component_type) => {
    setBtLoading(true);
    setBtErr("");
    adminGetBloodStock({ blood_group, component_type })
      .then((res) => setBatches(res.data))
      .catch((e) => setBtErr(e.message))
      .finally(() => setBtLoading(false));
  };

  const handleCardClick = (card) => {
    setSelected({ blood_group: card.blood_group, component_type: card.component_type });
    loadBatches(card.blood_group, card.component_type);
  };

  const handleBack = () => {
    setSelected(null);
    setBatches([]);
  };

  // ── add stock ─────────────────────────────────────────────────────────────
  const handleAdd = async () => {
    try {
      await adminAddBloodStock(addForm);
      setAddModal(false);
      setAddForm({ blood_group: "", component_type: "Whole Blood", units: "" });
      showToast("Blood stock added!");
      loadOverview();
      // refresh batches if currently viewing same group+component
      if (
        selected &&
        selected.blood_group === addForm.blood_group &&
        selected.component_type === addForm.component_type
      ) {
        loadBatches(addForm.blood_group, addForm.component_type);
      }
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  // ── adjust stock ──────────────────────────────────────────────────────────
  const handleAdjust = async () => {
    try {
      await adminAdjustBloodStock(adjustModal.stock_id, newUnits);
      setAdjustModal(null);
      setNewUnits("");
      showToast("Stock adjusted!");
      loadOverview();
      if (selected) loadBatches(selected.blood_group, selected.component_type);
    } catch (e) {
      showToast(e.message, "error");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="fade-in">

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div className="panel-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1>Blood Stock</h1>
          <div className="panel-breadcrumb">
            Admin Panel ·{" "}
            {selected ? (
              <>
                <span
                  onClick={handleBack}
                  style={{ cursor: "pointer", color: "var(--red)" }}
                >
                  Inventory Management
                </span>
                {" · "}
                <span>
                  {selected.blood_group} — {selected.component_type}
                </span>
              </>
            ) : (
              <span>Inventory Management</span>
            )}
          </div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setAddModal(true)}>
          <Icon.Plus /> Add Stock
        </button>
      </div>

      <div style={{ padding: "24px 28px" }}>

        {/* ══ LEVEL 1: OVERVIEW CARDS ══════════════════════════════════════ */}
        {!selected && (
          <>
            {ovLoading ? (
              <div style={{ color: "var(--text-3)" }}>Loading…</div>
            ) : ovErr ? (
              <div style={{ color: "var(--red)" }}>{ovErr}</div>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))", gap: "16px" }}>
                {overview
                  .filter((s) => parseFloat(s.total_available_units) > 0)
                  .map((s, i) => (
                    <div
                      key={i}
                      className="card"
                      style={{ padding: "20px", textAlign: "center", cursor: "pointer", transition: "transform 0.15s, box-shadow 0.15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.12)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                      onClick={() => handleCardClick(s)}
                    >
                      {/* Blood group chip */}
                      <div className="blood-chip" style={{ margin: "0 auto 12px" }}>
                        {s.blood_group}
                      </div>

                      {/* Component type */}
                      <div style={{ fontSize: "0.82rem", color: "var(--text-3)", marginBottom: "8px" }}>
                        {s.component_type}
                      </div>

                      {/* Total units */}
                      <div style={{ fontFamily: "var(--font-head)", fontSize: "1.8rem", fontWeight: 700, marginBottom: "8px" }}>
                        {parseFloat(s.total_available_units).toFixed(2)}
                      </div>

                      {/* Status badge */}
                      <span className={`badge ${statusBadge(s.availability_status)}`}>
                        {s.availability_status}
                      </span>

                      {/* Batches count hint */}
                      <div style={{ marginTop: "12px", fontSize: "0.75rem", color: "var(--text-3)" }}>
                      click to view batches →
                      </div>
                    </div>
                  ))}

                {overview.filter((s) => parseFloat(s.total_available_units) > 0).length === 0 && (
                  <div style={{ color: "var(--text-3)" }}>No stock available.</div>
                )}
              </div>
            )}
          </>
        )}

        {/* ══ LEVEL 2: BATCH DETAIL TABLE ══════════════════════════════════ */}
        {selected && (
          <>
            {/* Back button */}
            <button
              className="btn btn-secondary btn-sm"
              style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "6px" }}
              onClick={handleBack}
            >
              ← Back to Overview
            </button>

            {/* Summary row */}
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px" }}>
              <div className="blood-chip">{selected.blood_group}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: "1rem" }}>{selected.component_type}</div>
                <div style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>
                  Individual batch entries — oldest expiry first
                </div>
              </div>
            </div>

            {btLoading ? (
              <div style={{ color: "var(--text-3)" }}>Loading batches…</div>
            ) : btErr ? (
              <div style={{ color: "var(--red)" }}>{btErr}</div>
            ) : (
              <div className="card">
                <div className="table-wrap">
                  <table>
                    <thead>
                      <tr>
                        <th>BATCH ID</th>
                        <th>UNITS</th>
                        <th>ADDED DATE</th>
                        <th>EXPIRY DATE</th>
                        <th>DAYS LEFT</th>
                        <th>STATUS</th>
                        <th>ACTIONS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {batches.map((b) => (
                        <tr key={b.stock_id}>
                          <td style={{ color: "var(--text-3)", fontSize: "0.82rem" }}>#{b.stock_id}</td>
                          <td style={{ fontWeight: 600 }}>{b.available_units}</td>
                          <td style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>
                            {b.added_date ? new Date(b.added_date).toLocaleDateString() : "—"}
                          </td>
                          <td style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>
                            {b.expiry_date ? new Date(b.expiry_date).toLocaleDateString() : "—"}
                          </td>
                          <td style={{ fontSize: "0.82rem" }}>
                            <span style={{
                              color: b.days_until_expiry <= 5
                                ? "var(--red)"
                                : b.days_until_expiry <= 7
                                ? "var(--amber, #f59e0b)"
                                : "var(--text-2)"
                            }}>
                              {b.days_until_expiry} days
                            </span>
                          </td>
                          <td>
                            <span className={`badge ${statusBadge(b.availability_status)}`}>
                              {b.availability_status}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-edit"
                              style={{ display: "flex", alignItems: "center", gap: "4px" }}
                              onClick={() => { setAdjustModal(b); setNewUnits(String(b.available_units)); }}
                            >
                              <Icon.Edit /> Adjust
                            </button>
                          </td>
                        </tr>
                      ))}
                      {batches.length === 0 && (
                        <tr>
                          <td colSpan={7} style={{ textAlign: "center", padding: "32px", color: "var(--text-3)" }}>
                            No batches found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ══ ADD STOCK MODAL ══════════════════════════════════════════════════ */}
      {addModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setAddModal(false)}>
          <div className="modal">
            <div className="modal-title">Add Blood Stock</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div className="form-group">
                <label className="form-label">Blood Group <span className="req">*</span></label>
                <select
                  className="form-input"
                  value={addForm.blood_group}
                  onChange={(e) => setAddForm({ ...addForm, blood_group: e.target.value })}
                >
                  <option value="">Select</option>
                  {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((b) => (
                    <option key={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Component Type</label>
                <select
                  className="form-input"
                  value={addForm.component_type}
                  onChange={(e) => setAddForm({ ...addForm, component_type: e.target.value })}
                >
                  {["Whole Blood", "PRBC", "Platelets", "FFP"].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Units <span className="req">*</span></label>
                <input
                  className="form-input"
                  type="number"
                  min="1"
                  value={addForm.units}
                  onChange={(e) => setAddForm({ ...addForm, units: e.target.value })}
                  placeholder="e.g. 10"
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setAddModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleAdd}>Add Stock</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ADJUST MODAL ═════════════════════════════════════════════════════ */}
      {adjustModal && (
        <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && setAdjustModal(null)}>
          <div className="modal">
            <div className="modal-title">
              Adjust Stock — {adjustModal.blood_group} {adjustModal.component_type}
            </div>
            <div style={{ color: "var(--text-3)", fontSize: "0.85rem", marginBottom: "16px" }}>
              Batch #{adjustModal.stock_id} · Current units: {adjustModal.available_units}
            </div>
            <div className="form-group">
              <label className="form-label">New Units Value</label>
              <input
                className="form-input"
                type="number"
                min="0"
                value={newUnits}
                onChange={(e) => setNewUnits(e.target.value)}
              />
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={() => setAdjustModal(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleAdjust}>Save</button>
            </div>
          </div>
        </div>
      )}

      {/* ══ TOAST ════════════════════════════════════════════════════════════ */}
      {toast && (
        <div className={`toast${toast.type === "success" ? " toast-green" : " toast-red"}`}>
          {toast.type === "success" ? <Icon.Check /> : <Icon.X />}
          {toast.msg}
        </div>
      )}
    </div>
  );
};

export default AdminBloodStock;