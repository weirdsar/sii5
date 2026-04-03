import { describe, expect, it } from 'vitest';
import { formatDate } from './helpers';

describe('formatDate', () => {
  it('форматирует ISO-дату в русской локали (день, месяц прописью, год)', () => {
    const out = formatDate('2026-01-15');
    expect(out).toMatch(/15/);
    expect(out.toLowerCase()).toMatch(/январ/);
    expect(out).toMatch(/2026/);
  });

  it('обрабатывает другой месяц', () => {
    const out = formatDate('2024-12-01');
    expect(out).toMatch(/1|01/);
    expect(out.toLowerCase()).toMatch(/декабр/);
    expect(out).toMatch(/2024/);
  });

  it('бросает RangeError при невалидной строке даты', () => {
    expect(() => formatDate('not-a-date')).toThrow(RangeError);
  });
});
