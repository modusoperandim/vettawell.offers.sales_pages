(() => {
  // =========================
  // ROUTING (GET -> URL mapping)
  // REDIRECT SCRIPT REDIRECT
  // =========================
  const routeCfg = {
    enabled: true,

    // Имя GET-параметра, который ты передаёшь в URL:
    // пример: https://site.com/?offer=cb1
    paramName: 'campaign_id',

    // Нормализация значения параметра перед маппингом
    trim: true,
    toLowerCase: true,

    // Если параметр отсутствует или нет в маппинге — используем defaultUrl
    defaultUrl: 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=enrev&traffic_source=snexus&traffic_type=sms&campaign=e-revolution_029&creative=cr_cb_e-revolution_offer_019',

    // JSON-маппинг: ключ = значение GET-параметра, value = ссылка редиректа
    // пример: ?campaign_id=citrusburn_013 -> routes.cb1
    
    
    routes: [
      ['e-revolution_029', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=enrev&traffic_source=snexus&traffic_type=sms&campaign=e-revolution_029&creative=cr_cb_e-revolution_offer_019'],
      ['e-revolution_030', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=enrev&traffic_source=snexus&traffic_type=sms&campaign=e-revolution_030&creative=cr_cb_e-revolution_offer_020'],
      ['e-revolution_031', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=enrev&traffic_source=snexus&traffic_type=sms&campaign=e-revolution_031&creative=cr_cb_e-revolution_offer_021'],
      ['e-revolution_032', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=enrev&traffic_source=snexus&traffic_type=sms&campaign=e-revolution_032&creative=cr_cb_e-revolution_offer_022'],
      ['e-revolution_033', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=enrev&traffic_source=clksnd&traffic_type=sms&campaign=e-revolution_033&creative=cr_cb_e-revolution_offer_023'],
      ['e-revolution_034', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=enrev&traffic_source=snexus&traffic_type=sms&campaign=e-revolution_034&creative=cr_cb_e-revolution_offer_024'],
      ['e-revolution_035', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=enrev&traffic_source=snexus&traffic_type=sms&campaign=e-revolution_035&creative=cr_cb_e-revolution_offer_025'],
      ['e-revolution_036', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=enrev&traffic_source=clksnd&traffic_type=sms&campaign=e-revolution_036&creative=cr_cb_e-revolution_offer_026'],
      ['e-revolution_037', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=enrev&traffic_source=snexus&traffic_type=sms&campaign=e-revolution_037&creative=cr_cb_e-revolution_offer_027'],

      ['geniussong_016', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=geniusbr&pid=vsl&traffic_source=send_nexus&traffic_type=sms&campaign=geniussong_016&creative=cr_cb_geniussong_offer_007'],
      ['geniussong_017', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=geniusbr&pid=vsl&traffic_source=send_nexus&traffic_type=sms&campaign=geniussong_017&creative=cr_cb_geniussong_offer_008'],
      ['geniussong_018', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=geniusbr&pid=vsl&traffic_source=send_nexus&traffic_type=sms&campaign=geniussong_018&creative=cr_cb_geniussong_offer_009'],
      ['geniussong_019', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=geniusbr&pid=vsl&traffic_source=clksnd&traffic_type=sms&campaign=geniussong_019&creative=cr_cb_geniussong_offer_010'],
      ['geniussong_024', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=geniusbr&pid=vsl&traffic_source=send_nexus&traffic_type=sms&campaign=geniussong_024&creative=cr_cb_geniussong_offer_015'],
      ['geniussong_025', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=geniusbr&pid=vsl&traffic_source=send_nexus&traffic_type=sms&campaign=geniussong_025&creative=cr_cb_geniussong_offer_016'],
      ['geniussong_026', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=geniusbr&pid=vsl&traffic_source=send_nexus&traffic_type=sms&campaign=geniussong_026&creative=cr_cb_geniussong_offer_017'],
      ['geniussong_027', 'https://hop.clickbank.net/?affiliate=marketcopi&vendor=geniusbr&pid=vsl&traffic_source=send_nexus&traffic_type=sms&campaign=geniussong_027&creative=cr_cb_geniussong_offer_018'],

      ]
  };



  function resolveRedirectUrl() {
    const fallback = String(routeCfg.defaultUrl || '').trim();
    if (!routeCfg.enabled) return fallback;

    let v = '';
    try {
      v = new URLSearchParams(window.location.search).get(routeCfg.paramName) || '';
    } catch (_) {
      v = '';
    }

    if (routeCfg.trim) v = v.trim();
    if (routeCfg.toLowerCase) v = v.toLowerCase();

    if (!v) return fallback;

    const mapped = routeCfg.routes?.find(([key]) => key === v)?.[1];
    return String(mapped || fallback).trim();
  }

  const resolvedUrl = resolveRedirectUrl();

  // =========================
  // CONFIG
  // =========================
  const cfg = {
    // --- Scroll redirect ---
    scrollRedirect: {
      enabled: true,
      direction: 'down', // 'up' | 'down' | 'both'
      redirectUrl: resolvedUrl,     // <-- берём из маппинга
      target: 'self',    // 'self' | 'blank'
      debug: false,
      touchMinDeltaPx: 1
    },

    // --- Timer redirect ---
    timerRedirect: {
      enabled: true,
      destinationUrl: resolvedUrl,  // <-- берём из маппинга
      target: 'self', // 'self' | 'blank'

      cooldownMs: null,
      cooldownSeconds: 1,

      // dom = после DOMContentLoaded
      // load = после полной загрузки (картинки и т.д.)
      startOn: 'dom',  // <-- рекомендую 'dom' (быстрее)

      // если true — таймер считается "от открытия страницы" через performance.now()
      countFromNavigationStart: true,

      pauseWhenHidden: false,
      debug: false
    },

    logBeforeUnload: false
  };

  // =========================
  // Shared redirect guard
  // =========================
  let redirected = false;

  function safeRedirect(url, target) {
    if (redirected) return;
    redirected = true;

    const go = () => {
      if (target === 'blank') {
        const w = window.open(url, '_blank', 'noopener,noreferrer');
        if (!w) window.location.replace(url);
      } else {
        window.location.replace(url);
      }
    };

    requestAnimationFrame(go);
  }

  // =========================
  // 1) SCROLL REDIRECT
  // =========================
  function initScrollRedirect() {
    const c = cfg.scrollRedirect;
    if (!c?.enabled) return;

    const url = String(c.redirectUrl || '').trim();
    const direction = String(c.direction || 'down').toLowerCase();
    const target = String(c.target || 'self').toLowerCase();

    if (!url) return;
    if (!['up', 'down', 'both'].includes(direction)) return;
    if (!['self', 'blank'].includes(target)) return;

    function directionAllowed(dir) {
      return direction === 'both' ||
        (direction === 'down' && dir === 'down') ||
        (direction === 'up' && dir === 'up');
    }

    window.addEventListener('wheel', (e) => {
      const dy = e.deltaY || 0;
      if (!dy) return;

      const dir = dy > 0 ? 'down' : 'up';
      if (!directionAllowed(dir)) return;

      e.preventDefault();
      safeRedirect(url, target);
    }, { passive: false });

    let touchLastY = null;

    window.addEventListener('touchstart', (e) => {
      touchLastY = e.touches?.[0]?.clientY ?? null;
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      const y = e.touches?.[0]?.clientY ?? null;
      if (touchLastY == null || y == null) return;

      const dy = touchLastY - y; // палец вверх => dy>0 => down
      touchLastY = y;

      if (Math.abs(dy) < (c.touchMinDeltaPx ?? 1)) return;

      const dir = dy > 0 ? 'down' : 'up';
      if (!directionAllowed(dir)) return;

      e.preventDefault();
      safeRedirect(url, target);
    }, { passive: false });
  }

  // =========================
  // 2) TIMER REDIRECT
  // =========================
  function initTimerRedirect() {
    const c = cfg.timerRedirect;
    if (!c?.enabled) return;

    const url = String(c.destinationUrl || '').trim();
    const target = String(c.target || 'self').toLowerCase();
    const startOn = String(c.startOn || 'dom').toLowerCase();

    if (!url) return;
    if (!['self', 'blank'].includes(target)) return;
    if (!['dom', 'load'].includes(startOn)) return;

    let ms;
    if (Number.isFinite(c.cooldownMs) && c.cooldownMs >= 0) ms = Number(c.cooldownMs);
    else {
      const sec = Number(c.cooldownSeconds);
      ms = (Number.isFinite(sec) && sec >= 0) ? sec * 1000 : 0;
    }

    let timerId = null;
    let startedAt = 0;
    let remaining = ms;

    function fireTimerRedirect() {
      safeRedirect(url, target);
    }

    function startTimer() {
      if (redirected || timerId) return;
      startedAt = Date.now();
      timerId = setTimeout(fireTimerRedirect, remaining);
    }

    function stopTimer() {
      if (!timerId) return;
      clearTimeout(timerId);
      timerId = null;
    }

    function pauseTimer() {
      if (!timerId) return;
      const elapsed = Date.now() - startedAt;
      remaining = Math.max(0, remaining - elapsed);
      stopTimer();
    }

    function resumeTimer() {
      if (redirected || timerId) return;
      startTimer();
    }

    function init() {
      // Ключевое: считаем "от открытия страницы", а не от момента init()
      // performance.now() = ms от navigation start
      if (c.countFromNavigationStart) {
        remaining = Math.max(0, ms - performance.now());
      }

      if (c.pauseWhenHidden) {
        document.addEventListener('visibilitychange', () => {
          if (document.hidden) pauseTimer();
          else resumeTimer();
        });
      }

      startTimer();
    }

    if (startOn === 'load') {
      if (document.readyState === 'complete') init();
      else window.addEventListener('load', init, { once: true });
    } else {
      if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once: true });
      else init();
    }
  }

  if (cfg.logBeforeUnload) {
    window.addEventListener('beforeunload', () => {});
  }

  // =========================
  // INIT
  // =========================
  initScrollRedirect();
  initTimerRedirect();
})();
