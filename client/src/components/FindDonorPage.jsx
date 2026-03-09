import { useState } from "react";
import Icon from "../../components/Icons";

const FindDonorPage = () => {
  const [search, setSearch] = useState("");
  const [bgFilter, setBgFilter] = useState("All");
  const [eligFilter, setEligFilter] = useState("All");

  const donors = [
    {name:"Ram Shrestha",  bg:"A+", address:"Kathmandu",phone:"9841XXXXX",eligible:true, lastDonated:"Jan 15, 2025"},
    {name:"Sita Karki",    bg:"O-", address:"Lalitpur",  phone:"9812XXXXX",eligible:true, lastDonated:"Feb 2, 2025"},
    {name:"Bikash Pradhan",bg:"B+", address:"Bhaktapur", phone:"9860XXXXX",eligible:false,lastDonated:"Dec 20, 2024"},
    {name:"Anita Maharjan",bg:"AB+",address:"Kathmandu", phone:"9856XXXXX",eligible:true, lastDonated:"Mar 1, 2025"},
    {name:"Suresh Tamang", bg:"O+", address:"Kathmandu", phone:"9823XXXXX",eligible:true, lastDonated:"Feb 20, 2025"},
    {name:"Priya Thapa",   bg:"A-", address:"Lalitpur",  phone:"9845XXXXX",eligible:false,lastDonated:"Jan 5, 2025"},
  ];
  const colors = ["#DC2626","#7C3AED","#059669","#D97706","#2563EB","#DB2777"];

  const filtered = donors.filter(d=>{
    if (bgFilter!=="All" && d.bg!==bgFilter) return false;
    if (eligFilter==="Eligible" && !d.eligible) return false;
    if (eligFilter==="Ineligible" && d.eligible) return false;
    if (search && !d.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

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
            <Icon.Search />
            <input className="form-input" placeholder="Search by name..." value={search} onChange={e=>setSearch(e.target.value)} style={{paddingLeft:"36px"}}/>
          </div>
          <select className="form-input" style={{width:"160px"}} value={bgFilter} onChange={e=>setBgFilter(e.target.value)}>
            <option value="All">All Blood Groups</option>
            {["A+","A-","B+","B-","AB+","AB-","O+","O-"].map(b=><option key={b}>{b}</option>)}
          </select>
          <select className="form-input" style={{width:"150px"}} value={eligFilter} onChange={e=>setEligFilter(e.target.value)}>
            <option value="All">All Status</option>
            <option>Eligible</option>
            <option>Ineligible</option>
          </select>
        </div>

        <div className="donors-grid">
          {filtered.map((d,i)=>(
            <div key={d.name} className="donor-card">
              <div style={{display:"flex",alignItems:"center",gap:"12px",marginBottom:"14px"}}>
                <div className="donor-avatar" style={{background:colors[i%colors.length]}}>
                  {d.name.split(" ").map(n=>n[0]).join("")}
                </div>
                <div>
                  <div style={{fontWeight:600,fontSize:"0.9rem",color:"var(--text)"}}>{d.name}</div>
                  <div style={{fontSize:"0.78rem",color:"var(--text-3)"}}>{d.address}</div>
                </div>
                <div style={{marginLeft:"auto"}}><div className="blood-chip-sm blood-chip">{d.bg}</div></div>
              </div>
              <div style={{display:"flex",flexDirection:"column",gap:"6px",fontSize:"0.82rem",color:"var(--text-3)"}}>
                <div style={{display:"flex",justifyContent:"space-between"}}><span>Contact</span><span style={{color:"var(--text-2)",fontWeight:500}}>{d.phone}</span></div>
                <div style={{display:"flex",justifyContent:"space-between"}}><span>Last Donated</span><span style={{color:"var(--text-2)",fontWeight:500}}>{d.lastDonated}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                  <span>Status</span>
                  <span className={`badge ${d.eligible?"badge-green":"badge-red"}`}>{d.eligible?"Eligible":"Ineligible"}</span>
                </div>
              </div>
            </div>
          ))}
          {filtered.length===0 && <div style={{color:"var(--text-3)",fontSize:"0.9rem",padding:"32px 0"}}>No donors match your search.</div>}
        </div>
      </div>
    </div>
  );
};

export default FindDonorPage;
