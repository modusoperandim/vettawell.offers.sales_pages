(() => {
  const FALLBACK_CONFIG = {
    version: 2,
    settings: {
      redirect_param_name: 'campaign_id',
      no_match_action: 'original',
      default_redirect_url: '',
      default_404_url: '',
      redirect_target: 'self',
      scroll_enabled: true,
      scroll_direction: 'down',
      touch_min_delta_px: 1,
      timer_enabled: true,
      timer_seconds: 1,
      count_from_navigation_start: true,
      pause_when_hidden: false,
      os_filter_enabled: true,
      browser_filter_enabled: false,
      debug: false
    },
    routes: [],
    filters: {
      os_rules: [],
      browser_rules: []
    }
  };

  const cfg = normalizeConfig(window.__REDIRECT_CFG__ || FALLBACK_CONFIG);
  let redirected = false;

  function log(...args) {
    if (cfg.settings.debug) console.log('[redirect-engine]', ...args);
  }

  function normalizeConfig(input) {
    const c = JSON.parse(JSON.stringify(input || {}));
    c.settings = Object.assign({}, FALLBACK_CONFIG.settings, c.settings || {});
    c.routes = Array.isArray(c.routes) ? c.routes : [];
    c.filters = Object.assign({ os_rules: [], browser_rules: [] }, c.filters || {});
    return c;
  }

  function getQueryParam(name) {
    try {
      return new URLSearchParams(window.location.search).get(name) || '';
    } catch (_) {
      return '';
    }
  }

  function norm(v) {
    return String(v || '').trim().toLowerCase();
  }

  function getBrowser() {
    const ua = navigator.userAgent || '';
    if (/SamsungBrowser/i.test(ua)) return 'Samsung Internet';
    if (/Edg\//i.test(ua)) return 'Edge';
    if (/OPR\/|Opera/i.test(ua)) return 'Opera';
    if (/Chrome\//i.test(ua) && !/Edg\/|OPR\/|SamsungBrowser/i.test(ua)) return 'Chrome';
    if (/Safari\//i.test(ua) && !/Chrome\/|Chromium\/|Edg\/|OPR\/|SamsungBrowser/i.test(ua)) return 'Safari';
    if (/Firefox\//i.test(ua)) return 'Firefox';
    return 'Other';
  }

  function getOS() {
    const ua = navigator.userAgent || '';
    const platform = navigator.platform || '';
    if (/Android/i.test(ua)) return 'Android';
    if (/iPhone|iPad|iPod/i.test(ua)) return 'iOS';
    if (/CrOS/i.test(ua)) return 'ChromeOS';
    if (/Win/i.test(platform) || /Windows/i.test(ua)) return 'Windows';
    if (/Mac/i.test(platform) || /Mac OS X/i.test(ua)) return 'MacOS';
    if (/Linux/i.test(platform) || /Linux/i.test(ua)) return 'Linux';
    return 'Other';
  }

  function isAllowedByRule(visitorValue, rows, keyField) {
    const normalizedValue = String(visitorValue || '').trim().toLowerCase();

    const allowMap = new Map();
    const blockMap = new Map();

    for (const row of rows || []) {
      const key = String(row[keyField] || '').trim();
      const rule = String(row.rule || '').trim().toLowerCase();
      if (!key || !rule) continue;
      if (rule === 'allow') allowMap.set(key.toLowerCase(), true);
      if (rule === 'block') blockMap.set(key.toLowerCase(), true);
    }

    if (blockMap.has(normalizedValue)) return false;
    if (allowMap.size > 0) return allowMap.has(normalizedValue);
    return false;
  }

  function resolveRoute() {
    const settings = cfg.settings;
    const paramName = String(settings.redirect_param_name || 'campaign_id');
    const campaign = norm(getQueryParam(paramName));

    if (!campaign) {
      if (String(settings.no_match_action || 'original') === 'default_redirect' && settings.default_redirect_url) {
        return { action: 'redirect', url: String(settings.default_redirect_url).trim(), reason: 'no_campaign_default_redirect' };
      }
      return { action: 'original', reason: 'no_campaign_param' };
    }

    const route = (cfg.routes || []).find(r => norm(r.campaign_id) === campaign);
    if (!route) {
      if (String(settings.no_match_action || 'original') === 'default_redirect' && settings.default_redirect_url) {
        return { action: 'redirect', url: String(settings.default_redirect_url).trim(), reason: 'no_match_default_redirect' };
      }
      return { action: 'original', reason: 'no_route_match' };
    }

    const status = String(route.status || '').trim().toLowerCase();
    if (status === 'inactive') return { action: 'original', reason: 'route_inactive' };
    if (status === 'broken') {
      const brokenUrl = String(route.broken_url_override || settings.default_404_url || '').trim();
      return brokenUrl
        ? { action: 'redirect', url: brokenUrl, reason: 'route_broken' }
        : { action: 'original', reason: 'route_broken_no_404_url' };
    }
    if (status === 'active') {
      const url = String(route.redirect_url || '').trim();
      return url
        ? { action: 'redirect', url, reason: 'route_active' }
        : { action: 'original', reason: 'route_active_missing_url' };
    }

    return { action: 'original', reason: 'unknown_route_status' };
  }

  function safeRedirect(url, target) {
    if (!url || redirected) return;
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

  function initRedirectHandlers(targetUrl) {
    const settings = cfg.settings;
    const target = String(settings.redirect_target || 'self').toLowerCase();

    if (settings.scroll_enabled) {
      const direction = String(settings.scroll_direction || 'down').toLowerCase();
      const touchMinDeltaPx = Number(settings.touch_min_delta_px || 1);

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
        safeRedirect(targetUrl, target);
      }, { passive: false });

      let touchLastY = null;

      window.addEventListener('touchstart', (e) => {
        touchLastY = e.touches?.[0]?.clientY ?? null;
      }, { passive: true });

      window.addEventListener('touchmove', (e) => {
        const y = e.touches?.[0]?.clientY ?? null;
        if (touchLastY == null || y == null) return;

        const dy = touchLastY - y;
        touchLastY = y;

        if (Math.abs(dy) < touchMinDeltaPx) return;

        const dir = dy > 0 ? 'down' : 'up';
        if (!directionAllowed(dir)) return;

        e.preventDefault();
        safeRedirect(targetUrl, target);
      }, { passive: false });
    }

    if (settings.timer_enabled) {
      const ms = Math.max(0, Number(settings.timer_seconds || 0) * 1000);
      let startedAt = 0;
      let remaining = ms;
      let timerId = null;

      function fireTimerRedirect() {
        safeRedirect(targetUrl, target);
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

      function initTimer() {
        if (settings.count_from_navigation_start && typeof performance !== 'undefined' && Number.isFinite(performance.now())) {
          remaining = Math.max(0, ms - performance.now());
        }

        if (settings.pause_when_hidden) {
          document.addEventListener('visibilitychange', () => {
            if (document.hidden) pauseTimer();
            else resumeTimer();
          });
        }

        startTimer();
      }

      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTimer, { once: true });
      } else {
        initTimer();
      }
    }
  }

  function applyFilters() {
    const settings = cfg.settings;
    const visitor = {
      os: getOS(),
      browser: getBrowser()
    };

    log('visitor', visitor);

    if (settings.os_filter_enabled) {
      const allowed = isAllowedByRule(visitor.os, cfg.filters.os_rules, 'os_name');
      if (!allowed) return { allowed: false, reason: 'os_blocked', visitor };
    }

    if (settings.browser_filter_enabled) {
      const allowed = isAllowedByRule(visitor.browser, cfg.filters.browser_rules, 'browser_name');
      if (!allowed) return { allowed: false, reason: 'browser_blocked', visitor };
    }

    return { allowed: true, reason: 'filters_passed', visitor };
  }

  function init() {
    const filterResult = applyFilters();
    log('filterResult', filterResult);

    if (!filterResult.allowed) return;

    const routeResult = resolveRoute();
    log('routeResult', routeResult);

    if (routeResult.action !== 'redirect' || !routeResult.url) return;
    initRedirectHandlers(routeResult.url);
  }

  init();
})();
