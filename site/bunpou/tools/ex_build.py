#!/usr/bin/env python3
"""Biên dịch bài tập trong sách: tools/<src>/ex-*.txt + answers.txt -> data/ex-<cấp>.js
Đối chiếu từng đáp án với bảng đáp án chính thức (answers.txt); lệch thì báo và dừng."""
import re, json, sys, os
sys.path.insert(0, os.path.dirname(__file__))
from furi import add_ruby, HAS_K
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LEVEL = sys.argv[1] if len(sys.argv) > 1 else 'n3'
BOOK = LEVEL if LEVEL == 'minna' else 'shin-' + LEVEL
SRC = os.path.join(ROOT, 'tools', LEVEL + 'src')
FILES = ['ex-a.txt', 'ex-b.txt', 'ex-s.txt', 'ex-t.txt', 'ex-w.txt', 'ex-n.txt']
report = []; errors = []

def rb(s, where=''):
    if BOOK == 'minna': return s  # đề kiểm tra chữ Hán/cách đọc: không gắn furigana để khỏi lộ đáp án
    out, miss = add_ruby(s)
    if miss: report.append(f'[thiếu ruby] {where}: {"".join(miss)}')
    return out

BLK = re.compile(r'((?:[＿★] ?){3}[＿★])')

def units_of(field):
    toks = field.split()
    if toks and toks[0] == BOOK: toks = toks[1:]
    return toks

def parse():
    lessons, sets = [], []
    L = S = None
    for fn in FILES:
        path = os.path.join(SRC, fn)
        if not os.path.exists(path): continue
        for ln, line in enumerate(open(path, encoding='utf8').read().split('\n'), 1):
            line = line.rstrip()
            if not line.strip() or line.lstrip().startswith('#'): continue
            m = re.match(r'^@(\w+)\s*(.*)$', line)
            if not m: raise SystemExit(f'{fn}:{ln}: dòng không hợp lệ: {line[:50]}')
            k, v = m.group(1), m.group(2).strip()
            if k == 'lesson':
                a = [x.strip() for x in v.split('|')]
                L = {'id': a[0], 'title': a[1], 'units': units_of(a[2]), 'lines': []}; lessons.append(L)
            elif k == 'l':
                L['lines'].append(v)
            elif k == 'set':
                a = [x.strip() for x in v.split('|')]
                S = {'id': a[0], 'title': a[1], 'units': units_of(a[2]), 'type': a[3], 'text': None, 'qs': [], 'src': f'{fn}:{ln}'}; sets.append(S)
            elif k == 'text':
                S['text'] = v
            elif k == 'q':
                S['qs'].append(parse_q(S, v, f'{fn}:{ln}'))
            else:
                raise SystemExit(f'{fn}:{ln}: lệnh lạ @{k}')
    return lessons, sets

def ans_list(s):
    return [int(x) for x in s.split(',') if x.strip().isdigit()]

def parse_q(S, v, where):
    t = S['type']
    parts = v.split(' | ')
    n = int(parts[0])
    if t == 'mc':
        # 5 trường: n | đề | lựa chọn | đáp án | giải thích;  4 trường: n | đề ;; lựa chọn | đáp án | giải thích
        if len(parts) >= 5 and re.fullmatch(r'[\d,]+', parts[3].strip()):
            stem, opts, ans, exp = parts[1], parts[2].split(' ;; '), parts[3].strip(), ' | '.join(parts[4:])
        else:
            segs = parts[1].split(' ;; '); stem, opts = segs[0], segs[1:]
            ans, exp = parts[2].strip(), ' | '.join(parts[3:])
        return {'n': n, 'stem': stem, 'opts': [o.strip() for o in opts], 'ans': ans_list(ans), 'exp': exp.strip(), 'w': where}
    if t == 'ord':
        stem, opts, order, exp = parts[1], parts[2].split(' ;; '), parts[3].strip(), ' | '.join(parts[4:])
        return {'n': n, 'stem': stem, 'opts': [o.strip() for o in opts], 'order': order, 'exp': exp.strip(), 'w': where}
    if t == 'fill':
        return {'n': n, 'stem': parts[1], 'hint': parts[2], 'acc': [x.strip() for x in parts[3].split('／')], 'exp': ' | '.join(parts[4:]).strip(), 'w': where}
    if t == 'pfill':
        return {'n': n, 'hint': parts[1], 'acc': [x.strip() for x in parts[2].split('／')], 'exp': ' | '.join(parts[3:]).strip(), 'w': where}
    if t == 'pmc':
        return {'n': n, 'label': parts[1], 'opts': [o.strip() for o in parts[2].split(' ;; ')], 'ans': ans_list(parts[3]), 'exp': ' | '.join(parts[4:]).strip(), 'w': where}
    raise SystemExit(f'{where}: kiểu lạ {t}')

# ---------------------------------------------------------------- đối chiếu bảng đáp án
CIRC = '①②③④⑤⑥⑦⑧⑨⑩⑪⑫⑬'
def load_answers():
    d = {}
    if not os.path.exists(os.path.join(SRC, 'answers.txt')): return d
    for line in open(os.path.join(SRC, 'answers.txt'), encoding='utf8'):
        line = line.strip()
        if not line or line.startswith('#'): continue
        k, v = [x.strip() for x in line.split('|', 1)]
        d[k] = v
    return d
def tokens(v):
    if any(c in v for c in CIRC): v = re.sub('[' + CIRC + ']', ' ', v).replace(',', ' ')
    v = v.replace('/', '／') if re.search(r'[ぁ-んァ-ヶ一-鿿]', v) else v
    return [t.strip() for t in re.split(r'[\s]+', v) if t.strip() and t != '／']
GROUP = {'t3': ['t3-1', 't3-2', 't3-3', 't3-4', 't3-5'], 't4': ['t4-1', 't4-2', 't4-3', 't4-4'],
         't6': ['t6-1', 't6-2', 't6-3'], 't9': ['t9-1'], 'mAJ': ['mAJ']}
ALIAS = {'mA-J': 'mAJ'}
def check(sets, A):
    byid = {s['id']: s for s in sets}
    seen = set()
    for key, val in A.items():
        key = ALIAS.get(key, key)
        ids = GROUP.get(key, [key])
        sl = [byid.get(i) for i in ids]
        if any(s is None for s in sl): report.append(f'[đáp án không có bộ đề] {key}'); continue
        qs = [(s, q) for s in sl for q in s['qs']]
        tk = tokens(val.replace('/ ', ' ')) if key != 't6' else tokens(val.replace('/', ' '))
        if len(tk) != len(qs):
            report.append(f'[số lượng lệch, bỏ qua đối chiếu] {key}: bảng đáp án {len(tk)} / đề {len(qs)}'); continue
        for (s, q), t in zip(qs, tk):
            seen.add(s['id'])
            typ = s['type']
            if typ in ('mc', 'pmc'):
                if re.fullmatch(r'[a-g](,[a-g])*', t): exp = sorted(ord(c) - 96 for c in t.split(','))
                elif re.fullmatch(r'\d(,\d)*', t): exp = sorted(int(c) for c in t.split(','))
                else:
                    try: exp = [q['opts'].index(t) + 1]
                    except ValueError: errors.append(f'{q["w"]}: đáp án sách "{t}" không có trong lựa chọn {q["opts"]}'); continue
                if sorted(q['ans']) != exp: errors.append(f'{s["id"]} câu {q["n"]}: file ghi {q["ans"]}, sách ghi {exp}  ({q["w"]})')
            elif typ == 'ord':
                m = re.fullmatch(r'(\d)\((\d{4})\)', t)
                if not m: report.append(f'[khó đối chiếu] {key}: {t}'); continue
                if q['order'] != m.group(2) or int(q['order'][2]) != int(m.group(1)): errors.append(f'{s["id"]} câu {q["n"]}: file {q["order"]}, sách {t}  ({q["w"]})')
            elif typ in ('fill', 'pfill'):
                alts = [a for a in t.split('／')]
                if not set(alts) & set(q['acc']) and not set(q['acc']) <= set(alts): errors.append(f'{s["id"]} câu {q["n"]}: file {q["acc"]}, sách {t}  ({q["w"]})')
    for s in sets:
        if s['id'] not in seen: report.append(f'[chưa đối chiếu với bảng đáp án] {s["id"]} ({s["type"]}, {len(s["qs"])} câu)')

# ---------------------------------------------------------------- xuất
def stem_parts(stem, where):
    m = BLK.search(stem)
    if not m: return None
    g = re.sub(r' ', '', m.group(1)); st = g.index('★') if '★' in g else 2
    return {'pre': rb(stem[:m.start()], where), 'post': rb(stem[m.end():], where), 'star': st}
POOL = re.compile(r'^[wn]')
def pool_merge(sets, size=15, minimum=10):
    keep = [s for s in sets if not POOL.match(s['id'])]
    by = {}
    for s in sets:
        if POOL.match(s['id']):
            for q in s['qs']:
                q2 = dict(q); q2['t'] = s['type']; by.setdefault(s['units'][-1], []).append(q2)
    rank = {'mc': 0, 'fill': 1, 'ord': 2}
    for u, qs in by.items():
        qs.sort(key=lambda q: rank[q['t']])   # sort ổn định: giữ thứ tự gốc trong từng loại
        chunks = [qs[i:i + size] for i in range(0, len(qs), size)]
        if len(chunks) > 1 and len(chunks[-1]) < minimum:
            last = chunks.pop(); chunks[-1] += last
        if len(chunks) == 1 and len(chunks[0]) < minimum:
            report.append(f'[bỏ vì quá ít câu] bài {u}: {len(chunks[0])} câu'); continue
        for i, ch in enumerate(chunks, 1):
            for n, q in enumerate(ch, 1): q['n'] = n
            keep.append({'id': f'p{u}-{i}', 'title': 'Đề', 'units': [u], 'type': 'mix', 'text': None, 'qs': ch, 'src': 'pool'})
    return keep
def finish(sets, lessons):
    out = []
    if BOOK == 'minna':   # đánh số Đề 1, 2, 3… trong mỗi bài (đề kiểm tra bài trước, rồi đề ôn gộp/tuần)
        by = {}
        for s in sets: by.setdefault(s['units'][-1], []).append(s)
        for u, lst in by.items():
            lst.sort(key=lambda x: (0 if re.fullmatch(r'k\d+', x['id']) else 1 if x['id'].startswith('p') else 2 if x['id'].startswith('k') else 3))
            for i, s in enumerate(lst, 1): s['title'] = f'Đề {i}' if (re.fullmatch(r'k\d+', s['id']) or s['id'].startswith('p')) else f'Đề {i} · ' + s['title']
        sets = [s for u in sorted(by, key=lambda x: int(x) if str(x).isdigit() else 0) for s in by[u]]
    for s in sets:
        o = {'id': s['id'], 'title': s['title'], 'units': s['units'], 'type': s['type'], 'qs': []}
        if s['text']:
            txt = s['text']; segs = []; pos = 0
            for m in re.finditer(r'【([^】]+)】', txt):
                if m.start() > pos: segs.append({'t': rb(txt[pos:m.start()], s['id'])})
                segs.append({'b': m.group(1)}); pos = m.end()
            if pos < len(txt): segs.append({'t': rb(txt[pos:], s['id'])})
            o['text'] = segs
        for q in s['qs']:
            ty = q.get('t', s['type'])
            if ty == 'mc':
                o['qs'].append({'n': q['n'], **({'t': ty} if ty != s['type'] else {}), 'q': rb(q['stem'], s['id']), 'opts': [rb(x, s['id']) for x in q['opts']], 'ans': q['ans'], 'exp': q['exp'],
                                'say': q['stem'].replace('（　　）', '').replace('（　）', '') if False else ''})
            elif ty == 'ord':
                sp = stem_parts(q['stem'], s['id'])
                if not sp: errors.append(f'{q["w"]}: không có ô trống ＿ trong đề'); continue
                o['qs'].append({'n': q['n'], 't': 'ord', **({'star': sp['star']} if sp['star'] != 2 else {}), 'pre': sp['pre'], 'post': sp['post'], 'opts': [rb(x, s['id']) for x in q['opts']], 'order': q['order'], 'exp': q['exp']})
            elif ty == 'fill':
                o['qs'].append({'n': q['n'], **({'t': ty} if ty != s['type'] else {}), 'q': rb(q['stem'], s['id']), 'hint': q['hint'], 'acc': q['acc'], 'exp': q['exp']})
            elif ty == 'pfill':
                o['qs'].append({'n': q['n'], 'hint': q['hint'], 'acc': q['acc'], 'exp': q['exp']})
            elif ty == 'pmc':
                o['qs'].append({'n': q['n'], 'label': q['label'], 'opts': [rb(x, s['id']) for x in q['opts']], 'ans': q['ans'], 'exp': q['exp']})
        out.append(o)
    return {'book': BOOK, 'lessons': lessons, 'sets': out}

if __name__ == '__main__':
    lessons, sets = parse()
    A = load_answers()
    check(sets, A)
    if BOOK == 'minna': sets = pool_merge(sets)
    data = finish(sets, lessons)
    if errors:
        print('\n'.join(errors)); print(len(errors), 'LỖI so với đáp án sách');
    js = 'SB.exData(' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ');\n'
    open(os.path.join(ROOT, 'data', f'ex-{LEVEL}.js'), 'w', encoding='utf8').write(js)
    open(os.path.join(ROOT, 'tools', f'ex-report-{LEVEL}.txt'), 'w', encoding='utf8').write('\n'.join(report + ['--- LỖI ---'] + errors))
    nq = sum(len(s['qs']) for s in sets)
    print(f'{LEVEL}: {len(sets)} bộ, {nq} câu, {len(lessons)} bài tóm tắt, {len(js)//1024} KB; {len(report)} cảnh báo, {len(errors)} lỗi')
    sys.exit(1 if errors else 0)
