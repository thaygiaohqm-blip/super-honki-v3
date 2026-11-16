"""OCR PDF scan -> dòng chữ (có phát hiện gạch chân). Dùng tesseract jpn (tessdata_best)."""
import sys,os,re,json,subprocess,glob,tempfile,csv,io
import numpy as np
from PIL import Image
TESS='/home/claude/tess'
CJ='[぀-ヿ一-鿿々ー]'
def run_page(png):
    im=Image.open(png).convert('L'); a=np.array(im)
    th=((a>150)*255).astype('uint8'); b=Image.fromarray(th); tmp=png+'.b.png'; b.save(tmp)
    out=subprocess.run(['tesseract',tmp,'-','-l','jpn','--tessdata-dir',TESS,'--psm','6','-c','preserve_interword_spaces=1','tsv'],capture_output=True,text=True).stdout
    os.remove(tmp)
    dark=(th<128)
    words=[]
    for r in csv.DictReader(io.StringIO(out),delimiter='\t',quoting=csv.QUOTE_NONE):
        if r['level']!='5' or not r['text'] or not r['text'].strip(): continue
        try: x,y,w,h=int(r['left']),int(r['top']),int(r['width']),int(r['height'])
        except: continue
        words.append({'b':int(r['block_num']),'p':int(r['par_num']),'l':int(r['line_num']),'x':x,'y':y,'w':w,'h':h,'t':r['text'],'c':float(r['conf'])})
    lines={}
    for w in words: lines.setdefault((w['b'],w['p'],w['l']),[]).append(w)
    res=[]
    H,W=dark.shape
    for k,ws in lines.items():
        ws.sort(key=lambda w:w['x'])
        s='';inu=False;prevx=None
        for w in ws:
            # gạch chân: dải 2-9px dưới đáy chữ phủ >=85% bề rộng
            y0=min(H-1,w['y']+w['h']+1); y1=min(H,w['y']+w['h']+9)
            u=False
            if w['w']>=12 and y1>y0:
                band=dark[y0:y1,w['x']:w['x']+w['w']]
                if band.shape[1]>0:
                    cov=band.any(axis=0).mean()
                    rowfull=(band.mean(axis=1)>0.85).any()
                    u=rowfull and cov>0.9
            if prevx is not None and w['x']-prevx>w['h']*0.6 and not s.endswith(' '):
                if inu: s+='</u>';inu=False
                s+=' '
            if u and not inu: s+='<u>';inu=True
            if not u and inu: s+='</u>';inu=False
            s+=w['t'];prevx=w['x']+w['w']
        if inu: s+='</u>'
        y=min(w['y'] for w in ws)
        res.append({'t':s,'x0':ws[0]['x'],'y':y})
    res.sort(key=lambda r:r['y'])
    return res
def clean(t):
    # bỏ khoảng trắng giữa các ký tự Nhật (tesseract chèn)
    t=re.sub(r'(?<=%s|>) +(?=%s|<u>)'%(CJ,CJ),'',t)
    t=re.sub(r'(?<=%s|>) +(?=%s|<u>)'%(CJ,CJ),'',t)
    t=t.replace('</u><u>','')
    return t
def ocr_pdf(path,dpi=250,pages=None,cache=None):
    if cache and os.path.exists(cache): return json.load(open(cache))
    d=tempfile.mkdtemp(dir='/home/claude/ocr/pg')
    subprocess.run(['pdftoppm','-r',str(dpi),'-gray','-png',path,d+'/p'],capture_output=True)
    files=sorted(glob.glob(d+'/p-*.png'))
    rows=[]
    for i,f in enumerate(files):
        if pages and (i+1) not in pages: continue
        for r in run_page(f):
            rows.append({'p':i,'t':clean(r['t']),'x0':r['x0'],'y':r['y']})
        os.remove(f)
    if cache: json.dump(rows,open(cache,'w'),ensure_ascii=False)
    return rows
if __name__=='__main__':
    rows=ocr_pdf(sys.argv[1],pages=[int(x) for x in sys.argv[2:]] or None)
    for r in rows[:int(os.environ.get('N','60'))]: print(r['p'],r['x0'],r['t'])
