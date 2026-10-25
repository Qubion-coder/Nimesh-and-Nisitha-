// Couple names used across the invitation and the admin message generator.
export const BRIDE_NAME = 'Nimeshika';
export const GROOM_NAME = 'Nisitha';

// Google Apps Script web app URL (see code.ts / google-apps-script/SETUP.md).
export const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbywj78D_IzbhihgUfiOvEc6vXRE9Lc7U8qr19Qj_haPo-YlRdYSu4QZq2e4i7wjLXLg/exec';

// `code` is the short value carried in the invitation link (?p=code).
export const PREFIXES = [
  { label: 'Mr.', code: 'mr' },
  { label: 'Mrs.', code: 'mrs' },
  { label: 'Miss', code: 'miss' },
  { label: 'Mr. & Mrs.', code: 'mrmrs' },
  { label: 'Family', code: 'family' },
  { label: 'Dear', code: 'dear' },
] as const;

export type PrefixCode = (typeof PREFIXES)[number]['code'];

// "Dear" is a greeting style, not part of the name, so it adds nothing here.
export function formatDisplayName(code: string | null, name: string): string {
  const guest = name.trim();
  if (!guest) return '';
  switch (code) {
    case 'family':
      return `${guest} and Family`;
    case 'dear':
    case null:
      return guest;
    default: {
      const prefix = PREFIXES.find((p) => p.code === code);
      return prefix ? `${prefix.label} ${guest}` : guest;
    }
  }
}

// Link format: {baseURL}/{guestName}?p={prefixCode} (no query for "Dear").
export function buildInviteLink(baseUrl: string, code: PrefixCode, name: string): string {
  const path = encodeURIComponent(name.trim());
  return code === 'dear' ? `${baseUrl}/${path}` : `${baseUrl}/${path}?p=${code}`;
}

export function buildInviteMessage(displayName: string, link: string): string {
  return `Dear ${displayName} ❤️

With joyful hearts, we warmly invite you to celebrate one of the most special days of our lives as we begin our journey together.

Please view our wedding invitation and all the event details through the link below 🌐:

${link}

Your presence would truly mean the world to us, and we would be honored to celebrate this beautiful moment together.

With love,
❤️ ${GROOM_NAME} & ${BRIDE_NAME}`;
}

// Reads the guest from the current URL. Also accepts the older ?prefix=&name= links.
export function getGuestDisplayName(): string {
  const params = new URLSearchParams(window.location.search);
  const legacyName = params.get('name');
  if (legacyName) {
    const legacyPrefix = params.get('prefix');
    return legacyPrefix ? `${legacyPrefix} ${legacyName.trim()}` : legacyName.trim();
  }

  const segment = window.location.pathname.replace(/^\/+|\/+$/g, '');
  if (!segment || segment === 'admin') return '';
  let name = segment;
  try {
    name = decodeURIComponent(segment);
  } catch {
    // keep the raw segment if it isn't valid URI encoding
  }
  return formatDisplayName(params.get('p'), name);
}
