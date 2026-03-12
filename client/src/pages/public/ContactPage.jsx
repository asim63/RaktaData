import Icon from "../../components/Icons";

const ContactPage = () => {
  return (
    <div className="fade-in">
      <section className="contact-hero">
        <div className="section-tag">CONTACT US</div>
        <h1 style={{fontFamily:"var(--font-head)",fontSize:"2.5rem",fontWeight:800,marginTop:"10px",lineHeight:1.15}}>
          Get in touch<br/><span style={{color:"var(--red)"}}>we're here to help</span>
        </h1>
        <p style={{color:"var(--text-3)",marginTop:"12px",maxWidth:"440px",lineHeight:1.6}}>
          Have a question, need support, or want to partner with us? Reach out and we'll respond quickly.
        </p>
      </section>

      <div className="contact-body" style={{marginTop:"40px"}}>
        <div className="contact-card">
          <h3 style={{fontFamily:"var(--font-head)",fontWeight:700,fontSize:"1rem",marginBottom:"4px"}}>Send us a message</h3>
          <p style={{fontSize:"0.8rem",color:"var(--text-3)",marginBottom:"24px"}}>We'll get back to you within 24 hours</p>

          {/* Contact info rows */}
          <div style={{display:"flex",flexDirection:"column",gap:"14px",marginBottom:"24px"}}>
            <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",background:"var(--surface)",borderRadius:"10px",border:"1px solid var(--border)"}}>
              <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"rgba(220,38,38,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon.Mail />
              </div>
              <div>
                <div style={{fontSize:"0.72rem",color:"var(--text-3)",marginBottom:"2px",textTransform:"uppercase",letterSpacing:"0.05em"}}>Email</div>
                <div style={{fontWeight:600,fontSize:"0.9rem"}}>raktadata@gmail.com</div>
              </div>
            </div>

            <div style={{display:"flex",alignItems:"center",gap:"12px",padding:"14px 16px",background:"var(--surface)",borderRadius:"10px",border:"1px solid var(--border)"}}>
              <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"rgba(220,38,38,0.1)",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
                <Icon.Phone />
              </div>
              <div>
                <div style={{fontSize:"0.72rem",color:"var(--text-3)",marginBottom:"2px",textTransform:"uppercase",letterSpacing:"0.05em"}}>Phone</div>
                <div style={{fontWeight:600,fontSize:"0.9rem"}}>+977 9812345678</div>
              </div>
            </div>
          </div>

          <button
            className="btn btn-primary"
            style={{width:"100%",justifyContent:"center",padding:"12px"}}
            onClick={() => { window.location.href = "mailto:raktadata@gmail.com?subject=Inquiry - RaktaData"; }}
          >
            <Icon.Mail /> Send us mail
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;