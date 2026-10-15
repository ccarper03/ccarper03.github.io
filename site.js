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

  // ---------- Ask Charles: a tap-to-text menu (rules-based, no AI) ----------
  // Each option writes the text for the visitor. On a phone it opens Messages with it filled in.
  // On a computer, where texting from a page doesn't work, it shows the text to copy, plus the HubSpot chat.
  var PHONE = '+19843282788', PHONE_SHOW = '984-328-2788';
  var smsHref = function (body) { return 'sms:' + PHONE + '?&body=' + encodeURIComponent(body); };
  var fineMouse = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  var esc = function (t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // HubSpot chat loads only when someone asks for it (see hsConversationsSettings in each page).
  var openHubChat = function () {
    var hc = window.HubSpotConversations;
    if (!hc || !hc.widget) return false;
    var st = hc.widget.status ? hc.widget.status() : { loaded: true };
    if (st.loaded) hc.widget.open();
    else { hc.on('widgetLoaded', function () { hc.widget.open(); }); hc.widget.load(); }
    track('open_chat', { from: 'ask' });
    return true;
  };

  // Text-this-from-your-phone panel for computers. Shared with the tools (plan-tools.js).
  var textPanel = function (body) {
    var old = document.querySelector('.lead-overlay'); if (old) old.remove();
    var ov = document.createElement('div'); ov.className = 'lead-overlay';
    ov.innerHTML = '<div class="lead-modal" role="dialog" aria-modal="true" aria-labelledby="tp-h">' +
      '<button class="lead-close x-close ask-close" type="button" aria-label="Close">&times;</button>' +
      '<h2 id="tp-h" style="font-size:30px">Text this from your phone</h2>' +
      '<p>On a computer, texting doesn’t work from the page. Send this to <b>' + PHONE_SHOW + '</b>. Edit it however you like.</p>' +
      '<textarea class="tp-text" rows="' + Math.max(5, body.split('\n').length + 1) + '" style="width:100%;font:inherit;padding:12px;border:1.5px solid var(--rule);border-radius:6px">' + esc(body) + '</textarea>' +
      '<div class="actions" style="margin-top:16px"><button class="btn btn-amber" type="button" data-tp="copy">Copy the text</button>' +
      (window.HubSpotConversations ? '<button class="btn btn-ink" type="button" data-tp="chat">Message me here instead</button>' : '') +
      '</div><p class="small quiet" role="status" data-tp-note style="margin-top:10px"></p></div>';
    document.body.appendChild(ov);
    var close = function () { ov.remove(); document.removeEventListener('keydown', onKey); };
    var onKey = function (e) { if (e.key === 'Escape') close(); };
    document.addEventListener('keydown', onKey);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.querySelector('.x-close').addEventListener('click', close);
    ov.querySelector('[data-tp="copy"]').addEventListener('click', function () {
      var ta = ov.querySelector('.tp-text'), note = ov.querySelector('[data-tp-note]');
      var done = function () { note.textContent = 'Copied. Paste it into a text to ' + PHONE_SHOW + '.'; };
      if (navigator.clipboard) navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); document.execCommand('copy'); done(); });
      else { ta.select(); document.execCommand('copy'); done(); }
    });
    var chat = ov.querySelector('[data-tp="chat"]');
    if (chat) chat.addEventListener('click', function () { close(); openHubChat(); });
    ov.querySelector('[data-tp="copy"]').focus();
  };
  window.ccTextPanel = textPanel;

  // If someone is on a plan or floor plan result, send the link with their text.
  var resultLink = function () {
    var h = location.hash || '';
    if (/^\/moving-plan/.test(location.pathname) && h.indexOf('living=') > 0) return ' Here’s my plan: charlescarper.com/moving-plan' + h;
    if (/^\/floor-plans/.test(location.pathname) && h.indexOf('stories=') > 0) return ' Here are my floor plan picks: charlescarper.com/floor-plans' + h;
    return '';
  };

  var ASK = [
    { id: 'sell', label: 'I have a home to sell first', text: 'Hi Charles, I have a home to sell and I’m thinking about buying new.', ask: 'Can you help me figure out the timing?' },
    { id: 'rent', label: 'I’m renting and ready to own', text: 'Hi Charles, I’m renting and thinking about buying new.', ask: 'My lease ends around: ' },
    { id: 'see', label: 'I want to see homes', text: 'Hi Charles, I’d like to see homes at Collins Ridge.', ask: 'Good days and times for me: ' },
    { id: 'call', label: 'Set up a 15-minute call', text: 'Hi Charles, I’d like a 15-minute call.', ask: 'Good times for me: ' },
    { id: 'plan', label: 'I have a floor plan question', text: 'Hi Charles, I have a floor plan question.', ask: 'Which plan, and what I’d like to know: ' },
    { id: 'agent', label: 'I’m an agent with a buyer', text: 'Hi Charles, I’m an agent with a buyer who may fit Collins Ridge.', ask: 'My name and brokerage: ' }
  ];

  ['.ask-btn', '.ask-panel'].forEach(function (sel) { var el = document.querySelector(sel); if (el) el.remove(); });
  var askBtn = document.createElement('button');
  askBtn.className = 'ask-btn'; askBtn.type = 'button';
  askBtn.setAttribute('aria-expanded', 'false'); askBtn.setAttribute('aria-controls', 'ask-panel');
  askBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M4 5h16v11H9l-5 4z" stroke-linejoin="round"/></svg>Ask Charles';
  var panel = document.createElement('div');
  panel.className = 'ask-panel'; panel.id = 'ask-panel';
  panel.setAttribute('role', 'dialog'); panel.setAttribute('aria-labelledby', 'ask-h');
  panel.innerHTML = '<button class="ask-close" type="button" aria-label="Close">&times;</button>' +
    '<p class="bubble" id="ask-h"><b>Hi, it’s Charles.</b> Tap what fits and your text is written for you. Change anything you want, then send it.</p>' +
    '<div class="ask-opts">' + ASK.map(function (o) {
      return '<a class="ask-opt" data-ask="' + o.id + '" href="' + esc(smsHref(o.text + ' ' + o.ask)) + '">' + esc(o.label) + '</a>';
    }).join('') + '</div>' +
    '<p class="ask-tools"><a href="/moving-plan">Get my moving plan</a> · <a href="/floor-plans">Find my top two plans</a></p>' +
    '<p class="ask-fine">Opens a text to ' + PHONE_SHOW + '. I’m off Wednesdays and Thursdays and reply on my next work day.</p>';
  document.body.appendChild(askBtn); document.body.appendChild(panel);

  var setOpen = function (open) {
    panel.classList.toggle('open', open);
    askBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) { track('ask_open'); panel.querySelector('.ask-opt').focus(); } else { askBtn.focus(); }
  };
  askBtn.addEventListener('click', function () { setOpen(!panel.classList.contains('open')); });
  panel.querySelector('.ask-close').addEventListener('click', function () { setOpen(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && panel.classList.contains('open')) setOpen(false); });
  document.addEventListener('click', function (e) {
    if (panel.classList.contains('open') && !panel.contains(e.target) && !askBtn.contains(e.target)) setOpen(false);
  });
  panel.querySelectorAll('.ask-opt').forEach(function (a) {
    a.addEventListener('click', function (e) {
      var o = ASK.filter(function (x) { return x.id === a.getAttribute('data-ask'); })[0];
      var link = resultLink(), body = o.text + link + (link ? '\n' : ' ') + o.ask;
      track('ask_option', { option: o.id });
      if (fineMouse) { e.preventDefault(); setOpen(false); textPanel(body); }
      else { a.setAttribute('href', smsHref(body)); }
    });
  });
  document.querySelectorAll('[data-open-assistant]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); setOpen(true); });
  });

  // On a computer, any text link on the page shows the copy panel instead of doing nothing.
  if (fineMouse) {
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('main a[href^="sms:"]');
      if (!a || a.hasAttribute('data-open-assistant') || e.defaultPrevented) return;
      e.preventDefault();
      var m = (a.getAttribute('href') || '').match(/body=([^&]*)/);
      var body = a.getAttribute('data-sms-body') || (m ? decodeURIComponent(m[1]) : 'Hi Charles, ');
      track('click_text', { where: 'page', device: 'computer' });
      textPanel(body);
    });
  }

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
  // Email links assembled on click, so the address isn't in the page source
  document.querySelectorAll('[data-mail-u]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      track('click_email', { where: a.closest('main') ? 'page' : 'other' });
      window.location.href = 'mailto:' + a.getAttribute('data-mail-u') + '@' + a.getAttribute('data-mail-d');
    });
  });
})();
