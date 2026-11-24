(() => {
  const options = [...document.querySelectorAll('.background-option')];
  if (!options.length) return;

  const apply = (theme) => {
    const selected = options.some((button) => button.dataset.background === theme) ? theme : 'forest';
    document.body.dataset.background = selected;
    for (const button of options) {
      const active = button.dataset.background === selected;
      button.classList.toggle('selected', active);
      button.setAttribute('aria-pressed', String(active));
    }
  };

  try { apply(sessionStorage.getItem('gabes-chess-background') || 'forest'); }
  catch { apply('forest'); }

  for (const button of options) {
    button.addEventListener('click', () => {
      apply(button.dataset.background);
      try { sessionStorage.setItem('gabes-chess-background', button.dataset.background); }
      catch { /* A escolha continua ativa até a página ser fechada. */ }
    });
  }
})();
