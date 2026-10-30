import re, json, sys
L=[l.rstrip('\r') for l in open('/tmp/claude-0/-home-claude/1498e589-c645-511a-8347-76663bbdd2ed/scratchpad/n2raw.txt').read().split('\n')]
start=next(i for i,l in enumerate(L) if l.strip()=='PHẦN 1' )
end=next(i for i,l in enumerate(L) if i>start and l.strip()=='PHẦN 2')
L=L[start:end]
groups=[]; pats=[]; tests=[]
g=None; p=None; i=0; mode=None
def clean(s): return s.strip()
while i<len(L):
    l=L[i].strip()
    m=re.match(r'^NHÓM (\d+)\s+(.+)$',l)
    if m and not l.startswith('NHÓM 1 ') or (m and True):
        g={'n':int(m.group(1)),'vi':m.group(2).strip(),'ja':L[i+1].strip(),'desc':L[i+2].strip(),'pats':[]}
        groups.append(g); p=None; mode=None; i+=3; continue
    m=re.match(r'^(\d{3})\s+(.+)$',l)
    if m and g and not l.startswith('Câu'):
        p={'id':m.group(1),'pat':m.group(2).strip(),'g':g['n'],'struct':[],'exp':[],'ex':[],'cmp':[],'note':[]}
        pats.append(p); mode=None; i+=1; continue
    if l.startswith('BÀI KIỂM TRA SỐ'):
        n=int(l.split()[-1]); t={'n':n,'qs':[],'ans':{}}; tests.append(t); p=None; mode='test'; i+=1; continue
    if l.startswith('ĐÁP ÁN & GIẢI THÍCH'):
        mode='ans'; i+=1; continue
    if mode=='test':
        mq=re.match(r'^(\d+)\t(.+)$',L[i])
        if mq:
            j=i+1; optline=''
            while j<len(L) and L[j].startswith('\t'):
                optline+='  '+L[j].replace('\t',' ').strip(); j+=1
            o=[x.strip() for x in re.split(r'(?:^|\s)(?=[1-4]\s\s)',optline.strip()) if x.strip()]
            o=[re.sub(r'^[1-4]\s+','',x).strip() for x in o]
            t['qs'].append({'q':mq.group(2).strip(),'opts':o}); i=j; continue
        i+=1; continue
    if mode=='ans':
        mc=re.match(r'^Câu (\d+)\.\s+Đáp án (\d):\s+(.*)$',l)
        if mc:
            k=int(mc.group(1)); t=tests[-1]
            t['ans'][k]={'a':int(mc.group(2)),'form':mc.group(3).strip(),'ja':L[i+1].strip(),'vi':L[i+2].strip().lstrip('→ ').strip(),'exp':L[i+3].strip().replace('Giải thích:','').strip()}
            i+=4; continue
        i+=1; continue
    if p is not None:
        if l.startswith('Nghĩa:'): p['mean']=l[6:].strip()
        elif l.startswith('★ CỐT LÕI'): p['core']=l.replace('★ CỐT LÕI','').strip()
        elif l.startswith('■ Cấu trúc'): mode='struct'
        elif l.startswith('■ Giải thích'): mode='exp'
        elif l.startswith('■ Ví dụ'): mode='ex'
        elif l.startswith('■ Đối chiếu'): mode='cmp'
        elif l.startswith('■ Lưu ý'): mode='note'
        elif l=='' : pass
        else:
            if mode=='struct': p['struct'].append(l)
            elif mode=='exp': p['exp'].append(l)
            elif mode=='ex':
                if l.startswith('→'): p['ex'][-1]['vi']=l.lstrip('→ ').strip()
                else: p['ex'].append({'ja':re.sub(r'^[①-⑩]\s*','',l),'vi':''})
            elif mode=='cmp':
                if l.startswith('⇄'):
                    mm=re.match(r'^⇄\s+(.+?)\s{2,}(N\d)\s*$',L[i].strip().replace('\t','  '))
                    if mm: p['cmp'].append({'pat':mm.group(1).strip(),'lv':mm.group(2),'desc':''})
                    else: p['cmp'].append({'pat':l[1:].strip(),'lv':'','desc':''})
                else: p['cmp'][-1]['desc']=(p['cmp'][-1]['desc']+' '+l).strip()
            elif mode=='note': p['note'].append(l)
    i+=1
json.dump({'groups':groups,'pats':pats,'tests':tests},open('n2.json','w'),ensure_ascii=False,indent=1)
print(len(groups),len(pats),len(tests),[len(t['qs']) for t in tests],[len(t['ans']) for t in tests])
bad=[p['id'] for p in pats if not p.get('mean') or not p['ex'] or not p['struct'] or any(not e['vi'] for e in p['ex'])]
print('bad',bad)
print(sum(len(p['ex']) for p in pats),'examples')
