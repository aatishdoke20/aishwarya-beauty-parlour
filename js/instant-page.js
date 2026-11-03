/**
 * Instant Navigation & Speculative Prefetching
 * Speeds up page-to-page navigation for Aishwarya Beauty Parlour
 * Prefetches internal HTML pages on hover/touchstart so transitions are instantaneous
 */
(function() {
  'use strict';

  // Respect data saver mode and connection quality
  if (navigator.connection && (navigator.connection.saveData || /2g/.test(navigator.connection.effectiveType))) {
    return;
  }

  const prefetched = new Set();
  const currentOrigin = window.location.origin;

  function prefetch(url) {
    if (!url || prefetched.has(url)) return;
    try {
      const parsed = new URL(url, window.location.href);
      // Only internal pages
      if (parsed.origin !== currentOrigin) return;
      // Skip non-HTML files
      if (/\.(jpg|jpeg|png|webp|gif|svg|pdf|zip|mp4|css|js|xml)$/i.test(parsed.pathname)) return;
      // Skip same page hash jumps
      if (parsed.pathname === window.location.pathname && parsed.hash) return;

      prefetched.add(url);

      const link = document.createElement('link');
      link.rel = 'prefetch';
      link.href = url;
      link.as = 'document';
      document.head.appendChild(link);
    } catch (e) {
      // Invalid URL ignore
    }
  }

  function getInternalAnchor(target) {
    const a = target.closest('a');
    if (!a || !a.href) return null;
    if (a.target === '_blank' || a.hasAttribute('download')) return null;
    if (a.href.startsWith('tel:') || a.href.startsWith('mailto:') || a.href.includes('wa.me')) return null;
    return a;
  }

  let hoverTimeout = null;

  // Desktop: prefetch when user hovers for 65ms (intent to click)
  document.addEventListener('mouseover', function(e) {
    const a = getInternalAnchor(e.target);
    if (!a) return;
    clearTimeout(hoverTimeout);
    hoverTimeout = setTimeout(function() {
      prefetch(a.href);
    }, 65);
  }, { passive: true });

  document.addEventListener('mouseout', function() {
    clearTimeout(hoverTimeout);
  }, { passive: true });

  // Mobile: prefetch immediately on touchstart (~100-200ms before click event fires)
  document.addEventListener('touchstart', function(e) {
    const a = getInternalAnchor(e.target);
    if (!a) return;
    prefetch(a.href);
  }, { passive: true });

  // Also prefetch key navigation links once DOM is idle
  function prefetchKeyRoutes() {
    const keyLinks = ['/services.html', '/about.html', '/blog/', '/bridal-makeup.html', '/location.html', '/contact.html'];
    keyLinks.forEach(function(route) {
      if (route !== window.location.pathname) {
        prefetch(route);
      }
    });
  }

  if (window.requestIdleCallback) {
    window.requestIdleCallback(prefetchKeyRoutes, { timeout: 2000 });
  } else {
    setTimeout(prefetchKeyRoutes, 1500);
  }
})();
