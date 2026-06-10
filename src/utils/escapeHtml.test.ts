import { describe, it, expect } from 'vitest';
import { escapeHtml } from './escapeHtml';

describe('escapeHtml', () => {
  it('HTML特殊文字をエスケープする', () => {
    expect(escapeHtml('<script>alert("x")</script>')).toBe(
      '&lt;script&gt;alert(&quot;x&quot;)&lt;/script&gt;'
    );
    expect(escapeHtml("a & 'b'")).toBe('a &amp; &#39;b&#39;');
  });

  it('日本語の地名はそのまま返す', () => {
    expect(escapeHtml('茨城県南部')).toBe('茨城県南部');
  });

  it('空文字列を扱える', () => {
    expect(escapeHtml('')).toBe('');
  });
});
