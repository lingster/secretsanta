import type { RevealedGift } from '../types';

const COOKIE_NAME = 'secret_santa_revealed';

/**
 * Sets a cookie that expires at the specified date
 */
export function setRevealedCookie(revealed: RevealedGift): void {
  const cookieValue = encodeURIComponent(JSON.stringify(revealed));
  const expires = new Date(revealed.expiresAt).toUTCString();
  document.cookie = `${COOKIE_NAME}=${cookieValue}; expires=${expires}; path=/; SameSite=Strict`;
}

/**
 * Gets the revealed gift from cookies if it exists and hasn't expired
 */
export function getRevealedCookie(): RevealedGift | null {
  const cookies = document.cookie.split(';');

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');

    if (name === COOKIE_NAME) {
      try {
        const revealed = JSON.parse(decodeURIComponent(value)) as RevealedGift;

        // Check if expired
        if (new Date(revealed.expiresAt) > new Date()) {
          return revealed;
        } else {
          // Cookie expired, clear it
          clearRevealedCookie();
          return null;
        }
      } catch (e) {
        // Invalid cookie data
        clearRevealedCookie();
        return null;
      }
    }
  }

  return null;
}

/**
 * Clears the revealed gift cookie
 */
export function clearRevealedCookie(): void {
  document.cookie = `${COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}
