// // src/components/JobsPage.tsx
// import React, { useEffect, useMemo, useState } from "react";
// import supabase from "../../supabase";
// import { useSession } from "../../context/SessionContext";

// // ─── Types ────────────────────────────────────────────────────
// type Status = "unassigned" | "pending" | "ready" | "collected";

// type Job = {
//   id: string;
//   buyer_name: string;
//   telephone: string;
//   job_description: string;
//   date_booked: string;        // yyyy-mm-dd
//   worker_name: string | null;
//   status: Status;
//   price: number | null;
//   date_collected: string | null;
//   whatsapp_sent_at: string | null;
//   created_at: string;
// };

// interface JobsPageProps {
//   headerSearch?: string;
//   headerLocation?: string; // not used for jobs, kept for prop-compatibility with AppDashboard
// }

// const WEBSITE_URL = "https://cellxperts.netlify.app";

// // ─── Dark theme palette ─────────────────────────────────────────
// const T = {
//   page: "transparent",           // AppDashboard already sets the dark page background
//   panel: "#18181b",
//   panelBorder: "#2a2a2e",
//   textPrimary: "#f4f4f5",
//   textSecondary: "#9ca3af",
//   textMuted: "#6b7280",
//   inputBg: "#0f0f11",
//   accentBlue: "#5b8def",
//   assign: "#000000",
//   assignBorder: "#3f3f46",
//   ready: "#eab308",
//   collect: "#3b82f6",
//   danger: "#ef4444",
// };

// // ─── Helpers ──────────────────────────────────────────────────
// const fmtMoney = (n: number | null) =>
//   n === null || n === undefined ? "—" : `£${Number(n).toFixed(2)}`;

// const fmtDate = (d: string | null) => {
//   if (!d) return "—";
//   const dt = new Date(d + "T00:00:00");
//   return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
// };

// const toWhatsAppNumber = (raw: string) => {
//   let digits = raw.replace(/[^\d+]/g, "");
//   if (digits.startsWith("+")) digits = digits.slice(1);
//   if (digits.startsWith("0")) digits = "44" + digits.slice(1); // default: UK
//   return digits;
// };

// // One message per stage. All are addressed to the customer (buyer_name).
// const buildWhatsAppMessage = (job: Job) => {
//   switch (job.status) {
//     case "ready":
//       return (
//         `Hi ${job.buyer_name}, this is Cell Xperts. Your ${job.job_description} is complete and ready for collection. ` +
//         `Total to pay: ${fmtMoney(job.price)}. See you soon!`
//       );
//     case "collected":
//       return (
//         `Hi ${job.buyer_name}, thank you for choosing Cell Xperts! We hope you're happy with your ${job.job_description}. ` +
//         `Visit ${WEBSITE_URL} to view or book any of our other services. See you again soon!`
//       );
//     case "pending":
//       return (
//         `Hi ${job.buyer_name}, this is Cell Xperts. Just an update — your ${job.job_description} is currently being worked on by ` +
//         `${job.worker_name ?? "our team"}. We'll message you as soon as it's ready!`
//       );
//     default: // unassigned
//       return (
//         `Hi ${job.buyer_name}, this is Cell Xperts. We've received your ${job.job_description} booking and will be assigning it ` +
//         `to a technician shortly. We'll keep you posted!`
//       );
//   }
// };

// const buildWhatsAppLink = (job: Job) =>
//   `https://wa.me/${toWhatsAppNumber(job.telephone)}?text=${encodeURIComponent(buildWhatsAppMessage(job))}`;

// const AVATAR_COLORS = ["#5b8def", "#a78bfa", "#2dd4bf", "#f87171", "#fb923c", "#e5e7eb", "#38bdf8"];
// const avatarColor = (name: string) => {
//   let hash = 0;
//   for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
//   return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
// };
// const initials = (name: string) =>
//   name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");

// // Real WhatsApp logo — place the provided image at /public/whatsapp-icon.png
// // Rendered at its native aspect ratio; no extra border-radius needed since
// // the source PNG is already a rounded squircle.
// const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 26 }) => (
//   <img src="/whatsapp-icon.png" alt="WhatsApp" width={size} height={size} style={{ display: "block", objectFit: "contain" }} />
// );

// // ─── Column config ─────────────────────────────────────────────
// const COLUMNS: { key: Status; label: string; dot: string }[] = [
//   { key: "unassigned", label: "Unassigned",            dot: "#71717a" },
//   { key: "pending",    label: "Pending",                dot: "#eab308" },
//   { key: "ready",      label: "Ready for Collection",   dot: "#06b6d4" },
//   { key: "collected",  label: "Collected",               dot: "#22c55e" },
// ];

// // ─── Empty form state ─────────────────────────────────────────
// const emptyForm = {
//   buyer_name: "",
//   telephone: "",
//   job_description: "",
//   date_booked: new Date().toISOString().slice(0, 10),
//   worker_name: "",
//   price: "",
// };

// // ─── Component ────────────────────────────────────────────────
// const JobsPage: React.FC<JobsPageProps> = ({ headerSearch = "" }) => {
//   const { session } = useSession();

//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [role, setRole] = useState<"admin" | "user">("user");
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState(emptyForm);
//   const [saving, setSaving] = useState(false);

//   const [assignModalJob, setAssignModalJob] = useState<Job | null>(null);
//   const [workerInput, setWorkerInput] = useState("");

//   const [readyModalJob, setReadyModalJob] = useState<Job | null>(null);
//   const [priceInput, setPriceInput] = useState("");

//   const isAdmin = role === "admin";

//   useEffect(() => {
//     if (!session?.user?.id) return;
//     supabase.from("profiles").select("role").eq("id", session.user.id).single()
//       .then(({ data }) => { if (data?.role === "admin") setRole("admin"); });
//   }, [session]);

//   // Newest jobs first
//   const fetchJobs = () => {
//     setLoading(true);
//     supabase.from("jobs").select("*").order("created_at", { ascending: false })
//       .then(({ data, error }) => {
//         if (!error && data) setJobs(data as Job[]);
//         setLoading(false);
//       });
//   };

//   useEffect(() => { fetchJobs(); }, []);

//   const filteredJobs = useMemo(() => {
//     const q = headerSearch.trim().toLowerCase();
//     if (!q) return jobs;
//     return jobs.filter((j) =>
//       j.buyer_name.toLowerCase().includes(q) ||
//       j.telephone.toLowerCase().includes(q) ||
//       j.job_description.toLowerCase().includes(q) ||
//       (j.worker_name ?? "").toLowerCase().includes(q)
//     );
//   }, [jobs, headerSearch]);

//   const byStatus = (s: Status) => filteredJobs.filter((j) => j.status === s);

//   const stats = useMemo(() => {
//     const revenue = jobs.reduce((sum, j) => sum + (j.price ?? 0), 0);
//     return { total: jobs.length, revenue };
//   }, [jobs]);

//   // ─── Create job ─────────────────────────────────────────────
//   const handleCreateJob = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form.buyer_name || !form.telephone || !form.job_description) return;
//     setSaving(true);
//     const hasWorker = form.worker_name.trim().length > 0;
//     const { error } = await supabase.from("jobs").insert({
//       buyer_name: form.buyer_name,
//       telephone: form.telephone,
//       job_description: form.job_description,
//       date_booked: form.date_booked,
//       worker_name: hasWorker ? form.worker_name : null,
//       status: hasWorker ? "pending" : "unassigned",
//       price: form.price ? Number(form.price) : null,
//     });
//     setSaving(false);
//     if (!error) {
//       setForm(emptyForm);
//       setShowForm(false);
//       fetchJobs();
//     }
//   };

//   // ─── Stage transitions (admin only) ─────────────────────────
//   const openAssignModal = (job: Job) => {
//     if (!isAdmin) return;
//     setAssignModalJob(job);
//     setWorkerInput(job.worker_name ?? "");
//   };

//   const confirmAssign = async () => {
//     if (!assignModalJob || !workerInput.trim()) return;
//     const { error } = await supabase.from("jobs")
//       .update({ worker_name: workerInput.trim(), status: "pending" })
//       .eq("id", assignModalJob.id);
//     if (!error) {
//       setAssignModalJob(null);
//       setWorkerInput("");
//       fetchJobs();
//     }
//   };

//   const openReadyModal = (job: Job) => {
//     if (!isAdmin) return;
//     setReadyModalJob(job);
//     setPriceInput(job.price !== null ? String(job.price) : "");
//   };

//   const confirmReady = async () => {
//     if (!readyModalJob) return;
//     const priceValue = priceInput ? Number(priceInput) : null;
//     const { error } = await supabase.from("jobs")
//       .update({ price: priceValue, status: "ready" })
//       .eq("id", readyModalJob.id);
//     if (!error) {
//       const updatedJob: Job = { ...readyModalJob, price: priceValue, status: "ready" };
//       setReadyModalJob(null);
//       setPriceInput("");
//       fetchJobs();
//       window.open(buildWhatsAppLink(updatedJob), "_blank");
//       supabase.from("jobs").update({ whatsapp_sent_at: new Date().toISOString() }).eq("id", updatedJob.id).then();
//     }
//   };

//   const markCollected = async (job: Job) => {
//     if (!isAdmin) return;
//     const dateCollected = new Date().toISOString().slice(0, 10);
//     const { error } = await supabase.from("jobs")
//       .update({ status: "collected", date_collected: dateCollected })
//       .eq("id", job.id);
//     if (!error) {
//       const updatedJob: Job = { ...job, status: "collected", date_collected: dateCollected };
//       fetchJobs();
//       window.open(buildWhatsAppLink(updatedJob), "_blank");
//       supabase.from("jobs").update({ whatsapp_sent_at: new Date().toISOString() }).eq("id", updatedJob.id).then();
//     }
//   };

//   const handleSendWhatsApp = (job: Job) => window.open(buildWhatsAppLink(job), "_blank");

//   // ─── Card ───────────────────────────────────────────────────
//   const JobCard: React.FC<{ job: Job }> = ({ job }) => (
//     <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10, padding: 11, marginBottom: 10, minWidth: 0 }}>
//       <div style={{
//         fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 6,
//         overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//       }} title={job.job_description}>
//         {job.job_description}
//       </div>
//       <div style={{
//         fontSize: 12, color: "#d4d4d8", marginBottom: 2,
//         overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//       }} title={job.buyer_name}>
//         {job.buyer_name}
//       </div>
//       <div style={{ fontSize: 11, color: T.textSecondary, marginBottom: 8 }}>{job.telephone}</div>

//       <div style={{ fontSize: 10.5, color: T.textMuted, marginBottom: 8 }}>
//         Booked {fmtDate(job.date_booked)}
//         {job.status === "collected" && <> · {fmtDate(job.date_collected)}</>}
//       </div>

//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
//           {job.worker_name ? (
//             <>
//               <div style={{
//                 width: 20, height: 20, borderRadius: "50%", background: avatarColor(job.worker_name),
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 color: "#0d0d0f", fontSize: 9, fontWeight: 700, flexShrink: 0,
//               }}>
//                 {initials(job.worker_name)}
//               </div>
//               <span style={{ fontSize: 11.5, color: "#d4d4d8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                 {job.worker_name}
//               </span>
//             </>
//           ) : (
//             <span style={{ fontSize: 11.5, color: T.textMuted, fontStyle: "italic" }}>Unassigned</span>
//           )}
//         </div>
//         <div style={{ fontSize: 12.5, fontWeight: 700, color: T.textPrimary, flexShrink: 0 }}>{fmtMoney(job.price)}</div>
//       </div>

//       <div style={{ display: "flex", gap: 6, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.panelBorder}` }}>
//         {isAdmin ? (
//           <>
//             {job.status === "unassigned" && (
//               <button onClick={() => openAssignModal(job)} style={{ ...actionBtnStyle, background: T.assign, color: "#fff", border: `1px solid ${T.assignBorder}` }}>
//                 Assign
//               </button>
//             )}
//             {job.status === "pending" && (
//               <button onClick={() => openReadyModal(job)} style={{ ...actionBtnStyle, background: T.ready, color: "#fff", border: "none" }}>
//                 Mark Ready
//               </button>
//             )}
//             {job.status === "ready" && (
//               <button onClick={() => markCollected(job)} style={{ ...actionBtnStyle, background: T.collect, color: "#fff", border: "none" }}>
//                 Collected
//               </button>
//             )}
//           </>
//         ) : (
//           job.status !== "collected" && (
//             <span style={{ flex: 1, fontSize: 11, color: T.textMuted, display: "flex", alignItems: "center" }}>
//               View only
//             </span>
//           )
//         )}

//         <button
//           onClick={() => handleSendWhatsApp(job)}
//           title="Send WhatsApp message"
//           style={{
//             display: "flex", alignItems: "center", justifyContent: "center",
//             width: job.status === "collected" || !isAdmin ? "auto" : 38,
//             flex: job.status === "collected" || !isAdmin ? 1 : undefined,
//             gap: 6, padding: "4px 6px", borderRadius: 6, border: `1px solid ${T.panelBorder}`, background: T.inputBg, cursor: "pointer", flexShrink: 0,
//           }}
//         >
//           <WhatsAppIcon size={26} />
//           {(job.status === "collected" || !isAdmin) && <span style={{ fontSize: 11, fontWeight: 600, color: "#d4d4d8" }}>Message</span>}
//         </button>
//       </div>
//     </div>
//   );

//   // ─── Render ─────────────────────────────────────────────────
//   return (
//     <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
//       {/* Hide scrollbars visually but keep scrolling functional */}
//       <style>{`
//         .jx-col::-webkit-scrollbar { display: none; }
//         .jx-col { scrollbar-width: none; -ms-overflow-style: none; }
//       `}</style>

//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
//         <h1 style={{ fontSize: 26, fontWeight: 800, color: T.accentBlue, margin: 0 }}>Jobs Board</h1>
//         <button onClick={() => setShowForm((s) => !s)} style={{
//           display: "flex", alignItems: "center", gap: 6,
//           background: T.accentBlue, color: "#fff", border: "none", borderRadius: 8,
//           padding: "10px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
//         }}>
//           + New Job
//         </button>
//       </div>

//       <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 22, maxWidth: 400 }}>
//         <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10, padding: "16px 18px" }}>
//           <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 6 }}>Total Jobs</div>
//           <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary }}>{stats.total}</div>
//         </div>
//         <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10, padding: "16px 18px" }}>
//           <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 6 }}>Revenue (all time)</div>
//           <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary }}>{fmtMoney(stats.revenue)}</div>
//         </div>
//       </div>

//       {showForm && (
//         <form onSubmit={handleCreateJob} style={{
//           background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10,
//           padding: 20, marginBottom: 22, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14,
//         }}>
//           <Field label="Customer name">
//             <input required value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
//               placeholder="e.g. Ali Khan" style={inputStyle} />
//           </Field>
//           <Field label="Telephone">
//             <input required value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
//               placeholder="e.g. 07897654321" style={inputStyle} />
//           </Field>
//           <Field label="Job">
//             <input required value={form.job_description} onChange={(e) => setForm({ ...form, job_description: e.target.value })}
//               placeholder="e.g. Screen replacement" style={inputStyle} />
//           </Field>
//           <Field label="Date booked">
//             <input required type="date" value={form.date_booked} onChange={(e) => setForm({ ...form, date_booked: e.target.value })}
//               style={inputStyle} />
//           </Field>
//           <Field label="Worker (optional — leave blank to keep Unassigned)">
//             <input value={form.worker_name} onChange={(e) => setForm({ ...form, worker_name: e.target.value })}
//               placeholder="e.g. Sangar" style={inputStyle} />
//           </Field>
//           <Field label="Price (optional)">
//             <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
//               placeholder="e.g. 85.00" style={inputStyle} />
//           </Field>

//           <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, justifyContent: "flex-end" }}>
//             <button type="button" onClick={() => setShowForm(false)} style={secondaryBtnStyle}>Cancel</button>
//             <button type="submit" disabled={saving}
//               style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: T.accentBlue, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
//               {saving ? "Saving…" : "Create Job"}
//             </button>
//           </div>
//         </form>
//       )}

//       {loading ? (
//         <div style={{ padding: 40, textAlign: "center", color: T.textMuted }}>Loading jobs…</div>
//       ) : (
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
//           {COLUMNS.map((col) => {
//             const colJobs = byStatus(col.key);
//             return (
//               <div key={col.key} style={{ minWidth: 0 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
//                   <span style={{ width: 7, height: 7, borderRadius: "50%", background: col.dot, flexShrink: 0 }} />
//                   <span style={{
//                     fontSize: 12.5, fontWeight: 700, color: T.textPrimary,
//                     overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//                   }} title={col.label}>
//                     {col.label}
//                   </span>
//                   <span style={{ fontSize: 11.5, color: T.textMuted, flexShrink: 0 }}>{colJobs.length}</span>
//                 </div>
//                 <div className="jx-col" style={{ maxHeight: "calc(100vh - 340px)", overflowY: "auto", paddingRight: 2 }}>
//                   {colJobs.length === 0 && <div style={{ color: T.textMuted, fontSize: 12.5 }}>No jobs.</div>}
//                   {colJobs.map((j) => <JobCard key={j.id} job={j} />)}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Assign worker modal */}
//       {assignModalJob && (
//         <ModalShell onClose={() => setAssignModalJob(null)}>
//           <h3 style={modalTitleStyle}>Assign Worker</h3>
//           <p style={modalSubtitleStyle}>{assignModalJob.buyer_name} — {assignModalJob.job_description}</p>
//           <Field label="Worker name">
//             <input autoFocus value={workerInput} onChange={(e) => setWorkerInput(e.target.value)}
//               placeholder="e.g. Sangar" style={inputStyle} />
//           </Field>
//           <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
//             <button onClick={() => setAssignModalJob(null)} style={secondaryBtnStyle}>Cancel</button>
//             <button onClick={confirmAssign} style={{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${T.assignBorder}`, background: T.assign, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
//               Assign
//             </button>
//           </div>
//         </ModalShell>
//       )}

//       {/* Mark ready modal */}
//       {readyModalJob && (
//         <ModalShell onClose={() => setReadyModalJob(null)}>
//           <h3 style={modalTitleStyle}>Mark Ready for Collection</h3>
//           <p style={modalSubtitleStyle}>{readyModalJob.buyer_name} — {readyModalJob.job_description}</p>
//           <Field label="Price charged (£)">
//             <input autoFocus type="number" min="0" step="0.01" value={priceInput}
//               onChange={(e) => setPriceInput(e.target.value)} style={inputStyle} />
//           </Field>
//           <p style={{ fontSize: 12, color: T.textMuted, margin: "8px 0 0" }}>
//             This opens WhatsApp with a "ready for collection" message including the price.
//           </p>
//           <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
//             <button onClick={() => setReadyModalJob(null)} style={secondaryBtnStyle}>Cancel</button>
//             <button onClick={confirmReady} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: T.ready, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
//               Confirm & Open WhatsApp
//             </button>
//           </div>
//         </ModalShell>
//       )}
//     </div>
//   );
// };

// // ─── small styled bits ─────────────────────────────────────────
// const inputStyle: React.CSSProperties = {
//   width: "100%", boxSizing: "border-box", padding: "9px 12px",
//   border: `1px solid ${T.panelBorder}`, borderRadius: 8, fontSize: 13.5,
//   fontFamily: "'DM Sans', sans-serif", outline: "none", color: T.textPrimary, background: T.inputBg,
// };

// const actionBtnStyle: React.CSSProperties = {
//   flex: 1, padding: "7px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
// };

// const secondaryBtnStyle: React.CSSProperties = {
//   padding: "9px 16px", borderRadius: 8, border: `1px solid ${T.panelBorder}`, background: T.inputBg,
//   color: T.textPrimary, fontSize: 13.5, cursor: "pointer",
// };

// const modalTitleStyle: React.CSSProperties = { margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: T.textPrimary };
// const modalSubtitleStyle: React.CSSProperties = { margin: "0 0 16px", fontSize: 13, color: T.textSecondary };

// const ModalShell: React.FC<{ children: React.ReactNode; onClose: () => void }> = ({ children, onClose }) => (
//   <div onClick={onClose} style={{
//     position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
//     display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
//   }}>
//     <div onClick={(e) => e.stopPropagation()} style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 12, padding: 24, width: 360 }}>
//       {children}
//     </div>
//   </div>
// );

// const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
//   <label style={{ display: "block", fontSize: 12, color: T.textSecondary, fontWeight: 600, marginBottom: 5 }}>
//     {label}
//     <div style={{ marginTop: 5 }}>{children}</div>
//   </label>
// );

// export default JobsPage;
// src/components/JobsPage.tsx
// src/components/JobsPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import supabase from "../../supabase";
import { useSession } from "../../context/SessionContext";
import { DateRange, RangeKeyDict } from "react-date-range";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

// ─── Types ────────────────────────────────────────────────────
type Status = "unassigned" | "pending" | "ready" | "collected";

type DateRangeValue = { startDate: Date; endDate: Date } | null;
type FilterScope = "global" | "pendingBooked" | "readyBooked" | "collectedBooked" | "collectedCollected";

type Job = {
  id: string;
  buyer_name: string;
  telephone: string;
  job_description: string;
  date_booked: string;        // yyyy-mm-dd
  worker_name: string | null;
  status: Status;
  price: number | null;
  date_collected: string | null;
  whatsapp_sent_at: string | null;
  created_at: string;
};

interface JobsPageProps {
  headerSearch?: string;
  headerLocation?: string; // not used for jobs, kept for prop-compatibility with AppDashboard
}

const WEBSITE_URL = "https://cellxperts.netlify.app";

// ─── Dark theme palette ─────────────────────────────────────────
const T = {
  page: "transparent",           // AppDashboard already sets the dark page background
  panel: "#18181b",
  panelBorder: "#2a2a2e",
  textPrimary: "#f4f4f5",
  textSecondary: "#9ca3af",
  textMuted: "#6b7280",
  inputBg: "#0f0f11",
  accentBlue: "#5b8def",
  assign: "#000000",
  assignBorder: "#3f3f46",
  ready: "#eab308",
  collect: "#3b82f6",
  danger: "#ef4444",
};

// ─── Helpers ──────────────────────────────────────────────────
const fmtMoney = (n: number | null) =>
  n === null || n === undefined ? "—" : `£${Number(n).toFixed(2)}`;

const fmtDate = (d: string | null) => {
  if (!d) return "—";
  const dt = new Date(d + "T00:00:00");
  return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
};

const toWhatsAppNumber = (raw: string) => {
  let digits = raw.replace(/[^\d+]/g, "");
  if (digits.startsWith("+")) digits = digits.slice(1);
  if (digits.startsWith("0")) digits = "44" + digits.slice(1); // default: UK
  return digits;
};

const todayRange = (): { startDate: Date; endDate: Date } => {
  const d = new Date();
  return { startDate: d, endDate: d };
};

// A date filter with no range set lets everything through; a filter with a
// range set excludes jobs whose relevant date is missing (e.g. filtering by
// "date collected" on a job that hasn't been collected yet).
const inDateRange = (dateStr: string | null, range: DateRangeValue) => {
  if (!range) return true;
  if (!dateStr) return false;
  const d = new Date(dateStr + "T00:00:00").getTime();
  const s = new Date(range.startDate); s.setHours(0, 0, 0, 0);
  const e = new Date(range.endDate); e.setHours(23, 59, 59, 999);
  return d >= s.getTime() && d <= e.getTime();
};

const fmtShort = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
const formatRangeLabel = (range: DateRangeValue) => {
  if (!range) return null;
  const sameDay = range.startDate.toDateString() === range.endDate.toDateString();
  return sameDay ? fmtShort(range.startDate) : `${fmtShort(range.startDate)} – ${fmtShort(range.endDate)}`;
};

// One message per stage. All are addressed to the customer (buyer_name).
// Every variant includes the website link so WhatsApp generates the same
// preview thumbnail (title + image) on every message, not just "collected".
const buildWhatsAppMessage = (job: Job) => {
  switch (job.status) {
    case "ready":
      return (
        `Hi ${job.buyer_name}, this is Cell Xperts. Your ${job.job_description} is complete and ready for collection. ` +
        `Total to pay: ${fmtMoney(job.price)}. See you soon! ${WEBSITE_URL}`
      );
    case "collected":
      return (
        `Hi ${job.buyer_name}, thank you for choosing Cell Xperts! We hope you're happy with your ${job.job_description}. ` +
        `Visit ${WEBSITE_URL} to view or book any of our other services. See you again soon!`
      );
    case "pending":
      return (
        `Hi ${job.buyer_name}, this is Cell Xperts. Just an update — your ${job.job_description} is currently being worked on by ` +
        `${job.worker_name ?? "our team"}. We'll message you as soon as it's ready! ${WEBSITE_URL}`
      );
    default: // unassigned
      return (
        `Hi ${job.buyer_name}, this is Cell Xperts. We've received your ${job.job_description} booking and will be assigning it ` +
        `to a technician shortly. We'll keep you posted! ${WEBSITE_URL}`
      );
  }
};

const buildWhatsAppLink = (job: Job) =>
  `https://wa.me/${toWhatsAppNumber(job.telephone)}?text=${encodeURIComponent(buildWhatsAppMessage(job))}`;

const AVATAR_COLORS = ["#5b8def", "#a78bfa", "#2dd4bf", "#f87171", "#fb923c", "#e5e7eb", "#38bdf8"];
const avatarColor = (name: string) => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};
const initials = (name: string) =>
  name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");

// Real WhatsApp logo — place the provided image at /public/whatsapp-icon.png
// Rendered at its native aspect ratio; no extra border-radius needed since
// the source PNG is already a rounded squircle.
const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 26 }) => (
  <img src="/whatsapp-icon.png" alt="WhatsApp" width={size} height={size} style={{ display: "block", objectFit: "contain" }} />
);

// ─── Date filter UI bits ─────────────────────────────────────────
const CalendarIcon: React.FC<{ active?: boolean }> = ({ active }) => (
  <svg width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke={active ? T.accentBlue : T.textSecondary} strokeWidth="2">
    <rect x="3" y="4" width="18" height="18" rx="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const ColCalendarBtn: React.FC<{ active: boolean; title: string; range?: DateRangeValue; onClick: () => void }> = ({ active, title, range, onClick }) => (
  <button
    onClick={onClick}
    title={active && range ? `${title} (${formatRangeLabel(range)})` : title}
    style={{
      display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20,
      borderRadius: 5, border: `1px solid ${active ? T.accentBlue : T.panelBorder}`,
      background: active ? "rgba(91,141,239,0.14)" : "transparent",
      cursor: "pointer", flexShrink: 0, padding: 0,
    }}
  >
    <CalendarIcon active={active} />
  </button>
);

const DatePickerBlock: React.FC<{
  label: string;
  range: { startDate: Date; endDate: Date };
  onChange: (r: { startDate: Date; endDate: Date }) => void;
}> = ({ label, range, onChange }) => (
  <div>
    <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>{label}</div>
    <div style={{ display: "flex", justifyContent: "center", borderRadius: 8, border: `1px solid ${T.panelBorder}` }}>
      <DateRange
        ranges={[{ ...range, key: "selection" }]}
        onChange={(item: RangeKeyDict) =>
          onChange({ startDate: item.selection.startDate!, endDate: item.selection.endDate! })
        }
        moveRangeOnFirstSelection={false}
        rangeColors={[T.accentBlue]}
      />
    </div>
  </div>
);


const COLUMNS: { key: Status; label: string; dot: string }[] = [
  { key: "unassigned", label: "Unassigned",            dot: "#71717a" },
  { key: "pending",    label: "Pending",                dot: "#eab308" },
  { key: "ready",      label: "Ready for Collection",   dot: "#06b6d4" },
  { key: "collected",  label: "Collected",               dot: "#22c55e" },
];

// ─── Empty form state ─────────────────────────────────────────
const emptyForm = {
  buyer_name: "",
  telephone: "",
  job_description: "",
  date_booked: new Date().toISOString().slice(0, 10),
  worker_name: "",
  price: "",
};

// ─── Component ────────────────────────────────────────────────
const JobsPage: React.FC<JobsPageProps> = ({ headerSearch = "" }) => {
  const { session } = useSession();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<"admin" | "user">("user");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const [assignModalJob, setAssignModalJob] = useState<Job | null>(null);
  const [workerInput, setWorkerInput] = useState("");

  const [readyModalJob, setReadyModalJob] = useState<Job | null>(null);
  const [priceInput, setPriceInput] = useState("");

  // Date filters — one pair for "all jobs" (booked + collected), plus a
  // per-column override so Pending / Ready / Collected can each be narrowed
  // independently. Collected gets two: date booked and date collected.
  const [globalBookedRange, setGlobalBookedRange] = useState<DateRangeValue>(null);
  const [globalCollectedRange, setGlobalCollectedRange] = useState<DateRangeValue>(null);
  const [pendingBookedRange, setPendingBookedRange] = useState<DateRangeValue>(null);
  const [readyBookedRange, setReadyBookedRange] = useState<DateRangeValue>(null);
  const [collectedBookedRange, setCollectedBookedRange] = useState<DateRangeValue>(null);
  const [collectedCollectedRange, setCollectedCollectedRange] = useState<DateRangeValue>(null);

  const [filterScope, setFilterScope] = useState<FilterScope | null>(null);
  const [tempRangeA, setTempRangeA] = useState(todayRange()); // the "primary" picker for any scope
  const [tempRangeB, setTempRangeB] = useState(todayRange()); // second picker, global-scope only

  const openFilterModal = (scope: FilterScope) => {
    const current =
      scope === "global" ? globalBookedRange :
      scope === "pendingBooked" ? pendingBookedRange :
      scope === "readyBooked" ? readyBookedRange :
      scope === "collectedBooked" ? collectedBookedRange :
      collectedCollectedRange;
    setTempRangeA(current ?? todayRange());
    setTempRangeB(globalCollectedRange ?? todayRange());
    setFilterScope(scope);
  };

  const applyFilter = () => {
    switch (filterScope) {
      case "global": setGlobalBookedRange(tempRangeA); setGlobalCollectedRange(tempRangeB); break;
      case "pendingBooked": setPendingBookedRange(tempRangeA); break;
      case "readyBooked": setReadyBookedRange(tempRangeA); break;
      case "collectedBooked": setCollectedBookedRange(tempRangeA); break;
      case "collectedCollected": setCollectedCollectedRange(tempRangeA); break;
    }
    setFilterScope(null);
  };

  const clearFilter = () => {
    switch (filterScope) {
      case "global": setGlobalBookedRange(null); setGlobalCollectedRange(null); break;
      case "pendingBooked": setPendingBookedRange(null); break;
      case "readyBooked": setReadyBookedRange(null); break;
      case "collectedBooked": setCollectedBookedRange(null); break;
      case "collectedCollected": setCollectedCollectedRange(null); break;
    }
    setFilterScope(null);
  };

  const isAdmin = role === "admin";

  useEffect(() => {
    if (!session?.user?.id) return;
    supabase.from("profiles").select("role").eq("id", session.user.id).single()
      .then(({ data }) => { if (data?.role === "admin") setRole("admin"); });
  }, [session]);

  // Newest jobs first
  const fetchJobs = () => {
    setLoading(true);
    supabase.from("jobs").select("*").order("created_at", { ascending: false })
      .then(({ data, error }) => {
        if (!error && data) setJobs(data as Job[]);
        setLoading(false);
      });
  };

  useEffect(() => { fetchJobs(); }, []);

  const filteredJobs = useMemo(() => {
    const q = headerSearch.trim().toLowerCase();
    return jobs.filter((j) => {
      const matchesSearch =
        !q ||
        j.buyer_name.toLowerCase().includes(q) ||
        j.telephone.toLowerCase().includes(q) ||
        j.job_description.toLowerCase().includes(q) ||
        (j.worker_name ?? "").toLowerCase().includes(q);
      if (!matchesSearch) return false;
      if (!inDateRange(j.date_booked, globalBookedRange)) return false;
      if (!inDateRange(j.date_collected, globalCollectedRange)) return false;
      return true;
    });
  }, [jobs, headerSearch, globalBookedRange, globalCollectedRange]);

  const byStatus = (s: Status) => {
    let list = filteredJobs.filter((j) => j.status === s);
    if (s === "pending") list = list.filter((j) => inDateRange(j.date_booked, pendingBookedRange));
    if (s === "ready") list = list.filter((j) => inDateRange(j.date_booked, readyBookedRange));
    if (s === "collected") {
      list = list.filter((j) => inDateRange(j.date_booked, collectedBookedRange));
      list = list.filter((j) => inDateRange(j.date_collected, collectedCollectedRange));
    }
    return list;
  };

  const stats = useMemo(() => {
    const revenue = jobs.reduce((sum, j) => sum + (j.price ?? 0), 0);
    return { total: jobs.length, revenue };
  }, [jobs]);

  // ─── Create job ─────────────────────────────────────────────
  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.buyer_name || !form.telephone || !form.job_description) return;
    setSaving(true);
    const hasWorker = form.worker_name.trim().length > 0;
    const { error } = await supabase.from("jobs").insert({
      buyer_name: form.buyer_name,
      telephone: form.telephone,
      job_description: form.job_description,
      date_booked: form.date_booked,
      worker_name: hasWorker ? form.worker_name : null,
      status: hasWorker ? "pending" : "unassigned",
      price: form.price ? Number(form.price) : null,
    });
    setSaving(false);
    if (!error) {
      setForm(emptyForm);
      setShowForm(false);
      fetchJobs();
    }
  };

  // ─── Stage transitions (admin only) ─────────────────────────
  const openAssignModal = (job: Job) => {
    if (!isAdmin) return;
    setAssignModalJob(job);
    setWorkerInput(job.worker_name ?? "");
  };

  const confirmAssign = async () => {
    if (!assignModalJob || !workerInput.trim()) return;
    const { error } = await supabase.from("jobs")
      .update({ worker_name: workerInput.trim(), status: "pending" })
      .eq("id", assignModalJob.id);
    if (!error) {
      setAssignModalJob(null);
      setWorkerInput("");
      fetchJobs();
    }
  };

  const openReadyModal = (job: Job) => {
    if (!isAdmin) return;
    setReadyModalJob(job);
    setPriceInput(job.price !== null ? String(job.price) : "");
  };

  const confirmReady = async () => {
    if (!readyModalJob) return;
    const priceValue = priceInput ? Number(priceInput) : null;
    const { error } = await supabase.from("jobs")
      .update({ price: priceValue, status: "ready" })
      .eq("id", readyModalJob.id);
    if (!error) {
      const updatedJob: Job = { ...readyModalJob, price: priceValue, status: "ready" };
      setReadyModalJob(null);
      setPriceInput("");
      fetchJobs();
      window.open(buildWhatsAppLink(updatedJob), "_blank");
      supabase.from("jobs").update({ whatsapp_sent_at: new Date().toISOString() }).eq("id", updatedJob.id).then();
    }
  };

  const markCollected = async (job: Job) => {
    if (!isAdmin) return;
    const dateCollected = new Date().toISOString().slice(0, 10);
    const { error } = await supabase.from("jobs")
      .update({ status: "collected", date_collected: dateCollected })
      .eq("id", job.id);
    if (!error) {
      const updatedJob: Job = { ...job, status: "collected", date_collected: dateCollected };
      fetchJobs();
      window.open(buildWhatsAppLink(updatedJob), "_blank");
      supabase.from("jobs").update({ whatsapp_sent_at: new Date().toISOString() }).eq("id", updatedJob.id).then();
    }
  };

  const handleSendWhatsApp = (job: Job) => window.open(buildWhatsAppLink(job), "_blank");

  // ─── Card ───────────────────────────────────────────────────
  const JobCard: React.FC<{ job: Job }> = ({ job }) => (
    <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10, padding: 11, marginBottom: 10, minWidth: 0 }}>
      <div style={{
        fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 6,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }} title={job.job_description}>
        {job.job_description}
      </div>
      <div style={{
        fontSize: 12, color: "#d4d4d8", marginBottom: 2,
        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
      }} title={job.buyer_name}>
        {job.buyer_name}
      </div>
      <div style={{ fontSize: 11, color: T.textSecondary, marginBottom: 8 }}>{job.telephone}</div>

      <div style={{ fontSize: 10.5, color: T.textMuted, marginBottom: 8 }}>
        Booked {fmtDate(job.date_booked)}
        {job.status === "collected" && <> · {fmtDate(job.date_collected)}</>}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
          {job.worker_name ? (
            <>
              <div style={{
                width: 20, height: 20, borderRadius: "50%", background: avatarColor(job.worker_name),
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "#0d0d0f", fontSize: 9, fontWeight: 700, flexShrink: 0,
              }}>
                {initials(job.worker_name)}
              </div>
              <span style={{ fontSize: 11.5, color: "#d4d4d8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {job.worker_name}
              </span>
            </>
          ) : (
            <span style={{ fontSize: 11.5, color: T.textMuted, fontStyle: "italic" }}>Unassigned</span>
          )}
        </div>
        <div style={{ fontSize: 12.5, fontWeight: 700, color: T.textPrimary, flexShrink: 0 }}>{fmtMoney(job.price)}</div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.panelBorder}` }}>
        {isAdmin ? (
          <>
            {job.status === "unassigned" && (
              <button onClick={() => openAssignModal(job)} style={{ ...actionBtnStyle, background: T.assign, color: "#fff", border: `1px solid ${T.assignBorder}` }}>
                Assign
              </button>
            )}
            {job.status === "pending" && (
              <button onClick={() => openReadyModal(job)} style={{ ...actionBtnStyle, background: T.ready, color: "#fff", border: "none" }}>
                Mark Ready
              </button>
            )}
            {job.status === "ready" && (
              <button onClick={() => markCollected(job)} style={{ ...actionBtnStyle, background: T.collect, color: "#fff", border: "none" }}>
                Collected
              </button>
            )}
          </>
        ) : (
          job.status !== "collected" && (
            <span style={{ flex: 1, fontSize: 11, color: T.textMuted, display: "flex", alignItems: "center" }}>
              View only
            </span>
          )
        )}

        <button
          onClick={() => handleSendWhatsApp(job)}
          title="Send WhatsApp message"
          style={{
            display: "flex", alignItems: "center", justifyContent: "center",
            width: job.status === "collected" || !isAdmin ? "auto" : 38,
            flex: job.status === "collected" || !isAdmin ? 1 : undefined,
            gap: 6, padding: "4px 6px", borderRadius: 6, border: `1px solid ${T.panelBorder}`, background: T.inputBg, cursor: "pointer", flexShrink: 0,
          }}
        >
          <WhatsAppIcon size={26} />
          {(job.status === "collected" || !isAdmin) && <span style={{ fontSize: 11, fontWeight: 600, color: "#d4d4d8" }}>Message</span>}
        </button>
      </div>
    </div>
  );

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      {/* Hide scrollbars visually but keep scrolling functional */}
      <style>{`
        .jx-col::-webkit-scrollbar { display: none; }
        .jx-col { scrollbar-width: none; -ms-overflow-style: none; }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: T.accentBlue, margin: 0 }}>Jobs Board</h1>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={() => openFilterModal("global")} title={
            globalBookedRange || globalCollectedRange
              ? [
                  globalBookedRange ? `Booked: ${formatRangeLabel(globalBookedRange)}` : null,
                  globalCollectedRange ? `Collected: ${formatRangeLabel(globalCollectedRange)}` : null,
                ].filter(Boolean).join(" · ")
              : "Filter all jobs by date booked and/or date collected"
          } style={{
            display: "flex", alignItems: "center", gap: 7,
            background: (globalBookedRange || globalCollectedRange) ? "rgba(91,141,239,0.15)" : T.inputBg,
            color: T.textPrimary,
            border: `1px solid ${(globalBookedRange || globalCollectedRange) ? T.accentBlue : T.panelBorder}`,
            borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
          }}>
            <CalendarIcon active={!!(globalBookedRange || globalCollectedRange)} />
            Filter by Date
          </button>
          <button onClick={() => setShowForm((s) => !s)} style={{
            display: "flex", alignItems: "center", gap: 6,
            background: T.accentBlue, color: "#fff", border: "none", borderRadius: 8,
            padding: "10px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
          }}>
            + New Job
          </button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 22, maxWidth: 400 }}>
        <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 6 }}>Total Jobs</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary }}>{stats.total}</div>
        </div>
        <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10, padding: "16px 18px" }}>
          <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 6 }}>Revenue (all time)</div>
          <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary }}>{fmtMoney(stats.revenue)}</div>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleCreateJob} style={{
          background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10,
          padding: 20, marginBottom: 22, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14,
        }}>
          <Field label="Customer name">
            <input required value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
              placeholder="e.g. Ali Khan" style={inputStyle} />
          </Field>
          <Field label="Telephone">
            <input required value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
              placeholder="e.g. 07897654321" style={inputStyle} />
          </Field>
          <Field label="Job">
            <input required value={form.job_description} onChange={(e) => setForm({ ...form, job_description: e.target.value })}
              placeholder="e.g. Screen replacement" style={inputStyle} />
          </Field>
          <Field label="Date booked">
            <input required type="date" value={form.date_booked} onChange={(e) => setForm({ ...form, date_booked: e.target.value })}
              style={inputStyle} />
          </Field>
          <Field label="Worker (optional — leave blank to keep Unassigned)">
            <input value={form.worker_name} onChange={(e) => setForm({ ...form, worker_name: e.target.value })}
              placeholder="e.g. Sangar" style={inputStyle} />
          </Field>
          <Field label="Price (optional)">
            <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
              placeholder="e.g. 85.00" style={inputStyle} />
          </Field>

          <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, justifyContent: "flex-end" }}>
            <button type="button" onClick={() => setShowForm(false)} style={secondaryBtnStyle}>Cancel</button>
            <button type="submit" disabled={saving}
              style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: T.accentBlue, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
              {saving ? "Saving…" : "Create Job"}
            </button>
          </div>
        </form>
      )}

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: T.textMuted }}>Loading jobs…</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
          {COLUMNS.map((col) => {
            const colJobs = byStatus(col.key);
            return (
              <div key={col.key} style={{ minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: col.dot, flexShrink: 0 }} />
                  <span style={{
                    fontSize: 12.5, fontWeight: 700, color: T.textPrimary,
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                  }} title={col.label}>
                    {col.label}
                  </span>
                  <span style={{ fontSize: 11.5, color: T.textMuted, flexShrink: 0 }}>{colJobs.length}</span>
                  <div style={{ flex: 1 }} />
                  {col.key === "pending" && (
                    <ColCalendarBtn active={!!pendingBookedRange} range={pendingBookedRange} title="Filter by date booked" onClick={() => openFilterModal("pendingBooked")} />
                  )}
                  {col.key === "ready" && (
                    <ColCalendarBtn active={!!readyBookedRange} range={readyBookedRange} title="Filter by date booked" onClick={() => openFilterModal("readyBooked")} />
                  )}
                  {col.key === "collected" && (
                    <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                      <ColCalendarBtn active={!!collectedBookedRange} range={collectedBookedRange} title="Filter by date booked" onClick={() => openFilterModal("collectedBooked")} />
                      <ColCalendarBtn active={!!collectedCollectedRange} range={collectedCollectedRange} title="Filter by date collected" onClick={() => openFilterModal("collectedCollected")} />
                    </div>
                  )}
                </div>
                <div className="jx-col" style={{ maxHeight: "calc(100vh - 340px)", overflowY: "auto", paddingRight: 2 }}>
                  {colJobs.length === 0 && <div style={{ color: T.textMuted, fontSize: 12.5 }}>No jobs.</div>}
                  {colJobs.map((j) => <JobCard key={j.id} job={j} />)}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Assign worker modal */}
      {assignModalJob && (
        <ModalShell onClose={() => setAssignModalJob(null)}>
          <h3 style={modalTitleStyle}>Assign Worker</h3>
          <p style={modalSubtitleStyle}>{assignModalJob.buyer_name} — {assignModalJob.job_description}</p>
          <Field label="Worker name">
            <input autoFocus value={workerInput} onChange={(e) => setWorkerInput(e.target.value)}
              placeholder="e.g. Sangar" style={inputStyle} />
          </Field>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            <button onClick={() => setAssignModalJob(null)} style={secondaryBtnStyle}>Cancel</button>
            <button onClick={confirmAssign} style={{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${T.assignBorder}`, background: T.assign, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
              Assign
            </button>
          </div>
        </ModalShell>
      )}

      {/* Mark ready modal */}
      {readyModalJob && (
        <ModalShell onClose={() => setReadyModalJob(null)}>
          <h3 style={modalTitleStyle}>Mark Ready for Collection</h3>
          <p style={modalSubtitleStyle}>{readyModalJob.buyer_name} — {readyModalJob.job_description}</p>
          <Field label="Price charged (£)">
            <input autoFocus type="number" min="0" step="0.01" value={priceInput}
              onChange={(e) => setPriceInput(e.target.value)} style={inputStyle} />
          </Field>
          <p style={{ fontSize: 12, color: T.textMuted, margin: "8px 0 0" }}>
            This opens WhatsApp with a "ready for collection" message including the price.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
            <button onClick={() => setReadyModalJob(null)} style={secondaryBtnStyle}>Cancel</button>
            <button onClick={confirmReady} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: T.ready, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
              Confirm & Open WhatsApp
            </button>
          </div>
        </ModalShell>
      )}
      {/* Date filter modal — shared by the global button and all per-column calendar icons */}
      {filterScope && (
        <ModalShell onClose={() => setFilterScope(null)} width={400} padding={18}>
          <h3 style={modalTitleStyle}>
            {filterScope === "global" && "Filter Jobs by Date"}
            {filterScope === "pendingBooked" && "Pending — Filter by Date Booked"}
            {filterScope === "readyBooked" && "Ready for Collection — Filter by Date Booked"}
            {filterScope === "collectedBooked" && "Collected — Filter by Date Booked"}
            {filterScope === "collectedCollected" && "Collected — Filter by Date Collected"}
          </h3>
          <p style={modalSubtitleStyle}>Pick a date range to narrow down the jobs shown.</p>

          {filterScope === "global" ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <DatePickerBlock label="Date Booked" range={tempRangeA} onChange={setTempRangeA} />
              <DatePickerBlock label="Date Collected" range={tempRangeB} onChange={setTempRangeB} />
            </div>
          ) : (
            <DatePickerBlock
              label={filterScope === "collectedCollected" ? "Date Collected" : "Date Booked"}
              range={tempRangeA}
              onChange={setTempRangeA}
            />
          )}

          <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 16 }}>
            <button onClick={clearFilter} style={smallBtnStyle}>Clear filter</button>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => setFilterScope(null)} style={smallBtnStyle}>Cancel</button>
              <button onClick={applyFilter} style={{ ...smallBtnStyle, border: "none", background: T.accentBlue, color: "#fff", fontWeight: 600 }}>
                Apply
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
};

// ─── small styled bits ─────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: "100%", boxSizing: "border-box", padding: "9px 12px",
  border: `1px solid ${T.panelBorder}`, borderRadius: 8, fontSize: 13.5,
  fontFamily: "'DM Sans', sans-serif", outline: "none", color: T.textPrimary, background: T.inputBg,
};

const actionBtnStyle: React.CSSProperties = {
  flex: 1, padding: "7px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
};

const secondaryBtnStyle: React.CSSProperties = {
  padding: "9px 16px", borderRadius: 8, border: `1px solid ${T.panelBorder}`, background: T.inputBg,
  color: T.textPrimary, fontSize: 13.5, cursor: "pointer",
};

const smallBtnStyle: React.CSSProperties = {
  padding: "6px 12px", borderRadius: 7, border: `1px solid ${T.panelBorder}`, background: T.inputBg,
  color: T.textPrimary, fontSize: 12, cursor: "pointer",
};

const modalTitleStyle: React.CSSProperties = { margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: T.textPrimary };
const modalSubtitleStyle: React.CSSProperties = { margin: "0 0 16px", fontSize: 13, color: T.textSecondary };

const ModalShell: React.FC<{ children: React.ReactNode; onClose: () => void; width?: number; padding?: number }> = ({ children, onClose, width = 360, padding = 24 }) => (
  <div onClick={onClose} style={{
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16,
  }}>
    <div onClick={(e) => e.stopPropagation()} style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 12, padding, width, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto" }}>
      {children}
    </div>
  </div>
);

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <label style={{ display: "block", fontSize: 12, color: T.textSecondary, fontWeight: 600, marginBottom: 5 }}>
    {label}
    <div style={{ marginTop: 5 }}>{children}</div>
  </label>
);

export default JobsPage;


// import React, { useEffect, useMemo, useState } from "react";
// import supabase from "../../supabase";
// import { useSession } from "../../context/SessionContext";
// import { DateRange, RangeKeyDict } from "react-date-range";
// import "react-date-range/dist/styles.css";
// import "react-date-range/dist/theme/default.css";

// // ─── Types ────────────────────────────────────────────────────
// type Status = "unassigned" | "pending" | "ready" | "collected";

// type DateRangeValue = { startDate: Date; endDate: Date } | null;
// type FilterScope = "global" | "pendingBooked" | "readyBooked" | "collectedBooked" | "collectedCollected";

// type Job = {
//   id: string;
//   buyer_name: string;
//   telephone: string;
//   job_description: string;
//   date_booked: string;        // yyyy-mm-dd
//   worker_name: string | null;
//   status: Status;
//   price: number | null;
//   date_collected: string | null;
//   whatsapp_sent_at: string | null;
//   created_at: string;
// };

// interface JobsPageProps {
//   headerSearch?: string;
//   headerLocation?: string; // not used for jobs, kept for prop-compatibility with AppDashboard
// }

// const WEBSITE_URL = "https://cellxperts.netlify.app";

// // ─── Dark theme palette ─────────────────────────────────────────
// const T = {
//   page: "transparent",           // AppDashboard already sets the dark page background
//   panel: "#18181b",
//   panelBorder: "#2a2a2e",
//   textPrimary: "#f4f4f5",
//   textSecondary: "#9ca3af",
//   textMuted: "#6b7280",
//   inputBg: "#0f0f11",
//   accentBlue: "#5b8def",
//   assign: "#000000",
//   assignBorder: "#3f3f46",
//   ready: "#eab308",
//   collect: "#3b82f6",
//   danger: "#ef4444",
// };

// // ─── Helpers ──────────────────────────────────────────────────
// const fmtMoney = (n: number | null) =>
//   n === null || n === undefined ? "—" : `£${Number(n).toFixed(2)}`;

// const fmtDate = (d: string | null) => {
//   if (!d) return "—";
//   const dt = new Date(d + "T00:00:00");
//   return dt.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
// };

// const toWhatsAppNumber = (raw: string) => {
//   let digits = raw.replace(/[^\d+]/g, "");
//   if (digits.startsWith("+")) digits = digits.slice(1);
//   if (digits.startsWith("0")) digits = "44" + digits.slice(1); // default: UK
//   return digits;
// };

// const todayRange = (): { startDate: Date; endDate: Date } => {
//   const d = new Date();
//   return { startDate: d, endDate: d };
// };

// // A date filter with no range set lets everything through; a filter with a
// // range set excludes jobs whose relevant date is missing (e.g. filtering by
// // "date collected" on a job that hasn't been collected yet).
// const inDateRange = (dateStr: string | null, range: DateRangeValue) => {
//   if (!range) return true;
//   if (!dateStr) return false;
//   const d = new Date(dateStr + "T00:00:00").getTime();
//   const s = new Date(range.startDate); s.setHours(0, 0, 0, 0);
//   const e = new Date(range.endDate); e.setHours(23, 59, 59, 999);
//   return d >= s.getTime() && d <= e.getTime();
// };

// const fmtShort = (d: Date) => d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
// const formatRangeLabel = (range: DateRangeValue) => {
//   if (!range) return null;
//   const sameDay = range.startDate.toDateString() === range.endDate.toDateString();
//   return sameDay ? fmtShort(range.startDate) : `${fmtShort(range.startDate)} – ${fmtShort(range.endDate)}`;
// };

// // One message per stage. All are addressed to the customer (buyer_name).
// const buildWhatsAppMessage = (job: Job) => {
//   switch (job.status) {
//     case "ready":
//       return (
//         `Hi ${job.buyer_name}, this is Cell Xperts. Your ${job.job_description} is complete and ready for collection. ` +
//         `Total to pay: ${fmtMoney(job.price)}. See you soon!`
//       );
//     case "collected":
//       return (
//         `Hi ${job.buyer_name}, thank you for choosing Cell Xperts! We hope you're happy with your ${job.job_description}. ` +
//         `Visit ${WEBSITE_URL} to view or book any of our other services. See you again soon!`
//       );
//     case "pending":
//       return (
//         `Hi ${job.buyer_name}, this is Cell Xperts. Just an update — your ${job.job_description} is currently being worked on by ` +
//         `${job.worker_name ?? "our team"}. We'll message you as soon as it's ready!`
//       );
//     default: // unassigned
//       return (
//         `Hi ${job.buyer_name}, this is Cell Xperts. We've received your ${job.job_description} booking and will be assigning it ` +
//         `to a technician shortly. We'll keep you posted!`
//       );
//   }
// };

// const buildWhatsAppLink = (job: Job) =>
//   `https://wa.me/${toWhatsAppNumber(job.telephone)}?text=${encodeURIComponent(buildWhatsAppMessage(job))}`;

// const AVATAR_COLORS = ["#5b8def", "#a78bfa", "#2dd4bf", "#f87171", "#fb923c", "#e5e7eb", "#38bdf8"];
// const avatarColor = (name: string) => {
//   let hash = 0;
//   for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
//   return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
// };
// const initials = (name: string) =>
//   name.split(" ").filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join("");

// // Real WhatsApp logo — place the provided image at /public/whatsapp-icon.png
// // Rendered at its native aspect ratio; no extra border-radius needed since
// // the source PNG is already a rounded squircle.
// const WhatsAppIcon: React.FC<{ size?: number }> = ({ size = 26 }) => (
//   <img src="/whatsapp-icon.png" alt="WhatsApp" width={size} height={size} style={{ display: "block", objectFit: "contain" }} />
// );

// // ─── Date filter UI bits ─────────────────────────────────────────
// const CalendarIcon: React.FC<{ active?: boolean }> = ({ active }) => (
//   <svg width="12.5" height="12.5" viewBox="0 0 24 24" fill="none" stroke={active ? T.accentBlue : T.textSecondary} strokeWidth="2">
//     <rect x="3" y="4" width="18" height="18" rx="2" />
//     <line x1="16" y1="2" x2="16" y2="6" />
//     <line x1="8" y1="2" x2="8" y2="6" />
//     <line x1="3" y1="10" x2="21" y2="10" />
//   </svg>
// );

// const ColCalendarBtn: React.FC<{ active: boolean; title: string; range?: DateRangeValue; onClick: () => void }> = ({ active, title, range, onClick }) => (
//   <button
//     onClick={onClick}
//     title={active && range ? `${title} (${formatRangeLabel(range)})` : title}
//     style={{
//       display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20,
//       borderRadius: 5, border: `1px solid ${active ? T.accentBlue : T.panelBorder}`,
//       background: active ? "rgba(91,141,239,0.14)" : "transparent",
//       cursor: "pointer", flexShrink: 0, padding: 0,
//     }}
//   >
//     <CalendarIcon active={active} />
//   </button>
// );

// const DatePickerBlock: React.FC<{
//   label: string;
//   range: { startDate: Date; endDate: Date };
//   onChange: (r: { startDate: Date; endDate: Date }) => void;
// }> = ({ label, range, onChange }) => (
//   <div>
//     <div style={{ fontSize: 12, fontWeight: 600, color: T.textSecondary, marginBottom: 6 }}>{label}</div>
//     <div style={{ display: "flex", justifyContent: "center", borderRadius: 8, border: `1px solid ${T.panelBorder}` }}>
//       <DateRange
//         ranges={[{ ...range, key: "selection" }]}
//         onChange={(item: RangeKeyDict) =>
//           onChange({ startDate: item.selection.startDate!, endDate: item.selection.endDate! })
//         }
//         moveRangeOnFirstSelection={false}
//         rangeColors={[T.accentBlue]}
//       />
//     </div>
//   </div>
// );


// const COLUMNS: { key: Status; label: string; dot: string }[] = [
//   { key: "unassigned", label: "Unassigned",            dot: "#71717a" },
//   { key: "pending",    label: "Pending",                dot: "#eab308" },
//   { key: "ready",      label: "Ready for Collection",   dot: "#06b6d4" },
//   { key: "collected",  label: "Collected",               dot: "#22c55e" },
// ];

// // ─── Empty form state ─────────────────────────────────────────
// const emptyForm = {
//   buyer_name: "",
//   telephone: "",
//   job_description: "",
//   date_booked: new Date().toISOString().slice(0, 10),
//   worker_name: "",
//   price: "",
// };

// // ─── Component ────────────────────────────────────────────────
// const JobsPage: React.FC<JobsPageProps> = ({ headerSearch = "" }) => {
//   const { session } = useSession();

//   const [jobs, setJobs] = useState<Job[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [role, setRole] = useState<"admin" | "user">("user");
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState(emptyForm);
//   const [saving, setSaving] = useState(false);

//   const [assignModalJob, setAssignModalJob] = useState<Job | null>(null);
//   const [workerInput, setWorkerInput] = useState("");

//   const [readyModalJob, setReadyModalJob] = useState<Job | null>(null);
//   const [priceInput, setPriceInput] = useState("");

//   // Date filters — one pair for "all jobs" (booked + collected), plus a
//   // per-column override so Pending / Ready / Collected can each be narrowed
//   // independently. Collected gets two: date booked and date collected.
//   const [globalBookedRange, setGlobalBookedRange] = useState<DateRangeValue>(null);
//   const [globalCollectedRange, setGlobalCollectedRange] = useState<DateRangeValue>(null);
//   const [pendingBookedRange, setPendingBookedRange] = useState<DateRangeValue>(null);
//   const [readyBookedRange, setReadyBookedRange] = useState<DateRangeValue>(null);
//   const [collectedBookedRange, setCollectedBookedRange] = useState<DateRangeValue>(null);
//   const [collectedCollectedRange, setCollectedCollectedRange] = useState<DateRangeValue>(null);

//   const [filterScope, setFilterScope] = useState<FilterScope | null>(null);
//   const [tempRangeA, setTempRangeA] = useState(todayRange()); // the "primary" picker for any scope
//   const [tempRangeB, setTempRangeB] = useState(todayRange()); // second picker, global-scope only

//   const openFilterModal = (scope: FilterScope) => {
//     const current =
//       scope === "global" ? globalBookedRange :
//       scope === "pendingBooked" ? pendingBookedRange :
//       scope === "readyBooked" ? readyBookedRange :
//       scope === "collectedBooked" ? collectedBookedRange :
//       collectedCollectedRange;
//     setTempRangeA(current ?? todayRange());
//     setTempRangeB(globalCollectedRange ?? todayRange());
//     setFilterScope(scope);
//   };

//   const applyFilter = () => {
//     switch (filterScope) {
//       case "global": setGlobalBookedRange(tempRangeA); setGlobalCollectedRange(tempRangeB); break;
//       case "pendingBooked": setPendingBookedRange(tempRangeA); break;
//       case "readyBooked": setReadyBookedRange(tempRangeA); break;
//       case "collectedBooked": setCollectedBookedRange(tempRangeA); break;
//       case "collectedCollected": setCollectedCollectedRange(tempRangeA); break;
//     }
//     setFilterScope(null);
//   };

//   const clearFilter = () => {
//     switch (filterScope) {
//       case "global": setGlobalBookedRange(null); setGlobalCollectedRange(null); break;
//       case "pendingBooked": setPendingBookedRange(null); break;
//       case "readyBooked": setReadyBookedRange(null); break;
//       case "collectedBooked": setCollectedBookedRange(null); break;
//       case "collectedCollected": setCollectedCollectedRange(null); break;
//     }
//     setFilterScope(null);
//   };

//   const isAdmin = role === "admin";

//   useEffect(() => {
//     if (!session?.user?.id) return;
//     supabase.from("profiles").select("role").eq("id", session.user.id).single()
//       .then(({ data }) => { if (data?.role === "admin") setRole("admin"); });
//   }, [session]);

//   // Newest jobs first
//   const fetchJobs = () => {
//     setLoading(true);
//     supabase.from("jobs").select("*").order("created_at", { ascending: false })
//       .then(({ data, error }) => {
//         if (!error && data) setJobs(data as Job[]);
//         setLoading(false);
//       });
//   };

//   useEffect(() => { fetchJobs(); }, []);

//   const filteredJobs = useMemo(() => {
//     const q = headerSearch.trim().toLowerCase();
//     return jobs.filter((j) => {
//       const matchesSearch =
//         !q ||
//         j.buyer_name.toLowerCase().includes(q) ||
//         j.telephone.toLowerCase().includes(q) ||
//         j.job_description.toLowerCase().includes(q) ||
//         (j.worker_name ?? "").toLowerCase().includes(q);
//       if (!matchesSearch) return false;
//       if (!inDateRange(j.date_booked, globalBookedRange)) return false;
//       if (!inDateRange(j.date_collected, globalCollectedRange)) return false;
//       return true;
//     });
//   }, [jobs, headerSearch, globalBookedRange, globalCollectedRange]);

//   const byStatus = (s: Status) => {
//     let list = filteredJobs.filter((j) => j.status === s);
//     if (s === "pending") list = list.filter((j) => inDateRange(j.date_booked, pendingBookedRange));
//     if (s === "ready") list = list.filter((j) => inDateRange(j.date_booked, readyBookedRange));
//     if (s === "collected") {
//       list = list.filter((j) => inDateRange(j.date_booked, collectedBookedRange));
//       list = list.filter((j) => inDateRange(j.date_collected, collectedCollectedRange));
//     }
//     return list;
//   };

//   const stats = useMemo(() => {
//     const revenue = jobs.reduce((sum, j) => sum + (j.price ?? 0), 0);
//     return { total: jobs.length, revenue };
//   }, [jobs]);

//   // ─── Create job ─────────────────────────────────────────────
//   const handleCreateJob = async (e: React.FormEvent) => {
//     e.preventDefault();
//     if (!form.buyer_name || !form.telephone || !form.job_description) return;
//     setSaving(true);
//     const hasWorker = form.worker_name.trim().length > 0;
//     const { error } = await supabase.from("jobs").insert({
//       buyer_name: form.buyer_name,
//       telephone: form.telephone,
//       job_description: form.job_description,
//       date_booked: form.date_booked,
//       worker_name: hasWorker ? form.worker_name : null,
//       status: hasWorker ? "pending" : "unassigned",
//       price: form.price ? Number(form.price) : null,
//     });
//     setSaving(false);
//     if (!error) {
//       setForm(emptyForm);
//       setShowForm(false);
//       fetchJobs();
//     }
//   };

//   // ─── Stage transitions (admin only) ─────────────────────────
//   const openAssignModal = (job: Job) => {
//     if (!isAdmin) return;
//     setAssignModalJob(job);
//     setWorkerInput(job.worker_name ?? "");
//   };

//   const confirmAssign = async () => {
//     if (!assignModalJob || !workerInput.trim()) return;
//     const { error } = await supabase.from("jobs")
//       .update({ worker_name: workerInput.trim(), status: "pending" })
//       .eq("id", assignModalJob.id);
//     if (!error) {
//       setAssignModalJob(null);
//       setWorkerInput("");
//       fetchJobs();
//     }
//   };

//   const openReadyModal = (job: Job) => {
//     if (!isAdmin) return;
//     setReadyModalJob(job);
//     setPriceInput(job.price !== null ? String(job.price) : "");
//   };

//   const confirmReady = async () => {
//     if (!readyModalJob) return;
//     const priceValue = priceInput ? Number(priceInput) : null;
//     const { error } = await supabase.from("jobs")
//       .update({ price: priceValue, status: "ready" })
//       .eq("id", readyModalJob.id);
//     if (!error) {
//       const updatedJob: Job = { ...readyModalJob, price: priceValue, status: "ready" };
//       setReadyModalJob(null);
//       setPriceInput("");
//       fetchJobs();
//       window.open(buildWhatsAppLink(updatedJob), "_blank");
//       supabase.from("jobs").update({ whatsapp_sent_at: new Date().toISOString() }).eq("id", updatedJob.id).then();
//     }
//   };

//   const markCollected = async (job: Job) => {
//     if (!isAdmin) return;
//     const dateCollected = new Date().toISOString().slice(0, 10);
//     const { error } = await supabase.from("jobs")
//       .update({ status: "collected", date_collected: dateCollected })
//       .eq("id", job.id);
//     if (!error) {
//       const updatedJob: Job = { ...job, status: "collected", date_collected: dateCollected };
//       fetchJobs();
//       window.open(buildWhatsAppLink(updatedJob), "_blank");
//       supabase.from("jobs").update({ whatsapp_sent_at: new Date().toISOString() }).eq("id", updatedJob.id).then();
//     }
//   };

//   const handleSendWhatsApp = (job: Job) => window.open(buildWhatsAppLink(job), "_blank");

//   // ─── Card ───────────────────────────────────────────────────
//   const JobCard: React.FC<{ job: Job }> = ({ job }) => (
//     <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10, padding: 11, marginBottom: 10, minWidth: 0 }}>
//       <div style={{
//         fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 6,
//         overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//       }} title={job.job_description}>
//         {job.job_description}
//       </div>
//       <div style={{
//         fontSize: 12, color: "#d4d4d8", marginBottom: 2,
//         overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//       }} title={job.buyer_name}>
//         {job.buyer_name}
//       </div>
//       <div style={{ fontSize: 11, color: T.textSecondary, marginBottom: 8 }}>{job.telephone}</div>

//       <div style={{ fontSize: 10.5, color: T.textMuted, marginBottom: 8 }}>
//         Booked {fmtDate(job.date_booked)}
//         {job.status === "collected" && <> · {fmtDate(job.date_collected)}</>}
//       </div>

//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
//         <div style={{ display: "flex", alignItems: "center", gap: 6, minWidth: 0 }}>
//           {job.worker_name ? (
//             <>
//               <div style={{
//                 width: 20, height: 20, borderRadius: "50%", background: avatarColor(job.worker_name),
//                 display: "flex", alignItems: "center", justifyContent: "center",
//                 color: "#0d0d0f", fontSize: 9, fontWeight: 700, flexShrink: 0,
//               }}>
//                 {initials(job.worker_name)}
//               </div>
//               <span style={{ fontSize: 11.5, color: "#d4d4d8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
//                 {job.worker_name}
//               </span>
//             </>
//           ) : (
//             <span style={{ fontSize: 11.5, color: T.textMuted, fontStyle: "italic" }}>Unassigned</span>
//           )}
//         </div>
//         <div style={{ fontSize: 12.5, fontWeight: 700, color: T.textPrimary, flexShrink: 0 }}>{fmtMoney(job.price)}</div>
//       </div>

//       <div style={{ display: "flex", gap: 6, marginTop: 10, paddingTop: 10, borderTop: `1px solid ${T.panelBorder}` }}>
//         {isAdmin ? (
//           <>
//             {job.status === "unassigned" && (
//               <button onClick={() => openAssignModal(job)} style={{ ...actionBtnStyle, background: T.assign, color: "#fff", border: `1px solid ${T.assignBorder}` }}>
//                 Assign
//               </button>
//             )}
//             {job.status === "pending" && (
//               <button onClick={() => openReadyModal(job)} style={{ ...actionBtnStyle, background: T.ready, color: "#fff", border: "none" }}>
//                 Mark Ready
//               </button>
//             )}
//             {job.status === "ready" && (
//               <button onClick={() => markCollected(job)} style={{ ...actionBtnStyle, background: T.collect, color: "#fff", border: "none" }}>
//                 Collected
//               </button>
//             )}
//           </>
//         ) : (
//           job.status !== "collected" && (
//             <span style={{ flex: 1, fontSize: 11, color: T.textMuted, display: "flex", alignItems: "center" }}>
//               View only
//             </span>
//           )
//         )}

//         <button
//           onClick={() => handleSendWhatsApp(job)}
//           title="Send WhatsApp message"
//           style={{
//             display: "flex", alignItems: "center", justifyContent: "center",
//             width: job.status === "collected" || !isAdmin ? "auto" : 38,
//             flex: job.status === "collected" || !isAdmin ? 1 : undefined,
//             gap: 6, padding: "4px 6px", borderRadius: 6, border: `1px solid ${T.panelBorder}`, background: T.inputBg, cursor: "pointer", flexShrink: 0,
//           }}
//         >
//           <WhatsAppIcon size={26} />
//           {(job.status === "collected" || !isAdmin) && <span style={{ fontSize: 11, fontWeight: 600, color: "#d4d4d8" }}>Message</span>}
//         </button>
//       </div>
//     </div>
//   );

//   // ─── Render ─────────────────────────────────────────────────
//   return (
//     <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
//       {/* Hide scrollbars visually but keep scrolling functional */}
//       <style>{`
//         .jx-col::-webkit-scrollbar { display: none; }
//         .jx-col { scrollbar-width: none; -ms-overflow-style: none; }
//       `}</style>

//       <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
//         <h1 style={{ fontSize: 26, fontWeight: 800, color: T.accentBlue, margin: 0 }}>Jobs Board</h1>
//         <div style={{ display: "flex", gap: 10 }}>
//           <button onClick={() => openFilterModal("global")} title={
//             globalBookedRange || globalCollectedRange
//               ? [
//                   globalBookedRange ? `Booked: ${formatRangeLabel(globalBookedRange)}` : null,
//                   globalCollectedRange ? `Collected: ${formatRangeLabel(globalCollectedRange)}` : null,
//                 ].filter(Boolean).join(" · ")
//               : "Filter all jobs by date booked and/or date collected"
//           } style={{
//             display: "flex", alignItems: "center", gap: 7,
//             background: (globalBookedRange || globalCollectedRange) ? "rgba(91,141,239,0.15)" : T.inputBg,
//             color: T.textPrimary,
//             border: `1px solid ${(globalBookedRange || globalCollectedRange) ? T.accentBlue : T.panelBorder}`,
//             borderRadius: 8, padding: "10px 16px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
//           }}>
//             <CalendarIcon active={!!(globalBookedRange || globalCollectedRange)} />
//             Filter by Date
//           </button>
//           <button onClick={() => setShowForm((s) => !s)} style={{
//             display: "flex", alignItems: "center", gap: 6,
//             background: T.accentBlue, color: "#fff", border: "none", borderRadius: 8,
//             padding: "10px 18px", fontSize: 13.5, fontWeight: 600, cursor: "pointer",
//           }}>
//             + New Job
//           </button>
//         </div>
//       </div>

//       <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, marginBottom: 22, maxWidth: 400 }}>
//         <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10, padding: "16px 18px" }}>
//           <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 6 }}>Total Jobs</div>
//           <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary }}>{stats.total}</div>
//         </div>
//         <div style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10, padding: "16px 18px" }}>
//           <div style={{ fontSize: 12, color: T.textSecondary, marginBottom: 6 }}>Revenue (all time)</div>
//           <div style={{ fontSize: 22, fontWeight: 800, color: T.textPrimary }}>{fmtMoney(stats.revenue)}</div>
//         </div>
//       </div>

//       {showForm && (
//         <form onSubmit={handleCreateJob} style={{
//           background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 10,
//           padding: 20, marginBottom: 22, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14,
//         }}>
//           <Field label="Customer name">
//             <input required value={form.buyer_name} onChange={(e) => setForm({ ...form, buyer_name: e.target.value })}
//               placeholder="e.g. Ali Khan" style={inputStyle} />
//           </Field>
//           <Field label="Telephone">
//             <input required value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })}
//               placeholder="e.g. 07897654321" style={inputStyle} />
//           </Field>
//           <Field label="Job">
//             <input required value={form.job_description} onChange={(e) => setForm({ ...form, job_description: e.target.value })}
//               placeholder="e.g. Screen replacement" style={inputStyle} />
//           </Field>
//           <Field label="Date booked">
//             <input required type="date" value={form.date_booked} onChange={(e) => setForm({ ...form, date_booked: e.target.value })}
//               style={inputStyle} />
//           </Field>
//           <Field label="Worker (optional — leave blank to keep Unassigned)">
//             <input value={form.worker_name} onChange={(e) => setForm({ ...form, worker_name: e.target.value })}
//               placeholder="e.g. Sangar" style={inputStyle} />
//           </Field>
//           <Field label="Price (optional)">
//             <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
//               placeholder="e.g. 85.00" style={inputStyle} />
//           </Field>

//           <div style={{ gridColumn: "1 / -1", display: "flex", gap: 10, justifyContent: "flex-end" }}>
//             <button type="button" onClick={() => setShowForm(false)} style={secondaryBtnStyle}>Cancel</button>
//             <button type="submit" disabled={saving}
//               style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: T.accentBlue, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
//               {saving ? "Saving…" : "Create Job"}
//             </button>
//           </div>
//         </form>
//       )}

//       {loading ? (
//         <div style={{ padding: 40, textAlign: "center", color: T.textMuted }}>Loading jobs…</div>
//       ) : (
//         <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: 12 }}>
//           {COLUMNS.map((col) => {
//             const colJobs = byStatus(col.key);
//             return (
//               <div key={col.key} style={{ minWidth: 0 }}>
//                 <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
//                   <span style={{ width: 7, height: 7, borderRadius: "50%", background: col.dot, flexShrink: 0 }} />
//                   <span style={{
//                     fontSize: 12.5, fontWeight: 700, color: T.textPrimary,
//                     overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
//                   }} title={col.label}>
//                     {col.label}
//                   </span>
//                   <span style={{ fontSize: 11.5, color: T.textMuted, flexShrink: 0 }}>{colJobs.length}</span>
//                   <div style={{ flex: 1 }} />
//                   {col.key === "pending" && (
//                     <ColCalendarBtn active={!!pendingBookedRange} range={pendingBookedRange} title="Filter by date booked" onClick={() => openFilterModal("pendingBooked")} />
//                   )}
//                   {col.key === "ready" && (
//                     <ColCalendarBtn active={!!readyBookedRange} range={readyBookedRange} title="Filter by date booked" onClick={() => openFilterModal("readyBooked")} />
//                   )}
//                   {col.key === "collected" && (
//                     <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
//                       <ColCalendarBtn active={!!collectedBookedRange} range={collectedBookedRange} title="Filter by date booked" onClick={() => openFilterModal("collectedBooked")} />
//                       <ColCalendarBtn active={!!collectedCollectedRange} range={collectedCollectedRange} title="Filter by date collected" onClick={() => openFilterModal("collectedCollected")} />
//                     </div>
//                   )}
//                 </div>
//                 <div className="jx-col" style={{ maxHeight: "calc(100vh - 340px)", overflowY: "auto", paddingRight: 2 }}>
//                   {colJobs.length === 0 && <div style={{ color: T.textMuted, fontSize: 12.5 }}>No jobs.</div>}
//                   {colJobs.map((j) => <JobCard key={j.id} job={j} />)}
//                 </div>
//               </div>
//             );
//           })}
//         </div>
//       )}

//       {/* Assign worker modal */}
//       {assignModalJob && (
//         <ModalShell onClose={() => setAssignModalJob(null)}>
//           <h3 style={modalTitleStyle}>Assign Worker</h3>
//           <p style={modalSubtitleStyle}>{assignModalJob.buyer_name} — {assignModalJob.job_description}</p>
//           <Field label="Worker name">
//             <input autoFocus value={workerInput} onChange={(e) => setWorkerInput(e.target.value)}
//               placeholder="e.g. Sangar" style={inputStyle} />
//           </Field>
//           <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
//             <button onClick={() => setAssignModalJob(null)} style={secondaryBtnStyle}>Cancel</button>
//             <button onClick={confirmAssign} style={{ padding: "9px 18px", borderRadius: 8, border: `1px solid ${T.assignBorder}`, background: T.assign, color: "#fff", fontSize: 13.5, fontWeight: 600, cursor: "pointer" }}>
//               Assign
//             </button>
//           </div>
//         </ModalShell>
//       )}

//       {/* Mark ready modal */}
//       {readyModalJob && (
//         <ModalShell onClose={() => setReadyModalJob(null)}>
//           <h3 style={modalTitleStyle}>Mark Ready for Collection</h3>
//           <p style={modalSubtitleStyle}>{readyModalJob.buyer_name} — {readyModalJob.job_description}</p>
//           <Field label="Price charged (£)">
//             <input autoFocus type="number" min="0" step="0.01" value={priceInput}
//               onChange={(e) => setPriceInput(e.target.value)} style={inputStyle} />
//           </Field>
//           <p style={{ fontSize: 12, color: T.textMuted, margin: "8px 0 0" }}>
//             This opens WhatsApp with a "ready for collection" message including the price.
//           </p>
//           <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 18 }}>
//             <button onClick={() => setReadyModalJob(null)} style={secondaryBtnStyle}>Cancel</button>
//             <button onClick={confirmReady} style={{ padding: "9px 18px", borderRadius: 8, border: "none", background: T.ready, color: "#fff", fontSize: 13.5, fontWeight: 700, cursor: "pointer" }}>
//               Confirm & Open WhatsApp
//             </button>
//           </div>
//         </ModalShell>
//       )}
//       {/* Date filter modal — shared by the global button and all per-column calendar icons */}
//       {filterScope && (
//         <ModalShell onClose={() => setFilterScope(null)} width={400} padding={18}>
//           <h3 style={modalTitleStyle}>
//             {filterScope === "global" && "Filter Jobs by Date"}
//             {filterScope === "pendingBooked" && "Pending — Filter by Date Booked"}
//             {filterScope === "readyBooked" && "Ready for Collection — Filter by Date Booked"}
//             {filterScope === "collectedBooked" && "Collected — Filter by Date Booked"}
//             {filterScope === "collectedCollected" && "Collected — Filter by Date Collected"}
//           </h3>
//           <p style={modalSubtitleStyle}>Pick a date range to narrow down the jobs shown.</p>

//           {filterScope === "global" ? (
//             <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
//               <DatePickerBlock label="Date Booked" range={tempRangeA} onChange={setTempRangeA} />
//               <DatePickerBlock label="Date Collected" range={tempRangeB} onChange={setTempRangeB} />
//             </div>
//           ) : (
//             <DatePickerBlock
//               label={filterScope === "collectedCollected" ? "Date Collected" : "Date Booked"}
//               range={tempRangeA}
//               onChange={setTempRangeA}
//             />
//           )}

//           <div style={{ display: "flex", gap: 8, justifyContent: "space-between", marginTop: 16 }}>
//             <button onClick={clearFilter} style={smallBtnStyle}>Clear filter</button>
//             <div style={{ display: "flex", gap: 8 }}>
//               <button onClick={() => setFilterScope(null)} style={smallBtnStyle}>Cancel</button>
//               <button onClick={applyFilter} style={{ ...smallBtnStyle, border: "none", background: T.accentBlue, color: "#fff", fontWeight: 600 }}>
//                 Apply
//               </button>
//             </div>
//           </div>
//         </ModalShell>
//       )}
//     </div>
//   );
// };

// // ─── small styled bits ─────────────────────────────────────────
// const inputStyle: React.CSSProperties = {
//   width: "100%", boxSizing: "border-box", padding: "9px 12px",
//   border: `1px solid ${T.panelBorder}`, borderRadius: 8, fontSize: 13.5,
//   fontFamily: "'DM Sans', sans-serif", outline: "none", color: T.textPrimary, background: T.inputBg,
// };

// const actionBtnStyle: React.CSSProperties = {
//   flex: 1, padding: "7px 10px", borderRadius: 7, fontSize: 12, fontWeight: 600, cursor: "pointer",
// };

// const secondaryBtnStyle: React.CSSProperties = {
//   padding: "9px 16px", borderRadius: 8, border: `1px solid ${T.panelBorder}`, background: T.inputBg,
//   color: T.textPrimary, fontSize: 13.5, cursor: "pointer",
// };

// const smallBtnStyle: React.CSSProperties = {
//   padding: "6px 12px", borderRadius: 7, border: `1px solid ${T.panelBorder}`, background: T.inputBg,
//   color: T.textPrimary, fontSize: 12, cursor: "pointer",
// };

// const modalTitleStyle: React.CSSProperties = { margin: "0 0 4px", fontSize: 16, fontWeight: 700, color: T.textPrimary };
// const modalSubtitleStyle: React.CSSProperties = { margin: "0 0 16px", fontSize: 13, color: T.textSecondary };

// const ModalShell: React.FC<{ children: React.ReactNode; onClose: () => void; width?: number; padding?: number }> = ({ children, onClose, width = 360, padding = 24 }) => (
//   <div onClick={onClose} style={{
//     position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)",
//     display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50, padding: 16,
//   }}>
//     <div onClick={(e) => e.stopPropagation()} style={{ background: T.panel, border: `1px solid ${T.panelBorder}`, borderRadius: 12, padding, width, maxWidth: "100%", maxHeight: "90vh", overflowY: "auto" }}>
//       {children}
//     </div>
//   </div>
// );

// const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
//   <label style={{ display: "block", fontSize: 12, color: T.textSecondary, fontWeight: 600, marginBottom: 5 }}>
//     {label}
//     <div style={{ marginTop: 5 }}>{children}</div>
//   </label>
// );

// export default JobsPage;
