"""Sinh data/vi-minna.js từ tools/minnasrc/vi-minna.tsv (mỗi dòng: câu hoàn chỉnh <TAB> bản dịch tiếng Việt).
Danh sách câu cần dịch: node tools/vi_todo.js (in ra các câu chưa có trong /tmp/vi_have.json)."""
import json, os
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
m = {}
for l in open(os.path.join(R, 'tools/minnasrc/vi-minna.tsv'), encoding='utf8'):
    if '\t' in l: a, b = l.rstrip('\n').split('\t', 1); m[a] = b
open(os.path.join(R, 'data/vi-minna.js'), 'w', encoding='utf8').write('SB.viMinna(' + json.dumps(m, ensure_ascii=False, separators=(',', ':')) + ');\n')
print(len(m), 'câu')
