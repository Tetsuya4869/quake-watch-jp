export function getIntensityColor(intensity: string): string {
  if (intensity.includes('7')) return '#ff0000';
  if (intensity.includes('6')) return '#ff4500';
  if (intensity.includes('5')) return '#ff8c00';
  if (intensity.includes('4')) return '#ffd700';
  return '#38bdf8';
}
