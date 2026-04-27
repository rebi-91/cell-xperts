// src/components/AppDashboard.tsx
import React, { useEffect, useMemo, useState } from "react";
import DriversPage from "./pages/DriversPage";
import DashboardPage from "./pages/DashboardPage";
import FleetPage from "./pages/FleetPage";
import OrdersPage from "./pages/OrdersPage";
// At the top with other imports:
import DispatchBoard from "./pages/DispatchBoard";

// Inside renderContent() switch:
import supabase from "../../supabase";
import { useSession } from "../../context/SessionContext";

// ─── Types ────────────────────────────────────────────────────
type MenuKey =
  | "dashboard" | "orders"  | "dispatch" | "fleet"
  | "drivers"   | "routes"  | "warehouses" | "proof"
  | "billing"   | "reports" | "ai"        | "settings";

// ─── Helpers ──────────────────────────────────────────────────
const fallbackInitials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map(p => p[0]?.toUpperCase() ?? "").join("");

const Placeholder: React.FC<{ label: string }> = ({ label }) => (
  <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>
    {label} — coming soon
  </div>
);

// ─── Sidebar nav data ─────────────────────────────────────────
const NAV_ITEMS: { key: MenuKey; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard",  label: "Dashboard",          icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{display:"block"}}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg> },
  { key: "orders",     label: "Orders / Loads",     icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{display:"block"}}><path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><line x1="9" y1="12" x2="15" y2="12"/><line x1="9" y1="16" x2="13" y2="16"/></svg> },
  { key: "dispatch",   label: "Dispatch Board",     icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{display:"block"}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/></svg> },
  { key: "fleet",      label: "Fleet",              icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{display:"block"}}><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg> },
  { key: "drivers",    label: "Drivers",            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{display:"block"}}><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg> },
  { key: "routes",     label: "Routes & Tracking",  icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{display:"block"}}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 000 20M2 12h20"/></svg> },
  { key: "warehouses", label: "Warehouses / Hubs",  icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{display:"block"}}><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg> },
  { key: "proof",      label: "Proof of Delivery",  icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{display:"block"}}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><polyline points="9,15 11,17 15,13"/></svg> },
  { key: "billing",    label: "Billing & Invoices", icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{display:"block"}}><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg> },
  { key: "reports",    label: "Reports",            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{display:"block"}}><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
  { key: "ai",         label: "AI Ops Assistant",   icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{display:"block"}}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg> },
  { key: "settings",   label: "Settings",           icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{display:"block"}}><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg> },
];

// ─── Sidebar ──────────────────────────────────────────────────
const AppSidebar: React.FC<{ active: MenuKey; onSelect: (k: MenuKey) => void }> = ({ active, onSelect }) => (
  <aside style={{
    width: 232,
    minWidth: 232,
    maxWidth: 232,
    height: "100vh",
    background: "#fff",
    borderRight: "1px solid #e5e7eb",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    flexShrink: 0,
    boxSizing: "border-box",
  }}>
    {/* Logo */}
    <div style={{
      height: 56,
      minHeight: 56,
      display: "flex",
      alignItems: "center",
      paddingLeft: 20,
      borderBottom: "1px solid #f3f4f6",
      flexShrink: 0,
      boxSizing: "border-box",
    }}>
      <span style={{
        fontSize: 21,
        fontWeight: 800,
        fontFamily: "'DM Sans', sans-serif",
        background: "linear-gradient(135deg,#1a6ef5,#06b6d4)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "-0.3px",
      }}>
        Taz
      </span>
    </div>

    {/* Nav — flex column so items stack, no gap on the aside itself */}
    <nav style={{
      flex: 1,
      padding: "8px 10px 16px",
      display: "flex",          // ← must be flex
      flexDirection: "column",  // ← must be column
      boxSizing: "border-box",
    }}>
      {NAV_ITEMS.map(({ key, label, icon }) => {
        const on = active === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            style={{
              // Every property identical on every item — this is what aligns them
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              width: "100%",
              boxSizing: "border-box",
              padding: "9px 12px",
              marginBottom: 1,
              // Appearance
              border: "none",
              borderRadius: 8,
              background: on ? "#1a6ef5" : "transparent",
              color: on ? "#fff" : "#374151",
              cursor: "pointer",
              // Text
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13.5,
              fontWeight: on ? 600 : 400,
              lineHeight: "20px",
              textAlign: "left",
              whiteSpace: "nowrap",
              // Reset browser button defaults that cause misalignment
              outline: "none",
              WebkitAppearance: "none",
              appearance: "none",
              transition: "background 0.12s, color 0.12s",
            }}
            onMouseEnter={e => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6"; }}
            onMouseLeave={e => { if (!on) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
          >
            {/* Fixed-size icon box — labels always start at same x */}
            <span style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 16,
              height: 16,
              minWidth: 16,   // ← prevents flex from squishing it
              flexShrink: 0,
              opacity: on ? 1 : 0.55,
            }}>
              {icon}
            </span>
            <span style={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis" }}>
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  </aside>
);

// ─── Header icons ─────────────────────────────────────────────
const Ico = {
  search:   <svg width="15" height="15" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  calendar: <svg width="14" height="14" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  location: <svg width="14" height="14" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>,
  chevron:  <svg width="12" height="12" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"><polyline points="6,9 12,15 18,9"/></svg>,
  bell:     <svg width="18" height="18" fill="none" stroke="#374151" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>,
};

const searchPlaceholder: Partial<Record<MenuKey, string>> = {
  dashboard:  "Search loads, trucks, drivers…",
  drivers:    "Search drivers, licenses, locations…",
  orders:     "Search loads, customers, trucks…",
  fleet:      "Search vehicles, drivers, locations…",
  dispatch:   "Search loads, trucks, drivers…",
};

// ─── AppDashboard ─────────────────────────────────────────────
const AppDashboard: React.FC = () => {
  const { session } = useSession();

  const [active, setActive]               = useState<MenuKey>("dashboard");
  const [userFullName, setUserFullName]   = useState("Sarah Johnson");
  const [userInitials, setUserInitials]   = useState("SJ");
  const [headerSearch, setHeaderSearch]   = useState("");
  const [headerLocation, setHeaderLocation] = useState("All Locations");
  const [driverLocations, setDriverLocations] = useState<string[]>([]);

  // Load user profile
  useEffect(() => {
    if (!session?.user?.id) return;
    supabase.from("profiles").select("full_name").eq("id", session.user.id).single()
      .then(({ data, error }) => {
        if (!error && data?.full_name) {
          setUserFullName(data.full_name);
          setUserInitials(fallbackInitials(data.full_name) || "U");
        }
      });
  }, [session]);

  // Load location options
  useEffect(() => {
    supabase.from("drivers").select("location_city,location_state")
      .then(({ data }) => {
        if (!data) return;
        const vals = Array.from(
          new Set(data.map((d: { location_city: string; location_state: string }) =>
            `${d.location_city}, ${d.location_state}`))
        ).filter(v => (v as string).replace(",","").trim() !== "");
        setDriverLocations(vals as string[]);
      });
  }, []);

  const handleSelect = (key: MenuKey) => {
    setActive(key);
    setHeaderSearch("");
    setHeaderLocation("All Locations");
  };

  const locationOptions = useMemo(() => ["All Locations", ...driverLocations], [driverLocations]);

  const renderContent = () => {
    switch (active) {
      case "dashboard": return <DashboardPage />;
      case "drivers":   return <DriversPage  headerSearch={headerSearch} headerLocation={headerLocation} />;
      case "orders":    return <OrdersPage   headerSearch={headerSearch} headerLocation={headerLocation} />;
      case "dispatch": return <DispatchBoard headerSearch={headerSearch} headerLocation={headerLocation} />;
      case "fleet":     return <FleetPage    headerSearch={headerSearch} headerLocation={headerLocation} />;
      default:          return <Placeholder label={NAV_ITEMS.find(n => n.key === active)?.label ?? active} />;
    }
  };

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "'DM Sans', sans-serif", background: "#f9fafb", overflow: "hidden" }}>

      <AppSidebar active={active} onSelect={handleSelect} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden", minWidth: 0 }}>

        {/* Header */}
        <header style={{
          background: "#fff", borderBottom: "1px solid #e5e7eb",
          padding: "0 24px", height: 56,
          display: "flex", alignItems: "center", gap: 10, flexShrink: 0,
        }}>
          {/* Search */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f3f4f6", borderRadius: 8, padding: "7px 13px", flex: 1, maxWidth: 380 }}>
            {Ico.search}
            <input
              value={headerSearch}
              onChange={e => setHeaderSearch(e.target.value)}
              placeholder={searchPlaceholder[active] ?? "Search…"}
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#374151", width: "100%", fontFamily: "'DM Sans', sans-serif" }}
            />
          </div>

          {/* Date */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px", cursor: "pointer", fontSize: 13, color: "#374151", background: "#fff", whiteSpace: "nowrap" }}>
            {Ico.calendar}<span>Last 7 days</span>{Ico.chevron}
          </div>

          {/* Location */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, border: "1px solid #e5e7eb", borderRadius: 8, padding: "7px 12px", fontSize: 13, color: "#374151", background: "#fff" }}>
            {Ico.location}
            <select
              value={headerLocation}
              onChange={e => setHeaderLocation(e.target.value)}
              style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#374151", fontFamily: "'DM Sans', sans-serif", cursor: "pointer" }}
            >
              {locationOptions.map(loc => <option key={loc}>{loc}</option>)}
            </select>
            {Ico.chevron}
          </div>

          <div style={{ flex: 1 }} />

          {/* Bell */}
          <div style={{ position: "relative", cursor: "pointer", padding: 4 }}>
            {Ico.bell}
            <span style={{ position: "absolute", top: 0, right: 0, background: "#ef4444", color: "#fff", fontSize: 9, fontWeight: 700, borderRadius: "50%", width: 14, height: 14, display: "flex", alignItems: "center", justifyContent: "center" }}>3</span>
          </div>

          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", paddingLeft: 10, borderLeft: "1px solid #f3f4f6" }} onClick={() => (window.location.href = "/")}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", lineHeight: 1.3 }}>{userFullName}</div>
              <div style={{ fontSize: 11, color: "#6b7280" }}>Operations Manager</div>
            </div>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1a6ef5", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {userInitials}
            </div>
          </div>
        </header>

        {/* Page */}
        <main style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
          {renderContent()}
        </main>

      </div>
    </div>
  );
};

export default AppDashboard;
