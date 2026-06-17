// // src/components/pages/InvoicePage.tsx
// // Run once: npm install jspdf html2canvas

// import React, { useEffect, useRef, useState } from "react";
// import { jsPDF } from "jspdf";
// import html2canvas from "html2canvas";
// import supabase from "../../../supabase";

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface LineItem {
//   shippingCode: string;
//   description: string;
//   qty: number;
//   unitPrice: number;
// }

// interface InvoiceData {
//   invoiceNumber: string;
//   businessCode: string;
//   date: string;
//   shipper: string;
//   consignee: string;
//   origin: string;
//   destination: string;
//   notes: string;
//   accountCode: string;
//   companyName: string;
//   address: string;
//   contactName: string;
//   contactTel: string;
//   country: string;
//   volumeWeight: string;
//   grossWeight: string;
//   cbm: string;
//   nop: string;
//   term: string;
//   ref: string;
//   fromCountry: string;
//   toCity: string;
//   commodity: string;
//   shipDate: string;
//   lineItems: LineItem[];
// }

// interface DraftRow {
//   id: string;
//   invoice_number: string;
//   updated_at: string;
// }

// // ─── Default data ─────────────────────────────────────────────────────────────

// const DEFAULT_INVOICE: InvoiceData = {
//   invoiceNumber: "TAZ039",
//   businessCode: "TAZ company",
//   date: "25 – 5 – 2026",
//   shipper: "NOON Shipping Guangzhou – China",
//   consignee: "Vatren Company – IRAQ",
//   origin: "CHINA",
//   destination: "ERBIL",
//   notes: "",
//   accountCode: "VAT-1011",
//   companyName: "VATREN COMPANY",
//   address: "100M ROAD ERBIL IRAQ",
//   contactName: "MR. Hardi Ismail TEL: +964 750 600 5005",
//   contactTel: "+964 750 600 5005",
//   country: "IRAQ",
//   volumeWeight: "",
//   grossWeight: "292 kg",
//   cbm: "",
//   nop: "15",
//   term: "EXW",
//   ref: "",
//   fromCountry: "China",
//   toCity: "Erbil",
//   commodity: "Curtains & Accessories",
//   shipDate: "16 MAY 26",
//   lineItems: [
//     { shippingCode: "Shipping – Air Freight", description: "Curtains & Accessories", qty: 292, unitPrice: 10.25 },
//   ],
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function numberToWords(n: number): string {
//   if (n === 0) return "Zero";
//   const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
//     "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
//   const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
//   function convert(num: number): string {
//     if (num < 20) return ones[num];
//     if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? " "+ones[num%10] : "");
//     if (num < 1000) return ones[Math.floor(num/100)] + " Hundred" + (num%100 ? " "+convert(num%100) : "");
//     if (num < 1000000) return convert(Math.floor(num/1000)) + " Thousand" + (num%1000 ? " "+convert(num%1000) : "");
//     return convert(Math.floor(num/1000000)) + " Million" + (num%1000000 ? " "+convert(num%1000000) : "");
//   }
//   const int = Math.floor(n);
//   const dec = Math.round((n - int) * 100);
//   return convert(int) + (dec > 0 ? ` and ${dec}/100` : "");
// }

// function calcTotal(items: LineItem[]): number {
//   return items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
// }

// // ─── useIsMobile ──────────────────────────────────────────────────────────────

// function useIsMobile() {
//   const [v, set] = useState(() => window.innerWidth < 768);
//   useEffect(() => {
//     const h = () => set(window.innerWidth < 768);
//     window.addEventListener("resize", h);
//     return () => window.removeEventListener("resize", h);
//   }, []);
//   return v;
// }

// // ─── Smart Date Picker ────────────────────────────────────────────────────────
// // Parses the stored date string, detects whether the month is alpha (MAY) or
// // numeric (5), and renders three dropdowns (day / month / year) that preserve
// // that format on output. Separator is detected from the original string too.

// const MONTHS_ALPHA = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

// type DateFormat = "alpha" | "numeric"; // month display format
// type DateSep = " – " | "-" | "/" | " "; // separator between parts

// interface ParsedDate {
//   day: number;        // 1-31
//   month: number;      // 1-12
//   year: number;       // full year e.g. 2026, or 2-digit if stored as 26
//   yearFull: boolean;  // true if stored as 4 digits
//   monthFmt: DateFormat;
//   sep: DateSep;
// }

// function parseDate(raw: string): ParsedDate | null {
//   if (!raw.trim()) return null;

//   // detect separator — check em-dash first (it contains spaces), then others
//   let sep: DateSep = " ";
//   if (raw.includes(" – ")) sep = " – ";
//   else if (raw.includes("-")) sep = "-";
//   else if (raw.includes("/")) sep = "/";
//   else sep = " "; // space-separated e.g. "16 MAY 26"

//   const parts = raw.split(sep).map(p => p.trim()).filter(Boolean);
//   if (parts.length !== 3) return null;

//   // Detect if any part is alpha month
//   const alphaIdx = parts.findIndex(p => MONTHS_ALPHA.includes(p.toUpperCase()));
//   let day: number, month: number, year: number, monthFmt: DateFormat;

//   if (alphaIdx !== -1) {
//     // e.g. "16 MAY 26" → parts = ["16","MAY","26"]
//     month = MONTHS_ALPHA.indexOf(parts[alphaIdx].toUpperCase()) + 1;
//     monthFmt = "alpha";
//     const others = parts.filter((_, i) => i !== alphaIdx).map(Number);
//     const [a, b] = others;
//     // Smaller non-month part is day, larger is year
//     if (a <= 31 && b > 31) { day = a; year = b; }
//     else if (b <= 31 && a > 31) { day = b; year = a; }
//     else { day = a; year = b; }
//   } else {
//     // All numeric e.g. "25 – 5 – 2026"
//     const [d, m, y] = parts.map(Number);
//     day = d; month = m; year = y; monthFmt = "numeric";
//   }

//   if (!day || !month || !year) return null;
//   const yearFull = year > 99;
//   return { day, month, year, yearFull, monthFmt, sep };
// }

// function formatDate(p: ParsedDate): string {
//   const m = p.monthFmt === "alpha"
//     ? MONTHS_ALPHA[p.month - 1]
//     : String(p.month);
//   const y = String(p.year);
//   const sep = p.sep;
//   // Reconstruct in same order as original (day-month-year)
//   return `${p.day}${sep}${m}${sep}${y}`;
// }

// interface DatePickerProps {
//   label: string;
//   value: string;
//   onChange: (v: string) => void;
//   isMobile?: boolean;
//   full?: boolean;
// }

// const SmartDatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, isMobile, full }) => {
//   const parsed = parseDate(value);
//   const now = new Date();

//   // If unparseable, fall back to plain text input
//   if (!parsed) {
//     return (
//       <div style={{ display:"flex", flexDirection:"column", gap:4, flex: (full||isMobile) ? "1 1 100%" : "1 1 160px" }}>
//         <label style={{ fontSize:10, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
//         <input value={value} onChange={e => onChange(e.target.value)}
//           style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:6, padding:"8px 10px", fontSize: isMobile ? 16 : 13, color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", outline:"none", width:"100%", boxSizing:"border-box" }}
//           onFocus={e => (e.target.style.borderColor="#3b82f6")}
//           onBlur={e => (e.target.style.borderColor="#1e293b")}
//         />
//       </div>
//     );
//   }

//   const selStyle: React.CSSProperties = {
//     background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6,
//     padding: isMobile ? "10px 8px" : "7px 6px",
//     fontSize: isMobile ? 15 : 13,
//     color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif",
//     outline: "none", cursor: "pointer", flex: 1,
//     WebkitAppearance: "none", appearance: "none",
//     // custom chevron
//     backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2364748b'/%3E%3C/svg%3E")`,
//     backgroundRepeat: "no-repeat",
//     backgroundPosition: "right 8px center",
//     paddingRight: 24,
//   };

//   const days = Array.from({ length: 31 }, (_, i) => i + 1);
//   const years = Array.from({ length: 10 }, (_, i) => {
//     const base = parsed.yearFull ? now.getFullYear() - 2 + i : (now.getFullYear() % 100) - 2 + i;
//     return base;
//   });

//   const update = (patch: Partial<ParsedDate>) => {
//     onChange(formatDate({ ...parsed, ...patch }));
//   };

//   return (
//     <div style={{ display:"flex", flexDirection:"column", gap:4, flex: (full||isMobile) ? "1 1 100%" : "1 1 200px" }}>
//       <label style={{ fontSize:10, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
//       <div style={{ display:"flex", gap:4 }}>
//         {/* Day */}
//         <select value={parsed.day} onChange={e => update({ day: Number(e.target.value) })} style={selStyle}
//           onFocus={e => (e.target.style.borderColor="#3b82f6")} onBlur={e => (e.target.style.borderColor="#1e293b")}>
//           {days.map(d => <option key={d} value={d}>{d}</option>)}
//         </select>

//         {/* Month — alpha or numeric depending on detected format */}
//         <select value={parsed.month} onChange={e => update({ month: Number(e.target.value) })} style={selStyle}
//           onFocus={e => (e.target.style.borderColor="#3b82f6")} onBlur={e => (e.target.style.borderColor="#1e293b")}>
//           {MONTHS_ALPHA.map((name, i) => (
//             <option key={i+1} value={i+1}>
//               {parsed.monthFmt === "alpha" ? name : String(i+1)}
//             </option>
//           ))}
//         </select>

//         {/* Year */}
//         <select value={parsed.year} onChange={e => update({ year: Number(e.target.value) })} style={selStyle}
//           onFocus={e => (e.target.style.borderColor="#3b82f6")} onBlur={e => (e.target.style.borderColor="#1e293b")}>
//           {years.map(y => <option key={y} value={y}>{y}</option>)}
//         </select>
//       </div>
//       {/* Show the formatted string so the user can verify */}
//       <span style={{ fontSize:10, color:"#475569", fontFamily:"'DM Sans',sans-serif", marginTop:1 }}>{value}</span>
//     </div>
//   );
// };

// // ─── Scaled Preview Wrapper ───────────────────────────────────────────────────
// // On mobile the A4 (794px) is scaled down to fit the screen width using
// // CSS transform: scale(). The wrapper gets an explicit height so it doesn't
// // collapse when the content is transformed outside its flow.

// const ScaledPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [scale, setScale] = useState(1);

//   useEffect(() => {
//     const update = () => {
//       if (!containerRef.current) return;
//       const available = containerRef.current.offsetWidth;
//       const docWidth = 794;
//       setScale(Math.min(1, available / docWidth));
//     };
//     update();
//     window.addEventListener("resize", update);
//     return () => window.removeEventListener("resize", update);
//   }, []);

//   const docHeight = 1123;

//   return (
//     <div ref={containerRef} style={{ width: "100%", overflow: "hidden" }}>
//       {/* Outer div reserves the scaled height so layout doesn't collapse */}
//       <div style={{ height: docHeight * scale, position: "relative" }}>
//         <div style={{
//           transformOrigin: "top left",
//           transform: `scale(${scale})`,
//           width: 794,
//           position: "absolute",
//           top: 0, left: 0,
//         }}>
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Dark Card ────────────────────────────────────────────────────────────────

// const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
//   <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:10, overflow:"hidden", marginBottom:16 }}>
//     <div style={{ background:"linear-gradient(90deg,#1a6ef5 0%,#0ea5e9 100%)", padding:"8px 18px", fontSize:11, fontWeight:700, color:"#fff", letterSpacing:"0.08em", textTransform:"uppercase" as const, fontFamily:"'DM Sans',sans-serif" }}>
//       {title}
//     </div>
//     <div style={{ padding:"16px 20px" }}>{children}</div>
//   </div>
// );

// // ─── Field ────────────────────────────────────────────────────────────────────

// interface FieldProps {
//   label: string;
//   value: string;
//   onChange: (v: string) => void;
//   full?: boolean;
//   type?: string;
//   isMobile?: boolean;
//   maxLength?: number;
// }

// const Field: React.FC<FieldProps> = ({ label, value, onChange, full, type="text", isMobile, maxLength }) => (
//   <div style={{ display:"flex", flexDirection:"column", gap:4, flex:(full||isMobile) ? "1 1 100%" : "1 1 160px" }}>
//     <div style={{ display:"flex", justifyContent:"space-between" }}>
//       <label style={{ fontSize:10, fontWeight:600, color:"#64748b", textTransform:"uppercase" as const, letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
//       {maxLength && <span style={{ fontSize:10, color: value.length > maxLength * 0.8 ? "#f59e0b" : "#475569", fontFamily:"'DM Sans',sans-serif" }}>{value.length}/{maxLength}</span>}
//     </div>
//     <input type={type} value={value} onChange={e => onChange(e.target.value)} maxLength={maxLength}
//       style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:6, padding:"8px 10px", fontSize: isMobile ? 16 : 13, color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", outline:"none", transition:"border-color 0.15s", width:"100%", boxSizing:"border-box" as const }}
//       onFocus={e => (e.target.style.borderColor="#3b82f6")}
//       onBlur={e => (e.target.style.borderColor="#1e293b")}
//     />
//   </div>
// );

// // ─── Invoice PDF Preview ──────────────────────────────────────────────────────

// const InvoicePreview: React.FC<{ data: InvoiceData }> = ({ data }) => {
//   const total = calcTotal(data.lineItems);
//   const blue = "#2563eb";
//   const th: React.CSSProperties = { background:blue, color:"#fff", padding:"7px 10px", fontSize:11, fontWeight:700, textAlign:"left", fontFamily:"Arial,sans-serif" };
//   const td: React.CSSProperties = { padding:"7px 10px", fontSize:11, fontFamily:"Arial,sans-serif", color:"#111", borderBottom:"1px solid #e5e7eb" };

//   return (
//     <div id="invoice-preview-visible" style={{ background:"#fff", width:794, minHeight:1123, margin:"0 auto", padding:"80px 40px", fontFamily:"Arial,sans-serif", color:"#111", boxSizing:"border-box", fontSize:12 }}>
//       <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
//         <div style={{ lineHeight: 1 }}>
//          <div style={{ fontSize:30, fontWeight:900, color:blue, letterSpacing:-1, fontStyle: "italic" }}>TAZ</div>
//            <div style={{ fontSize:8, fontWeight:700, color:"#dc2626", marginLeft: "0.2rem", letterSpacing:"0.20em", textTransform:"uppercase", marginTop:1 }}>COMPANY</div>
//         </div>
//         <div style={{ fontSize:22, fontWeight:800, color:"#111", letterSpacing:4 }}>INVOICE</div>
//       </div>

//       <div style={{ display:"flex", gap:20, marginBottom:20 }}>
//         <div style={{ flex:1, border:"1px solid #e5e7eb", borderRadius:4 }}>
//           <div style={{ background:blue, color:"#fff", padding:"6px 12px", fontSize:11, fontWeight:700, textAlign:"center" }}>Bill To</div>
//           <div style={{ padding:12 }}>
//             <div style={{ marginBottom:4 }}>Account Code : <strong>{data.accountCode}</strong></div>
//             <div style={{ fontWeight:700, marginBottom:4 }}>{data.companyName}</div>
//             <div style={{ marginBottom:4 }}>{data.address}</div>
//             <div style={{ marginBottom:4 }}>{data.contactName}</div>
//             <div>{data.country}</div>
//           </div>
//         </div>
//         <div style={{ flex:1.4, border:"1px solid #e5e7eb", borderRadius:4 }}>
//           <div style={{ background:blue, color:"#fff", padding:"6px 12px", fontSize:11, fontWeight:700 }}>Invoice Number: {data.invoiceNumber}</div>
//           <div style={{ padding:"8px 12px" }}>
//             {[["Business Code",data.businessCode],["Date",data.date],["Shipper",data.shipper],["Consignee",data.consignee],["From",data.origin],["Destination",data.destination],["Notes",data.notes]].map(([k,v]) => (
//               <div key={k} style={{ display:"flex", gap:8, marginBottom:4, fontSize:11 }}>
//                 <span style={{ minWidth:90, color:"#555" }}>{k}</span><span>: {v}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
//         <thead><tr>{["Volume Weight","Gross Weight","CBM","NOP","Term","REF."].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
//         <tbody><tr><td style={td}>{data.volumeWeight}</td><td style={td}>{data.grossWeight}</td><td style={td}>{data.cbm}</td><td style={td}>{data.nop}</td><td style={td}>{data.term}</td><td style={td}>{data.ref}</td></tr></tbody>
//       </table>

//       <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
//         <thead><tr>{["From","To","Commodity","Date"].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
//         <tbody><tr><td style={td}>{data.fromCountry}</td><td style={td}>{data.toCity}</td><td style={td}>{data.commodity}</td><td style={td}>{data.shipDate}</td></tr></tbody>
//       </table>

//       <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
//         <thead><tr>
//           <th style={{...th,width:"22%"}}>Shipping Code</th><th style={{...th,width:"34%"}}>Description</th>
//           <th style={{...th,width:"12%",textAlign:"right"}}>QTY (KG)</th><th style={{...th,width:"16%",textAlign:"right"}}>Unit Price USD</th><th style={{...th,width:"16%",textAlign:"right"}}>Amount USD</th>
//         </tr></thead>
//         <tbody>
//           {data.lineItems.map((item,i)=>(
//             <tr key={i}><td style={td}>{item.shippingCode}</td><td style={td}>{item.description}</td>
//               <td style={{...td,textAlign:"right"}}>{item.qty}</td><td style={{...td,textAlign:"right"}}>{item.unitPrice.toFixed(2)}</td>
//               <td style={{...td,textAlign:"right"}}>{(item.qty*item.unitPrice).toFixed(2)}</td></tr>
//           ))}
//           {Array.from({length:Math.max(0,5-data.lineItems.length)}).map((_,i)=>(
//             <tr key={`e${i}`} style={{height:28}}><td style={{...td,color:"transparent"}}>—</td><td style={td}/><td style={td}/><td style={td}/><td style={td}/></tr>
//           ))}
//         </tbody>
//       </table>

//       <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:40 }}>
//         <div style={{ fontSize:11, color:"#555", maxWidth:360 }}>Total Amount in Word (USD): <strong>{numberToWords(total)} Dollars</strong></div>
//         <div style={{ display:"flex" }}>
//           <div style={{ background:blue, color:"#fff", padding:"8px 20px", fontSize:12, fontWeight:700 }}>Total</div>
//           <div style={{ background:"#dbeafe", border:`1px solid ${blue}`, color:"#111", padding:"8px 20px", fontSize:12, fontWeight:700, minWidth:80, textAlign:"right" }}>{total.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
//         </div>
//       </div>

//       <div style={{ borderTop:"1px solid #e5e7eb", paddingTop:12, textAlign:"center", fontSize:10, color:"#6b7280" }}>
//         <div>Head Office address : Al-Karrada District - Block 909, Street 18, Building 207 - Baghdad - Iraq</div>
//         <div>Iraq Mob. : +964776 558 8815 &nbsp; web: www.tazcom.net &nbsp; Email: info@tazcom.net</div>
//       </div>
//     </div>
//   );
// };

// // ─── Main Page ────────────────────────────────────────────────────────────────

// const InvoicePage: React.FC = () => {
//   const isMobile = useIsMobile();

//   const [data, setData]           = useState<InvoiceData>(DEFAULT_INVOICE);
//   const [showPreview, setShowPreview] = useState(false);
//   const [saving, setSaving]       = useState(false);
//   const [saveMsg, setSaveMsg]     = useState<{ text: string; ok: boolean } | null>(null);
//   const [drafts, setDrafts]       = useState<DraftRow[]>([]);
//   const [loadingDrafts, setLoadingDrafts] = useState(false);
//   const [showDrafts, setShowDrafts]   = useState(false);

//   // Measure the sticky header height so we can pad the page below it
//   const headerRef = useRef<HTMLDivElement>(null);
//   const [headerH, setHeaderH] = useState(0);
//   useEffect(() => {
//     if (!headerRef.current) return;
//     const ro = new ResizeObserver(() => setHeaderH(headerRef.current?.offsetHeight ?? 0));
//     ro.observe(headerRef.current);
//     return () => ro.disconnect();
//   }, []);

//   const set = (key: keyof InvoiceData) => (v: string) =>
//     setData(prev => ({ ...prev, [key]: v }));

//   const setItem = (idx: number, key: keyof LineItem, v: string | number) =>
//     setData(prev => {
//       const items = [...prev.lineItems];
//       items[idx] = { ...items[idx], [key]: v };
//       return { ...prev, lineItems: items };
//     });

//   const addItem = () =>
//     setData(prev => ({ ...prev, lineItems: [...prev.lineItems, { shippingCode:"", description:"", qty:0, unitPrice:0 }] }));

//   const removeItem = (idx: number) =>
//     setData(prev => ({ ...prev, lineItems: prev.lineItems.filter((_,i) => i !== idx) }));

//   const total = calcTotal(data.lineItems);

//   // Auto-increment invoice number helper
//   const incrementInvoiceNumber = () => {
//     const match = data.invoiceNumber.match(/^([A-Za-z]+)(\d+)$/);
//     if (match) {
//       const next = String(Number(match[2]) + 1).padStart(match[2].length, "0");
//       set("invoiceNumber")(match[1] + next);
//     }
//   };



//   // ── Supabase ──────────────────────────────────────────────────────────────

//   const loadDrafts = async () => {
//     setLoadingDrafts(true);
//     const { data: rows, error } = await supabase
//       .from("invoice_drafts").select("id, invoice_number, updated_at")
//       .order("updated_at", { ascending: false }).limit(10);
//     if (!error && rows) setDrafts(rows as DraftRow[]);
//     setLoadingDrafts(false);
//   };

//   useEffect(() => { loadDrafts(); }, []);

//   const saveDraft = async () => {
//     setSaving(true); setSaveMsg(null);
//     const { error } = await supabase.from("invoice_drafts").insert([{
//       invoice_number: data.invoiceNumber, business_code: data.businessCode,
//       invoice_date: data.date, shipper: data.shipper, consignee: data.consignee,
//       origin: data.origin, destination: data.destination, notes: data.notes,
//       account_code: data.accountCode, company_name: data.companyName,
//       address: data.address, contact_name: data.contactName, contact_tel: data.contactTel,
//       country: data.country, volume_weight: data.volumeWeight, gross_weight: data.grossWeight, cbm: data.cbm,
//       nop: data.nop, term: data.term, ref: data.ref, from_country: data.fromCountry,
//       to_city: data.toCity, commodity: data.commodity, ship_date: data.shipDate,
//       line_items: data.lineItems, total_amount: total, updated_at: new Date().toISOString(),
//     }]);
//     setSaving(false);
//     if (error) { setSaveMsg({ text: "Error: "+error.message, ok: false }); }
//     else { setSaveMsg({ text: "Draft saved!", ok: true }); loadDrafts(); setTimeout(() => setSaveMsg(null), 3000); }
//   };

//   const loadDraft = async (id: string) => {
//     const { data: row, error } = await supabase.from("invoice_drafts").select("*").eq("id", id).single();
//     if (error || !row) return;
//     setData({
//       invoiceNumber: row.invoice_number ?? "", businessCode: row.business_code ?? "",
//       date: row.invoice_date ?? "", shipper: row.shipper ?? "", consignee: row.consignee ?? "",
//       origin: row.origin ?? "", destination: row.destination ?? "", notes: row.notes ?? "",
//       accountCode: row.account_code ?? "", companyName: row.company_name ?? "",
//       address: row.address ?? "", contactName: row.contact_name ?? "", contactTel: row.contact_tel ?? "",
//       country: row.country ?? "", volumeWeight: row.volume_weight ?? "", grossWeight: row.gross_weight ?? "", cbm: row.cbm ?? "",
//       nop: row.nop ?? "", term: row.term ?? "", ref: row.ref ?? "",
//       fromCountry: row.from_country ?? "", toCity: row.to_city ?? "",
//       commodity: row.commodity ?? "", shipDate: row.ship_date ?? "", lineItems: row.line_items ?? [],
//     });
//     setSaveMsg({ text: "Draft loaded.", ok: true });
//     if (isMobile) setShowDrafts(false);
//     setTimeout(() => setSaveMsg(null), 2000);
//   };

//   const downloadPdf = async () => {
//     // Create a hidden full-size (794px) container outside the viewport.
//     // This avoids capturing the CSS-scaled preview which causes overlapping text.
//     const container = document.createElement("div");
//     container.style.cssText = [
//       "position:fixed",
//       "left:-9999px",
//       "top:0",
//       "width:794px",
//       "background:#fff",
//       "z-index:-1",
//     ].join(";");
//     document.body.appendChild(container);

//     // Render the invoice into the hidden container via a temporary React root
//     const { createRoot } = await import("react-dom/client");
//     const root = createRoot(container);

//     await new Promise<void>(resolve => {
//       root.render(<InvoicePreview data={data} />);
//       // Give React one frame to paint
//       requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
//     });

//     try {
//       const canvas = await html2canvas(container, {
//         scale: 2,
//         useCORS: true,
//         width: 794,
//         windowWidth: 794,
//       });
//       const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [794, 1123] });
//       pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 794, 1123);
//       pdf.save(`Invoice-${data.invoiceNumber}.pdf`);
//     } finally {
//       root.unmount();
//       document.body.removeChild(container);
//     }
//   };

//   // ── Button styles ─────────────────────────────────────────────────────────

//   const btnPrimary: React.CSSProperties = {
//     display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7,
//     background:"linear-gradient(135deg,#1a6ef5,#0ea5e9)", color:"#fff", border:"none", borderRadius:8,
//     padding: isMobile ? "11px 14px" : "8px 16px",
//     fontSize: isMobile ? 13 : 13, fontWeight:600,
//     cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
//     boxShadow:"0 2px 8px #1a6ef540", minHeight: isMobile ? 44 : "auto",
//     whiteSpace:"nowrap" as const,
//   };
//   const btnSecondary: React.CSSProperties = {
//     display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7,
//     background:"#1e293b", color:"#94a3b8", border:"1px solid #334155", borderRadius:8,
//     padding: isMobile ? "11px 14px" : "8px 16px",
//     fontSize: isMobile ? 13 : 13, fontWeight:600,
//     cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
//     minHeight: isMobile ? 44 : "auto", whiteSpace:"nowrap" as const,
//   };
//   const btnGreen: React.CSSProperties = {
//     ...btnPrimary, background:"linear-gradient(135deg,#059669,#10b981)", boxShadow:"0 2px 8px #05966940",
//   };
//   const inputStyle: React.CSSProperties = {
//     background:"#0f172a", border:"1px solid #1e293b", borderRadius:6,
//     padding: isMobile ? "10px 12px" : "7px 9px",
//     fontSize: isMobile ? 16 : 12,
//     color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif",
//     outline:"none", width:"100%", boxSizing:"border-box" as const,
//   };

//   // ── Drafts panel ──────────────────────────────────────────────────────────

//   const DraftsPanel = (
//     <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:10, overflow:"hidden", width: isMobile ? "100%" : 300, flexShrink:0 }}>
//       <div style={{ background:"linear-gradient(90deg,#1a6ef5 0%,#0ea5e9 100%)", padding:"8px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
//         <span style={{ fontSize:11, fontWeight:700, color:"#fff", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>Saved Drafts</span>
//         <button style={{ ...btnSecondary, padding:"4px 10px", fontSize:11, minHeight:"auto", background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", color:"#fff" }} onClick={loadDrafts}>
//           {loadingDrafts ? "…" : "↻ Refresh"}
//         </button>
//       </div>
//       <div style={{ overflowY:"auto", maxHeight: isMobile ? 320 : 480 }}>
//         {drafts.length === 0 ? (
//           <div style={{ padding:"32px 20px", textAlign:"center", color:"#475569", fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>No drafts saved yet.</div>
//         ) : drafts.map((d, idx) => (
//           <div key={d.id} style={{ padding:"13px 18px", borderBottom: idx < drafts.length-1 ? "1px solid #1e293b" : "none" }}>
//             <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
//               <span style={{ fontSize:13, fontWeight:700, color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif" }}>{d.invoice_number}</span>
//               <span style={{ background:"#312e81", color:"#a5b4fc", border:"1px solid #4338ca", padding:"2px 9px", borderRadius:20, fontSize:10, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>Draft</span>
//             </div>
//             <div style={{ fontSize:11, color:"#475569", marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>{new Date(d.updated_at).toLocaleString()}</div>
//             <button style={{ ...btnSecondary, width:"100%", fontSize:12, padding:"8px", minHeight: isMobile ? 44 : "auto" }} onClick={() => loadDraft(d.id)}>
//               Load into Editor
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   // ─────────────────────────────────────────────────────────────────────────

//   return (
//     <div style={{ fontFamily:"'DM Sans',sans-serif", color:"#e2e8f0" }}>

//       {/* ── STICKY HEADER ─────────────────────────────────────────────────
//           position: sticky + top: 0 makes it stick within the scrollable
//           <main> container in AppDashboard. z-index keeps it above cards.
//           backdrop-filter adds a blur so content scrolling under looks polished. */}
//       <div
//         ref={headerRef}
//         style={{
//           position: "sticky",
//           top: 0,
//           zIndex: 50,
//           // Dark frosted glass effect
//           background: "rgba(9, 14, 27, 0.92)",
//           backdropFilter: "blur(12px)",
//           WebkitBackdropFilter: "blur(12px)",
//           borderBottom: "1px solid #1e293b",
//           // Negative margin + padding to bleed edge-to-edge inside AppDashboard's padded <main>
//           margin: "-28px -28px 24px -28px",
//           padding: isMobile ? "14px 16px" : "14px 28px",
//         } as React.CSSProperties}
//       >
//         <div style={{
//           display:"flex",
//           flexDirection: isMobile ? "column" : "row",
//           alignItems: isMobile ? "flex-start" : "center",
//           justifyContent:"space-between",
//           gap: isMobile ? 12 : 0,
//         }}>
//           {/* Title + status message */}
//           <div style={{ display:"flex", alignItems:"center", gap:14 }}>
//             <div>
//               <h1 style={{ margin:0, fontSize: isMobile ? 18 : 20, fontWeight:800, color:"#f1f5f9", lineHeight:1.2 }}>
//                 Invoice Editor
//               </h1>
//               <p style={{ margin:"2px 0 0", fontSize:12, color:"#64748b" }}>
//                 {data.invoiceNumber} · Total ${total.toLocaleString("en-US",{minimumFractionDigits:2})}
//               </p>
//             </div>
//             {saveMsg && (
//               <span style={{ fontSize:12, fontWeight:700, color: saveMsg.ok ? "#34d399" : "#f87171", background: saveMsg.ok ? "#064e3b44" : "#450a0a44", border:`1px solid ${saveMsg.ok ? "#065f4644" : "#7f1d1d44"}`, borderRadius:6, padding:"4px 10px" }}>
//                 {saveMsg.text}
//               </span>
//             )}
//           </div>

//           {/* Action buttons */}
//           <div style={{ display:"flex", flexWrap:"wrap", gap:8, width: isMobile ? "100%" : "auto" }}>
//             {isMobile && (
//               <button style={{ ...btnSecondary, flex:"1 1 auto" }} onClick={() => setShowDrafts(p => !p)}>
//                 <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
//                 {showDrafts ? "Hide Drafts" : `Drafts${drafts.length > 0 ? ` (${drafts.length})` : ""}`}
//               </button>
//             )}
//             <button style={{ ...btnSecondary, flex: isMobile ? "1 1 auto" : "none" }} onClick={() => setShowPreview(p => !p)}>
//               <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
//               {showPreview ? "Hide Preview" : "Preview"}
//             </button>
//             <button style={{ ...btnGreen, flex: isMobile ? "1 1 auto" : "none" }} onClick={saveDraft} disabled={saving}>
//               <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>
//               {saving ? "Saving…" : "Save Draft"}
//             </button>
//             <button style={{ ...btnPrimary, flex: isMobile ? "1 1 auto" : "none" }} onClick={downloadPdf}>
//               <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
//               Download PDF
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile: drafts drop in here */}
//       {isMobile && showDrafts && <div style={{ marginBottom:16 }}>{DraftsPanel}</div>}

//       {/* ── Two-column layout ── */}
//       <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row", gap:16, alignItems:"flex-start" }}>

//         <div style={{ flex:"1 1 0", minWidth:0, width:"100%" }}>

//           <Card title="Invoice Details">
//             <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
//               {/* Invoice number with quick-increment button */}
//               <div style={{ display:"flex", flexDirection:"column", gap:4, flex: isMobile ? "1 1 100%" : "1 1 160px" }}>
//                 <label style={{ fontSize:10, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif" }}>Invoice Number</label>
//                 <div style={{ display:"flex", gap:6 }}>
//                   <input value={data.invoiceNumber} onChange={e => set("invoiceNumber")(e.target.value)}
//                     style={{ ...inputStyle, flex:1 }}
//                     onFocus={e => (e.target.style.borderColor="#3b82f6")}
//                     onBlur={e => (e.target.style.borderColor="#1e293b")}
//                   />
//                   <button title="Auto-increment number" onClick={incrementInvoiceNumber}
//                     style={{ ...btnSecondary, padding:"0 10px", fontSize:15, minHeight:"auto", borderRadius:6, flexShrink:0 }}>
//                     +1
//                   </button>
//                 </div>
//               </div>

//               <Field isMobile={isMobile} label="Business Code"  value={data.businessCode}  onChange={set("businessCode")} />
//               <SmartDatePicker isMobile={isMobile} label="Invoice Date" value={data.date} onChange={set("date")} />
//               <Field isMobile={isMobile} label="Shipper"        value={data.shipper}        onChange={set("shipper")} full />
//               <Field isMobile={isMobile} label="Consignee"      value={data.consignee}      onChange={set("consignee")} full />
//               <Field isMobile={isMobile} label="Origin (From)"  value={data.origin}         onChange={set("origin")} />
//               <Field isMobile={isMobile} label="Destination"    value={data.destination}    onChange={set("destination")} />
//               <Field isMobile={isMobile} label="Notes"          value={data.notes}          onChange={set("notes")} full maxLength={200} />
//             </div>
//           </Card>

//           <Card title="Bill To">
//             <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
//               <Field isMobile={isMobile} label="Account Code"       value={data.accountCode} onChange={set("accountCode")} />
//               <Field isMobile={isMobile} label="Company Name"       value={data.companyName} onChange={set("companyName")} />
//               <Field isMobile={isMobile} label="Address"            value={data.address}     onChange={set("address")} full />
//               <Field isMobile={isMobile} label="Contact Name & Tel" value={data.contactName} onChange={set("contactName")} full />
//               <Field isMobile={isMobile} label="Country"            value={data.country}     onChange={set("country")} />
//             </div>
//           </Card>

//           <Card title="Shipment Info">
//             <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
//               <Field isMobile={isMobile} label="Volume Weight" value={data.volumeWeight} onChange={set("volumeWeight")} />
//               <Field isMobile={isMobile} label="Gross Weight" value={data.grossWeight} onChange={set("grossWeight")} />
//               <Field isMobile={isMobile} label="CBM"          value={data.cbm}         onChange={set("cbm")} />
//               <Field isMobile={isMobile} label="NOP"          value={data.nop}         onChange={set("nop")} />
//               <Field isMobile={isMobile} label="Term"         value={data.term}        onChange={set("term")} />
//               <Field isMobile={isMobile} label="REF."         value={data.ref}         onChange={set("ref")} />
//             </div>
//           </Card>

//           <Card title="Route & Commodity">
//             <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
//               <Field isMobile={isMobile} label="From (Country)" value={data.fromCountry} onChange={set("fromCountry")} />
//               <Field isMobile={isMobile} label="To (City)"      value={data.toCity}      onChange={set("toCity")} />
//               <Field isMobile={isMobile} label="Commodity"      value={data.commodity}   onChange={set("commodity")} />
//               <SmartDatePicker isMobile={isMobile} label="Ship Date" value={data.shipDate} onChange={set("shipDate")} />
//             </div>
//           </Card>

//           <Card title="Line Items">
//             {isMobile ? (
//               <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
//                 {data.lineItems.map((item, i) => (
//                   <div key={i} style={{ background:"#020617", border:"1px solid #1e293b", borderRadius:8, padding:"12px 14px" }}>
//                     <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
//                       <span style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em" }}>Line {i+1}</span>
//                       <button onClick={() => removeItem(i)} style={{ background:"#450a0a", border:"1px solid #7f1d1d", color:"#f87171", cursor:"pointer", fontSize:12, fontWeight:700, borderRadius:6, padding:"5px 12px", minHeight:36 }}>Remove</button>
//                     </div>
//                     <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
//                       <Field isMobile label="Shipping Code" value={item.shippingCode} onChange={v => setItem(i,"shippingCode",v)} full />
//                       <Field isMobile label="Description"   value={item.description}  onChange={v => setItem(i,"description",v)}  full />
//                       <div style={{ display:"flex", gap:10 }}>
//                         <Field isMobile label="QTY (KG)"  value={String(item.qty)}       onChange={v => setItem(i,"qty",parseFloat(v)||0)} />
//                         <Field isMobile label="Unit Price" value={String(item.unitPrice)} onChange={v => setItem(i,"unitPrice",parseFloat(v)||0)} />
//                       </div>
//                       <div style={{ fontSize:14, fontWeight:700, color:"#38bdf8", textAlign:"right" }}>Amount: ${(item.qty*item.unitPrice).toFixed(2)}</div>
//                     </div>
//                   </div>
//                 ))}
//                 <button style={{ ...btnSecondary, width:"100%", minHeight:44 }} onClick={addItem}>+ Add Line Item</button>
//                 <div style={{ fontSize:15, fontWeight:800, color:"#f1f5f9", textAlign:"right" }}>
//                   Total: <span style={{ color:"#38bdf8" }}>${total.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:12 }}>
//                   <thead>
//                     <tr>{["Shipping Code","Description","QTY (KG)","Unit Price","Amount",""].map(h=>(
//                       <th key={h} style={{ textAlign:"left", fontSize:10, color:"#64748b", fontWeight:600, padding:"0 6px 8px", letterSpacing:"0.05em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{h}</th>
//                     ))}</tr>
//                   </thead>
//                   <tbody>
//                     {data.lineItems.map((item,i)=>(
//                       <tr key={i}>
//                         <td style={{padding:"4px 6px"}}><input style={inputStyle} value={item.shippingCode} onChange={e=>setItem(i,"shippingCode",e.target.value)} /></td>
//                         <td style={{padding:"4px 6px"}}><input style={inputStyle} value={item.description}  onChange={e=>setItem(i,"description",e.target.value)} /></td>
//                         <td style={{padding:"4px 6px",width:72}}><input style={inputStyle} type="number" value={item.qty} onChange={e=>setItem(i,"qty",parseFloat(e.target.value)||0)} /></td>
//                         <td style={{padding:"4px 6px",width:88}}><input style={inputStyle} type="number" step="0.01" value={item.unitPrice} onChange={e=>setItem(i,"unitPrice",parseFloat(e.target.value)||0)} /></td>
//                         <td style={{padding:"4px 6px",fontSize:12,color:"#94a3b8",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>${(item.qty*item.unitPrice).toFixed(2)}</td>
//                         <td style={{padding:"4px 6px"}}><button onClick={()=>removeItem(i)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,lineHeight:1,padding:0}} aria-label="Remove line">×</button></td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
//                   <button style={btnSecondary} onClick={addItem}>+ Add Line</button>
//                   <div style={{ fontSize:14, fontWeight:700, color:"#f1f5f9" }}>
//                     Total: <span style={{ color:"#38bdf8" }}>${total.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
//                   </div>
//                 </div>
//               </>
//             )}
//           </Card>

//         </div>

//         {/* Desktop drafts sidebar */}
//         {!isMobile && DraftsPanel}

//       </div>

//       {/* ── Preview ── */}
//       {showPreview && (
//         <div style={{ marginTop:24 }}>
//           <div style={{ background:"#0f172a", borderRadius:10, border:"1px solid #1e293b", overflow:"hidden" }}>
//             <div style={{ background:"linear-gradient(90deg,#1a6ef5 0%,#0ea5e9 100%)", padding:"8px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
//               <span style={{ fontSize:11, fontWeight:700, color:"#fff", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>Invoice Preview</span>
//               <div style={{ display:"flex", gap:8, alignItems:"center" }}>
//                 <button style={{ ...btnPrimary, padding:"5px 12px", fontSize:12, minHeight:"auto", boxShadow:"none" }} onClick={downloadPdf}>
//                   ↓ Download PDF
//                 </button>
//                 <button style={{ ...btnSecondary, padding:"4px 12px", fontSize:12, minHeight:"auto", background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", color:"#fff" }} onClick={() => setShowPreview(false)}>
//                   ✕ Close
//                 </button>
//               </div>
//             </div>
//             {/* ScaledPreview shrinks the A4 to fit the phone screen */}
//             <div style={{ padding: isMobile ? 12 : 20, background:"#1e293b" }}>
//               <ScaledPreview>
//                 <InvoicePreview data={data} />
//               </ScaledPreview>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default InvoicePage;
// src/components/pages/InvoicePage.tsx
// Run once: npm install jspdf html2canvas

// src/components/pages/InvoicePage.tsx
// Run once: npm install jspdf html2canvas

import React, { useEffect, useRef, useState } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import supabase from "../../../supabase";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LineItem {
  shippingCode: string;
  description: string;
  qty: number;
  unitPrice: number;
}

interface InvoiceData {
  invoiceNumber: string;
  businessCode: string;
  date: string;
  shipper: string;
  consignee: string;
  origin: string;
  destination: string;
  notes: string;
  accountCode: string;
  companyName: string;
  address: string;
  contactName: string;
  contactTel: string;
  country: string;
  volumeWeight: string;
  grossWeight: string;
  cbm: string;
  nop: string;
  term: string;
  ref: string;
  fromCountry: string;
  toCity: string;
  commodity: string;
  shipDate: string;
  lineItems: LineItem[];
}

interface DraftRow {
  id: string;
  invoice_number: string;
  updated_at: string;
}

// ─── Default data ────────────────────────────────────────────────────────────

const DEFAULT_INVOICE: InvoiceData = {
  invoiceNumber: "TAZ039",
  businessCode: "TAZ company",
  date: "25 – 5 – 2026",
  shipper: "NOON Shipping Guangzhou – China",
  consignee: "Vatren Company – IRAQ",
  origin: "CHINA",
  destination: "ERBIL",
  notes: "",
  accountCode: "VAT-1011",
  companyName: "VATREN COMPANY",
  address: "100M ROAD ERBIL IRAQ",
  contactName: "MR. Hardi Ismail TEL: +964 750 600 5005",
  contactTel: "+964 750 600 5005",
  country: "IRAQ",
  volumeWeight: "",
  grossWeight: "292 kg",
  cbm: "",
  nop: "15",
  term: "EXW",
  ref: "",
  fromCountry: "China",
  toCity: "Erbil",
  commodity: "Curtains & Accessories",
  shipDate: "16 MAY 26",
  lineItems: [
    { shippingCode: "Shipping – Air Freight", description: "Curtains & Accessories", qty: 292, unitPrice: 10.25 },
  ],
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function numberToWords(n: number): string {
  if (n === 0) return "Zero";
  const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
    "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
  const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
  function convert(num: number): string {
    if (num < 20) return ones[num];
    if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? " "+ones[num%10] : "");
    if (num < 1000) return ones[Math.floor(num/100)] + " Hundred" + (num%100 ? " "+convert(num%100) : "");
    if (num < 1_000_000) return convert(Math.floor(num/1000)) + " Thousand" + (num%1000 ? " "+convert(num%1000) : "");
    return convert(Math.floor(num/1_000_000)) + " Million" + (num%1_000_000 ? " "+convert(num%1_000_000) : "");
  }
  const int = Math.floor(n);
  const dec = Math.round((n - int) * 100);
  return convert(int) + (dec > 0 ? ` and ${dec}/100` : "");
}

function calcTotal(items: LineItem[]): number {
  return items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
}

// ─── useIsMobile ─────────────────────────────────────────────────────────────

function useIsMobile() {
  const [v, set] = useState(() => window.innerWidth < 768);
  useEffect(() => {
    const h = () => set(window.innerWidth < 768);
    window.addEventListener("resize", h);
    return () => window.removeEventListener("resize", h);
  }, []);
  return v;
}

// ─── Smart Date Picker ────────────────────────────────────────────────────────

const MONTHS_ALPHA = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];
type DateFormat = "alpha" | "numeric";
type DateSep = " – " | "-" | "/" | " ";

interface ParsedDate {
  day: number; month: number; year: number;
  yearFull: boolean; monthFmt: DateFormat; sep: DateSep;
}

function parseDate(raw: string): ParsedDate | null {
  if (!raw.trim()) return null;
  let sep: DateSep = " ";
  if (raw.includes(" – ")) sep = " – ";
  else if (raw.includes("-")) sep = "-";
  else if (raw.includes("/")) sep = "/";
  else sep = " ";
  const parts = raw.split(sep).map(p => p.trim()).filter(Boolean);
  if (parts.length !== 3) return null;
  const alphaIdx = parts.findIndex(p => MONTHS_ALPHA.includes(p.toUpperCase()));
  let day: number, month: number, year: number, monthFmt: DateFormat;
  if (alphaIdx !== -1) {
    month = MONTHS_ALPHA.indexOf(parts[alphaIdx].toUpperCase()) + 1;
    monthFmt = "alpha";
    const others = parts.filter((_, i) => i !== alphaIdx).map(Number);
    const [a, b] = others;
    if (a <= 31 && b > 31) { day = a; year = b; }
    else if (b <= 31 && a > 31) { day = b; year = a; }
    else { day = a; year = b; }
  } else {
    const [d, m, y] = parts.map(Number);
    day = d; month = m; year = y; monthFmt = "numeric";
  }
  if (!day || !month || !year) return null;
  return { day, month, year, yearFull: year > 99, monthFmt, sep };
}

function formatDate(p: ParsedDate): string {
  const m = p.monthFmt === "alpha" ? MONTHS_ALPHA[p.month - 1] : String(p.month);
  return `${p.day}${p.sep}${m}${p.sep}${p.year}`;
}

interface DatePickerProps {
  label: string; value: string; onChange: (v: string) => void;
  isMobile?: boolean; full?: boolean;
}

const SmartDatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, isMobile, full }) => {
  const parsed = parseDate(value);
  const now = new Date();
  const wrap: React.CSSProperties = {
    display:"flex", flexDirection:"column", gap:4,
    flex: (full || isMobile) ? "1 1 100%" : "1 1 200px",
  };
  const lbl: React.CSSProperties = {
    fontSize:10, fontWeight:600, color:"#64748b",
    textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif",
  };
  if (!parsed) {
    return (
      <div style={wrap}>
        <label style={lbl}>{label}</label>
        <input value={value} onChange={e => onChange(e.target.value)}
          style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:6, padding:"8px 10px",
            fontSize: isMobile ? 16 : 13, color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif",
            outline:"none", width:"100%", boxSizing:"border-box" }}
          onFocus={e => (e.target.style.borderColor = "#3b82f6")}
          onBlur={e => (e.target.style.borderColor = "#1e293b")}
        />
      </div>
    );
  }
  const sel: React.CSSProperties = {
    background:"#0f172a", border:"1px solid #1e293b", borderRadius:6,
    padding: isMobile ? "10px 8px" : "7px 6px",
    fontSize: isMobile ? 15 : 13, color:"#e2e8f0",
    fontFamily:"'DM Sans',sans-serif", outline:"none", cursor:"pointer", flex:1,
    WebkitAppearance:"none", appearance:"none",
    backgroundImage:`url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2364748b'/%3E%3C/svg%3E")`,
    backgroundRepeat:"no-repeat", backgroundPosition:"right 8px center", paddingRight:24,
  };
  const update = (patch: Partial<ParsedDate>) => onChange(formatDate({ ...parsed, ...patch }));
  const days = Array.from({ length:31 }, (_, i) => i+1);
  const years = Array.from({ length:10 }, (_, i) =>
    parsed.yearFull ? now.getFullYear() - 2 + i : (now.getFullYear() % 100) - 2 + i);
  return (
    <div style={wrap}>
      <label style={lbl}>{label}</label>
      <div style={{ display:"flex", gap:4 }}>
        <select value={parsed.day} onChange={e => update({ day: Number(e.target.value) })} style={sel}
          onFocus={e => (e.target.style.borderColor="#3b82f6")} onBlur={e => (e.target.style.borderColor="#1e293b")}>
          {days.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={parsed.month} onChange={e => update({ month: Number(e.target.value) })} style={sel}
          onFocus={e => (e.target.style.borderColor="#3b82f6")} onBlur={e => (e.target.style.borderColor="#1e293b")}>
          {MONTHS_ALPHA.map((name, i) => (
            <option key={i+1} value={i+1}>{parsed.monthFmt === "alpha" ? name : String(i+1)}</option>
          ))}
        </select>
        <select value={parsed.year} onChange={e => update({ year: Number(e.target.value) })} style={sel}
          onFocus={e => (e.target.style.borderColor="#3b82f6")} onBlur={e => (e.target.style.borderColor="#1e293b")}>
          {years.map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>
      <span style={{ fontSize:10, color:"#475569", fontFamily:"'DM Sans',sans-serif", marginTop:1 }}>{value}</span>
    </div>
  );
};

// ─── Scaled Preview ───────────────────────────────────────────────────────────

const ScaledPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  useEffect(() => {
    const update = () => {
      if (ref.current) setScale(Math.min(1, ref.current.offsetWidth / 794));
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);
  return (
    <div ref={ref} style={{ width:"100%", overflow:"hidden" }}>
      <div style={{ height: 1123 * scale, position:"relative" }}>
        <div style={{ transformOrigin:"top left", transform:`scale(${scale})`, width:794, position:"absolute", top:0, left:0 }}>
          {children}
        </div>
      </div>
    </div>
  );
};

// ─── Dark Card ────────────────────────────────────────────────────────────────

const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:10, overflow:"hidden", marginBottom:16 }}>
    <div style={{ background:"linear-gradient(90deg,#1a6ef5 0%,#0ea5e9 100%)", padding:"8px 18px",
      fontSize:11, fontWeight:700, color:"#fff", letterSpacing:"0.08em",
      textTransform:"uppercase" as const, fontFamily:"'DM Sans',sans-serif" }}>
      {title}
    </div>
    <div style={{ padding:"16px 20px" }}>{children}</div>
  </div>
);

// ─── Field ────────────────────────────────────────────────────────────────────

interface FieldProps {
  label: string; value: string; onChange: (v: string) => void;
  full?: boolean; type?: string; isMobile?: boolean; maxLength?: number;
}
const Field: React.FC<FieldProps> = ({ label, value, onChange, full, type="text", isMobile, maxLength }) => (
  <div style={{ display:"flex", flexDirection:"column", gap:4, flex:(full||isMobile) ? "1 1 100%" : "1 1 160px" }}>
    <div style={{ display:"flex", justifyContent:"space-between" }}>
      <label style={{ fontSize:10, fontWeight:600, color:"#64748b", textTransform:"uppercase" as const,
        letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
      {maxLength && <span style={{ fontSize:10, color: value.length > maxLength*0.8 ? "#f59e0b" : "#475569",
        fontFamily:"'DM Sans',sans-serif" }}>{value.length}/{maxLength}</span>}
    </div>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} maxLength={maxLength}
      style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:6, padding:"8px 10px",
        fontSize: isMobile ? 16 : 13, color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif",
        outline:"none", transition:"border-color 0.15s", width:"100%", boxSizing:"border-box" as const }}
      onFocus={e => (e.target.style.borderColor = "#3b82f6")}
      onBlur={e => (e.target.style.borderColor = "#1e293b")}
    />
  </div>
);

// ─── Invoice PDF Preview ──────────────────────────────────────────────────────

const InvoicePreview: React.FC<{ data: InvoiceData; onSectionClick?: (id: string) => void }> = ({ data, onSectionClick }) => {
  const total = calcTotal(data.lineItems);
  const blue = "#2563eb";
  const th: React.CSSProperties = { background:blue, color:"#fff", padding:"7px 10px", fontSize:11, fontWeight:700, textAlign:"left", fontFamily:"Arial,sans-serif" };
  const td: React.CSSProperties = { padding:"7px 10px", fontSize:11, fontFamily:"Arial,sans-serif", color:"#111", borderBottom:"1px solid #e5e7eb" };

  const Sec: React.FC<{ id: string; style?: React.CSSProperties; children: React.ReactNode }> = ({ id, style, children }) => {
    const [hov, setHov] = useState(false);
    if (!onSectionClick) return <div style={style}>{children}</div>;
    return (
      <div onClick={() => onSectionClick(id)}
        onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
        title="Click to edit"
        style={{ ...style, cursor:"pointer", borderRadius:4, position:"relative",
          outline: hov ? `2px solid ${blue}` : "2px solid transparent",
          outlineOffset:2, transition:"outline 0.15s" }}>
        {children}
        {hov && (
          <div style={{ position:"absolute", top:4, right:6, fontSize:9, fontWeight:700,
            color:"#fff", background:blue, borderRadius:3, padding:"2px 6px",
            letterSpacing:"0.05em", pointerEvents:"none" }}>
            ✏ EDIT
          </div>
        )}
      </div>
    );
  };

  return (
    <div id="invoice-preview-visible" style={{ background:"#fff", width:794, minHeight:1123, margin:"0 auto",
      padding:"80px 48px", fontFamily:"Arial,sans-serif", color:"#111", boxSizing:"border-box", fontSize:12 }}>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div style={{ lineHeight:1 }}>
          <div style={{ fontSize:30, fontWeight:900, color:blue, letterSpacing:-1, fontStyle: "italic" }}>TAZ</div>
          <div style={{ fontSize:8, fontWeight:700, color:"#dc2626", letterSpacing:"0.18em", marginLeft: "0.4rem", textTransform:"uppercase", marginTop:1 }}>COMPANY</div>
        </div>
        <div style={{ fontSize:22, fontWeight:800, color:"#111", letterSpacing:4 }}>INVOICE</div>
      </div>

      <div style={{ display:"flex", gap:20, marginBottom:20 }}>
        <Sec id="bill-to" style={{ flex:1, border:"1px solid #e5e7eb", borderRadius:4 }}>
          <div style={{ background:blue, color:"#fff", padding:"6px 12px", fontSize:11, fontWeight:700, textAlign:"center" }}>Bill To</div>
          <div style={{ padding:12 }}>
            <div style={{ marginBottom:4 }}>Account Code : <strong>{data.accountCode}</strong></div>
            <div style={{ fontWeight:700, marginBottom:4 }}>{data.companyName}</div>
            <div style={{ marginBottom:4 }}>{data.address}</div>
            <div style={{ marginBottom:4 }}>{data.contactName}</div>
            <div>{data.country}</div>
          </div>
        </Sec>
        <Sec id="invoice-details" style={{ flex:1.4, border:"1px solid #e5e7eb", borderRadius:4 }}>
          <div style={{ background:blue, color:"#fff", padding:"6px 12px", fontSize:11, fontWeight:700 }}>Invoice Number: {data.invoiceNumber}</div>
          <div style={{ padding:"8px 12px" }}>
            {[["Business Code",data.businessCode],["Date",data.date],["Shipper",data.shipper],
              ["Consignee",data.consignee],["From",data.origin],["Destination",data.destination],["Notes",data.notes]
            ].map(([k,v]) => (
              <div key={k} style={{ display:"flex", gap:8, marginBottom:4, fontSize:11 }}>
                <span style={{ minWidth:90, color:"#555" }}>{k}</span><span>: {v}</span>
              </div>
            ))}
          </div>
        </Sec>
      </div>

      <Sec id="shipment">
        <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
          <thead><tr>{["Volume Weight","Gross Weight","CBM","NOP","Term","REF."].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody><tr>
            <td style={td}>{data.volumeWeight}</td><td style={td}>{data.grossWeight}</td>
            <td style={td}>{data.cbm}</td><td style={td}>{data.nop}</td>
            <td style={td}>{data.term}</td><td style={td}>{data.ref}</td>
          </tr></tbody>
        </table>
      </Sec>

      <Sec id="route">
        <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
          <thead><tr>{["From","To","Commodity","Date"].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
          <tbody><tr>
            <td style={td}>{data.fromCountry}</td><td style={td}>{data.toCity}</td>
            <td style={td}>{data.commodity}</td><td style={td}>{data.shipDate}</td>
          </tr></tbody>
        </table>
      </Sec>

      <Sec id="line-items">
        <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
          <thead><tr>
            <th style={{...th,width:"22%"}}>Shipping Code</th>
            <th style={{...th,width:"34%"}}>Description</th>
            <th style={{...th,width:"12%",textAlign:"right"}}>QTY (KG)</th>
            <th style={{...th,width:"16%",textAlign:"right"}}>Unit Price USD</th>
            <th style={{...th,width:"16%",textAlign:"right"}}>Amount USD</th>
          </tr></thead>
          <tbody>
            {data.lineItems.map((item,i) => (
              <tr key={i}>
                <td style={td}>{item.shippingCode}</td><td style={td}>{item.description}</td>
                <td style={{...td,textAlign:"right"}}>{item.qty}</td>
                <td style={{...td,textAlign:"right"}}>{item.unitPrice.toFixed(2)}</td>
                <td style={{...td,textAlign:"right"}}>{(item.qty*item.unitPrice).toFixed(2)}</td>
              </tr>
            ))}
            {Array.from({length:Math.max(0,5-data.lineItems.length)}).map((_,i) => (
              <tr key={`e${i}`} style={{height:28}}>
                <td style={{...td,color:"transparent"}}>—</td>
                <td style={td}/><td style={td}/><td style={td}/><td style={td}/>
              </tr>
            ))}
          </tbody>
        </table>
      </Sec>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:40 }}>
        <div style={{ fontSize:11, color:"#555", maxWidth:360 }}>
          Total Amount in Word (USD): <strong>{numberToWords(total)} Dollars</strong>
        </div>
        <div style={{ display:"flex" }}>
          <div style={{ background:blue, color:"#fff", padding:"8px 20px", fontSize:12, fontWeight:700 }}>Total</div>
          <div style={{ background:"#dbeafe", border:`1px solid ${blue}`, color:"#111", padding:"8px 20px", fontSize:12, fontWeight:700, minWidth:80, textAlign:"right" }}>
            {total.toLocaleString("en-US",{minimumFractionDigits:2})}
          </div>
        </div>
      </div>

      <div style={{ borderTop:"1px solid #e5e7eb", paddingTop:12, textAlign:"center", fontSize:10, color:"#6b7280" }}>
        <div>Head Office address : Al-Karrada District - Block 909, Street 18, Building 207 - Baghdad - Iraq</div>
        <div>Iraq Mob. : +964776 558 8815 &nbsp; web: www.tazcom.net &nbsp; Email: info@tazcom.net</div>
      </div>
    </div>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const InvoicePage: React.FC = () => {
  const isMobile = useIsMobile();

  // ── State ────────────────────────────────────────────────────────────────
  const [data, setData]               = useState<InvoiceData>(DEFAULT_INVOICE);
  const [showPreview, setShowPreview] = useState(false);
  const [saving, setSaving]           = useState(false);
  const [saveMsg, setSaveMsg]         = useState<{ text: string; ok: boolean } | null>(null);
  const [drafts, setDrafts]           = useState<DraftRow[]>([]);
  const [loadingDrafts, setLoadingDrafts] = useState(false);
  const [showDrafts, setShowDrafts]   = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; number: string } | null>(null);
  const [deleting, setDeleting]       = useState(false);
  const [swipeX, setSwipeX]           = useState<Record<string, number>>({});
  const swipeStart                    = useRef<Record<string, number>>({});
  const mouseDown                     = useRef<Record<string, number>>({});
  const cardRefs                      = useRef<Record<string, HTMLDivElement | null>>({});
  const [highlightedCard, setHighlightedCard] = useState<string | null>(null);
  const headerRef                     = useRef<HTMLDivElement>(null);

  // ── Set dark status bar (time/battery area) ───────────────────────────────
  // Sets the browser/OS chrome above the page to match the dark background.
  // On iOS Safari this colours the status bar. On Android Chrome it colours
  // the top browser bar. Restores previous value when page unmounts.
  useEffect(() => {
    const existing = document.querySelector('meta[name="theme-color"]');
    const prev = existing?.getAttribute("content") ?? null;
    if (existing) {
      existing.setAttribute("content", "#020617");
    } else {
      const meta = document.createElement("meta");
      meta.name = "theme-color";
      meta.content = "#020617";
      document.head.appendChild(meta);
    }
    return () => {
      const el = document.querySelector('meta[name="theme-color"]');
      if (el) el.setAttribute("content", prev ?? "#ffffff");
    };
  }, []);

  useEffect(() => {
    if (!headerRef.current) return;
    const ro = new ResizeObserver(() => {});
    ro.observe(headerRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Setters ──────────────────────────────────────────────────────────────
  const set = (key: keyof InvoiceData) => (v: string) =>
    setData(prev => ({ ...prev, [key]: v }));

  const setItem = (idx: number, key: keyof LineItem, v: string | number) =>
    setData(prev => {
      const items = [...prev.lineItems];
      items[idx] = { ...items[idx], [key]: v };
      return { ...prev, lineItems: items };
    });

  const addItem = () =>
    setData(prev => ({ ...prev, lineItems: [...prev.lineItems, { shippingCode:"", description:"", qty:0, unitPrice:0 }] }));

  const removeItem = (idx: number) =>
    setData(prev => ({ ...prev, lineItems: prev.lineItems.filter((_,i) => i !== idx) }));

  const total = calcTotal(data.lineItems);

  const incrementInvoiceNumber = () => {
    const m = data.invoiceNumber.match(/^([A-Za-z]+)(\d+)$/);
    if (m) set("invoiceNumber")(m[1] + String(Number(m[2])+1).padStart(m[2].length,"0"));
  };

  // ── Supabase ─────────────────────────────────────────────────────────────
  const loadDrafts = async () => {
    setLoadingDrafts(true);
    const { data: rows, error } = await supabase
      .from("invoice_drafts").select("id, invoice_number, updated_at")
      .order("updated_at", { ascending:false }).limit(10);
    if (!error && rows) setDrafts(rows as DraftRow[]);
    setLoadingDrafts(false);
  };
  useEffect(() => { loadDrafts(); }, []);

  const saveDraft = async () => {
    setSaving(true); setSaveMsg(null);
    const { error } = await supabase.from("invoice_drafts").insert([{
      invoice_number: data.invoiceNumber, business_code: data.businessCode,
      invoice_date: data.date, shipper: data.shipper, consignee: data.consignee,
      origin: data.origin, destination: data.destination, notes: data.notes,
      account_code: data.accountCode, company_name: data.companyName,
      address: data.address, contact_name: data.contactName, contact_tel: data.contactTel,
      country: data.country, volume_weight: data.volumeWeight, gross_weight: data.grossWeight,
      cbm: data.cbm, nop: data.nop, term: data.term, ref: data.ref,
      from_country: data.fromCountry, to_city: data.toCity,
      commodity: data.commodity, ship_date: data.shipDate,
      line_items: data.lineItems, total_amount: total,
      updated_at: new Date().toISOString(),
    }]);
    setSaving(false);
    if (error) { setSaveMsg({ text:"Error: "+error.message, ok:false }); }
    else { setSaveMsg({ text:"Draft saved!", ok:true }); loadDrafts(); setTimeout(() => setSaveMsg(null), 3000); }
  };

  const loadDraft = async (id: string) => {
    const { data: row, error } = await supabase.from("invoice_drafts").select("*").eq("id", id).single();
    if (error || !row) return;
    setData({
      invoiceNumber: row.invoice_number ?? "", businessCode: row.business_code ?? "",
      date: row.invoice_date ?? "", shipper: row.shipper ?? "", consignee: row.consignee ?? "",
      origin: row.origin ?? "", destination: row.destination ?? "", notes: row.notes ?? "",
      accountCode: row.account_code ?? "", companyName: row.company_name ?? "",
      address: row.address ?? "", contactName: row.contact_name ?? "", contactTel: row.contact_tel ?? "",
      country: row.country ?? "", volumeWeight: row.volume_weight ?? "", grossWeight: row.gross_weight ?? "",
      cbm: row.cbm ?? "", nop: row.nop ?? "", term: row.term ?? "", ref: row.ref ?? "",
      fromCountry: row.from_country ?? "", toCity: row.to_city ?? "",
      commodity: row.commodity ?? "", shipDate: row.ship_date ?? "", lineItems: row.line_items ?? [],
    });
    setSaveMsg({ text:"Draft loaded.", ok:true });
    if (isMobile) setShowDrafts(false);
    setTimeout(() => setSaveMsg(null), 2000);
  };

  const deleteDraft = async (id: string) => {
    setDeleting(true);
    await supabase.from("invoice_drafts").delete().eq("id", id);
    setDeleting(false);
    setDeleteConfirm(null);
    setSwipeX(prev => { const n = {...prev}; delete n[id]; return n; });
    loadDrafts();
  };

  // ── PDF ──────────────────────────────────────────────────────────────────
  const downloadPdf = async () => {
    setShowPreview(true);
    await new Promise(r => setTimeout(r, 400));
    const container = document.createElement("div");
    container.style.cssText = "position:fixed;left:-9999px;top:0;width:794px;background:#fff;z-index:-1;";
    document.body.appendChild(container);
    const { createRoot } = await import("react-dom/client");
    const root = createRoot(container);
    await new Promise<void>(resolve => {
      root.render(<InvoicePreview data={data} />);
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
    });
    try {
      const canvas = await html2canvas(container, { scale:2, useCORS:true, width:794, windowWidth:794 });
      const pdf = new jsPDF({ orientation:"portrait", unit:"px", format:[794,1123] });
      pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 794, 1123);
      pdf.save(`Invoice-${data.invoiceNumber}.pdf`);
    } finally {
      root.unmount();
      document.body.removeChild(container);
    }
  };

  // ── Focus section ─────────────────────────────────────────────────────────
  const sectionToCard: Record<string,string> = {
    "invoice-details": "invoice-details",
    "bill-to":         "bill-to",
    "shipment":        "shipment",
    "route":           "route",
    "line-items":      "line-items",
  };
  const focusSection = (sectionId: string) => {
    const key = sectionToCard[sectionId];
    const el = key ? cardRefs.current[key] : null;
    if (!el) return;
    el.scrollIntoView({ behavior:"smooth", block:"start" });
    setHighlightedCard(key);
    setTimeout(() => setHighlightedCard(null), 2000);
  };
  const cardRef = (key: string) => (el: HTMLDivElement | null) => { cardRefs.current[key] = el; };
  const cardGlow = (key: string): React.CSSProperties =>
    highlightedCard === key
      ? { boxShadow:"0 0 0 3px #3b82f6, 0 0 20px #3b82f640", transition:"box-shadow 0.2s ease" }
      : { transition:"box-shadow 0.5s ease" };

  // ── Swipe helpers ─────────────────────────────────────────────────────────
  const SWIPE_THRESH = 60;
  const onTouchStart = (id: string, e: React.TouchEvent) => { swipeStart.current[id] = e.touches[0].clientX; };
  const onTouchMove  = (id: string, e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - (swipeStart.current[id] ?? 0);
    setSwipeX(prev => ({ ...prev, [id]: Math.max(-90, Math.min(0, dx)) }));
  };
  const onTouchEnd   = (id: string) => {
    const x = swipeX[id] ?? 0;
    setSwipeX(prev => ({ ...prev, [id]: x < -SWIPE_THRESH ? -90 : 0 }));
  };
  const onMouseDownSwipe = (id: string, e: React.MouseEvent) => { mouseDown.current[id] = e.clientX; };
  const onMouseUpSwipe   = (id: string, e: React.MouseEvent) => {
    const dx = e.clientX - (mouseDown.current[id] ?? 0);
    setSwipeX(prev => ({ ...prev, [id]: dx < -SWIPE_THRESH ? -90 : 0 }));
  };

  // ── Button styles ─────────────────────────────────────────────────────────
  const btnPrimary: React.CSSProperties = {
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7,
    background:"linear-gradient(135deg,#1a6ef5,#0ea5e9)", color:"#fff", border:"none", borderRadius:8,
    padding: isMobile ? "11px 14px" : "8px 16px", fontSize:13, fontWeight:600,
    cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
    boxShadow:"0 2px 8px #1a6ef540", minHeight: isMobile ? 44 : "auto", whiteSpace:"nowrap" as const,
  };
  const btnSecondary: React.CSSProperties = {
    display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7,
    background:"#1e293b", color:"#94a3b8", border:"1px solid #334155", borderRadius:8,
    padding: isMobile ? "11px 14px" : "8px 16px", fontSize:13, fontWeight:600,
    cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
    minHeight: isMobile ? 44 : "auto", whiteSpace:"nowrap" as const,
  };
  const btnGreen: React.CSSProperties = {
    ...btnPrimary, background:"linear-gradient(135deg,#059669,#10b981)", boxShadow:"0 2px 8px #05966940",
  };
  const btnRed: React.CSSProperties = {
    ...btnPrimary, background:"linear-gradient(135deg,#dc2626,#ef4444)", boxShadow:"0 2px 8px #dc262640",
  };
  const inputStyle: React.CSSProperties = {
    background:"#0f172a", border:"1px solid #1e293b", borderRadius:6,
    padding: isMobile ? "10px 12px" : "7px 9px", fontSize: isMobile ? 16 : 12,
    color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif",
    outline:"none", width:"100%", boxSizing:"border-box" as const,
  };

  // ── Drafts panel ─────────────────────────────────────────────────────────
  const DraftsPanel = (
    <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:10, overflow:"hidden",
      width: isMobile ? "100%" : 300, flexShrink:0 }}>
      <div style={{ background:"linear-gradient(90deg,#1a6ef5 0%,#0ea5e9 100%)", padding:"8px 18px",
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <span style={{ fontSize:11, fontWeight:700, color:"#fff", letterSpacing:"0.08em",
          textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>Saved Drafts</span>
        <button style={{ ...btnSecondary, padding:"4px 10px", fontSize:11, minHeight:"auto",
          background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", color:"#fff" }}
          onClick={loadDrafts}>
          {loadingDrafts ? "…" : "↻ Refresh"}
        </button>
      </div>
      <div style={{ overflowY:"auto", maxHeight: isMobile ? 320 : 480 }}>
        {drafts.length === 0 ? (
          <div style={{ padding:"32px 20px", textAlign:"center", color:"#475569", fontSize:13,
            fontFamily:"'DM Sans',sans-serif" }}>No drafts saved yet.</div>
        ) : drafts.map((d, idx) => {
          const tx = swipeX[d.id] ?? 0;
          return (
            <div key={d.id} style={{ position:"relative",
              borderBottom: idx < drafts.length-1 ? "1px solid #1e293b" : "none", overflow:"hidden" }}>

              {/* Red swipe-delete revealed on swipe */}
              <div style={{ position:"absolute", right:0, top:0, bottom:0, width:90,
                background:"#dc2626", display:"flex", alignItems:"center", justifyContent:"center",
                cursor:"pointer" }}
                onClick={() => setDeleteConfirm({ id: d.id, number: d.invoice_number })}>
                <div style={{ textAlign:"center" }}>
                  <svg width="18" height="18" fill="none" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24"
                    style={{ display:"block", margin:"0 auto 3px" }}>
                    <polyline points="3,6 5,6 21,6"/>
                    <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                    <path d="M10 11v6"/><path d="M14 11v6"/>
                    <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                  </svg>
                  <span style={{ fontSize:10, fontWeight:700, color:"#fff" }}>Delete</span>
                </div>
              </div>

              {/* Sliding row */}
              <div style={{ padding:"13px 18px",
                transform:`translateX(${tx}px)`,
                transition: tx === 0 || tx === -90 ? "transform 0.2s ease" : "none",
                background:"#0f172a", position:"relative", zIndex:1, userSelect:"none" }}
                onTouchStart={e => onTouchStart(d.id, e)}
                onTouchMove={e => onTouchMove(d.id, e)}
                onTouchEnd={() => onTouchEnd(d.id)}
                onMouseDown={e => onMouseDownSwipe(d.id, e)}
                onMouseUp={e => onMouseUpSwipe(d.id, e)}>

                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
                  <span style={{ fontSize:13, fontWeight:700, color:"#e2e8f0",
                    fontFamily:"'DM Sans',sans-serif" }}>{d.invoice_number}</span>
                  <div style={{ display:"flex", alignItems:"center", gap:6 }}>
                    {/* ── Delete button: small width, matches Remove style ── */}
                    <button
                      onClick={e => { e.stopPropagation();
                        setSwipeX(prev => ({ ...prev, [d.id]: 0 }));
                        setDeleteConfirm({ id: d.id, number: d.invoice_number }); }}
                      style={{
                        background:"#450a0a", border:"1px solid #7f1d1d", color:"#f87171",
                        cursor:"pointer", fontSize:10, fontWeight:700, borderRadius:6,
                        padding:"2px 7px", height:22,
                        display:"inline-flex", alignItems:"center", gap:3,
                        fontFamily:"'DM Sans',sans-serif", whiteSpace:"nowrap" as const,
                      }}>
                      <svg width="9" height="9" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3,6 5,6 21,6"/>
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                        <path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/>
                      </svg>
                      Del
                    </button>
                    <span style={{ background:"#312e81", color:"#a5b4fc", border:"1px solid #4338ca",
                      padding:"2px 9px", borderRadius:20, fontSize:10, fontWeight:700,
                      fontFamily:"'DM Sans',sans-serif" }}>Draft</span>
                  </div>
                </div>

                <div style={{ fontSize:11, color:"#475569", marginBottom:10,
                  fontFamily:"'DM Sans',sans-serif" }}>{new Date(d.updated_at).toLocaleString()}</div>

                {/* Load button — scrolls to top after loading */}
                <button style={{ ...btnSecondary, width:"100%", fontSize:12, padding:"8px",
                  minHeight: isMobile ? 44 : "auto" }}
                  onClick={() => {
                    setSwipeX(prev => ({ ...prev, [d.id]: 0 }));
                    loadDraft(d.id);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}>
                  Load into Editor
                </button>

                {tx === 0 && (
                  <div style={{ fontSize:9, color:"#334155", textAlign:"right", marginTop:5,
                    fontFamily:"'DM Sans',sans-serif" }}>← swipe to delete</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // ─────────────────────────────────────────────────────────────────────────
  return (
    // ── CHANGE: dark background covers the whole page ──
    // margin: -28px pulls back AppDashboard's padding so the dark fills edge-to-edge.
    // padding: 28px restores the inner spacing.
    <div style={{ fontFamily:"'DM Sans',sans-serif", color:"#e2e8f0",
      background:"#020617", minHeight:"100vh",
      margin:"-28px", padding:"28px" }}>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {deleteConfirm && (
        <div style={{ position:"fixed", inset:0, zIndex:200, background:"rgba(0,0,0,0.75)",
          display:"flex", alignItems:"center", justifyContent:"center", padding:24 }}
          onClick={e => { if (e.target === e.currentTarget) setDeleteConfirm(null); }}>
          <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:14,
            padding:"28px 24px", maxWidth:340, width:"100%", boxShadow:"0 24px 64px #000a" }}>
            <div style={{ width:48, height:48, borderRadius:"50%", background:"#450a0a",
              border:"1px solid #7f1d1d", display:"flex", alignItems:"center", justifyContent:"center",
              margin:"0 auto 16px" }}>
              <svg width="22" height="22" fill="none" stroke="#f87171" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="3,6 5,6 21,6"/>
                <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/>
                <path d="M10 11v6"/><path d="M14 11v6"/>
              </svg>
            </div>
            <h3 style={{ margin:"0 0 8px", fontSize:16, fontWeight:800, color:"#f1f5f9",
              textAlign:"center", fontFamily:"'DM Sans',sans-serif" }}>Delete Draft?</h3>
            <p style={{ margin:"0 0 24px", fontSize:13, color:"#94a3b8", textAlign:"center",
              fontFamily:"'DM Sans',sans-serif", lineHeight:1.5 }}>
              Are you sure you want to delete draft{" "}
              <strong style={{ color:"#e2e8f0" }}>{deleteConfirm.number}</strong>?{" "}
              This cannot be undone.
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button style={{ ...btnSecondary, flex:1, justifyContent:"center" }}
                onClick={() => { setDeleteConfirm(null); setSwipeX(prev => ({ ...prev, [deleteConfirm.id]: 0 })); }}>
                Cancel
              </button>
              <button style={{ ...btnRed, flex:1, justifyContent:"center" }}
                onClick={() => deleteDraft(deleteConfirm.id)} disabled={deleting}>
                {deleting ? "Deleting…" : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── STICKY HEADER ─────────────────────────────────────────────────────
          The header is unchanged from the document. Only the title gets
          marginLeft on mobile so it sits visibly to the right of the edge. */}
      <div ref={headerRef} style={{
        position:"sticky", top:0, zIndex:50,
        background:"rgba(2,6,23,0.95)",
        backdropFilter:"blur(12px)", WebkitBackdropFilter:"blur(12px)",
        borderBottom:"1px solid #1e293b",
        margin:"-28px -28px 24px -28px",
        padding: isMobile ? "14px 16px" : "14px 28px",
      } as React.CSSProperties}>
        <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row",
          alignItems: isMobile ? "flex-start" : "center",
          justifyContent:"space-between", gap: isMobile ? 12 : 0 }}>

          {/* ── Title — marginLeft on mobile pushes it away from the screen edge ── */}
          <div style={{ display:"flex", alignItems:"center", gap:14, marginLeft: isMobile ? 8 : 0 }}>
            <div>
              <h1 style={{ margin: 8.5, fontSize: isMobile ? 18 : 20, fontWeight:800, color:"#f1f5f9", lineHeight:1.2 }}>
                 Invoice Editor
              </h1>
              <p style={{ margin:"2px 14px 0", fontSize:12, color:"#64748b" }}>
                {data.invoiceNumber} · Total ${total.toLocaleString("en-US",{minimumFractionDigits:2})}
              </p>
            </div>
            {saveMsg && (
              <span style={{ fontSize:12, fontWeight:700,
                color: saveMsg.ok ? "#34d399" : "#f87171",
                background: saveMsg.ok ? "#064e3b44" : "#450a0a44",
                border:`1px solid ${saveMsg.ok ? "#065f4644" : "#7f1d1d44"}`,
                borderRadius:6, padding:"4px 10px" }}>
                {saveMsg.text}
              </span>
            )}
          </div>

          <div style={{ display:"flex", flexWrap:"wrap", gap:8, width: isMobile ? "100%" : "auto" }}>
            {isMobile && (
              <button style={{ ...btnSecondary, flex:"1 1 auto" }} onClick={() => setShowDrafts(p => !p)}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                  <polyline points="14,2 14,8 20,8"/>
                </svg>
                {showDrafts ? "Hide Drafts" : `Drafts${drafts.length > 0 ? ` (${drafts.length})` : ""}`}
              </button>
            )}
            <button style={{ ...btnSecondary, flex: isMobile ? "1 1 auto" : "none" }}
              onClick={() => setShowPreview(p => !p)}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
              </svg>
              {showPreview ? "Hide Preview" : "Preview"}
            </button>
            <button style={{ ...btnGreen, flex: isMobile ? "1 1 auto" : "none" }}
              onClick={saveDraft} disabled={saving}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                <polyline points="17,21 17,13 7,13 7,21"/>
                <polyline points="7,3 7,8 15,8"/>
              </svg>
              {saving ? "Saving…" : "Save Draft"}
            </button>
            <button style={{ ...btnPrimary, flex: isMobile ? "1 1 auto" : "none" }} onClick={downloadPdf}>
              <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Mobile drafts */}
      {isMobile && showDrafts && <div style={{ marginBottom:16 }}>{DraftsPanel}</div>}

      {/* ── Two-column layout ── */}
      <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row", gap:16, alignItems:"flex-start" }}>

        <div style={{ flex:"1 1 0", minWidth:0, width:"100%" }}>

          {/* Invoice Details */}
          <div ref={cardRef("invoice-details")} style={cardGlow("invoice-details")}>
            <Card title="Invoice Details">
              <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                <div style={{ display:"flex", flexDirection:"column", gap:4, flex: isMobile ? "1 1 100%" : "1 1 160px" }}>
                  <label style={{ fontSize:10, fontWeight:600, color:"#64748b", textTransform:"uppercase",
                    letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif" }}>Invoice Number</label>
                  <div style={{ display:"flex", gap:6 }}>
                    <input value={data.invoiceNumber} onChange={e => set("invoiceNumber")(e.target.value)}
                      style={{ ...inputStyle, flex:1 }}
                      onFocus={e => (e.target.style.borderColor = "#3b82f6")}
                      onBlur={e => (e.target.style.borderColor = "#1e293b")} />
                    <button title="Auto-increment" onClick={incrementInvoiceNumber}
                      style={{ ...btnSecondary, padding:"0 10px", fontSize:14, minHeight:"auto", borderRadius:6, flexShrink:0 }}>
                      +1
                    </button>
                  </div>
                </div>
                <Field isMobile={isMobile} label="Business Code" value={data.businessCode} onChange={set("businessCode")} />
                <SmartDatePicker isMobile={isMobile} label="Invoice Date" value={data.date} onChange={set("date")} />
                <Field isMobile={isMobile} label="Shipper"       value={data.shipper}       onChange={set("shipper")} full />
                <Field isMobile={isMobile} label="Consignee"     value={data.consignee}     onChange={set("consignee")} full />
                <Field isMobile={isMobile} label="Origin (From)" value={data.origin}        onChange={set("origin")} />
                <Field isMobile={isMobile} label="Destination"   value={data.destination}   onChange={set("destination")} />
                <Field isMobile={isMobile} label="Notes"         value={data.notes}         onChange={set("notes")} full maxLength={200} />
              </div>
            </Card>
          </div>

          {/* Bill To */}
          <div ref={cardRef("bill-to")} style={cardGlow("bill-to")}>
            <Card title="Bill To">
              <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                <Field isMobile={isMobile} label="Account Code"       value={data.accountCode} onChange={set("accountCode")} />
                <Field isMobile={isMobile} label="Company Name"       value={data.companyName} onChange={set("companyName")} />
                <Field isMobile={isMobile} label="Address"            value={data.address}     onChange={set("address")} full />
                <Field isMobile={isMobile} label="Contact Name & Tel" value={data.contactName} onChange={set("contactName")} full />
                <Field isMobile={isMobile} label="Country"            value={data.country}     onChange={set("country")} />
              </div>
            </Card>
          </div>

          {/* Shipment Info */}
          <div ref={cardRef("shipment")} style={cardGlow("shipment")}>
            <Card title="Shipment Info">
              <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                <Field isMobile={isMobile} label="Volume Weight" value={data.volumeWeight} onChange={set("volumeWeight")} />
                <Field isMobile={isMobile} label="Gross Weight"  value={data.grossWeight}  onChange={set("grossWeight")} />
                <Field isMobile={isMobile} label="CBM"           value={data.cbm}          onChange={set("cbm")} />
                <Field isMobile={isMobile} label="NOP"           value={data.nop}          onChange={set("nop")} />
                <Field isMobile={isMobile} label="Term"          value={data.term}         onChange={set("term")} />
                <Field isMobile={isMobile} label="REF."          value={data.ref}          onChange={set("ref")} />
              </div>
            </Card>
          </div>

          {/* Route & Commodity */}
          <div ref={cardRef("route")} style={cardGlow("route")}>
            <Card title="Route & Commodity">
              <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
                <Field isMobile={isMobile} label="From (Country)" value={data.fromCountry} onChange={set("fromCountry")} />
                <Field isMobile={isMobile} label="To (City)"      value={data.toCity}      onChange={set("toCity")} />
                <Field isMobile={isMobile} label="Commodity"      value={data.commodity}   onChange={set("commodity")} />
                <SmartDatePicker isMobile={isMobile} label="Ship Date" value={data.shipDate} onChange={set("shipDate")} />
              </div>
            </Card>
          </div>

          {/* Line Items */}
          <div ref={cardRef("line-items")} style={cardGlow("line-items")}>
            <Card title="Line Items">
              {isMobile ? (
                <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                  {data.lineItems.map((item, i) => (
                    <div key={i} style={{ background:"#020617", border:"1px solid #1e293b", borderRadius:8, padding:"12px 14px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                        <span style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em" }}>Line {i+1}</span>
                        <button onClick={() => removeItem(i)}
                          style={{ background:"#450a0a", border:"1px solid #7f1d1d", color:"#f87171",
                            cursor:"pointer", fontSize:12, fontWeight:700, borderRadius:6, padding:"5px 12px", minHeight:36 }}>
                          Remove
                        </button>
                      </div>
                      <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                        <Field isMobile label="Shipping Code" value={item.shippingCode} onChange={v => setItem(i,"shippingCode",v)} full />
                        <Field isMobile label="Description"   value={item.description}  onChange={v => setItem(i,"description",v)}  full />
                        <div style={{ display:"flex", gap:10 }}>
                          <Field isMobile label="QTY (KG)"   value={String(item.qty)}       onChange={v => setItem(i,"qty",parseFloat(v)||0)} />
                          <Field isMobile label="Unit Price"  value={String(item.unitPrice)} onChange={v => setItem(i,"unitPrice",parseFloat(v)||0)} />
                        </div>
                        <div style={{ fontSize:14, fontWeight:700, color:"#38bdf8", textAlign:"right" }}>
                          Amount: ${(item.qty*item.unitPrice).toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))}
                  <button style={{ ...btnSecondary, width:"100%", minHeight:44 }} onClick={addItem}>+ Add Line Item</button>
                  <div style={{ fontSize:15, fontWeight:800, color:"#f1f5f9", textAlign:"right" }}>
                    Total: <span style={{ color:"#38bdf8" }}>${total.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
                  </div>
                </div>
              ) : (
                <>
                  <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:12 }}>
                    <thead>
                      <tr>{["Shipping Code","Description","QTY (KG)","Unit Price","Amount",""].map(h => (
                        <th key={h} style={{ textAlign:"left", fontSize:10, color:"#64748b", fontWeight:600,
                          padding:"0 6px 8px", letterSpacing:"0.05em", textTransform:"uppercase",
                          fontFamily:"'DM Sans',sans-serif" }}>{h}</th>
                      ))}</tr>
                    </thead>
                    <tbody>
                      {data.lineItems.map((item, i) => (
                        <tr key={i}>
                          <td style={{padding:"4px 6px"}}><input style={inputStyle} value={item.shippingCode} onChange={e => setItem(i,"shippingCode",e.target.value)} /></td>
                          <td style={{padding:"4px 6px"}}><input style={inputStyle} value={item.description}  onChange={e => setItem(i,"description",e.target.value)} /></td>
                          <td style={{padding:"4px 6px",width:72}}><input style={inputStyle} type="number" value={item.qty} onChange={e => setItem(i,"qty",parseFloat(e.target.value)||0)} /></td>
                          <td style={{padding:"4px 6px",width:88}}><input style={inputStyle} type="number" step="0.01" value={item.unitPrice} onChange={e => setItem(i,"unitPrice",parseFloat(e.target.value)||0)} /></td>
                          <td style={{padding:"4px 6px",fontSize:12,color:"#94a3b8",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>${(item.qty*item.unitPrice).toFixed(2)}</td>
                          <td style={{padding:"4px 6px"}}><button onClick={() => removeItem(i)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,lineHeight:1,padding:0}} aria-label="Remove">×</button></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                    <button style={btnSecondary} onClick={addItem}>+ Add Line</button>
                    <div style={{ fontSize:14, fontWeight:700, color:"#f1f5f9" }}>
                      Total: <span style={{ color:"#38bdf8" }}>${total.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
                    </div>
                  </div>
                </>
              )}
            </Card>
          </div>

        </div>

        {/* Desktop drafts sidebar */}
        {!isMobile && DraftsPanel}

      </div>

      {/* ── Preview ── */}
      {showPreview && (
        <div style={{ marginTop:24 }}>
          <div style={{ background:"#0f172a", borderRadius:10, border:"1px solid #1e293b", overflow:"hidden" }}>
            <div style={{ background:"linear-gradient(90deg,#1a6ef5 0%,#0ea5e9 100%)", padding:"8px 18px",
              display:"flex", alignItems:"center", justifyContent:"space-between" }}>
              <span style={{ fontSize:11, fontWeight:700, color:"#fff", letterSpacing:"0.08em",
                textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>Invoice Preview</span>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <button style={{ ...btnPrimary, padding:"5px 12px", fontSize:12, minHeight:"auto", boxShadow:"none" }}
                  onClick={downloadPdf}>↓ Download PDF</button>
                <button style={{ ...btnSecondary, padding:"4px 12px", fontSize:12, minHeight:"auto",
                  background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", color:"#fff" }}
                  onClick={() => setShowPreview(false)}>✕ Close</button>
              </div>
            </div>
            <div style={{ padding: isMobile ? 12 : 20, background:"#1e293b" }}>
              <div style={{ textAlign:"center", fontSize:11, color:"#475569", marginBottom:10,
                fontFamily:"'DM Sans',sans-serif" }}>
                💡 Click any section to jump to its editor
              </div>
              {/* Preview stays open — focusSection scrolls the editor without closing this */}
              <ScaledPreview>
                <InvoicePreview data={data} onSectionClick={id => focusSection(id)} />
              </ScaledPreview>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default InvoicePage;


// // src/components/pages/InvoicePage.tsx
// // Run once: npm install jspdf html2canvas

// import React, { useEffect, useRef, useState } from "react";
// import { jsPDF } from "jspdf";
// import html2canvas from "html2canvas";
// import supabase from "../../../supabase";

// // ─── Types ────────────────────────────────────────────────────────────────────

// interface LineItem {
//   shippingCode: string;
//   description: string;
//   qty: number;
//   unitPrice: number;
// }

// interface InvoiceData {
//   invoiceNumber: string;
//   businessCode: string;
//   date: string;
//   shipper: string;
//   consignee: string;
//   origin: string;
//   destination: string;
//   notes: string;
//   accountCode: string;
//   companyName: string;
//   address: string;
//   contactName: string;
//   contactTel: string;
//   country: string;
//   grossWeight: string;
//   cbm: string;
//   nop: string;
//   term: string;
//   ref: string;
//   fromCountry: string;
//   toCity: string;
//   commodity: string;
//   shipDate: string;
//   lineItems: LineItem[];
// }

// interface DraftRow {
//   id: string;
//   invoice_number: string;
//   updated_at: string;
// }

// // ─── Default data ─────────────────────────────────────────────────────────────

// const DEFAULT_INVOICE: InvoiceData = {
//   invoiceNumber: "TAZ039",
//   businessCode: "TAZ company",
//   date: "25 – 5 – 2026",
//   shipper: "NOON Shipping Guangzhou – China",
//   consignee: "Vatren Company – IRAQ",
//   origin: "CHINA",
//   destination: "ERBIL",
//   notes: "",
//   accountCode: "VAT-1011",
//   companyName: "VATREN COMPANY",
//   address: "100M ROAD ERBIL IRAQ",
//   contactName: "MR. Hardi Ismail TEL: +964 750 600 5005",
//   contactTel: "+964 750 600 5005",
//   country: "IRAQ",
//   grossWeight: "292 kg",
//   cbm: "",
//   nop: "15",
//   term: "EXW",
//   ref: "",
//   fromCountry: "China",
//   toCity: "Erbil",
//   commodity: "Curtains & Accessories",
//   shipDate: "16 MAY 26",
//   lineItems: [
//     { shippingCode: "Shipping – Air Freight", description: "Curtains & Accessories", qty: 292, unitPrice: 10.25 },
//   ],
// };

// // ─── Helpers ──────────────────────────────────────────────────────────────────

// function numberToWords(n: number): string {
//   if (n === 0) return "Zero";
//   const ones = ["","One","Two","Three","Four","Five","Six","Seven","Eight","Nine",
//     "Ten","Eleven","Twelve","Thirteen","Fourteen","Fifteen","Sixteen","Seventeen","Eighteen","Nineteen"];
//   const tens = ["","","Twenty","Thirty","Forty","Fifty","Sixty","Seventy","Eighty","Ninety"];
//   function convert(num: number): string {
//     if (num < 20) return ones[num];
//     if (num < 100) return tens[Math.floor(num/10)] + (num%10 ? " "+ones[num%10] : "");
//     if (num < 1000) return ones[Math.floor(num/100)] + " Hundred" + (num%100 ? " "+convert(num%100) : "");
//     if (num < 1000000) return convert(Math.floor(num/1000)) + " Thousand" + (num%1000 ? " "+convert(num%1000) : "");
//     return convert(Math.floor(num/1000000)) + " Million" + (num%1000000 ? " "+convert(num%1000000) : "");
//   }
//   const int = Math.floor(n);
//   const dec = Math.round((n - int) * 100);
//   return convert(int) + (dec > 0 ? ` and ${dec}/100` : "");
// }

// function calcTotal(items: LineItem[]): number {
//   return items.reduce((s, i) => s + i.qty * i.unitPrice, 0);
// }

// // ─── useIsMobile ──────────────────────────────────────────────────────────────

// function useIsMobile() {
//   const [v, set] = useState(() => window.innerWidth < 768);
//   useEffect(() => {
//     const h = () => set(window.innerWidth < 768);
//     window.addEventListener("resize", h);
//     return () => window.removeEventListener("resize", h);
//   }, []);
//   return v;
// }

// // ─── Smart Date Picker ────────────────────────────────────────────────────────
// // Parses the stored date string, detects whether the month is alpha (MAY) or
// // numeric (5), and renders three dropdowns (day / month / year) that preserve
// // that format on output. Separator is detected from the original string too.

// const MONTHS_ALPHA = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

// type DateFormat = "alpha" | "numeric"; // month display format
// type DateSep = " – " | "-" | "/";     // separator between parts

// interface ParsedDate {
//   day: number;        // 1-31
//   month: number;      // 1-12
//   year: number;       // full year e.g. 2026, or 2-digit if stored as 26
//   yearFull: boolean;  // true if stored as 4 digits
//   monthFmt: DateFormat;
//   sep: DateSep;
// }

// function parseDate(raw: string): ParsedDate | null {
//   if (!raw.trim()) return null;

//   // detect separator
//   let sep: DateSep = " – ";
//   if (raw.includes(" – ")) sep = " – ";
//   else if (raw.includes("-")) sep = "-";
//   else if (raw.includes("/")) sep = "/";

//   const parts = raw.split(sep === " – " ? " – " : sep).map(p => p.trim());
//   if (parts.length !== 3) return null;

//   // Try D-MONTH-YY and MONTH-D-YY patterns
//   // Detect if any part is alpha month
//   const alphaIdx = parts.findIndex(p => MONTHS_ALPHA.includes(p.toUpperCase()));
//   let day: number, month: number, year: number, monthFmt: DateFormat;

//   if (alphaIdx !== -1) {
//     // e.g. "16 MAY 26" → parts = ["16","MAY","26"]
//     month = MONTHS_ALPHA.indexOf(parts[alphaIdx].toUpperCase()) + 1;
//     monthFmt = "alpha";
//     const others = parts.filter((_, i) => i !== alphaIdx).map(Number);
//     // Smaller of the two non-month parts is day, larger is year
//     const [a, b] = others;
//     if (a <= 31 && b > 31) { day = a; year = b; }
//     else if (b <= 31 && a > 31) { day = b; year = a; }
//     else { day = a; year = b; } // default: first is day
//   } else {
//     // All numeric e.g. "25 – 5 – 2026"
//     const [d, m, y] = parts.map(Number);
//     day = d; month = m; year = y; monthFmt = "numeric";
//   }

//   if (!day || !month || !year) return null;
//   const yearFull = year > 99;
//   return { day, month, year, yearFull, monthFmt, sep };
// }

// function formatDate(p: ParsedDate): string {
//   const m = p.monthFmt === "alpha"
//     ? MONTHS_ALPHA[p.month - 1]
//     : String(p.month);
//   const y = String(p.year);
//   const sep = p.sep;
//   // Reconstruct in same order as original (day-month-year)
//   return `${p.day}${sep}${m}${sep}${y}`;
// }

// interface DatePickerProps {
//   label: string;
//   value: string;
//   onChange: (v: string) => void;
//   isMobile?: boolean;
//   full?: boolean;
// }

// const SmartDatePicker: React.FC<DatePickerProps> = ({ label, value, onChange, isMobile, full }) => {
//   const parsed = parseDate(value);
//   const now = new Date();

//   // If unparseable, fall back to plain text input
//   if (!parsed) {
//     return (
//       <div style={{ display:"flex", flexDirection:"column", gap:4, flex: (full||isMobile) ? "1 1 100%" : "1 1 160px" }}>
//         <label style={{ fontSize:10, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
//         <input value={value} onChange={e => onChange(e.target.value)}
//           style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:6, padding:"8px 10px", fontSize: isMobile ? 16 : 13, color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", outline:"none", width:"100%", boxSizing:"border-box" }}
//           onFocus={e => (e.target.style.borderColor="#3b82f6")}
//           onBlur={e => (e.target.style.borderColor="#1e293b")}
//         />
//       </div>
//     );
//   }

//   const selStyle: React.CSSProperties = {
//     background: "#0f172a", border: "1px solid #1e293b", borderRadius: 6,
//     padding: isMobile ? "10px 8px" : "7px 6px",
//     fontSize: isMobile ? 15 : 13,
//     color: "#e2e8f0", fontFamily: "'DM Sans', sans-serif",
//     outline: "none", cursor: "pointer", flex: 1,
//     WebkitAppearance: "none", appearance: "none",
//     // custom chevron
//     backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6'%3E%3Cpath d='M0 0l5 6 5-6z' fill='%2364748b'/%3E%3C/svg%3E")`,
//     backgroundRepeat: "no-repeat",
//     backgroundPosition: "right 8px center",
//     paddingRight: 24,
//   };

//   const days = Array.from({ length: 31 }, (_, i) => i + 1);
//   const years = Array.from({ length: 10 }, (_, i) => {
//     const base = parsed.yearFull ? now.getFullYear() - 2 + i : (now.getFullYear() % 100) - 2 + i;
//     return base;
//   });

//   const update = (patch: Partial<ParsedDate>) => {
//     onChange(formatDate({ ...parsed, ...patch }));
//   };

//   return (
//     <div style={{ display:"flex", flexDirection:"column", gap:4, flex: (full||isMobile) ? "1 1 100%" : "1 1 200px" }}>
//       <label style={{ fontSize:10, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
//       <div style={{ display:"flex", gap:4 }}>
//         {/* Day */}
//         <select value={parsed.day} onChange={e => update({ day: Number(e.target.value) })} style={selStyle}
//           onFocus={e => (e.target.style.borderColor="#3b82f6")} onBlur={e => (e.target.style.borderColor="#1e293b")}>
//           {days.map(d => <option key={d} value={d}>{d}</option>)}
//         </select>

//         {/* Month — alpha or numeric depending on detected format */}
//         <select value={parsed.month} onChange={e => update({ month: Number(e.target.value) })} style={selStyle}
//           onFocus={e => (e.target.style.borderColor="#3b82f6")} onBlur={e => (e.target.style.borderColor="#1e293b")}>
//           {MONTHS_ALPHA.map((name, i) => (
//             <option key={i+1} value={i+1}>
//               {parsed.monthFmt === "alpha" ? name : String(i+1)}
//             </option>
//           ))}
//         </select>

//         {/* Year */}
//         <select value={parsed.year} onChange={e => update({ year: Number(e.target.value) })} style={selStyle}
//           onFocus={e => (e.target.style.borderColor="#3b82f6")} onBlur={e => (e.target.style.borderColor="#1e293b")}>
//           {years.map(y => <option key={y} value={y}>{y}</option>)}
//         </select>
//       </div>
//       {/* Show the formatted string so the user can verify */}
//       <span style={{ fontSize:10, color:"#475569", fontFamily:"'DM Sans',sans-serif", marginTop:1 }}>{value}</span>
//     </div>
//   );
// };

// // ─── Scaled Preview Wrapper ───────────────────────────────────────────────────
// // On mobile the A4 (794px) is scaled down to fit the screen width using
// // CSS transform: scale(). The wrapper gets an explicit height so it doesn't
// // collapse when the content is transformed outside its flow.

// const ScaledPreview: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//   const containerRef = useRef<HTMLDivElement>(null);
//   const [scale, setScale] = useState(1);

//   useEffect(() => {
//     const update = () => {
//       if (!containerRef.current) return;
//       const available = containerRef.current.offsetWidth;
//       const docWidth = 794;
//       setScale(Math.min(1, available / docWidth));
//     };
//     update();
//     window.addEventListener("resize", update);
//     return () => window.removeEventListener("resize", update);
//   }, []);

//   const docHeight = 1123;

//   return (
//     <div ref={containerRef} style={{ width: "100%", overflow: "hidden" }}>
//       {/* Outer div reserves the scaled height so layout doesn't collapse */}
//       <div style={{ height: docHeight * scale, position: "relative" }}>
//         <div style={{
//           transformOrigin: "top left",
//           transform: `scale(${scale})`,
//           width: 794,
//           position: "absolute",
//           top: 0, left: 0,
//         }}>
//           {children}
//         </div>
//       </div>
//     </div>
//   );
// };

// // ─── Dark Card ────────────────────────────────────────────────────────────────

// const Card: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
//   <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:10, overflow:"hidden", marginBottom:16 }}>
//     <div style={{ background:"linear-gradient(90deg,#1a6ef5 0%,#0ea5e9 100%)", padding:"8px 18px", fontSize:11, fontWeight:700, color:"#fff", letterSpacing:"0.08em", textTransform:"uppercase" as const, fontFamily:"'DM Sans',sans-serif" }}>
//       {title}
//     </div>
//     <div style={{ padding:"16px 20px" }}>{children}</div>
//   </div>
// );

// // ─── Field ────────────────────────────────────────────────────────────────────

// interface FieldProps {
//   label: string;
//   value: string;
//   onChange: (v: string) => void;
//   full?: boolean;
//   type?: string;
//   isMobile?: boolean;
//   maxLength?: number;
// }

// const Field: React.FC<FieldProps> = ({ label, value, onChange, full, type="text", isMobile, maxLength }) => (
//   <div style={{ display:"flex", flexDirection:"column", gap:4, flex:(full||isMobile) ? "1 1 100%" : "1 1 160px" }}>
//     <div style={{ display:"flex", justifyContent:"space-between" }}>
//       <label style={{ fontSize:10, fontWeight:600, color:"#64748b", textTransform:"uppercase" as const, letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif" }}>{label}</label>
//       {maxLength && <span style={{ fontSize:10, color: value.length > maxLength * 0.8 ? "#f59e0b" : "#475569", fontFamily:"'DM Sans',sans-serif" }}>{value.length}/{maxLength}</span>}
//     </div>
//     <input type={type} value={value} onChange={e => onChange(e.target.value)} maxLength={maxLength}
//       style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:6, padding:"8px 10px", fontSize: isMobile ? 16 : 13, color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif", outline:"none", transition:"border-color 0.15s", width:"100%", boxSizing:"border-box" as const }}
//       onFocus={e => (e.target.style.borderColor="#3b82f6")}
//       onBlur={e => (e.target.style.borderColor="#1e293b")}
//     />
//   </div>
// );

// // ─── Invoice PDF Preview ──────────────────────────────────────────────────────

// const InvoicePreview: React.FC<{ data: InvoiceData }> = ({ data }) => {
//   const total = calcTotal(data.lineItems);
//   const blue = "#2563eb";
//   const th: React.CSSProperties = { background:blue, color:"#fff", padding:"7px 10px", fontSize:11, fontWeight:700, textAlign:"left", fontFamily:"Arial,sans-serif" };
//   const td: React.CSSProperties = { padding:"7px 10px", fontSize:11, fontFamily:"Arial,sans-serif", color:"#111", borderBottom:"1px solid #e5e7eb" };

//   return (
//     <div id="invoice-preview-visible" style={{ background:"#fff", width:794, minHeight:1123, margin:"0 auto", padding:"80px 50px", fontFamily:"Arial,sans-serif", color:"#111", boxSizing:"border-box", fontSize:12 }}>
//       <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
//         <div style={{ lineHeight: 1 }}>
//           <div style={{ fontSize:30, fontWeight:900, color:blue, letterSpacing:-1, fontStyle: "italic" }}>TAZ</div>
//           <div style={{ fontSize:8, fontWeight:700, color:"#dc2626", marginLeft: "0.2rem", letterSpacing:"0.20em", textTransform:"uppercase", marginTop:1 }}>COMPANY</div>
//         </div>
//         <div style={{ fontSize:22, fontWeight:800, color:"#111", letterSpacing:4 }}>INVOICE</div>
//       </div>

//       <div style={{ display:"flex", gap:20, marginBottom:20 }}>
//         <div style={{ flex:1, border:"1px solid #e5e7eb", borderRadius:4 }}>
//           <div style={{ background:blue, color:"#fff", padding:"6px 12px", fontSize:11, fontWeight:700, textAlign:"center" }}>Bill To</div>
//           <div style={{ padding:12 }}>
//             <div style={{ marginBottom:4 }}>Account Code : <strong>{data.accountCode}</strong></div>
//             <div style={{ fontWeight:700, marginBottom:4 }}>{data.companyName}</div>
//             <div style={{ marginBottom:4 }}>{data.address}</div>
//             <div style={{ marginBottom:4 }}>{data.contactName}</div>
//             <div>{data.country}</div>
//           </div>
//         </div>
//         <div style={{ flex:1.4, border:"1px solid #e5e7eb", borderRadius:4 }}>
//           <div style={{ background:blue, color:"#fff", padding:"6px 12px", fontSize:11, fontWeight:700 }}>Invoice Number: {data.invoiceNumber}</div>
//           <div style={{ padding:"8px 12px" }}>
//             {[["Business Code",data.businessCode],["Date",data.date],["Shipper",data.shipper],["Consignee",data.consignee],["From",data.origin],["Destination",data.destination],["Notes",data.notes]].map(([k,v]) => (
//               <div key={k} style={{ display:"flex", gap:8, marginBottom:4, fontSize:11 }}>
//                 <span style={{ minWidth:90, color:"#555" }}>{k}</span><span>: {v}</span>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>

//       <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
//         <thead><tr>{["Volume Weight","Gross Weight","CBM","NOP","Term","REF."].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
//         <tbody><tr><td style={td}/><td style={td}>{data.grossWeight}</td><td style={td}>{data.cbm}</td><td style={td}>{data.nop}</td><td style={td}>{data.term}</td><td style={td}>{data.ref}</td></tr></tbody>
//       </table>

//       <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
//         <thead><tr>{["From","To","Commodity","Date"].map(h=><th key={h} style={th}>{h}</th>)}</tr></thead>
//         <tbody><tr><td style={td}>{data.fromCountry}</td><td style={td}>{data.toCity}</td><td style={td}>{data.commodity}</td><td style={td}>{data.shipDate}</td></tr></tbody>
//       </table>

//       <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:20 }}>
//         <thead><tr>
//           <th style={{...th,width:"22%"}}>Shipping Code</th><th style={{...th,width:"34%"}}>Description</th>
//           <th style={{...th,width:"12%",textAlign:"right"}}>QTY (KG)</th><th style={{...th,width:"16%",textAlign:"right"}}>Unit Price USD</th><th style={{...th,width:"16%",textAlign:"right"}}>Amount USD</th>
//         </tr></thead>
//         <tbody>
//           {data.lineItems.map((item,i)=>(
//             <tr key={i}><td style={td}>{item.shippingCode}</td><td style={td}>{item.description}</td>
//               <td style={{...td,textAlign:"right"}}>{item.qty}</td><td style={{...td,textAlign:"right"}}>{item.unitPrice.toFixed(2)}</td>
//               <td style={{...td,textAlign:"right"}}>{(item.qty*item.unitPrice).toFixed(2)}</td></tr>
//           ))}
//           {Array.from({length:Math.max(0,5-data.lineItems.length)}).map((_,i)=>(
//             <tr key={`e${i}`} style={{height:28}}><td style={{...td,color:"transparent"}}>—</td><td style={td}/><td style={td}/><td style={td}/><td style={td}/></tr>
//           ))}
//         </tbody>
//       </table>

//       <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:40 }}>
//         <div style={{ fontSize:11, color:"#555", maxWidth:360 }}>Total Amount in Word (USD): <strong>{numberToWords(total)} Dollars</strong></div>
//         <div style={{ display:"flex" }}>
//           <div style={{ background:blue, color:"#fff", padding:"8px 20px", fontSize:12, fontWeight:700 }}>Total</div>
//           <div style={{ background:"#dbeafe", border:`1px solid ${blue}`, color:"#111", padding:"8px 20px", fontSize:12, fontWeight:700, minWidth:80, textAlign:"right" }}>{total.toLocaleString("en-US",{minimumFractionDigits:2})}</div>
//         </div>
//       </div>

//       <div style={{ borderTop:"1px solid #e5e7eb", paddingTop:12, textAlign:"center", fontSize:10, color:"#6b7280" }}>
//         <div>Head Office address : Al-Karrada District - Block 909, Street 18, Building 207 - Baghdad - Iraq</div>
//         <div>Iraq Mob. : +964 776 558 8815 &nbsp; web: www.tazcom.net &nbsp; Email: info@tazcom.net</div>
//       </div>
//     </div>
//   );
// };

// // ─── Main Page ────────────────────────────────────────────────────────────────

// const InvoicePage: React.FC = () => {
//   const isMobile = useIsMobile();

//   const [data, setData]           = useState<InvoiceData>(DEFAULT_INVOICE);
//   const [showPreview, setShowPreview] = useState(false);
//   const [saving, setSaving]       = useState(false);
//   const [saveMsg, setSaveMsg]     = useState<{ text: string; ok: boolean } | null>(null);
//   const [drafts, setDrafts]       = useState<DraftRow[]>([]);
//   const [loadingDrafts, setLoadingDrafts] = useState(false);
//   const [showDrafts, setShowDrafts]   = useState(false);

//   // Measure the sticky header height so we can pad the page below it
//   const headerRef = useRef<HTMLDivElement>(null);
//   const [headerH, setHeaderH] = useState(0);
//   useEffect(() => {
//     if (!headerRef.current) return;
//     const ro = new ResizeObserver(() => setHeaderH(headerRef.current?.offsetHeight ?? 0));
//     ro.observe(headerRef.current);
//     return () => ro.disconnect();
//   }, []);

//   const set = (key: keyof InvoiceData) => (v: string) =>
//     setData(prev => ({ ...prev, [key]: v }));

//   const setItem = (idx: number, key: keyof LineItem, v: string | number) =>
//     setData(prev => {
//       const items = [...prev.lineItems];
//       items[idx] = { ...items[idx], [key]: v };
//       return { ...prev, lineItems: items };
//     });

//   const addItem = () =>
//     setData(prev => ({ ...prev, lineItems: [...prev.lineItems, { shippingCode:"", description:"", qty:0, unitPrice:0 }] }));

//   const removeItem = (idx: number) =>
//     setData(prev => ({ ...prev, lineItems: prev.lineItems.filter((_,i) => i !== idx) }));

//   const total = calcTotal(data.lineItems);

//   // Auto-increment invoice number helper
//   const incrementInvoiceNumber = () => {
//     const match = data.invoiceNumber.match(/^([A-Za-z]+)(\d+)$/);
//     if (match) {
//       const next = String(Number(match[2]) + 1).padStart(match[2].length, "0");
//       set("invoiceNumber")(match[1] + next);
//     }
//   };



//   // ── Supabase ──────────────────────────────────────────────────────────────

//   const loadDrafts = async () => {
//     setLoadingDrafts(true);
//     const { data: rows, error } = await supabase
//       .from("invoice_drafts").select("id, invoice_number, updated_at")
//       .order("updated_at", { ascending: false }).limit(10);
//     if (!error && rows) setDrafts(rows as DraftRow[]);
//     setLoadingDrafts(false);
//   };

//   useEffect(() => { loadDrafts(); }, []);

//   const saveDraft = async () => {
//     setSaving(true); setSaveMsg(null);
//     const { error } = await supabase.from("invoice_drafts").insert([{
//       invoice_number: data.invoiceNumber, business_code: data.businessCode,
//       invoice_date: data.date, shipper: data.shipper, consignee: data.consignee,
//       origin: data.origin, destination: data.destination, notes: data.notes,
//       account_code: data.accountCode, company_name: data.companyName,
//       address: data.address, contact_name: data.contactName, contact_tel: data.contactTel,
//       country: data.country, gross_weight: data.grossWeight, cbm: data.cbm,
//       nop: data.nop, term: data.term, ref: data.ref, from_country: data.fromCountry,
//       to_city: data.toCity, commodity: data.commodity, ship_date: data.shipDate,
//       line_items: data.lineItems, total_amount: total, updated_at: new Date().toISOString(),
//     }]);
//     setSaving(false);
//     if (error) { setSaveMsg({ text: "Error: "+error.message, ok: false }); }
//     else { setSaveMsg({ text: "Draft saved!", ok: true }); loadDrafts(); setTimeout(() => setSaveMsg(null), 3000); }
//   };

//   const loadDraft = async (id: string) => {
//     const { data: row, error } = await supabase.from("invoice_drafts").select("*").eq("id", id).single();
//     if (error || !row) return;
//     setData({
//       invoiceNumber: row.invoice_number ?? "", businessCode: row.business_code ?? "",
//       date: row.invoice_date ?? "", shipper: row.shipper ?? "", consignee: row.consignee ?? "",
//       origin: row.origin ?? "", destination: row.destination ?? "", notes: row.notes ?? "",
//       accountCode: row.account_code ?? "", companyName: row.company_name ?? "",
//       address: row.address ?? "", contactName: row.contact_name ?? "", contactTel: row.contact_tel ?? "",
//       country: row.country ?? "", grossWeight: row.gross_weight ?? "", cbm: row.cbm ?? "",
//       nop: row.nop ?? "", term: row.term ?? "", ref: row.ref ?? "",
//       fromCountry: row.from_country ?? "", toCity: row.to_city ?? "",
//       commodity: row.commodity ?? "", shipDate: row.ship_date ?? "", lineItems: row.line_items ?? [],
//     });
//     setSaveMsg({ text: "Draft loaded.", ok: true });
//     if (isMobile) setShowDrafts(false);
//     setTimeout(() => setSaveMsg(null), 2000);
//   };

//   const downloadPdf = async () => {
//     // Create a hidden full-size (794px) container outside the viewport.
//     // This avoids capturing the CSS-scaled preview which causes overlapping text.
//     const container = document.createElement("div");
//     container.style.cssText = [
//       "position:fixed",
//       "left:-9999px",
//       "top:0",
//       "width:794px",
//       "background:#fff",
//       "z-index:-1",
//     ].join(";");
//     document.body.appendChild(container);

//     // Render the invoice into the hidden container via a temporary React root
//     const { createRoot } = await import("react-dom/client");
//     const root = createRoot(container);

//     await new Promise<void>(resolve => {
//       root.render(<InvoicePreview data={data} />);
//       // Give React one frame to paint
//       requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
//     });

//     try {
//       const canvas = await html2canvas(container, {
//         scale: 2,
//         useCORS: true,
//         width: 794,
//         windowWidth: 794,
//       });
//       const pdf = new jsPDF({ orientation: "portrait", unit: "px", format: [794, 1123] });
//       pdf.addImage(canvas.toDataURL("image/png"), "PNG", 0, 0, 794, 1123);
//       pdf.save(`Invoice-${data.invoiceNumber}.pdf`);
//     } finally {
//       root.unmount();
//       document.body.removeChild(container);
//     }
//   };

//   // ── Button styles ─────────────────────────────────────────────────────────

//   const btnPrimary: React.CSSProperties = {
//     display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7,
//     background:"linear-gradient(135deg,#1a6ef5,#0ea5e9)", color:"#fff", border:"none", borderRadius:8,
//     padding: isMobile ? "11px 14px" : "8px 16px",
//     fontSize: isMobile ? 13 : 13, fontWeight:600,
//     cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
//     boxShadow:"0 2px 8px #1a6ef540", minHeight: isMobile ? 44 : "auto",
//     whiteSpace:"nowrap" as const,
//   };
//   const btnSecondary: React.CSSProperties = {
//     display:"inline-flex", alignItems:"center", justifyContent:"center", gap:7,
//     background:"#1e293b", color:"#94a3b8", border:"1px solid #334155", borderRadius:8,
//     padding: isMobile ? "11px 14px" : "8px 16px",
//     fontSize: isMobile ? 13 : 13, fontWeight:600,
//     cursor:"pointer", fontFamily:"'DM Sans',sans-serif",
//     minHeight: isMobile ? 44 : "auto", whiteSpace:"nowrap" as const,
//   };
//   const btnGreen: React.CSSProperties = {
//     ...btnPrimary, background:"linear-gradient(135deg,#059669,#10b981)", boxShadow:"0 2px 8px #05966940",
//   };
//   const inputStyle: React.CSSProperties = {
//     background:"#0f172a", border:"1px solid #1e293b", borderRadius:6,
//     padding: isMobile ? "10px 12px" : "7px 9px",
//     fontSize: isMobile ? 16 : 12,
//     color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif",
//     outline:"none", width:"100%", boxSizing:"border-box" as const,
//   };

//   // ── Drafts panel ──────────────────────────────────────────────────────────

//   const DraftsPanel = (
//     <div style={{ background:"#0f172a", border:"1px solid #1e293b", borderRadius:10, overflow:"hidden", width: isMobile ? "100%" : 300, flexShrink:0 }}>
//       <div style={{ background:"linear-gradient(90deg,#1a6ef5 0%,#0ea5e9 100%)", padding:"8px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
//         <span style={{ fontSize:11, fontWeight:700, color:"#fff", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>Saved Drafts</span>
//         <button style={{ ...btnSecondary, padding:"4px 10px", fontSize:11, minHeight:"auto", background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", color:"#fff" }} onClick={loadDrafts}>
//           {loadingDrafts ? "…" : "↻ Refresh"}
//         </button>
//       </div>
//       <div style={{ overflowY:"auto", maxHeight: isMobile ? 320 : 480 }}>
//         {drafts.length === 0 ? (
//           <div style={{ padding:"32px 20px", textAlign:"center", color:"#475569", fontSize:13, fontFamily:"'DM Sans',sans-serif" }}>No drafts saved yet.</div>
//         ) : drafts.map((d, idx) => (
//           <div key={d.id} style={{ padding:"13px 18px", borderBottom: idx < drafts.length-1 ? "1px solid #1e293b" : "none" }}>
//             <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:4 }}>
//               <span style={{ fontSize:13, fontWeight:700, color:"#e2e8f0", fontFamily:"'DM Sans',sans-serif" }}>{d.invoice_number}</span>
//               <span style={{ background:"#312e81", color:"#a5b4fc", border:"1px solid #4338ca", padding:"2px 9px", borderRadius:20, fontSize:10, fontWeight:700, fontFamily:"'DM Sans',sans-serif" }}>Draft</span>
//             </div>
//             <div style={{ fontSize:11, color:"#475569", marginBottom:10, fontFamily:"'DM Sans',sans-serif" }}>{new Date(d.updated_at).toLocaleString()}</div>
//             <button style={{ ...btnSecondary, width:"100%", fontSize:12, padding:"8px", minHeight: isMobile ? 44 : "auto" }} onClick={() => loadDraft(d.id)}>
//               Load into Editor
//             </button>
//           </div>
//         ))}
//       </div>
//     </div>
//   );

//   // ─────────────────────────────────────────────────────────────────────────

//   return (
//     <div style={{ fontFamily:"'DM Sans',sans-serif", color:"#e2e8f0" }}>

//       {/* ── STICKY HEADER ─────────────────────────────────────────────────
//           position: sticky + top: 0 makes it stick within the scrollable
//           <main> container in AppDashboard. z-index keeps it above cards.
//           backdrop-filter adds a blur so content scrolling under looks polished. */}
//       <div
//         ref={headerRef}
//         style={{
//           position: "sticky",
//           top: 0,
//           zIndex: 50,
//           // Dark frosted glass effect
//           background: "rgba(9, 14, 27, 0.92)",
//           backdropFilter: "blur(12px)",
//           WebkitBackdropFilter: "blur(12px)",
//           borderBottom: "1px solid #1e293b",
//           // Negative margin + padding to bleed edge-to-edge inside AppDashboard's padded <main>
//           margin: "-28px -28px 24px -28px",
//           padding: isMobile ? "14px 16px" : "14px 28px",
//         } as React.CSSProperties}
//       >
//         <div style={{
//           display:"flex",
//           flexDirection: isMobile ? "column" : "row",
//           alignItems: isMobile ? "flex-start" : "center",
//           justifyContent:"space-between",
//           gap: isMobile ? 12 : 0,
//         }}>
//           {/* Title + status message */}
//           <div style={{ display:"flex", alignItems:"center", gap:14 }}>
//             <div>
//               <h1 style={{ margin:0, fontSize: isMobile ? 18 : 20, fontWeight:800, color:"#f1f5f9", lineHeight:1.2 }}>
//                 Invoice Editor
//               </h1>
//               <p style={{ margin:"2px 0 0", fontSize:12, color:"#64748b" }}>
//                 {data.invoiceNumber} · Total ${total.toLocaleString("en-US",{minimumFractionDigits:2})}
//               </p>
//             </div>
//             {saveMsg && (
//               <span style={{ fontSize:12, fontWeight:700, color: saveMsg.ok ? "#34d399" : "#f87171", background: saveMsg.ok ? "#064e3b44" : "#450a0a44", border:`1px solid ${saveMsg.ok ? "#065f4644" : "#7f1d1d44"}`, borderRadius:6, padding:"4px 10px" }}>
//                 {saveMsg.text}
//               </span>
//             )}
//           </div>

//           {/* Action buttons */}
//           <div style={{ display:"flex", flexWrap:"wrap", gap:8, width: isMobile ? "100%" : "auto" }}>
//             {isMobile && (
//               <button style={{ ...btnSecondary, flex:"1 1 auto" }} onClick={() => setShowDrafts(p => !p)}>
//                 <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14,2 14,8 20,8"/></svg>
//                 {showDrafts ? "Hide Drafts" : `Drafts${drafts.length > 0 ? ` (${drafts.length})` : ""}`}
//               </button>
//             )}
//             <button style={{ ...btnSecondary, flex: isMobile ? "1 1 auto" : "none" }} onClick={() => setShowPreview(p => !p)}>
//               <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
//               {showPreview ? "Hide Preview" : "Preview"}
//             </button>
//             <button style={{ ...btnGreen, flex: isMobile ? "1 1 auto" : "none" }} onClick={saveDraft} disabled={saving}>
//               <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17,21 17,13 7,13 7,21"/><polyline points="7,3 7,8 15,8"/></svg>
//               {saving ? "Saving…" : "Save Draft"}
//             </button>
//             <button style={{ ...btnPrimary, flex: isMobile ? "1 1 auto" : "none" }} onClick={downloadPdf}>
//               <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7,10 12,15 17,10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
//               Download PDF
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Mobile: drafts drop in here */}
//       {isMobile && showDrafts && <div style={{ marginBottom:16 }}>{DraftsPanel}</div>}

//       {/* ── Two-column layout ── */}
//       <div style={{ display:"flex", flexDirection: isMobile ? "column" : "row", gap:16, alignItems:"flex-start" }}>

//         <div style={{ flex:"1 1 0", minWidth:0, width:"100%" }}>

//           <Card title="Invoice Details">
//             <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
//               {/* Invoice number with quick-increment button */}
//               <div style={{ display:"flex", flexDirection:"column", gap:4, flex: isMobile ? "1 1 100%" : "1 1 160px" }}>
//                 <label style={{ fontSize:10, fontWeight:600, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.06em", fontFamily:"'DM Sans',sans-serif" }}>Invoice Number</label>
//                 <div style={{ display:"flex", gap:6 }}>
//                   <input value={data.invoiceNumber} onChange={e => set("invoiceNumber")(e.target.value)}
//                     style={{ ...inputStyle, flex:1 }}
//                     onFocus={e => (e.target.style.borderColor="#3b82f6")}
//                     onBlur={e => (e.target.style.borderColor="#1e293b")}
//                   />
//                   <button title="Auto-increment number" onClick={incrementInvoiceNumber}
//                     style={{ ...btnSecondary, padding:"0 10px", fontSize:15, minHeight:"auto", borderRadius:6, flexShrink:0 }}>
//                     +1
//                   </button>
//                 </div>
//               </div>

//               <Field isMobile={isMobile} label="Business Code"  value={data.businessCode}  onChange={set("businessCode")} />
//               <SmartDatePicker isMobile={isMobile} label="Invoice Date" value={data.date} onChange={set("date")} />
//               <Field isMobile={isMobile} label="Shipper"        value={data.shipper}        onChange={set("shipper")} full />
//               <Field isMobile={isMobile} label="Consignee"      value={data.consignee}      onChange={set("consignee")} full />
//               <Field isMobile={isMobile} label="Origin (From)"  value={data.origin}         onChange={set("origin")} />
//               <Field isMobile={isMobile} label="Destination"    value={data.destination}    onChange={set("destination")} />
//               <Field isMobile={isMobile} label="Notes"          value={data.notes}          onChange={set("notes")} full maxLength={200} />
//             </div>
//           </Card>

//           <Card title="Bill To">
//             <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
//               <Field isMobile={isMobile} label="Account Code"       value={data.accountCode} onChange={set("accountCode")} />
//               <Field isMobile={isMobile} label="Company Name"       value={data.companyName} onChange={set("companyName")} />
//               <Field isMobile={isMobile} label="Address"            value={data.address}     onChange={set("address")} full />
//               <Field isMobile={isMobile} label="Contact Name & Tel" value={data.contactName} onChange={set("contactName")} full />
//               <Field isMobile={isMobile} label="Country"            value={data.country}     onChange={set("country")} />
//             </div>
//           </Card>

//           <Card title="Shipment Info">
//             <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
//               <Field isMobile={isMobile} label="Gross Weight" value={data.grossWeight} onChange={set("grossWeight")} />
//               <Field isMobile={isMobile} label="CBM"          value={data.cbm}         onChange={set("cbm")} />
//               <Field isMobile={isMobile} label="NOP"          value={data.nop}         onChange={set("nop")} />
//               <Field isMobile={isMobile} label="Term"         value={data.term}        onChange={set("term")} />
//               <Field isMobile={isMobile} label="REF."         value={data.ref}         onChange={set("ref")} />
//             </div>
//           </Card>

//           <Card title="Route & Commodity">
//             <div style={{ display:"flex", flexWrap:"wrap", gap:12 }}>
//               <Field isMobile={isMobile} label="From (Country)" value={data.fromCountry} onChange={set("fromCountry")} />
//               <Field isMobile={isMobile} label="To (City)"      value={data.toCity}      onChange={set("toCity")} />
//               <Field isMobile={isMobile} label="Commodity"      value={data.commodity}   onChange={set("commodity")} />
//               <SmartDatePicker isMobile={isMobile} label="Ship Date" value={data.shipDate} onChange={set("shipDate")} />
//             </div>
//           </Card>

//           <Card title="Line Items">
//             {isMobile ? (
//               <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
//                 {data.lineItems.map((item, i) => (
//                   <div key={i} style={{ background:"#020617", border:"1px solid #1e293b", borderRadius:8, padding:"12px 14px" }}>
//                     <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
//                       <span style={{ fontSize:11, fontWeight:700, color:"#64748b", textTransform:"uppercase", letterSpacing:"0.05em" }}>Line {i+1}</span>
//                       <button onClick={() => removeItem(i)} style={{ background:"#450a0a", border:"1px solid #7f1d1d", color:"#f87171", cursor:"pointer", fontSize:12, fontWeight:700, borderRadius:6, padding:"5px 12px", minHeight:36 }}>Remove</button>
//                     </div>
//                     <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
//                       <Field isMobile label="Shipping Code" value={item.shippingCode} onChange={v => setItem(i,"shippingCode",v)} full />
//                       <Field isMobile label="Description"   value={item.description}  onChange={v => setItem(i,"description",v)}  full />
//                       <div style={{ display:"flex", gap:10 }}>
//                         <Field isMobile label="QTY (KG)"  value={String(item.qty)}       onChange={v => setItem(i,"qty",parseFloat(v)||0)} />
//                         <Field isMobile label="Unit Price" value={String(item.unitPrice)} onChange={v => setItem(i,"unitPrice",parseFloat(v)||0)} />
//                       </div>
//                       <div style={{ fontSize:14, fontWeight:700, color:"#38bdf8", textAlign:"right" }}>Amount: ${(item.qty*item.unitPrice).toFixed(2)}</div>
//                     </div>
//                   </div>
//                 ))}
//                 <button style={{ ...btnSecondary, width:"100%", minHeight:44 }} onClick={addItem}>+ Add Line Item</button>
//                 <div style={{ fontSize:15, fontWeight:800, color:"#f1f5f9", textAlign:"right" }}>
//                   Total: <span style={{ color:"#38bdf8" }}>${total.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
//                 </div>
//               </div>
//             ) : (
//               <>
//                 <table style={{ width:"100%", borderCollapse:"collapse", marginBottom:12 }}>
//                   <thead>
//                     <tr>{["Shipping Code","Description","QTY (KG)","Unit Price","Amount",""].map(h=>(
//                       <th key={h} style={{ textAlign:"left", fontSize:10, color:"#64748b", fontWeight:600, padding:"0 6px 8px", letterSpacing:"0.05em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>{h}</th>
//                     ))}</tr>
//                   </thead>
//                   <tbody>
//                     {data.lineItems.map((item,i)=>(
//                       <tr key={i}>
//                         <td style={{padding:"4px 6px"}}><input style={inputStyle} value={item.shippingCode} onChange={e=>setItem(i,"shippingCode",e.target.value)} /></td>
//                         <td style={{padding:"4px 6px"}}><input style={inputStyle} value={item.description}  onChange={e=>setItem(i,"description",e.target.value)} /></td>
//                         <td style={{padding:"4px 6px",width:72}}><input style={inputStyle} type="number" value={item.qty} onChange={e=>setItem(i,"qty",parseFloat(e.target.value)||0)} /></td>
//                         <td style={{padding:"4px 6px",width:88}}><input style={inputStyle} type="number" step="0.01" value={item.unitPrice} onChange={e=>setItem(i,"unitPrice",parseFloat(e.target.value)||0)} /></td>
//                         <td style={{padding:"4px 6px",fontSize:12,color:"#94a3b8",whiteSpace:"nowrap",fontFamily:"'DM Sans',sans-serif"}}>${(item.qty*item.unitPrice).toFixed(2)}</td>
//                         <td style={{padding:"4px 6px"}}><button onClick={()=>removeItem(i)} style={{background:"none",border:"none",color:"#ef4444",cursor:"pointer",fontSize:18,lineHeight:1,padding:0}} aria-label="Remove line">×</button></td>
//                       </tr>
//                     ))}
//                   </tbody>
//                 </table>
//                 <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
//                   <button style={btnSecondary} onClick={addItem}>+ Add Line</button>
//                   <div style={{ fontSize:14, fontWeight:700, color:"#f1f5f9" }}>
//                     Total: <span style={{ color:"#38bdf8" }}>${total.toLocaleString("en-US",{minimumFractionDigits:2})}</span>
//                   </div>
//                 </div>
//               </>
//             )}
//           </Card>

//         </div>

//         {/* Desktop drafts sidebar */}
//         {!isMobile && DraftsPanel}

//       </div>

//       {/* ── Preview ── */}
//       {showPreview && (
//         <div style={{ marginTop:24 }}>
//           <div style={{ background:"#0f172a", borderRadius:10, border:"1px solid #1e293b", overflow:"hidden" }}>
//             <div style={{ background:"linear-gradient(90deg,#1a6ef5 0%,#0ea5e9 100%)", padding:"8px 18px", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
//               <span style={{ fontSize:11, fontWeight:700, color:"#fff", letterSpacing:"0.08em", textTransform:"uppercase", fontFamily:"'DM Sans',sans-serif" }}>Invoice Preview</span>
//               <div style={{ display:"flex", gap:8, alignItems:"center" }}>
//                 <button style={{ ...btnPrimary, padding:"5px 12px", fontSize:12, minHeight:"auto", boxShadow:"none" }} onClick={downloadPdf}>
//                   ↓ Download PDF
//                 </button>
//                 <button style={{ ...btnSecondary, padding:"4px 12px", fontSize:12, minHeight:"auto", background:"rgba(255,255,255,0.15)", border:"1px solid rgba(255,255,255,0.25)", color:"#fff" }} onClick={() => setShowPreview(false)}>
//                   ✕ Close
//                 </button>
//               </div>
//             </div>
//             {/* ScaledPreview shrinks the A4 to fit the phone screen */}
//             <div style={{ padding: isMobile ? 12 : 20, background:"#1e293b" }}>
//               <ScaledPreview>
//                 <InvoicePreview data={data} />
//               </ScaledPreview>
//             </div>
//           </div>
//         </div>
//       )}

//     </div>
//   );
// };

// export default InvoicePage;
