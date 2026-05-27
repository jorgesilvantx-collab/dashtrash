import { cn } from "@/lib/utils";

/**
 * DashTrashTX brand mark.
 *
 * Stacked monogram: a refined "DT" lock-up where the D is shaped like a
 * trash bin (lid, body, dash-handle), and the T anchors the wordmark mention.
 * Two-tone — ink + cyan — with a confident dash-slash that gives the brand
 * its motion. Reads cleanly from 20px (favicon) to 240px (hero).
 */

type LogoProps = {
  className?: string;
  size?: number;
};

function Mark({ onDark = false }: { onDark?: boolean }) {
  const ink = onDark ? "#FAFAF7" : "#0F1722";
  const cyan = "#5EE3E3";
  const coral = "#FF7F65";
  return (
    <>
      {/* Lid bar at top */}
      <rect x="14" y="10" width="52" height="7" rx="3.5" fill={ink} />
      {/* Lid knob */}
      <rect x="34" y="3" width="12" height="7" rx="2" fill={ink} />

      {/* Bin body — softer rounded "D" with subtle taper */}
      <path
        d="M16 19 H44 C58.6 19 68 28.5 68 41 C68 53.5 58.6 63 44 63 H16 Z"
        fill={cyan}
        stroke={ink}
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Triple dash — confident motion / brand identity */}
      <rect x="22" y="30" width="32" height="4" rx="2" fill={ink} />
      <rect x="22" y="40" width="38" height="4" rx="2" fill={ink} />
      <rect x="22" y="50" width="26" height="4" rx="2" fill={ink} />

      {/* Coral accent dot — the "TX" star */}
      <circle cx="60" cy="52" r="3.5" fill={coral} stroke={ink} strokeWidth="1.5" />
    </>
  );
}

/** Default mark — ink + cyan on light surfaces. */
export function Logo({ className, size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="DashTrashTX"
      role="img"
    >
      <Mark onDark={false} />
    </svg>
  );
}

/** Dark rounded tile — used in navbar / brand chips. */
export function LogoTile({ className, size = 40 }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="DashTrashTX"
      role="img"
    >
      <defs>
        <linearGradient id="logoTileBg" x1="0" y1="0" x2="0" y2="80" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#162033" />
          <stop offset="1" stopColor="#0B121C" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width="80" height="80" rx="18" fill="url(#logoTileBg)" />
      <rect x="0.5" y="0.5" width="79" height="79" rx="17.5" stroke="#5EE3E3" strokeOpacity="0.25" />
      <Mark onDark />
    </svg>
  );
}

/**
 * LogoMark — Big display mark for hero sections. A larger D-bin lock-up with
 * generous breathing room and a soft glow. Looks at home above headlines.
 */
export function LogoMark({
  className,
  size = 120,
}: {
  className?: string;
  size?: number;
  darkSurface?: boolean;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="DashTrashTX"
      role="img"
    >
      <defs>
        <radialGradient id="logoMarkGlow" cx="50%" cy="55%" r="55%">
          <stop offset="0%" stopColor="#5EE3E3" stopOpacity="0.4" />
          <stop offset="60%" stopColor="#5EE3E3" stopOpacity="0.08" />
          <stop offset="100%" stopColor="#5EE3E3" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="logoMarkTile" x1="0" y1="0" x2="0" y2="120" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#162033" />
          <stop offset="1" stopColor="#0B121C" />
        </linearGradient>
      </defs>
      <circle cx="60" cy="60" r="58" fill="url(#logoMarkGlow)" />
      <rect x="10" y="10" width="100" height="100" rx="26" fill="url(#logoMarkTile)" />
      <rect x="10.5" y="10.5" width="99" height="99" rx="25.5" stroke="#5EE3E3" strokeOpacity="0.3" />
      <g transform="translate(20 20) scale(1.0)">
        <Mark onDark />
      </g>
    </svg>
  );
}

/** Wordmark — typographic logo. Pass className to override color. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display font-black tracking-tight text-ink", className)}>
      DashTrash<span className="text-primary">TX</span>
    </span>
  );
}
