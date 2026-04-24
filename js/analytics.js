(function () {
  const measurementId = document
    .querySelector('meta[name="google-analytics-id"]')
    ?.getAttribute('content')
    ?.trim();

  if (!measurementId || typeof window.gtag !== 'function') {
    window.palomaAnalytics = {
      enabled: false,
      track: () => {},
    };
    return;
  }

  function track(eventName, params = {}) {
    window.gtag('event', eventName, params);
  }

  function currentLang() {
    return document.documentElement.lang || 'es';
  }

  function trackPageView() {
    track('page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: window.location.pathname + window.location.hash,
      language: currentLang(),
    });
  }

  function initSectionTracking() {
    const sections = Array.from(document.querySelectorAll('section[id]'));
    if (!sections.length || !('IntersectionObserver' in window)) return;

    const seenSections = new Set();
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const sectionId = entry.target.id;
        if (!sectionId || seenSections.has(sectionId)) return;

        seenSections.add(sectionId);
        track('view_section', {
          section_id: sectionId,
          language: currentLang(),
        });
      });
    }, {
      threshold: 0.45,
    });

    sections.forEach((section) => observer.observe(section));
  }

  function initClickTracking() {
    document.addEventListener('click', (event) => {
      const projectButton = event.target.closest('.project-btn');
      if (projectButton) {
        const project = projectButton.closest('.project-item')?.dataset.slug || 'unknown';
        track('open_project_gallery', {
          project_slug: project,
          trigger: 'button',
          language: currentLang(),
        });
        return;
      }

      const projectImage = event.target.closest('.project-image-wrap');
      if (projectImage) {
        const project = projectImage.closest('.project-item')?.dataset.slug || 'unknown';
        track('open_project_gallery', {
          project_slug: project,
          trigger: 'image',
          language: currentLang(),
        });
        return;
      }

      const contactLink = event.target.closest('.contact-link');
      if (contactLink) {
        const href = contactLink.getAttribute('href') || '';
        track('contact_click', {
          contact_type: href.startsWith('mailto:') ? 'email' : 'external',
          destination: href,
          language: currentLang(),
        });
        return;
      }

      const langToggle = event.target.closest('.lang-toggle');
      if (langToggle) {
        const nextLang = currentLang() === 'es' ? 'en' : 'es';
        track('switch_language', {
          target_language: nextLang,
        });
        return;
      }

      const link = event.target.closest('a[href]');
      if (!link) return;

      const href = link.getAttribute('href') || '';
      const isExternal = /^https?:\/\//i.test(href) && !href.includes(window.location.hostname);
      if (!isExternal) return;

      track('click_outbound', {
        destination: href,
        language: currentLang(),
      });
    });
  }

  function initHistoryTracking() {
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function pushState() {
      const result = originalPushState.apply(this, arguments);
      trackPageView();
      return result;
    };

    history.replaceState = function replaceState() {
      const result = originalReplaceState.apply(this, arguments);
      trackPageView();
      return result;
    };

    window.addEventListener('popstate', trackPageView);
    window.addEventListener('hashchange', trackPageView);
  }

  function init() {
    trackPageView();
    initSectionTracking();
    initClickTracking();
    initHistoryTracking();
  }

  window.palomaAnalytics = {
    enabled: true,
    track,
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init, { once: true });
  } else {
    init();
  }
})();
