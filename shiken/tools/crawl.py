import re,sys,json,subprocess,html
def fetch(fid):
    r=subprocess.run(['curl','-s','-m','40',f'https://drive.google.com/drive/folders/{fid}'],capture_output=True)
    return r.stdout.decode('utf8','replace')
def listing(fid):
    h=fetch(fid); out=[]
    for m in re.finditer(r'data-id="(1[^"]{20,})" data-selection-key',h):
        seg=h[m.start():m.start()+6000]
        t=re.findall(r'data-tooltip="([^"]+)"',seg)
        if not t: continue
        name=html.unescape(t[0]); isf=name.endswith(' Shared folder')
        if isf: name=name[:-len(' Shared folder')]
        out.append((m.group(1),name,isf))
    return out
def crawl(fid,path,res):
    for i,n,f in listing(fid):
        if f: crawl(i,path+[n],res)
        else: res.append({'id':i,'path':path,'name':n})
roots={'N5':'1XQr4kpH9YtLdU_yasMmpvrAdiWlErGpF','N4':'1lcxNg3K8GZu1S6nSmPEpWiNtmG4icFf0','N3':'1O5apjURq3nSEiIZ9T4nz9CM_CdQOW4vq','N2':'1Gh1A9KASgurEu1-EEYswxyTN7f8ABz-9','N1':'11G6g4pmZ4tojEicAqS55VYORHDIK1VSh'}
res=[]
for k,v in roots.items(): crawl(v,[k],res)
json.dump(res,open('/home/claude/raw/files.json','w'),ensure_ascii=False,indent=1)
print(len(res))
from collections import Counter
print(Counter(r['path'][0] for r in res))
