import { describe, it, expect } from 'vitest';
import { formatQuakeTime } from './formatQuakeTime';

describe('formatQuakeTime', () => {
  it('APIの "/" 区切り時刻を MM/dd HH:mm に整形する', () => {
    expect(formatQuakeTime('2024/01/15 14:30:00')).toBe('01/15 14:30');
  });

  it('"-" 区切りの時刻もそのまま整形できる', () => {
    expect(formatQuakeTime('2024-12-31 23:59:00')).toBe('12/31 23:59');
  });

  it('パース不能な文字列はプレースホルダを返す', () => {
    expect(formatQuakeTime('invalid date')).toBe('--/-- --:--');
    expect(formatQuakeTime('')).toBe('--/-- --:--');
  });
});
