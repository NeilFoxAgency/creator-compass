import { describe, it, expect } from 'vitest';
import { buildUTMUrl, generateCampaignUTM } from './index';

describe('UTM Builder', () => {
  it('builds valid UTM URL', () => {
    const url = buildUTMUrl('https://example.com', { utm_source: 'creator', utm_campaign: 'test' });
    expect(url).toContain('utm_source=creator');
  });

  it('generates campaign UTM', () => {
    const params = generateCampaignUTM('Neil Fox Agency', 'Creator Business', 'Integrated Demo');
    expect(params.utm_source).toBe('creator');
  });
});
