"""The 8 situation pages. Copy comes from the Page map tab. Named for the need, never the person."""
import re
from ccsite import (esc, page, write, shot, crumbs, closing, guide_links, plan_link, tool_tiles, disclose_line, sms, load_homes, home_card,
                    money, long_date, PRIMARY_DOWN, SUITE_DOWN, OFFICE)

# Each step: "Lead: rest" splits into a heading and a line.
S = [
    dict(slug='home-to-sell', crumb='I have a home to sell',
         title='Have a Home to Sell? Buy Your Next New Home in the Right Order | Charles Carper',
         desc='Sell first or buy first? Both can work. See your options side by side, check if you could carry two payments, and match your sale to a D.R. Horton build date.',
         h1='Sell first or buy first. Both can work.',
         sub='Some people sell first. Some buy first and pay for both for a while. Either way, you need a plan. Let\'s make yours.',
         tool=('Get my sell & buy plan', '/plan/sell-and-buy/'),
         shot=dict(n=5, alt='Charles Carper pointing at a floor plan on an iPad', note='Over your shoulder, pointing at a floor plan on the iPad. A buyer shows only from behind, with a release.', img='/assets/images/cc-hayden-flex.jpg', ghost='half', gx='38%'),
         problem='You have money in this house, but no room left in it. You\'re not sure what should come first: selling this one or buying the next.',
         empathy='This is the question I hear most. It\'s a fair one.',
         why='Most people I meet at Collins Ridge have a home to sell. I built the planner on this page to help them sort it out.',
         plan=['See your options side by side: sell first, buy first, a home-sale contingency (your purchase depends on your home selling), or a program that buys your home or lends against it.',
               'Check if you can pay both: a lender can tell you. If you can, buying first may be the easiest way to go.',
               'Match your sale to the build: a home that hasn\'t started gives you months to sell. A finished home moves fast.'],
         extras=[('Fine print', 'Each D.R. Horton home has its own rules for contingencies, and they can change. Ask me about the home you like.'),
                 ('Your agent', 'I don\'t list homes. Pick a great listing agent, and I\'ll work with them on your timing.')],
         tools=['sell-and-buy', 'two-mortgages'],
         stakes='Two payments you didn\'t plan for. Moving twice. Selling in a rush.',
         success='One move. The money from your old home goes into the new one. You pick the date.',
         homes=[('Room to spread out', [('Hanover', None), ('Hayden', None), ('Jackson', None)]), ('Everything on one floor', [('Cali', None), ('Sierra', None)])],
         guides=['buying-new-construction-with-a-home-to-sell', 'prequalified-vs-preapproved', 'how-long-does-new-construction-take'],
         close='Bring your plan. We\'ll walk the homes that fit your timing.'),
    dict(slug='renting', crumb="I'm renting",
         title='Renting? Time Your Lease and Buy a New Home | Charles Carper',
         desc='Find out what you can afford, and when to buy so your lease ends at the right time. Straight steps for first-time buyers looking at new D.R. Horton homes.',
         h1='Your rent is paying off a mortgage. Just not yours.',
         sub='Find out what you can afford, and when to buy so your lease ends at the right time.',
         tool=('Plan my lease-to-keys timing', '/plan/lease-to-keys/'),
         shot=dict(n=2, alt='Charles Carper at the model kitchen island with an iPad', note='Behind the island, iPad open on the counter, looking up at the camera mid-sentence.', img='/assets/images/cc-hayden-kitchen.jpg', ghost='half', gx='66%'),
         problem='Your rent went up again. You\'d like to own, but you don\'t know what a lender would say, or how to time it with your lease.',
         empathy='Most first-time buyers wait longer than they need to. It\'s not because they can\'t buy. Nobody showed them the steps.',
         why='I\'ll walk you through every step, in plain words, at your pace.',
         plan=['Get a rough number: what you can afford, using your own numbers.',
               'Line up the timing: pick a home that\'s ready about when your lease ends.',
               'Talk to a lender and get preapproved: pick a lender you trust. I\'m happy to share names. Ask about first-time buyer programs too.'],
         extras=[], tools=['lease-to-keys', 'buying-power'],
         stakes='Another year of rent. Another rent increase. A lease-break fee you didn\'t plan for.',
         success='You get your keys about when your lease ends, at a payment you planned for.',
         homes=[('Plans to start with', [('Robie', None), ('Landon', None), ('Sierra', None)])], homes_list=True,
         guides=['how-buying-new-construction-works', 'closing-costs-new-construction', 'prequalified-vs-preapproved', 'first-time-buyer-new-construction', 'down-payment-options-new-construction'],
         close='Bring your numbers. We\'ll find the homes that fit your lease.'),
    dict(slug='moving-to-raleigh-durham', crumb="I'm moving to Raleigh-Durham",
         title='Moving to Raleigh-Durham? Buy a New Home in One Trip | Charles Carper',
         desc='Pick the town first, then the home. See finished D.R. Horton homes on live video, then make one trip to decide. Straight answers from someone who is here.',
         h1='Buy here without flying down every weekend.',
         sub='Pick the town first, then the home. See finished homes on video, then make one trip to decide.',
         primary=('Book a video walkthrough', '/visit/?type=video'), tool=('See move-in ready homes', '/move-in-ready/'),
         shot=dict(n=12, alt='Downtown Hillsborough along Churton Street', note='Churton Street, the Riverwalk and Weaver Street Market in downtown Hillsborough. Wide, then vertical.', scene='downtown', ghost=None, ar='16 / 10'),
         problem='Your new job starts soon. You don\'t know the area yet. You may still have a home to sell where you live now.',
         empathy='Buying in a place you don\'t know is stressful. You want straight answers from someone who\'s here.',
         why='I\'ll walk finished homes with you live on video. I\'ll point out what I\'d check, and answer what you\'d ask if you were standing there.',
         plan=['Pick your area: tell me where you\'ll work, and I\'ll show you the two best areas and real drive times.',
               'Tour on video: we walk finished homes on FaceTime or Zoom.',
               'Make one trip: see your top two in person, then decide.'],
         extras=[], tools=['sell-and-buy', 'buying-power'],
         stakes='Weeks in a hotel or a short-term rental. Picking a home in a rush.',
         success='One trip. Keys by your start date.',
         homes=[('Plans to start with', [('Alec', None), ('Jackson', None), ('Calhoun', None)])], homes_list=True,
         guides=['living-in-hillsborough-nc', 'how-far-is-too-far-to-commute', 'how-to-choose-a-new-construction-community'],
         close='Tell me your start date. We\'ll plan one trip around it.', close_cta=('Book a video walkthrough', '/visit/?type=video')),
    dict(slug='one-floor', crumb='I want to live on one floor',
         title='One-Story and First-Floor Primary Homes in Hillsborough, NC | Charles Carper',
         desc='One-story homes, and homes with the primary bedroom on the first floor, a short walk from downtown Hillsborough. See which plans fit and how to time your sale.',
         h1='Live on one floor. Keep the stairs for guests.',
         sub='One-story homes, and homes with the primary bedroom on the first floor. A short walk from downtown Hillsborough.',
         tool=('Find my one-floor plans', '/plan/floor-plan-match/?start=one'),
         shot=dict(n=8, alt='A finished one-story Cali home at Collins Ridge', note='Single-story front elevation of a finished Cali. The hour before sunset. No people.', scene='onestory', ghost=None),
         problem='Your bedroom is upstairs, and the stairs feel like more every year. You want your daily life on one floor, but you still want room when family visits.',
         empathy='You don\'t need less home. You need the right rooms in the right places.',
         why='I built homes for almost two years. I can tell you how a plan really lives once the furniture is in.',
         plan=['Pick your style: one-story, or the primary bedroom downstairs with secondary bedrooms up.',
               'Time your sale: most people here are selling a home first, so we line that up too.',
               'Walk the plans that fit.'],
         extras=[('One-story or first-floor primary?', 'A one-story home has every room on one level. A first-floor primary plan keeps your bedroom, kitchen and living room downstairs, with secondary bedrooms upstairs for guests.')],
         tools=['floor-plan-match', 'sell-and-buy'],
         stakes='Another year of climbing stairs. A sale and a purchase that don\'t line up.',
         success='Your whole day on one floor. Room for guests when they come. Dinner downtown, a short walk away.',
         homes=[('Plans that fit', [('Cali', 'one-story'), ('Sierra', 'primary bedroom downstairs'), ('Savannah', 'townhome, primary bedroom downstairs')])],
         guides=['how-to-choose-a-floor-plan', 'buying-new-construction-with-a-home-to-sell', 'living-in-hillsborough-nc'],
         close='Come walk the one-floor plans.'),
    dict(slug='downstairs-suite', crumb='I need a bedroom and bath downstairs',
         title='Homes With a Bedroom and Full Bath Downstairs, Hillsborough NC | Charles Carper',
         desc='Plans with a full suite on the first floor, so everyone gets their own space. See which Collins Ridge plans put a full bath next to the downstairs bedroom.',
         h1='A bedroom downstairs isn\'t enough. It needs its own bathroom.',
         sub='Plans with a full suite on the first floor, so everyone gets their own space.',
         tool=('See plans with a downstairs suite', '/plan/floor-plan-match/?start=guest'),
         shot=dict(n=7, alt='A downstairs bedroom and its full bath in a finished home', note='Room only, no person. Corner to corner, with the bath door showing so it reads as a suite. Calhoun or Landon, finished.', img='/assets/images/cc-hayden-bedroom.jpg', ghost=None),
         problem='Someone is moving in with you, or may soon. Every bedroom in your home now is upstairs.',
         empathy='You want a room that feels like theirs, not a guest room squeezed in.',
         why='I know which plans put a full bath right next to the downstairs bedroom, and which ones don\'t.',
         plan=['Check the must-haves: a real bedroom, a full bath and some privacy.',
               'Pick the plan: a downstairs bedroom with its own full bath, or a dual primary plan with a second primary suite on the first floor.',
               'Walk it in person before anyone moves in.'],
         extras=[], tools=['floor-plan-match', 'sell-and-buy'],
         stakes='A downstairs room that doesn\'t really work, and another move later.',
         success='Together, not on top of each other.',
         homes=[('Plans that fit', [('Calhoun', 'dual primary, with a second primary suite downstairs'), ('Hanover', 'option for a 5th bedroom and full bath downstairs'), ('Alec', 'bedroom and full bath downstairs')])],
         guides=['how-to-choose-a-floor-plan', 'questions-to-ask-a-home-builder'],
         close='Walk the downstairs suites before anyone moves in.'),
    dict(slug='work-from-home', crumb='I work from home',
         title='Floor Plans With a Real Home Office, Hillsborough NC | Charles Carper',
         desc='Floor plans with a real office, or two, plus distances to RTP, Duke and UNC. Come close the door in the model flex room yourself.',
         h1='A flex room is only flexible if it has a door.',
         sub='Floor plans with a real office, or two, plus the drive time for your office days.',
         tool=('Find plans with an office', '/plan/floor-plan-match/?start=office'),
         shot=dict(n=6, alt='Closing the flex-room door in the model home', note='From inside the model flex room, closing the door. Show the hand and the door, not a face.', img='/assets/images/cc-hayden-flex.jpg', ghost=None),
         problem='You take calls from the kitchen table. If two of you work from home, you talk over each other all day.',
         empathy='You don\'t want more square feet. You want the right rooms.',
         why='I\'ll show you where each plan puts the office, and how far it sits from the kitchen and living room.',
         plan=['Count your offices: one or two, and whether each needs a door.',
               'Check the drive: real distances to RTP, Duke and UNC, then try it on an office day.',
               'Stand in the room: close the door in the model\'s flex room and see how it feels.'],
         extras=[('Distances from the model', 'Duke University Hospital, about 11.7 miles. Franklin Street in Chapel Hill, about 11.9. Research Triangle Park, about 21. <a href="/collins-ridge/#area">See all distances</a>')],
         tools=['floor-plan-match', 'buying-power'],
         stakes='Another year of calls from the kitchen table.',
         success='A door that closes, and a short drive on office days.',
         homes=[('Plans that fit', [('Galen', 'flex room downstairs'), ('Hayden', 'a bedroom and a flex room downstairs'), ('Landon', 'bedroom downstairs, second living room upstairs')])],
         guides=['how-to-choose-a-floor-plan', 'how-far-is-too-far-to-commute', 'what-to-look-for-near-a-new-home'],
         close='Come close the door yourself.'),
    dict(slug='va-loan', crumb="I'm using my VA loan",
         title='Using a VA Loan on a New Construction Home in NC | Charles Carper',
         desc='Yes, you can use your VA loan on a brand-new home. The steps, the myths, and a lender who does VA loans all the time. Straight answers from a fellow veteran.',
         h1='Yes, you can use your VA loan on a brand-new home.',
         sub='The steps, the myths, and a lender who does VA loans all the time.',
         tool=('See the VA steps', '#plan'),
         shot=dict(n=2, alt='Charles Carper at the model kitchen island', note='Behind the island, iPad open on the counter, looking up at the camera mid-sentence.', img='/assets/images/cc-hayden-kitchen.jpg', ghost='half', gx='66%'),
         problem='Someone told you builders don\'t like VA loans. You\'re not sure about the funding fee, or how to time it with your lease or job.',
         empathy='You earned this benefit. You want a straight answer.',
         why='I\'m a veteran too. I\'ll give it to you straight.',
         plan=['Get your Certificate of Eligibility: a lender can pull it for you.',
               'Talk to a lender who does VA loans often: I\'m happy to share names.',
               'Pick a home and time it with your lease or your job.'],
         extras=[('The funding fee', 'Ask your lender how it applies to you. Some veterans don\'t pay it.')],
         tools=['buying-power', 'lease-to-keys'], tool_qs={'buying-power': '?loan=va'},
         tools_note='About two minutes. The Buying Power Estimate has a VA loan option, with no monthly mortgage insurance.',
         stakes='Renting longer because of a myth.',
         success='Your benefit, used the right way. A brand-new home. No surprises.',
         homes=[('Plans to start with', [('Landon', None), ('Robie', None), ('Cali', None)])],
         guides=['down-payment-options-new-construction', 'prequalified-vs-preapproved', 'closing-costs-new-construction'],
         close='Bring your questions. I\'ll give you straight answers.'),
    dict(slug='low-maintenance', crumb='I want a low-maintenance home',
         title='Low-Maintenance Townhomes in Hillsborough, NC | Charles Carper',
         desc='Own your home and skip the yard work. Collins Ridge townhomes where the HOA takes care of the lawn and the outside of the home. See exactly what the HOA covers.',
         h1='Own your home. Skip the yard work.',
         sub='Townhomes where the HOA takes care of the lawn and the outside of the home. More time for the things you\'d rather do.',
         tool=('See townhomes ready now', '#ready'),
         shot=dict(n=9, alt='A row of finished Collins Ridge townhomes with 2-car garages', note='The townhome row and its 2-car garages. Finished Savannah or Linville. No people.', scene='townhomes', ghost=None),
         problem='Your days are full. Maybe you work long shifts. Maybe you\'re done spending weekends on the lawn, the gutters and the trim. Either way, you want a home that doesn\'t take all your time.',
         empathy='You want a place that\'s yours, without a long list of chores.',
         why='Before you decide, I\'ll show you exactly what the HOA covers, right in the HOA papers.',
         plan=['Tell me what you\'re done taking care of.',
               'Read what the HOA covers, together.',
               'Walk the townhomes: then time your move around your home sale, your lease, or a home that\'s ready now.'],
         extras=[('What the HOA covers', 'At Collins Ridge, the townhome HOA takes care of the outside of the home, the roof shingles, the gutters and the lawn. Ask me for the current HOA papers.')],
         tools=['sell-and-buy', 'buying-power'], tools_note='The Sell & Buy Planner if you have a home to sell. The Buying Power Estimate if you rent.',
         stakes='More weekends on yard work. More of your time on the house, less on your life.',
         success='A home that\'s yours. Your time stays yours. Lock the door and go.',
         homes=[('Townhomes', [('Savannah', 'primary bedroom downstairs'), ('Linville', 'bedroom and full bath downstairs')])], homes_note='Both are townhomes with a 2-car garage.',
         guides=['hoa-fees-and-amenities', 'true-cost-of-owning-a-home', 'new-home-maintenance-checklist'],
         close='Come see the townhomes, and read the HOA papers with me.'),
]


CR_ORDER = {'ready': 0, 'almost': 1, 'building': 2, 'notstarted': 3}
# What "homes that fit" means for each profile, at Collins Ridge, from the weekly list.
READY = {
    'home-to-sell': dict(h='At Collins Ridge right now', mix=True,
                         note='Ready now if you want to move soon. Being built if you need a few months to sell.'),
    'renting': dict(h='Ready now at Collins Ridge', price_line=True),
    'moving-to-raleigh-durham': dict(h='Finished homes I can walk you through on video'),
    'one-floor': dict(h='Ready now, with your bedroom downstairs', q='?beddown=1',
                      pick=lambda h: h.get('stories') == 1 or h.get('plan') in PRIMARY_DOWN),
    'downstairs-suite': dict(h='Ready now, with a bedroom and full bath downstairs', q='?beddown=1',
                             pick=lambda h: h.get('plan') in SUITE_DOWN),
    'work-from-home': dict(h='Ready now, with room for an office', pick=lambda h: h.get('plan') in OFFICE),
    'va-loan': dict(h='Ready now at Collins Ridge', price_line=True),
    'low-maintenance': dict(h='Townhomes ready now', q='?townhome=1', pick=lambda h: h.get('type') == 'townhome'),
}


def ready_block(slug):
    """Collins Ridge homes from this week's list that fit the profile. The Monday refresh rebuilds it."""
    cfg = READY[slug]
    d = load_homes()
    pick = cfg.get('pick', lambda h: True)
    cr = sorted([h for h in d['homes'] if h['community'].startswith('Collins Ridge') and pick(h)],
                key=lambda h: (CR_ORDER.get(h['status'], 9), h['price']))
    done = [h for h in cr if h['status'] in ('ready', 'almost')]
    later = [h for h in cr if h['status'] not in ('ready', 'almost')]
    show = (done[:2] + later[:1]) if cfg.get('mix') else done[:3]
    rest = [h for h in later if h not in show]
    intro = ''
    if cfg.get('price_line'):
        cr_all = [h['price'] for h in d['homes'] if h['community'].startswith('Collins Ridge')]
        near = [h['price'] for h in d['homes'] if not h['community'].startswith('Collins Ridge') and h['status'] in ('ready', 'almost')]
        if cr_all and near:
            intro = ('Collins Ridge homes start at ' + money(min(cr_all)) + ' right now. Move-in ready homes around Raleigh-Durham start at ' +
                     money(min(near)) + '. ')
    intro += cfg.get('note', '') + (' ' if cfg.get('note') else '')
    intro += ('Prices as of ' + long_date(d['asOf']) + '. I update this list weekly, and homes can sell before it catches up, so text me to check one.')
    if show:
        cards = '<ul class="homes">' + ''.join(home_card(h, d['asOf'], i) for i, h in enumerate(show)) + '</ul>'
    else:
        cards = ('<div class="callout"><p style="margin:0">None ready at Collins Ridge this week. <a href="' +
                 esc(sms("Hi Charles, tell me when a home that fits me is ready at Collins Ridge. I need: ")) +
                 '">Text me what you need</a>, and I\'ll tell you when one comes up.</p></div>')
    more = ''
    if rest and not cfg.get('mix'):
        more = ('<p class="quiet" style="margin-top:16px">Also being built: ' +
                '; '.join('the ' + esc(h.get('plan') or 'home') + ' (' + money(h['price']) + ')' for h in rest[:3]) + '. Ask me when they\'ll be ready.</p>')
    return ('<section class="section bg-white" id="ready"><div class="wrap"><div class="head-row"><div><h2>' + esc(cfg['h']) + '</h2>'
            '<p class="quiet">' + esc(intro) + '</p></div><a class="arrow" href="/move-in-ready/' + cfg.get('q', '') + '">See more move-in ready homes</a></div>' +
            cards + more + '</div></section>')


def step(text):
    m = re.match(r'([^:]{3,60}):\s*(.+)', text)
    if m:
        return '<li><h3>' + esc(m.group(1)) + '</h3><p>' + esc(m.group(2)[0].upper() + m.group(2)[1:]) + '</p></li>'
    first, _, rest = text.partition('. ')
    return '<li><h3>' + esc(first.rstrip('.')) + '</h3>' + ('<p>' + esc(rest) + '</p>' if rest else '') + '</li>'


def situation(d):
    primary = d.get('primary', ('Book a visit', '/visit/?situation=' + d['slug']))
    tool_label, tool_href = d['tool']
    extras = ''.join('<div class="callout"><h3>' + esc(h) + '</h3><p style="margin-top:6px">' + (t if '<a ' in t else esc(t)) + '</p></div>' for h, t in d['extras'])
    homes = ''
    for label, plans in d['homes']:
        homes += '<h3 style="margin:0 0 10px">' + esc(label) + '</h3><ul class="links-list" style="margin-bottom:20px">' + ''.join(
            '<li>' + plan_link(n, note).replace('<a ', '<a style="display:block;padding:14px 0;text-decoration:none;color:var(--ink);font-weight:500" ') + '</li>' for n, note in plans) + '</ul>'
    if d.get('homes_note'):
        homes += '<p class="quiet">' + esc(d['homes_note']) + '</p>'
    body = f'''
<section class="page-head">
  <div class="wrap split">
    <div>
      {crumbs([('Home', '/'), (d['crumb'], None)])}
      <h1>{esc(d['h1'])}</h1>
      <p class="lead">{esc(d['sub'])}</p>
      <div class="actions"><a class="btn btn-brass" href="{primary[1]}">{esc(primary[0])}</a><a class="btn btn-line" href="{tool_href}">{esc(tool_label)}</a></div>
    </div>
    {shot(**d['shot'], eager=True)}
  </div>
</section>
<section class="section bg-white">
  <div class="wrap split top">
    <div><p class="eyebrow">Sound familiar?</p><p class="pull">{esc(d['problem'])}</p></div>
    <div><p class="lead" style="font-weight:500">{esc(d['empathy'])}</p><p>{esc(d['why'])}</p></div>
  </div>
</section>
<section class="section" id="plan">
  <div class="wrap">
    <h2 style="margin-bottom:40px">Here's the plan.</h2>
    <ol class="steps-num">{''.join(step(s) for s in d['plan'])}</ol>
    {('<div class="grid">' + extras + '</div>') if extras else ''}
  </div>
</section>
{ready_block(d['slug'])}
<section class="section" id="tools">
  <div class="wrap">
    <div class="head"><h2>Get a quick answer first.</h2><p class="quiet">{esc(d.get('tools_note', 'About two minutes. You type in your own numbers, so the answer is an estimate, not a loan offer.'))}</p></div>
    {tool_tiles(d['tools'], d.get('tool_qs'))}
  </div>
</section>
<section class="section bg-white">
  <div class="wrap">
    <div class="stakes">
      <div><p class="eyebrow">What's at stake</p><p class="pull" style="color:var(--ink)">{esc(d['stakes'])}</p></div>
      <div><p class="eyebrow">When it works</p><p class="pull" style="color:var(--ink)">{esc(d['success'])}</p></div>
    </div>
  </div>
</section>
<section class="section" id="homes">
  <div class="wrap split top">
    <div>
      <h2 style="margin-bottom:24px">Plans that fit</h2>
      {homes}
      <div class="actions"><a class="arrow" href="/collins-ridge/floor-plans/">See all 12 plans</a></div>
    </div>
    <div>
      <h2 style="margin-bottom:24px">Learn more</h2>
      {guide_links(d['guides'])}
    </div>
  </div>
</section>
<section class="section tight bg-white"><div class="wrap">{disclose_line()}</div></section>
{closing(d['close'], cta=d.get('close_cta', primary)[0], href=d.get('close_cta', primary)[1])}
'''
    path = '/buyers/' + d['slug'] + '/'
    schema = [{"@context": "https://schema.org", "@type": "BreadcrumbList", "itemListElement": [
        {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://charlescarper.com/"},
        {"@type": "ListItem", "position": 2, "name": d['crumb'], "item": "https://charlescarper.com" + path}]}]
    fine = ['prices', 'sqft'] + (['model'] if 'cc-hayden' in d['shot'].get('img', '') else [])
    write(path, page(path, d['title'], d['desc'], body, schema=schema, fine=fine, revised=load_homes()['asOf']))


def build():
    for d in S:
        situation(d)
