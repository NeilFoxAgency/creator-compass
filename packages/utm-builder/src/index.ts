export interface UTMParams {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
  discount_code?: string;
}

export function buildUTMUrl(baseUrl: string, params: UTMParams): string {
  const url = new URL(baseUrl);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });
  return url.toString();
}

export function generateCampaignUTM(brand: string, territory: string, format: string): UTMParams {
  return {
    utm_source: 'creator',
    utm_medium: 'sponsorship',
    utm_campaign: `${brand.toLowerCase().replace(/\s+/g, '-')}-${territory.toLowerCase().replace(/\s+/g, '-')}`,
    utm_content: format.toLowerCase().replace(/\s+/g, '-'),
  };
}
