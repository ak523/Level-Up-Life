export function vibrateShort(): void {
  if ('vibrate' in navigator) {
    try { navigator.vibrate(50) } catch { /* noop */ }
  }
}

export function vibrateSuccess(): void {
  if ('vibrate' in navigator) {
    try { navigator.vibrate([50, 30, 100]) } catch { /* noop */ }
  }
}

export function vibrateCritical(): void {
  if ('vibrate' in navigator) {
    try { navigator.vibrate([100, 50, 100, 50, 200]) } catch { /* noop */ }
  }
}
