import type { SecretSantaConfig } from '../types';

/**
 * Compresses a string using LZ-based compression (simple implementation)
 */
function compressString(str: string): string {
  // Use URI encoding and then base64 for a simple compression
  const encoded = encodeURIComponent(str);
  return btoa(encoded);
}

/**
 * Decompresses a string
 */
function decompressString(str: string): string {
  try {
    const decoded = atob(str);
    return decodeURIComponent(decoded);
  } catch (e) {
    throw new Error('Invalid encoded data');
  }
}

/**
 * Encodes the Secret Santa configuration into a URL-safe string
 */
export function encodeConfig(config: SecretSantaConfig): string {
  const json = JSON.stringify(config);
  const compressed = compressString(json);
  // Make URL-safe by replacing characters
  return compressed.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Decodes the Secret Santa configuration from a URL parameter
 */
export function decodeConfig(encoded: string): SecretSantaConfig {
  try {
    // Restore base64 padding and characters
    let base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }

    const decompressed = decompressString(base64);
    const config = JSON.parse(decompressed) as SecretSantaConfig;

    // Validate the config
    if (!config.participants || !Array.isArray(config.participants)) {
      throw new Error('Invalid config structure');
    }

    return config;
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
