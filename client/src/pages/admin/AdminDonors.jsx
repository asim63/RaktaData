import { useState, useEffect } from "react";
import Icon from "../../components/Icons";
import { adminGetDonors, adminUpdateDonor, adminDeleteDonor } from "../../api";

const COLORS = ["#DC2626","#7C3AED","#059669","#D97706","#2563EB","#DB2777"];

const AdminDonors = () => {
  const [donors, setDonors]         = useState([]);
  const [loading, setLoading]       = useState(true);
  const [err, setErr]               = useState("");
  const [deleteModal, setDeleteModal] = useState(null);
  const [editModal, setEditModal]   = useState(null);
  const [editForm, setEditForm]     = useState({});
  const [toast, setToast]           = useState(null);

  const showToast = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const load = () => {
    setLoading(true);
    adminGetDonors()
      .then(res => setDonors(res.data))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDelete = async () => {
    try {
      await adminDeleteDonor(deleteModal.donor_id);
      setDeleteModal(null);
      showToast("Donor deleted.");
      load();
    } catch(e) { showToast(e.message,"error"); }
  };

  const handleEdit = async () => {
    try {
      await adminUpdateDonor(editModal.donor_id, editForm);
      setEditModal(null);
      showToast("Donor updated!");
      load();
    } catch(e) { showToast(e.message,"error"); }
  };

  return (
    <div className="fade-in">
      <div className="panel-header">
        <h1>Donors</h1>
        <div className="panel-breadcrumb">Admin Panel · <span>All Donors</span></div>
      </div>

      <div style={{padding:"24px 28px"}}>
        {loading ? <div style={{color:"var(--text-3)"}}>Loading…</div>
        : err     ? <div style={{color:"var(--red)"}}>{err}</div>
        : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>FULL NAME</th><th>BLOOD GROUP</th><th>CONTACT</th><th>LAST DONATION</th><th>ELIGIBILITY</th><th>ACTIONS</th></tr>
                </thead>
                <tbody>
                  {donors.map((d,i)=>(
                    <tr key={d.donor_id}>
                      <td>
                        <div style={{display:"flex",alignItems:"center",gap:"10px"}}>
                          <div className="donor-avatar" style={{background:COLORS[i%COLORS.length]}}>
                            {d.donor_name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                          </div>
                          <div>
                            <div style={{fontWeight:600,fontSize:"0.875rem"}}>{d.donor_name}</div>
                            <div style={{fontSize:"0.75rem",color:"var(--text-3)"}}>{d.donor_address}</div>
                          </div>
                        </div>
                      </td>
                      <td><div className="blood-chip blood-chip-sm">{d.donor_blood_group}</div></td>
                      <td style={{fontSize:"0.85rem"}}>{d.donor_phone_no}</td>
                      <td style={{fontSize:"0.85rem"}}>{d.last_donation_date ? new Date(d.last_donation_date).toLocaleDateString() : "—"}</td>
                      <td><span className={`badge ${d.eligibility_status?"badge-green":"badge-red"}`}>{d.eligibility_status?"Eligible":"Ineligible"}</span></td>
                      <td>
                        <div style={{display:"flex",gap:"6px"}}>
                          <button className="btn btn-edit" style={{display:"flex",alignItems:"center",gap:"4px"}}
                            onClick={()=>{ setEditModal(d); setEditForm({donor_name:d.donor_name,donor_phone_no:d.donor_phone_no,donor_address:d.donor_address,donor_blood_group:d.donor_blood_group}); }}>
                            <Icon.Edit/>Edit
                          </button>
                          <button className="btn btn-danger" style={{display:"flex",alignItems:"center",gap:"4px"}} onClick={()=>setDeleteModal(d)}>
                            <Icon.Trash/>Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {editModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setEditModal(null)}>
          <div className="modal">
            <div className="modal-title">Edit Donor</div>
            <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
              {[["donor_name","Full Name"],["donor_phone_no","Phone"],["donor_address","Address"]].map(([k,l])=>(
                <div key={k} className="form-group">
                  <label className="form-label">{l}</label>
                  <input className="form-input" value={editForm[k]||""} onChange={e=>setEditForm({...editForm,[k]:e.target.value})}/>
                </div>
              ))}
              <div className="form-group">
                <label className="form-label">Blood Group</label>
                <select className="form-input" value={editForm.donor_blood_group||""} onChange={e=>setEditForm({...editForm,donor_blood_group:e.target.value})}>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={()=>setEditModal(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleEdit}>Save</button>
            </div>
          </div>
        </div>
      )}

      {deleteModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setDeleteModal(null)}>
          <div className="modal">
            <div className="modal-title">Delete Donor</div>
            <p style={{fontSize:"0.875rem",color:"var(--text-3)",lineHeight:1.6}}>
              Delete <strong style={{color:"var(--text)"}}>{deleteModal.donor_name}</strong>? This cannot be undone.
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

export default AdminDonors;
