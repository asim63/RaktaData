import { useState } from "react";
import Icon from "../../components/Icons";
import { staffRegisterDonor } from "../../api";

const StaffRegister = () => {
  const empty = {donor_name:"",date_of_birth:"",donor_gender:"",donor_phone_no:"",donor_address:"",donor_blood_group:"",donor_weight:"",donor_blood_pressure:"",hemoglobin:"",last_donation_date:"",has_diabetes:null,alcohol_consumption:null,has_chronic_illness:null,recent_medication:null,quantity:"",component_type:"Whole Blood"};
  const [form, setForm]   = useState(empty);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const up = (k,v) => setForm(f=>({...f,[k]:v}));
  const showToast = (msg,type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3500); };

  const handleSave = async () => {
    if (!form.donor_name||!form.date_of_birth||!form.donor_gender||!form.donor_weight) {
      showToast("Name, DOB, gender and weight are required.","error"); return;
    }
    if (parseFloat(form.donor_weight)<50) { showToast("Donor must weigh at least 50 kg.","error"); return; }
    if (!form.quantity||!form.component_type) { showToast("Quantity and component type are required.","error"); return; }
    setLoading(true);
    try {
      await staffRegisterDonor(form);
      showToast("Donor registered and donation logged!");
      setForm(empty);
    } catch(e) { showToast(e.message,"error"); }
    finally { setLoading(false); }
  };

  const RadioQ = ({field,label}) => (
    <div className="form-group">
      <label className="form-label">{label} <span className="req">*</span></label>
      <div className="radio-group" style={{marginTop:"4px"}}>
        <label className="radio-label"><input type="radio" name={field} checked={form[field]===false} onChange={()=>up(field,false)}/>No</label>
        <label className="radio-label"><input type="radio" name={field} checked={form[field]===true}  onChange={()=>up(field,true)} />Yes</label>
      </div>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="panel-header">
        <h1>Donor Registration</h1>
        <div className="panel-breadcrumb">Staff Panel · <span>Register New Donor</span></div>
      </div>

      <div className="reg-form">
        <h3 style={{fontFamily:"var(--font-head)",fontWeight:700,fontSize:"1rem",marginBottom:"4px"}}>Donor Registration Form</h3>
        <p style={{fontSize:"0.8rem",color:"var(--text-3)",marginBottom:"28px"}}>Register a new blood donor + log their first donation</p>

        <div className="reg-section">BASIC INFORMATION</div>
        <div className="form-grid-2">
          <div className="form-group"><label className="form-label">Full Name <span className="req">*</span></label><input className="form-input" value={form.donor_name} onChange={e=>up("donor_name",e.target.value)} placeholder="e.g. Ram Shrestha"/></div>
          <div className="form-group"><label className="form-label">Date of Birth <span className="req">*</span></label><input className="form-input" type="date" value={form.date_of_birth} onChange={e=>up("date_of_birth",e.target.value)}/></div>
        </div>
        <div className="form-grid-2">
          <div className="form-group">
            <label className="form-label">Gender <span className="req">*</span></label>
            <div className="radio-group" style={{marginTop:"8px"}}>
              {["Male", "Female", "Other"].map(g => (
                 <label key={g} className="radio-label">
                   <input 
                      type="radio" 
                      name="gender" 
                      checked={form.donor_gender === g.toUpperCase()}  // ← compare uppercase
                      onChange={() => up("donor_gender", g.toUpperCase())}  // ← store uppercase
                     />
                    {g}  {/* display still shows "Male" nicely */}
                 </label>
              ))}
            </div>
          </div>
          <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" value={form.donor_phone_no} onChange={e=>up("donor_phone_no",e.target.value)} placeholder="98XXXXXXXX"/></div>
        </div>
        <div className="form-grid-2">
          <div className="form-group"><label className="form-label">Address</label><input className="form-input" value={form.donor_address} onChange={e=>up("donor_address",e.target.value)} placeholder="Street / Ward / Municipality"/></div>
          <div className="form-group">
            <label className="form-label">Blood Group</label>
            <select className="form-input" value={form.donor_blood_group} onChange={e=>up("donor_blood_group",e.target.value)}>
              <option value="">Select</option>
              {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b}>{b}</option>)}
            </select>
          </div>
        </div>

        <div className="reg-section" style={{marginTop:"8px"}}>PHYSICAL ELIGIBILITY</div>
        <div className="form-grid-2">
          <div className="form-group"><label className="form-label">Weight (KG) <span className="req">*</span></label><input className="form-input" type="number" value={form.donor_weight} onChange={e=>up("donor_weight",e.target.value)} placeholder="Min. 50 kg" min="50"/></div>
          <div className="form-group"><label className="form-label">Blood Pressure</label><input className="form-input" value={form.donor_blood_pressure} onChange={e=>up("donor_blood_pressure",e.target.value)} placeholder="e.g. 120/80"/></div>
        </div>
        <div className="form-grid-2">
          <div className="form-group"><label className="form-label">Hemoglobin (g/dL)</label><input className="form-input" type="number" step="0.1" value={form.hemoglobin} onChange={e=>up("hemoglobin",e.target.value)} placeholder="e.g. 13.5"/></div>
          <div className="form-group"><label className="form-label">Last Donation Date</label><input className="form-input" type="date" value={form.last_donation_date} onChange={e=>up("last_donation_date",e.target.value)}/></div>
        </div>

        <div className="reg-section" style={{marginTop:"8px"}}>HEALTH SCREENING</div>
        <div className="form-grid-2">
          <RadioQ field="has_diabetes"        label="Diabetes?"/>
          <RadioQ field="alcohol_consumption" label="Alcohol Consumption?"/>
        </div>
        <div className="form-grid-2">
          <RadioQ field="has_chronic_illness" label="Chronic Illness?"/>
          <RadioQ field="recent_medication"   label="Recent Medication?"/>
        </div>

        <div className="reg-section" style={{marginTop:"8px"}}>DONATION DETAILS</div>
        <div className="form-grid-2">
          <div className="form-group"><label className="form-label">Units Donated <span className="req">*</span></label><input className="form-input" type="number" value={form.quantity} onChange={e=>up("quantity",e.target.value)} placeholder="e.g. 1" min="1"/></div>
          <div className="form-group">
            <label className="form-label">Component Type <span className="req">*</span></label>
            <select className="form-input" value={form.component_type} onChange={e=>up("component_type",e.target.value)}>
              {["Whole Blood","PRBC","Platelets","FFP"].map(c=><option key={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div className="reg-form-footer">
          <button className="btn btn-secondary" onClick={()=>setForm(empty)}>Reset Form</button>
          <button className="btn btn-primary" onClick={handleSave} disabled={loading} style={{opacity:loading?0.7:1}}>
            {loading ? "Saving…" : "💾 Save Donor"}
          </button>
        </div>
      </div>

      {toast && <div className={`toast${toast.type==="success"?" toast-green":" toast-red"}`}>{toast.type==="success"?<Icon.Check/>:<Icon.X/>}{toast.msg}</div>}
    </div>
  );
};

export default StaffRegister;
