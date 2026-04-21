// import React, { useMemo, useState } from "react";
// import type { AgeBand, Answers, ConditionKey, Pathway, UiKit } from "./types";

// // pathways
// import { utiPathway } from "./uti";
// import { impetigoPathway } from "./impetigo";
// import { insectBitePathway } from "./insectBite";
// import { soreThroatPathway } from "./soreThroat";
// import { sinusitisPathway } from "./sinusitis";
// import { shinglesPathway } from "./shingles";
// import { aomPathway } from "./aom";

// type Step = 1 | 2 | 3;

// const COLORS = {
//   bg: "#000000",
//   card: "#141414",
//   card2: "#1b1b1b",
//   border: "#2a2a2a",
//   text: "#ffffff",
//   muted: "#bdbdbd",
//   blue: "#1d4ed8",
//   red: "#dc2626",
//   blackBtn: "#0b0b0b",
// };

// const AGE_BANDS: { value: AgeBand; label: string }[] = [
//   { value: "<1", label: "<1 year" },
//   { value: "1-4", label: "1–4 years" },
//   { value: "5-11", label: "5–11 years" },
//   { value: "12-15", label: "12–15 years" },
//   { value: "16-64", label: "16–64 years" },
//   { value: ">64", label: ">64 years" },
// ];

// // ---------- UI ----------
// function Section({
//   title,
//   children,
//   centerContent,
// }: {
//   title: string;
//   children: React.ReactNode;
//   centerContent?: boolean;
// }) {
//   return (
//     <div
//       style={{
//         background: COLORS.card,
//         border: `1px solid ${COLORS.border}`,
//         borderRadius: 18,
//         padding: 18,
//         minHeight: 540,
//         display: "flex",
//         flexDirection: "column",
//       }}
//     >
//       <div style={{ marginBottom: 14 }}>
//         <div style={{ fontSize: 20, fontWeight: 900, color: COLORS.text }}>
//           {title}
//         </div>
//       </div>

//       <div
//         style={{
//           flex: 1,
//           display: "flex",
//           alignItems: centerContent ? "center" : "stretch",
//           justifyContent: centerContent ? "center" : "flex-start",
//         }}
//       >
//         {children}
//       </div>
//     </div>
//   );
// }

// function Tile({
//   title,
//   selected,
//   disabled,
//   onClick,
// }: {
//   title: string;
//   selected: boolean;
//   disabled?: boolean;
//   onClick: () => void;
// }) {
//   const bg = selected ? COLORS.blue : COLORS.card2;
//   const border = selected ? COLORS.blue : COLORS.border;

//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       disabled={disabled}
//       style={{
//         width: "100%",
//         textAlign: "center",
//         padding: 16,
//         borderRadius: 18,
//         border: `1px solid ${border}`,
//         background: disabled ? "#101010" : bg,
//         color: COLORS.text,
//         cursor: disabled ? "not-allowed" : "pointer",
//         fontWeight: 900,
//         fontSize: 15,
//         minHeight: 64,
//       }}
//     >
//       {title}
//     </button>
//   );
// }

// function Card({ title, children }: { title?: string; children: React.ReactNode }) {
//   return (
//     <div
//       style={{
//         background: COLORS.card2,
//         border: `1px solid ${COLORS.border}`,
//         borderRadius: 18,
//         padding: 14,
//       }}
//     >
//       {title && (
//         <div style={{ fontWeight: 950, marginBottom: 10, color: COLORS.text }}>
//           {title}
//         </div>
//       )}
//       {children}
//     </div>
//   );
// }

// function Chip({ label, onClick }: { label: string; onClick: () => void }) {
//   return (
//     <button
//       type="button"
//       onClick={onClick}
//       style={{
//         border: `1px solid ${COLORS.border}`,
//         background: "#0f0f0f",
//         color: COLORS.text,
//         padding: "8px 12px",
//         borderRadius: 999,
//         fontWeight: 900,
//         cursor: "pointer",
//       }}
//     >
//       {label}
//     </button>
//   );
// }

// function ToggleRow({
//   label,
//   value,
//   onChange,
// }: {
//   label: string;
//   value: boolean;
//   onChange: (v: boolean) => void;
// }) {
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 12, padding: "10px 0" }}>
//       <div style={{ color: "#eaeaea", fontWeight: 800, lineHeight: 1.4 }}>
//         {label}
//       </div>

//       <div style={{ display: "flex", gap: 10 }}>
//         <button
//           type="button"
//           onClick={() => onChange(true)}
//           style={{
//             flex: 1,
//             padding: "12px 14px",
//             borderRadius: 14,
//             border: `1px solid ${value ? COLORS.blue : COLORS.border}`,
//             background: value ? COLORS.blue : "#0f0f0f",
//             color: "#fff",
//             fontWeight: 900,
//             cursor: "pointer",
//           }}
//         >
//           Yes
//         </button>
//         <button
//           type="button"
//           onClick={() => onChange(false)}
//           style={{
//             flex: 1,
//             padding: "12px 14px",
//             borderRadius: 14,
//             border: `1px solid ${!value ? COLORS.blue : COLORS.border}`,
//             background: !value ? COLORS.blue : "#0f0f0f",
//             color: "#fff",
//             fontWeight: 900,
//             cursor: "pointer",
//           }}
//         >
//           No
//         </button>
//       </div>
//     </div>
//   );
// }

// function MultiSelect({
//   items,
//   selected,
//   setSelected,
// }: {
//   items: { id: string; label: string }[];
//   selected: Record<string, boolean>;
//   setSelected: (next: Record<string, boolean>) => void;
// }) {
//   return (
//     <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
//       {items.map((it) => (
//         <Tile
//           key={it.id}
//           title={it.label}
//           selected={!!selected[it.id]}
//           onClick={() => setSelected({ ...selected, [it.id]: !selected[it.id] })}
//         />
//       ))}
//     </div>
//   );
// }

// // ---------- Pathways ----------
// const PATHWAYS: Record<ConditionKey, Pathway> = {
//   uti: utiPathway,
//   impetigo: impetigoPathway,
//   insect_bite: insectBitePathway,
//   sore_throat: soreThroatPathway,
//   sinusitis: sinusitisPathway,
//   shingles: shinglesPathway,
//   aom: aomPathway,
// };

// const CONDITIONS = Object.values(PATHWAYS).map((p) => p.condition);
// const ui: UiKit = { Card, ToggleRow, MultiSelect };

// export default function PharmacyFirst() {
//   const [step, setStep] = useState<Step>(1);
//   const [conditionKey, setConditionKey] = useState<ConditionKey | "">("");
//   const [ageBand, setAgeBand] = useState<AgeBand | "">("");
//   const [answers, setAnswers] = useState<Answers>({});

//   const pathway = useMemo(() => {
//     if (!conditionKey) return null;
//     return PATHWAYS[conditionKey as ConditionKey] ?? null;
//   }, [conditionKey]);

//   const eligible = useMemo(() => {
//     if (!pathway || !ageBand) return false;
//     return pathway.condition.eligibleAges.includes(ageBand as AgeBand);
//   }, [pathway, ageBand]);

//   const rec = useMemo(() => {
//     if (!pathway || !ageBand || !eligible) return null;
//     return pathway.buildRecommendation(ageBand as AgeBand, answers);
//   }, [pathway, ageBand, eligible, answers]);

//   function resetAll() {
//     setStep(1);
//     setConditionKey("");
//     setAgeBand("");
//     setAnswers({});
//   }

//   function selectCondition(k: ConditionKey) {
//     setConditionKey(k);
//     setAgeBand("");
//     setAnswers({});
//     setStep(2); // auto-advance
//   }

//   function selectAge(a: AgeBand) {
//     setAgeBand(a);
//     setAnswers({});
//     // auto-advance if eligible; otherwise stay on age step
//     if (pathway?.condition.eligibleAges.includes(a)) setStep(3);
//   }

//   return (
//     <div
//       style={{
//         minHeight: "100vh",
//         background: COLORS.bg,
//         padding: 24,
//         fontFamily:
//           'ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial',
//         color: COLORS.text,
//       }}
//     >
//       <div style={{ maxWidth: 760, margin: "0 auto" }}>
//         {/* Header */}
//         <div style={{ marginBottom: 16, display: "flex", justifyContent: "space-between", gap: 12 }}>
//           <h1 style={{ margin: 0, fontSize: 28, fontWeight: 950 }}>
//             Pharmacy First
//           </h1>
//           <Chip label="Reset" onClick={resetAll} />
//         </div>

//         {/* Optional small controls to change choices (NOT back/next) */}
//         {(step === 2 || step === 3) && (
//           <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 12 }}>
//             {conditionKey && <Chip label="Change service" onClick={() => setStep(1)} />}
//             {conditionKey && <Chip label="Change age" onClick={() => setStep(2)} />}
//           </div>
//         )}

//         {/* Step 1 */}
//         {step === 1 && (
//           <Section title="Choose a service" centerContent>
//             <div style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 12 }}>
//               {CONDITIONS.map((c) => (
//                 <Tile
//                   key={c.key}
//                   title={c.label}
//                   selected={conditionKey === c.key}
//                   onClick={() => selectCondition(c.key)}
//                 />
//               ))}
//             </div>
//           </Section>
//         )}

//         {/* Step 2 */}
//         {step === 2 && pathway && (
//           <Section title="Choose age band" centerContent>
//             <div style={{ width: "100%", maxWidth: 520, display: "flex", flexDirection: "column", gap: 12 }}>
//               {AGE_BANDS.map((a) => (
//                 <Tile
//                   key={a.value}
//                   title={a.label}
//                   selected={ageBand === a.value}
//                   onClick={() => selectAge(a.value)}
//                 />
//               ))}

//               {ageBand && (
//                 <div
//                   style={{
//                     marginTop: 2,
//                     padding: 12,
//                     borderRadius: 16,
//                     border: `1px solid ${eligible ? "#1e7f3b" : "#7f1d1d"}`,
//                     background: eligible ? "#06140a" : "#160606",
//                     color: eligible ? "#7cf0a0" : "#ffb4b4",
//                     fontWeight: 900,
//                     textAlign: "center",
//                   }}
//                 >
//                   {eligible ? "Eligible" : "Not eligible"}
//                 </div>
//               )}
//             </div>
//           </Section>
//         )}

//         {/* Step 3 */}
//         {step === 3 && pathway && ageBand && eligible && (
//           <Section title="Assessment">
//             <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
//               {/* Assessment UI comes from the pathway */}
//               <pathway.Assessment answers={answers} setAnswers={setAnswers} ui={ui} />

//               {/* Live recommendation (no “Next”) */}
//               {rec && (
//                 <Card title={rec.outcomeTitle}>
//                   <ul style={{ margin: 0, paddingLeft: 18, lineHeight: 1.6, color: "#eaeaea" }}>
//                     {[
//                       ...rec.gateway,
//                       ...(rec.firstLine ?? []),
//                       ...(rec.penAllergy ?? []),
//                       ...rec.selfCare,
//                       ...rec.refer,
//                       ...(rec.notes ?? []),
//                     ].map((x, i) => (
//                       <li key={i}>{x}</li>
//                     ))}
//                   </ul>
//                 </Card>
//               )}
//             </div>
//           </Section>
//         )}
//       </div>
//     </div>
//   );
// }

import React, { useState, useRef, useEffect } from "react";
import {
  Home,
  Activity,
  ClipboardList,
  ChevronRight,
  ArrowLeft,
  RotateCcw,
  Check,
  Save,
  AlertTriangle,
  Stethoscope,
  User,
  Calendar,
  FileText,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

/* ---------------- GLOBAL STYLES ---------------- */

const GlobalStyles = () => (
  <style>{`
    :root{
      --bg:#ffffff;
      --surface:#141414;
      --surface2:#1b1b1b;
      --border:#2a2a2a;
      --text:#ffffff;
      --muted:#bdbdbd;
      --blue:#1d4ed8;
    }

    *{ box-sizing:border-box; }
    html,body{ margin:0; background:var(--bg); }

    .pf-app{
      min-height:100vh;
      display:flex;
      font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI",
        Roboto, Helvetica, Arial;
      color:var(--text);
    }

    ::-webkit-scrollbar{ width:10px; }
    ::-webkit-scrollbar-thumb{
      background:#1f1f1f;
      border-radius:999px;
      border:2px solid #0a0a0a;
    }
  `}</style>
);

/* ---------------- TYPES ---------------- */

type Page = "home" | "assessment" | "history";
type Step = "service" | "age" | "flow";
type Service = "uti" | "impetigo";
type AgeBand = "<1" | "1–15" | "16–64" | "65+";

interface FlowNode {
  id: string;
  question: string;
  description?: string;
  options: {
    label: string;
    nextId?: string;
    outcome?: string;
    danger?: boolean;
  }[];
}

interface FlowStep {
  nodeId: string;
  question: string;
  answer: string;
}

interface RecordItem {
  id: number;
  service: Service;
  ageBand: AgeBand;
  outcome: string;
  pathway: FlowStep[];
  createdAt: string;
}

/* ---------------- PATHWAYS ---------------- */

const PATHWAYS: Record<Service, Record<string, FlowNode>> = {
  uti: {
    start: {
      id: "start",
      question: "NEWS2 score or sepsis risk?",
      description: "Any concern of sepsis or clinical instability?",
      options: [
        { label: "Yes", outcome: "Urgent referral / 999", danger: true },
        { label: "No", nextId: "pyelo" },
      ],
    },
    pyelo: {
      id: "pyelo",
      question: "Signs of pyelonephritis?",
      description: "Flank pain, rigors, vomiting, fever?",
      options: [
        { label: "Yes", outcome: "Urgent referral", danger: true },
        { label: "No", nextId: "exclusions" },
      ],
    },
    exclusions: {
      id: "exclusions",
      question: "Any exclusions present?",
      description: "Pregnancy, catheter, vaginal discharge, recurrent UTI?",
      options: [
        { label: "Yes", outcome: "Refer to GP" },
        { label: "No", nextId: "symptoms" },
      ],
    },
    symptoms: {
      id: "symptoms",
      question: "Key UTI symptoms present?",
      description: "Dysuria, nocturia, cloudy urine?",
      options: [
        { label: "None", outcome: "UTI unlikely – self care" },
        { label: "Two or more", outcome: "UTI likely – Nitrofurantoin 3 days" },
      ],
    },
  },

  impetigo: {
    start: {
      id: "start",
      question: "Signs of systemic illness?",
      description: "Fever, unwell child, sepsis concern?",
      options: [
        { label: "Yes", outcome: "Urgent referral", danger: true },
        { label: "No", nextId: "distribution" },
      ],
    },
    distribution: {
      id: "distribution",
      question: "Extent of impetigo?",
      description: "Localised vs widespread lesions",
      options: [
        {
          label: "Localised (≤3 lesions)",
          outcome: "Hydrogen peroxide 1% cream for 5 days",
        },
        {
          label: "Widespread (≥4 lesions)",
          outcome: "Flucloxacillin 5 days (or clarithromycin if allergic)",
        },
      ],
    },
  },
};

/* ---------------- LAYOUT ---------------- */

const Layout = ({
  page,
  setPage,
  children,
}: {
  page: Page;
  setPage: (p: Page) => void;
  children: React.ReactNode;
}) => (
  <div className="pf-app">
    <GlobalStyles />

    {/* Sidebar */}
    <nav
      style={{
        width: 320,
        background: "var(--surface)",
        borderRight: "1px solid var(--border)",
        padding: 24,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex", gap: 12, marginBottom: 40 }}>
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 16,
            background: "var(--blue)",
            display: "grid",
            placeItems: "center",
          }}
        >
          <Activity size={22} />
        </div>
        <div>
          <div style={{ fontWeight: 800 }}>
            Pharmacy<span style={{ color: "#3b82f6" }}>First</span>
          </div>
          <div style={{ fontSize: 12, color: "var(--muted)" }}>
            Clinical Pathways
          </div>
        </div>
      </div>

      {[
        { id: "home", icon: Home, label: "Home" },
        { id: "assessment", icon: Activity, label: "New Assessment" },
        { id: "history", icon: ClipboardList, label: "History" },
      ].map((n) => (
        <button
          key={n.id}
          onClick={() => setPage(n.id as Page)}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: "14px 18px",
            borderRadius: 18,
            background:
              page === n.id ? "var(--blue)" : "transparent",
            color: page === n.id ? "#fff" : "var(--muted)",
            border: "1px solid transparent",
            cursor: "pointer",
            marginBottom: 8,
            fontWeight: 600,
          }}
        >
          <n.icon size={18} />
          {n.label}
        </button>
      ))}
    </nav>

    {/* Main */}
    <main style={{ flex: 1, padding: 48, overflowY: "auto", backgroundColor: "" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>{children}</div>
    </main>
  </div>
);

/* ---------------- APP ---------------- */

export default function PharmacyFirstApp() {
  const [page, setPage] = useState<Page>("home");
  const [step, setStep] = useState<Step>("service");
  const [service, setService] = useState<Service | null>(null);
  const [ageBand, setAgeBand] = useState<AgeBand | null>(null);
  const [nodeId, setNodeId] = useState("start");
  const [history, setHistory] = useState<FlowStep[]>([]);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [records, setRecords] = useState<RecordItem[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, outcome]);

  const answer = (label: string, next?: string, res?: string) => {
    if (!service) return;
    const node = PATHWAYS[service][nodeId];
    setHistory([...history, { nodeId, question: node.question, answer: label }]);
    if (res) {
      setOutcome(res);
    } else if (next) {
      setNodeId(next);
    }
  };

  const reset = () => {
    setStep("service");
    setService(null);
    setAgeBand(null);
    setNodeId("start");
    setHistory([]);
    setOutcome(null);
  };

  const save = () => {
    if (!service || !ageBand || !outcome) return;
    setRecords([
      {
        id: Date.now(),
        service,
        ageBand,
        outcome,
        pathway: history,
        createdAt: new Date().toISOString(),
      },
      ...records,
    ]);
    setPage("history");
    reset();
  };

  /* ---------------- RENDER ---------------- */

  return (
    <Layout page={page} setPage={setPage}>
      {/* HOME */}
      {page === "home" && (
        <>
          <div style={{ marginBottom: 32, backgroundColor: "000" }}>
            <div
              style={{
                display: "inline-block",
                padding: "6px 12px",
                borderRadius: 999,
                border: "1px solid var(--border)",
                color: "#3b82f6",
                fontSize: 12,
                fontWeight: 700,
                marginBottom: 16,
                
              }}
            >
              NHS PHARMACY FIRST
            </div>
            <h1 style={{ fontSize: 64, lineHeight: 1, fontWeight: 900 }}>
              Clinical Assessment <br />
              <span style={{ color: "#3b82f6" }}>Protocol System</span>
            </h1>
            <p style={{ fontSize: 20, color: "var(--muted)", maxWidth: 560 }}>
              Start a new patient assessment using standardized clinical pathways.
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 24 }}>
            <HomeCard
              title="Start Assessment"
              description="Begin a new consultation for UTI or Impetigo."
              action="Start Now"
              primary
              onClick={() => setPage("assessment")}
            />
            <HomeCard
              title="Patient History"
              description="Review past assessments and outcomes."
              action="View Log"
              onClick={() => setPage("history")}
            />
            <HomeCard
              title="Protocols"
              description="View clinical guidelines and exclusions."
              action="Read Docs"
              onClick={() => {}}
            />
          </div>
        </>
      )}

      {/* ASSESSMENT */}
      {page === "assessment" && (
        <>
          {step === "service" && (
            <>
              <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>
                Select Service
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <ServiceCard
                  title="Uncomplicated UTI"
                  subtitle="Women 16–64 years"
                  onClick={() => {
                    setService("uti");
                    setStep("age");
                  }}
                />
                <ServiceCard
                  title="Impetigo"
                  subtitle="Adults and children >1 year"
                  onClick={() => {
                    setService("impetigo");
                    setStep("age");
                  }}
                />
              </div>
            </>
          )}

          {step === "age" && (
            <>
              <button onClick={() => setStep("service")} style={{ marginBottom: 16 }}>
                <ArrowLeft />
              </button>
              <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>
                Patient Age
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {["<1", "1–15", "16–64", "65+"].map((a) => (
                  <AgeCard
                    key={a}
                    label={a as AgeBand}
                    onClick={() => {
                      setAgeBand(a as AgeBand);
                      setStep("flow");
                    }}
                  />
                ))}
              </div>
            </>
          )}

          {step === "flow" && service && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 24 }}>
                <h3 style={{ fontSize: 22, fontWeight: 800 }}>
                  {service.toUpperCase()} Assessment
                </h3>
                <button onClick={reset} style={{ color: "var(--muted)" }}>
                  <RotateCcw size={14} /> Restart
                </button>
              </div>

              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    left: 20,
                    top: 20,
                    bottom: 0,
                    width: 2,
                    background: "var(--border)",
                  }}
                />

                {history.map((h, i) => (
                  <TimelineDone key={i} {...h} />
                ))}

                {!outcome && (
                  <TimelineQuestion
                    node={PATHWAYS[service][nodeId]}
                    onAnswer={answer}
                  />
                )}

                {outcome && (
                  <TimelineOutcome outcome={outcome} onSave={save} />
                )}

                <div ref={bottomRef} />
              </div>
            </>
          )}
        </>
      )}

      {/* HISTORY */}
      {page === "history" && (
        <>
          <h2 style={{ fontSize: 32, fontWeight: 800, marginBottom: 24 }}>
            Assessment History
          </h2>

          {records.length === 0 && (
            <div style={{ textAlign: "center", color: "var(--muted)", padding: 80 }}>
              <FileText size={40} />
              <p>No records found.</p>
            </div>
          )}

          {records.map((r) => (
            <div
              key={r.id}
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: 18,
                padding: 24,
                marginBottom: 16,
              }}
            >
              <div style={{ fontWeight: 800 }}>{r.outcome}</div>
              <div style={{ fontSize: 12, color: "var(--muted)" }}>
                {r.service.toUpperCase()} • {r.ageBand} •{" "}
                {new Date(r.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </>
      )}
    </Layout>
  );
}

/* ---------------- COMPONENTS ---------------- */

const HomeCard = ({
  title,
  description,
  action,
  onClick,
  primary,
}: {
  title: string;
  description: string;
  action: string;
  onClick: () => void;
  primary?: boolean;
}) => (
  <button
    onClick={onClick}
    style={{
      background: primary ? "var(--blue)" : "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 32,
      padding: 40,
      textAlign: "left",
      minHeight: 300,
      color: "#fff",
    }}
  >
    <div style={{ fontSize: 28, fontWeight: 900 }}>{title}</div>
    <p style={{ color: primary ? "#dbeafe" : "var(--muted)" }}>{description}</p>
    <div style={{ marginTop: 40, fontWeight: 700 }}>
      {action} <ChevronRight size={14} />
    </div>
  </button>
);

const ServiceCard = ({
  title,
  subtitle,
  onClick,
}: {
  title: string;
  subtitle: string;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 24,
      padding: 32,
      textAlign: "left",
    }}
  >
    <div style={{ fontWeight: 800, fontSize: 20 }}>{title}</div>
    <div style={{ color: "var(--muted)" }}>{subtitle}</div>
  </button>
);

const AgeCard = ({
  label,
  onClick,
}: {
  label: AgeBand;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    style={{
      background: "var(--surface)",
      border: "1px solid var(--border)",
      borderRadius: 20,
      padding: 24,
      fontWeight: 700,
      textAlign: "left",
    }}
  >
    {label}
  </button>
);

const TimelineDone = ({
  question,
  answer,
}: {
  question: string;
  answer: string;
}) => (
  <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#0f172a",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Check size={18} />
    </div>
    <div
      style={{
        background: "#0f0f0f",
        border: "1px solid var(--border)",
        borderRadius: 20,
        padding: 20,
        opacity: 0.7,
        width: "100%",
      }}
    >
      <div style={{ fontSize: 12, color: "var(--muted)" }}>{question}</div>
      <div style={{ fontWeight: 700 }}>{answer}</div>
    </div>
  </div>
);

const TimelineQuestion = ({
  node,
  onAnswer,
}: {
  node: FlowNode;
  onAnswer: (label: string, next?: string, res?: string) => void;
}) => (
  <div style={{ display: "flex", gap: 20, marginBottom: 24 }}>
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "var(--blue)",
        display: "grid",
        placeItems: "center",
        fontWeight: 900,
      }}
    >
      ?
    </div>
    <div
      style={{
        background: "var(--surface)",
        border: "1px solid rgba(29,78,216,.35)",
        borderRadius: 24,
        padding: 32,
        width: "100%",
      }}
    >
      <h4 style={{ fontSize: 22, fontWeight: 800 }}>{node.question}</h4>
      <p style={{ color: "var(--muted)" }}>{node.description}</p>

      <div style={{ display: "grid", gap: 12, marginTop: 20 }}>
        {node.options.map((o, i) => (
          <button
            key={i}
            onClick={() => onAnswer(o.label, o.nextId, o.outcome)}
            style={{
              padding: 18,
              borderRadius: 16,
              background: o.danger ? "#160606" : "var(--surface2)",
              border: "1px solid var(--border)",
              color: "#fff",
              textAlign: "left",
              fontWeight: 600,
            }}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  </div>
);

const TimelineOutcome = ({
  outcome,
  onSave,
}: {
  outcome: string;
  onSave: () => void;
}) => (
  <div style={{ display: "flex", gap: 20 }}>
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: "50%",
        background: "#166534",
        display: "grid",
        placeItems: "center",
      }}
    >
      <Check />
    </div>
    <div
      style={{
        background: "#052e16",
        border: "1px solid #14532d",
        borderRadius: 24,
        padding: 40,
        textAlign: "center",
        width: "100%",
      }}
    >
      <div style={{ fontSize: 12, letterSpacing: 1, color: "#86efac" }}>
        CLINICAL RECOMMENDATION
      </div>
      <div style={{ fontSize: 26, fontWeight: 900, margin: "12px 0" }}>
        {outcome}
      </div>
      <button
        onClick={onSave}
        style={{
          marginTop: 16,
          padding: "14px 28px",
          borderRadius: 999,
          background: "var(--blue)",
          border: "none",
          color: "#fff",
          fontWeight: 800,
        }}
      >
        <Save size={16} /> Save to History
      </button>
    </div>
  </div>
);

