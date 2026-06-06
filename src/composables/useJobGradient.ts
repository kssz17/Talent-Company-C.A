/**
 * Generates a deterministic two-colour gradient from any string.
 * The same input always produces the same gradient — no randomness.
 */
export function useJobGradient(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  const hue1 = Math.abs(hash) % 360
  const hue2 = (hue1 + 50) % 360
  return `linear-gradient(135deg, hsl(${hue1},55%,28%), hsl(${hue2},65%,18%))`
}

/** Returns a single accent colour from the same hash (for borders, dots, etc.) */
export function useJobAccent(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue},60%,62%)`
}
