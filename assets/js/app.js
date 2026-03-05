(() => {
  const UTM_BASE = {
    utm_source: 'github_pages',
    utm_medium: 'organic',
    utm_campaign: 'launch_2026_q1'
  };

  const withUTM = (url, content) => {
    if (!url || !/^https?:/i.test(url)) return url;
    const out = new URL(url);
    Object.entries(UTM_BASE).forEach(([k, v]) => out.searchParams.set(k, v));
    if (content) out.searchParams.set('utm_content', content);
    return out.toString();
  };

  const applyUTM = () => {
    document.querySelectorAll('a[data-utm]').forEach((node) => {
      const content = node.getAttribute('data-utm') || '';
      node.href = withUTM(node.href, content);
    });
  };

  const preserveInternalLang = () => {
    const lang = (window.XK_I18N && window.XK_I18N.getLang && window.XK_I18N.getLang()) || 'en';
    document.querySelectorAll('a[href]').forEach((node) => {
      const href = node.getAttribute('href') || '';
      if (!href || href.startsWith('#') || /^https?:/i.test(href) || href.startsWith('mailto:')) return;
      try {
        const url = new URL(href, window.location.href);
        url.searchParams.set('lang', lang);
        node.setAttribute('href', `${url.pathname}${url.search}${url.hash}`);
      } catch {
        // noop
      }
    });
  };

  const initReveal = () => {
    const targets = document.querySelectorAll('.reveal');
    if (!targets.length) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      targets.forEach((el) => el.classList.add('in-view'));
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.16 }
    );
    targets.forEach((el) => observer.observe(el));
  };

  const initScrollProgress = () => {
    const bar = document.getElementById('scrollProgress');
    if (!bar) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.width = `${Math.min(100, Math.max(0, pct)).toFixed(2)}%`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  };

  const initHeroParallax = () => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const hero = document.getElementById('heroMedia');
    if (!hero) return;
    const onScroll = () => {
      const rect = hero.getBoundingClientRect();
      const offset = Math.max(-16, Math.min(16, (window.innerHeight * 0.45 - rect.top) * 0.04));
      hero.style.transform = `translateY(${offset.toFixed(2)}px)`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  };

  const initRoleSwitcher = () => {
    const root = document.querySelector('[data-component="role-switch"]');
    if (!root) return;
    const tabs = root.querySelectorAll('[data-role-tab]');
    const panels = root.querySelectorAll('[data-role-panel]');
    const activate = (role) => {
      tabs.forEach((tab) => {
        tab.setAttribute('aria-selected', tab.getAttribute('data-role-tab') === role ? 'true' : 'false');
      });
      panels.forEach((panel) => {
        panel.classList.toggle('active', panel.getAttribute('data-role-panel') === role);
      });
    };
    tabs.forEach((tab) => {
      tab.addEventListener('click', () => activate(tab.getAttribute('data-role-tab')));
    });
  };

  const initGuideTOC = () => {
    const toc = document.querySelector('[data-component="guide-toc"]');
    if (!toc) return;
    const links = Array.from(toc.querySelectorAll('a[data-section-id]'));
    const sections = links
      .map((link) => document.getElementById(link.getAttribute('data-section-id') || ''))
      .filter(Boolean);
    if (!sections.length) return;

    const markActive = (id) => {
      links.forEach((link) => {
        link.classList.toggle('active', link.getAttribute('data-section-id') === id);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const seen = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!seen || !seen.target || !seen.target.id) return;
        markActive(seen.target.id);
      },
      { rootMargin: '-10% 0px -70% 0px', threshold: [0.2, 0.4, 0.7] }
    );
    sections.forEach((section) => observer.observe(section));
    markActive(sections[0].id);
  };

  const initGuideProgress = () => {
    const bar = document.getElementById('guideProgress');
    if (!bar) return;
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const pct = max > 0 ? (window.scrollY / max) * 100 : 0;
      bar.style.height = `${Math.min(100, Math.max(0, pct)).toFixed(2)}%`;
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  };

  const initCounters = () => {
    document.querySelectorAll('[data-counter]').forEach((node) => {
      const target = Number(node.getAttribute('data-counter') || 0);
      const start = performance.now();
      const dur = 900;
      const frame = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        node.textContent = Math.round(target * eased).toLocaleString('en-US');
        if (p < 1) requestAnimationFrame(frame);
      };
      requestAnimationFrame(frame);
    });
  };

  const initRepoMeta = () => {
    const page = document.body.getAttribute('data-page');
    if (page !== 'home') return;

    const repoMeta = document.getElementById('repoMeta');
    const captureCount = document.getElementById('captureCount');
    if (!repoMeta) return;

    fetch('https://api.github.com/repos/LaplaceYoung/Xknowledge', { headers: { Accept: 'application/vnd.github+json' } })
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('repo fetch failed'))))
      .then((repo) => {
        const lang = (window.XK_I18N && window.XK_I18N.getLang && window.XK_I18N.getLang()) || 'en';
        const stars = Number(repo.stargazers_count || 0).toLocaleString('en-US');
        const forks = Number(repo.forks_count || 0).toLocaleString('en-US');
        const pushed = new Date(repo.pushed_at);
        const date = pushed.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', { month: 'short', day: 'numeric' });
        repoMeta.textContent = lang === 'zh' ? `${stars} stars · ${forks} forks · 更新于 ${date}` : `${stars} stars · ${forks} forks · updated ${date}`;

        if (captureCount) {
          const dynamic = Math.max(1280, Number(repo.stargazers_count || 0) * 12 + 1200);
          captureCount.textContent = dynamic.toLocaleString('en-US');
        }
      })
      .catch(() => {
        const fallback = window.XK_I18N && window.XK_I18N.t && window.XK_I18N.t('runtime.repoFallback');
        repoMeta.textContent = typeof fallback === 'string' ? fallback : 'Open-source extension for X bookmark workflows';
      });
  };

  const initFaq = () => {
    document.querySelectorAll('.faq-item').forEach((item) => {
      const btn = item.querySelector('.faq-toggle');
      if (!btn) return;
      btn.addEventListener('click', () => {
        const willOpen = item.getAttribute('data-open') !== 'true';
        item.setAttribute('data-open', willOpen ? 'true' : 'false');
        btn.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });
    });
  };

  const initShareLink = () => {
    const btn = document.getElementById('shareLinkBtn');
    if (!btn) return;
    btn.addEventListener('click', async () => {
      const successText = (window.XK_I18N && window.XK_I18N.t && window.XK_I18N.t('runtime.copySuccess')) || 'Page link copied';
      const failText = (window.XK_I18N && window.XK_I18N.t && window.XK_I18N.t('runtime.copyFail')) || 'Copy failed';
      const original = btn.textContent || '';
      try {
        await navigator.clipboard.writeText(window.location.href);
        btn.textContent = String(successText);
      } catch {
        btn.textContent = String(failText);
      }
      window.setTimeout(() => {
        if (window.XK_I18N && window.XK_I18N.apply) window.XK_I18N.apply();
        else btn.textContent = original;
      }, 1400);
    });
  };

  const syncThemeColor = () => {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (!meta) return;
    const dark = document.documentElement.getAttribute('data-theme') === 'dark';
    meta.setAttribute('content', dark ? '#000000' : '#ffffff');
  };

  const initScrollHeader = () => {
    const header = document.querySelector('.topbar');
    if (!header) return;
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY > 20;
      header.style.backgroundColor = scrolled 
        ? (document.documentElement.getAttribute('data-theme') === 'dark' ? 'rgba(0,0,0,0.9)' : 'rgba(255,255,255,0.9)')
        : 'transparent';
      header.style.borderBottomColor = scrolled ? 'var(--x-border)' : 'transparent';
    }, { passive: true });
  };

  const initMagneticHero = () => {
    const heroMedia = document.getElementById('heroMedia');
    if (!heroMedia || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    
    document.addEventListener('mousemove', (e) => {
      const { clientX, clientY } = e;
      const { innerWidth, innerHeight } = window;
      const x = (clientX - innerWidth / 2) / innerWidth * 15;
      const y = (clientY - innerHeight / 2) / innerHeight * 15;
      heroMedia.style.transform = `translate(${x}px, ${y}px) rotateX(${-y/2}deg) rotateY(${x/2}deg)`;
    });
  };

  const init = () => {
    if (window.XK_THEME && window.XK_THEME.init) window.XK_THEME.init();
    if (window.XK_I18N && window.XK_I18N.init) window.XK_I18N.init();
    applyUTM();
    preserveInternalLang();
    initReveal();
    initScrollProgress();
    initScrollHeader();
    initMagneticHero();
    initRoleSwitcher();
    initGuideTOC();
    initGuideProgress();
    initCounters();
    initRepoMeta();
    initFaq();
    initShareLink();
    syncThemeColor();
    window.addEventListener('xk:langchange', () => {
      preserveInternalLang();
      initRepoMeta();
    });
    window.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof HTMLElement)) return;
      if (target.hasAttribute('data-theme-value')) {
        window.setTimeout(syncThemeColor, 0);
      }
    });
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
