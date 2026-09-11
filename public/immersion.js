(() => {
  const root = document.documentElement;
  const story = document.querySelector('.immersion-story');
  const stage = document.querySelector('.immersion-stage');
  const scenes = [...document.querySelectorAll('.story-scene')];
  const film = document.querySelector('.opening-film');
  const heroImage = film?.querySelector('img');
  const heroCopy = document.querySelector('.opening-copy');
  const albums = [...document.querySelectorAll('.album-card')];
  const product = document.querySelector('.product-card');
  const progress = document.querySelector('.reading-progress');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const roomy = matchMedia('(min-width: 1000px) and (min-height: 700px)');
  const navigation = [...document.querySelectorAll('#site-nav a[href^="#"]')];
  const clamp = (value, low = 0, high = 1) => Math.min(high, Math.max(low, value));
  const ease = value => { const t = clamp(value); return t * t * (3 - 2 * t); };
  let pinned = false;
  let queued = false;
  let pendingFocus = null;
  let focusTimer;

  const destination = target => {
    const index = scenes.indexOf(target);
    if (pinned && index >= 0) return story.offsetTop + index / (scenes.length - 1) * (story.offsetHeight - stage.offsetHeight);
    return Math.max(0, target.getBoundingClientRect().top + scrollY - 110);
  };
  const completeFocus = () => {
    if (!pendingFocus || pendingFocus.inert) return;
    const heading = pendingFocus.querySelector('h1, h2, h3') || pendingFocus;
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
    pendingFocus = null;
  };
  const paint = () => {
    queued = false;
    let current = null;
    if (pinned) {
      const phase = clamp((scrollY - story.offsetTop) / (story.offsetHeight - stage.offsetHeight)) * (scenes.length - 1);
      const opening = clamp(phase);
      film.style.inset = `${12 * (1 - opening)}px`;
      film.style.borderRadius = `${30 * (1 - opening)}px`;
      heroImage.style.transform = `scale(${1 + opening * .12})`;
      heroCopy.style.transform = `translateY(${-opening * 42}px)`;
      scenes.forEach((scene, index) => {
        const enter = index === 0 ? 1 : ease((phase - index + .5) / .5);
        const leave = index === scenes.length - 1 ? 0 : ease((phase - index - .45) / .55);
        const alpha = enter * (1 - leave);
        scene.style.opacity = alpha.toFixed(4);
        scene.style.visibility = alpha > .005 ? 'visible' : 'hidden';
        scene.style.pointerEvents = alpha > .5 ? 'auto' : 'none';
        scene.style.transform = `translateY(${(1 - enter) * 65 - leave * 28}px) scale(${.975 + enter * .025 - leave * .015})`;
        scene.inert = alpha <= .5;
        scene.setAttribute('aria-hidden', String(alpha <= .5));
        if (alpha > .5) current = scene;
      });
      albums.forEach((card, i) => { card.style.transform = `translateY(${(1 - ease((phase - .45 - i * .07) / .5)) * (55 + i * 15)}px)`; });
      product.style.transform = `translateY(${(1 - ease((phase - 1.45) / .55)) * 70}px)`;
    }
    let active = pinned && scrollY < story.offsetTop + story.offsetHeight - stage.offsetHeight + stage.offsetHeight * .55 ? current : null;
    if (!active) {
      let nearest = -Infinity;
      navigation.forEach(link => {
        const section = document.getElementById(link.hash.slice(1));
        if (!section || (pinned && scenes.includes(section))) return;
        const top = section.getBoundingClientRect().top;
        if (top < innerHeight * .4 && top > nearest) { nearest = top; active = section; }
      });
    }
    navigation.forEach(link => {
      if (active && link.hash === `#${active.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    if (progress) progress.style.transform = `scaleX(${clamp(scrollY / Math.max(1, root.scrollHeight - innerHeight))})`;
    if (pendingFocus && Math.abs(scrollY - destination(pendingFocus)) < 8) completeFocus();
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
  const configure = () => {
    scenes.forEach(scene => { scene.removeAttribute('style'); scene.inert = false; scene.removeAttribute('aria-hidden'); });
    [film, heroImage, heroCopy, product, ...albums].forEach(element => element?.removeAttribute('style'));
    pinned = Boolean(story && !reduce.matches && roomy.matches);
    root.classList.toggle('immersion-active', pinned);
    if (pinned && scenes.some(scene => scene.scrollHeight > stage.clientHeight + 2)) {
      pinned = false;
      root.classList.remove('immersion-active');
    }
    schedule();
  };
  const hashTarget = () => {
    try { return document.getElementById(decodeURIComponent(location.hash.slice(1))); }
    catch { return null; }
  };
  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || link.classList.contains('skip-link') || !pinned || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    if (link.origin !== location.origin || link.pathname !== location.pathname || link.search !== location.search || !link.hash) return;
    const target = document.getElementById(link.hash.slice(1));
    if (!target) return;
    event.preventDefault();
    pendingFocus = event.detail === 0 ? target : null;
    clearTimeout(focusTimer);
    history.pushState(null, '', link.hash);
    scrollTo({ top: destination(target), behavior: 'smooth' });
    // Native scrollend is not present in every browser.
    if (pendingFocus) focusTimer = setTimeout(completeFocus, 1600);
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', configure, { passive: true });
  addEventListener('pageshow', configure);
  addEventListener('scrollend', completeFocus);
  addEventListener('hashchange', () => { const target = hashTarget(); if (pinned && target) scrollTo({ top: destination(target), behavior: 'instant' }); });
  reduce.addEventListener('change', configure);
  roomy.addEventListener('change', configure);
  configure();
  document.fonts?.ready.then(() => {
    configure();
    const target = hashTarget();
    if (pinned && target) scrollTo({ top: destination(target), behavior: 'instant' });
  });
})();
