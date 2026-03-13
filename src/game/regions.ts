/**
 * Maps 2-letter nationality codes to CS2 competitive regions.
 */

const regionMap: Record<string, string> = {
  // CIS
  RU: 'CIS', UA: 'CIS', KZ: 'CIS', BY: 'CIS', UZ: 'CIS',
  LT: 'CIS', LV: 'CIS', EE: 'CIS', GE: 'CIS', AM: 'CIS',
  AZ: 'CIS', MD: 'CIS', TJ: 'CIS', KG: 'CIS', TM: 'CIS',

  // EU
  DE: 'EU', FR: 'EU', SE: 'EU', DK: 'EU', NO: 'EU',
  FI: 'EU', PL: 'EU', CZ: 'EU', SK: 'EU', HU: 'EU',
  RO: 'EU', BG: 'EU', HR: 'EU', RS: 'EU', BA: 'EU',
  SI: 'EU', PT: 'EU', ES: 'EU', IT: 'EU', NL: 'EU',
  BE: 'EU', AT: 'EU', CH: 'EU', GB: 'EU', IE: 'EU',
  IS: 'EU', GR: 'EU', TR: 'EU', IL: 'EU', ME: 'EU',
  MK: 'EU', AL: 'EU', XK: 'EU', CY: 'EU', MT: 'EU',
  LU: 'EU',

  // NA
  US: 'NA', CA: 'NA',

  // SA
  BR: 'SA', AR: 'SA', CL: 'SA',
  UY: 'SA', MX: 'SA', CO: 'SA',
  PE: 'SA', VE: 'SA', EC: 'SA',
  BO: 'SA', PY: 'SA',

  // Asia
  CN: 'Asia', JP: 'Asia', KR: 'Asia', IN: 'Asia', ID: 'Asia',
  MY: 'Asia', TH: 'Asia', PH: 'Asia', SG: 'Asia', VN: 'Asia',
  MN: 'Asia', TW: 'Asia', HK: 'Asia',

  // OCE
  AU: 'OCE', NZ: 'OCE',
};

const regionEmojis: Record<string, string> = {
  'CIS': '🏔️',
  'EU': '🇪🇺',
  'NA': '🌎',
  'SA': '🌎',
  'Asia': '🌏',
  'OCE': '🌊',
  'Other': '🌍',
};

export function getRegion(nationalityCode: string | null): string {
  if (!nationalityCode) return 'Other';
  return regionMap[nationalityCode.toUpperCase()] ?? 'Other';
}

export function getRegionEmoji(region: string): string {
  return regionEmojis[region] ?? '🌍';
}

export function countryToFlag(code: string | null): string {
  if (!code || code.length !== 2) return '';
  const upper = code.toUpperCase();
  return String.fromCodePoint(
    ...Array.from(upper).map(c => 0x1F1E6 + c.charCodeAt(0) - 65)
  );
}
