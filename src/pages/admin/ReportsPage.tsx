// src/components/ReportsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import supabase from "../../supabase";

type Job = {
  date_booked: string;
  date_collected: string | null;
  price: number | null;
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

const ReportsPage: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("jobs").select("date_booked, date_collected, price").then(({ data, error }) => {
      if (!error && data) setJobs(data as Job[]);
      setLoading(false);
    });
  }, []);

  const stats = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    const bookedToday = jobs.filter((j) => j.date_booked === today).length;
    const collectedToday = jobs.filter((j) => j.date_collected === today).length;
    const totalRevenue = jobs.reduce((sum, j) => sum + (j.price ?? 0), 0);
    const outstanding = jobs.filter((j) => !j.date_collected).length;
    return { bookedToday, collectedToday, totalRevenue, outstanding };
  }, [jobs]);

  if (loading) {
    return <div style={{ padding: 48, textAlign: "center", color: T.textMuted, fontFamily: "'DM Sans', sans-serif" }}>Loading report…</div>;
  }

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <h1 style={{ fontSize: 26, fontWeight: 800, color: T.accentBlue, margin: "0 0 22px" }}>Reports</h1>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
        {[
          { label: "Booked Today", value: stats.bookedToday },
          { label: "Collected Today", value: stats.collectedToday },
          { label: "Jobs Outstanding", value: stats.outstanding },
          { label: "Total Revenue", value: `£${stats.totalRevenue.toFixed(2)}` },
        ].map((c) => (
          <div key={c.label} style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10, padding: "16px 18px" }}>
            <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary }}>{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
