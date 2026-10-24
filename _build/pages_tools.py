"""Tool pages under /plan/. The free answer shows right away; the full plan unlocks with an email."""
from ccsite import esc, page, write, crumbs, closing, shot, ESTIMATE_LINE, LENDER_LINE, TOOLS, sms, PHONE, PHONE_SHOW

SUB = 'About two minutes. You type in your own numbers. The answer is an estimate, not a loan offer.'
LENDER = LENDER_LINE
RATE_HELP = ('<a href="https://www.freddiemac.com/pmms" target="_blank" rel="noopener">Freddie Mac\'s weekly national average</a> is a fair place to start. '
             'Your lender has your real rate.')


def head(key, h1=None, lead=SUB, situation=None):
    path, name, q = TOOLS[key]
    trail = [('Home', '/'), ('Plan your move', '/plan/'), (name, None)]
    return f'''
<section class="page-head">
  <div class="wrap">
    {crumbs(trail)}
    <p class="eyebrow">{esc(name)} · 2 minutes</p>
    <h1>{esc(h1 or q)}</h1>
    <p class="lead">{esc(lead)}</p>
  </div>
</section>'''


def after(links):
    items = ''.join('<li><a href="' + h + '">' + esc(t) + '<span>' + esc(s) + '</span></a></li>' for t, h, s in links)
    return f'''
<section class="section bg-white">
  <div class="wrap split top">
    <div><h2 style="font-size:32px;margin-bottom:16px">Where to go next</h2><ul class="links-list">{items}</ul></div>
    <div class="callout"><h3>Rather talk it through?</h3><p style="margin-top:6px">Fifteen minutes. Tell me where you are, and I'll tell you what I'd look at first. No pressure.</p>
      <div class="actions" style="margin-top:12px"><a class="arrow" href="/visit/#call">Pick a call time</a><a class="arrow" href="{esc(sms('Hi Charles, can you check my numbers? '))}" data-sms-body="Hi Charles, can you check my numbers? ">Text me</a></div></div>
  </div>
</section>'''


def field(label, name, kind='money', hint=None, value='', full=False, placeholder='', step=None, minv='0'):
    cls = {'money': 'money', 'pct': 'pct'}.get(kind, '')
    typ = 'date' if kind == 'date' else 'number'
    attrs = ' inputmode="decimal"' if typ == 'number' else ''
    if step: attrs += ' step="' + step + '"'
    if typ == 'number': attrs += ' min="' + minv + '"'
    return ('<label class="field' + (' full' if full else '') + '"><span>' + esc(label) + (' <span class="hint">' + hint + '</span>' if hint else '') + '</span>'
            '<span class="' + cls + '"><input type="' + typ + '" name="' + name + '"' + attrs + (' value="' + value + '"' if value else '') +
            (' placeholder="' + esc(placeholder) + '"' if placeholder else '') + '></span></label>')


def gate_block(tool):
    return (f'<div class="gate" data-gate="{tool}" hidden><h3>Want the full plan? I\'ll send it to you.</h3>'
            '<p class="quiet small">It opens right here too.</p><div data-gate-form></div></div>')


def sell_and_buy():
    body = head('sell-and-buy') + f'''
<section class="section tight">
  <div class="wrap">
    <div class="tool-shell" id="planner" data-tool="moving-plan">
      <div data-stage><noscript><p class="lead">This planner needs JavaScript. Text me at <a href="sms:{PHONE}">{PHONE_SHOW}</a>, and I'll run it with you.</p></noscript></div>
      <div data-result hidden></div>
    </div>
  </div>
</section>
<section class="section bg-white" id="numbers">
  <div class="wrap">
    <div class="head"><p class="eyebrow">Now see the numbers</p><h2>Three ways to do it, side by side.</h2>
      <p class="quiet measure">Move four sliders. See how many times you'd move, how long you'd pay for two homes, and what you'd keep. Nothing you enter leaves this page.</p></div>
    <div class="calc" id="calc">
      <form class="calc-in card" aria-labelledby="calc-in-h" onsubmit="return false">
        <h3 id="calc-in-h">Your numbers</h3>
        <p class="hint">Rough is fine.</p>
        <div class="calc-field"><label for="cValue">What your home might sell for</label><output for="cValue" id="oValue">$400,000</output><input type="range" id="cValue" min="100000" max="1000000" step="5000" value="400000"></div>
        <div class="calc-field"><label for="cOwed">What you still owe on it</label><output for="cOwed" id="oOwed">$200,000</output><input type="range" id="cOwed" min="0" max="400000" step="5000" value="200000"></div>
        <div class="calc-field"><label for="cPay">Your monthly house payment</label><output for="cPay" id="oPay">$1,900</output><input type="range" id="cPay" min="0" max="5000" step="50" value="1900"><span class="hint">Loan, taxes and insurance together.</span></div>
        <div class="calc-field"><label for="cMove">When you want to move in</label><output for="cMove" id="oMove">About 7 months</output><input type="range" id="cMove" min="1" max="12" step="1" value="7"><span class="hint" id="moveHint">Not started yet. Building takes several months.</span></div>
        <details class="calc-adjust"><summary>Change my assumptions</summary>
          <div class="calc-field"><label for="cSell">Months to sell your home</label><output for="cSell" id="oSell">2 months</output><input type="range" id="cSell" min="1" max="6" step="0.5" value="2"><span class="hint">From listing to closing.</span></div>
          <div class="calc-field"><label for="cCost">Selling costs</label><output for="cCost" id="oCost">6%</output><input type="range" id="cCost" min="3" max="10" step="0.5" value="6"><span class="hint">Agent commissions and seller closing costs. Your listing agent has your real number.</span></div>
          <div class="calc-field"><label for="cFee">Buy-before-you-sell program fee</label><output for="cFee" id="oFee">2.25%</output><input type="range" id="cFee" min="1" max="4" step="0.25" value="2.25"><span class="hint">Of your home's list price, plus about $1,850 in closing costs. Used only in way 2 with the program on.</span></div>
        </details>
      </form>
      <div class="calc-out">
        <div class="calc-eq">
          <div><p class="k">Your equity today</p><p class="v" id="rEquity">$200,000</p><p class="s">What it might sell for, minus what you owe.</p></div>
          <div><p class="k">After selling costs</p><p class="v" id="rNet">$176,000</p><p class="s" id="rNetNote">What a sale could leave you, before anything else.</p></div>
          <div><p class="k">You could tap before you sell</p><p class="v" id="rTap">$100,000</p><p class="s">Rough estimate with a buy-before-you-sell program.</p></div>
        </div>
        <div class="calc-ways" id="ways">
          <article class="calc-way" data-way-card="1" aria-labelledby="w1h"><p class="calc-num">Way 1</p><h3 id="w1h">Sell first, then buy</h3><p class="calc-how">Sell and close on your home. Then buy with the cash in hand.</p>
            <dl class="calc-rows"><div><dt>Moves</dt><dd id="m1">1</dd></div><div><dt>Paying for two homes</dt><dd id="t1">None</dd></div><div><dt>Extra cost</dt><dd id="x1">$0</dd></div><div><dt>Cash left after the sale</dt><dd id="l1">$176,000</dd></div></dl>
            <p class="calc-fit"><b>Good fit if</b> your down payment comes from the sale, or you want one payment at a time.</p><p class="calc-watch" id="w1"></p>
            <a class="btn btn-line btn-sm" data-way="1" href="sms:{PHONE}">Text me about way 1</a></article>
          <article class="calc-way" data-way-card="2" aria-labelledby="w2h"><p class="calc-num">Way 2</p><h3 id="w2h">Buy first, then sell</h3><p class="calc-how" id="how2">Close on your new home and move once. Then sell your old home empty.</p>
            <label class="calc-switch"><input type="checkbox" id="cProg"><span class="track" aria-hidden="true"></span><span>Use a buy-before-you-sell program</span></label>
            <dl class="calc-rows"><div><dt>Moves</dt><dd id="m2">1</dd></div><div><dt>Paying for two homes</dt><dd id="t2">About 2.5 months</dd></div><div><dt>Extra cost</dt><dd id="x2">$4,800</dd></div><div><dt>Cash left after the sale</dt><dd id="l2">$171,000</dd></div></dl>
            <p class="calc-fit" id="fit2"><b>Good fit if</b> you can carry both payments and want one move.</p><p class="calc-watch" id="w2"></p>
            <a class="btn btn-line btn-sm" data-way="2" href="sms:{PHONE}">Text me about way 2</a></article>
          <article class="calc-way" data-way-card="3" aria-labelledby="w3h"><p class="calc-num">Way 3</p><h3 id="w3h">Buy with a home-sale contingency</h3><p class="calc-how">Sign on your new home now. The purchase depends on your home selling.</p>
            <dl class="calc-rows"><div><dt>Moves</dt><dd id="m3">1</dd></div><div><dt>Paying for two homes</dt><dd id="t3">None</dd></div><div><dt>Extra cost</dt><dd id="x3">$0</dd></div><div><dt>Cash left after the sale</dt><dd id="l3">$176,000</dd></div></dl>
            <p class="calc-fit"><b>Good fit if</b> your home will sell fast and you need the sale to buy.</p><p class="calc-watch" id="w3"></p>
            <a class="btn btn-line btn-sm" data-way="3" href="sms:{PHONE}">Text me about way 3</a></article>
        </div>
        <p class="tool-fine">Estimates for planning, not lending or financial advice. Your lender decides what you qualify for, and your listing agent has your real selling costs. Each D.R. Horton home has its own rules for contingencies, and they can change.</p>
      </div>
    </div>
    <details class="more" style="margin-top:28px;max-width:72ch"><summary>How the math works</summary>
      <ul style="margin-top:12px">
        <li><b>Equity</b> is what your home might sell for, minus what you owe. <b>Cash left after the sale</b> takes out your selling costs and any extra cost that way carries.</li>
        <li><b>Sell first</b> and <b>home-sale contingency</b> assume you list right away. List later and the gap between homes shrinks, but so does your cushion if the sale runs long.</li>
        <li><b>Buy first</b> allows about two weeks to get your old home ready after you move, then your months to sell. Each month counts your full house payment, so it runs a little high.</li>
        <li><b>The buy-before-you-sell program</b> uses one national program's published terms from October 2026: a fee of 2.25% of your home's list price, about $1,850 in closing costs, no interest for the first 6 months, and total debt on your home of no more than 75% of its value. Programs change and differ, so get the real numbers in writing.</li>
        <li><b>A home-sale contingency</b> comes with rules from the builder. Often the new home stays on the market while you sell. If another buyer makes an offer, you get a short window to drop the contingency, or the contract can end.</li>
        <li><b>Your lender decides what you qualify for.</b> A lender counts your current house payment until your home is sold, or under contract with your buyer's loan approved. Source: <a href="https://selling-guide.fanniemae.com/sel/b3-6-05/monthly-debt-obligations" target="_blank" rel="noopener">Fannie Mae Selling Guide B3-6-05</a>.</li>
      </ul>
    </details>
  </div>
</section>''' + after([
        ('Could you carry both payments?', '/plan/two-mortgages/', 'The Two-Mortgage Check, about two minutes'),
        ('I have a home to sell', '/buyers/home-to-sell/', 'The whole plan, and the homes that fit'),
        ('See move-in ready homes', '/move-in-ready/', 'Finished or almost finished, updated weekly'),
        ('Book a visit', '/visit/', 'Bring your plan. We\'ll walk the homes that fit your timing.'),
    ])
    path = TOOLS['sell-and-buy'][0]
    write(path, page(path, 'Sell & Buy Planner: Sell First or Buy First? | Charles Carper',
                     'Should you sell first, buy first, or do both at once? Answer a few questions for your best path and timeline, then see the numbers for all three ways side by side.',
                     body, active='plan', scripts=['/js/forms.js', '/plan-tools.js', '/js/sell-buy-calc.js']))


def floor_plan_match():
    body = head('floor-plan-match', lead='Five taps. I\'ll narrow the 12 Collins Ridge plans down to the two worth walking. No sign-up.') + f'''
<section class="section tight">
  <div class="wrap">
    <div class="tool-shell" id="match" data-tool="floor-plans">
      <div data-stage><noscript><p class="lead">This needs JavaScript. Text me at <a href="sms:{PHONE}">{PHONE_SHOW}</a> and I'll narrow them for you.</p></noscript></div>
      <div data-result hidden></div>
    </div>
    <p class="tool-fine">Plan names and room counts come from D.R. Horton's published plan information. Options, features and availability vary by homesite and change often. Nothing here is an offer.</p>
  </div>
</section>''' + after([
        ('See all 12 plans', '/collins-ridge/floor-plans/', 'What makes each one different, with starting prices'),
        ('I want to live on one floor', '/buyers/one-floor/', 'One-story and first-floor primary plans'),
        ('I need a bedroom and bath downstairs', '/buyers/downstairs-suite/', 'Plans with a real downstairs suite'),
        ('I work from home', '/buyers/work-from-home/', 'Plans with an office and a door'),
    ])
    path = TOOLS['floor-plan-match'][0]
    write(path, page(path, 'Floor Plan Match: Your Top 2 Collins Ridge Plans | Charles Carper',
                     'Five taps narrow the 12 Collins Ridge floor plans to the two that fit how you live: stories, bedrooms, size and your must-haves.',
                     body, active='plan', scripts=['/js/forms.js', '/plan-tools.js'], fine=['sqft', 'plans']))


def two_mortgages():
    form = ('<form class="calc-form" data-money-form novalidate>' +
            field('What you earn each month, before taxes', 'income', hint='All borrowers, together') +
            field('Your house payment now', 'pay1', hint='Loan, taxes and insurance') +
            field('Other monthly bills', 'debts', hint='Car, student loans, credit card minimums') +
            field('Price of the new home', 'price') +
            field('Your down payment', 'down', hint='Cash you\'d put down before your home sells') +
            field('An interest rate', 'rate', kind='pct', hint='Ask a lender', step='0.01') +
            field('Taxes, insurance and HOA on the new home, each month', 'ti', hint='Optional. Skip it and I\'ll estimate taxes and insurance', full=True) +
            '<p class="small quiet full" style="margin:0">' + RATE_HELP + '</p>'
            '<div class="full actions" style="margin-top:4px"><button class="btn btn-brass" type="submit">Get my answer</button></div>'
            '<p class="m-error full" data-error role="alert"></p></form>')
    body = head('two-mortgages') + f'''
<section class="section tight">
  <div class="wrap">
    <div class="tool-shell" data-money="two-mortgages">
      {form}
      <div data-answer hidden></div>
      {gate_block('two-mortgages')}
      <div class="unlocked" data-unlocked hidden></div>
      <p class="tool-fine">{ESTIMATE_LINE} {LENDER}</p>
    </div>
  </div>
</section>''' + after([
        ('Should you sell first or buy first?', '/plan/sell-and-buy/', 'The Sell & Buy Planner'),
        ('I have a home to sell', '/buyers/home-to-sell/', 'The whole plan, and the homes that fit'),
        ('See move-in ready homes', '/move-in-ready/', 'Finished or almost finished, updated weekly'),
        ('Book a visit', '/visit/', 'Bring your numbers. We\'ll walk the homes that fit.'),
    ])
    path = TOOLS['two-mortgages'][0]
    write(path, page(path, 'Two-Mortgage Check: Can You Carry Both Payments? | Charles Carper',
                     'Could you pay two mortgages while your home sells? Enter your own numbers to see how much of your pay would go to monthly debts, and whether buying first looks likely.',
                     body, active='plan', scripts=['/js/forms.js', '/js/money-tools.js']))


def buying_power():
    form = ('<form class="calc-form" data-money-form novalidate>' +
            field('What you earn each month, before taxes', 'income', hint='All borrowers, together') +
            field('Monthly bills', 'debts', hint='Car, student loans, credit card minimums') +
            field('Money saved for a down payment and closing costs', 'savings') +
            '<label class="field"><span>Loan type</span><span><select name="loan"><option value="">Regular (conventional or FHA)</option>'
            '<option value="va">VA loan</option></select></span></label>' +
            field('An interest rate', 'rate', kind='pct', hint='Ask a lender', step='0.01') +
            field('What monthly payment feels comfortable?', 'comfort', hint='Optional. Include taxes and insurance', full=True) +
            '<p class="small quiet full" style="margin:0">' + RATE_HELP + '</p>'
            '<div class="full actions" style="margin-top:4px"><button class="btn btn-brass" type="submit">Get my answer</button></div>'
            '<p class="m-error full" data-error role="alert"></p></form>')
    body = head('buying-power') + f'''
<section class="section tight">
  <div class="wrap">
    <div class="tool-shell" data-money="buying-power">
      {form}
      <div data-answer hidden></div>
      {gate_block('buying-power')}
      <div class="unlocked" data-unlocked hidden></div>
      <p class="tool-fine">{ESTIMATE_LINE} {LENDER} Ask about first-time buyer and down payment programs too.</p>
    </div>
  </div>
</section>''' + after([
        ("I'm renting", '/buyers/renting/', 'Time your lease and buy'),
        ('When should you buy?', '/plan/lease-to-keys/', 'The Lease-to-Keys Planner'),
        ('See move-in ready homes', '/move-in-ready/', 'Finished or almost finished, updated weekly'),
        ('Book a visit', '/visit/', 'Bring your number. We\'ll walk the homes that fit it.'),
    ])
    path = TOOLS['buying-power'][0]
    write(path, page(path, 'Buying Power Estimate: How Much Home Can You Afford? | Charles Carper',
                     'How much home can you afford around Raleigh-Durham? Enter your own numbers for a price range and a monthly payment range. An estimate, not a loan offer.',
                     body, active='plan', scripts=['/js/forms.js', '/js/money-tools.js']))


def lease_to_keys():
    form = ('<form class="calc-form" data-money-form novalidate>' +
            field('When does your lease end?', 'leaseEnd', kind='date') +
            field('When do you want to move?', 'moveBy', kind='date', hint='Optional. Leave blank to aim for your lease end') +
            field('Your rent each month', 'rent') +
            field('What does breaking your lease cost?', 'breakFee', hint="It's in your lease") +
            field('Month-to-month rent, if you can go month-to-month', 'm2m', hint='Optional. Ask your landlord', full=True) +
            '<div class="full actions" style="margin-top:4px"><button class="btn btn-brass" type="submit">Get my answer</button></div>'
            '<p class="m-error full" data-error role="alert"></p></form>')
    body = head('lease-to-keys') + f'''
<section class="section tight">
  <div class="wrap">
    <div class="tool-shell" data-money="lease-to-keys">
      {form}
      <div data-answer hidden></div>
      {gate_block('lease-to-keys')}
      <div class="unlocked" data-unlocked hidden></div>
      <p class="tool-fine">Build dates are estimates and can move. Don't give notice on your lease until your closing date is firm. {LENDER}</p>
    </div>
  </div>
</section>''' + after([
        ("I'm renting", '/buyers/renting/', 'The whole plan, and the homes that fit'),
        ('How much home can you afford?', '/plan/buying-power/', 'The Buying Power Estimate'),
        ('See move-in ready homes', '/move-in-ready/', 'Finished or almost finished, updated weekly'),
        ('Book a visit', '/visit/', 'Bring your dates. We\'ll find homes that land in your window.'),
    ])
    path = TOOLS['lease-to-keys'][0]
    write(path, page(path, 'Lease-to-Keys Planner: When Should You Buy? | Charles Carper',
                     'When should you buy so your lease ends at the right time? Enter your lease dates and costs to see your best move-in window and which homes land in it.',
                     body, active='plan', scripts=['/js/forms.js', '/js/money-tools.js']))


def build():
    sell_and_buy(); floor_plan_match(); two_mortgages(); buying_power(); lease_to_keys()
