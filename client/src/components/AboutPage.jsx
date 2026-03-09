const AboutPage = ({ setPage }) => (
  <div className="fade-in">
    <section className="about-hero">
      <div className="section-tag" style={{display:"inline-block",marginBottom:"16px"}}>ABOUT US</div>
      <h1 style={{fontFamily:"var(--font-head)",fontSize:"2.8rem",fontWeight:800,maxWidth:"560px",margin:"0 auto 16px",lineHeight:1.15}}>
        We're on a mission to <span style={{color:"var(--red)"}}>connect donors with lives</span>
      </h1>
      <p style={{color:"var(--text-3)",maxWidth:"460px",margin:"0 auto",lineHeight:1.6}}>
        RaktaData was founded to bridge the gap between blood donors and those who urgently need it — across Nepal.
      </p>
    </section>

    <section className="about-content">
      <div>
        <div className="section-tag">OUR MISSION</div>
        <h2 style={{fontFamily:"var(--font-head)",fontSize:"1.8rem",fontWeight:800,lineHeight:1.2,margin:"10px 0 18px"}}>Why we built RaktaData</h2>
        <p style={{color:"var(--text-3)",lineHeight:1.7,marginBottom:"14px",fontSize:"0.925rem"}}>
          Every 2 seconds, someone in the world needs blood. Yet millions die each year because blood isn't available when it's needed most. We built RaktaData to solve this with technology.
        </p>
        <p style={{color:"var(--text-3)",lineHeight:1.7,fontSize:"0.925rem"}}>
          By creating a digital platform that connects willing donors with patients in real-time, we're reducing the time it takes to find blood from hours to minutes.
        </p>
        <div style={{display:"flex",gap:"12px",marginTop:"28px"}}>
          <button className="btn btn-primary" onClick={() => setPage("Contact")}>Join as Donor</button>
          <button className="btn btn-secondary" onClick={() => setPage("Contact")}>Contact Us</button>
        </div>
      </div>

      <div>
        <div className="section-tag">OUR VALUES</div>
        <h2 style={{fontFamily:"var(--font-head)",fontSize:"1.8rem",fontWeight:800,lineHeight:1.2,margin:"10px 0 18px"}}>What we stand for</h2>
        <div className="values-grid">
          {[
            {icon:"❤️",title:"Compassion",    desc:"Every life matters. We treat every request with urgency and care."},
            {icon:"⚡",title:"Speed",          desc:"We reduce the time to find blood from hours to minutes through technology."},
            {icon:"🔒",title:"Trust & Safety", desc:"Your data is secure. Donor and recipient information is kept private."},
            {icon:"📊",title:"Transparency",   desc:"Real-time stock levels and honest communication with all stakeholders."},
          ].map(v=>(
            <div key={v.title} className="value-card">
              <div className="value-card-icon">{v.icon}</div>
              <div className="value-card-title">{v.title}</div>
              <p className="value-card-desc">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  </div>
);

export default AboutPage;
