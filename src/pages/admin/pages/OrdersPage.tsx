// src/components/pages/OrdersPage.tsx
import React, { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

type LoadStatus = "In Transit" | "Assigned" | "Loading" | "Delivered" | "Unassigned";
type Priority = "High" | "Normal" | "Low";

interface Order {
  id: string;
  load_number: string;
  customer_name: string;
  customer_type: string;
  customer_initials: string;
  customer_color: string;
  pickup_location: string;
  drop_location: string;
  eta: string;
  load_status: LoadStatus;
  assigned_driver: string | null;
  truck_id: string | null;
  rate: number;
  margin_pct: number;
  has_pod: boolean;
  priority: Priority;
}

export interface OrdersPageProps {
  headerSearch?: string;
  headerLocation?: string;
}

const LoadStatusBadge: React.FC<{ status: LoadStatus }> = ({ status }) => {
  const map: Record<LoadStatus, React.CSSProperties> = {
    "In Transit": { background: "#dcfce7", color: "#15803d", border: "1px solid #bbf7d0" },
    Assigned:     { background: "#ede9fe", color: "#6d28d9", border: "1px solid #ddd6fe" },
    Loading:      { background: "#fef3c7", color: "#92400e", border: "1px solid #fde68a" },
    Delivered:    { background: "#dbeafe", color: "#1d4ed8", border: "1px solid #bfdbfe" },
    Unassigned:   { background: "#f3f4f6", color: "#6b7280", border: "1px solid #e5e7eb" },
  };
  return <span style={{ ...map[status], padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600, whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif" }}>{status}</span>;
};

const PriorityBadge: React.FC<{ priority: Priority }> = ({ priority }) => {
  const map: Record<Priority, { bg: string; color: string }> = {
    High:   { bg: "#fee2e2", color: "#b91c1c" },
    Normal: { bg: "#f3f4f6", color: "#6b7280" },
    Low:    { bg: "#f0fdf4", color: "#15803d" },
  };
  return <span style={{ background: map[priority].bg, color: map[priority].color, padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>{priority}</span>;
};

const sel: React.CSSProperties = { border: "1px solid #e5e7eb", borderRadius: 7, padding: "6px 10px", fontSize: 13, color: "#374151", background: "#fff", cursor: "pointer", fontFamily: "'DM Sans', sans-serif", outline: "none" };
const cols = "1.4fr 1.8fr 2fr 1.2fr 1.1fr 1.4fr 0.8fr 0.9fr 0.9fr 60px";

const OrdersPage: React.FC<OrdersPageProps> = ({ headerSearch = "", headerLocation = "All Locations" }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [customerFilter, setCustomerFilter] = useState("All Customers");
  const [priorityFilter, setPriorityFilter] = useState("All");

  useEffect(() => {
    supabase.from("orders_loads").select("*").order("load_number").then(({ data, error }) => {
      if (error) setError(error.message); else setOrders(data as Order[]);
      setLoading(false);
    });
  }, []);

  const customers = ["All Customers", ...Array.from(new Set(orders.map(o => o.customer_name)))];

  const filtered = orders.filter(o => {
    if (statusFilter !== "All Status" && o.load_status !== statusFilter) return false;
    if (customerFilter !== "All Customers" && o.customer_name !== customerFilter) return false;
    if (priorityFilter !== "All" && o.priority !== priorityFilter) return false;
    // Header location: match pickup or drop city
    if (headerLocation !== "All Locations") {
      const loc = headerLocation.split(",")[0].trim().toLowerCase();
      if (!o.pickup_location.toLowerCase().includes(loc) && !o.drop_location.toLowerCase().includes(loc)) return false;
    }
    // Header search
    if (headerSearch) {
      const q = headerSearch.toLowerCase();
      const hit = [o.load_number, o.customer_name, o.pickup_location, o.drop_location, o.assigned_driver ?? ""].some(v => v.toLowerCase().includes(q));
      if (!hit) return false;
    }
    return true;
  });

  if (loading) return <div style={{ padding: 48, textAlign: "center", color: "#9ca3af" }}>Loading orders…</div>;
  if (error) return <div style={{ padding: 48, textAlign: "center", color: "#dc2626" }}>Error: {error}</div>;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 24 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: "#111827", margin: 0, letterSpacing: "-0.5px" }}>Orders / Loads</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button style={{ padding: "9px 16px", border: "1px solid #e5e7eb", borderRadius: 8, background: "#fff", cursor: "pointer", fontSize: 13, fontWeight: 500, color: "#374151", fontFamily: "'DM Sans', sans-serif" }}>↑ Import Loads</button>
          <button style={{ padding: "9px 16px", border: "none", borderRadius: 8, background: "#1a6ef5", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "'DM Sans', sans-serif" }}>+ Create New Load</button>
        </div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20, flexWrap: "wrap", padding: "14px 16px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Status:</span><select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={sel}>{["All Status","In Transit","Assigned","Loading","Delivered","Unassigned"].map(o => <option key={o}>{o}</option>)}</select></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Customer:</span><select value={customerFilter} onChange={e => setCustomerFilter(e.target.value)} style={sel}>{customers.map(o => <option key={o}>{o}</option>)}</select></div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={{ fontSize: 13, color: "#374151", fontWeight: 500 }}>Priority:</span><select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)} style={sel}>{["All","High","Normal","Low"].map(o => <option key={o}>{o}</option>)}</select></div>
        {headerLocation !== "All Locations" && <span style={{ fontSize: 12, color: "#1a6ef5", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>📍 Filtering by: {headerLocation}</span>}
        {headerSearch && <span style={{ fontSize: 12, color: "#1a6ef5", fontWeight: 600, fontFamily: "'DM Sans', sans-serif" }}>🔍 "{headerSearch}"</span>}
        <button onClick={() => { setStatusFilter("All Status"); setCustomerFilter("All Customers"); setPriorityFilter("All"); }} style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>✕ Clear All</button>
      </div>

      <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: cols, padding: "12px 20px", borderBottom: "1px solid #e5e7eb", background: "#f9fafb" }}>
          {["Load ID","Customer","Pickup → Drop","ETA","Status","Assigned Driver","Truck","Rate","Margin","POD"].map(col => <span key={col} style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.04em" }}>{col}</span>)}
        </div>
        {filtered.map((order, idx) => (
          <div key={order.id} style={{ display: "grid", gridTemplateColumns: cols, padding: "15px 20px", borderBottom: idx < filtered.length - 1 ? "1px solid #f3f4f6" : "none", alignItems: "center", transition: "background 0.1s" }}
            onMouseEnter={e => ((e.currentTarget as HTMLDivElement).style.background = "#f9fafb")}
            onMouseLeave={e => ((e.currentTarget as HTMLDivElement).style.background = "transparent")}>
            <div>
              <span style={{ fontSize: 13, fontWeight: 600, color: "#1a6ef5", cursor: "pointer", fontFamily: "'DM Sans', sans-serif" }}>{order.load_number}</span>
              <div style={{ marginTop: 3 }}><PriorityBadge priority={order.priority} /></div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: order.customer_color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{order.customer_initials}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{order.customer_name}</div>
                <div style={{ fontSize: 11, color: "#9ca3af" }}>{order.customer_type}</div>
              </div>
            </div>
            <div style={{ fontSize: 13, color: "#374151" }}><span style={{ fontWeight: 500 }}>{order.pickup_location}</span><span style={{ color: "#9ca3af", margin: "0 4px" }}>→</span><span style={{ fontWeight: 500 }}>{order.drop_location}</span></div>
            <div style={{ fontSize: 13, color: "#374151" }}>{order.eta}</div>
            <LoadStatusBadge status={order.load_status} />
            <div style={{ fontSize: 13, color: order.assigned_driver ? "#111827" : "#9ca3af", fontWeight: order.assigned_driver ? 500 : 400 }}>{order.assigned_driver ?? "Not assigned"}</div>
            <div style={{ fontSize: 13, color: order.truck_id ? "#374151" : "#9ca3af" }}>{order.truck_id ?? "—"}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>${order.rate.toLocaleString()}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#22c55e" }}>{order.margin_pct}%</div>
            <div style={{ display: "flex", justifyContent: "center" }}>
              {order.has_pod
                ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/><polyline points="9,15 11,17 15,13"/></svg>
                : <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>}
            </div>
          </div>
        ))}
        {!filtered.length && <div style={{ padding: 48, textAlign: "center", color: "#9ca3af", fontSize: 14 }}>No orders match the current filters.</div>}
      </div>

      <div style={{ display: "flex", gap: 24, marginTop: 16, padding: "12px 20px", background: "#f9fafb", borderRadius: 10, border: "1px solid #e5e7eb" }}>
        {[
          { label: "Showing", value: `${filtered.length} of ${orders.length} loads` },
          { label: "Total Revenue", value: `$${filtered.reduce((a, o) => a + o.rate, 0).toLocaleString()}` },
          { label: "Avg Margin", value: filtered.length ? `${(filtered.reduce((a, o) => a + o.margin_pct, 0) / filtered.length).toFixed(1)}%` : "—" },
        ].map(({ label, value }) => (
          <div key={label} style={{ display: "flex", gap: 6, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#9ca3af", fontFamily: "'DM Sans', sans-serif" }}>{label}:</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111827", fontFamily: "'DM Sans', sans-serif" }}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
