// import React, { useMemo, useState } from "react";
// import { AgeBand, Answers, Pathway, countTrue } from "./types";

// type QType = "yesno" | "multi";

// type Q = {
//   key: string;
//   title: string;
//   type: QType;
//   label: string;
//   mustBe?: boolean;
//   endsIfYes?: boolean;
//   items?: { id: string; label: string }[];
// };

// export const soreThroatPathway: Pathway = {
//   condition: {
//     key: "sore_throat",
//     label: "Acute Sore Throat (age 5+)",
//     eligibleAges: ["5-11", "12-15", "16-64", ">64"],
//     description: "Use FeverPAIN score (asked as a checklist).",
//   },

//   Assessment: ({ answers, setAnswers, ui }) => {
//     const { Card, ToggleRow, MultiSelect } = ui;

//     const isSet = (k: string) => typeof answers[k] === "boolean";
//     const val = (k: string) => !!answers[k];

//     const setBool = (k: string, v: boolean) =>
//       setAnswers((p) => ({ ...p, [k]: v, __complete: false }));

//     const feverItems = useMemo(
//       () => [
//         { id: "st_fever", label: "Fever (>38°C)" },
//         { id: "st_purulence", label: "Purulence" },
//         { id: "st_rapid", label: "First attendance within 3 days after onset" },
//         { id: "st_tonsils", label: "Severely inflamed tonsils" },
//         { id: "st_no_cough", label: "No cough or coryza" },
//       ],
//       []
//     );

//     const questions: Q[] = useMemo(
//       () => [
//         {
//           key: "st_excluded",
//           title: "Exclusion (must be NO)",
//           type: "yesno",
//           label: "Excluded? (pregnant and under 16)",
//           mustBe: false,
//           endsIfYes: true,
//         },
//         {
//           key: "st_epiglottitis",
//           title: "Emergency",
//           type: "yesno",
//           label:
//             "Suspected epiglottitis? (4Ds: dysphagia, dysphonia, drooling, distress) — do NOT examine throat if suspected.",
//           endsIfYes: true,
//         },
//         {
//           key: "st_stridor",
//           title: "Emergency",
//           type: "yesno",
//           label: "Stridor (noisy/high-pitched sound with breathing)?",
//           endsIfYes: true,
//         },
//         {
//           key: "st_severe_complications",
//           title: "Emergency",
//           type: "yesno",
//           label: "Severe complications suspected (e.g., dehydration, pharyngeal abscess)?",
//           endsIfYes: true,
//         },
//         {
//           key: "st_refer_condition",
//           title: "Referral check",
//           type: "yesno",
//           label:
//             "ANY of: scarlet fever / quinsy / glandular fever; suspected head/neck cancer; immunosuppressed?",
//           endsIfYes: true,
//         },
//         {
//           key: "__feverpain",
//           title: "FeverPAIN",
//           type: "multi",
//           label: "Select all that apply (1 point each)",
//           items: feverItems,
//         },
//         {
//           key: "st_severe",
//           title: "Severity",
//           type: "yesno",
//           label: "Severe symptoms based on clinician global impression?",
//         },
//         {
//           key: "st_returning",
//           title: "Returning patient",
//           type: "yesno",
//           label: "Returning patient for pharmacist reassessment?",
//         },
//         {
//           key: "st_pen_allergy",
//           title: "If antibiotics needed",
//           type: "yesno",
//           label: "Reported penicillin allergy?",
//         },
//         {
//           key: "st_pregnant",
//           title: "If penicillin allergy",
//           type: "yesno",
//           label: "Pregnancy relevant? (only used to pick macrolide)",
//         },
//       ],
//       [feverItems]
//     );

//     const [i, setI] = useState(0);
//     const q = questions[i];

//     const canContinue = useMemo(() => {
//       if (!q) return false;

//       if (q.type === "yesno") {
//         if (!isSet(q.key)) return false;
//         if (typeof q.mustBe === "boolean") return answers[q.key] === q.mustBe;
//         return true;
//       }

//       // multi (FeverPAIN) — allow continue even if none selected (score 0)
//       return true;
//     }, [answers, q]);

//     function finish() {
//       setAnswers((p) => ({ ...p, __complete: true }));
//     }

//     function next() {
//       if (q.type === "yesno") {
//         if (q.endsIfYes && val(q.key) === true) return finish();
//         if (typeof q.mustBe === "boolean" && val(q.key) !== q.mustBe) return finish();
//       }

//       if (i >= questions.length - 1) return finish();
//       setI((x) => x + 1);
//     }

//     function back() {
//       if (i === 0) return;
//       setI((x) => x - 1);
//     }

//     if (answers["__complete"]) return <div />;

//     return (
//       <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
//         <Card title={q.title}>
//           {q.type === "yesno" ? (
//             <ToggleRow
//               label={q.label}
//               value={val(q.key)}
//               onChange={(v) => setBool(q.key, v)}
//             />
//           ) : (
//             <>
//               <div style={{ color: "#eaeaea", fontWeight: 800, marginBottom: 10 }}>
//                 {q.label}
//               </div>
//               <MultiSelect items={q.items!} selected={answers} setSelected={setAnswers} />
//             </>
//           )}
//         </Card>

//         <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
//           <button
//             type="button"
//             onClick={back}
//             disabled={i === 0}
//             style={{
//               padding: "12px 14px",
//               borderRadius: 14,
//               border: `1px solid ${i === 0 ? "#2a2a2a" : "#dc2626"}`,
//               background: i === 0 ? "#101010" : "#dc2626",
//               color: "#fff",
//               cursor: i === 0 ? "not-allowed" : "pointer",
//               fontWeight: 900,
//               minWidth: 120,
//             }}
//           >
//             Back
//           </button>

//           <button
//             type="button"
//             onClick={next}
//             disabled={!canContinue}
//             style={{
//               padding: "12px 14px",
//               borderRadius: 14,
//               border: `1px solid ${canContinue ? "#1d4ed8" : "#2a2a2a"}`,
//               background: canContinue ? "#1d4ed8" : "#101010",
//               color: "#fff",
//               cursor: canContinue ? "pointer" : "not-allowed",
//               fontWeight: 900,
//               minWidth: 120,
//             }}
//           >
//             Next
//           </button>
//         </div>
//       </div>
//     );
//   },

//   buildRecommendation: (_ageBand: AgeBand, ans: Answers) => {
//     const feverPAIN = countTrue(ans, [
//       "st_fever",
//       "st_purulence",
//       "st_rapid",
//       "st_tonsils",
//       "st_no_cough",
//     ]);

//     const leaflet = "Share self-care + safety-netting (TARGET RTI leaflet).";
//     const worsen = "If symptoms worsen rapidly/significantly at any time → refer.";

//     if (ans["st_excluded"]) {
//       return {
//         outcomeTitle: "Not eligible for this pathway",
//         gateway: ["Exclusion criteria met."],
//         firstLine: [],
//         selfCare: [leaflet],
//         refer: ["Onward referral: general practice / appropriate provider."],
//       };
//     }

//     if (ans["st_epiglottitis"] || ans["st_stridor"] || ans["st_severe_complications"]) {
//       return {
//         outcomeTitle: "Urgent escalation",
//         gateway: ["Possible airway/serious complication."],
//         firstLine: [],
//         selfCare: [],
//         refer: ["Urgent same-day escalation per local policy."],
//       };
//     }

//     if (ans["st_refer_condition"]) {
//       return {
//         outcomeTitle: "Onward referral",
//         gateway: ["Alternative diagnosis/complication suspected."],
//         firstLine: [],
//         selfCare: [leaflet, worsen],
//         refer: ["General practice / appropriate provider."],
//       };
//     }

//     if (feverPAIN <= 1) {
//       return {
//         outcomeTitle: `FeverPAIN ${feverPAIN}: self-care`,
//         gateway: ["Antibiotic not needed."],
//         firstLine: [],
//         selfCare: [leaflet, "Self-care + pain relief.", "Reassess if not improving after 1 week.", worsen],
//         refer: ["Refer if concerns develop."],
//       };
//     }

//     if (feverPAIN === 2 || feverPAIN === 3) {
//       if (ans["st_returning"]) {
//         return {
//           outcomeTitle: `FeverPAIN ${feverPAIN}: returning patient reassessment`,
//           gateway: ["After reassessment, consider antibiotics if appropriate."],
//           firstLine: [],
//           selfCare: [leaflet, worsen],
//           refer: ["Refer if concerns develop."],
//         };
//       }

//       return {
//         outcomeTitle: `FeverPAIN ${feverPAIN}: self-care`,
//         gateway: ["Antibiotics make little difference; complications unlikely when withheld."],
//         firstLine: [],
//         selfCare: [leaflet, "Self-care + pain relief.", "Reassess if not improving in 3–5 days.", worsen],
//         refer: ["Refer if concerns develop."],
//       };
//     }

//     // 4–5
//     if (!ans["st_severe"]) {
//       return {
//         outcomeTitle: `FeverPAIN ${feverPAIN}: mild → self-care first`,
//         gateway: ["Shared decision-making + clinician global impression."],
//         firstLine: [],
//         selfCare: [leaflet, "Self-care + pain relief.", "Reassess if not improving in 3–5 days.", worsen],
//         refer: ["Refer if concerns develop."],
//       };
//     }

//     const penAllergy = !!ans["st_pen_allergy"];
//     const pregnant = !!ans["st_pregnant"];

//     if (!penAllergy) {
//       return {
//         outcomeTitle: `FeverPAIN ${feverPAIN}: severe → antibiotic`,
//         gateway: ["Shared decision-making + clinician global impression."],
//         firstLine: ["Phenoxymethylpenicillin for 5 days (per PGD) + self care."],
//         selfCare: [leaflet, worsen],
//         refer: ["Refer if not improving after course."],
//       };
//     }

//     return {
//       outcomeTitle: `FeverPAIN ${feverPAIN}: severe → penicillin allergy alternative`,
//       gateway: ["Penicillin allergy reported."],
//       firstLine: [],
//       penAllergy: [
//         pregnant
//           ? "Erythromycin for 5 days (per PGD) + self care."
//           : "Clarithromycin for 5 days (per PGD) + self care.",
//       ],
//       selfCare: [leaflet, worsen],
//       refer: ["Refer if not improving after course."],
//     };
//   },
// };
import React from "react";
import type { AgeBand, Answers, Pathway } from "./types";
import { FlowDiagram, type FlowSpec } from "./FlowDiagram";
import { countTrue } from "./types";

const spec: FlowSpec = {
  title: "Acute Sore Throat (age 5+)",
  subtitle:
    "Exclude: pregnant individuals under 16. Use FeverPAIN score, then severity/global impression for antibiotic decision.",
  boxes: [
    // --- Top emergency/red flags row like PDF header band ---
    {
      id: "st_excl",
      lane: "center",
      style: "gateway",
      header: "Exclusion criteria (must be NO to continue)",
      content: [
        {
          type: "question",
          q: {
            kind: "yesno",
            key: "st_excluded",
            question: "Excluded? (pregnant and under 16 years)",
          },
        },
      ],
    },
    {
      id: "st_epi",
      lane: "center",
      style: "danger",
      header: "Emergency exclusion (airway risk)",
      content: [
        {
          type: "question",
          q: {
            kind: "yesno",
            key: "st_epiglottitis",
            question:
              "Suspected epiglottitis? (4Ds: dysphagia, dysphonia, drooling, distress). Do NOT examine throat if suspected.",
          },
        },
        {
          type: "question",
          q: {
            kind: "yesno",
            key: "st_stridor",
            question: "Stridor (noisy/high-pitched breathing sound)?",
          },
        },
        {
          type: "question",
          q: {
            kind: "yesno",
            key: "st_severe_complications",
            question:
              "Severe complications suspected? (e.g., clinical dehydration, signs of pharyngeal abscess)",
          },
        },
      ],
      showIf: (a) => a["st_excluded"] === false,
    },
    {
      id: "st_urgent_out",
      lane: "right",
      style: "danger",
      header: "Gateway Point: urgent escalation",
      content: [
        {
          type: "text",
          lines: [
            "Consider calculating NEWS2 before signposting to A&E or calling 999 in a life-threatening emergency.",
            "Onward referral: urgent same day as per local policy.",
          ],
        },
      ],
      showIf: (a) =>
        a["st_excluded"] === false &&
        (a["st_epiglottitis"] === true ||
          a["st_stridor"] === true ||
          a["st_severe_complications"] === true),
    },

    // --- Referral conditions box ---
    {
      id: "st_ref",
      lane: "center",
      style: "gateway",
      header: "Referral conditions",
      content: [
        {
          type: "question",
          q: {
            kind: "yesno",
            key: "st_refer_condition",
            question:
              "ANY of: suspected scarlet fever / quinsy / glandular fever; suspected head/neck cancer red flags; immunosuppressed?",
          },
        },
      ],
      showIf: (a) =>
        a["st_excluded"] === false &&
        a["st_epiglottitis"] !== true &&
        a["st_stridor"] !== true &&
        a["st_severe_complications"] !== true,
    },
    {
      id: "st_ref_out",
      lane: "right",
      style: "info",
      header: "Onward referral",
      content: [
        {
          type: "text",
          lines: [
            "General practice / other provider as appropriate.",
            "Safety net: if symptoms worsen rapidly/significantly at any time.",
          ],
        },
      ],
      showIf: (a) => a["st_refer_condition"] === true,
    },

    // --- FeverPAIN scoring box like PDF checklist ---
    {
      id: "st_feverpain",
      lane: "center",
      style: "plain",
      header: "FeverPAIN score (1 point each)",
      content: [
        {
          type: "multi",
          m: {
            title: "Select all that apply",
            items: [
              { id: "st_fever", label: "Fever (over 38°C)" },
              { id: "st_purulence", label: "Purulence" },
              { id: "st_rapid", label: "First attendance within 3 days of onset" },
              { id: "st_tonsils", label: "Severely inflamed tonsils" },
              { id: "st_no_cough", label: "No cough or coryza (cold symptoms)" },
            ],
          },
        },
      ],
      showIf: (a) => a["st_refer_condition"] === false,
    },

    // --- FeverPAIN outcomes (progressively appear once checklist is used) ---
    {
      id: "st_low",
      lane: "left",
      style: "info",
      header: "FeverPAIN 0–1",
      content: [
        {
          type: "text",
          lines: [
            "Antibiotic is not needed.",
            "Self-care and pain relief, drink adequate fluids.",
            "Ask patient to return after 1 week if no improvement for reassessment.",
          ],
        },
      ],
      showIf: (a) =>
        a["st_refer_condition"] === false &&
        typeof a["st_fever"] === "boolean" && // indicates the checklist has been interacted with
        countTrue(a, ["st_fever", "st_purulence", "st_rapid", "st_tonsils", "st_no_cough"]) <= 1,
    },
    {
      id: "st_mid",
      lane: "left",
      style: "info",
      header: "FeverPAIN 2–3",
      content: [
        {
          type: "text",
          lines: [
            "Antibiotics make little difference to symptom duration; withholding unlikely to lead to complications.",
            "Self-care and pain relief.",
            "Ask patient to return in 3–5 days if not improving for pharmacist reassessment.",
          ],
        },
        {
          type: "question",
          q: {
            kind: "yesno",
            key: "st_returning",
            question: "Is this a returning patient for pharmacist reassessment?",
          },
        },
      ],
      showIf: (a) => {
        const score = countTrue(a, [
          "st_fever",
          "st_purulence",
          "st_rapid",
          "st_tonsils",
          "st_no_cough",
        ]);
        return a["st_refer_condition"] === false && score >= 2 && score <= 3;
      },
    },
    {
      id: "st_high",
      lane: "center",
      style: "gateway",
      header: "FeverPAIN 4–5: shared decision making",
      content: [
        {
          type: "question",
          q: {
            kind: "yesno",
            key: "st_severe",
            question: "Severe symptoms based on clinician global impression?",
          },
        },
      ],
      showIf: (a) => {
        const score = countTrue(a, [
          "st_fever",
          "st_purulence",
          "st_rapid",
          "st_tonsils",
          "st_no_cough",
        ]);
        return a["st_refer_condition"] === false && score >= 4;
      },
    },

    // --- Antibiotic branch when severe + FeverPAIN 4–5 ---
    {
      id: "st_abx_allergy",
      lane: "center",
      style: "plain",
      header: "If antibiotic is needed",
      content: [
        {
          type: "question",
          q: { kind: "yesno", key: "st_pen_allergy", question: "Reported penicillin allergy?" },
        },
        {
          type: "question",
          q: { kind: "yesno", key: "st_pregnant", question: "If allergy: pregnancy relevant?" },
        },
      ],
      showIf: (a) => a["st_severe"] === true,
    },
    {
      id: "st_abx_out",
      lane: "right",
      style: "info",
      header: "Treatment supply (subject to PGD)",
      content: [
        {
          type: "text",
          lines: [
            "If no penicillin allergy: phenoxymethylpenicillin for 5 days + self-care.",
            "If penicillin allergy: clarithromycin 5 days; if pregnant: erythromycin 5 days + self-care.",
            "If symptoms do not improve after completion of treatment course → onward referral.",
          ],
        },
      ],
      showIf: (a) => a["st_severe"] === true && typeof a["st_pen_allergy"] === "boolean",
    },
  ],
};

export const soreThroatPathway: Pathway = {
  condition: {
    key: "sore_throat",
    label: "Acute Sore Throat (age 5+)",
    eligibleAges: ["5-11", "12-15", "16-64", ">64"],
    description: "Diagram-style flow matching the PDF pathway.",
  },

  Assessment: ({ answers, setAnswers, ui }) => (
    <FlowDiagram spec={spec} answers={answers} setAnswers={setAnswers} ui={ui} />
  ),

  buildRecommendation: (_ageBand: AgeBand, ans: Answers) => {
    // keep your existing buildRecommendation (the one you already wrote)
    // OR reuse it exactly from your current soreThroatPathway file.
    return {
      outcomeTitle: "Use your existing recommendation renderer",
      gateway: [],
      firstLine: [],
      selfCare: [],
      refer: [],
    };
  },
};
