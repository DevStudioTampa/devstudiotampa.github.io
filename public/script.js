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
document.addEventListener('keydown', (event) => {
  if (event.key !== 'Escape' || toggle?.getAttribute('aria-expanded') !== 'true') return;
  toggle.setAttribute('aria-expanded', 'false');
  toggle.textContent = 'MENU';
  nav?.classList.remove('is-open');
  toggle.focus();
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
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
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
  const verificationStatus = inquiryForm.querySelector('#verification-status');
  const verificationMessage = (message) => {
    if (verificationStatus) verificationStatus.textContent = message;
  };
  window.onInquiryVerificationError = () => {
    verificationMessage('The security check could not finish. Refresh to try again, or use the email link beside this form.');
  };
  window.onInquiryVerificationExpired = () => {
    verificationMessage('The security check expired. Complete it again before sending.');
  };
  // An unavailable verification script must not leave the visitor without a next step.
  const verificationTimer = setTimeout(() => {
    if (!inquiryForm.querySelector('[name="cf-turnstile-response"]')?.value) {
      verificationMessage('If the security check is not loading or keeps retrying, use the email link beside this form.');
    }
  }, 20000);
  window.onInquiryVerified = () => {
    clearTimeout(verificationTimer);
    verificationMessage('');
  };
  inquiryForm.addEventListener('input', (event) => {
    for (const field of [...inquiryForm.elements].filter((element) => element.name === event.target.name)) {
      if (typeof field.setCustomValidity !== 'function') continue;
      field.setCustomValidity('');
      field.removeAttribute('aria-invalid');
    }
  });
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
    if (submitButton.disabled) return;
    if (!inquiryForm.reportValidity()) return;

    const values = new FormData(inquiryForm);
    const turnstileToken = values.get('cf-turnstile-response');
    if (!turnstileToken) {
      showFormStatus('Complete the security check, then try again. If it will not load, use the email link beside this form.', 'error');
      return;
    }

    const payload = Object.fromEntries(values.entries());
    submitButton.disabled = true;
    submitButton.textContent = 'Sending…';
    showFormStatus('Sending your inquiry…');

    const controller = new AbortController();
    const requestTimer = setTimeout(() => controller.abort(), 30000);
    try {
      const response = await fetch(inquiryForm.action, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) {
        const messages = [];
        for (const [name, message] of Object.entries(result.errors || {})) {
          const field = [...inquiryForm.elements].find((element) => element.name === name);
          if (field && typeof field.setCustomValidity === 'function' && field.type !== 'hidden') {
            field.setCustomValidity(String(message));
            field.setAttribute('aria-invalid', 'true');
          }
          messages.push(String(message));
        }
        throw new Error(messages.join(' ') || result.message || 'Your inquiry could not be sent. Please try again or use the email link.');
      }

      inquiryForm.reset();
      newSubmissionId();
      window.turnstile?.reset();
      showFormStatus('Your inquiry is in. Theodore will reply to the email you provided.', 'success');
    } catch (error) {
      window.turnstile?.reset();
      const fallback = 'Something interrupted the form. Try again, or email devstudiotampa@gmail.com.';
      showFormStatus(error?.name === 'AbortError'
        ? 'The request took too long to confirm. Your details are still here. Retry, or use the email link beside this form.'
        : error instanceof Error && error.message ? error.message : fallback, 'error');
    } finally {
      clearTimeout(requestTimer);
      submitButton.disabled = false;
      submitButton.textContent = 'Send inquiry';
    }
  });
}
