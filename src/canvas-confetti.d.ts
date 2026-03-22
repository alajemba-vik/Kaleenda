declare module 'canvas-confetti' {
  interface ConfettiOptions {
    particleCount?: number
    spread?: number
    origin?: { x?: number; y?: number }
    colors?: string[]
    ticks?: number
    gravity?: number
    scalar?: number
    startVelocity?: number
    decay?: number
    angle?: number
  }

  function confetti(options?: ConfettiOptions): Promise<null>

  export default confetti
}



