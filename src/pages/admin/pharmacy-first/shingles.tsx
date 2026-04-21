import React from "react";
import { AgeBand, Answers, Pathway } from "./types";

export const shinglesPathway: Pathway = {
  condition: {
    key: "shingles",
    label: "Shingles (adults 18+)",
    eligibleAges: ["16-64", ">64"], // app uses bands; pathway is 18+
    description:
      "For adults aged 18 years and over. Exclude: pregnant individuals. Supply antivirals based on time since rash onset and criteria.",
  },

  Assessment: ({ answers, setAnswers, ui }) => {
    const { Card, ToggleRow, MultiSelect } = ui;
    const set = (k: string, v: boolean) =>
      setAnswers((p) => ({ ...p, [k]: v }));
    const is = (k: string) => !!answers[k];

    return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
        <Card title="Gateway escalation (serious complications / high-risk distribution)">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ToggleRow
              label="Serious complications suspected? (meningitis/encephalitis/myelitis/facial nerve paralysis)"
              value={is("shi_serious_complications")}
              onChange={(v) => set("shi_serious_complications", v)}
            />
            <ToggleRow
              label="Shingles in ophthalmic distribution? (Hutchinson’s sign, visual symptoms, unexplained red eye)"
              value={is("shi_ophthalmic")}
              onChange={(v) => set("shi_ophthalmic", v)}
            />
            <ToggleRow
              label="Shingles in severely immunosuppressed patient OR immunosuppressed with severe/widespread rash or systemically unwell OR affecting head/neck?"
              value={is("shi_high_risk_immuno_headneck")}
              onChange={(v) => set("shi_high_risk_immuno_headneck", v)}
            />
          </div>
        </Card>

        <Card title="Diagnosis likelihood">
          <ToggleRow
            label="Does the patient follow typical progression of shingles clinical features (pain/abnormal sensation → rash/blisters one side, crusting etc.)?"
            value={is("shi_typical")}
            onChange={(v) => set("shi_typical", v)}
          />
        </Card>

        <Card title="Timing since rash onset">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ToggleRow
              label="Shingles within 72 hours of rash onset?"
              value={is("shi_within_72h")}
              onChange={(v) => set("shi_within_72h", v)}
            />
            <ToggleRow
              label="Shingles up to one week after rash onset?"
              value={is("shi_within_week")}
              onChange={(v) => set("shi_within_week", v)}
            />
          </div>
        </Card>

        <Card title="Treatment criteria (within 72 hours) – ANY applies">
          <MultiSelect
            items={[
              { id: "shi_immunosuppressed", label: "Immunosuppressed" },
              { id: "shi_non_truncal", label: "Non-truncal involvement (limbs/perineum)" },
              { id: "shi_mod_sev_pain", label: "Moderate or severe pain" },
              { id: "shi_mod_sev_rash", label: "Moderate or severe rash (confluent lesions)" },
              { id: "shi_over50", label: "Aged over 50 years" },
            ]}
            selected={answers}
            setSelected={setAnswers}
          />
        </Card>

        <Card title="Treatment criteria (up to 1 week after onset) – ANY applies">
          <MultiSelect
            items={[
              { id: "shi_immunosuppressed_week", label: "Immunosuppressed" },
              { id: "shi_continued_vesicles", label: "Continued vesicle formation" },
              { id: "shi_severe_pain_week", label: "Severe pain" },
              { id: "shi_high_risk_severe", label: "High risk of severe shingles (e.g. severe atopic dermatitis/eczema)" },
              { id: "shi_over70", label: "Aged 70 years and over" },
            ]}
            selected={answers}
            setSelected={setAnswers}
          />
        </Card>

        <Card title="Valaciclovir preference flags">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ToggleRow
              label="Adherence risk: already taking 8 or more medicines/day OR assisted in taking medicines?"
              value={is("shi_adherence_risk")}
              onChange={(v) => set("shi_adherence_risk", v)}
            />
            <ToggleRow
              label="Aciclovir unsuitable?"
              value={is("shi_aciclovir_unsuitable")}
              onChange={(v) => set("shi_aciclovir_unsuitable", v)}
            />
          </div>
        </Card>
      </div>
    );
  },

  buildRecommendation: (_ageBand: AgeBand, ans: Answers) => {
    const leaflet =
      "FOR ALL PATIENTS: Share self-care and safety-netting advice using British Association of Dermatologists Shingles leaflet.";
    const painAdvice =
      "Pain management: recommend trial of paracetamol, an NSAID such as ibuprofen, or co-codamol OTC. If not effective, refer to general practice.";
    const vaccine =
      "Signpost eligible individuals to information/advice about shingles vaccine after recovery.";
    const afterCourse =
      "FOR ALL PATIENTS: If symptoms worsen rapidly/significantly at any time, OR do not improve after completion of 7 days treatment course → onward referral (general practice/other).";

    if (ans["shi_serious_complications"] || ans["shi_ophthalmic"] || ans["shi_high_risk_immuno_headneck"]) {
      return {
        outcomeTitle: "Gateway: urgent escalation / referral",
        gateway: [
          "Consider calculating NEWS2 ahead of signposting to A&E or calling 999 in a life-threatening emergency.",
        ],
        firstLine: [],
        selfCare: [leaflet],
        refer: ["Urgent onward referral (A&E/999 as appropriate; GP/OOH depending on severity)."],
      };
    }

    if (!ans["shi_typical"]) {
      return {
        outcomeTitle: "Shingles less likely",
        gateway: ["Does not follow typical progression of shingles clinical features."],
        firstLine: [],
        selfCare: [leaflet],
        refer: ["Consider alternative diagnosis and proceed appropriately."],
      };
    }

    const within72 = !!ans["shi_within_72h"];
    const withinWeek = !!ans["shi_within_week"];

    const meets72 =
      ans["shi_immunosuppressed"] ||
      ans["shi_non_truncal"] ||
      ans["shi_mod_sev_pain"] ||
      ans["shi_mod_sev_rash"] ||
      ans["shi_over50"];

    const meetsWeek =
      ans["shi_immunosuppressed_week"] ||
      ans["shi_continued_vesicles"] ||
      ans["shi_severe_pain_week"] ||
      ans["shi_high_risk_severe"] ||
      ans["shi_over70"];

    const immunoAny = !!ans["shi_immunosuppressed"] || !!ans["shi_immunosuppressed_week"];
    const preferVal =
      immunoAny || !!ans["shi_adherence_risk"] || !!ans["shi_aciclovir_unsuitable"];

    const immunoNote = immunoAny
      ? [
          "FOR IMMUNOSUPPRESSED PATIENTS: Offer treatment if appropriate and call patient’s GP or send urgent for action email if out of hours to notify supply and request GP review.",
          "Advise: if symptoms worsen rapidly, become systemically unwell, or rash becomes severe/widespread → attend A&E or call 999.",
        ]
      : [];

    // within 72h route
    if (within72) {
      if (!meets72) {
        return {
          outcomeTitle: "No antiviral (does not meet treatment criteria)",
          gateway: ["Within 72 hours but patient does not meet treatment criteria."],
          firstLine: [],
          selfCare: [leaflet, painAdvice, vaccine],
          refer: ["Onward referral if worsening or concerns."],
        };
      }

      if (preferVal) {
        return {
          outcomeTitle: "Offer valaciclovir + self care (criteria met; valaciclovir preferred)",
          gateway: [
            "Within 72 hours of rash onset AND meets treatment criteria.",
            "Valaciclovir preferred for immunosuppressed patients or adherence risk, or if aciclovir unsuitable.",
          ],
          firstLine: ["Offer valaciclovir (per PGD) plus self care."],
          selfCare: [leaflet, painAdvice, vaccine, afterCourse, ...immunoNote],
          refer: ["Onward referral: general practice or other provider as appropriate."],
        };
      }

      return {
        outcomeTitle: "Offer aciclovir + self care (criteria met; within 72 hours)",
        gateway: ["Within 72 hours of rash onset AND meets treatment criteria."],
        firstLine: ["Offer aciclovir (per PGD) plus self care."],
        selfCare: [leaflet, painAdvice, vaccine, afterCourse, ...immunoNote],
        refer: ["Onward referral: general practice or other provider as appropriate."],
        notes: ["If aciclovir unsuitable → offer valaciclovir (per PGD) plus self care."],
      };
    }

    // up to 1 week route
    if (withinWeek) {
      if (!meetsWeek) {
        return {
          outcomeTitle: "No antiviral (does not meet treatment criteria)",
          gateway: ["Up to one week after rash onset but does not meet treatment criteria."],
          firstLine: [],
          selfCare: [leaflet, painAdvice, vaccine],
          refer: ["Onward referral if worsening or concerns."],
        };
      }

      return {
        outcomeTitle: "Offer antiviral + self care (criteria met; up to 1 week)",
        gateway: ["Up to one week after rash onset AND meets treatment criteria."],
        firstLine: [
          preferVal
            ? "Offer valaciclovir (per PGD) plus self care."
            : "Offer aciclovir (per PGD) plus self care.",
        ],
        selfCare: [leaflet, painAdvice, vaccine, afterCourse, ...immunoNote],
        refer: ["Onward referral: general practice or other provider as appropriate."],
        notes: preferVal
          ? ["Valaciclovir preferred for immunosuppressed or adherence risk, or if aciclovir unsuitable."]
          : ["If aciclovir unsuitable → offer valaciclovir (per PGD) plus self care."],
      };
    }

    return {
      outcomeTitle: "Confirm timing",
      gateway: ["Select whether shingles is within 72 hours or up to one week after rash onset."],
      firstLine: [],
      selfCare: [leaflet, painAdvice, vaccine],
      refer: ["Proceed once timing confirmed."],
    };
  },
};
