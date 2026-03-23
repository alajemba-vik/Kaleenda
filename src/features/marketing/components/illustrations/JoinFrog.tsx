import { SVGProps } from 'react'

export function JoinFrog(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
      <ellipse cx="32" cy="38" rx="20" ry="18" fill="#1D9E75" />
      <ellipse cx="20" cy="22" rx="9" ry="7" fill="#1D9E75" />
      <ellipse cx="44" cy="22" rx="9" ry="7" fill="#1D9E75" />
      <ellipse cx="20" cy="22" rx="6" ry="5" fill="white" />
      <ellipse cx="44" cy="22" rx="6" ry="5" fill="white" />
      <circle cx="20" cy="23" r="3.5" fill="#04342C" />
      <circle cx="44" cy="23" r="3.5" fill="#04342C" />
      <ellipse cx="19" cy="22" rx="1" ry="1.5" fill="white" opacity="0.7" />
      <ellipse cx="43" cy="22" rx="1" ry="1.5" fill="white" opacity="0.7" />
      <ellipse cx="32" cy="44" rx="10" ry="5" fill="#5DCAA5" />
      <path d="M26 40 Q32 36 38 40" stroke="#04342C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <line x1="14" y1="50" x2="8" y2="58" stroke="#1D9E75" strokeWidth="3" strokeLinecap="round" />
      <line x1="50" y1="50" x2="56" y2="58" stroke="#1D9E75" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}
