const toggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('#site-nav');
toggle?.addEventListener('click', () => {
  const open = toggle.getAttribute('aria-expanded') === 'true';
  toggle.setAttribute('aria-expanded', String(!open));
  toggle.textContent = open ? 'MENU' : 'CLOSE';
  nav.classList.toggle('is-open', !open);
});
nav?.addEventListener('click', () => {
  toggle?.setAttribute('aria-expanded', 'false');
  if (toggle) toggle.textContent = 'MENU';
  nav.classList.remove('is-open');
});
const year = document.querySelector('#year');
if (year) year.textContent = String(new Date().getFullYear());
