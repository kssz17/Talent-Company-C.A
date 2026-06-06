/**
 * Generates a deterministic HSL color from any string (name, id, email…).
 * Same input → always the same color; different inputs → visually distinct hues.
 */
export function useColorHash(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
    hash |= 0 // convert to 32-bit int
  }
  const hue = Math.abs(hash) % 360
  return `hsl(${hue}, 55%, 62%)`
}
