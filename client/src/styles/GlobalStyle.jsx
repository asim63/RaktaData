const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Sora:wght@300;400;500;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,400&display=swap');
    
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    
    :root {
      --red: #DC2626;
      --red-dark: #B91C1C;
      --red-light: #FEE2E2;
      --red-mid: #FECACA;
      --bg: #FAFAFA;
      --surface: #FFFFFF;
      --border: #F3F4F6;
      --border-md: #E5E7EB;
      --text: #111827;
      --text-2: #374151;
      --text-3: #6B7280;
      --text-4: #9CA3AF;
      --sidebar-bg: #FFFFFF;
      --sidebar-w: 190px;
      --green: #059669;
      --green-light: #D1FAE5;
      --amber: #D97706;
      --amber-light: #FEF3C7;
      --font-head: 'Sora', sans-serif;
      --font-body: 'DM Sans', sans-serif;
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04);
      --shadow: 0 4px 16px rgba(0,0,0,0.07);
      --shadow-lg: 0 10px 40px rgba(0,0,0,0.10);
      --radius: 12px;
      --radius-sm: 8px;
      --radius-lg: 16px;
    }

    html, body, #root { height: 100%; font-family: var(--font-body); background: var(--bg); color: var(--text); }
    button { font-family: var(--font-body); cursor: pointer; border: none; outline: none; }
    input, select, textarea { font-family: var(--font-body); outline: none; }

    ::-webkit-scrollbar { width: 6px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: var(--border-md); border-radius: 99px; }

    @keyframes fadeIn { from { opacity:0; transform: translateY(8px); } to { opacity:1; transform: translateY(0); } }
    @keyframes slideIn { from { opacity:0; transform: translateX(-12px); } to { opacity:1; transform: translateX(0); } }
    .fade-in { animation: fadeIn 0.35s ease forwards; }
    .slide-in { animation: slideIn 0.3s ease forwards; }

    /* Public Nav */
    .pub-nav {
      position: sticky; top: 0; z-index: 100;
      background: rgba(255,255,255,0.92); backdrop-filter: blur(12px);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: space-between;
      padding: 0 40px; height: 60px;
    }
    .pub-nav-logo { display:flex; align-items:center; gap:8px; font-family:var(--font-head); font-weight:700; font-size:1.15rem; color:var(--text); }
    .pub-nav-links { display:flex; align-items:center; gap:4px; }
    .pub-nav-link { padding: 6px 14px; border-radius: 8px; font-size:0.875rem; font-weight:500; color: var(--text-3); background: none; transition: all 0.15s; }
    .pub-nav-link:hover { color: var(--text); background: var(--border); }
    .pub-nav-link.active { color: var(--red); font-weight:600; }
    .pub-nav-emergency { display:flex; align-items:center; gap:5px; background: var(--red); color: white; padding: 7px 16px; border-radius: 8px; font-size:0.875rem; font-weight:600; transition: background 0.15s; }
    .pub-nav-emergency:hover { background: var(--red-dark); }
    .pub-nav-right { display:flex; align-items:center; gap:8px; }
    .btn-login { padding: 7px 18px; border-radius: 8px; font-size:0.875rem; font-weight:600; border: 1.5px solid var(--border-md); color: var(--text-2); background: var(--surface); transition: all 0.15s; }
    .btn-login:hover { border-color: var(--red); color: var(--red); }

    /* Buttons */
    .btn { display:inline-flex; align-items:center; gap:6px; font-weight:600; border-radius:var(--radius-sm); transition: all 0.15s; font-size:0.875rem; }
    .btn-primary { background: var(--red); color: white; padding: 10px 22px; }
    .btn-primary:hover { background: var(--red-dark); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(220,38,38,0.3); }
    .btn-secondary { background: var(--surface); color: var(--text-2); padding: 10px 22px; border: 1.5px solid var(--border-md); }
    .btn-secondary:hover { border-color: var(--red); color: var(--red); }
    .btn-sm { padding: 6px 14px; font-size:0.8rem; }
    .btn-ghost { background: transparent; color: var(--text-3); padding: 6px 12px; }
    .btn-ghost:hover { background: var(--border); color: var(--text); }
    .btn-danger { background: #FEE2E2; color: var(--red); padding: 6px 12px; font-size:0.8rem; }
    .btn-danger:hover { background: var(--red); color: white; }
    .btn-edit { background: #EFF6FF; color: #2563EB; padding: 6px 12px; font-size:0.8rem; }
    .btn-edit:hover { background: #2563EB; color: white; }
    .btn-approve { background: #D1FAE5; color: var(--green); padding: 6px 12px; font-size:0.8rem; }
    .btn-approve:hover { background: var(--green); color: white; }

    /* Cards */
    .card { background: var(--surface); border-radius: var(--radius); border: 1px solid var(--border); box-shadow: var(--shadow-sm); }

    /* Form elements */
    .form-group { display:flex; flex-direction:column; gap:6px; }
    .form-label { font-size:0.75rem; font-weight:600; color:var(--text-3); letter-spacing:0.06em; text-transform:uppercase; }
    .form-label .req { color: var(--red); margin-left:2px; }
    .reg-page-bg .form-label { color: #94A3B8; }
    .reg-page-bg .form-input {
      background: #0D0F18;
      border-color: #2A2D3A;
      color: #F1F5F9;
      color-scheme: dark;
      -webkit-text-fill-color: #F1F5F9;
    }
    .reg-page-bg .form-input::placeholder { color: #475569; }
    .reg-page-bg .form-input:focus { border-color: var(--red); box-shadow: 0 0 0 3px rgba(220,38,38,0.12); }
    .form-input {
      width: 100%; padding: 10px 14px;
      border-radius: var(--radius-sm);
      border: 1.5px solid var(--border-md);
      font-size: 0.875rem;
      color: var(--text);
      background: var(--surface);
      transition: border-color 0.15s;
      color-scheme: light;
      -webkit-text-fill-color: var(--text);
    }
    .form-input:focus { border-color: var(--red); box-shadow: 0 0 0 3px rgba(220,38,38,0.08); }
    .form-input:-webkit-autofill,
    .form-input:-webkit-autofill:hover,
    .form-input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 1000px var(--surface) inset;
      -webkit-text-fill-color: var(--text);
      caret-color: var(--text);
    }
    .form-input::placeholder { color: var(--text-4); }
    select.form-input { cursor:pointer; }

    /* Badges */
    .badge { display:inline-flex; align-items:center; gap:4px; padding: 3px 10px; border-radius:99px; font-size:0.75rem; font-weight:600; }
    .badge::before { content:'•'; font-size:0.9em; }
    .badge-green { background: var(--green-light); color: var(--green); }
    .badge-red { background: var(--red-light); color: var(--red); }
    .badge-amber { background: var(--amber-light); color: var(--amber); }
    .badge-blue { background: #EFF6FF; color: #2563EB; }
    .badge-gray { background: var(--border); color: var(--text-3); }
    .badge-pulse { animation: emergencyPulse 1.5s ease-in-out infinite; }
    @keyframes emergencyPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(220,38,38,0.4); }
      50% { box-shadow: 0 0 0 5px rgba(220,38,38,0); }
    }

    /* Blood type chip */
    .blood-chip { display:inline-flex; align-items:center; justify-content:center; width:38px; height:38px; border-radius:8px; font-size:0.78rem; font-weight:700; background: var(--red-light); color: var(--red); border: 1.5px solid var(--red-mid); flex-shrink:0; }
    .blood-chip-sm { width:30px; height:30px; font-size:0.7rem; border-radius:6px; }

    /* Stat card */
    .stat-card { padding: 24px; display:flex; flex-direction:column; gap:6px; }
    .stat-label { font-size:0.75rem; font-weight:500; color:var(--text-3); text-transform:uppercase; letter-spacing:0.05em; }
    .stat-value { font-family:var(--font-head); font-size:2rem; font-weight:700; color:var(--text); }

    /* Panel header */
    .panel-header { padding: 20px 28px; border-bottom: 1px solid var(--border); }
    .panel-header h1 { font-family:var(--font-head); font-size:1.25rem; font-weight:700; color:var(--text); }
    .panel-breadcrumb { font-size:0.8rem; color:var(--text-3); margin-top:2px; }
    .panel-breadcrumb span { color: var(--red); font-weight:500; }

    /* Sidebar layout */
    .app-layout { display:flex; min-height:100vh; }
    .sidebar { width: var(--sidebar-w); min-height:100vh; background: var(--sidebar-bg); border-right: 1px solid var(--border); display:flex; flex-direction:column; position: fixed; top:0; left:0; z-index:50; }
    .sidebar-logo { padding: 18px 20px; display:flex; align-items:center; gap:8px; font-family:var(--font-head); font-weight:700; font-size:1rem; border-bottom: 1px solid var(--border); }
    .sidebar-logo span { color: var(--red); }
    .sidebar-user { padding:14px 16px; display:flex; align-items:center; gap:10px; border-bottom: 1px solid var(--border); }
    .sidebar-avatar { width:34px; height:34px; border-radius:50%; background:var(--red); color:white; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.85rem; font-family:var(--font-head); flex-shrink:0; }
    .sidebar-user-info { flex:1; min-width:0; }
    .sidebar-user-name { font-size:0.85rem; font-weight:600; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
    .sidebar-user-role { font-size:0.72rem; color:var(--text-3); }
    .sidebar-section { padding: 12px 10px 4px; font-size:0.65rem; font-weight:700; color:var(--text-4); letter-spacing:0.1em; text-transform:uppercase; }
    .sidebar-nav { flex:1; padding: 8px 10px; display:flex; flex-direction:column; gap:2px; }
    .sidebar-item { display:flex; align-items:center; gap:9px; padding: 8px 10px; border-radius: var(--radius-sm); font-size:0.85rem; font-weight:500; color:var(--text-3); cursor:pointer; transition: all 0.15s; background:none; border:none; width:100%; text-align:left; }
    .sidebar-item:hover { background:var(--border); color:var(--text); }
    .sidebar-item.active { background:var(--red-light); color:var(--red); font-weight:600; }
    .sidebar-bottom { padding: 12px 10px; border-top: 1px solid var(--border); }
    .sidebar-status { display:flex; align-items:center; gap:6px; padding: 6px 10px; font-size:0.75rem; color:var(--text-3); margin-bottom:6px; }
    .status-dot { width:7px; height:7px; border-radius:50%; background:var(--green); flex-shrink:0; }
    .main-content { margin-left: var(--sidebar-w); flex:1; min-height:100vh; background: var(--bg); }

    /* Top bar (logged-in pages) */
    .top-bar {
      position: sticky; top: 0; z-index: 40;
      height: 52px;
      background: var(--surface);
      border-bottom: 1px solid var(--border);
      display: flex; align-items: center; justify-content: flex-end;
      padding: 0 28px; gap: 10px;
      box-shadow: var(--shadow-sm);
    }
    .top-bar-label {
      font-size: 0.78rem; color: var(--text-3); margin-right: 2px;
    }
    .top-bar-toggle {
      display: flex; align-items: center; gap: 7px;
      padding: 6px 16px; border-radius: 20px;
      background: #1E2130; border: 1px solid #2A2D3A;
      color: #CBD5E1; font-size: 0.82rem; font-weight: 600;
      cursor: pointer; transition: all 0.15s;
    }
    .top-bar-toggle:hover { background: #252838; color: #F1F5F9; }

    /* Table */
    .table-wrap { overflow-x:auto; }
    table { width:100%; border-collapse:collapse; }
    th { padding: 10px 14px; text-align:left; font-size:0.72rem; font-weight:600; color:var(--text-3); text-transform:uppercase; letter-spacing:0.06em; border-bottom: 1px solid var(--border-md); background: var(--bg); }
    td { padding: 12px 14px; font-size:0.875rem; color:var(--text-2); border-bottom: 1px solid var(--border); }
    tr:last-child td { border-bottom:none; }
    tr:hover td { background: var(--bg); }

    /* Section heading */
    .section-tag { font-size:0.72rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--red); margin-bottom:10px; }
    .section-heading { font-family:var(--font-head); font-size:2.4rem; font-weight:800; color:var(--text); line-height:1.15; }
    .section-heading span { color:var(--red); }
    .section-sub { color:var(--text-3); font-size:0.95rem; line-height:1.6; margin-top:10px; }

    /* Search bar */
    .search-bar { position:relative; }
    .search-bar svg { position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-4); }
    .search-bar input { padding-left:36px; }

    /* Radio group */
    .radio-group { display:flex; align-items:center; gap:20px; }
    .radio-label { display:flex; align-items:center; gap:6px; font-size:0.875rem; color:var(--text-2); cursor:pointer; }
    .radio-label input[type=radio] { accent-color: var(--red); width:15px; height:15px; cursor:pointer; }

    /* Toast */
    .toast { position:fixed; bottom:24px; right:24px; z-index:999; background:var(--text); color:white; padding:12px 20px; border-radius:var(--radius-sm); font-size:0.875rem; font-weight:500; box-shadow:var(--shadow-lg); display:flex; align-items:center; gap:8px; animation: fadeIn 0.3s ease; }
    .toast-green { background: var(--green); }
    .toast-red { background: var(--red); }

    /* Hero */
    .hero-section { background: linear-gradient(160deg, #FFF5F5 0%, white 50%, #FFF 100%); padding: 72px 80px 60px; min-height:calc(100vh - 60px); display:flex; flex-direction:column; justify-content:center; position:relative; overflow:hidden; }
    .hero-section::before { content:''; position:absolute; top:-80px; right:-80px; width:500px; height:500px; border-radius:50%; background: radial-gradient(circle, rgba(220,38,38,0.06) 0%, transparent 70%); pointer-events:none; }
    .hero-tag { display:inline-flex; align-items:center; gap:6px; background:var(--red-light); color:var(--red); padding:5px 14px; border-radius:99px; font-size:0.75rem; font-weight:700; letter-spacing:0.08em; text-transform:uppercase; margin-bottom:20px; width:fit-content; }
    .hero-h1 { font-family:var(--font-head); font-size:3.5rem; font-weight:800; color:var(--text); line-height:1.1; margin-bottom:8px; }
    .hero-h1 span { color:var(--red); }
    .hero-actions { display:flex; gap:12px; margin-top:28px; flex-wrap:wrap; }
    .hero-stats { display:flex; gap:32px; margin-top:48px; }
    .hero-stat-val { font-family:var(--font-head); font-size:1.8rem; font-weight:800; color:var(--text); }
    .hero-stat-label { font-size:0.8rem; color:var(--text-3); margin-top:2px; }

    .availability-widget { background: var(--surface); border-radius: var(--radius-lg); padding:28px; box-shadow: var(--shadow-lg); border: 1px solid var(--border); max-width: 420px; }
    .availability-widget h3 { font-family:var(--font-head); font-size:1.05rem; font-weight:700; margin-bottom:4px; }
    .availability-widget p { font-size:0.8rem; color:var(--text-3); margin-bottom:20px; }

    .steps-grid { display:grid; grid-template-columns:1fr 1fr; gap:20px; margin-top:28px; }
    .step-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:28px; }
    .step-number { font-size:0.7rem; font-weight:700; letter-spacing:0.1em; color:var(--text-4); text-transform:uppercase; margin-bottom:16px; }
    .step-icon { width:40px; height:40px; background:var(--red-light); border-radius:10px; display:flex; align-items:center; justify-content:center; margin-bottom:14px; }
    .step-title { font-family:var(--font-head); font-size:1rem; font-weight:700; margin-bottom:8px; }
    .step-desc { font-size:0.85rem; color:var(--text-3); line-height:1.55; }

    .values-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
    .value-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:24px; }
    .value-card-icon { font-size:1.6rem; margin-bottom:12px; }
    .value-card-title { font-family:var(--font-head); font-size:0.95rem; font-weight:700; margin-bottom:6px; }
    .value-card-desc { font-size:0.83rem; color:var(--text-3); line-height:1.55; }

    .about-hero { background:linear-gradient(160deg,#FFF5F5 0%,white 60%); padding:72px 80px; text-align:center; }
    .about-content { padding:64px 80px; display:grid; grid-template-columns:1fr 1fr; gap:64px; align-items:start; }

    .enquiry-hero { padding:56px 80px 40px; background:linear-gradient(160deg,#FFF5F5 0%,white 60%); }
    .enquiry-grid { padding:0 80px 64px; display:grid; grid-template-columns:1fr 1fr; gap:24px; align-items:start; }

    .contact-hero { padding:72px 80px 40px; background:linear-gradient(160deg,#FFF5F5 0%,white 60%); }
    .contact-body { padding:0 80px 64px; max-width:600px; margin:0 auto; }
    .contact-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:36px; box-shadow:var(--shadow); }

    .donor-avatar { width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:0.8rem; color:white; flex-shrink:0; font-family:var(--font-head); }

    .reg-form { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius-lg); padding:36px; margin:24px 28px 32px; box-shadow:var(--shadow-sm); }
    .reg-section { font-size:0.8rem; font-weight:700; color:var(--red); text-transform:uppercase; letter-spacing:0.08em; display:flex; align-items:center; gap:8px; margin-bottom:20px; padding-bottom:12px; border-bottom:1px solid var(--red-light); }
    .reg-section::before { content:''; display:inline-block; width:8px; height:8px; border-radius:50%; background:var(--red); flex-shrink:0; }
    .form-grid-2 { display:grid; grid-template-columns:1fr 1fr; gap:18px; margin-bottom:18px; }
    .form-grid-1 { display:grid; grid-template-columns:1fr; gap:18px; margin-bottom:18px; }
    .reg-form-footer { display:flex; justify-content:flex-end; gap:10px; margin-top:28px; padding-top:20px; border-top:1px solid var(--border); }

    .stats-row { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; padding:24px 28px; }
    .dashboard-grid { padding:0 28px 28px; display:grid; grid-template-columns:1.3fr 1fr; gap:20px; }

    .req-table td { vertical-align:middle; }
    .req-time { font-size:0.75rem; color:var(--text-4); margin-top:2px; }
    .btn-review { background:var(--red); color:white; padding:5px 14px; border-radius:6px; font-size:0.78rem; font-weight:600; }
    .btn-view { background:white; color:var(--text-2); padding:5px 14px; border-radius:6px; font-size:0.78rem; font-weight:600; border:1px solid var(--border-md); }

    .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.35); z-index:200; display:flex; align-items:center; justify-content:center; animation:fadeIn 0.2s ease; }
    .modal { background:var(--surface); border-radius:var(--radius-lg); padding:32px; max-width:480px; width:90%; box-shadow:var(--shadow-lg); }
    .modal-title { font-family:var(--font-head); font-size:1.1rem; font-weight:700; margin-bottom:20px; }
    .modal-footer { display:flex; gap:10px; justify-content:flex-end; margin-top:24px; }

    .donor-card { background:var(--surface); border:1px solid var(--border); border-radius:var(--radius); padding:20px; transition:all 0.15s; }
    .donor-card:hover { border-color:var(--red-mid); box-shadow:var(--shadow); }
    .donors-grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:16px; }

    .how-section { padding:72px 80px; background:var(--surface); }
    .how-section-title { text-align:center; margin-bottom:48px; }


    /* ── Dark Mode ─────────────────────────────────────────────────────────── */
    [data-theme="dark"] {
      --red: #F87171;
      --red-dark: #EF4444;
      --red-light: rgba(248,113,113,0.12);
      --red-mid: rgba(248,113,113,0.3);
      --bg: #0F1117;
      --surface: #1A1D27;
      --border: #2A2D3A;
      --border-md: #353849;
      --text: #F1F5F9;
      --text-2: #CBD5E1;
      --text-3: #64748B;
      --text-4: #475569;
      --sidebar-bg: #13161F;
      --green: #34D399;
      --green-light: rgba(52,211,153,0.12);
      --amber: #FBBF24;
      --amber-light: rgba(251,191,36,0.12);
      --shadow-sm: 0 1px 3px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
      --shadow: 0 4px 16px rgba(0,0,0,0.4);
      --shadow-lg: 0 10px 40px rgba(0,0,0,0.5);
    }

    [data-theme="dark"] body,
    [data-theme="dark"] #root { background: var(--bg); }

    /* Nav */
    [data-theme="dark"] .pub-nav {
      background: rgba(19,22,31,0.95);
      border-bottom-color: var(--border);
    }
    [data-theme="dark"] .pub-nav-logo { color: var(--text); }

    /* Buttons */
    [data-theme="dark"] .btn-danger { background: rgba(248,113,113,0.12); }
    [data-theme="dark"] .btn-edit { background: rgba(96,165,250,0.12); color: #60A5FA; }
    [data-theme="dark"] .btn-edit:hover { background: #3B82F6; color: white; }
    [data-theme="dark"] .btn-approve { background: rgba(52,211,153,0.12); }

    /* Badges */
    [data-theme="dark"] .badge-blue { background: rgba(96,165,250,0.15); color: #60A5FA; }

    /* Form inputs */
    [data-theme="dark"] .form-input {
      background: #0D0F18;
      border-color: var(--border-md);
      color: var(--text);
      color-scheme: dark;
      -webkit-text-fill-color: var(--text);
    }
    [data-theme="dark"] .form-input:-webkit-autofill,
    [data-theme="dark"] .form-input:-webkit-autofill:hover,
    [data-theme="dark"] .form-input:-webkit-autofill:focus {
      -webkit-box-shadow: 0 0 0 1000px #0D0F18 inset;
      -webkit-text-fill-color: var(--text);
      caret-color: var(--text);
    }
    [data-theme="dark"] .form-input:focus {
      border-color: var(--red);
      box-shadow: 0 0 0 3px rgba(248,113,113,0.1);
    }
    [data-theme="dark"] select.form-input option { background: var(--surface); color: var(--text); }

    /* Tables */
    [data-theme="dark"] th { background: var(--bg); color: var(--text-3); }
    [data-theme="dark"] tr:hover td { background: rgba(255,255,255,0.03); }
    [data-theme="dark"] td { border-bottom-color: var(--border); }

    /* Hero sections */
    [data-theme="dark"] .hero-section {
      background: linear-gradient(160deg, #1a0f0f 0%, var(--bg) 60%);
    }
    [data-theme="dark"] .hero-section::before {
      background: radial-gradient(circle, rgba(248,113,113,0.08) 0%, transparent 70%);
    }
    [data-theme="dark"] .about-hero,
    [data-theme="dark"] .enquiry-hero,
    [data-theme="dark"] .contact-hero {
      background: linear-gradient(160deg, #1a0f0f 0%, var(--bg) 60%);
    }

    /* Section decorators */
    .reg-page-bg {
      background: #1A1C24;
    }
    [data-theme="dark"] .reg-page-bg {
      background: #0A0C14;
    }
    [data-theme="dark"] .reg-section {
      border-bottom-color: rgba(248,113,113,0.2);
    }
    [data-theme="dark"] .how-section { background: var(--surface); }

    /* Emergency row highlight */
    [data-theme="dark"] .emergency-row { background: rgba(248,113,113,0.07) !important; }

    /* Top bar */
    [data-theme="dark"] .top-bar {
      background: var(--surface);
      border-bottom-color: var(--border);
    }
    [data-theme="dark"] .top-bar-toggle {
      background: #252838; border-color: #353849; color: #CBD5E1;
      background: var(--border);
      border-color: var(--border-md);
    }
    [data-theme="dark"] .top-bar-toggle:hover { background: var(--border-md); }

    /* Scrollbar */
    [data-theme="dark"] ::-webkit-scrollbar-thumb { background: var(--border-md); }



    @media (max-width: 768px) {
      .hero-section { padding: 48px 24px; }
      .hero-h1 { font-size:2.2rem; }
      .about-content { grid-template-columns:1fr; padding:40px 24px; }
      .enquiry-grid { grid-template-columns:1fr; padding:0 24px 48px; }
      .pub-nav { padding:0 20px; }
      .pub-nav-links { display:none; }
    }
  `}</style>
);

export default GlobalStyle;
