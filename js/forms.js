// charlescarper.com: lead capture shared by every page.
// - ccSubmit: sends a contact to HubSpot (same portal and form the site already uses).
// - The Monday move-in ready list sign-up (form[data-signup]).
// - ccGate: the "Want the full plan? I'll send it to you." unlock used by every tool.
// Answers are only sent when someone asks for their plan. Analytics get event names, never answers.
(function (root) {
  'use strict';
  var HS_URL = 'https://api.hsforms.com/submissions/v3/integration/submit/247617862/0b4dc486-9d8e-4e91-a9a2-37f231108f90';
  var PHONE_SHOW = '984-328-2788';
  var EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

  function track(name, params) { try { if (root.gtag) root.gtag('event', name, params || {}); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function store(k, v) { try { if (v === undefined) return root.sessionStorage.getItem(k); root.sessionStorage.setItem(k, v); } catch (e) { return null; } }

  // contact: { email, first, last, phone }, message: plain text for Charles
  function ccSubmit(contact, message) {
    var fields = [{ name: 'email', value: contact.email }, { name: 'message', value: message }];
    if (contact.first) fields.push({ name: 'firstname', value: contact.first });
    if (contact.last) fields.push({ name: 'lastname', value: contact.last });
    if (contact.phone) fields.push({ name: 'phone', value: contact.phone });
    return fetch(HS_URL, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: fields, context: { pageUri: location.origin + location.pathname, pageName: document.title } })
    }).then(function (r) { if (!r.ok) throw new Error('send'); return r; });
  }

  function say(note, msg, ok) {
    note.hidden = false; note.textContent = msg; note.classList.toggle('ok', !!ok);
    note.setAttribute('tabindex', '-1'); note.focus({ preventScroll: false });
  }

  // ---------- Monday list ----------
  document.querySelectorAll('form[data-signup]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = f.querySelector('.form-note'), btn = f.querySelector('button[type=submit]');
      if (f.website && f.website.value) { say(note, 'Got it. Thank you.', true); return; }
      var email = (f.email.value || '').trim(), first = (f.first.value || '').trim();
      if (!EMAIL_RE.test(email)) { say(note, 'Please enter a valid email address.'); f.email.focus(); return; }
      btn.disabled = true;
      ccSubmit({ email: email, first: first },
        'Monday move-in ready list: please add me.\nSigned up on: ' + (f.getAttribute('data-where') || location.pathname))
        .then(function () {
          track('generate_lead', { form: 'monday_list' }); track('unlock', { tool: 'monday_list' });
          f.querySelectorAll('.field, button').forEach(function (x) { x.remove(); });
          say(note, 'You\'re on the list' + (first ? ', ' + first : '') + '. The first one comes Monday.', true);
        })
        .catch(function () { btn.disabled = false; say(note, 'That didn\'t go through. Text me at ' + PHONE_SHOW + ' and I\'ll add you.'); });
    });
  });

  // ---------- The tool unlock ----------
  // opts: { tool, label, summary: fn -> text, onUnlock: fn }
  function ccGate(host, opts) {
    var key = 'cc.unlock.' + opts.tool;
    if (store(key) === '1') { opts.onUnlock({ again: true }); return; }
    var f = document.createElement('form'); f.noValidate = true;
    f.innerHTML = '<div class="form-grid">' +
      '<label class="field">First name<input type="text" name="first" autocomplete="given-name"></label>' +
      '<label class="field">Email<input type="email" name="email" autocomplete="email" required></label>' +
      '<label class="field full">Mobile number <span class="hint">Optional, if you\'d like a text</span><input type="tel" name="phone" autocomplete="tel"></label></div>' +
      '<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<label class="check"><input type="checkbox" name="textok" value="yes"><span>Yes, you can text me. Message and data rates may apply. Reply STOP to stop.</span></label>' +
      '<div class="actions" style="margin-top:16px"><button class="btn btn-brass" type="submit">' + esc(opts.label || 'Send me my plan') + '</button></div>' +
      '<p class="form-fine">I\'ll text or email you. No spam, and you can stop anytime.</p>' +
      '<p class="form-note" role="status" hidden></p>';
    host.innerHTML = ''; host.appendChild(f);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = f.querySelector('.form-note'), btn = f.querySelector('button[type=submit]');
      if (f.website.value) { say(note, 'Got it.', true); return; }
      var email = f.email.value.trim(), first = f.first.value.trim(), phone = f.phone.value.trim(), textok = f.textok.checked;
      if (!EMAIL_RE.test(email)) { say(note, 'Please enter a valid email address, so I can send your plan.'); f.email.focus(); return; }
      if (textok && !phone) { say(note, 'Add your mobile number, or uncheck the text box.'); f.phone.focus(); return; }
      btn.disabled = true; btn.textContent = 'Sending…';
      var msg = (opts.summary ? opts.summary() : '') + '\nText OK: ' + (textok && phone ? 'yes' : 'no') + '\nPage: ' + location.href;
      ccSubmit({ email: email, first: first, phone: phone }, msg)
        .then(function () {
          store(key, '1');
          track('generate_lead', { form: opts.tool }); track('unlock', { tool: opts.tool });
          opts.onUnlock({ first: first });
        })
        .catch(function () { btn.disabled = false; btn.textContent = opts.label || 'Send me my plan'; say(note, 'That didn\'t go through. Text me at ' + PHONE_SHOW + ' and I\'ll send it.'); });
    });
  }

  root.ccSubmit = ccSubmit;
  root.ccGate = ccGate;
  root.ccTrack = track;
})(window);
