import React from "react";
import type { AgeBand, Answers, Pathway, Rec } from "./types";

const condition = {
  key: "aom" as const,
  label: "Acute otitis media (children 1–17)",
  eligibleAges: ["1-4", "5-11", "12-15"] as AgeBand[],
  description:
    "Acute otitis media mainly affects children, can last for around 1 week and over 80% recover spontaneously without antibiotics 2–3 days from presentation.",
};

function commonSelfCare(): string[] {
  return [
    "Offer self-care and regular pain relief to all patients.",
    "Acute otitis media can last for around 1 week and over 80% of children recover spontaneously without antibiotics 2–3 days from presentation.",
    "Share self-care and safety-netting, and evidence on antibiotics using NICE guidelines.",
  ];
}

export const aomPathway: Pathway = {
  condition,

  Assessment: ({ answers, setAnswers, ui }) => {
    const { Card, ToggleRow } = ui;

    const set = (key: string, value: boolean) =>
      setAnswers((prev) => ({ ...prev, [key]: value }));

    const is = (key: string) => !!answers[key];

    return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
        <Card title="Consider risk of deterioration, red flags or serious illness">
          <ToggleRow
            label={
              "Suspected acute complications? (meningitis; mastoiditis; brain abscess; sinus thrombosis; facial nerve paralysis)"
            }
            value={is("aom_complications")}
            onChange={(v) => set("aom_complications", v)}
          />

          <ToggleRow
            label={
              "Does the patient meet ANY of the following criteria: systemically very unwell; signs of a more serious illness; high risk of complications due to pre-existing comorbidity (significant heart/lung/renal/liver/neuromuscular disease, immunosuppression, cystic fibrosis, or born prematurely)?"
            }
            value={is("aom_high_risk_or_serious")}
            onChange={(v) => set("aom_high_risk_or_serious", v)}
          />

          <ToggleRow
            label="Does the patient need an otoscopic examination?"
            value={is("aom_needs_otoscopy")}
            onChange={(v) => set("aom_needs_otoscopy", v)}
          />
        </Card>

        <Card title="Diagnosis (AOM more likely vs less likely)">
          <ToggleRow
            label={
              "Does the patient have acute onset of symptoms AND otoscopic features consistent with AOM? (earache in older children; tugging/rubbing ear in younger; fever/crying/poor feeding/restlessness/behavioural change/cough/rhinorrhoea; distinctly red/yellow/cloudy tympanic membrane; moderate–severe bulging with loss of landmarks/air–fluid level; or perforation/sticky discharge)"
            }
            value={is("aom_aom_features_present")}
            onChange={(v) => set("aom_aom_features_present", v)}
          />
        </Card>

        <Card title="Key decision points">
          <ToggleRow
            label="Does the child/young person have otorrhoea (after eardrum perforation) or eardrum perforation (suspected or confirmed)?"
            value={is("aom_otorrhoea_or_perforation")}
            onChange={(v) => set("aom_otorrhoea_or_perforation", v)}
          />

          <ToggleRow
            label="Is the child under 2 years AND with infection in both ears?"
            value={is("aom_under2_bilateral")}
            onChange={(v) => set("aom_under2_bilateral", v)}
          />

          <ToggleRow
            label="Does the patient meet ANY of the following criteria: severe symptoms (clinician global impression) OR symptoms for >3 days?"
            value={is("aom_severe_or_over3days")}
            onChange={(v) => set("aom_severe_or_over3days", v)}
          />

          <ToggleRow
            label="In patients with moderate and severe symptoms, without eardrum perforation: consider phenazone 40 mg/g with lidocaine 10 mg/g ear drops for up to 7 days (if eligible under PGD). Is this applicable?"
            value={is("aom_modsev_no_perforation")}
            onChange={(v) => set("aom_modsev_no_perforation", v)}
          />

          <ToggleRow
            label="Reported penicillin allergy (via National Care Record or Patient/Carer)?"
            value={is("aom_pen_allergy")}
            onChange={(v) => set("aom_pen_allergy", v)}
          />

          <ToggleRow
            label="If penicillin allergy: Is the patient pregnant? (only relevant for ages 16–17)"
            value={is("aom_pregnant_16_17")}
            onChange={(v) => set("aom_pregnant_16_17", v)}
          />
        </Card>
      </div>
    );
  },

  buildRecommendation: (_ageBand: AgeBand, a: Answers): Rec => {
    const complications = !!a["aom_complications"];
    const highRiskOrSerious = !!a["aom_high_risk_or_serious"];
    const needsOtoscopy = !!a["aom_needs_otoscopy"];
    const aomFeatures = !!a["aom_aom_features_present"];

    const otorrhoeaOrPerf = !!a["aom_otorrhoea_or_perforation"];
    const under2Bilateral = !!a["aom_under2_bilateral"];
    const severeOrOver3 = !!a["aom_severe_or_over3days"];
    const modSevNoPerfDrops = !!a["aom_modsev_no_perforation"];

    const penAllergy = !!a["aom_pen_allergy"];
    const pregnant1617 = !!a["aom_pregnant_16_17"];

    // 1) Suspected acute complications -> emergency escalation
    if (complications) {
      return {
        outcomeTitle: "Gateway: suspected acute complications — emergency escalation",
        gateway: [
          "Suspected acute complications (e.g., meningitis, mastoiditis, brain abscess, sinus thrombosis, facial nerve paralysis).",
        ],
        firstLine: [],
        selfCare: [],
        refer: ["Signpost to A&E or call 999 in a life threatening emergency."],
      };
    }

    // 2) Serious illness / high-risk comorbidity -> onward referral
    if (highRiskOrSerious) {
      return {
        outcomeTitle: "Onward referral: higher risk / more serious illness suspected",
        gateway: [
          "Systemically very unwell, signs of more serious illness, or high risk of complications due to comorbidity.",
        ],
        firstLine: [],
        selfCare: commonSelfCare(),
        refer: ["Onward referral: General practice or other provider as appropriate."],
      };
    }

    // 3) Needs otoscopy (pathway includes this gateway point)
    // If "needs otoscopy" is selected but AOM features not confirmed, route to referral for exam/assessment.
    if (needsOtoscopy && !aomFeatures) {
      return {
        outcomeTitle: "Onward referral: otoscopic assessment / diagnosis not confirmed",
        gateway: [
          "Patient needs otoscopic examination and AOM features are not confirmed in this assessment.",
        ],
        firstLine: [],
        selfCare: commonSelfCare(),
        refer: ["Onward referral: General practice or other provider as appropriate."],
        notes: ["Consider alternative diagnosis and proceed appropriately."],
      };
    }

    // 4) AOM less likely -> alternative diagnosis
    if (!aomFeatures) {
      return {
        outcomeTitle: "Acute otitis media less likely — consider alternative diagnosis",
        gateway: ["AOM diagnostic features not present."],
        firstLine: [],
        selfCare: commonSelfCare(),
        refer: ["Onward referral: General practice or other provider as appropriate."],
        notes: ["Consider alternative diagnosis and proceed appropriately."],
      };
    }

    // From here: AOM more likely
    // Antibiotic triggers in pathway flow:
    // - Otorrhoea/perforation -> amoxicillin (or macrolide if allergy)
    // - Shared decision making + clinician global impression, including:
    //   * under 2 and bilateral infection
    //   * severe symptoms OR symptoms >3 days
    const needsAntibiotic = otorrhoeaOrPerf || under2Bilateral || severeOrOver3;

    if (needsAntibiotic) {
      const penAlt = pregnant1617
        ? ["Erythromycin for 5 days (if pregnant, aged 16–17 years; subject to PGD)."]
        : ["Clarithromycin for 5 days (subject to PGD)."];

      return {
        outcomeTitle: "Gateway: offer antibiotic (subject to PGD inclusion/exclusion)",
        gateway: [
          "AOM more likely (symptoms + otoscopic features).",
          otorrhoeaOrPerf
            ? "Otorrhoea/eardrum perforation present (suspected or confirmed)."
            : "Shared decision making approach and clinician global impression supports antibiotics (e.g., under 2 with bilateral infection and/or severe symptoms or symptoms >3 days).",
        ],
        firstLine: penAllergy
          ? []
          : ["Amoxicillin for 5 days (if no allergy; subject to PGD) plus self-care."],
        penAllergy: penAllergy
          ? ["Reported penicillin allergy. " + penAlt.join(" ")]
          : undefined,
        selfCare: [
          ...commonSelfCare(),
          modSevNoPerfDrops
            ? "In moderate/severe symptoms without perforation: consider phenazone 40 mg/g with lidocaine 10 mg/g ear drops for up to 7 days (subject to PGD) plus self-care."
            : "If moderate/severe symptoms without perforation: consider phenazone 40 mg/g with lidocaine 10 mg/g ear drops for up to 7 days (subject to PGD) plus self-care.",
        ],
        refer: [
          "If symptoms worsen rapidly or significantly, or the child/young person becomes very unwell, OR does not improve despite antibiotics taken for at least 2–3 days → onward referral (General practice / other provider as appropriate).",
        ],
      };
    }

    // No antibiotic (mild symptoms) + consider ear drops if mod/sev without perforation + review
    return {
      outcomeTitle: "Self-care and regular pain relief (no antibiotic indicated at this stage)",
      gateway: [
        "AOM more likely but criteria for antibiotic supply not met in this pathway.",
        "In patients with mild symptoms: offer self-care and pain relief.",
      ],
      firstLine: modSevNoPerfDrops
        ? [
            "In moderate/severe symptoms without eardrum perforation: consider phenazone 40 mg/g with lidocaine 10 mg/g ear drops for up to 7 days (subject to PGD) plus self-care.",
          ]
        : [],
      selfCare: [
        ...commonSelfCare(),
        "Ask patient to return to Community Pharmacy if no improvement within 3–5 days for pharmacist reassessment.",
      ],
      refer: ["Onward referral: General practice or other provider as appropriate if worsening/concerns."],
    };
  },
};
