// Floor plan matcher — Phase 1 shell.
// Asks eight questions, one per screen, then shows a free answer on screen.
// Plan data: Collins Ridge reference sheet (June 2026). Other division communities get added later.
// Answers leave the browser only if the visitor sends the report form; it posts to HubSpot.
(function () {
  var root = document.getElementById('matcher');
  if (!root) return;

  var PLANS = [
    { name: 'Cali', kind: 'Single-family', beds: 4, baths: 2, stories: 1, sqft: '1,764', mainBed: true, note: 'The only one-story plan' },
    { name: 'Galen', kind: 'Single-family', beds: 3, bedsMax: 4, baths: 2.5, stories: 2, sqft: '2,340', flex: true, loft: true, note: 'A flex room and a loft, and the loft can become a 4th bedroom' },
    { name: 'Sierra', kind: 'Single-family', beds: 4, baths: 2.5, stories: 2, sqft: '2,395', loft: true, mainBed: true, note: 'Primary suite on the main floor, plus an upstairs living area' },
    { name: 'Robie', kind: 'Single-family', beds: 5, baths: 3, stories: 2, sqft: '2,368', loft: true, note: 'Five bedrooms and a large loft' },
    { name: 'Hayden', kind: 'Single-family', beds: 5, baths: 3, stories: 2, sqft: '2,511', flex: true, mainBed: true, note: 'A bedroom on the main floor, plus a flex room' },
    { name: 'Alec', kind: 'Single-family', beds: 4, baths: 3, stories: 2, sqft: '2,518', mainBed: true, note: 'A bedroom on the main floor and a covered patio' },
    { name: 'Landon', kind: 'Single-family', beds: 4, baths: 3, stories: 2, sqft: '2,570', loft: true, note: 'An upstairs living area and a large primary suite' },
    { name: 'Jackson', kind: 'Single-family', beds: 5, baths: 3, stories: 2, sqft: '2,637', note: "A butler's pantry and a covered patio" },
    { name: 'Calhoun', kind: 'Single-family', beds: 4, baths: 3.5, stories: 2, sqft: '2,628', mainBed: true, note: 'A bedroom on the main floor and a breakfast nook' },
    { name: 'Hanover', kind: 'Single-family', beds: 4, bedsMax: 5, baths: 2.5, stories: 2, sqft: '2,804 to 2,818', flex: true, note: 'The largest single-family plan, with a flex room' },
    { name: 'Savannah', kind: 'Townhome', beds: 4, baths: 2.5, stories: 2, sqft: '2,240', loft: true, mainBed: true, note: 'Primary suite on the main floor and a large loft' },
    { name: 'Linville', kind: 'Townhome', beds: 4, baths: 3, stories: 2, sqft: '2,439', note: 'A large primary suite upstairs' }
  ];

  var STEPS = [
    { id: 'now', type: 'single', title: 'Where are you living now?',
      why: 'This decides your timeline more than anything else.',
      options: [['rent', "I'm renting"], ['own', "I own a home I'd need to sell"], ['family', "I'm living with family or friends"], ['moving', "I'm moving to the area"]] },
    { id: 'reasons', type: 'multi', title: "What's got you thinking about a move?",
      why: 'Pick as many as you like. This is the part I care about most.',
      options: [['room', 'More room'], ['rent', 'Stop paying rent'], ['commute', 'A shorter commute'], ['yard', 'A yard'], ['newer', 'Something newer'], ['other', 'Something else']] },
    { id: 'where', type: 'where', title: 'Where do you need to be?',
      why: 'A work address, a town, or just an area. It tells me which communities make sense for your commute.' },
    { id: 'pay', type: 'range', title: 'What monthly payment feels comfortable?',
      why: "This isn't a quote, and there's no rate in it. It just helps me point you at the right price range." },
    { id: 'rooms', type: 'rooms', title: 'How many bedrooms and bathrooms?',
      why: "Your best guess is fine. We'll sort out what the rooms are for next." },
    { id: 'uses', type: 'multi', title: 'What would the extra rooms be for?',
      why: 'Sometimes a plan already has the room you need, just with a different name.',
      options: [['bed', 'Bedrooms for people living with me'], ['office', 'A home office'], ['guest', 'A guest room'], ['hobby', 'A hobby room or gym'], ['unsure', 'Not sure yet']] },
    { id: 'when', type: 'single', title: 'When would you want to move?',
      why: 'If it\'s soon, move-in ready homes are the place to start.',
      options: [['soon', 'In the next 3 months'], ['mid', 'In 3 to 6 months'], ['later', 'In 6 to 12 months'], ['looking', "I'm just looking"]] },
    { id: 'no', type: 'text', title: 'What would make this a no for you?',
      why: "Optional. I read this one first, because it's usually the thing that matters." }
  ];

  var answers = { reasons: [], uses: [], pay: 2400, baths: '', beds: '', stairs: 'fine', commute: '30', where: '', other: '', no: '', followup: '' };
  var i = 0;
  var firstRender = true;
  var lastPlans = [];

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === 'text') n.textContent = attrs[k];
      else if (k === 'html') n.innerHTML = attrs[k];
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }

  function choice(type, name, value, label, checked) {
    var input = el('input', { type: type, name: name, value: value });
    if (checked) input.checked = true;
    return el('label', { 'class': 'choice' }, [input, el('span', { text: label })]);
  }

  function needsFollowup() {
    var beds = parseInt(answers.beds, 10);
    return beds >= 4 && answers.uses.indexOf('office') !== -1;
  }

  function money(n) { return '$' + Number(n).toLocaleString('en-US'); }

  function render() {
    var s = STEPS[i];
    root.innerHTML = '';
    var pct = Math.round((i / STEPS.length) * 100);
    var bar = el('div', { 'class': 'm-bar' }, [el('span', { style: 'width:' + pct + '%' })]);
    root.appendChild(el('div', { 'class': 'm-progress', 'aria-live': 'polite' }, [el('span', { text: 'Question ' + (i + 1) + ' of ' + STEPS.length }), bar]));

    var fs = el('fieldset');
    var legend = el('legend', { text: s.title, tabindex: '-1' });
    fs.appendChild(legend);
    fs.appendChild(el('p', { 'class': 'm-why', text: s.why }));

    if (s.type === 'single' || s.type === 'multi') {
      var box = el('div', { 'class': 'choices' });
      s.options.forEach(function (o) {
        var checked = s.type === 'single' ? answers[s.id] === o[0] : answers[s.id].indexOf(o[0]) !== -1;
        box.appendChild(choice(s.type === 'single' ? 'radio' : 'checkbox', s.id, o[0], o[1], checked));
      });
      fs.appendChild(box);
      if (s.id === 'reasons') {
        var other = el('label', { 'class': 'field', style: 'margin-top:14px' }, [
          el('span', { 'class': 'hint', text: 'Something else? Say it in your own words.' }),
          el('input', { type: 'text', name: 'other', maxlength: '140', autocomplete: 'off' })
        ]);
        other.querySelector('input').value = answers.other;
        fs.appendChild(other);
      }
      if (s.id === 'uses' && needsFollowup()) fs.appendChild(followup());
    }

    if (s.type === 'where') {
      var w = el('label', { 'class': 'field' }, [el('span', { text: 'Work address, town or area' }), el('input', { type: 'text', name: 'where', autocomplete: 'off', placeholder: 'For example: RTP, or downtown Durham' })]);
      w.querySelector('input').value = answers.where;
      fs.appendChild(w);
      fs.appendChild(el('p', { 'class': 'm-sub', text: "What's the longest commute you'd put up with?" }));
      var c = el('div', { 'class': 'chips' });
      [['15', '15 min'], ['30', '30 min'], ['45', '45 min'], ['60', 'An hour']].forEach(function (o) { c.appendChild(choice('radio', 'commute', o[0], o[1], answers.commute === o[0])); });
      fs.appendChild(c);
    }

    if (s.type === 'range') {
      var out = el('output', { id: 'pay-out', text: money(answers.pay) + ' a month' });
      var r = el('input', { type: 'range', name: 'pay', min: '1500', max: '4500', step: '100', 'aria-describedby': 'pay-out' });
      r.value = answers.pay;
      r.addEventListener('input', function () { out.textContent = money(r.value) + (r.value >= 4500 ? '+ a month' : ' a month'); });
      fs.appendChild(el('div', { 'class': 'm-range' }, [out, r, el('div', { 'class': 'ends' }, [el('span', { text: '$1,500' }), el('span', { text: '$4,500+' })])]));
    }

    if (s.type === 'rooms') {
      fs.appendChild(el('p', { 'class': 'm-sub', text: 'Bedrooms' }));
      var b = el('div', { 'class': 'chips' });
      ['2', '3', '4', '5'].forEach(function (v) { b.appendChild(choice('radio', 'beds', v, v === '5' ? '5 or more' : v, answers.beds === v)); });
      fs.appendChild(b);
      fs.appendChild(el('p', { 'class': 'm-sub', text: 'Bathrooms' }));
      var ba = el('div', { 'class': 'chips' });
      ['2', '2.5', '3', '3.5'].forEach(function (v) { ba.appendChild(choice('radio', 'baths', v, v === '3.5' ? '3.5 or more' : v, answers.baths === v)); });
      fs.appendChild(ba);
      fs.appendChild(el('p', { 'class': 'm-sub', text: 'Stairs' }));
      var st = el('div', { 'class': 'chips' });
      [['fine', 'Stairs are fine'], ['main', "I'd like a bedroom on the main floor"], ['one', 'One story only']].forEach(function (o) { st.appendChild(choice('radio', 'stairs', o[0], o[1], answers.stairs === o[0])); });
      fs.appendChild(st);
    }

    if (s.type === 'text') {
      var t = el('label', { 'class': 'field' }, [el('span', { 'class': 'hint', text: 'A budget line, a commute, an HOA rule, a bad experience with a builder. Anything.' }), el('textarea', { name: 'no', maxlength: '600' })]);
      t.querySelector('textarea').value = answers.no;
      fs.appendChild(t);
    }

    var err = el('p', { 'class': 'm-error', role: 'alert' });
    fs.appendChild(err);
    var form = el('form', { 'class': 'm-step', novalidate: '' }, [fs]);

    var back = el('button', { type: 'button', 'class': 'btn btn-ink', text: 'Back' });
    if (i === 0) back.style.visibility = 'hidden';
    back.addEventListener('click', function () { save(form); i--; render(); });
    var next = el('button', { type: 'submit', 'class': 'btn btn-amber', text: i === STEPS.length - 1 ? 'Show my answer' : 'Next' });
    form.appendChild(el('div', { 'class': 'm-nav' }, [back, next]));

    form.addEventListener('change', function (e) {
      if (s.id === 'uses') {
        save(form);
        var existing = form.querySelector('.m-followup');
        if (needsFollowup() && !existing) fs.insertBefore(followup(), err);
        if (!needsFollowup() && existing) existing.remove();
      }
    });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      save(form);
      var problem = check(s);
      if (problem) { err.textContent = problem; return; }
      if (i < STEPS.length - 1) { i++; render(); } else { results(); }
    });

    root.appendChild(form);
    if (!firstRender) {
      legend.focus({ preventScroll: true });
      root.scrollIntoView({ block: 'start', behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }
    firstRender = false;
  }

  function followup() {
    var bedsLess = parseInt(answers.beds, 10) - 1;
    var wrap = el('div', { 'class': 'm-followup' }, [
      el('p', { 'class': 'm-sub', text: 'A quick follow-up' }),
      el('p', { text: 'You picked ' + answers.beds + ' bedrooms, and one of them is an office. A few of these plans already have a flex room or a loft. Would ' + bedsLess + ' bedrooms plus a flex room work for you?' })
    ]);
    var c = el('div', { 'class': 'chips' });
    [['yes', 'Yes, that works'], ['no', 'No, I need ' + answers.beds + ' real bedrooms'], ['both', 'Show me both']].forEach(function (o) { c.appendChild(choice('radio', 'followup', o[0], o[1], answers.followup === o[0])); });
    wrap.appendChild(c);
    return wrap;
  }

  function save(form) {
    var s = STEPS[i];
    var fd = new FormData(form);
    if (s.type === 'multi') answers[s.id] = fd.getAll(s.id);
    if (s.type === 'single') answers[s.id] = fd.get(s.id) || '';
    if (s.id === 'reasons') answers.other = (fd.get('other') || '').trim();
    if (s.id === 'uses') answers.followup = fd.get('followup') || answers.followup;
    if (s.type === 'where') { answers.where = (fd.get('where') || '').trim(); answers.commute = fd.get('commute') || answers.commute; }
    if (s.type === 'range') answers.pay = fd.get('pay') || answers.pay;
    if (s.type === 'rooms') { answers.beds = fd.get('beds') || ''; answers.baths = fd.get('baths') || ''; answers.stairs = fd.get('stairs') || 'fine'; }
    if (s.type === 'text') answers.no = (fd.get('no') || '').trim();
  }

  function check(s) {
    if (s.type === 'single' && !answers[s.id]) return 'Pick the one that fits best.';
    if (s.id === 'reasons' && !answers.reasons.length && !answers.other) return 'Pick at least one, or say it in your own words.';
    if (s.type === 'rooms' && (!answers.beds || !answers.baths)) return 'Pick a number of bedrooms and bathrooms. A guess is fine.';
    if (s.id === 'uses' && needsFollowup() && !answers.followup) return 'One more: would a flex room work in place of a bedroom?';
    return '';
  }

  function score(p, swap) {
    var want = parseInt(answers.beds, 10), baths = parseFloat(answers.baths);
    var max = p.bedsMax || p.beds, s = 0, fit = '';
    var hasFlex = p.flex || p.loft;
    if (swap) {
      // Flex-room options: one bedroom fewer, plus a flex room or loft for the office.
      if (hasFlex && p.beds <= want - 1 && max >= want - 1) { s += 3; fit = (want - 1) + ' bedrooms plus a ' + (p.flex ? 'flex room' : 'loft') + ' for the office'; }
      else s -= 6;
    } else if (p.beds <= want && max >= want) { s += 3; fit = want + (want >= 5 ? '+' : '') + ' bedrooms, as you asked'; }
    else if (p.beds === want + 1) { s += 1; fit = 'One bedroom more than you asked for'; }
    else s -= 3;
    if (p.baths >= baths) s += 2; else s -= 1;
    if (answers.stairs === 'one') s += p.stories === 1 ? 6 : -4;
    if (answers.stairs === 'main' && p.mainBed) s += 2;
    if (answers.uses.indexOf('office') !== -1 && hasFlex) s += 1;
    return { plan: p, s: s, fit: fit, flexOption: !!swap };
  }

  function pickPlans() {
    var byScore = function (a, b) { return b.s - a.s; };
    var full = PLANS.map(function (p) { return score(p, false); }).sort(byScore);
    if (answers.followup === 'yes') return PLANS.map(function (p) { return score(p, true); }).sort(byScore).slice(0, 3);
    if (answers.followup === 'both') {
      var flex = PLANS.map(function (p) { return score(p, true); }).filter(function (r) { return r.s > 0; }).sort(byScore);
      var top = full.slice(0, 2);
      var extra = flex.filter(function (r) { return top.every(function (t) { return t.plan !== r.plan; }); })[0];
      return extra ? top.concat([extra]) : full.slice(0, 3);
    }
    return full.slice(0, 3);
  }

  function reason(r) {
    var parts = [];
    if (r.fit) parts.push(r.fit);
    parts.push(r.plan.note);
    if (answers.stairs === 'main' && r.plan.mainBed && !/main floor/.test(r.plan.note)) parts.push('Has a bedroom on the main floor');
    if (answers.stairs === 'one' && r.plan.stories === 1 && !/one-story/.test(r.plan.note)) parts.push('One story');
    return parts.join('. ') + '.';
  }

  var LABELS = {
    now: { rent: 'You rent right now', own: "You own a home you'd need to sell", family: "You're living with family or friends", moving: "You're moving to the area" },
    reasons: { room: 'more room', rent: 'to stop paying rent', commute: 'a shorter commute', yard: 'a yard', newer: 'something newer', other: '' },
    when: { soon: "you'd like to move in the next 3 months", mid: "you'd like to move in 3 to 6 months", later: "you'd like to move in 6 to 12 months", looking: "you're just looking for now" }
  };

  function listJoin(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }

  function results() {
    root.innerHTML = '';
    var reasons = answers.reasons.filter(function (r) { return r !== 'other'; }).map(function (r) { return LABELS.reasons[r]; });
    if (answers.other) reasons.push('“' + answers.other + '”');

    var heard = el('div', { 'class': 'result-block', style: 'margin-top:0' });
    heard.appendChild(el('h2', { text: 'Here’s what I heard', tabindex: '-1' }));
    var p = el('p', { 'class': 'heard' });
    var line = (LABELS.now[answers.now] || 'You') + (reasons.length ? ', and you want ' + listJoin(reasons) : '') + '. ';
    if (answers.where) line += 'You need to be near ' + answers.where + ', with a commute under ' + (answers.commute === '60' ? 'an hour' : answers.commute + ' minutes') + '. ';
    line += 'And ' + (LABELS.when[answers.when] || '') + '.';
    p.textContent = line;
    heard.appendChild(p);
    if (answers.no) heard.appendChild(el('p', { 'class': 'heard quiet', text: 'You said this would make it a no: “' + answers.no + '”. I’ll keep that front and center.' }));
    root.appendChild(heard);

    var ranked = pickPlans();
    lastPlans = ranked.map(function (r) { return r.plan.name; });
    var plans = el('div', { 'class': 'result-block' });
    plans.appendChild(el('h2', { text: 'Three Collins Ridge plans to look at first' }));
    plans.appendChild(el('p', { 'class': 'quiet measure', text: 'From the Collins Ridge plan list as of June 2026. Plans and availability change, so I’ll confirm what’s current when we talk.' }));
    var table = el('table', { 'class': 'schedule' });
    table.innerHTML = '<thead><tr><th scope="col">Plan</th><th scope="col">Type</th><th scope="col">Beds</th><th scope="col">Baths</th><th scope="col">Sq ft</th><th scope="col">Why it made the list</th></tr></thead>';
    var tb = el('tbody');
    ranked.forEach(function (r) {
      var why = reason(r);
      var tr = el('tr', {}, [
        el('td', {}, [el('b', { text: r.plan.name })]),
        el('td', { text: r.plan.kind }),
        el('td', { 'class': 'num', text: r.plan.bedsMax ? r.plan.beds + ' to ' + r.plan.bedsMax : String(r.plan.beds) }),
        el('td', { 'class': 'num', text: String(r.plan.baths) }),
        el('td', { 'class': 'num', text: r.plan.sqft }),
        el('td', { text: why })
      ]);
      tb.appendChild(tr);
    });
    table.appendChild(tb);
    plans.appendChild(el('div', { 'class': 'table-wrap' }, [table]));
    if (ranked.some(function (r) { return r.flexOption; })) plans.appendChild(el('p', { 'class': 'quiet small', style: 'margin-top:12px', text: 'Plans marked with a flex room or loft for the office have one fewer bedroom, like you said would work.' }));

    var bp = el('div', { 'class': 'card-plain ballpark' });
    bp.innerHTML = '<h3>Your ballpark price range</h3><p><span class="todo">Coming soon.</span> It will come from the ' + money(answers.pay) + ' a month you picked, using math a lender has checked. A lender gives you the real number.</p>';
    plans.appendChild(bp);
    root.appendChild(plans);

    var where = el('div', { 'class': 'result-block' });
    where.appendChild(el('h2', { text: 'If Hillsborough isn’t the right fit' }));
    where.appendChild(el('p', { 'class': 'measure', text: 'Right now this only checks Collins Ridge. If your commute points somewhere else, I’ll look at the other D.R. Horton communities around Raleigh and introduce you to the agent there, so you don’t have to start over.' }));
    root.appendChild(where);

    var next = el('div', { 'class': 'result-block' });
    next.appendChild(el('h2', { text: 'What I’d do next' }));
    var step = answers.now === 'own' ? 'Since you’d need to sell first, the order of things matters. Let’s talk through how buying and selling at the same time works before you fall for a plan.'
      : answers.when === 'soon' ? 'Move-in ready homes are where I’d start. Book a visit and I’ll have the ones that fit open.'
      : 'Come see two or three of these in person. Pictures don’t tell you how a room feels.';
    next.appendChild(el('p', { 'class': 'measure lead', style: 'max-width:52ch', text: step }));
    next.appendChild(el('div', { 'class': 'actions' }, [el('a', { 'class': 'btn btn-amber', href: '/book', text: 'Book a visit' }), el('button', { type: 'button', 'class': 'btn btn-ink', text: 'Start over', id: 'restart' })]));
    root.appendChild(next);

    root.appendChild(reportForm());
    schedulePopup();
    document.getElementById('restart').addEventListener('click', function () { i = 0; answers = { reasons: [], uses: [], pay: 2400, baths: '', beds: '', stairs: 'fine', commute: '30', where: '', other: '', no: '', followup: '' }; clearTimeout(popupTimer); render(); });
    root.querySelector('h2').focus({ preventScroll: true });
    root.scrollIntoView({ block: 'start' });
  }

  function reportForm() {
    var wrap = el('div', { 'class': 'result-block card-plain', id: 'report' });
    wrap.innerHTML =
      '<h3>Want the full report?</h3>' +
      '<p class="measure">I’ll email you the whole picture: your reasons for moving, in your words, the plans that fit and why, a timeline built around where you live now, and the next steps I’d take in your shoes.</p>' +
      '<form novalidate>' + leadFields() +
        '<p class="quiet small">Phone is optional. If you add it, I may call or text about your plans and a visit. Message and data rates may apply. Reply STOP to opt out.</p>' +
        '<div class="actions"><button class="btn btn-amber" type="submit">Send my full report</button></div>' +
        '<p class="form-note" role="status" hidden></p>' +
      '</form>';
    var form = wrap.querySelector('form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = form.querySelector('.form-note');
      submitLead(form, function (ok, msg) {
        note.hidden = false;
        note.textContent = ok ? 'Got it. Thank you. I’ll email your plans and the details soon. To see them in person, book a visit.' : msg;
        note.setAttribute('tabindex', '-1'); note.focus();
        if (ok) { form.querySelector('button[type=submit]').disabled = true; try { sessionStorage.setItem('ccMatchPopup', '1'); } catch (er) {} clearTimeout(popupTimer); }
      });
    });
    return wrap;
  }

  // ---- Lead capture (HubSpot Forms API) ----
  var HS = { portal: '247617862', form: '0b4dc486-9d8e-4e91-a9a2-37f231108f90' };

  function track() {
    if (answers.now === 'own') return 'Home to sell';
    if (answers.when === 'soon') return 'Move-in ready';
    if (answers.when === 'looking') return 'Just looking';
    return 'Nurture';
  }

  function summary(planNames, wantsNews) {
    var parts = ['Floor plan finder', 'Track: ' + track(),
      'Living: ' + (LABELS.now[answers.now] || answers.now || ''),
      'Move: ' + (LABELS.when[answers.when] || answers.when || ''),
      'Payment: ' + money(answers.pay) + '/mo',
      'Beds/baths: ' + (answers.beds || '?') + '/' + (answers.baths || '?'),
      'Near: ' + (answers.where || 'not given') + ' (' + answers.commute + ' min)',
      'Plans shown: ' + planNames.join(', '),
      'Newsletter: ' + (wantsNews ? 'yes' : 'no')];
    if (answers.no) parts.push('Deal-breaker: ' + answers.no);
    return parts.join(' | ');
  }

  function submitLead(form, onDone) {
    var fd = new FormData(form);
    var email = (fd.get('email') || '').toString().trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { onDone(false, 'Please enter a valid email address.'); return; }
    var names = lastPlans.slice();
    var fields = [{ name: 'email', value: email }, { name: 'message', value: summary(names, !!fd.get('newsletter')) }];
    if (fd.get('first')) fields.push({ name: 'firstname', value: fd.get('first').toString().trim() });
    if (fd.get('phone')) fields.push({ name: 'phone', value: fd.get('phone').toString().trim() });
    var body = { fields: fields, context: { pageUri: location.href, pageName: document.title } };
    fetch('https://api.hsforms.com/submissions/v3/integration/submit/' + HS.portal + '/' + HS.form, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body)
    }).then(function (r) { onDone(r.ok, r.ok ? '' : 'That did not go through. Please try again, or call or text me.'); })
      .catch(function () { onDone(false, 'That did not go through. Please try again, or call or text me.'); });
  }

  function leadFields(idp) {
    return '<div class="form-grid">' +
      '<label class="field">Email<input type="email" name="email" autocomplete="email" required></label>' +
      '<label class="field"><span>First name <span class="hint">optional</span></span><input type="text" name="first" autocomplete="given-name"></label>' +
      '<label class="field"><span>Phone <span class="hint">optional</span></span><input type="tel" name="phone" autocomplete="tel"></label>' +
      '<label class="check full"><input type="checkbox" name="newsletter" checked><span>Also add me to Charles’s newsletter. Unsubscribe anytime.</span></label>' +
      '</div>';
  }

  var popupShown = false, popupTimer = null;
  function schedulePopup() {
    try { if (sessionStorage.getItem('ccMatchPopup')) return; } catch (e) {}
    clearTimeout(popupTimer);
    popupTimer = setTimeout(openPopup, 8000);
  }
  function openPopup() {
    if (popupShown || !document.getElementById('report')) return;
    popupShown = true;
    try { sessionStorage.setItem('ccMatchPopup', '1'); } catch (e) {}
    var prev = document.activeElement;
    var ov = el('div', { 'class': 'lead-overlay' });
    var box = el('div', { 'class': 'lead-modal', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'lead-h' });
    box.innerHTML =
      '<button type="button" class="lead-close" aria-label="Close">&times;</button>' +
      '<h2 id="lead-h">Want to see these in person?</h2>' +
      '<p>Pictures don’t show how a room feels. Pick a time and I’ll have your plans open.</p>' +
      '<div class="actions"><a class="btn btn-amber" href="/book">Book a visit</a></div>' +
      '<p class="quiet small" style="margin:18px 0 8px">Not ready? I can email you the plans and the details instead.</p>' +
      '<form novalidate>' + leadFields() +
      '<div class="actions"><button class="btn btn-ink" type="submit">Email me the details</button></div>' +
      '<p class="form-note" role="status" hidden></p></form>';
    ov.appendChild(box); document.body.appendChild(ov);
    function close() { ov.remove(); document.removeEventListener('keydown', onKey); if (prev && prev.focus) prev.focus(); }
    function onKey(e) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    box.querySelector('.lead-close').addEventListener('click', close);
    var form = box.querySelector('form'), note = form.querySelector('.form-note');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitLead(form, function (ok, msg) {
        note.hidden = false;
        note.textContent = ok ? 'Got it. Thank you. I’ll send the details soon. You can also book a visit any time.' : msg;
        if (ok) form.querySelector('button[type=submit]').disabled = true;
      });
    });
    box.querySelector('input[name=email]').focus();
  }

  render();
})();
