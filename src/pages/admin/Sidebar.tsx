// ─── PASTE THIS ENTIRE BLOCK INTO DashBoard.tsx ───────────────
// Replace your existing Sidebar / NavItem / aside code with this.
// It is fully self-contained — no imports needed beyond React.

type MenuKey =
  | "dashboard"
  | "orders"
  | "dispatch"
  | "fleet"
  | "drivers"
  | "routes"
  | "warehouses"
  | "proof"
  | "billing"
  | "reports"
  | "ai"
  | "settings";

const SIDEBAR_ITEMS: { key: MenuKey; label: string; icon: React.ReactNode }[] = [
  {
    key: "dashboard",
    label: "Dashboard",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: "block" }}>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    key: "orders",
    label: "Orders / Loads",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: "block" }}>
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <line x1="9" y1="12" x2="15" y2="12" />
        <line x1="9" y1="16" x2="13" y2="16" />
      </svg>
    ),
  },
  {
    key: "dispatch",
    label: "Dispatch Board",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: "block" }}>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </svg>
    ),
  },
  {
    key: "fleet",
    label: "Fleet",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: "block" }}>
        <rect x="1" y="3" width="15" height="13" rx="1" />
        <path d="M16 8h4l3 3v5h-7V8z" />
        <circle cx="5.5" cy="18.5" r="2.5" />
        <circle cx="18.5" cy="18.5" r="2.5" />
      </svg>
    ),
  },
  {
    key: "drivers",
    label: "Drivers",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: "block" }}>
        <circle cx="12" cy="8" r="4" />
        <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
      </svg>
    ),
  },
  {
    key: "routes",
    label: "Routes & Tracking",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: "block" }}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 2a14.5 14.5 0 000 20M2 12h20" />
      </svg>
    ),
  },
  {
    key: "warehouses",
    label: "Warehouses / Hubs",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: "block" }}>
        <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
        <polyline points="9,22 9,12 15,12 15,22" />
      </svg>
    ),
  },
  {
    key: "proof",
    label: "Proof of Delivery",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: "block" }}>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
        <polyline points="14,2 14,8 20,8" />
        <polyline points="9,15 11,17 15,13" />
      </svg>
    ),
  },
  {
    key: "billing",
    label: "Billing & Invoices",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: "block" }}>
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
      </svg>
    ),
  },
  {
    key: "reports",
    label: "Reports",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: "block" }}>
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  },
  {
    key: "ai",
    label: "AI Ops Assistant",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: "block" }}>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </svg>
    ),
  },
  {
    key: "settings",
    label: "Settings",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ display: "block" }}>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

// The sidebar component — replaces your existing <Sidebar> or <aside> block
const AppSidebar: React.FC<{
  active: MenuKey;
  onSelect: (k: MenuKey) => void;
}> = ({ active, onSelect }) => (
  <aside
    style={{
      // Fixed width — never shrink or grow
      width: 232,
      minWidth: 232,
      maxWidth: 232,
      height: "100vh",
      overflowY: "auto",
      flexShrink: 0,
      // Colours
      background: "#ffffff",
      borderRight: "1px solid #e5e7eb",
      // Children stack vertically
      display: "flex",
      flexDirection: "column",
      boxSizing: "border-box",
    }}
  >
    {/* ── Logo ── */}
    <div
      style={{
        height: 56,
        minHeight: 56,
        display: "flex",
        alignItems: "center",
        paddingLeft: 20,
        borderBottom: "1px solid #f3f4f6",
        flexShrink: 0,
        boxSizing: "border-box",
      }}
    >
      <span
        style={{
          fontSize: 21,
          fontWeight: 800,
          fontFamily: "'DM Sans', sans-serif",
          background: "linear-gradient(135deg, #1a6ef5 0%, #06b6d4 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          letterSpacing: "-0.3px",
        }}
      >
        FleetFlow
      </span>
    </div>

    {/* ── Nav ── */}
    {/*
      No gap/padding tricks here — each button is full-width with identical
      padding so every icon and label starts at the exact same x coordinate.
    */}
    <nav
      style={{
        flex: 1,
        padding: "8px 10px 16px 10px",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        boxSizing: "border-box",
      }}
    >
      {SIDEBAR_ITEMS.map(({ key, label, icon }) => {
        const on = active === key;
        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            style={{
              // ── CRITICAL: all these must be identical for every item ──
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
              gap: 10,
              width: "100%",
              boxSizing: "border-box",
              padding: "9px 12px",   // same on every single item, no exceptions
              marginBottom: 1,
              // ── appearance ──
              border: "none",
              borderRadius: 8,
              background: on ? "#1a6ef5" : "transparent",
              color: on ? "#ffffff" : "#374151",
              cursor: "pointer",
              // ── text ──
              fontFamily: "'DM Sans', sans-serif",
              fontSize: 13.5,
              fontWeight: on ? 600 : 400,
              textAlign: "left",
              whiteSpace: "nowrap",
              lineHeight: "20px",
              // ── misc ──
              outline: "none",
              transition: "background 0.12s, color 0.12s",
              WebkitAppearance: "none",
              MozAppearance: "none",
              appearance: "none",
            }}
            onMouseEnter={e => {
              if (!on) (e.currentTarget as HTMLButtonElement).style.background = "#f3f4f6";
            }}
            onMouseLeave={e => {
              if (!on) (e.currentTarget as HTMLButtonElement).style.background = "transparent";
            }}
          >
            {/*
              Fixed 16×16 icon box — this is what keeps every label
              starting at the same x position regardless of icon complexity.
            */}
            <span
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: 16,
                height: 16,
                minWidth: 16,
                flexShrink: 0,
                opacity: on ? 1 : 0.55,
              }}
            >
              {icon}
            </span>
            <span style={{ flex: 1 }}>{label}</span>
          </button>
        );
      })}
    </nav>
  </aside>
);

// ─── END OF PASTE BLOCK ───────────────────────────────────────
// In your JSX, replace <Sidebar active={active} onSelect={setActive} />
// with:  <AppSidebar active={active} onSelect={setActive} />
