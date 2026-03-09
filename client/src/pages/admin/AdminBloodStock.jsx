import { useState, useEffect } from "react";
import Icon from "../../components/Icons";
import { adminGetBloodStock, adminAddBloodStock, adminAdjustBloodStock } from "../../api";

const AdminBloodStock = () => {
  const [batches, setBatches]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState("");
  const [addModal, setAddModal] = useState(false);
  const [adjustModal, setAdjustModal] = useState(null);
  const [addForm, setAddForm]   = useState({blood_group:"",component_type:"Whole Blood",units:""});
  const [newUnits, setNewUnits] = useState("");
  const [toast, setToast]       = useState(null);

  const showToast = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const load = () => {
    setLoading(true);
    adminGetBloodStock()
      .then(res => setBatches(res.data))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    try {
      await adminAddBloodStock(addForm);
      setAddModal(false);
      setAddForm({blood_group:"",component_type:"Whole Blood",units:""});
      showToast("Blood stock added!");
      load();
    } catch(e) { showToast(e.message,"error"); }
  };

  const handleAdjust = async () => {
    try {
      await adminAdjustBloodStock(adjustModal.stock_id, newUnits);
      setAdjustModal(null); setNewUnits("");
      showToast("Stock adjusted!");
      load();
    } catch(e) { showToast(e.message,"error"); }
  };

  const statusBadge = s => s==="Critical"||s==="Out of Stock"?"badge-red":s==="Low"?"badge-amber":"badge-green";

  return (
    <div className="fade-in">
      <div className="panel-header" style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <h1>Blood Stock</h1>
          <div className="panel-breadcrumb">Admin Panel · <span>Inventory Management</span></div>
        </div>
        <button className="btn btn-primary btn-sm" onClick={()=>setAddModal(true)}><Icon.Plus/>Add Stock</button>
      </div>

      <div style={{padding:"24px 28px"}}>
        {loading ? <div style={{color:"var(--text-3)"}}>Loading…</div>
        : err     ? <div style={{color:"var(--red)"}}>{err}</div>
        : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>BLOOD GROUP</th><th>COMPONENT</th><th>UNITS</th><th>EXPIRY DATE</th><th>STATUS</th><th>ACTIONS</th></tr>
                </thead>
                <tbody>
                  {batches.map(b=>(
                    <tr key={b.stock_id}>
                      <td><div className="blood-chip blood-chip-sm">{b.blood_group}</div></td>
                      <td>{b.component_type}</td>
                      <td style={{fontWeight:600}}>{b.available_units ?? b.units}</td>
                      <td style={{fontSize:"0.82rem",color:"var(--text-3)"}}>{b.expiry_date ? new Date(b.expiry_date).toLocaleDateString() : "—"}</td>
                      <td><span className={`badge ${statusBadge(b.availability_status)}`}>{b.availability_status}</span></td>
                      <td>
                        <button className="btn btn-edit" style={{display:"flex",alignItems:"center",gap:"4px"}}
                          onClick={()=>{ setAdjustModal(b); setNewUnits(String(b.available_units??b.units)); }}>
                          <Icon.Edit/>Adjust
                        </button>
                      </td>
                    </tr>
                  ))}
                  {batches.length===0 && <tr><td colSpan={6} style={{textAlign:"center",padding:"32px",color:"var(--text-3)"}}>No stock found.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {addModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setAddModal(false)}>
          <div className="modal">
            <div className="modal-title">Add Blood Stock</div>
            <div style={{display:"flex",flexDirection:"column",gap:"14px"}}>
              <div className="form-group">
                <label className="form-label">Blood Group <span className="req">*</span></label>
                <select className="form-input" value={addForm.blood_group} onChange={e=>setAddForm({...addForm,blood_group:e.target.value})}>
                  <option value="">Select</option>
                  {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Component Type</label>
                <select className="form-input" value={addForm.component_type} onChange={e=>setAddForm({...addForm,component_type:e.target.value})}>
                  {["Whole Blood","PRBC","Platelets","FFP"].map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Units <span className="req">*</span></label>
                <input className="form-input" type="number" min="1" value={addForm.units} onChange={e=>setAddForm({...addForm,units:e.target.value})} placeholder="e.g. 10"/>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={()=>setAddModal(false)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleAdd}>Add Stock</button>
            </div>
          </div>
        </div>
      )}

      {adjustModal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&setAdjustModal(null)}>
          <div className="modal">
            <div className="modal-title">Adjust Stock — {adjustModal.blood_group} {adjustModal.component_type}</div>
            <div className="form-group">
              <label className="form-label">New Units Value</label>
              <input className="form-input" type="number" min="0" value={newUnits} onChange={e=>setNewUnits(e.target.value)}/>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary btn-sm" onClick={()=>setAdjustModal(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" onClick={handleAdjust}>Save</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div className={`toast${toast.type==="success"?" toast-green":" toast-red"}`}>{toast.msg}</div>}
    </div>
  );
};

export default AdminBloodStock;
