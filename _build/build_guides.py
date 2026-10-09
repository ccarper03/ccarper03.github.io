#!/usr/bin/env python3
"""Builds the guide pages, the guides hub and sitemap.xml for charlescarper.com.

Sources: _build/guides/*.md (Jekyll skips folders that start with "_", so they aren't published).
Each file starts with a front-matter block:

    ---
    n: 1                      # week number in the video calendar
    slug: how-buying-new-construction-works
    title: How Buying a New Construction Home Works, Step by Step     (the H1)
    seo_title: How Buying a New Construction Home Works   (<= 60 chars, for the <title>)
    description: ...          (<= 155 chars)
    stage: top | mid          (funnel stage)
    pillar: psych | money | build | select | place | after | agents
    keyword: primary search phrase
    answer: one- or two-sentence answer that opens the page
    next: slug of the next step (top-of-funnel guides point to a mid-funnel guide)
    related: slug, slug, slug
    ---

Body is Markdown. Question headings (## ... ?) become FAQ schema with the paragraph under them.
A final "## Sources" section becomes the numbered source list.

Run:  python3 _build/build_guides.py        (from the repo root; needs the "markdown" package)
"""
import datetime, html, json, math, os, re, sys

import markdown

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, '_build', 'guides')
OUT = os.path.join(ROOT, 'guides')
SITE = 'https://charlescarper.com'
VER = open(os.path.join(ROOT, '_build', 'VERSION')).read().strip()
TODAY = datetime.date.today().isoformat()

PILLARS = {
    'psych': 'Deciding and the process',
    'money': 'Money and financing',
    'build': 'How it gets built',
    'select': 'Choosing the home',
    'place': 'Community and area',
    'after': 'After you move in',
    'agents': 'For agents',
}
STAGES = {'top': "If you're just starting", 'mid': "If you're comparing"}


def esc(s):
    return html.escape(s, quote=True)


def parse(path):
    raw = open(path, encoding='utf-8').read()
    m = re.match(r'---\n(.*?)\n---\n(.*)', raw, re.S)
    if not m:
        sys.exit('no front matter: ' + path)
    meta = {}
    for line in m.group(1).splitlines():
        if ':' in line:
            k, v = line.split(':', 1)
            meta[k.strip()] = v.strip()
    meta['related'] = [x.strip() for x in meta.get('related', '').split(',') if x.strip()]
    meta['body'] = m.group(2).strip()
    meta['file'] = os.path.basename(path)
    return meta


def split_sources(body):
    parts = re.split(r'^## Sources\s*$', body, flags=re.M)
    return parts[0].strip(), (parts[1].strip() if len(parts) > 1 else '')


def slugify(s):
    s = re.sub(r'[^\w\s-]', '', s.lower())
    return re.sub(r'[\s_]+', '-', s).strip('-')[:70]


def render_md(text):
    md = markdown.Markdown(extensions=['tables', 'attr_list', 'sane_lists', 'toc'],
                           extension_configs={'toc': {'slugify': lambda v, sep: slugify(v), 'toc_depth': '2'}})
    out = md.convert(text)
    # external links open in a new tab and are marked
    out = re.sub(r'<a href="(https?://[^"]+)"', r'<a href="\1" target="_blank" rel="noopener"', out)
    # wide tables scroll inside their own box on phones
    out = re.sub(r'<table>(.*?)</table>', lambda m: '<div class="table-scroll" role="region" aria-label="Table" tabindex="0"><table>' + m.group(1) + '</table></div>', out, flags=re.S)
    return out, md.toc_tokens


def faq_pairs(body):
    pairs = []
    for m in re.finditer(r'^## (.+\?)\s*\n+(.+?)(?=\n\n|\Z)', body, re.M | re.S):
        q = m.group(1).strip()
        a = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', m.group(2).strip())
        a = re.sub(r'[*_`]', '', a)
        if not a.startswith(('|', '-', '1.')):
            pairs.append((q, a))
    return pairs


def words(text):
    return len(re.findall(r'\w+', re.sub(r'\([^)]*\)', '', text)))


HEAD = '''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<meta name="robots" content="noindex">
<link rel="canonical" href="{url}">
<meta property="og:title" content="{title}">
<meta property="og:description" content="{desc}">
<meta property="og:url" content="{url}">
<meta property="og:type" content="{ogtype}">
<meta property="og:image" content="{site}/assets/images/cc-share.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0F2B4C">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@75..100,600..800&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=IBM+Plex+Mono:wght@500&display=swap">
<link rel="stylesheet" href="/site.css?v={ver}">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-4Y130WZZEZ"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-4Y130WZZEZ');</script>
{ld}
</head>
<body>
<a class="skip" href="#main">Skip to content</a>
<aside class="disclose-bar" aria-label="Disclosure"><div class="wrap">Charles Carper · New home sales with D.R. Horton · My personal site, not an official D.R. Horton website</div></aside>
<header class="site-header">
  <div class="wrap header-row">
    <a class="wordmark" href="/" aria-label="Charles Carper, home">
      <span class="wm-name">Charles Carper</span>
    </a>
    <nav class="nav" aria-label="Main">
      <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="nav-list">Menu</button>
      <ul class="nav-list" id="nav-list">
        <li><a href="/collins-ridge">Collins Ridge</a></li><li><a href="/collins-ridge-plans/">Find a floor plan</a></li><li><a href="/guides/" aria-current="page">Guides</a></li><li><a href="/realtors">For realtors</a></li><li><a href="/about">About</a></li>
      </ul>
      <a class="btn btn-amber btn-sm nav-book" href="/book">Book<span class="nb-more">&nbsp;a visit</span></a>
    </nav>
  </div>
</header>
<main id="main">
'''

FOOT = '''</main>
<footer class="site-footer blueprint">
  <div class="wrap">
    <div class="footer-grid">
      <div>
        <a class="wordmark" href="/" aria-label="Charles Carper, home">
          <span class="wm-name">Charles Carper</span>
        </a>
        <p class="small" style="margin-top:16px;max-width:34ch">New home sales at Collins Ridge in Hillsborough, NC, with D.R. Horton.</p>
      </div>
      <div>
        <h2>Reach me</h2>
        <ul>
          <li><a href="tel:+19843282788">Call 984-328-2788</a></li>
          <li><a href="sms:+19843282788">Text 984-328-2788</a></li>
          <li><a href="mailto:Clcarper@DRHorton.com">Clcarper@DRHorton.com</a></li>
          <li><a href="/book">Book a visit</a></li>
        </ul>
      </div>
      <div>
        <h2>On this site</h2>
        <ul>
          <li><a href="/collins-ridge">Collins Ridge</a></li>
          <li><a href="/collins-ridge-plans/">Find a floor plan</a></li>
          <li><a href="/guides/">Guides</a></li>
          <li><a href="/faq">FAQ</a></li>
          <li><a href="/realtors">For realtors</a></li>
          <li><a href="/about">About Charles</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-legal">
      <p>Charles Carper is a new home sales consultant with D.R. Horton. This is my personal website. I built it to keep my guides, notes and tools in one place for the people I work with. It isn't an official D.R. Horton website. I represent D.R. Horton as the seller, and you're always welcome to bring your own agent.</p>
      <p>Prices, plans, incentives and availability change often, so check <a href="https://www.drhorton.com" target="_blank" rel="noopener">drhorton.com</a> or ask me before you decide anything. Nothing here is an offer or a guarantee. Equal Housing Opportunity.</p>
      <p><a href="/privacy">Privacy</a></p>
    </div>
  </div>
</footer>
<script src="/site.js?v={ver}" defer></script>
<!-- Start of HubSpot Embed Code (chat) -->
<script type="text/javascript" id="hs-script-loader" async defer src="https://js-na2.hs-scripts.com/247617862.js"></script>
<!-- End of HubSpot Embed Code -->
</body>
</html>
'''

DISCLOSE = ('<p class="disclose-note"><b>Who\'s writing this.</b> I sell new homes for D.R. Horton at Collins Ridge in '
            'Hillsborough, so I represent the builder, not you. This guide is general education from my years on job sites '
            'and in sales. It isn\'t legal, tax or lending advice, and it doesn\'t describe any specific home, price or '
            'incentive. Check the sources linked below, and talk with your own lender, agent or attorney before you decide.</p>')


def next_step(g, by_slug):
    if g['stage'] == 'top' and g.get('next') in by_slug:
        n = by_slug[g['next']]
        return ('<section class="next-step blueprint" aria-labelledby="next-h"><h2 id="next-h">Your next step</h2>'
                '<p>Once this makes sense, the next question is usually this one.</p>'
                '<div class="actions"><a class="btn btn-amber" href="/guides/%s">%s</a>'
                '<a class="btn btn-line" href="/match">Not sure where you fit? Answer 7 questions</a></div></section>'
                % (n['slug'], esc(n['title'])))
    # mid-funnel and everything else: point at Hillsborough, the plan finder and booking
    return ('<section class="next-step blueprint" aria-labelledby="next-h"><h2 id="next-h">Looking at new homes in Hillsborough?</h2>'
            '<p>I sell new construction at Collins Ridge, about 20 minutes from Durham and Chapel Hill. '
            'Narrow the 12 floor plans to the two or three that fit, then come walk them with me.</p>'
            '<div class="actions"><a class="btn btn-amber" href="/collins-ridge-plans/">Find your floor plan</a>'
            '<a class="btn btn-line" href="/book">Book a visit</a></div>'
            '<p class="small" style="margin-top:14px"><a href="/collins-ridge" style="color:#fff">See Collins Ridge</a> · '
            '<a href="/match" style="color:#fff">Not sure Hillsborough fits? Answer 7 questions</a></p></section>')


def related_block(g, by_slug):
    items = [by_slug[s] for s in g['related'] if s in by_slug][:4]
    if not items:
        return ''
    lis = ''.join('<li><a href="/guides/%s"><b>%s</b><span>%s</span></a></li>' % (r['slug'], esc(r['title']), esc(STAGES.get(r['stage'], '')))
                  for r in items)
    return '<section class="related" aria-labelledby="rel-h"><h2 id="rel-h">Keep reading</h2><ul>%s</ul></section>' % lis


def build_page(g, by_slug):
    body, sources = split_sources(g['body'])
    body_html, toc = render_md(body)
    src_html = render_md(sources)[0] if sources else ''
    url = '%s/guides/%s' % (SITE, g['slug'])
    mins = max(3, math.ceil(words(body) / 230))
    faqs = faq_pairs(body)
    ld = [{
        '@context': 'https://schema.org', '@type': 'Article', 'headline': g['title'], 'description': g['description'],
        'mainEntityOfPage': url, 'datePublished': g.get('published', TODAY), 'dateModified': g.get('updated', TODAY),
        'image': SITE + '/assets/images/cc-share.jpg',
        'author': {'@type': 'Person', 'name': 'Charles Carper', 'url': SITE + '/about',
                   'jobTitle': 'New home sales consultant', 'worksFor': {'@type': 'Organization', 'name': 'D.R. Horton'}},
        'publisher': {'@type': 'Person', 'name': 'Charles Carper', 'url': SITE},
        'about': g.get('keyword', ''),
    }, {
        '@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Guides', 'item': SITE + '/guides/'},
            {'@type': 'ListItem', 'position': 2, 'name': g['title'], 'item': url}]
    }]
    if faqs:
        ld.append({'@context': 'https://schema.org', '@type': 'FAQPage', 'mainEntity': [
            {'@type': 'Question', 'name': q, 'acceptedAnswer': {'@type': 'Answer', 'text': a}} for q, a in faqs]})
    ld_html = '\n'.join('<script type="application/ld+json">%s</script>' % json.dumps(x, ensure_ascii=False) for x in ld)
    toc_items = ''.join('<li><a href="#%s">%s</a></li>' % (t['id'], esc(t['name'])) for t in toc if t['level'] == 2)
    updated = datetime.date.fromisoformat(g.get('updated', TODAY)).strftime('%B %Y').replace(' 0', ' ')
    page = HEAD.format(title=esc(g['seo_title']), desc=esc(g['description']), url=url, ogtype='article', site=SITE, ver=VER, ld=ld_html)
    page += ('<section class="page-head blueprint"><div class="wrap">'
             '<p class="crumb"><a href="/guides/">Guides</a> / %s</p>'
             '<h1>%s</h1>'
             '<p class="guide-meta"><span>By <a href="/about" style="color:inherit">Charles Carper</a></span><span>Updated %s</span><span>%d min read</span></p>'
             '</div></section>\n' % (esc(PILLARS[g['pillar']]), esc(g['title']), updated, mins))
    page += '<section class="section"><div class="wrap guide-body"><article class="prose">\n'
    page += '<p class="answer-first">%s</p>\n' % g['answer']
    page += body_html + '\n' + DISCLOSE + '\n'
    page += next_step(g, by_slug) + '\n' + related_block(g, by_slug) + '\n'
    if src_html:
        page += '<section class="sources" aria-labelledby="src-h"><h2 id="src-h">Sources</h2>%s</section>\n' % src_html
    page += '</article>\n'
    page += ('<aside class="toc" aria-label="On this page"><h2>On this page</h2><ol>%s</ol>'
             '<div class="toc-cta"><a class="btn btn-amber" href="/collins-ridge-plans/">Find your floor plan</a>'
             '<p class="small quiet" style="margin-top:10px">Or <a href="/book">book a visit</a> at Collins Ridge.</p></div></aside>' % toc_items)
    page += '</div></section>\n' + FOOT.format(ver=VER)
    return page


def build_hub(guides):
    url = SITE + '/guides/'
    order = ['psych', 'money', 'build', 'select', 'place', 'after', 'agents']
    ld = {'@context': 'https://schema.org', '@type': 'CollectionPage', 'name': 'New construction guides', 'url': url,
          'hasPart': [{'@type': 'Article', 'headline': g['title'], 'url': SITE + '/guides/' + g['slug']} for g in guides]}
    page = HEAD.format(title='New Construction Home Buying Guides | Charles Carper',
                       desc='Plain-English guides to buying a new construction home: the process, money, how homes get built, choosing a plan and lot, and life after move-in.',
                       url=url, ogtype='website', site=SITE, ver=VER,
                       ld='<script type="application/ld+json">%s</script>' % json.dumps(ld, ensure_ascii=False))
    page += ('<section class="page-head blueprint"><div class="wrap"><h1>New construction guides</h1>'
             '<p class="lead">Straight answers to the questions people type into Google before they buy a new home. '
             'Start wherever you are.</p></div></section>\n<section class="section"><div class="wrap">')
    page += ('<p class="agency-note">I sell new homes for D.R. Horton at Collins Ridge in Hillsborough, so I represent the builder. '
             'These guides are general education, with sources linked on every page.</p>')
    page += '<nav class="hub-jump" aria-label="Guide topics">' + ''.join(
        '<a href="#%s">%s</a>' % (k, PILLARS[k]) for k in order if any(g['pillar'] == k for g in guides)) + '<a href="#ready">Ready to look</a></nav>'
    for k in order:
        items = [g for g in guides if g['pillar'] == k]
        if not items:
            continue
        items.sort(key=lambda g: (g['stage'] != 'top', int(g.get('n', 99))))
        page += '<section class="hub-stage" id="%s"><h2>%s</h2><ul class="hub-list">' % (k, PILLARS[k])
        page += ''.join('<li><a href="/guides/%s"><b>%s</b><span>%s</span></a></li>' % (g['slug'], esc(g['title']), esc(STAGES[g['stage']]))
                        for g in items)
        page += '</ul></section>'
    page += ('<section class="hub-stage" id="ready"><h2>Ready to look in Hillsborough</h2>'
             '<p class="quiet">When you know what you need, these get you from a short list to a visit.</p>'
             '<div class="next-paths funnel-strip">'
             '<a class="next-path" href="/collins-ridge"><span class="who">The community</span><b>New homes at Collins Ridge</b></a>'
             '<a class="next-path" href="/collins-ridge-plans/"><span class="who">The plans</span><b>Narrow the 12 floor plans to yours</b></a>'
             '<a class="next-path primary" href="/book"><span class="who">The visit</span><b>Book a time to walk the homes</b></a>'
             '</div><p style="margin-top:20px"><a class="textlink" href="/match">Not sure Hillsborough fits? Answer seven questions</a> · '
             '<a class="textlink" href="/faq">Collins Ridge FAQ</a></p></section>')
    page += ('<section class="hub-stage band" id="newsletter" style="padding:32px;border-radius:8px;border:1px solid var(--rule)">'
             '<h2>Get new guides by email</h2><p class="quiet">An occasional email from me with new guides and what\'s new at Collins Ridge. '
             'It\'s my personal newsletter, not an official D.R. Horton email. Unsubscribe anytime.</p>'
             '<script src="https://js-na2.hsforms.net/forms/embed/247617862.js" defer></script>'
             '<div class="hs-form-frame" data-region="na2" data-form-id="0b4dc486-9d8e-4e91-a9a2-37f231108f90" data-portal-id="247617862"></div></section>')
    page += '</div></section>\n' + FOOT.format(ver=VER)
    return page.replace('<li><a href="/guides/" aria-current="page">Guides</a></li>', '<li><a href="/guides/" aria-current="page">Guides</a></li>')


CORE = ['/', '/collins-ridge', '/collins-ridge-plans/', '/match', '/book', '/realtors', '/about', '/faq', '/guides/',
        '/guide-is-new-construction-worth-it', '/privacy']


def build_sitemap(guides):
    urls = CORE + ['/guides/' + g['slug'] for g in guides]
    body = ''.join('<url><loc>%s%s</loc><lastmod>%s</lastmod></url>\n' % (SITE, u, TODAY) for u in urls)
    return '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' + body + '</urlset>\n'


def main():
    guides = [parse(os.path.join(SRC, f)) for f in sorted(os.listdir(SRC)) if f.endswith('.md')]
    by_slug = {g['slug']: g for g in guides}
    for g in guides:
        for k in ('slug', 'title', 'seo_title', 'description', 'stage', 'pillar', 'answer'):
            if not g.get(k):
                sys.exit('%s is missing %s' % (g['file'], k))
        if len(g['seo_title']) > 65:
            print('warn: long seo_title', g['file'], len(g['seo_title']))
        if len(g['description']) > 160:
            print('warn: long description', g['file'], len(g['description']))
        for s in g['related'] + ([g['next']] if g.get('next') else []):
            if s not in by_slug:
                print('warn: %s links to missing guide %s' % (g['file'], s))
    os.makedirs(OUT, exist_ok=True)
    for g in guides:
        open(os.path.join(OUT, g['slug'] + '.html'), 'w', encoding='utf-8').write(build_page(g, by_slug))
    open(os.path.join(OUT, 'index.html'), 'w', encoding='utf-8').write(build_hub(guides))
    open(os.path.join(ROOT, 'sitemap.xml'), 'w', encoding='utf-8').write(build_sitemap(guides))
    print('built %d guides, hub and sitemap' % len(guides))


if __name__ == '__main__':
    main()
