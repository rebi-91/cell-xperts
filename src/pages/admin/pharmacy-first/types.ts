import React from "react";

export type AgeBand = "<1" | "1-4" | "5-11" | "12-15" | "16-64" | ">64";
export type ConditionKey =
  | "uti"
  | "impetigo"
  | "insect_bite"
  | "sore_throat"
  | "sinusitis"
  | "shingles"
  | "aom";

export type Rec = {
  outcomeTitle: string;
  gateway: string[];
  firstLine: string[];
  penAllergy?: string[];
  selfCare: string[];
  refer: string[];
  notes?: string[];
};

export type Answers = Record<string, boolean>;

export type Condition = {
  key: ConditionKey;
  label: string;
  eligibleAges: AgeBand[];
  description: string;
};

export type UiKit = {
  Card: (p: { title?: string; children: React.ReactNode }) => JSX.Element;
  ToggleRow: (p: {
    label: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => JSX.Element;
  MultiSelect: (p: {
    items: { id: string; label: string }[];
    selected: Record<string, boolean>;
    setSelected: (next: Record<string, boolean>) => void;
  }) => JSX.Element;
};

export type Pathway = {
  condition: Condition;
  Assessment: (p: {
    answers: Answers;
    setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
    ui: UiKit;
  }) => JSX.Element;
  buildRecommendation: (ageBand: AgeBand, answers: Answers) => Rec;
};

export function countTrue(ans: Answers, keys: string[]) {
  return keys.reduce((acc, k) => acc + (ans[k] ? 1 : 0), 0);
}
