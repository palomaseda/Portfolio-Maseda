/* ══════════════════════════════════════════════════════════════
   PALOMA MASEDA — Portfolio
   main.js
   ══════════════════════════════════════════════════════════════ */

/* ── Registrar plugin ScrollTrigger de GSAP ──────────────────── */
gsap.registerPlugin(ScrollTrigger);

/* ── Iniciar todo cuando el DOM esté listo ───────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  (async () => {
    await loadContent();
    initLanguage();
    initNavbar();
    initMobileMenu();
    initHero();
    initGallery();
    initDeferredImages();
    initScrollReveals();
    initParallax();
    initLightbox();
  })();
});

const translations = {
  es: {
    meta: {
      title: 'Paloma Maseda — Biomateriales y Diseño Textil',
      description: 'Portfolio de Paloma Maseda: biomateriales, celulosa bacteriana, tintes naturales y diseño textil experimental desde Buenos Aires.',
      ogLocale: 'es_AR',
    },
    nav: {
      about: 'Sobre mí',
      projects: 'Proyectos',
      gallery: 'Galería',
      contact: 'Contacto',
    },
    hero: {
      subtitle: 'DISEÑO TEXTIL · BIOMATERIALES',
    },
    marquee: {
      items: 'BIOMATERIALES · DISEÑO TEXTIL · CELULOSA BACTERIANA · TINTES NATURALES · BORRA DE CAFÉ · FADU–UBA · INVESTIGACIÓN INDEPENDIENTE · BIOMATERIALES · DISEÑO TEXTIL · CELULOSA BACTERIANA · TINTES NATURALES · BORRA DE CAFÉ · FADU–UBA · INVESTIGACIÓN INDEPENDIENTE',
    },
    about: {
      label: '01 — SOBRE MÍ',
      heading: 'Diseñadora textil.<br><em>En busca de materiales</em><br><em>alternativos.</em>',
      p1: 'Mi formación comenzó en un colegio de pedagogía Waldorf, donde aprendí a observar el mundo desde la creatividad, la sensorialidad y el respeto profundo por los materiales nobles y los procesos naturales. Ese enfoque moldeó mi forma de venerar la naturaleza y mi preocupación por la contaminación del medioambiente.',
      p2: 'Para graduarme de mis estudios secundarios en 2023, dediqué un año entero a investigar los biomateriales. La investigación tuvo dos fases: una teórica, materializada en el libro <em>"Biomateriales: una alternativa para la industria textil"</em>, que incluye entrevistas a referentes del sector como Elia Gasparolo; y una práctica, con cursos junto a Laura Messing, Cinthya Nudel, Carolina Etchevers y Ludmila Ledesma.',
      p3: 'También confeccioné una prenda realizada con biomateriales, no para darle un uso cotidiano, sino como objeto de concientización social acerca de la contaminación de la industria textil.',
      p4: 'Actualmente soy estudiante de Diseño Textil en FADU, Facultad de Arquitectura, Diseño y Urbanismo de la Universidad de Buenos Aires, y también realicé cursos complementarios como <em>"Materiales del siglo XXI"</em>, dictado por el INTI, y <em>"Diseño textil digital"</em>, por Natalia Spitzer. Sigo investigando y produciendo biomateriales de forma independiente, con el objetivo de llevarlos a una escala industrial y aplicarlos en la indumentaria.',
    },
    projects: {
      label: '02 — PROYECTOS',
      title: 'Investigación<br><em>&amp; Producción</em>',
      viewGallery: 'Ver galería',
    },
    gallery: {
      label: '03 — GALERÍA',
      title: 'Archivo visual<br><em>de procesos</em>',
    },
    project: {
      celulosa: {
        title: 'Celulosa<br>Bacteriana',
        tag1: 'SCOBY',
        tag2: 'Bolso',
        desc: 'Producción de biomaterial a partir de celulosa bacteriana, el cual se obtiene al deshidratar el subproducto sólido del cultivo del SCOBY (symbiotic colony of bacteria and yeast) de la kombucha. El material tiene una consistencia gelatinosa en húmedo y un aspecto de piel flexible y maleable en seco. Este proceso de fermentación es completamente natural y no resulta contaminante en ninguna instancia. Además, es biodegradable y compostable.',
      },
      cafe: {
        title: 'Biocuero<br>de Café',
        tag1: 'Gran Formato',
        tag2: 'Indumentaria',
        tag3: 'Iluminación',
        desc: 'Biocuero obtenido a partir de la borra de café, uno de los descartes orgánicos más abundantes del entorno urbano. Es un material visualmente similar al cuero, flexible y con una textura porosa.',
      },
      tintes: {
        title: 'Tintes<br>Naturales',
        tag1: 'Remolacha',
        tag2: 'Hibiscus',
        tag3: 'Chlorella',
        desc: 'Extracción y aplicación de pigmentos y tintes naturales. Uno de los procesos más contaminantes de la industria textil es el teñido de las telas, contaminando millones de litros de agua potable. Los colores son un factor fundamental a la hora de vestirnos y diseñar. Es por esto que decidí indagar en los tintes naturales.',
      },
      segundaPiel: {
        title: 'La indumentaria<br>como segunda piel',
        tag1: 'Celulosa Bacteriana',
        tag2: 'Biomórfica',
        tag3: 'Hibiscus',
        tag4: 'Remolacha',
        desc: 'En esta obra, exploro la similitud entre la celulosa bacteriana y la anatomía humana. Sus propiedades curativas y regenerativas de la piel. La prenda hace referencia a una segunda piel viva, nueva, frágil. Relacionándolo con la crisis medioambiental, una herida que tenemos que sanar.',
      },
    },
    contact: {
      label: '04 — CONTACTO',
      heading: 'Conversemos.',
      intro: 'Si querés escribir por una pieza, una investigación, una producción o una colaboración, este es el mejor lugar para empezar.',
      emailLabel: 'Email',
      emailMeta: 'Escribime directo',
      instagramMeta: 'Proceso, pruebas y proyectos',
    },
    footer: {
      copy: '© 2025 — Diseño Textil & Biomateriales',
    },
  },
  en: {
    meta: {
      title: 'Paloma Maseda — Biomaterials and Textile Design',
      description: 'Portfolio of Paloma Maseda: biomaterials, bacterial cellulose, natural dyes and experimental textile design from Buenos Aires.',
      ogLocale: 'en_US',
    },
    nav: {
      about: 'About',
      projects: 'Projects',
      gallery: 'Gallery',
      contact: 'Contact',
    },
    hero: {
      subtitle: 'TEXTILE DESIGN · BIOMATERIALS',
    },
    marquee: {
      items: 'BIOMATERIALS · TEXTILE DESIGN · BACTERIAL CELLULOSE · NATURAL DYES · COFFEE GROUNDS · FADU–UBA · INDEPENDENT RESEARCH · BIOMATERIALS · TEXTILE DESIGN · BACTERIAL CELLULOSE · NATURAL DYES · COFFEE GROUNDS · FADU–UBA · INDEPENDENT RESEARCH',
    },
    about: {
      label: '01 — ABOUT',
      heading: 'Textile designer.<br><em>In search of alternative</em><br><em>materials.</em>',
      p1: 'My education began at a Waldorf school, where I learned to observe the world through creativity, sensory awareness, and a deep respect for noble materials and natural processes. That approach shaped the way I honor nature and my concern about environmental contamination.',
      p2: 'To graduate from secondary school in 2023, I devoted an entire year to researching biomaterials. The research had two phases: a theoretical one, materialized in the book <em>"Biomaterials: an alternative for the textile industry"</em>, which includes interviews with sector references such as Elia Gasparolo; and a practical one, through courses with Laura Messing, Cinthya Nudel, Carolina Etchevers, and Ludmila Ledesma.',
      p3: 'I also created a garment made with biomaterials, not for everyday use, but as an object of social awareness about the pollution generated by the textile industry.',
      p4: 'I am currently studying Textile Design at FADU, the Faculty of Architecture, Design and Urbanism at the University of Buenos Aires, and I have also completed complementary courses such as <em>"Materials of the 21st Century"</em> at INTI and <em>"Digital Textile Design"</em> with Natalia Spitzer. I continue researching and producing biomaterials independently, with the goal of bringing them to an industrial scale and applying them to fashion.',
    },
    projects: {
      label: '02 — PROJECTS',
      title: 'Research<br><em>&amp; Production</em>',
      viewGallery: 'View gallery',
    },
    gallery: {
      label: '03 — GALLERY',
      title: 'Visual archive<br><em>of processes</em>',
    },
    project: {
      celulosa: {
        title: 'Bacterial<br>Cellulose',
        tag1: 'SCOBY',
        tag2: 'Bag',
        desc: 'Biomaterial production based on bacterial cellulose, obtained by dehydrating the solid byproduct of the kombucha SCOBY culture (symbiotic colony of bacteria and yeast). The material has a gelatinous consistency when wet and a flexible, skin-like appearance when dry. This fermentation process is entirely natural and non-polluting at every stage. It is also biodegradable and compostable.',
      },
      cafe: {
        title: 'Coffee<br>Biomaterial',
        tag1: 'Large Format',
        tag2: 'Fashion',
        tag3: 'Lighting',
        desc: 'A biomaterial obtained from used coffee grounds, one of the most abundant organic residues in urban environments. It is visually similar to leather, flexible, and has a porous texture.',
      },
      tintes: {
        title: 'Natural<br>Dyes',
        tag1: 'Beetroot',
        tag2: 'Hibiscus',
        tag3: 'Chlorella',
        desc: 'Extraction and application of natural pigments and dyes. One of the most polluting processes in the textile industry is fabric dyeing, contaminating millions of liters of drinking water. Color is a fundamental factor when it comes to dressing and designing, which is why I decided to explore natural dyes.',
      },
      segundaPiel: {
        title: 'Garment as a<br>Second Skin',
        tag1: 'Bacterial Cellulose',
        tag2: 'Biomorphic',
        tag3: 'Hibiscus',
        tag4: 'Beetroot',
        desc: 'In this piece, I explore the similarity between bacterial cellulose and human anatomy, as well as its healing and skin-regenerating properties. The garment refers to a living, new, fragile second skin, relating it to the environmental crisis: a wound that we need to heal.',
      },
    },
    contact: {
      label: '04 — CONTACT',
      heading: 'Let’s talk.',
      intro: 'If you want to get in touch about a piece, research, production, or a collaboration, this is the best place to start.',
      emailLabel: 'Email',
      emailMeta: 'Write to me directly',
      instagramMeta: 'Process, tests, and projects',
    },
    footer: {
      copy: '© 2025 — Textile Design & Biomaterials',
    },
  },
};

function mergeDeep(target, source) {
  Object.keys(source).forEach((key) => {
    const sourceValue = source[key];
    if (
      sourceValue &&
      typeof sourceValue === 'object' &&
      !Array.isArray(sourceValue) &&
      target[key] &&
      typeof target[key] === 'object' &&
      !Array.isArray(target[key])
    ) {
      mergeDeep(target[key], sourceValue);
    } else {
      target[key] = sourceValue;
    }
  });

  return target;
}

function textToHtml(text = '') {
  return String(text)
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .join('<br>');
}

function stripHtml(html = '') {
  return String(html).replace(/<[^>]+>/g, ' ');
}

function applyLineBreakTemplate(templateHtml = '', text = '') {
  const rawText = String(text).trim();
  if (!rawText) return rawText;

  if (/<br\s*\/?>/i.test(rawText) || rawText.includes('\n')) {
    return textToHtml(rawText);
  }

  const templateLines = String(templateHtml)
    .split(/<br\s*\/?>/i)
    .map((line) => stripHtml(line).trim())
    .filter(Boolean);

  if (templateLines.length <= 1) return rawText;

  const words = rawText.split(/\s+/).filter(Boolean);
  const templateWordCounts = templateLines.map((line) => line.split(/\s+/).filter(Boolean).length);
  const totalTemplateWords = templateWordCounts.reduce((sum, count) => sum + count, 0);

  if (words.length !== totalTemplateWords) return rawText;

  const rebuiltLines = [];
  let cursor = 0;

  templateWordCounts.forEach((count) => {
    rebuiltLines.push(words.slice(cursor, cursor + count).join(' '));
    cursor += count;
  });

  return rebuiltLines.join('<br>');
}

function bodyToParagraphs(text = '') {
  return String(text)
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

function normalizeGalleryList(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value.filter(Boolean);
  return String(value)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getThumbnailPath(src = '') {
  const value = String(src).trim();
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return value.replace(/(\.[a-z0-9]+)$/i, '-thumb$1');
}

function getGalleryPreviewPath(src = '') {
  const value = String(src).trim();
  if (!value) return value;
  if (/^https?:\/\//i.test(value)) return value;
  return value.replace(/(\.[a-z0-9]+)$/i, '-gallery$1');
}

function setOptimizedImage(image, fullSrc, mode = 'thumb') {
  if (!image || !fullSrc) return;
  image.dataset.fullsrc = fullSrc;
  image.src = mode === 'gallery' ? getGalleryPreviewPath(fullSrc) : getThumbnailPath(fullSrc);
}

function initDeferredImages() {
  const lazyImages = Array.from(document.querySelectorAll('img[data-src]'));
  if (!lazyImages.length) return;

  const hydrateImage = (img) => {
    if (!img || img.dataset.loaded === 'true') return;
    img.src = img.dataset.src;
    img.dataset.loaded = 'true';
  };

  if (!('IntersectionObserver' in window)) {
    lazyImages.forEach(hydrateImage);
    return;
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      hydrateImage(entry.target);
      observer.unobserve(entry.target);
    });
  }, {
    rootMargin: '300px 0px',
  });

  lazyImages.forEach((img) => observer.observe(img));
}

async function loadContent() {
  try {
    const response = await fetch('data/content.json');
    if (!response.ok) return;

    const content = await response.json();

    if (content.translations) {
      normalizeFetchedTranslations(content.translations);
      mergeDeep(translations, content.translations);
    }

    if (content.about) {
      applyAboutContent(content.about);
    }

    if (Array.isArray(content.projects)) {
      applyProjectsContent(content.projects);
    }
  } catch (error) {
    console.warn('No se pudo cargar content.json', error);
  }
}

function normalizeFetchedTranslations(contentTranslations) {
  ['es', 'en'].forEach((lang) => {
    const fetchedProjects = contentTranslations?.[lang]?.project;
    const baseProjects = translations?.[lang]?.project;
    if (!fetchedProjects || !baseProjects) return;

    Object.keys(fetchedProjects).forEach((key) => {
      const fetchedTitle = fetchedProjects[key]?.title;
      const baseTitle = baseProjects[key]?.title;
      if (!fetchedTitle || !baseTitle) return;

      fetchedProjects[key].title = applyLineBreakTemplate(baseTitle, fetchedTitle);
    });
  });
}

function applyAboutContent(about) {
  const image = document.querySelector('.about-img');
  const caption = document.querySelector('.about-caption');
  const body = document.querySelector('.about-body');

  if (image && about.image) {
    image.src = about.image;
  }

  if (caption && about.caption_es) {
    caption.textContent = about.caption_es;
  }

  if (body && about.body_es) {
    const paragraphs = bodyToParagraphs(about.body_es);
    body.innerHTML = paragraphs.map((paragraph) => `<p>${paragraph}</p>`).join('');
  }
}

function applyProjectsContent(projects) {
  projects.forEach((project) => {
    const card = document.querySelector(`.project-item[data-slug="${project.slug}"]`);
    if (!card) return;

    const image = card.querySelector('.project-img');
    const button = card.querySelector('.project-btn');

    if (image && project.cover) {
      image.src = project.cover;
    }

    const gallery = normalizeGalleryList(project.gallery);
    if (gallery.length) {
      const galleryString = gallery.join('|');
      if (image) image.dataset.gallery = galleryString;
      if (button) button.dataset.gallery = galleryString;
    }
  });
}

function getTranslationValue(lang, key) {
  return key.split('.').reduce((acc, part) => acc && acc[part], translations[lang]);
}

function applyLanguage(lang) {
  const dict = translations[lang] || translations.es;

  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = getTranslationValue(lang, el.dataset.i18n);
    if (typeof value === 'string') el.textContent = value;
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const value = getTranslationValue(lang, el.dataset.i18nHtml);
    if (typeof value === 'string') el.innerHTML = value;
  });

  document.title = dict.meta.title;

  const metaDescription = document.querySelector('meta[name="description"]');
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector('meta[property="og:description"]');
  const ogLocale = document.querySelector('meta[property="og:locale"]');
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  const twitterDescription = document.querySelector('meta[name="twitter:description"]');

  if (metaDescription) metaDescription.content = dict.meta.description;
  if (ogTitle) ogTitle.content = dict.meta.title;
  if (ogDescription) ogDescription.content = dict.meta.description;
  if (ogLocale) ogLocale.content = dict.meta.ogLocale;
  if (twitterTitle) twitterTitle.content = dict.meta.title;
  if (twitterDescription) twitterDescription.content = dict.meta.description;

  document.querySelectorAll('.lang-toggle').forEach((button) => {
    const nextLang = lang === 'es' ? 'en' : 'es';
    const flag = nextLang === 'en' ? '🇺🇸' : '🇦🇷';
    const label = nextLang.toUpperCase();
    button.innerHTML = `<span class="lang-flag" aria-hidden="true">${flag}</span>${label}`;
  });
}

function initLanguage() {
  const savedLang = localStorage.getItem('paloma-lang');
  const initialLang = savedLang === 'en' ? 'en' : 'es';

  applyLanguage(initialLang);

  document.querySelectorAll('.lang-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const currentLang = document.documentElement.lang === 'en' ? 'en' : 'es';
      const nextLang = currentLang === 'es' ? 'en' : 'es';
      localStorage.setItem('paloma-lang', nextLang);
      applyLanguage(nextLang);
    });
  });
}


/* ══════════════════════════════════════════════════════════════
   1. NAVBAR — aparece transparente, adquiere blur al scrollear
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
   2. MENÚ MOBILE — hamburger + overlay fullscreen
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
   3. HERO — Animación de entrada
   ──────────────────────────────────────────────────────────────
   - El título "PALOMA MASEDA" se divide en letras individuales
   - Cada letra entra desde abajo con rotación 3D y stagger
   - Luego aparece el subtítulo
   ══════════════════════════════════════════════════════════════ */
function initHero() {
  const titleEl       = document.querySelector('.hero-title');
  const eyebrow       = document.querySelector('.hero-eyebrow');
  const subtitle      = document.querySelector('.hero-subtitle');

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
    }, '-=0.5');
}

function initGallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const projectCards = Array.from(document.querySelectorAll('.project-item'));
  const projectGalleries = projectCards.map((card) => {
    const image = card.querySelector('.project-img');
    const title = card.querySelector('.project-title');
    if (!image || !image.dataset.gallery) return [];

    const altBase = title ? title.textContent.replace(/\s+/g, ' ').trim() : 'Proyecto';
    return image.dataset.gallery
      .split('|')
      .map((src) => src.trim())
      .filter(Boolean)
      .map((src, index) => ({
        src,
        alt: `${altBase} ${index === 0 ? 'cover' : index}`,
      }));
  }).filter((items) => items.length);

  // Mezcla por rondas para mantener variedad entre proyectos aunque cambie la cantidad de fotos.
  const mixedGallery = [];
  const maxLength = Math.max(...projectGalleries.map((items) => items.length), 0);

  for (let i = 0; i < maxLength; i += 1) {
    projectGalleries.forEach((items) => {
      if (items[i]) mixedGallery.push(items[i]);
    });
  }

  // Cola de cierre: duplicamos más imágenes para que el fade inferior
  // tape fotos reales y no un hueco vacío.
  const tailFillers = [];
  for (let round = 0; round < 2; round += 1) {
    projectGalleries.forEach((items, projectIndex) => {
      if (!items.length) return;
      const item = items[(projectIndex + round * 2) % items.length];
      tailFillers.push({
        ...item,
        alt: `${item.alt} tail ${round + 1}-${projectIndex + 1}`,
      });
    });
  }

  const galleryForRender = mixedGallery.concat(tailFillers);

  grid.innerHTML = galleryForRender.map(({ src, alt }) => `
    <figure class="gallery-item">
      <img data-src="${getGalleryPreviewPath(src)}" data-fullsrc="${src}" alt="${alt}" loading="lazy" decoding="async" fetchpriority="low" onerror="if(this.dataset.fullsrc && !this.dataset.fallbackLoaded){this.dataset.fallbackLoaded='true';this.src=this.dataset.fullsrc;}else{this.closest('figure')?.remove()}">
    </figure>
  `).join('');
}


/* ══════════════════════════════════════════════════════════════
   4. SCROLL REVEALS — animaciones al entrar al viewport
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
          start: 'top 68%',
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
          start: 'top 62%',
        }
      });
    }
  });

  /* ── Gallery: reveal con stagger al entrar en viewport ── */
  gsap.utils.toArray('.gallery-item').forEach((item, index) => {
    gsap.to(item, {
      opacity: 1,
      y: 0,
      scale: 1,
      duration: 0.95,
      ease: 'power3.out',
      delay: index % 3 * 0.03,
      scrollTrigger: {
        trigger: item,
        start: 'top 88%',
        once: true,
      }
    });

    const image = item.querySelector('img');
    if (image) {
      gsap.to(image, {
        scale: 1,
        duration: 1.2,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: item,
          start: 'top 88%',
          once: true,
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
   5. PARALLAX en imágenes de proyectos
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
   6. LIGHTBOX
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

  const preloadedImages = new Set();

  function preloadGalleryImages(galleryImages = [], limit = 2) {
    galleryImages.slice(0, limit).forEach((src) => {
      if (!src || preloadedImages.has(src)) return;
      const preload = new Image();
      preload.src = src;
      preloadedImages.add(src);
    });
  }

  /* ── Abrir lightbox ── */
  function open(galleryImages, startIndex = 0) {
    if (!galleryImages.length) return;
    images  = galleryImages;
    current = startIndex;
    preloadGalleryImages(galleryImages, 2);
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
      preloadGalleryImages([images[(index + 1) % images.length]], 1);
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
    const primeButtonGallery = () => preloadGalleryImages(parseGallery(btn.dataset.gallery), 2);
    btn.addEventListener('pointerenter', primeButtonGallery, { passive: true });
    btn.addEventListener('focus', primeButtonGallery, { passive: true });
    btn.addEventListener('touchstart', primeButtonGallery, { passive: true });
    btn.addEventListener('click', () => {
      const gallery = parseGallery(btn.dataset.gallery);
      open(gallery, 0);
    });
  });

  /* ── Eventos: click en imagen de proyecto ── */
  document.querySelectorAll('.project-image-wrap').forEach(wrap => {
    const primeWrapGallery = () => {
      const projectImg = wrap.querySelector('.project-img');
      if (!projectImg) return;
      preloadGalleryImages(parseGallery(projectImg.dataset.gallery), 2);
    };
    wrap.addEventListener('pointerenter', primeWrapGallery, { passive: true });
    wrap.addEventListener('touchstart', primeWrapGallery, { passive: true });
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
