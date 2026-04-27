// src/components/pages/DispatchBoard.tsx
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

// ─── Types ────────────────────────────────────────────────────
type DispatchStatus = "Unassigned" | "Assigned" | "In-Transit" | "Delivered" | "Problem";
type Priority = "High" | "Normal" | "Low";

interface DispatchLoad {
  id: string;
  load_number: string;
  pickup_location: string;
  drop_location: string;
  eta: string;
  dispatch_status: DispatchStatus;
  assigned_driver: string | null;
  rate: number;
  priority: Priority;
  customer_initials: string;
  customer_color: string;
}

export interface DispatchBoardProps {
  headerSearch?: string;
  headerLocation?: string;
}

// ─── Column config ────────────────────────────────────────────
const COLUMNS: { status: DispatchStatus; color: string; dot: string }[] = [
  { status: "Unassigned", color: "#6b7280", dot: "#9ca3af" },
  { status: "Assigned",   color: "#1a6ef5", dot: "#1a6ef5" },
  { status: "In-Transit", color: "#22c55e", dot: "#22c55e" },
  { status: "Delivered",  color: "#8b5cf6", dot: "#8b5cf6" },
  { status: "Problem",    color: "#ef4444", dot: "#ef4444" },
];

// ─── Priority badge ───────────────────────────────────────────
const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const map: Record<Priority, { bg: string; color: string }> = {
    High:   { bg: "#fee2e2", color: "#b91c1c" },
    Normal: { bg: "#fef3c7", color: "#92400e" },
    Low:    { bg: "#dcfce7", color: "#15803d" },
  };
  return (
    <span style={{
      background: map[priority].bg, color: map[priority].color,
      padding: "2px 8px", borderRadius: 12, fontSize: 11,
      fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
      whiteSpace: "nowrap",
    }}>
      {priority}
    </span>
  );
};

// ─── Load card ────────────────────────────────────────────────
const LoadCard: React.FC<{ load: DispatchLoad }> = ({ load }) => (
  <div style={{
    background: "#fff", borderRadius: 10,
    border: "1px solid #e5e7eb",
    padding: "14px 16px", marginBottom: 10,
    cursor: "pointer", transition: "box-shadow 0.15s",
  }}
    onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)"}
    onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = "none"}
  >
    {/* Header row */}
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: "#1a6ef5", fontFamily: "'DM Sans', sans-serif" }}>
        {load.load_number}
      </span>
      <PriorityBadge priority={load.priority} />
    </div>

    {/* Route */}
    <div style={{ fontSize: 13, color: "#111827", fontWeight: 500, marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
      {load.pickup_location} → {load.drop_location}
    </div>

    {/* ETA */}
    <div style={{ fontSize: 12, color: "#9ca3af", marginBottom: 10, fontFamily: "'DM Sans', sans-serif" }}>
      {load.dispatch_status === "Delivered" ? `Delivered: ${load.eta}` : `ETA: ${load.eta}`}
    </div>

    {/* Footer */}
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      {load.assigned_driver ? (
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <div style={{
            width: 26, height: 26, borderRadius: "50%",
            background: load.customer_color,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 10, fontWeight: 700, flexShrink: 0,
            fontFamily: "'DM Sans', sans-serif",
          }}>
            {load.assigned_driver.split(" ").map(n => n[0]).join("").slice(0, 2)}
          </div>
          <span style={{ fontSize: 12, color: "#374151", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
            {load.assigned_driver}
          </span>
        </div>
      ) : (
        <span style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>
          Unassigned
        </span>
      )}
      <span style={{ fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>
        ${load.rate.toLocaleString()}
      </span>
    </div>

    {/* Problem note */}
    {load.dispatch_status === "Problem" && (
      <div style={{
        marginTop: 8, padding: "6px 10px",
        background: "#fff1f2", borderRadius: 6,
        fontSize: 11, color: "#b91c1c",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        ⚠ Requires attention
      </div>
    )}
  </div>
);

// ─── Kanban column ────────────────────────────────────────────
const KanbanColumn: React.FC<{
  status: DispatchStatus;
  dot: string;
  loads: DispatchLoad[];
}> = ({ status, dot, loads }) => (
  <div style={{
    flex: "1 1 0", minWidth: 260, maxWidth: 320,
    display: "flex", flexDirection: "column",
  }}>
    {/* Column header */}
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      marginBottom: 14, padding: "0 2px",
    }}>
      <span style={{
        width: 10, height: 10, borderRadius: "50%",
        background: dot, display: "inline-block", flexShrink: 0,
      }} />
      <span style={{
        fontSize: 14, fontWeight: 700, color: "#111827",
        fontFamily: "'DM Sans', sans-serif",
      }}>
        {status}
      </span>
      <span style={{
        background: "#f3f4f6", color: "#6b7280",
        borderRadius: "50%", width: 22, height: 22,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
      }}>
        {loads.length}
      </span>
    </div>

    {/* Cards */}
    <div style={{ flex: 1, overflowY: "auto" }}>
      {loads.map(load => <LoadCard key={load.id} load={load} />)}
      {loads.length === 0 && (
        <div style={{
          padding: "24px 16px", textAlign: "center",
          color: "#d1d5db", fontSize: 13,
          fontFamily: "'DM Sans', sans-serif",
          border: "2px dashed #f3f4f6", borderRadius: 10,
        }}>
          No loads
        </div>
      )}
    </div>
  </div>
);

// ─── DispatchBoard ────────────────────────────────────────────
const DispatchBoard: React.FC<DispatchBoardProps> = ({
  headerSearch = "",
  headerLocation = "All Locations",
}) => {
  const [loads, setLoads]     = useState<DispatchLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  // Page-level filters
  const [priorityFilter, setPriorityFilter]           = useState("All");
  const [driverStatusFilter, setDriverStatusFilter]   = useState("All");

  useEffect(() => {
    supabase
      .from("orders_loads")
      .select("id,load_number,pickup_location,drop_location,eta,dispatch_status,assigned_driver,rate,priority,customer_initials,customer_color")
      .order("load_number")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setLoads((data ?? []) as DispatchLoad[]);
        setLoading(false);
      });
  }, []);

  // Filter loads
  const filtered = loads.filter(l => {
    if (!l.dispatch_status) return false;
    if (priorityFilter !== "All" && l.priority !== priorityFilter) return false;
    if (driverStatusFilter === "Assigned"   && !l.assigned_driver) return false;
    if (driverStatusFilter === "Unassigned" && l.assigned_driver)  return false;
    if (headerLocation !== "All Locations") {
      const loc = headerLocation.split(",")[0].trim().toLowerCase();
      if (!l.pickup_location.toLowerCase().includes(loc) &&
          !l.drop_location.toLowerCase().includes(loc)) return false;
    }
    if (headerSearch) {
      const q = headerSearch.toLowerCase();
      const hit = [l.load_number, l.pickup_location, l.drop_location, l.assigned_driver ?? ""]
        .some(v => v.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  });

  const byStatus = (status: DispatchStatus) =>
    filtered.filter(l => l.dispatch_status === status);

  const sel: React.CSSProperties = {
    border: "1px solid #e5e7eb", borderRadius: 7, padding: "6px 10px",
    fontSize: 13, color: "#374151", background: "#fff",
    cursor: "pointer", fontFamily: "'DM Sans', sans-serif", outline: "none",
  };

  if (loading) return <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>Loading dispatch board…</div>;
  if (error)   return <div style={{ padding: 48, textAlign: "center", color: "#dc2626", fontSize: 14 }}>Error: {error}</div>;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", fontFamily: "'DM Sans', sans-serif" }}>

      {/* ── Title + actions ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>
          Dispatch Board
        </h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 16px", border: "none", borderRadius: 8,
            background: "#22c55e", cursor: "pointer",
            fontSize: 13, fontWeight: 600, color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            <svg width="14" height="14" fill="none" stroke="#fff" strokeWidth="2.5" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
            </svg>
            Auto-Assign
          </button>
          <button style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "9px 16px", border: "none", borderRadius: 8,
            background: "#1a6ef5", cursor: "pointer",
            fontSize: 13, fontWeight: 600, color: "#fff",
            fontFamily: "'DM Sans', sans-serif",
          }}>
            + Create New Load
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Priority:</span>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={sel}>
            {["All","High","Normal","Low"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Driver Status:</span>
          <select value={driverStatusFilter} onChange={e => setDriverStatusFilter(e.target.value)} style={sel}>
            {["All","Assigned","Unassigned"].map(o => <option key={o}>{o}</option>)}
          </select>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Location:</span>
          <span style={{
            ...sel, cursor: "default",
            color: headerLocation !== "All Locations" ? "#1a6ef5" : "#374151",
            fontWeight: headerLocation !== "All Locations" ? 600 : 400,
            padding: "6px 10px",
          }}>
            {headerLocation}
          </span>
        </div>
        <button
          onClick={() => { setPriorityFilter("All"); setDriverStatusFilter("All"); }}
          style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}
        >
          ✕ Clear All
        </button>
      </div>

      {/* ── Kanban board ── */}
      <div style={{
        display: "flex", gap: 16,
        overflowX: "auto", flex: 1,
        paddingBottom: 16,
        alignItems: "flex-start",
      }}>
        {COLUMNS.map(({ status, dot }) => (
          <KanbanColumn
            key={status}
            status={status}
            dot={dot}
            loads={byStatus(status)}
          />
        ))}
      </div>
    </div>
  );
};

export default DispatchBoard;
