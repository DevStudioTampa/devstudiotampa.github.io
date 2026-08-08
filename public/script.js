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

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
if (!reduceMotion.matches) {
  document.documentElement.classList.add('motion-ready', 'reveal-ready');

  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealItems.forEach((item) => observer.observe(item));
  } else {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  }
}

const inquiryForm = document.querySelector('#inquiry-form');
if (inquiryForm) {
  const submissionId = inquiryForm.querySelector('#submission-id');
  const submitButton = inquiryForm.querySelector('.inquiry-submit');
  const formStatus = inquiryForm.querySelector('#form-status');
  const newSubmissionId = () => {
    if (submissionId) submissionId.value = crypto.randomUUID();
  };
  const showFormStatus = (message, type = '') => {
    if (!formStatus) return;
    formStatus.textContent = message;
    formStatus.className = `form-status${type ? ` form-status--${type}` : ''}`;
    formStatus.focus({ preventScroll: true });
  };

  newSubmissionId();
  inquiryForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!inquiryForm.reportValidity()) return;

    const values = new FormData(inquiryForm);
    const turnstileToken = values.get('cf-turnstile-response');
    if (!turnstileToken) {
      showFormStatus('Complete the security check, then try again.', 'error');
      return;
    }

    const payload = Object.fromEntries(values.entries());
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    showFormStatus('Sending your inquiry…');

    try {
      const response = await fetch(inquiryForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.message || 'Your inquiry could not be sent.');

      inquiryForm.reset();
      newSubmissionId();
      window.turnstile?.reset();
      showFormStatus('Your inquiry is in. Theodore will reply to the email you provided.', 'success');
    } catch (error) {
      window.turnstile?.reset();
      const fallback = 'Something interrupted the form. Try again, or email devstudiotampa@gmail.com.';
      showFormStatus(error instanceof Error && error.message ? error.message : fallback, 'error');
    } finally {
      submitButton.disabled = false;
      submitButton.textContent = 'Send inquiry';
    }
  });
}
