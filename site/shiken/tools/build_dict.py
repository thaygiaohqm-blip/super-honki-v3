import glob,re,json
D={}
def clean(w): return re.sub(r'\[[^\]]*\]','',w).strip()
for f in sorted(glob.glob('/home/claude/site/site/goi/source/*/*.txt')):
    lvl=f.split('/')[-2]
    if lvl=='dongnghia': continue
    for l in open(f,encoding='utf8'):
        l=l.rstrip('\n')
        if l.startswith('@') or '|' not in l or l.startswith('#'): continue
        p=[x.strip() for x in l.split('|')]
        if len(p)<4: continue
        head=p[0]
        head=head.lstrip('+')
        word=clean(head).replace(' ','')
        reading=re.sub(r'[\u4e00-\u9fff々〆ヶ]+\[([^\]]+)\]',r'\1',head).replace(' ','') if '[' in head else ''
        if re.search(r'[\u4e00-\u9fff]',reading): reading=''
        hv=p[2] if p[2] not in ('-','') else ''
        mean=p[3]
        if not word or not mean: continue
        e=[reading,mean,hv]
        if word not in D: D[word]=e
        if reading and reading!=word and reading not in D: D[reading]=[reading,mean+' ('+word+')',hv]
json.dump(D,open('/home/claude/site/site/shiken/data/dict.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(D))
import itertools
print(list(itertools.islice(D.items(),5)))
