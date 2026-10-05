// charlescarper.com — shared behavior: mobile menu and the assistant placeholder.
(function () {
  document.documentElement.classList.add('js');

  // Mobile menu
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('nav-open')) {
        nav.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
        toggle.focus();
      }
    });
  }

  // Assistant launcher. Phase 1 placeholder: no chat yet, just the two ways to reach Charles.
  // Phase 3 replaces the panel body with the real assistant.
  var askBtn = document.querySelector('.ask-btn');
  var panel = document.getElementById('ask-panel');
  if (askBtn && panel) {
    var closeBtn = panel.querySelector('.ask-close');
    var setOpen = function (open) {
      panel.classList.toggle('open', open);
      askBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { panel.querySelector('a, button').focus(); } else { askBtn.focus(); }
    };
    askBtn.addEventListener('click', function () { setOpen(!panel.classList.contains('open')); });
    if (closeBtn) closeBtn.addEventListener('click', function () { setOpen(false); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && panel.classList.contains('open')) setOpen(false);
    });
    document.querySelectorAll('[data-open-assistant]').forEach(function (el) {
      el.addEventListener('click', function (e) { e.preventDefault(); setOpen(true); });
    });
  }

  // Placeholder forms: nothing is sent until a backend is connected.
  document.querySelectorAll('form[data-placeholder]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.form-note');
      if (note) { note.hidden = false; note.focus && note.setAttribute('tabindex', '-1'); note.focus(); }
    });
  });
})();
