// Floor plan finder. Seven short questions, one per screen, then one recommended
// Collins Ridge floor plan with a direct link to D.R. Horton's plan image. The visitor confirms
// the plan (or sees the next best), then chooses to be contacted. Lead fields go to HubSpot.
// Plan data: Collins Ridge plan list (June 2026). payFrom = lowest est. monthly payment
// on Collins Ridge inventory (Oct 2026 pull); used only to judge budget fit, never shown as a number.
// Answers leave the browser only when the visitor sends the form; it posts to HubSpot.
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

  var CITIES = ['Aberdeen', 'Angier', 'Apex', 'Clayton', 'Durham', 'Fuquay-Varina', 'Hillsborough', 'Knightdale', 'Lillington', 'Pinehurst', 'Raeford', 'Raleigh', 'Sanford', 'Spring Lake', 'Stem', 'Vass', 'Wake Forest', 'Wendell', 'West End', 'Willow Spring', "Wilson's Mills", 'Youngsville'];

  var STEPS = [
    { id: 'why', type: 'multi', title: "What's making you think about moving?",
      why: "Pick all that fit.",
      options: [['room', 'I need more room'], ['rent', "I'm tired of paying rent"], ['commute', 'I want a shorter drive to work'], ['change', 'Something is changing in my life'], ['newer', 'I want a newer home with less to fix'], ['other', 'Something else']] },
    { id: 'now', type: 'single', title: 'Where do you live now?',
      why: 'This helps me plan the timing.',
      options: [['rent', 'I rent'], ['sell', 'I own a home I need to sell'], ['own', "I own a home and don't need to sell it"], ['family', 'I live with family or friends']] },
    { id: 'when', type: 'single', title: 'When do you want to move in?',
      why: 'A guess is fine. It tells me if I should start with homes that are already built.',
      options: [['soon', 'In the next 3 months'], ['mid', 'In 3 to 6 months'], ['later', 'In 6 to 12 months'], ['open', 'Not sure yet']] },
    { id: 'beds', type: 'single', title: 'How many bedrooms do you need?',
      why: "Count the rooms that need a bed. We'll talk about offices next.",
      options: [['3', '3 or fewer'], ['4', '4'], ['5', '5 or more'], ['unsure', 'Not sure yet']] },
    { id: 'needs', type: 'multi', title: 'What does the home need to have?',
      why: 'Pick what matters. Skip the rest. Every choice here is something these floor plans really have.',
      options: [
        ['flex', 'A flex room for an office, gym or hobby'],
        ['loft', 'A loft or second living area upstairs'],
        ['bedDown', 'A bedroom on the main floor'],
        ['primaryDown', 'The main bedroom on the main floor'],
        ['dual', 'Two main bedrooms, one up and one down'],
        ['one', 'One story only'],
        ['laundry1', 'Laundry on the main floor'],
        ['covered', 'A covered patio'],
        ['dining', 'A separate dining room'],
        ['butler', "A butler's pantry"],
        ['tub', 'A garden tub and a separate shower'],
        ['rearLoad', 'A garage in the back, not facing the street'],
        ['lowmaint', 'Less yard to take care of'],
        ['none', 'None of these']] },
    { id: 'pay', type: 'single', title: 'About how much a month can you spend?',
      why: "Include taxes and insurance. This isn't a quote.",
      options: [['2500', '$2,500 or less'], ['3000', 'About $3,000'], ['3500', 'About $3,500'], ['4000', '$4,000 or more'], ['unsure', 'Not sure yet']] },
    { id: 'cities', type: 'cities', title: 'Which cities do you like?',
      why: "Tap every city that works for you. I'll look for homes near them." }
  ];

  var LABELS = {
    why: { room: 'more room', rent: 'to stop paying rent', commute: 'a shorter commute', change: 'a fit for what is changing in your life', newer: 'something newer with less to fix' },
    now: { rent: 'You rent today', sell: 'You own a home you need to sell', own: "You own a home and don't need to sell it", family: 'You live with family or friends' },
    when: { soon: "you'd like to be in within 3 months", mid: "you're aiming for 3 to 6 months out", later: "you're looking 6 to 12 months out", open: "you're not sure of the date yet" }
  };

  var answers = { why: [], other: '', now: '', when: '', beds: '', needs: [], extra: '', pay: '', cities: [] };
  var i = 0, firstRender = true, stage = 'q';
  var lead = { first: '', last: '', email: '', phone: '', role: '' };
  var ri = 0, seen = [];
  var BOOK_SRC = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3cw7jvoA1zLMv16S7_4RMyfNGmYtW2w39wFeBwaVV0Msfd9rnRX8cDYqhESc7mQjj3Eqa9gGZm?gv=true';
  var KEY = 'ccFinderV1';
  function persist() { try { sessionStorage.setItem(KEY, JSON.stringify({ a: answers, i: i, st: stage, l: lead, ri: ri, seen: seen })); } catch (e) {} }
  function restore() {
    try {
      var d = JSON.parse(sessionStorage.getItem(KEY) || 'null');
      if (!d || !d.a) return;
      Object.keys(answers).forEach(function (k) { if (d.a[k] !== undefined) answers[k] = d.a[k]; });
      if (d.l) Object.keys(lead).forEach(function (k) { if (d.l[k] !== undefined) lead[k] = d.l[k]; });
      i = Math.min(Math.max(+d.i || 0, 0), STEPS.length - 1); stage = d.st || 'q'; ri = +d.ri || 0; seen = d.seen || [];
    } catch (e) {}
  }
  function nav(st, n, replace) {
    stage = st; if (n !== undefined) i = n;
    persist();
    try { history[replace ? 'replaceState' : 'pushState']({ cf: 1, st: st, i: i, ri: ri }, ''); } catch (e) {}
    show();
  }
  function show() {
    if (stage === 'done') done(); else if (stage === 'r') results(); else if (stage === 'c') confirm(); else if (stage === 'f') leadForm(false); else if (stage === 'n') leadForm(true); else render();
  }
  window.addEventListener('popstate', function (e) {
    var d = e.state;
    if (d && d.cf) { stage = d.st; i = d.i; if (d.ri !== undefined) ri = d.ri; persist(); show(); }
  });

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
    if (s.type === 'cities') {
      var cb = el('div', { 'class': 'chips' });
      CITIES.concat(['Not sure yet']).forEach(function (c) { cb.appendChild(choice('checkbox', 'cities', c, c, has(answers.cities, c))); });
      fs.appendChild(cb);
    }

    var err = el('p', { 'class': 'm-error', role: 'alert' });
    fs.appendChild(err);
    var form = el('form', { 'class': 'm-step', novalidate: '' }, [fs]);
    var back = el('button', { type: 'button', 'class': 'btn btn-ink', text: 'Back' });
    if (i === 0) back.style.visibility = 'hidden';
    back.addEventListener('click', function () { save(form); nav('q', i - 1); });
    form.addEventListener('change', function () { save(form); persist(); });
    form.addEventListener('input', function () { save(form); persist(); });
    form.appendChild(el('div', { 'class': 'm-nav' }, [back, el('button', { type: 'submit', 'class': 'btn btn-amber', text: i === STEPS.length - 1 ? 'Show me my plan' : 'Next' })]));
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      save(form);
      var problem = check(s);
      if (problem) { err.textContent = problem; return; }
      if (i < STEPS.length - 1) { nav('q', i + 1); } else { ri = 0; seen = []; nav('r'); }
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
    if (s.type === 'cities') { var cv = fd.getAll('cities'); if (has(cv, 'Not sure yet') && cv.length > 1) cv = cv.filter(function (x) { return x !== 'Not sure yet'; }); answers.cities = cv; }
  }
  function check(s) {
    if (s.type === 'single' && !answers[s.id]) return 'Pick the one that fits best.';
    if (s.id === 'why' && !answers.why.length && !answers.other) return 'Pick at least one, or tell me in your own words.';
    if (s.id === 'needs' && !answers.needs.length) return 'Pick what matters, or "None of these."';
    if (s.type === 'cities' && !answers.cities.length) return 'Tap at least one city, or "Not sure yet."';
    return '';
  }

  // ---- Matching ----
  // Each need maps to a feature the Collins Ridge plans really have (plan sheets). w = weight.
  var NEEDS = {
    flex: { w: 22, ok: 'You wanted a flex room. This one has it.', no: 'You wanted a flex room. This plan does not have one.' },
    loft: { w: 14, ok: 'You wanted a second living area. This plan has a loft or upstairs living space.', no: 'You wanted a loft or second living area. This plan does not have one.' },
    bedDown: { w: 24, ok: 'You wanted a bedroom on the main floor. This plan has one, with a full bath.', no: 'You wanted a bedroom on the main floor. This plan does not have one, so we should talk about that first.' },
    primaryDown: { w: 26, ok: 'You wanted the main bedroom on the main floor. This plan puts it there.', no: 'You wanted the main bedroom on the main floor. This plan puts it upstairs.' },
    dual: { w: 24, ok: 'You wanted two main bedrooms. This plan has one up and one down.', no: 'You wanted two main bedrooms. This plan has one.' },
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
  function ranked() {
    return PLANS.map(function (p) { return { plan: p, s: score(p) }; }).sort(function (a, b) { return b.s - a.s; }).map(function (x) { return x.plan; });
  }
  function citiesText() {
    return !answers.cities.length || has(answers.cities, 'Not sure yet') ? 'the Triangle area' : listJoin(answers.cities);
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

  // ---- Lead capture ----
  var HS = { portal: '247617862', form: '0b4dc486-9d8e-4e91-a9a2-37f231108f90' };
  function group() {
    if (answers.now === 'sell') return 'sell';
    if (answers.when === 'soon') return 'ready';
    if (answers.when === 'open') return 'looking';
    return 'planning';
  }
  function current() { var rk = ranked(); return rk[Math.min(ri, rk.length - 1)]; }
  function submitLead(form, soft, onDone) {
    var fd = new FormData(form);
    var v = function (k) { return (fd.get(k) || '').toString().trim(); };
    lead = { first: v('first'), last: v('last'), email: v('email'), phone: v('phone'), role: v('role') };
    persist();
    if (!lead.first) { onDone(false, 'Please add your first name.'); return; }
    if (!soft && !lead.last) { onDone(false, 'Please add your last name.'); return; }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(lead.email)) { onDone(false, 'Please enter a valid email address.'); return; }
    if (!soft && !lead.role) { onDone(false, 'Please tell me if you are the buyer or a realtor.'); return; }
    if (v('website')) { onDone(true, ''); return; } // honeypot
    var p = current();
    var fields = [
      { name: 'email', value: lead.email }, { name: 'firstname', value: lead.first },
      { name: 'cc_finder_plan', value: p.name }, { name: 'cc_finder_cities', value: answers.cities.join(', ') },
      { name: 'cc_wants_contact', value: soft ? 'false' : 'true' }, { name: 'cc_followup_group', value: group() }
    ];
    if (lead.last) fields.push({ name: 'lastname', value: lead.last });
    if (lead.phone) fields.push({ name: 'phone', value: lead.phone });
    if (!soft) fields.push({ name: 'cc_lead_type', value: lead.role });
    if (answers.when) fields.push({ name: 'cc_move_timeline', value: answers.when });
    if (answers.now) fields.push({ name: 'cc_housing_situation', value: answers.now });
    if (answers.pay) fields.push({ name: 'cc_payment_range', value: answers.pay });
    fetch('https://api.hsforms.com/submissions/v3/integration/submit/' + HS.portal + '/' + HS.form, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: fields, context: { pageUri: location.origin + location.pathname, pageName: document.title } })
    }).then(function (r) { onDone(r.ok, r.ok ? '' : 'That did not go through. Please try again, or call or text me.'); })
      .catch(function () { onDone(false, 'That did not go through. Please try again, or call or text me.'); });
  }

  // ---- Screens ----
  function planCard(p) {
    var card = el('div', { 'class': 'card-plain ballpark' });
    card.appendChild(el('h3', { text: 'The ' + p.name + ' · ' + p.kind }));
    card.appendChild(el('p', { 'class': 'quiet', text: (p.bedsMax ? p.beds + ' to ' + p.bedsMax : p.beds) + ' bed · ' + p.baths + ' bath · ' + p.sqft + ' sq ft · ' + (p.stories === 1 ? '1 story' : '2 story') }));
    var ul = el('ul'), rs = reasons(p);
    rs.hits.forEach(function (t) { ul.appendChild(el('li', { text: t })); });
    card.appendChild(ul);
    if (rs.misses.length) card.appendChild(el('p', { 'class': 'quiet small', text: 'Worth knowing: ' + rs.misses.join(' ') }));
    var bl = budgetLine(p);
    if (bl) card.appendChild(el('p', { 'class': 'measure', text: bl }));
    card.appendChild(el('div', { 'class': 'actions' }, [el('a', { 'class': 'btn btn-ink', href: p.url, target: '_blank', rel: 'noopener noreferrer', text: 'See the ' + p.name + ' floor plan' })]));
    card.appendChild(el('p', { 'class': 'quiet small', text: 'Opens the floor plan picture in a new tab. Close the tab to come back here.' }));
    return card;
  }
  function wireRestart(btn) {
    btn.addEventListener('click', function () {
      answers = { why: [], other: '', now: '', when: '', beds: '', needs: [], extra: '', pay: '', cities: [] };
      ri = 0; seen = [];
      try { sessionStorage.removeItem(KEY); } catch (e) {}
      nav('q', 0);
    });
  }
  function finish(h2) {
    root.querySelector('h2').focus({ preventScroll: true });
    root.scrollIntoView({ block: 'start' });
  }
  function btn(cls, text, fn) { var b = el('button', { type: 'button', 'class': 'btn ' + cls, text: text }); b.addEventListener('click', fn); return b; }

  function results() {
    root.innerHTML = '';
    var rk = ranked(), p = rk[Math.min(ri, rk.length - 1)];
    if (!has(seen, p.name)) { seen.push(p.name); persist(); }
    var why = answers.why.filter(function (r) { return r !== 'other'; }).map(function (r) { return LABELS.why[r]; });
    if (answers.other) why.push('“' + answers.other + '”');
    var heard = el('div', { 'class': 'result-block', style: 'margin-top:0' });
    heard.appendChild(el('h2', { text: ri === 0 ? 'Start with the ' + p.name + '.' : 'Here is another one: the ' + p.name + '.', tabindex: '-1' }));
    heard.appendChild(el('p', { 'class': 'heard', text: (LABELS.now[answers.now] || 'You') + (why.length ? ', and you want ' + listJoin(why) : '') + '. And ' + LABELS.when[answers.when] + '. ' + (ri === 0 ? 'This is the plan I would put in front of you first, and here is why.' : 'It is the next best fit for what you told me.') }));
    root.appendChild(heard);
    root.appendChild(planCard(p));

    var q = el('div', { 'class': 'result-block card-plain' });
    q.appendChild(el('h3', { text: 'Is this the one?' }));
    q.appendChild(el('p', { 'class': 'measure', text: 'Look at the floor plan. Then tell me. If it is not right, we will keep going until it is.' }));
    var acts = el('div', { 'class': 'actions' });
    acts.appendChild(btn('btn-amber', 'Yes, this is the one', function () { nav('c'); }));
    if (ri < Math.min(4, rk.length - 1)) acts.appendChild(btn('btn-ink', 'Show me another', function () { ri++; nav('r'); }));
    acts.appendChild(btn('btn-ink', 'Change my answers', function () { nav('q', STEPS.length - 1); }));
    q.appendChild(acts);
    if (ri >= Math.min(4, rk.length - 1)) q.appendChild(el('p', { 'class': 'quiet small', text: 'Those are my best matches. Change your answers, or we can talk it through together.' }));
    root.appendChild(q);
    finish();
  }

  function confirm() {
    root.innerHTML = '';
    var p = current();
    var soon = answers.when === 'soon';
    var h = el('div', { 'class': 'result-block', style: 'margin-top:0' });
    h.appendChild(el('h2', { text: 'Want to see the ' + p.name + ' in person?', tabindex: '-1' }));
    h.appendChild(el('p', { 'class': 'heard', text: 'You like ' + citiesText() + ', you want to spend about ' + ({ '2500': '$2,500 or less', '3000': '$3,000', '3500': '$3,500', '4000': '$4,000 or more', unsure: 'what feels right' }[answers.pay] || 'what feels right') + ' a month, and you picked the ' + p.name + '.' }));
    h.appendChild(el('p', { 'class': 'measure', text: 'A floor plan alone does not tell you which homes with this layout are open, or where. I can check that for you and set up a time to walk one.' }));
    h.appendChild(el('p', { 'class': 'measure lead', style: 'max-width:52ch', text: soon ? 'You want to be in soon, so I start with the homes closest to done.' : answers.now === 'sell' ? 'You have a home to sell, so we will map the order first. No rush.' : 'There is no pressure. It is just a look.' }));
    h.appendChild(el('p', { 'class': 'quiet small', text: 'What is open changes week to week. I will confirm what is current. No obligation.' }));
    var acts = el('div', { 'class': 'actions' });
    acts.appendChild(btn('btn-amber', 'Yes, help me set up a visit', function () { nav('f'); }));
    acts.appendChild(btn('btn-ink', 'Not yet', function () { nav('n'); }));
    h.appendChild(acts);
    h.appendChild(el('div', { 'class': 'actions', style: 'margin-top:8px' }, [btn('btn-ink', 'Back to the floor plan', function () { nav('r'); })]));
    root.appendChild(h);
    finish();
  }

  function leadForm(soft) {
    root.innerHTML = '';
    var p = current();
    var wrap = el('div', { 'class': 'result-block', style: 'margin-top:0' });
    wrap.appendChild(el('h2', { text: soft ? 'No problem. Want me to check back later?' : 'Where should I send you?', tabindex: '-1' }));
    wrap.appendChild(el('p', { 'class': 'measure', text: soft ? 'Leave your first name and email and I will check in when you are closer. Your ' + p.name + ' pick comes with you.' : 'Your ' + p.name + ' pick, your cities and your answers come with you. I am not starting from zero.' }));
    var fm = el('form', { novalidate: '' });
    fm.innerHTML =
      '<div class="form-grid">' +
      '<label class="field"><span>First name</span><input type="text" name="first" autocomplete="given-name" required></label>' +
      (soft ? '' : '<label class="field"><span>Last name</span><input type="text" name="last" autocomplete="family-name" required></label>') +
      '<label class="field full"><span>Email</span><input type="email" name="email" autocomplete="email" required></label>' +
      (soft ? '' : '<fieldset class="full"><legend class="hint" style="margin-bottom:6px">I am</legend><div class="chips">' +
        '<label class="choice"><input type="radio" name="role" value="buyer"><span>The buyer</span></label>' +
        '<label class="choice"><input type="radio" name="role" value="realtor"><span>A realtor with a buyer</span></label></div></fieldset>' +
        '<label class="field"><span>Phone <span class="hint">optional</span></span><input type="tel" name="phone" autocomplete="tel"></label>') +
      '<div style="position:absolute;left:-9999px" aria-hidden="true"><input type="text" name="website" tabindex="-1" autocomplete="off"></div>' +
      '</div>' +
      '<p class="quiet small">' + (soft ? 'By sending this, you agree I may email you about your plans. Unsubscribe anytime.' : 'By sending this, you agree I may contact you about this plan and homes that fit it. If you add a phone number, you agree I may call or text you, including automated texts. Consent isn\'t required to buy a home. Message and data rates may apply. Reply STOP to opt out.') + '</p>' +
      '<div class="actions"><button class="btn btn-amber" type="submit">' + (soft ? 'Check back with me' : 'Send it to Charles') + '</button></div>' +
      '<p class="form-note" role="alert" hidden></p>';
    wrap.appendChild(fm);
    wrap.appendChild(el('div', { 'class': 'actions', style: 'margin-top:12px' }, [btn('btn-ink', 'Back', function () { nav('c'); })]));
    root.appendChild(wrap);
    var note = fm.querySelector('.form-note');
    ['first', 'last', 'email', 'phone'].forEach(function (k) { if (fm.elements[k]) fm.elements[k].value = lead[k] || ''; });
    if (fm.elements.role && lead.role) { var rr = fm.querySelector('input[name=role][value=' + lead.role + ']'); if (rr) rr.checked = true; }
    fm.addEventListener('input', function () {
      ['first', 'last', 'email', 'phone'].forEach(function (k) { if (fm.elements[k]) lead[k] = fm.elements[k].value; });
      var r = fm.querySelector('input[name=role]:checked'); if (r) lead.role = r.value; persist();
    });
    fm.addEventListener('submit', function (e) {
      e.preventDefault();
      var b = fm.querySelector('button[type=submit]'), label = b.textContent;
      b.disabled = true; b.textContent = 'Sending…'; note.hidden = true;
      submitLead(fm, soft, function (ok, msg) {
        if (!ok) { b.disabled = false; b.textContent = label; note.hidden = false; note.textContent = msg; return; }
        softDone = soft; try { sessionStorage.setItem(KEY + 's', soft ? '1' : '0'); } catch (x) {}
        nav('done');
      });
    });
    finish();
  }
  var softDone = false;
  try { softDone = sessionStorage.getItem(KEY + 's') === '1'; } catch (e) {}

  function calendar() {
    var box = el('div');
    box.appendChild(el('iframe', { 'class': 'booking-frame', src: BOOK_SRC, title: 'Book a time with Charles', loading: 'lazy' }));
    box.appendChild(el('p', { 'class': 'quiet small', html: 'No times that work? Call or text <a href="tel:+19843282788">984-328-2788</a>.' }));
    return box;
  }
  function done() {
    root.innerHTML = '';
    var p = current(), first = lead.first || 'thank you';
    var soon = answers.when === 'soon', realtor = lead.role === 'realtor';
    var h = el('div', { 'class': 'result-block', style: 'margin-top:0' });
    var title, body;
    if (softDone) { title = 'Got it, ' + first + '. I will check back.'; body = 'No pressure. Your ' + p.name + ' pick is saved with your answers. You can come back any time, or pick a time if you change your mind.'; }
    else if (realtor) { title = 'Thanks, ' + first + '.'; body = 'I will reach out about the ' + p.name + ' and which homes fit your buyer. If you would rather pick a time now, my calendar is below.'; }
    else if (soon) { title = 'Got it, ' + first + '. Now pick a time.'; body = 'You want to be in soon, so let’s get you in front of the ' + p.name + ' this week. Pick a time and I will have the open homes ready.'; }
    else { title = 'Got it, ' + first + '.'; body = 'I will reach out in the next few days to go over the ' + p.name + ' and which homes fit. If you want to lock in a time now, you can.'; }
    h.appendChild(el('h2', { text: title, tabindex: '-1' }));
    h.appendChild(el('p', { 'class': 'measure', text: body }));
    h.appendChild(el('div', { 'class': 'actions' }, [el('a', { 'class': 'btn btn-ink', href: p.url, target: '_blank', rel: 'noopener noreferrer', text: 'See the ' + p.name + ' floor plan' })]));
    root.appendChild(h);
    var cal = el('div', { id: 'cal' });
    var showNow = !softDone && (soon || realtor);
    if (showNow) cal.appendChild(calendar());
    root.appendChild(cal);
    var acts = el('div', { 'class': 'actions', style: 'margin-top:18px' });
    if (!showNow) acts.appendChild(btn('btn-amber', 'Pick a time now', function () { cal.appendChild(calendar()); this.remove(); }));
    acts.appendChild(btn('btn-ink', 'Back to my plan', function () { nav('r'); }));
    var rs = btn('btn-ink', 'Start over', function () {}); wireRestart(rs); acts.appendChild(rs);
    root.appendChild(acts);
    finish();
  }

  restore();
  try { history.replaceState({ cf: 1, st: stage, i: i }, ''); } catch (e) {}
  show();
})();
