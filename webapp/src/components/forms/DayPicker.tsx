import { cn } from "@/lib/utils";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const FULL = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday", Thu: "Thursday", Fri: "Friday", Sat: "Saturday", Sun: "Sunday",
} as const;
type Day = typeof DAYS[number];

type Props = {
  value: string[];
  onChange: (next: string[]) => void;
  accent?: "primary" | "coral";
};

export function DayPicker({ value, onChange, accent = "primary" }: Props) {
  function toggle(d: Day) {
    const full = FULL[d];
    if (value.includes(full)) onChange(value.filter((v) => v !== full));
    else onChange([...value, full]);
  }
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {DAYS.map((d) => {
        const full = FULL[d];
        const selected = value.includes(full);
        const ring = accent === "coral" ? "ring-[#FF7F65] bg-[#FF7F65]/10 text-ink" : "ring-primary bg-primary/15 text-ink";
        return (
          <button
            type="button"
            key={d}
            onClick={() => toggle(d)}
            aria-pressed={selected}
            className={cn(
              "h-11 rounded-xl border border-border bg-white text-sm font-semibold transition",
              "hover:bg-secondary",
              selected && `ring-2 ring-offset-0 ${ring} border-transparent`
            )}
          >
            {d}
          </button>
        );
      })}
    </div>
  );
}
