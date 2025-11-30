export type TempCategory = 'hot' | 'cold' | 'moderate' | 'unknown';

export function classifyTemp(tempF: number | null | undefined): TempCategory {
  if (typeof tempF !== 'number' || Number.isNaN(tempF)) return 'unknown';
  if (tempF >= 80) return 'hot';
  if (tempF <= 65) return 'cold';
  return 'moderate';
}
