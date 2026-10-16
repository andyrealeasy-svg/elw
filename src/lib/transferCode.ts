import { PlayerProfile } from '../types';

/**
 * Generates an exportable Transfer Code representing the entire player profile.
 * Can be copied on one device and entered on any other device to immediately restore full progress.
 */
export const generateTransferCode = (profile: PlayerProfile): string => {
  try {
    const jsonStr = JSON.stringify(profile);
    // Base64 encode UTF-8 string safely
    const bytes = new TextEncoder().encode(jsonStr);
    let binary = '';
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    return `DD-${b64}`;
  } catch (e) {
    console.error('Error generating transfer code:', e);
    return '';
  }
};

/**
 * Decodes and validates a Transfer Code into a PlayerProfile object.
 */
export const parseTransferCode = (code: string): PlayerProfile | null => {
  try {
    let clean = (code || '').trim();
    if (clean.startsWith('DD-')) {
      clean = clean.slice(3);
    }
    if (!clean) return null;

    const binary = atob(clean);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    const jsonStr = new TextDecoder().decode(bytes);
    const parsed = JSON.parse(jsonStr);

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return parsed as PlayerProfile;
  } catch (e) {
    console.error('Error parsing transfer code:', e);
    return null;
  }
};

/**
 * Generates a deterministic valid UUID from a username string.
 * Allows multiple devices using the same nickname to reference the same primary key in Postgres.
 */
export const usernameToUUID = (username: string): string => {
  const clean = (username || '').trim().toLowerCase();
  let h1 = 0xdeadbeef, h2 = 0x41c6ce57, h3 = 0x811c9dc5, h4 = 0x9e3779b9;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
    h3 = Math.imul(h3 ^ ch, 2246822507);
    h4 = Math.imul(h4 ^ ch, 3266489909);
  }
  const toHex = (n: number) => (n >>> 0).toString(16).padStart(8, '0');
  const hex = toHex(h1) + toHex(h2) + toHex(h3) + toHex(h4);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(13, 16)}-a${hex.slice(17, 20)}-${hex.slice(20, 32)}`;
};

