import { useState } from "react";
import useTheme from "./hooks/useTheme";
import GlobalStyle from "./styles/GlobalStyle";

// Components
import PublicNav from "./components/PublicNav";
import LoginModal from "./components/LoginModal";
import StaffSidebar from "./components/StaffSidebar";
import AdminSidebar from "./components/AdminSidebar";
import TopBar from "./components/TopBar";

// Public pages (no login needed)
import HomePage from "./pages/public/HomePage";
import AboutPage from "./pages/public/AboutPage";
import ContactPage from "./pages/public/ContactPage";
import RegisterPage from "./pages/public/RegisterPage";

// Staff pages
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffDonors from "./pages/staff/StaffDonors";
import StaffRegister from "./pages/staff/StaffRegister";
import StaffDonationHistory from "./pages/staff/StaffDonationHistory";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDonors from "./pages/admin/AdminDonors";
import AdminBloodStock from "./pages/admin/AdminBloodStock";
import AdminRequests from "./pages/admin/AdminRequests";
import AdminStaff from "./pages/admin/AdminStaff";
import AdminTransactions from "./pages/admin/AdminTransactions";

// Customer panel
import CustomerPanel from "./pages/customer/CustomerPanel";

// ── Decode JWT without a library ─────────────────────────────────────────────
// The JWT payload is the second segment, base64url-encoded
const decodeToken = (token) => {
  try {
    const payload = token.split(".")[1];
    // base64url → base64 → JSON
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const decoded = JSON.parse(json);
    // Check expiry (exp is in seconds)
    if (decoded.exp && decoded.exp * 1000 < Date.now()) return null;
    return decoded;
  } catch {
    return null;
  }
};

// ── Restore user from token on page load ─────────────────────────────────────
const restoreUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;
  const decoded = decodeToken(token);
  if (!decoded) { localStorage.removeItem("token"); return null; }
  // Reconstruct the user object the same way LoginModal does
  const user = { ...decoded };
  user.name = user.name || user.staff_name || user.admin_name || user.username;
  return user;
};

const restoreUserPage = (user) => {
  if (!user) return "Home";
  if (user.role === "STAFF")    return "Staff-Dashboard";
  if (user.role === "ADMIN")    return "Admin-Dashboard";
  if (user.role === "CUSTOMER") return "Customer-Panel";
  return "Home";
};

export default function App() {
  const [dark, toggleTheme]     = useTheme();
  const [user, setUser]         = useState(() => restoreUser());
  const [page, setPage]         = useState(() => restoreUserPage(restoreUser()));
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLogin = (acc) => {
    setUser(acc);
    setShowLogin(false);
    if (acc.role === "STAFF")         setPage("Staff-Dashboard");
    else if (acc.role === "ADMIN")    setPage("Admin-Dashboard");
    else if (acc.role === "CUSTOMER") setPage("Customer-Panel");
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setUser(null);
    setPage("Home");
  };

  const openRegister = () => setShowRegister(true);
  const closeRegister = () => setShowRegister(false);

  // ── Customer ──────────────────────────────────────────────────────────────
  if (user?.role === "CUSTOMER") {
    return <CustomerPanel user={user} onLogout={handleLogout} dark={dark} onToggleTheme={toggleTheme} />;
  }

  // ── Staff ─────────────────────────────────────────────────────────────────
  if (user?.role === "STAFF") {
    const staffPages = {
      "Staff-Dashboard": <StaffDashboard />,
      "Staff-Donors":    <StaffDonors setPage={setPage} />,
      "Staff-Donations": <StaffDonationHistory />,
      "Staff-Register":  <StaffRegister />,
    };
    return (
      <>
        <GlobalStyle />
        <div className="app-layout">
          <StaffSidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} dark={dark} onToggleTheme={toggleTheme} />
          <main className="main-content">
            <TopBar dark={dark} onToggleTheme={toggleTheme} />
            {staffPages[page] || <StaffDashboard />}
          </main>
        </div>
      </>
    );
  }

  // ── Admin ─────────────────────────────────────────────────────────────────
  if (user?.role === "ADMIN") {
    const adminPages = {
      "Admin-Dashboard":    <AdminDashboard />,
      "Admin-Donors":       <AdminDonors />,
      "Admin-BloodStock":   <AdminBloodStock />,
      "Admin-Requests":     <AdminRequests />,
      "Admin-Staff":        <AdminStaff />,
      "Admin-Transactions": <AdminTransactions />,
    };
    return (
      <>
        <GlobalStyle />
        <div className="app-layout">
          <AdminSidebar page={page} setPage={setPage} user={user} onLogout={handleLogout} dark={dark} onToggleTheme={toggleTheme} />
          <main className="main-content">
            <TopBar dark={dark} onToggleTheme={toggleTheme} />
            {adminPages[page] || <AdminDashboard />}
          </main>
        </div>
      </>
    );
  }

  // ── Public (not logged in) ────────────────────────────────────────────────
  const publicSetPage = (nextPage) => {
    if (nextPage === "Register") { openRegister(); return; }
    setPage(nextPage);
  };

  const publicPages = {
    "Home":     <HomePage setPage={publicSetPage} onLogin={() => setShowLogin(true)} />,
    "About":    <AboutPage setPage={publicSetPage} />,
    "Contact":  <ContactPage />,
  };

  return (
    <>
      <GlobalStyle />
      <PublicNav
        page={page}
        setPage={publicSetPage}
        onLogin={() => setShowLogin(true)}
        onRegister={openRegister}
        dark={dark}
        onToggleTheme={toggleTheme}
      />
      <main>{publicPages[page] || publicPages["Home"]}</main>
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} onLogin={handleLogin} />}
      {showRegister && (
        <RegisterPage
          onClose={closeRegister}
          onLogin={() => { closeRegister(); setShowLogin(true); }}
        />
      )}
    </>
  );
}
