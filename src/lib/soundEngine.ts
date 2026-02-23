let audioCtx: AudioContext | null = null

function getCtx(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
  }
  return audioCtx
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  gainValue = 0.3
): void {
  try {
    const ctx = getCtx()
    const oscillator = ctx.createOscillator()
    const gain = ctx.createGain()
    oscillator.connect(gain)
    gain.connect(ctx.destination)
    oscillator.type = type
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime)
    gain.gain.setValueAtTime(gainValue, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration)
    oscillator.start(ctx.currentTime)
    oscillator.stop(ctx.currentTime + duration)
  } catch {
    // Ignore audio errors
  }
}

export function playClick(): void {
  playTone(800, 0.05, 'square', 0.1)
}

export function playXPGain(): void {
  playTone(440, 0.1, 'sine', 0.2)
  setTimeout(() => playTone(550, 0.1, 'sine', 0.15), 100)
  setTimeout(() => playTone(660, 0.2, 'sine', 0.1), 200)
}

export function playCriticalSuccess(): void {
  const notes = [523, 659, 784, 1047]
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.3, 'sine', 0.25), i * 120)
  })
}

export function playLevelUp(): void {
  const notes = [262, 330, 392, 523, 659, 784]
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.4, 'triangle', 0.3), i * 100)
  })
}

export function playPurchase(): void {
  playTone(784, 0.1, 'sine', 0.2)
  setTimeout(() => playTone(1047, 0.2, 'sine', 0.15), 100)
}

export function playStreakSaved(): void {
  playTone(440, 0.15, 'sine', 0.2)
  setTimeout(() => playTone(880, 0.3, 'sine', 0.2), 150)
}

/** Short descending tone for negative reinforcement (task fail, XP loss, zero XP). */
export function playSadSound(): void {
  playTone(330, 0.25, 'sine', 0.15)
  setTimeout(() => playTone(262, 0.35, 'sine', 0.12), 250)
}
