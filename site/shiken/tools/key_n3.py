import re,subprocess,json
U='/mnt/user-data/uploads/0595edb2-__P__N_JLPT_N3_update_27.10.2026.pdf'
import unicodedata
t=unicodedata.normalize('NFKC',subprocess.run(['pdftotext','-layout',U,'-'],capture_output=True,text=True).stdout)
parts=re.split(r'(?m)^\s*JLPT N3 (\d{1,2})/(\d{4})\s*$',t)
res={}
for i in range(1,len(parts),3):
    m,y,body=int(parts[i]),int(parts[i+1]),parts[i+2]
    L=body.split('\n'); sec=None; moji={}; gr={}; rd={}
    pend=None
    for ln in L:
        s=ln.strip()
        if s.startswith('文字・語彙'): sec='moji'; continue
        if s=='文法' or s.startswith('文法 '): sec='gr'; continue
        if s.startswith('読解'): sec='rd'; continue
        if sec=='gr':
            if '問題' in ln and re.search(r'\d',ln):
                groups=[[int(x) for x in re.findall(r'\d+',g)] for g in ln.split('問題')[1:]]
                groups=[g for g in groups if g]
                pend=groups; continue
            if pend:
                ints=[int(x) for x in re.findall(r'\d+',ln)]
                if ints:
                    p=0
                    for g in pend:
                        p+=1
                        for n in g:
                            if p<len(ints): gr[n]=ints[p]
                            p+=1
                    pend=None
                continue
            continue
        if sec in('moji',):
            toks=re.findall(r'\d+|問題',ln)
            nums=[x for x in re.findall(r'\b\d+\b',re.sub(r'問題\s*[１-５1-5]|問題|^\s*[１-５]\s','',ln))]
            if not nums: continue
            # hàng số câu: giá trị >4 hoặc tăng dần dài
            ints=[int(x) for x in nums]
            d=moji
            if pend is None:
                if len(ints)>=2 and ints[-1]>len(ints)-1 and ints==sorted(ints) and max(ints)>4 or (len(ints)>=2 and ints[0]==1 and ints==sorted(ints) and max(ints)>4):
                    pend=ints
                elif len(ints)>=5 and ints==list(range(ints[0],ints[0]+len(ints))):
                    pend=ints
            else:
                # hàng đáp án
                if all(1<=x<=4 for x in ints) and len(ints)>=len(pend)-1:
                    for n,a in zip(pend,ints): d[n]=a
                    pend=None
                else:
                    pend=ints if ints==sorted(ints) else None
        elif sec=='rd':
            ints=[int(x) for x in re.findall(r'\b\d+\b',re.sub(r'問題\s*\d','',ln))]
            for j in range(0,len(ints)-1,2):
                n,a=ints[j],ints[j+1]
                if 22<=n<=40 and 1<=a<=4: rd[n]=a
                else: break
    res['n3-%d-%02d'%(y,m)]={'moji':moji,'gr':gr,'rd':rd}
for k,v in res.items(): print(k,len(v['moji']),len(v['gr']),len(v['rd']))
json.dump(res,open('/home/claude/work/key_n3.json','w'))
