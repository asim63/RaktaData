const TopBar = ({ dark, onToggleTheme }) => (
  <div className="top-bar">
    <span className="top-bar-label">{dark ? "Dark Mode" : "Light Mode"}</span>
    <button className="top-bar-toggle" onClick={onToggleTheme}>
      {dark ? "☀️ Light" : "🌙 Dark"}
    </button>
  </div>
);

export default TopBar;
