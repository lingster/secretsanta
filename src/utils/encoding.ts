import pako from 'pako';
import type { SecretSantaConfig, Participant, Match } from '../types';

/**
 * Ultra-compact format: names;prizeValue;eventDate;matchIndices
 * Example: "ben,zoe,emila;5;2025-12-14;0,1,1,2,2,0"
 *
 * Combined with pako deflateRaw compression, this achieves ~92% reduction
 * compared to the original verbose JSON + encodeURIComponent approach
 */

/**
 * Convert full config to ultra-compact string format
 */
function toCompactString(config: SecretSantaConfig): string {
  const names = config.participants.map(p => p.name);
  const nameToIndex = new Map(names.map((name, idx) => [name, idx]));

  const matchIndices: number[] = [];
  for (const match of config.matches) {
    matchIndices.push(nameToIndex.get(match.giver)!, nameToIndex.get(match.receiver)!);
  }

  return [
    names.join(','),
    config.prizeValue,
    config.eventDate,
    matchIndices.join(',')
  ].join(';');
}

/**
 * Convert ultra-compact string back to full config
 */
function fromCompactString(str: string): SecretSantaConfig {
  const parts = str.split(';');
  if (parts.length !== 4) {
    throw new Error('Invalid compact format');
  }

  const names = parts[0].split(',');
  const prizeValue = parseInt(parts[1], 10);
  const eventDate = parts[2];
  const matchIndices = parts[3].split(',').map(n => parseInt(n, 10));

  const participants: Participant[] = names.map(name => ({ name }));
  const matches: Match[] = [];

  for (let i = 0; i < matchIndices.length; i += 2) {
    matches.push({
      giver: names[matchIndices[i]],
      receiver: names[matchIndices[i + 1]]
    });
  }

  return {
    participants,
    prizeValue,
    eventDate,
    matches
  };
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
  const compact = toCompactString(config);
  const compressed = pako.deflateRaw(compact);
  return toBase64Url(compressed);
}

/**
 * Decodes the Secret Santa configuration from a URL parameter
 */
export function decodeConfig(encoded: string): SecretSantaConfig {
  try {
    const bytes = fromBase64Url(encoded);
    const decompressed = pako.inflateRaw(bytes, { to: 'string' });
    return fromCompactString(decompressed);
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
