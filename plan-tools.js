// charlescarper.com: the Sell & Buy Planner (/plan/sell-and-buy/) and the Floor Plan Match (/plan/floor-plan-match/).
// Nothing a visitor taps is sent anywhere unless they ask for their full plan (forms.js ccGate) or text it.
// Analytics get only the step number and the result type, never the answers.
(function (root) {
  'use strict';

  var PHONE = '+19843282788', PHONE_SHOW = '984-328-2788';
  var HS_URL = 'https://api.hsforms.com/submissions/v3/integration/submit/247617862/0b4dc486-9d8e-4e91-a9a2-37f231108f90';

  // ---------------------------------------------------------------------------
  // Moving Plan: questions
  // ---------------------------------------------------------------------------
  var TIMING_OPTS = [
    { v: 'soon', c: 's', label: 'Within 3 months' },
    { v: 'mid', c: 'm', label: '3 to 6 months' },
    { v: 'later', c: 'l', label: '6 to 12 months' },
    { v: 'flexible', c: 'f', label: "I'm flexible" }
  ];
  var LOAN_OPTS = [
    { v: 'none', c: 'n', label: "I haven't talked to one yet" },
    { v: 'prequal', c: 'q', label: "I'm prequalified" },
    { v: 'preapproved', c: 'a', label: "I'm preapproved" }
  ];
  var BUYER_PRIORITY = [
    { v: 'timing', c: 't', label: 'Lining up the move with my timing' },
    { v: 'payment', c: 'p', label: 'A monthly payment I feel good about' },
    { v: 'choice', c: 'c', label: 'Having more homes to pick from' },
    { v: 'easy', c: 'e', label: 'Keeping it simple' }
  ];
  var OWNER_PRIORITY = [
    { v: 'once', c: 'o', label: 'Moving only once' },
    { v: 'certain', c: 'c', label: 'Knowing it will work' },
    { v: 'money', c: 'm', label: 'Getting the most for my home' },
    { v: 'easy', c: 'e', label: 'Least hassle' }
  ];

  var MP_STEPS = [
    { id: 'living', q: 'Do you own or rent now?',
      why: 'This shapes the whole plan. Your answers stay on your screen.',
      opts: [
        { v: 'own_sell', c: 's', label: "I own, and I'd sell it to buy" },
        { v: 'own_keep', c: 'k', label: "I own, and I'd keep it" },
        { v: 'rent', c: 'r', label: 'I rent' },
        { v: 'other', c: 'o', label: 'Something else: family, base housing, between moves' }
      ] },
    { id: 'sale', when: function (a) { return a.living === 'own_sell'; },
      q: 'Where is your home in the selling process?',
      why: 'The further along your sale is, the more options open up.',
      opts: [
        { v: 'not_started', c: 'n', label: "I haven't started" },
        { v: 'prepping', c: 'p', label: 'Getting it ready to list' },
        { v: 'listed', c: 'l', label: "It's listed" },
        { v: 'contract', c: 'c', label: "It's under contract" }
      ] },
    { id: 'carry', when: function (a) { return a.living === 'own_sell'; },
      q: 'Could you pay two house payments for a few months?',
      why: "Buying first works well for a lot of people. A lender counts your current house payment until your home is sold, or under contract with your buyer’s loan approved.",
      opts: [
        { v: 'yes', c: 'y', label: 'Yes, I could pay both for a few months' },
        { v: 'unsure', c: 'u', label: "Maybe. I haven't asked a lender yet" },
        { v: 'need_sale', c: 'n', label: 'No. I need the money from my sale first' }
      ] },
    { id: 'agent', when: function (a) { return a.living === 'own_sell'; },
      q: 'Do you have a listing agent yet?',
      why: "I don't list homes. A good listing agent and I can line up your sale with the build.",
      opts: [
        { v: 'yes', c: 'y', label: 'Yes' },
        { v: 'no', c: 'n', label: 'Not yet' }
      ] },
    { id: 'keep_use', when: function (a) { return a.living === 'own_keep'; },
      q: 'What would you do with your current home?',
      why: 'If you rent it out, some lenders can count that rent when you qualify.',
      opts: [
        { v: 'rent_out', c: 'r', label: 'Rent it out' },
        { v: 'family', c: 'f', label: 'Keep it for family or as a second home' },
        { v: 'unsure', c: 'u', label: 'Not sure yet' }
      ] },
    { id: 'keep_carry', when: function (a) { return a.living === 'own_keep'; },
      q: 'Could you qualify with both payments?',
      why: 'Keeping your home means a lender looks at both payments at once.',
      opts: [
        { v: 'yes', c: 'y', label: 'Yes, I think so' },
        { v: 'need_rent', c: 'r', label: 'Only if the lender counts the rent' },
        { v: 'unsure', c: 'u', label: "Not sure. I haven't asked a lender" }
      ] },
    { id: 'lease', when: function (a) { return a.living === 'rent'; },
      q: 'When does your lease end?',
      why: 'Your lease date picks which homes fit: move-in ready, being built or not started yet.',
      opts: [
        { v: 'soon', c: 's', label: 'Within 3 months' },
        { v: 'mid', c: 'm', label: '3 to 6 months' },
        { v: 'later', c: 'l', label: '6 to 12 months' },
        { v: 'flexible', c: 'f', label: 'Month to month, or I can work around it' }
      ] },
    { id: 'timing', when: function (a) { return a.living !== 'rent'; },
      q: 'When do you want to be moved in?',
      why: 'A home that’s move-in ready, being built or not started yet. Your timing picks the one that fits.',
      opts: TIMING_OPTS },
    { id: 'loan', when: function (a) { return a.living === 'rent' || a.living === 'other'; },
      q: 'Where are you with a lender?',
      why: 'No wrong answer. It just tells me where your first step is.',
      opts: LOAN_OPTS },
    { id: 'priority', q: 'What matters most to you?',
      why: 'Pick the one you’d protect if something had to give.',
      opts: function (a) { return (a.living === 'own_sell' || a.living === 'own_keep') ? OWNER_PRIORITY : BUYER_PRIORITY; } }
  ];

  function optsFor(step, a) { return typeof step.opts === 'function' ? step.opts(a) : step.opts; }
  function activeSteps(steps, a) { return steps.filter(function (s) { return !s.when || s.when(a); }); }
  function labelOf(steps, id, v, a) {
    var s = steps.filter(function (x) { return x.id === id; })[0]; if (!s) return '';
    var o = optsFor(s, a).filter(function (x) { return x.v === v; })[0]; return o ? o.label : '';
  }

  // ---------------------------------------------------------------------------
  // Moving Plan: the plan
  // ---------------------------------------------------------------------------
  var STAGE = {
    ready: { name: 'Move-in ready', text: 'a home that’s move-in ready or almost done' },
    building: { name: 'Being built', text: 'a home that’s already being built' },
    starting: { name: 'Not started yet', text: 'a home that hasn’t started yet (plan on several months to build)' },
    any: { name: 'Any of the three', text: 'whichever home you like best: move-in ready, being built or not started yet' }
  };
  function stageFromTiming(t, flexDefault) {
    return t === 'soon' ? 'ready' : t === 'mid' ? 'building' : t === 'later' ? 'starting' : (flexDefault || 'any');
  }

  var SELL_PATHS = {
    lineup: {
      title: 'Line up your two closings.',
      sum: 'Your home is under contract, so pick a new home that can close near your sale date.',
      backup: 'Line up your two closings around the sale you already have.',
      serves: ['once', 'certain', 'money', 'easy'],
      watch: 'If your buyer’s loan falls through, your timing goes with it. Keep both lenders talking until both closings are done.'
    },
    buyfirst: {
      title: 'Buy first, then sell.',
      sum: 'You can carry both payments, so buy the home that fits and sell yours after you move.',
      backup: 'Buy first and sell after you move, if a lender confirms you can carry both payments.',
      serves: ['once', 'easy'],
      watch: 'Your home could take longer to sell than you expect. Know how many months of two payments you can carry before you start.'
    },
    together: {
      title: 'Line up both closings with a home that hasn’t started yet.',
      sum: 'Pick a home early in the build. Sell yours while it goes up. Aim both closings at the same week and move once.',
      backup: 'Pick a home that hasn’t started yet, sell yours during the build, and close both the same week.',
      serves: ['once', 'money', 'certain'],
      watch: 'Build dates move. Weather, inspections and materials can push them. Leave a few weeks of room, and know where you’d stay if the dates split.'
    },
    bridge: {
      title: 'Use your equity to buy before you sell.',
      sum: 'A bridge loan or a buy-before-you-sell program can let you use the equity in your home to buy first and move once.',
      backup: 'A bridge loan or buy-before-you-sell program, so your equity does the work and you move once.',
      serves: ['once', 'easy'],
      watch: 'These come with fees, equity rules and qualifying requirements, and terms change. Get real quotes in writing and compare them to selling first.'
    },
    sellfirst: {
      title: 'Sell first, then buy with your money in hand.',
      sum: 'Sell your home first. Then buy a home that’s move-in ready, with the money from your sale already in hand.',
      backup: 'Sell first, ask your buyer for a rent-back, and buy a home that’s move-in ready.',
      serves: ['certain', 'money'],
      watch: 'If you sell before your next home is lined up, you might move twice. A rent-back from your buyer, or a home that’s move-in ready, keeps that gap short.'
    },
    contingency: {
      title: 'Buy with a home-sale contingency.',
      sum: 'Put the new home under contract, tied to selling yours by a deadline.',
      backup: 'A home-sale contingency, if the builder accepts one. Ask about the rules first: often the home stays on the market while you sell.',
      serves: ['certain'],
      watch: 'Builders that accept these usually attach rules. Often the new home stays on the market, and if another buyer comes along, you get a short window to drop the contingency.'
    }
  };

  var OWNER_PRIORITY_SAY = { once: 'moving only once', certain: 'knowing it will work', money: 'getting the most for your home', easy: 'keeping it simple' };
  var WHEN_SAY = { soon: 'within 3 months', mid: 'in 3 to 6 months', later: 'in 6 to 12 months' };

  function scoreSellPaths(a) {
    var s = { lineup: 0, buyfirst: 0, together: 0, bridge: 0, sellfirst: 0, contingency: -6 };
    if (a.sale === 'contract') s.lineup += 100;
    if (a.carry === 'yes') { s.buyfirst += 50; s.together += 10; }
    if (a.carry === 'need_sale') { s.together += 20; s.bridge += 15; s.sellfirst += 15; s.contingency += 5; }
    if (a.carry === 'unsure') { s.together += 15; s.bridge += 10; s.sellfirst += 10; s.buyfirst += 5; }
    if (a.timing === 'soon') { s.bridge += 15; s.sellfirst += 10; s.together -= 30; s.contingency += 5; }
    if (a.timing === 'mid') { s.together += 5; s.bridge += 10; s.sellfirst += 5; }
    if (a.timing === 'later') { s.together += 20; }
    if (a.timing === 'flexible') { s.together += 20; s.sellfirst += 5; }
    if (a.sale === 'not_started') { s.sellfirst -= 5; s.together += 5; }
    if (a.sale === 'prepping') { s.together += 5; }
    if (a.sale === 'listed') { s.sellfirst += 10; s.contingency += 10; s.bridge += 5; }
    if (a.priority === 'once') { s.together += 10; s.bridge += 15; s.buyfirst += 10; s.sellfirst -= 15; }
    if (a.priority === 'certain') { s.sellfirst += 15; s.buyfirst -= 5; s.contingency -= 10; s.together += 5; }
    if (a.priority === 'money') { s.sellfirst += 15; s.together += 10; s.bridge -= 10; }
    if (a.priority === 'easy') { s.bridge += 15; s.buyfirst += 5; }
    if (a.sale !== 'contract') s.lineup = -999;
    if (a.carry !== 'yes' && a.sale !== 'contract') s.buyfirst -= 20;
    var order = Object.keys(s).sort(function (x, y) { return s[y] - s[x] || x.localeCompare(y); });
    return { primary: order[0], backup: order[1], scores: s };
  }

  function sellStage(path, a) {
    if (path === 'together') return a.timing === 'mid' ? 'building' : 'starting';
    if (path === 'sellfirst') return a.timing === 'later' || a.timing === 'flexible' ? 'building' : 'ready';
    if (path === 'lineup') return a.timing === 'soon' || a.timing === 'flexible' ? 'ready' : stageFromTiming(a.timing);
    if (path === 'bridge') return stageFromTiming(a.timing, 'building');
    return stageFromTiming(a.timing, 'building');
  }

  function sellSteps(path, a, stage) {
    var st = STAGE[stage].text, steps = [];
    var lender = { when: 'This week', what: 'Talk to a lender. Ask how they’d count your current house payment, and get preapproved with your sale built into the plan.' };
    var ready = a.sale === 'listed' ? { when: 'Now', what: 'Keep it listed and priced to sell inside your window.' }
      : { when: 'Now', what: 'Get your home ready to list: small repairs, declutter, photos. A listing agent can tell you what’s worth fixing.' };
    if (path === 'together') {
      steps.push(lender);
      steps.push({ when: 'Month 1', what: 'Pick ' + st + '. Sign, and the build starts.' });
      if (a.sale === 'listed') steps.push({ when: 'During the build', what: 'Keep your home listed and priced to sell before the new one is done.' });
      else {
        steps.push({ when: 'Months 1 to 3', what: 'Get your home ready to list while the new one goes up.' });
        steps.push({ when: 'About halfway', what: 'List your home. That leaves time to sell and close before move-in.' });
      }
      steps.push({ when: 'Under contract', what: 'Ask your buyer for a short rent-back. It gives you a cushion if the build runs late.' });
      steps.push({ when: 'Move-in', what: 'Close on both, the same week if you can. Move once.' });
    } else if (path === 'buyfirst') {
      steps.push({ when: 'This week', what: 'Ask your lender to confirm you qualify with both payments, and decide how many months of both you’re comfortable carrying.' });
      steps.push({ when: 'Next', what: 'Pick ' + st + '.' });
      steps.push({ when: 'Before you close', what: a.sale === 'listed' ? 'Keep your home listed.' : 'Get your current home ready to list.' });
      steps.push({ when: 'After you move', what: 'Sell your old home empty. Empty homes show well and are easy to schedule.' });
      steps.push({ when: 'Until it sells', what: 'You carry both payments. Know your number before you start.' });
    } else if (path === 'bridge') {
      steps.push({ when: 'This week', what: 'Ask your lender about a bridge loan, and compare a buy-before-you-sell program. Get the fees and rules in writing.' });
      steps.push({ when: 'Next', what: 'Pick ' + st + '.' });
      steps.push({ when: 'Closing', what: 'Close on the new home using the equity in your current one. Move once.' });
      steps.push({ when: 'After you move', what: 'Sell your old home empty. The sale pays off the bridge.' });
    } else if (path === 'sellfirst') {
      steps.push({ when: 'This week', what: 'Talk to a lender and a listing agent. Know your numbers on both sides before you list.' });
      steps.push(a.sale === 'listed' ? { when: 'Now', what: 'Keep your home listed. Price it to sell, not to sit.' } : { when: 'Month 1', what: 'List your home.' });
      steps.push({ when: 'Under contract', what: 'Ask your buyer for a rent-back, so you can stay a few weeks after your closing.' });
      steps.push({ when: 'Then', what: 'Pick ' + st + ' and close with the money from your sale in hand.' });
      steps.push({ when: 'If there’s a gap', what: 'Plan a short stay: family, a short-term rental or a longer rent-back.' });
    } else if (path === 'lineup') {
      steps.push({ when: 'This week', what: 'Text me your closing date. I’ll show you homes that can close near it.' });
      steps.push({ when: 'Next', what: 'Talk to a lender with your sale contract in hand. Once your buyer’s loan is approved, many lenders can leave your current payment out. Ask yours.' });
      steps.push({ when: 'Pick', what: 'Pick a home that can close near your sale date. That usually means ' + STAGE[stage].text.split(' (')[0] + '.' });
      steps.push({ when: 'If the dates don’t match', what: 'Ask your buyer for a rent-back, or plan a short stay.' });
    }
    return steps;
  }

  function sellWhy(path, a, stage) {
    var w = [];
    var sale = { not_started: 'Your home isn’t listed yet, so you have time to get it ready.',
      prepping: 'You’re getting your home ready, so you’re close to listing.',
      listed: 'Your home is already on the market.',
      contract: 'Your home is under contract. That’s the hardest part done.' }[a.sale];
    var carry = { yes: 'You can carry both payments, so you don’t have to wait on your sale.',
      need_sale: 'You need the money from your sale, so it has to close before or with your purchase.',
      unsure: 'You haven’t asked a lender yet. That answer decides a lot, so it’s your first step.' }[a.carry];
    var timing = a.timing === 'flexible' ? 'Your timing is flexible, so a home that’s ' + STAGE[stage].name.toLowerCase() + ' gives you room.'
      : 'You want to move ' + WHEN_SAY[a.timing] + '. That fits ' + STAGE[stage].text.split(' (')[0] + '.';
    w.push(sale); w.push(carry); w.push(timing);
    var p = SELL_PATHS[path], plabel = OWNER_PRIORITY_SAY[a.priority];
    if (p.serves.indexOf(a.priority) >= 0) w.push(cap(plabel) + ' matters most to you, and this path puts that first.');
    else w.push('You said ' + plabel + ' matters most. This path may give a little on that, so look at the backup below too.');
    return w;
  }

  function sellLender(path, a) {
    var q = [];
    if (a.carry !== 'yes' && path !== 'lineup') q.push('Can I qualify with both payments? If not, what changes once my home is under contract?');
    if (path === 'bridge') q.push('Do you offer a bridge loan? How would it count when I qualify, and what does it cost?');
    if (path === 'together') q.push('How long can I lock my rate on a home that’s several months out, and what does that cost?');
    if (path === 'sellfirst') q.push('Can I get preapproved now, based on the money I expect from my sale?');
    if (path === 'buyfirst') q.push('How many months of both payments does my approval assume I can handle?');
    if (path === 'lineup') q.push('Once my buyer’s loan is approved, will you leave my current payment out when I qualify?');
    q.push('What will my cash to close be, and how much of it has to come from my sale?');
    if (q.length < 3) q.push('Is there anything in my credit or income I should fix before I apply?');
    return q.slice(0, 3);
  }

  function planOwnerSell(a) {
    var r = scoreSellPaths(a), path = r.primary, stage = sellStage(path, a), p = SELL_PATHS[path];
    var backup = path === 'lineup' ? 'If your sale falls through, a bridge loan or a home-sale contingency can keep your new home on track. Ask about both before you sign.' : SELL_PATHS[r.backup].backup;
    return {
      type: 'sell-' + path, kicker: 'Your path', title: p.title, summary: p.sum, stage: stage,
      why: sellWhy(path, a, stage), steps: sellSteps(path, a, stage), watch: p.watch,
      backup: backup, lender: sellLender(path, a)
    };
  }

  function planOwnerKeep(a) {
    var stage = stageFromTiming(a.timing, 'building');
    var steps = [
      { when: 'This week', what: a.keep_use === 'rent_out' ? 'Ask your lender if they can count rent from your current home, and what they need to see. Many want a signed lease and proof of the deposit.' : 'Ask your lender to confirm you qualify with both full payments.' },
      { when: 'Next', what: 'Pick ' + STAGE[stage].text + '.' }
    ];
    if (a.keep_use === 'rent_out') steps.push({ when: 'Before you close', what: 'Line up a tenant, or a property manager if you don’t want to be a landlord yourself.' });
    steps.push({ when: 'Closing', what: 'Move in. Your old home stays yours.' });
    var why = [
      { rent_out: 'You’d rent your current home out, so it can keep working for you.', family: 'You’d keep your current home for family or as a second home.', unsure: 'You’re not sure yet what you’d do with your current home. That’s fine. Your lender’s answer will help you decide.' }[a.keep_use],
      { yes: 'You think you can qualify with both payments. Get that confirmed first.', need_rent: 'You’d need the lender to count the rent. That’s the first thing to check.', unsure: 'You haven’t asked a lender yet. That answer decides this plan.' }[a.keep_carry],
      a.timing === 'flexible' ? 'Your timing is flexible, so you can pick the home first.' : 'Your timing fits ' + STAGE[stage].text.split(' (')[0] + '.'
    ];
    return {
      type: 'keep', kicker: 'Your path', title: 'Buy first, and keep your home.',
      summary: 'Keep your current home and buy the new one. The whole plan rests on one thing: qualifying with both payments.',
      stage: stage, why: why, steps: steps,
      watch: 'If the lender can’t count the rent, you’ll need to qualify with both full payments. Check that before you fall for a home.',
      backup: 'If the numbers don’t work, selling may. Take the planner again and pick “I’d sell it.”',
      lender: ['Will you count rent from my current home? What do you need to see?', 'Can I qualify with both payments if you don’t count the rent?', 'How much do I need in savings with two homes?']
    };
  }

  function planBuyer(a) {
    var renter = a.living === 'rent', t = renter ? a.lease : a.timing;
    var stage = stageFromTiming(t, 'any');
    var steps = [];
    steps.push({ when: 'This week', what: {
      none: 'Talk to a lender. Get prequalified first, then preapproved before you pick a home.',
      prequal: 'Turn your prequalification into a preapproval. It means sending in your documents.',
      preapproved: 'You’re ready to shop. Ask your lender how long your approval is good for.' }[a.loan] });
    steps.push({ when: 'Next', what: 'Pick ' + STAGE[stage].text + '.' });
    if (renter) steps.push({ when: 'Before your lease ends', what: 'Give notice the way your lease requires, but not until your closing date is firm. Build dates can move.' });
    else steps.push({ when: 'Before you move', what: 'Plan where your things go and when, so moving day is the only day that matters.' });
    steps.push({ when: 'Closing', what: 'Final walkthrough, sign, and get your keys.' });

    var title = stage === 'any' ? 'Pick the home first. Your timing has room.'
      : renter ? 'Line up your move with your lease.' : 'Pick the home that fits your timing.';
    var summary = stage === 'any' ? 'Since your timing is flexible, you can pick from homes that are move-in ready, being built or not started yet.'
      : 'Your timing points to ' + STAGE[stage].text + '. That keeps your move and your ' + (renter ? 'lease' : 'plans') + ' lined up.';
    var why = [
      renter ? (a.lease === 'flexible' ? 'Your lease is flexible, so you can move when the right home is ready.' : 'Your lease ends ' + WHEN_SAY[a.lease] + '.')
        : (a.timing === 'flexible' ? 'Your timing is flexible, so you can pick the home first.' : 'You want to move ' + WHEN_SAY[a.timing] + '.'),
      { none: 'You haven’t talked to a lender yet, so that’s step one.', prequal: 'You’re prequalified, so a preapproval is the next step.', preapproved: 'You’re preapproved, so you can move fast when you find the one.' }[a.loan],
      { timing: 'Timing matters most to you, so the plan is built around your date.', payment: 'A payment you feel good about matters most. Ask your lender for the payment they’d recommend, not just the most you qualify for.', choice: 'More choice matters most to you. A little flexibility on timing opens up the most homes.', easy: 'You want it simple. Fewer moving parts is the goal.' }[a.priority]
    ];
    var watch = renter && a.lease === 'soon' && a.loan === 'none'
      ? 'Three months is tight if you haven’t talked to a lender. Start there this week, and look at move-in ready homes.'
      : renter ? 'Don’t give notice on your lease until your closing date is firm. Build dates move.'
      : 'Build dates move. If your date is firm, a move-in ready home is the safer pick.';
    var backup = renter && a.lease === 'soon' ? 'If the timing gets tight, ask your landlord about a short month-to-month extension.'
      : renter ? 'If a move-in ready home is the one, you could move sooner. Know what it costs to end your lease early first.'
      : 'If the home you love is further out, plan a short stay and pick the home anyway.';
    var lender = ['What monthly payment would you recommend for me, not just the most I qualify for?', 'Are there down payment programs I qualify for?', 'How long is my approval good for, and when should I lock my rate?'];
    if (a.priority === 'payment') lender[2] = 'If the builder offers an incentive, how would it change my payment or my cash to close?';
    return { type: renter ? 'rent' : 'other', kicker: 'Your path', title: title, summary: summary, stage: stage, why: why, steps: steps, watch: watch, backup: backup, lender: lender };
  }

  function movingPlan(a) {
    if (a.living === 'own_sell') return planOwnerSell(a);
    if (a.living === 'own_keep') return planOwnerKeep(a);
    return planBuyer(a);
  }

  function cap(s) { return s ? s.charAt(0).toUpperCase() + s.slice(1) : s; }

  // ---------------------------------------------------------------------------
  // Floor Plan Match: data (room counts and features only, no drawings)
  // Room counts and features come from the builder's published plan information for Collins Ridge.
  // Size is used only to rank the fit, and is never shown on the page.
  // ---------------------------------------------------------------------------
  var PLANS = [
    { name: 'Cali', type: 'sf', stories: 1, beds: 4, baths: 2, primaryDown: true, guestDown: true, size: 1764,
      f: ['pantry', 'covered', 'vaulted', 'islandSink'], dining: true },
    { name: 'Savannah', type: 'th', stories: 2, beds: 4, baths: 2.5, primaryDown: true, guestDown: true, size: 2240,
      f: ['pantry', 'loft', 'islandSink'], dining: true },
    { name: 'Galen', type: 'sf', stories: 2, beds: 3, baths: 2.5, primaryDown: false, guestDown: false, size: 2340,
      f: ['flex', 'loft', 'pantry', 'islandSink'], dining: false,
      option: { beds: 4, label: 'A 4th bedroom is a builder option in place of the loft.', removes: 'loft' } },
    { name: 'Robie', type: 'sf', stories: 2, beds: 5, baths: 3, primaryDown: false, guestDown: true, size: 2368,
      f: ['flex', 'loft', 'pantry', 'islandSink'], dining: false },
    { name: 'Sierra', type: 'sf', stories: 2, beds: 4, baths: 2.5, primaryDown: true, guestDown: true, size: 2395,
      f: ['upstairs', 'islandSink'], dining: false },
    { name: 'Linville', type: 'th', stories: 2, beds: 4, baths: 3, primaryDown: false, guestDown: true, size: 2439,
      f: ['loft', 'pantry', 'gardenTub', 'islandSink'], dining: true },
    { name: 'Hayden', type: 'sf', stories: 2, beds: 5, baths: 3, primaryDown: false, guestDown: true, size: 2511,
      f: ['flex', 'loft', 'pantry', 'islandSink'], dining: false },
    { name: 'Alec', type: 'sf', stories: 2, beds: 4, baths: 3, primaryDown: false, guestDown: true, size: 2518, rear: true,
      f: ['loft', 'pantry', 'tray', 'covered', 'islandSink'], coveredBySite: true, dining: false },
    { name: 'Landon', type: 'sf', stories: 2, beds: 4, baths: 3, primaryDown: false, guestDown: true, size: 2570,
      f: ['upstairs', 'pantry', 'gardenTub', 'islandSink'], dining: false },
    { name: 'Calhoun', type: 'sf', stories: 2, beds: 4, baths: 3.5, primaryDown: true, dualPrimary: true, guestDown: true, size: 2628, rear: true,
      f: ['dining', 'pantry', 'tray', 'gardenTub', 'covered', 'islandSink'], coveredBySite: true, dining: true },
    { name: 'Jackson', type: 'sf', stories: 2, beds: 5, baths: 3, primaryDown: false, guestDown: true, size: 2637, rear: true,
      f: ['dining', 'pantry', 'butler', 'tray', 'covered', 'islandSink'], coveredBySite: true, dining: true },
    { name: 'Hanover', type: 'sf', stories: 2, beds: 4, baths: 2.5, primaryDown: false, guestDown: false, size: 2804,
      f: ['flex', 'loft', 'pantry'], dining: false,
      option: { beds: 5, label: 'A 5th bedroom with its own bath is a builder option in place of the flex room.', removes: 'flex', guestDown: true } }
  ];

  var FP_STEPS = [
    { id: 'stories', q: 'One story or two?', why: 'Where the primary bedroom sits changes how a home lives day to day.',
      opts: [
        { v: 'one', c: 'o', label: 'One story. Everything on one floor' },
        { v: 'main', c: 'm', label: 'Two is fine, with the primary bedroom on the main floor' },
        { v: 'two', c: 't', label: 'Two stories is fine' },
        { v: 'any', c: 'a', label: 'No preference' }
      ] },
    { id: 'beds', q: 'How many bedrooms do you need?', why: 'Need an office with a door? Count it here, or pick it on the next step.',
      opts: [ { v: '3', c: '3', label: '3' }, { v: '4', c: '4', label: '4' }, { v: '5', c: '5', label: '5 or more' } ] },
    { id: 'size', q: 'How big is the home you live in now?',
      why: 'A rough guess is fine. Your tax bill or old listing usually shows it. I use it to compare, and you won’t see a number on the results.',
      opts: [
        { v: 'xs', c: 'a', label: 'Under 1,500 sq ft' }, { v: 's', c: 'b', label: '1,500 to 2,000 sq ft' },
        { v: 'm', c: 'c', label: '2,000 to 2,500 sq ft' }, { v: 'l', c: 'd', label: '2,500 to 3,000 sq ft' },
        { v: 'xl', c: 'e', label: 'Over 3,000 sq ft' }, { v: 'unknown', c: 'u', label: 'Not sure' }
      ],
      also: { id: 'room', q: 'Compared to that, you want:', opts: [
        { v: 'more', c: 'm', label: 'More room' }, { v: 'same', c: 's', label: 'About the same' }, { v: 'less', c: 'l', label: 'Less room' } ] } },
    { id: 'wants', multi: 2, q: 'Pick up to two must-haves.', why: 'Skip anything that’s just nice to have.',
      opts: [
        { v: 'office', c: 'o', label: 'Office or flex room' },
        { v: 'loft', c: 'l', label: 'Loft or upstairs living area' },
        { v: 'guest', c: 'g', label: 'Guest bedroom on the main floor' },
        { v: 'dining', c: 'd', label: 'Separate dining room' },
        { v: 'patio', c: 'p', label: 'Covered patio' },
        { v: 'garage', c: 'r', label: 'Rear-load garage' }
      ] },
    { id: 'type', q: 'Townhome or single-family?', why: 'Both are in the community. It mostly comes down to how much yard you want to keep up.',
      opts: [
        { v: 'sf', c: 's', label: 'Single-family, with my own yard' },
        { v: 'th', c: 't', label: 'Townhome, less yard to keep up' },
        { v: 'either', c: 'e', label: 'Either' }
      ] }
  ];

  var SIZE_MID = { xs: 1350, s: 1750, m: 2250, l: 2750, xl: 3250 };
  var ROOM_BAND = { more: [1.08, 1.5], same: [0.88, 1.12], less: [0.62, 0.94] };
  var WANT_TEXT = { office: 'an office or flex room', loft: 'a loft or upstairs living area', guest: 'a guest bedroom on the main floor',
    dining: 'a separate dining room', patio: 'a covered patio', garage: 'a rear-load garage' };

  function configsOf(p) {
    var list = [{ plan: p, beds: p.beds, option: null, f: p.f.slice(), guestDown: p.guestDown }];
    if (p.option) list.push({ plan: p, beds: p.option.beds, option: p.option, guestDown: p.option.guestDown || p.guestDown,
      f: p.f.filter(function (x) { return x !== p.option.removes; }) });
    return list;
  }
  function hasWant(c, w) {
    var f = c.f;
    if (w === 'office') return f.indexOf('flex') >= 0;
    if (w === 'loft') return f.indexOf('loft') >= 0 || f.indexOf('upstairs') >= 0;
    if (w === 'guest') return !!c.guestDown;
    if (w === 'dining') return f.indexOf('dining') >= 0 || (c.plan.dining && c.plan.type === 'th') || c.plan.name === 'Cali';
    if (w === 'patio') return f.indexOf('covered') >= 0;
    if (w === 'garage') return !!c.plan.rear;
    return false;
  }
  function sizeFit(c, a) {
    if (!a.size || a.size === 'unknown' || !a.room) return null;
    var mid = SIZE_MID[a.size], band = ROOM_BAND[a.room], lo = mid * band[0], hi = mid * band[1], sz = c.plan.size;
    if (sz >= lo && sz <= hi) return { fit: 'in', off: 0 };
    return sz > hi ? { fit: 'over', off: (sz - hi) / hi } : { fit: 'under', off: (lo - sz) / lo };
  }

  function scoreConfig(c, a) {
    var p = c.plan, s = 0, need = parseInt(a.beds || '3', 10), wants = a.wants || [];
    if (a.type === 'sf' && p.type === 'th') s -= 40;
    if (a.type === 'th' && p.type === 'sf') s -= 40;
    if (a.stories === 'one') s += p.stories === 1 ? 40 : (p.primaryDown ? -12 : -45);
    if (a.stories === 'main') s += p.primaryDown ? 25 : (c.guestDown ? -12 : -30);
    if (c.beds < need) s -= 45 + 10 * (need - c.beds);
    else s -= 3 * (c.beds - need);
    if (c.option) s -= 2;
    var sf = sizeFit(c, a);
    if (sf) s += sf.fit === 'in' ? 15 : -Math.min(30, Math.round(sf.off * 100));
    wants.forEach(function (w) { s += hasWant(c, w) ? 12 : -15; });
    return s;
  }

  function matchPlans(a) {
    var best = {};
    PLANS.forEach(function (p) {
      configsOf(p).forEach(function (c) {
        var sc = scoreConfig(c, a);
        if (!best[p.name] || sc > best[p.name].score) best[p.name] = { config: c, score: sc };
      });
    });
    var ranked = Object.keys(best).map(function (k) { return best[k]; })
      .sort(function (x, y) { return y.score - x.score || x.config.plan.size - y.config.plan.size; });
    return ranked.map(function (r) { return describePlan(r.config, a, r.score); });
  }

  var FEATURE_TEXT = { pantry: 'Walk-in pantry', islandSink: 'Sink in the kitchen island', tray: 'Tray ceiling in the primary bedroom',
    vaulted: 'Vaulted ceiling in the primary bedroom', gardenTub: 'Garden tub in the primary bath', butler: 'Butler’s pantry',
    upstairs: 'Upstairs living area', loft: 'Loft', flex: 'Flex room on the main floor', covered: 'Covered patio', dining: 'Separate dining room' };

  function describePlan(c, a, score) {
    var p = c.plan, need = parseInt(a.beds || '3', 10), wants = a.wants || [], fits = [], notes = [];
    var line = (p.type === 'th' ? 'Townhome' : 'Single-family') + ' · ' + (p.stories === 1 ? '1 story' : '2 stories') + ' · ' +
      c.beds + ' bedrooms · ' + p.baths + ' baths';
    if (a.stories === 'one') { if (p.stories === 1) fits.push('Everything on one floor.'); else if (p.primaryDown) notes.push('It’s two stories, but the primary bedroom is on the main floor.'); else notes.push('It’s two stories, with the primary bedroom upstairs.'); }
    if (a.stories === 'main' && p.stories === 1) fits.push('Everything is on one floor, the primary bedroom included.');
    else if (a.stories === 'main') { if (p.primaryDown) fits.push(p.dualPrimary ? 'A primary suite on the main floor, and a second one upstairs.' : 'The primary bedroom is on the main floor.'); else notes.push('The primary bedroom is upstairs' + (c.guestDown ? ', with a bedroom on the main floor.' : '.')); }
    if (c.beds >= need) fits.push(c.beds === need ? 'The ' + need + ' bedrooms you asked for.' : c.beds + ' bedrooms, one more than you asked for.');
    else notes.push('It has ' + c.beds + ' bedrooms, fewer than you asked for.');
    if (c.option) notes.push(c.option.label);
    wants.forEach(function (w) {
      if (hasWant(c, w)) fits.push('Has ' + WANT_TEXT[w] + (w === 'patio' && p.coveredBySite ? ' (on some homesites)' : '') + '.');
      else notes.push('No ' + WANT_TEXT[w] + '.');
    });
    if (a.type === 'th' && p.type === 'sf') notes.push('It’s a single-family home, not a townhome.');
    if (a.type === 'sf' && p.type === 'th') notes.push('It’s a townhome, with less yard than a single-family home.');
    var sf = sizeFit(c, a), sizeWord = null;
    if (sf) {
      sizeWord = sf.fit === 'in' ? 'Close to the size you’re after.'
        : sf.fit === 'over' ? (sf.off > 0.15 ? 'Quite a bit roomier than you asked for.' : 'A little roomier than you asked for.')
        : (sf.off > 0.15 ? 'Smaller than you asked for.' : 'A little smaller than you asked for.');
      (sf.fit === 'in' ? fits : notes).push(sizeWord);
    }
    var extras = c.f.filter(function (x) { return ['pantry', 'islandSink', 'tray', 'vaulted', 'gardenTub', 'butler'].indexOf(x) >= 0; })
      .map(function (x) { return FEATURE_TEXT[x]; });
    if (p.rear) extras.push('Rear-load garage');
    return { name: p.name, line: line, fits: fits, notes: notes, extras: extras, score: score, option: !!c.option };
  }

  // ---------------------------------------------------------------------------
  // Shared helpers: text links, the desktop text panel, HubSpot email, analytics
  // ---------------------------------------------------------------------------
  function smsHref(body) { return 'sms:' + PHONE + '?&body=' + encodeURIComponent(body); }
  // Events go through the shared tracker in site.js (GA4 + Clarity). GA-only fallback if it's missing.
  function track(name, params) {
    if (root.ccTrack) return root.ccTrack(name, params);
    try { if (root.gtag) root.gtag('event', name, params || {}); } catch (e) {}
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (ch) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]; }); }
  var fineMouse = function () { return root.matchMedia && root.matchMedia('(hover: hover) and (pointer: fine)').matches; };

  function encodeAnswers(steps, a) {
    return activeSteps(steps, a).map(function (s) {
      if (s.multi) return s.id + '=' + (a[s.id] || []).map(function (v) { return codeOf(s, a, v); }).join('');
      var out = s.id + '=' + codeOf(s, a, a[s.id]);
      if (s.also) out += ',' + s.also.id + '=' + codeOfOpts(s.also.opts, a[s.also.id]);
      return out;
    }).join(',');
  }
  function codeOf(s, a, v) { return codeOfOpts(optsFor(s, a), v); }
  function codeOfOpts(opts, v) { var o = opts.filter(function (x) { return x.v === v; })[0]; return o ? o.c : ''; }
  function decodeAnswers(steps, str) {
    var a = {}, parts = {};
    (str || '').split(',').forEach(function (kv) { var i = kv.indexOf('='); if (i > 0) parts[kv.slice(0, i)] = kv.slice(i + 1); });
    steps.forEach(function (s) {
      if (!(s.id in parts)) return;
      var opts = optsFor(s, a), code = parts[s.id];
      if (s.multi) a[s.id] = code.split('').map(function (ch) { var o = opts.filter(function (x) { return x.c === ch; })[0]; return o && o.v; }).filter(Boolean);
      else { var o = opts.filter(function (x) { return x.c === code; })[0]; if (o) a[s.id] = o.v; }
      if (s.also && parts[s.also.id]) { var o2 = s.also.opts.filter(function (x) { return x.c === parts[s.also.id]; })[0]; if (o2) a[s.also.id] = o2.v; }
    });
    return a;
  }
  function complete(steps, a) {
    return activeSteps(steps, a).every(function (s) {
      if (s.multi) return Array.isArray(a[s.id]);
      if (s.also && a[s.id] !== 'unknown' && !a[s.also.id]) return false;
      return !!a[s.id];
    });
  }

  // A text link that works on phones and falls back to copy-and-chat on a computer.
  function bindTextLinks(scope) {
    scope.querySelectorAll('a[data-sms-body]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.ccTracked = true; // counted here, so site.js doesn't count it again
        track('click_text', { where: 'tool', label: link.getAttribute('data-track') || '' });
        if (!fineMouse()) return; // phones open Messages with the text filled in
        e.preventDefault(); e.stopPropagation();
        showTextPanel(link.getAttribute('data-sms-body'));
      });
    });
  }
  function showTextPanel(body) {
    if (root.ccTextPanel) return root.ccTextPanel(body);
    var old = document.querySelector('.lead-overlay'); if (old) old.remove();
    var ov = document.createElement('div'); ov.className = 'lead-overlay';
    ov.innerHTML = '<div class="lead-modal" role="dialog" aria-modal="true" aria-labelledby="tp-h">' +
      '<button class="lead-close x-close" type="button" aria-label="Close">&times;</button>' +
      '<h2 id="tp-h" style="font-size:30px">Text this from your phone</h2>' +
      '<p>On a computer, texting doesn’t work from the page. Send this to <b>' + PHONE_SHOW + '</b>, or paste it into the chat.</p>' +
      '<textarea class="tp-text" data-clarity-mask="True" rows="6" style="width:100%;font:inherit;padding:12px;border:1.5px solid var(--rule);border-radius:6px">' + esc(body) + '</textarea>' +
      '<div class="actions" style="margin-top:16px"><button class="btn btn-amber" type="button" data-tp="copy">Copy the text</button>' +
      (root.HubSpotConversations && root.HubSpotConversations.widget ? '<button class="btn btn-ink" type="button" data-tp="chat">Open the chat</button>' : '') +
      '</div><p class="small quiet" role="status" data-tp-note style="margin-top:10px"></p></div>';
    document.body.appendChild(ov);
    var close = function () { ov.remove(); };
    ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
    ov.querySelector('.x-close').addEventListener('click', close);
    document.addEventListener('keydown', function onKey(e) { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } });
    ov.querySelector('[data-tp="copy"]').addEventListener('click', function () {
      var ta = ov.querySelector('.tp-text'), note = ov.querySelector('[data-tp-note]');
      var done = function () { note.textContent = 'Copied. Paste it into a text to ' + PHONE_SHOW + '.'; };
      if (navigator.clipboard) navigator.clipboard.writeText(ta.value).then(done, function () { ta.select(); document.execCommand('copy'); done(); });
      else { ta.select(); document.execCommand('copy'); done(); }
    });
    var chat = ov.querySelector('[data-tp="chat"]');
    if (chat) chat.addEventListener('click', function () { close(); root.HubSpotConversations.widget.open(); track('open_chat', { from: 'tool' }); });
    ov.querySelector('[data-tp="copy"]').focus();
  }

  function emailForm(container, summary, formName) {
    var f = document.createElement('form'); f.className = 'tool-email'; f.noValidate = true; f.setAttribute('data-form', formName);
    f.innerHTML = '<div class="form-grid">' +
      '<label class="field">Email<input type="email" name="email" autocomplete="email" required></label>' +
      '<label class="field">First name <span class="hint">(optional)</span><input type="text" name="first" autocomplete="given-name"></label>' +
      '<label class="field full">Phone <span class="hint">(optional)</span><input type="tel" name="phone" autocomplete="tel"></label></div>' +
      '<input type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">' +
      '<p class="hint" style="margin-top:12px">By sending this, you agree I may email you about your plan. If you add a phone number, you agree I may call or text you. Consent isn’t required to buy a home. Message and data rates may apply. Reply STOP to opt out. Unsubscribe anytime.</p>' +
      '<div class="actions" style="margin-top:12px"><button class="btn btn-amber" type="submit">Email me my plan</button></div>' +
      '<p class="form-note" role="status" hidden></p>';
    container.appendChild(f);
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var note = f.querySelector('.form-note'), btn = f.querySelector('button[type=submit]');
      var say = function (m) { note.hidden = false; note.textContent = m; };
      if (f.website.value) { say('Got it. Thank you.'); return; }
      var email = f.email.value.trim();
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { say('Please enter a valid email address.'); f.email.focus(); return; }
      var fields = [{ name: 'email', value: email }, { name: 'message', value: summary }];
      if (f.first.value.trim()) fields.push({ name: 'firstname', value: f.first.value.trim() });
      if (f.phone.value.trim()) fields.push({ name: 'phone', value: f.phone.value.trim() });
      btn.disabled = true;
      fetch(HS_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fields: fields, context: { pageUri: location.origin + location.pathname, pageName: document.title } }) })
        .then(function (r) {
          btn.disabled = false;
          if (!r.ok) throw new Error('send');
          track('generate_lead', { form: formName });
          f.querySelector('.form-grid').remove(); f.querySelector('.actions').remove();
          say('Got it' + (f.first.value.trim() ? ', ' + f.first.value.trim() : '') + '. I’ll email it to you personally within three business days.');
        })
        .catch(function () { btn.disabled = false; say('That didn’t go through. Text me at ' + PHONE_SHOW + ' and I’ll send it.'); });
    });
    f.email.focus();
  }

  // ---------------------------------------------------------------------------
  // Step runner shared by both tools
  // ---------------------------------------------------------------------------
  function runner(el, cfg) {
    var a = {}, idx = 0, started = false;
    var stage = el.querySelector('[data-stage]'), result = el.querySelector('[data-result]');
    function steps() { return activeSteps(cfg.steps, a); }

    function renderStep() {
      var list = steps(), s = list[idx], opts = optsFor(s, a), n = list.length;
      var name = cfg.key + '-' + s.id, html = '';
      html += '<div class="m-progress"><span>Question ' + (idx + 1) + ' of ' + n + '</span><span class="m-bar" aria-hidden="true"><span style="width:' + Math.round((idx / n) * 100) + '%"></span></span></div>';
      html += '<form class="m-step" novalidate><fieldset><legend tabindex="-1">' + esc(s.q) + '</legend>';
      if (s.why) html += '<p class="m-why">' + esc(s.why) + '</p>';
      html += '<div class="' + (s.multi ? 'chips' : 'choices') + '">';
      opts.forEach(function (o) {
        var checked = s.multi ? (a[s.id] || []).indexOf(o.v) >= 0 : a[s.id] === o.v;
        html += '<label class="choice"><input type="' + (s.multi ? 'checkbox' : 'radio') + '" name="' + name + '" value="' + o.v + '"' + (checked ? ' checked' : '') + '><span>' + esc(o.label) + '</span></label>';
      });
      html += '</div>';
      if (s.also) {
        html += '<p class="m-sub" id="' + name + '-also">' + esc(s.also.q) + '</p><div class="choices" role="radiogroup" aria-labelledby="' + name + '-also">';
        s.also.opts.forEach(function (o) {
          html += '<label class="choice"><input type="radio" name="' + name + '-also" value="' + o.v + '"' + (a[s.also.id] === o.v ? ' checked' : '') + '><span>' + esc(o.label) + '</span></label>';
        });
        html += '</div>';
      }
      html += '</fieldset><p class="m-error" role="alert"></p><div class="m-nav">' +
        (idx > 0 ? '<button class="btn btn-ink" type="button" data-back>Back</button>' : '<span></span>') +
        '<button class="btn btn-amber" type="submit">' + (idx === n - 1 ? cfg.finishLabel : 'Next') + '</button></div></form>';
      stage.innerHTML = html; stage.hidden = false; result.hidden = true;

      var form = stage.querySelector('form'), at = idx;
      var later = function () { setTimeout(function () { if (idx === at && !stage.hidden) next(); }, 220); };
      form.addEventListener('change', function (e) {
        var t = e.target;
        if (!started) { started = true; track(cfg.key + '_start'); track('tool_start', { tool: cfg.key }); }
        if (t.name === name + '-also') { a[s.also.id] = t.value; }
        else if (s.multi) {
          var picked = [].slice.call(form.querySelectorAll('input[name="' + name + '"]:checked')).map(function (x) { return x.value; });
          if (picked.length > s.multi) { t.checked = false; form.querySelector('.m-error').textContent = 'Pick up to ' + s.multi + '. Unpick one to swap.'; return; }
          form.querySelector('.m-error').textContent = ''; a[s.id] = picked;
        } else {
          a[s.id] = t.value;
          // Clear answers from branches that no longer apply, or whose choices changed.
          cfg.steps.forEach(function (x) {
            if (!(x.id in a) || x === s) return;
            if (x.when && !x.when(a)) { delete a[x.id]; return; }
            if (!x.multi && optsFor(x, a).every(function (o) { return o.v !== a[x.id]; })) delete a[x.id];
          });
          var auto = !s.also || (a[s.id] === 'unknown' || a[s.also.id]);
          if (auto) later();
        }
        if (s.also && t.name === name + '-also' && a[s.id]) later();
      });
      form.addEventListener('submit', function (e) { e.preventDefault(); next(); });
      var back = form.querySelector('[data-back]');
      if (back) back.addEventListener('click', function () { idx = Math.max(0, idx - 1); renderStep(); focusLegend(); });
    }

    function focusLegend() { var lg = stage.querySelector('legend'); if (lg) lg.focus({ preventScroll: true }); el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }

    function next() {
      var list = steps(), s = list[idx], err = stage.querySelector('.m-error');
      if (s.multi) { if (!a[s.id]) a[s.id] = []; }
      else if (!a[s.id]) { err.textContent = 'Pick one to keep going.'; return; }
      if (s.also && a[s.id] !== 'unknown' && !a[s.also.id]) { err.textContent = 'Pick one more: more room, about the same, or less.'; return; }
      track(cfg.key + '_step', { step: idx + 1 });
      if (idx < list.length - 1) { idx++; renderStep(); focusLegend(); }
      else finish();
    }

    function finish() {
      var code = encodeAnswers(cfg.steps, a);
      try { history.replaceState(null, '', '#' + code); } catch (e) {}
      stage.hidden = true; result.hidden = false;
      result.innerHTML = cfg.render(a, code);
      bindTextLinks(result);
      var gate = result.querySelector('[data-mp-gate]'), locked = result.querySelector('[data-mp-locked]');
      if (gate && root.ccGate) root.ccGate(gate.querySelector('[data-gate-form]'), {
        tool: cfg.key, label: 'Send me my plan', summary: function () { return cfg.summary(a, code); },
        onUnlock: function (o) {
          gate.hidden = true; locked.hidden = false; bindTextLinks(locked);
          if (o && o.first) { var n = document.createElement('p'); n.className = 'form-note ok'; n.textContent = 'Thanks, ' + o.first + '. Here’s your full plan. I’ll send you a copy too.'; locked.insertBefore(n, locked.firstChild); }
        }
      });
      if (cfg.onResult) cfg.onResult(a);
      var printBtn = result.querySelector('[data-print]');
      if (printBtn) printBtn.addEventListener('click', function () { track(cfg.key + '_print'); root.print(); });
      result.querySelectorAll('[data-restart]').forEach(function (b) {
        b.addEventListener('click', function () { a = {}; idx = 0; try { history.replaceState(null, '', location.pathname); } catch (e) {} renderStep(); focusLegend(); });
      });
      track(cfg.key + '_result', { result: cfg.resultType(a) }); track('tool_finish', { tool: cfg.key });
      var h = result.querySelector('h2'); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // Start from a shared link (#living=s,...), or a preset from another page (?start=rent).
    var hash = (location.hash || '').slice(1).replace(/[.,;:!?)\]]+$/, '');
    if (hash) { var pre = decodeAnswers(cfg.steps, decodeURIComponent(hash)); if (complete(cfg.steps, pre)) { a = pre; finish(); return; } }
    var qs = new URLSearchParams(location.search), preset = qs.get('start');
    if (preset && cfg.preset && cfg.preset[preset]) { a = cfg.preset[preset](); idx = ('_idx' in a) ? a._idx : 1; delete a._idx; }
    renderStep();
  }

  // ---------------------------------------------------------------------------
  // Result markup
  // ---------------------------------------------------------------------------
  function list(items, cls) { return '<ul class="' + (cls || '') + '">' + items.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul>'; }

  function mpSummary(a, code) {
    var p = movingPlan(a), bits = [];
    activeSteps(MP_STEPS, a).forEach(function (s) { bits.push(labelOf(MP_STEPS, s.id, a[s.id], a)); });
    return 'Tool: Sell & Buy Planner\nResult: ' + p.title + '\nAnswers: ' + bits.join(' / ') + '\nLink: https://charlescarper.com/plan/sell-and-buy/#' + code;
  }
  function mpText(a, code) {
    var p = movingPlan(a);
    return ['Hi Charles, I used your Sell & Buy Planner.',
      'My path: ' + p.title.replace(/\.$/, ''),
      'My plan: charlescarper.com/plan/sell-and-buy/#' + code,
      'Can we talk it through?'].join('\n');
  }

  // Key dates for the full plan, counted from today.
  var TARGET_MONTHS = { soon: 2, mid: 4.5, later: 9, flexible: 6 };
  function addMonths(m) { var d = new Date(); d.setDate(1); d.setMonth(d.getMonth() + Math.round(m)); return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }); }
  function keyDates(a, p) {
    var t = a.living === 'rent' ? a.lease : a.timing, m = TARGET_MONTHS[t] || 6, out = [['Move in', 'Around ' + addMonths(m)]];
    var path = (p.type || '').replace('sell-', '');
    if (path === 'together') out.unshift(['List your home', 'Around ' + addMonths(Math.max(1, m / 2))]);
    else if (path === 'sellfirst' || path === 'contingency') out.unshift(['List your home', a.sale === 'listed' ? 'It’s listed. Keep it priced to sell.' : 'This month']);
    else if (path === 'buyfirst' || path === 'bridge') out.push(['List your old home', 'Right after you move, around ' + addMonths(m + 0.5)]);
    out.unshift(['Talk to a lender', 'This week']);
    return out;
  }
  function agentQs(a) {
    var q = ['What would you list my home for, and how long are homes like mine taking to sell right now?',
      'Can you time my listing to a build date, and plan for a rent-back if I need one?',
      'What should I fix, and what should I skip, before I list?'];
    return q;
  }

  function renderMovingPlan(a, code) {
    var p = movingPlan(a), html = '', owner = a.living === 'own_sell';
    html += '<div class="plan-result">';
    html += '<p class="eyebrow">' + esc(p.kicker) + '</p><h2>' + esc(p.title) + '</h2><p class="lead">' + esc(p.summary) + '</p>';
    html += '<div class="plan-grid"><div>';
    html += '<h3>Why this fits you</h3>' + list(p.why, 'plan-why');
    html += '</div><div>';
    html += '<h3>Your timeline</h3><ol class="plan-timeline">' + p.steps.map(function (s) { return '<li><b>' + esc(s.when) + '</b><span>' + esc(s.what) + '</span></li>'; }).join('') + '</ol>';
    html += '</div></div>';
    if (owner) html += '<p style="margin-top:20px"><a class="arrow" href="#numbers">See the numbers for all three ways</a></p>';
    if (a.living === 'rent') html += '<p style="margin-top:20px"><a class="arrow" href="/plan/lease-to-keys/">Get exact dates in the Lease-to-Keys Planner</a></p>';
    // The unlock
    html += '<div class="gate" data-mp-gate><h3>Want the full plan? I’ll send it to you.</h3><p class="quiet small">Your key dates, your backup plan, what to ask your lender' + (owner ? ' and your listing agent' : '') + ', and a 15-minute review with me.</p><div data-gate-form></div></div>';
    // The full plan
    html += '<div class="locked unlocked" data-mp-locked hidden><h2 style="font-size:32px;margin-bottom:12px">Your full plan</h2><div class="plan-grid"><div>';
    html += '<h3>Key dates</h3><ol class="plan-timeline">' + keyDates(a, p).map(function (d) { return '<li><b>' + esc(d[0]) + '</b><span>' + esc(d[1]) + '</span></li>'; }).join('') + '</ol>';
    html += '<div class="plan-box" style="margin-top:20px"><h3>Watch out for</h3><p>' + esc(p.watch) + '</p></div>';
    html += '<div class="plan-box"><h3>Your backup plan</h3><p>' + esc(p.backup) + '</p></div>';
    html += '</div><div>';
    html += '<div class="plan-box"><h3>Ask your lender</h3>' + list(p.lender) + '<p class="small" style="margin-top:8px">I\'m happy to share lender names.</p></div>';
    if (owner) html += '<div class="plan-box"><h3>Ask your listing agent</h3>' + list(agentQs(a)) + (a.agent === 'no' ? '<p class="small" style="margin-top:8px">Don’t have one yet? Pick an agent you trust. I don’t list homes, but I’ll work with yours on the timing.</p>' : '') + '</div>';
    html += '</div></div>';
    html += '<section class="plan-next" aria-labelledby="pn-h"><h3 id="pn-h">Your next step</h3><p>I’ll look at your plan, tell you what I’d change, and show you the homes that fit it. No pressure.</p>';
    html += '<div class="next-paths">' +
      '<a class="next-path primary" href="/visit/"><span class="who">Bring your plan</span><b>Book a visit</b></a>' +
      '<a class="next-path" data-track="plan_call" href="/visit/#call"><span class="who">Talk it through</span><b>A 15-minute review</b></a>' +
      '<a class="next-path" data-track="plan_text" data-sms-body="' + esc(mpText(a, code)) + '" href="' + esc(smsHref(mpText(a, code))) + '"><span class="who">Fastest, by text</span><b>Text me my plan</b></a>' +
      '</div>';
    html += '<p class="small quiet" style="margin-top:14px"><a href="/move-in-ready/">See move-in ready homes</a> · <a href="' + (a.living === 'rent' ? '/buyers/renting/' : '/buyers/home-to-sell/') + '">' + (a.living === 'rent' ? 'I’m renting' : 'I have a home to sell') + '</a> · <button class="linkish" type="button" data-print>Print or save it</button></p></section></div>';
    html += '<p class="small quiet" style="margin-top:14px"><button class="linkish" type="button" data-restart>Start over</button></p>';
    html += '<p class="small quiet plan-fine">This is a starting plan from your answers, not legal, tax or lending advice. Program terms, rates and build dates change. Your lender, listing agent and purchase agreement set the real numbers and dates.</p>';
    html += '</div>';
    return html;
  }

  // The text is a labeled list, so each answer reads with its question attached.
  function fpText(top, a) {
    var names = top.map(function (r) { return 'the ' + r.name; }).join(' and ');
    var lines = ['Hi Charles, I’d like to walk ' + names + ' at Collins Ridge.'];
    var st = { one: 'one story only', main: 'two is OK if the primary bedroom is on the main floor',
      two: 'two stories is fine', any: 'no preference' }[a.stories];
    if (st) lines.push('Stories: ' + st);
    if (a.beds) lines.push('Bedrooms: ' + a.beds + ' or more');
    if (a.room && a.size && a.size !== 'unknown') lines.push('Size: ' + { more: 'bigger than my home now',
      same: 'about the same as my home now', less: 'smaller than my home now' }[a.room]);
    if ((a.wants || []).length) lines.push('Must-haves: ' + a.wants.map(function (w) { return WANT_TEXT[w].replace(/^an? /, ''); }).join(', '));
    var ty = { sf: 'single-family', th: 'townhome', either: 'either one' }[a.type];
    if (ty) lines.push('Home type: ' + ty);
    lines.push('Good times for me: ');
    return lines.join('\n');
  }

  function renderFloorPlans(a, code) {
    var ranked = matchPlans(a), top = ranked.slice(0, 2), also = ranked[2], html = '';
    html += '<div class="plan-result">';
    html += '<p class="eyebrow">Your best two fits</p><h2>Walk the ' + esc(top[0].name) + ' and the ' + esc(top[1].name) + '.</h2>';
    html += '<p class="lead">From what you told me, these two fit best. See them in person before you decide. Photos and drawings only get you so far.</p>';
    html += '<div class="fp-cards">' + top.map(function (r, i) {
      return '<article class="fp-card"><p class="fp-rank">' + (i === 0 ? 'Best fit' : 'Close second') + '</p><h3>' + esc(r.name) + '</h3><p class="fp-line">' + esc(r.line) + '</p>' +
        (r.fits.length ? '<h4>Why it fits</h4>' + list(r.fits, 'fp-fits') : '') +
        (r.notes.length ? '<h4>Good to know</h4>' + list(r.notes, 'fp-notes') : '') +
        (r.extras.length ? '<h4>Also has</h4><p class="fp-extras">' + esc(r.extras.join(' · ')) + '</p>' : '') + '</article>';
    }).join('') + '</div>';
    if (also) html += '<p class="quiet" style="margin-top:18px">Also worth a look: the <b>' + esc(also.name) + '</b>.</p>';
    var t = fpText(top, a);
    html += '<section class="plan-next" aria-labelledby="fn-h"><h3 id="fn-h">See them in person</h3><p>I’ll have the homes that match open when you get there, and tell you which ones are move-in ready, being built or not started yet.</p>';
    html += '<div class="next-paths">' +
      '<a class="next-path primary" data-track="plans_text" data-sms-body="' + esc(t) + '" href="' + esc(smsHref(t)) + '"><span class="who">Fastest, by text</span><b>Have these ready for my visit</b></a>' +
      '<a class="next-path" href="/visit/?home=' + encodeURIComponent(top[0].name + ' and ' + top[1].name + ' plans at Collins Ridge') + '"><span class="who">Pick a time</span><b>See these in person</b></a>' +
      '<a class="next-path" href="/plan/sell-and-buy/"><span class="who">Have a home to sell?</span><b>Get my sell &amp; buy plan</b></a>' +
      '</div>';
    html += '<p class="small quiet" style="margin-top:14px"><button class="linkish" type="button" data-print>Print or save these</button> · <button class="linkish" type="button" data-restart>Start over</button></p></section>';
    html += '<p class="small quiet plan-fine">Plan names and room counts come from D.R. Horton’s published plan information. Options, features and availability vary by homesite and change often. Ask me before you decide. Nothing here is an offer.</p>';
    html += '</div>';
    return html;
  }

  var api = { MP_STEPS: MP_STEPS, FP_STEPS: FP_STEPS, PLANS: PLANS, movingPlan: movingPlan, matchPlans: matchPlans,
    scoreSellPaths: scoreSellPaths, encodeAnswers: encodeAnswers, decodeAnswers: decodeAnswers, activeSteps: activeSteps,
    mpText: mpText, fpText: fpText, renderMovingPlan: renderMovingPlan, renderFloorPlans: renderFloorPlans };

  if (typeof module !== 'undefined' && module.exports) { module.exports = api; return; }
  root.CCTools = api;

  function boot() {
    bindTextLinks(document.querySelector('main') || document);
    var mp = document.querySelector('[data-tool="moving-plan"]');
    if (mp) runner(mp, { key: 'sell_and_buy', steps: MP_STEPS, finishLabel: 'Show my plan', render: renderMovingPlan, summary: mpSummary,
      resultType: function (a) { return movingPlan(a).type; },
      onResult: function (a) { try { root.dispatchEvent(new CustomEvent('cc:path', { detail: { path: (movingPlan(a).type || '').replace('sell-', '') } })); } catch (e) {} },
      preset: { sell: function () { return { living: 'own_sell' }; }, rent: function () { return { living: 'rent' }; }, keep: function () { return { living: 'own_keep' }; } } });
    var fp = document.querySelector('[data-tool="floor-plans"]');
    if (fp) runner(fp, { key: 'floor_plan_match', steps: FP_STEPS, finishLabel: 'Show my top two', render: renderFloorPlans,
      preset: { one: function () { return { stories: 'one' }; }, main: function () { return { stories: 'main' }; },
        guest: function () { return { _idx: 0, wants: ['guest'] }; }, office: function () { return { _idx: 0, wants: ['office'] }; } },
      summary: function (a, code) { var r = matchPlans(a); return 'Floor plan match: ' + r[0].name + ', ' + r[1].name + '\nLink: https://charlescarper.com/plan/floor-plan-match/#' + code; },
      resultType: function (a) { return matchPlans(a)[0].name; } });
    document.querySelectorAll('[data-start-tool]').forEach(function (b) {
      b.addEventListener('click', function (e) {
        var t = document.getElementById(b.getAttribute('data-start-tool'));
        if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); var lg = t.querySelector('legend'); if (lg) lg.focus({ preventScroll: true }); }
      });
    });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})(typeof window !== 'undefined' ? window : globalThis);
