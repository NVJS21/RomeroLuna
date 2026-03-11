/* ============================================================
   ROMERO LUNA — Main JavaScript
   ============================================================ */

/* ---------- Navbar: scroll + burger ---------- */
(function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const burger = document.querySelector('.navbar__burger');
  const drawer = document.querySelector('.navbar__drawer');

  if (!navbar) return;

  // Scrolled class
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  // Burger toggle
  if (burger && drawer) {
    burger.addEventListener('click', () => {
      const open = burger.classList.toggle('open');
      drawer.classList.toggle('open', open);
      document.body.style.overflow = open ? 'hidden' : '';
    });

    // Close on drawer link click
    drawer.querySelectorAll('.navbar__link').forEach(link => {
      link.addEventListener('click', () => {
        burger.classList.remove('open');
        drawer.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // Mark active link
  const currentFile = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar__link').forEach(link => {
    const href = link.getAttribute('href') || '';
    const linkFile = href.split('/').pop();
    if (linkFile === currentFile || (currentFile === '' && linkFile === 'index.html')) {
      link.classList.add('active');
    }
  });
})();

/* ---------- Gallery Tabs ---------- */
(function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  if (!tabs.length) return;

  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;

      // Update buttons
      tabs.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update panels
      document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.toggle('active', panel.dataset.tab === target);
      });
    });
  });
})();

/* ---------- Lightbox ---------- */
(function initLightbox() {
  const lightbox = document.querySelector('.lightbox');
  if (!lightbox) return;

  const img = lightbox.querySelector('.lightbox__img');
  const close = lightbox.querySelector('.lightbox__close');
  const prev = lightbox.querySelector('.lightbox__prev');
  const next = lightbox.querySelector('.lightbox__next');

  let images = [];
  let current = 0;

  function openAt(index) {
    current = index;
    img.src = images[current];
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function close_() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    img.src = '';
  }

  function navigate(dir) {
    current = (current + dir + images.length) % images.length;
    img.src = images[current];
  }

  // Collect gallery images
  function bindGallery() {
    images = [];
    document.querySelectorAll('.gallery-item').forEach((item, i) => {
      const src = item.querySelector('img')?.src || item.dataset.src;
      if (src) {
        images.push(src);
        item.addEventListener('click', () => openAt(i));
      }
    });
  }

  bindGallery();

  // Re-bind when tabs switch (images might change)
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(bindGallery, 50);
    });
  });

  if (close) close.addEventListener('click', close_);
  if (prev) prev.addEventListener('click', () => navigate(-1));
  if (next) next.addEventListener('click', () => navigate(1));

  lightbox.addEventListener('click', e => {
    if (e.target === lightbox) close_();
  });

  // Keyboard
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close_();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
})();

/* ---------- Scroll Reveal ---------- */
(function initReveal() {
  const els = document.querySelectorAll('.reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  els.forEach(el => observer.observe(el));
})();

/* ---------- Interactive Photo Gallery ---------- */
(function initPhotoGalleries() {
  const galleries = document.querySelectorAll('.photo-gallery');
  if (!galleries.length) return;

  galleries.forEach(gallery => {
    const mainImg = gallery.querySelector('.pg-main-view img');
    const thumbs = Array.from(gallery.querySelectorAll('.pg-thumb'));
    if (!mainImg || thumbs.length === 0) return;

    let currentIndex = 0;
    let autoPlayInterval;

    function activateThumb(index) {
      if (index < 0 || index >= thumbs.length) return;

      thumbs.forEach(t => t.classList.remove('active'));
      thumbs[index].classList.add('active');

      mainImg.style.opacity = '0';

      setTimeout(() => {
        mainImg.src = thumbs[index].dataset.src;
        mainImg.style.opacity = '1';
      }, 200); // 200ms matches the ideal fast fade

      currentIndex = index;

      // Keep selected thumbnail in view horizontally
      const thumbEl = thumbs[index];
      const container = gallery.querySelector('.pg-thumbnails');
      if (container && thumbEl) {
        container.scrollTo({
          left: thumbEl.offsetLeft - container.offsetWidth / 2 + thumbEl.offsetWidth / 2,
          behavior: 'smooth'
        });
      }
    }

    function nextSlide() {
      const nextIndex = (currentIndex + 1) % thumbs.length;
      activateThumb(nextIndex);
    }

    function startAutoPlay() {
      stopAutoPlay();
      autoPlayInterval = setInterval(nextSlide, 4000); // 4 Seconds per slide
    }

    function stopAutoPlay() {
      if (autoPlayInterval) clearInterval(autoPlayInterval);
    }

    thumbs.forEach((thumb, idx) => {
      thumb.addEventListener('click', () => {
        activateThumb(idx);
        startAutoPlay(); // Reset the timer on manual interaction
      });
    });

    // Pause auto-advance on hover to let users look
    gallery.addEventListener('mouseenter', stopAutoPlay);
    gallery.addEventListener('mouseleave', startAutoPlay);

    // Initial start
    startAutoPlay();
  });
})();
