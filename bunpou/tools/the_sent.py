#!/usr/bin/env python3
"""tools/thesent.txt -> data/the-sent.js (câu điền chia thể động từ, có furigana)"""
import sys,json,os
sys.path.insert(0,os.path.dirname(__file__))
from furi import add_ruby
out=[]
for line in open(os.path.join(os.path.dirname(__file__),'thesent.txt'),encoding='utf8'):
    line=line.strip()
    if not line or line.startswith('#'): continue
    f,pre,base,g,post,vi=[x.strip() for x in line.split(' | ')]
    out.append({'f':f,'pre':add_ruby(pre)[0],'w':add_ruby(base)[0],'g':int(g),'post':add_ruby(post)[0],'vi':vi})
open(os.path.join(os.path.dirname(__file__),'..','data','the-sent.js'),'w',encoding='utf8').write('SB.theSent('+json.dumps(out,ensure_ascii=False,separators=(',',':'))+');\n')
print(len(out),'câu')
