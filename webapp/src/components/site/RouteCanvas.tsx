import { cn } from "@/lib/utils";

/**
 * Animated SVG "route map" used in the hero in place of a photo.
 * Dark canvas, neighborhood grid streets, glowing service route with flowing
 * dashes, and pulsing pickup stops. No external image dependency.
 */
export function RouteCanvas({ className }: { className?: string }) {
  return (
    <div className={cn("relative overflow-hidden rounded-[32px] bg-ink", className)}>
      {/* Soft cyan + coral glows */}
      <div className="absolute -top-20 -right-20 h-72 w-72 rounded-full bg-primary/30 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-[#FF7F65]/20 blur-[110px] pointer-events-none" />

      <svg
        viewBox="0 0 600 700"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden
      >
        <defs>
          {/* Grid pattern — "neighborhood streets" */}
          <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
            <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#5EE3E3" strokeOpacity="0.08" strokeWidth="1" />
          </pattern>

          {/* Cyan glow filter */}
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>

          {/* Linear gradient for the route */}
          <linearGradient id="route" x1="0" y1="0" x2="600" y2="700" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#5EE3E3" />
            <stop offset="60%" stopColor="#5EE3E3" />
            <stop offset="100%" stopColor="#FF7F65" />
          </linearGradient>
        </defs>

        {/* Street grid */}
        <rect width="600" height="700" fill="url(#grid)" />

        {/* Heavier "main road" lines */}
        <line x1="0" y1="180" x2="600" y2="180" stroke="#5EE3E3" strokeOpacity="0.12" strokeWidth="1.5" />
        <line x1="0" y1="420" x2="600" y2="420" stroke="#5EE3E3" strokeOpacity="0.12" strokeWidth="1.5" />
        <line x1="240" y1="0" x2="240" y2="700" stroke="#5EE3E3" strokeOpacity="0.12" strokeWidth="1.5" />
        <line x1="432" y1="0" x2="432" y2="700" stroke="#5EE3E3" strokeOpacity="0.12" strokeWidth="1.5" />

        {/* Route path — winds across the canvas hitting stops */}
        <path
          d="M 60 600 L 60 480 L 192 480 L 192 336 L 336 336 L 336 240 L 480 240 L 480 96 L 540 96"
          fill="none"
          stroke="url(#route)"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.4"
        />
        {/* Animated flowing dashes on top of route */}
        <path
          d="M 60 600 L 60 480 L 192 480 L 192 336 L 336 336 L 336 240 L 480 240 L 480 96 L 540 96"
          fill="none"
          stroke="#5EE3E3"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="14 10"
          className="animate-dash"
          filter="url(#glow)"
        />

        {/* Stop pins along the route */}
        <Stop cx={60} cy={600} delay="0s" />
        <Stop cx={192} cy={480} delay="0.4s" />
        <Stop cx={336} cy={336} delay="0.8s" />
        <Stop cx={480} cy={240} delay="1.2s" />
        <Stop cx={540} cy={96} delay="1.6s" finished />
      </svg>

      {/* HUD-style top overlay */}
      <div className="absolute top-5 left-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/10 backdrop-blur-md border border-background/15">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary" />
        </span>
        <span className="text-xs font-mono-eyebrow text-background">Route #DFW-04 · live</span>
      </div>

      <div className="absolute top-5 right-5 text-right">
        <div className="font-mono-eyebrow text-primary leading-none mb-1">Tonight</div>
        <div className="font-display font-extrabold text-background text-2xl leading-none">142 homes</div>
      </div>

      {/* Bottom HUD card */}
      <div className="absolute bottom-5 left-5 right-5 p-4 rounded-2xl bg-background/10 backdrop-blur-xl border border-background/15">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Next stop" value="0.3 mi" />
          <Stat label="ETA" value="3:14 AM" />
          <Stat label="Completed" value="89 / 142" />
        </div>
      </div>
    </div>
  );
}

function Stop({ cx, cy, delay, finished }: { cx: number; cy: number; delay: string; finished?: boolean }) {
  const color = finished ? "#FF7F65" : "#5EE3E3";
  return (
    <g style={{ animationDelay: delay }}>
      <circle cx={cx} cy={cy} r="12" fill={color} fillOpacity="0.15" />
      <circle cx={cx} cy={cy} r="6" fill={color} className="animate-pulse-stop" style={{ animationDelay: delay, transformOrigin: `${cx}px ${cy}px` }} />
      <circle cx={cx} cy={cy} r="2.5" fill="#FAFAF7" />
    </g>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-mono-eyebrow text-background/80 mb-1">{label}</div>
      <div className="font-display font-bold text-background text-sm">{value}</div>
    </div>
  );
}
