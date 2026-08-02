/* ══════════════════════════════════════════════════════════════
   PALOMA MASEDA — Portfolio
   newsletter.js — Archivo de ediciones
   ──────────────────────────────────────────────────────────────
   Lee data/newsletter.json (generado por build_newsletter.py) y
   muestra el listado, o una edición puntual si la URL trae ?ed=slug.
   ══════════════════════════════════════════════════════════════ */

const translations = {
  es: {
    meta: {
      title: 'Newsletter — Paloma Maseda',
      archiveTitle: 'Newsletter — Paloma Maseda',
    },
    nav: {
      about: 'Sobre mí',
      projects: 'Proyectos',
      gallery: 'Galería',
      contact: 'Contacto',
    },
    news: {
      label: '05 — NEWSLETTER',
      title: 'Ediciones<br><em>anteriores</em>',
      intro: 'Cada entrega recopila procesos, pruebas y hallazgos del taller. Acá quedan todas, para leerlas cuando quieras.',
      empty: 'Todavía no hay ediciones publicadas. Muy pronto, la primera.',
      back: '← Todas las ediciones',
      notFound: 'No encontramos esa edición. Estas son todas las publicadas.',
      previous: 'Edición anterior',
      next: 'Edición siguiente',
    },
    footer: {
      copy: '© 2025 — Diseño Textil & Biomateriales',
    },
  },
  en: {
    meta: {
      title: 'Newsletter — Paloma Maseda',
      archiveTitle: 'Newsletter — Paloma Maseda',
    },
    nav: {
      about: 'About',
      projects: 'Projects',
      gallery: 'Gallery',
      contact: 'Contact',
    },
    news: {
      label: '05 — NEWSLETTER',
      title: 'Past<br><em>editions</em>',
      intro: 'Each issue gathers processes, tests and findings from the studio. They all live here, to read whenever you like.',
      empty: 'No editions published yet. The first one is coming soon.',
      back: '← All editions',
      notFound: 'We could not find that edition. These are all the published ones.',
      previous: 'Previous edition',
      next: 'Next edition',
    },
    footer: {
      copy: '© 2025 — Textile Design & Biomaterials',
    },
  },
};

let editions = [];

function currentLang() {
  return document.documentElement.lang === 'en' ? 'en' : 'es';
}

function getTranslationValue(lang, key) {
  return key.split('.').reduce((acc, part) => acc && acc[part], translations[lang]);
}

function formatDate(isoDate, lang) {
  const [year, month, day] = String(isoDate).split('-').map(Number);
  if (!year || !month || !day) return isoDate;

  return new Date(year, month - 1, day).toLocaleDateString(
    lang === 'en' ? 'en-US' : 'es-AR',
    { year: 'numeric', month: 'long', day: 'numeric' },
  );
}

function editionUrl(slug) {
  return `newsletter.html?ed=${encodeURIComponent(slug)}`;
}


/* ══════════════════════════════════════════════════════════════
   IDIOMA
   ══════════════════════════════════════════════════════════════ */
function applyLanguage(lang) {
  document.documentElement.lang = lang;

  document.querySelectorAll('[data-i18n]').forEach((el) => {
    const value = getTranslationValue(lang, el.dataset.i18n);
    if (typeof value === 'string') el.textContent = value;
  });

  document.querySelectorAll('[data-i18n-html]').forEach((el) => {
    const value = getTranslationValue(lang, el.dataset.i18nHtml);
    if (typeof value === 'string') el.innerHTML = value;
  });

  document.querySelectorAll('.lang-toggle').forEach((button) => {
    const nextLang = lang === 'es' ? 'en' : 'es';
    const flag = nextLang === 'en' ? '🇺🇸' : '🇦🇷';
    button.innerHTML = `<span class="lang-flag" aria-hidden="true">${flag}</span>${nextLang.toUpperCase()}`;
  });

  render();
}

function initLanguage() {
  const savedLang = localStorage.getItem('paloma-lang');
  applyLanguage(savedLang === 'en' ? 'en' : 'es');

  document.querySelectorAll('.lang-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const nextLang = currentLang() === 'es' ? 'en' : 'es';
      localStorage.setItem('paloma-lang', nextLang);
      applyLanguage(nextLang);
    });
  });
}


/* ══════════════════════════════════════════════════════════════
   NAVBAR Y MENÚ MOBILE
   ══════════════════════════════════════════════════════════════ */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  /* En esta página el fondo del nav es sólido desde el arranque,
     porque no hay hero a pantalla completa detrás. */
  navbar.classList.add('scrolled');
}

function initMobileMenu() {
  const hamburger = document.getElementById('hamburger');
  const overlay = document.getElementById('menuOverlay');

  if (!hamburger || !overlay) return;

  function toggleMenu(forceClose = false) {
    const willOpen = forceClose ? false : !overlay.classList.contains('active');
    overlay.classList.toggle('active', willOpen);
    hamburger.classList.toggle('active', willOpen);
    hamburger.setAttribute('aria-expanded', willOpen);
    document.body.style.overflow = willOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMenu());

  overlay.querySelectorAll('.overlay-link').forEach((link) => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay.classList.contains('active')) toggleMenu(true);
  });
}


/* ══════════════════════════════════════════════════════════════
   RENDER
   ══════════════════════════════════════════════════════════════ */
function renderArchive() {
  const lang = currentLang();
  const grid = document.getElementById('newsGrid');
  const empty = document.getElementById('newsEmpty');

  document.getElementById('newsArchive').hidden = false;
  document.getElementById('newsEdition').hidden = true;
  document.title = getTranslationValue(lang, 'meta.archiveTitle');

  grid.innerHTML = '';
  empty.hidden = editions.length > 0;

  editions.forEach((edition) => {
    const card = document.createElement('a');
    card.className = 'news-card';
    card.href = editionUrl(edition.slug);

    const thumb = document.createElement('div');
    thumb.className = 'news-card-thumb';

    const image = document.createElement('img');
    image.src = encodeURI(edition.file);
    image.alt = edition.title;
    image.loading = 'lazy';
    image.decoding = 'async';
    thumb.appendChild(image);

    const body = document.createElement('div');
    body.className = 'news-card-body';

    const date = document.createElement('span');
    date.className = 'news-card-date';
    date.textContent = formatDate(edition.date, lang);

    const title = document.createElement('span');
    title.className = 'news-card-title';
    title.textContent = edition.title;

    body.append(date, title);
    card.append(thumb, body);
    grid.appendChild(card);
  });
}

function renderEdition(edition) {
  const lang = currentLang();

  document.getElementById('newsArchive').hidden = true;
  document.getElementById('newsEdition').hidden = false;
  document.title = `${edition.title} — ${getTranslationValue(lang, 'meta.title')}`;

  document.getElementById('editionDate').textContent = formatDate(edition.date, lang);
  document.getElementById('editionDate').setAttribute('datetime', edition.date);
  document.getElementById('editionTitle').textContent = edition.title;

  const image = document.getElementById('editionImage');
  image.src = encodeURI(edition.file);
  image.alt = edition.title;

  renderPager(edition);
}

function renderPager(edition) {
  const lang = currentLang();
  const pager = document.getElementById('newsPager');
  pager.innerHTML = '';

  const index = editions.findIndex((item) => item.slug === edition.slug);
  const older = editions[index + 1];
  const newer = editions[index - 1];

  const addLink = (target, labelKey, prefix, suffix) => {
    if (!target) return;

    const link = document.createElement('a');
    link.href = editionUrl(target.slug);

    const label = document.createElement('span');
    label.textContent = `${prefix}${getTranslationValue(lang, labelKey)}${suffix}`;

    const title = document.createElement('span');
    title.className = 'news-pager-title';
    title.textContent = target.title;

    link.append(label, title);
    pager.appendChild(link);
  };

  addLink(older, 'news.previous', '← ', '');
  addLink(newer, 'news.next', '', ' →');
}

function render() {
  if (!editions.length) {
    renderArchive();
    return;
  }

  const slug = new URLSearchParams(window.location.search).get('ed');
  const edition = slug ? editions.find((item) => item.slug === slug) : null;

  if (edition) {
    renderEdition(edition);
  } else {
    renderArchive();
  }
}

async function loadEditions() {
  try {
    const response = await fetch('data/newsletter.json');
    if (!response.ok) return;

    const data = await response.json();
    editions = Array.isArray(data.editions) ? data.editions : [];
  } catch (error) {
    console.warn('No se pudo cargar newsletter.json', error);
  }
}


document.addEventListener('DOMContentLoaded', () => {
  (async () => {
    await loadEditions();
    initLanguage();
    initNavbar();
    initMobileMenu();
  })();
});
