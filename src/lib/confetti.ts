import confetti from 'canvas-confetti'

export function celebrateCalendarCreation() {
  // Burst from center
  void confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    startVelocity: 30,
    decay: 0.92,
  })

  // Secondary burst delayed slightly
  setTimeout(() => {
    void confetti({
      particleCount: 50,
      angle: 60,
      spread: 55,
      origin: { x: 0.5, y: 0.5 },
      startVelocity: 25,
    })
  }, 100)
}

export function createConfettiOptions() {
  return {
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    startVelocity: 30,
    decay: 0.92,
  }
}

