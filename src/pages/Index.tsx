import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const MOOD_COLORS = [
  "hsl(var(--mood-1))",
  "hsl(var(--mood-2))",
  "hsl(var(--mood-3))",
  "hsl(var(--mood-4))",
  "hsl(var(--mood-5))",
];

type Entry = { date: string; mood: number; note: string; win: string };

function LogScreen({ onViewWeek }: { onViewWeek: () => void }) {
  const [mood, setMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [win, setWin] = useState("");
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleSave = async () => {
    if (mood === null) return;
    setStatus("saving");
    const { error } = await supabase.from("mood_logs").insert({
      mood_score: mood,
      behaviour_note: note || null,
      win_text: win || null,
    });
    if (error) {
      setStatus("error");
      setErrorMsg(error.message);
      setTimeout(() => setStatus("idle"), 3000);
    } else {
      setStatus("saved");
      setTimeout(() => {
        setStatus("idle");
        setMood(null);
        setNote("");
        setWin("");
      }, 2000);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center rounded-xl px-4 py-4" style={{ backgroundColor: "hsl(var(--header-bg))", color: "hsl(var(--header-foreground))" }}>
        <h1 className="text-2xl font-bold">🌊 Family Mood Log</h1>
        <p className="mt-1 opacity-80">How was today?</p>
      </header>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Today's mood</label>
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setMood(n)}
              className="w-[48px] h-[48px] rounded-full text-base font-bold transition-all duration-200 flex items-center justify-center"
              style={{
                backgroundColor: mood === n ? MOOD_COLORS[n - 1] : "hsl(var(--muted))",
                color: mood === n ? "white" : "hsl(var(--muted-foreground))",
                transform: mood === n ? "scale(1.15)" : "scale(1)",
                boxShadow: mood === n ? `0 4px 12px ${MOOD_COLORS[n - 1]}44` : "none",
              }}
            >
              {n}
            </button>
          ))}
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1 px-1">
          <span>Tough</span>
          <span>Great</span>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">Behaviour note</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="What happened today? (optional)"
          rows={3}
          className="rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-medium text-foreground">One win</label>
        <input
          value={win}
          onChange={(e) => setWin(e.target.value)}
          placeholder="Something good, however small..."
          className="rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        />
      </div>

      <button
        onClick={handleSave}
        disabled={mood === null || status === "saving"}
        className="w-full rounded-lg bg-primary text-primary-foreground py-3 text-sm font-semibold transition-colors hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {status === "saving" ? "Saving..." : status === "saved" ? "Entry saved ✓" : "Save today's entry"}
      </button>

      {status === "error" && (
        <p className="text-sm text-destructive text-center">{errorMsg}</p>
      )}

      <button
        onClick={onViewWeek}
        className="text-sm text-muted-foreground hover:text-primary transition-colors text-center"
      >
        View this week →
      </button>
    </div>
  );
}

function EntryCard({ entry }: { entry: Entry }) {
  return (
    <div className="bg-card rounded-xl border border-border p-4 flex gap-3 items-start">
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5"
        style={{ backgroundColor: MOOD_COLORS[entry.mood - 1], color: "white" }}
      >
        {entry.mood}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{entry.date}</p>
        {entry.note && <p className="text-sm text-foreground mt-0.5">{entry.note}</p>}
        {entry.win && (
          <p className="text-xs text-primary mt-1.5 flex items-center gap-1">
            <span>🌟</span> {entry.win}
          </p>
        )}
      </div>
    </div>
  );
}

function WeekScreen({ onBack }: { onBack: () => void }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [reflection, setReflection] = useState<string | null>(null);
  const [reflectionLoading, setReflectionLoading] = useState(false);
  const [reflectionError, setReflectionError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data, error } = await supabase
        .from("mood_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(7);

      if (!error && data) {
        setEntries(
          data.map((row) => ({
            date: new Date(row.created_at!).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            }),
            mood: row.mood_score,
            note: row.behaviour_note || "",
            win: row.win_text || "",
          }))
        );
      }
      setLoading(false);
    };
    fetchEntries();
  }, []);

  const handleReflect = async () => {
    setReflectionLoading(true);
    setReflectionError(null);
    setReflection(null);

    try {
      const { data, error } = await supabase
        .from("mood_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(7);

      if (error || !data || data.length === 0) {
        setReflectionError("No entries to reflect on yet. Log a few days first!");
        setReflectionLoading(false);
        return;
      }

      const formatted = data
        .map((row) => {
          const d = new Date(row.created_at!).toLocaleDateString("en-GB", {
            weekday: "short",
            day: "numeric",
            month: "short",
          });
          return `Date: ${d}\nMood score: ${row.mood_score}\nBehaviour note: ${row.behaviour_note || "none logged"}\nWin of the day: ${row.win_text || "none logged"}`;
        })
        .join("\n\n");

      const prompt = `You are a warm, supportive companion for parents navigating a complex time with their child. Here are the last 7 days of family mood log entries:\n\n${formatted}\n\nBased on these entries, write one warm, encouraging paragraph (max 80 words) that notices one pattern and offers one gentle, practical suggestion. Speak directly to the parent. Be human, not clinical. Start with something you genuinely noticed in the data.`;

      const { data: aiData, error: aiError } = await supabase.functions.invoke(
        "chat-anthropic",
        { body: { prompt } }
      );

      if (aiError) throw new Error(aiError.message);
      if (aiData?.error) throw new Error(aiData.error);

      const text = aiData?.content?.find((b: any) => b.type === "text")?.text;
      setReflection(text || "No reflection generated.");
    } catch (e: any) {
      setReflectionError("Something went wrong generating your reflection. Please try again.");
      console.error("Reflection error:", e);
    } finally {
      setReflectionLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <header className="text-center rounded-xl px-4 py-4" style={{ backgroundColor: "hsl(var(--header-bg))", color: "hsl(var(--header-foreground))" }}>
        <h1 className="text-2xl font-bold">🌊 This Week</h1>
      </header>

      {loading ? (
        <div className="flex justify-center py-8">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : entries.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">
          No entries yet. Start logging today.
        </p>
      ) : (
        <>
          <div className="flex flex-col gap-3">
            {entries.map((entry, i) => (
              <EntryCard key={i} entry={entry} />
            ))}
          </div>

          <button
            onClick={handleReflect}
            disabled={reflectionLoading}
            className="w-full rounded-lg bg-primary text-primary-foreground py-3 text-sm font-semibold transition-colors hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {reflectionLoading ? "Finding patterns..." : "✨ Reflect on this week"}
          </button>

          {reflectionError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4">
              <p className="text-sm text-destructive">{reflectionError}</p>
            </div>
          )}

          {reflection && (
            <div className="rounded-xl border border-border p-4" style={{ backgroundColor: "hsl(var(--background))" }}>
              <p className="text-xs font-medium text-primary mb-2">✨ Weekly Reflection</p>
              <p className="text-sm text-foreground leading-relaxed">{reflection}</p>
            </div>
          )}
        </>
      )}

      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-primary transition-colors text-center"
      >
        ← Log today
      </button>
    </div>
  );
}

export default function Index() {
  const [screen, setScreen] = useState<"log" | "week">("log");

  return (
    <div className="min-h-screen bg-background flex justify-center px-4 py-8">
      <div className="w-full max-w-[420px]">
        {screen === "log" ? (
          <LogScreen onViewWeek={() => setScreen("week")} />
        ) : (
          <WeekScreen onBack={() => setScreen("log")} />
        )}
      </div>
    </div>
  );
}
