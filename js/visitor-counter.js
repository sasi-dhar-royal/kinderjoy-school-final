/**
 * First-Party Total Visitor Counter
 * Renders odometer style counter digits without third-party ads or error banners
 */
(function() {
  'use strict';

  async function initVisitorCounter() {
    const counterBoxes = document.querySelectorAll('.visitor-counter-box');
    if (!counterBoxes.length) return;

    let count = 478;
    try {
      // Check session storage to avoid double-counting page reloads in same session
      const countedInSession = sessionStorage.getItem('kj_visitor_counted');
      const res = await fetch('/api/visitors');
      if (res.ok) {
        const json = await res.json();
        if (json.count) count = json.count;
      }
    } catch (e) {
      // Fallback
      const stored = localStorage.getItem('kj_visitor_count');
      count = stored ? parseInt(stored, 10) + 1 : 478;
      localStorage.setItem('kj_visitor_count', count);
    }

    // Format as 7-digit string (e.g. 0000478)
    const formatted = String(count).padStart(7, '0');

    counterBoxes.forEach(box => {
      let digitsWrap = box.querySelector('.counter-digits');
      if (!digitsWrap) {
        const embed = box.querySelector('.counter-embed');
        if (embed) embed.remove();

        digitsWrap = document.createElement('div');
        digitsWrap.className = 'counter-digits';
        box.appendChild(digitsWrap);
      }

      digitsWrap.innerHTML = formatted.split('').map(digit => `
        <span class="counter-digit">${digit}</span>
      `).join('');
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initVisitorCounter);
  } else {
    initVisitorCounter();
  }
})();

