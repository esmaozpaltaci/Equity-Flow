import React from "react";
import {
  LayoutDashboard, Briefcase, Coins, Shield,
  ChevronRight, Hexagon, Vote,
} from "lucide-react";
import { useApp } from "../../context/AppContext";

const NAV_ITEMS = [
  { id: "dashboard", label: "Profilim",  icon: LayoutDashboard },
  { id: "work",      label: "İş Akışı",   icon: Briefcase },
  { id: "financial", label: "Finans",      icon: Coins },
  { id: "proposals", label: "Oylamalar",   icon: Vote },
];

const Sidebar = () => {
  const { activeTab, setActiveTab, contributor } = useApp();
  const { isAdmin } = contributor;

  return (
    <aside className="w-64 min-h-screen flex flex-col border-r border-[var(--border)]"
      style={{ background: "var(--bg-card)" }}>
      {/* Logo */}
      {/* Logo */}
      <div className="h-16 flex items-center px-5 border-b border-[var(--border)]">
        <img src="/logo.png" alt="EquityFlow Logo" className="h-10 object-contain drop-shadow-md" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="px-3 mb-3 text-[10px] uppercase tracking-widest text-[var(--text-dim)] font-semibold">
          Ana Menü
        </p>
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => (
          <NavItem
            key={id}
            id={id}
            label={label}
            Icon={Icon}
            active={activeTab === id}
            onClick={() => setActiveTab(id)}
          />
        ))}

        {isAdmin && (
          <>
            <div className="pt-4 pb-2">
              <p className="px-3 text-[10px] uppercase tracking-widest text-brand-400/60 font-semibold">
                Admin
              </p>
            </div>
            <NavItem
              id="admin"
              label="Admin Paneli"
              Icon={Shield}
              active={activeTab === "admin"}
              onClick={() => setActiveTab("admin")}
              accent
            />
          </>
        )}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-[var(--border)]">
        <div className="px-3 py-2 rounded-xl bg-[var(--bg-primary)]">
          <p className="text-[10px] text-[var(--text-dim)] mb-0.5">Ağ</p>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <p className="text-xs font-medium text-emerald-400">Sepolia Testnet</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ id, label, Icon, active, onClick, accent = false }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
      active
        ? accent
          ? "bg-brand-500/20 text-brand-300 shadow-sm"
          : "bg-brand-500/15 text-brand-400"
        : "text-[var(--text-muted)] hover:bg-[var(--bg-primary)] hover:text-[var(--text-primary)]"
    }`}
  >
    <div className="flex items-center gap-3">
      <Icon
        size={16}
        className={active
          ? accent ? "text-brand-300" : "text-brand-400"
          : "text-[var(--text-dim)] group-hover:text-[var(--text-muted)]"}
      />
      {label}
    </div>
    {active && <ChevronRight size={14} className="opacity-60" />}
  </button>
);

export default Sidebar;
