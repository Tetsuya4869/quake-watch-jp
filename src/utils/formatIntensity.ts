export function formatIntensity(intensity: number): string {
  const mapping: Record<number, string> = {
    10: '1', 20: '2', 30: '3', 40: '4',
    45: '5弱', 50: '5強', 55: '6弱', 60: '6強', 70: '7'
  };
  return mapping[intensity] ?? '不明';
}
