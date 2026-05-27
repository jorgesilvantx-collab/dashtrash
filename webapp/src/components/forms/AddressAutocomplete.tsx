import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export type AddressPick = {
  street: string;
  city: string;
  state: string;
  zip: string;
  lat: number;
  lng: number;
  label: string;
};

type Suggestion = {
  id: string;
  label: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat: number;
  lng: number;
};

type Props = {
  value: string;
  onChange: (s: string) => void;
  onPick: (pick: AddressPick) => void;
  placeholder?: string;
  className?: string;
  id?: string;
};

export function AddressAutocomplete({ value, onChange, onPick, placeholder, className, id }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [activeIdx, setActiveIdx] = useState(-1);
  const boxRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<number | null>(null);

  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    if (!value || value.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = window.setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(value)}`);
        if (!res.ok) throw new Error("geocode failed");
        const json = (await res.json()) as { data: { suggestions: Suggestion[] } };
        setSuggestions(json.data.suggestions ?? []);
        setOpen((json.data.suggestions ?? []).length > 0);
      } catch {
        setSuggestions([]);
      } finally {
        setLoading(false);
      }
    }, 220);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [value]);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  function pick(s: Suggestion) {
    onPick({
      street: s.street ?? s.label.split(",")[0] ?? "",
      city: s.city ?? "",
      state: s.state ?? "TX",
      zip: s.zip ?? "",
      lat: s.lat,
      lng: s.lng,
      label: s.label,
    });
    onChange(s.street ?? s.label.split(",")[0] ?? "");
    setOpen(false);
    setActiveIdx(-1);
  }

  function onKey(e: React.KeyboardEvent) {
    if (!open || !suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && activeIdx >= 0) {
      e.preventDefault();
      pick(suggestions[activeIdx]);
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div ref={boxRef} className={cn("relative", className)}>
      <Input
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => suggestions.length > 0 && setOpen(true)}
        onKeyDown={onKey}
        placeholder={placeholder ?? "Start typing your address…"}
        autoComplete="off"
      />
      {loading ? (
        <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground animate-spin" />
      ) : null}
      {open && suggestions.length > 0 ? (
        <div className="absolute z-50 left-0 right-0 mt-1 rounded-xl bg-white border border-border shadow-xl ring-1 ring-black/5 overflow-hidden max-h-72 overflow-y-auto">
          {suggestions.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => pick(s)}
              className={cn(
                "w-full text-left flex items-start gap-2 px-3 py-2.5 text-sm border-b border-border last:border-b-0 transition",
                i === activeIdx ? "bg-secondary" : "bg-white hover:bg-secondary/60"
              )}
            >
              <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
              <span className="text-foreground/90 leading-snug">{s.label}</span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
