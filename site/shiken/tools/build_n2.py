import json,glob,re,os,sys
sys.path.insert(0,'/home/claude/tools')
from ans_parse import D,solve
OUT='/home/claude/site/site/shiken/data'
os.makedirs(OUT,exist_ok=True)
KIND={1:'Cách đọc Kanji',2:'Viết Kanji / Biểu ký',3:'Tạo từ ghép',4:'Điền từ theo ngữ cảnh',5:'Từ đồng nghĩa',6:'Cách dùng từ',7:'Ngữ pháp: chọn hình thức đúng',8:'Ngữ pháp: sắp xếp câu (★)',9:'Ngữ pháp: điền vào đoạn văn',10:'Đọc hiểu đoạn ngắn',11:'Đọc hiểu đoạn trung',12:'Đọc hiểu tổng hợp (so sánh A, B)',13:'Đọc hiểu đoạn dài (nắm chủ trương)',14:'Tìm kiếm thông tin'}
JA={1:'漢字読み',2:'表記',3:'語形成',4:'文脈規定',5:'言い換え類義',6:'用法',7:'文の文法1',8:'文の文法2(★)',9:'文章の文法',10:'内容理解(短文)',11:'内容理解(中文)',12:'統合理解',13:'主張理解(長文)',14:'情報検索'}
SEC={'moji':'文字・語彙','bunpou':'文法','dokkai':'読解'}
index=[]
DK=[]
FIX=[('セフリ','セリフ'),('セテップ','ステップ'),('なでできなかたたのか、ううすれば','なぜできなかったのか、どうすれば')]
def fixtext(t):
    t=re.sub(r'\n(\(注\s*\d*\)[^\n:：]*)(?=\n|$)',r'\1',t)
    for a,b in FIX: t=t.replace(a,b)
    t=re.sub(r'\(注\s+(\d)\)',r'(注\1)',t)
    return t
for f in sorted(glob.glob('/home/claude/work/n2/*.json')):
    base=os.path.basename(f)
    m=re.match(r'N2__(?:\d+)_?_N2_(\d+)_(\d{4})',base)
    if not m:
        print('skip',base);continue
    mo,yr=int(m.group(1)),int(m.group(2))
    e=json.load(open(f))
    nq=sum(len(x['questions']) for x in e['mondai'])
    key=(yr,mo)
    words=[w for p,wl in D[str(key)] for w in [(x[0],x[1],x[2],x[3]+p*10000) for x in wl]]
    ans=solve(words,nq)
    miss=[n for n,v in ans.items() if v is None]
    if miss: print('thiếu đáp án',key,miss)
    secs={}
    for mm in e['mondai']:
        qs=[]
        for q in mm['questions']:
            o={'no':q['no'],'s':q['stem'],'c':q['choices'],'a':ans.get(q['no'])}
            if q.get('p'): o['p']=q['p']
            if any(not c for c in q['choices']): o['x']=1
            qs.append(o)
        secs.setdefault('moji' if mm['n']<=6 else 'bunpou' if mm['n']<=9 else 'dokkai',[]).append({'n':mm['n'],'kind':KIND.get(mm['n'],''),'ja':JA.get(mm['n'],''),'instr':mm['instr'],'qs':qs})
    eid='n2-%d-%02d'%(yr,mo)
    doc={'id':eid,'level':'n2','y':yr,'m':mo,'title':'N2 %d/%d'%(mo,yr),
         'sections':[{'key':k,'label':SEC[k],'mondai':secs[k]} for k in ('moji','bunpou','dokkai') if k in secs],
         'passages':{str(p['id']):fixtext(p['text']) for p in e['passages']}}
    for sc in doc['sections']:
        for mm in sc['mondai']:
            for q in mm['qs']:
                q['s']=fixtext(q['s']); q['c']=[fixtext(c) for c in q['c']]
    json.dump(doc,open(OUT+'/'+eid+'.json','w'),ensure_ascii=False,separators=(',',':'))
    for sec in doc['sections']:
        if sec['key']!='dokkai': continue
        for mm in sec['mondai']:
            g={}
            for q in mm['qs']:
                if q.get('p'): g.setdefault(q['p'],[]).append(q['no'])
            for pid,nos in g.items():
                t=doc['passages'].get(str(pid),'')
                head=re.sub(r'<[^>]+>','',t).replace('\n',' ')
                DK.append({'id':eid+'|'+str(pid),'ex':eid,'pid':pid,'level':'n2','y':yr,'m':mo,'n':mm['n'],'nq':len(nos),'len':len(re.sub(r'\s','',t)),'head':head[:60]})
    index.append({'id':eid,'level':'n2','y':yr,'m':mo,'n':nq,'secs':{k:sum(len(x['qs']) for x in v) for k,v in secs.items()},'mon':{str(x['n']):len(x['qs']) for v in secs.values() for x in v}})
index.sort(key=lambda x:(x['level'],-x['y'],-x['m']))
json.dump(index,open(OUT+'/index.json','w'),ensure_ascii=False,separators=(',',':'))
json.dump(DK,open(OUT+'/dokkai.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(index),len(DK))
