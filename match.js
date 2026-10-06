// Floor plan finder. Eight short questions, one per screen, then one recommended
// Collins Ridge floor plan with a direct link to D.R. Horton's plan image.
// Plan data: Collins Ridge plan list (June 2026). payFrom = lowest est. monthly payment
// on Collins Ridge inventory (Oct 2026 pull); used only to judge budget fit, never shown as a number.
// Answers leave the browser only if the visitor sends the email form; it posts to HubSpot.
(function () {
  var root = document.getElementById('matcher');
  if (!root) return;

  var PLANS = [
    { name: "Cali", kind: "Single-family", beds: 4, bedsMax: null, baths: 2, stories: 1, sqft: "1,764", f: {bedDown: 1, primaryDown: 1, oneStory: 1, covered: 1, dining: 1, laundry1: 1}, payFrom: 2950, note: "The only one-story plan", url: "https://www.drhorton.com/-/media/drhorton/productcatalog/495-raleigh/49730-collins-ridge/497300000-collins-ridge-50/1765/cali_-_4_bd_-_tradition_series_nofp_collins_ridge.jpg?rev=3395e77ddf264f0caa7fc5fa89615a26&hash=5F7AD503560DBEA82806357F5FB06410" },
    { name: "Galen", kind: "Single-family", beds: 3, bedsMax: 4, baths: 2.5, stories: 2, sqft: "2,340", f: {flex: 1, loft: 1}, payFrom: 3050, note: "A flex room and a loft, and the loft can become a 4th bedroom", url: "https://www.drhorton.com/-/media/drhorton/productcatalog/495-raleigh/49730-collins-ridge/497300000-collins-ridge-50/2341/galen_-_3-4bd_-_tradition_series_nofp_collins_ridge.jpg?rev=7abde535a1b2427ba00c2b94a844dc55&hash=C07AAADA4B06BB3B20475C868E6BEFDC" },
    { name: "Sierra", kind: "Single-family", beds: 4, bedsMax: null, baths: 2.5, stories: 2, sqft: "2,395", f: {loft: 1, bedDown: 1, primaryDown: 1, laundry1: 1}, payFrom: 2850, note: "Primary suite on the main floor, plus an upstairs living area", url: "https://www.drhorton.com/-/media/drhorton/productcatalog/495-raleigh/49730-collins-ridge/497290000-collins-ridge-40/2396/sierra_-_4bd_-_tradition_series_nofp_collins_ridge.jpg?rev=cb93248c85cb4719ba9ebd8c3f208f8d&hash=D9965558919D5D0BF2EBE4C1686BBE56" },
    { name: "Robie", kind: "Single-family", beds: 5, bedsMax: null, baths: 3, stories: 2, sqft: "2,368", f: {flex: 1, loft: 1, bedDown: 1}, payFrom: 2900, note: "Five bedrooms and a large loft", url: "https://www.drhorton.com/-/media/drhorton/productcatalog/495-raleigh/49730-collins-ridge/497290000-collins-ridge-40/2363/robie_-_5bd_-_tradition_series_nofp_collins_ridge.jpg?rev=31b160785fae4069ba46c82d81b30064&hash=AAB5D6C2FDB45AA3DE0B73E23E037B3B" },
    { name: "Hayden", kind: "Single-family", beds: 5, bedsMax: null, baths: 3, stories: 2, sqft: "2,511", f: {flex: 1, loft: 1, bedDown: 1}, payFrom: 3150, note: "A bedroom on the main floor, plus a flex room", url: "https://www.drhorton.com/-/media/drhorton/productcatalog/495-raleigh/49730-collins-ridge/497300000-collins-ridge-50/2512/hayden_-_5bd_-_tradition_series_nofp_collins_ridge.jpg?rev=55032b6e74204d1dab990810424b865b&hash=27C8EAB08A63CEF11616E764843400E5" },
    { name: "Alec", kind: "Single-family", beds: 4, bedsMax: null, baths: 3, stories: 2, sqft: "2,518", f: {loft: 1, bedDown: 1, covered: 1, rearLoad: 1}, payFrom: 3000, note: "A bedroom on the main floor and a covered patio", url: "https://www.drhorton.com/-/media/drhorton/productcatalog/495-raleigh/49730-collins-ridge/497300000-collins-ridge-50/2531/alec_rl_-_tradition_series_nofp_collins_ridge.jpg?rev=294f9cc2e37d45f587e71c29559bca90&hash=9F3389D1950B8BDD446A600CB555EDE8" },
    { name: "Landon", kind: "Single-family", beds: 4, bedsMax: null, baths: 3, stories: 2, sqft: "2,570", f: {loft: 1, bedDown: 1, tub: 1}, payFrom: 2950, note: "An upstairs living area and a large primary suite", url: "https://www.drhorton.com/-/media/drhorton/productcatalog/495-raleigh/49730-collins-ridge/497290000-collins-ridge-40/2585/landon_-_tradition_series_nofp_collins_ridge.jpg?rev=bb0d57c0bc994777816dcccc7c038470&hash=487A56F575101EC5B9A5DAA8BE24823E" },
    { name: "Jackson", kind: "Single-family", beds: 5, bedsMax: null, baths: 3, stories: 2, sqft: "2,637", f: {bedDown: 1, covered: 1, butler: 1, dining: 1, rearLoad: 1}, payFrom: 3100, note: "A butler's pantry and a covered patio", url: "https://www.drhorton.com/-/media/drhorton/productcatalog/495-raleigh/49730-collins-ridge/497300000-collins-ridge-50/2638/jackson_rl_-_tradition_series_nofp_collins_ridge.jpg?rev=efd21e7878394185999eef1d9642f2c6&hash=FE7C24B467EE7CB7039E5EF49C7C0597" },
    { name: "Calhoun", kind: "Single-family", beds: 4, bedsMax: null, baths: 3.5, stories: 2, sqft: "2,628", f: {bedDown: 1, primaryDown: 1, covered: 1, dining: 1, tub: 1, dual: 1, rearLoad: 1}, payFrom: 3200, note: "A bedroom on the main floor and a breakfast nook", url: "https://www.drhorton.com/-/media/drhorton/productcatalog/495-raleigh/49730-collins-ridge/497290000-collins-ridge-40/2628/calhoun_rl_-_tradition_series_nofp_collins_ridge.jpg?rev=a842196fca7443869bd4ffcd9aa1b014&hash=C3B0586C9EDDF08C992321C2F3298269" },
    { name: "Hanover", kind: "Single-family", beds: 4, bedsMax: 5, baths: 2.5, stories: 2, sqft: "2,804", f: {flex: 1, loft: 1}, payFrom: 3300, note: "The largest single-family plan, with a flex room", url: "https://www.drhorton.com/-/media/drhorton/productcatalog/495-raleigh/49730-collins-ridge/497300000-collins-ridge-50/2804/hanover_-_4-5bd_-_tradition_series_nofp__collins_ridge.jpg?rev=57dd88f1dbf0450ba43f502fb0d3ef55&hash=F026115819D8FEE25EDE7543EE5F1DD4" },
    { name: "Savannah", kind: "Townhome", beds: 4, bedsMax: null, baths: 2.5, stories: 2, sqft: "2,240", f: {loft: 1, bedDown: 1, primaryDown: 1, dining: 1, laundry1: 1, townhome: 1}, payFrom: null, note: "Primary suite on the main floor and a large loft", url: "https://www.drhorton.com/-/media/drhorton/productcatalog/495-raleigh/49727-collins-ridge/497280000-collins-ridge-26-th/t202/savannah_-_tradition_series_collins_ridge.jpg?rev=c8b4e38044ee46779a4caad2c526584d&hash=BFDA12966C8CF9C921F68F08607C6D8D" },
    { name: "Linville", kind: "Townhome", beds: 4, bedsMax: null, baths: 3, stories: 2, sqft: "2,439", f: {loft: 1, bedDown: 1, dining: 1, tub: 1, townhome: 1}, payFrom: null, note: "A large primary suite upstairs", url: "https://www.drhorton.com/-/media/drhorton/productcatalog/495-raleigh/49727-collins-ridge/497280000-collins-ridge-26-th/t203/linville_-_tradition_series_collins_ridge.jpg?rev=7273d2fe51114dedad392ac41007f977&hash=09FA7A0E212851A5E0604F48A21E210A" }
  ];

  var STEPS = [
    { id: 'why', type: 'multi', title: "What's behind the move?",
      why: "Pick as many as fit. I'll build your answer around this.",
      options: [['room', 'More room'], ['rent', "I'm tired of paying rent"], ['commute', 'A shorter commute'], ['change', 'A life change, like a new job or a new chapter'], ['newer', 'Something newer, with less to fix'], ['other', 'Something else']] },
    { id: 'now', type: 'single', title: "What's your housing situation right now?",
      why: 'Own or rent changes how we time things. It has nothing to do with which city you are in.',
      options: [['rent', 'I rent'], ['sell', "I own, and I'd need to sell first"], ['own', "I own, and I don't need to sell first"], ['family', "I'm staying with family or friends"], ['moving', "I'm relocating to the area"]] },
    { id: 'when', type: 'single', title: 'When do you want to be in?',
      why: 'A rough guess is fine. It tells me whether to start with homes that are already built.',
      options: [['soon', 'In the next 3 months'], ['mid', 'In 3 to 6 months'], ['later', 'In 6 to 12 months'], ['open', 'No date yet']] },
    { id: 'beds', type: 'single', title: 'How many bedrooms do you need?',
      why: 'Count the rooms that need a bed. Offices and flex space come next.',
      options: [['3', 'Three or fewer'], ['4', 'Four'], ['5', 'Five or more'], ['unsure', "I'm not sure yet"]] },
    { id: 'needs', type: 'multi', title: 'What has to be in the home?',
      why: 'Pick what matters most. Skip the rest. Every choice here is something these floor plans really have.',
      options: [
        ['flex', 'A flex room for an office, study, gym or hobby'],
        ['loft', 'A loft or second living area upstairs'],
        ['bedDown', 'A bedroom on the main floor'],
        ['primaryDown', 'The primary suite on the main floor'],
        ['dual', 'Two primary suites, one up and one down'],
        ['one', 'One story only'],
        ['laundry1', 'Laundry on the main floor'],
        ['covered', 'A covered patio'],
        ['dining', 'A separate dining room'],
        ['butler', "A butler's pantry"],
        ['tub', 'A garden tub with a separate shower'],
        ['rearLoad', 'A garage in the back, not facing the street'],
        ['lowmaint', 'Low maintenance, less yard'],
        ['none', 'None of these']] },
    { id: 'pay', type: 'single', title: 'What monthly payment feels comfortable?',
      why: "Count taxes and insurance. This isn't a quote, and no rate is attached.",
      options: [['2500', 'Under $2,500'], ['3000', '$2,500 to $3,000'], ['3500', '$3,000 to $3,500'], ['4000', '$3,500 or more'], ['unsure', "I'm not sure yet"]] },
    { id: 'where', type: 'where', title: 'Where do you need to be close to?',
      why: "A work address, a town, or an area. I use it to see which communities make sense. It stays between us." },
    { id: 'lender', type: 'single', title: 'Have you talked to a lender?',
      why: 'No wrong answer. It tells me what to line up first.',
      options: [['pre', "Yes, I'm pre-approved"], ['talked', "I've talked to one, but I'm not pre-approved"], ['not', 'Not yet'], ['cash', "I'm paying cash"]] }
  ];

  var LABELS = {
    why: { room: 'more room', rent: 'to stop paying rent', commute: 'a shorter commute', change: 'a fit for what is changing in your life', newer: 'something newer with less to fix' },
    now: { rent: 'You rent today', sell: "You own a home you'd need to sell first", own: 'You own, and selling is not a hurdle', family: "You're living with family or friends", moving: "You're moving to the area" },
    when: { soon: "you'd like to be in within 3 months", mid: "you're aiming for 3 to 6 months out", later: "you're looking 6 to 12 months out", open: "you don't have a date yet" }
  };

  var answers = { why: [], other: '', now: '', when: '', beds: '', needs: [], extra: '', pay: '', where: '', commute: '30', lender: '' };
  var i = 0, firstRender = true, lastRec = null;

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
  function listJoin(a) { return a.length < 2 ? a.join('') : a.slice(0, -1).join(', ') + ' and ' + a[a.length - 1]; }
  function has(a, v) { return a.indexOf(v) !== -1; }

  function render() {
    var s = STEPS[i];
    root.innerHTML = '';
    var pct = Math.round(((i + 1) / (STEPS.length + 1)) * 100);
    root.appendChild(el('div', { 'class': 'm-progress', 'aria-live': 'polite' }, [el('span', { text: 'Question ' + (i + 1) + ' of ' + STEPS.length }), el('div', { 'class': 'm-bar' }, [el('span', { style: 'width:' + pct + '%' })])]));

    var fs = el('fieldset');
    var legend = el('legend', { text: s.title, tabindex: '-1' });
    fs.appendChild(legend);
    fs.appendChild(el('p', { 'class': 'm-why', text: s.why }));

    if (s.type === 'single' || s.type === 'multi') {
      var box = el('div', { 'class': 'choices' });
      s.options.forEach(function (o) {
        var checked = s.type === 'single' ? answers[s.id] === o[0] : has(answers[s.id], o[0]);
        box.appendChild(choice(s.type === 'single' ? 'radio' : 'checkbox', s.id, o[0], o[1], checked));
      });
      fs.appendChild(box);
      if (s.id === 'needs') {
        var ex = el('label', { 'class': 'field', style: 'margin-top:14px' }, [
          el('span', { 'class': 'hint', text: 'Something not on the list? Tell me. Optional.' }),
          el('input', { type: 'text', name: 'extra', maxlength: '160', autocomplete: 'off' })
        ]);
        ex.querySelector('input').value = answers.extra;
        fs.appendChild(ex);
      }
      if (s.id === 'why') {
        var other = el('label', { 'class': 'field', style: 'margin-top:14px' }, [
          el('span', { 'class': 'hint', text: 'Something else? Say it in your own words.' }),
          el('input', { type: 'text', name: 'other', maxlength: '140', autocomplete: 'off' })
        ]);
        other.querySelector('input').value = answers.other;
        fs.appendChild(other);
      }
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

    var err = el('p', { 'class': 'm-error', role: 'alert' });
    fs.appendChild(err);
    var form = el('form', { 'class': 'm-step', novalidate: '' }, [fs]);
    var back = el('button', { type: 'button', 'class': 'btn btn-ink', text: 'Back' });
    if (i === 0) back.style.visibility = 'hidden';
    back.addEventListener('click', function () { save(form); i--; render(); });
    form.appendChild(el('div', { 'class': 'm-nav' }, [back, el('button', { type: 'submit', 'class': 'btn btn-amber', text: i === STEPS.length - 1 ? 'Show me my plan' : 'Next' })]));
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

  function save(form) {
    var s = STEPS[i], fd = new FormData(form);
    if (s.type === 'multi') {
      var v = fd.getAll(s.id);
      if (s.id === 'needs' && has(v, 'none') && v.length > 1) v = v.filter(function (x) { return x !== 'none'; });
      answers[s.id] = v;
    }
    if (s.type === 'single') answers[s.id] = fd.get(s.id) || '';
    if (s.id === 'why') answers.other = (fd.get('other') || '').trim();
    if (s.id === 'needs') answers.extra = (fd.get('extra') || '').trim();
    if (s.type === 'where') { answers.where = (fd.get('where') || '').trim(); answers.commute = fd.get('commute') || answers.commute; }
  }
  function check(s) {
    if (s.type === 'single' && !answers[s.id]) return 'Pick the one that fits best.';
    if (s.id === 'why' && !answers.why.length && !answers.other) return 'Pick at least one, or tell me in your own words.';
    if (s.id === 'needs' && !answers.needs.length) return 'Pick what matters, or "None of these."';
    if (s.type === 'where') {
      if (!answers.where) return 'Tell me a town or an area so I can check the commute.';
      if (!answers.commute) return 'Pick a commute.';
    }
    return '';
  }

  // ---- Matching ----
  // Each need maps to a feature the Collins Ridge plans really have (plan sheets). w = weight.
  var NEEDS = {
    flex: { w: 22, ok: 'You wanted a flex room. This one has it.', no: 'You wanted a flex room. This plan does not have one.' },
    loft: { w: 14, ok: 'You wanted a second living area. This plan has a loft or upstairs living space.', no: 'You wanted a loft or second living area. This plan does not have one.' },
    bedDown: { w: 24, ok: 'You wanted a bedroom on the main floor. This plan has one, with a full bath.', no: 'You wanted a bedroom on the main floor. This plan does not have one, so we should talk about that first.' },
    primaryDown: { w: 26, ok: 'You wanted the primary suite on the main floor. This plan puts it there.', no: 'You wanted the primary suite on the main floor. This plan puts it upstairs.' },
    dual: { w: 24, ok: 'You wanted two primary suites. This plan has one up and one down.', no: 'You wanted two primary suites. This plan has one.' },
    one: { w: 60, ok: 'You asked for one story. This is the only one-story plan at Collins Ridge.', no: 'You asked for one story. This plan has two.' },
    laundry1: { w: 16, ok: 'You wanted laundry on the main floor. This plan has it.', no: 'You wanted laundry on the main floor. This plan has it upstairs.' },
    covered: { w: 14, ok: 'You wanted a covered patio. This plan has one. Size and cover depend on the homesite.', no: 'You wanted a covered patio. This plan has a patio, and cover depends on the homesite.' },
    dining: { w: 14, ok: 'You wanted a separate dining room. This plan has one.', no: 'You wanted a separate dining room. This plan has an open dining area.' },
    butler: { w: 16, ok: "You wanted a butler's pantry. This is the plan that has one.", no: "You wanted a butler's pantry. Only the Jackson has one." },
    tub: { w: 12, ok: 'You wanted a garden tub and separate shower. This primary bath has both.', no: 'You wanted a garden tub and separate shower. This plan does not have that pairing.' },
    rearLoad: { w: 10, ok: 'You wanted the garage out of the street view. This plan has a rear-load garage.', no: 'You wanted a rear garage. This plan has a front-load garage.' },
    lowmaint: { w: 14, ok: 'You wanted less to maintain. This is a townhome, so there is less yard.', no: 'You wanted low maintenance. This is a single-family home with a yard.' }
  };
  var FLAG = { flex: 'flex', loft: 'loft', bedDown: 'bedDown', primaryDown: 'primaryDown', dual: 'dual', one: 'oneStory', laundry1: 'laundry1', covered: 'covered', dining: 'dining', butler: 'butler', tub: 'tub', rearLoad: 'rearLoad', lowmaint: 'townhome' };
  function fit(p) {
    var up = { '2500': 2500, '3000': 3000, '3500': 3500, '4000': 4000 }[answers.pay];
    if (!up || !p.payFrom) return 'unknown';
    if (p.payFrom <= up) return 'in';
    if (p.payFrom <= up + 150) return 'close';
    return 'stretch';
  }
  function score(p) {
    var s = 0;
    var n = parseInt(answers.beds, 10);
    if (n) {
      var most = p.bedsMax || p.beds;
      s += most >= n ? 30 : -40 * (n - most);
      if (p.beds > n + 1 && answers.beds !== '5') s -= 8 * (p.beds - n - 1);
    }
    answers.needs.forEach(function (k) {
      if (!NEEDS[k]) return;
      s += p.f[FLAG[k]] ? NEEDS[k].w : -Math.round(NEEDS[k].w * 0.8);
    });
    var ft = fit(p);
    s += ft === 'in' ? 10 : ft === 'stretch' ? -12 : 0;
    if (!p.payFrom && answers.pay === '2500') s += 6;
    return s;
  }
  function pick() {
    var r = PLANS.map(function (p) { return { plan: p, s: score(p) }; }).sort(function (a, b) { return b.s - a.s; });
    return { top: r[0].plan, next: r[1].plan };
  }
  function reasons(p) {
    var out = [];
    var n = parseInt(answers.beds, 10);
    var bedTxt = p.bedsMax ? p.beds + ' to ' + p.bedsMax + ' bedrooms' : p.beds + ' bedrooms';
    if (n) out.push('You need ' + (answers.beds === '5' ? 'five or more' : answers.beds === '3' ? 'three' : 'four') + ' bedrooms. The ' + p.name + ' has ' + bedTxt + '.');
    answers.needs.forEach(function (k) { if (NEEDS[k] && p.f[FLAG[k]]) out.push(NEEDS[k].ok); });
    var misses = answers.needs.filter(function (k) { return NEEDS[k] && !p.f[FLAG[k]]; }).map(function (k) { return NEEDS[k].no; });
    if (!out.length) out.push('It is the best all-around fit for what you told me. The details come when we talk.');
    return { hits: out.slice(0, 4), misses: misses.slice(0, 2) };
  }
  function budgetLine(p) {
    var ft = fit(p);
    if (ft === 'in') return 'Your payment range looks workable for this plan at Collins Ridge. A lender gives you the real number.';
    if (ft === 'close') return 'At Collins Ridge, this plan sits just above your range right now. Down payment, rate and incentives move that, so it is worth a real look.';
    if (ft === 'stretch') return 'At Collins Ridge, this plan runs above your range. A nearby community may fit you better, and I can check that with you.';
    return '';
  }

  // ---- Lead capture (HubSpot Forms API) ----
  var HS = { portal: '247617862', form: '0b4dc486-9d8e-4e91-a9a2-37f231108f90' };
  function track() {
    if (answers.now === 'sell') return 'Home to sell';
    if (answers.when === 'soon') return 'Move-in ready';
    if (answers.when === 'open') return 'Just looking';
    return 'Nurture';
  }
  function summary(wantsNews, dealbreaker) {
    var parts = ['Floor plan finder', 'Track: ' + track(),
      'Why: ' + answers.why.concat(answers.other ? ['"' + answers.other + '"'] : []).join(', '),
      'Living: ' + answers.now, 'Move: ' + answers.when, 'Bedrooms: ' + answers.beds,
      'Needs: ' + answers.needs.join(', ') + (answers.extra ? ' | Also wants: ' + answers.extra : ''), 'Payment: ' + answers.pay,
      'Near: ' + answers.where + ' (' + answers.commute + ' min)', 'Lender: ' + answers.lender,
      'Recommended: ' + (lastRec ? lastRec.top.name + ' (alt ' + lastRec.next.name + ', budget ' + fit(lastRec.top) + ')' : ''),
      'Newsletter: ' + (wantsNews ? 'yes' : 'no')];
    if (dealbreaker) parts.push('Deal-breaker: ' + dealbreaker);
    return parts.join(' | ');
  }
  function submitLead(form, onDone) {
    var fd = new FormData(form);
    var email = (fd.get('email') || '').toString().trim();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { onDone(false, 'Please enter a valid email address.'); return; }
    var fields = [{ name: 'email', value: email }, { name: 'message', value: summary(!!fd.get('newsletter'), (fd.get('no') || '').toString().trim()) }];
    if (fd.get('first')) fields.push({ name: 'firstname', value: fd.get('first').toString().trim() });
    if (fd.get('phone')) fields.push({ name: 'phone', value: fd.get('phone').toString().trim() });
    fetch('https://api.hsforms.com/submissions/v3/integration/submit/' + HS.portal + '/' + HS.form, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: fields, context: { pageUri: location.href, pageName: document.title } })
    }).then(function (r) { onDone(r.ok, r.ok ? '' : 'That did not go through. Please try again, or call or text me.'); })
      .catch(function () { onDone(false, 'That did not go through. Please try again, or call or text me.'); });
  }

  // ---- Results ----
  function results() {
    root.innerHTML = '';
    var rec = pick(); lastRec = rec;
    var p = rec.top, alt = rec.next;
    var why = answers.why.filter(function (r) { return r !== 'other'; }).map(function (r) { return LABELS.why[r]; });
    if (answers.other) why.push('“' + answers.other + '”');

    var heard = el('div', { 'class': 'result-block', style: 'margin-top:0' });
    heard.appendChild(el('h2', { text: 'Start with the ' + p.name + '.', tabindex: '-1' }));
    heard.appendChild(el('p', { 'class': 'heard', text: (LABELS.now[answers.now] || 'You') + (why.length ? ', and you want ' + listJoin(why) : '') + '. ' + 'And ' + LABELS.when[answers.when] + '. Here is why this is the plan I would put in front of you first.' }));
    root.appendChild(heard);

    var card = el('div', { 'class': 'card-plain ballpark' });
    card.appendChild(el('h3', { text: 'The ' + p.name + ' · ' + p.kind }));
    card.appendChild(el('p', { 'class': 'quiet', text: (p.bedsMax ? p.beds + ' to ' + p.bedsMax : p.beds) + ' bed · ' + p.baths + ' bath · ' + p.sqft + ' sq ft · ' + (p.stories === 1 ? '1 story' : '2 story') }));
    var ul = el('ul');
    var rs = reasons(p);
    rs.hits.forEach(function (t) { ul.appendChild(el('li', { text: t })); });
    card.appendChild(ul);
    if (rs.misses.length) card.appendChild(el('p', { 'class': 'quiet small', text: 'Worth knowing: ' + rs.misses.join(' ') }));
    var bl = budgetLine(p);
    if (bl) card.appendChild(el('p', { 'class': 'measure', text: bl }));
    card.appendChild(el('div', { 'class': 'actions' }, [el('a', { 'class': 'btn btn-ink', href: p.url, target: '_blank', rel: 'noopener noreferrer', text: 'See the ' + p.name + ' floor plan' })]));
    card.appendChild(el('p', { 'class': 'quiet small', text: 'Opens the floor plan image in a new tab. Close the tab to come back here.' }));
    card.appendChild(el('p', { 'class': 'quiet small', text: 'If you want a second look: the ' + alt.name + '. ' + alt.note + '.' }));
    root.appendChild(card);

    var next = el('div', { 'class': 'result-block' });
    next.appendChild(el('h2', { text: 'What I can’t tell you from here' }));
    var line = 'Which homes with this layout are open, and in which community, depends on where you need to be (' + answers.where + ') and what fits your payment. A floor plan doesn’t answer that. We work it out together, and then I set up the visit.';
    next.appendChild(el('p', { 'class': 'measure', text: line }));
    var step = answers.now === 'sell' ? 'You would need to sell first, so the order matters. We will map that before you fall for a house.'
      : answers.when === 'soon' ? 'You want to be in soon, so I start with the homes closest to done.'
      : 'Come see this layout in person. A plan on a screen never shows how a room feels.';
    if (answers.lender === 'not') step += ' I will also point you to a lender so your numbers are real before you tour.';
    next.appendChild(el('p', { 'class': 'measure lead', style: 'max-width:52ch', text: step }));
    next.appendChild(el('p', { 'class': 'quiet small', text: 'Homes sell and new ones release as they are built, so what is open changes week to week. I will confirm what is current. No obligation.' }));
    next.appendChild(el('div', { 'class': 'actions' }, [
      el('a', { 'class': 'btn btn-amber', href: '/book', text: 'Pick a time. I’ll have the ' + p.name + ' ready.' }),
      el('a', { 'class': 'btn btn-ink', href: 'sms:+19843282788', text: 'Text me' }),
      el('button', { type: 'button', 'class': 'btn btn-ink', id: 'restart', text: 'Start over' })
    ]));
    root.appendChild(next);
    root.appendChild(emailForm(p));
    document.getElementById('restart').addEventListener('click', function () { i = 0; answers = { why: [], other: '', now: '', when: '', beds: '', needs: [], extra: '', pay: '', where: '', commute: '30', lender: '' }; render(); });
    root.querySelector('h2').focus({ preventScroll: true });
    root.scrollIntoView({ block: 'start' });
  }

  function emailForm(p) {
    var wrap = el('div', { 'class': 'result-block card-plain', id: 'report' });
    wrap.innerHTML =
      '<h3>Not ready to book? I’ll email this to you.</h3>' +
      '<p class="measure">You get the ' + p.name + ' recommendation and what I would check next for you.</p>' +
      '<form novalidate><div class="form-grid">' +
      '<label class="field">Email<input type="email" name="email" autocomplete="email" required></label>' +
      '<label class="field"><span>First name <span class="hint">optional</span></span><input type="text" name="first" autocomplete="given-name"></label>' +
      '<label class="field"><span>Phone <span class="hint">optional</span></span><input type="tel" name="phone" autocomplete="tel"></label>' +
      '<label class="field full"><span>Anything that would make this a no? <span class="hint">optional</span></span><textarea name="no" maxlength="600"></textarea></label>' +
      '<label class="check full"><input type="checkbox" name="newsletter" checked><span>Also add me to Charles’s newsletter. Unsubscribe anytime.</span></label>' +
      '</div>' +
      '<p class="quiet small">If you add a phone number, I may call or text about your plans and a visit. Message and data rates may apply. Reply STOP to opt out.</p>' +
      '<div class="actions"><button class="btn btn-ink" type="submit">Email me this</button></div>' +
      '<p class="form-note" role="status" hidden></p></form>';
    var form = wrap.querySelector('form'), note = form.querySelector('.form-note');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      submitLead(form, function (ok, msg) {
        note.hidden = false;
        note.textContent = ok ? 'Got it. Thank you. I’ll send it soon. You can also pick a time any time.' : msg;
        note.setAttribute('tabindex', '-1'); note.focus();
        if (ok) form.querySelector('button[type=submit]').disabled = true;
      });
    });
    return wrap;
  }

  render();
})();
