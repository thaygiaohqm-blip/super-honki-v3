import json,re,sys
eid=sys.argv[1]
d=json.load(open('/home/claude/site/site/shiken/data/%s.json'%eid))
def sents(text):
    out=[]
    for para in text.split('\n'):
        t=para.strip()
        if not t: continue
        first=True
        for m in re.finditer(r'[^。！？!?]*(?:[。！？!?]+[」』）)]*|$)',t):
            s=m.group(0).strip()
            if s: out.append((s,first)); first=False
    return out
only=set(sys.argv[2:])
for s in d['sections']:
    if s['key']!='dokkai': continue
    done=set()
    for m in s['mondai']:
        for q in m['qs']:
            p=str(q.get('p',''))
            if only and p not in only: continue
            if p and p not in done:
                done.add(p); print('\n=== PASSAGE',p,'mondai',m['n'])
                for i,(t,f) in enumerate(sents(re.sub(r'</?u>','',d['passages'][p]))): print('%s[%d] %s'%('¶' if f else ' ',i,t))
            print('  Q%d: %s | %s | ĐÁP ÁN %s'%(q['no'],re.sub(r'</?u>','',q['s']).replace('\n',' '),' / '.join('%d %s'%(i+1,re.sub(r'</?u>','',c)) for i,c in enumerate(q['c'])),q['a']))
