import type { Participant } from '../types';
import { createMatches } from '../utils/matching';
import { generateShareableUrl } from '../utils/encoding';

export class OrganizerPage {
  private participants: Participant[] = [];

  render(): string {
    return `
      <div class="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <!-- Decorative snowflakes -->
        <div class="absolute inset-0 pointer-events-none" id="snowflakes"></div>

        <div class="card-christmas max-w-2xl w-full relative z-10">
          <div class="text-center mb-8">
            <h1 class="text-5xl font-bold text-christmas-red mb-2">🎅 Secret Santa</h1>
            <p class="text-2xl text-christmas-green">Gift Exchange Organizer</p>
          </div>

          <form id="organizer-form" class="space-y-6">
            <!-- Participants Section -->
            <div class="bg-christmas-cream rounded-2xl p-6">
              <label class="block text-xl font-bold text-christmas-darkgreen mb-4">
                🎁 Participants
              </label>

              <div id="participants-list" class="space-y-3 mb-4">
                ${this.renderParticipants()}
              </div>

              <div class="flex gap-2">
                <input
                  type="text"
                  id="new-participant"
                  placeholder="Enter participant name"
                  class="input-christmas flex-1"
                />
                <button
                  type="button"
                  id="add-participant"
                  class="btn-secondary whitespace-nowrap"
                >
                  ➕ Add
                </button>
              </div>
              <p class="text-sm text-gray-600 mt-2">Minimum 2 participants required</p>
            </div>

            <!-- Prize Value -->
            <div>
              <label class="block text-xl font-bold text-christmas-darkgreen mb-2">
                💰 Gift Budget
              </label>
              <div class="relative">
                <span class="absolute left-4 top-1/2 transform -translate-y-1/2 text-xl">$</span>
                <input
                  type="number"
                  id="prize-value"
                  min="1"
                  step="1"
                  placeholder="25"
                  class="input-christmas pl-10"
                  required
                />
              </div>
            </div>

            <!-- Event Date -->
            <div>
              <label class="block text-xl font-bold text-christmas-darkgreen mb-2">
                📅 Secret Santa Date
              </label>
              <input
                type="date"
                id="event-date"
                class="input-christmas"
                required
              />
            </div>

            <!-- Submit Button -->
            <button
              type="submit"
              class="btn-primary w-full text-xl py-4"
            >
              🎄 Generate Secret Santa Matches! 🎄
            </button>
          </form>

          <!-- Result Section (hidden initially) -->
          <div id="result-section" class="hidden mt-8 p-6 bg-christmas-green text-white rounded-2xl">
            <h2 class="text-2xl font-bold mb-4 text-center">✨ Matches Generated! ✨</h2>
            <p class="mb-4 text-center">Share this link with all participants:</p>

            <div class="bg-white text-christmas-darkgreen p-4 rounded-xl break-all mb-4">
              <code id="shareable-link" class="text-sm"></code>
            </div>

            <div class="flex gap-2">
              <button id="copy-link" class="btn-christmas bg-christmas-red text-white flex-1">
                📋 Copy Link
              </button>
              <button id="reset-form" class="btn-christmas bg-christmas-brown text-white flex-1">
                🔄 Start Over
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  private renderParticipants(): string {
    if (this.participants.length === 0) {
      return '<p class="text-gray-500 text-center py-4">No participants added yet</p>';
    }

    return this.participants
      .map(
        (p, index) => `
        <div class="flex items-center gap-2 bg-white p-3 rounded-xl">
          <span class="text-2xl">🎅</span>
          <span class="flex-1 font-semibold text-christmas-darkgreen">${this.escapeHtml(p.name)}</span>
          <button
            type="button"
            class="remove-participant text-christmas-red hover:bg-red-100 rounded-full w-8 h-8 flex items-center justify-center"
            data-index="${index}"
          >
            ❌
          </button>
        </div>
      `
      )
      .join('');
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  attachEventListeners(): void {
    // Add participant
    const addBtn = document.getElementById('add-participant');
    const input = document.getElementById('new-participant') as HTMLInputElement;

    const addParticipant = () => {
      const name = input.value.trim();
      if (name) {
        this.participants.push({ name });
        this.updateParticipantsList();
        input.value = '';
        input.focus();
      }
    };

    addBtn?.addEventListener('click', addParticipant);
    input?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        addParticipant();
      }
    });

    // Form submission
    const form = document.getElementById('organizer-form');
    form?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSubmit();
    });

    // Set minimum date to today
    const dateInput = document.getElementById('event-date') as HTMLInputElement;
    if (dateInput) {
      const today = new Date().toISOString().split('T')[0];
      dateInput.min = today;
      // Set default to 2 weeks from now
      const defaultDate = new Date();
      defaultDate.setDate(defaultDate.getDate() + 14);
      dateInput.value = defaultDate.toISOString().split('T')[0];
    }

    // Generate snowflakes
    this.generateSnowflakes();
  }

  private updateParticipantsList(): void {
    const list = document.getElementById('participants-list');
    if (list) {
      list.innerHTML = this.renderParticipants();

      // Reattach remove buttons
      document.querySelectorAll('.remove-participant').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const index = parseInt((e.currentTarget as HTMLElement).dataset.index || '0');
          this.participants.splice(index, 1);
          this.updateParticipantsList();
        });
      });
    }
  }

  private handleSubmit(): void {
    if (this.participants.length < 2) {
      alert('Please add at least 2 participants!');
      return;
    }

    const prizeValue = parseFloat(
      (document.getElementById('prize-value') as HTMLInputElement).value
    );
    const eventDate = (document.getElementById('event-date') as HTMLInputElement).value;

    if (!prizeValue || !eventDate) {
      alert('Please fill in all fields!');
      return;
    }

    // Generate matches
    const matches = createMatches(this.participants);

    const config = {
      participants: this.participants,
      prizeValue,
      eventDate,
      matches,
    };

    // Generate URL
    const url = generateShareableUrl(config);

    // Show result
    const resultSection = document.getElementById('result-section');
    const linkElement = document.getElementById('shareable-link');

    if (resultSection && linkElement) {
      linkElement.textContent = url;
      resultSection.classList.remove('hidden');

      // Scroll to result
      resultSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

      // Copy link handler
      document.getElementById('copy-link')?.addEventListener('click', () => {
        navigator.clipboard.writeText(url).then(() => {
          alert('Link copied to clipboard! 🎉');
        });
      });

      // Reset handler
      document.getElementById('reset-form')?.addEventListener('click', () => {
        window.location.reload();
      });
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
}
