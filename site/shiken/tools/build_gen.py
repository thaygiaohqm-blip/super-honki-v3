import json,re,os,sys,subprocess
sys.path.insert(0,'/home/claude/tools')
from keys_manual import K
OUT='/home/claude/site/site/shiken/data'
SEC={'moji':'文字・語彙','bunpou':'文法','dokkai':'読解'}
# đáp án thêm
K['n1-2021-07']={'all':[2,4,2,3,3,1, 3,2,4,4,1,2,1, 1,4,3,2,2,2, 2,1,3,4,3,4, 2,1,1,4,3, 1,4,3,2,2, 4,1,1,3,2, 4,2,3,1, 2,4,3,2, 1,3,4,1,4, 1,4,1,3, 3,1,4,3, 3,4, 2,4,4,1, 2,1]}
t=subprocess.run(['pdftotext','-layout','/home/claude/raw/pdf/N4__2023年7月__Đáp_án_đề_N4_T7-2023.pdf','-'],capture_output=True,text=True).stdout
pr=[(int(a),int(b)) for a,b in re.findall(r'^\s*(\d{1,2})、\s*([1-4])',t,re.M)]
K['n4-2023-07']={'moji':[b for a,b in pr[:28]],'rest':[b for a,b in pr[28:]]}
KN=json.load(open('/home/claude/work/key_n3.json'))
for e in ('n3-2021-12','n3-2022-07','n3-2022-12','n3-2023-07','n3-2016-07','n3-2016-12','n3-2017-07'):
    v=KN[e]; K[e]={'mdict':{int(a):b for a,b in v['moji'].items()},'rdict':{**{int(a):b for a,b in v['gr'].items()},**{int(a):b for a,b in v['rd'].items()}}}
TITLE=lambda lv,y,m:'%s %d/%d'%(lv.upper(),m,y)
idx=json.load(open(OUT+'/index.json')); dk=json.load(open(OUT+'/dokkai.json'))
idx=[e for e in idx if e['level']=='n2']; dk=[d for d in dk if d['level']=='n2']
def fixq(s): return s
for eid,key in K.items():
    e=json.load(open('/home/claude/work/gen/%s.json'%eid))
    lv,y,m=eid.split('-'); y=int(y); m=int(m)
    nq=sum(len(x['questions']) for x in e['mondai'])
    def ans(sec,no):
        if 'mdict' in key: return (key['mdict'] if sec=='moji' else key['rdict']).get(no)
        if 'all' in key: return key['all'][no-1] if no<=len(key['all']) else None
        L=key['moji'] if sec=='moji' else key['rest']
        return L[no-1] if no<=len(L) else None
    secs={};kd={}
    miss=0
    for mm in e['mondai']:
        qs=[]
        for q in mm['questions']:
            a=ans(mm['sec'],q['no'])
            if a is None: miss+=1
            o={'no':q['no'],'s':q['stem'],'c':q['choices'],'a':a}
            if q.get('p'): o['p']=q['p']
            if any(not c for c in q['choices']): o['x']=1
            qs.append(o)
        secs.setdefault(mm['sec'],[]).append({'n':mm['n'],'kind':mm['kind'],'ja':mm['ja'],'instr':mm['instr'],'qs':qs})
        kd[str(mm['n'])]=[mm['kind'],mm['ja']]
    doc={'id':eid,'level':lv,'y':y,'m':m,'title':TITLE(lv,y,m),'sections':[{'key':k,'label':SEC[k],'mondai':secs[k]} for k in ('moji','bunpou','dokkai') if k in secs],
         'passages':{str(p['id']):p['text'] for p in e['passages']}}
    json.dump(doc,open(OUT+'/'+eid+'.json','w'),ensure_ascii=False,separators=(',',':'))
    for sec in doc['sections']:
        if sec['key']!='dokkai': continue
        for mm in sec['mondai']:
            g={}
            for q in mm['qs']:
                if q.get('p'): g.setdefault(q['p'],[]).append(q['no'])
            for pid,nos in g.items():
                tx=doc['passages'].get(str(pid),'')
                head=re.sub(r'<[^>]+>','',tx).replace('\n',' ')
                if len(re.sub(r'\s','',tx))<60 or len(re.findall(r'(?<=\S) (?=\S)',head))>len(head)*0.3: continue
                dk.append({'id':eid+'|'+str(pid),'ex':eid,'pid':pid,'level':lv,'y':y,'m':m,'n':mm['n'],'nq':len(nos),'len':len(re.sub(r'\s','',tx)),'head':head[:60],'k':mm['kind'],'kj':mm['ja']})
    idx.append({'id':eid,'level':lv,'y':y,'m':m,'n':nq,'secs':{k:sum(len(x['qs']) for x in v) for k,v in secs.items()},'mon':{str(x['n']):len(x['qs']) for v in secs.values() for x in v},'kd':kd})
    print(eid,nq,'thiếu đáp án',miss)
fl=json.load(open('/home/claude/raw/files.json'))
have={e['id'] for e in idx}
seen=set()
for r in fl:
    if r['path'][0]!='N3' or len(r['path'])<2: continue
    mm=re.fullmatch(r'(\d{1,2})-(\d{4})',r['path'][1])
    if not mm: continue
    nm=r['name']
    import unicodedata
    nn=''.join(c for c in unicodedata.normalize('NFD',nm) if not unicodedata.combining(c)).lower().replace('đ','d')
    if re.search(r'dap an|script|scrip|\.m4a|\.mp3|audio|nghe',nn): continue
    mo,yr=int(mm.group(1)),int(mm.group(2)); eid='n3-%d-%02d'%(yr,mo)
    if eid in have or eid in seen: continue
    seen.add(eid)
    idx.append({'id':eid,'level':'n3','y':yr,'m':mo,'n':0,'dl':'https://drive.google.com/file/d/%s/view'%r['id']})
    print('scan',eid,nm)
dk=[x for x in dk if x['len']>=60]
idx.sort(key=lambda x:(x['level'],-x['y'],-x['m']))
json.dump(idx,open(OUT+'/index.json','w'),ensure_ascii=False,separators=(',',':'))
json.dump(dk,open(OUT+'/dokkai.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(idx),len(dk))
