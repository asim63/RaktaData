import { useState, useEffect } from "react";
import { adminGetDashboard } from "../../api";

const AdminDashboard = () => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr]         = useState("");

  useEffect(() => {
    adminGetDashboard()
      .then(res => setData(res.data))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{padding:"40px",color:"var(--text-3)"}}>Loading…</div>;
  if (err)     return <div style={{padding:"40px",color:"var(--red)"}}>{err}</div>;

  const stats = [
    {label:"TOTAL DONORS",     value:data.stats.total_donors,     icon:"👥"},
    {label:"BLOOD COMPONENTS", value:data.stats.blood_components,  icon:"🩸"},
    {label:"PENDING REQUESTS", value:data.stats.pending_approval,  icon:"⏳"},
    {label:"TOTAL REQUESTS",   value:data.stats.total_requests,    icon:"📋"},
  ];

  return (
    <div className="fade-in">
      <div className="panel-header">
        <h1>Admin Dashboard</h1>
        <div className="panel-breadcrumb">Admin Panel · <span>Overview</span></div>
      </div>

      <div className="stats-row">
        {stats.map(s=>(
          <div key={s.label} className="card stat-card">
            <div style={{fontSize:"1.5rem",marginBottom:"4px"}}>{s.icon}</div>
            <div className="stat-label">{s.label}</div>
            <div className="stat-value">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div style={{padding:"20px 20px 0"}}>
            <div style={{fontFamily:"var(--font-head)",fontWeight:700,fontSize:"0.95rem"}}>Recent Requests</div>
          </div>
          <div style={{padding:"14px 20px"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr>{["REQUESTER","PATIENT","TYPE","URGENCY","STATUS"].map(h=><th key={h} style={{padding:"8px 10px",textAlign:"left",fontSize:"0.7rem",fontWeight:600,color:"var(--text-4)",letterSpacing:"0.06em"}}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {data.recent_requests.map(r=>(
                  <tr key={r.request_id}>
                    <td style={{padding:"10px",fontWeight:600,fontSize:"0.875rem"}}>{r.requester_name}</td>
                    <td style={{padding:"10px",fontSize:"0.82rem",color:"var(--text-3)"}}>{r.patient_name}</td>
                    <td style={{padding:"10px"}}><div className="blood-chip blood-chip-sm">{r.blood_group}</div></td>
                    <td style={{padding:"10px"}}><span className={`badge ${r.urgency==="EMERGENCY"?"badge-red":"badge-blue"}`}>{r.urgency}</span></td>
                    <td style={{padding:"10px"}}><span className={`badge ${r.status==="APPROVED"?"badge-green":r.status==="REJECTED"?"badge-red":"badge-amber"}`}>{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card">
          <div style={{padding:"20px 20px 0"}}>
            <div style={{fontFamily:"var(--font-head)",fontWeight:700,fontSize:"0.95rem"}}>Stock Overview</div>
            <div style={{fontSize:"0.78rem",color:"var(--text-3)",marginTop:"2px"}}>Critical items first</div>
          </div>
          <div style={{padding:"14px 20px"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr>{["TYPE","COMPONENT","UNITS","STATUS"].map(h=><th key={h} style={{padding:"8px 8px",textAlign:"left",fontSize:"0.7rem",fontWeight:600,color:"var(--text-4)",letterSpacing:"0.06em"}}>{h}</th>)}</tr>
              </thead>
              <tbody>
                {data.stock_overview.map((s,i)=>(
                  <tr key={i}>
                    <td style={{padding:"10px 8px"}}><div className="blood-chip blood-chip-sm">{s.blood_group}</div></td>
                    <td style={{padding:"10px 8px",fontSize:"0.875rem"}}>{s.component_type}</td>
                    <td style={{padding:"10px 8px",fontWeight:600}}>{s.total_available_units}</td>
                    <td style={{padding:"10px 8px"}}><span className={`badge ${s.availability_status==="Critical"||s.availability_status==="Out of Stock"?"badge-red":s.availability_status==="Low"?"badge-amber":"badge-green"}`}>{s.availability_status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
