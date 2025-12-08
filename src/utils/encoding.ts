import type { SecretSantaConfig, Participant, Match } from '../types';

/**
 * Compact config format for URL encoding
 * p: participant names array
 * v: prize value
 * d: event date
 * m: matches as flat array of indices [giverIdx, receiverIdx, ...]
 */
interface CompactConfig {
  p: string[];
  v: number;
  d: string;
  m: number[];
}

/**
 * Convert full config to compact format
 */
function toCompactConfig(config: SecretSantaConfig): CompactConfig {
  const names = config.participants.map(p => p.name);
  const nameToIndex = new Map(names.map((name, idx) => [name, idx]));

  const matches: number[] = [];
  for (const match of config.matches) {
    matches.push(nameToIndex.get(match.giver)!, nameToIndex.get(match.receiver)!);
  }

  return {
    p: names,
    v: config.prizeValue,
    d: config.eventDate,
    m: matches
  };
}

/**
 * Convert compact format back to full config
 */
function fromCompactConfig(compact: CompactConfig): SecretSantaConfig {
  const participants: Participant[] = compact.p.map(name => ({ name }));
  const matches: Match[] = [];

  for (let i = 0; i < compact.m.length; i += 2) {
    matches.push({
      giver: compact.p[compact.m[i]],
      receiver: compact.p[compact.m[i + 1]]
    });
  }

  return {
    participants,
    prizeValue: compact.v,
    eventDate: compact.d,
    matches
  };
}

/**
 * Simple LZ-based compression using a dictionary approach
 * This provides good compression for JSON with repeated patterns
 */
function lzCompress(str: string): Uint8Array {
  const dict = new Map<string, number>();
  const result: number[] = [];
  let dictSize = 256;

  // Initialize dictionary with single characters
  for (let i = 0; i < 256; i++) {
    dict.set(String.fromCharCode(i), i);
  }

  let w = '';
  for (const c of str) {
    const wc = w + c;
    if (dict.has(wc)) {
      w = wc;
    } else {
      result.push(dict.get(w)!);
      if (dictSize < 65536) {
        dict.set(wc, dictSize++);
      }
      w = c;
    }
  }

  if (w) {
    result.push(dict.get(w)!);
  }

  // Convert to bytes (using 2 bytes per code for simplicity)
  const bytes = new Uint8Array(result.length * 2);
  for (let i = 0; i < result.length; i++) {
    bytes[i * 2] = result[i] >> 8;
    bytes[i * 2 + 1] = result[i] & 0xff;
  }

  return bytes;
}

/**
 * Decompress LZ-compressed data
 */
function lzDecompress(bytes: Uint8Array): string {
  // Convert bytes back to codes
  const codes: number[] = [];
  for (let i = 0; i < bytes.length; i += 2) {
    codes.push((bytes[i] << 8) | bytes[i + 1]);
  }

  const dict: string[] = [];
  let dictSize = 256;

  // Initialize dictionary
  for (let i = 0; i < 256; i++) {
    dict[i] = String.fromCharCode(i);
  }

  let w = String.fromCharCode(codes[0]);
  let result = w;

  for (let i = 1; i < codes.length; i++) {
    const code = codes[i];
    let entry: string;

    if (dict[code] !== undefined) {
      entry = dict[code];
    } else if (code === dictSize) {
      entry = w + w[0];
    } else {
      throw new Error('Invalid compressed data');
    }

    result += entry;

    if (dictSize < 65536) {
      dict[dictSize++] = w + entry[0];
    }
    w = entry;
  }

  return result;
}

/**
 * Convert Uint8Array to URL-safe base64
 */
function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '');
}

/**
 * Convert URL-safe base64 to Uint8Array
 */
function fromBase64Url(str: string): Uint8Array {
  // Restore base64 padding and characters
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }

  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Encodes the Secret Santa configuration into a URL-safe string
 */
export function encodeConfig(config: SecretSantaConfig): string {
  const compact = toCompactConfig(config);
  const json = JSON.stringify(compact);
  const compressed = lzCompress(json);
  return toBase64Url(compressed);
}

/**
 * Decodes the Secret Santa configuration from a URL parameter
 */
export function decodeConfig(encoded: string): SecretSantaConfig {
  try {
    const bytes = fromBase64Url(encoded);
    const json = lzDecompress(bytes);
    const compact = JSON.parse(json) as CompactConfig;

    // Validate the compact config
    if (!compact.p || !Array.isArray(compact.p)) {
      throw new Error('Invalid config structure');
    }

    return fromCompactConfig(compact);
  } catch (e) {
    throw new Error('Failed to decode configuration: ' + (e as Error).message);
  }
}

/**
 * Generates a shareable URL with the encoded config
 */
export function generateShareableUrl(config: SecretSantaConfig): string {
  const encoded = encodeConfig(config);
  const baseUrl = window.location.origin + window.location.pathname;
  return `${baseUrl}?data=${encoded}`;
}
