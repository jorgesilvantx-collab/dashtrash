import { cn } from "@/lib/utils";

type BinColor = "cyan" | "coral" | "ink";

const PALETTE: Record<BinColor, { body: string; stroke: string; lid: string }> = {
  cyan: { body: "#5EE3E3", stroke: "#0F1722", lid: "#0F1722" },
  coral: { body: "#FF7F65", stroke: "#0F1722", lid: "#0F1722" },
  ink: { body: "#0F1722", stroke: "#0F1722", lid: "#5EE3E3" },
};

export function Bin({ color = "cyan", className, animate = true }: { color?: BinColor; className?: string; animate?: boolean }) {
  const p = PALETTE[color];
  return (
    <svg viewBox="0 0 64 88" className={cn("block", className)} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* Lid */}
      <g className={animate ? "animate-lid-flap" : ""}>
        <rect x="4" y="8" width="56" height="8" rx="2" fill={p.lid} />
        <rect x="26" y="2" width="12" height="6" rx="2" fill={p.lid} />
      </g>
      {/* Body */}
      <path d="M8 16 L56 16 L52 78 L12 78 Z" fill={p.body} stroke={p.stroke} strokeWidth="2" strokeLinejoin="round" />
      {/* Ribs */}
      <line x1="14" y1="30" x2="50" y2="30" stroke={p.stroke} strokeOpacity="0.25" strokeWidth="1.5" />
      <line x1="13" y1="46" x2="51" y2="46" stroke={p.stroke} strokeOpacity="0.25" strokeWidth="1.5" />
      <line x1="13" y1="62" x2="51" y2="62" stroke={p.stroke} strokeOpacity="0.25" strokeWidth="1.5" />
      {/* Wheels */}
      <circle cx="16" cy="82" r="5" fill={p.stroke} className={animate ? "animate-wheel-spin" : ""} />
      <circle cx="16" cy="82" r="1.6" fill={p.body} />
      <circle cx="48" cy="82" r="5" fill={p.stroke} className={animate ? "animate-wheel-spin" : ""} />
      <circle cx="48" cy="82" r="1.6" fill={p.body} />
    </svg>
  );
}

export function RollingBinsStrip({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <div className="relative h-24">
        <div className="absolute bottom-0 inset-x-0 h-px bg-foreground/20" />
        <div className="absolute bottom-px left-0 right-0 h-24">
          <div className="absolute bottom-1 left-0 w-12 animate-bin-roll" style={{ animationDuration: "11s" }}>
            <Bin color="cyan" className="h-20 w-auto" />
          </div>
          <div className="absolute bottom-1 left-0 w-12 animate-bin-roll" style={{ animationDuration: "13s", animationDelay: "-3s" }}>
            <Bin color="coral" className="h-20 w-auto" />
          </div>
          <div className="absolute bottom-1 left-0 w-12 animate-bin-roll" style={{ animationDuration: "10s", animationDelay: "-7s" }}>
            <Bin color="ink" className="h-20 w-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function BinTrio({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-end gap-3", className)}>
      <div className="animate-bin-bob" style={{ animationDelay: "0s" }}>
        <Bin color="cyan" className="h-16 w-auto" animate={false} />
      </div>
      <div className="animate-bin-bob" style={{ animationDelay: "-1s" }}>
        <Bin color="coral" className="h-20 w-auto" animate={false} />
      </div>
      <div className="animate-bin-bob" style={{ animationDelay: "-2s" }}>
        <Bin color="ink" className="h-16 w-auto" animate={false} />
      </div>
    </div>
  );
}
