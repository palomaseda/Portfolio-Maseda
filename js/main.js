/* ══════════════════════════════════════════════════════════════
   PALOMA MASEDA — Portfolio
   main.js
   ══════════════════════════════════════════════════════════════ */

/* ── Registrar plugin ScrollTrigger de GSAP ──────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ── Iniciar todo cuando el DOM esté listo ───────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initCursor();
  initNavbar();
  initMobileMenu();
  initHero();
  initScrollReveals();
  initParallax();
  initLightbox();
});


/* ══════════════════════════════════════════════════════════════
   1. CURSOR PERSONALIZADO
   ──────────────────────────────────────────────────────────────
   - .cursor-dot     → sigue al mouse instantáneamente
   - .cursor-outline → sigue con lag suave via RAF loop
   - Se desactiva en dispositivos touch (sin hover)
   ══════════════════════════════════════════════════════════════ */
function initCursor() {
  const dot     = document.getElementById('cursorDot');
  const outline = document.getElementById('cursorOutline');

  if (!dot || !outline) return;
  // Solo en dispositivos con mouse/puntero
  if (window.matchMedia('(hover: none)').matches) return;

  let mouseX = 0, mouseY = 0;
  let outX   = 0, outY   = 0;

  /* Actualizar posición del dot al instante */
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    dot.style.left = mouseX + 'px';
    dot.style.top  = mouseY + 'px';
  });

  /* Anillo sigue con lerp (interpolación suave) via requestAnimationFrame */
  (function animateOutline() {
    outX += (mouseX - outX) * 0.11;
    outY += (mouseY - outY) * 0.11;
    outline.style.left = outX + 'px';
    outline.style.top  = outY + 'px';
    requestAnimationFrame(animateOutline);
  })();

  /* Expandir cursor al pasar sobre elementos interactivos */
  const targets = 'a, button, .project-image-wrap, .contact-link, .nav-logo';
  document.querySelectorAll(targets).forEach(el => {
    el.addEventListener('mouseenter', () => document.body.classList.add('cursor-hover'));
    el.addEventListener('mouseleave', () => document.body.classList.remove('cursor-hover'));
  });
}


/* ══════════════════════════════════════════════════════════════
   2. NAVBAR — aparece transparente, adquiere blur al scrollear
   ══════════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  const THRESHOLD = 60;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > THRESHOLD);
  }, { passive: true });
}


/* ══════════════════════════════════════════════════════════════
   3. MENÚ MOBILE — hamburger + overlay fullscreen
   ══════════════════════════════════════════════════════════════ */
function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const overlay   = document.getElementById('menuOverlay');

  if (!hamburger || !overlay) return;

  function toggleMenu(forceClose = false) {
    const willOpen = forceClose ? false : !overlay.classList.contains('active');
    overlay.classList.toggle('active', willOpen);
    hamburger.classList.toggle('active', willOpen);
    hamburger.setAttribute('aria-expanded', willOpen);
    document.body.style.overflow = willOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMenu());

  /* Cerrar al hacer click en un link del overlay */
  overlay.querySelectorAll('.overlay-link').forEach(link => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  /* Cerrar con tecla Escape */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) toggleMenu(true);
  });
}


/* ══════════════════════════════════════════════════════════════
   4. HERO — Animación de entrada
   ──────────────────────────────────────────────────────────────
   - El título "PALOMA MASEDA" se divide en letras individuales
   - Cada letra entra desde abajo con rotación 3D y stagger
   - Luego aparecen subtitle y scroll indicator
   ══════════════════════════════════════════════════════════════ */
function initHero() {
  const titleEl       = document.querySelector('.hero-title');
  const eyebrow       = document.querySelector('.hero-eyebrow');
  const subtitle      = document.querySelector('.hero-subtitle');
  const scrollIndic   = document.querySelector('.hero-scroll');

  if (!titleEl) return;

  /* Dividir el texto en spans por letra */
  const originalText = titleEl.textContent.trim();
  titleEl.innerHTML  = '';

  originalText.split('').forEach(char => {
    const span = document.createElement('span');
    span.classList.add('letter');
    span.textContent = char === ' ' ? '\u00A0' : char; // preservar espacios
    titleEl.appendChild(span);
  });

  /* Timeline GSAP de entrada */
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });

  tl
    /* Eyebrow fade desde arriba */
    .to(eyebrow, {
      opacity: 1,
      duration: 0.8,
      delay: 0.2,
      ease: 'power2.out',
    })
    /* Letras: caen desde arriba con rotación 3D */
    .from('.hero-title .letter', {
      opacity: 0,
      y: -60,
      rotateX: 90,
      transformOrigin: 'center top',
      stagger: { each: 0.038, ease: 'power2.inOut' },
      duration: 1.1,
    }, '-=0.4')
    /* Subtítulo */
    .to(subtitle, {
      opacity: 1,
      duration: 0.9,
      ease: 'power2.out',
    }, '-=0.5')
    /* Indicador de scroll */
    .to(scrollIndic, {
      opacity: 1,
      duration: 0.7,
      ease: 'power2.out',
    }, '-=0.5');
}


/* ══════════════════════════════════════════════════════════════
   5. SCROLL REVEALS — animaciones al entrar al viewport
   ──────────────────────────────────────────────────────────────
   Cada sección y elemento tiene su propia animación.
   Tecnología: GSAP + ScrollTrigger.
   ══════════════════════════════════════════════════════════════ */
function initScrollReveals() {

  /* ── About: imagen con clip-path de abajo hacia arriba ── */
  gsap.to('.about-image-wrap', {
    clipPath: 'inset(0% 0 0 0)',
    duration: 1.5,
    ease: 'power4.inOut',
    scrollTrigger: {
      trigger: '.about-image-wrap',
      start: 'top 80%',
    }
  });

  /* ── About: heading ── */
  gsap.from('.about-heading', {
    opacity: 0,
    y: 50,
    duration: 1.1,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.about-heading', start: 'top 85%' }
  });

  /* ── About: párrafos con stagger ── */
  gsap.from('.about-body p', {
    opacity: 0,
    y: 28,
    stagger: 0.15,
    duration: 0.9,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.about-body', start: 'top 82%' }
  });

  /* ── Projects header ── */
  gsap.from('.projects-header .section-label', {
    opacity: 0,
    x: -24,
    duration: 0.8,
    ease: 'power3.out',
    scrollTrigger: { trigger: '.projects-header', start: 'top 85%' }
  });

  gsap.from('.section-title', {
    opacity: 0,
    y: 50,
    duration: 1.1,
    ease: 'power4.out',
    scrollTrigger: { trigger: '.section-title', start: 'top 85%' }
  });

  /* ── Cada proyecto: imagen + contenido ── */
  document.querySelectorAll('.project-item').forEach((item) => {

    const imageWrap = item.querySelector('.project-image-wrap');
    const title     = item.querySelector('.project-title');
    const tags      = item.querySelector('.project-tags');
    const desc      = item.querySelector('.project-desc');
    const btn       = item.querySelector('.project-btn');

    /* Imagen: clip-path de abajo → arriba */
    if (imageWrap) {
      gsap.to(imageWrap, {
        clipPath: 'inset(0% 0 0 0)',
        duration: 1.5,
        ease: 'power4.inOut',
        scrollTrigger: {
          trigger: item,
          start: 'top 78%',
        }
      });
    }

    /* Contenido textual: fade + slide con stagger */
    const textEls = [title, tags, desc, btn].filter(Boolean);
    if (textEls.length) {
      gsap.from(textEls, {
        opacity: 0,
        y: 36,
        stagger: 0.1,
        duration: 0.9,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 72%',
        }
      });
    }
  });

  /* ── Contacto ── */
  gsap.from('.contact-heading', {
    opacity: 0,
    y: 60,
    duration: 1.2,
    ease: 'power4.out',
    scrollTrigger: { trigger: '.contact-heading', start: 'top 80%' }
  });

  document.querySelectorAll('.contact-link').forEach((link, i) => {
    gsap.from(link, {
      opacity: 0,
      y: 20,
      duration: 0.7,
      delay: i * 0.12,
      ease: 'power3.out',
      scrollTrigger: { trigger: link, start: 'top 88%' }
    });
  });
}


/* ══════════════════════════════════════════════════════════════
   6. PARALLAX en imágenes de proyectos
   ──────────────────────────────────────────────────────────────
   Las imágenes se mueven más lento que el scroll, creando
   profundidad. El wrapper tiene overflow:hidden y la imagen
   tiene height:115% para que nunca queden bordes vacíos.
   Solo en dispositivos con mouse (no touch).
   ══════════════════════════════════════════════════════════════ */
function initParallax() {
  if (window.matchMedia('(hover: none)').matches) return;

  document.querySelectorAll('.project-img').forEach(img => {
    const wrap = img.closest('.project-image-wrap');
    if (!wrap) return;

    gsap.fromTo(img,
      { yPercent: -5 }, /* top:-8% en CSS garantiza que nunca quede fondo expuesto arriba */
      {
        yPercent: 5,
        ease: 'none',
        scrollTrigger: {
          trigger: wrap,
          start: 'top bottom',
          end:   'bottom top',
          scrub: 1.8,
        }
      }
    );
  });

  /* Parallax sutil en la imagen del hero */
  const heroBgImg = document.querySelector('.hero-bg-img');
  if (heroBgImg) {
    gsap.to(heroBgImg, {
      yPercent: 18,
      ease: 'none',
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end:   'bottom top',
        scrub: 1,
      }
    });
  }
}


/* ══════════════════════════════════════════════════════════════
   7. LIGHTBOX
   ──────────────────────────────────────────────────────────────
   - Se abre al clickear .project-image-wrap o .project-btn
   - Las imágenes se leen del atributo data-gallery (separadas por "|")
   - Navegación: botones prev/next, teclas ← → ESC
   - Para agregar más fotos a un proyecto: agregar rutas al data-gallery
   ══════════════════════════════════════════════════════════════ */
function initLightbox() {
  const lightbox  = document.getElementById('lightbox');
  const img       = document.getElementById('lightboxImg');
  const closeBtn  = document.getElementById('lightboxClose');
  const prevBtn   = document.getElementById('lightboxPrev');
  const nextBtn   = document.getElementById('lightboxNext');
  const counter   = document.getElementById('lightboxCounter');

  if (!lightbox || !img) return;

  let images  = [];
  let current = 0;

  /* ── Parsear el atributo data-gallery ── */
  function parseGallery(attr) {
    if (!attr) return [];
    return attr.split('|').map(s => s.trim()).filter(Boolean);
  }

  /* ── Abrir lightbox ── */
  function open(galleryImages, startIndex = 0) {
    if (!galleryImages.length) return;
    images  = galleryImages;
    current = startIndex;
    show(current);
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /* ── Cerrar lightbox ── */
  function close() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    /* Limpiar src con delay (esperar fade-out) */
    setTimeout(() => { img.src = ''; }, 400);
  }

  /* ── Mostrar imagen en índice dado ── */
  function show(index) {
    img.classList.add('fading');
    setTimeout(() => {
      img.src = images[index];
      img.alt = `Imagen ${index + 1} de ${images.length}`;
      img.classList.remove('fading');
      updateCounter();
    }, 180);
  }

  /* ── Actualizar contador ── */
  function updateCounter() {
    counter.textContent = images.length > 1
      ? `${current + 1} / ${images.length}`
      : '';
  }

  /* ── Navegación ── */
  function prev() {
    current = (current - 1 + images.length) % images.length;
    show(current);
  }
  function next() {
    current = (current + 1) % images.length;
    show(current);
  }

  /* ── Eventos: botones de proyectos ── */
  document.querySelectorAll('.project-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const gallery = parseGallery(btn.dataset.gallery);
      open(gallery, 0);
    });
  });

  /* ── Eventos: click en imagen de proyecto ── */
  document.querySelectorAll('.project-image-wrap').forEach(wrap => {
    wrap.addEventListener('click', () => {
      const projectImg = wrap.querySelector('.project-img');
      if (!projectImg) return;
      const gallery = parseGallery(projectImg.dataset.gallery);
      open(gallery, 0);
    });
  });

  /* ── Controles del lightbox ── */
  closeBtn.addEventListener('click', close);

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    prev();
  });
  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    next();
  });

  /* Cerrar al clickear el fondo */
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  /* Teclado: ← → ESC */
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    switch (e.key) {
      case 'Escape':     close(); break;
      case 'ArrowLeft':  prev();  break;
      case 'ArrowRight': next();  break;
    }
  });

  /* Swipe en mobile */
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const delta = e.changedTouches[0].screenX - touchStartX;
    if (Math.abs(delta) < 50) return; // Ignorar taps
    delta < 0 ? next() : prev();
  }, { passive: true });
}
