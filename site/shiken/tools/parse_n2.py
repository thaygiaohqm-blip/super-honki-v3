import re,json,sys,os,glob,unicodedata
sys.path.insert(0,'/home/claude/tools')
from lines import exam_lines

HDR=re.compile(r'^JLPT[・･\s]*N\d')
def clean(t):
    t=re.sub(r'<u>\s*</u>','',t)
    return re.sub(r'[ \t]+',' ',t.replace('　',' ')).strip('\n')
CJ='[\u3040-\u30ff\u4e00-\u9fff]'
def tidy(t):
    return re.sub('(?:%s ){3,}%s'%(CJ,CJ),lambda m:m.group(0).replace(' ',''),t)

def split_seq(s,j):
    m=re.match(r'^\s*%d\s*'%j,s)
    out=[];cur=j;start=m.end() if m else 0
    while cur<4:
        lab=None
        for mm in re.finditer(r'(?<=\s)([1-4])(?:\s+|(?=[^\x00-\x7f]))',s[start:]):
            d=int(mm.group(1))
            if d>cur: lab=d;break
            if d==cur: lab=cur+1;break
        if lab is None: break
        out.append((cur,s[start:start+mm.start()].strip()))
        cur=lab;start=start+mm.end()
    out.append((cur,s[start:].strip()))
    return out
def lead(t): return t.startswith(' ')
def parse(path):
    L=exam_lines(path)
    rows=[]
    for l in L:
        t=l['t']
        s=t.strip()
        if s in ('','_') : continue
        if HDR.match(s): continue
        if re.fullmatch(r'\d{1,2}',s) and l['x0']>250: continue   # số trang
        rows.append({'t':clean(t),'x0':l['x0'],'p':l['p'],'raw':t})
    # cắt trước 聴解
    end=len(rows)
    for i,r in enumerate(rows):
        if r['t'].strip()=='聴解': end=i;break
    rows=rows[:end]
    sec_of={}; cur=None
    blocks=[];lastm=0
    cursec='moji'
    for r in rows:
        s=r['t'].strip()
        if s in ('文字・語彙','文法','読解'):
            cursec={'文字・語彙':'moji','文法':'bunpou','読解':'dokkai'}[s]; continue
        m=re.match(r'^[問間題][問間題]?\s*(\d{1,2})(?!\d)\s*(.*)$',s)
        if m and lastm+1<=int(m.group(1))<=lastm+2:
            if int(m.group(1))==lastm+2 and blocks: blocks[-1]['skip']=lastm+1
            if int(m.group(1))==lastm+2: blocks.append({'n':lastm+1,'sec':cursec,'head':['(thiếu tiêu đề)'],'body':[],'virtual':True})
            lastm=int(m.group(1))
            blocks.append({'n':lastm,'sec':cursec,'head':[m.group(2)],'body':[]})
            continue
        if blocks: blocks[-1]['body'].append(r)
    exam={'mondai':[],'passages':[]}
    qn=1
    for b in blocks:
        body=b['body']
        # phần còn lại của dòng hướng dẫn
        head=[b['head'][0]]
        i=0
        while not re.search(r'(さい|ない)[。.]\s*$',head[-1]) and i<len(body) and i<3:
            head.append(body[i]['t'].strip()); i+=1
        body=body[i:]
        instr=' '.join(h for h in head if h)
        instr=re.sub(r'\s+',' ',instr)
        qs=[];buf=[];passages=exam['passages'];curp=None
        q=None; ch={}
        def finish():
            nonlocal q,ch
            if q is not None:
                q['choices']=[ch.get(k,'').strip() for k in (1,2,3,4)]
                q['stem']='\n'.join(x for x in q['stem'] if x is not None)
                q['stem']=q['stem'].replace('<u>★</u>','＿ ＿ ★ ＿').replace('★','★') if '<u>★</u>' in q['stem'] else q['stem']
                qs.append(q)
            q=None;ch={}
        lastchx=None;lastch=None;lastp=None
        for r in body:
            s=r['t'].strip(); t=r['t']
            if not s: continue
            # câu hỏi mới?
            mq=re.match(r'^(\d{1,2})(?:<u>)?[a-zA-Z]?(?:</u>)?\.?(?:\s+(.*))?$',s)
            incho = q is not None and len(ch)<4
            # nhãn lựa chọn?
            if mq and q is not None and int(mq.group(1)) in (1,2,3,4) and int(mq.group(1)) not in ch and (incho) and not (int(mq.group(1))==qn and len(ch)==0 and False):
                j=int(mq.group(1))
                # nếu đây là đầu câu hỏi tiếp theo (qn trùng) và đã đủ 4 thì không vào đây
                for lab,txt in split_seq(s,j):
                    if lab in ch and ch[lab]: ch[lab]+=' '+txt
                    else: ch[lab]=txt
                    cur=lab
                lastch=cur; lastchx=r['x0']; lastp=r['p']
                continue
            if mq and int(mq.group(1))==qn and not (q is not None and len(ch)<4 and len(ch)>0 and False):
                finish()
                if buf:
                    txt=[]
                    for x in buf: txt.append(x)
                    passages.append({'id':len(passages)+1,'mondai':b['n'],'text':txt})
                    curp=len(passages)
                    buf=[]
                q={'no':qn,'stem':[],'mondai':b['n'],'p':curp};ch={};lastch=None
                rest=(mq.group(2) or '').strip()
                if rest and re.match(r'^[1-4]\s',rest):
                    for lab,txt in split_seq(rest,int(rest[0])):
                        ch[lab]=txt; lastch=lab
                    lastchx=r['x0']; lastp=r['p']
                elif rest: q['stem'].append(rest)
                qn+=1
                continue
            if q is not None and len(ch)<4:
                if ch and lastch and r['x0']>(lastchx or 0)+5 and not re.match(r'^[1-4]\s',s):
                    ch[lastch]+=' '+s; continue
                if not ch:
                    q['stem'].append(s); continue
                else:
                    ch[lastch]+=' '+s; continue
            if q is not None and len(ch)>=4 and lastch and r['x0']>(lastchx or 0)+8 and not re.match(r'^[1-4]\s',s) and r['x0']>100 and r['p']==lastp:
                ch[lastch]+=' '+s; continue
            # văn bản bài đọc / chú thích
            if q is not None and len(ch)>=4:
                finish()
            buf.append({'t':t,'x0':r['x0']})
        finish()
        # chuẩn hóa passages text sau
        exam['mondai'].append({'n':b['n'],'sec':b['sec'],'instr':instr,'questions':qs,'virtual':b.get('virtual',False)})
        # nếu còn buf (chú thích sau câu cuối) -> gắn vào passage hiện tại
        if buf:
            nop=[x for x in qs if x['p'] is None]
            if nop and len(buf)>=4:
                passages.append({'id':len(passages)+1,'mondai':b['n'],'text':buf})
                for x in nop: x['p']=len(passages)
            elif passages: passages[-1]['text']+=buf
            buf=[]
    SIZE={5:5,6:5,4:7,8:5}
    STD={5:'の言葉に意味が最も近いものを、1・2・3・4から一つ選びなさい。',4:'( )に入れるのに最もよいものを、1・2・3・4から一つ選びなさい。'}
    for i,m in enumerate(exam['mondai']):
        if m.get('virtual') and i>0:
            prev=exam['mondai'][i-1]; take=SIZE.get(m['n'],5)
            m['questions']=prev['questions'][-take:]; prev['questions']=prev['questions'][:-take]
            m['instr']=STD.get(m['n'],''); 
            for q in m['questions']: q['mondai']=m['n']
        m.pop('virtual',None)
    # dựng text passages
    for p in exam['passages']:
        out=[];prevx=None
        for x in p['text']:
            t=x['t']
            if not t.strip(): continue
            if out and not lead(t) and not t.strip().startswith('(注') and not re.match(r'^[(（]\d',t.strip()) and prevx is not None and abs(x['x0']-prevx)<8:
                out[-1]+=t.strip()
            else: out.append(t.strip())
            prevx=x['x0']
        p['text']='\n'.join(out)
        del p['mondai']
    return exam
if __name__=='__main__':
    ex=parse(sys.argv[1])
    for m in ex['mondai']:
        print('Mondai',m['n'],m['sec'],len(m['questions']),m['instr'][:60])
        for q in m['questions'][:2]: print('  ',q['no'],q['stem'][:60].replace('\n','|'),q['choices'],q['p'])
    print(len(ex['passages']))
