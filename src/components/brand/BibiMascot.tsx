import type { SVGProps } from "react";

type Mood = "happy" | "thinking" | "cheer";

/** Bibi, the friendly tutor mascot (inline SVG: no network request, crisp at any size). */
export function BibiMascot({
  mood = "happy",
  className,
  title = "Bibi, tutor CodeKids",
  ...rest
}: SVGProps<SVGSVGElement> & { mood?: Mood; title?: string }) {
  return (
    <svg viewBox="0 0 200 200" role="img" aria-label={title} className={className} {...rest}>
      <title>{title}</title>
      {/* soft shadow */}
      <ellipse cx="100" cy="188" rx="58" ry="8" fill="#1B2A5C" opacity="0.12" />
      {/* body */}
      <path d="M40 190c0-38 27-62 60-62s60 24 60 62z" fill="#4C6FFF" />
      <path d="M78 132l22 26 22-26" fill="#FFF1E3" />
      <circle cx="100" cy="170" r="6" fill="#FFC83D" />
      {/* headscarf */}
      <path
        d="M100 18c-42 0-66 30-66 66 0 22 8 38 18 50 8-6 20-8 48-8s40 2 48 8c10-12 18-28 18-50 0-36-24-66-66-66z"
        fill="#FF8A2B"
      />
      <path d="M52 60c10-22 28-32 48-32s38 10 48 32c-14-8-30-12-48-12s-34 4-48 12z" fill="#FFB067" />
      {/* face */}
      <ellipse cx="100" cy="88" rx="40" ry="42" fill="#F6C9A0" />
      <path d="M60 78c6-26 22-38 40-38s34 12 40 38c-10-12-24-18-40-18s-30 6-40 18z" fill="#FF8A2B" />
      {/* cheeks */}
      <circle cx="76" cy="100" r="7" fill="#FF8A8A" opacity="0.55" />
      <circle cx="124" cy="100" r="7" fill="#FF8A8A" opacity="0.55" />
      {/* glasses */}
      <g fill="none" stroke="#1B2A5C" strokeWidth="3.5">
        <circle cx="83" cy="86" r="12" fill="#FFFFFF" fillOpacity="0.35" />
        <circle cx="117" cy="86" r="12" fill="#FFFFFF" fillOpacity="0.35" />
        <path d="M95 86h10" />
      </g>
      {/* eyes */}
      {mood === "cheer" ? (
        <g fill="none" stroke="#1B2A5C" strokeWidth="3.5" strokeLinecap="round">
          <path d="M77 88q6-7 12 0" />
          <path d="M111 88q6-7 12 0" />
        </g>
      ) : (
        <g fill="#1B2A5C">
          <circle cx={mood === "thinking" ? 86 : 83} cy={mood === "thinking" ? 83 : 87} r="4.5" />
          <circle cx={mood === "thinking" ? 120 : 117} cy={mood === "thinking" ? 83 : 87} r="4.5" />
        </g>
      )}
      {/* mouth */}
      {mood === "thinking" ? (
        <path d="M92 110q8 3 16-2" fill="none" stroke="#1B2A5C" strokeWidth="3.5" strokeLinecap="round" />
      ) : (
        <path d="M86 106q14 16 28 0z" fill="#1B2A5C" />
      )}
      {mood === "thinking" && (
        <g fill="#FFC83D">
          <circle cx="160" cy="44" r="6" />
          <circle cx="172" cy="28" r="9" />
        </g>
      )}
      {mood === "cheer" && (
        <g fill="#FFC83D">
          <path d="M28 40l4 9 10 1-8 6 3 10-9-6-9 6 3-10-8-6 10-1z" />
          <path d="M170 30l3 7 8 1-6 5 2 8-7-5-7 5 2-8-6-5 8-1z" />
        </g>
      )}
    </svg>
  );
}

