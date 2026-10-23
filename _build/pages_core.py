"""Core pages: home, move-in ready, visit, Collins Ridge (3), plan hub, about, agents, privacy, disclosures, 404, team tools."""
from ccsite import (esc, sms, page, write, shot, tiles, tool_tiles, homes_grid, signup, offer_band, closing, crumbs,
                  disclose_line, load_homes, long_date, short_date, PLANS, PLANS_ASOF, SITUATIONS, TOOLS, PHONE, PHONE_SHOW,
                  MODEL_ADDRESS, MODEL_MAP, HS_MEETING, CALL_EMBED, CALL_LINK, PERSON_LD, SITE, guide_links, plan_link, ESTIMATE_LINE)


def home():
    d = load_homes()
    body = f'''
<section class="hero">
  <div class="wrap hero-grid">
    <div>
      <p class="eyebrow">New D.R. Horton homes · Raleigh-Durham</p>
      <h1>Move once. On your date.</h1>
      <p class="lead">Every move is different. Tell me where you are right now. We'll work out your next step together, and I'll show you the D.R. Horton homes that fit.</p>
      <div class="actions">
        <a class="btn btn-brass" href="/visit/">Book a visit</a>
        <a class="arrow" href="/move-in-ready/">See move-in ready homes</a>
      </div>
      <ul class="trust" aria-label="About Charles">
        <li>Built homes for almost 2 years</li><li>Bought a new home in 2009</li><li>Veteran</li><li>Sells D.R. Horton homes every day</li>
      </ul>
    </div>
    {shot(1, 'Charles Carper in the Collins Ridge model great room', 'Stand on the right third, three-quarter length, relaxed smile. Camera at chest height. Window light from the left.', img='/assets/images/cc-hayden-living.jpg', ar='4 / 5', gx='62%', eager=True)}
  </div>
</section>

<section class="section bg-white" id="situations">
  <div class="wrap">
    <div class="head"><h2>Where are you right now?</h2><p class="quiet">Pick the one that sounds like you. Each one has its own plan.</p></div>
    {tiles()}
  </div>
</section>

<section class="section" id="homes">
  <div class="wrap">
    <div class="head-row">
      <div><h2>Move-in ready homes</h2><p class="quiet">D.R. Horton homes around Raleigh-Durham that are finished or almost finished. I update this list weekly. Homes can sell before the list catches up, so text me to check one before you come.</p></div>
      <a class="arrow" href="/move-in-ready/">See all move-in ready homes</a>
    </div>
    {homes_grid(3)}
    <div style="margin-top:28px">{signup('home')}</div>
  </div>
</section>

<section class="section bg-white">
  <div class="wrap">
    <h2 style="max-width:22ch;margin-bottom:16px">Picking out the house is usually the easy part. The timing is the hard part.</h2>
    <p class="quiet measure" style="margin-bottom:40px">Rates change, and the economy feels uncertain. It's easy to freeze, and then everything stays the same. A plan takes the guessing out.</p>
    <div class="stakes">
      <div><h3>Two payments, no plan</h3><p>Buying first works well for a lot of people. Just know your numbers before you start.</p></div>
      <div><h3>Moving twice</h3><p>Selling first works too. Without a plan, you may move out, store your things, then move again.</p></div>
      <div><h3>Selling in a rush</h3><p>You drop your price to sell fast, and you lose money.</p></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="wrap split">
    {shot(2, 'Charles Carper at the model kitchen island', 'Behind the island, iPad open on the counter, looking up at the camera mid-sentence.', img='/assets/images/cc-hayden-kitchen.jpg', ghost='half', gx='66%')}
    <div>
      <p class="eyebrow">Who I am</p>
      <h2 style="margin-bottom:20px">I built homes before I sold them.</h2>
      <p>I worked on job sites for almost two years. I saw every step, from the dirt to the final touches. I bought a new-construction home myself in 2009. Now I help people buy D.R. Horton homes every day.</p>
      <p>I'm transparent, and I'll tell you the truth, even when the answer is "this isn't a good fit for you."</p>
      <div class="actions"><a class="arrow" href="/about/">Read my story</a></div>
    </div>
  </div>
</section>

<section class="section tight">
  <div class="wrap">
    <h2 style="margin-bottom:40px">Here's how it works.</h2>
    <ol class="steps-num">
      <li><h3>Tell me where you are</h3><p>Use a quick planner, or just text me. It takes about two minutes.</p></li>
      <li><h3>We make a plan together</h3><p>Your timing, your budget and your next step. No pressure.</p></li>
      <li><h3>See the homes that fit</h3><p>Walk the model, then real homes that match your plan.</p></li>
    </ol>
  </div>
</section>

<section class="section bg-white" id="tools">
  <div class="wrap">
    <div class="head"><h2>Get quick answers.</h2><p class="quiet">Free, and about two minutes each. You type in your own numbers, so the answer is an estimate, not a loan offer.</p></div>
    {tool_tiles(['sell-and-buy', 'two-mortgages', 'lease-to-keys', 'buying-power'])}
  </div>
</section>

<section class="section" id="collins-ridge">
  <div class="wrap split flip">
    <div>
      <p class="eyebrow">My community</p>
      <h2 style="margin-bottom:20px">Collins Ridge, a short walk from downtown Hillsborough.</h2>
      <p>Townhomes, one-story homes and two-story homes. There's a saltwater pool, a gym, pickleball courts and walking trails. I-85 and I-40 are less than 2 miles away.</p>
      <p>Come see the furnished model at 116 Sea Trail St, Hillsborough.</p>
      <div class="actions"><a class="btn btn-line" href="/collins-ridge/">Explore Collins Ridge</a><a class="arrow" href="/collins-ridge/floor-plans/">See the floor plans</a></div>
    </div>
    {shot(3, 'Charles Carper walking on a Collins Ridge sidewalk', 'Walking toward the camera on the sidewalk, finished homes behind you, the hour before sunset.', scene='street', gx='52%')}
  </div>
</section>

{offer_band()}
{closing()}
'''
    schema = [{"@context": "https://schema.org", "@type": "WebSite", "name": "Charles Carper", "url": SITE + "/"}, PERSON_LD]
    write('/', page('/', 'Charles Carper | New D.R. Horton Homes in Raleigh-Durham',
                    'New D.R. Horton homes around Raleigh-Durham, with a plan for your move. A move-in ready list updated weekly, quick planners for selling, renting and budgeting, and straight answers from Charles Carper.',
                    body, active=None, scripts=['/js/forms.js'], schema=schema))


def move_in_ready():
    d = load_homes()
    towns = sorted({h['town'] for h in d['homes']})
    sample = ('<p class="callout small" style="margin-bottom:24px"><b>Preview:</b> these are sample homes from drhorton.com on ' + long_date(d['asOf']) +
              '. The weekly refresh fills in the full list.</p>') if d.get('sample') else ''
    town_opts = ''.join('<option>' + esc(t) + '</option>' for t in towns)
    body = f'''
<section class="page-head">
  <div class="wrap">
    {crumbs([('Home', '/'), ('Move-in ready homes', None)])}
    <h1>Move-in ready homes</h1>
    <p class="lead">D.R. Horton homes around Raleigh-Durham that are finished or almost finished. I update this list weekly. Homes can sell before the list catches up, so text me to check one before you come.</p>
    <p class="quiet">Every Collins Ridge home is here too, including the ones still being built. {len(d['homes'])} homes as of {long_date(d['asOf'])}.</p>
  </div>
</section>
<section class="section tight">
  <div class="wrap">
    {sample}
    <form class="filters" data-filters aria-label="Filter the homes">
      <label class="field">Town<select name="town"><option value="">Any town</option>{town_opts}</select></label>
      <label class="field">Price<select name="price"><option value="">Any price</option><option value="350000">Under $350,000</option><option value="400000">Under $400,000</option><option value="450000">Under $450,000</option><option value="500000">Under $500,000</option><option value="600000">Under $600,000</option></select></label>
      <label class="field">Bedrooms<select name="beds"><option value="">Any</option><option value="3">3 or more</option><option value="4">4 or more</option><option value="5">5 or more</option></select></label>
      <label class="field">Square feet<select name="sqft"><option value="">Any size</option><option value="1500">1,500 or more</option><option value="2000">2,000 or more</option><option value="2500">2,500 or more</option><option value="3000">3,000 or more</option></select></label>
      <label class="check-pill"><input type="checkbox" name="onefloor">One floor</label>
      <label class="check-pill"><input type="checkbox" name="townhome">Townhome</label>
      <label class="check-pill"><input type="checkbox" name="rear">Rear-load garage</label>
      <p class="filters-count" data-count role="status" aria-live="polite"></p>
    </form>
    {homes_grid()}
    <p class="homes-empty" data-empty hidden>No homes match those filters right now. Clear one, or <a href="{esc(sms('Hi Charles, I\'m looking for a move-in ready home. Here\'s what I need: '))}">text me what you need</a> and I'll watch for it.</p>
    <div style="margin-top:28px">{signup('move-in-ready')}</div>
  </div>
</section>
<section class="section bg-white">
  <div class="wrap split top">
    <div class="card">
      <h2 style="font-size:30px;margin-bottom:10px">Want more time?</h2>
      <p>Want more time to sell your home or finish your lease? Collins Ridge also has homes being built and homes that haven't started yet.</p>
      <div class="actions"><a class="arrow" href="/collins-ridge/">See Collins Ridge</a></div>
    </div>
    <div class="card">
      <h2 style="font-size:30px;margin-bottom:10px">Not sure where?</h2>
      <p>Not sure which town fits? Tell me where you work and what you need. I'll point you to the two best areas.</p>
      <div class="actions"><a class="arrow" href="{esc(sms('Hi Charles, help me find my best areas. I work near: ' + chr(10) + 'I need: '))}" data-sms-body="Hi Charles, help me find my best areas. I work near: &#10;I need: ">Find my best areas</a></div>
    </div>
  </div>
</section>
<section class="section tight bg-white">
  <div class="wrap"><p class="note measure">This list is updated weekly, not the moment a home sells. Prices and homes come from drhorton.com as of {long_date(d['asOf'])}. Text me to check a home before you come. For a home outside Hillsborough, I'll set up your visit with the sales consultant there.</p></div>
</section>
{closing('Found one you like? Let\'s go see it.', after=True)}
'''
    write('/move-in-ready/', page('/move-in-ready/', 'Move-In Ready D.R. Horton Homes in Raleigh-Durham | Charles Carper',
                                  'Finished and almost-finished D.R. Horton homes around Raleigh-Durham, updated weekly. Prices shown with their date. Book a visit to any home.',
                                  body, active='homes', scripts=['/js/forms.js', '/js/homes.js']))


def visit():
    sit_opts = ''.join('<option>' + esc(label) + '</option>' for _, _, _, label in SITUATIONS)
    body = f'''
<section class="page-head">
  <div class="wrap split">
    <div>
      {crumbs([('Home', '/'), ('Book a visit', None)])}
      <h1>Come see the homes that fit.</h1>
      <p class="lead">Plan on about an hour. Bring anyone who's helping you decide, and your agent if you have one.</p>
      <div class="actions"><a class="btn btn-brass" href="#book">Pick a visit time</a><a class="arrow" href="#call">Rather talk first?</a></div>
    </div>
    {shot(5, 'Charles Carper showing a floor plan on an iPad at the sales table', 'Over your shoulder, pointing at a floor plan on the iPad. A buyer shows only from behind, with a release.', img='/assets/images/cc-hayden-flex.jpg', ghost='half', gx='38%')}
  </div>
</section>
<section class="section tight">
  <div class="wrap">
    <h2 style="font-size:32px;margin-bottom:24px">What happens at a visit</h2>
    <ol class="steps-num">
      <li><h3>We talk for a few minutes</h3><p>What you need, when you want to move, and what matters most to you.</p></li>
      <li><h3>We walk the homes</h3><p>The model, then real homes that match.</p></li>
      <li><h3>You leave with a short list</h3><p>No pressure to decide that day.</p></li>
    </ol>
  </div>
</section>
<section class="section bg-white" id="book">
  <div class="wrap">
    <div class="tool-shell" data-visit>
      <div data-visit-step="1">
        <p class="eyebrow">Step 1 of 2</p>
        <h2 style="font-size:34px;margin-bottom:8px">Tell me a little first.</h2>
        <p class="quiet">So I can have the right homes ready when you get there.</p>
        <form data-visit-form novalidate>
          <div class="form-grid" style="margin-top:20px">
            <label class="field">Name<input type="text" name="name" autocomplete="name" required></label>
            <label class="field">Phone<input type="tel" name="phone" autocomplete="tel"></label>
            <label class="field full">Email<input type="email" name="email" autocomplete="email" required></label>
            <label class="field">Where are you right now?<select name="situation"><option value="">Pick one</option>{sit_opts}<option>Just looking</option></select></label>
            <label class="field">When do you want to move?<select name="timing"><option value="">Pick one</option><option>In 3 months</option><option>3 to 6 months</option><option>6 to 12 months</option><option>Not sure yet</option></select></label>
            <label class="field full">Is there a home you saw on my list? <span class="hint">Optional</span><input type="text" name="home" placeholder="Community, plan or address"></label>
          </div>
          <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
          <label class="check"><input type="checkbox" name="textok" value="yes"><span>Yes, you can text me about my visit. Message and data rates may apply. Reply STOP to stop.</span></label>
          <div class="actions"><button class="btn btn-brass" type="submit">Next: pick a time</button></div>
          <p class="form-note" role="status" hidden></p>
        </form>
      </div>
      <div data-visit-step="2" hidden>
        <p class="eyebrow">Step 2 of 2</p>
        <h2 style="font-size:34px;margin-bottom:8px">Pick a visit time.</h2>
        <p class="quiet">Your name and email are filled in. Pick a time and you're set.</p>
        <div class="booking-card" style="margin-top:16px"><iframe class="booking-frame" data-src="{HS_MEETING}?embed=true" title="Pick a time to visit with Charles Carper" style="width:100%;min-height:720px;border:0"></iframe></div>
        <p class="small quiet" style="margin-top:12px">Calendar not loading? <a href="{HS_MEETING}" target="_blank" rel="noopener">Open it in a new tab</a>, or call or text <a href="tel:{PHONE}">{PHONE_SHOW}</a>.</p>
      </div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap split top">
    <div class="stack">
      <div class="card">
        <h3>Days off</h3>
        <p class="quiet" style="margin-top:6px">I'm off Wednesday and Thursday. Text me anytime, and I'll answer on my next work day.</p>
      </div>
      <div class="card">
        <h3>Where to find me</h3>
        <p style="margin-top:6px">Collins Ridge model home: <a href="{MODEL_MAP}" target="_blank" rel="noopener">{MODEL_ADDRESS}</a></p>
        <p class="quiet small">Model hours: Monday to Thursday 10 to 6, Friday 1 to 6, Saturday 10 to 6, Sunday 1 to 6. Hours can change with the season, so text me before you come.</p>
      </div>
    </div>
    <div class="stack">
      <div class="card" id="call">
        <h3>Not ready to visit?</h3>
        <p class="quiet" style="margin-top:6px">Let's talk for 15 minutes first.</p>
        <div class="actions" style="margin-top:16px"><button class="btn btn-line" type="button" data-call-open>Pick a call time</button></div>
        <div data-call-slot hidden style="margin-top:16px"><iframe data-src="{CALL_EMBED}" title="Pick a time for a 15-minute call with Charles Carper" style="width:100%;min-height:640px;border:0"></iframe>
          <p class="small quiet">Calendar not loading? <a href="{CALL_LINK}" target="_blank" rel="noopener">Open it in a new tab</a>.</p></div>
      </div>
      <div class="card">
        <h3>Another community</h3>
        <p class="quiet" style="margin-top:6px">Looking at a home outside Hillsborough? I'll set up your visit with the sales consultant there.</p>
        <div class="actions" style="margin-top:16px"><a class="btn btn-line" href="{esc(sms("Hi Charles, I'd like to see a D.R. Horton home in another community. It's in: "))}" data-sms-body="Hi Charles, I'd like to see a D.R. Horton home in another community. It's in: ">Text me the community</a></div>
        <p class="small quiet" style="margin-top:10px">Or call {PHONE_SHOW}.</p>
      </div>
    </div>
  </div>
  <div class="wrap" style="margin-top:32px">{disclose_line()}</div>
</section>
'''
    write('/visit/', page('/visit/', 'Book a Visit | Charles Carper, D.R. Horton Raleigh-Durham',
                          'Pick a time to see the homes that fit. Plan on about an hour at the Collins Ridge model in Hillsborough. Bring anyone who is helping you decide, and your agent if you have one.',
                          body, active=None, scripts=['/js/forms.js', '/js/visit.js']))


AREA_TIMES = [
    ('Close to home', [('Downtown Hillsborough (Weaver Street Market)', '1.2 mi · 3.5 min'), ('Occoneechee Mountain State Natural Area', '1.8 mi · 5 min'),
                       ('Gold Park', '2.3 mi · 6 min'), ('Aldi', '2.4 mi · 7 min'), ('Walmart Supercenter', '2.6 mi · 8 min'),
                       ('UNC Hospitals Hillsborough', '2.8 mi · 9 min'), ('Eno River, Pleasant Green Access', '7.6 mi · 13 min')]),
    ('Durham and Chapel Hill', [('Duke University Hospital', '11.7 mi · 18 min'), ('Duke University Chapel', '12.2 mi · 21 min'),
                                ('American Tobacco Campus, Durham', '13.9 mi · 21 min'), ('Franklin Street, Chapel Hill', '11.9 mi · 23 min'),
                                ('Weaver Street Market, Carrboro', '12.2 mi · 24 min'), ('Duke Regional Hospital', '14.1 mi · 24 min'),
                                ('UNC Hospitals, Chapel Hill', '12.6 mi · 26 min')]),
    ('Work and travel', [('The Streets at Southpoint', '17.6 mi · 26 min'), ('Research Triangle Park', '21.2 mi · 31 min'),
                         ('Raleigh-Durham Airport (RDU)', '27.2 mi · 40 min'), ('Downtown Raleigh', '37.3 mi · 53 min')]),
    ('West, toward Mebane', [('Downtown Mebane', '10.7 mi · 17 min'), ('Downtown Burlington', '21.2 mi · 29 min')]),
]


def area_lists():
    out = ''
    for i, (h, rows) in enumerate(AREA_TIMES):
        lst = '<h3 style="margin-top:20px">' + esc(h) + '</h3><ul class="area-list">' + ''.join(
            '<li><span>' + esc(a) + '</span><span>' + esc(b) + '</span></li>' for a, b in rows) + '</ul>'
        out += lst if i == 0 else ''
    more = ''.join('<h3 style="margin-top:20px">' + esc(h) + '</h3><ul class="area-list">' + ''.join(
        '<li><span>' + esc(a) + '</span><span>' + esc(b) + '</span></li>' for a, b in rows) + '</ul>' for h, rows in AREA_TIMES[1:])
    return out + '<details class="more"><summary>Show all drive times</summary>' + more + '</details>'


def collins_ridge():
    gallery = [('cc-hayden-foyer.jpg', 'Foyer'), ('cc-hayden-living.jpg', 'Living room'), ('cc-hayden-kitchen.jpg', 'Kitchen'),
               ('cc-hayden-flex.jpg', 'Flex room, staged as an office'), ('cc-hayden-primary-suite.jpg', 'Primary bedroom'),
               ('cc-hayden-primary-bath.jpg', 'Primary bath'), ('cc-hayden-bedroom.jpg', 'Secondary bedroom'), ('cc-hayden-closet.jpg', 'Walk-in closet')]
    gal = ''.join('<figure class="photo"><img src="/assets/images/' + f + '" width="960" height="720" alt="Model home: ' + esc(c.lower()) +
                  '" loading="lazy"><figcaption>' + esc(c) + '</figcaption></figure>' for f, c in gallery)
    body = f'''
<section class="page-head">
  <div class="wrap split">
    <div>
      {crumbs([('Home', '/'), ('Collins Ridge', None)])}
      <h1>Collins Ridge: new D.R. Horton homes a short walk from downtown Hillsborough.</h1>
      <p class="lead">Townhomes, one-story homes and two-story homes. Less than 2 miles to I-85 and I-40.</p>
      <div class="actions"><a class="btn btn-brass" href="/visit/">Tour the model</a><a class="arrow" href="/collins-ridge/floor-plans/">See the floor plans</a></div>
    </div>
    {shot(3, 'Charles Carper walking on a Collins Ridge sidewalk', 'Walking toward the camera on the sidewalk, finished homes behind you, the hour before sunset.', scene='street', gx='52%', eager=True)}
  </div>
</section>
<section class="section bg-white">
  <div class="wrap">
    <div class="head"><h2>Three ways to buy</h2></div>
    <div class="stakes">
      <div><h3>Move-in ready</h3><p>Finished or almost finished, so you can move soon.</p><p><a class="arrow" href="/move-in-ready/">See move-in ready homes</a></p></div>
      <div><h3>Being built</h3><p>Watch it go up and plan your move.</p></div>
      <div><h3>Not started yet</h3><p>More time to sell your home or finish your lease, and you may get to pick from a few color packages.</p></div>
    </div>
  </div>
</section>
<section class="section">
  <div class="wrap split">
    <div>
      <h2 style="margin-bottom:16px">The floor plans</h2>
      <p>12 plans, from townhomes to one-story homes. Not sure where to start? Answer five quick questions and I'll show you your top two.</p>
      <div class="actions"><a class="btn btn-line" href="/plan/floor-plan-match/">Find my top 2 plans</a><a class="arrow" href="/collins-ridge/floor-plans/">See all 12 plans</a></div>
      <p class="small quiet" style="margin-top:20px">Need everything on one floor, or a bedroom and bath downstairs? <a href="/buyers/one-floor/">One-floor homes</a> · <a href="/buyers/downstairs-suite/">Bedroom and bath downstairs</a></p>
    </div>
    <div class="card">
      <h3>The model</h3>
      <p style="margin-top:6px">Come walk the furnished model. It's a Hayden. Some furniture and decor don't come with the home, so ask me what does.</p>
      <p class="quiet small">{MODEL_ADDRESS}</p>
      <div class="actions" style="margin-top:12px"><a class="arrow" href="/visit/">Book a visit</a></div>
    </div>
  </div>
</section>
<section class="section bg-white">
  <div class="wrap">
    <div class="head"><h2>Inside the model</h2><p class="quiet">Staged; some items don't come with the home.</p></div>
    <div class="gallery">{gal}</div>
  </div>
</section>
<section class="section">
  <div class="wrap split top">
    <div>
      <h2 style="margin-bottom:16px">In every home</h2>
      <ul class="ticks">
        <li>Quartz countertops</li><li>A stainless gas range, microwave and dishwasher</li>
        <li>A smart home: video doorbell, keypad lock, smart thermostat and alarm panel</li>
        <li>Hardie siding</li><li>9-foot ceilings on the first floor</li><li>A 10-year structural warranty</li>
      </ul>
      <p class="note" style="margin-top:20px">The list can change, so get it in writing before you sign.</p>
      <h2 style="margin:40px 0 16px">In the community</h2>
      <p>A saltwater pool and a clubhouse with a gym. Tennis courts that work as pickleball courts. A dog park, walking trails and playgrounds.</p>
      {shot(11, 'The Collins Ridge pool and clubhouse', 'Pool, clubhouse gym, pickleball, dog park and trail. No people, or people only from behind with a release.', scene='amenity', ghost=None)}
    </div>
    <div id="area">
      <h2 style="margin-bottom:16px">Around town</h2>
      <p>Downtown Hillsborough is half a mile away, with shops, places to eat and the Riverwalk along the Eno River. Eno River State Park is close by.</p>
      <p class="quiet small">Driving distance and time from the model at 116 Sea Trail St. Times are approximate, off-peak, with no traffic. Add time at rush hour.</p>
      {area_lists()}
      <p style="margin-top:20px"><a class="arrow" href="/guides/living-in-hillsborough-nc">Living in Hillsborough, NC</a></p>
    </div>
  </div>
</section>
<section class="section bg-white">
  <div class="wrap split">
    <div>
      <h2 style="margin-bottom:12px">Have an HOA question?</h2>
      <p>Ask me. I'll show you where it's covered in the HOA papers.</p>
      <div class="actions"><a class="arrow" href="/collins-ridge/faq/#hoa">Read the HOA answers</a></div>
    </div>
    <div class="callout">
      <h3>There's a special offer this month.</h3>
      <p style="margin-top:6px">Text me for the details.</p>
      <div class="actions" style="margin-top:12px"><a class="arrow" href="{esc(sms("Hi Charles, can you send me this month's special offer at Collins Ridge?"))}" data-sms-body="Hi Charles, can you send me this month's special offer at Collins Ridge?">Text me</a></div>
    </div>
  </div>
</section>
{closing('Come walk the model. Then the homes that fit.', cta='Book a visit')}
'''
    schema = [{"@context": "https://schema.org", "@type": "Place", "name": "Collins Ridge", "address": {"@type": "PostalAddress", "streetAddress": "116 Sea Trail St", "addressLocality": "Hillsborough", "addressRegion": "NC", "postalCode": "27278", "addressCountry": "US"}}]
    write('/collins-ridge/', page('/collins-ridge/', 'Collins Ridge: New D.R. Horton Homes in Hillsborough, NC | Charles Carper',
                                  'Townhomes, one-story and two-story D.R. Horton homes a short walk from downtown Hillsborough. Saltwater pool, gym, pickleball and trails. Tour the furnished model at 116 Sea Trail St.',
                                  body, active='collins', schema=schema))


def floor_plans():
    cards = ''.join(
        '<li class="plan-card" id="' + n.lower() + '"><p class="specs">' + esc(t) + ' · ' + str(b) + ' bed · ' + ba + ' bath · ' + (str(s) + ' story' if s == 1 else str(s) + ' stories') + '</p>'
        '<h3>' + esc(n) + '</h3><p>' + esc(line) + '</p><p class="from">From the ' + esc(price) + '</p>'
        '<a class="arrow" href="/visit/?home=' + n + '%20plan%20at%20Collins%20Ridge">Book a visit to see the ' + esc(n) + '</a></li>'
        for n, t, b, ba, s, line, price in PLANS)
    body = f'''
<section class="page-head">
  <div class="wrap">
    {crumbs([('Home', '/'), ('Collins Ridge', '/collins-ridge/'), ('Floor plans', None)])}
    <h1>Collins Ridge floor plans</h1>
    <p class="lead">12 plans, from townhomes to one-story homes. Find the two that fit how you live.</p>
    <div class="actions"><a class="btn btn-brass" href="/plan/floor-plan-match/">Find my top 2 plans</a><a class="arrow" href="/visit/">Book a visit</a></div>
  </div>
</section>
<section class="section tight">
  <div class="wrap">
    <ul class="plan-cards">{cards}</ul>
    <p class="note measure" style="margin-top:28px">Prices from drhorton.com on {PLANS_ASOF}. They're refreshed weekly and always shown with their date. Options, features and availability vary by homesite and change often. Room counts come from D.R. Horton's published plan information.</p>
  </div>
</section>
{closing('Pick two. Then walk them in person.', cta='Book a visit')}
'''
    write('/collins-ridge/floor-plans/', page('/collins-ridge/floor-plans/', 'Collins Ridge Floor Plans, Hillsborough NC | Charles Carper',
                                              'All 12 Collins Ridge floor plans by D.R. Horton, from townhomes to one-story homes, with what makes each one different and starting prices with their date.',
                                              body, active='collins'))


FAQ = [
    ('buying', 'Buying here', [
        ('Do you have homes ready now?', "Often, yes. Homes here are built first, so at any time there can be homes that are move-in ready, homes being built, and homes that haven't started yet. What's ready changes week to week. <a href=\"/move-in-ready/\">See this week's move-in ready homes</a>, or ask me what's open today."),
        ('How long does a home take to build?', "A move-in ready home can close soon. A home being built depends on how far along it is. A home that hasn't started takes several months. Ask me for the current estimate on the homesite you like. A longer build can give you time to sell your home or finish your lease."),
        ('What comes with the home?', 'Every home comes with a standard features list: the kitchen, baths, floors, smart home tech, outside finishes and the warranty. The list changes over time, so ask me for the current one, and get it in writing before you sign. The model is staged, so some things you see there don\'t come with the home.'),
        ('Is there a design center?', 'No. The plans are already designed, so there are fewer choices and less stress. If your home is early in the build, you may get to pick from a few color packages. Outside colors are set by homesite, so the street looks good together.'),
        ('Can I buy if I still have a home to sell?', 'Yes. You can sell first, buy first, or buy with a home-sale contingency, and there are programs that help you buy before you sell. Each D.R. Horton home has its own rules for contingencies, and they can change, so ask me about the home you like. <a href="/plan/sell-and-buy/">Get your sell &amp; buy plan</a>'),
        ('Can I get my own home inspection?', "Yes. You can hire your own licensed home inspector before the drywall goes up, and again before closing. Work doesn't stop for an inspection, so it has to fit the build schedule. Tell me early, and I'll help you line it up."),
        ('What happens with what my inspector finds?', 'You or your inspector can send the report to the builder. Reports often list a lot of items, and that\'s normal. Each item gets reviewed, and you hear back. What gets fixed, and how, is set by your purchase agreement and the warranty, so read both.'),
        ('How does the warranty work?', 'Homes come with a builder warranty, including a 10-year structural warranty. Your warranty book has the terms and the timing. After you move in, you send requests through the online warranty portal. I\'ll show you where before you close. <a href="/guides/new-home-warranty-coverage">More on what a new home warranty covers</a>'),
    ]),
    ('hoa', 'HOA', [
        ('What does the HOA cover?', 'The shared spaces: the entrances, community landscaping, the amenities and the stormwater ponds. Dues also pay for the HOA\'s insurance, its management, and savings for future repairs. On townhomes, the HOA also takes care of the outside of the home, the roof shingles, the gutters and the lawn. The HOA papers spell out exactly what. For the current dues and budget, ask me or HOA management.'),
        ('Can dues go up?', 'Yes. Budgets change with costs like insurance and upkeep. The HOA papers set how increases work. Ask for the current budget before you buy.'),
        ('Can I add a fence, shed, pool or solar panels?', "Most changes to the outside of your home need approval first, and some may not be allowed. That includes fences, sheds, pools, solar panels, play sets and paint colors. Get the current guidelines from HOA management before you plan anything."),
        ('Are there rules on pets, parking and rentals?', 'Yes. The HOA papers cover pets, parking, rentals and running a business from home. Read the current versions before you buy, especially if any of these matter to you. Assistance animals for people with disabilities are handled under fair housing law. Ask HOA management about a reasonable accommodation.'),
        ('How do I get the full HOA papers?', "Ask HOA management for the current declaration, rules and guidelines. They're the final word. If you'd like, I'll show you where a topic is covered before you buy."),
    ]),
    ('schools', 'Schools', [
        ('Which schools?', 'Orange County Schools decides school assignments, and they can change. Check any address with the district\'s address lookup on the <a href="https://www.orangecountyfirst.com/fs/pages/2844" target="_blank" rel="noopener">Orange County Schools enrollment page</a>.'),
    ]),
    ('working', 'Working with me', [
        ('Do I need my own agent?', "You're welcome to bring one. I work for D.R. Horton, the seller. If you have an agent, bring them to your first visit or have them register you before you come."),
        ('Is there a special offer?', "There's a special offer this month. It changes often, so if you're interested, just text me at <a href=\"" + sms("Hi Charles, can you send me this month's special offer?") + '">' + PHONE_SHOW + "</a> and I'll send you the details."),
        ("What if Collins Ridge isn't the right fit?", "I'll tell you. If your drive or budget points somewhere else, I'll show you move-in ready D.R. Horton homes in other areas and set up your visit with the sales consultant there."),
    ]),
]


def faq():
    toc = ''.join('<a href="#' + k + '">' + esc(h) + '</a>' for k, h, _ in FAQ)
    secs = ''
    ld = []
    for k, h, qs in FAQ:
        secs += '<h2 id="' + k + '">' + esc(h) + '</h2>' + ''.join('<details><summary>' + esc(q) + '</summary><div><p>' + a + '</p></div></details>' for q, a in qs)
        ld += [{"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": __import__('re').sub('<[^>]+>', '', a)}} for q, a in qs]
    body = f'''
<section class="page-head">
  <div class="wrap">
    {crumbs([('Home', '/'), ('Collins Ridge', '/collins-ridge/'), ('FAQ', None)])}
    <h1>Collins Ridge FAQ</h1>
    <p class="lead">Short answers to what people ask me most: buying here, the HOA, schools and working with me.</p>
  </div>
</section>
<section class="section tight">
  <div class="wrap"><div class="faq measure" style="max-width:820px"><nav class="faq-toc" aria-label="On this page">{toc}</nav>{secs}
    <div class="callout" style="margin-top:40px"><h3>Still have a question?</h3><p style="margin-top:6px">Text me. I answer fast on work days.</p>
    <div class="actions" style="margin-top:12px"><a class="btn btn-brass" href="{sms('Hi Charles, I have a question about Collins Ridge: ')}" data-sms-body="Hi Charles, I have a question about Collins Ridge: ">Text me your question</a><a class="arrow" href="/visit/">Or book a visit</a></div></div>
  </div></div>
</section>
'''
    write('/collins-ridge/faq/', page('/collins-ridge/faq/', 'Collins Ridge FAQ: Buying, HOA and Schools | Charles Carper',
                                      'Plain answers about buying at Collins Ridge in Hillsborough, NC: homes ready now, build times, what comes with the home, the HOA, schools and working with me.',
                                      body, active='collins', schema=[{"@context": "https://schema.org", "@type": "FAQPage", "mainEntity": ld}]))


def plan_hub():
    body = f'''
<section class="page-head">
  <div class="wrap">
    {crumbs([('Home', '/'), ('Plan your move', None)])}
    <h1>Plan your move.</h1>
    <p class="lead">Free, and about two minutes each. You type in your own numbers, so the answer is an estimate, not a loan offer.</p>
  </div>
</section>
<section class="section tight">
  <div class="wrap">
    {tool_tiles(['sell-and-buy', 'two-mortgages', 'lease-to-keys', 'buying-power', 'floor-plan-match'])}
    <p class="note measure" style="margin-top:28px">{ESTIMATE_LINE} Laura Hall at DHI Mortgage can help, or use any lender you like.</p>
  </div>
</section>
<section class="section bg-white">
  <div class="wrap">
    <div class="head"><h2>Or start with your situation.</h2><p class="quiet">Each one has its own plan.</p></div>
    {tiles()}
  </div>
</section>
{closing('Rather talk it through? Bring your plan to a visit.', cta='Book a visit')}
'''
    write('/plan/', page('/plan/', 'Plan Your Move: Free Home Buying Planners | Charles Carper',
                         'Free two-minute planners for buying a new home in Raleigh-Durham: sell first or buy first, two mortgages, lease timing, buying power and floor plans.',
                         body, active='plan'))


def about():
    body = f'''
<section class="page-head">
  <div class="wrap split">
    <div>
      {crumbs([('Home', '/'), ('About', None)])}
      <h1>I built homes before I sold them.</h1>
      <p class="lead">Hi, I'm Charles. I sell new D.R. Horton homes around Raleigh-Durham. My home base is Collins Ridge in Hillsborough.</p>
    </div>
    {shot(4, 'Charles Carper', 'Tight headshot on a plain light wall in the sales office. Solid navy or charcoal blazer, open collar.', img='/assets/images/cc-about.jpg', scene=None, ar='4 / 5', ghost='half', gx='50%')}
  </div>
</section>
<section class="section tight">
  <div class="wrap">
    <div class="prose">
      <h2>My story</h2>
      <p>Before sales, I worked on job sites for almost two years. Twelve-hour days, from grading the dirt to the final touches. I know what's behind the walls. In 2009, I bought a new home myself, so I've been where you are.</p>
      <h2>Why sales</h2>
      <p>I have a computer science degree, and I planned to make video games. But sitting alone coding all day wasn't me. I wanted to talk to people and help them, so I moved into sales.</p>
      <p>I'm also a veteran.</p>
      <h2>How I work</h2>
      <p>I ask a lot of questions. Sometimes the honest answer is a different plan, a different area, or "not yet." I'd rather tell you that than sell you the wrong home.</p>
      <h2>My assistant</h2>
      <p>You may see my AI assistant in some videos. It's made from my face and voice, and I write what it says. When you want the real me, text me.</p>
      {disclose_line()}
      <div class="actions"><a class="btn btn-brass" href="/visit/">Book a visit</a><a class="arrow" href="/move-in-ready/">See move-in ready homes</a></div>
    </div>
  </div>
</section>
'''
    write('/about/', page('/about/', 'About Charles Carper | New Home Sales Consultant, D.R. Horton Raleigh-Durham',
                          'Charles Carper sells new D.R. Horton homes around Raleigh-Durham, based at Collins Ridge in Hillsborough. He built homes for almost two years and bought a new home himself in 2009.',
                          body, active='about', schema=[PERSON_LD]))


def agents():
    body = f'''
<section class="page-head">
  <div class="wrap">
    {crumbs([('Home', '/'), ('For agents', None)])}
    <h1>Your client stays your client.</h1>
    <p class="lead">Register your buyer before their first visit. I'll have homes ready that fit, and I'll keep you posted at every step.</p>
    <div class="actions"><a class="btn btn-brass" href="#register">Protect my client</a><a class="arrow" href="#monday">Get the move-in ready list</a></div>
  </div>
</section>
<section class="section tight">
  <div class="wrap split top">
    <div>
      <h2 style="font-size:32px;margin-bottom:16px">What you can count on</h2>
      <ul class="facts">
        <li><b>Your client stays yours</b><span>I'll never go around you.</span></li>
        <li><b>You hear from me</b><span>After every visit, and at each step to closing.</span></li>
        <li><b>Straight answers</b><span>If I don't know, I'll find out.</span></li>
        <li><b>Real homes to show</b><span>Finished homes, not just drawings.</span></li>
        <li><b>Agent terms</b><span>Ask me how we take care of agents.</span></li>
      </ul>
      <h2 style="font-size:28px;margin:40px 0 12px">Guides to send your buyers</h2>
      {guide_links(['how-buying-new-construction-works', 'questions-to-ask-a-home-builder', 'buying-new-construction-with-a-home-to-sell', 'new-home-warranty-coverage'])}
    </div>
    <div class="card" id="register">
      <h3 style="font:500 28px/1.2 var(--display)">Register a client</h3>
      <p class="quiet small" style="margin-top:6px">Takes about a minute. I'll confirm by text or email. I work for D.R. Horton, the seller.</p>
      <form data-realtor-register novalidate>
        <div class="form-grid" style="margin-top:16px">
          <label class="field">Your name<input type="text" name="agent" autocomplete="name" required></label>
          <label class="field">Brokerage<input type="text" name="brokerage" autocomplete="organization"></label>
          <label class="field">Your phone <span class="hint">Optional</span><input type="tel" name="agent_phone" autocomplete="tel"></label>
          <label class="field">Your email<input type="email" name="agent_email" autocomplete="email" required></label>
          <label class="field full">Buyer's name<input type="text" name="buyer" required></label>
          <label class="field">When they'd like to move <span class="hint">Optional</span><select name="timing"><option value="">Choose one</option><option>In the next 3 months</option><option>In 3 to 6 months</option><option>In 6 to 12 months</option><option>Just looking</option></select></label>
          <label class="field">Preferred visit day <span class="hint">Optional</span><input type="text" name="visit_day" placeholder="For example: Saturday morning"></label>
          <label class="field full">What they need <span class="hint">Optional: beds, budget range, must-haves</span><textarea name="notes"></textarea></label>
        </div>
        <input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">
        <label class="check"><input type="checkbox" name="textok" value="yes"><span>Text me about this registration. Message and data rates may apply. Reply STOP to opt out.</span></label>
        <div class="actions"><button class="btn btn-brass" type="submit">Protect my client</button></div>
        <p class="form-note" role="status" hidden></p>
      </form>
    </div>
  </div>
</section>
<section class="section bg-white" id="monday">
  <div class="wrap">{signup('agents').replace("I'll email it to you each time I update it.", "The move-in ready list by email each week, before your buyers ask.")}</div>
</section>
'''
    write('/agents/', page('/agents/', 'For Agents: Register a Client | Charles Carper, D.R. Horton',
                           'Register your buyer before their first visit to Collins Ridge or any D.R. Horton community around Raleigh-Durham. Your client stays your client.',
                           body, active=None, scripts=['/js/forms.js']))


def privacy():
    body = f'''
<section class="page-head"><div class="wrap">{crumbs([('Home', '/'), ('Privacy', None)])}<h1>Privacy</h1><p class="lead">What this site collects, why, and who sees it.</p></div></section>
<section class="section tight"><div class="wrap prose">
  <h2>What I collect</h2>
  <p>Only what you type into a form or the chat: your name, email, phone and your message. When you ask for a full plan from one of the planners, a short summary of your answers comes with it, so I can follow up. The planners themselves run on your screen. What you type into them isn't sent anywhere unless you ask me to send you the plan.</p>
  <p>The site uses Google Analytics to count visits, and Microsoft Clarity to see how pages get used: clicks, taps and scrolling, with what you type into forms hidden. Forms and the chat run on HubSpot, which stores what you send me.</p>
  <h2>Why</h2>
  <p>To answer your question, send what you asked for, set up your visit, and follow up about it.</p>
  <h2>Who sees it</h2>
  <p>Me, and D.R. Horton, the builder I work for. If you're looking at a home in another community, the D.R. Horton sales consultant there. I don't sell your information.</p>
  <h2>Email and texts</h2>
  <p>Texts only go out if you checked the box to allow them, and you can reply STOP anytime. The weekly move-in ready list is email. Every email has a way to unsubscribe.</p>
  <h2>Questions</h2>
  <p>Call or text <a href="{sms()}">{PHONE_SHOW}</a>.</p>
</div></section>
'''
    write('/privacy/', page('/privacy/', 'Privacy | Charles Carper', 'What charlescarper.com collects, why, and who sees it.', body, robots='noindex'))


def disclosures():
    body = f'''
<section class="page-head"><div class="wrap">{crumbs([('Home', '/'), ('Disclosures', None)])}<h1>Disclosures</h1><p class="lead">Who I work for, where the prices come from, and what the planners can and can't tell you.</p></div></section>
<section class="section tight"><div class="wrap prose">
  <h2>Who I work for</h2>
  <p>I'm a new home sales consultant, and I work for D.R. Horton. This is my own website, not a D.R. Horton website. I work for the builder, which is the seller. You're always welcome to bring your own real estate agent.</p>
  <p>I don't list homes for sale. If you have a home to sell, pick a listing agent you like, and I'll work with them on your timing.</p>
  <h2>Prices and homes</h2>
  <p>Prices and homes come from drhorton.com and change often. Every price on this site is shown with the date I checked it. The move-in ready list is updated weekly, so a home can sell before the list catches up. Text me to check a home before you come.</p>
  <h2>The planners</h2>
  <p>{ESTIMATE_LINE} You type in your own numbers. No rate is filled in for you. For a real answer, talk to a lender: Laura Hall at DHI Mortgage, or any lender you like.</p>
  <h2>Special offers</h2>
  <p>There's often a special offer. It changes often, so I share the details one-on-one. Nothing here is an offer.</p>
  <h2>Photos</h2>
  <p>Photos show finished homes and the furnished model. The model is staged; some items don't come with the home.</p>
  <h2>My AI assistant</h2>
  <p>Some videos use my AI assistant. It's made from my face and voice, and I write what it says. Those videos are labeled.</p>
  <h2>Fair housing</h2>
  <p>Equal Housing Opportunity. I'll help anyone find a home that fits.</p>
</div></section>
'''
    write('/disclosures/', page('/disclosures/', 'Disclosures | Charles Carper', 'Who Charles Carper works for, where prices come from, and what the planners on this site can and cannot tell you.', body))


def not_found():
    body = f'''
<section class="page-head"><div class="wrap">
  <h1>This page isn't on the plans.</h1>
  <p class="lead">The link may be old, or the page moved. Here's where most people are headed.</p>
  <div class="actions"><a class="btn btn-brass" href="/visit/">Book a visit</a><a class="arrow" href="/move-in-ready/">See move-in ready homes</a><a class="arrow" href="/">Go to the home page</a></div>
</div></section>
<section class="section bg-white"><div class="wrap"><div class="head"><h2>Or start with your situation.</h2></div>{tiles()}</div></section>
'''
    write('/404.html', page('/404.html', 'Page not found | Charles Carper', 'This page moved or never existed.', body, robots='noindex'), sitemap=False)


def team_tools():
    body = '''
<section class="page-head"><div class="wrap"><h1>Team tools</h1><p class="lead">Tools I've built for working new construction sales. Bookmark this page; it isn't in the menu.</p></div></section>
<section class="section tight"><div class="wrap">
  <div class="table-wrap"><table class="schedule">
    <thead><tr><th scope="col">Tool</th><th scope="col">What it's for</th><th scope="col">Status</th></tr></thead>
    <tbody>
      <tr><td><a href="/plan/floor-plan-match/"><b>Floor Plan Match, Collins Ridge</b></a></td><td>Narrow the Collins Ridge plans with a buyer</td><td>Live</td></tr>
      <tr><td><a href="/plan/sell-and-buy/"><b>Sell &amp; Buy Planner</b></a></td><td>Public, for buyers: the path, the timeline and the numbers side by side</td><td>Live</td></tr>
      <tr><td><a href="/home-to-sell-planner/classic.html"><b>Home-to-Sell Planner (classic)</b></a></td><td>Sales-table version: ranked options, timeline, buyer text and CRM follow-ups</td><td>Live</td></tr>
      <tr><td><a href="/commission-tracker/"><b>Commission Tracker</b></a></td><td>Track sales, payouts and goals</td><td>Live</td></tr>
    </tbody>
  </table></div>
  <p class="note">This page is unlisted, not private. Anyone with the link can open it, and each tool's code is public on GitHub. Don't put buyer details or anything confidential into these tools' files.</p>
</div></section>
'''
    write('/tools.html', page('/tools.html', 'Team tools | Charles Carper', 'Unlisted tools for new construction sales.', body, robots='noindex, nofollow'), sitemap=False)


def build():
    home(); move_in_ready(); visit(); collins_ridge(); floor_plans(); faq(); plan_hub(); about(); agents(); privacy(); disclosures(); not_found(); team_tools()
