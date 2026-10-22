// Book a visit: step 1 sends the short form to HubSpot so nobody gets lost if they skip the calendar.
// Step 2 opens the HubSpot calendar with their name and email filled in.
(function () {
  'use strict';
  var shell = document.querySelector('[data-visit]');
  if (!shell) return;
  var form = shell.querySelector('form[data-visit-form]');
  var s1 = shell.querySelector('[data-visit-step="1"]'), s2 = shell.querySelector('[data-visit-step="2"]');
  var qs = new URLSearchParams(location.search);
  var track = function (n, p) { if (window.ccTrack) window.ccTrack(n, p); };

  // Prefill from a home card (?home=) or a situation page (?situation=)
  if (qs.get('home')) form.home.value = qs.get('home');
  var SIT = { 'home-to-sell': 'I have a home to sell', 'renting': "I'm renting", 'moving-to-raleigh-durham': "I'm moving to Raleigh-Durham",
    'one-floor': 'I want to live on one floor', 'downstairs-suite': 'I need a bedroom and bath downstairs', 'work-from-home': 'I work from home',
    'va-loan': "I'm using my VA loan", 'low-maintenance': 'I want a low-maintenance home' };
  var sit = SIT[qs.get('situation')] || (qs.get('type') === 'video' ? "I'm moving to Raleigh-Durham" : '');
  if (sit) form.situation.value = sit;
  var video = qs.get('type') === 'video';
  if (video) {
    var h = s1.querySelector('h2'); if (h) h.textContent = 'Set up a video walkthrough.';
    var p = s1.querySelector('p.quiet'); if (p) p.textContent = 'We walk finished homes together on FaceTime or Zoom. Tell me a little first.';
  }
  if (qs.get('home') || qs.get('situation') || video) {
    var book = document.getElementById('book'); if (book) setTimeout(function () { book.scrollIntoView({ block: 'start' }); }, 50);
  }

  function openCalendar(first, last, email) {
    var frame = s2.querySelector('iframe');
    var u = frame.getAttribute('data-src') + '&' + new URLSearchParams({ firstName: first, lastName: last, email: email }).toString();
    frame.src = u;
    s1.hidden = true; s2.hidden = false;
    s2.querySelector('h2').setAttribute('tabindex', '-1'); s2.querySelector('h2').focus();
    track('visit_step2');
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var note = form.querySelector('.form-note'), btn = form.querySelector('button[type=submit]');
    var say = function (m) { note.hidden = false; note.textContent = m; };
    if (form.website.value) return;
    var name = form.name.value.trim(), email = form.email.value.trim(), phone = form.phone.value.trim();
    if (!name) { say('Please add your name.'); form.name.focus(); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { say('Please add a valid email, so the calendar can confirm your visit.'); form.email.focus(); return; }
    if (form.textok.checked && !phone) { say('Add your phone number, or uncheck the text box.'); form.phone.focus(); return; }
    var parts = name.split(/\s+/), first = parts.shift(), last = parts.join(' ');
    var msg = (video ? 'Video walkthrough request' : 'Visit request') +
      '\nWhere they are: ' + (form.situation.value || 'not given') +
      '\nWhen they want to move: ' + (form.timing.value || 'not given') +
      '\nHome from the list: ' + (form.home.value.trim() || 'none') +
      '\nText OK: ' + (form.textok.checked && phone ? 'yes' : 'no') + '\nNext: picking a time on the calendar';
    btn.disabled = true; btn.textContent = 'One moment…';
    var go = function () { btn.disabled = false; btn.textContent = 'Next: pick a time'; openCalendar(first, last, email); };
    window.ccSubmit({ email: email, first: first, last: last, phone: phone }, msg)
      .then(function () { track('generate_lead', { form: 'visit' }); go(); })
      .catch(go); // the calendar still works if the form send fails
  });

  // HubSpot's calendar tells the page when a meeting is booked.
  window.addEventListener('message', function (e) {
    if (!/hubspot\.com$/.test((e.origin || '').replace(/^https?:\/\//, '').split(':')[0])) return;
    var d = e.data || {};
    if (d.meetingBookSucceeded || (typeof d === 'object' && d.type === 'MEETING_BOOKED')) {
      track('book_visit', { type: video ? 'video' : 'visit' });
      var p = s2.querySelector('p.quiet'); if (p) p.textContent = 'You\'re booked. You\'ll get a confirmation email. I\'ll have the homes ready.';
    }
  });

  // The 15-minute call calendar loads only when asked for.
  var callBtn = document.querySelector('[data-call-open]'), callSlot = document.querySelector('[data-call-slot]');
  function openCall() {
    var f = callSlot.querySelector('iframe'); if (!f.src) f.src = f.getAttribute('data-src');
    callSlot.hidden = false; callBtn.setAttribute('aria-expanded', 'true'); track('call_calendar_open');
  }
  if (callBtn) callBtn.addEventListener('click', openCall);
  if (location.hash === '#call' && callBtn) openCall();
})();
