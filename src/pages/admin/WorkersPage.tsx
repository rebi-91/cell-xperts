// src/components/WorkersPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import supabase from "../../supabase";

type Job = {
  worker_name: string | null;
  date_collected: string | null;
  price: number | null;
};

interface WorkersPageProps {
  headerSearch?: string;
}

// ─── Dark theme palette (matches JobsPage / AppDashboard) ──────
const T = {
  panel: "#18181b",
  panelBorder: "#2a2a2e",
  textPrimary: "#f4f4f5",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",
  accentBlue: "#5b8def",
  rowHover: "#1f1f22",
  headerBg: "#151517",
};

const WorkersPage: React.FC<WorkersPageProps> = ({ headerSearch = "" }) => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("jobs").select("worker_name, date_collected, price").then(({ data, error }) => {
      if (!error && data) setJobs(data as Job[]);
      setLoading(false);
    });
  }, []);

  const workerStats = useMemo(() => {
    const map = new Map<string, { total: number; collected: number; revenue: number }>();
    jobs.forEach((j) => {
      if (!j.worker_name) return; // skip unassigned jobs
      const entry = map.get(j.worker_name) ?? { total: 0, collected: 0, revenue: 0 };
      entry.total += 1;
      if (j.date_collected) entry.collected += 1;
      entry.revenue += j.price ?? 0;
      map.set(j.worker_name, entry);
    });
    const q = headerSearch.trim().toLowerCase();
    return Array.from(map.entries())
      .filter(([name]) => !q || name.toLowerCase().includes(q))
      .sort((a, b) => b[1].total - a[1].total);
  }, [jobs, headerSearch]);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: T.accentBlue, margin: "0 0 22px" }}>Workers</h1>

      <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13.5 }}>
          <thead>
            <tr style={{ background: T.headerBg, textAlign: "left" }}>
              {["Worker", "Jobs Handled", "Jobs Collected", "Revenue Generated"].map((h) => (
                <th key={h} style={{ padding: "10px 14px", color: T.textSecondary, fontWeight: 600, fontSize: 12, borderBottom: `1px solid ${T.panelBorder}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: T.textMuted }}>Loading…</td></tr>}
            {!loading && workerStats.length === 0 && (
              <tr><td colSpan={4} style={{ padding: 24, textAlign: "center", color: T.textMuted }}>No workers found.</td></tr>
            )}
            {workerStats.map(([name, s]) => (
              <tr key={name} style={{ borderBottom: `1px solid ${T.panelBorder}` }}>
                <td style={{ padding: "10px 14px", color: T.textPrimary, fontWeight: 600 }}>{name}</td>
                <td style={{ padding: "10px 14px", color: "#d4d4d8" }}>{s.total}</td>
                <td style={{ padding: "10px 14px", color: "#d4d4d8" }}>{s.collected}</td>
                <td style={{ padding: "10px 14px", color: "#d4d4d8" }}>£{s.revenue.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default WorkersPage;
