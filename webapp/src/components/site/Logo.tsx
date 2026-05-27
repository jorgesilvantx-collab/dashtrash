import { cn } from "@/lib/utils";

/**
 * DashTrash brand mark.
 *
 * Friendly, trustworthy monogram: a confident geometric "D" shaped like a
 * trash-bin silhouette, with a single dash swoosh cutting across the curve.
 * Two-tone — cyan + ink — no overlapping strokes, reads cleanly at 24px.
 */

type LogoProps = {
  className?: string;
  size?: number;
  /** When true, mark is rendered light-on-dark (cyan + cream). When false (default), ink + cyan on transparent. */
  onDark?: boolean;
};

function Mark({ onDark = false }: { onDark?: boolean }) {
  const stroke = onDark ? "#FAFAF7" : "#0F1722";
  const accent = "#5EE3E3";
  return (
    <>
      {/* Bin body shaped like a D — slight inward taper toward the base */}
      <path
        d="M22 18 H44 C58 18 66 27 66 40 C66 53 58 62 44 62 H22 Z"
        fill={accent}
        stroke={stroke}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      {/* Lid bar across the top — bin handle / lid */}
      <rect x="14" y="12" width="50" height="6" rx="3" fill={stroke} />
      {/* Lid knob */}
      <rect x="35" y="6" width="10" height="6" rx="2" fill={stroke} />
      {/* Dash swoosh — single confident motion line across the D belly */}
      <path
        d="M28 40 H56"
        stroke={stroke}
        strokeWidth="5"
        strokeLinecap="round"
      />
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
      aria-label="DashTrash"
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
      aria-label="DashTrash"
      role="img"
    >
      <rect x="0" y="0" width="80" height="80" rx="18" fill="#0F1722" />
      <rect x="0.5" y="0.5" width="79" height="79" rx="17.5" stroke="#5EE3E3" strokeOpacity="0.25" />
      <Mark onDark />
    </svg>
  );
}

/**
 * LogoMark — kept as an alias of LogoTile so old call sites (Hero.tsx) still
 * work, but rendering is the new clean monogram on a dark tile (no raster).
 */
export function LogoMark({
  className,
  size = 120,
}: {
  className?: string;
  size?: number;
  /** Legacy prop — preserved so existing callers don't break. */
  darkSurface?: boolean;
}) {
  return <LogoTile className={className} size={size} />;
}

// Pass className to override color — e.g. "text-white [&>span]:text-primary" on dark bg.
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display font-extrabold tracking-tight text-ink", className)}>
      DashTrash<span className="text-primary">TX</span>
    </span>
  );
}
