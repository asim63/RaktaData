import Logo from "./Logo";
import Icon from "./Icons";

const StaffSidebar = ({ page, setPage, user, onLogout, dark, onToggleTheme }) => {
  const initials = user.name.split(" ").map(n=>n[0]).join("").slice(0,2);
  const nav = [
    {id:"Staff-Dashboard", label:"Dashboard",         icon:<Icon.Dashboard/>},
    {id:"Staff-Donors",    label:"Donor Details",     icon:<Icon.Donors/>},
    {id:"Staff-Register",  label:"Donor Registration",icon:<Icon.UserPlus/>},
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo"><Logo /></div>
      <div className="sidebar-user">
        <div className="sidebar-avatar">{initials}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user.name}</div>
          <div className="sidebar-user-role">Staff Member</div>
        </div>
      </div>
      <div className="sidebar-section">STAFF</div>
      <div className="sidebar-nav">
        {nav.map(n=>(
          <button key={n.id} className={`sidebar-item${page===n.id?" active":""}`} onClick={()=>setPage(n.id)}>
            {n.icon}{n.label}
          </button>
        ))}
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-status"><div className="status-dot"/><span>staff · online</span></div>
        <button className="sidebar-item" onClick={onLogout} style={{color:"var(--text-3)"}}>
          <Icon.Logout/>Logout
        </button>
      </div>
    </aside>
  );
};

export default StaffSidebar;
