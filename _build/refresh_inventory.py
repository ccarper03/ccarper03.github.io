#!/usr/bin/env python3
"""Monday refresh for the move-in ready list.

    python3 _build/refresh_inventory.py PUBLIC_CSV INTERNAL_JSON [DASHBOARD_INDEX_HTML]

PUBLIC_CSV     The public drhorton.com Raleigh-Durham inventory, every page
               (https://www.drhorton.com/north-carolina/raleigh-durham/inventory?page=N), as
               community,city,address,price,beds,baths,sqft,garage
INTERNAL_JSON  The latest homesales pull from the DRH Inventory Dashboard repo (data/inventory.json).
               Used ONLY to pick which public homes are far enough along (milestone 9 or later).
               Nothing from it is published except the stage badge and the plan name.
DASHBOARD_INDEX_HTML  Optional. The dashboard's index.html, for its plan-code-to-plan-name list.

Writes data/move-in-ready.json. Then run python3 _build/build.py.

Rules (from the lead strategy guardrails):
- Every price is the public drhorton.com list price, dated the day of the refresh.
- Keep homes at milestone 9 or later, plus every Collins Ridge home on the public list.
- A public home with no homesales match is left out (its stage can't be checked), except at Collins Ridge.
"""
import csv, datetime as dt, json, os, re, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SUFFIX = {'street': 'st', 'drive': 'dr', 'road': 'rd', 'lane': 'ln', 'court': 'ct', 'place': 'pl', 'circle': 'cir',
          'boulevard': 'blvd', 'parkway': 'pkwy', 'trail': 'trl', 'crossing': 'xing', 'alley': 'aly', 'avenue': 'ave',
          'terrace': 'ter', 'memorial': 'mem', 'north': 'n', 'south': 's', 'east': 'e', 'west': 'w'}
# Collins Ridge plan names by square feet (D.R. Horton's published plan sizes)
CR_PLANS = {1764: 'Cali', 2240: 'Savannah', 2340: 'Galen', 2368: 'Robie', 2395: 'Sierra', 2439: 'Linville', 2511: 'Hayden',
            2518: 'Alec', 2570: 'Landon', 2628: 'Calhoun', 2637: 'Jackson', 2804: 'Hanover'}
CR_REAR = {'Alec', 'Calhoun', 'Jackson'}


def norm(addr):
    words = re.sub(r'[^a-z0-9 ]', ' ', addr.lower()).split()
    if words and words[0].isdigit():
        words[0] = str(int(words[0]))
    return ' '.join(SUFFIX.get(w, w) for w in words)


def stage(m, is_cr):
    if m >= 11:
        return 'ready'          # certificate of occupancy or later
    if m >= 9:
        return 'almost'         # flooring, final touches, final inspection
    if not is_cr:
        return None
    return 'building' if m >= 1 else 'notstarted'


def plan_names(path):
    if not path or not os.path.exists(path):
        return {}
    s = open(path, encoding='utf-8').read()
    block = re.search(r'const planToModel = \{(.*?)\};', s, re.S)
    out = {}
    for line in (block.group(1) if block else '').splitlines():
        m = re.match(r'\s*"([^"]+)":\s*"([^"]+)",?\s*(//.*)?$', line)
        if m and not (m.group(3) and 'unofficial' in m.group(3)):
            out[m.group(1)] = m.group(2)
    return out


def main(public_csv, internal_json, dash_html=None):
    names = plan_names(dash_html)
    internal = json.load(open(internal_json, encoding='utf-8'))
    by_addr = {}
    for h in internal.get('Inventory', []):
        by_addr[norm(h.get('HomeAddress', ''))] = h
    rows = list(csv.DictReader(open(public_csv, encoding='utf-8')))
    homes, skipped = [], {'no_match': 0, 'too_early': 0}
    for r in rows:
        community, town = r['community'].strip(), r['city'].strip()
        is_cr = community.startswith('Collins Ridge')
        h = by_addr.get(norm(r['address']))
        if not h and not is_cr:
            skipped['no_match'] += 1
            continue
        m = int(h['Milestone']) if h and str(h.get('Milestone', '')).strip().isdigit() else 0
        st = stage(m, is_cr)
        if not st:
            skipped['too_early'] += 1
            continue
        sqft = int(float(r['sqft']))
        rear = False
        if is_cr:
            plan = CR_PLANS.get(sqft)
            rear = plan in CR_REAR
        else:
            plan = names.get(str(h.get('Plan', ''))) if h else None
            if plan and plan.endswith(' Rear Load'):
                plan, rear = plan[:-len(' Rear Load')], True
        townhome = 'Townes' in community or (is_cr and plan in ('Savannah', 'Linville'))
        stories = int(h['Story']) if h and h.get('Story') else (1 if plan == 'Cali' else 2)
        homes.append({
            'community': community, 'town': town, 'plan': plan, 'price': int(float(r['price'])),
            'beds': int(float(r['beds'])), 'baths': float(r['baths']), 'sqft': sqft, 'garage': int(float(r['garage'] or 0)),
            'stories': stories, 'type': 'townhome' if townhome else 'single-family',
            'rearLoad': rear, 'status': st, 'address': r['address'].strip(),
        })
    order = {'ready': 0, 'almost': 1, 'building': 2, 'notstarted': 3}
    homes.sort(key=lambda x: (not x['community'].startswith('Collins Ridge') or x['status'] not in ('ready', 'almost'),
                              order[x['status']], x['price']))
    out = {
        'asOf': dt.date.today().isoformat(),
        'source': 'https://www.drhorton.com/north-carolina/raleigh-durham/inventory',
        'sample': False,
        'note': 'Public drhorton.com list prices as of asOf. Milestone 9+ homes across Raleigh-Durham, plus every Collins Ridge home.',
        'homes': homes,
    }
    dst = os.path.join(ROOT, 'data', 'move-in-ready.json')
    json.dump(out, open(dst, 'w', encoding='utf-8'), indent=1, ensure_ascii=False)
    print('public rows:', len(rows), '| kept:', len(homes), '| skipped:', skipped,
          '| internal pulled:', internal.get('pulledAt'))
    by = {}
    for h in homes:
        by[h['status']] = by.get(h['status'], 0) + 1
    print('by stage:', by)


if __name__ == '__main__':
    if len(sys.argv) < 3:
        print(__doc__)
        sys.exit(1)
    main(*sys.argv[1:4])
