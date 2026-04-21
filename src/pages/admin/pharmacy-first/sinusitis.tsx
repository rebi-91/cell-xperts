import React, { useMemo, useState } from "react";
import { AgeBand, Answers, Pathway, countTrue } from "./types";

type QType = "yesno" | "multi";

type Q = {
  key: string;
  title: string;
  type: QType;
  label: string;
  mustBe?: boolean;
  endsIfYes?: boolean;
  items?: { id: string; label: string }[];
};

export const sinusitisPathway: Pathway = {
  condition: {
    key: "sinusitis",
    label: "Acute Sinusitis (age 12+)",
    eligibleAges: ["12-15", "16-64", ">64"],
    description: "Acute sinusitis assessment pathway.",
  },

  Assessment: ({ answers, setAnswers, ui }) => {
    const { Card, ToggleRow, MultiSelect } = ui;

    const isSet = (k: string) => typeof answers[k] === "boolean";
    const val = (k: string) => !!answers[k];

    const setBool = (k: string, v: boolean) =>
      setAnswers((p) => ({ ...p, [k]: v, __complete: false }));

    const bacterialItems = useMemo(
      () => [
        { id: "sin_double_worse", label: "Marked deterioration after an initial milder phase" },
        { id: "sin_fever", label: "Fever (>38°C)" },
        { id: "sin_purulent", label: "Unremitting purulent nasal discharge" },
        { id: "sin_unilateral_pain", label: "Severe localised unilateral pain over teeth/jaw" },
      ],
      []
    );

    const questions: Q[] = useMemo(
      () => [
        {
          key: "sin_excluded",
          title: "Exclusion (must be NO)",
          type: "yesno",
          label:
            "Excluded? (immunosuppressed, chronic sinusitis >12 weeks, OR pregnant and under 16)",
          mustBe: false,
          endsIfYes: true,
        },
        {
          key: "sin_orbital",
          title: "Red flags",
          type: "yesno",
          label: "Intra/periorbital complications (orbital cellulitis, displaced eyeball, reduced vision)?",
          endsIfYes: true,
        },
        {
          key: "sin_intracranial",
          title: "Red flags",
          type: "yesno",
          label: "Intracranial complications (including swelling over frontal bone)?",
          endsIfYes: true,
        },
        {
          key: "sin_meningitis_neuro",
          title: "Red flags",
          type: "yesno",
          label: "Meningitis signs / severe frontal headache / focal neurological signs?",
          endsIfYes: true,
        },
        {
          key: "sin_meets_dx",
          title: "Diagnosis",
          type: "yesno",
          label:
            "Meets acute sinusitis criteria? (nasal blockage OR discharge) AND (facial pain/pressure OR reduced smell in adults OR cough in children)",
          mustBe: true,
          endsIfYes: true, // if NO -> “less likely”
        },
        {
          key: "sin_leq10",
          title: "Duration",
          type: "yesno",
          label: "Symptoms for ≤10 days?",
        },
        {
          key: "sin_gt10_no_improve",
          title: "Duration",
          type: "yesno",
          label: "Symptoms >10 days with no improvement?",
        },
        {
          key: "__bacterial",
          title: "Bacterial features",
          type: "multi",
          label: "Select all that apply (need 2+ for bacterial features route)",
          items: bacterialItems,
        },
        {
          key: "sin_steroid_suitable",
          title: "Steroid route",
          type: "yesno",
          label: "High dose nasal corticosteroid (off-label) suitable?",
        },
        {
          key: "sin_steroid_unsuitable_or_ineffective",
          title: "Steroid route",
          type: "yesno",
          label: "Steroid unsuitable OR ineffective?",
        },
        {
          key: "sin_pen_allergy",
          title: "If antibiotics needed",
          type: "yesno",
          label: "Reported penicillin allergy?",
        },
        {
          key: "sin_pregnant",
          title: "If penicillin allergy",
          type: "yesno",
          label: "Pregnancy relevant? (only used to pick macrolide)",
        },
      ],
      [bacterialItems]
    );

    const [i, setI] = useState(0);
    const q = questions[i];

    const canContinue = useMemo(() => {
      if (!q) return false;

      if (q.type === "yesno") {
        if (!isSet(q.key)) return false;
        if (typeof q.mustBe === "boolean") return answers[q.key] === q.mustBe;
        return true;
      }

      // multi — allow continue even if none selected
      return true;
    }, [answers, q]);

    function finish() {
      setAnswers((p) => ({ ...p, __complete: true }));
    }

    function next() {
      if (q.type === "yesno") {
        if (q.endsIfYes && val(q.key) === true) return finish();
        if (typeof q.mustBe === "boolean" && val(q.key) !== q.mustBe) return finish();
      }

      // If ≤10 days is YES, we can finish (self-care)
      if (q.key === "sin_leq10" && val("sin_leq10") === true) return finish();

      // If we answered duration >10 question and it’s NO while ≤10 is also NO -> finish with “confirm duration”
      if (q.key === "sin_gt10_no_improve") {
        const leq10 = !!answers["sin_leq10"];
        const gt10 = !!answers["sin_gt10_no_improve"];
        if (!leq10 && !gt10) return finish();
      }

      if (i >= questions.length - 1) return finish();
      setI((x) => x + 1);
    }

    function back() {
      if (i === 0) return;
      setI((x) => x - 1);
    }

    if (answers["__complete"]) return <div />;

    return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
        <Card title={q.title}>
          {q.type === "yesno" ? (
            <ToggleRow label={q.label} value={val(q.key)} onChange={(v) => setBool(q.key, v)} />
          ) : (
            <>
              <div style={{ color: "#eaeaea", fontWeight: 800, marginBottom: 10 }}>
                {q.label}
              </div>
              <MultiSelect items={q.items!} selected={answers} setSelected={setAnswers} />
            </>
          )}
        </Card>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <button
            type="button"
            onClick={back}
            disabled={i === 0}
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              border: `1px solid ${i === 0 ? "#2a2a2a" : "#dc2626"}`,
              background: i === 0 ? "#101010" : "#dc2626",
              color: "#fff",
              cursor: i === 0 ? "not-allowed" : "pointer",
              fontWeight: 900,
              minWidth: 120,
            }}
          >
            Back
          </button>

          <button
            type="button"
            onClick={next}
            disabled={!canContinue}
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              border: `1px solid ${canContinue ? "#1d4ed8" : "#2a2a2a"}`,
              background: canContinue ? "#1d4ed8" : "#101010",
              color: "#fff",
              cursor: canContinue ? "pointer" : "not-allowed",
              fontWeight: 900,
              minWidth: 120,
            }}
          >
            Next
          </button>
        </div>
      </div>
    );
  },

  buildRecommendation: (_ageBand: AgeBand, ans: Answers) => {
    const leaflet = "Share self-care + safety-netting (TARGET RTI leaflet).";
    const afterCourse =
      "If symptoms worsen rapidly/significantly at any time OR do not improve after course → refer.";

    if (ans["sin_excluded"]) {
      return {
        outcomeTitle: "Not eligible for this pathway",
        gateway: ["Exclusion criteria met."],
        firstLine: [],
        selfCare: [leaflet],
        refer: ["Onward referral: general practice / appropriate provider."],
      };
    }

    const redFlags = ans["sin_orbital"] || ans["sin_intracranial"] || ans["sin_meningitis_neuro"];
    if (redFlags) {
      return {
        outcomeTitle: "Urgent escalation",
        gateway: ["Serious complications suspected."],
        firstLine: [],
        selfCare: [],
        refer: ["Urgent same-day escalation per local policy."],
      };
    }

    if (!ans["sin_meets_dx"]) {
      return {
        outcomeTitle: "Acute sinusitis less likely",
        gateway: ["Does not meet diagnostic criteria."],
        firstLine: [],
        selfCare: [leaflet],
        refer: ["Consider alternative diagnosis and proceed appropriately."],
      };
    }

    if (ans["sin_leq10"]) {
      return {
        outcomeTitle: "≤10 days: self-care",
        gateway: ["Antibiotic not needed."],
        firstLine: [],
        selfCare: [leaflet, "Self-care and regular pain relief."],
        refer: ["Refer if worsening or concerns."],
      };
    }

    if (!ans["sin_gt10_no_improve"]) {
      return {
        outcomeTitle: "Confirm duration",
        gateway: ["Confirm whether symptoms are >10 days with no improvement."],
        firstLine: [],
        selfCare: [leaflet],
        refer: ["Proceed once confirmed."],
      };
    }

    const bacterialCount = countTrue(ans, [
      "sin_double_worse",
      "sin_fever",
      "sin_purulent",
      "sin_unilateral_pain",
    ]);

    if (bacterialCount < 2) {
      return {
        outcomeTitle: ">10 days: self-care + consider steroid",
        gateway: ["Shared decision-making based on severity."],
        firstLine: ["High dose nasal corticosteroid (off-label) for 14 days (per PGD)."],
        selfCare: [leaflet, "Return if not improving in 7 days for reassessment."],
        refer: ["Refer if worsening or no improvement after reassessment."],
      };
    }

    const steroidSuitable = !!ans["sin_steroid_suitable"];
    const steroidUnsuitableOrIneffective = !!ans["sin_steroid_unsuitable_or_ineffective"];

    if (steroidSuitable && !steroidUnsuitableOrIneffective) {
      return {
        outcomeTitle: "≥2 bacterial features: steroid first line",
        gateway: ["Offer steroid first; antibiotics only if unsuitable/ineffective."],
        firstLine: ["High dose nasal corticosteroid (off-label) for 14 days (per PGD)."],
        selfCare: [leaflet, "Return if no improvement in 7 days for reassessment."],
        refer: [afterCourse],
      };
    }

    const penAllergy = !!ans["sin_pen_allergy"];
    const pregnant = !!ans["sin_pregnant"];

    if (!penAllergy) {
      return {
        outcomeTitle: "Antibiotic (steroid unsuitable/ineffective)",
        gateway: [],
        firstLine: ["Phenoxymethylpenicillin for 5 days (per PGD) + self care."],
        selfCare: [leaflet, afterCourse],
        refer: ["Onward referral as appropriate."],
      };
    }

    return {
      outcomeTitle: "Antibiotic (penicillin allergy alternative)",
      gateway: ["Penicillin allergy reported."],
      firstLine: [],
      penAllergy: [
        pregnant
          ? "Erythromycin for 5 days (per PGD) + self care."
          : "Clarithromycin OR doxycycline for 5 days (per PGD) + self care.",
      ],
      selfCare: [leaflet, afterCourse],
      refer: ["Onward referral as appropriate."],
    };
  },
};
