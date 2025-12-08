import type { Match, Participant } from '../types';

/**
 * Fisher-Yates shuffle algorithm
 */
function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

/**
 * Creates Secret Santa matches ensuring no one gets themselves
 * Uses a derangement algorithm to ensure valid pairings
 */
export function createMatches(participants: Participant[]): Match[] {
  if (participants.length < 2) {
    throw new Error('Need at least 2 participants');
  }

  const names = participants.map(p => p.name);
  let receivers = shuffle([...names]);

  // Ensure no one gets themselves (derangement)
  let attempts = 0;
  const maxAttempts = 100;

  while (attempts < maxAttempts) {
    let valid = true;

    for (let i = 0; i < names.length; i++) {
      if (names[i] === receivers[i]) {
        valid = false;
        break;
      }
    }

    if (valid) {
      break;
    }

    receivers = shuffle([...names]);
    attempts++;
  }

  // If we couldn't find a valid arrangement, use swap method
  if (attempts === maxAttempts) {
    for (let i = 0; i < names.length; i++) {
      if (names[i] === receivers[i]) {
        // Swap with next person (wrapping around)
        const swapIndex = (i + 1) % names.length;
        [receivers[i], receivers[swapIndex]] = [receivers[swapIndex], receivers[i]];
      }
    }
  }

  return names.map((giver, index) => ({
    giver,
    receiver: receivers[index]
  }));
}
