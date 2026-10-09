// charlescarper.com — shared behavior: sticky header, mobile menu, chat links, realtor registration,
// and conversion events for Google Analytics.
(function () {
  document.documentElement.classList.add('js');

  // GA4 events. Safe no-op if analytics is blocked.
  var track = function (name, params) { try { if (window.gtag) window.gtag('event', name, params || {}); } catch (e) {} };

  // Sticky header: add a shadow once the page scrolls under it.
  var header = document.querySelector('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-stuck', window.scrollY > header.offsetTop + 4); };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // Mobile menu
  var nav = document.querySelector('.nav');
  var toggle = document.querySelector('.nav-toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('nav-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
    nav.querySelectorAll('.nav-list a').forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('nav-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.textContent = 'Menu';
      });
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

  // "Ask a question" links open the HubSpot chat when it's on the page (the link texts Charles otherwise).
  document.querySelectorAll('[data-open-assistant]').forEach(function (el) {
    el.addEventListener('click', function (e) {
      if (panel) return;
      if (window.HubSpotConversations && window.HubSpotConversations.widget) { e.preventDefault(); window.HubSpotConversations.widget.open(); }
    });
  });

  // Realtor registration: sends to HubSpot (same portal and form as the floor plan finder).
  var reg = document.querySelector('form[data-realtor-register]');
  if (reg) {
    reg.addEventListener('submit', function (e) {
      e.preventDefault();
      var fd = new FormData(reg), v = function (k) { return (fd.get(k) || '').toString().trim(); };
      var note = reg.querySelector('.form-note'), btn = reg.querySelector('button[type=submit]');
      var say = function (msg, ok) { note.hidden = false; note.textContent = msg; note.setAttribute('tabindex', '-1'); note.focus(); if (ok) note.classList.add('ok'); };
      if (v('website')) { say('Got it. I will be in touch.', true); return; } // honeypot
      var name = v('agent'), email = v('agent_email'), buyer = v('buyer');
      if (!name) { say('Please add your name.'); return; }
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { say('Please add a valid email so I can confirm the registration.'); return; }
      if (!buyer) { say("Please add your buyer's name so the registration is tied to them."); return; }
      var parts = name.split(/\s+/), first = parts.shift(), last = parts.join(' ');
      var msg = 'Realtor client registration\nBuyer: ' + buyer + '\nBrokerage: ' + (v('brokerage') || 'not given') +
        '\nTiming: ' + (v('timing') || 'not given') + '\nLooking for: ' + (v('notes') || 'not given') + '\nPreferred visit day: ' + (v('visit_day') || 'not given') + '\nText messages OK: ' + (v('textok') === 'yes' ? 'yes' : 'no');
      var fields = [{ name: 'email', value: email }, { name: 'firstname', value: first }, { name: 'cc_lead_type', value: 'realtor' },
        { name: 'cc_wants_contact', value: 'true' }, { name: 'message', value: msg }];
      if (last) fields.push({ name: 'lastname', value: last });
      if (v('agent_phone')) fields.push({ name: 'phone', value: v('agent_phone') });
      if (v('brokerage')) fields.push({ name: 'company', value: v('brokerage') });
      btn.disabled = true; var label = btn.textContent; btn.textContent = 'Sending…';
      fetch('https://api.hsforms.com/submissions/v3/integration/submit/247617862/0b4dc486-9d8e-4e91-a9a2-37f231108f90', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fields, context: { pageUri: location.origin + location.pathname, pageName: document.title } })
      }).then(function (r) {
        btn.disabled = false; btn.textContent = label;
        if (!r.ok) throw new Error('send');
        track('generate_lead', { form: 'realtor_registration' });
        reg.reset();
        say('Got it, ' + first + '. ' + buyer + ' is registered with me. I\'ll text or email you to confirm. Bring your buyer whenever you\'re ready.', true);
      }).catch(function () {
        btn.disabled = false; btn.textContent = label;
        say('That did not go through. Text 984-328-2788 with your name and your buyer\'s name, and I\'ll register them by hand.');
      });
    });
  }

  // Conversion events: calls, texts, email, booking and finder clicks.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var href = a.getAttribute('href') || '', where = a.closest('main') ? 'page' : a.closest('header') ? 'header' : a.closest('footer') ? 'footer' : 'other';
    var label = (a.textContent || '').trim().slice(0, 60);
    if (href.indexOf('tel:') === 0) track('click_call', { where: where });
    else if (href.indexOf('sms:') === 0) track('click_text', { where: where });
    else if (href.indexOf('mailto:') === 0) track('click_email', { where: where });
    else if (/^\/book\b/.test(href)) track('click_book', { where: where, label: label });
    else if (/^\/match\b/.test(href)) track('click_finder', { where: where, label: label });
    else if (/^\/collins-ridge-plans\//.test(href)) track('click_plans', { where: where, label: label });
  });
})();
