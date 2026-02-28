import { describe, it, expect } from 'vitest';
import { getIntensityColor } from './getIntensityColor';

describe('getIntensityColor', () => {
  it('returns red for intensity 7', () => {
    expect(getIntensityColor('7')).toBe('#ff0000');
  });

  it('returns orange-red for intensity 6弱', () => {
    expect(getIntensityColor('6弱')).toBe('#ff4500');
  });

  it('returns orange-red for intensity 6強', () => {
    expect(getIntensityColor('6強')).toBe('#ff4500');
  });

  it('returns dark-orange for intensity 5弱', () => {
    expect(getIntensityColor('5弱')).toBe('#ff8c00');
  });

  it('returns dark-orange for intensity 5強', () => {
    expect(getIntensityColor('5強')).toBe('#ff8c00');
  });

  it('returns gold for intensity 4', () => {
    expect(getIntensityColor('4')).toBe('#ffd700');
  });

  it('returns cyan for intensity 3 and below', () => {
    expect(getIntensityColor('3')).toBe('#38bdf8');
    expect(getIntensityColor('2')).toBe('#38bdf8');
    expect(getIntensityColor('1')).toBe('#38bdf8');
  });

  it('returns cyan for unknown intensity (不明)', () => {
    expect(getIntensityColor('不明')).toBe('#38bdf8');
  });

  it('prioritizes 7 over 6 — "7" must not match the includes("6") check', () => {
    // '7' does not include '6', so order doesn't matter here, but
    // this confirms the check is specific to the digit
    expect(getIntensityColor('7')).not.toBe('#ff4500');
  });

  it('distinguishes intensity 4 from 5弱 (both use includes, different digits)', () => {
    expect(getIntensityColor('4')).toBe('#ffd700');
    expect(getIntensityColor('5弱')).toBe('#ff8c00');
    expect(getIntensityColor('4')).not.toBe(getIntensityColor('5弱'));
  });
});
