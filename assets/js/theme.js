(() => {
  const KEY = 'xknowledge_theme';
  const root = document.documentElement;
  const media = window.matchMedia('(prefers-color-scheme: dark)');

  const getStored = () => {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  };

  const getSystem = () => (media.matches ? 'dark' : 'light');

  const setButtons = (theme) => {
    document.querySelectorAll('[data-theme-value]').forEach((btn) => {
      btn.setAttribute('aria-pressed', btn.getAttribute('data-theme-value') === theme ? 'true' : 'false');
    });
  };

  const apply = (theme) => {
    root.setAttribute('data-theme', theme);
    setButtons(theme);
  };

  const setTheme = (theme, persist = true) => {
    apply(theme);
    if (!persist) return;
    try {
      localStorage.setItem(KEY, theme);
    } catch {
      // noop
    }
  };

  const init = () => {
    const stored = getStored();
    const startTheme = stored === 'light' || stored === 'dark' ? stored : getSystem();
    apply(startTheme);

    document.querySelectorAll('[data-theme-value]').forEach((btn) => {
      btn.addEventListener('click', () => setTheme(btn.getAttribute('data-theme-value') || 'light'));
    });

    media.addEventListener('change', () => {
      const currentStored = getStored();
      if (currentStored !== 'light' && currentStored !== 'dark') {
        apply(getSystem());
      }
    });
  };

  window.XK_THEME = {
    get: () => root.getAttribute('data-theme') || 'light',
    set: setTheme,
    init
  };
})();
