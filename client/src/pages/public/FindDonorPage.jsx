import { useState, useEffect } from "react";
import Icon from "../../components/Icons";
import { customerGetDonors } from "../../api";

const COLORS = ["#DC2626","#7C3AED","#059669","#D97706","#2563EB","#DB2777"];

const FindDonorPage = () => {
  const [donors, setDonors]     = useState([]);
  const [loading, setLoading]   = useState(true);
  const [err, setErr]           = useState("");
  const [search, setSearch]     = useState("");
  const [bgFilter, setBgFilter] = useState("");
  const [eligFilter, setEligFilter] = useState("");

  const load = () => {
    setLoading(true);
    const params = {};
    if (search)     params.name = search;
    if (bgFilter)   params.blood_group = bgFilter;
    if (eligFilter) params.eligibility_status = eligFilter;
    customerGetDonors(params)
      .then(res => setDonors(res.data))
      .catch(e => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, bgFilter, eligFilter]);

  return (
    <div className="fade-in">
      <section style={{padding:"56px 80px 40px",background:"linear-gradient(160deg,#FFF5F5 0%,white 60%)"}}>
        <div className="section-tag">FIND DONOR</div>
        <h1 style={{fontFamily:"var(--font-head)",fontSize:"2.5rem",fontWeight:800,marginTop:"10px",lineHeight:1.15}}>
          Find a <span style={{color:"var(--red)"}}>blood donor</span>
        </h1>
        <p style={{color:"var(--text-3)",marginTop:"12px",maxWidth:"440px",lineHeight:1.6}}>
          Search eligible donors by blood group, eligibility, or name.
        </p>
      </section>

      <div style={{padding:"24px 80px 64px"}}>
        <div style={{display:"flex",gap:"12px",marginBottom:"24px",flexWrap:"wrap",alignItems:"center"}}>
          <div className="search-bar" style={{flex:1,minWidth:"220px"}}>
            <Icon.Search/>
            <input className="form-input" placeholder="Search by name…" value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:"36px"}}/>
          </div>
          <select className="form-input" style={{width:"160px"}} value={bgFilter} onChange={e=>setBgFilter(e.target.value)}>
            <option value="">All Blood Groups</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b}>{b}</option>)}
          </select>
          <select className="form-input" style={{width:"150px"}} value={eligFilter} onChange={e=>setEligFilter(e.target.value)}>
            <option value="">All Status</option>
            <option value="true">Eligible</option>
            <option value="false">Ineligible</option>
          </select>
        </div>

        {loading ? <div style={{color:"var(--text-3)"}}>Loading donors…</div>
        : err     ? <div style={{color:"var(--red)"}}>{err}</div>
        : (
          <div className="donors-grid">
            {donors.map((d,i)=>(
              <div key={d.donor_id} className="donor-card">
                <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"14px"}}>
                  <div className="donor-avatar" style={{background:COLORS[i%COLORS.length]}}>
                    {d.donor_name.split(" ").map(n=>n[0]).join("").slice(0,2)}
                  </div>
                  <div>
                    <div style={{fontWeight:600,fontSize:"0.9rem",color:"var(--text)"}}>{d.donor_name}</div>
                    <div style={{fontSize:"0.78rem",color:"var(--text-3)"}}>{d.donor_address}</div>
                  </div>
                  <div style={{marginLeft:"auto"}}><div className="blood-chip blood-chip-sm">{d.donor_blood_group}</div></div>
                </div>
                <div style={{display:"flex",flexDirection:"column",gap:"6px",fontSize:"0.82rem",color:"var(--text-3)"}}>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span>Contact</span><span style={{color:"var(--text-2)",fontWeight:500}}>{d.donor_phone_no || "—"}</span></div>
                  <div style={{display:"flex",justifyContent:"space-between"}}><span>Last Donated</span><span style={{color:"var(--text-2)",fontWeight:500}}>{d.last_donation_date ? new Date(d.last_donation_date).toLocaleDateString() : "Never"}</span></div>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                    <span>Status</span>
                    <span className={`badge ${d.eligibility_status?"badge-green":"badge-red"}`}>{d.eligibility_status?"Eligible":"Ineligible"}</span>
                  </div>
                </div>
              </div>
            ))}
            {donors.length===0 && <div style={{color:"var(--text-3)",fontSize:"0.9rem",padding:"32px 0"}}>No donors match your search.</div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default FindDonorPage;
