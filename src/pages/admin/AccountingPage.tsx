// src/components/pages/AccountingPage.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL as string,
  import.meta.env.VITE_SUPABASE_ANON_KEY as string
);

// ─── Types ────────────────────────────────────────────────────
type EntryType = "income" | "expense";
type FilterType = "both" | "income" | "expense";

interface Entry {
  id: string;
  entry_date: string;
  type: EntryType;
  details: string;
  amount: number;
  created_at: string;
}

// ─── Circular progress chart ──────────────────────────────────
const CircularStat: React.FC<{
  value: number;
  max: number;
  label: string;
  color: string;
  bg: string;
  prefix?: string;
}> = ({ value, max, label, color, bg, prefix = "£" }) => {
  const pct  = max > 0 ? Math.min(value / max, 1) : 0;
  const r    = 54;
  const circ = 2 * Math.PI * r;
  const dash = circ * pct;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
      <svg width="130" height="130" style={{ flexShrink: 0 }}>
        {/* Track */}
        <circle cx="65" cy="65" r={r} fill="none" stroke="#1e293b" strokeWidth="10" />
        {/* Progress */}
        <circle
          cx="65" cy="65" r={r} fill="none"
          stroke={color} strokeWidth="10"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          strokeLinecap="round"
          style={{ transition: "stroke-dasharray 0.8s ease" }}
        />
        {/* Glow */}
        <circle
          cx="65" cy="65" r={r} fill="none"
          stroke={color} strokeWidth="3"
          strokeDasharray={`${dash} ${circ - dash}`}
          strokeDashoffset={circ / 4}
          opacity="0.3"
        />
        <text x="65" y="60" textAnchor="middle" fill="#f8fafc" fontSize="13" fontFamily="'DM Mono', monospace" fontWeight="600">
          {prefix}{value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value.toFixed(0)}
        </text>
        <text x="65" y="77" textAnchor="middle" fill="#64748b" fontSize="10" fontFamily="'DM Sans', sans-serif">
          {Math.round(pct * 100)}% of target
        </text>
      </svg>
      <div>
        <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4, fontFamily: "'DM Sans', sans-serif" }}>
          {label}
        </div>
        <div style={{ fontSize: 28, fontWeight: 800, color, fontFamily: "'DM Mono', monospace", letterSpacing: "-1px" }}>
          {prefix}{value.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>
    </div>
  );
};

// ─── Input styles ─────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  background: "#0f172a",
  border: "1px solid #334155",
  borderRadius: 8,
  color: "#f1f5f9",
  padding: "8px 12px",
  fontSize: 13,
  fontFamily: "'DM Sans', sans-serif",
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

// ─── Main Page ────────────────────────────────────────────────
const AccountingPage: React.FC = () => {
  const [entries, setEntries]       = useState<Entry[]>([]);
  const [loading, setLoading]       = useState(true);
  const [filter, setFilter]         = useState<FilterType>("both");
  const [dateFrom, setDateFrom]     = useState("");
  const [dateTo, setDateTo]         = useState("");
  const [detailsSearch, setDetailsSearch] = useState("");

  // New entry form
  const today = new Date().toISOString().slice(0, 10);
  const [newDate, setNewDate]       = useState(today);
  const [newType, setNewType]       = useState<EntryType>("income");
  const [newDetails, setNewDetails] = useState("");
  const [newAmount, setNewAmount]   = useState("");
  const [saving, setSaving]         = useState(false);
  const [saveError, setSaveError]   = useState("");

  const tableRef = useRef<HTMLDivElement>(null);

  // ── Load entries ──────────────────────────────────────────
  const fetchEntries = async () => {
    const { data } = await supabase
      .from("accounting_entries")
      .select("*")
      .order("entry_date", { ascending: true })
      .order("created_at", { ascending: true });
    if (data) setEntries(data as Entry[]);
    setLoading(false);
  };

  useEffect(() => { fetchEntries(); }, []);

  // ── Stats (current month) ─────────────────────────────────
  const now        = new Date();
  const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  const monthEnd   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-31`;

  const monthlyIncome = useMemo(() =>
    entries.filter(e => e.type === "income" && e.entry_date >= monthStart && e.entry_date <= monthEnd)
           .reduce((a, e) => a + Number(e.amount), 0),
    [entries]
  );

  const monthlyExpense = useMemo(() =>
    entries.filter(e => e.type === "expense" && e.entry_date >= monthStart && e.entry_date <= monthEnd)
           .reduce((a, e) => a + Number(e.amount), 0),
    [entries]
  );

  const totalIncome  = useMemo(() => entries.filter(e => e.type === "income").reduce((a, e)  => a + Number(e.amount), 0), [entries]);
  const totalExpense = useMemo(() => entries.filter(e => e.type === "expense").reduce((a, e) => a + Number(e.amount), 0), [entries]);
  const netProfit    = totalIncome - totalExpense;

  // ── Filtered + displayed entries ─────────────────────────
  const filtered = useMemo(() => {
    return entries.filter(e => {
      if (filter === "income"  && e.type !== "income")  return false;
      if (filter === "expense" && e.type !== "expense") return false;
      if (dateFrom && e.entry_date < dateFrom) return false;
      if (dateTo   && e.entry_date > dateTo)   return false;
      if (detailsSearch && !e.details.toLowerCase().includes(detailsSearch.toLowerCase())) return false;
      return true;
    });
  }, [entries, filter, dateFrom, dateTo, detailsSearch]);

  // Always show last 10 entries (bottom of list)
  const displayed = filtered.slice(-10);

  // ── Save new entry ────────────────────────────────────────
  const handleSave = async () => {
    if (!newDetails.trim() || !newAmount || isNaN(Number(newAmount)) || Number(newAmount) <= 0) {
      setSaveError("Please fill in all fields with valid values.");
      return;
    }
    setSaving(true);
    setSaveError("");
    const { error } = await supabase.from("accounting_entries").insert({
      entry_date: newDate,
      type:       newType,
      details:    newDetails.trim(),
      amount:     Number(parseFloat(newAmount).toFixed(2)),
    });
    setSaving(false);
    if (error) {
      setSaveError(error.message);
    } else {
      setNewDetails("");
      setNewAmount("");
      setNewDate(today);
      await fetchEntries();
      // Scroll table to bottom
      setTimeout(() => {
        if (tableRef.current) tableRef.current.scrollTop = tableRef.current.scrollHeight;
      }, 100);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this entry?")) return;
    await supabase.from("accounting_entries").delete().eq("id", id);
    await fetchEntries();
  };

  // ── Filter button style ───────────────────────────────────
  const filterBtn = (f: FilterType, color: string, dimColor: string, label: string) => ({
    padding: "9px 22px",
    borderRadius: 10,
    border: "none",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 13,
    fontWeight: 700,
    color: "#fff",
    background: filter === f ? color : dimColor,
    boxShadow: filter === f ? `0 0 16px ${color}66` : "none",
    transition: "all 0.2s",
    letterSpacing: "0.03em",
  } as React.CSSProperties);

  const monthName = now.toLocaleString("en-GB", { month: "long", year: "numeric" });

  // ── Render ────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0f172a 50%, #0c1628 100%)",
      fontFamily: "'DM Sans', sans-serif",
      color: "#f1f5f9",
      padding: "32px 32px",
    }}>

      {/* Google Fonts */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&family=DM+Mono:wght@400;500;600&display=swap');
        * { box-sizing: border-box; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(1); cursor: pointer; }
        select option { background: #1e293b; color: #f1f5f9; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: #0f172a; }
        ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        tr:hover td { background: #f0f9ff !important; }
      `}</style>

      {/* ── Page title ── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 34, fontWeight: 800, margin: 0, letterSpacing: "-1px", color: "#f8fafc" }}>
          Accounts
        </h1>
        <p style={{ margin: "4px 0 0", color: "#475569", fontSize: 14 }}>
          Financial overview — {monthName}
        </p>
      </div>

      {/* ── Stats row ── */}
      <div style={{ display: "flex", gap: 20, marginBottom: 28, flexWrap: "wrap" }}>

        {/* Income circle */}
        <div style={{ flex: "1 1 280px", background: "#0f172a", borderRadius: 18, padding: "24px 28px", border: "1px solid #1e293b" }}>
          <CircularStat
            value={monthlyIncome}
            max={Math.max(monthlyIncome, monthlyExpense, 1) * 1.2}
            label={`Total Income — ${monthName}`}
            color="#22c55e"
            bg="#052e16"
          />
        </div>

        {/* Expense circle */}
        <div style={{ flex: "1 1 280px", background: "#0f172a", borderRadius: 18, padding: "24px 28px", border: "1px solid #1e293b" }}>
          <CircularStat
            value={monthlyExpense}
            max={Math.max(monthlyIncome, monthlyExpense, 1) * 1.2}
            label={`Total Expenses — ${monthName}`}
            color="#ef4444"
            bg="#450a0a"
          />
        </div>

        {/* Net profit + all-time */}
        <div style={{ flex: "1 1 280px", background: "#0f172a", borderRadius: 18, padding: "24px 28px", border: "1px solid #1e293b", display: "flex", flexDirection: "column", justifyContent: "center", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Net Profit (Month)</div>
            <div style={{ fontSize: 30, fontWeight: 800, fontFamily: "'DM Mono', monospace", letterSpacing: "-1px", color: (monthlyIncome - monthlyExpense) >= 0 ? "#22c55e" : "#ef4444" }}>
              £{(monthlyIncome - monthlyExpense).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div style={{ height: 1, background: "#1e293b" }} />
          <div>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 4 }}>Net Profit (All Time)</div>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'DM Mono', monospace", letterSpacing: "-1px", color: netProfit >= 0 ? "#22c55e" : "#ef4444" }}>
              £{netProfit.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>

      {/* ── Main table card ── */}
      <div style={{ background: "#0f172a", borderRadius: 18, border: "1px solid #1e293b", overflow: "hidden" }}>

        {/* Table header bar */}
        <div style={{ padding: "20px 24px", borderBottom: "1px solid #1e293b", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#f8fafc", letterSpacing: "-0.3px" }}>
            Ledger — showing last {displayed.length} of {filtered.length} entries
          </div>

          {/* Filter buttons */}
          <div style={{ display: "flex", gap: 8 }}>
            <button style={filterBtn("income",  "#16a34a", "#14532d55", "● Income")}  onClick={() => setFilter("income")}>● Income</button>
            <button style={filterBtn("expense", "#dc2626", "#7f1d1d55", "● Expense")} onClick={() => setFilter("expense")}>● Expense</button>
            <button style={filterBtn("both",    "#2563eb", "#1e3a8a55", "◉ Both")}    onClick={() => setFilter("both")}>◉ Both</button>
          </div>
        </div>

        {/* Search/filter bar */}
        <div style={{ padding: "14px 24px", borderBottom: "1px solid #1e293b", display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center", background: "#080e1a" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>From:</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} style={{ ...inputStyle, width: 150 }} />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 12, color: "#64748b", whiteSpace: "nowrap" }}>To:</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} style={{ ...inputStyle, width: 150 }} />
          </div>
          <div style={{ flex: 1, minWidth: 180 }}>
            <input
              type="text"
              placeholder="Search details…"
              value={detailsSearch}
              onChange={e => setDetailsSearch(e.target.value)}
              style={inputStyle}
            />
          </div>
          {(dateFrom || dateTo || detailsSearch) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); setDetailsSearch(""); }}
              style={{ background: "none", border: "1px solid #334155", color: "#94a3b8", borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontSize: 12, fontFamily: "'DM Sans', sans-serif" }}
            >
              ✕ Clear
            </button>
          )}
        </div>

        {/* Table */}
        <div ref={tableRef} style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                {["Date", "Type", "Details", "Amount", ""].map(h => (
                  <th key={h} style={{
                    padding: "12px 16px", textAlign: "left",
                    fontSize: 11, fontWeight: 700, color: "#64748b",
                    textTransform: "uppercase", letterSpacing: "0.08em",
                    borderBottom: "2px solid #e2e8f0", whiteSpace: "nowrap",
                    fontFamily: "'DM Sans', sans-serif",
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Loading…</td></tr>
              ) : displayed.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: 48, textAlign: "center", color: "#94a3b8", fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>No entries match your filters.</td></tr>
              ) : (
                displayed.map((entry, idx) => (
                  <tr key={entry.id} style={{ borderBottom: "1px solid #f1f5f9" }}>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#374151", whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace" }}>
                      {new Date(entry.entry_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 5,
                        padding: "3px 10px", borderRadius: 20, fontSize: 11, fontWeight: 700,
                        fontFamily: "'DM Sans', sans-serif",
                        background: entry.type === "income" ? "#dcfce7" : "#fee2e2",
                        color: entry.type === "income" ? "#15803d" : "#b91c1c",
                      }}>
                        <span style={{ fontSize: 8 }}>●</span>
                        {entry.type.charAt(0).toUpperCase() + entry.type.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 13, color: "#111827", fontFamily: "'DM Sans', sans-serif", maxWidth: 300 }}>
                      {entry.details}
                    </td>
                    <td style={{ padding: "13px 16px", fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", fontFamily: "'DM Mono', monospace", color: entry.type === "income" ? "#15803d" : "#b91c1c" }}>
                      {entry.type === "income" ? "+" : "-"}£{Number(entry.amount).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ padding: "13px 16px" }}>
                      <button
                        onClick={() => handleDelete(entry.id)}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#cbd5e1", fontSize: 16, padding: "2px 6px", borderRadius: 4, transition: "color 0.15s" }}
                        onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"}
                        onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.color = "#cbd5e1"}
                        title="Delete entry"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))
              )}

              {/* ── New entry row ── */}
              <tr style={{ background: "#f8fafc", borderTop: "2px solid #e2e8f0" }}>
                {/* Date */}
                <td style={{ padding: "10px 16px" }}>
                  <input
                    type="date"
                    value={newDate}
                    onChange={e => setNewDate(e.target.value)}
                    style={{ ...inputStyle, background: "#fff", border: "1px solid #cbd5e1", color: "#111827", width: 140 }}
                  />
                </td>
                {/* Type dropdown */}
                <td style={{ padding: "10px 16px" }}>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value as EntryType)}
                    style={{
                      ...inputStyle,
                      background: newType === "income" ? "#dcfce7" : "#fee2e2",
                      color: newType === "income" ? "#15803d" : "#b91c1c",
                      border: `1px solid ${newType === "income" ? "#86efac" : "#fca5a5"}`,
                      fontWeight: 700, width: 130, cursor: "pointer",
                    }}
                  >
                    <option value="income">● Income</option>
                    <option value="expense">● Expense</option>
                  </select>
                </td>
                {/* Details */}
                <td style={{ padding: "10px 16px" }}>
                  <input
                    type="text"
                    placeholder="Description…"
                    value={newDetails}
                    onChange={e => setNewDetails(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSave()}
                    style={{ ...inputStyle, background: "#fff", border: "1px solid #cbd5e1", color: "#111827" }}
                  />
                </td>
                {/* Amount */}
                <td style={{ padding: "10px 16px" }}>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && handleSave()}
                    min="0"
                    step="0.01"
                    style={{ ...inputStyle, background: "#fff", border: "1px solid #cbd5e1", color: "#111827", width: 120 }}
                  />
                </td>
                {/* Save */}
                <td style={{ padding: "10px 16px" }}>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 8, border: "none",
                      background: newType === "income" ? "#16a34a" : "#dc2626",
                      color: "#fff", fontWeight: 700, fontSize: 13,
                      cursor: saving ? "not-allowed" : "pointer",
                      fontFamily: "'DM Sans', sans-serif",
                      whiteSpace: "nowrap",
                      boxShadow: `0 0 12px ${newType === "income" ? "#16a34a66" : "#dc262666"}`,
                      transition: "all 0.2s",
                    }}
                  >
                    {saving ? "…" : newType === "income" ? "+ Add Income" : "+ Add Expense"}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Error */}
        {saveError && (
          <div style={{ padding: "10px 24px", background: "#450a0a", color: "#fca5a5", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>
            {saveError}
          </div>
        )}

        {/* Footer summary */}
        <div style={{ padding: "14px 24px", borderTop: "1px solid #1e293b", display: "flex", gap: 32, flexWrap: "wrap", alignItems: "center", background: "#080e1a" }}>
          {[
            { label: "Filtered Income",  value: filtered.filter(e => e.type === "income").reduce((a, e) => a + Number(e.amount), 0),  color: "#22c55e" },
            { label: "Filtered Expenses",value: filtered.filter(e => e.type === "expense").reduce((a, e) => a + Number(e.amount), 0), color: "#ef4444" },
            { label: "Filtered Net",     value: filtered.filter(e => e.type === "income").reduce((a, e) => a + Number(e.amount), 0) - filtered.filter(e => e.type === "expense").reduce((a, e) => a + Number(e.amount), 0), color: "#60a5fa" },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span style={{ fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>{label}</span>
              <span style={{ fontSize: 16, fontWeight: 700, color, fontFamily: "'DM Mono', monospace" }}>
                {value >= 0 ? "" : "-"}£{Math.abs(value).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))}
          <div style={{ marginLeft: "auto", fontSize: 12, color: "#334155" }}>
            Showing last {displayed.length} entries • {filtered.length} total matches
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountingPage;
