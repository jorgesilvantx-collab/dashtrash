import { cn } from "@/lib/utils";

/**
 * Inline SVG D-monogram matching the DashTrashTX brand mark:
 * outlined italic-leaning D with double cyan border and stylized dash strokes inside.
 */
export function Logo({ className, size = 40 }: { className?: string; size?: number; dark?: boolean }) {
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
      {/* D outer outline (italic-leaning, double border) */}
      <path
        d="M16 10 H46 C60 10 70 21 70 36 C70 51 60 64 46 64 H16 L24 10 Z"
        stroke="#5EE3E3"
        strokeWidth="4"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M22 16 H45 C56.6 16 64 25.4 64 36 C64 47 56.6 58 45 58 H22 L28 16 Z"
        stroke="#FFFFFF"
        strokeWidth="2"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Three diagonal dashes through the D belly */}
      <g transform="rotate(-18 40 38)">
        <rect x="20" y="22" width="34" height="4" rx="1" fill="#5EE3E3" />
        <rect x="20" y="34" width="34" height="4" rx="1" fill="#5EE3E3" />
        <rect x="20" y="46" width="34" height="4" rx="1" fill="#5EE3E3" />
      </g>
    </svg>
  );
}

/** Square dark tile — Navbar/PortalShell brand icon. */
export function LogoTile({ className, size = 40 }: { className?: string; size?: number }) {
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
      <rect x="0" y="0" width="80" height="80" rx="18" fill="#0F1722" />
      <rect x="0.5" y="0.5" width="79" height="79" rx="17.5" stroke="#5EE3E3" strokeOpacity="0.25" />
      <g transform="translate(4 4) scale(0.9)">
        <path
          d="M16 10 H46 C60 10 70 21 70 36 C70 51 60 64 46 64 H16 L24 10 Z"
          stroke="#5EE3E3"
          strokeWidth="4"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M22 16 H45 C56.6 16 64 25.4 64 36 C64 47 56.6 58 45 58 H22 L28 16 Z"
          stroke="#FFFFFF"
          strokeWidth="2"
          strokeLinejoin="round"
          fill="none"
        />
        <g transform="rotate(-18 40 38)">
          <rect x="20" y="22" width="34" height="4" rx="1" fill="#5EE3E3" />
          <rect x="20" y="34" width="34" height="4" rx="1" fill="#5EE3E3" />
          <rect x="20" y="46" width="34" height="4" rx="1" fill="#5EE3E3" />
        </g>
      </g>
    </svg>
  );
}

/**
 * Photographic logo — the user's actual raster mark on a dark background.
 * Uses mix-blend-mode: lighten so the black bg disappears over light surfaces.
 * Pass `darkSurface` when the surrounding bg is already dark to skip the blend.
 */
export function LogoMark({
  className,
  size = 120,
  darkSurface = false,
}: {
  className?: string;
  size?: number;
  darkSurface?: boolean;
}) {
  return (
    <img
      src="/logo-dashtrash.jpg"
      alt="DashTrashTX"
      width={size}
      height={Math.round(size * 0.78)}
      style={{ width: size, height: "auto", mixBlendMode: darkSurface ? "normal" : "lighten" }}
      className={cn("select-none pointer-events-none", className)}
      loading="eager"
      decoding="async"
    />
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display font-extrabold tracking-tight text-ink", className)}>
      DashTrash<span className="text-primary">TX</span>
    </span>
  );
}
