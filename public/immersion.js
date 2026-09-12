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
  let mobile = false;
  let mobileChapters = [];
  let layoutWidth = 0;
  let layoutHeight = 0;
  let queued = false;
  let pendingFocus = null;
  let focusTimer;
  let sceneStates = [];
  let mobileOpening = -1;
  let activeId;
  let geometry = { top: 0, range: 1, height: 1, page: 1, sections: [] };

  // Measure after layout changes, never after animation writes in the scroll loop.
  const measure = () => {
    const top = story?.offsetTop || 0;
    const height = stage?.clientHeight || innerHeight;
    geometry = {
      top, height,
      range: Math.max(1, (story?.offsetHeight || height) - height),
      page: Math.max(1, root.scrollHeight - innerHeight),
      sections: navigation.map(link => document.getElementById(link.hash.slice(1)))
        .filter(section => section && !(pinned && scenes.includes(section)))
        .map(section => ({ section, top: section.getBoundingClientRect().top + scrollY }))
    };
  };
  const renderMobileScene = (scene, index, alpha, transform) => {
    const opacity = alpha.toFixed(4);
    const visible = alpha > .005;
    const interactive = alpha > .5;
    const previous = sceneStates[index];
    if (!previous || previous.opacity !== opacity) scene.style.opacity = opacity;
    if (!previous || previous.visible !== visible) scene.style.visibility = visible ? 'visible' : 'hidden';
    if (!previous || previous.interactive !== interactive) {
      scene.style.pointerEvents = interactive ? 'auto' : 'none';
      scene.inert = !interactive;
      scene.setAttribute('aria-hidden', String(!interactive));
    }
    if (!previous || (visible && previous.transform !== transform)) scene.style.transform = transform;
    sceneStates[index] = { opacity, visible, interactive, transform: visible ? transform : previous?.transform };
  };

  const destination = target => {
    const scene = target.closest('.story-scene');
    const index = scenes.indexOf(scene);
    if (mobile && index >= 0) return geometry.top + mobileChapters[index].start;
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
    if (mobile) {
      const distance = scrollY - geometry.top;
      mobileChapters.forEach((chapter, index) => {
        const scene = scenes[index];
        const local = distance - chapter.start;
        const enter = index === 0 ? 1 : ease(1 + local / chapter.transition);
        const leave = index === scenes.length - 1 ? 0 : ease((local - chapter.hold) / chapter.transition);
        const alpha = enter * (1 - leave);
        const travel = clamp(local, 0, chapter.travel);
        renderMobileScene(scene, index, alpha, `translate3d(0,${-travel + (1 - enter) * 16 - leave * 10}px,0)`);
        if (alpha > .5) current = scene;
      });
      const opening = clamp(distance / mobileChapters[0].hold);
      if (opening !== mobileOpening) {
        heroImage.style.transform = `scale(${1 + opening * .06})`;
        mobileOpening = opening;
      }
    } else if (pinned) {
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
    let active = pinned && scrollY < geometry.top + geometry.range + geometry.height * .55 ? current : null;
    if (!active) {
      let nearest = -Infinity;
      geometry.sections.forEach(({ section, top: position }) => {
        const top = position - scrollY;
        if (top < innerHeight * .4 && top > nearest) { nearest = top; active = section; }
      });
    }
    if (activeId !== (active?.id || null)) {
      activeId = active?.id || null;
      navigation.forEach(link => {
        if (activeId && link.hash === `#${activeId}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    }
    if (progress) progress.style.transform = `scaleX(${clamp(scrollY / geometry.page)})`;
    if (pendingFocus && Math.abs(scrollY - destination(pendingFocus)) < 8) completeFocus();
  };
  const schedule = () => { if (!queued) { queued = true; requestAnimationFrame(paint); } };
  const configure = (force = true) => {
    // Mobile browser chrome can resize the visual viewport on every swipe.
    // A stable svh stage prevents those events from rebuilding the story.
    if (!force && root.clientWidth === layoutWidth && stage?.clientHeight === layoutHeight) {
      measure();
      schedule();
      return;
    }
    let previousPosition = null;
    if (mobile && mobileChapters.length && scrollY >= story.offsetTop && scrollY <= story.offsetTop + story.offsetHeight - stage.clientHeight) {
      const distance = scrollY - story.offsetTop;
      let index = 0;
      mobileChapters.forEach((chapter, i) => { if (distance >= chapter.start) index = i; });
      const chapter = mobileChapters[index];
      previousPosition = { index, fraction: (distance - chapter.start) / (chapter.hold + chapter.transition) };
    }
    scenes.forEach(scene => { scene.removeAttribute('style'); scene.inert = false; scene.removeAttribute('aria-hidden'); });
    sceneStates = [];
    mobileOpening = -1;
    [film, heroImage, heroCopy, product, ...albums].forEach(element => element?.removeAttribute('style'));
    root.classList.remove('immersion-mobile');
    story?.style.removeProperty('height');
    mobile = false;
    pinned = Boolean(story && !reduce.matches && roomy.matches);
    root.classList.toggle('immersion-active', pinned);
    if (pinned && scenes.some(scene => scene.scrollHeight > stage.clientHeight + 2)) {
      pinned = false;
      root.classList.remove('immersion-active');
    }
    // On a smaller screen each chapter may be taller than the viewport.
    // Scroll through all its content before transitioning to the next one.
    if (story && !reduce.matches && !pinned) {
      mobile = true;
      pinned = true;
      root.classList.add('immersion-mobile');
      const height = stage.clientHeight;
      let start = 0;
      mobileChapters = scenes.map(scene => {
        const travel = Math.max(0, scene.scrollHeight - height);
        const transition = height * .46;
        const hold = travel + height * .12;
        const chapter = { start, travel, hold, transition };
        start += hold + transition;
        return chapter;
      });
      const last = mobileChapters[mobileChapters.length - 1];
      story.style.height = `${last.start + last.hold + height}px`;
      if (previousPosition) {
        const chapter = mobileChapters[previousPosition.index];
        scrollTo({ top: story.offsetTop + chapter.start + previousPosition.fraction * (chapter.hold + chapter.transition), behavior: 'instant' });
      }
    }
    layoutWidth = root.clientWidth;
    layoutHeight = stage?.clientHeight || 0;
    measure();
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
  document.addEventListener('focusin', event => {
    if (!mobile) return;
    const scene = event.target.closest('.story-scene');
    const index = scenes.indexOf(scene);
    if (index < 0) return;
    const bounds = event.target.getBoundingClientRect();
    if (bounds.top >= 105 && bounds.bottom <= stage.clientHeight - 20 && !scene.inert) return;
    const offset = bounds.top - scene.getBoundingClientRect().top - 120;
    const chapter = mobileChapters[index];
    scrollTo({ top: story.offsetTop + chapter.start + clamp(offset, 0, chapter.travel), behavior: 'instant' });
  });
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', () => configure(false), { passive: true });
  addEventListener('pageshow', configure);
  addEventListener('scrollend', completeFocus);
  addEventListener('hashchange', () => { const target = hashTarget(); if (pinned && target) scrollTo({ top: destination(target), behavior: 'instant' }); });
  reduce.addEventListener('change', configure);
  roomy.addEventListener('change', configure);
  if ('ResizeObserver' in window) {
    new ResizeObserver(() => { measure(); schedule(); }).observe(document.body);
  } else {
    addEventListener('load', () => { measure(); schedule(); });
    document.addEventListener('toggle', () => { measure(); schedule(); }, true);
  }
  configure();
  document.fonts?.ready.then(() => {
    configure();
    const target = hashTarget();
    if (pinned && target) scrollTo({ top: destination(target), behavior: 'instant' });
  });
})();
