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

/** A bin that's tipping over, mid-spill (static pose, used as an extra in BinParade). */
function TippingBin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 90 88" className={cn("block", className)} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      <g transform="rotate(-28 60 70)">
        <rect x="40" y="14" width="56" height="8" rx="2" fill="#0F1722" />
        <path d="M44 22 L92 22 L88 84 L48 84 Z" fill="#FF7F65" stroke="#0F1722" strokeWidth="2" strokeLinejoin="round" />
        <line x1="50" y1="36" x2="86" y2="36" stroke="#0F1722" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="49" y1="52" x2="87" y2="52" stroke="#0F1722" strokeOpacity="0.25" strokeWidth="1.5" />
      </g>
      {/* Spilling crumpled paper / banana peel shapes */}
      <circle cx="14" cy="78" r="4" fill="#0F1722" opacity="0.7" />
      <circle cx="24" cy="82" r="3" fill="#5EE3E3" opacity="0.7" />
      <path d="M6 82 Q10 76 16 80 T28 82" fill="none" stroke="#0F1722" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

/** A tiny "valet" person pushing a bin (static pose). */
function ValetWithBin({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 110 88" className={cn("block", className)} xmlns="http://www.w3.org/2000/svg" aria-hidden>
      {/* Person */}
      <circle cx="20" cy="22" r="8" fill="#0F1722" />
      <path d="M14 32 L26 32 L30 60 L24 60 L22 44 L18 44 L16 60 L10 60 Z" fill="#5EE3E3" stroke="#0F1722" strokeWidth="1.5" strokeLinejoin="round" />
      {/* Arm reaching to bin handle */}
      <path d="M26 38 L46 30" stroke="#0F1722" strokeWidth="3" strokeLinecap="round" />
      {/* Legs */}
      <line x1="14" y1="60" x2="12" y2="78" stroke="#0F1722" strokeWidth="3" strokeLinecap="round" />
      <line x1="24" y1="60" x2="26" y2="78" stroke="#0F1722" strokeWidth="3" strokeLinecap="round" />
      {/* Bin */}
      <g transform="translate(46 4)">
        <rect x="4" y="14" width="50" height="8" rx="2" fill="#0F1722" />
        <path d="M8 22 L52 22 L48 78 L12 78 Z" fill="#5EE3E3" stroke="#0F1722" strokeWidth="2" strokeLinejoin="round" />
        <line x1="14" y1="36" x2="46" y2="36" stroke="#0F1722" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="13" y1="52" x2="47" y2="52" stroke="#0F1722" strokeOpacity="0.25" strokeWidth="1.5" />
        <circle cx="16" cy="82" r="4" fill="#0F1722" className="animate-wheel-spin" />
        <circle cx="44" cy="82" r="4" fill="#0F1722" className="animate-wheel-spin" />
      </g>
    </svg>
  );
}

/**
 * BinParade — 5+ bins of varying sizes scrolling across, including a tipping bin
 * and a valet pushing a bin. Loops continuously.
 */
export function BinParade({ className }: { className?: string }) {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <div className="relative h-28">
        <div className="absolute bottom-0 inset-x-0 h-px bg-foreground/20" />
        <div className="absolute bottom-px left-0 right-0 h-28">
          <div className="absolute bottom-1 left-0 w-14 animate-bin-roll" style={{ animationDuration: "12s" }}>
            <Bin color="cyan" className="h-24 w-auto" />
          </div>
          <div className="absolute bottom-1 left-0 w-12 animate-bin-roll" style={{ animationDuration: "14s", animationDelay: "-3s" }}>
            <Bin color="coral" className="h-20 w-auto" />
          </div>
          <div className="absolute bottom-1 left-0 w-20 animate-bin-roll" style={{ animationDuration: "15s", animationDelay: "-6s" }}>
            <ValetWithBin className="h-24 w-auto" />
          </div>
          <div className="absolute bottom-1 left-0 w-16 animate-bin-roll" style={{ animationDuration: "13s", animationDelay: "-9s" }}>
            <TippingBin className="h-20 w-auto" />
          </div>
          <div className="absolute bottom-1 left-0 w-10 animate-bin-roll" style={{ animationDuration: "11s", animationDelay: "-11s" }}>
            <Bin color="ink" className="h-16 w-auto" />
          </div>
          <div className="absolute bottom-1 left-0 w-12 animate-bin-roll" style={{ animationDuration: "16s", animationDelay: "-14s" }}>
            <Bin color="cyan" className="h-20 w-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * BinHop — single bin hopping along like a pogo stick.
 */
export function BinHop({ className, color = "cyan" }: { className?: string; color?: BinColor }) {
  return (
    <div className={cn("relative w-full overflow-hidden", className)}>
      <div className="relative h-28">
        <div className="absolute bottom-0 inset-x-0 h-px bg-foreground/20" />
        <div className="absolute bottom-px left-0 right-0 h-28">
          <div className="absolute bottom-1 left-0 w-14 animate-bin-hop">
            <Bin color={color} className="h-24 w-auto" />
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * BinPickup — bin being lifted by an arm/grabber, lid flapping, then set back
 * down. 4-second loop.
 */
export function BinPickup({ className, size = 140 }: { className?: string; size?: number }) {
  return (
    <svg
      viewBox="0 0 160 140"
      width={size}
      height={Math.round((size * 140) / 160)}
      className={cn("block", className)}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      {/* Ground */}
      <line x1="0" y1="132" x2="160" y2="132" stroke="currentColor" strokeOpacity="0.2" strokeWidth="1" />

      {/* Grabber arm — drops down, grabs, lifts, releases */}
      <g className="animate-grabber-arm" style={{ transformOrigin: "80px 0px", transformBox: "fill-box" as const }}>
        <line x1="80" y1="0" x2="80" y2="36" stroke="#0F1722" strokeWidth="4" strokeLinecap="round" />
        <path d="M64 36 L80 26 L96 36" fill="none" stroke="#0F1722" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>

      {/* Bin — lifts in sync with the grabber */}
      <g className="animate-bin-lift" style={{ transformOrigin: "80px 100px", transformBox: "fill-box" as const }}>
        {/* Lid flaps when lifted */}
        <g className="animate-lid-flap" style={{ transformOrigin: "104px 52px", transformBox: "fill-box" as const }}>
          <rect x="52" y="48" width="56" height="8" rx="2" fill="#0F1722" />
          <rect x="74" y="42" width="12" height="6" rx="2" fill="#0F1722" />
        </g>
        <path d="M56 56 L104 56 L100 118 L60 118 Z" fill="#5EE3E3" stroke="#0F1722" strokeWidth="2" strokeLinejoin="round" />
        <line x1="62" y1="70" x2="98" y2="70" stroke="#0F1722" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="61" y1="86" x2="99" y2="86" stroke="#0F1722" strokeOpacity="0.25" strokeWidth="1.5" />
        <line x1="61" y1="102" x2="99" y2="102" stroke="#0F1722" strokeOpacity="0.25" strokeWidth="1.5" />
        <circle cx="64" cy="122" r="5" fill="#0F1722" />
        <circle cx="96" cy="122" r="5" fill="#0F1722" />
      </g>
    </svg>
  );
}
