import { GMAPS_GALLERY_ITEMS } from './gallery-data.js';

document.addEventListener('DOMContentLoaded', () => {
  initGalleryFiltering();
  initGalleryLightbox();
});

/**
 * Filter gallery cards by category
 */
function initGalleryFiltering() {
  const filterButtons = document.querySelectorAll('.js-gallery-filter');
  const galleryItems = document.querySelectorAll('.gallery-grid-item');
  const gridContainer = document.querySelector('.gallery-editorial-grid');

  if (!filterButtons.length || !galleryItems.length) return;

  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const selectedCategory = btn.getAttribute('data-category');

      // Update button active state
      filterButtons.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-pressed', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-pressed', 'true');

      // Toggle is-filtered state on grid container for balanced layout
      if (gridContainer) {
        if (selectedCategory === 'all') {
          gridContainer.classList.remove('is-filtered');
        } else {
          gridContainer.classList.add('is-filtered');
        }
      }

      // Filter cards
      galleryItems.forEach(item => {
        const itemCategories = (item.getAttribute('data-categories') || '').split(' ');
        if (selectedCategory === 'all' || itemCategories.includes(selectedCategory)) {
          item.classList.remove('hidden');
          item.removeAttribute('aria-hidden');
        } else {
          item.classList.add('hidden');
          item.setAttribute('aria-hidden', 'true');
        }
      });
    });
  });
}

/**
 * Accessible, lightweight lightbox for photography portfolio
 */
function initGalleryLightbox() {
  const galleryItems = Array.from(document.querySelectorAll('.gallery-grid-item'));
  const lightbox = document.getElementById('galleryLightbox');
  if (!lightbox || !galleryItems.length) return;

  const lightboxImg = lightbox.querySelector('.lightbox-image');
  const lightboxCaption = lightbox.querySelector('.lightbox-caption-text');
  const lightboxSource = lightbox.querySelector('.lightbox-source-tag');
  const lightboxCounter = lightbox.querySelector('.lightbox-counter');
  const closeBtn = lightbox.querySelector('.js-close-lightbox');
  const prevBtn = lightbox.querySelector('.js-prev-lightbox');
  const nextBtn = lightbox.querySelector('.js-next-lightbox');

  let currentIndex = 0;
  let lastActiveElement = null;

  // Get currently visible items (respecting active filter)
  function getVisibleItems() {
    return galleryItems.filter(item => !item.classList.contains('hidden'));
  }

  function openLightbox(index) {
    const visibleItems = getVisibleItems();
    if (index < 0 || index >= visibleItems.length) return;

    currentIndex = index;
    lastActiveElement = document.activeElement;

    updateLightboxContent();

    lightbox.classList.add('active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    // Focus close button for accessibility
    if (closeBtn) closeBtn.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';

    if (lastActiveElement && typeof lastActiveElement.focus === 'function') {
      lastActiveElement.focus();
    }
  }

  function showNext() {
    const visibleItems = getVisibleItems();
    if (!visibleItems.length) return;
    currentIndex = (currentIndex + 1) % visibleItems.length;
    updateLightboxContent();
  }

  function showPrev() {
    const visibleItems = getVisibleItems();
    if (!visibleItems.length) return;
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    updateLightboxContent();
  }

  function updateLightboxContent() {
    const visibleItems = getVisibleItems();
    const currentItem = visibleItems[currentIndex];
    if (!currentItem) return;

    const triggerBtn = currentItem.querySelector('.gallery-item-trigger');
    const fullSrc = triggerBtn.getAttribute('data-full-src') || triggerBtn.querySelector('img').src;
    const caption = triggerBtn.getAttribute('data-caption') || '';
    const alt = triggerBtn.getAttribute('data-alt') || '';
    const source = triggerBtn.getAttribute('data-source') || 'Google Business Profile';

    lightboxImg.src = fullSrc;
    lightboxImg.alt = alt;
    if (lightboxCaption) lightboxCaption.textContent = caption;
    if (lightboxSource) lightboxSource.textContent = source;
    if (lightboxCounter) {
      lightboxCounter.textContent = `${currentIndex + 1} / ${visibleItems.length}`;
    }
  }

  // Click triggers on each card
  galleryItems.forEach(item => {
    const triggerBtn = item.querySelector('.gallery-item-trigger');
    if (triggerBtn) {
      triggerBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const visibleItems = getVisibleItems();
        const clickedIndex = visibleItems.indexOf(item);
        if (clickedIndex !== -1) {
          openLightbox(clickedIndex);
        }
      });
    }
  });

  // Lightbox controls
  if (closeBtn) closeBtn.addEventListener('click', closeLightbox);
  if (prevBtn) prevBtn.addEventListener('click', showPrev);
  if (nextBtn) nextBtn.addEventListener('click', showNext);

  // Click outside lightbox image closes
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox || e.target.classList.contains('lightbox-backdrop-target')) {
      closeLightbox();
    }
  });

  // Keyboard navigation
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      closeLightbox();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      showNext();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      showPrev();
    }
  });

  // Mobile Touch Swipe Gesture Support
  let touchStartX = 0;
  let touchEndX = 0;

  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, { passive: true });

  function handleSwipe() {
    const swipeDistance = touchEndX - touchStartX;
    const threshold = 50; // minimum pixels for swipe
    if (swipeDistance > threshold) {
      // Swiped right -> previous image
      showPrev();
    } else if (swipeDistance < -threshold) {
      // Swiped left -> next image
      showNext();
    }
  }
}
