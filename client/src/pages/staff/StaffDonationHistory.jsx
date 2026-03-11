import { useEffect, useState } from "react";
import { staffGetRecentDonations } from "../../api";

const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : "—");

const StaffDonationHistory = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [limit, setLimit] = useState(25);

  const load = () => {
    setLoading(true);
    setErr("");
    staffGetRecentDonations(limit)
      .then((res) => setDonations(res.data || []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [limit]);

  return (
    <div className="fade-in">
      <div className="panel-header">
        <h1>Donation History</h1>
        <div className="panel-breadcrumb">Staff Panel · <span>Recent Donations</span></div>
      </div>

      <div style={{ padding: "20px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", marginBottom: "14px" }}>
          <div style={{ fontSize: "0.85rem", color: "var(--text-3)" }}>
            Shows the most recent donations (hover a row to see the donation ID).
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ fontSize: "0.78rem", color: "var(--text-3)", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>Rows</div>
            <select className="form-input" style={{ width: "120px" }} value={limit} onChange={(e) => setLimit(Number(e.target.value))}>
              {[25, 50, 100, 200].map((n) => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "32px", color: "var(--text-3)" }}>Loading…</div>
        ) : err ? (
          <div style={{ padding: "32px", color: "var(--red)" }}>{err}</div>
        ) : (
          <div className="card">
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.95rem" }}>Recent Donations</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: "2px" }}>{donations.length} records shown</div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>DONOR</th>
                    <th>PHONE</th>
                    <th>BLOOD GROUP</th>
                    <th>COMPONENT</th>
                    <th>DONATION DATE</th>
                  </tr>
                </thead>
                <tbody>
                  {donations.map((d) => (
                    <tr key={d.donation_id} className="donation-row">
                      <td>
                        <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{d.donor_name}</div>
                        <div className="donation-id-hover">Donation ID: {d.donation_id}</div>
                      </td>
                      <td style={{ fontSize: "0.85rem" }}>{d.donor_phone_no || "—"}</td>
                      <td><div className="blood-chip blood-chip-sm">{d.donor_blood_group || "—"}</div></td>
                      <td style={{ fontSize: "0.85rem" }}>{d.component_type}</td>
                      <td style={{ fontSize: "0.85rem" }}>{fmtDate(d.donation_date)}</td>
                    </tr>
                  ))}
                  {donations.length === 0 && (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", padding: "32px", color: "var(--text-3)" }}>
                        No donation records found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StaffDonationHistory;

