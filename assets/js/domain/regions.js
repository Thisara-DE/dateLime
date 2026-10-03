// Regions where JustWatch (and so TMDB) has streaming data; names come from the browser.
export const REGIONS = ['US', 'CA', 'GB', 'IE', 'AU', 'NZ', 'IN', 'LK', 'SG', 'PH', 'ZA', 'DE', 'AT', 'CH', 'FR', 'BE', 'NL', 'IT', 'ES', 'PT', 'SE', 'NO', 'DK', 'FI', 'PL', 'CZ', 'HU', 'GR', 'TR', 'BR', 'MX', 'AR', 'CL', 'CO', 'JP', 'KR', 'TW', 'HK', 'MY', 'ID', 'TH'];

export const regionName = (() => {
  try {
    const names = new Intl.DisplayNames(undefined, { type: 'region' });
    return (code) => names.of(code) ?? code;
  } catch {
    return (code) => code;
  }
})();
