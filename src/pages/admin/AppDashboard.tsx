// src/components/pages/DashboardPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import supabase from "../../supabase";

// ─── Types ────────────────────────────────────────────────────
type Status = "unassigned" | "pending" | "ready" | "collected";

type Job = {
  id: string;
  buyer_name: string;
  telephone: string;
  job_description: string;
  date_booked: string;
  worker_name: string | null;
  status: Status;
  price: number | null;
  date_collected: string | null;
  created_at: string;
};

// ─── Dark theme palette (matches JobsPage / AppDashboard) ──────
const T = {
  panel: "#18181b",
  panelBorder: "#2a2a2e",
  textPrimary: "#f4f4f5",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",
  accentBlue: "#5b8def",
};

const STATUS_STYLE: Record<Status, { label: string; color: string; bg: string }> = {
  unassigned: { label: "Unassigned", color: "#d4d4d8", bg: "#27272a" },
  pending:    { label: "Pending",    color: "#fdba74", bg: "#3a2a12" },
  ready:      { label: "Ready",      color: "#93c5fd", bg: "#12233a" },
  collected:  { label: "Collected",  color: "#5eead4", bg: "#0f2e2b" },
};

// ─── Helpers ──────────────────────────────────────────────────
const fmtMoney = (n: number) => `£${n.toFixed(2)}`;

const fmtDate = (d: string | null) => {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const isToday = (d: string | null) => {
  if (!d) return false;
  return d === new Date().toISOString().slice(0, 10);
};

const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");

const AVATAR_COLORS = ["#5b8def", "#a78bfa", "#2dd4bf", "#f87171", "#fb923c", "#e5e7eb", "#38bdf8"];
const avatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// ─── Component ────────────────────────────────────────────────
const DashboardPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("jobs").select("*").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setJobs(data as Job[]);
        setLoading(false);
      });
  }, []);

  const stats = useMemo(() => {
    const unassigned = jobs.filter((j) => j.status === "unassigned").length;
    const pending = jobs.filter((j) => j.status === "pending").length;
    const ready = jobs.filter((j) => j.status === "ready").length;
    const collected = jobs.filter((j) => j.status === "collected").length;
    const bookedToday = jobs.filter((j) => isToday(j.date_booked)).length;
    const collectedToday = jobs.filter((j) => isToday(j.date_collected)).length;
    const revenue = jobs.reduce((sum, j) => sum + (j.price ?? 0), 0);
    return { total: jobs.length, unassigned, pending, ready, collected, bookedToday, collectedToday, revenue };
  }, [jobs]);

  const recentJobs = jobs.slice(0, 8);

  if (loading) {
    return (
      <div style={{ padding: 48, textAlign: "center", color: T.textMuted, fontFamily: "'DM Sans', sans-serif" }}>
        Loading dashboard…
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: T.accentBlue, margin: "0 0 22px" }}>Dashboard</h1>

      {/* Top stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 14 }}>
        <StatCard label="Total Jobs" value={stats.total} />
        <StatCard label="Booked Today" value={stats.bookedToday} />
        <StatCard label="Collected Today" value={stats.collectedToday} />
        <StatCard label="Revenue (all time)" value={fmtMoney(stats.revenue)} highlight />
      </div>

      {/* Status breakdown row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14, marginBottom: 26 }}>
        <StatCard label="Unassigned" value={stats.unassigned} dot={STATUS_STYLE.unassigned.color} />
        <StatCard label="Pending" value={stats.pending} dot={STATUS_STYLE.pending.color} />
        <StatCard label="Ready for Collection" value={stats.ready} dot={STATUS_STYLE.ready.color} />
        <StatCard label="Collected" value={stats.collected} dot={STATUS_STYLE.collected.color} />
      </div>

      {/* Recent jobs */}
      <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10, overflow: "hidden" }}>
        <div style={{ padding: "14px 16px", borderBottom: `1px solid ${T.panelBorder}`, fontSize: 14, fontWeight: 700, color: T.textPrimary }}>
          Recent Jobs
        </div>

        {recentJobs.length === 0 && (
          <div style={{ padding: 28, textAlign: "center", color: T.textMuted, fontSize: 13 }}>No jobs yet.</div>
        )}

        {recentJobs.map((job) => {
          const s = STATUS_STYLE[job.status];
          return (
            <div key={job.id} style={{
              display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
              borderBottom: `1px solid ${T.panelBorder}`,
            }}>
              <div style={{
                width: 30, height: 30, borderRadius: "50%", flexShrink: 0,
                background: job.worker_name ? avatarColor(job.worker_name) : "#3f3f46",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#0d0d0f", fontSize: 11, fontWeight: 700,
              }}>
                {job.worker_name ? initials(job.worker_name) : "?"}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: T.textPrimary, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {job.job_description}
                </div>
                <div style={{ fontSize: 11.5, color: T.textSecondary }}>
                  {job.buyer_name} · Booked {fmtDate(job.date_booked)}
                </div>
              </div>

              <span style={{
                padding: "3px 10px", borderRadius: 999, fontSize: 11, fontWeight: 700,
                background: s.bg, color: s.color, flexShrink: 0,
              }}>
                {s.label}
              </span>

              <div style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, width: 64, textAlign: "right", flexShrink: 0 }}>
                {job.price !== null ? fmtMoney(job.price) : "—"}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Stat card ──────────────────────────────────────────────────
const StatCard: React.FC<{ label: string; value: string | number; dot?: string; highlight?: boolean }> = ({ label, value, dot, highlight }) => (
  <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10, padding: "16px 18px" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
      {dot && <span style={{ width: 7, height: 7, borderRadius: "50%", background: dot, flexShrink: 0 }} />}
      <span style={{ fontSize: 12, color: T.textSecondary }}>{label}</span>
    </div>
    <div style={{ fontSize: 22, fontWeight: 800, color: highlight ? T.accentBlue : T.textPrimary }}>{value}</div>
  </div>
);

export default DashboardPage;
