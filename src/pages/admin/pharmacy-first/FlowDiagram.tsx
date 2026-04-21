import React from "react";
import type { Answers } from "./types";

/**
 * A “diagram-like” flow using a 3-column grid (left / center / right),
 * similar to the PDFs: left = “less likely / self-care”, right = “referral / urgent”,
 * center = main pathway.
 *
 * Progressive reveal:
 * - A box can contain a Yes/No question or a multi-select checklist.
 * - Downstream boxes have showIf(answers) so they only appear after the right answers exist.
 */

export type FlowYesNo = {
  kind: "yesno";
  key: string; // answers[key] = boolean
  question: string;
};

export type FlowMulti = {

  title?: string;
  items: { id: string; label: string }[];
};

export type FlowContent =
  | { type: "text"; title?: string; lines: string[] }
  | { type: "question"; q: FlowYesNo }
  | { type: "multi"; m: FlowMulti };

export type FlowBox = {
  id: string;
  lane: "left" | "center" | "right";
  style?: "gateway" | "danger" | "info" | "plain";
  header?: string;
  content: FlowContent[];
  showIf?: (a: Answers) => boolean;
};

export type FlowSpec = {
  title: string;
  subtitle?: string;
  boxes: FlowBox[];
};

function laneOrder(lane: FlowBox["lane"]) {
  return lane === "left" ? 0 : lane === "center" ? 1 : 2;
}

const COLORS = {
  bg: "#0b0b0b",
  border: "#2a2a2a",
  text: "#ffffff",
  muted: "#bdbdbd",

  gatewayBg: "#2b1a00",
  gatewayBorder: "#f59e0b",

  dangerBg: "#2b0a0a",
  dangerBorder: "#ef4444",

  infoBg: "#071a2a",
  infoBorder: "#3b82f6",

  plainBg: "#141414",
};

export function FlowDiagram({
  spec,
  answers,
  setAnswers,
  ui,
}: {
  spec: FlowSpec;
  answers: Answers;
  setAnswers: React.Dispatch<React.SetStateAction<Answers>>;
  ui: {
    ToggleRow: React.ComponentType<{
      label: string;
      value: boolean;
      onChange: (v: boolean) => void;
    }>;
    MultiSelect: React.ComponentType<{
      items: { id: string; label: string }[];
      selected: Record<string, boolean>;
      setSelected: (next: Record<string, boolean>) => void;
    }>;
  };
}) {
  const { ToggleRow, MultiSelect } = ui;

  const visible = spec.boxes
    .filter((b) => (b.showIf ? b.showIf(answers) : true))
    .sort((a, b) => {
      const lo = laneOrder(a.lane) - laneOrder(b.lane);
      if (lo !== 0) return lo;
      return a.id.localeCompare(b.id);
    });

  function setYesNo(key: string, v: boolean) {
    setAnswers((prev) => ({ ...prev, [key]: v }));
  }

  function boxStyle(style?: FlowBox["style"]) {
    if (style === "gateway")
      return { background: COLORS.gatewayBg, border: COLORS.gatewayBorder };
    if (style === "danger")
      return { background: COLORS.dangerBg, border: COLORS.dangerBorder };
    if (style === "info")
      return { background: COLORS.infoBg, border: COLORS.infoBorder };
    return { background: COLORS.plainBg, border: COLORS.border };
  }

  return (
    <div style={{ width: "100%" }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 18, fontWeight: 950, color: COLORS.text }}>
          {spec.title}
        </div>
        {spec.subtitle && (
          <div style={{ marginTop: 6, color: COLORS.muted, fontWeight: 800 }}>
            {spec.subtitle}
          </div>
        )}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1.25fr 1fr",
          gap: 12,
          alignItems: "start",
        }}
      >
        {["left", "center", "right"].map((lane) => (
          <div
            key={lane}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            {visible
              .filter((b) => b.lane === lane)
              .map((b) => {
                const s = boxStyle(b.style);
                return (
                  <div
                    key={b.id}
                    style={{
                      background: s.background,
                      border: `1px solid ${s.border}`,
                      borderRadius: 16,
                      padding: 12,
                    }}
                  >
                    {b.header && (
                      <div
                        style={{
                          fontWeight: 950,
                          color: COLORS.text,
                          marginBottom: 8,
                        }}
                      >
                        {b.header}
                      </div>
                    )}

                    <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                      {b.content.map((c, idx) => {
                        if (c.type === "text") {
                          return (
                            <div key={idx}>
                              {c.title && (
                                <div
                                  style={{
                                    fontWeight: 900,
                                    color: COLORS.text,
                                    marginBottom: 6,
                                  }}
                                >
                                  {c.title}
                                </div>
                              )}
                              <ul
                                style={{
                                  margin: 0,
                                  paddingLeft: 18,
                                  lineHeight: 1.5,
                                  color: "#eaeaea",
                                  fontWeight: 800,
                                }}
                              >
                                {c.lines.map((ln, i) => (
                                  <li key={i}>{ln}</li>
                                ))}
                              </ul>
                            </div>
                          );
                        }

                        if (c.type === "question") {
                          const q = c.q;
                          const value = answers[q.key] === true; // false renders as "No"
                          return (
                            <ToggleRow
                              key={idx}
                              label={q.question}
                              value={value}
                              onChange={(v) => setYesNo(q.key, v)}
                            />
                          );
                        }

                        // multi
                        const m = c.m;
                        return (
                          <div key={idx}>
                            {m.title && (
                              <div
                                style={{
                                  fontWeight: 900,
                                  color: COLORS.text,
                                  marginBottom: 8,
                                }}
                              >
                                {m.title}
                              </div>
                            )}
                            <MultiSelect
                              items={m.items}
                              selected={answers as Record<string, boolean>}
                              setSelected={(next) => setAnswers(next as any)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
          </div>
        ))}
      </div>

      <div style={{ marginTop: 10, color: COLORS.muted, fontWeight: 800 }}>
        Boxes appear as you answer questions, matching the pathway flow.
      </div>
    </div>
  );
}
