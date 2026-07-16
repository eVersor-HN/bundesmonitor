// Schlanke, strichbasierte Icons (currentColor). Neutral, keine Hoheitszeichen.

type IconProps = { className?: string; size?: number };

function base(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

export function IconPulse({ className, size = 22 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 12h4l2 6 4-14 2 8h6" />
    </svg>
  );
}

export function IconActivity({ className, size = 22 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <path d="M7 20h10M12 18v2" />
      <path d="M7 12l2.5-3 2 2 2-4 1.5 2H17" />
    </svg>
  );
}

export function IconInfo({ className, size = 22 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </svg>
  );
}

export function IconGear({ className, size = 22 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1A1.6 1.6 0 0 0 6.8 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1A1.6 1.6 0 0 0 4.9 6.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9.4a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9.4a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1z" />
    </svg>
  );
}

export function IconSun({ className, size = 20 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

export function IconMoon({ className, size = 20 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

export function IconMonitor({ className, size = 20 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="3" y="4" width="18" height="12" rx="2" />
      <path d="M8 20h8M12 16v4" />
    </svg>
  );
}

export function IconExternal({ className, size = 14 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
    </svg>
  );
}

export function IconDoc({ className, size = 16 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
      <path d="M14 3v5h5M9 13h6M9 17h6" />
    </svg>
  );
}

export function IconChart({ className, size = 22 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 3v18h18" />
      <rect x="7" y="11" width="3" height="6" rx="0.5" />
      <rect x="12.5" y="7" width="3" height="10" rx="0.5" />
      <rect x="18" y="13" width="3" height="4" rx="0.5" />
    </svg>
  );
}

export function IconBallot({ className, size = 22 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="4" y="3" width="16" height="14" rx="2" />
      <path d="M8 8l2 2 3.5-3.5" />
      <path d="M8 13h8M2 21h20" />
    </svg>
  );
}

export function IconTag({ className, size = 22 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 11l8-8 10 10-8 8z" />
      <circle cx="8" cy="8" r="1.4" />
    </svg>
  );
}

export function IconCalendar({ className, size = 22 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="3" y="4.5" width="18" height="16" rx="2" />
      <path d="M3 9h18M8 2.5v4M16 2.5v4" />
      <path d="M7 13h3v3H7z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconMap({ className, size = 22 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M9 4L3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4z" />
      <path d="M9 4v13M15 6.5v13" />
    </svg>
  );
}

export function IconUsers({ className, size = 22 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20a5.5 5.5 0 0 1 11 0" />
      <path d="M16 5.2a3.2 3.2 0 0 1 0 6M17 20a5.5 5.5 0 0 0-3-4.9" />
    </svg>
  );
}

export function IconArrowLeft({ className, size = 20 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M15 19l-7-7 7-7M8 12h12" />
    </svg>
  );
}

export function IconBell({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.7 21a2 2 0 0 1-3.4 0" />
    </svg>
  );
}

export function IconChevron({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function IconStar({ className, size = 14, filled = false }: IconProps & { filled?: boolean }) {
  return (
    <svg {...base(size, className)} fill={filled ? "currentColor" : "none"}>
      <path d="M12 3l2.6 5.3 5.8.8-4.2 4.1 1 5.8L12 16.9 6.8 19l1-5.8L3.6 9l5.8-.8z" />
    </svg>
  );
}

export function IconSearch({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function IconStats({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M5 20V10M12 20V4M19 20v-7" />
    </svg>
  );
}

export function IconMegaphone({ className, size = 18 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M3 11v3a1 1 0 0 0 1 1h2l3.5 4a1 1 0 0 0 1.8-.6V6.6a1 1 0 0 0-1.8-.6L6 10H4a1 1 0 0 0-1 1z" />
      <path d="M15 9.3a4 4 0 0 1 0 6.4M18 7a8 8 0 0 1 0 11" />
    </svg>
  );
}

export function IconSpeaker({ className, size = 14 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M11 5 6 9H3v6h3l5 4z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 6a9 9 0 0 1 0 12" />
    </svg>
  );
}

export function IconGrid({ className, size = 22 }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="4" y="4" width="6" height="6" rx="1.4" />
      <rect x="14" y="4" width="6" height="6" rx="1.4" />
      <rect x="4" y="14" width="6" height="6" rx="1.4" />
      <rect x="14" y="14" width="6" height="6" rx="1.4" />
    </svg>
  );
}
