#!/usr/bin/env python3
"""charlescarper.com builder (2026 rebuild).

Run from the repo root:  python3 _build/build.py

What it does
1. Writes every page in pages_*.py with the shared head, top strip, header, footer and mobile bar.
2. Re-skins the existing guides in /guides/ in place: keeps each guide's <main>, swaps the chrome,
   and applies the wording and link fixes in GUIDE_FIXES. Safe to run again.
3. Writes redirect stubs for retired URLs, sitemap.xml and the home-card markup from data/move-in-ready.json.

The Page map tab of the lead strategy doc is the source for the copy. Change copy here, then rebuild.
"""
import datetime as dt
import html
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

SITE = 'https://charlescarper.com'
PHONE = '+19843282788'
PHONE_SHOW = '984-328-2788'
MODEL_ADDRESS = '116 Sea Trail St, Hillsborough, NC 27278'
MODEL_MAP = 'https://www.google.com/maps/dir/?api=1&destination=116%20Sea%20Trail%20St%2C%20Hillsborough%2C%20NC%2027278'
HS_MEETING = 'https://meetings-na2.hubspot.com/charles-carper'
CALL_EMBED = 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ3cw7jvoA1zLMv16S7_4RMyfNGmYtW2w39wFeBwaVV0Msfd9rnRX8cDYqhESc7mQjj3Eqa9gGZm?gv=true'
CALL_LINK = 'https://calendar.app.google/d6v5iNEtpqDeTvEE9'

# Placeholder labels on stand-in photos. Set to False once the real shoot is in.
SHOW_PLACEHOLDERS = False

VERSION = dt.datetime.now().strftime('%Y%m%d%H%M')
TODAY = dt.date.today().isoformat()

esc = lambda s: html.escape(str(s), quote=True)


def sms(body=''):
    return 'sms:' + PHONE + ('?&body=' + __import__('urllib.parse').parse.quote(body) if body else '')


# ---------------------------------------------------------------------------
# Shared data
# ---------------------------------------------------------------------------
NAV = [
    ('homes', '/move-in-ready/', 'Move-in ready homes'),
    ('collins', '/collins-ridge/', 'Collins Ridge'),
    ('plan', '/plan/', 'Plan your move'),
    ('guides', '/guides/', 'Guides'),
    ('about', '/about/', 'About'),
]

SITUATIONS = [
    # slug, tile title, tile line, short label for forms
    ('home-to-sell', 'I have a home to sell', "Sell first or buy first. Both can work. We'll find the one that fits you.", 'I have a home to sell'),
    ('renting', "I'm renting", 'Time it so your lease ends when your new home is ready.', "I'm renting"),
    ('moving-to-raleigh-durham', "I'm moving to Raleigh-Durham", 'See homes on video. Make one trip. Move in by your start date.', "I'm moving to Raleigh-Durham"),
    ('one-floor', 'I want to live on one floor', 'One-story homes, or homes with the primary bedroom on the first floor.', 'I want to live on one floor'),
    ('downstairs-suite', 'I need a bedroom and bath downstairs', 'A full suite on the first floor, so everyone gets their own space.', 'I need a bedroom and bath downstairs'),
    ('work-from-home', 'I work from home', 'Floor plans with a real office, and a door that closes.', 'I work from home'),
    ('va-loan', "I'm using my VA loan", "Yes, you can use it on a brand-new home. Here's how.", "I'm using my VA loan"),
    ('low-maintenance', 'I want a low-maintenance home', 'Townhomes where the HOA takes care of the lawn and the outside. More free time for you.', 'I want a low-maintenance home'),
]

TOOLS = {
    'sell-and-buy': ('/plan/sell-and-buy/', 'Sell & Buy Planner', 'Should you sell first, buy first, or do both at once?'),
    'two-mortgages': ('/plan/two-mortgages/', 'Two-Mortgage Check', 'Could you pay two mortgages while your home sells?'),
    'lease-to-keys': ('/plan/lease-to-keys/', 'Lease-to-Keys Planner', 'When should you buy so your lease ends at the right time?'),
    'buying-power': ('/plan/buying-power/', 'Buying Power Estimate', 'How much home can you afford?'),
    'floor-plan-match': ('/plan/floor-plan-match/', 'Floor Plan Match', 'Which two Collins Ridge floor plans fit how you live?'),
}

# Collins Ridge plans. Lines from the Page map tab; room counts from the builder's published plan info.
PLANS_ASOF = 'Oct 20, 2026'
PLANS = [
    ('Savannah', 'Townhome', 4, '2.5', 2, 'The primary bedroom is on the first floor, with a big loft upstairs', '$380s'),
    ('Linville', 'Townhome', 4, '3', 2, 'A bedroom and full bath on the first floor', '$390s'),
    ('Robie', 'Single-family', 5, '3', 2, '5 bedrooms on a 40-foot homesite, with a bedroom and full bath downstairs', '$418s'),
    ('Sierra', 'Single-family', 4, '2.5', 2, 'The primary bedroom is on the first floor; secondary bedrooms and a living room upstairs', '$419s'),
    ('Cali', 'Single-family', 4, '2', 1, 'The one-story plan: everything on one level', '$430s'),
    ('Landon', 'Single-family', 4, '3', 2, 'A bedroom and full bath downstairs, and a second living room upstairs', '$431s'),
    ('Galen', 'Single-family', 3, '2.5', 2, 'A flex room on the first floor that works as an office', '$445s'),
    ('Hayden', 'Single-family', 5, '3', 2, "A bedroom, full bath and flex room downstairs. It's the furnished model.", '$460s'),
    ('Alec', 'Single-family', 4, '3', 2, 'The garage is in back, so the front porch faces the street', '$470s'),
    ('Hanover', 'Single-family', 4, '2.5', 2, 'The biggest plan, with an option for a 5th bedroom and full bath downstairs', '$477s'),
    ('Calhoun', 'Single-family', 4, '3.5', 2, 'Dual primary: one primary suite upstairs and one on the first floor', '$480s'),
    ('Jackson', 'Single-family', 5, '3', 2, "5 bedrooms, one downstairs with a full bath, plus a butler's pantry", '$485s'),
]
PLAN_NAMES = [p[0] for p in PLANS]


def plan_link(name, note=None):
    """A plan name that links to its card on the floor plans page."""
    label = esc(name) + (' <span class="quiet">(' + esc(note) + ')</span>' if note else '')
    return '<a href="/collins-ridge/floor-plans/#' + name.lower() + '">' + label + '</a>'


GUIDE_TITLES = {}


def guide_title(slug):
    if not GUIDE_TITLES:
        for f in os.listdir(os.path.join(ROOT, 'guides')):
            if not f.endswith('.html') or f == 'index.html':
                continue
            s = open(os.path.join(ROOT, 'guides', f), encoding='utf-8').read()
            m = re.search(r'<h1>([^<]+)</h1>', s)
            if m:
                GUIDE_TITLES[f[:-5]] = html.unescape(m.group(1))
    return GUIDE_TITLES.get(slug)


def guide_links(slugs):
    items = []
    for slug in slugs:
        t = guide_title(slug)
        if t:
            items.append('<li><a href="/guides/' + slug + '">' + esc(t) + '</a></li>')
    return '<ul class="links-list">' + ''.join(items) + '</ul>'


# ---------------------------------------------------------------------------
# Components
# ---------------------------------------------------------------------------
GHOST = {
    # stand-in figures from the redesign canvas, drawn dashed so nobody mistakes them for a person
    'stand': '<svg class="ghost" aria-hidden="true" viewBox="0 0 120 340"><g fill="rgba(22,33,43,0.74)" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="4 3"><ellipse cx="60" cy="34" rx="19" ry="23"/><path d="M52 54 L68 54 L70 66 L50 66 Z"/><path d="M24 70 Q60 58 96 70 L104 192 L16 192 Z"/><path d="M24 72 L10 182 Q12 190 20 188 L32 98 Z"/><path d="M96 72 L110 182 Q108 190 100 188 L88 98 Z"/><path d="M22 190 L56 190 L54 336 L36 336 Z"/><path d="M64 190 L98 190 L84 336 L66 336 Z"/></g></svg>',
    'half': '<svg class="ghost" aria-hidden="true" viewBox="0 0 120 200"><g fill="rgba(22,33,43,0.74)" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="4 3"><ellipse cx="60" cy="34" rx="19" ry="23"/><path d="M52 54 L68 54 L70 66 L50 66 Z"/><path d="M24 70 Q60 58 96 70 L104 200 L16 200 Z"/><path d="M24 72 L10 182 Q12 190 20 188 L32 98 Z"/><path d="M96 72 L110 182 Q108 190 100 188 L88 98 Z"/></g></svg>',
}

SCENES = {
    'street': '<svg aria-hidden="true" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%"><rect width="400" height="300" fill="#EDE6DA"/><circle cx="62" cy="118" r="20" fill="#E8C27A"/><rect y="150" width="400" height="150" fill="#C9CDB8"/><polygon points="0,150 40,108 80,150" fill="#A99F90"/><rect x="6" y="148" width="68" height="40" fill="#CFC6B8"/><polygon points="86,150 132,100 178,150" fill="#8F8678"/><rect x="92" y="148" width="80" height="46" fill="#D9CFC0"/><polygon points="226,150 270,104 314,150" fill="#9C9183"/><rect x="232" y="148" width="76" height="44" fill="#CFC6B8"/><polygon points="324,150 364,112 404,150" fill="#A99F90"/><rect x="330" y="148" width="70" height="40" fill="#D9CFC0"/><polygon points="150,300 262,300 214,170 194,170" fill="#DCD5CA"/><rect y="194" width="400" height="10" fill="#BFC4AE"/></svg>',
    'onestory': '<svg aria-hidden="true" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%"><rect width="400" height="300" fill="#E9E4DA"/><rect y="226" width="400" height="74" fill="#D3D9C4"/><rect x="60" y="150" width="280" height="76" fill="#CFC6B8"/><polygon points="48,154 200,96 352,154" fill="#9C9183"/><rect x="236" y="168" width="84" height="58" fill="#EFEBE4"/><rect x="118" y="172" width="24" height="54" fill="#8A7F70"/><rect x="156" y="170" width="30" height="24" fill="#F5F2EC"/><rect x="76" y="170" width="30" height="24" fill="#F5F2EC"/></svg>',
    'townhomes': '<svg aria-hidden="true" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%"><rect width="400" height="300" fill="#E9E4DA"/><rect y="236" width="400" height="64" fill="#D3D9C4"/><g fill="#CFC6B8"><rect x="20" y="110" width="88" height="126"/><rect x="112" y="104" width="88" height="132" fill="#D9CFC0"/><rect x="204" y="110" width="88" height="126"/><rect x="296" y="104" width="88" height="132" fill="#D9CFC0"/></g><g fill="#8F8678"><polygon points="14,112 64,80 114,112"/><polygon points="106,106 156,74 206,106"/><polygon points="198,112 248,80 298,112"/><polygon points="290,106 340,74 390,106"/></g><g fill="#EFEBE4"><rect x="30" y="188" width="56" height="48"/><rect x="122" y="188" width="56" height="48"/><rect x="214" y="188" width="56" height="48"/><rect x="306" y="188" width="56" height="48"/></g><g fill="#F5F2EC"><rect x="40" y="130" width="22" height="20"/><rect x="132" y="126" width="22" height="20"/><rect x="224" y="130" width="22" height="20"/><rect x="316" y="126" width="22" height="20"/></g></svg>',
    'amenity': '<svg aria-hidden="true" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%"><rect width="400" height="300" fill="#EDE6DA"/><rect y="170" width="400" height="130" fill="#C9CDB8"/><rect x="60" y="196" width="280" height="64" rx="6" fill="#9FC3C9"/><rect x="250" y="110" width="120" height="70" fill="#D9CFC0"/><polygon points="240,112 310,76 380,112" fill="#8F8678"/><rect x="270" y="130" width="22" height="20" fill="#F5F2EC"/><rect x="320" y="130" width="22" height="20" fill="#F5F2EC"/></svg>',
    'downtown': '<svg aria-hidden="true" viewBox="0 0 400 225" preserveAspectRatio="xMidYMid slice" style="position:absolute;inset:0;width:100%;height:100%"><rect width="400" height="225" fill="#EDE6DA"/><rect y="120" width="400" height="105" fill="#D8D0C2"/><rect x="10" y="64" width="80" height="62" fill="#C9B9A3"/><rect x="10" y="64" width="80" height="12" fill="#8F7C66"/><rect x="100" y="54" width="90" height="72" fill="#D3C6B4"/><rect x="100" y="54" width="90" height="12" fill="#7E8A84"/><rect x="200" y="70" width="84" height="56" fill="#C4B29C"/><rect x="200" y="70" width="84" height="12" fill="#8C6F5A"/><rect x="294" y="58" width="96" height="68" fill="#D6CAB8"/><rect x="294" y="58" width="96" height="12" fill="#6F7E86"/><rect y="126" width="400" height="8" fill="#BFB6A8"/></svg>',
}


IMG_ALT = {
    'cc-hayden-living.jpg': 'The great room in the Hayden model home at Collins Ridge, staged',
    'cc-hayden-kitchen.jpg': 'The kitchen in the Hayden model home at Collins Ridge, staged',
    'cc-hayden-flex.jpg': 'The flex room in the Hayden model home at Collins Ridge, staged',
    'cc-hayden-bedroom.jpg': 'A bedroom in the Hayden model home at Collins Ridge, staged',
    'cc-about.jpg': 'Charles Carper at the Collins Ridge model home',
}


def shot(n, alt, note, img=None, scene=None, ar='4 / 3', ghost='stand', gx='60%', caption=None, eager=False):
    """A photo slot. Until the shoot is in, it shows a stand-in with the shot number and the direction."""
    inner = ''
    if img and not SHOW_PLACEHOLDERS:
        alt = IMG_ALT.get(img.rsplit('/', 1)[-1], alt)  # describe the photo that's really there, not the planned shot
    if img:
        inner += '<img src="' + img + '" alt="' + esc(alt) + '"' + ('' if eager else ' loading="lazy"') + ' width="960" height="720">'
    elif scene:
        inner += SCENES[scene]
    if ghost:
        inner += GHOST[ghost]
    inner += '<span class="shot-label">Shot ' + str(n) + ' · placeholder</span>'
    if note:
        inner += '<span class="shot-note">' + esc(note) + '</span>'
    if img:
        a11y = ''
    elif SHOW_PLACEHOLDERS:
        a11y = ' role="img" aria-label="' + esc(alt) + '"'
    else:
        a11y = ' aria-hidden="true"'  # a drawing stands in until the shoot; nothing to announce
    fig = '<figure class="shot" style="--ar:' + ar + ';--gx:' + gx + '"' + a11y + '>' + inner + '</figure>'
    if caption:
        fig = '<div>' + fig + '<p class="shot-cap">' + esc(caption) + '</p></div>'
    return fig


HOUSE_SVG = ['<svg aria-hidden="true" viewBox="0 0 400 300"><rect width="400" height="300" fill="#E9E4DA"/><rect y="232" width="400" height="68" fill="#D3D9C4"/><rect x="96" y="132" width="212" height="100" fill="#CFC6B8"/><polygon points="84,136 202,66 320,136" fill="#9C9183"/><rect x="206" y="168" width="84" height="64" fill="#EFEBE4"/><rect x="128" y="174" width="26" height="58" fill="#8A7F70"/><rect x="166" y="150" width="28" height="24" fill="#F5F2EC"/><rect x="226" y="146" width="28" height="18" fill="#F5F2EC"/></svg>',
             '<svg aria-hidden="true" viewBox="0 0 400 300"><rect width="400" height="300" fill="#E9E4DA"/><rect y="232" width="400" height="68" fill="#D3D9C4"/><rect x="70" y="120" width="260" height="112" fill="#C7CCD0"/><polygon points="58,124 200,58 342,124" fill="#7F8890"/><rect x="226" y="166" width="88" height="66" fill="#EFEBE4"/><rect x="112" y="172" width="26" height="60" fill="#5E6870"/><rect x="150" y="140" width="30" height="26" fill="#F5F2EC"/><rect x="246" y="134" width="30" height="20" fill="#F5F2EC"/></svg>',
             '<svg aria-hidden="true" viewBox="0 0 400 300"><rect width="400" height="300" fill="#E9E4DA"/><rect y="232" width="400" height="68" fill="#D3D9C4"/><rect x="104" y="112" width="196" height="120" fill="#D9CFC0"/><polygon points="92,116 202,52 312,116" fill="#8F8678"/><rect x="210" y="170" width="78" height="62" fill="#EFEBE4"/><rect x="136" y="176" width="24" height="56" fill="#7A7064"/><rect x="136" y="128" width="26" height="24" fill="#F5F2EC"/><rect x="228" y="128" width="26" height="24" fill="#F5F2EC"/></svg>']


def load_homes():
    p = os.path.join(ROOT, 'data', 'move-in-ready.json')
    with open(p, encoding='utf-8') as f:
        return json.load(f)


def short_date(iso):
    d = dt.date.fromisoformat(iso)
    return d.strftime('%b ') + str(d.day)


def long_date(iso):
    d = dt.date.fromisoformat(iso)
    return d.strftime('%B ') + str(d.day) + ', ' + str(d.year)


def money(n):
    return '${:,.0f}'.format(n)


def home_card(h, asof, i=0):
    beds = h.get('beds'); baths = h.get('baths'); sqft = h.get('sqft'); garage = h.get('garage')
    specs = []
    if beds: specs.append(str(beds) + ' bed')
    if baths: specs.append(('%g' % baths) + ' bath')
    if sqft: specs.append('{:,}'.format(sqft) + ' sq ft')
    if garage: specs.append(str(garage) + '-car')
    badge = {'ready': '<span class="badge badge-ready">Move-in ready</span>',
             'almost': '<span class="badge badge-soon">Almost finished</span>',
             'building': '<span class="badge badge-build">Being built</span>',
             'notstarted': '<span class="badge badge-build">Not started yet</span>'}.get(h.get('status'), '')
    label = (h.get('plan') + ' at ' if h.get('plan') else '') + h['community'] + ', ' + h['town']
    if h.get('address'):
        label += ' (' + h['address'] + ')'
    q = __import__('urllib.parse').parse.urlencode({'home': label})
    media = ('<img src="' + esc(h['photo']) + '" alt="' + esc(label) + '" loading="lazy">' if h.get('photo')
             else HOUSE_SVG[i % 3] + ('<span class="media-label">Home photo · from drhorton.com</span>' if SHOW_PLACEHOLDERS else ''))
    attrs = ' '.join('data-' + k + '="' + esc(v) + '"' for k, v in [
        ('town', h['town']), ('price', h.get('price', 0)), ('beds', beds or 0), ('sqft', sqft or 0),
        ('stories', h.get('stories', 2)), ('type', h.get('type', 'single-family')), ('rear', 'yes' if h.get('rearLoad') else 'no'),
        ('status', h.get('status', ''))])
    return ('<li class="home-card" ' + attrs + '><div class="home-media">' + media + '</div><div class="home-body">'
            '<div class="home-where">' + esc(h['community']) + ' · ' + esc(h['town']) + '</div>'
            '<div class="home-price"><b>' + money(h['price']) + '</b><small>as of ' + short_date(asof) + '</small></div>'
            + ('<div class="home-plan">' + ('The ' + esc(h['plan']) + ' plan' if h.get('plan') else '') + (' · ' if h.get('plan') and h.get('type') == 'townhome' else '') + ('Townhome' if h.get('type') == 'townhome' else '') + '</div>' if h.get('plan') or h.get('type') == 'townhome' else '') +
            '<div class="specs">' + ' · '.join(specs) + '</div>' + badge +
            '<a class="arrow" href="/visit/?' + q + '">Book a visit to see this home</a></div></li>')


def homes_grid(n=None):
    d = load_homes()
    homes = d['homes'][:n] if n else d['homes']
    return '<ul class="homes" data-homes>' + ''.join(home_card(h, d['asOf'], i) for i, h in enumerate(homes)) + '</ul>'


def tiles():
    return '<ul class="tiles">' + ''.join(
        '<li><a class="tile" href="/buyers/' + s + '/"><b>' + esc(t) + '</b><span>' + esc(line) + '</span><i aria-hidden="true">&rarr;</i></a></li>'
        for s, t, line, _ in SITUATIONS) + '</ul>'


def tool_tiles(keys):
    out = []
    for k in keys:
        path, name, q = TOOLS[k]
        out.append('<li><a class="tool-tile" href="' + path + '"><span class="eyebrow">2 minutes</span><b>' + esc(name) +
                   '</b><span>' + esc(q) + '</span><i>Get my answer &rarr;</i></a></li>')
    return '<ul class="tool-cards">' + ''.join(out) + '</ul>'


def signup(where='home'):
    """The weekly move-in ready list sign-up. Email only, per the Page map."""
    return ('<form class="card brass-top inline-form" data-signup="monday-list" data-where="' + where + '" novalidate>'
            '<div class="intro"><b>Get this list once a week.</b><span>I\'ll email it to you each time I update it.</span></div>'
            '<label class="field">First name<input type="text" name="first" autocomplete="given-name"></label>'
            '<label class="field">Email<input type="email" name="email" autocomplete="email" required></label>'
            '<input class="hp" type="text" name="website" tabindex="-1" autocomplete="off" aria-hidden="true">'
            '<button class="btn btn-ink" type="submit">Send me the list</button>'
            '<p class="form-note" role="status" hidden style="flex:1 1 100%"></p></form>')


def offer_band():
    return ('<section class="offer bg-ink" aria-label="Special offer"><div class="wrap"><div style="flex:1 1 520px;min-width:0">'
            '<p class="display">There\'s a special offer this month.</p>'
            '<p>It changes often, so if you\'re interested, just text me and I\'ll send you the details.</p></div>'
            '<a class="btn btn-line" href="' + esc(sms("Hi Charles, can you send me this month's special offer?")) +
            '" data-sms-body="Hi Charles, can you send me this month\'s special offer?">Text me</a></div></section>')


def closing(h2='One move, with the dates planned out. A payment you planned for. A home that fits your life.', cta='Book a visit', href='/visit/', after=True):
    return ('<section class="closing bg-white"><div class="wrap"><h2>' + esc(h2) + '</h2>'
            '<a class="btn btn-brass" href="' + href + '">' + esc(cta) + '</a>' +
            ('<p class="after">Or text me at <a href="' + sms() + '">' + PHONE_SHOW + '</a>.</p>' if after else '') + '</div></section>')


def crumbs(items):
    parts = []
    for label, href in items:
        parts.append('<a href="' + href + '">' + esc(label) + '</a>' if href else '<span aria-current="page">' + esc(label) + '</span>')
    return '<nav class="crumbs" aria-label="Breadcrumb">' + ' <span aria-hidden="true">›</span> '.join(parts) + '</nav>'


def disclose_line():
    return ('<p class="note">Just so you know: I work for D.R. Horton, the seller. You\'re always welcome to bring your own agent.</p>')


ESTIMATE_LINE = 'Estimate only. This is not a loan approval, a prequalification or a rate quote. Only a lender can tell you if you qualify.'


# ---------------------------------------------------------------------------
# Chrome
# ---------------------------------------------------------------------------
FOOTER_DISCLOSURE = ("I'm a new home sales consultant, and I work for D.R. Horton. This is my own website, not a D.R. Horton website. "
                     "I work for the builder, which is the seller. You're always welcome to bring your own real estate agent. "
                     "Prices and homes come from drhorton.com and change often. Nothing here is an offer, a loan quote or legal advice. "
                     "Equal Housing Opportunity.")

EHO_SVG = ('<svg role="img" aria-label="Equal Housing Opportunity" viewBox="0 0 40 40"><path d="M4 18 L20 6 L36 18 L36 34 L4 34 Z" fill="none" stroke="#E9E4DA" stroke-width="2"/>'
           '<rect x="12" y="20" width="16" height="3" fill="#E9E4DA"/><rect x="12" y="26" width="16" height="3" fill="#E9E4DA"/></svg>')

ANALYTICS = """<script async src="https://www.googletagmanager.com/gtag/js?id=G-4Y130WZZEZ"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-4Y130WZZEZ');</script>
<script>(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","attvv3ekgf");</script>"""

HUBSPOT_CHAT = """<!-- HubSpot chat: loads only when someone asks for it -->
<script>window.hsConversationsSettings = { loadImmediately: false };</script>
<script type="text/javascript" id="hs-script-loader" async defer src="https://js-na2.hs-scripts.com/247617862.js"></script>"""

PERSON_LD = {"@context": "https://schema.org", "@type": "Person", "name": "Charles Carper", "url": SITE + "/about/",
             "image": SITE + "/assets/images/cc-headshot.jpg", "jobTitle": "New Home Sales Consultant",
             "worksFor": {"@type": "Organization", "name": "D.R. Horton"}, "telephone": "+1-984-328-2788",
             "address": {"@type": "PostalAddress", "addressLocality": "Hillsborough", "addressRegion": "NC", "addressCountry": "US"}}


def header(active):
    items = ''.join('<li><a href="' + href + '"' + (' aria-current="page"' if key == active else '') + '>' + esc(label) + '</a></li>'
                    for key, href, label in NAV)
    return ('<div class="topstrip">Charles Carper · New Home Sales Consultant at D.R. Horton · This is my own site, not D.R. Horton\'s</div>\n'
            '<header class="site-header"><div class="wrap header-row">'
            '<a class="brand" href="/" aria-label="Charles Carper, home"><span class="brand-name">Charles Carper</span><span class="brand-tag">New homes · Raleigh-Durham</span></a>'
            '<nav class="nav" aria-label="Main"><button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-list">Menu</button>'
            '<ul class="nav-list" id="nav-list">' + items + '</ul>'
            '<a class="btn btn-brass btn-sm nav-book" href="/visit/">Book a visit</a></nav></div></header>')


MBAR = {'/visit/': ('Pick a visit time', '#book'), '/agents/': ('Protect my client', '#register')}


def footer(path='/'):
    label, href = MBAR.get(path, ('Book a visit', '/visit/'))
    return ('<footer class="site-footer"><div class="wrap"><div class="footer-grid">'
            '<div><div class="f-name">Charles Carper</div><div class="f-title">New Home Sales Consultant · D.R. Horton, Raleigh-Durham</div></div>'
            '<div><h2>Reach me</h2><ul><li><a href="tel:' + PHONE + '">Call ' + PHONE_SHOW + '</a></li>'
            '<li><a href="' + sms() + '">Text ' + PHONE_SHOW + '</a></li><li><a href="/visit/">Book a visit</a></li>'
            '<li><a href="' + MODEL_MAP + '" target="_blank" rel="noopener">Model home: ' + MODEL_ADDRESS + '</a></li></ul></div>'
            '<div><h2>On this site</h2><ul><li><a href="/move-in-ready/">Move-in ready homes</a></li><li><a href="/collins-ridge/">Collins Ridge</a></li>'
            '<li><a href="/plan/">Plan your move</a></li><li><a href="/guides/">Guides</a></li><li><a href="/agents/">For agents</a></li></ul></div>'
            '</div><div class="footer-legal">' + EHO_SVG + '<p>' + esc(FOOTER_DISCLOSURE) +
            ' <a href="/disclosures/">Disclosures</a> · <a href="/privacy/">Privacy</a></p></div></div></footer>\n'
            '<div class="mbar" data-mbar><a class="btn btn-brass" href="' + href + '">' + esc(label) + '</a><a class="btn btn-line" href="' + sms() + '">Text</a></div>')


def page(path, title, description, body, active=None, scripts=(), robots=None, schema=(), og_image='/assets/images/cc-share.jpg', canonical=None, head_extra=''):
    canonical = canonical or (SITE + path)
    ld = ''.join('<script type="application/ld+json">' + json.dumps(s, ensure_ascii=False) + '</script>\n' for s in schema)
    page_scripts = ''.join('<script src="' + s + '?v=' + VERSION + '" defer></script>\n' for s in scripts)
    html_class = 'show-placeholders' if SHOW_PLACEHOLDERS else ''
    return ('<!doctype html>\n<html lang="en"' + (' class="' + html_class + '"' if html_class else '') + '>\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width, initial-scale=1">\n'
            '<title>' + esc(title) + '</title>\n'
            '<meta name="description" content="' + esc(description) + '">\n' +
            ('<meta name="robots" content="' + robots + '">\n' if robots else '') +
            '<link rel="canonical" href="' + canonical + '">\n'
            '<meta property="og:title" content="' + esc(title) + '">\n<meta property="og:description" content="' + esc(description) + '">\n'
            '<meta property="og:url" content="' + canonical + '">\n<meta property="og:type" content="website">\n'
            '<meta property="og:image" content="' + SITE + og_image + '">\n<meta name="twitter:card" content="summary_large_image">\n'
            '<meta name="theme-color" content="#16212B">\n'
            '<link rel="icon" href="/favicon.ico?v=2" sizes="48x48">\n<link rel="icon" href="/favicon.svg?v=2" type="image/svg+xml">\n'
            '<link rel="apple-touch-icon" href="/apple-touch-icon.png?v=2">\n<link rel="manifest" href="/site.webmanifest">\n'
            '<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
            '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Inter:wght@400;500;600;700&display=swap">\n'
            '<link rel="stylesheet" href="/site.css?v=' + VERSION + '">\n' + head_extra + ANALYTICS + '\n' + ld +
            '</head>\n<body>\n<a class="skip" href="#main">Skip to content</a>\n' + header(active) + '\n<main id="main">\n' + body.strip() +
            '\n</main>\n' + footer(path) + '\n<script src="/site.js?v=' + VERSION + '" defer></script>\n' + page_scripts + HUBSPOT_CHAT + '\n</body>\n</html>\n')


def out_path(path):
    if path.endswith('.html'):
        return os.path.join(ROOT, path.lstrip('/'))
    return os.path.join(ROOT, path.strip('/'), 'index.html') if path != '/' else os.path.join(ROOT, 'index.html')


WRITTEN = []


def write(path, content, sitemap=True):
    p = out_path(path)
    os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content)
    if sitemap:
        WRITTEN.append(path)


def redirect(old_file, target, title):
    p = os.path.join(ROOT, old_file)
    s = ('<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n'
         '<title>' + esc(title) + ' | Charles Carper</title>\n<meta name="robots" content="noindex">\n'
         '<link rel="canonical" href="' + SITE + target + '">\n<meta http-equiv="refresh" content="0; url=' + target + '">\n'
         '<script>location.replace(' + json.dumps(target) + ' + location.search + location.hash);</script>\n</head>\n<body>\n'
         '<p>This page moved. <a href="' + target + '">' + esc(title) + '</a>.</p>\n</body>\n</html>\n')
    with open(p, 'w', encoding='utf-8') as f:
        f.write(s)


# ---------------------------------------------------------------------------
# Guides: re-skin in place
# ---------------------------------------------------------------------------
LINK_MAP = [
    (r'/moving-plan\?start=rent', '/plan/lease-to-keys/'),
    (r'/moving-plan(?:#[^"]*)?', '/plan/sell-and-buy/'),
    (r'/home-to-sell-planner/(?:classic\.html)?', '/plan/sell-and-buy/'),
    (r'/floor-plans(?:#[^"]*)?', '/plan/floor-plan-match/'),
    (r'/match', '/plan/floor-plan-match/'),
    (r'/book#call', '/visit/#call'),
    (r'/book(?:#visit)?', '/visit/'),
    (r'/faq#([\w-]+)', r'/collins-ridge/faq/#\1'),
    (r'/faq', '/collins-ridge/faq/'),
    (r'/collins-ridge#([\w-]+)', r'/collins-ridge/#\1'),
    (r'/collins-ridge', '/collins-ridge/'),
    (r'/about', '/about/'),
    (r'/realtors', '/agents/'),
    (r'/privacy', '/privacy/'),
]

TEXT_FIXES = [
    ('I sell new homes in Hillsborough, NC, so I represent the builder as the seller.', 'I sell new D.R. Horton homes, so I work for the builder, which is the seller.'),
    ('First, I work for the builder and represent the seller. In North Carolina, agents review the <em>Working With Real Estate Agents</em> disclosure with you at the first real conversation, so you know who represents whom. Second,',
     'First, I work for the builder, which is the seller. Second,'),
    ('I represent the builder as the seller.', 'I work for the builder, which is the seller.'),
    ('I work for the builder and represent the seller.', 'I work for the builder, which is the seller.'),
    ("It's your call, and it's a fair question. I represent the builder, so here's the honest version.", "It's your call, and it's a fair question. I work for the builder, so here's the honest version."),
    ('I still help you through every step, but I represent the builder.', 'I still help you through every step, but I work for the builder.'),
    ("The builder's sales consultant represents the builder.", "The builder's sales consultant works for the builder."),
    ("I served in the Marines, so this one's close to home.", "I'm a veteran, so this one's close to home."),
    ('Get my short list', 'Book a visit'),
    ('page-head blueprint', 'guide-head'),
    ('next-step blueprint', 'next-step'),
    ('btn btn-amber', 'btn btn-brass'),
]


def fix_links(s):
    def repl(m):
        href = m.group(1)
        for pat, to in LINK_MAP:
            if re.fullmatch(pat, href):
                return 'href="' + re.sub(pat, to, href) + '"'
        return m.group(0)
    return re.sub(r'href="(/[^"]*)"', repl, s)


def guide_ctas(main):
    """UX pass: one primary action per screen in the guides."""
    # Table of contents: a quiet link, not a second brass button near the top of the article
    main = main.replace('<div class="toc-cta"><a class="btn btn-brass" href="/plan/sell-and-buy/">Get my moving plan</a>',
                        '<div class="toc-cta"><a class="arrow" href="/plan/sell-and-buy/">Get my moving plan</a>')
    # End of article: keep the primary and one secondary; drop the extra row of links
    main = re.sub(r'(<section class="next-step".*?</div>)<p class="small" style="margin-top:14px">.*?</p>(</section>)', r'\1\2', main, flags=re.S)
    # Guides hub: three places to go next, then one primary and one quiet text link
    main = re.sub(r'<div class="next-paths funnel-strip">.*?</section>',
                  '<div class="next-paths funnel-strip">'
                  '<a class="next-path" href="/collins-ridge/"><span class="who">The community</span><b>New homes at Collins Ridge</b></a>'
                  '<a class="next-path" href="/plan/floor-plan-match/"><span class="who">The plans</span><b>Narrow the floor plans to yours</b></a>'
                  '<a class="next-path" href="/collins-ridge/faq/"><span class="who">Quick answers</span><b>Collins Ridge FAQ</b></a></div>'
                  '<div class="actions" style="margin-top:24px"><a class="btn btn-brass" href="/visit/">Book a visit</a>'
                  '<a class="arrow" href="' + esc(sms('Hi Charles, I have a question: ')) + '" data-sms-body="Hi Charles, I have a question: ">Or text me a question</a></div></section>',
                  main, count=1, flags=re.S)
    return main


def reskin_guides():
    gdir = os.path.join(ROOT, 'guides')
    count = 0
    for f in sorted(os.listdir(gdir)):
        if not f.endswith('.html'):
            continue
        p = os.path.join(gdir, f)
        s = open(p, encoding='utf-8').read()
        if 'http-equiv="refresh"' in s:
            continue  # retired guide stubs stay as they are
        title = html.unescape(re.search(r'<title>(.*?)</title>', s, re.S).group(1))
        dm = re.search(r'<meta name="description" content="([^"]*)"', s)
        desc = html.unescape(dm.group(1)) if dm else ''
        canon = re.search(r'<link rel="canonical" href="([^"]*)"', s).group(1)
        lds = [json.loads(x) for x in re.findall(r'<script type="application/ld\+json">(.*?)</script>', s, re.S)]
        og = re.search(r'<meta property="og:image" content="https://charlescarper.com([^"]*)"', s)
        main = re.search(r'<main id="main">(.*)</main>', s, re.S).group(1)
        for a, b in TEXT_FIXES:
            main = main.replace(a, b)
        main = fix_links(main)
        main = main.replace('class="agency-note"', 'class="note"')
        main = guide_ctas(main)
        # JSON-LD text fixes too (FAQ answers repeat the body copy)
        lds_s = json.dumps(lds, ensure_ascii=False)
        for a, b in TEXT_FIXES[:8]:
            lds_s = lds_s.replace(a.replace('<em>', '').replace('</em>', ''), b)
        lds = json.loads(lds_s)
        path = canon.replace(SITE, '') or '/guides/'
        with open(p, 'w', encoding='utf-8') as fh:
            fh.write(page(path, title, desc, main, active='guides', schema=lds,
                          og_image=og.group(1) if og else '/assets/images/cc-share.jpg', canonical=canon))
        WRITTEN.append(path)
        count += 1
    return count


def sitemap():
    urls = sorted(set(WRITTEN), key=lambda u: (u.count('/'), u))
    body = ''.join('<url><loc>' + SITE + u + '</loc><lastmod>' + TODAY + '</lastmod></url>\n' for u in urls if not u.endswith('404.html'))
    with open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8') as f:
        f.write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + '</urlset>\n')


def main():
    import pages_core, pages_situations, pages_tools
    for mod in (pages_core, pages_situations, pages_tools):
        mod.build()
    n = reskin_guides()
    for old, target, title in [
        ('book.html', '/visit/', 'Book a visit'),
        ('moving-plan.html', '/plan/sell-and-buy/', 'Sell & Buy Planner'),
        ('floor-plans.html', '/plan/floor-plan-match/', 'Floor Plan Match'),
        ('match.html', '/plan/floor-plan-match/', 'Floor Plan Match'),
        ('faq.html', '/collins-ridge/faq/', 'Collins Ridge FAQ'),
        ('realtors.html', '/agents/', 'For agents'),
    ]:
        redirect(old, target, title)
    for gone in ('about.html', 'collins-ridge.html', 'privacy.html'):
        p = os.path.join(ROOT, gone)
        if os.path.exists(p):
            os.remove(p)
    sitemap()
    print('Built', len(WRITTEN), 'pages (' + str(n) + ' guides re-skinned). Version', VERSION)


if __name__ == '__main__':
    main()
