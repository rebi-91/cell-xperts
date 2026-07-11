// src/components/TodoListPage.tsx
import React, { useEffect, useMemo, useState } from "react";
import supabase from "../../supabase";

// ─── Types ────────────────────────────────────────────────────
interface Subtask {
  id: string;
  todo_id: string;
  title: string;
  completed: boolean;
}

interface Todo {
  id: string;
  task_date: string;
  title: string;
  completed: boolean;
  todo_subtasks: Subtask[];
}

// ─── Cheerful palette — each task cycles through these for its
// accent colour (left border + checkbox fill) ───────────────────
const PALETTE = ["#FF6B6B", "#FFB84D", "#FFD93D", "#4FCE7A", "#4D96FF", "#B26DF2", "#FF6FB5"];
const colorFor = (i: number) => PALETTE[i % PALETTE.length];

const todayStr = () => new Date().toISOString().slice(0, 10);

const fmtHeaderDate = (d: Date) =>
  d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

// ─── Component ────────────────────────────────────────────────
const TodoListPage: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [newTaskText, setNewTaskText] = useState("");
  const [subtaskDrafts, setSubtaskDrafts] = useState<Record<string, string>>({});
  const [openSubtaskFor, setOpenSubtaskFor] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
  const [justToggled, setJustToggled] = useState<string | null>(null);

  const today = todayStr();

  // ─── Load today's list, carrying over yesterday's tasks once ──
  const loadTodos = async () => {
    setLoading(true);

    const { data: existing, error: existingErr } = await supabase
      .from("todos")
      .select("*, todo_subtasks(*)")
      .eq("task_date", today)
      .order("created_at", { ascending: true });

    if (existingErr) {
      setLoading(false);
      return;
    }

    if (existing && existing.length > 0) {
      setTodos(existing as Todo[]);
      setLoading(false);
      return;
    }

    // Nothing for today yet — look for the most recent previous day
    // that has tasks, and copy them over (fresh, unchecked) exactly once.
    const { data: prevDayRow } = await supabase
      .from("todos")
      .select("task_date")
      .lt("task_date", today)
      .order("task_date", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!prevDayRow) {
      setTodos([]);
      setLoading(false);
      return;
    }

    const { data: prevTodos } = await supabase
      .from("todos")
      .select("*, todo_subtasks(*)")
      .eq("task_date", prevDayRow.task_date)
      .order("created_at", { ascending: true });

    if (!prevTodos || prevTodos.length === 0) {
      setTodos([]);
      setLoading(false);
      return;
    }

    // Insert fresh copies for today, unchecked, preserving subtasks.
    for (const prev of prevTodos as Todo[]) {
      const { data: inserted } = await supabase
        .from("todos")
        .insert({ task_date: today, title: prev.title, completed: false })
        .select()
        .single();

      if (inserted && prev.todo_subtasks?.length) {
        await supabase.from("todo_subtasks").insert(
          prev.todo_subtasks.map((s) => ({ todo_id: inserted.id, title: s.title, completed: false }))
        );
      }
    }

    const { data: freshToday } = await supabase
      .from("todos")
      .select("*, todo_subtasks(*)")
      .eq("task_date", today)
      .order("created_at", { ascending: true });

    setTodos((freshToday as Todo[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { loadTodos(); }, []);

  // ─── Stats & progress ───────────────────────────────────────
  const stats = useMemo(() => {
    const total = todos.length;
    const completed = todos.filter((t) => t.completed).length;
    const pending = total - completed;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, pending, percent };
  }, [todos]);

  // ─── Mutations ──────────────────────────────────────────────
  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    const title = newTaskText.trim();
    if (!title) return;
    const { data, error } = await supabase
      .from("todos")
      .insert({ task_date: today, title, completed: false })
      .select("*, todo_subtasks(*)")
      .single();
    if (!error && data) {
      setTodos((prev) => [...prev, data as Todo]);
      setNewTaskText("");
    }
  };

  const toggleTask = async (todo: Todo) => {
    const nextCompleted = !todo.completed;
    setJustToggled(todo.id);
    setTimeout(() => setJustToggled(null), 300);
    setTodos((prev) => prev.map((t) => (t.id === todo.id ? { ...t, completed: nextCompleted } : t)));
    await supabase.from("todos").update({ completed: nextCompleted }).eq("id", todo.id);
  };

  const toggleSubtask = async (todoId: string, subtask: Subtask) => {
    const nextCompleted = !subtask.completed;
    setTodos((prev) =>
      prev.map((t) =>
        t.id !== todoId
          ? t
          : { ...t, todo_subtasks: t.todo_subtasks.map((s) => (s.id === subtask.id ? { ...s, completed: nextCompleted } : s)) }
      )
    );
    await supabase.from("todo_subtasks").update({ completed: nextCompleted }).eq("id", subtask.id);
  };

  const deleteTask = async (id: string) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
    await supabase.from("todos").delete().eq("id", id);
  };

  const deleteSubtask = async (todoId: string, subtaskId: string) => {
    setTodos((prev) =>
      prev.map((t) => (t.id !== todoId ? t : { ...t, todo_subtasks: t.todo_subtasks.filter((s) => s.id !== subtaskId) }))
    );
    await supabase.from("todo_subtasks").delete().eq("id", subtaskId);
  };

  const addSubtask = async (todoId: string) => {
    const title = (subtaskDrafts[todoId] ?? "").trim();
    if (!title) return;
    const { data, error } = await supabase
      .from("todo_subtasks")
      .insert({ todo_id: todoId, title, completed: false })
      .select()
      .single();
    if (!error && data) {
      setTodos((prev) => prev.map((t) => (t.id === todoId ? { ...t, todo_subtasks: [...t.todo_subtasks, data as Subtask] } : t)));
      setSubtaskDrafts((prev) => ({ ...prev, [todoId]: "" }));
    }
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #FFF6E9 0%, #FDE2E4 28%, #E6F3EA 55%, #E3EAFB 78%, #F5E9FF 100%)",
      fontFamily: "'Quicksand', 'DM Sans', sans-serif",
      padding: "36px 20px 60px",
    }}>
      <style>{`
        @keyframes popCheck { 0% { transform: scale(1); } 40% { transform: scale(1.35); } 100% { transform: scale(1); } }
        .todo-check.pop { animation: popCheck 0.3s ease; }
        @keyframes fillBar { from { width: 0%; } }
        .todo-progress-fill { animation: fillBar 0.6s ease; }
      `}</style>

      <div style={{ maxWidth: 640, margin: "0 auto" }}>

        {/* Progress bar */}
        <div style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#6b5b95" }}>Today's progress</span>
            <span style={{ fontSize: 20, fontWeight: 800, color: "#6b5b95" }}>{stats.percent}%</span>
          </div>
          <div style={{ height: 16, borderRadius: 999, background: "rgba(255,255,255,0.6)", overflow: "hidden", boxShadow: "inset 0 1px 3px rgba(0,0,0,0.08)" }}>
            <div
              className="todo-progress-fill"
              style={{
                height: "100%", borderRadius: 999, width: `${stats.percent}%`,
                background: "linear-gradient(90deg, #FF6B6B, #FFD93D, #4FCE7A, #4D96FF, #B26DF2)",
                transition: "width 0.4s ease",
              }}
            />
          </div>
        </div>

        {/* Date header */}
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <h1 style={{ fontSize: 30, fontWeight: 800, color: "#4a3f6b", margin: 0 }}>
            {fmtHeaderDate(new Date())}
          </h1>
        </div>

        {/* Stat chips */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginBottom: 26, flexWrap: "wrap" }}>
          <Chip label="Total" value={stats.total} bg="#FFF1CC" color="#B8860B" />
          <Chip label="Pending" value={stats.pending} bg="#FFE1E1" color="#D9534F" />
          <Chip label="Completed" value={stats.completed} bg="#DFF6E3" color="#2E9E4E" />
        </div>

        {/* Add task */}
        <form onSubmit={addTask} style={{ display: "flex", gap: 10, marginBottom: 24 }}>
          <input
            value={newTaskText}
            onChange={(e) => setNewTaskText(e.target.value)}
            placeholder="What do you need to do today? ✨"
            style={{
              flex: 1, padding: "13px 18px", borderRadius: 14, border: "2px solid #fff",
              background: "rgba(255,255,255,0.85)", fontSize: 15, fontFamily: "inherit",
              color: "#4a3f6b", outline: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}
          />
          <button type="submit" style={{
            padding: "13px 22px", borderRadius: 14, border: "none", cursor: "pointer",
            background: "linear-gradient(135deg, #FF8FA3, #FFB84D)", color: "#fff",
            fontWeight: 800, fontSize: 14.5, boxShadow: "0 4px 10px rgba(255,140,120,0.35)",
          }}>
            + Add
          </button>
        </form>

        {/* Task list */}
        {loading ? (
          <div style={{ textAlign: "center", color: "#8a7fae", padding: 40, fontWeight: 600 }}>Loading your day…</div>
        ) : todos.length === 0 ? (
          <div style={{ textAlign: "center", color: "#8a7fae", padding: 40, fontWeight: 600 }}>
            Nothing here yet — add your first task above! 🌤️
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {todos.map((todo, i) => {
              const accent = colorFor(i);
              const isCollapsed = collapsed[todo.id];
              const subDone = todo.todo_subtasks.filter((s) => s.completed).length;
              return (
                <div key={todo.id} style={{
                  background: "rgba(255,255,255,0.9)", borderRadius: 18,
                  borderLeft: `7px solid ${accent}`, padding: "16px 18px",
                  boxShadow: "0 4px 14px rgba(80,60,120,0.08)",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                      onClick={() => toggleTask(todo)}
                      className={`todo-check ${justToggled === todo.id ? "pop" : ""}`}
                      aria-label="Toggle task"
                      style={{
                        width: 28, height: 28, borderRadius: "50%", flexShrink: 0, cursor: "pointer",
                        border: `2.5px solid ${accent}`,
                        background: todo.completed ? accent : "transparent",
                        display: "flex", alignItems: "center", justifyContent: "center",
                      }}
                    >
                      {todo.completed && (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 16, fontWeight: 700, color: todo.completed ? "#b6aed6" : "#4a3f6b",
                        textDecoration: todo.completed ? "line-through" : "none",
                      }}>
                        {todo.title}
                      </div>
                      {todo.todo_subtasks.length > 0 && (
                        <div style={{ fontSize: 11.5, color: "#a89bce", fontWeight: 600, marginTop: 2 }}>
                          {subDone}/{todo.todo_subtasks.length} subtasks done
                        </div>
                      )}
                    </div>

                    {todo.todo_subtasks.length > 0 && (
                      <button
                        onClick={() => setCollapsed((p) => ({ ...p, [todo.id]: !p[todo.id] }))}
                        style={{ background: "none", border: "none", cursor: "pointer", color: "#b6aed6", padding: 4 }}
                        aria-label="Toggle subtasks"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                          style={{ transform: isCollapsed ? "rotate(-90deg)" : "rotate(0deg)", transition: "transform 0.15s" }}>
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                    )}

                    <button
                      onClick={() => deleteTask(todo.id)}
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#d9c9f2", fontSize: 18, padding: 4, lineHeight: 1 }}
                      aria-label="Delete task"
                    >
                      ×
                    </button>
                  </div>

                  {/* Subtasks */}
                  {!isCollapsed && (
                    <div style={{ marginTop: 12, marginLeft: 40, display: "flex", flexDirection: "column", gap: 8 }}>
                      {todo.todo_subtasks.map((s) => (
                        <div key={s.id} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <button
                            onClick={() => toggleSubtask(todo.id, s)}
                            aria-label="Toggle subtask"
                            style={{
                              width: 19, height: 19, borderRadius: 6, flexShrink: 0, cursor: "pointer",
                              border: `2px solid ${accent}`, background: s.completed ? accent : "transparent",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            {s.completed && (
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            )}
                          </button>
                          <span style={{
                            flex: 1, fontSize: 13.5, color: s.completed ? "#c3b9e0" : "#5f5480",
                            textDecoration: s.completed ? "line-through" : "none",
                          }}>
                            {s.title}
                          </span>
                          <button onClick={() => deleteSubtask(todo.id, s.id)}
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#e0d4f7", fontSize: 15 }}>
                            ×
                          </button>
                        </div>
                      ))}

                      {/* Add subtask */}
                      {openSubtaskFor === todo.id ? (
                        <form
                          onSubmit={(e) => { e.preventDefault(); addSubtask(todo.id); }}
                          style={{ display: "flex", gap: 8, marginTop: 2 }}
                        >
                          <input
                            autoFocus
                            value={subtaskDrafts[todo.id] ?? ""}
                            onChange={(e) => setSubtaskDrafts((p) => ({ ...p, [todo.id]: e.target.value }))}
                            onBlur={() => { if (!subtaskDrafts[todo.id]) setOpenSubtaskFor(null); }}
                            placeholder="Add a subtask…"
                            style={{
                              flex: 1, padding: "7px 12px", borderRadius: 8, border: `1.5px solid ${accent}55`,
                              fontSize: 13, fontFamily: "inherit", outline: "none", color: "#4a3f6b",
                            }}
                          />
                          <button type="submit" style={{
                            padding: "7px 12px", borderRadius: 8, border: "none", cursor: "pointer",
                            background: accent, color: "#fff", fontWeight: 700, fontSize: 12.5,
                          }}>
                            Add
                          </button>
                        </form>
                      ) : (
                        <button
                          onClick={() => setOpenSubtaskFor(todo.id)}
                          style={{
                            alignSelf: "flex-start", background: "none", border: "none", cursor: "pointer",
                            color: accent, fontWeight: 700, fontSize: 12.5, padding: "4px 0",
                          }}
                        >
                          + Add subtask
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Small stat chip ────────────────────────────────────────────
const Chip: React.FC<{ label: string; value: number; bg: string; color: string }> = ({ label, value, bg, color }) => (
  <div style={{
    background: bg, color, borderRadius: 999, padding: "9px 18px",
    display: "flex", alignItems: "center", gap: 8, fontWeight: 700, fontSize: 13.5,
  }}>
    <span style={{ fontSize: 18, fontWeight: 800 }}>{value}</span>
    <span>{label}</span>
  </div>
);

export default TodoListPage;
