import openpyxl,re,json,collections,sys
def parse(path,sheet):
    wb=openpyxl.load_workbook(path,data_only=True); ws=wb[sheet]
    out=[];cur=None
    for r in ws.iter_rows(values_only=True):
        r=list(r)+[None]*100
        a,b,c=r[0],r[1],r[2]
        isk=isinstance(b,str) and len(b.strip())==1 and ord(b.strip())>0x2e80 and a in (None,'')
        if isk:
            cur={'k':b.strip(),'note':'\n'.join(str(x).strip() for x in r[12:14] if x not in (None,'')) ,'t':None,'hv':'','m':'','comps':'','idx':None,'on':'','kun':'','voc':[]}
            out.append(cur); continue
        if cur is None: continue
        if isinstance(a,str) and a.strip() in ('Y','N','TH','CS','HT','CC','GT','HY','C','H','T') and b:
            cur['t']=a.strip(); p=str(b).split('\n'); cur['hv']=p[0].strip(); cur['m']=' '.join(x.strip() for x in p[1:]); cur['comps']=(c or '').strip(); continue
        if isinstance(a,(int,float)) and cur['idx'] is None:
            cur['idx']=int(a); cur['on']=re.sub(r'\s+',' ',str(c or '')).strip(); cur['kun']=re.sub(r'\s+',' ',str(r[7] or '')).strip(); continue
        if isinstance(b,str) and b.strip() and cur['t'] is not None and cur['idx'] is not None:
            cur['voc'].append(b.strip())
    return out
if __name__=='__main__':
    U='/mnt/user-data/uploads/'
    d={'a':parse(U+'dc60411c-T_p_1_-_check___n_t29.xlsx','Tập 1'),'b1':parse(U+'e7d71b89-T_p_2.xlsx','Tập 1'),'b2':parse(U+'e7d71b89-T_p_2.xlsx','Tập 2')}
    for k,v in d.items():
        print(k,len(v),collections.Counter(x['t'] for x in v).most_common(), 'idx range',min(x['idx'] or 0 for x in v),max(x['idx'] or 0 for x in v))
    json.dump(d,open('xl.json','w'),ensure_ascii=False)
    print(d['b2'][0]); print(d['b2'][500])
