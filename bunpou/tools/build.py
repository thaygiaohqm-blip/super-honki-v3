#!/usr/bin/env python3
"""Biên dịch source/gram/*.txt -> data/gram-<cấp>.js (thêm furigana, đánh dấu mẫu, chuẩn bị bài sắp xếp câu)."""
import re, json, sys, os, glob, random
sys.path.insert(0, os.path.dirname(__file__))
from furi import add_ruby, RUBY, KJ, HAS_K, TAG, kata2hira
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, 'source', 'gram'); OUT = os.path.join(ROOT, 'data')
report = []
RUBYF = re.compile(f'([{KJ}]+)\\[([^\\]]+)\\]')
def plain(s): return RUBY.sub(lambda m: m.group(1) or m.group(3), s)
def strip_bar(s): return s.replace('｜', '')
def units(s):
    """Chia chuỗi có ruby thành các đơn vị (surface, rendered)."""
    out = []; pos = 0
    for m in RUBYF.finditer(s):
        for ch in s[pos:m.start()]: out.append((ch, ch))
        out.append((m.group(1), m.group(0))); pos = m.end()
    for ch in s[pos:]: out.append((ch, ch))
    return out
def surf_index(us):
    idx = []; n = 0
    for sf, rd in us: idx.append(n); n += len(sf)
    idx.append(n); return idx
def render(us, a, b):
    """Lấy phần surface [a,b) thành chuỗi có ruby (co giãn theo đơn vị)."""
    idx = surf_index(us); out = ''
    for k, (sf, rd) in enumerate(us):
        if idx[k] >= a and idx[k+1] <= b: out += rd
        elif idx[k] < b and idx[k+1] > a: out += rd  # đơn vị bị cắt giữa: lấy trọn
    return out
def keys_of(pat):
    """Trả về danh sách biến thể (dạng có ruby) dùng để tìm và tô đậm mẫu trong câu ví dụ."""
    res = []
    for seg in re.split(r'[／]', pat):
        seg = seg.strip().replace('一～', '').lstrip('～').strip()
        if not seg or '～' in seg[:-0 or None]: 
            if '～' in seg: continue
        seg = seg.replace('(よ)う', 'よう').replace('（よ）う', 'よう')
        vs = [seg]
        m = re.search(r'\(([^)]+)\)|（([^）]+)）', seg)
        k = 0
        while m and k < 3:
            nv = []
            for v in vs:
                mm = re.search(r'\(([^)]+)\)|（([^）]+)）', v)
                if mm:
                    inner = mm.group(1) or mm.group(2)
                    nv.append(v[:mm.start()] + inner + v[mm.end():]); nv.append(v[:mm.start()] + v[mm.end():])
                else: nv.append(v)
            vs = nv; m = any(re.search(r'\(|（', v) for v in vs); k += 1
        for v in vs:
            v = v.strip('～ ')
            if v and '～' not in v and len(plain(v)) >= 1 and v not in res: res.append(v)
    return res
def find_hl(ruby_ex, keys):
    """Trả về (danh sách span [(a,b)...], alt) cho biến thể đầu tiên khớp; keys có thể là regex 're:...' (mỗi nhóm bắt = một span)."""
    ps = plain(ruby_ex)
    cands = []
    for k in keys:
        if k == '-': return None
        if k.startswith('re:'):
            m = re.search(k[3:], ps)
            if m:
                if m.re.groups: sp = [m.span(i) for i in range(1, m.re.groups + 1) if m.group(i)]
                else: sp = [m.span()]
                cands.append((sp, k))
                break
        else:
            kp = plain(k); i = ps.find(kp)
            if i >= 0: cands.append(([(i, i + len(kp))], k)); break
    return cands[0] if cands else None
def auto_keys(pat):
    """Khóa dự phòng: tách tiêu đề theo ～ và … thành các đoạn cố định, khớp theo thứ tự (mỗi đoạn là một vùng tô)."""
    res = []
    for v in re.split(r'[／]', pat):
        v = v.strip().replace('(よ)う', 'よう')
        vs = [v]
        for _ in range(3):
            nv = []
            for x in vs:
                mm = re.search(r'\(([^)]+)\)|（([^）]+)）', x)
                if mm: nv += [x[:mm.start()] + (mm.group(1) or mm.group(2)) + x[mm.end():], x[:mm.start()] + x[mm.end():]]
                else: nv.append(x)
            vs = nv
        for x in vs:
            segs = [plain(t).strip() for t in re.split(r'[～…]+', x) if plain(t).strip()]
            if len(segs) >= 2:
                esc_ = [re.escape(t).replace('ても', '[てで]も') for t in segs]
                res.append('re:' + '.{0,40}?'.join('(' + e + ')' for e in esc_))
    return res
def mark(ruby_ex, spans):
    us = units(ruby_ex); idx = surf_index(us)
    opens = {}; closes = {}
    for a, b in spans:
        for k in range(len(us)):
            if idx[k+1] > a: opens[k] = True; break
        for k in range(len(us)):
            if idx[k+1] >= b: closes[k] = True; break
    out = ''
    for k, (sf, rd) in enumerate(us):
        if k in opens: out += '{'
        out += rd
        if k in closes: out += '}'
    return out

def make_cj(ja, sp):
    """Bài 'chia từ': chỗ trống là cụm động từ / tính từ đứng ngay trước mẫu. Trả về dict hoặc None."""
    if not sp: return None
    ps = plain(ja); a = min(x for x, _ in sp)
    toks = []; pos = 0
    for w in TAG(ps): toks.append((pos, w)); pos += len(w.surface)
    if pos != len(ps): return None
    i0 = next((k for k, (p0, _) in enumerate(toks) if p0 == a), None)
    if i0 is None or i0 == 0: return None
    j = i0 - 1
    while j >= 0 and (toks[j][1].feature.pos1 in ('助動詞', '接尾辞') or (toks[j][1].feature.pos1 == '助詞' and toks[j][1].surface in ('て', 'で'))): j -= 1
    if j < 0: return None
    hw = toks[j][1]; pos1 = hw.feature.pos1
    if pos1 not in ('動詞', '形容詞', '形状詞'): return None
    run = toks[j:i0]
    if pos1 == '形状詞' and not (len(run) == 2 and run[1][1].surface in ('な', 'で', 'だ')): return None
    surf = ''.join(w.surface for _, w in run)
    if pos1 == '動詞' and surf == hw.surface and hw.surface in ('い', 'し', 'み', 'き', 'て'): return None
    if pos1 == '動詞' and j >= 1 and toks[j-1][1].surface in ('て', 'で') and (getattr(hw.feature, 'orthBase', '') in ('いる', 'ある', 'くる', 'いく', 'みる', 'しまう', 'おく', 'もらう', 'くれる', 'あげる', 'いただく', 'ください', 'くださる', '居る', '有る', '来る', '行く', '見る', '貰う', '呉れる', '遣る', '頂く') or hw.surface in ('い', 'み', 'き', 'もらっ', 'あげ', 'くれ')): return None
    base = getattr(hw.feature, 'orthBase', None) or hw.surface
    if not base or base == '*': return None
    rd = ''.join(kata2hira(getattr(w.feature, 'kana', '') or '') for _, w in run)
    us = units(ja); idx = surf_index(us); s0 = run[0][0]; s1 = a
    if s0 not in idx or s1 not in idx: return None
    pre = render(us, 0, s0); post_r = render(us, s1, len(ps))
    post = mark(post_r, [(x - s1, y - s1) for x, y in sp])
    if not pre.strip() and len(plain(post)) < 3: return None
    ans = [surf] + ([rd] if rd and rd != surf else [])
    return {'pre': pre, 'post': post, 'base': base, 'ans': ans, 'k': {'動詞': 'v', '形容詞': 'i', '形状詞': 'na'}[pos1], 'same': surf == base}
HEAD = {'名詞', '代名詞', '動詞', '形容詞', '副詞', '接続詞', '連体詞', '感動詞', '形状詞'}
TAIL = {'助詞', '助動詞', '補助記号', '接尾辞'}
def bunsetsu(ps, hl):
    toks = list(TAG(ps)); pos = 0; starts = [0]; spans = []
    info = []
    for w in toks:
        info.append((pos, w)); pos += len(w.surface)
    for i, (p0, w) in enumerate(info):
        if i == 0: continue
        pw = info[i-1][1]; p1 = w.feature.pos1; pp = pw.feature.pos1
        if p1 not in HEAD: continue
        if pp == '接頭辞': continue
        if p1 == pp and p1 in ('名詞', '動詞', '形状詞'): continue
        lem = getattr(w.feature, 'lemma', '') or ''
        if p1 == '動詞' and pp == '名詞' and ('為る' in lem or '出来る' in lem or 'する' in lem or 'できる' in lem): continue
        if pp in TAIL or pp in HEAD: starts.append(p0)
    starts = sorted(set(starts)); starts.append(len(ps))
    if hl:
        starts = [s for s in starts if not (hl[0] < s < hl[1])]
    return starts
def make_sao(ruby_ex, span):
    ps = plain(ruby_ex); st = bunsetsu(ps, span)
    _idx = surf_index(units(ruby_ex)); st = sorted(set(min(_idx, key=lambda x: abs(x - s0)) for s0 in st))
    if st[0] != 0: st = [0] + st
    if st[-1] != len(ps): st.append(len(ps))
    ch = [(st[i], st[i+1]) for i in range(len(st) - 1)]
    # gộp đoạn quá ngắn (1 chữ) vào đoạn trước
    merged = []
    for c in ch:
        if merged and (c[1] - c[0] < 2 or ps[c[0]] in '、。」') : merged[-1] = (merged[-1][0], c[1])
        else: merged.append(c)
    ch = merged
    if len(ch) < 4: return None
    # chọn cửa sổ 4 đoạn liên tiếp, ưu tiên chứa mẫu ở vị trí 2-3
    hi = None
    if span:
        for i, c in enumerate(ch):
            if c[0] <= span[0] < c[1] or (span[0] <= c[0] and c[1] <= span[1]): hi = i if hi is None else hi
    best = None
    for s in range(0, len(ch) - 3):
        w = ch[s:s+4]
        sc = 0
        if hi is not None and s <= hi <= s + 3: sc += 5 - abs((hi - s) - 2)
        sc += (4 - abs(len(ch) - 4 - s * 2) * 0)  # ổn định
        if s == 0 and len(ch) > 4: sc -= 1
        if best is None or sc > best[0]: best = (sc, s)
    s = best[1]; us = units(ruby_ex)
    pre = render(us, 0, ch[s][0]); post = render(us, ch[s+3][1], len(ps))
    chunks = [render(us, a, b) for a, b in ch[s:s+4]]
    # chunk cuối chứa dấu câu: giữ nguyên; nếu post rỗng và chunk cuối có 。 -> tách 。 sang post
    if not post and chunks[3].endswith('。'): chunks[3] = chunks[3][:-1]; post = '。'
    return {'pre': pre, 'c': chunks, 'post': post}
def parse(path):
    lvl = None; groups = {}; pats = []; cur = None; sense = None; tests = {}; tcur = None
    for ln, line in enumerate(open(path, encoding='utf8').read().split('\n'), 1):
        line = line.rstrip()
        if not line.strip(): continue
        m = re.match(r'^@(\w+)\s*(.*)$', line)
        if not m: raise SystemExit(f'{path}:{ln}: dòng không hợp lệ: {line[:40]}')
        k, v = m.group(1), m.group(2).strip()
        if k == 'level': lvl = v
        elif k == 'group' and cur is None or (k == 'group' and '|' in v):
            a = [x.strip() for x in v.split('|')]
            groups[int(a[0])] = {'n': int(a[0]), 'ja': a[1], 'vi': a[2], 'desc': a[3] if len(a) > 3 else ''}
        elif k == 'p':
            a = [x.strip() for x in v.split('|')]
            cur = {'id': a[0], 'pat': a[1], 'form': [], 'exp': [], 'senses': [], 'cmp': [], 'note': [], 'theme': [], 'ctx': [], 'book': [], 'g': None, 'key': None}
            pats.append(cur); sense = None
        elif k == 'group': cur['g'] = int(v)
        elif k == 'mean': cur['mean'] = v
        elif k == 'core': cur['core'] = v
        elif k == 'form': cur['form'].append(v)
        elif k == 'exp': cur['exp'].append(v)
        elif k == 'key': cur['key'] = [x.strip() for x in v.split(' ;; ')]
        elif k == 'sense':
            a = [x.strip() for x in v.split('|')]
            sense = {'n': int(a[0]), 'label': a[1], 'ex': []}; cur['senses'].append(sense)
        elif k == 'ex':
            if sense is None: sense = {'n': 1, 'label': '', 'ex': []}; cur['senses'].append(sense)
            ja, vi = [x.strip() for x in v.split(' | ', 1)]
            sense['ex'].append({'ja': ja, 'vi': vi})
        elif k == 'cmp':
            a = [x.strip() for x in v.split(' | ', 2)]
            cur['cmp'].append({'pat': a[0], 'lv': a[1], 'desc': a[2]})
        elif k == 'note': cur['note'].append(v)
        elif k == 'theme': cur['theme'] = [x.strip() for x in v.split(',') if x.strip()]
        elif k == 'ctx': cur['ctx'] = [x.strip() for x in v.split(',') if x.strip()]
        elif k == 'book':
            a = [x.strip() for x in v.split('|')]
            cur['book'].append([a[0], a[1], int(a[2]) if len(a) > 2 else 0])
        elif k == 'test': tcur = {'n': int(v), 'qs': []}; tests[int(v)] = tcur; cur = None
        elif k == 'tq':
            a = [x.strip() for x in v.split(' | ')]
            tcur['qs'].append({'q': a[0], 'opts': a[1:5], 'ans': int(a[5]), 'ja': a[6], 'vi': a[7], 'exp': ' | '.join(a[8:])})
    return lvl, groups, pats, tests
def rb(s, where):
    out, miss = add_ruby(s)
    if miss: report.append(f'[thiếu ruby] {where}: {"".join(miss)} <- {out[:60]}')
    return out
def conn_class(p):
    f = p['form'][0] if p['form'] else ''
    f = f.strip()
    if f.startswith(('V', 'Ｖ')): return 'V'
    if f.startswith(('N', 'Ｎ', '名', '地位')): return 'N'
    if f.startswith(('イ', 'ナ')): return 'A'
    return 'X'
def build_level(path):
    lvl, groups, pats, tests = parse(path)
    pats_out = []
    nohl = 0
    for p in pats:
        pid = f"{lvl}-{p['id']}"
        title = rb(p['pat'], pid)
        keys = [k if k.startswith('re:') or k == '-' else rb(k, pid + ' key') for k in (p['key'] or keys_of(p['pat']))]
        opt = [rb(k, pid + ' opt') for k in keys_of(p['pat'])]
        # ruby cho mọi biến thể: dựa vào title nếu có sẵn
        senses = []
        for s in p['senses']:
            exs = []
            for e in s['ex']:
                ja = rb(e['ja'], pid)
                fh = find_hl(ja, keys) if (p['key'] is None or p['key'] != ['-']) else None
                if not fh and p['key'] is None: fh = find_hl(ja, auto_keys(p['pat']))
                sp = fh[0] if fh else None
                hl = mark(ja, sp) if sp else ja
                if not sp and p['key'] != ['-']: nohl += 1; report.append(f'[không tô được mẫu] {pid} {p["pat"]} :: {plain(ja)}')
                so = make_sao(ja, [min(a for a,_ in sp), max(b for _,b in sp)] if sp else None)
                ex = {'ja': hl, 'vi': e['vi']}
                cj = make_cj(ja, sp) if sp else None
                if cj: ex['cj'] = cj
                if sp and len(sp) == 1:
                    us = units(ja); ex['cl'] = render(us, sp[0][0], sp[0][1])
                if so: ex['so'] = so
                exs.append(ex)
            senses.append({'n': s['n'], 'label': s['label'], 'ex': exs})
        cmp_ = [{'pat': rb(c['pat'], pid + ' cmp'), 'lv': c['lv'].lower(), 'desc': c['desc']} for c in p['cmp']]
        item = {'id': pid, 'no': p['id'], 'lv': lvl, 'g': p['g'], 'pat': title, 'mean': p['mean'], 'core': p.get('core', ''),
                'form': [strip_bar(x) for x in p['form']], 'exp': [strip_bar(x) for x in p['exp']], 'senses': senses, 'cmp': [dict(c, desc=strip_bar(c['desc'])) for c in cmp_], 'note': [strip_bar(x) for x in p['note']],
                'theme': p['theme'], 'ctx': p['ctx'], 'book': p['book'], 'opt': opt[0] if opt else '', 'cc': conn_class(p)}
        pats_out.append(item)
    tests_out = []
    for n in sorted(tests):
        qs = []
        for q in tests[n]['qs']:
            qs.append({'q': rb(q['q'], f'test{n}'), 'opts': [rb(o, f'test{n} opt') for o in q['opts']], 'ans': q['ans'],
                       'ja': rb(q['ja'], f'test{n}'), 'vi': q['vi'], 'exp': strip_bar(q['exp'])})
        tests_out.append({'n': n, 'qs': qs})
    data = {'level': lvl, 'groups': [groups[k] for k in sorted(groups)], 'pats': pats_out, 'tests': tests_out}
    data['_nohl'] = nohl
    return data
def norm_pat(t):
    t = plain(t) if isinstance(t, str) else t
    return re.sub(r'[～〜…・\s()（）\[\]「」]', '', t)
def alts_of(item):
    out = set()
    for seg in re.split(r'[／]', plain(item['pat'])):
        n = norm_pat(seg)
        if n: out.add(n)
    for k in keys_of(item['pat']):
        n = norm_pat(k)
        if n: out.add(n)
    return out
def resolve_cmp(datas):
    allp = [(d['level'], p, alts_of(p)) for d in datas for p in d['pats']]
    miss = 0
    for lv, p, _ in allp:
        for c in p['cmp']:
            want = [norm_pat(x) for x in re.split(r'[／]', plain(c['pat'])) if norm_pat(x)]
            cand = [(l2, q) for l2, q, al in allp if q['id'] != p['id'] and any(w in al for w in want)]
            if not cand:
                cand = [(l2, q) for l2, q, al in allp if q['id'] != p['id'] and len(want[0] if want else '') >= 3 and any(w and (w in a or a in w) and len(a) >= 3 for w in want for a in al)]
                if len(cand) > 1: cand = []
            if cand:
                pref = [x for x in cand if x[0] == c.get('lv')] or [x for x in cand if x[0] == lv] or cand
                c['id'] = pref[0][1]['id']
            else:
                miss += 1; report.append(f'[đối chiếu chưa nối được] {p["id"]} {plain(c["pat"])}')
    return miss
def write_level(data):
    nohl = data.pop('_nohl', 0); lvl = data['level']
    js = 'SB.register(' + json.dumps(data, ensure_ascii=False, separators=(',', ':')) + ');\n'
    open(os.path.join(OUT, f'gram-{lvl}.js'), 'w', encoding='utf8').write(js)
    print(f'{lvl}: {len(data["pats"])} mẫu, {sum(len(s["ex"]) for p in data["pats"] for s in p["senses"])} câu ví dụ, {nohl} câu chưa tô được mẫu, {len(js)//1024} KB')
if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    datas = [build_level(f) for f in sorted(glob.glob(os.path.join(SRC, '*.txt')))]
    m = resolve_cmp(datas); print('đối chiếu chưa nối được:', m, '/', sum(len(p['cmp']) for d in datas for p in d['pats']))
    for d in datas: write_level(d)
    open(os.path.join(ROOT, 'tools', 'report.txt'), 'w', encoding='utf8').write('\n'.join(report))
    print(len(report), 'dòng trong tools/report.txt')
