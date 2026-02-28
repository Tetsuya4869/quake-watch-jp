import { describe, it, expect } from 'vitest';
import { formatIntensity } from './formatIntensity';

describe('formatIntensity', () => {
  it.each([
    [10, '1'],
    [20, '2'],
    [30, '3'],
    [40, '4'],
    [45, '5弱'],
    [50, '5強'],
    [55, '6弱'],
    [60, '6強'],
    [70, '7'],
  ])('maps intensity code %i to "%s"', (code, expected) => {
    expect(formatIntensity(code)).toBe(expected);
  });

  it('returns "不明" for an unknown intensity code', () => {
    expect(formatIntensity(0)).toBe('不明');
    expect(formatIntensity(99)).toBe('不明');
    expect(formatIntensity(-1)).toBe('不明');
  });

  it('does not confuse adjacent codes (45 vs 40 vs 50)', () => {
    expect(formatIntensity(40)).toBe('4');
    expect(formatIntensity(45)).toBe('5弱');
    expect(formatIntensity(50)).toBe('5強');
  });
});
