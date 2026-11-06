/* ══════════════════════════════════════════════════════════════
   PALOMA MASEDA — Portfolio
   subscribe.js — Formulario "Sumate al proceso"
   ──────────────────────────────────────────────────────────────
   Manda el mail a un Google Form propio; las respuestas quedan en
   la planilla vinculada a ese Form. Lo usan index.html y
   newsletter.html (cada página tiene su propio sistema de idioma,
   así que los textos del formulario viven acá).
   ══════════════════════════════════════════════════════════════ */

/* Google Form: FORM_ID es lo que va entre /d/e/ y /viewform en el link
   del formulario; ENTRY_ID es el campo de la pregunta "Email". */
const SUBSCRIBE_FORM_ID = '';
const SUBSCRIBE_ENTRY_ID = '';

const SUBSCRIBE_TEXTS = {
  es: {
    placeholder: 'tu@email.com',
    button: 'Suscribirme',
    sending: 'Enviando…',
    success: '¡Listo! Ya te sumaste.',
    invalid: 'Revisá el mail, parece que le falta algo.',
    error: 'No se pudo enviar. Probá de nuevo en un rato.',
  },
  en: {
    placeholder: 'you@email.com',
    button: 'Subscribe',
    sending: 'Sending…',
    success: "Done! You're on the list.",
    invalid: 'Check the email, something seems to be missing.',
    error: 'Could not send it. Please try again later.',
  },
};

function subscribeText(key) {
  const lang = document.documentElement.lang === 'en' ? 'en' : 'es';
  return SUBSCRIBE_TEXTS[lang][key];
}

function initSubscribeForm(form) {
  const input = form.querySelector('.newsletter-input');
  const button = form.querySelector('.newsletter-btn');
  const trap = form.querySelector('.newsletter-hp');
  const status = form.querySelector('.newsletter-status');

  const applyTexts = () => {
    input.placeholder = subscribeText('placeholder');
    button.textContent = subscribeText('button');
    if (status.dataset.key) status.textContent = subscribeText(status.dataset.key);
  };

  const setStatus = (key, state) => {
    status.dataset.key = key;
    status.className = `newsletter-status is-${state}`;
    status.textContent = subscribeText(key);
  };

  applyTexts();
  // El idioma lo cambia el script de cada página; acá solo se escucha.
  new MutationObserver(applyTexts).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['lang'],
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = input.value.trim();
    if (!input.checkValidity() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('invalid', 'error');
      input.focus();
      return;
    }

    // Un bot que completa todos los campos llena también el oculto: se le
    // muestra éxito pero no se manda nada.
    if (trap.value) {
      setStatus('success', 'success');
      form.reset();
      return;
    }

    // Con no-cors un envío a una dirección mal configurada "sale bien" igual,
    // así que sin Form cargado se avisa error en vez de un éxito falso.
    if (!SUBSCRIBE_FORM_ID || !SUBSCRIBE_ENTRY_ID) {
      console.warn('subscribe.js: falta configurar SUBSCRIBE_FORM_ID / SUBSCRIBE_ENTRY_ID');
      setStatus('error', 'error');
      return;
    }

    button.disabled = true;
    setStatus('sending', 'pending');

    try {
      // Google Forms no permite leer la respuesta desde otro sitio (no-cors):
      // si el pedido sale, se da por anotado.
      await fetch(`https://docs.google.com/forms/d/e/${SUBSCRIBE_FORM_ID}/formResponse`, {
        method: 'POST',
        mode: 'no-cors',
        body: new URLSearchParams({ [`entry.${SUBSCRIBE_ENTRY_ID}`]: email }),
      });
      setStatus('success', 'success');
      form.reset();
    } catch (error) {
      setStatus('error', 'error');
    } finally {
      button.disabled = false;
    }
  });
}

document.querySelectorAll('[data-subscribe]').forEach(initSubscribeForm);
