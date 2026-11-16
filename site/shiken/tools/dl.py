import json,subprocess,os,re,sys
from concurrent.futures import ThreadPoolExecutor
r=json.load(open('/home/claude/raw/files.json'))
def safe(s): return re.sub(r'[^\w\-.]+','_',s)
jobs=[]
for x in r:
    n=x['name']
    if not n.endswith('.pdf PDF') and not n.endswith('.txt Text') and not n.endswith('.png Image'): continue
    fn='/home/claude/raw/pdf/'+'__'.join(safe(p) for p in x['path'])+'__'+safe(n.rsplit(' ',1)[0])
    x['local']=fn; jobs.append((x,fn))
def go(a):
    x,fn=a
    if os.path.exists(fn) and os.path.getsize(fn)>1000: return
    subprocess.run(['curl','-s','-m','300','-L','-o',fn,f"https://drive.usercontent.google.com/download?id={x['id']}&export=download&confirm=t"])
with ThreadPoolExecutor(8) as ex: list(ex.map(go,jobs))
json.dump([x for x,_ in jobs],open('/home/claude/raw/dl.json','w'),ensure_ascii=False,indent=1)
