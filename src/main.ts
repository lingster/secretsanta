import './style.css';
import { OrganizerPage } from './components/OrganizerPage';
import { RevealPage } from './components/RevealPage';
import { decodeConfig } from './utils/encoding';

/**
 * Main application entry point
 */
function init() {
  const app = document.querySelector<HTMLDivElement>('#app');

  if (!app) {
    console.error('App container not found');
    return;
  }

  // Check if we have encoded data in URL
  const urlParams = new URLSearchParams(window.location.search);
  const encodedData = urlParams.get('data');

  if (encodedData) {
    // Show reveal page
    try {
      const config = decodeConfig(encodedData);
      const revealPage = new RevealPage(config);
      app.innerHTML = revealPage.render();
      revealPage.attachEventListeners();
    } catch (error) {
      console.error('Error decoding configuration:', error);
      app.innerHTML = `
        <div class="min-h-screen flex items-center justify-center p-4">
          <div class="card-christmas max-w-2xl text-center">
            <h1 class="text-4xl font-bold text-christmas-red mb-4">❌ Invalid Link</h1>
            <p class="text-xl text-christmas-darkgreen mb-6">
              This Secret Santa link appears to be invalid or corrupted.
            </p>
            <p class="text-lg text-gray-600">
              Please contact the organizer for a new link.
            </p>
          </div>
        </div>
      `;
    }
  } else {
    // Show organizer page
    const organizerPage = new OrganizerPage();
    app.innerHTML = organizerPage.render();
    organizerPage.attachEventListeners();
  }
}

// Initialize the app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
