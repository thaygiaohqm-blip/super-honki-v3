import json,re
D=json.load(open('/home/claude/work/ans_words.json'))
def solve(words,N):
    # words: (t,x0,x1,top)
    # cắt trước 聴解
    cut=1e9
    for w in words:
        if w[0]=='聴解': cut=min(cut,w[3])
    ws=[w for w in words if w[3]<cut]
    ints=[w for w in ws if re.fullmatch(r'\d{1,2}',w[0])]
    def below(w):
        c=(w[1]+w[2])/2;best=None
        for v in ints:
            if v is w: continue
            if re.fullmatch(r'[1-4]',v[0]) and 5<v[3]-w[3]<48 and abs((v[1]+v[2])/2-c)<7:
                if best is None or v[3]<best[3]: best=v
        return best
    ordered=sorted(ints,key=lambda w:(round(w[3]/4),w[1]))
    res={};used=set();n=1;pos=0
    cand=[w for w in ordered]
    # lần lượt tìm nhãn n
    last=(-1,-1)
    for n in range(1,N+1):
        found=None
        for w in cand:
            if w[0]!=str(n) or id(w) in used: continue
            if (round(w[3]/4),w[1])<last: continue
            b=below(w)
            if b and id(b) not in used:
                found=(w,b);break
        if not found: res[n]=None;continue
        w,b=found; used.add(id(w));used.add(id(b)); res[n]=int(b[0]); last=(round(w[3]/4),w[1])
    return res
if __name__=='__main__':
    for k,v in D.items():
        words=[w for p,wl in v for w in [(x[0],x[1],x[2],x[3]+p*10000) for x in wl]]
        r=solve(words,75)
        print(k,sum(1 for x in r.values() if x),[n for n,x in r.items() if x is None][:20])
