#!/usr/bin/env python3
"""Weekly move-in ready flyer: one printable letter page, plus a PNG for email.

    python3 _build/flyer.py [OUT_DIR]

Reads data/move-in-ready.json, the same public drhorton.com data the site uses.
Writes weekly-flyer-YYYY-MM-DD.pdf (print, clickable links), .png (email) and
.html (source) to OUT_DIR, default _build/flyer/out (git-ignored).
Needs Playwright with Chromium (python3 -m pip install playwright).

What goes on it (not the whole list):
- Collins Ridge first: up to 4 homes as cards, finished ones first.
- The rest of Raleigh-Durham as a summary: homes and starting price by town.
- Charles's photo, Book a visit (QR to /book, tagged utm_source=flyer), text number.
- The weekly-update line, the disclosure and Equal Housing Opportunity.
"""
import base64, collections, datetime as dt, html, json, os, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HERE = os.path.join(ROOT, '_build', 'flyer')
PHOTO_ME = 'assets/images/cc-about.jpg'          # swap for the new shoot
PHOTO_ME_CROP = (0.225, 0.27, 0.775, 0.80)        # left, top, right, bottom as fractions; frames head to waist
PHOTO_HOME = 'assets/images/cc-hayden-living.jpg'  # finished model home, staged
PHOTO_HOME_CAPTION = 'Photo: the Hayden model home at Collins Ridge. Furniture and decor are staging.'
BOOK_URL = 'https://charlescarper.com/book?utm_source=flyer&utm_medium=print&utm_campaign=weekly-list'
LIST_URL = 'charlescarper.com/move-in-ready'
PHONE_SHOW, PHONE = '984-328-2788', '+19843282788'
MODEL = '116 Sea Trail St, Hillsborough, NC 27278'
STATUS = {'ready': ('Move-in ready', 'ready'), 'almost': ('Almost finished', 'almost'),
          'building': ('Being built', 'build'), 'notstarted': ('Not started yet', 'build')}
DISCLOSURE = ("I'm a new home sales consultant, and I work for D.R. Horton, the seller. This is my own flyer, not a D.R. Horton ad. "
              "You're always welcome to bring your own real estate agent. Prices and homes come from drhorton.com as of {date} "
              "and change often. Nothing here is an offer, a loan quote or legal advice. " + PHOTO_HOME_CAPTION +
              " Equal Housing Opportunity.")


def esc(s):
    return html.escape(str(s), quote=True)


def data_uri(rel, mime):
    with open(os.path.join(ROOT, rel), 'rb') as f:
        return 'data:' + mime + ';base64,' + base64.b64encode(f.read()).decode()


def photo_uri(rel, box):
    from io import BytesIO
    from PIL import Image
    im = Image.open(os.path.join(ROOT, rel)).convert('RGB')
    w, h = im.size
    im = im.crop((int(box[0] * w), int(box[1] * h), int(box[2] * w), int(box[3] * h)))
    buf = BytesIO()
    im.save(buf, 'JPEG', quality=92)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()


STREET = [(' Drive', ' Dr'), (' Road', ' Rd'), (' Street', ' St'), (' Lane', ' Ln'), (' Court', ' Ct'), (' Memorial', ' Mem')]


def short_addr(a):
    for x, y in STREET:
        if a.endswith(x) or (x + ' ') in a:
            a = a.replace(x, y)
    return a


def money(n):
    return '${:,.0f}'.format(n)


def baths(b):
    return ('%g' % b)


def nice_date(iso):
    d = dt.date.fromisoformat(iso)
    return d.strftime('%b ') + str(d.day) + d.strftime(', %Y')


def card(h):
    label, cls = STATUS[h['status']]
    kind = 'Townhome' if h['type'] == 'townhome' else 'Single-family'
    garage = (str(h['garage']) + '-car ' + ('rear ' if h.get('rearLoad') else '') + 'garage') if h.get('garage') else ''
    plan = ('The ' + h['plan']) if h.get('plan') else kind
    story = ' · one floor' if h.get('stories') == 1 else ''
    return ('<article class="card">'
            '<div class="chip chip-' + cls + '">' + esc(label) + '</div>'
            '<h3>' + esc(plan) + '</h3>'
            '<div class="price">' + money(h['price']) + '</div>'
            '<div class="specs">' + str(h['beds']) + ' bd · ' + baths(h['baths']) + ' ba · ' + '{:,} sq ft'.format(h['sqft']) + '<br>'
            + esc(kind + story) + ('<br>' + esc(garage) if garage else '') + '</div>'
            '<div class="addr">' + esc(short_addr(h['address'])) + '</div>'
            '</article>')


def build(d):
    homes = d['homes']
    date = nice_date(d['asOf'])
    cr = [h for h in homes if h['community'].startswith('Collins Ridge')]
    order = {'ready': 0, 'almost': 1, 'building': 2, 'notstarted': 3}
    cr.sort(key=lambda h: (order[h['status']], h['price']))
    shown, rest = cr[:4], cr[4:]
    cr_done = sum(1 for h in cr if h['status'] in ('ready', 'almost'))
    cr_build = len(cr) - cr_done
    meta = []
    if cr_done:
        meta.append(str(cr_done) + (' finished or almost finished' if any(h['status'] == 'almost' for h in cr) else ' move-in ready'))
    if cr_build:
        meta.append(str(cr_build) + ' being built')
    if rest:
        groups = collections.OrderedDict()
        for h in rest:
            groups.setdefault(STATUS[h['status']][0].lower(), []).append('the ' + esc(h['plan'] or 'home') + ' (' + money(h['price']) + ')')
        more = '; '.join(k + ': ' + ', '.join(v[:-1]) + (' and ' if len(v) > 1 else '') + v[-1] for k, v in groups.items())
        rest_line = '<p class="more"><b>Also at Collins Ridge,</b> ' + more + '. Ask me when they\'ll be ready.</p>'
    else:
        rest_line = ''
    if not shown:
        cards = '<p class="more">No Collins Ridge homes on the list this week. Text me to hear what\'s coming next.</p>'
    else:
        cards = '<div class="cards">' + ''.join(card(h) for h in shown) + '</div>'

    others = [h for h in homes if not h['community'].startswith('Collins Ridge') and h['status'] in ('ready', 'almost')]
    by_town = collections.defaultdict(list)
    for h in others:
        by_town[h['town']].append(h['price'])
    towns = sorted(by_town.items(), key=lambda t: (-len(t[1]), t[0]))
    top = towns[:8]
    town_cells = ''.join('<div class="town"><b>' + esc(t) + '</b><span>' + str(len(p)) + (' home' if len(p) == 1 else ' homes') +
                         ' · from ' + money(min(p)) + '</span></div>' for t, p in top)
    extra_towns = len(towns) - len(top)
    one_floor = sum(1 for h in others if h.get('stories') == 1)
    townhomes = sum(1 for h in others if h['type'] == 'townhome')
    under = sum(1 for h in others if h['price'] < 300000)
    facts = []
    if one_floor:
        facts.append(str(one_floor) + ' on one floor')
    if townhomes:
        facts.append(str(townhomes) + ' townhomes')
    if under:
        facts.append(str(under) + ' under $300,000')
    if extra_towns > 0:
        facts.append(str(extra_towns) + ' more towns')

    fonts = ('@font-face{font-family:"Fraunces";src:url(' + data_uri('_build/flyer/fonts/fraunces.woff2', 'font/woff2') + ') format("woff2");font-weight:100 900;}'
             '@font-face{font-family:"Inter";src:url(' + data_uri('_build/flyer/fonts/inter.woff2', 'font/woff2') + ') format("woff2");font-weight:100 900;}')
    qr = open(os.path.join(HERE, 'qr-book.svg'), encoding='utf-8').read()
    qr = qr.replace('<svg ', '<svg viewBox="0 0 41 41" shape-rendering="crispEdges" aria-label="QR code: book a visit" ', 1)

    page = TEMPLATE
    for k, v in {
        '{{FONTS}}': fonts,
        '{{DATE}}': esc(date),
        '{{PHOTO_HOME}}': data_uri(PHOTO_HOME, 'image/jpeg'),
        '{{PHOTO_ME}}': photo_uri(PHOTO_ME, PHOTO_ME_CROP),
        '{{CR_META}}': esc(' · '.join(meta)),
        '{{CARDS}}': cards,
        '{{CR_REST}}': rest_line,
        '{{OTHERS_N}}': str(len(others)),
        '{{TOWNS_N}}': str(len(towns)),
        '{{TOWNS}}': town_cells,
        '{{FACTS}}': ''.join('<span>' + esc(f) + '</span>' for f in facts),
        '{{LIST_URL}}': LIST_URL,
        '{{QR}}': qr,
        '{{BOOK_URL}}': esc(BOOK_URL),
        '{{PHONE_SHOW}}': PHONE_SHOW,
        '{{PHONE}}': PHONE,
        '{{MODEL}}': esc(MODEL),
        '{{DISCLOSURE}}': esc(DISCLOSURE.format(date=date)),
    }.items():
        page = page.replace(k, v)
    return page


TEMPLATE = r"""<!doctype html>
<html lang="en"><head><meta charset="utf-8">
<title>Move-in ready homes this week | Charles Carper</title>
<style>
{{FONTS}}
@page { size: 8.5in 11in; margin: 0; }
:root { --ink:#16212B; --lime:#F5F2EC; --brass:#B98A3E; --brass-dk:#8A6424; --slate:#5B6672; --hair:#DDD6CB; --ready:#2F6B4F; --paper:#FFFFFF; }
* { box-sizing: border-box; }
html, body { margin: 0; background: var(--paper); }
body { color: var(--ink); font: 400 12px/1.45 "Inter", system-ui, sans-serif; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
a { color: inherit; text-decoration: none; }
.sheet { width: 8.5in; height: 11in; padding: 0.4in 0.45in 0.34in; display: flex; flex-direction: column; gap: 12px; overflow: hidden; }

.mast { display: grid; grid-template-columns: 1fr 252px; gap: 22px; align-items: stretch; }
.eyebrow { font: 600 10px/1.3 "Inter", sans-serif; letter-spacing: .16em; text-transform: uppercase; color: var(--brass-dk); margin: 0 0 10px; }
h1 { text-wrap: balance; font: 500 42px/1.0 "Fraunces", Georgia, serif; font-variation-settings: "opsz" 144; letter-spacing: -0.015em; margin: 0 0 12px; }
.lede { font-size: 13.5px; line-height: 1.45; margin: 0; max-width: 48ch; }
.mast-photo { position: relative; border-radius: 4px; overflow: hidden; min-height: 150px; }
.mast-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; object-position: 30% 50%; }
.asof { margin-top: 12px; display: inline-flex; gap: 8px; align-items: center; font-size: 11px; color: var(--slate); }
.asof b { color: var(--ink); font-weight: 600; }

.rule { height: 0; border-top: 1px solid var(--ink); }
.sec-head { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; margin: 0 0 10px; }
h2 { font: 500 22px/1.1 "Fraunces", Georgia, serif; font-variation-settings: "opsz" 72; margin: 0; }
h2 small { font: 500 12px/1 "Inter", sans-serif; color: var(--slate); margin-left: 8px; letter-spacing: 0; }
.sec-meta { font-size: 11px; color: var(--slate); white-space: nowrap; }

.cards { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
.card { background: var(--lime); border: 1px solid var(--hair); border-radius: 4px; padding: 10px 11px 10px; display: flex; flex-direction: column; min-width: 0; }
.chip { align-self: flex-start; font: 600 8.5px/1 "Inter", sans-serif; letter-spacing: .08em; text-transform: uppercase; padding: 4px 6px; border-radius: 3px; margin-bottom: 7px; }
.chip-ready { background: var(--ready); color: #fff; }
.chip-almost { background: var(--brass); color: var(--ink); }
.chip-build { background: transparent; color: var(--slate); border: 1px solid var(--slate); padding: 3px 5px; }
.card h3 { font: 500 18px/1.1 "Fraunces", Georgia, serif; font-variation-settings: "opsz" 48; margin: 0; }
.price { font: 600 19px/1 "Inter", sans-serif; letter-spacing: -0.01em; font-variant-numeric: tabular-nums; margin: 5px 0 6px; }
.specs { font-size: 10.5px; line-height: 1.45; }
.addr { margin-top: auto; padding-top: 6px; font-size: 10px; color: var(--slate); border-top: 1px solid var(--hair); }
.specs { margin-bottom: 7px; }
.more { margin: 8px 0 0; font-size: 11px; color: var(--ink); }
.more b { font-weight: 600; }

.towns { display: grid; grid-template-columns: repeat(4, 1fr); border-top: 1px solid var(--hair); }
.town { padding: 6px 10px 6px 0; border-bottom: 1px solid var(--hair); display: flex; flex-direction: column; min-width: 0; }
.town b { font-weight: 600; font-size: 12.5px; }
.town span { font-size: 11px; color: var(--slate); font-variant-numeric: tabular-nums; }
.facts { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 9px; align-items: center; }
.facts span { font-size: 11px; border: 1px solid var(--hair); border-radius: 99px; padding: 3px 10px; background: var(--lime); }
.facts em { font-style: normal; font-size: 11px; color: var(--slate); margin-left: 4px; }
.facts em b { color: var(--ink); font-weight: 600; }

.me { background: var(--ink); color: var(--lime); border-radius: 6px; display: grid; grid-template-columns: 136px 1fr 146px; gap: 20px; padding: 14px; align-items: center; }
.me-photo { width: 136px; height: 170px; border-radius: 4px; overflow: hidden; }
.me-photo img { width: 100%; height: 100%; object-fit: cover; }
.me h2 { color: #fff; font-size: 25px; margin-bottom: 3px; }
.me .role { font-size: 10px; letter-spacing: .06em; text-transform: uppercase; color: #CDB27F; margin: 0 0 10px; font-weight: 600; }
.me p { margin: 0 0 8px; font-size: 12px; line-height: 1.5; color: #E9E4DA; max-width: 46ch; }
.text-me { font: 500 22px/1.1 "Fraunces", Georgia, serif; color: #fff; margin: 2px 0 6px; display: block; }
.text-me span { font: 600 10px/1 "Inter", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #CDB27F; display: block; margin-bottom: 5px; }
.small { font-size: 11px; color: #C9C3B8; }
.offer { color: #fff; font-weight: 600; }
.book { background: var(--paper); color: var(--ink); border-radius: 4px; padding: 11px 11px 9px; display: flex; flex-direction: column; align-items: center; gap: 8px; text-align: center; }
.book svg { width: 108px; height: 108px; display: block; }
.book .btn { background: var(--brass); color: var(--ink); font: 600 12.5px/1 "Inter", sans-serif; padding: 8px 12px; border-radius: 3px; width: 100%; }
.book small { font-size: 9.5px; color: var(--slate); line-height: 1.3; }

.weekly { display: flex; gap: 10px; align-items: center; font-size: 12px; border: 1px solid var(--brass); border-radius: 4px; padding: 8px 12px; background: #FBF8F2; }
.weekly svg { flex: 0 0 auto; }
.weekly b { font-weight: 600; }

.foot { display: grid; grid-template-columns: 46px 1fr; gap: 12px; align-items: center; margin-top: auto; }
.eho { display: flex; flex-direction: column; align-items: center; gap: 2px; }
.eho svg { width: 30px; height: 30px; }
.eho span { font: 700 5.5px/1.1 "Inter", sans-serif; letter-spacing: .04em; text-align: center; }
.foot p { margin: 0; font-size: 8.5px; line-height: 1.45; color: var(--slate); }
</style></head>
<body><div class="sheet">

<header class="mast">
  <div>
    <p class="eyebrow">Charles Carper · New homes · Raleigh-Durham</p>
    <h1>Move-in ready homes this week</h1>
    <p class="lede">Finished and almost-finished D.R. Horton homes around Raleigh-Durham. Collins Ridge, where I work, comes first.</p>
    <div class="asof"><b>Prices as of {{DATE}}</b> · Updated weekly</div>
  </div>
  <div class="mast-photo"><img src="{{PHOTO_HOME}}" alt="Living room in the Hayden model home at Collins Ridge, staged"></div>
</header>

<section>
  <div class="rule"></div>
  <div class="sec-head" style="margin-top:12px"><h2>Collins Ridge <small>Hillsborough</small></h2><div class="sec-meta">{{CR_META}}</div></div>
  {{CARDS}}
  {{CR_REST}}
</section>

<section>
  <div class="rule"></div>
  <div class="sec-head" style="margin-top:12px"><h2>Across Raleigh-Durham</h2><div class="sec-meta">{{OTHERS_N}} more homes, finished or almost finished, in {{TOWNS_N}} towns</div></div>
  <div class="towns">{{TOWNS}}</div>
  <div class="facts">{{FACTS}}<em>See every home: <b>{{LIST_URL}}</b></em></div>
</section>

<section class="me">
  <div class="me-photo"><img src="{{PHOTO_ME}}" alt="Charles Carper"></div>
  <div>
    <h2>Hi, I'm Charles.</h2>
    <p class="role">New Home Sales Consultant · D.R. Horton</p>
    <p>Tell me what you need in your next home. I'll tell you which of these fit, and I'll walk you through them.</p>
    <a class="text-me" href="sms:{{PHONE}}"><span>Text or call me</span>{{PHONE_SHOW}}</a>
    <div class="small">Model home: {{MODEL}}</div>
    <div class="small offer" style="margin-top:6px">Ask me about this month's special offer.</div>
  </div>
  <a class="book" href="{{BOOK_URL}}">
    {{QR}}
    <span class="btn">Book a visit</span>
    <small>Scan with your phone camera to pick a time.</small>
  </a>
</section>

<div class="weekly">
  <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><circle cx="9" cy="9" r="8" fill="none" stroke="#8A6424" stroke-width="1.5"/><path d="M9 4.5V9l3 2" fill="none" stroke="#8A6424" stroke-width="1.5" stroke-linecap="round"/></svg>
  <div><b>I update this list once a week.</b> Homes can sell before the list catches up, so text me to check a home before you come.</div>
</div>

<footer class="foot">
  <div class="eho"><svg viewBox="0 0 40 40" role="img" aria-label="Equal Housing Opportunity"><path d="M4 18 L20 6 L36 18 L36 34 L4 34 Z" fill="none" stroke="#16212B" stroke-width="2.4"/><rect x="12" y="20" width="16" height="3.2" fill="#16212B"/><rect x="12" y="26" width="16" height="3.2" fill="#16212B"/></svg><span>EQUAL HOUSING<br>OPPORTUNITY</span></div>
  <p>{{DISCLOSURE}}</p>
</footer>

</div></body></html>
"""


def render(html_path, pdf_path, png_path):
    from playwright.sync_api import sync_playwright
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 816, 'height': 1056}, device_scale_factor=1.5625)
        pg.goto('file://' + html_path)
        pg.wait_for_timeout(300)
        overflow = pg.evaluate("(() => { const s = document.querySelector('.sheet'); return s.scrollHeight - s.clientHeight; })()")
        pg.pdf(path=pdf_path, width='8.5in', height='11in', print_background=True, margin={'top': '0', 'right': '0', 'bottom': '0', 'left': '0'})
        pg.screenshot(path=png_path, full_page=False)
        b.close()
    return overflow


def main(out_dir=None):
    out_dir = os.path.abspath(out_dir or os.path.join(HERE, 'out'))
    os.makedirs(out_dir, exist_ok=True)
    d = json.load(open(os.path.join(ROOT, 'data', 'move-in-ready.json'), encoding='utf-8'))
    base = os.path.join(out_dir, 'weekly-flyer-' + d['asOf'])
    with open(base + '.html', 'w', encoding='utf-8') as f:
        f.write(build(d))
    overflow = render(base + '.html', base + '.pdf', base + '.png')
    print('Wrote', base + '.pdf', base + '.png')
    if overflow > 0:
        print('WARNING: content runs', overflow, 'px past the page. Check the PDF.')
        sys.exit(2)


if __name__ == '__main__':
    main(*sys.argv[1:2])
