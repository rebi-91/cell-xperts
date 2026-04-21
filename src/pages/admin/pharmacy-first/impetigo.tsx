import React, { useMemo, useState } from "react";
import { AgeBand, Answers, Pathway } from "./types";

type Q = {
  key: string;
  title: string;
  label: string;
  // if set, requires value to equal this to continue
  mustBe?: boolean;
  // if true and answer === true, finish immediately (referral)
  endsIfYes?: boolean;
};

export const impetigoPathway: Pathway = {
  condition: {
    key: "impetigo",
    label: "Impetigo (non-bullous, age 1+)",
    eligibleAges: ["1-4", "5-11", "12-15", "16-64", ">64"],
    description:
      "Non-bullous impetigo for adults and children aged 1 year and over.",
  },

  Assessment: ({ answers, setAnswers, ui }) => {
    const { Card, ToggleRow } = ui;

    const set = (k: string, v: boolean) =>
      setAnswers((p) => ({ ...p, [k]: v, __complete: false }));

    const isSet = (k: string) => typeof answers[k] === "boolean";
    const val = (k: string) => !!answers[k];

    // PDF flow: exclusions first, then deterioration, then typical features, then lesion count, then allergy/pregnancy
    const questions: Q[] = useMemo(
      () => [
        {
          key: "imp_excluded",
          title: "Exclusion (must be NO)",
          label:
            "Excluded from this pathway? (bullous impetigo, recurrent impetigo ≥2 in same year, OR pregnant and under 16)",
          mustBe: false,
          endsIfYes: true,
        },
        {
          key: "imp_redflags",
          title: "Risk check",
          label: "Risk of deterioration / red flags / serious illness?",
          endsIfYes: true,
        },
        {
          key: "imp_immuno_widespread",
          title: "Risk check",
          label: "Immunosuppressed AND infection is widespread?",
          endsIfYes: true,
        },
        {
          key: "imp_severe_complications",
          title: "Risk check",
          label: "Severe complications suspected (deeper soft tissue infection)?",
          endsIfYes: true,
        },
        {
          key: "imp_typical",
          title: "Diagnosis",
          label: "Typical impetigo appearance (golden crusts / typical progression)?",
          mustBe: true,
          endsIfYes: true, // if NO -> “less likely” outcome
        },
        {
          key: "imp_leq3",
          title: "Lesion count",
          label: "≤3 lesions/clusters present?",
        },
        {
          key: "imp_ge4",
          title: "Lesion count",
          label: "≥4 lesions/clusters present?",
        },
        {
          key: "imp_h2o2_unsuitable_or_ineffective",
          title: "Localised (only if ≤3)",
          label: "If localised: hydrogen peroxide unsuitable OR ineffective (and still localised)?",
        },
        {
          key: "imp_pen_allergy",
          title: "If antibiotics needed",
          label: "Reported penicillin allergy?",
        },
        {
          key: "imp_pregnant",
          title: "If penicillin allergy",
          label: "Pregnancy relevant? (only used to pick macrolide)",
        },
      ],
      []
    );

    const [i, setI] = useState(0);
    const q = questions[i];

    const canContinue = useMemo(() => {
      if (!q) return false;
      if (!isSet(q.key)) return false;
      if (typeof q.mustBe === "boolean") return answers[q.key] === q.mustBe;
      // special: lesion count step must pick one of ≤3 or ≥4 (and not both)
      if (q.key === "imp_ge4" || q.key === "imp_leq3") return true;
      return true;
    }, [answers, q]);

    // keep lesion count mutually exclusive
    function setLesions(which: "leq3" | "ge4", v: boolean) {
      if (which === "leq3") {
        setAnswers((p) => ({
          ...p,
          imp_leq3: v,
          imp_ge4: v ? false : !!p.imp_ge4,
          __complete: false,
        }));
      } else {
        setAnswers((p) => ({
          ...p,
          imp_ge4: v,
          imp_leq3: v ? false : !!p.imp_leq3,
          __complete: false,
        }));
      }
    }

    function finish() {
      setAnswers((p) => ({ ...p, __complete: true }));
    }

    function next() {
      // If any “endsIfYes” question is YES -> finish now (recommendation will show)
      if (q?.endsIfYes && val(q.key) === true) return finish();

      // If mustBe is set and not satisfied -> finish (recommendation will show “less likely / referral”)
      if (typeof q?.mustBe === "boolean" && val(q.key) !== q.mustBe) return finish();

      // After lesion count questions, enforce at least one is selected
      if (q?.key === "imp_ge4") {
        const leq3 = !!answers["imp_leq3"];
        const ge4 = !!answers["imp_ge4"];
        if (!leq3 && !ge4) return;
        // if widespread (ge4), skip h2o2 question (localised-only)
        if (ge4) {
          // jump to pen allergy
          const penIdx = questions.findIndex((x) => x.key === "imp_pen_allergy");
          if (penIdx >= 0) return setI(penIdx);
        }
      }

      if (i >= questions.length - 1) return finish();
      setI((x) => x + 1);
    }

    function back() {
      if (i === 0) return;
      setI((x) => x - 1);
    }

    // If already complete, don’t show extra UI
    if (answers["__complete"]) return <div />;

    const showBack = i > 0;

    return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
        <Card title={q.title}>
          {q.key === "imp_leq3" ? (
            <ToggleRow
              label={q.label}
              value={!!answers["imp_leq3"]}
              onChange={(v) => setLesions("leq3", v)}
            />
          ) : q.key === "imp_ge4" ? (
            <ToggleRow
              label={q.label}
              value={!!answers["imp_ge4"]}
              onChange={(v) => setLesions("ge4", v)}
            />
          ) : (
            <ToggleRow
              label={q.label}
              value={val(q.key)}
              onChange={(v) => set(q.key, v)}
            />
          )}
        </Card>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <button
            type="button"
            onClick={back}
            disabled={!showBack}
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              border: `1px solid ${showBack ? "#dc2626" : "#2a2a2a"}`,
              background: showBack ? "#dc2626" : "#101010",
              color: "#fff",
              cursor: showBack ? "pointer" : "not-allowed",
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
    const leaflet = "Share self-care and safety-netting advice (Impetigo leaflet).";
    const hygiene = "Advise on hygiene to reduce spread and how to take medicines.";

    // exclusions first
    if (ans["imp_excluded"]) {
      return {
        outcomeTitle: "Not eligible for this pathway",
        gateway: ["Exclusion criteria met."],
        firstLine: [],
        selfCare: [leaflet],
        refer: ["Onward referral: general practice / appropriate provider."],
      };
    }

    if (ans["imp_redflags"] || ans["imp_immuno_widespread"] || ans["imp_severe_complications"]) {
      return {
        outcomeTitle: "Urgent referral",
        gateway: ["Red flags / serious illness risk identified."],
        firstLine: [],
        selfCare: [leaflet],
        refer: ["Onward referral urgently: general practice / appropriate provider."],
      };
    }

    if (!ans["imp_typical"]) {
      return {
        outcomeTitle: "Impetigo less likely",
        gateway: ["Does not follow typical impetigo clinical features."],
        firstLine: [],
        selfCare: [leaflet],
        refer: ["Consider alternative diagnosis and proceed appropriately."],
      };
    }

    // Localised
    if (ans["imp_leq3"]) {
      if (ans["imp_h2o2_unsuitable_or_ineffective"]) {
        return {
          outcomeTitle: "Localised: topical 2nd line",
          gateway: ["Hydrogen peroxide unsuitable/ineffective but still localised."],
          firstLine: ["Fusidic acid cream for 5 days (per PGD) + self care."],
          selfCare: [leaflet, hygiene],
          refer: ["Refer if worse or not improved after course."],
        };
      }
      return {
        outcomeTitle: "Localised: topical first line",
        gateway: ["≤3 lesions/clusters present."],
        firstLine: ["Hydrogen peroxide 1% cream for 5 days (per protocol) + self care."],
        selfCare: [leaflet, hygiene],
        refer: ["Refer if worse or not improved after course."],
      };
    }

    // Widespread
    if (ans["imp_ge4"]) {
      const penAllergy = !!ans["imp_pen_allergy"];
      const pregnant = !!ans["imp_pregnant"];

      if (!penAllergy) {
        return {
          outcomeTitle: "Widespread: oral antibiotic",
          gateway: ["≥4 lesions/clusters present."],
          firstLine: ["Flucloxacillin for 5 days (per PGD) + self care."],
          selfCare: [leaflet, hygiene],
          refer: ["Refer if worse or not improved after course."],
        };
      }

      return {
        outcomeTitle: "Widespread: penicillin allergy alternative",
        gateway: ["Reported penicillin allergy."],
        firstLine: [],
        penAllergy: [
          pregnant
            ? "Erythromycin for 5 days (per PGD) + self care."
            : "Clarithromycin for 5 days (per PGD) + self care.",
        ],
        selfCare: [leaflet, hygiene],
        refer: ["Refer if worse or not improved after course."],
      };
    }

    return {
      outcomeTitle: "Confirm lesion count",
      gateway: ["Select whether ≤3 or ≥4 lesions/clusters are present."],
      firstLine: [],
      selfCare: [leaflet, hygiene],
      refer: ["Proceed once confirmed."],
    };
  },
};
