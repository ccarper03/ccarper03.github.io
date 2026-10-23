// charlescarper.com: shared behavior. Sticky header, mobile menu, Ask Charles text links, agent registration,
// and conversion events for Google Analytics and Microsoft Clarity.
(function () {
  document.documentElement.classList.add('js');

  // ---------- Analytics: one tracker for Google Analytics and Microsoft Clarity ----------
  // Every event goes to GA4 with its details, and to Clarity as a custom event, so recordings can be
  // filtered by what someone did. Lead actions also tag the Clarity session and keep its recording.
  // Event names and page context only. Never what someone typed. Safe no-op if either is blocked.
  var LEADS = { generate_lead: 1, book_visit: 1, chat_started: 1, click_call: 1, click_text: 1, click_email: 1 };
  var pageType = (function (p) {
    if (p === '/' || p === '/index.html') return 'home';
    var m = p.match(/^\/([a-z0-9-]+)/), k = m ? m[1] : '';
    return { guides: 'guide', plan: 'tool', buyers: 'situation', 'move-in-ready': 'homes', visit: 'visit', 'collins-ridge': 'community',
      agents: 'agents', about: 'about', privacy: 'legal', disclosures: 'legal' }[k] || 'other';
  })(location.pathname);
  var clarity = function () { try { if (typeof window.clarity === 'function') window.clarity.apply(window, arguments); } catch (e) {} };
  clarity('set', 'page_type', pageType);
  var lastHit = {};
  var track = function (name, params) {
    params = params || {};
    var key = name + '|' + JSON.stringify(params), now = Date.now();
    if (lastHit[key] && now - lastHit[key] < 800) return; // one tap, one event
    lastHit[key] = now;
    try { if (window.gtag) window.gtag('event', name, params); } catch (e) {}
    clarity('event', name);
    if (LEADS[name]) { clarity('set', 'lead_action', name); clarity('upgrade', name); }
  };
  window.ccTrack = track;

  // Where a link sits, the words on it, and the section it's in, so the same button in different spots can be compared.
  var whereOf = function (a) {
    return a.closest('[data-mbar]') ? 'phone_bar' : a.closest('.ask-panel') ? 'ask_panel' : a.closest('.lead-overlay') ? 'text_panel' :
      a.closest('main') ? 'page' : a.closest('.site-header, header') ? 'header' : a.closest('.site-footer, footer') ? 'footer' : 'other';
  };
  // The words the visitor actually saw (the bold line on cards, the visible half of the header button)
  var labelOf = function (a) { var s = a.querySelector('b, .path-go') || a; return ((s.innerText || s.textContent || '') + '').replace(/\s+/g, ' ').trim().slice(0, 60); };
  var sectionOf = function (a) {
    var s = a.closest('main section, main article, main aside'); if (!s) return '';
    if (s.id) return s.id;
    var c = (s.className || '').split(/\s+/).filter(function (x) { return x && x !== 'section' && !/^bg-|^tight$/.test(x); })[0];
    if (c) return c;
    var h = s.querySelector('h1, h2, h3');
    return h ? (h.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 50) : '';
  };
  // The home named on a "Book a visit to see this home" link (page content, not anything typed)
  var homeOf = function (href) { var m = href.match(/[?&]home=([^&#]*)/); try { return m ? decodeURIComponent(m[1].replace(/\+/g, ' ')).slice(0, 90) : ''; } catch (e) { return ''; } };

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

  // A chat that actually starts is a lead. HubSpot calls this once its chat API is ready.
  var onChatReady = function () {
    var hc = window.HubSpotConversations;
    if (!hc || !hc.on || hc.ccBound) return;
    hc.ccBound = true;
    hc.on('conversationStarted', function () { track('chat_started', { page_type: pageType }); });
  };
  if (window.HubSpotConversations) onChatReady();
  else (window.hsConversationsOnReady = window.hsConversationsOnReady || []).push(onChatReady);

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
      '<textarea class="tp-text" data-clarity-mask="True" rows="' + Math.max(5, body.split('\n').length + 1) + '" style="width:100%;font:inherit;padding:12px;border:1.5px solid var(--rule);border-radius:6px">' + esc(body) + '</textarea>' +
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
      track('text_copy', { page_type: pageType });
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
    if (/^\/plan\/sell-and-buy/.test(location.pathname) && h.indexOf('living=') > 0) return ' Here’s my plan: charlescarper.com/plan/sell-and-buy/' + h;
    if (/^\/plan\/floor-plan-match/.test(location.pathname) && h.indexOf('stories=') > 0) return ' Here are my floor plan picks: charlescarper.com/plan/floor-plan-match/' + h;
    return '';
  };

  var ASK = [
    { id: 'sell', label: 'I have a home to sell first', text: 'Hi Charles, I have a home to sell and I’m thinking about buying new.', ask: 'Can you help me figure out the timing?' },
    { id: 'rent', label: 'I’m renting and ready to own', text: 'Hi Charles, I’m renting and thinking about buying new.', ask: 'My lease ends around: ' },
    { id: 'see', label: 'I want to see homes', text: 'Hi Charles, I’d like to see some homes.', ask: 'Good days and times for me: ' },
    { id: 'list', label: 'Send me the move-in ready list', text: 'Hi Charles, can you send me your move-in ready list?', ask: 'What I’m looking for: ' },
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
    '<p class="ask-tools"><a href="/plan/sell-and-buy/">Get my sell &amp; buy plan</a> · <a href="/move-in-ready/">See move-in ready homes</a></p>' +
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
      e.ccTracked = true; // counted here, so the conversion listener below skips it
      track('click_text', { where: whereOf(a), label: labelOf(a), device: 'computer' });
      textPanel(body);
    });
  }

  // Agent registration: sends to HubSpot (same portal and form as the site's other forms).
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

  // One cta_click for every button-style link, so CTAs can be compared by their wording, spot and section.
  // Capture phase, so it still counts when a text link's own handler stops the click on a computer.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || !a.matches('.btn, .next-path, .tile, .tool-tile, .arrow, .ask-opt, .toc-cta a')) return;
    var href = a.getAttribute('href') || '';
    var to = /^(tel|sms|mailto):/.test(href) ? href.split(':')[0] : href.split('?')[0].slice(0, 100);
    track('cta_click', { cta_text: labelOf(a), cta_to: to, where: whereOf(a), section: sectionOf(a), page_type: pageType });
  }, true);

  // Conversion events: calls, texts, email, booking, tools, situations and directions.
  // Skips clicks another handler already counted (e.ccTracked), and text links a computer turned into
  // the copy panel (defaultPrevented), so one tap is one event.
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.ccTracked) return;
    var href = a.getAttribute('href') || '', where = whereOf(a), label = labelOf(a);
    if (href.indexOf('tel:') === 0) track('click_call', { where: where, page_type: pageType });
    else if (href.indexOf('sms:') === 0) { if (!e.defaultPrevented) track('click_text', { where: where, label: label, page_type: pageType }); }
    else if (href.indexOf('mailto:') === 0) track('click_email', { where: where, page_type: pageType });
    else if (/^\/visit\//.test(href)) {
      var p = { where: where, label: label, page_type: pageType }, home = homeOf(href);
      if (home) p.home = home;
      track('click_book', p);
    }
    else if (/^\/plan\//.test(href)) track('click_tool', { where: where, label: label, page_type: pageType });
    else if (/^\/buyers\//.test(href)) track('click_situation', { where: where, label: label, page_type: pageType });
    else if (/^https?:\/\/(www\.)?(google\.[a-z.]+\/maps|maps\.google\.|maps\.app\.goo\.gl|maps\.apple\.com)/.test(href)) track('click_directions', { where: where, page_type: pageType });
  });

  // First touch on a lead form, so drop-off between starting a form and sending it shows up.
  var formName = function (f) {
    return f.getAttribute('data-form') || (f.hasAttribute('data-visit-form') && 'visit') || (f.hasAttribute('data-signup') && 'monday_list') ||
      (f.hasAttribute('data-realtor-register') && 'realtor_registration') || (f.hasAttribute('data-other') && 'other_community') || '';
  };
  var formsStarted = {};
  document.addEventListener('focusin', function (e) {
    var f = e.target.closest && e.target.closest('form'); if (!f) return;
    var n = formName(f); if (!n || formsStarted[n]) return;
    formsStarted[n] = 1;
    track('form_start', { form: n, page_type: pageType });
  });

  // Email links assembled on click, so the address isn't in the page source
  document.querySelectorAll('[data-mail-u]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault(); e.ccTracked = true;
      track('click_email', { where: whereOf(a), page_type: pageType });
      window.location.href = 'mailto:' + a.getAttribute('data-mail-u') + '@' + a.getAttribute('data-mail-d');
    });
  });

  // ---------- Phone bar: step aside when the page already shows the main action ----------
  // Hides while a brass button, a form or the footer is on screen, and while someone is typing,
  // so a phone screen never shows two "Book a visit" buttons or covers a form.
  var bar = document.querySelector('[data-mbar]');
  if (bar && 'IntersectionObserver' in window) {
    var seen = new Set(), typing = false;
    var sync = function () {
      var hide = typing || seen.size > 0;
      bar.classList.toggle('is-hidden', hide);
      if (hide) bar.setAttribute('inert', ''); else bar.removeAttribute('inert');
    };
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) seen.add(e.target); else seen.delete(e.target); });
      sync();
    }, { rootMargin: '0px' });
    document.querySelectorAll('main .btn-brass, main form, .site-footer').forEach(function (el) { io.observe(el); });
    document.addEventListener('focusin', function (e) { if (e.target.matches && e.target.matches('input, select, textarea')) { typing = true; sync(); } });
    document.addEventListener('focusout', function () { typing = false; sync(); });
  }
})();
