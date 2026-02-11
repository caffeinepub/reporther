// Shared high-risk keyword list for DV journal analysis and UI flagging
export const HIGH_RISK_KEYWORDS = [
  'hit',
  'punched',
  'assaulted',
  'choked',
  'raped',
  'forced',
  'grabbed',
  'threatened',
  'beaten',
  'weapons',
  'stalking',
  'killed',
  'lock',
  'restrain',
  'trauma',
] as const;

/**
 * Check if text contains any high-risk keywords (case-insensitive)
 */
export function containsHighRiskKeyword(text: string): boolean {
  const lowerText = text.toLowerCase();
  return HIGH_RISK_KEYWORDS.some((keyword) => lowerText.includes(keyword));
}

/**
 * Get all high-risk keywords found in text
 */
export function findHighRiskKeywords(text: string): string[] {
  const lowerText = text.toLowerCase();
  return HIGH_RISK_KEYWORDS.filter((keyword) => lowerText.includes(keyword));
}
