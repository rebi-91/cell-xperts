// src/components/pages/FleetPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

type VehicleStatus = "Available" | "In Use" | "Maintenance" | "Critical";
type VehicleHealth = "good" | "warning" | "critical";
type VehicleType = "Truck" | "Trailer";

interface FleetVehicle {
  id: string;
  vehicle_id: string;
  vehicle_model: string;
  vehicle_type: VehicleType;
  vehicle_status: VehicleStatus;
  assigned_driver_name: string | null;
  assigned_driver_status: string | null;
  location_city: string;
  location_state: string;
  location_note: string;
  last_gps_ping: string;
  last_gps_time: string;
  health: VehicleHealth;
}

export interface FleetPageProps {
  headerSearch?: string;
  headerLocation?: string;
}

const VehicleStatusBadge: React.FC<{ status: VehicleStatus }> = ({ status }) => {
  const map: Record<VehicleStatus, React.CSSProperties> = {
    Available:   { background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" },
    "In Use":    { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" },
    Maintenance: { background: "#fee2e2", color: "#b91c1c", border: "1px solid #fecaca" },
    Critical:    { background: "#fce7f3", color: "#9d174d", border: "1px solid #fbcfe8" },
  };
  return <span style={{ ...map[status], padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>{status}</span>;
};

const HealthDot: React.FC<{ health: VehicleHealth }> = ({ health }) => {
  const color = health === "good" ? "#22c55e" : health === "warning" ? "#f59e0b" : "#ef4444";
  return <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: "50%", background: color, boxShadow: `0 0 0 3px ${color}22` }} />;
};

const StatCard: React.FC<{ value: string | number; label: string; iconBg: string; cardBg: string; valueColor: string; icon: React.ReactNode }> = ({ value, label, iconBg, icon, cardBg, valueColor }) => (
  <div style={{ flex: "1 1 0", background: cardBg, borderRadius: 14, padding: "20px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", minWidth: 140 }}>
    <div>
      <div style={{ fontSize: 32, fontWeight: 800, color: valueColor, lineHeight: 1, fontFamily: "'DM Sans', sans-serif" }}>{value}</div>
      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 6, fontFamily: "'DM Sans', sans-serif" }}>{label}</div>
    </div>
    <div style={{ width: 44, height: 44, borderRadius: "50%", background: iconBg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{icon}</div>
  </div>
);

const icons = {
  truck: <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>,
  check: <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22,4 12,14.01 9,11.01"/></svg>,
  wrench: <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
  heart: <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>,
  dotsH: <svg width="16" height="16" fill="#9ca3af" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>,
};

const sel: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 7, padding: "6px 10px", fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", outline: "none" };
const cols = "1.8fr 0.7fr 1fr 1.6fr 1.6fr 1.4fr 0.8fr 60px";

const FleetPage: React.FC<FleetPageProps> = ({ headerSearch = "", headerLocation = "All Locations" }) => {
  const [vehicles, setVehicles] = useState<FleetVehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [healthFilter, setHealthFilter] = useState("All Health");

  useEffect(() => {
    supabase.from("fleet_vehicles").select("*").order("vehicle_id").then(({ data, error }) => {
      if (error) setError(error.message); else setVehicles(data as FleetVehicle[]);
      setLoading(false);
    });
  }, []);

  const filtered = vehicles.filter(v => {
    if (typeFilter !== "All Types" && v.vehicle_type !== typeFilter) return false;
    if (statusFilter !== "All Status" && v.vehicle_status !== statusFilter) return false;
    if (healthFilter !== "All Health" && v.health !== healthFilter.toLowerCase()) return false;
    if (headerLocation !== "All Locations") {
      const loc = headerLocation.split(",")[0].trim().toLowerCase();
      if (!v.location_city.toLowerCase().includes(loc)) return false;
    }
    if (headerSearch) {
      const q = headerSearch.toLowerCase();
      const hit = [v.vehicle_id, v.vehicle_model, v.location_city, v.assigned_driver_name ?? ""].some(s => s.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  });

  const totalVehicles = vehicles.length;
  const available = vehicles.filter(v => v.vehicle_status === "Available").length;
  const inUse = vehicles.filter(v => v.vehicle_status === "In Use").length;
  const maintenance = vehicles.filter(v => v.vehicle_status === "Maintenance").length;
  const healthScore = vehicles.length ? Math.round((vehicles.filter(v => v.health === "good").length / vehicles.length) * 100) : 0;

  if (loading) return <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>Loading fleet…</div>;
  if (error) return <div style={{ padding: 48, textAlign: "center", color: "#dc2626" }}>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>Fleet – Trucks & Trailers Management</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ padding: "9px 16px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151", fontFamily: "'DM Sans', sans-serif" }}>↓ Import Fleet Data</button>
          <button style={{ padding: "9px 16px", border: "none", borderRadius: 8, background: "#22c55e", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>✕ Schedule Maintenance</button>
          <button style={{ padding: "9px 16px", border: "none", borderRadius: 8, background: "#1a6ef5", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>+ Add Vehicle</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard value={totalVehicles} label="Total Vehicles"  cardBg="#eff6ff" iconBg="#1a6ef5" icon={icons.truck}  valueColor="#1e40af" />
        <StatCard value={available}    label="Available"        cardBg="#f0fdf4" iconBg="#22c55e" icon={icons.check}  valueColor="#15803d" />
        <StatCard value={inUse}        label="In Use"           cardBg="#fffbeb" iconBg="#f59e0b" icon={icons.truck}  valueColor="#92400e" />
        <StatCard value={maintenance}  label="Maintenance"      cardBg="#fff1f2" iconBg="#ef4444" icon={icons.wrench} valueColor="#b91c1c" />
        <StatCard value={`${healthScore}%`} label="Health Score" cardBg="#f5f3ff" iconBg="#8b5cf6" icon={icons.heart} valueColor="#6d28d9" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Vehicle Type:</span><select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} style={sel}>{["All Types","Truck","Trailer"].map(o => <option key={o}>{o}</option>)}</select></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Status:</span><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={sel}>{["All Status","Available","In Use","Maintenance","Critical"].map(o => <option key={o}>{o}</option>)}</select></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Health:</span><select value={healthFilter} onChange={e => setHealthFilter(e.target.value)} style={sel}>{["All Health","good","warning","critical"].map(o => <option key={o}>{o}</option>)}</select></div>
        {headerLocation !== "All Locations" && <span style={{ fontSize: 12, color: "#1a6ef5", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>📍 Filtering by: {headerLocation}</span>}
        {headerSearch && <span style={{ fontSize: 12, color: "#1a6ef5", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>🔍 "{headerSearch}"</span>}
        <button onClick={() => { setTypeFilter("All Types"); setStatusFilter("All Status"); setHealthFilter("All Health"); }} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>✕ Clear All</button>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, padding: "12px 20px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
          {["Vehicle ID / Plate","Type","Status","Assigned Driver","Location","Last GPS Ping","Health","Actions"].map(col => <span key={col} style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{col}</span>)}
        </div>
        {filtered.map((v, idx) => (
          <div key={v.id} style={{ display: "grid", gridTemplateColumns: cols, padding: "15px 20px", borderBottom: idx < filtered.length - 1 ? "1px solid #f3f4f6" : "none", alignItems: "center", transition: "background 0.1s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = "#f9fafb")}
            onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: "#eff6ff", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {v.vehicle_type === "Truck"
                  ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a6ef5" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                  : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M2 12h20"/><circle cx="6.5" cy="21" r="1"/><circle cx="17.5" cy="21" r="1"/></svg>}
              </div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#111827" }}>{v.vehicle_id}</div>
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{v.vehicle_model}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              {v.vehicle_type === "Truck"
                ? <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1a6ef5" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>
                : <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6d28d9" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M2 12h20"/></svg>}
            </div>
            <VehicleStatusBadge status={v.vehicle_status} />
            <div>
              {v.assigned_driver_name ? (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#dbeafe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, color: "#1d4ed8", flexShrink: 0 }}>
                    {v.assigned_driver_name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{v.assigned_driver_name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{v.assigned_driver_status}</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: "#f3f4f6", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
                  </div>
                  <div style={{ fontSize: 13, color: "#9ca3af" }}>Unassigned</div>
                </div>
              )}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{v.location_city}, {v.location_state}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{v.location_note}</div>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: "#111827" }}>{v.last_gps_ping}</div>
              <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{v.last_gps_time}</div>
            </div>
            <HealthDot health={v.health} />
            <div style={{ display: "flex", justifyContent: "center", cursor: "pointer" }}>{icons.dotsH}</div>
          </div>
        ))}
        {!filtered.length && <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>No vehicles match the current filters.</div>}
      </div>
    </div>
  );
};

export default FleetPage;
