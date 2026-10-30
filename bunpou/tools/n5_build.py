#!/usr/bin/env python3
"""Chuyển tools/minnasrc/n5tests.txt (đề Test N5 do người dùng gửi; file gốc không có đáp án, đáp án do Super Bunpou soạn)
thành tools/minnasrc/ex-n.txt cho ex_build.py."""
import re, random, os
ROOT = os.path.dirname(os.path.abspath(__file__)); SRC = os.path.join(ROOT, 'minnasrc')
BL = re.compile(r'[（(]([^（）()]*)[）)]')
X = {'x', 'X', 'ｘ', 'Ｘ', '×'}
def alts(a):
    out = []
    for p in re.split(r'\s*[／/]\s*', a.strip()):
        if not p: continue
        out += ['×', 'x', 'X'] if p in X else [p]
    return list(dict.fromkeys(out))
sets = {}; cur = None; rnd = random.Random(11)
def add(kind, line):
    sets.setdefault((cur, kind), []).append(line)
for ln, raw in enumerate(open(os.path.join(SRC, 'n5tests.txt'), encoding='utf8'), 1):
    raw = raw.rstrip()
    if not raw or raw.startswith('#'): continue
    if raw.startswith('@lesson'): cur = int(raw.split()[1]); continue
    k, rest = raw[0], raw[2:].strip()
    if k == 'P':
        ms = list(BL.finditer(rest))
        for i, m in enumerate(ms):
            ac = alts(m.group(1)); out = ''; pos = 0
            for j, mm in enumerate(ms):
                out += rest[pos:mm.start()]
                if j == i: out += '（　　）'
                else:
                    a2 = alts(mm.group(1))[0]; out += '' if a2 == '×' else a2
                pos = mm.end()
            add('f', f'{out + rest[pos:]} | Điền trợ từ vào ô trống (× nếu không cần) | {"／".join(ac)} | Đáp án: {ac[0]}')
    elif k == 'F':
        stem, hint, acc = [x.strip() for x in rest.split(' | ')]
        add('f', f'{stem} | {hint} | {acc} | Đáp án: {acc.split("／")[0]}')
    elif k == 'M':
        stem, opts, idx = [x.strip() for x in rest.split(' | ')]
        o = [x.strip() for x in opts.split(' ;; ')]; right = o[int(idx) - 1]; rnd.shuffle(o)
        add('m', f'{stem} | {" ;; ".join(o)} | {o.index(right) + 1} | Đáp án đúng: {right}')
    elif k == 'O':
        stem, opts, order = [x.strip() for x in rest.split(' | ')]
        add('o', f'{stem} | {opts} | {order} | Thứ tự đúng đã được kiểm tra với đề gốc.')
out = ['# Sinh bởi tools/n5_build.py từ n5tests.txt; đáp án do Super Bunpou soạn']
for (n, kind), qs in sorted(sets.items()):
    ty = {'f': 'fill', 'm': 'mc', 'o': 'ord'}[kind]
    out.append(f'@set n{n}{kind} | Test N5 bài {n} | minna {n} | {ty}')
    for i, q in enumerate(qs, 1): out.append(f'@q {i} | {q}')
open(os.path.join(SRC, 'ex-n.txt'), 'w', encoding='utf8').write('\n'.join(out) + '\n')
print(sum(len(v) for v in sets.values()), 'câu,', len(sets), 'bộ gốc')
