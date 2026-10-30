import sys, zipfile, re
from xml.etree import ElementTree as ET
W='{http://schemas.openxmlformats.org/wordprocessingml/2006/main}'
def walk(el, state):
    s=''
    for c in el:
        t=c.tag
        if t==W+'t':
            if not state['field']: s+=c.text or ''
        elif t==W+'tab': s+='\t'
        elif t==W+'br': s+='\n'
        elif t==W+'fldChar':
            ty=c.get(W+'fldCharType')
            if ty=='begin': state['field']=True; state['instr']=''
            elif ty=='end':
                state['field']=False
                m=re.search(r'\\s\\up\s*\d+\((.*?)\),(.*)\)\s*$', state['instr'].strip(), re.S)
                if m: s+='\x01'+m.group(2)+'['+m.group(1)+']'
                elif 'EQ' not in state['instr']: pass
                state['instr']=''
        elif t==W+'instrText':
            if state['field']: state['instr']+=c.text or ''
        elif t==W+'ruby':
            rt=c.find(W+'rt'); rb=c.find(W+'rubyBase')
            s+='\x01'+walk(rb,state)+'['+walk(rt,state)+']'
        elif t in (W+'rPr',W+'pPr'): continue
        else: s+=walk(c,state)
    return s
z=zipfile.ZipFile(sys.argv[1]); root=ET.fromstring(z.read('word/document.xml'))
body=root.find(W+'body')
lines=[]
for p in body.iter(W+'p'):
    t=walk(p,{'field':False,'instr':''})
    t=re.sub(r'(?<=[\u3400-\u9fff々])\x01','｜',t).replace('\x01','')
    lines.append(t)
open(sys.argv[2],'w').write('\n'.join(lines))
print(len(lines))
