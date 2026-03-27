import { useState } from "react";

const MOOD_COLORS = [
  "hsl(var(--mood-1))",
  "hsl(var(--mood-2))",
  "hsl(var(--mood-3))",
  "hsl(var(--mood-4))",
  "hsl(var(--mood-5))",
];

const DUMMY_ENTRIES = [
  { date: "Mon 24 Mar", mood: 4, note: "Good day at school, no meltdowns", win: "Ate dinner without fuss" },
  { date: "Tue 25 Mar", mood: 2, note: "Difficult morning routine", win: "Said sorry unprompted" },
  { date: "Wed 26 Mar", mood: 5, note: "Calm and happy all day", win: "Helped tidy up toys" },
];

type Entry = { date: string; mood: number; note: string; win: string };

function LogScreen({ onViewWeek }: { onViewWeek: () => void }) {
  const [mood, setMood] = useState<number | null>(null);
  const [note, setNote] = useState("");
  const [win, setWin] = useState("");
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    if (mood === null) return;
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setMood(null);
      setNote("");
      setWin("");
    }, 1500);
  };

  return (
    <div className="flex flex-col gap-6">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-primary">Family Mood Log</h1>
        <p className="text-muted-foreground mt-1">How was today?</p>
      </header>

      <div>
        <label className="text-sm font-medium text-foreground mb-2 block">Today's mood</label>
        <div className="flex justify-center gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onClick={() => setMood(n)}
              className="w-12 h-12 rounded-full text-sm font-bold transition-all duration-200"
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
        disabled={mood === null}
        className="w-full rounded-lg bg-primary text-primary-foreground py-3 text-sm font-semibold transition-colors hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {saved ? "✓ Saved!" : "Save today's entry"}
      </button>

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
  const entries = DUMMY_ENTRIES;

  return (
    <div className="flex flex-col gap-5">
      <header className="text-center">
        <h1 className="text-2xl font-bold text-primary">This Week</h1>
      </header>

      {entries.length === 0 ? (
        <p className="text-center text-muted-foreground text-sm py-8">
          No entries yet. Start logging today.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {entries.map((entry, i) => (
            <EntryCard key={i} entry={entry} />
          ))}
        </div>
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
