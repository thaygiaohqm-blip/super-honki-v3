import pdfplumber,re,json,unicodedata
P='/home/claude/raw/pdf/N2__ĐÁP_ÁN_JLPT_N2_update_27.10.2026_.pdf'
out={}
with pdfplumber.open(P) as pdf:
    for pi,pg in enumerate(pdf.pages):
        ws=pg.extract_words(keep_blank_chars=False,use_text_flow=False)
        for w in ws: w['t']=unicodedata.normalize('NFKC',w['text'])
        # tìm tiêu đề đề thi
        heads=[]
        for i,w in enumerate(ws):
            if w['t']=='JLPT' and i+2<len(ws) and ws[i+1]['t']=='N2':
                m=re.match(r'(\d{1,2})/(\d{4})$',ws[i+2]['t'])
                if m: heads.append((w['top'],int(m.group(2)),int(m.group(1))))
        if not heads: 
            print('page',pi,'no head'); continue
        heads.sort()
        sec=None
        for w in ws: pass
        # chia từ theo đề (theo y)
        def exam_of(y):
            cur=None
            for hy,yr,mo in heads:
                if y>=hy-1: cur=(yr,mo)
            return cur
        # nhóm theo đề
        by={}
        for w in ws:
            e=exam_of(w['top'])
            if e: by.setdefault(e,[]).append(w)
        for e,wl in by.items():
            out.setdefault(e,[]).append((pi,wl))
json.dump({str(k):[(p,[(w['t'],round(w['x0'],1),round(w['x1'],1),round(w['top'],1)) for w in wl]) for p,wl in v] for k,v in out.items()},open('/home/claude/work/ans_words.json','w'),ensure_ascii=False)
print(sorted(out.keys()))
