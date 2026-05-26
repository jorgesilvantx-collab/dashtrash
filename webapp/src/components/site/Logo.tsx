import { cn } from "@/lib/utils";

export function Logo({ className, size = 40 }: { className?: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("shrink-0", className)}
      aria-label="DashTrashTX"
      role="img"
    >
      <defs>
        <linearGradient id="dtx-bg" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F1722" />
          <stop offset="100%" stopColor="#1B2738" />
        </linearGradient>
        <linearGradient id="dtx-d" x1="14" y1="10" x2="38" y2="40" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5EE3E3" />
          <stop offset="100%" stopColor="#3FB8B8" />
        </linearGradient>
      </defs>

      {/* Rounded tile */}
      <rect x="0" y="0" width="48" height="48" rx="12" fill="url(#dtx-bg)" />

      {/* Subtle inner stroke */}
      <rect x="0.5" y="0.5" width="47" height="47" rx="11.5" stroke="#5EE3E3" strokeOpacity="0.18" />

      {/* Custom D-monogram: thick uppercase D with cyan accent slash */}
      <path
        d="M14 11 H25.5 C32.4036 11 38 16.5964 38 23.5 V24.5 C38 31.4036 32.4036 37 25.5 37 H14 V11 Z"
        fill="url(#dtx-d)"
      />

      {/* Inner cutout */}
      <path
        d="M20.5 17 H25.5 C29.0899 17 32 19.9101 32 23.5 V24.5 C32 28.0899 29.0899 31 25.5 31 H20.5 V17 Z"
        fill="#0F1722"
      />

      {/* Coral accent dot — bin indicator */}
      <circle cx="36" cy="13" r="3" fill="#FF7F65" />
      <circle cx="36" cy="13" r="1.2" fill="#FFE4DA" />
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
