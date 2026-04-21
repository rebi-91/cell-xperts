// src/components/pages/DashboardPage.tsx
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

// ─── Supabase client ──────────────────────────────────────────────────────────
// Replace with your actual Supabase URL and anon key
const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

// ─── Types ────────────────────────────────────────────────────────────────────
type VehicleStatus = "on_time" | "delayed" | "critical";
type LoadStatus =
  | "In Transit"
  | "Assigned"
  | "Loading"
  | "Delivered"
  | "Unassigned";

interface DashboardStats {
  active_loads: number;
  on_time_pct: number;
  trucks_available: number;
  trucks_total: number;
  exceptions: number;
  critical_alerts: number;
  fuel_cost_mtd: number;
  revenue_mtd: number;
  active_loads_delta_pct: number | null;
  on_time_delta_pct: number | null;
  fuel_cost_delta_pct: number | null;
  revenue_delta_pct: number | null;
}

interface LiveVehicle {
  id: string;
  vehicle_code: string;
  lat: number;
  lng: number;
  vehicle_status: VehicleStatus;
}

interface DispatchLoad {
  id: string;
  load_number: string;
  origin: string;
  destination: string;
  driver_name: string;
  load_status: LoadStatus;
}

// ─── Helper Components ────────────────────────────────────────────────────────

const KpiCard: React.FC<{
  title: string;
  value: React.ReactNode;
  sub: React.ReactNode;
  iconBg: string;
  icon: React.ReactNode;
}> = ({ title, value, sub, iconBg, icon }) => (
  <div
    style={{
      flex: "1 1 0",
      background: "#fff",
      borderRadius: 14,
      border: "1px solid #e5e7eb",
      padding: "20px 22px",
      display: "flex",
      flexDirection: "column",
      gap: 12,
      minWidth: 160,
    }}
  >
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
      <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500, fontFamily: "'DM Sans', sans-serif" }}>
        {title}
      </span>
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: 10,
          background: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {icon}
      </div>
    </div>
    <div style={{ fontSize: 30, fontWeight: 800, color: "#111827", lineHeight: 1, fontFamily: "'DM Sans', sans-serif" }}>
      {value}
    </div>
    <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>{sub}</div>
  </div>
);

const Delta: React.FC<{ value: number | null; suffix?: string }> = ({ value, suffix = "%" }) => {
  if (value === null) return null;
  const positive = value >= 0;
  return (
    <span
      style={{
        color: positive ? "#16a34a" : "#dc2626",
        fontWeight: 600,
      }}
    >
      {positive ? "↑" : "↓"} {Math.abs(value).toFixed(1)}{suffix}
    </span>
  );
};

const LoadStatusBadge: React.FC<{ status: LoadStatus }> = ({ status }) => {
  const map: Record<LoadStatus, React.CSSProperties> = {
    "In Transit": { background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" },
    Assigned:     { background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe" },
    Loading:      { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" },
    Delivered:    { background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" },
    Unassigned:   { background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" },
  };
  return (
    <span
      style={{
        ...map[status],
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 11,
        fontWeight: 700,
        whiteSpace: "nowrap",
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {status}
    </span>
  );
};

// Simple SVG map placeholder with vehicle pins
const LiveMap: React.FC<{ vehicles: LiveVehicle[] }> = ({ vehicles }) => {
  const statusColor: Record<VehicleStatus, string> = {
    on_time: "#22c55e",
    delayed: "#f59e0b",
    critical: "#ef4444",
  };

  // Normalise lat/lng into SVG coordinate space (rough bounding box of US midwest/south)
  const toSvg = (lat: number, lng: number) => {
    const x = ((lng - -100) / 20) * 600 + 60; // roughly -100 to -80 lng → 60–660
    const y = ((42 - lat) / 8) * 240 + 30;    // roughly 34–42 lat → 30–270
    return { x: Math.max(20, Math.min(760, x)), y: Math.max(20, Math.min(320, y)) };
  };

  return (
    <div
      style={{
        flex: 1,
        borderRadius: 12,
        overflow: "hidden",
        border: "1px solid #e5e7eb",
        position: "relative",
        minHeight: 340,
        background: "#e8f0e9",
      }}
    >
      {/* Map background */}
      <svg
        viewBox="0 0 780 350"
        width="100%"
        height="100%"
        style={{ display: "block" }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Topo-style background */}
        <rect width="780" height="350" fill="#dce8dd" />
        <ellipse cx="390" cy="175" rx="340" ry="155" fill="#c9deca" opacity="0.5" />
        <ellipse cx="300" cy="200" rx="200" ry="100" fill="#b8d1ba" opacity="0.4" />
        {/* Roads */}
        <path d="M60 200 Q200 180 400 195 Q580 210 720 190" stroke="#fff" strokeWidth="3" fill="none" opacity="0.6" />
        <path d="M100 100 Q300 140 500 120 Q650 105 740 130" stroke="#fff" strokeWidth="2" fill="none" opacity="0.4" />
        <path d="M200 50 L220 310" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.3" />
        <path d="M500 30 L490 340" stroke="#fff" strokeWidth="1.5" fill="none" opacity="0.3" />

        {/* City labels */}
        {[
          { label: "Chicago", x: 480, y: 100 },
          { label: "Kansas City", x: 340, y: 180 },
          { label: "Dallas", x: 320, y: 290 },
          { label: "Memphis", x: 510, y: 220 },
        ].map((c) => (
          <text key={c.label} x={c.x} y={c.y} fontSize="11" fill="#7a9e7c" fontFamily="'DM Sans',sans-serif" opacity="0.8">
            {c.label}
          </text>
        ))}

        {/* Vehicle legend */}
        <rect x="590" y="20" width="170" height="78" rx="8" fill="white" opacity="0.9" />
        <text x="603" y="40" fontSize="11" fontWeight="700" fill="#374151" fontFamily="'DM Sans',sans-serif">
          Vehicle Status
        </text>
        {(["on_time", "delayed", "critical"] as VehicleStatus[]).map((s, i) => (
          <g key={s} transform={`translate(603, ${55 + i * 16})`}>
            <circle cx="5" cy="5" r="5" fill={statusColor[s]} />
            <text x="15" y="9" fontSize="11" fill="#374151" fontFamily="'DM Sans',sans-serif">
              {s === "on_time" ? "On Time" : s.charAt(0).toUpperCase() + s.slice(1)}
            </text>
          </g>
        ))}

        {/* Vehicle pins */}
        {vehicles.map((v) => {
          const { x, y } = toSvg(v.lat, v.lng);
          const color = statusColor[v.vehicle_status];
          return (
            <g key={v.id} transform={`translate(${x},${y})`}>
              {/* Pulse ring */}
              <circle cx="0" cy="0" r="18" fill={color} opacity="0.15">
                <animate attributeName="r" values="14;22;14" dur="2.4s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.2;0.05;0.2" dur="2.4s" repeatCount="indefinite" />
              </circle>
              {/* Pin body */}
              <circle cx="0" cy="0" r="14" fill={color} />
              {/* Truck icon */}
              <text x="0" y="5" textAnchor="middle" fontSize="12" fill="#fff">🚛</text>
              {/* Label */}
              <rect x="-22" y="17" width="44" height="16" rx="4" fill="white" opacity="0.92" />
              <text x="0" y="28" textAnchor="middle" fontSize="9" fontWeight="700" fill="#111827" fontFamily="'DM Sans',sans-serif">
                {v.vehicle_code}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
};

// ─── Icons ────────────────────────────────────────────────────────────────────
const Icons = {
  truck: (color = "#fff") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 3v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  check: (color = "#fff") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14" />
      <polyline points="22,4 12,14.01 9,11.01" />
    </svg>
  ),
  alert: (color = "#fff") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  fuel: (color = "#fff") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M3 22V8a2 2 0 012-2h8a2 2 0 012 2v14" />
      <path d="M2 22h14" />
      <path d="M7 10v4" />
      <path d="M15 6l2 2v9a1 1 0 002 0v-4l-3-3" />
    </svg>
  ),
  revenue: (color = "#fff") => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </svg>
  ),
};

// ─── Main Dashboard Page ──────────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [vehicles, setVehicles] = useState<LiveVehicle[]>([]);
  const [loads, setLoads] = useState<DispatchLoad[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [statsRes, vehiclesRes, loadsRes] = await Promise.all([
          supabase.from("dashboard_stats").select("*").order("recorded_at", { ascending: false }).limit(1).single(),
          supabase.from("live_vehicles").select("*"),
          supabase.from("dispatch_loads").select("*").order("created_at", { ascending: false }),
        ]);

        if (statsRes.error) throw statsRes.error;
        if (vehiclesRes.error) throw vehiclesRes.error;
        if (loadsRes.error) throw loadsRes.error;

        setStats(statsRes.data as DashboardStats);
        setVehicles(vehiclesRes.data as LiveVehicle[]);
        setLoads(loadsRes.data as DispatchLoad[]);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();

    // Realtime subscription for live vehicles
    const channel = supabase
      .channel("live_vehicles_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "live_vehicles" }, (payload) => {
        if (payload.eventType === "UPDATE") {
          setVehicles((prev) =>
            prev.map((v) => (v.id === (payload.new as LiveVehicle).id ? (payload.new as LiveVehicle) : v))
          );
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 400,
          color: "#9ca3af",
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Loading dashboard…
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: 400,
          color: "#dc2626",
          fontSize: 14,
          fontFamily: "'DM Sans', sans-serif",
        }}
      >
        Failed to load dashboard: {error ?? "No data found."}
      </div>
    );
  }

  const fmtCurrency = (n: number) =>
    n >= 1_000_000
      ? `$${(n / 1_000_000).toFixed(1)}M`
      : `$${(n / 1_000).toFixed(1)}K`;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* ── Page title ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 24,
        }}
      >
        <h1
          style={{
            fontSize: 26,
            fontWeight: 800,
            color: "#111827",
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          Dashboard
        </h1>
        <div style={{ display: "flex", gap: 8 }}>
          {/* Date chip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 13,
              color: "#374151",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            📅 Last 7 days ▾
          </div>
          {/* Location chip */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              border: "1px solid #e5e7eb",
              borderRadius: 8,
              padding: "7px 14px",
              fontSize: 13,
              color: "#374151",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            📍 All Locations ▾
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        <KpiCard
          title="Active Loads"
          value={stats.active_loads}
          sub={<><Delta value={stats.active_loads_delta_pct} /> from yesterday</>}
          iconBg="#dbeafe"
          icon={Icons.truck("#1d4ed8")}
        />
        <KpiCard
          title="On-time %"
          value={`${stats.on_time_pct}%`}
          sub={<><Delta value={stats.on_time_delta_pct} /> this week</>}
          iconBg="#dcfce7"
          icon={Icons.check("#15803d")}
        />
        <KpiCard
          title="Trucks Available"
          value={stats.trucks_available}
          sub={`of ${stats.trucks_total} total`}
          iconBg="#ede9fe"
          icon={Icons.truck("#6d28d9")}
        />
        <KpiCard
          title="Exceptions"
          value={stats.exceptions}
          sub={<><span style={{ color: "#dc2626", fontWeight: 600 }}>{stats.critical_alerts} critical alerts</span></>}
          iconBg="#fee2e2"
          icon={Icons.alert("#dc2626")}
        />
        <KpiCard
          title="Fuel Cost (MTD)"
          value={fmtCurrency(stats.fuel_cost_mtd)}
          sub={<><Delta value={stats.fuel_cost_delta_pct} /> vs target</>}
          iconBg="#fef3c7"
          icon={Icons.fuel("#92400e")}
        />
        <KpiCard
          title="Revenue (MTD)"
          value={fmtCurrency(stats.revenue_mtd)}
          sub={<><Delta value={stats.revenue_delta_pct} /> vs last month</>}
          iconBg="#d1fae5"
          icon={Icons.revenue("#065f46")}
        />
      </div>

      {/* ── Live Operations + Today's Dispatch ── */}
      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
        {/* Map panel */}
        <div
          style={{
            flex: "1 1 0",
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
            minWidth: 0,
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f3f4f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>
              Live Operations
            </span>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                color: "#22c55e",
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#22c55e",
                  display: "inline-block",
                }}
              />
              Live
            </span>
          </div>
          <div style={{ padding: 16 }}>
            <LiveMap vehicles={vehicles} />
          </div>
        </div>

        {/* Dispatch panel */}
        <div
          style={{
            width: 320,
            flexShrink: 0,
            background: "#fff",
            borderRadius: 14,
            border: "1px solid #e5e7eb",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              padding: "16px 20px",
              borderBottom: "1px solid #f3f4f6",
              fontSize: 15,
              fontWeight: 700,
              color: "#111827",
            }}
          >
            Today's Dispatch
          </div>
          <div style={{ overflowY: "auto", maxHeight: 420 }}>
            {loads.map((load, idx) => (
              <div
                key={load.id}
                style={{
                  padding: "14px 20px",
                  borderBottom: idx < loads.length - 1 ? "1px solid #f3f4f6" : "none",
                  cursor: "pointer",
                  transition: "background 0.1s",
                }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = "#f9fafb")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLDivElement).style.background = "transparent")
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <span
                    style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}
                  >
                    {load.load_number}
                  </span>
                  <LoadStatusBadge status={load.load_status} />
                </div>
                <div style={{ fontSize: 13, color: "#374151", marginBottom: 2 }}>
                  {load.origin} → {load.destination}
                </div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>
                  Driver: {load.driver_name}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
