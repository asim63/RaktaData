import { useState, useEffect } from "react";
import { adminGetCustomers } from "../../api";

const COLORS = ["#DC2626","#7C3AED","#059669","#D97706","#2563EB","#DB2777"];

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [err, setErr]             = useState("");
  const [search, setSearch]       = useState("");

  useEffect(() => {
    adminGetCustomers()
      .then(res => setCustomers(res.data))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = customers.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.username.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="fade-in">
      <div className="panel-header">
        <h1>Customers</h1>
        <div className="panel-breadcrumb">Admin Panel · <span>All Customers</span></div>
      </div>

      <div style={{ padding: "24px 28px" }}>

        {/* Stats card */}
        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          <div className="card" style={{ padding: "20px 28px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 700 }}>
              {customers.length}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Total Customers</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>Registered hospitals & clinics</div>
            </div>
          </div>
          <div className="card" style={{ padding: "20px 28px", display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ fontFamily: "var(--font-head)", fontSize: "2rem", fontWeight: 700 }}>
              {customers.reduce((sum, c) => sum + parseInt(c.total_requests || 0), 0)}
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: "0.9rem" }}>Total Requests</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-3)" }}>Across all customers</div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div style={{ marginBottom: "16px", maxWidth: "400px" }}>
          <input
            className="form-input"
            placeholder="Search by name or username…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading ? <div style={{ color: "var(--text-3)" }}>Loading…</div>
        : err     ? <div style={{ color: "var(--red)" }}>{err}</div>
        : (
          <div className="card">
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)" }}>
              <div style={{ fontFamily: "var(--font-head)", fontWeight: 700, fontSize: "0.95rem" }}>Customer Accounts</div>
              <div style={{ fontSize: "0.78rem", color: "var(--text-3)", marginTop: "2px" }}>{filtered.length} customers shown</div>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>NAME</th><th>USERNAME</th><th>CONTACT</th><th>ADDRESS</th><th>REQUESTS</th><th>JOINED</th></tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.customer_id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <div className="donor-avatar" style={{ background: COLORS[i % COLORS.length] }}>
                            {c.name.split(" ").map(n => n[0]).join("").slice(0, 2)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, fontSize: "0.875rem" }}>{c.name}</div>
                            <div style={{ fontSize: "0.75rem", color: "var(--text-3)" }}>{c.email || "—"}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ fontSize: "0.85rem", color: "var(--text-3)" }}>{c.username}</td>
                      <td style={{ fontSize: "0.85rem" }}>{c.phone_no || "—"}</td>
                      <td style={{ fontSize: "0.85rem", color: "var(--text-3)" }}>{c.address || "—"}</td>
                      <td>
                        <span className="badge badge-blue">{c.total_requests} requests</span>
                      </td>
                      <td style={{ fontSize: "0.82rem", color: "var(--text-3)" }}>
                        {c.date_of_creation ? new Date(c.date_of_creation).toLocaleDateString() : "—"}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={6} style={{ textAlign: "center", padding: "32px", color: "var(--text-3)" }}>No customers found.</td></tr>
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

export default AdminCustomers;