import { cn } from "@/lib/utils";

/**
 * DashTrashTX D-monogram: bold capital D outline with three diagonal "dash" stripes
 * cutting through the interior. Uber-style: rugged, minimal, high-contrast.
 */
export function Logo({ className, size = 40, dark = false }: { className?: string; size?: number; dark?: boolean }) {
  const stroke = dark ? "#5EE3E3" : "#5EE3E3";
  const dashFill = dark ? "#FFFFFF" : "#0F1722";
  const dashOutline = "#5EE3E3";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="DashTrashTX"
      role="img"
    >
      {/* Bold D outline */}
      <path
        d="M10 8 H32 C46.3594 8 58 19.6406 58 34 C58 48.3594 46.3594 60 32 60 H10 V8 Z M19 17 V51 H32 C41.3888 51 49 43.3888 49 34 C49 24.6112 41.3888 17 32 17 H19 Z"
        fill={stroke}
        stroke={stroke}
        strokeWidth="0.5"
        strokeLinejoin="round"
      />

      {/* Three diagonal dash stripes cutting through the D */}
      <g transform="rotate(-22 32 34)">
        <rect x="6" y="20" width="38" height="5" rx="1" fill={dashFill} stroke={dashOutline} strokeWidth="1.5" />
        <rect x="6" y="31" width="38" height="5" rx="1" fill={dashFill} stroke={dashOutline} strokeWidth="1.5" />
        <rect x="6" y="42" width="38" height="5" rx="1" fill={dashFill} stroke={dashOutline} strokeWidth="1.5" />
      </g>
    </svg>
  );
}

/**
 * Square tile version — for favicon-like contexts (Navbar/PortalShell).
 * Dark rounded background with the D-monogram in cyan.
 */
export function LogoTile({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="DashTrashTX"
      role="img"
    >
      <rect x="0" y="0" width="64" height="64" rx="14" fill="#0F1722" />
      <rect x="0.5" y="0.5" width="63" height="63" rx="13.5" stroke="#5EE3E3" strokeOpacity="0.2" />

      {/* Inner D — scaled down */}
      <g transform="translate(8 8) scale(0.75)">
        <path
          d="M10 8 H32 C46.3594 8 58 19.6406 58 34 C58 48.3594 46.3594 60 32 60 H10 V8 Z M19 17 V51 H32 C41.3888 51 49 43.3888 49 34 C49 24.6112 41.3888 17 32 17 H19 Z"
          fill="#5EE3E3"
        />
        <g transform="rotate(-22 32 34)">
          <rect x="6" y="20" width="38" height="5" rx="1" fill="#FFFFFF" stroke="#5EE3E3" strokeWidth="1.2" />
          <rect x="6" y="31" width="38" height="5" rx="1" fill="#FFFFFF" stroke="#5EE3E3" strokeWidth="1.2" />
          <rect x="6" y="42" width="38" height="5" rx="1" fill="#FFFFFF" stroke="#5EE3E3" strokeWidth="1.2" />
        </g>
      </g>
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn("font-display font-extrabold tracking-tight text-ink", className)}>
      DashTrash<span className="text-primary">TX</span>
    </span>
  );
}
