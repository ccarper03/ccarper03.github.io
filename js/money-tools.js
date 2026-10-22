// charlescarper.com money tools: Two-Mortgage Check, Buying Power Estimate, Lease-to-Keys Planner.
// The buyer types every number. Nothing is filled in, and no D.R. Horton rate is used.
// The free answer shows right away. The full plan unlocks with an email (forms.js ccGate).
(function () {
  'use strict';

  // Debt-to-income bands for the Two-Mortgage Check. Laura Hall (DHI Mortgage) signs off before launch.
  var DTI_OK = 43, DTI_STRETCH = 50;
  // Buying Power: 28% of pay for housing and 36% for all debts is the comfortable end; 43% of pay is the stretch end.
  var FRONT = 0.28, BACK = 0.36, BACK_MAX = 0.43;
  // Rough estimates, used only when the buyer skips them. Labeled every time they're used.
  var TI_RATE = 0.015;      // taxes and insurance, about 1.5% of the price a year
  var MI_RATE = 0.005;      // mortgage insurance, about 0.5% of the loan a year, when under 20% down
  var CLOSE_RATE = 0.03;    // closing costs, about 3% of the price
  var YEARS = 30;
  var PHONE = '+19843282788';

  var $$ = function (el, s) { return [].slice.call(el.querySelectorAll(s)); };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var money = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var round = function (n, to) { return Math.round(n / to) * to; };
  var pct = function (n) { return Math.round(n) + '%'; };
  var track = function (n, p) { if (window.ccTrack) window.ccTrack(n, p); };
  var sms = function (body) { return 'sms:' + PHONE + '?&body=' + encodeURIComponent(body); };
  var num = function (f, name) { var el = f.elements[name]; if (!el) return NaN; var v = (el.value || '').replace(/[$,%\s]/g, ''); return v === '' ? NaN : +v; };

  function pmt(loan, ratePct) {
    var r = ratePct / 100 / 12, n = YEARS * 12;
    if (loan <= 0) return 0;
    return r ? loan * r / (1 - Math.pow(1 + r, -n)) : loan / n;
  }

  function lenderBox() {
    return '<div class="plan-box"><h3>Talk to a lender</h3><p>Laura Hall at DHI Mortgage can price this for real, or use any lender you like. Bring these numbers.</p></div>';
  }

  // Shared flow: validate, show the free answer, offer the gate, then the full plan.
  function setup(shell, cfg) {
    var form = shell.querySelector('[data-money-form]'), answer = shell.querySelector('[data-answer]');
    var gate = shell.querySelector('[data-gate]'), unlocked = shell.querySelector('[data-unlocked]'), err = shell.querySelector('[data-error]');
    var started = false, last = null;
    form.addEventListener('input', function () { if (!started) { started = true; track('tool_start', { tool: cfg.tool }); } });
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var r = cfg.compute(form);
      if (r.error) { err.textContent = r.error; var bad = form.elements[r.field]; if (bad) bad.focus(); return; }
      err.textContent = ''; last = r;
      answer.innerHTML = cfg.free(r); answer.hidden = false;
      track('tool_finish', { tool: cfg.tool, result: r.band || '' });
      if (unlocked.dataset.open === '1') { unlocked.innerHTML = cfg.full(r); return; }
      gate.hidden = false;
      window.ccGate(gate.querySelector('[data-gate-form]'), {
        tool: cfg.tool, label: 'Send me my plan',
        summary: function () { return cfg.summary(last); },
        onUnlock: function (o) {
          gate.hidden = true; unlocked.dataset.open = '1';
          unlocked.innerHTML = (o && o.first ? '<p class="form-note ok">Thanks, ' + esc(o.first) + '. Here\'s your full plan. I\'ll send you a copy too.</p>' : '') + cfg.full(last);
          unlocked.hidden = false;
          var h = unlocked.querySelector('h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus(); }
        }
      });
      answer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  function nextLinks(extra) {
    return '<div class="next-paths">' + (extra || '') +
      '<a class="next-path primary" href="/visit/"><span class="who">See them in person</span><b>Book a visit</b></a>' +
      '<a class="next-path" href="/move-in-ready/"><span class="who">Finished or almost finished</span><b>See move-in ready homes</b></a>' +
      '</div>';
  }

  // ---------------------------------------------------------------------------
  // Two-Mortgage Check
  // ---------------------------------------------------------------------------
  function twoCompute(f) {
    var I = num(f, 'income'), P1 = num(f, 'pay1'), D = num(f, 'debts'), PR = num(f, 'price'), DN = num(f, 'down'), R = num(f, 'rate'), TI = num(f, 'ti');
    if (!(I > 0)) return { error: 'Add what you earn each month, before taxes.', field: 'income' };
    if (!(P1 >= 0)) return { error: 'Add your house payment now. Put 0 if there isn\'t one.', field: 'pay1' };
    if (isNaN(D)) D = 0;
    if (!(PR > 0)) return { error: 'Add the price of the new home.', field: 'price' };
    if (isNaN(DN)) DN = 0;
    if (DN > PR) return { error: 'Your down payment is more than the price.', field: 'down' };
    if (!(R > 0 && R < 20)) return { error: 'Add an interest rate. Ask a lender, or use this week\'s national average.', field: 'rate' };
    var loan = PR - DN, pi = pmt(loan, R), tiEst = isNaN(TI), ti = tiEst ? PR * TI_RATE / 12 : TI;
    var mi = DN / PR < 0.2 ? loan * MI_RATE / 12 : 0;
    var N = pi + ti + mi, both = (P1 + N + D) / I * 100, after = (N + D) / I * 100;
    var band = both <= DTI_OK ? 'good' : both <= DTI_STRETCH ? 'stretch' : 'no';
    return { I: I, P1: P1, D: D, PR: PR, DN: DN, R: R, pi: pi, ti: ti, tiEst: tiEst, mi: mi, N: N, both: both, after: after, band: band };
  }
  var TWO_VERDICT = { good: 'Likely works.', stretch: 'A stretch.', no: 'Not likely without selling first.' };
  var TWO_LINE = {
    good: 'With both payments, your monthly debts look like they fit what many lenders allow. Get it confirmed before you pick a home.',
    stretch: 'With both payments, you\'re near the edge of what many lenders allow. There are ways to make it work, and a lender can tell you which.',
    no: 'With both payments, your monthly debts run past what most lenders allow. Selling first, or a program that helps you buy before you sell, may fit better.'
  };
  function meter(v) {
    var pos = Math.min(70, Math.max(0, v)) / 70 * 100;
    return '<div class="meter" style="--a:' + (DTI_OK / 70 * 100) + '%;--b:' + (DTI_STRETCH / 70 * 100) + '%;--v:' + pos + '%" aria-hidden="true"><i></i></div>' +
      '<div class="meter-scale"><span style="left:0">0%</span><span style="left:' + (DTI_OK / 70 * 100) + '%">' + DTI_OK + '%</span><span style="left:' + (DTI_STRETCH / 70 * 100) + '%">' + DTI_STRETCH + '%</span><span style="left:100%">70%</span></div>';
  }
  function twoFree(r) {
    return '<div class="answer" aria-live="polite"><p class="eyebrow">Your answer</p><p class="verdict ' + r.band + '">' + TWO_VERDICT[r.band] + '</p>' +
      '<p>About <b>' + pct(r.both) + '</b> of your pay would go to monthly debts with both payments.</p>' + meter(r.both) +
      '<p style="margin-top:14px">' + TWO_LINE[r.band] + '</p>' +
      '<p class="small quiet">After your home sells, that drops to about ' + pct(r.after) + '.</p></div>';
  }
  function twoFull(r) {
    var rows = [
      ['New home: loan payment', r.pi], ['New home: taxes, insurance and HOA' + (r.tiEst ? ' (rough estimate)' : ''), r.ti]
    ];
    if (r.mi) rows.push(['New home: mortgage insurance (rough estimate, under 20% down)', r.mi]);
    rows.push(['Your house payment now', r.P1], ['Other monthly bills', r.D]);
    var total = r.N + r.P1 + r.D;
    var opts = r.band === 'good'
      ? '<li><b>Buy first.</b> Ask your lender to confirm you qualify with both payments, and decide how many months of both you\'re comfortable with.</li>' +
        '<li><b>Keep a cushion.</b> Your home could take longer to sell. Each extra month costs about ' + money(r.P1) + '.</li>'
      : '<li><b>A home-sale contingency.</b> Your purchase depends on your home selling by a deadline. Each D.R. Horton home has its own rules, so ask me about the one you like.</li>' +
        '<li><b>A program that buys your home or lends against it.</b> You buy first and move once, using your equity. Fees and rules vary, so get them in writing.</li>' +
        '<li><b>A bridge loan.</b> A short loan against your current home. Ask your lender how it counts when you qualify.</li>' +
        '<li><b>Sell first, timed to the build.</b> Pick a home that hasn\'t started, and sell yours while it goes up.</li>';
    var body = 'Hi Charles, I ran the Two-Mortgage Check. With both payments I\'m at about ' + pct(r.both) + ' of my pay (' + TWO_VERDICT[r.band].replace('.', '') + '). New home around ' + money(r.PR) + '. Can you check my numbers?';
    return '<h2 style="font-size:34px;margin-bottom:16px">Your full plan</h2><div class="plan-grid"><div>' +
      '<h3>The math</h3><table class="breakdown"><tbody>' + rows.map(function (x) { return '<tr><td>' + esc(x[0]) + '</td><td>' + money(x[1]) + '</td></tr>'; }).join('') +
      '<tr class="total"><td>Monthly debts with both payments</td><td>' + money(total) + '</td></tr>' +
      '<tr><td>What you earn each month</td><td>' + money(r.I) + '</td></tr>' +
      '<tr><td>Share of your pay, both payments</td><td>' + pct(r.both) + '</td></tr>' +
      '<tr><td>Share of your pay, after your home sells</td><td>' + pct(r.after) + '</td></tr></tbody></table>' +
      '<p class="small quiet" style="margin-top:10px">Loan: ' + money(r.PR - r.DN) + ' at ' + r.R + '% for ' + YEARS + ' years.' + (r.tiEst ? ' Taxes and insurance are estimated at about 1.5% of the price a year. Add HOA dues if the home has them.' : '') + '</p>' +
      '<h3 style="margin-top:24px">Your options</h3><ul class="plan-why">' + opts + '</ul></div><div>' +
      lenderBox() +
      '<div class="plan-box"><h3>Ask your lender</h3><ul><li>Can I qualify with both payments? If not, what changes once my home is under contract?</li><li>Would a bridge loan or a buy-before-you-sell program count against me when I qualify?</li><li>What will my cash to close be, and how much has to come from my sale?</li></ul></div>' +
      '<div class="plan-box"><h3>Next</h3><p><a href="/plan/sell-and-buy/">See all three ways side by side</a> in the Sell &amp; Buy Planner. <a href="' + esc(sms(body)) + '" data-sms-body="' + esc(body) + '">Text me your numbers</a>.</p></div>' +
      '</div></div>' + nextLinks('<a class="next-path" href="/buyers/home-to-sell/"><span class="who">The whole plan</span><b>I have a home to sell</b></a>');
  }
  function twoSummary(r) {
    return 'Tool: Two-Mortgage Check\nResult: ' + TWO_VERDICT[r.band] + ' About ' + pct(r.both) + ' of pay with both payments, ' + pct(r.after) + ' after the sale.' +
      '\nNumbers: income ' + money(r.I) + '/mo, current payment ' + money(r.P1) + ', other bills ' + money(r.D) + ', new home ' + money(r.PR) +
      ', down ' + money(r.DN) + ', rate ' + r.R + '%, new payment about ' + money(r.N);
  }

  // ---------------------------------------------------------------------------
  // Buying Power Estimate
  // ---------------------------------------------------------------------------
  function paymentFor(price, savings, R) {
    var down = Math.max(0, savings - price * CLOSE_RATE), loan = Math.max(0, price - down);
    var mi = down / price < 0.2 ? loan * MI_RATE / 12 : 0;
    return pmt(loan, R) + price * TI_RATE / 12 + mi;
  }
  function priceFor(pay, savings, R) {
    if (pay <= 0) return 0;
    var lo = 0, hi = 3000000;
    for (var i = 0; i < 60; i++) { var mid = (lo + hi) / 2; if (paymentFor(mid, savings, R) > pay) hi = mid; else lo = mid; }
    return lo;
  }
  function bpCompute(f) {
    var I = num(f, 'income'), D = num(f, 'debts'), S = num(f, 'savings'), R = num(f, 'rate'), C = num(f, 'comfort');
    if (!(I > 0)) return { error: 'Add what you earn each month, before taxes.', field: 'income' };
    if (isNaN(D)) D = 0;
    if (!(S >= 0)) return { error: 'Add what you\'ve saved for a down payment and closing costs. Put 0 if nothing yet.', field: 'savings' };
    if (!(R > 0 && R < 20)) return { error: 'Add an interest rate. Ask a lender, or use this week\'s national average.', field: 'rate' };
    var easy = Math.min(I * FRONT, I * BACK - D), max = I * BACK_MAX - D;
    if (C > 0) easy = Math.min(easy, C);
    var lowPay = Math.max(0, easy), highPay = Math.max(lowPay, max);
    var lowPrice = priceFor(lowPay, S, R), highPrice = priceFor(highPay, S, R);
    var band = highPay <= 0 ? 'no' : 'good';
    return { I: I, D: D, S: S, R: R, C: C, lowPay: lowPay, highPay: highPay, lowPrice: lowPrice, highPrice: highPrice, band: band };
  }
  function bpFree(r) {
    if (r.band === 'no') return '<div class="answer"><p class="eyebrow">Your answer</p><p class="verdict stretch">Your monthly bills come first.</p>' +
      '<p>Right now your monthly bills are high compared to what you earn. A lender can show you what would change that, like paying one down first.</p></div>';
    return '<div class="answer" aria-live="polite"><p class="eyebrow">Your answer</p>' +
      '<p class="big">' + money(round(r.lowPrice, 5000)) + ' to ' + money(round(r.highPrice, 5000)) + '</p>' +
      '<p>A monthly payment of about <b>' + money(round(r.lowPay, 10)) + ' to ' + money(round(r.highPay, 10)) + '</b>, with taxes and insurance.</p>' +
      '<p class="small quiet">The low end keeps housing near 28% of your pay. The high end is about where many lenders stop. ' + (r.C > 0 ? 'Your comfortable payment sets the low end.' : '') + '</p></div>';
  }
  function bpFull(r) {
    var down = Math.max(0, r.S - r.highPrice * CLOSE_RATE);
    var html = '<h2 style="font-size:34px;margin-bottom:16px">Your full plan</h2><div class="plan-grid"><div><h3>How I got there</h3><table class="breakdown"><tbody>' +
      '<tr><td>What you earn each month</td><td>' + money(r.I) + '</td></tr><tr><td>Monthly bills</td><td>' + money(r.D) + '</td></tr>' +
      '<tr><td>Comfortable payment (28% of pay, and 36% with your bills)</td><td>' + money(r.lowPay) + '</td></tr>' +
      '<tr><td>Stretch payment (43% of pay with your bills)</td><td>' + money(r.highPay) + '</td></tr>' +
      '<tr><td>Savings, after about 3% for closing costs, at the high end</td><td>' + money(down) + '</td></tr></tbody></table>' +
      '<p class="small quiet" style="margin-top:10px">' + r.R + '% for ' + YEARS + ' years. Taxes and insurance estimated at about 1.5% of the price a year, and mortgage insurance at about 0.5% of the loan a year when you put down less than 20%. HOA dues are extra.</p>' +
      '<h3 style="margin-top:24px">Move-in ready homes in your range</h3><div data-bp-homes><p class="quiet">Loading…</p></div></div><div>' +
      lenderBox() +
      '<div class="plan-box"><h3>Ask your lender</h3><ul><li>What monthly payment would you recommend for me, not just the most I qualify for?</li><li>Are there first-time buyer or down payment programs I qualify for?</li><li>How long is a preapproval good for?</li></ul></div>' +
      '<div class="plan-box"><h3>Next</h3><p><a href="/plan/lease-to-keys/">Time it with your lease</a> in the Lease-to-Keys Planner.</p></div></div></div>' +
      nextLinks('<a class="next-path" href="/buyers/renting/"><span class="who">Renting now?</span><b>I\'m renting</b></a>');
    setTimeout(function () { loadHomes(r.highPrice); }, 0);
    return html;
  }
  function loadHomes(maxPrice) {
    var slot = document.querySelector('[data-bp-homes]'); if (!slot) return;
    fetch('/data/move-in-ready.json').then(function (x) { return x.json(); }).then(function (d) {
      var list = d.homes.filter(function (h) { return h.price <= maxPrice * 1.02; }).sort(function (a, b) { return a.price - b.price; }).slice(0, 4);
      if (!list.length) { slot.innerHTML = '<p>None on this week\'s list yet. <a href="/move-in-ready/">Get the Monday list</a>, and you\'ll see new ones first.</p>'; return; }
      slot.innerHTML = '<ul class="links-list">' + list.map(function (h) {
        var label = (h.plan ? h.plan + ' at ' : '') + h.community + ', ' + h.town;
        return '<li><a href="/visit/?home=' + encodeURIComponent(label) + '">' + esc(label) + '<span>' + money(h.price) + ' as of ' + esc(d.asOf) + ' · ' + h.beds + ' bed · ' + h.baths + ' bath</span></a></li>';
      }).join('') + '</ul><p class="small"><a href="/move-in-ready/">See all move-in ready homes</a></p>';
    }).catch(function () { slot.innerHTML = '<p><a href="/move-in-ready/">See move-in ready homes</a></p>'; });
  }
  function bpSummary(r) {
    return 'Tool: Buying Power Estimate\nResult: ' + (r.band === 'no' ? 'Bills high vs. income' : money(r.lowPrice) + ' to ' + money(r.highPrice) + ', payment ' + money(r.lowPay) + ' to ' + money(r.highPay)) +
      '\nNumbers: income ' + money(r.I) + '/mo, bills ' + money(r.D) + ', savings ' + money(r.S) + ', rate ' + r.R + '%' + (r.C > 0 ? ', comfortable payment ' + money(r.C) : '');
  }

  // ---------------------------------------------------------------------------
  // Lease-to-Keys Planner
  // ---------------------------------------------------------------------------
  var DAY = 86400000;
  var fmt = function (d) { return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); };
  var fmtM = function (d) { return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); };
  function parseDate(f, name) { var v = f.elements[name].value; if (!v) return null; var p = v.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
  function addDays(d, n) { return new Date(d.getTime() + n * DAY); }
  function ltkCompute(f) {
    var lease = parseDate(f, 'leaseEnd'), move = parseDate(f, 'moveBy'), rent = num(f, 'rent'), fee = num(f, 'breakFee'), m2m = num(f, 'm2m');
    if (!lease) return { error: 'Add the date your lease ends.', field: 'leaseEnd' };
    if (!(rent > 0)) return { error: 'Add your rent each month.', field: 'rent' };
    if (isNaN(fee)) fee = NaN;
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var target = move || lease, months = (target - today) / DAY / 30.44;
    var stage = months < 2.5 ? 'ready' : months < 5.5 ? 'building' : 'starting';
    var start = addDays(target, -21), end = addDays(target, 7);
    if (start < today) start = today;
    return { lease: lease, move: move, target: target, rent: rent, fee: fee, m2m: m2m, months: months, stage: stage, start: start, end: end, today: today, band: stage };
  }
  var STAGE = {
    ready: ['Move-in ready', 'Your date is close, so look at homes that are finished or almost finished.'],
    building: ['Being built', 'A home that\'s already going up should land near your date. Move-in ready homes work too, if you can cover a little overlap.'],
    starting: ['Not started yet', 'You have time. A home that hasn\'t started takes several months, so it can be timed to your lease. You may get to pick from a few color packages.']
  };
  function ltkFree(r) {
    var s = STAGE[r.stage];
    return '<div class="answer" aria-live="polite"><p class="eyebrow">Your best move-in window</p>' +
      '<p class="big" style="font-size:clamp(30px,4vw,44px)">' + fmt(r.start) + ' to ' + fmt(r.end) + '</p>' +
      '<p>Homes that land in it: <b>' + s[0] + '</b>. ' + s[1] + '</p>' +
      (r.months < 1 ? '<p class="small quiet">That\'s soon. If the timing gets tight, ask your landlord about a short month-to-month.</p>' : '') + '</div>';
  }
  var PICK = {
    ready: 'Pick a move-in ready home.',
    building: 'Pick a home that\'s already being built.',
    starting: 'Pick a home that hasn\'t started yet. It can be built in time for your window.'
  };
  function ltkFull(r) {
    var early = 2 * r.rent, lateM2M = r.m2m > 0 ? 2 * r.m2m : NaN;
    var noticeBy = addDays(r.lease, -60);
    var steps = [
      ['Now', 'Talk to a lender and get preapproved. Laura Hall at DHI Mortgage can help, or use any lender you like.'],
      [r.stage === 'starting' && addDays(r.target, -180) > r.today ? 'By ' + fmtM(addDays(r.target, -180)) : 'Next', PICK[r.stage]],
      ['Once your closing date is firm', 'Give notice the way your lease says. Many leases ask for 30 to 60 days, so check yours. A safe target: ' + fmt(noticeBy) + ' or later, once the date is firm.'],
      ['Move-in', 'Close, get your keys and move between ' + fmt(r.start) + ' and ' + fmt(r.end) + '.']
    ];
    var cost = '<table class="breakdown"><tbody>' +
      '<tr><td>If your home is ready 2 months early: break the lease</td><td>' + (isNaN(r.fee) ? 'Check your lease' : money(r.fee)) + '</td></tr>' +
      '<tr><td>If your home is ready 2 months early: keep paying rent</td><td>' + money(early) + '</td></tr>' +
      '<tr><td>If your home is ready 2 months late: go month-to-month</td><td>' + (isNaN(lateM2M) ? 'Ask your landlord' : money(lateM2M)) + '</td></tr></tbody></table>';
    var cheaper = isNaN(r.fee) ? '' : Math.abs(r.fee - early) < 100 ? 'If you close early, breaking the lease and paying the extra rent cost about the same.'
      : r.fee < early ? 'If you close early, breaking the lease costs less than paying two months of rent.' : 'If you close early, paying the extra rent costs less than breaking the lease.';
    return '<h2 style="font-size:34px;margin-bottom:16px">Your full plan</h2><div class="plan-grid"><div>' +
      '<h3>Your dated plan</h3><ol class="plan-timeline">' + steps.map(function (s) { return '<li><b>' + esc(s[0]) + '</b><span>' + esc(s[1]) + '</span></li>'; }).join('') + '</ol>' +
      '<h3 style="margin-top:24px">What a miss would cost</h3>' + cost + (cheaper ? '<p style="margin-top:10px">' + cheaper + '</p>' : '') + '</div><div>' +
      '<div class="plan-box"><h3>Homes that fit your window</h3><p>' + (r.stage === 'ready'
        ? '<a href="/move-in-ready/">See move-in ready homes</a>. They\'re finished or almost finished, updated every Monday.'
        : 'Collins Ridge has homes being built and homes that haven\'t started yet. <a href="/collins-ridge/">See Collins Ridge</a>, or <a href="/move-in-ready/">see move-in ready homes</a>.') + '</p></div>' +
      lenderBox() +
      '<div class="plan-box"><h3>Watch out for</h3><p>Build dates can move. Don\'t give notice on your lease until your closing date is firm.</p></div></div></div>' +
      nextLinks('<a class="next-path" href="/plan/buying-power/"><span class="who">What can you afford?</span><b>Buying Power Estimate</b></a>');
  }
  function ltkSummary(r) {
    return 'Tool: Lease-to-Keys Planner\nResult: window ' + fmt(r.start) + ' to ' + fmt(r.end) + ', ' + STAGE[r.stage][0] +
      '\nNumbers: lease ends ' + fmt(r.lease) + (r.move ? ', wants to move ' + fmt(r.move) : '') + ', rent ' + money(r.rent) +
      (isNaN(r.fee) ? '' : ', break fee ' + money(r.fee)) + (r.m2m > 0 ? ', month-to-month ' + money(r.m2m) : '');
  }

  var TOOLS = {
    'two-mortgages': { tool: 'two_mortgages', compute: twoCompute, free: twoFree, full: twoFull, summary: twoSummary },
    'buying-power': { tool: 'buying_power', compute: bpCompute, free: bpFree, full: bpFull, summary: bpSummary },
    'lease-to-keys': { tool: 'lease_to_keys', compute: ltkCompute, free: ltkFree, full: ltkFull, summary: ltkSummary }
  };
  $$(document, '[data-money]').forEach(function (shell) { var cfg = TOOLS[shell.getAttribute('data-money')]; if (cfg) setup(shell, cfg); });
})();
