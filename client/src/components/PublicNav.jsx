import Logo from "./Logo";
import Icon from "./Icons";

const PublicNav = ({ page, setPage, onLogin, dark, onToggleTheme }) => {
  const publicLinks = ["Home", "About", "Contact"];
  const linkMap = {};

  return (
    <nav className="pub-nav">
      <button className="pub-nav-logo" onClick={() => setPage("Home")} style={{background:"none",border:"none",cursor:"pointer"}}>
        <Logo />
      </button>
      <div className="pub-nav-links">
        {publicLinks.map(l => (
          <button key={l} className={`pub-nav-link${page===(linkMap[l]||l)?" active":""}`} onClick={() => setPage(linkMap[l]||l)}>{l}</button>
        ))}
        <button className="pub-nav-emergency" onClick={onLogin} title="Login required to submit emergency request">
          <Icon.Lightning /> Emergency
        </button>
      </div>
      <div className="pub-nav-right">
        <button className="top-bar-toggle" onClick={onToggleTheme}>
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
        <button className="btn btn-secondary" style={{marginRight:"4px",fontSize:"0.85rem",padding:"8px 16px"}} onClick={() => setPage("Register")}>Register</button>
        <button className="btn-login" onClick={onLogin}>Log In</button>
      </div>
    </nav>
  );
};

export default PublicNav;
