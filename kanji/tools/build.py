#!/usr/bin/env python3
"""Tạo dữ liệu Super Kanji từ KANJIDIC2, KanjiVG, cjkvi-ids và dữ liệu Hán Việt/nghĩa tự soạn."""
import gzip, glob, json, re, os, sys, unicodedata, xml.etree.ElementTree as ET
from collections import defaultdict, OrderedDict

W = os.environ.get('KANJI_WORK', os.path.join(os.path.dirname(os.path.abspath(__file__)), 'work'))
DATA = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'data')
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'data')
os.makedirs(OUT + '/s', exist_ok=True)

# ---------------- giáo trình ----------------
LV = {'N5': 5, 'N4': 4, 'N3': 3, 'N2': 2, 'N1': 1}
toc = OrderedDict()
cur = None
for line in open(DATA + '/toc.txt', encoding='utf8'):
    line = line.rstrip('\n')
    if not line.strip():
        continue
    if line.startswith('@'):
        cur = line[1:].strip().lower(); toc[cur] = []
    elif line.startswith('#'):
        no, jp, vi = line[1:].split('|')
        toc[cur].append({'no': int(no), 'jp': jp, 'vi': vi, 'units': []})
    else:
        for t in line.split():
            lab, ks = (t.split(':', 1) if ':' in t else ('', t))
            toc[cur][-1]['units'].append({'u': lab, 'ks': ks})

order = []          # (kanji, level, chapter-id)
seen = {}
for lv, chs in toc.items():
    for ch in chs:
        for u in ch['units']:
            for k in u['ks']:
                if k not in seen:
                    seen[k] = (lv, ch['no']); order.append(k)
extra = {'訓': 'n3', '塁': 'n1', '羞': 'n1'}
for k, lv in extra.items():
    seen[k] = (lv, 0); order.append(k)

# ---------------- Hán Việt + nghĩa ----------------
VI = {}
for f in sorted(glob.glob(DATA + '/vi/*.txt')):
    for l in open(f, encoding='utf8'):
        if l.strip():
            k, hv, m = l.rstrip('\n').split('|')
            VI[k] = (hv.strip(), m.strip())
miss = [k for k in order if k not in VI]
assert not miss, miss

# ---------------- bộ thủ ----------------
RAD = {}
for l in open(DATA + '/radicals.txt', encoding='utf8'):
    n, g, hv, m = l.rstrip('\n').split('|')
    RAD[int(n)] = (g, hv, m)
def rstrokes(n):
    for lim, s in [(6, 1), (29, 2), (60, 3), (94, 4), (117, 5), (146, 6), (166, 7), (175, 8), (186, 9), (194, 10), (200, 11), (204, 12), (208, 13), (210, 14), (211, 15), (213, 16), (214, 17)]:
        if n <= lim: return s
RADMAP = {}
for n, (g, hv, m) in RAD.items():
    RADMAP[g] = n
for n in range(0x2F00, 0x2FD6):
    RADMAP[unicodedata.normalize('NFKC', chr(n))] = RADMAP.get(unicodedata.normalize('NFKC', chr(n)), n - 0x2F00 + 1)
    RADMAP[chr(n)] = n - 0x2F00 + 1
VAR = {
    9: '亻⺅', 18: '刂⺉', 61: '忄⺖㣺⺗', 64: '扌⺘', 85: '氵⺡氺', 86: '灬⺣', 94: '犭⺨', 130: '⺼', 140: '艹⺾', 162: '辶⻌⻍',
    163: '⻏', 170: '⻖', 145: '衤', 113: '礻', 122: '罒⺲罓', 125: '耂⺹', 120: '糹', 184: '飠', 167: '釒', 149: '訁', 96: '王',
    118: '⺮', 93: '牜', 66: '攵', 87: '爫⺤', 47: '巛巜', 71: '旡', 103: '⺪', 43: '尣', 78: '歺', 63: '戶', 168: '镸', 80: '母',
    5: '乚⺄', 58: '⺕彑', 174: '靑', 201: '黃', 203: '黑', 210: '齊', 211: '齒', 212: '龍', 213: '龜', 199: '麥', 181: '頁', 196: '鳥',
    195: '魚', 187: '馬', 154: '貝', 159: '車', 147: '見', 169: '門', 182: '風', 183: '飛', 186: '香', 189: '髙', 38: '女', 120.5: '',
    4: '乀⺁丿', 10: '⺈', 20: '', 75: '朩', 44: '尸', 53: '广', 20.5: '',
}
for n, s in VAR.items():
    for c in s:
        if c and int(n) == n:
            RADMAP.setdefault(c, int(n))
RADMAP['⺈'] = 20; RADMAP['勹'] = 20; RADMAP['阝'] = 170; RADMAP['𠂉'] = 4
RADMAP['网'] = 122; RADMAP['冈'] = 13; RADMAP['廿'] = 24; RADMAP['丷'] = 12; RADMAP['⺌'] = 42; RADMAP['小'] = 42
RADMAP['屮'] = 45; RADMAP['艹'] = 140; RADMAP['辶'] = 162; RADMAP['氵'] = 85; RADMAP['亻'] = 9; RADMAP['扌'] = 64; RADMAP['忄'] = 61

# ---------------- KANJIDIC2 ----------------
root = ET.parse(gzip.open(W + '/src/kanjidic2.xml.gz')).getroot()
DIC = {}
for c in root.iter('character'):
    lit = c.findtext('literal')
    d = {'rad': None, 'st': None, 'on': [], 'kun': [], 'en': []}
    for r in c.iter('rad_value'):
        if r.get('rad_type') == 'classical': d['rad'] = int(r.text)
    sc = c.find('misc/stroke_count')
    if sc is not None: d['st'] = int(sc.text)
    for r in c.iter('reading'):
        if r.get('r_type') == 'ja_on': d['on'].append(r.text)
        elif r.get('r_type') == 'ja_kun': d['kun'].append(r.text)
    for m in c.iter('meaning'):
        if m.get('m_lang') is None: d['en'].append(m.text)
    DIC[lit] = d

# ---------------- IDS ----------------
OPS3 = '⿲⿳'
OPS = set('⿰⿱⿲⿳⿴⿵⿶⿷⿸⿹⿺⿻')
IDS = {}
for l in open(W + '/src/ids.txt', encoding='utf8'):
    if l.startswith('#') or not l.strip(): continue
    p = l.rstrip('\n').split('\t')
    if len(p) < 3: continue
    ch = p[1]; best = None
    for s in p[2:]:
        m = re.match(r'^(.*?)(\[[A-Z]+\])?$', s)
        body, tag = m.group(1), m.group(2) or ''
        if best is None or 'J' in tag: best = body
        if 'J' in tag: break
    IDS[ch] = best
def tokens(s):
    out = []; i = 0
    while i < len(s):
        if s[i] == '&':
            j = s.index(';', i); out.append(s[i:j + 1]); i = j + 1
        else:
            out.append(s[i]); i += 1
    return out
def children(ch):
    s = IDS.get(ch)
    if not s: return []
    t = [x for x in tokens(s) if x not in OPS and not x.startswith('&') and x not in '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬⑭⑮⑯⑰⑱⑲⑳']
    if t == [ch]: return []
    return t
def vname(c):                      # chuẩn hoá biến thể bộ thủ
    return c
def desc_all(k, depth=0, acc=None):
    """Mọi thành phần (đi sâu hết cỡ) cho gia đình"""
    if acc is None: acc = set()
    if depth > 4: return acc
    for c in children(k):
        if c in acc or c == k: continue
        acc.add(c); desc_all(c, depth + 1, acc)
    return acc
AMBIG = {'月': (74, 130), '阝': (163, 170)}
def radof(c, krad):
    if c in AMBIG and krad in AMBIG[c]: return krad
    return RADMAP.get(c)
def desc_rad(k, krad, depth=0, acc=None):
    """Bộ thủ chứa trong chữ: dừng ở thành phần đã là bộ thủ"""
    if acc is None: acc = set()
    if depth > 4: return acc
    for c in children(k):
        rn = radof(c, krad)
        if rn: acc.add(rn)
        else: desc_rad(c, krad, depth + 1, acc)
    return acc

# ---------------- Hán Việt cho thành phần ngoài bộ dữ liệu ----------------
HVU = json.load(open(DATA + '/hv_unihan.json'))
def comp_info(c):
    if c in VI: return VI[c][0], VI[c][1]
    if c in RADMAP:
        g, hv, m = RAD[RADMAP[c]]; return hv, m
    if c in HVU: return HVU[c][0].upper(), ''
    return '', ''
def short(m):
    return m.split(';')[0].strip().lower() if m else ''
def lowfirst(m):
    s = short(m)
    return s

def stripvoice(s):
    t = unicodedata.normalize('NFD', s)
    t = ''.join(ch for ch in t if ch not in '゙゚')
    return unicodedata.normalize('NFC', t)
def onset(c):
    return {stripvoice(x) for x in DIC.get(c, {}).get('on', [])}

# ---------------- nguồn gốc chữ (viết tay theo Lục thư) ----------------
ETY = {}
for f in sorted(glob.glob(DATA + '/ety/*.txt')):
    for l in open(f, encoding='utf8'):
        l = l.rstrip('\n')
        if not l.strip() or l.startswith('#'): continue
        k, ls, tx = l.split('|', 2)
        ETY[k] = (ls.strip(), tx.strip())

# ---------------- dựng bản ghi ----------------
HUYEN = json.load(open(DATA + '/huyen.json', encoding='utf8'))
recs = {}
for k in order:
    d = DIC.get(k)
    if d is None:
        print('KHÔNG có trong KANJIDIC:', k, file=sys.stderr); d = {'rad': None, 'st': None, 'on': [], 'kun': [], 'en': []}
    lv, ch = seen[k]
    hv, m = VI[k]
    rad = d['rad']
    comps = children(k)
    selfrad = RADMAP.get(k) == rad and k in RADMAP
    rd = set() if selfrad else {x for x in desc_rad(k, rad) if x > 6}
    if rad: rd.add(rad)
    parts = []
    for c in comps:
        rn = radof(c, rad)
        if rn:
            g, rhv, rm_ = RAD[rn]
            parts.append([c, rhv, rm_, g if g != c else ''])
        else:
            h, mm = comp_info(c)
            parts.append([c, h, mm, ''])
    if not parts and rad and not selfrad:
        g, rhv, rm_ = RAD[rad]; parts.append([g, rhv, rm_, ''])
    mshort = short(m)
    kon = onset(k)
    ls, org, auto = '', '', 0
    if k in ETY:
        ls, org = ETY[k]
    else:
        auto = 1
        rg, rhv, rm = RAD.get(rad, ('', '', '')) if rad else ('', '', '')
        def lab(c):
            rn = radof(c, rad)
            if rn:
                g2, h2, m2 = RAD[rn]
                if g2 != c: return f'{c} (dạng biến của {g2} {h2}: {short(m2).lower()})'
                return f'{c} ({h2}: {short(m2).lower()})'
            h, mm = comp_info(c)
            if h and mm: return f'{c} ({h}: {short(mm).lower()})'
            if h: return f'{c} ({h})'
            return c
        if selfrad:
            org = f'Chữ này chính là bộ thủ số {rad} ({rhv}), nghĩa gốc là “{short(rm).lower()}”.'
        elif comps:
            radc = next((c for c in comps if radof(c, rad) == rad), None)
            other = [c for c in comps if c != radc]
            phon = next((c for c in other if radc and len(other) <= 2 and onset(c) & kon), None)
            if radc and phon:
                ls = 'HT'
                org = f'Cấu tạo hình thanh: {lab(radc)} chỉ phạm trù nghĩa, {phon} gợi âm đọc ({"・".join(DIC[phon]["on"][:2])}).'
            else:
                org = 'Cấu tạo: ' + ' + '.join(lab(c) for c in comps) + '.'
        else:
            org = ''
    recs[k] = {'k': k, 'l': LV[lv.upper()] if isinstance(lv, str) else lv, 'ch': ch, 'hv': hv, 'm': m,
               'on': d['on'], 'kun': d['kun'], 's': d['st'], 'r': rad, 'rd': sorted(rd),
               'p': parts, 'ls': ls, 'o': org, 'a': auto, 'en': d['en'][:3]}

# ---------------- gia đình Kanji ----------------
kset = set(order)
HUYEN = json.load(open(DATA + '/huyen.json', encoding='utf8'))
heads = defaultdict(set); fkind = defaultdict(set)
for k in order:
    for c in set(children(k)):
        if len(c) != 1 or c == k or c not in DIC: continue
        st = DIC.get(c, {}).get('st') or 0
        if st and st <= 2: continue
        heads[c].add(k)
# nhóm chuyển chú / hình thanh theo sách Huyền Lục Thư (file Excel của tác giả)
for k, h in HUYEN.items():
    if k not in kset: continue
    for part in h['c'].split(';'):
        part = part.strip()
        if not part: continue
        g = part[0]
        if h['t'] == 'CC' and 'chuyển chú' in part: heads[g].add(k); fkind[g].add('CC')
        elif h['t'] == 'HT' and 'chỉ ý' not in part: heads[g].add(k); fkind[g].add('HT')
fams = []
for h, ms in heads.items():
    mem = sorted(ms, key=order.index)
    if h in kset and h not in mem: mem.insert(0, h)
    if 2 <= len(mem) <= 36:
        fams.append((h, mem))
byset = {}
for h, mem in fams:
    key = frozenset(mem)
    cand = byset.get(key)
    if cand is None or (h in kset and cand[0] not in kset) or ((DIC.get(h, {}).get('st') or 0) > (DIC.get(cand[0], {}).get('st') or 0) and (h in kset) == (cand[0] in kset)):
        byset[key] = (h, mem)
fams = list(byset.values())
# mỗi chữ giữ tối đa 4 gia đình (ưu tiên nhóm sách Huyền Lục Thư, rồi nhóm nhỏ)
fam_of = defaultdict(list)
for h, mem in sorted(fams, key=lambda x: (0 if fkind.get(x[0]) else 1, len(x[1]), x[0])):
    for k in mem:
        if len(fam_of[k]) < 4: fam_of[k].append(h)
famout = []
for h, mem in fams:
    mem2 = [k for k in mem if h in fam_of[k]]
    if len(mem2) >= 2:
        if h in kset and h not in mem2: mem2.insert(0, h)
        famout.append((h, mem2))
famout.sort(key=lambda x: (-len(x[1]), x[0]))
for k in recs: recs[k]['f'] = [h for h, mem in sorted(famout, key=lambda x: len(x[1])) if k in mem][:4]
famjs = []
for h, mem in famout:
    hh, hm = comp_info(h)
    lv = sorted({recs[k]['l'] for k in mem if k in recs}, reverse=True)
    famjs.append({'h': h, 'hv': hh, 'hm': hm, 'ks': ''.join(mem), 'l': lv[0] if lv else 1, 'kd': ''.join(sorted(fkind.get(h, []))), 's': DIC.get(h, {}).get('st') or 0})
famjs.sort(key=lambda f: (-f['l'], -len(f['ks']), f['h']))
# ---------------- ghi file ----------------
byl = defaultdict(list)
for k in order: byl[recs[k]['l']].append(recs[k])
def js(o): return json.dumps(o, ensure_ascii=False, separators=(',', ':'))
for l, lst in byl.items():
    with open(f'{OUT}/k{l}.js', 'w', encoding='utf8') as f:
        f.write(f'KANJI.add({l},{js(lst)});\n')
radjs = [{'n': n, 'g': g, 'hv': hv, 'm': m, 's': rstrokes(n)} for n, (g, hv, m) in sorted(RAD.items())]
tocjs = {lv: [{'no': c['no'], 'jp': c['jp'], 'vi': c['vi'], 'u': [[u['u'], u['ks']] for u in c['units']]} for c in chs] for lv, chs in toc.items()}
with open(f'{OUT}/meta.js', 'w', encoding='utf8') as f:
    f.write('KANJI.meta(' + js({'rad': radjs, 'toc': tocjs, 'fam': famjs, 'extra': extra}) + ');\n')

# ---------------- nét viết KanjiVG ----------------
def r1(m):
    t = m.group(0); v = round(float(t), 1)
    if v == 0: return '-0' if t.startswith('-') else '0'
    return str(int(v)) if v == int(v) else str(v)
ns = '{http://www.w3.org/2000/svg}'
nostroke = []
for l, lst in byl.items():
    out = {}
    for r in lst:
        fn = f'{W}/src/kanjivg/kanji/{ord(r["k"]):05x}.svg'
        if not os.path.exists(fn): nostroke.append(r['k']); continue
        t = ET.parse(fn).getroot()
        ds = [re.sub(r'-?\d+\.\d+', r1, p.get('d')) for p in t.iter(ns + 'path')]
        nums = []
        for tx in t.iter(ns + 'text'):
            m = re.search(r'matrix\(1 0 0 1 ([\d.\-]+) ([\d.\-]+)\)', tx.get('transform', ''))
            if m: nums.append([round(float(m.group(1)), 1), round(float(m.group(2)), 1)])
        out[r['k']] = [ds, nums]
    with open(f'{OUT}/s/s{l}.js', 'w', encoding='utf8') as f:
        f.write(f'KANJI.strokes({js(out)});\n')

print('kanji:', len(order), 'mỗi cấp:', {l: len(v) for l, v in sorted(byl.items())})
print('gia đình:', len(famjs), 'chữ có gia đình:', sum(1 for r in recs.values() if r['f']))
print('thiếu nét:', nostroke)
print('chữ không có on/kun:', [k for k, r in recs.items() if not r['on'] and not r['kun']])
print('kích thước:', {os.path.basename(p): os.path.getsize(p) // 1024 for p in glob.glob(OUT + '/*.js') + glob.glob(OUT + '/s/*.js')})

# ---------------- từ vựng Super Goi ----------------
GOI = os.environ.get('GOI_DIR', os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', '..', 'goi', 'data'))
rows = []
for lv in ['n5', 'n4', 'n3', 'n2', 'n1', 'nganh']:
    fn = f'{GOI}/{lv}.js'
    if not os.path.exists(fn): continue
    t = open(fn, encoding='utf8').read()
    d = json.loads(t[t.index('(') + 1:t.rindex(')')])
    for tp in d['topics']:
        for it in tp['items']:
            if re.search(r'[\u3400-\u9fff]', it['w']):
                rows.append([it['id'], it['w'], it['vi']])
with open(f'{OUT}/words.js', 'w', encoding='utf8') as f:
    f.write('KANJI.words(' + js(rows) + ');\n')
print('từ vựng có Kanji:', len(rows), 'ety viết tay:', len(ETY), 'tự động:', sum(r['a'] for r in recs.values()))
