#!/usr/bin/env python3
"""Tạo data/y.js (phần "Ý nghĩa của chữ") từ tools/data/thuyetvan.tsv.

Nguồn: Thuyết văn giải tự (說文解字, Hứa Thận, c. 100 SCN) kèm chú của Đoàn Ngọc Tài; văn bản
cjkvi-dict/swjz. Cột: chữ, dạng đầu mục trong Thuyết văn, nguyên văn định nghĩa, bản dịch Việt, cách khớp.
Chạy: python3 tools/y_build.py
"""
import json, os
HERE = os.path.dirname(os.path.abspath(__file__))
out = {}
for ln in open(os.path.join(HERE, 'data', 'thuyetvan.tsv'), encoding='utf8'):
    if ln.startswith('#') or not ln.strip(): continue
    k, head, quote, vi, how = ln.rstrip('\n').split('\t')
    out[k] = [vi, quote, head if head != k else '']
js = 'KANJI.mean(' + json.dumps(out, ensure_ascii=False, separators=(',', ':')) + ');\n'
open(os.path.join(HERE, '..', 'data', 'y.js'), 'w', encoding='utf8').write(js)
print(len(out), 'chữ ->', len(js) // 1024, 'KB')
