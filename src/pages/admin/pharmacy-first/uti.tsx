import React, { useMemo, useState } from "react";
import { AgeBand, Answers, Pathway, countTrue } from "./types";

/**
 * UTI pathway assessment is now asked ONE question at a time.
 * Branching order matches the pathway flow:
 * 1) Exclusion criteria (pregnancy / catheter / recurrent UTI)
 * 2) Risk of deterioration / red flags / pyelonephritis
 * 3) Alternative diagnosis checks
 * 4) 3 key symptoms (multi-select)
 * 5) If 0 key symptoms -> other urinary symptoms
 * 6) If 2–3 key symptoms -> symptom severity (mild?)
 * Then -> recommendation
 */

// Question ids (kept stable for answers keys + routing)
type QId =
  | "uti_exclusions"
  | "uti_redflags"
  | "uti_alt_dx"
  | "uti_key_symptoms"
  | "uti_other_urinary"
  | "uti_mild"
  | "uti_done";

function isAnsweredYesNo(ans: Answers, key: string) {
  // for yes/no questions we store true/false explicitly
  return ans[key] === true || ans[key] === false;
}

function keySymCount(ans: Answers) {
  return countTrue(ans as Record<string, boolean>, [
    "uti_dysuria",
    "uti_new_nocturia",
    "uti_cloudy_urine",
  ]);
}

export const utiPathway: Pathway = {
  condition: {
    key: "uti",
    label:
      "Uncomplicated Urinary Tract Infection (women 16 to under 65; no diabetes)",
    eligibleAges: ["16-64"],
    description:
      "For women aged 16 to under 65 years who do not have diabetes with suspected lower UTIs. Exclude: pregnant individuals, urinary catheter, recurrent UTI (2 in 6 months or 3 in 12 months).",
  },

  Assessment: ({ answers, setAnswers, ui }) => {
    const { Card, ToggleRow, MultiSelect } = ui;

    const [qid, setQid] = useState<QId>("uti_exclusions");

    const set = (k: string, v: boolean) =>
      setAnswers((p) => ({ ...p, [k]: v }));

    const is = (k: string) => !!answers[k];

    // --- Routing logic (what question comes next) ---
    const nextId = useMemo((): QId => {
      // If we've reached "done", stay there
      if (qid === "uti_done") return "uti_done";

      // 1) Exclusions: if YES -> end early (recommendation will refer)
      if (qid === "uti_exclusions") {
        // store answer under key "uti_exclusions" (true => excluded)
        if (answers["uti_exclusions"] === true) return "uti_done";
        if (answers["uti_exclusions"] === false) return "uti_redflags";
        return qid;
      }

      // 2) Red flags: if YES -> end early
      if (qid === "uti_redflags") {
        if (answers["uti_redflags"] === true) return "uti_done";
        if (answers["uti_redflags"] === false) return "uti_alt_dx";
        return qid;
      }

      // 3) Alt dx: if YES -> end early
      if (qid === "uti_alt_dx") {
        if (answers["uti_alt_dx"] === true) return "uti_done";
        if (answers["uti_alt_dx"] === false) return "uti_key_symptoms";
        return qid;
      }

      // 4) Key symptoms (multi-select):
      // Decide follow-on question by count
      if (qid === "uti_key_symptoms") {
        const c = keySymCount(answers);
        if (c === 0) return "uti_other_urinary";
        if (c >= 2) return "uti_mild";
        // c === 1 -> recommendation directly
        return "uti_done";
      }

      // 5) Other urinary symptoms only used when 0 key symptoms -> then done
      if (qid === "uti_other_urinary") {
        if (isAnsweredYesNo(answers, "uti_other_urinary")) return "uti_done";
        return qid;
      }

      // 6) Mild only used when 2–3 key symptoms -> then done
      if (qid === "uti_mild") {
        if (isAnsweredYesNo(answers, "uti_mild")) return "uti_done";
        return qid;
      }

      return "uti_done";
    }, [qid, answers]);

    const canGoNext = useMemo(() => {
      // Only allow Next if current question answered
      if (qid === "uti_key_symptoms") return true; // multiselect can always proceed
      return isAnsweredYesNo(answers, qid);
    }, [qid, answers]);

    function goNext() {
      if (!canGoNext) return;
      setQid(nextId);
    }

    function goBack() {
      // Simple back stack could be added; for now, we do a minimal safe back:
      // go back in the "expected" reverse order, but also respect branches.
      const c = keySymCount(answers);

      if (qid === "uti_done") {
        // go to the last question that was relevant
        if (answers["uti_alt_dx"] === true) return setQid("uti_alt_dx");
        if (answers["uti_redflags"] === true) return setQid("uti_redflags");
        if (answers["uti_exclusions"] === true) return setQid("uti_exclusions");

        if (c === 0) return setQid("uti_other_urinary");
        if (c === 1) return setQid("uti_key_symptoms");
        if (c >= 2) return setQid("uti_mild");
        return setQid("uti_key_symptoms");
      }

      if (qid === "uti_mild") return setQid("uti_key_symptoms");
      if (qid === "uti_other_urinary") return setQid("uti_key_symptoms");
      if (qid === "uti_key_symptoms") return setQid("uti_alt_dx");
      if (qid === "uti_alt_dx") return setQid("uti_redflags");
      if (qid === "uti_redflags") return setQid("uti_exclusions");
      return setQid("uti_exclusions");
    }

    // --- Render ONE question screen at a time ---
    return (
      <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
        {qid === "uti_exclusions" && (
          <Card title="Exclusion criteria (must be NO to continue)">
            <ToggleRow
              label="Is the patient excluded from this Pharmacy First UTI pathway? (pregnant, urinary catheter, OR recurrent UTI: 2 episodes in 6 months or 3 in 12 months)"
              value={answers["uti_exclusions"] === true}
              onChange={(v) => set("uti_exclusions", v)}
            />
          </Card>
        )}

        {qid === "uti_redflags" && (
          <Card title="Risk of deterioration / red flags / pyelonephritis">
            <ToggleRow
              label="Any risk of deterioration, red flags or serious illness OR NEW signs/symptoms of pyelonephritis? (kidney pain/tenderness under ribs, flu-like illness, rigors or temp ≥37.9°C, nausea/vomiting)"
              value={answers["uti_redflags"] === true}
              onChange={(v) => set("uti_redflags", v)}
            />
          </Card>
        )}

        {qid === "uti_alt_dx" && (
          <Card title="Alternative diagnosis / onward referral checks">
            <ToggleRow
              label="ANY of: vaginal discharge; urethritis; STI risk (check sexual history); possible pregnancy / missed or lighter periods (test if unsure); genitourinary syndrome of menopause (vulvovaginal atrophy); immunosuppressed?"
              value={answers["uti_alt_dx"] === true}
              onChange={(v) => set("uti_alt_dx", v)}
            />
          </Card>
        )}

        {qid === "uti_key_symptoms" && (
          <Card title="3 key diagnostic signs/symptoms (select all that apply)">
            <MultiSelect
              items={[
                {
                  id: "uti_dysuria",
                  label:
                    "Dysuria (acute pain/burning when passing urine or at end of urination)",
                },
                { id: "uti_new_nocturia", label: "New nocturia" },
                {
                  id: "uti_cloudy_urine",
                  label:
                    "Urine cloudy to the naked eye (visual inspection by pharmacist if practicable)",
                },
              ]}
              selected={answers as Record<string, boolean>}
              setSelected={setAnswers as any}
            />

            <div style={{ marginTop: 10, color: "#bdbdbd", fontWeight: 800 }}>
              Selected: {keySymCount(answers)} / 3
            </div>
          </Card>
        )}

        {qid === "uti_other_urinary" && (
          <Card title="Other urinary symptoms (only asked when 0 key symptoms)">
            <ToggleRow
              label="Are there other urinary symptoms? (urgency, frequency, visible haematuria, suprapubic pain/tenderness)"
              value={answers["uti_other_urinary"] === true}
              onChange={(v) => set("uti_other_urinary", v)}
            />
          </Card>
        )}

        {qid === "uti_mild" && (
          <Card title="Symptom severity (only asked when 2–3 key symptoms)">
            <ToggleRow
              label="Does the patient describe symptoms as mild?"
              value={answers["uti_mild"] === true}
              onChange={(v) => set("uti_mild", v)}
            />
          </Card>
        )}

        {/* Navigation buttons inside the assessment card region */}
        <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
          <button
            type="button"
            onClick={goBack}
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              border: "1px solid #dc2626",
              background: "#dc2626",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 900,
              minWidth: 120,
            }}
          >
            Back
          </button>

          <button
            type="button"
            onClick={goNext}
            disabled={!canGoNext || qid === "uti_done"}
            style={{
              padding: "12px 14px",
              borderRadius: 14,
              border: `1px solid ${!canGoNext || qid === "uti_done" ? "#2a2a2a" : "#1d4ed8"}`,
              background: !canGoNext || qid === "uti_done" ? "#101010" : "#1d4ed8",
              color: "#fff",
              cursor: !canGoNext || qid === "uti_done" ? "not-allowed" : "pointer",
              fontWeight: 900,
              minWidth: 120,
            }}
          >
            Next
          </button>
        </div>

        {/* When done, we just stop asking questions.
            Your parent screen can show the Recommendation as usual once user hits "Next" overall.
            If you want *this component* to show "Assessment complete", keep this: */}
        {qid === "uti_done" && (
          <div
            style={{
              marginTop: 8,
              padding: 12,
              borderRadius: 16,
              border: "1px solid #2a2a2a",
              background: "#141414",
              color: "#eaeaea",
              fontWeight: 900,
              textAlign: "center",
            }}
          >
            Assessment complete — continue to see recommendation.
          </div>
        )}
      </div>
    );
  },

  buildRecommendation: (_ageBand: AgeBand, ans: Answers) => {
    const keyCount = keySymCount(ans);

    const common = {
      selfCareLeaflet:
        "Share self-care and safety-netting advice using TARGET UTI leaflet.",
      safetyNet:
        "FOR ALL PATIENTS: If symptoms worsen rapidly or significantly at any time, OR do not improve in 48 hours of taking antibiotics → onward referral.",
    };

    // NEW: exclusions early exit (matches your new first question)
    if (ans["uti_exclusions"] === true) {
      return {
        outcomeTitle: "Excluded from Pharmacy First UTI pathway → onward referral",
        gateway: [
          "Exclusion criteria met (pregnancy, catheter, or recurrent UTI threshold).",
        ],
        firstLine: [],
        selfCare: [common.selfCareLeaflet, "Self-care and pain relief."],
        refer: [
          "Onward referral: general practice or relevant out of hours service.",
        ],
      };
    }

    // Red flags early exit
    if (ans["uti_redflags"] === true) {
      return {
        outcomeTitle: "Urgent same-day referral (red flags / pyelonephritis)",
        gateway: [
          "Consider calculating NEWS2 ahead of signposting to A&E or calling 999 in a life-threatening emergency.",
        ],
        firstLine: [],
        selfCare: [common.selfCareLeaflet],
        refer: [
          "Urgent same-day referral: general practice or relevant out of hours service.",
        ],
      };
    }

    // Alt diagnosis early exit
    if (ans["uti_alt_dx"] === true) {
      return {
        outcomeTitle:
          "Onward referral (UTI equally likely to other diagnosis / exclusions present)",
        gateway: ["Alternative diagnosis / exclusion criteria identified."],
        firstLine: [],
        selfCare: [common.selfCareLeaflet, "Self-care and pain relief."],
        refer: [
          "Onward referral: general practice, sexual health clinics, or other provider as appropriate.",
        ],
      };
    }

    // Key symptom branches
    if (keyCount === 0) {
      if (ans["uti_other_urinary"] === true) {
        return {
          outcomeTitle: "UTI equally likely to other diagnosis",
          gateway: [
            "No key diagnostic symptoms, but other urinary symptoms present (urgency/frequency/visible haematuria/suprapubic pain).",
          ],
          firstLine: [],
          selfCare: [common.selfCareLeaflet, "Self-care and pain relief."],
          refer: [
            "Onward referral: general practice, sexual health clinics, or other provider as appropriate.",
          ],
        };
      }

      return {
        outcomeTitle: "UTI less likely",
        gateway: ["No key diagnostic symptoms and no other urinary symptoms."],
        firstLine: [],
        selfCare: [common.selfCareLeaflet, "Self-care and pain relief."],
        refer: [
          "Onward referral if needed: general practice or other provider as appropriate.",
        ],
      };
    }

    if (keyCount === 1) {
      return {
        outcomeTitle: "UTI equally likely to other diagnosis",
        gateway: ["One key diagnostic symptom present."],
        firstLine: [],
        selfCare: [common.selfCareLeaflet, "Self-care and pain relief."],
        refer: [
          "Onward referral: general practice, sexual health clinics, or other provider as appropriate.",
        ],
      };
    }

    // 2–3 symptoms
    const mild = ans["uti_mild"] === true;
    if (mild) {
      return {
        outcomeTitle:
          "2–3 key symptoms: mild → pain relief & self-care first line",
        gateway: ["Shared decision making approach using TARGET UTI resources."],
        firstLine: [],
        selfCare: [
          common.selfCareLeaflet,
          "In patients that describe symptoms as mild, consider pain relief and self-care as first line treatment.",
          "Ask patient to return to Pharmacy if no improvement in 48 hours for pharmacist reassessment.",
          common.safetyNet,
        ],
        refer: [
          "Onward referral: general practice or other provider as appropriate.",
        ],
      };
    }

    return {
      outcomeTitle:
        "2–3 key symptoms: moderate to severe → nitrofurantoin + self-care",
      gateway: [
        "Shared decision making approach using TARGET UTI resources.",
        "Offer nitrofurantoin for 3 days (subject to inclusion/exclusion criteria in PGD) plus self-care.",
      ],
      firstLine: ["Nitrofurantoin for 3 days (per PGD)."],
      selfCare: [
        common.selfCareLeaflet,
        "Ask patient to return to Pharmacy if no improvement in 48 hours for pharmacist reassessment.",
        common.safetyNet,
      ],
      refer: [
        "Onward referral: general practice or other provider as appropriate.",
      ],
    };
  },
};
