/**
 * First-Party Total Visitor Counter
 * Renders odometer style counter digits without third-party ads or error banners
 */
(function() {
  'use strict';

  async function initVisitorCounter() {
    const counterBoxes = document.querySelectorAll('.visitor-counter-box');
    if (!counterBoxes.length) return;

    let count = null;
    try {
      const res = await fetch('/api/visitors');
      if (res.ok) {
        const json = await res.json();
        if (typeof json.count === 'number') count = json.count;
      }
    } catch (e) {
      // Offline fallback: load last known count from localStorage
      const stored = localStorage.getItem('kj_last_visitor_count');
      if (stored) count = parseInt(stored, 10);
    }

    if (count !== null) {
      localStorage.setItem('kj_last_visitor_count', count);
      // Format as 7-digit string (e.g. 0000571)
      const formatted = String(count).padStart(7, '0');

      counterBoxes.forEach(box => {
        let digitsWrap = box.querySelector('.counter-digits');
        if (!digitsWrap) {
          digitsWrap = document.createElement('div');
          digitsWrap.className = 'counter-digits';
          box.appendChild(digitsWrap);
        }

        digitsWrap.innerHTML = formatted.split('').map(digit => `
          <span class="counter-digit">${digit}</span>
        `).join('');
      });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisitorCounter);
  } else {
    initVisitorCounter();
  }
})();

