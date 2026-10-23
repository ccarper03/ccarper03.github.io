// Sell & Buy calculator: four sliders, three ways side by side. Ported from the home-to-sell-planner repo (Oct 18, 2026).
// Nothing a visitor enters leaves the page unless they text it.
(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var PROGRAM_CLOSING = 1850;   // example program's estimated loan closing costs
  var PROGRAM_LTV = 0.75;       // example program: total debt on the home up to 75% of its value
  var PREP = 0.5;               // months to get the old home ready after moving out (way 2)

  var money = function (n) {
    var r = Math.abs(n) >= 10000 ? Math.round(n / 1000) * 1000 : Math.round(n / 100) * 100;
    return (r < 0 ? '-$' : '$') + Math.abs(r).toLocaleString('en-US');
  };
  var exact = function (n) { return '$' + Math.round(n).toLocaleString('en-US'); };
  var months = function (n) { var r = Math.round(n * 2) / 2; return r + (r === 1 ? ' month' : ' months'); };
  var setHTML = function (id, h) { var el = $(id); if (el.innerHTML !== h) el.innerHTML = h; };
  var fill = function (el) {
    var min = +el.min, max = +el.max, v = +el.value;
    el.style.setProperty('--p', (max > min ? (v - min) / (max - min) * 100 : 0) + '%');
  };

  var ids = ['cValue', 'cOwed', 'cPay', 'cMove', 'cSell', 'cCost', 'cFee'];
  var state = {};

  function moveText(t) {
    if (t <= 2) return 'A finished home. Close in a month or two.';
    if (t <= 5) return 'A home that’s already going up.';
    return 'Not started yet. Building takes several months.';
  }

  function render() {
    var owed = $('cOwed');
    var V = +$('cValue').value;
    if (+owed.max !== V) owed.max = V;
    if (+owed.value > V) owed.value = V;
    var P = +owed.value, M = +$('cPay').value, T = +$('cMove').value;
    var S = +$('cSell').value, C = +$('cCost').value, F = +$('cFee').value;
    var prog = $('cProg').checked;
    state = { V: V, P: P, T: T, prog: prog };

    ids.forEach(function (id) { fill($(id)); });
    $('oValue').textContent = exact(V);
    $('oOwed').textContent = exact(P);
    $('oPay').textContent = exact(M);
    $('oMove').textContent = 'About ' + months(T);
    $('moveHint').textContent = moveText(T);
    $('oSell').textContent = months(S);
    $('oCost').textContent = C + '%';
    $('oFee').textContent = F + '%';
    $('cValue').setAttribute('aria-valuetext', exact(V));
    owed.setAttribute('aria-valuetext', exact(P));
    $('cPay').setAttribute('aria-valuetext', exact(M) + ' a month');
    $('cMove').setAttribute('aria-valuetext', 'About ' + months(T));
    $('cSell').setAttribute('aria-valuetext', months(S));
    $('cCost').setAttribute('aria-valuetext', C + ' percent');
    $('cFee').setAttribute('aria-valuetext', F + ' percent');

    var equity = V - P;
    var Y = V * (1 - C / 100) - P;           // cash a sale leaves after selling costs
    var room = Math.max(0, V * PROGRAM_LTV - P);
    $('rEquity').textContent = money(equity);
    $('rNet').textContent = money(Y);
    $('rNetNote').textContent = Y < 0 ? 'You’d bring about ' + money(-Y) + ' to closing.' : 'What a sale could leave you, before anything else.';
    $('rTap').textContent = money(room);

    // Way 1: sell first. List now, sold in S months, new home ready in T.
    var gap = T - S, w1, x1, m1, l1 = money(Y);
    if (gap > 1) {
      m1 = '2'; x1 = 'Rent for about ' + months(gap) + '<small>Or stay with family</small>'; l1 = money(Y) + '<small>Before rent</small>';
      w1 = 'If you list now, you’d be between homes for about ' + months(gap) + '. Pick a home that’s ready sooner, or list later in the build to shrink the gap.';
    } else if (gap > 0) {
      m1 = '1'; x1 = 'A few weeks of rent-back<small>You rent your old home back from your buyer</small>';
      w1 = 'Ask your buyer for a rent-back. It lets you stay a few weeks after your sale closes.';
    } else {
      m1 = '1'; x1 = '$0';
      w1 = 'Your home needs about ' + months(S) + ' to sell, so the new home could be ready first. With this way you buy after you sell, so pick a home that’s ready a little later.';
    }
    setHTML('m1', m1); setHTML('t1', 'None'); setHTML('x1', x1); setHTML('l1', l1);
    setHTML('w1', w1); $('w1').classList.toggle('warn', gap > 1 || gap <= 0);

    // Way 2: buy first. Move at T, prep, then S months to sell.
    var N = PREP + S, pay = M * N, w2, x2, l2, t2, warn2 = false;
    if (!prog) {
      setHTML('how2', 'Close on your new home and move once. Then sell your old home empty.');
      t2 = 'About ' + months(N);
      x2 = money(pay) + '<small>In house payments, from your pocket</small>';
      l2 = money(Y - pay);
      setHTML('fit2', '<b>Good fit if</b> you can carry both payments and want one move.');
      w2 = 'Your lender has to qualify you with both payments. If your home sells slower, add about ' + money(M) + ' for each extra month.';
    } else {
      var fee = V * F / 100, cost = fee + PROGRAM_CLOSING + pay;
      setHTML('how2', 'A program lends against your equity, so you buy now, move once, and sell your old home empty.');
      t2 = 'About ' + months(N) + '<small>Paid from your equity, not your pocket</small>';
      x2 = money(cost) + '<small>' + money(fee) + ' fee, about $1,850 in closing costs, ' + money(pay) + ' in payments</small>';
      l2 = money(Y - cost);
      setHTML('fit2', '<b>Good fit if</b> you have solid equity and want one move with no deadline.');
      if (V < 150000 || room < 25000) {
        warn2 = true;
        w2 = 'At these numbers there may not be enough equity. The example program caps what you owe, plus its loan, at 75% of your home’s value.';
      } else {
        w2 = 'You could tap up to about ' + money(room) + ' before you sell. ' + (N > 6
          ? 'Your sale runs past 6 months, when the example program’s interest-free period ends and its offer to buy your home kicks in.'
          : 'The example program charges no interest for 6 months, and backs you with an offer to buy your home if it hasn’t sold by then.');
      }
    }
    setHTML('m2', '1'); setHTML('t2', t2); setHTML('x2', x2); setHTML('l2', l2);
    setHTML('w2', w2); $('w2').classList.toggle('warn', warn2);

    // Way 3: home-sale contingency. List now; the sale has T months to land.
    var cushion = T - S, w3;
    if (cushion >= 1) w3 = 'If you list now, your home has about ' + months(cushion) + ' of cushion to sell before move-in. The new home stays on the market while you sell, and another buyer can still make an offer.';
    else if (cushion >= 0) w3 = 'Tight. Your home would need to sell right on time. If another buyer makes an offer on your new home first, you get a short window to drop the contingency.';
    else w3 = 'Your home needs about ' + months(S) + ' to sell, but you want to move in about ' + months(T) + '. This way works better with a home that’s ready later.';
    setHTML('m3', '1'); setHTML('t3', 'None'); setHTML('x3', '$0'); setHTML('l3', money(Y));
    setHTML('w3', w3); $('w3').classList.toggle('warn', cushion < 1);

    updateTexts();
  }

  var WAY = {
    1: 'Way 1 (sell first, then buy) looks closest.',
    2: 'Way 2 (buy first, then sell) looks closest.',
    '2p': 'Way 2 (buy first with a buy-before-you-sell program) looks closest.',
    3: 'Way 3 (buy with a home-sale contingency) looks closest.'
  };
  function smsBody(way) {
    var s = state;
    var base = 'Hi Charles, I ran your sell-and-buy calculator. My home might sell for about ' + exact(s.V) + ', I owe about ' + exact(s.P) +
      ', and I’d like to move in about ' + months(s.T) + '.';
    if (way === '0') return base + ' Can you help me figure out which way fits?';
    var key = way === '2' && s.prog ? '2p' : way;
    return base + ' ' + WAY[key] + ' Can you check my numbers?';
  }
  function updateTexts() {
    document.querySelectorAll('a[data-way]').forEach(function (a) {
      var body = smsBody(a.getAttribute('data-way'));
      a.setAttribute('data-sms-body', body);
      a.setAttribute('href', 'sms:+19843282788?&body=' + encodeURIComponent(body));
    });
  }


  // The planner above says which way fits best. Highlight that card.
  var WAYMAP = { buyfirst: '2', bridge: '2p', sellfirst: '1', together: '1', contingency: '3' };
  window.addEventListener('cc:path', function (e) {
    var w = WAYMAP[(e.detail || {}).path];
    document.querySelectorAll('[data-way-card]').forEach(function (c) { c.classList.remove('best'); var b = c.querySelector('.best-tag'); if (b) b.remove(); });
    if (!w) return;
    if (w === '2p') { $('cProg').checked = true; render(); w = '2'; }
    var card = document.querySelector('[data-way-card="' + w + '"]');
    if (card) { card.classList.add('best'); var t = document.createElement('p'); t.className = 'badge badge-ready best-tag'; t.textContent = 'Your best fit'; card.insertBefore(t, card.firstChild); }
  });
  var touched = false;
  var onInput = function () {
    render();
    if (!touched) { touched = true; if (window.ccTrack) window.ccTrack('calculator_use', { tool: 'sell_and_buy' }); }
  };
  ids.forEach(function (id) { $(id).addEventListener('input', onInput); });
  $('cProg').addEventListener('change', function () {
    onInput();
    if (window.ccTrack) window.ccTrack('calculator_program', { on: $('cProg').checked ? 'yes' : 'no' });
  });
  render();
})();
