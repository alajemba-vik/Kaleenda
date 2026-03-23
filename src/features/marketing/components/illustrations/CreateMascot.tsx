import { SVGProps } from 'react'

export function CreateMascot(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="32" cy="36" r="20" fill="#85B7EB" />
      <circle cx="20" cy="20" r="8" fill="#85B7EB" />
      <circle cx="44" cy="20" r="8" fill="#85B7EB" />
      <circle cx="20" cy="20" r="5" fill="#B5D4F4" />
      <circle cx="44" cy="20" r="5" fill="#B5D4F4" />
      <ellipse cx="32" cy="42" rx="10" ry="6" fill="#B5D4F4" />
      <circle cx="26" cy="34" r="3" fill="#0C447C" />
      <circle cx="38" cy="34" r="3" fill="#0C447C" />
      <path d="M28 40 Q32 44 36 40" stroke="#0C447C" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <ellipse cx="26" cy="33" rx="1" ry="1.5" fill="white" opacity="0.6" />
      <ellipse cx="38" cy="33" rx="1" ry="1.5" fill="white" opacity="0.6" />
    </svg>
  )
}
