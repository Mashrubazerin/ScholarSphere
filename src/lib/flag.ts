/**
 * Converts an ISO 3166-1 alpha-2 country code (e.g. "JP") into its flag emoji
 * (e.g. "🇯🇵") by mapping each letter to its Unicode regional indicator symbol.
 * Kept as a pure function rather than a stored column so the flag can never
 * drift out of sync with `Country.code`.
 */
export function countryCodeToFlagEmoji(code: string): string {
  const REGIONAL_INDICATOR_OFFSET = 127397; // 0x1F1E6 - "A".charCodeAt(0)
  return code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(REGIONAL_INDICATOR_OFFSET + char.charCodeAt(0)));
}
