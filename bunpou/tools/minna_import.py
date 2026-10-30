#!/usr/bin/env python3
"""Nhập đề kiểm tra tuần (có đáp án) vào tools/minnasrc/ex-w.txt.
Chỉ lấy phần tự chấm được: (1) từ vựng cặp Nhật–Việt -> trắc nghiệm; (2) câu có ô trống （đáp án） điền sẵn -> điền từ."""
import re, os, sys, glob, random, json
SRC = sys.argv[1] if len(sys.argv) > 1 else '/tmp/att/cv2'
DIRS = [('dapantuan', 'W')]
JP = r'぀-ヿ㐀-鿿々ー'
HAS_JP = re.compile('[' + JP + ']'); HAS_VI = re.compile(r'[A-Za-zÀ-ỹ]')
def units_of(fn):
    nums = [int(x) for x in re.findall(r'\d+', os.path.basename(fn))]
    if not nums: return []
    if len(nums) >= 2 and re.search(r'\d\s*[-－ー~～]\s*\d', os.path.basename(fn)): return list(range(nums[0], nums[1] + 1))
    return sorted(set(nums))
def norm(s): return re.sub(r'\s+', ' ', s.replace('　', ' ')).strip()
NOISE = re.compile(r'(\.{3,}|…|、\.\.)')
def clean_ans(a):
    a = norm(a).strip('。. ')
    return a
X = {'x', 'X', 'ｘ', 'Ｘ', '×', '✕', '✗', '–', '-', 'ｘ'}
def alts(a):
    parts = [norm(p) for p in re.split(r'\s*[/／・,，、。]\s*', a) if norm(p)]
    out = []
    for p in parts:
        out.append('×' if p in X else p)
    if '×' in out: out += ['x', 'X']
    return out
def pairs(text):
    P = []
    for ln in text.split('\n'):
        ln = ln.strip()
        if not ln or len(ln) > 90: continue
        for seg in re.split(r'[\t　]{2,}|\s{4,}', ln):
            seg = re.sub(r'^[\s\d.．①-⑳()（）]+', '', seg).strip()
            m = re.fullmatch(r'([' + JP + r'〜～ ]{1,16}?)\s*[:：]?\s*([A-Za-zÀ-ỹ][A-Za-zÀ-ỹ0-9 ,()/\'’\-\.]{1,40})', seg)
            if m and not HAS_JP.search(m.group(2)) and HAS_VI.search(m.group(2)):
                P.append((m.group(1).strip(), m.group(2).strip().rstrip('.')));
                continue
            m = re.fullmatch(r'([A-Za-zÀ-ỹ][A-Za-zÀ-ỹ0-9 ,()/\'’\-\.]{1,40}?)\s*[:：]?\s*([' + JP + r'〜～]{1,16})', seg)
            if m and not HAS_JP.search(m.group(1)) and HAS_VI.search(m.group(1)):
                P.append((m.group(1).strip(), m.group(2).strip()))
    # bỏ trùng
    seen = set(); out = []
    for a, b in P:
        if (a, b) in seen: continue
        seen.add((a, b)); out.append((a, b))
    return out
PART = {'は','が','を','に','で','へ','と','も','の','から','まで','より','や','など','か','な','×','x','X','へも','にも'}
BLACK = ['ブロードウェイ','ハー ドン','あっさて','ちさい','ここに押す','ここ（','スキ－','どこへも、にも','申しまし','になにます','工事（','廊下（','日本（ に','。に','私（　　）撮った','年 .','時間：','..','のみます','たべました','みました','あいます','よみました','（　　）、いくら']
FIX = {'桜大学': ['に'], 'どちら（　　）旅行': ['へ','に'], '友達 （　　）あいます': ['に','と']}
BL = re.compile(r'[（(]([^（）()]{0,40})[）)]')
def blanks(text):
    Q = []
    for ln in text.split('\n'):
        ln = norm(ln)
        if not HAS_JP.search(ln) or len(ln) > 120 or ln.startswith('問題') or '点' in ln or re.search(r'\dx\d', ln): continue
        ln = re.sub(r'^[\d.．①-⑳]+\s*', '', ln)
        ln = ln.split('....')[0] if False else ln
        ms = list(BL.finditer(ln))
        if not ms: continue
        for i, m in enumerate(ms):
            inner = m.group(1)
            hint = ''
            if '→' in inner:
                hint, inner = [norm(x) for x in inner.split('→', 1)]
            ans = clean_ans(inner)
            if not ans or len(ans) > 14 or ' ' in ans.replace(' / ', '/') and len(ans) > 8: continue
            if not (HAS_JP.search(ans) or ans in X): continue
            if re.search(r'[A-Za-zÀ-ỹ]{3,}', ans): continue
            # dựng đề: ô i là ＿＿, các ô khác điền sẵn đáp án
            out = ''; pos = 0
            for j, mm in enumerate(ms):
                out += ln[pos:mm.start()]
                if j == i: out += '（　　）' if not hint else '（' + hint + ' →　　）'
                else:
                    a2 = clean_ans(mm.group(1).split('→')[-1]); a2 = re.split(r'\s*[/／]\s*', a2)[0]
                    out += '' if a2 in X else a2
                pos = mm.end()
            out += ln[pos:]
            out = out.replace('....', ' ').replace('…', ' ').strip()
            if len(out) < 6: continue
            out = re.sub(r'^(?:[A-ZＡ-Ｚ][:：]|[①-⑳]|[\d２-９]+[）)]|例[:：）)]\s*)\s*', '', out).strip()
            out = re.sub(r'[ 　]+\.\s*(?=\d)', ' ', out)
            if any(b in out for b in BLACK): continue
            ac = alts(ans)
            if not all(a in PART for a in ac): continue
            for k, v in FIX.items():
                if k in out: ac = v
            Q.append((out, hint, ac))
    return Q
def main():
    random.seed(7)
    rows = []   # (display_unit, units, label, kind, items, srcname)
    for d, tag in DIRS:
        for fn in sorted(glob.glob(f'{SRC}/{d}/*.txt')):
            us = units_of(fn)
            if not us: continue
            txt = open(fn, encoding='utf8', errors='ignore').read()
            pr, bl = pairs(txt), blanks(txt)
            rows.append((us, d, os.path.basename(fn), pr, bl))
    out = ['# Đề kiểm tra tuần/ôn gộp: phần tự chấm được lấy từ đề có đáp án (nhập tự động bởi tools/minna_import.py)']
    stats = []
    for us, d, name, pr, bl in rows:
        key = re.sub(r'\W+', '', name)[:20]
        uspec = ' '.join(map(str, us))
        lab = f'bài {us[0]}–{us[-1]}' if len(us) > 1 else f'bài {us[0]}'
        sid = f'w{us[0]}' + (f'-{us[-1]}' if len(us) > 1 else '') + {'dapantuan': '', 'm1': 'a', 'm1b': 'b', 'm2': 'c'}[d]
        pr = [x for x in pr]
        if len(pr) >= 6:
            out += [f'@set {sid}v | Từ vựng (tuần) | minna {uspec} | mc']
            allw = [w for p_ in pr for w in p_]; allw = [w for w in allw if 'ASV' not in w and 'シャーワ' not in w]; vi_pool = [w for w in allw if not HAS_JP.search(w)]; ja_pool = [w for w in allw if HAS_JP.search(w)]
            BADV = ('かいしゃ','つぎ','まちかえる','こうくいびん','こどもがいます','ASV','シャーワ')
            pr = [x for x in pr if not any(b in x[0]+x[1] for b in BADV) and 'Sữabò' not in x[1]]
            sj = set(); pr2 = []
            for x in pr:
                k_ = x[0] if HAS_JP.search(x[0]) else x[1]
                if k_ in sj: continue
                sj.add(k_); pr2.append(x)
            pr = [(a if HAS_JP.search(a) else a[:1].upper()+a[1:], b if HAS_JP.search(b) else b[:1].upper()+b[1:]) for a, b in pr2]; i = 0
            for a, b in pr[:12]:
                i += 1
                if HAS_JP.search(a):  # a = JP (câu hỏi) , b = Việt
                    pool, right, stem = [x for x in vi_pool if x != b], b, a
                else:
                    pool, right, stem = [x for x in ja_pool if x != a], a, b
                pool = [x for x in dict.fromkeys(pool) if x.lower() != right.lower()]
                dis = random.sample(pool, min(3, len(pool)))
                opts = dis + [right]; random.shuffle(opts)
                out.append(f'@q {i} | {stem} | {" ;; ".join(opts)} | {opts.index(right)+1} | Đáp án đúng: {right}')
        if len(bl) >= 4:
            out += [f'@set {sid}f | Điền chỗ trống (tuần) | minna {uspec} | fill']
            seen = set(); i = 0
            for stem, hint, ac in bl:
                if stem in seen: continue
                seen.add(stem); i += 1
                out.append(f'@q {i} | {stem} | Điền vào ô trống | {"／".join(ac)} | Đáp án: {ac[0]}')
                if i >= 14: break
        stats.append((d, name, len(pr), len(bl)))
    open('/home/claude/bunpou/tools/minnasrc/ex-w.txt', 'w', encoding='utf8').write('\n'.join(out) + '\n')
    for s in stats: print(*s)
main()
