import type { SecretSantaConfig, RevealedGift } from '../types';

export class RevealPage {
  private config: SecretSantaConfig;
  private revealed: RevealedGift | null = null;

  constructor(config: SecretSantaConfig) {
    this.config = config;
  }

  render(): string {
    // Check if already revealed
    if (this.revealed) {
      return this.renderAlreadyRevealed();
    }

    return this.renderSelection();
  }

  private renderSelection(): string {
    const participantNames = this.config.participants.map((p) => p.name).sort();
    const eventDate = new Date(this.config.eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <div class="min-h-screen flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
        <!-- Decorative snowflakes -->
        <div class="absolute inset-0 pointer-events-none" id="snowflakes"></div>

        <div class="card-christmas max-w-2xl w-full relative z-10 p-4 sm:p-6 md:p-8">
          <div class="text-center mb-4 sm:mb-8">
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-christmas-red mb-2">🎅 Secret Santa</h1>
            <p class="text-lg sm:text-xl md:text-2xl text-christmas-green mb-3 sm:mb-4">Gift Exchange</p>

            <div class="bg-christmas-cream rounded-lg sm:rounded-xl p-3 sm:p-4 inline-block">
              <p class="text-sm sm:text-base md:text-lg"><strong>📅 Event Date:</strong> ${eventDate}</p>
              <p class="text-sm sm:text-base md:text-lg"><strong>💰 Budget:</strong> $${this.config.prizeValue}</p>
            </div>
          </div>

          <!-- Instructions -->
          <div class="bg-christmas-green text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <h2 class="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-center">📜 Instructions</h2>
            <ol class="space-y-1 sm:space-y-2 text-sm sm:text-base md:text-lg">
              <li>1️⃣ Select your name from the list below</li>
              <li>2️⃣ Confirm it's really you (no peeking!)</li>
              <li>3️⃣ Discover who you're buying a gift for</li>
              <li>4️⃣ Keep it secret! 🤫</li>
            </ol>
          </div>

          <!-- Selection Form -->
          <div id="selection-form">
            <label class="block text-lg sm:text-xl font-bold text-christmas-darkgreen mb-3 sm:mb-4">
              👤 Who are you?
            </label>

            <div class="space-y-2 sm:space-y-3 mb-4 sm:mb-6">
              ${participantNames
                .map(
                  (name) => `
                <button
                  type="button"
                  class="participant-select w-full p-3 sm:p-4 bg-white border-3 border-christmas-green rounded-lg sm:rounded-xl hover:bg-christmas-cream hover:scale-105 transition-all duration-200 text-base sm:text-lg md:text-xl font-semibold text-christmas-darkgreen"
                  data-name="${this.escapeHtml(name)}"
                >
                  🎁 ${this.escapeHtml(name)}
                </button>
              `
                )
                .join('')}
            </div>
          </div>

          <!-- Confirmation Modal (hidden initially) -->
          <div id="confirmation-modal" class="hidden">
            <div class="bg-christmas-red text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center">
              <h2 class="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">⚠️ Wait!</h2>
              <p class="text-base sm:text-xl mb-2">Are you really:</p>
              <p class="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6" id="confirm-name"></p>
              <p class="mb-4 sm:mb-6 text-sm sm:text-base">Make sure nobody else is looking! 👀</p>

              <div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <button id="confirm-yes" class="btn-christmas bg-christmas-green text-white flex-1 text-base sm:text-xl py-2 sm:py-3">
                  ✅ Yes, that's me!
                </button>
                <button id="confirm-no" class="btn-christmas bg-white text-christmas-red flex-1 text-base sm:text-xl py-2 sm:py-3">
                  ❌ No, go back
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderAlreadyRevealed(): string {
    const eventDate = new Date(this.config.eventDate).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    return `
      <div class="min-h-screen flex items-center justify-center p-2 sm:p-4 relative overflow-hidden">
        <!-- Decorative snowflakes -->
        <div class="absolute inset-0 pointer-events-none" id="snowflakes"></div>

        <div class="card-christmas max-w-2xl w-full relative z-10 text-center p-4 sm:p-6 md:p-8">
          <div class="mb-4 sm:mb-8">
            <h1 class="text-3xl sm:text-4xl md:text-5xl font-bold text-christmas-red mb-2">🎅 Secret Santa</h1>
            <p class="text-lg sm:text-xl md:text-2xl text-christmas-green mb-3 sm:mb-4">Your Assignment</p>
          </div>

          <div class="bg-christmas-cream rounded-xl sm:rounded-2xl p-4 sm:p-6 md:p-8 mb-4 sm:mb-6">
            <p class="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4">Hello, <strong>${this.escapeHtml(this.revealed!.participant)}</strong>! 👋</p>
            <p class="text-base sm:text-lg md:text-xl mb-4 sm:mb-6">You're buying a gift for:</p>

            <div class="bg-christmas-green text-white rounded-lg sm:rounded-xl p-4 sm:p-6 md:p-8 transform sm:scale-110">
              <p class="text-2xl sm:text-3xl md:text-4xl font-bold mb-2">🎁</p>
              <p class="text-3xl sm:text-4xl md:text-5xl font-bold">${this.escapeHtml(this.revealed!.receiver)}</p>
              <p class="text-2xl sm:text-3xl md:text-4xl font-bold mt-2">🎁</p>
            </div>
          </div>

          <div class="bg-christmas-red text-white rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6">
            <p class="text-sm sm:text-base md:text-xl mb-1 sm:mb-2">📅 Event Date: <strong>${eventDate}</strong></p>
            <p class="text-sm sm:text-base md:text-xl">💰 Budget: <strong>$${this.config.prizeValue}</strong></p>
          </div>

          <div class="bg-yellow-100 border-3 border-christmas-gold rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
            <p class="text-sm sm:text-base md:text-lg text-christmas-darkgreen">
              <strong>🤫 Remember:</strong> Keep it secret! Don't tell anyone who you got!
            </p>
          </div>

          <button id="back-button" class="btn-christmas bg-christmas-green text-white w-full text-base sm:text-xl py-2 sm:py-3">
            ⬅️ Back to Selection
          </button>
        </div>
      </div>
    `;
  }

  attachEventListeners(): void {
    this.generateSnowflakes();

    if (this.revealed) {
      // Add back button handler
      const backBtn = document.getElementById('back-button');
      backBtn?.addEventListener('click', () => {
        this.revealed = null;
        const app = document.querySelector<HTMLDivElement>('#app');
        if (app) {
          app.innerHTML = this.render();
          this.attachEventListeners();
        }
      });
      return;
    }

    // Participant selection
    document.querySelectorAll('.participant-select').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        const name = (e.currentTarget as HTMLElement).dataset.name || '';
        this.showConfirmation(name);
      });
    });
  }

  private showConfirmation(name: string): void {
    const selectionForm = document.getElementById('selection-form');
    const confirmModal = document.getElementById('confirmation-modal');
    const confirmNameEl = document.getElementById('confirm-name');

    if (selectionForm && confirmModal && confirmNameEl) {
      selectionForm.classList.add('hidden');
      confirmModal.classList.remove('hidden');
      confirmNameEl.textContent = name;

      // Yes button
      const yesBtn = document.getElementById('confirm-yes');
      yesBtn?.addEventListener('click', () => {
        this.revealMatch(name);
      });

      // No button
      const noBtn = document.getElementById('confirm-no');
      noBtn?.addEventListener('click', () => {
        selectionForm.classList.remove('hidden');
        confirmModal.classList.add('hidden');
      });
    }
  }

  private revealMatch(participantName: string): void {
    // Find the match
    const match = this.config.matches.find((m) => m.giver === participantName);

    if (!match) {
      alert('Error: Could not find your assignment. Please contact the organizer.');
      return;
    }

    // Create revealed object
    const revealed: RevealedGift = {
      participant: participantName,
      receiver: match.receiver,
      revealedAt: new Date().toISOString(),
      expiresAt: new Date(this.config.eventDate + 'T23:59:59').toISOString(),
    };

    // Update state and re-render
    this.revealed = revealed;
    const app = document.querySelector<HTMLDivElement>('#app');
    if (app) {
      app.innerHTML = this.render();
      this.attachEventListeners();
    }
  }

  private generateSnowflakes(): void {
    const container = document.getElementById('snowflakes');
    if (!container) return;

    const snowflakes = ['❄️', '❅', '❆'];
    const count = 20;

    for (let i = 0; i < count; i++) {
      const snowflake = document.createElement('div');
      snowflake.className = 'snowflake absolute text-2xl opacity-70';
      snowflake.textContent = snowflakes[Math.floor(Math.random() * snowflakes.length)];
      snowflake.style.left = `${Math.random() * 100}%`;
      snowflake.style.animationDuration = `${Math.random() * 10 + 10}s`;
      snowflake.style.animationDelay = `${Math.random() * 5}s`;
      container.appendChild(snowflake);
    }
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
