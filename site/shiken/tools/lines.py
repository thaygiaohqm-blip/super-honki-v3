"""Trích dòng chữ từ PDF đề thi có chữ (bỏ furigana, đánh dấu gạch chân bằng <u>…</u>, ô trống bằng ＿)."""
import pdfplumber,re,unicodedata
RUBY=8.0
def page_lines(pg,upright=False):
    chars=[c for c in pg.chars if (not upright or (abs(c['matrix'][1])<0.05 and abs(c['matrix'][2])<0.05)) and ( c['size']>=RUBY and c['text'].strip()!='' or (c['size']>=RUBY and c['text']==' '))]
    # underline rects
    us=[r for r in pg.rects if r['height']<2.2 and r['width']>4 and r['width']<400]
    # dedupe
    seen=set();U=[]
    for r in us:
        k=(round(r['x0']),round(r['x1']),round(r['top']))
        if k in seen: continue
        seen.add(k);U.append(r)
    for c in chars: c['_u']=False
    used=set()
    for i,r in enumerate(U):
        hit=False
        for c in chars:
            if c['bottom']-1.5<=r['top']<=c['bottom']+4 and (c['x0']+c['x1'])/2>=r['x0']-1.5 and (c['x0']+c['x1'])/2<=r['x1']+1.5:
                c['_u']=True;hit=True
        if not hit and r['width']>9 and r['x0']>=100 and r['top']>100: used.add(i)
    # pseudo blank chars
    for i in used:
        r=U[i]
        chars.append({'text':'＿','x0':r['x0'],'x1':r['x1'],'top':r['top']-11,'bottom':r['top'],'_u':False,'size':11,'_blank':True})
    # group to lines by bottom
    chars.sort(key=lambda c:(round(c['bottom']),c['x0']))
    lines=[];cur=[]
    for c in sorted(chars,key=lambda c:c['bottom']):
        if cur and abs(c['bottom']-cur[-1]['bottom'])>3.2:
            lines.append(cur);cur=[]
        cur.append(c)
    if cur: lines.append(cur)
    out=[]
    for ln in lines:
        ln.sort(key=lambda c:c['x0'])
        s='';prev=None;inu=False
        for c in ln:
            t=c['text']
            if prev is not None:
                gap=c['x0']-prev['x1']
                if gap>c['size']*0.45 and not s.endswith(' '):
                    if inu: s+='</u>';inu=False
                    s+=' '
                if gap>c['size']*2.2: s+=' '
            u=c['_u'] and not c.get('_blank') and t.strip()!='' and not (c['x0']<100 and t.isdigit())
            if u and not inu: s+='<u>';inu=True
            if not u and inu: s+='</u>';inu=False
            s+=t;prev=c
        if inu: s+='</u>'
        out.append({'t':s,'x0':ln[0]['x0'],'y':ln[0]['bottom']})
    return out
def exam_lines(path,upright=False):
    res=[]
    with pdfplumber.open(path) as pdf:
        for i,pg in enumerate(pdf.pages):
            L=page_lines(pg,upright)
            for l in L:
                txt=unicodedata.normalize('NFKC',l['t'])
                res.append({'p':i,'t':txt,'x0':l['x0'],'y':l['y']})
    return res
if __name__=='__main__':
    import sys
    for l in exam_lines(sys.argv[1])[:int(sys.argv[2]) if len(sys.argv)>2 else 80]: print(l['p'],round(l['x0']),l['t'])
