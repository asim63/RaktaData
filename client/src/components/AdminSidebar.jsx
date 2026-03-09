import Logo from "./Logo";
import Icon from "./Icons";

const AdminSidebar = ({ page, setPage, user, onLogout, dark, onToggleTheme }) => {
  const initials = user.name.split(" ").map(n=>n[0]).join("").slice(0,2);
  const nav = [
    {id:"Admin-Dashboard",   label:"Dashboard",         icon:<Icon.Dashboard/>},
    {id:"Admin-Donors",      label:"Donors",            icon:<Icon.Donors/>},
    {id:"Admin-BloodStock",  label:"Blood Stock",       icon:<Icon.Package/>},
    {id:"Admin-Requests",    label:"Requests",          icon:<Icon.ClipBoard/>},
    {id:"Admin-Staff",       label:"Staff",             icon:<Icon.Staff/>},
    {id:"Admin-Transactions",label:"Transactions",      icon:<Icon.Activity/>},
  ];
  return (
    <aside className="sidebar">
      <div className="sidebar-logo"><Logo /></div>
      <div className="sidebar-user">
        <div className="sidebar-avatar" style={{background:"#2563EB"}}>{initials}</div>
        <div className="sidebar-user-info">
          <div className="sidebar-user-name">{user.name}</div>
          <div className="sidebar-user-role">Administrator</div>
        </div>
      </div>
      <div className="sidebar-section">ADMIN</div>
      <div className="sidebar-nav">
        {nav.map(n=>(
          <button key={n.id} className={`sidebar-item${page===n.id?" active":""}`} onClick={()=>setPage(n.id)}>
            {n.icon}{n.label}
          </button>
        ))}
      </div>
      <div className="sidebar-bottom">
        <div className="sidebar-status"><div className="status-dot"/><span>admin · online</span></div>
        <button className="sidebar-item" onClick={onLogout} style={{color:"var(--text-3)"}}>
          <Icon.Logout/>Logout
        </button>
      </div>
    </aside>
  );
};

export default AdminSidebar;
