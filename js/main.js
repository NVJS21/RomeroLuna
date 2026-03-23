/* ============================================================
   ROMERO LUNA — Main JavaScript
   ============================================================ */

/* ---------- I18n Redirect ---------- */
(function autoRedirectLang() {
  if (sessionStorage.getItem('langRedirected')) return;

  const lang = navigator.language || navigator.userLanguage;
  if (!lang.startsWith('es')) {
    // If not Spanish and not already in 'en/' folder, redirect
    const path = window.location.pathname;
    if (!path.includes('/en/')) {
      sessionStorage.setItem('langRedirected', 'true');
      
      // We need to calculate how deep we are to insert /en/ properly.
      // Usually, just appending /en/ before the page name or redirecting to /en/index.html
      // A safe way for a static site is using window.location.origin
      let newPath = path;
      if (path.includes('/pages/')) {
        newPath = path.replace('/pages/', '/en/pages/');
      } else {
        const parts = path.split('/');
        const page = parts.pop() || 'index.html';
        const basedir = parts.join('/') || '';
        newPath = `${basedir}/en/${page === '' ? 'index.html' : page}`;
      }
      window.location.href = window.location.origin + newPath;
    }
  }
})();

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

/* ---------- Booking Modal ---------- */
(function initBookingModal() {
  // 1. Inject Modal if doesn't exist
  let modal = document.getElementById('booking-modal');
  if (!modal) {
    const isEn = window.location.pathname.includes('/en/');
    const title = isEn ? 'Direct Booking' : 'Reserva Directa';
    const subtitle = isEn ? 'Choose an option to manage your stay:' : 'Escoge una opción para gestionar tu estancia:';
    const waText = isEn ? 'WhatsApp Direct' : 'WhatsApp Directo';
    const mailText = isEn ? 'Send Email Request' : 'Enviar Solicitud Email';
    const bookingText = isEn ? 'Book on Booking.com' : 'Reservar en Booking.com';
    
    // Form labels
    const labelName = isEn ? 'Name' : 'Nombre';
    const labelEmail = isEn ? 'Email' : 'Email';
    const labelPhone = isEn ? 'Phone (Optional)' : 'Teléfono (Opcional)';
    const labelMessage = isEn ? 'Dates and Comments' : 'Fechas y Comentarios';
    const submitText = isEn ? 'Send' : 'Enviar';

    const modalHtml = `
      <div id="booking-modal" class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div class="modal-content">
          <button class="modal-close" id="modal-close" aria-label="Cerrar">&times;</button>
          <h2 id="modal-title">${title}</h2>
          <p>${subtitle}</p>
          
          <div class="modal-options" id="modal-initial-options">
            <a id="modal-booking-option" href="https://www.booking.com/hotel/es/apartamentos-romero-luna.es.html" target="_blank" rel="noopener" class="btn btn-primary modal-option">
              <i class="fa-solid fa-hotel"></i> ${bookingText}
            </a>
            <a id="modal-whatsapp" href="#" target="_blank" rel="noopener" class="btn btn-outline modal-option" style="border-color:#25D366;color:#25D366;">
              <i class="fa-brands fa-whatsapp"></i> ${waText} <span class="discount-badge" style="margin-left:6px;">-10%</span>
            </a>
            <button id="modal-show-form" class="btn btn-outline modal-option">
              <i class="fa-solid fa-envelope"></i> ${mailText} <span class="discount-badge" style="margin-left:6px;">-10%</span>
            </button>
          </div>

          <!-- Contact Form -->
          <form id="booking-contact-form" style="display:none; text-align:left; margin-top:20px; border-top:1px solid var(--color-border); padding-top:16px;">
            <div class="form-group">
              <label for="form-name">${labelName}</label>
              <input type="text" id="form-name" required />
            </div>
            <div class="form-group">
              <label for="form-email">${labelEmail}</label>
              <input type="email" id="form-email" required />
            </div>
            <div class="form-group">
              <label for="form-phone">${labelPhone}</label>
              <input type="tel" id="form-phone" />
            </div>
            <div class="form-group">
              <label for="form-message">${labelMessage}</label>
              <textarea id="form-message" rows="3" required></textarea>
            </div>
            <button type="submit" class="btn btn-primary" style="width:100%; justify-content:center;">${submitText}</button>
          </form>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    modal = document.getElementById('booking-modal');
  }

  const triggers = document.querySelectorAll('.js-trigger-booking');
  const closeBtn = document.getElementById('modal-close');
  const showFormBtn = document.getElementById('modal-show-form');
  const contactForm = document.getElementById('booking-contact-form');
  const optionsDiv = document.getElementById('modal-initial-options');

  if (!modal) return;

  function openModal(e) {
    if (e) e.preventDefault();
    
    // Reset form visibility
    if (contactForm) contactForm.style.display = 'none';
    if (optionsDiv) optionsDiv.style.display = 'flex';

    // 1. Identify trigger and get apartment name
    const trigger = e.target ? e.target.closest('.js-trigger-booking') : null;
    const apartment = trigger ? trigger.getAttribute('data-apartment') : 'Apartamento';
    
    // 2. Toggle Booking button visibility
    const bookingOption = document.getElementById('modal-booking-option');
    if (bookingOption) {
      if (trigger && trigger.hasAttribute('data-apartment')) {
        bookingOption.style.display = 'none'; // Hide if from apartment card
      } else {
        bookingOption.style.display = 'flex'; // Show if generic "Reserva ya!"
      }
    }

    // Save apartment name in form dataset for submit handler
    if (contactForm) contactForm.dataset.apartment = apartment;

    const isEn = window.location.pathname.includes('/en/');
    let message = isEn 
      ? `Hello, I would like to book the apartment with the 10% discount for dates...`
      : `Hola, me gustaría reservar un apartamento con el 10% de descuento en las fechas...`;
    
    if (apartment && apartment !== 'Apartamento') {
       message = isEn 
         ? `Hello, I would like to book the ${apartment} with the 10% discount for dates...`
         : `Hola, me gustaría reservar el ${apartment} con el 10% de descuento en las fechas...`;
    }
    
    // 3. Update WhatsApp link
    const waLink = document.getElementById('modal-whatsapp');
    if (waLink) {
      waLink.href = `https://wa.me/34610543850?text=${encodeURIComponent(message)}`;
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Toggle form
  if (showFormBtn && contactForm) {
    showFormBtn.addEventListener('click', () => {
      if (optionsDiv) optionsDiv.style.display = 'none';
      contactForm.style.display = 'block';
    });
  }

  // Submit Form
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('form-name').value;
      const email = document.getElementById('form-email').value;
      const phone = document.getElementById('form-phone').value;
      const msg = document.getElementById('form-message').value;
      const apartment = contactForm.dataset.apartment || 'Apartamento';

      const isEn = window.location.pathname.includes('/en/');
      const subject = isEn ? `Booking Request - ${apartment}` : `Solicitud de Reserva - ${apartment}`;
      
      let bodyText = isEn 
        ? `Request for: ${apartment}\n\nName: ${name}\nEmail: ${email}\nPhone: ${phone}\n\nComments:\n${msg}`
        : `Solicitud para: ${apartment}\n\nNombre: ${name}\nEmail: ${email}\nTeléfono: ${phone}\n\nComentarios:\n${msg}`;

      const mailtoUrl = `mailto:alejandro@romeroluna.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyText)}`;
      window.location.href = mailtoUrl;
    });
  }

  if (triggers) {
    triggers.forEach(trigger => {
      trigger.addEventListener('click', openModal);
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
})();

/* ---------- Smooth Scroll and Scroll Spy ---------- */
(function initScrollSpy() {
  const links = document.querySelectorAll('.navbar__link, .footer-new__link, .btn-outline[href^="#"]');
  const sections = document.querySelectorAll('section[id]');

  if (!links.length) return;

  // Smooth Scroll
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        e.preventDefault();
        const target = document.querySelector(href);
        if (target) {
          const navbar = document.querySelector('.navbar');
          const offset = navbar ? navbar.offsetHeight : 70;
          
          window.scrollTo({
            top: target.offsetTop - offset + 5, // small buffer
            behavior: 'smooth'
          });

          // Update active link manually on click to be responsive
          links.forEach(l => l.classList.remove('active'));
          link.classList.add('active');
          
          // Close drawer on click (already handled in drawer links but good to have)
        }
      }
    });
  });

  // Scroll Spy
  function spy() {
    let current = "";
    const scrollPos = window.scrollY + 120; // offset

    sections.forEach(section => {
      if (scrollPos >= section.offsetTop) {
        current = section.getAttribute('id');
      }
    });

    // Only update if current changed (performance)
    if (current) {
        links.forEach(link => {
          const href = link.getAttribute('href');
          link.classList.remove('active');
          if (href === `#${current}`) {
            link.classList.add('active');
          }
        });
    }
  }

  window.addEventListener('scroll', spy, { passive: true });
})();


