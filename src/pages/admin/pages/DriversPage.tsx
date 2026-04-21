// src/components/pages/DriversPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

type HosRisk = "low" | "medium" | "high";
type DriverStatus = "Available" | "On Trip" | "Off Duty";

interface Driver {
  id: string;
  driver_number: string;
  name: string;
  cdl_class: string;
  experience_years: number;
  status: DriverStatus;
  hos_risk: HosRisk;
  rating: number;
  avatar_initials: string;
  avatar_bg: string;
  last_trip_origin: string;
  last_trip_destination: string;
  last_trip_date: string;
  location_city: string;
  location_state: string;
  location_note: string;
}

export interface DriversPageProps {
  headerSearch?: string;
  headerLocation?: string;
}

// ─── Helpers ─────────────────────────────────────────────────

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const full = Math.floor(rating);
  const half = rating % 1 >= 0.5;
  return (
    <span style={{ display: "flex", alignItems: "center", gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="13" height="13" viewBox="0 0 24 24"
          fill={i < full ? "#f5a623" : i === full && half ? "url(#half)" : "#e0e0e0"}
          xmlns="http://www.w3.org/2000/svg">
          <defs><linearGradient id="half"><stop offset="50%" stopColor="#f5a623" /><stop offset="50%" stopColor="#e0e0e0" /></linearGradient></defs>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
      <span style={{ marginLeft: 4, fontSize: 13, color: "#555", fontWeight: 600 }}>{rating.toFixed(1)}</span>
    </span>
  );
};

const HosRiskDot: React.FC<{ risk: HosRisk }> = ({ risk }) => {
  const color = risk === "low" ? "#22c55e" : risk === "medium" ? "#f59e0b" : "#ef4444";
  return <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: color, boxShadow: `0 0 0 3px ${color}22` }} />;
};

const StatusBadge: React.FC<{ status: DriverStatus }> = ({ status }) => {
  const styles: Record<DriverStatus, React.CSSProperties> = {
    Available: { background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" },
    "On Trip": { background: "#fef9c3", color: "#92400e", border: "1px solid #fde68a" },
    "Off Duty": { background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" },
  };
  return <span style={{ ...styles[status], padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>{status}</span>;
};

const StatCard: React.FC<{ value: string | number; label: string; iconBg: string; cardBg: string; valueColor: string; icon?: React.ReactNode }> = ({ value, label, iconBg, icon, cardBg, valueColor }) => (
  <div style={{ flex: "1 1 0", background: cardBg, borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 160 }}>
    <div>
      <div style={{ fontSize: 32, fontWeight: 800, color: valueColor, lineHeight: 1, fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
    </div>
    <div style={{ width: 44, height: 44, borderRadius: "50%", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
  </div>
);

const MiniIcon = {
  userCircle: <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>,
  checkCircle: <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14" /><polyline points="22,4 12,14.01 9,11.01" /></svg>,
  alertCircle: <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>,
  star: <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" /></svg>,
  dotsH: <svg width="16" height="16" fill="#9ca3af" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="19" cy="12" r="2" /></svg>,
};

const sel: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 7, padding: "6px 10px", fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", outline: "none" };

// ─── Page ─────────────────────────────────────────────────────

const DriversPage: React.FC<DriversPageProps> = ({ headerSearch = "", headerLocation = "All Locations" }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [hosFilter, setHosFilter] = useState("All Risk");
  const [ratingFilter, setRatingFilter] = useState("All Ratings");

  useEffect(() => {
    supabase.from("drivers").select("*").order("driver_number").then(({ data, error }) => {
      if (error) setError(error.message); else setDrivers(data as Driver[]);
      setLoading(false);
    });
  }, []);

  const locationOptions = useMemo(() => {
    const vals = Array.from(new Set(drivers.map(d => `${d.location_city}, ${d.location_state}`))).filter(Boolean);
    return ["All Locations", ...vals];
  }, [drivers]);

  const filtered = drivers.filter(d => {
    if (statusFilter !== "All Status" && d.status !== statusFilter) return false;
    if (hosFilter !== "All Risk" && d.hos_risk !== hosFilter.toLowerCase()) return false;
    if (ratingFilter === "5 Stars" && d.rating < 5) return false;
    if (ratingFilter === "4+ Stars" && d.rating < 4) return false;
    if (ratingFilter === "3+ Stars" && d.rating < 3) return false;
    if (headerLocation !== "All Locations" && `${d.location_city}, ${d.location_state}` !== headerLocation) return false;
    if (headerSearch) {
      const q = headerSearch.toLowerCase();
      const hit = [d.name, d.driver_number, d.location_city, d.location_state, d.last_trip_origin, d.last_trip_destination].some(v => v?.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  });

  const totalActive = drivers.length;
  const availableNow = drivers.filter(d => d.status === "Available").length;
  const hosAlerts = drivers.filter(d => d.hos_risk !== "low").length;
  const avgRating = drivers.length ? (drivers.reduce((a, d) => a + d.rating, 0) / drivers.length).toFixed(1) : "0.0";

  if (loading) return <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>Loading drivers…</div>;
  if (error) return <div style={{ padding: 48, textAlign: "center", color: "#dc2626" }}>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>Driver Management</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ padding: "9px 16px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151", fontFamily: "'DM Sans', sans-serif" }}>↓ Import Drivers</button>
          <button style={{ padding: "9px 16px", border: "none", borderRadius: 8, background: "#22c55e", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>✓ Compliance Report</button>
          <button style={{ padding: "9px 16px", border: "none", borderRadius: 8, background: "#1a6ef5", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>+ Add New Driver</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard value={totalActive} label="Total Active Drivers" cardBg="#eff6ff" iconBg="#1a6ef5" icon={MiniIcon.userCircle} valueColor="#1e40af" />
        <StatCard value={availableNow} label="Available Now" cardBg="#f0fdf4" iconBg="#22c55e" icon={MiniIcon.checkCircle} valueColor="#15803d" />
        <StatCard value={hosAlerts} label="HOS Risk Alerts" cardBg="#fff1f2" iconBg="#ef4444" icon={MiniIcon.alertCircle} valueColor="#b91c1c" />
        <StatCard value={avgRating} label="Average Rating" cardBg="#fffbeb" iconBg="#f59e0b" icon={MiniIcon.star} valueColor="#92400e" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Status:</span><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={sel}>{["All Status","Available","On Trip","Off Duty"].map(o => <option key={o}>{o}</option>)}</select></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>HOS Risk:</span><select value={hosFilter} onChange={e => setHosFilter(e.target.value)} style={sel}>{["All Risk","low","medium","high"].map(o => <option key={o}>{o}</option>)}</select></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Location:</span>
          <select style={{ ...sel, color: headerLocation !== "All Locations" ? "#1a6ef5" : "#374151", fontWeight: headerLocation !== "All Locations" ? 600 : 400 }} value={headerLocation} disabled>
            {locationOptions.map(o => <option key={o}>{o}</option>)}
          </select>
          {headerLocation !== "All Locations" && <span style={{ fontSize: 11, color: "#1a6ef5" }}>← from header</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Rating:</span><select value={ratingFilter} onChange={e => setRatingFilter(e.target.value)} style={sel}>{["All Ratings","5 Stars","4+ Stars","3+ Stars"].map(o => <option key={o}>{o}</option>)}</select></div>
        <button onClick={() => { setStatusFilter("All Status"); setHosFilter("All Risk"); setRatingFilter("All Ratings"); }} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>✕ Clear Filters</button>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr 1.6fr 1.4fr 80px", padding: "12px 20px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
          {["Driver","Status","HOS Risk","Rating","Last Trip","Current Location","Actions"].map(col => <span key={col} style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{col}</span>)}
        </div>
        {filtered.map((driver, idx) => (
          <div key={driver.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1.2fr 1.6fr 1.4fr 80px", padding: "16px 20px", borderBottom: idx < filtered.length - 1 ? "1px solid #f3f4f6" : "none", alignItems: "center", transition: "background 0.1s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = "#f9fafb")}
            onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: driver.avatar_bg, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{driver.avatar_initials}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{driver.name}</div>
                <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{driver.driver_number} · {driver.cdl_class}</div>
                <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 1 }}>{driver.experience_years} years experience</div>
              </div>
            </div>
            <StatusBadge status={driver.status} />
            <HosRiskDot risk={driver.hos_risk} />
            <StarRating rating={driver.rating} />
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{driver.last_trip_origin} → {driver.last_trip_destination}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{driver.last_trip_date}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{driver.location_city}, {driver.location_state}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{driver.location_note}</div>
            </div>
            <div style={{ display: "flex", justifyContent: "center", cursor: "pointer" }}>{MiniIcon.dotsH}</div>
          </div>
        ))}
        {!filtered.length && <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>No drivers match the current filters.</div>}
      </div>
    </div>
  );
};

export default DriversPage;
