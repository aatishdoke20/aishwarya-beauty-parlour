import { BUSINESS_CONFIG } from './config.js';

document.addEventListener('DOMContentLoaded', () => {
  initWhatsAppFlow();
  initPhoneFlow();
  initDirectionsFlow();
  initMobileNavigation();
  initModalHandling();
  initAddressCopy();
  initDynamicYear();
  initCategoryExpandables();
  initHomeServiceFilters();
  initServicesCatalogFilter();
  initFaqAccordion();
  initReviewsRendering();
  syncServicesFromConfig();
  initServicesExpandBtn();
  initBackToTop();
});

/**
 * Contextual WhatsApp Presets specified by client:
 * Hero: “Hello, I would like to enquire about your beauty services.”
 * Bridal CTA: “Hello, I would like to enquire about bridal makeup and hairstyling.”
 * Services CTA: “Hello, I would like to know more about your beauty services.”
 * Gallery CTA: “Hello, I would like to enquire about the services shown in your gallery.”
 */
export const WHATSAPP_PRESET_MESSAGES = {
  // Required core CTAs
  'hero': 'Hello, I would like to enquire about your beauty services.',
  'bridal-cta': 'Hello, I would like to enquire about bridal makeup and hairstyling.',
  'bridal': 'Hello, I would like to enquire about bridal makeup and hairstyling.',
  'bridal-makeup': 'Hello, I would like to enquire about bridal makeup and hairstyling.',
  'services-cta': 'Hello, I would like to know more about your beauty services.',
  'services': 'Hello, I would like to know more about your beauty services.',
  'gallery-cta': 'Hello, I would like to enquire about the services shown in your gallery.',
  'gallery': 'Hello, I would like to enquire about the services shown in your gallery.',
  'general': 'Hello, I would like to enquire about your beauty services.',

  // Hair Treatment Sub-services
  'hair-spa': 'Hello, I would like to enquire about Hair Spa therapy at Aishwarya Beauty Parlour Manchar.',
  'keratin-treatment': 'Hello, I would like to enquire about Keratin Treatment at Aishwarya Beauty Parlour Manchar.',
  'hair-smoothening': 'Hello, I would like to enquire about Hair Smoothening at Aishwarya Beauty Parlour Manchar.',
  'hair-straightening': 'Hello, I would like to enquire about Hair Straightening at Aishwarya Beauty Parlour Manchar.',
  'hair-botox': 'Hello, I would like to enquire about Hair Botox Treatment at Aishwarya Beauty Parlour Manchar.',

  // Waxing Sub-services
  'regular-wax': 'Hello, I would like to enquire about Regular Waxing at Aishwarya Beauty Parlour Manchar.',
  'rica-wax': 'Hello, I would like to enquire about Rica Liposoluble Waxing at Aishwarya Beauty Parlour Manchar.',
  'chocolate-wax': 'Hello, I would like to enquire about Chocolate Waxing at Aishwarya Beauty Parlour Manchar.',
  'honey-wax': 'Hello, I would like to enquire about Honey Waxing at Aishwarya Beauty Parlour Manchar.',
  'rollon-wax': 'Hello, I would like to enquire about Roll-On Waxing at Aishwarya Beauty Parlour Manchar.',

  // Bridal Specific Sub-services
  'traditional-bridal-makeup': 'Hello, I would like to enquire about Traditional Bridal Makeup at Aishwarya Beauty Parlour Manchar.',
  'hd-bridal-makeup': 'Hello, I would like to enquire about HD Bridal Makeup at Aishwarya Beauty Parlour Manchar.',
  'airbrush-bridal-makeup': 'Hello, I would like to enquire about Airbrush Bridal Makeup at Aishwarya Beauty Parlour Manchar.',
  'natural-bridal-makeup': 'Hello, I would like to enquire about Natural Bridal Makeup at Aishwarya Beauty Parlour Manchar.',
  'reception-makeup': 'Hello, I would like to enquire about Reception Makeup at Aishwarya Beauty Parlour Manchar.',
  'engagement-makeup': 'Hello, I would like to enquire about Engagement & Roka Makeup at Aishwarya Beauty Parlour Manchar.',

  // Category Overviews
  'haircut': 'Hello, I would like to enquire about haircut and hairdressing services at Aishwarya Beauty Parlour Manchar.',
  'ladies-haircut': 'Hello, I would like to enquire about ladies haircut and styling at Aishwarya Beauty Parlour Manchar.',
  'hair-treatment': 'Hello, I would like to enquire about hair treatments and hair spa at Aishwarya Beauty Parlour Manchar.',
  'waxing': 'Hello, I would like to enquire about waxing services at Aishwarya Beauty Parlour Manchar.',
  'custom-bridal-package': 'Hello, I would like to enquire about custom wedding and event beauty packages at Aishwarya Beauty Parlour Manchar.',
  'hairstyling': 'Hello, I would like to enquire about hairstyling at Aishwarya Beauty Parlour Manchar.',
  'eyebrow-threading': 'Hello, I would like to enquire about eyebrow threading at Aishwarya Beauty Parlour Manchar.',
  'facial-skincare': 'Hello, I would like to enquire about facial and skincare services at Aishwarya Beauty Parlour Manchar.',
  'facial': 'Hello, I would like to enquire about facial and skincare services at Aishwarya Beauty Parlour Manchar.',
  'academy': 'Hello, I would like to enquire about professional beauty training courses at Aishwarya Beauty Parlour Manchar.'
};

export function getWhatsAppMessage(context = 'general') {
  return WHATSAPP_PRESET_MESSAGES[context] || WHATSAPP_PRESET_MESSAGES.general;
}

export function generateWhatsAppUrl(context = 'general') {
  let rawNumber = (BUSINESS_CONFIG.whatsappNumber || BUSINESS_CONFIG.phoneNumber || '').replace(/[^0-9]/g, '');
  if (!rawNumber) return null;
  // If 10-digit Indian number without country code, prepend 91
  if (rawNumber.length === 10) {
    rawNumber = '91' + rawNumber;
  }
  if (rawNumber.length < 10) return null;
  const message = getWhatsAppMessage(context);
  return `https://wa.me/${rawNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Handle all WhatsApp triggers across the site with exact contextual messaging.
 * Compatible with Android, iPhone, and Desktop WhatsApp Web via universal wa.me link.
 */
function initWhatsAppFlow() {
  const whatsappButtons = document.querySelectorAll('.js-whatsapp-btn');

  whatsappButtons.forEach(button => {
    const serviceContext = button.getAttribute('data-service') || 'general';
    const whatsappUrl = generateWhatsAppUrl(serviceContext);

    // If anchor tag, pre-populate href and target so browser context menus and fallbacks work
    if (whatsappUrl && button.tagName.toLowerCase() === 'a') {
      button.setAttribute('href', whatsappUrl);
      button.setAttribute('target', '_blank');
      button.setAttribute('rel', 'noopener noreferrer');
    }

    button.addEventListener('click', (e) => {
      e.preventDefault();
      triggerWhatsApp(serviceContext);
    });
  });

  function triggerWhatsApp(context) {
    const whatsappUrl = generateWhatsAppUrl(context);
    const message = getWhatsAppMessage(context);

    if (whatsappUrl) {
      // Direct redirect on mobile devices to immediately invoke native WhatsApp app
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || (window.innerWidth <= 768);

      if (isMobile) {
        window.location.href = whatsappUrl;
      } else {
        const win = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        // Fallback if popup blocker intercepted the new tab
        if (!win || win.closed || typeof win.closed === 'undefined') {
          window.location.href = whatsappUrl;
        }
      }
    } else {
      // Gracefully open the configuration / contact advisory modal if number is missing
      openModal('whatsappModal', message);
    }
  }
}

/**
 * Handle direct Phone calling flow.
 * When phoneNumber exists: attaches tel: link for one-tap dialing.
 * When phoneNumber is blank: displays polite contact advisory dialog.
 */
function initPhoneFlow() {
  const phoneButtons = document.querySelectorAll('.js-phone-btn');
  const rawPhone = (BUSINESS_CONFIG.phoneNumber || '').replace(/[^0-9+]/g, '');

  phoneButtons.forEach(button => {
    if (rawPhone && rawPhone.length >= 7) {
      if (button.tagName.toLowerCase() === 'a') {
        button.setAttribute('href', `tel:${rawPhone}`);
      } else {
        button.addEventListener('click', (e) => {
          e.preventDefault();
          window.location.href = `tel:${rawPhone}`;
        });
      }
    } else {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        openModal('phoneModal');
      });
    }
  });
}

/**
 * Ensure all Get Directions CTAs across the site point to official Google Maps URL.
 */
function initDirectionsFlow() {
  const directionButtons = document.querySelectorAll('.js-directions-btn');
  const mapsUrl = BUSINESS_CONFIG.mapsUrl || 'https://maps.app.goo.gl/HJ5yTbCJdpzcWc3k9';

  directionButtons.forEach(button => {
    if (button.tagName.toLowerCase() === 'a') {
      button.setAttribute('href', mapsUrl);
      button.setAttribute('target', '_blank');
      button.setAttribute('rel', 'noopener noreferrer');
    } else {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        window.open(mapsUrl, '_blank', 'noopener,noreferrer');
      });
    }
  });
}

/**
 * Mobile Navigation Drawer
 */
function initMobileNavigation() {
  const toggleBtn = document.getElementById('mobileMenuToggle');
  const closeBtn = document.getElementById('closeMobileNav');
  const drawer = document.getElementById('mobileNavDrawer');
  const backdrop = document.getElementById('mobileNavBackdrop');
  const navLinks = document.querySelectorAll('.mobile-nav-link');

  if (!toggleBtn || !drawer || !backdrop) return;

  function openDrawer() {
    drawer.classList.add('open');
    backdrop.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    backdrop.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
    toggleBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  toggleBtn.addEventListener('click', openDrawer);
  if (closeBtn) closeBtn.addEventListener('click', closeDrawer);
  backdrop.addEventListener('click', closeDrawer);

  navLinks.forEach(link => {
    link.addEventListener('click', closeDrawer);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && drawer.classList.contains('open')) {
      closeDrawer();
    }
  });
}

/**
 * Accessible Modal System with contextual message display
 */
function openModal(modalId, contextualText = '') {
  const modal = document.getElementById(modalId);
  if (!modal) return;

  const inquirySnippet = modal.querySelector('.modal-inquiry-snippet');
  if (inquirySnippet && contextualText) {
    inquirySnippet.textContent = `"${contextualText}"`;
  }

  modal.classList.add('active');
  modal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const closeButton = modal.querySelector('.modal-close-btn');
  if (closeButton) closeButton.focus();
}

function closeModal(modal) {
  if (!modal) return;
  modal.classList.remove('active');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
}

function initModalHandling() {
  const modals = document.querySelectorAll('.modal-overlay');

  modals.forEach(modal => {
    const closeButtons = modal.querySelectorAll('.js-close-modal');
    closeButtons.forEach(btn => {
      btn.addEventListener('click', () => closeModal(modal));
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal-overlay.active');
      if (activeModal) closeModal(activeModal);
    }
  });
}

/**
 * Quick Copy Address helper
 */
function initAddressCopy() {
  const copyBtn = document.getElementById('copyAddressBtn');
  if (!copyBtn) return;

  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(BUSINESS_CONFIG.address);
      const originalText = copyBtn.innerHTML;
      copyBtn.innerHTML = `
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg> Address Copied!
      `;
      setTimeout(() => {
        copyBtn.innerHTML = originalText;
      }, 2500);
    } catch (err) {
      console.warn('Unable to copy to clipboard', err);
    }
  });
}

/**
 * Dynamic copyright year
 */
function initDynamicYear() {
  const yearElement = document.getElementById('currentYear');
  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }
}

/**
 * Mobile Expandable / Collapsible Category Details
 */
function initCategoryExpandables() {
  const expandButtons = document.querySelectorAll('.js-category-expand-btn');
  expandButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.getAttribute('data-target');
      const targetBlock = document.getElementById(targetId);
      if (!targetBlock) return;

      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isExpanded));
      targetBlock.classList.toggle('expanded', !isExpanded);

      const labelSpan = btn.querySelector('.expand-btn-text');
      if (labelSpan) {
        labelSpan.textContent = !isExpanded ? 'Hide Highlights' : 'View Service Highlights';
      }
    });
  });
}

/**
 * Sync Service Names, Badges, Descriptions and Notes from Central BUSINESS_CONFIG
 */
function syncServicesFromConfig() {
  if (!BUSINESS_CONFIG.services || !Array.isArray(BUSINESS_CONFIG.services)) return;

  BUSINESS_CONFIG.services.forEach(service => {
    const card = document.querySelector(`[data-category-id="${service.id}"]`);
    if (!card) return;

    // Sync Title
    const titleEl = card.querySelector('.js-service-title');
    if (titleEl && service.title) titleEl.textContent = service.title;

    // Sync Description
    const descEl = card.querySelector('.js-service-desc');
    if (descEl && service.description) descEl.textContent = service.description;

    // Sync Badge
    const badgeEl = card.querySelector('.js-service-badge');
    if (badgeEl && service.badge) badgeEl.textContent = service.badge;

    // Sync Note
    const noteEl = card.querySelector('.js-service-note');
    if (noteEl && service.note) noteEl.textContent = service.note;
  });
}

/**
 * Category Filter handling for Homepage Services Collection Grid
 */
function initHomeServiceFilters() {
  const filterButtons = document.querySelectorAll('.service-filter-btn, .service-pill-btn');
  const cards = document.querySelectorAll('.services-collection-grid .treatment-card');
  if (!filterButtons.length || !cards.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const filter = btn.getAttribute('data-filter');
      
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      cards.forEach(card => {
        const categories = (card.getAttribute('data-category') || '').split(/\s+/);
        if (filter === 'all' || categories.includes(filter)) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    });
  });
}

/**
 * Accessible FAQ Accordion handling for Services Page
 */
function initFaqAccordion() {
  const faqCards = document.querySelectorAll('.faq-card');
  if (!faqCards.length) return;

  faqCards.forEach(card => {
    const btn = card.querySelector('.faq-question-btn');
    if (!btn) return;

    btn.addEventListener('click', () => {
      const isActive = card.classList.contains('active');

      // Close other accordion cards for clean editorial UX
      faqCards.forEach(c => {
        if (c !== card) {
          c.classList.remove('active');
          const otherBtn = c.querySelector('.faq-question-btn');
          if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
        }
      });

      card.classList.toggle('active', !isActive);
      btn.setAttribute('aria-expanded', String(!isActive));
    });
  });
}

/**
 * Accessible Services Catalog Filtering
 */
function initServicesCatalogFilter() {
  const filterTabs = document.querySelectorAll('.services-filter-nav .filter-tab-btn');
  const cards = document.querySelectorAll('.services-catalog-grid .service-catalog-card');
  const catalogSection = document.getElementById('services-catalog');
  const faqSection = document.getElementById('service-faq');
  if (!filterTabs.length) return;

  filterTabs.forEach(tab => {
    tab.addEventListener('click', (e) => {
      const targetCategory = tab.getAttribute('data-filter');

      // Update active state on all tabs so Client FAQs activates immediately
      filterTabs.forEach(t => {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('active');
      tab.setAttribute('aria-selected', 'true');

      // If clicking Client FAQs, smoothly scroll to FAQ section
      if (targetCategory === 'faq' || tab.getAttribute('href') === '#service-faq') {
        if (faqSection) {
          e.preventDefault();
          faqSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
        return;
      }

      e.preventDefault();

      // If user was viewing FAQs or scrolled far below, smoothly return to top of catalog
      if (catalogSection && window.scrollY > (catalogSection.offsetTop + 450)) {
        catalogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      // Filter cards by category
      if (cards.length) {
        cards.forEach(card => {
          const cardCat = card.getAttribute('data-category') || '';
          if (targetCategory === 'all' || cardCat === targetCategory) {
            card.classList.remove('hidden');
          } else {
            card.classList.add('hidden');
          }
        });
      }
    });
  });

  // Scroll spy: automatically update active tab when user scrolls into FAQ section
  if (faqSection && 'IntersectionObserver' in window) {
    const faqObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const faqTab = document.querySelector('.services-filter-nav [data-filter="faq"]');
          if (faqTab) {
            filterTabs.forEach(t => {
              t.classList.remove('active');
              t.setAttribute('aria-selected', 'false');
            });
            faqTab.classList.add('active');
            faqTab.setAttribute('aria-selected', 'true');
          }
        }
      });
    }, { rootMargin: '-120px 0px -50% 0px', threshold: 0.1 });
    faqObserver.observe(faqSection);
  }
}

/**
 * Render Verified Customer Reviews from Central BUSINESS_CONFIG
 * Strictly authentic: only renders cards when every required field is populated with verified information.
 */
function initReviewsRendering() {
  const containers = document.querySelectorAll('.verified-reviews-grid');
  if (!containers.length) return;

  const reviewsList = Array.isArray(BUSINESS_CONFIG.reviews) ? BUSINESS_CONFIG.reviews : [];

  // Strictly filter only reviews that have all required non-empty fields
  const validReviews = reviewsList.filter(r => 
    r &&
    typeof r.author === 'string' && r.author.trim() !== '' &&
    typeof r.text === 'string' && r.text.trim() !== '' &&
    typeof r.rating === 'number' && r.rating >= 1 && r.rating <= 5 &&
    typeof r.source === 'string' && r.source.trim() !== '' &&
    typeof r.date === 'string' && r.date.trim() !== ''
  );

  if (validReviews.length === 0) {
    // No verified reviews provided yet: leave container empty and hidden
    containers.forEach(c => {
      c.innerHTML = '';
      c.style.display = 'none';
    });
    return;
  }

  const cardsHtml = validReviews.map(r => `
    <article class="verified-review-card">
      <div class="review-header">
        <div class="reviewer-meta">
          <span class="reviewer-avatar" aria-hidden="true">${escapeHtml(r.author.trim().charAt(0).toUpperCase())}</span>
          <div>
            <h4 class="reviewer-name">${escapeHtml(r.author.trim())}</h4>
            <span class="review-date">${escapeHtml(r.date.trim())} • via ${escapeHtml(r.source.trim())}</span>
          </div>
        </div>
        <div class="review-stars" aria-label="${r.rating} out of 5 stars">
          ${'★'.repeat(r.rating)}${'☆'.repeat(5 - r.rating)}
        </div>
      </div>
      <p class="review-text">"${escapeHtml(r.text.trim())}"</p>
      ${r.service ? `<span class="review-service-tag">${escapeHtml(r.service.trim())}</span>` : ''}
    </article>
  `).join('');

  containers.forEach(c => {
    c.style.display = '';
    c.innerHTML = cardsHtml;
  });
}

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}


/**
 * Mobile Progressive Disclosure for Services Grid
 */
function initServicesExpandBtn() {
  const expandBtn = document.getElementById('expandServicesBtn');
  const servicesGrid = document.getElementById('servicesGrid');
  if (!expandBtn || !servicesGrid) return;

  expandBtn.addEventListener('click', () => {
    const isExpanded = servicesGrid.classList.toggle('is-expanded');
    expandBtn.setAttribute('aria-expanded', String(isExpanded));
    const textSpan = expandBtn.querySelector('.expand-btn-text');
    if (textSpan) {
      textSpan.textContent = isExpanded 
        ? 'Show Less Services ▴' 
        : 'View All 15 Services (11 More) ▾';
    }
  });

  // When any category filter pill is clicked, ensure grid is expanded to show all matches
  const filterPills = document.querySelectorAll('.service-filter-btn, .service-pill-btn');
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      servicesGrid.classList.add('is-expanded');
      expandBtn.setAttribute('aria-expanded', 'true');
      const textSpan = expandBtn.querySelector('.expand-btn-text');
      if (textSpan) {
        textSpan.textContent = 'Show Less Services ▴';
      }
    });
  });
}

/**
 * Back to Top Floating Button
 */
function initBackToTop() {
  const backToTopBtn = document.getElementById('backToTopBtn');
  if (!backToTopBtn) return;

  window.addEventListener('scroll', () => {
    if (window.scrollY > 450) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}





