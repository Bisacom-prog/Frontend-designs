// Shared cookie-manager opener for static pages.
// Primary site consent logic lives in assets/js/main.js and uses ba_cookie_consent_v1.
// This file ensures that "Manage Cookies" works from any page (footer, legal pages, etc.).

(function () {
  'use strict';

  const CONSENT_KEY = 'ba_cookie_consent_v1';

  function readConsent() {
    try {
      return JSON.parse(localStorage.getItem(CONSENT_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function writeConsent(consent) {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(consent));
  }

  function buildFallbackModal() {
    const existing = document.getElementById('cookieManagerFallback');
    if (existing) return existing;

    const c = readConsent() || { necessary: true, analytics: false, marketing: false };

    const overlay = document.createElement('div');
    overlay.id = 'cookieManagerFallback';
    overlay.className = 'fixed inset-0 z-50 bg-black/50 flex items-center justify-center px-4';

    overlay.innerHTML = `
      <div class="bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-xl shadow-xl max-w-lg w-full p-6 text-sm">
        <div class="flex items-start justify-between gap-4">
          <div>
            <h2 class="text-lg font-semibold">Cookie Preferences</h2>
            <p class="mt-1 text-gray-600 dark:text-gray-400">
              Essential cookies are always on. You can choose whether to allow analytics or marketing cookies.
            </p>
          </div>
          <button type="button" class="text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-100" data-close>
            ✕
          </button>
        </div>

        <div class="mt-5 space-y-4">
          <label class="flex items-start justify-between gap-4">
            <div>
              <p class="font-medium">Essential (necessary)</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">Required for the website to function.</p>
            </div>
            <input type="checkbox" checked disabled class="mt-1" />
          </label>

          <label class="flex items-start justify-between gap-4">
            <div>
              <p class="font-medium">Analytics</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">Helps improve the site (only if enabled).</p>
            </div>
            <input id="fallbackAnalytics" type="checkbox" class="mt-1" ${c.analytics ? 'checked' : ''} />
          </label>

          <label class="flex items-start justify-between gap-4">
            <div>
              <p class="font-medium">Marketing</p>
              <p class="text-xs text-gray-600 dark:text-gray-400">Used for advertising/personalisation (only if enabled).</p>
            </div>
            <input id="fallbackMarketing" type="checkbox" class="mt-1" ${c.marketing ? 'checked' : ''} />
          </label>
        </div>

        <div class="mt-6 flex flex-wrap justify-end gap-3">
          <button type="button" class="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800" data-reject>
            Reject all
          </button>
          <button type="button" class="px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800" data-accept>
            Accept all
          </button>
          <button type="button" class="px-4 py-2 rounded-lg bg-primary text-white hover:opacity-95" data-save>
            Save preferences
          </button>
        </div>

        <p class="mt-4 text-xs text-gray-500 dark:text-gray-500">
          Your choice is saved in your browser. You can change it any time via “Manage Cookies”.
        </p>
      </div>
    `;

    function close() { overlay.remove(); }

    overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
    overlay.querySelector('[data-close]').addEventListener('click', close);

    overlay.querySelector('[data-reject]').addEventListener('click', () => {
      writeConsent({ necessary: true, analytics: false, marketing: false, ts: Date.now() });
      close();
      location.reload();
    });

    overlay.querySelector('[data-accept]').addEventListener('click', () => {
      writeConsent({ necessary: true, analytics: true, marketing: true, ts: Date.now() });
      close();
      location.reload();
    });

    overlay.querySelector('[data-save]').addEventListener('click', () => {
      const analytics = !!overlay.querySelector('#fallbackAnalytics')?.checked;
      const marketing = !!overlay.querySelector('#fallbackMarketing')?.checked;
      writeConsent({ necessary: true, analytics, marketing, ts: Date.now() });
      close();
      location.reload();
    });

    document.body.appendChild(overlay);
    return overlay;
  }

  window.openCookieManager = function () {
    // If the main cookie modal exists (index page), open it via its existing wiring.
    const manageBtn = document.getElementById('cookieManage') || document.getElementById('manageCookiesBtn');
    if (manageBtn) {
      manageBtn.click();
      return;
    }
    const modal = document.getElementById('cookieModal');
    if (modal) {
      modal.classList.remove('hidden');
      return;
    }
    // Otherwise show fallback modal (policy pages, etc.)
    buildFallbackModal();
  };
})();
