import React from "react";
import { AgeBand, Answers, Pathway, countTrue } from "./types";

export const insectBitePathway: Pathway = {
  condition: {
    key: "insect_bite",
    label: "Infected Insect Bites (age 1+)",
    eligibleAges: ["1-4", "5-11", "12-15", "16-64", ">64"],
    description:
      "For adults and children aged 1 year and over. Exclude: pregnant individuals under 16 years. Do not offer antibiotics if no signs/symptoms of infection; rapid-onset reactions are often inflammatory/allergic.",
  },

  Assessment: ({ answers, setAnswers, ui }) => {
    const { Card, ToggleRow, MultiSelect } = ui;
    const set = (k: string, v: boolean) =>
      setAnswers((p) => ({ ...p, [k]: v }));
    const is = (k: string) => !!answers[k];

    return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
        <Card title="Immediate risks / gateway escalation">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ToggleRow
              label="Signs of systemic hypersensitivity reaction or anaphylaxis?"
              value={is("bite_anaphylaxis")}
              onChange={(v) => set("bite_anaphylaxis", v)}
            />
            <ToggleRow
              label="Severely immunosuppressed AND have signs/symptoms of an infection?"
              value={is("bite_severely_immuno_infection")}
              onChange={(v) => set("bite_severely_immuno_infection", v)}
            />
            <ToggleRow
              label="Sting where risk of airway obstruction (mouth/throat) OR concerns of orbital cellulitis from bite/sting around eyes?"
              value={is("bite_airway_or_orbital")}
              onChange={(v) => set("bite_airway_or_orbital", v)}
            />
          </div>
        </Card>

        <Card title="Exclude other bite types / unusual exposures">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ToggleRow
              label="ANY of: animal bite/scratch; human bite; tick bite in UK with signs of Lyme disease (erythema migrans); travel outside UK with concern of insect-borne diseases (e.g., malaria); unusual/exotic insect?"
              value={is("bite_unusual_exposure")}
              onChange={(v) => set("bite_unusual_exposure", v)}
            />
          </div>
        </Card>

        <Card title="Timing / itch screen">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ToggleRow
              label="Has it been at least 48 hours after the initial insect bite or sting?"
              value={is("bite_48h")}
              onChange={(v) => set("bite_48h", v)}
            />
            <ToggleRow
              label="Is itch the principal symptom? (in the absence of other signs/symptoms of infection)"
              value={is("bite_itch_principal")}
              onChange={(v) => set("bite_itch_principal", v)}
            />
          </div>
        </Card>

        <Card title="Acute infection symptom onset (need ≥3) – select all that apply">
          <MultiSelect
            items={[
              { id: "bite_redness", label: "Redness of skin" },
              { id: "bite_pain", label: "Pain or tenderness to the area" },
              { id: "bite_swelling", label: "Swelling of skin" },
              { id: "bite_hot", label: "Skin surrounding the bite feels hot to touch" },
            ]}
            selected={answers}
            setSelected={setAnswers}
          />
        </Card>

        <Card title="Infection criteria (either supports 'more likely')">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ToggleRow
              label="Redness and swelling surrounding the bite is spreading?"
              value={is("bite_spreading")}
              onChange={(v) => set("bite_spreading", v)}
            />
            <ToggleRow
              label="Evidence of pustular discharge at site of bite/sting?"
              value={is("bite_pus")}
              onChange={(v) => set("bite_pus", v)}
            />
          </div>
        </Card>

        <Card title="Referral triggers (if infected bite suspected)">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ToggleRow
              label="Patient systemically unwell?"
              value={is("bite_systemically_unwell")}
              onChange={(v) => set("bite_systemically_unwell", v)}
            />
            <ToggleRow
              label="Comorbidity complicating infection (PAD, chronic venous insufficiency, lymphoedema, morbid obesity)?"
              value={is("bite_comorbidity")}
              onChange={(v) => set("bite_comorbidity", v)}
            />
            <ToggleRow
              label="Severe pain out of proportion to wound (possible toxin-producing bacteria)?"
              value={is("bite_pain_out_of_proportion")}
              onChange={(v) => set("bite_pain_out_of_proportion", v)}
            />
            <ToggleRow
              label="Significant collection of fluid/pus at site (needs incision & drainage where appropriate)?"
              value={is("bite_collection")}
              onChange={(v) => set("bite_collection", v)}
            />
          </div>
        </Card>

        <Card title="Antibiotic choice factors">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ToggleRow
              label="Reported penicillin allergy (via National Care Record or patient/carer)?"
              value={is("bite_pen_allergy")}
              onChange={(v) => set("bite_pen_allergy", v)}
            />
            <ToggleRow
              label="If penicillin allergy: pregnant?"
              value={is("bite_pregnant")}
              onChange={(v) => set("bite_pregnant", v)}
            />
          </div>
        </Card>
      </div>
    );
  },

  buildRecommendation: (_ageBand: AgeBand, ans: Answers) => {
    const leaflet =
      "Recommend self care, oral antihistamine and/or topical steroids over the counter and safety netting advice.";
    const demarcate =
      "Clearly demarcate the area and ask patient to monitor; return if symptoms worsen at any time OR do not improve after 3 days of OTC treatment for pharmacist reassessment.";
    const afterAbx =
      "If symptoms worsen rapidly/significantly at any time OR do not improve after completion of 5 days treatment course → onward referral.";

    if (ans["bite_anaphylaxis"]) {
      return {
        outcomeTitle: "Emergency: systemic hypersensitivity / anaphylaxis",
        gateway: ["Administer adrenaline and escalate urgently per local protocol."],
        firstLine: [],
        selfCare: [],
        refer: [
          "Consider NEWS2 ahead of signposting to A&E or calling 999 in a life-threatening emergency.",
        ],
      };
    }

    if (ans["bite_severely_immuno_infection"] || ans["bite_airway_or_orbital"]) {
      return {
        outcomeTitle: "Gateway: urgent escalation / referral",
        gateway: [
          "Severely immunosuppressed with infection signs OR airway/orbital risk.",
        ],
        firstLine: [],
        selfCare: [],
        refer: [
          "Consider NEWS2 ahead of signposting to A&E or calling 999 in a life-threatening emergency.",
          "Onward referral: general practice or other provider as appropriate.",
        ],
      };
    }

    if (ans["bite_unusual_exposure"]) {
      return {
        outcomeTitle: "Onward referral (non-standard bite / exposure)",
        gateway: ["Meets exclusion / special exposure criteria (animal/human/tick/travel/exotic)."],
        firstLine: [],
        selfCare: [leaflet],
        refer: ["Onward referral: general practice or other provider as appropriate."],
        notes: [
          "Consider likelihood of Lyme disease (tick bites may go unnoticed; erythema migrans may resemble bites).",
        ],
      };
    }

    // Timing / itch
    if (!ans["bite_48h"]) {
      return {
        outcomeTitle: "Self-care (before 48 hours)",
        gateway: ["Not at least 48 hours after initial bite/sting."],
        firstLine: [],
        selfCare: [leaflet],
        refer: ["Onward referral if concerns develop."],
      };
    }

    if (ans["bite_itch_principal"]) {
      return {
        outcomeTitle: "Self-care (itch principal symptom; infection unlikely)",
        gateway: [
          "Rapid-onset skin reaction is likely inflammatory/allergic rather than infection.",
        ],
        firstLine: [],
        selfCare: [leaflet],
        refer: ["Onward referral if worsening or diagnostic uncertainty."],
        notes: [
          "Skin redness and itching are common and may last up to 10 days; scratching increases inflammation and infection risk.",
        ],
      };
    }

    // Acute onset ≥3 symptoms check
    const acuteCount = countTrue(ans, ["bite_redness", "bite_pain", "bite_swelling", "bite_hot"]);
    if (acuteCount < 3) {
      return {
        outcomeTitle: "Infected insect bite less likely",
        gateway: ["Does not have acute onset of ≥3 symptoms of infected insect bite."],
        firstLine: [],
        selfCare: [leaflet],
        refer: ["Onward referral if concerns develop."],
        notes: [
          "Most bites/stings improve within hours/days and do not need antibiotics.",
        ],
      };
    }

    const meetsMoreLikely = ans["bite_spreading"] || ans["bite_pus"];
    if (!meetsMoreLikely) {
      return {
        outcomeTitle: "Self-care + monitoring (infection criteria not met)",
        gateway: ["Acute onset ≥3 symptoms but no spreading redness/swelling or pustular discharge."],
        firstLine: [],
        selfCare: [leaflet, demarcate],
        refer: ["Onward referral if worsening or no improvement after reassessment."],
      };
    }

    // Referral triggers
    const referTriggers =
      ans["bite_systemically_unwell"] ||
      ans["bite_comorbidity"] ||
      ans["bite_pain_out_of_proportion"] ||
      ans["bite_collection"];

    if (referTriggers) {
      return {
        outcomeTitle: "Onward referral (infection risk factors present)",
        gateway: ["Meets criteria for referral (systemically unwell/comorbidity/severe pain/collection)."],
        firstLine: [],
        selfCare: [leaflet],
        refer: ["Onward referral: general practice or other provider as appropriate."],
      };
    }

    // Antibiotics
    const penAllergy = !!ans["bite_pen_allergy"];
    const pregnant = !!ans["bite_pregnant"];

    if (!penAllergy) {
      return {
        outcomeTitle: "Infected insect bite more likely: offer antibiotic",
        gateway: ["Meets infection criteria and no referral triggers."],
        firstLine: ["Offer flucloxacillin for 5 days (per PGD) plus self care."],
        selfCare: [leaflet, afterAbx],
        refer: ["Onward referral: general practice or other provider as appropriate."],
      };
    }

    return {
      outcomeTitle: "Infected insect bite more likely: penicillin allergy alternative",
      gateway: ["Reported penicillin allergy."],
      firstLine: [],
      penAllergy: [
        pregnant
          ? "Offer erythromycin for 5 days (per PGD) plus self care."
          : "Offer clarithromycin for 5 days (per PGD) plus self care.",
      ],
      selfCare: [leaflet, afterAbx],
      refer: ["Onward referral: general practice or other provider as appropriate."],
    };
  },
};
