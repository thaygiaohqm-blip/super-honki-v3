"""Parser chung cho đề N1/N3/N4/N5 (PDF có chữ hoặc dòng OCR).
rows: [{'t':str,'x0':float,'p':int}] -> {'mondai':[{n,sec,instr,questions}],'passages':[{id,text}],'warn':[...]}
Đánh số mondai theo THỨ TỰ khối trong đề (template của từng cấp), không theo số in trên đề (N3-N5 đánh số lại từng phần)."""
import re,unicodedata
CJ='[぀-ヿ一-鿿]'
# (n, sec, kind VN, kind JA, số câu chuẩn)
TPL={
 'n3':[(1,'moji','Cách đọc Kanji','漢字読み',8),(2,'moji','Viết Kanji / Biểu ký','表記',6),(3,'moji','Điền từ theo ngữ cảnh','文脈規定',11),(4,'moji','Từ đồng nghĩa','言い換え類義',5),(5,'moji','Cách dùng từ','用法',5),
       (6,'bunpou','Ngữ pháp: chọn hình thức đúng','文の文法1',13),(7,'bunpou','Ngữ pháp: sắp xếp câu (★)','文の文法2(★)',5),(8,'bunpou','Ngữ pháp: điền vào đoạn văn','文章の文法',5),
       (9,'dokkai','Đọc hiểu đoạn ngắn','内容理解(短文)',4),(10,'dokkai','Đọc hiểu đoạn trung','内容理解(中文)',6),(11,'dokkai','Đọc hiểu đoạn dài','内容理解(長文)',4),(12,'dokkai','Tìm kiếm thông tin','情報検索',2)],
 'n4':[(1,'moji','Cách đọc Kanji','漢字読み',7),(2,'moji','Viết Kanji / Biểu ký','表記',5),(3,'moji','Điền từ theo ngữ cảnh','文脈規定',8),(4,'moji','Từ đồng nghĩa','言い換え類義',5),(5,'moji','Cách dùng từ','用法',5),
       (6,'bunpou','Ngữ pháp: chọn hình thức đúng','文の文法1',15),(7,'bunpou','Ngữ pháp: sắp xếp câu (★)','文の文法2(★)',5),(8,'bunpou','Ngữ pháp: điền vào đoạn văn','文章の文法',5),
       (9,'dokkai','Đọc hiểu đoạn ngắn','内容理解(短文)',3),(10,'dokkai','Đọc hiểu đoạn trung','内容理解(中文)',4),(11,'dokkai','Tìm kiếm thông tin','情報検索',2)],
 'n5':[(1,'moji','Cách đọc Kanji','漢字読み',12),(2,'moji','Viết Kanji / Biểu ký','表記',8),(3,'moji','Điền từ theo ngữ cảnh','文脈規定',10),(4,'moji','Từ đồng nghĩa','言い換え類義',5),
       (5,'bunpou','Ngữ pháp: chọn hình thức đúng','文の文法1',16),(6,'bunpou','Ngữ pháp: sắp xếp câu (★)','文の文法2(★)',5),(7,'bunpou','Ngữ pháp: điền vào đoạn văn','文章の文法',5),
       (8,'dokkai','Đọc hiểu đoạn ngắn','内容理解(短文)',3),(9,'dokkai','Đọc hiểu đoạn trung','内容理解(中文)',2),(10,'dokkai','Tìm kiếm thông tin','情報検索',1)],
 'n1':[(1,'moji','Cách đọc Kanji','漢字読み',6),(2,'moji','Điền từ theo ngữ cảnh','文脈規定',7),(3,'moji','Từ đồng nghĩa','言い換え類義',6),(4,'moji','Cách dùng từ','用法',6),
       (5,'bunpou','Ngữ pháp: chọn hình thức đúng','文の文法1',10),(6,'bunpou','Ngữ pháp: sắp xếp câu (★)','文の文法2(★)',5),(7,'bunpou','Ngữ pháp: điền vào đoạn văn','文章の文法',5),
       (8,'dokkai','Đọc hiểu đoạn ngắn','内容理解(短文)',4),(9,'dokkai','Đọc hiểu đoạn trung','内容理解(中文)',9),(10,'dokkai','Đọc hiểu đoạn dài','内容理解(長文)',3),(11,'dokkai','Đọc hiểu tổng hợp (so sánh A, B)','統合理解',2),(12,'dokkai','Đọc hiểu: nắm chủ trương','主張理解(長文)',3),(13,'dokkai','Tìm kiếm thông tin','情報検索',2)],
}
HDR=re.compile(r'^(?:問\s*題|間\s*題|もんだい|も\s*ん\s*だ\s*い)\s*(\d{1,2})(?!\d)\s*(.*)$')
QST=re.compile(r'^[\[［(（]?\s*(\d{1,2})(?!\d)\s*[\]］)）\.．]?\s*(.*)$')
def tidy(t):
    return re.sub('(?:%s ){2,}%s'%(CJ,CJ),lambda m:m.group(0).replace(' ',''),t)
def labels(s):
    """vị trí nhãn lựa chọn tuần tự 1,2,3,4 -> [(d,start,end)]; ưu tiên nhãn đứng sau khoảng cách rộng (\u2003)"""
    def scan(rx):
        out=[]
        for m in re.finditer(rx,s):
            d=int(m.group(1))
            if not out: out.append((d,m.start(1),m.end()))
            elif d==out[-1][0]+1: out.append((d,m.start(1),m.end()))
            elif d==out[-1][0] and d<4 and out[-1][0]>=2: out.append((d+1,m.start(1),m.end()))
        return out
    strict=scan(r'(?:(?<=\u2003)|^)([1-4])\s*[\.．]?\s*(?=\S)')
    loose=scan(r'(?:(?<=\s)|^)([1-4])\s*[\.．]?\s*(?=\S)')
    if len(strict)>=4: return strict
    return loose if len(loose)>len(strict) else strict
def split_choices(s):
    L=labels(s)
    res=[]
    for i,(d,a,b) in enumerate(L):
        e=L[i+1][1] if i+1<len(L) else len(s)
        res.append((d,s[b:e].strip()))
    return res
def parse_rows(rows,level,warn=None):
    warn=[] if warn is None else warn
    tpl=TPL[level]
    R=[]
    for r in rows:
        t=r['t']; s=t.strip()
        if len(s)<=1 and not re.match(r'\d',s): continue
        if s in('','_'): continue
        if re.search(r'新日本語能力試験|YUUKI|Yuuki|www\.|公众号|名师|微信|日语轻松考|日语老师',s) or re.fullmatch(r'\d+\s*/\s*\d+',s) or re.fullmatch(r'[-－]\s*\d+\s*[-－]',s) or re.fullmatch(r'\(N\d [\d-]+\)',s): continue
        t=re.sub(r'^(\s*)[□■☐]\s*',r'\1',t)
        t=re.sub(r'(?<=[\u4e00-\u9fff々])\(([\u3040-\u309f]{1,8})\)','',t)
        t=re.sub(r'^(\s*)(\d) (\d)\s?([\)）])',r'\1\2\3\4',t)
        t=re.sub(r'^(\s*\d{1,2}) +([\)）])',r'\1\2',t)
        R.append({'t':re.sub(r'[ \t]+',lambda m:'\u2003' if len(m.group(0))>=3 else ' ',t.replace('　',' ')).rstrip(),'x0':r['x0'],'p':r['p']})
    end=len(R)
    for i,r in enumerate(R):
        if re.match(r'^(聴解|聽解|ちょうかい)$',r['t'].strip().replace(' ','')): end=i;break
    R=R[:end]
    blocks=[]
    for r in R:
        s=r['t'].strip()
        m=HDR.match(s.replace('問 題','問題').replace('間題','問題'))
        if m and len(s)<400:
            blocks.append({'num':int(m.group(1)),'head':[m.group(2)],'body':[]}); continue
        if blocks: blocks[-1]['body'].append(r)
    cl=[]
    for b in blocks:
        if cl and not b['body'] and b['num']==cl[-1]['num']: continue
        cl.append(b)
    blocks=cl
    if len(blocks)!=len(tpl): warn.append('số khối %d != template %d: %s'%(len(blocks),len(tpl),[b['num'] for b in blocks]))
    exam={'mondai':[],'passages':[],'warn':warn}
    qn=1
    tpl_last_bunpou=max(t[0] for t in tpl if t[1]=='bunpou')
    for bi,b in enumerate(blocks):
        if bi>=len(tpl): break
        n,sec,kind,ja,std=tpl[bi]
        body=b['body'];head=[b['head'][0]];i=0
        while not re.search(r'(さい|ない)[。.]?\s*$',''.join(head)) and i<len(body) and i<3:
            head.append(body[i]['t'].strip());i+=1
        body=body[i:]
        if qn>1 and not any((QST.match(x['t'].strip()) or [0,'0'])[1]==str(qn) for x in body if QST.match(x['t'].strip())) and any(QST.match(x['t'].strip()) and QST.match(x['t'].strip()).group(1)=='1' for x in body):
            qn=1
        instr=re.sub(r'\s+',' ',' '.join(h for h in head if h))
        qs=[];buf=[];curp=None;q=None;ch={}
        lastch=None;lastp=None
        def finish():
            nonlocal q,ch
            if q is not None:
                q['choices']=[tidy(ch.get(k,'').strip()) for k in (1,2,3,4)]
                q['stem']=tidy('\n'.join(q['stem']))
                if '<u>★</u>' in q['stem']: q['stem']=q['stem'].replace('<u>★</u>','＿ ＿ ★ ＿')
                qs.append(q)
            q=None;ch={}
        for r in body:
            s=r['t'].strip()
            if not s: continue
            mq=QST.match(s)
            nlab=len(labels(s))
            first_is_choice=False
            if q is not None and len(ch)<4:
                mm=re.match(r'^([1-4])(?!\d)',s)
                if mm and int(mm.group(1)) not in ch:
                    if not(mq and int(mq.group(1))==qn and nlab<2 and len(ch)>=1 and not r['t'].startswith(' ') and r['x0']<=q['x0']+3 and len(s)>12):
                        first_is_choice=True
            if not first_is_choice and q is not None and 0<len(ch)<4 and lastch and lastch<4 and re.match(r'^%d(?!\d)'%lastch,s) and (lastch+1) not in ch:
                s=str(lastch+1)+s[1:]; first_is_choice=True
            if first_is_choice:
                for lab,txt in split_choices(s):
                    if lab in ch and ch[lab]: ch[lab]+=' '+txt
                    else: ch[lab]=txt
                    lastch=lab
                lastp=r['p'];continue
            if mq and int(mq.group(1))==qn:
                rest=(mq.group(2) or '').strip()
                finish()
                if buf:
                    passages=exam['passages']
                    passages.append({'id':len(passages)+1,'mondai':n,'text':buf});curp=len(passages);buf=[]
                q={'no':qn,'stem':[],'mondai':n,'p':curp,'x0':r['x0']};ch={};lastch=None
                lb=labels(rest)
                if lb and rest.startswith(('1','2','3','4')) and len(lb)>=2:
                    for lab,txt in split_choices(rest): ch[lab]=txt;lastch=lab
                elif rest: q['stem'].append(rest)
                qn+=1;lastp=r['p']
                continue
            if q is not None and len(ch)<4:
                if not ch: q['stem'].append(s)
                elif lastch: ch[lastch]=ch.get(lastch,'')+' '+s
                continue
            if q is not None and len(ch)>=4 and lastch and r['p']==lastp and r['t'].startswith(' ') and r['x0']>100 and not re.match(r'^[1-4]',s) and len(s)<30 and not re.search('[。]',s):
                ch[lastch]+=' '+s;continue
            if q is not None and len(ch)>=4: finish()
            if sec=='dokkai' or n==tpl_last_bunpou: buf.append({'t':r['t'],'x0':r['x0']})
        finish()
        exam['mondai'].append({'n':n,'sec':sec,'kind':kind,'ja':ja,'instr':instr,'questions':qs,'std':std})
        if buf:
            nop=[x for x in qs if x['p'] is None]
            if nop and len(buf)>=3:
                exam['passages'].append({'id':len(exam['passages'])+1,'mondai':n,'text':buf})
                for x in nop: x['p']=len(exam['passages'])
            elif exam['passages']: exam['passages'][-1]['text']+=buf
            buf=[]
    for p in exam['passages']:
        out=[]
        for x in p['text']:
            t=x['t'].strip()
            if not t: continue
            if out and not x['t'].startswith(' ') and not t.startswith('(注') and not re.match(r'^[(（]\d',t) and not re.search('[。」]$',out[-1]): out[-1]+=t
            else: out.append(t)
        p['text']='\n'.join(out); del p['mondai']
    for m in exam['mondai']:
        c=len(m['questions'])
        if c!=m['std']: warn.append('M%d: %d câu (chuẩn %d)'%(m['n'],c,m['std']))
        for q in m['questions']:
            q.pop('x0',None)
            if any(not x for x in q['choices']): warn.append('câu %d thiếu lựa chọn'%q['no'])
    return exam
