export interface Participant {
  name: string;
}

export interface SecretSantaConfig {
  participants: Participant[];
  prizeValue: number;
  eventDate: string;
  matches: Match[];
}

export interface Match {
  giver: string;
  receiver: string;
}

export interface RevealedGift {
  participant: string;
  receiver: string;
  revealedAt: string;
  expiresAt: string;
}
