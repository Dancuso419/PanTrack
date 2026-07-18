import { useEffect, useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard, Wallet, Receipt, FolderOpen, Target,
  BarChart3, FileText, LogOut, CalendarDays, PanelLeftClose, PanelLeft,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import Logo from "../components/Logo";
import ProfileMenu from "../components/ProfileMenu";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/income", label: "Income", icon: Wallet },
  { to: "/expenses", label: "Expenses", icon: Receipt },
  { to: "/categories", label: "Categories", icon: FolderOpen },
  { to: "/budget", label: "Budget", icon: Target },
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/reports", label: "Reports", icon: FileText },
];

export default function MainLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(() => localStorage.getItem("pt-sidebar") === "1");

  useEffect(() => {
    localStorage.setItem("pt-sidebar", collapsed ? "1" : "0");
  }, [collapsed]);

  async function handleLogout() {
    await logout();
    navigate("/login");
  }

  return (
    // Fixed shell: the shell itself never scrolls — only <main> does.
    <div className="flex h-screen overflow-hidden bg-base">
      {/* Sidebar (desktop) */}
      <aside
        className={`relative z-10 hidden shrink-0 flex-col bg-surface p-4 transition-[width] duration-300 ease-out md:flex ${collapsed ? "w-[86px]" : "w-[248px]"}`}
        style={{ boxShadow: "6px 0 24px -10px oklch(0.55 0.04 285 / 0.22)" }}
      >
        <div className={`mb-2 flex items-center px-1 pb-4 pt-2 ${collapsed ? "justify-center" : "justify-between"}`}>
          {collapsed ? <Logo size={34} withWordmark={false} /> : <Logo size={34} />}
          {!collapsed && (
            <button onClick={() => setCollapsed(true)} className="grid size-9 place-items-center rounded-lg text-muted transition-colors hover:bg-base-2 hover:text-brand" aria-label="Collapse sidebar">
              <PanelLeftClose size={18} />
            </button>
          )}
        </div>
        {collapsed && (
          <button onClick={() => setCollapsed(false)} className="mb-2 grid h-9 place-items-center rounded-lg text-muted transition-colors hover:bg-base-2 hover:text-brand" aria-label="Expand sidebar">
            <PanelLeft size={18} />
          </button>
        )}

        <nav className="flex-1 space-y-1.5">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={collapsed ? item.label : undefined}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg py-3 text-sm font-semibold transition-all ${collapsed ? "justify-center px-0" : "px-4"} ${
                  isActive ? "btn-brand" : "text-ink-2 hover:bg-base-2 hover:text-ink"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon size={19} className={isActive ? "text-white" : "text-brand"} strokeWidth={2} />
                  {!collapsed && <span className={isActive ? "text-white" : ""}>{item.label}</span>}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          title={collapsed ? "Sign out" : undefined}
          className={`neu-btn flex items-center gap-3 rounded-lg py-3 text-sm font-semibold text-ink-2 ${collapsed ? "justify-center px-0" : "px-4"}`}
        >
          <LogOut size={19} className="text-expense" />
          {!collapsed && "Sign out"}
        </button>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Top bar — stays fixed; only <main> scrolls */}
        <header className="flex shrink-0 items-center gap-3 px-5 py-4 md:px-8">
          <div className="md:hidden"><Logo size={30} withWordmark={false} /></div>
          <span className="neu-inset hidden items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-muted sm:flex" style={{ ["--neu-d" as string]: "2px" }}>
            <CalendarDays size={15} className="text-brand" />
            {new Date().toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short" })}
          </span>
          <div className="ml-auto flex min-w-0 items-center gap-2">
            <ProfileMenu user={user} onLogout={handleLogout} />
          </div>
        </header>

        {/* Mobile nav */}
        <nav className="no-scrollbar flex shrink-0 gap-1.5 overflow-x-auto px-5 pb-2 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold ${
                  isActive ? "btn-brand" : "neu-btn text-ink-2"
                }`
              }
            >
              <item.icon size={15} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 overflow-y-auto px-5 pb-12 pt-2 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
