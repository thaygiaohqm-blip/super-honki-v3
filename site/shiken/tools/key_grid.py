"""Đọc bảng đáp án dạng lưới (số câu ở hàng trên, đáp án ở hàng dưới) từ ảnh scan."""
import sys,re,subprocess,csv,io,glob,os,json,tempfile
def tokens(png):
    out=subprocess.run(['tesseract',png,'-','-l','eng','--psm','11','tsv'],capture_output=True,text=True).stdout
    T=[]
    for r in csv.DictReader(io.StringIO(out),delimiter='\t',quoting=csv.QUOTE_NONE):
        if r.get('level')!='5' or not (r.get('text') or '').strip(): continue
        T.append((int(r['left']),int(r['top']),int(r['width']),int(r['height']),r['text'].strip()))
    return T
def grid_pairs(T):
    heads=[];digs=[]
    for x,y,w,h,t in T:
        m=re.fullmatch(r'[\(（\[]?\s*(\d{1,2})\s*[\)）\]]?',t)
        if m and re.search(r'[\(\)（）\[\]]',t) : heads.append((x+w/2,y,int(m.group(1))))
        elif re.fullmatch(r'[1-4]',t): digs.append((x+w/2,y,int(t)))
    res=[]
    for hx,hy,n in heads:
        best=None
        for dx,dy,d in digs:
            if 15<dy-hy<110 and abs(dx-hx)<30:
                sc=abs(dx-hx)+(dy-hy)*0.3
                if best is None or sc<best[0]: best=(sc,d,dy)
        res.append((hy,hx,n,best[1] if best else None))
    return res
def read_key(pdf,pages=(1,2),dpi=300):
    allp=[]
    d=tempfile.mkdtemp(dir='/home/claude/ocr/pg')
    for pg in pages:
        subprocess.run(['pdftoppm','-r',str(dpi),'-f',str(pg),'-l',str(pg),'-gray','-png',pdf,d+'/k%d'%pg],capture_output=True)
        for f in sorted(glob.glob(d+'/k%d-*.png'%pg)):
            T=tokens(f)
            pr=grid_pairs(T)
            # sắp theo hàng (gom y gần nhau) rồi x
            pr.sort(key=lambda r:(round(r[0]/60),r[1]))
            allp.append([(n,a) for hy,hx,n,a in pr])
    return allp
if __name__=='__main__':
    for i,p in enumerate(read_key(sys.argv[1],tuple(int(x) for x in sys.argv[2:]) or (1,2))):
        print('page',i,len(p)); print(p)
