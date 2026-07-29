(function () {
  'use strict';

  var urls = typeof WalkDogUrls !== 'undefined' ? WalkDogUrls : null;
  var form = document.getElementById('checkout-form');
  if (!urls || !form) return;

  var planCard = document.getElementById('checkout-plan-card');
  var planSlugInput = document.getElementById('checkout-plan-slug');
  var planTitle = document.getElementById('checkout-plan-name');
  var planTag = document.getElementById('checkout-plan-tag');
  var planSubtitle = document.getElementById('checkout-plan-subtitle');
  var planBadge = document.getElementById('checkout-plan-badge');
  var planRibbon = document.getElementById('checkout-plan-ribbon');
  var planVisual = document.getElementById('checkout-plan-visual');
  var planImage = document.getElementById('checkout-plan-image');
  var planFeatures = document.getElementById('checkout-plan-features');
  var planMore = document.getElementById('checkout-plan-more');
  var planToggle = document.getElementById('checkout-plan-toggle');
  var planDetails = document.getElementById('checkout-plan-details');
  var planDetailsList = document.getElementById('checkout-plan-details-list');
  var planDetailsExtra = document.getElementById('checkout-plan-details-extra');
  var planDetailsIdeal = document.getElementById('checkout-plan-details-ideal');
  var planDetailsResult = document.getElementById('checkout-plan-details-result');
  var planAmount = document.getElementById('checkout-plan-amount');
  var planPeriod = document.getElementById('checkout-plan-period');
  var errorBox = document.getElementById('checkout-error');
  var culqiContainer = document.getElementById('culqi-container');
  var culqiFallbackBtn = document.getElementById('culqi-fallback-btn');

  var config = { culqi_public_key: '', plans: [] };
  var selectedPlan = null;
  var culqiScriptLoaded = false;
  var culqiV4Loaded = false;
  var culqiInstance = null;
  var culqiEmailObserver = null;
  var mountedCulqiEmail = '';
  var useModalFallback = false;
  var isSubmitting = false;

  var FALLBACK_PLANS = {
    basico: { slug: 'basico', name: 'START', price_cents: 5000, currency: 'USD' },
    intermedio: { slug: 'intermedio', name: 'CONTROL', price_cents: 10000, currency: 'USD' },
    premium: { slug: 'premium', name: 'ELITE', price_cents: 100000, currency: 'USD' },
  };

  var PLAN_UI = {
    basico: {
      displayName: 'START',
      cardClass: 'pricing-card--plan-1',
      featured: false,
      badge: 'Plan mensual',
      badgeClass: '',
      tag: '"DESCUBRE EL MÉTODO"',
      subtitle: 'Entiende por qué tu perro no te obedece',
      image: 'assets/img-dog-plan-1.webp',
      imageAlt: 'Perro en plan START',
      ribbon: false,
      highlights: [
        'Acceso inicial al Sistema Víctor Prieto',
        'Los 5 errores que destruyen la obediencia de tu perro',
        'Psicología canina aplicada a la vida real',
        'Cómo generar respeto y vínculo desde el día 1',
        'Cómo corregir ladridos, ansiedad y desorden en casa',
        'Método base de paseo con control',
        'Introducción a comandos esenciales',
        'Primer protocolo de corrección en casa',
        'Acceso a comunidad de dueños en proceso',
      ],
      checkoutHighlights: [
        'Acceso inicial al Sistema Víctor Prieto',
        'Los 5 errores que destruyen la obediencia',
        'Psicología canina aplicada a la vida real',
        'Método base de paseo con control',
      ],
      result: '🐶 Empiezas a recuperar control y liderazgo en casa',
      ideal: 'Personas que sienten: “Mi perro me quiere… pero no me respeta”',
      period: 'USD / mes',
    },
    intermedio: {
      displayName: 'CONTROL',
      cardClass: 'pricing-card--plan-2',
      featured: true,
      badge: 'Plan mensual',
      badgeClass: 'pricing-card__badge--accent',
      tag: '"CLUB VÍCTOR PRIETO"',
      subtitle: 'Donde los dueños se convierten en líderes reales',
      image: 'assets/img-dog-plan-2.webp',
      imageAlt: 'Perro en plan CONTROL',
      ribbon: true,
      highlights: [
        'Todo el sistema START incluido',
        'Mentorías grupales en vivo con Víctor Prieto',
        'Corrección de videos de tu perro',
        'Diagnóstico real de comportamiento',
        'Casos reales analizados cada semana',
        'Planes de acción personalizados',
        'Nuevos protocolos cada mes',
        'Biblioteca de entrenamientos en crecimiento',
        'Entrenamientos en vivo',
        'Comunidad privada activa',
      ],
      checkoutHighlights: [
        'Todo el sistema START incluido',
        'Mentorías grupales en vivo con Víctor Prieto',
        'Corrección de videos y diagnóstico real',
        'Comunidad privada activa',
      ],
      result: '🐶 Transformas comportamiento real con acompañamiento constante',
      ideal: 'Personas que ya intentaron de todo y dicen: “Necesito que alguien me guíe paso a paso”',
      period: 'USD / mes',
    },
    premium: {
      displayName: 'ELITE',
      cardClass: 'pricing-card--plan-3',
      featured: false,
      badge: 'Plan anual',
      badgeClass: 'pricing-card__badge--premium',
      tag: '"INNER CIRCLE VÍCTOR PRIETO"',
      subtitle: 'Acceso al sistema completo del entrenador de +5000 perros',
      image: 'assets/img-dog-plan-3.webp',
      imageAlt: 'Perro en plan ELITE',
      ribbon: false,
      highlights: [
        'Todo lo del CLUB incluido',
        'Acceso total a la biblioteca premium completa',
        '+150 horas de entrenamiento real en campo',
        'Protocolos profesionales usados en casos reales',
        'Sistema completo de evaluación de conducta canina',
        'Diseño de programas de entrenamiento desde cero',
        'Casos avanzados (agresividad, ansiedad, dominancia, etc.)',
        'Sesiones exclusivas con Víctor Prieto',
        'Acceso prioritario a consultas personales',
        'Actualizaciones constantes del sistema',
        'Comunidad VIP de alto nivel',
      ],
      checkoutHighlights: [
        'Todo lo del CLUB incluido',
        'Biblioteca premium +150 h en campo',
        'Sesiones exclusivas con Víctor Prieto',
        'Certificación del Método Víctor Prieto',
      ],
      bonus: [
        'Masterclasses privadas nunca publicadas',
        'Casos reales documentados de +5000 perros',
        'Plantillas profesionales de entrenamiento',
        'Certificación del Método Víctor Prieto',
      ],
      notice: 'Acceso no automático · Cupos limitados o por aprobación',
      result: '🐶 Te conviertes en alguien capaz de entender, corregir y liderar perros a nivel profesional',
      ideal: 'Personas que buscan el nivel más alto del sistema y están listas para liderar a nivel profesional.',
      period: 'USD / año · acceso limitado',
    },
  };

  function getPlanFromQuery() {
    var params = new URLSearchParams(window.location.search);
    return (params.get('plan') || 'intermedio').toLowerCase();
  }

  function getPublicKey() {
    return config.culqi_public_key || urls.culqiPublicKey || '';
  }

  function loadScript(src, flag) {
    return new Promise(function (resolve, reject) {
      if (flag === 'custom' && typeof CulqiCheckout !== 'undefined') {
        resolve();
        return;
      }
      if (flag === 'v4' && typeof Culqi !== 'undefined') {
        resolve();
        return;
      }
      var script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  function loadCulqiCustomScript() {
    if (culqiScriptLoaded) return Promise.resolve();
    return loadScript('https://js.culqi.com/checkout-js', 'custom').then(function () {
      culqiScriptLoaded = true;
    });
  }

  function loadCulqiV4Script() {
    if (culqiV4Loaded) return Promise.resolve();
    return loadScript('https://checkout.culqi.com/js/v4', 'v4').then(function () {
      culqiV4Loaded = true;
    });
  }

  function fetchConfig() {
    return fetch(urls.apiConfig, { headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('config');
        return res.json();
      })
      .then(function (data) {
        config = data || config;
      });
  }

  function findPlan(slug) {
    return (config.plans || []).find(function (plan) {
      return plan.slug === slug;
    }) || FALLBACK_PLANS[slug] || null;
  }

  function showError(message) {
    if (!errorBox) return;
    errorBox.textContent = message || '';
    errorBox.hidden = !message;
  }

  function setContainerLoading(message) {
    if (!culqiContainer) return;
    culqiContainer.classList.add('is-loading');
    culqiContainer.innerHTML = '<p class="culqi-embed__loading">' + (message || 'Cargando formulario de pago seguro…') + '</p>';
  }

  function clearContainerLoading() {
    if (!culqiContainer) return;
    culqiContainer.classList.remove('is-loading');
  }

  function getClientEmail() {
    var emailInput = form.querySelector('input[name="email"]');
    return emailInput ? String(emailInput.value || '').trim() : '';
  }

  function buildCulqiClient() {
    return {
      email: getClientEmail(),
    };
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showCulqiAwaitingEmail() {
    if (!culqiContainer) return;
    stopCulqiEmailObserver();
    culqiInstance = null;
    mountedCulqiEmail = '';
    culqiContainer.classList.add('is-loading');
    culqiContainer.innerHTML = '<p class="culqi-embed__loading">Completa tu <strong>correo electrónico</strong> arriba para mostrar los campos de tarjeta.</p>';
  }

  function ensureCulqiEmailHideStyles() {
    if (document.getElementById('wd-culqi-hide-email')) return;

    var style = document.createElement('style');
    style.id = 'wd-culqi-hide-email';
    style.textContent = [
      '#culqi-container div:has(> input[placeholder*="correo" i]),',
      '#culqi-container div:has(> input[placeholder*="@" i]),',
      '#culqi-container label:has(+ input[placeholder*="correo" i]),',
      '#culqi-container label:has(+ input[placeholder*="@" i]),',
      '#culqi-container input[placeholder*="correo" i],',
      '#culqi-container input[placeholder*="@" i],',
      '#culqi-container input[type="email"] {',
      'display: none !important;',
      'visibility: hidden !important;',
      'height: 0 !important;',
      'max-height: 0 !important;',
      'margin: 0 !important;',
      'padding: 0 !important;',
      'border: 0 !important;',
      'overflow: hidden !important;',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  function showCulqiPlaceholder(message) {
    if (!culqiContainer) return;
    stopCulqiEmailObserver();
    culqiContainer.classList.add('is-loading');
    culqiContainer.innerHTML = '<p class="culqi-embed__loading">' + (message || 'No se pudo cargar el pago con tarjeta.') + '</p>';
    culqiInstance = null;
    mountedCulqiEmail = '';
  }

  function validateRegistrationForm() {
    if (!form.reportValidity()) {
      return false;
    }

    var password = form.querySelector('input[name="password"]');
    var confirmation = form.querySelector('input[name="password_confirmation"]');

    if (password && confirmation && password.value !== confirmation.value) {
      showError('Las contraseñas no coinciden.');
      return false;
    }

    showError('');
    return true;
  }

  function renderHighlights(listEl, items) {
    if (!listEl) return;
    listEl.innerHTML = '';
    (items || []).forEach(function (item) {
      var text = typeof item === 'string' ? item : item.text;
      var li = document.createElement('li');
      li.textContent = text;
      if (typeof item === 'object' && item.muted) li.className = 'is-muted';
      listEl.appendChild(li);
    });
  }

  function setPlanDetailsExpanded(isOpen) {
    if (!planDetails || !planToggle) return;
    planDetails.hidden = !isOpen;
    planToggle.textContent = isOpen ? 'Ver menos' : 'Ver plan completo';
    planToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  }

  function renderPlanDetails(ui) {
    renderHighlights(planDetailsList, ui.highlights || []);

    if (planDetailsExtra) {
      planDetailsExtra.innerHTML = '';
      var hasExtra = false;

      if (ui.bonus && ui.bonus.length) {
        hasExtra = true;
        var bonusWrap = document.createElement('div');
        bonusWrap.className = 'checkout-plan-card__bonus';
        var bonusTitle = document.createElement('h4');
        bonusTitle.className = 'checkout-plan-card__bonus-title';
        bonusTitle.textContent = 'Bonus';
        bonusWrap.appendChild(bonusTitle);
        var bonusList = document.createElement('ul');
        bonusList.className = 'checkout-plan-card__bonus-list';
        ui.bonus.forEach(function (item) {
          var li = document.createElement('li');
          li.textContent = '🎁 ' + item;
          bonusList.appendChild(li);
        });
        bonusWrap.appendChild(bonusList);
        planDetailsExtra.appendChild(bonusWrap);
      }

      if (ui.notice) {
        hasExtra = true;
        var notice = document.createElement('p');
        notice.className = 'checkout-plan-card__notice';
        notice.textContent = '⚠️ ' + ui.notice;
        planDetailsExtra.appendChild(notice);
      }

      planDetailsExtra.hidden = !hasExtra;
    }

    if (planDetailsIdeal) {
      if (ui.ideal) {
        planDetailsIdeal.hidden = false;
        planDetailsIdeal.innerHTML = '<strong>Ideal para:</strong> ' + ui.ideal;
      } else {
        planDetailsIdeal.hidden = true;
        planDetailsIdeal.textContent = '';
      }
    }

    if (planDetailsResult) {
      if (ui.result) {
        planDetailsResult.hidden = false;
        planDetailsResult.textContent = ui.result;
      } else {
        planDetailsResult.hidden = true;
        planDetailsResult.textContent = '';
      }
    }
  }

  function hasExpandablePlanDetails(ui) {
    var summaryItems = ui.checkoutHighlights || (ui.highlights || []).slice(0, 4);
    var totalItems = (ui.highlights || []).length;
    return totalItems > summaryItems.length || !!(ui.ideal || ui.result || (ui.bonus && ui.bonus.length) || ui.notice);
  }

  function renderPlan(slug) {
    selectedPlan = findPlan(slug);
    var ui = PLAN_UI[slug];

    if (!selectedPlan || !ui) {
      window.location.href = 'index.html#membresias';
      return;
    }

    if (planCard) {
      planCard.className = 'pricing-card checkout-plan-card ' + ui.cardClass + (ui.featured ? ' pricing-card--featured' : '');
    }

    if (planSlugInput) planSlugInput.value = slug;
    if (planTitle) planTitle.textContent = ui.displayName || selectedPlan.name;
    if (planTag) planTag.textContent = ui.tag;
    if (planSubtitle) {
      planSubtitle.textContent = ui.subtitle || '';
      planSubtitle.hidden = !ui.subtitle;
    }

    if (planBadge) {
      planBadge.textContent = ui.badge;
      planBadge.className = 'pricing-card__badge' + (ui.badgeClass ? ' ' + ui.badgeClass : '');
    }

    if (planRibbon) {
      planRibbon.classList.toggle('is-hidden', !ui.ribbon);
    }

    if (planImage) {
      planImage.src = ui.image;
      planImage.alt = ui.imageAlt;
    }

    var summaryItems = ui.checkoutHighlights || (ui.highlights || []).slice(0, 4);
    renderHighlights(planFeatures, summaryItems);
    renderPlanDetails(ui);
    setPlanDetailsExpanded(false);

    if (planMore && planToggle) {
      if (hasExpandablePlanDetails(ui)) {
        planMore.hidden = false;
      } else {
        planMore.hidden = true;
        setPlanDetailsExpanded(false);
      }
    }

    var amount = Math.round(selectedPlan.price_cents / 100);
    if (planAmount) {
      planAmount.innerHTML = '<span class="pricing-card__currency">$</span>' + amount.toLocaleString('en-US');
    }
    if (planPeriod) planPeriod.textContent = ui.period;

    document.title = 'Checkout — ' + (ui.displayName || selectedPlan.name) + ' | WalkDog';
  }

  function buildCulqiConfig(embedded) {
    return {
      settings: {
        title: 'WalkDog',
        currency: selectedPlan.currency,
        amount: selectedPlan.price_cents,
      },
      client: buildCulqiClient(),
      options: {
        lang: 'es',
        installments: false,
        modal: !embedded,
        container: embedded ? '#culqi-container' : undefined,
        paymentMethods: {
          tarjeta: true,
          yape: false,
          bancaMovil: false,
          agente: false,
          billetera: false,
          cuotealo: false,
        },
        paymentMethodsSort: ['tarjeta'],
      },
      appearance: {
        theme: 'default',
        hiddenCulqiLogo: true,
        hiddenBanner: true,
        hiddenBannerContent: true,
        hiddenToolBarAmount: true,
        hiddenEmail: true,
        menuType: 'sliderTop',
        buttonCardPayText: 'Pagar y acceder a la plataforma',
        defaultStyle: {
          buttonBackground: '#ffd00d',
          buttonTextColor: '#111111',
          linksColor: '#3a7d63',
        },
        variables: {
          fontFamily: '"Cabinet Grotesk", Inter, sans-serif',
          borderRadius: '12px',
          colorBackground: '#ffffff',
          colorPrimary: '#ffd00d',
          colorPrimaryText: '#111111',
          colorText: '#111111',
          colorTextSecondary: '#6b7280',
          colorTextPlaceholder: '#9ca3af',
        },
        rules: {
          '.Culqi-Main-Container': {
            background: '#ffffff',
            padding: '0',
            overflow: 'visible',
            maxHeight: 'none',
            height: 'auto',
          },
          '.Culqi-Main-Method': {
            background: '#ffffff',
            overflow: 'visible',
            maxHeight: 'none',
            height: 'auto',
          },
          '.Culqi-Form': {
            overflow: 'visible',
            maxHeight: 'none',
            height: 'auto',
          },
          '.Culqi-ToolBanner': {
            display: 'none',
          },
          '.Culqi-Toolbar': {
            display: 'none',
          },
          '.Culqi-Email': {
            display: 'none',
          },
          '.Culqi-InputEmail': {
            display: 'none',
          },
          '.Culqi-Label': {
            color: '#6b7280',
            fontSize: '12px',
            textTransform: 'uppercase',
          },
          '.Culqi-Input': {
            border: '1px solid #d1d5db',
            background: '#ffffff',
            color: '#111111',
          },
          '.Culqi-Button': {
            background: '#ffd00d',
            color: '#111111',
            fontWeight: '700',
          },
        },
      },
    };
  }

  function submitCheckout(token) {
    var formData = new FormData(form);

    return fetch(urls.apiCheckout, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.get('name'),
        email: formData.get('email'),
        password: formData.get('password'),
        password_confirmation: formData.get('password_confirmation'),
        plan: formData.get('plan'),
        token: token,
      }),
    }).then(function (res) {
      return res.json().then(function (data) {
        if (!res.ok) {
          var message = data.message;
          if (data.errors) {
            message = Object.keys(data.errors).map(function (key) {
              return data.errors[key][0];
            }).join(' ');
          }
          throw new Error(message || 'No se pudo completar el pago.');
        }
        return data;
      });
    });
  }

  function processToken(tokenId) {
    if (!validateRegistrationForm()) {
      isSubmitting = false;
      return;
    }

    isSubmitting = true;
    submitCheckout(tokenId)
      .then(function (data) {
        window.location.href = data.redirect || urls.inicio;
      })
      .catch(function (error) {
        isSubmitting = false;
        showError(error.message || 'Error al procesar el pago.');
      });
  }

  function handleCulqiAction() {
    if (!isValidEmail(getClientEmail())) {
      isSubmitting = false;
      showError('Completa tu correo electrónico en Contacto antes de pagar.');
      return;
    }

    syncEmailIntoCulqiInput();
    hideCulqiEmailField();

    if (!validateRegistrationForm()) {
      isSubmitting = false;
      return;
    }

    var token = culqiInstance && culqiInstance.token;

    if (token && token.id) {
      processToken(token.id);
      return;
    }

    if (culqiInstance && culqiInstance.error) {
      isSubmitting = false;
      showError(
        culqiInstance.error.user_message
          || culqiInstance.error.merchant_message
          || 'Error al procesar el pago con tarjeta.',
      );
    }
  }

  window.culqi = function () {
    if (!isSubmitting) return;

    if (typeof Culqi !== 'undefined' && Culqi.token) {
      processToken(Culqi.token.id);
      return;
    }

    if (typeof Culqi !== 'undefined' && Culqi.error) {
      isSubmitting = false;
      showError(Culqi.error.user_message || 'Error al procesar el pago con tarjeta.');
    }
  };

  function showFallbackButton() {
    if (!culqiFallbackBtn) return;
    culqiFallbackBtn.hidden = false;
  }

  function expandCulqiLayout() {
    if (!culqiContainer) return;

    culqiContainer.style.setProperty('overflow', 'visible', 'important');
    culqiContainer.style.setProperty('overflow-y', 'visible', 'important');
    culqiContainer.style.setProperty('max-height', 'none', 'important');
    culqiContainer.style.setProperty('height', 'auto', 'important');
    culqiContainer.style.setProperty('min-height', 'auto', 'important');

    culqiContainer.querySelectorAll('*').forEach(function (el) {
      if (el.tagName === 'IFRAME') {
        el.style.setProperty('min-height', '460px', 'important');
        el.style.setProperty('height', '460px', 'important');
        el.style.setProperty('overflow', 'visible', 'important');
        return;
      }

      var computed = window.getComputedStyle(el);
      var maxHeight = parseFloat(computed.maxHeight);

      if (
        computed.overflowY === 'auto'
        || computed.overflowY === 'scroll'
        || (computed.maxHeight !== 'none' && !Number.isNaN(maxHeight) && maxHeight > 0 && maxHeight < 900)
      ) {
        el.style.setProperty('overflow', 'visible', 'important');
        el.style.setProperty('overflow-y', 'visible', 'important');
        el.style.setProperty('max-height', 'none', 'important');
        el.style.setProperty('height', 'auto', 'important');
      }
    });
  }

  function syncEmailIntoCulqiInput() {
    var email = getClientEmail();
    if (!email || !culqiContainer) return;

    culqiContainer.querySelectorAll('input').forEach(function (input) {
      var placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
      var isEmailField = (
        input.type === 'email'
        || placeholder.indexOf('correo') !== -1
        || placeholder.indexOf('@') !== -1
      );

      if (!isEmailField) return;

      input.value = email;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    });
  }

  function hideCulqiEmailField() {
    if (!culqiContainer) return;

    culqiContainer.querySelectorAll('input').forEach(function (input) {
      var placeholder = (input.getAttribute('placeholder') || '').toLowerCase();
      var name = (input.getAttribute('name') || '').toLowerCase();
      var id = (input.getAttribute('id') || '').toLowerCase();
      var isEmailField = (
        input.type === 'email'
        || name.indexOf('email') !== -1
        || id.indexOf('email') !== -1
        || placeholder.indexOf('correo') !== -1
        || placeholder.indexOf('@') !== -1
      );

      if (!isEmailField) return;

      var row = input.closest('[class*="Field"], [class*="Row"], [class*="Group"], [class*="Email"]');
      if (!row) {
        row = input.parentElement;
        while (row && row !== culqiContainer && row.children.length > 3) {
          row = row.parentElement;
        }
      }
      if (row && culqiContainer.contains(row)) {
        row.style.setProperty('display', 'none', 'important');
      }
    });

    culqiContainer.querySelectorAll('label, .Culqi-Label, p, span').forEach(function (node) {
      var text = (node.textContent || '').trim();
      if (!/^correo/i.test(text) && text.toLowerCase().indexOf('correo electr') === -1) return;
      var row = node.closest('[class*="Field"], [class*="Row"], [class*="Group"], [class*="Email"]') || node.parentElement;
      if (row && culqiContainer.contains(row)) {
        row.style.setProperty('display', 'none', 'important');
      }
    });

    syncEmailIntoCulqiInput();
  }

  function startCulqiEmailObserver() {
    if (!culqiContainer || culqiEmailObserver) return;

    culqiEmailObserver = new MutationObserver(function () {
      hideCulqiEmailField();
      expandCulqiLayout();
      syncEmailIntoCulqiInput();
    });

    culqiEmailObserver.observe(culqiContainer, {
      childList: true,
      subtree: true,
    });
  }

  function stopCulqiEmailObserver() {
    if (!culqiEmailObserver) return;
    culqiEmailObserver.disconnect();
    culqiEmailObserver = null;
  }

  function mountEmbeddedCulqi(force) {
    var publicKey = getPublicKey();
    var email = getClientEmail();

    if (!isValidEmail(email)) {
      showCulqiAwaitingEmail();
      return Promise.resolve();
    }

    if (!force && email === mountedCulqiEmail && culqiInstance) {
      hideCulqiEmailField();
      syncEmailIntoCulqiInput();
      return Promise.resolve();
    }

    if (!publicKey || !selectedPlan || typeof CulqiCheckout === 'undefined') {
      throw new Error('missing culqi');
    }

    if (culqiInstance && typeof culqiInstance.close === 'function') {
      try {
        culqiInstance.close();
      } catch (error) {
        /* noop */
      }
    }

    stopCulqiEmailObserver();

    if (culqiContainer) {
      culqiContainer.innerHTML = '';
      clearContainerLoading();
    }

    culqiInstance = new CulqiCheckout(publicKey, buildCulqiConfig(true));
    culqiInstance.culqi = handleCulqiAction;
    culqiInstance.open();
    mountedCulqiEmail = email;

    hideCulqiEmailField();
    expandCulqiLayout();
    window.setTimeout(hideCulqiEmailField, 400);
    window.setTimeout(expandCulqiLayout, 400);
    window.setTimeout(hideCulqiEmailField, 1200);
    window.setTimeout(expandCulqiLayout, 1200);
    startCulqiEmailObserver();

    window.setTimeout(function () {
      if (!culqiContainer) return;
      var hasCulqiContent = culqiContainer.querySelector('.Culqi-Main-Container, iframe, form, input');
      if (!hasCulqiContent) {
        showFallbackButton();
        showError('Si no ves los campos de tarjeta, usa el botón «Abrir pago con tarjeta».');
      }
    }, 3000);

    return Promise.resolve();
  }

  function syncCulqiCheckout() {
    if (!culqiScriptLoaded) return;

    var email = getClientEmail();
    if (!isValidEmail(email)) {
      showCulqiAwaitingEmail();
      return;
    }

    if (email === mountedCulqiEmail && culqiInstance) {
      hideCulqiEmailField();
      syncEmailIntoCulqiInput();
      return;
    }

    mountEmbeddedCulqi(true).catch(function () {
      showCulqiPlaceholder('No se pudo cargar el pago con tarjeta.');
      showFallbackButton();
    });
  }

  function openModalFallback() {
    if (!validateRegistrationForm()) return;

    var publicKey = getPublicKey();
    if (!publicKey || !selectedPlan) {
      showError('El pago no está disponible temporalmente.');
      return;
    }

    isSubmitting = true;

    loadCulqiV4Script()
      .then(function () {
        Culqi.publicKey = publicKey;
        Culqi.settings({
          title: 'WalkDog',
          currency: selectedPlan.currency,
          amount: selectedPlan.price_cents,
        });
        Culqi.options({
          lang: 'es',
          installments: false,
          paymentMethods: { tarjeta: true, yape: false, bancaMovil: false, agente: false, billetera: false, cuotealo: false },
          style: { maincolor: '#ffd00d', buttontext: '#111111' },
        });
        Culqi.open();
      })
      .catch(function () {
        isSubmitting = false;
        showError('No se pudo abrir el pago con tarjeta.');
      });
  }

  function initCulqiCheckout() {
    setContainerLoading();

    return loadCulqiCustomScript()
      .then(function () {
        syncCulqiCheckout();
        if (culqiFallbackBtn) culqiFallbackBtn.hidden = true;
      })
      .catch(function () {
        showCulqiPlaceholder('No se pudo cargar el formulario embebido.');
        showFallbackButton();
        showError('Usa el botón de abajo para abrir el pago con tarjeta.');
      });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
  });

  if (culqiFallbackBtn) {
    culqiFallbackBtn.addEventListener('click', openModalFallback);
  }

  document.querySelectorAll('[data-platform-login]').forEach(function (el) {
    el.href = urls.login;
  });

  var emailInput = form.querySelector('input[name="email"]');
  var emailDebounce;

  if (emailInput) {
    emailInput.addEventListener('blur', syncCulqiCheckout);
    emailInput.addEventListener('change', syncCulqiCheckout);
    emailInput.addEventListener('input', function () {
      window.clearTimeout(emailDebounce);
      emailDebounce = window.setTimeout(syncCulqiCheckout, 400);
    });
  }

  ensureCulqiEmailHideStyles();

  if (planToggle) {
    planToggle.addEventListener('click', function () {
      var isOpen = planToggle.getAttribute('aria-expanded') === 'true';
      setPlanDetailsExpanded(!isOpen);
    });
  }

  var slug = getPlanFromQuery();
  renderPlan(slug);
  initCulqiCheckout();

  fetchConfig()
    .then(function () {
      renderPlan(slug);
      syncCulqiCheckout();
    })
    .catch(function () {
      /* La clave pública local en landing-urls.js ya permite cargar Culqi */
    });
})();
