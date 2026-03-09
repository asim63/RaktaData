import { useState } from "react";
import Icon from "../../components/Icons";

const ContactPage = () => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

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
          <div className="form-grid-2" style={{margin:0,marginBottom:"18px"}}>
            <div className="form-group">
              <label className="form-label">Your Email Address</label>
              <input className="form-input" placeholder="my@email.com" value={email} onChange={e=>setEmail(e.target.value)} type="email"/>
            </div>
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input className="form-input" placeholder="98XXXXXXXX" value={phone} onChange={e=>setPhone(e.target.value)}/>
            </div>
          </div>
          <button
            className="btn btn-primary"
            style={{width:"100%",justifyContent:"center",padding:"12px"}}
            onClick={()=>{ if(email){ window.location.href=`mailto:support@raktadata.np?subject=Inquiry from ${email}` } }}
          >
            <Icon.Mail /> Send us mail
          </button>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
