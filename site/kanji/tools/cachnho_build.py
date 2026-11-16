#!/usr/bin/env python3
"""Tạo data/y.js (mục "Cách nhớ chữ") từ tools/data/cachnho.tsv (chữ<TAB>diễn giải).
Chạy: python3 tools/cachnho_build.py   (in ra các chữ còn thiếu)"""
import json, os, re
HERE = os.path.dirname(os.path.abspath(__file__))
out = {}
for ln in open(os.path.join(HERE, 'data', 'cachnho.tsv'), encoding='utf8'):
    if ln.startswith('#') or '\t' not in ln: continue
    k, t = ln.rstrip('\n').split('\t', 1); out[k] = t.strip()
allk = []
for i in range(1, 6):
    allk += re.findall(r'\{"k":"(.)"', open(os.path.join(HERE, '..', 'data', f'k{i}.js'), encoding='utf8').read())
miss = [k for k in allk if k not in out]
open(os.path.join(HERE, '..', 'data', 'y.js'), 'w', encoding='utf8').write('KANJI.mean(' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ');\n')
print(len(out), '/', len(allk), 'chữ; thiếu', len(miss)); open('/tmp/cn_missing.txt', 'w', encoding='utf8').write(''.join(miss))
