(() => {
  const form = document.querySelector('.claim-form');
  if (!form) return;
  const radios = [...form.querySelectorAll('[name="widget_id"]')];
  const summary = form.querySelector('#claim-selection');
  const emailSection = form.querySelector('#claim-email-section');
  const emailInput = form.querySelector('#email');
  const submit = form.querySelector('[type="submit"]');
  let focusTimer;

  function updateSelection(scroll = false) {
    const selected = radios.find(input => input.checked);
    form.querySelectorAll('[data-choose-widget]').forEach(button => {
      const chosen = button.dataset.chooseWidget === selected?.value;
      button.setAttribute('aria-pressed', String(chosen));
      button.textContent = chosen ? 'Selected free widget' : 'Choose this free widget';
    });
    summary.textContent = selected
      ? `Selected: ${selected.dataset.widgetName} — ${selected.dataset.widgetPlatforms}`
      : 'No widget selected yet. Choose a theme above.';
    submit.textContent = selected
      ? `Email my free ${selected.dataset.widgetName} setup guide`
      : 'Email my free widget setup guide';
    if (!scroll || !selected) return;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    emailSection.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth', block: 'center' });
    clearTimeout(focusTimer);
    focusTimer = setTimeout(() => emailInput.focus({ preventScroll: true }), reducedMotion ? 0 : 450);
  }

  form.addEventListener('click', event => {
    const button = event.target.closest('[data-choose-widget]');
    if (!button) return;
    const radio = radios.find(input => input.value === button.dataset.chooseWidget);
    if (radio) {
      radio.checked = true;
      radio.dispatchEvent(new Event('change', { bubbles: true }));
    }
  });
  form.addEventListener('change', event => {
    if (event.target.name === 'widget_id') updateSelection(true);
  });
  window.addEventListener('pageshow', () => updateSelection());
  updateSelection();
})();
