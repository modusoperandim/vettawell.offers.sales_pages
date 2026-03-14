(() => {
  const current = document.currentScript;
  if (!current) return;

  const configUrl = String(current.dataset.configUrl || '').trim();
  const engineUrl = String(current.dataset.engineUrl || '').trim();
  const bustConfig = String(current.dataset.configBust || 'true').toLowerCase() !== 'false';
  const bustEngine = String(current.dataset.engineBust || 'false').toLowerCase() === 'true';
  const debug = String(current.dataset.debug || 'false').toLowerCase() === 'true';

  function log(...args) {
    if (debug) console.log('[redirect-loader]', ...args);
  }

  function withCacheBust(url, enabled) {
    if (!enabled) return url;
    const sep = url.includes('?') ? '&' : '?';
    return url + sep + '_ts=' + Date.now();
  }

  function loadScript(src, onload) {
    const s = document.createElement('script');
    s.src = src;
    s.async = false;
    s.onload = () => {
      log('loaded', src);
      if (typeof onload === 'function') onload();
    };
    s.onerror = () => {
      console.error('[redirect-loader] failed to load script:', src);
    };
    document.head.appendChild(s);
  }

  if (!configUrl) {
    console.error('[redirect-loader] missing data-config-url');
    return;
  }

  if (!engineUrl) {
    console.error('[redirect-loader] missing data-engine-url');
    return;
  }

  const finalConfigUrl = withCacheBust(configUrl, bustConfig);
  const finalEngineUrl = withCacheBust(engineUrl, bustEngine);

  loadScript(finalConfigUrl, () => loadScript(finalEngineUrl));
})();
