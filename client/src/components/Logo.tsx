interface LogoProps {
  size?: number;
  withWordmark?: boolean;
  className?: string;
}

/**
 * PanTrack brand mark: a violet neumorphic tile with a stylized
 * coin-on-track glyph. Used in nav, auth, and landing.
 */
export default function Logo({ size = 40, withWordmark = true, className = "" }: LogoProps) {
  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <span
        className="grid place-items-center rounded-[30%] shrink-0"
        style={{
          width: size,
          height: size,
          background: "linear-gradient(140deg, var(--color-brand), var(--color-brand-strong))",
          boxShadow:
            "4px 4px 10px oklch(0.56 0.205 285 / 0.35), -3px -3px 8px var(--neu-light)",
        }}
        aria-hidden="true"
      >
        <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="9" r="5.25" stroke="white" strokeWidth="2" />
          <path d="M12 6.5v5M10 9h4" stroke="white" strokeWidth="2" strokeLinecap="round" />
          <path d="M4 18.5c3 1.6 13 1.6 16 0" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.85" />
        </svg>
      </span>
      {withWordmark && (
        <span className="text-[1.35rem] font-extrabold tracking-tight text-[var(--color-ink)]">
          Pan<span className="text-[var(--color-brand)]">Track</span>
        </span>
      )}
    </div>
  );
}
