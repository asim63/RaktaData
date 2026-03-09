import { useState, useEffect } from "react";
import Icon from "../../components/Icons";
import { adminGetStaff, adminCreateStaff, adminDeleteStaff } from "../../api";

const AdminStaff = () => {
  const [staff, setStaff]           = useState([]);
  const [loading, setLoading]       = useState(true);
  const [err, setErr]               = useState("");
  const [addModal, setAddModal]     = useState(false);
  const [deleteModal, setDeleteModal] = useState(null);
  const [form, setForm]             = useState({staff_name:"",username:"",password:""});
  const [toast, setToast]           = useState(null);

  const showToast = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const load = () => {
    setLoading(true);
    adminGetStaff()
      .then(res => setStaff(res.data))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    try {
      await adminCreateStaff(form);
      setAddModal(false); setForm({staff_name:"",username:"",password:""});
      showToast("Staff account created!");
      load();
    } catch(e) { showToast(e.message,"error"); }
  };

  const handleDelete = async () => {
    try {
      await adminDeleteStaff(deleteModal.staff_id);
      setDeleteModal(null);
      showToast("Staff account deleted.");
      load();
    } catch(e) { showToast(e.message,"error"); }
  };

  return (
    <div className="fade-in">
      <div className="panel-header" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h1>Staff Management</h1>
          <div className="panel-breadcrumb">Admin Panel · <span>Staff Accounts</span></div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={()=>setAddModal(true)}><Icon.Plus/>Add Staff</button>
      </div>

      <div style={{padding:"24px 28px"}}>
        {loading ? <div style={{color:"var(--text-3)"}}>Loading…</div>
        : err     ? <div style={{color:"var(--red)"}}>{err}</div>
        : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>NAME</th><th>USERNAME</th><th>DATE CREATED</th><th>ACTIONS</th></tr>
                </thead>
                <tbody>
                  {staff.map(s=>(
                    <tr key={s.staff_id}>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                          <div className="donor-avatar" style={{background:"#2563EB"}}>
                            {s.staff_name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                          </div>
                          <div style={{fontWeight:600,fontSize:"0.875rem"}}>{s.staff_name}</div>
                        </div>
                      </td>
                      <td style={{fontSize:"0.85rem",color:"var(--text-3)"}}>{s.username}</td>
                      <td style={{fontSize:"0.82rem",color:"var(--text-3)"}}>{s.date_of_creation ? new Date(s.date_of_creation).toLocaleDateString() : "—"}</td>
                      <td>
                        <button className="btn btn-danger" style={{display:"flex",alignItems:"center",gap:"4px"}} onClick={()=>setDeleteModal(s)}>
                          <Icon.Trash/>Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                  {staff.length===0 && <tr><td colSpan={4} style={{textAlign:"center",padding:"32px",color:"var(--text-3)"}}>No staff accounts.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {addModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setAddModal(false)}>
          <div className="modal">
            <div className="modal-title">Create Staff Account</div>
            <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
              {[["staff_name","Full Name"],["username","Username"],["password","Password"]].map(([k,l])=>(
                <div key={k} className="form-group">
                  <label className="form-label">{l} <span className="req">*</span></label>
                  <input className="form-input" type={k==="password"?"password":"text"} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} placeholder={k==="password"?"••••••••":l}/>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={()=>setAddModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleAdd}>Create Account</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setDeleteModal(null)}>
          <div className="modal">
            <div className="modal-title">Delete Staff Account</div>
            <p style={{fontSize:"0.875rem",color:"var(--text-3)",lineHeight:1.6}}>
              Delete account for <strong style={{color:"var(--text)"}}>{deleteModal.staff_name}</strong>? This cannot be undone.
            </p>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={()=>setDeleteModal(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" style={{background:"var(--red)"}} onClick={handleDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast${toast.type==="success"?" toast-green":" toast-red"}`}>{toast.msg}</div>}
    </div>
  );
};

export default AdminStaff;
