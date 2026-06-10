import { format } from 'date-fns';

/**
 * P2P地震情報APIの時刻文字列（例: "2024/01/15 14:30:00"）を
 * "MM/dd HH:mm" 形式に整形する。パース不能な場合はプレースホルダを返す。
 */
export function formatQuakeTime(time: string): string {
  const date = new Date(time.replace(/\//g, '-'));
  if (Number.isNaN(date.getTime())) return '--/-- --:--';
  return format(date, 'MM/dd HH:mm');
}
