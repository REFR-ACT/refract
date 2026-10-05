(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('#mobile-nav');
  const closeMenu = () => {
    mobileNav.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
  };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    mobileNav.hidden = !open;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !mobileNav.hidden) { closeMenu(); menuButton.focus(); }
  });
  document.addEventListener('pointerdown', event => { if (!event.target.closest('.site-header')) closeMenu(); });
  matchMedia('(min-width: 761px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  const navLinks = [...document.querySelectorAll('.desktop-nav a')];
  const sections = navLinks.map(link => document.querySelector(link.hash));
  let navigationTarget = null;
  let navigationTimeout = 0;
  const setActive = id => navLinks.forEach(link => {
    const active = link.hash === `#${id}`;
    link.classList.toggle('is-active', active);
    if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
  });
  const releaseNavigation = () => { navigationTarget = null; clearTimeout(navigationTimeout); };
  const behavior = () => reducedMotion.matches ? 'instant' : 'smooth';
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', () => {
    closeMenu();
    const target = document.querySelector(link.hash);
    if (!target) return;
    navigationTarget = target;
    setActive(target.id === 'home' ? 'about' : target.id);
    clearTimeout(navigationTimeout);
    navigationTimeout = setTimeout(releaseNavigation, 1600);
  }));
  window.addEventListener('wheel', releaseNavigation, {passive:true});
  window.addEventListener('touchstart', releaseNavigation, {passive:true});
  document.addEventListener('keydown', event => { if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key) && !event.target.closest('button,input,textarea,select')) releaseNavigation(); });
  window.addEventListener('scrollend', releaseNavigation);

  const reveals = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) { entry.target.classList.add('is-visible'); reveals.unobserve(entry.target); }
  }), {threshold:.07, rootMargin:'0px 0px -15px'});
  document.querySelectorAll('.reveal').forEach(node => reveals.observe(node));
  document.documentElement.classList.add('js-ready');

  const projects = [
    {label:'01 / SOFTWARE & AI',title:'Make the thing\nyou wish existed.',description:'A useful app. A small model. A tool that saves you doing the same thing twice. Start with something you’d use.',prompt:'Automate a daily task'},
    {label:'02 / ROBOTICS & HARDWARE',title:'Take it off\nthe screen.',description:'Work with sensors, build a robot, or make a physical prototype. See what happens when your code meets the real world.',prompt:'Build something that responds to light'},
    {label:'03 / SCIENCE & DATA',title:'Start with\na question.',description:'Find a dataset, run a simulation, and see what the evidence says. A good question can be the beginning of a whole project.',prompt:'Explore a pattern in real data'}
  ];
  const projectTabs = [...document.querySelectorAll('[data-project]')];
  const showcase = document.querySelector('.project-showcase');
  const projectCopy = document.querySelector('.project-copy');
  function chooseProject(index, focus = false) {
    const project = projects[index];
    projectTabs.forEach((tab, i) => { tab.setAttribute('aria-selected', String(i === index)); tab.tabIndex = i === index ? 0 : -1; });
    showcase.dataset.project = String(index);
    document.querySelector('#project-index').textContent = project.label;
    const title = document.querySelector('#project-title');
    title.replaceChildren();
    project.title.split('\n').forEach((line, i) => { if (i) title.append(document.createElement('br')); title.append(document.createTextNode(line)); });
    document.querySelector('#project-description').textContent = project.description;
    document.querySelector('#project-prompt').textContent = `An idea to try → ${project.prompt}`;
    const panel = document.querySelector('#project-panel');
    panel.setAttribute('aria-labelledby', `project-tab-${index}`);
    panel.textContent = `${project.title.replace('\n',' ')} ${project.description} An idea to try: ${project.prompt}.`;
    projectCopy.classList.remove('is-changing');
    requestAnimationFrame(() => projectCopy.classList.add('is-changing'));
    if (focus) projectTabs[index].focus();
  }
  projectTabs.forEach((tab,index) => {
    tab.addEventListener('click', () => chooseProject(index));
    tab.addEventListener('keydown', event => {
      let next;
      if (event.key === 'ArrowRight') next = (index + 1) % projects.length;
      if (event.key === 'ArrowLeft') next = (index + projects.length - 1) % projects.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = projects.length - 1;
      if (next !== undefined) { event.preventDefault(); chooseProject(next, true); }
    });
  });

  const schedule = document.querySelector('.schedule-section');
  const track = document.querySelector('.schedule-track');
  const viewport = document.querySelector('.schedule-window');
  const steps = [...document.querySelectorAll('.schedule-step')];
  const previous = document.querySelector('[data-timeline="previous"]');
  const next = document.querySelector('[data-timeline="next"]');
  const timelineMedia = matchMedia('(min-width: 900px) and (min-height: 780px) and (prefers-reduced-motion: no-preference)');
  let travel = 0, distance = 0, timelineTop = 0, timelineProgress = 0, ticking = false;
  function measureTimeline() {
    const padding = parseFloat(getComputedStyle(viewport).paddingRight) || 0;
    travel = Math.max(0, track.scrollWidth - viewport.clientWidth + padding);
    const pinned = timelineMedia.matches && travel > 0;
    schedule.classList.toggle('is-pinned', pinned);
    distance = pinned ? Math.max(1200, travel * 1.8) : 0;
    schedule.style.height = pinned ? `${innerHeight + distance}px` : '';
    track.style.transform = '';
    if (pinned) viewport.scrollLeft = 0;
    timelineTop = schedule.getBoundingClientRect().top + scrollY;
    updateScroll();
  }
  function paintTimeline(progress) {
    timelineProgress = Math.max(0, Math.min(1, progress));
    const index = Math.min(4, Math.round(timelineProgress * 4));
    schedule.style.setProperty('--progress', timelineProgress.toFixed(4));
    document.querySelector('.schedule-count').textContent = String(index + 1).padStart(2, '0');
    steps.forEach((step, i) => step.classList.toggle('is-current', i === index));
    previous.disabled = timelineProgress <= .001;
    next.disabled = timelineProgress >= .999;
  }
  function updateScroll() {
    ticking = false;
    if (distance) {
      const progress = Math.max(0, Math.min(1, (scrollY - timelineTop) / distance));
      track.style.transform = `translate3d(${-travel * progress}px,0,0)`;
      paintTimeline(progress);
    }
    if (!navigationTarget) {
      const current = sections.filter(section => section.getBoundingClientRect().top <= innerHeight * .4).at(-1);
      setActive(current?.id || 'about');
    }
  }
  const requestScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(updateScroll); } };
  window.addEventListener('scroll', requestScroll, {passive:true});
  viewport.addEventListener('scroll', () => { if (!distance) paintTimeline(travel ? viewport.scrollLeft / travel : 0); }, {passive:true});
  for (const button of [previous,next]) button.addEventListener('click', () => {
    const direction = button === next ? 1 : -1;
    const destination = Math.max(0, Math.min(1, (Math.round(timelineProgress * 4) + direction) / 4));
    if (distance) window.scrollTo({top:timelineTop + distance * destination,behavior:behavior()});
    else viewport.scrollTo({left:travel * destination,behavior:behavior()});
  });
  timelineMedia.addEventListener('change', measureTimeline);
  let resizeFrame;
  window.addEventListener('resize', () => { cancelAnimationFrame(resizeFrame); resizeFrame = requestAnimationFrame(measureTimeline); });
  window.addEventListener('load', measureTimeline, {once:true});
  measureTimeline();
  paintTimeline(0);

  const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const node = entry.target, amount = Number(node.dataset.count);
    counterObserver.unobserve(node);
    if (reducedMotion.matches) return;
    const original = node.innerHTML, start = performance.now();
    node.setAttribute('aria-label', `$${amount.toLocaleString()} or more`);
    const tick = now => {
      const progress = Math.min(1, (now - start) / 780);
      if (progress === 1 || reducedMotion.matches) { node.innerHTML = original; return; }
      node.textContent = `$${Math.round(amount * progress).toLocaleString()}`;
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), {threshold:.7});
  document.querySelectorAll('[data-count]').forEach(node => counterObserver.observe(node));

  let sessionRequest;
  async function refreshSession() {
    sessionRequest?.abort();
    const controller = new AbortController(); sessionRequest = controller;
    try {
      const response = await fetch('/api/auth/get-session', {credentials:'same-origin',cache:'no-store',signal:AbortSignal.any([controller.signal,AbortSignal.timeout(10000)])});
      if (!response.ok) return;
      const data = await response.json();
      if (controller.signal.aborted) return;
      const signedIn = Boolean(data?.session && data?.user);
      document.querySelectorAll('[data-account-link]').forEach(link => { link.textContent = signedIn ? 'Account ↗' : 'Register ↗'; link.href = signedIn ? '/alt/account/' : '/alt/register/'; });
      document.querySelector('[data-signup]').hidden = signedIn;
      const closing = document.querySelector('[data-closing-account]');
      closing.textContent = signedIn ? 'Your account ↗' : 'Be part of Refract ↗';
      closing.href = signedIn ? '/alt/account/' : '/alt/register/';
    } catch { /* Sign-up stays available when the session service cannot be reached. */ }
  }
  window.addEventListener('pageshow', event => { if (event.persisted) { refreshSession(); measureTimeline(); } });
  document.addEventListener('visibilitychange', () => { if (!document.hidden) refreshSession(); });
  window.addEventListener('pagehide', () => sessionRequest?.abort());
  refreshSession();
})();
