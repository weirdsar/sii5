import { describe, expect, it } from 'vitest';
import { getCasePreview } from './imageAssets';

describe('imageAssets', () => {
  it('getCasePreview возвращает объект для известного slug', () => {
    expect(getCasePreview('uzelok64')).toBeTruthy();
  });

  it('getCasePreview для неизвестного slug — undefined', () => {
    expect(getCasePreview('no-such-case')).toBeUndefined();
  });
});
