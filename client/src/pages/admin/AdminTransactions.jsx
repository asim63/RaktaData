import { useState, useEffect } from "react";
import { adminGetTransactions } from "../../api";

const AdminTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState("");

  useEffect(() => {
    adminGetTransactions()
      .then(res => setTransactions(res.data))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const actionBadge = a =>
    a==="DISPENSED"?"badge-blue":a==="EXPIRED"?"badge-red":a==="ADDED"?"badge-green":"badge-amber";

  return (
    <div className="fade-in">
      <div className="panel-header">
        <h1>Transactions</h1>
        <div className="panel-breadcrumb">Admin Panel · <span>Stock Audit Log</span></div>
      </div>

      <div style={{padding:"24px 28px"}}>
        {loading ? <div style={{color:"var(--text-3)"}}>Loading…</div>
        : err     ? <div style={{color:"var(--red)"}}>{err}</div>
        : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>ACTION</th><th>BLOOD TYPE</th><th>COMPONENT</th><th>QTY</th><th>DATE</th><th>BY</th><th>NOTE</th></tr>
                </thead>
                <tbody>
                  {transactions.map((t,i)=>(
                    <tr key={i}>
                      <td><span className={`badge ${actionBadge(t.action)}`}>{t.action}</span></td>
                      <td><div className="blood-chip blood-chip-sm">{t.blood_group}</div></td>
                      <td style={{fontSize:"0.875rem"}}>{t.component_type}</td>
                      <td style={{fontWeight:600}}>{t.quantity_change ?? t.quantity}</td>
                      <td style={{fontSize:"0.82rem",color:"var(--text-3)"}}>{t.transaction_date ? new Date(t.transaction_date).toLocaleDateString() : "—"}</td>
                      <td style={{fontSize:"0.82rem",color:"var(--text-3)"}}>{t.performed_by || t.handled_by || "—"}</td>
                      <td style={{fontSize:"0.82rem",color:"var(--text-4)"}}>{t.notes || t.note || "—"}</td>
                    </tr>
                  ))}
                  {transactions.length===0 && <tr><td colSpan={7} style={{textAlign:"center",padding:"32px",color:"var(--text-3)"}}>No transactions found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminTransactions;
