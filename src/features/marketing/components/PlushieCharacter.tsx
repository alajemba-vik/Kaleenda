import type { CSSProperties } from 'react'
import type { Mood } from '@/types'

type MoodOption = {
  key: Mood
  label: string
  premium: boolean
}

export const MOOD_OPTIONS: MoodOption[] = [
  { key: 'chill', label: 'Chill', premium: false },
  { key: 'panic', label: 'Panic', premium: false },
  { key: 'celebration', label: 'Celebration', premium: false },
  { key: 'onfire', label: 'On Fire', premium: false },
  { key: 'deadline', label: 'Deadline', premium: false },
  { key: 'easy', label: 'Easy', premium: false },
  { key: 'urgent', label: 'Urgent', premium: false },
  { key: 'vibes', label: 'Vibes', premium: false },
  { key: 'love', label: 'Love', premium: true },
  { key: 'hyperspeed', label: 'Hyperspeed', premium: true },
  { key: 'melting', label: 'Melting', premium: true },
  { key: 'glitch', label: 'Glitch', premium: true },
  { key: 'hype', label: 'Hype', premium: true },
  { key: 'ghost', label: 'Ghost', premium: true },
  { key: 'zen', label: 'Zen', premium: true },
  { key: 'chaos', label: 'Chaos', premium: true },
]

export const FREE_MOODS = MOOD_OPTIONS.filter((m) => !m.premium)
export const PREMIUM_MOODS = MOOD_OPTIONS.filter((m) => m.premium)

const animationByMood: Record<Mood, string> = {
  chill: 'kl-float 3s ease-in-out infinite',
  panic: 'kl-shake 0.45s ease-in-out infinite',
  celebration: 'kl-bounce 0.65s cubic-bezier(0.36,0.07,0.19,0.97) infinite',
  onfire: 'kl-pulse 0.55s ease-in-out infinite',
  deadline: 'kl-wobble 0.4s ease-in-out infinite',
  easy: 'kl-nod 1.4s ease-in-out infinite',
  urgent: 'kl-squish 0.7s ease-in-out infinite',
  vibes: 'kl-wave 1s ease-in-out infinite',
  love: 'kl-heartbeat 1.2s ease-in-out infinite',
  hyperspeed: 'kl-dash 0.3s linear infinite alternate',
  melting: 'kl-drip 1.8s ease-in-out infinite',
  glitch: 'kl-glitch 0.2s ease-in-out infinite',
  hype: 'kl-trumpet 0.9s ease-in-out infinite',
  ghost: 'kl-float 2.5s ease-in-out infinite',
  zen: 'kl-zen 2s ease-in-out infinite',
  chaos: 'kl-spin 3s linear infinite',
}

function Eye({ x, y, c = '#1A1916' }: { x: number; y: number; c?: string }) {
  return <circle cx={x} cy={y} r="3" fill={c} />
}

type Props = {
  mood: string
  size?: number
}

export function PlushieCharacter({ mood, size = 64 }: Props) {
  const resolvedMood = (MOOD_OPTIONS.find((m) => m.key === mood)?.key ?? 'chill') as Mood
  const style: CSSProperties = {
    width: size,
    height: size,
    display: 'block',
    animation: animationByMood[resolvedMood],
    transformOrigin: '50% 50%',
  }

  return (
    <svg
      viewBox="0 0 100 100"
      aria-hidden="true"
      style={style}
      className="plushie-character"
    >
      {resolvedMood === 'chill' ? (
        <g>
          <circle cx="30" cy="23" r="12" fill="#85B7EB" />
          <circle cx="70" cy="23" r="12" fill="#85B7EB" />
          <circle cx="30" cy="23" r="6" fill="#B5D4F4" />
          <circle cx="70" cy="23" r="6" fill="#B5D4F4" />
          <circle cx="50" cy="56" r="33" fill="#85B7EB" />
          <ellipse cx="50" cy="64" rx="18" ry="14" fill="#B5D4F4" />
          <Eye x={39} y={52} c="#0C447C" />
          <Eye x={61} y={52} c="#0C447C" />
          <circle cx="40" cy="51" r="1" fill="#fff" />
          <circle cx="62" cy="51" r="1" fill="#fff" />
          <path d="M42 63 Q50 68 58 63" stroke="#0C447C" strokeWidth="2.5" fill="none" strokeLinecap="round" />
        </g>
      ) : null}

      {resolvedMood === 'panic' ? (
        <g>
          <ellipse cx="50" cy="58" rx="33" ry="29" fill="#1D9E75" />
          <circle cx="36" cy="31" r="12" fill="#fff" />
          <circle cx="64" cy="31" r="12" fill="#fff" />
          <circle cx="36" cy="33" r="7" fill="#04342C" />
          <circle cx="64" cy="33" r="7" fill="#04342C" />
          <circle cx="34" cy="31" r="1.2" fill="#fff" />
          <circle cx="62" cy="31" r="1.2" fill="#fff" />
          <path d="M28 20 L39 24" stroke="#04342C" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M72 20 L61 24" stroke="#04342C" strokeWidth="2.5" strokeLinecap="round" />
          <ellipse cx="50" cy="64" rx="17" ry="10" fill="#5DCAA5" />
          <ellipse cx="23" cy="75" rx="6" ry="10" fill="#1D9E75" />
          <ellipse cx="77" cy="75" rx="6" ry="10" fill="#1D9E75" />
        </g>
      ) : null}

      {resolvedMood === 'celebration' ? (
        <g>
          <path d="M50 8 L58 30 L82 26 L66 42 L78 62 L55 60 L50 82 L45 60 L22 62 L34 42 L18 26 L42 30 Z" fill="#EF9F27" />
          <path d="M38 42 Q42 38 46 42" stroke="#1A1916" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M54 42 Q58 38 62 42" stroke="#1A1916" strokeWidth="2" fill="none" strokeLinecap="round" />
          <path d="M40 54 Q50 66 60 54" stroke="#1A1916" strokeWidth="3" fill="none" strokeLinecap="round" />
          <circle cx="16" cy="18" r="4" fill="#F4C0D1" />
          <circle cx="84" cy="16" r="3" fill="#AFA9EC" />
          <circle cx="84" cy="78" r="4" fill="#9FE1CB" />
          <circle cx="18" cy="78" r="3" fill="#AFA9EC" />
        </g>
      ) : null}

      {resolvedMood === 'onfire' ? (
        <g>
          <circle cx="50" cy="58" r="30" fill="#D85A30" />
          <path d="M30 32 L36 16 L44 30 L50 12 L56 30 L64 16 L70 32" fill="#EF9F27" />
          <path d="M35 48 L43 44" stroke="#1A1916" strokeWidth="3" strokeLinecap="round" />
          <path d="M65 48 L57 44" stroke="#1A1916" strokeWidth="3" strokeLinecap="round" />
          <Eye x={41} y={54} />
          <Eye x={59} y={54} />
          <path d="M42 67 L58 67" stroke="#1A1916" strokeWidth="3" strokeLinecap="round" />
        </g>
      ) : null}

      {resolvedMood === 'deadline' ? (
        <g>
          <circle cx="50" cy="49" r="29" fill="#B4B2A9" />
          <ellipse cx="40" cy="47" rx="7" ry="8" fill="#1A1916" />
          <ellipse cx="60" cy="47" rx="7" ry="8" fill="#1A1916" />
          <path d="M50 54 L46 60 L54 60 Z" fill="#6B6860" />
          <rect x="34" y="63" width="32" height="13" rx="3" fill="#A7A49B" />
          <path d="M40 63 V76 M46 63 V76 M52 63 V76 M58 63 V76" stroke="#1A1916" strokeWidth="1.4" />
          <path d="M51 21 L44 28 L48 34" stroke="#6B6860" strokeWidth="2" fill="none" />
          <path d="M60 24 L56 31" stroke="#6B6860" strokeWidth="2" fill="none" />
        </g>
      ) : null}

      {resolvedMood === 'easy' ? (
        <g>
          <circle cx="29" cy="30" r="15" fill="#888780" />
          <circle cx="71" cy="30" r="15" fill="#888780" />
          <ellipse cx="29" cy="30" rx="8" ry="9" fill="#B4B2A9" />
          <ellipse cx="71" cy="30" rx="8" ry="9" fill="#B4B2A9" />
          <circle cx="50" cy="56" r="30" fill="#888780" />
          <path d="M36 52 Q40 49 44 52" stroke="#1A1916" strokeWidth="2" fill="none" />
          <path d="M56 52 Q60 49 64 52" stroke="#1A1916" strokeWidth="2" fill="none" />
          <ellipse cx="50" cy="59" rx="7" ry="9" fill="#444441" />
          <path d="M43 70 Q50 74 57 70" stroke="#1A1916" strokeWidth="2" fill="none" strokeLinecap="round" />
          <text x="74" y="20" fill="#A8A49E" fontSize="10" fontFamily="sans-serif">z</text>
          <text x="80" y="15" fill="#A8A49E" opacity="0.7" fontSize="8" fontFamily="sans-serif">z</text>
          <text x="85" y="11" fill="#A8A49E" opacity="0.5" fontSize="6" fontFamily="sans-serif">z</text>
        </g>
      ) : null}

      {resolvedMood === 'urgent' ? (
        <g>
          <circle cx="50" cy="56" r="30" fill="#D4537E" />
          <path d="M27 34 L37 18 L45 34" fill="#D4537E" />
          <path d="M55 34 L63 18 L73 34" fill="#D4537E" />
          <path d="M31 31 L37 23 L42 31" fill="#F4C0D1" />
          <path d="M58 31 L63 23 L69 31" fill="#F4C0D1" />
          <Eye x={40} y={53} c="#4B1528" />
          <Eye x={60} y={53} c="#4B1528" />
          <ellipse cx="50" cy="64" rx="4" ry="6" fill="#4B1528" />
          <path d="M24 56 L34 58 M24 62 L34 62 M24 68 L34 66" stroke="#4B1528" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M76 56 L66 58 M76 62 L66 62 M76 68 L66 66" stroke="#4B1528" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M68 74 Q80 76 84 84" stroke="#D4537E" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      ) : null}

      {resolvedMood === 'vibes' ? (
        <g>
          <path d="M10 76 Q28 64 50 76 Q72 88 90 76 L90 92 L10 92 Z" fill="#1D9E75" />
          <ellipse cx="49" cy="54" rx="29" ry="25" fill="#EF9F27" />
          <ellipse cx="51" cy="59" rx="11" ry="8" fill="#D85A30" />
          <circle cx="42" cy="49" r="3.2" fill="#1A1916" />
          <circle cx="43" cy="48" r="1" fill="#fff" />
          <path d="M66 54 Q78 50 76 40" stroke="#EF9F27" strokeWidth="7" strokeLinecap="round" fill="none" />
          <rect x="36" y="81" width="16" height="4" rx="2" fill="#fff" />
        </g>
      ) : null}

      {resolvedMood === 'love' ? (
        <g>
          <path d="M50 84 C36 72 20 60 20 42 C20 31 29 24 38 24 C45 24 49 28 50 32 C51 28 55 24 62 24 C71 24 80 31 80 42 C80 60 64 72 50 84 Z" fill="#D4537E" />
          <path d="M37 27 C31 29 28 33 28 40" stroke="#F4C0D1" strokeWidth="5" fill="none" strokeLinecap="round" />
          <Eye x={43} y={49} />
          <Eye x={57} y={49} />
          <circle cx="36" cy="54" r="2" fill="#F4C0D1" />
          <circle cx="64" cy="54" r="2" fill="#F4C0D1" />
          <path d="M46 58 Q50 62 54 58" stroke="#1A1916" strokeWidth="2" fill="none" />
          <path d="M30 58 L21 55" stroke="#D4537E" strokeWidth="4" strokeLinecap="round" />
          <path d="M70 58 L79 55" stroke="#D4537E" strokeWidth="4" strokeLinecap="round" />
        </g>
      ) : null}

      {resolvedMood === 'hyperspeed' ? (
        <g>
          <path d="M20 56 L46 20 L42 42 L70 42 L42 82 L48 56 Z" fill="#378ADD" />
          <path d="M6 46 L18 46 M4 54 L16 54 M8 62 L20 62" stroke="#B5D4F4" strokeWidth="2" strokeLinecap="round" />
          <path d="M34 48 L40 46" stroke="#0C447C" strokeWidth="2" />
          <path d="M50 48 L56 46" stroke="#0C447C" strokeWidth="2" />
          <path d="M36 58 L54 58" stroke="#1A1916" strokeWidth="3" strokeLinecap="round" />
          <path d="M58 35 L66 35 M62 30 L70 30" stroke="#B5D4F4" strokeWidth="2" strokeLinecap="round" />
        </g>
      ) : null}

      {resolvedMood === 'melting' ? (
        <g>
          <ellipse cx="50" cy="52" rx="30" ry="26" fill="#7F77DD" />
          <ellipse cx="36" cy="76" rx="6" ry="10" fill="#7F77DD" />
          <ellipse cx="61" cy="79" rx="5" ry="9" fill="#7F77DD" />
          <path d="M38 50 Q42 52 46 50" stroke="#1A1916" strokeWidth="2" fill="none" />
          <path d="M54 50 Q58 52 62 50" stroke="#1A1916" strokeWidth="2" fill="none" />
          <path d="M42 61 L58 61" stroke="#1A1916" strokeWidth="2" strokeLinecap="round" />
        </g>
      ) : null}

      {resolvedMood === 'glitch' ? (
        <g>
          <rect x="24" y="26" width="52" height="34" rx="8" fill="#1D9E75" />
          <rect x="30" y="60" width="40" height="22" rx="6" fill="#1D9E75" />
          <line x1="50" y1="16" x2="50" y2="26" stroke="#04342C" strokeWidth="2" />
          <circle cx="50" cy="13" r="3" fill="#04342C" />
          {Array.from({ length: 6 }).map((_, i) => (
            <rect key={i} x={34 + (i % 3) * 10} y={36 + Math.floor(i / 3) * 8} width="6" height="5" fill="#04342C" />
          ))}
          <text x="40" y="75" fill="#04342C" fontSize="10" fontFamily="monospace">01</text>
          <path d="M25 44 H76 M23 52 H74" stroke="#85B7EB" strokeWidth="1" opacity="0.4" />
        </g>
      ) : null}

      {resolvedMood === 'hype' ? (
        <g>
          <ellipse cx="50" cy="58" rx="28" ry="24" fill="#EF9F27" />
          <ellipse cx="30" cy="54" rx="10" ry="14" fill="#EF9F27" />
          <ellipse cx="70" cy="54" rx="10" ry="14" fill="#EF9F27" />
          <path d="M50 56 Q68 34 74 20" stroke="#EF9F27" strokeWidth="8" fill="none" strokeLinecap="round" />
          <circle cx="40" cy="56" r="3" fill="#1A1916" />
          <circle cx="60" cy="56" r="3" fill="#1A1916" />
          <path d="M42 66 Q50 72 58 66" stroke="#1A1916" strokeWidth="2.5" fill="none" />
          <circle cx="77" cy="18" r="2" fill="#F4C0D1" />
          <circle cx="81" cy="14" r="1.5" fill="#fff" />
          <circle cx="72" cy="16" r="1.5" fill="#fff" />
          <ellipse cx="39" cy="80" rx="5" ry="3" fill="#D85A30" />
          <ellipse cx="61" cy="80" rx="5" ry="3" fill="#D85A30" />
        </g>
      ) : null}

      {resolvedMood === 'ghost' ? (
        <g opacity="0.92">
          <path d="M24 78 V44 C24 28 35 20 50 20 C65 20 76 28 76 44 V78 L68 72 L60 78 L52 72 L44 78 L36 72 Z" fill="#F1EFE8" />
          <ellipse cx="42" cy="48" rx="4" ry="6" fill="#444441" />
          <ellipse cx="58" cy="48" rx="4" ry="6" fill="#444441" />
          <circle cx="50" cy="62" r="4" fill="#444441" />
          <ellipse cx="52" cy="84" rx="22" ry="4" fill="#1A1916" opacity="0.15" />
        </g>
      ) : null}

      {resolvedMood === 'zen' ? (
        <g>
          <ellipse cx="50" cy="79" rx="28" ry="10" fill="#F4C0D1" />
          <path d="M22 79 L38 70 L50 79 L62 70 L78 79" stroke="#D4537E" strokeWidth="2" fill="none" />
          <ellipse cx="50" cy="55" rx="22" ry="20" fill="#1D9E75" />
          <path d="M40 52 Q44 48 48 52" stroke="#04342C" strokeWidth="2" fill="none" />
          <path d="M52 52 Q56 48 60 52" stroke="#04342C" strokeWidth="2" fill="none" />
          <path d="M45 62 Q50 65 55 62" stroke="#04342C" strokeWidth="2" fill="none" strokeLinecap="round" />
          <ellipse cx="50" cy="22" rx="14" ry="4" fill="#EF9F27" opacity="0.6" />
          <path d="M34 68 Q50 76 66 68" stroke="#1D9E75" strokeWidth="5" fill="none" strokeLinecap="round" />
        </g>
      ) : null}

      {resolvedMood === 'chaos' ? (
        <g>
          <circle cx="50" cy="50" r="22" fill="#E24B4A" />
          <path d="M43 48 q3-4 6 0 q-3 4 -6 0" fill="#1A1916" />
          <path d="M57 48 q3-4 6 0 q-3 4 -6 0" fill="#1A1916" />
          <circle cx="30" cy="28" r="4" fill="#E24B4A" />
          <circle cx="70" cy="24" r="4" fill="#E24B4A" />
          <circle cx="80" cy="44" r="4" fill="#E24B4A" />
          <circle cx="78" cy="66" r="4" fill="#E24B4A" />
          <circle cx="62" cy="80" r="4" fill="#E24B4A" />
          <circle cx="38" cy="80" r="4" fill="#E24B4A" />
          <circle cx="22" cy="66" r="4" fill="#E24B4A" />
          <circle cx="20" cy="44" r="4" fill="#E24B4A" />
          <text x="24" y="31" fontSize="7" fill="#EF9F27">⏰</text>
          <text x="64" y="25" fontSize="7" fill="#EF9F27">★</text>
          <text x="76" y="46" fontSize="7" fill="#EF9F27">⚡</text>
          <text x="74" y="69" fontSize="7" fill="#F4C0D1">♥</text>
          <text x="58" y="83" fontSize="7" fill="#fff">?</text>
          <text x="34" y="83" fontSize="7" fill="#fff">!</text>
          <text x="16" y="69" fontSize="7" fill="#85B7EB">~</text>
          <text x="14" y="46" fontSize="7" fill="#EF9F27">🔥</text>
        </g>
      ) : null}
    </svg>
  )
}

