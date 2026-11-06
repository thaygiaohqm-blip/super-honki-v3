import json, re
d=json.load(open('n1.json'))
GROUP_JA={1:'時間・時点',2:'付加・並行',3:'極端な例・強調・例示',4:'限定・特徴・立場・話題',5:'基準・根拠・範囲・関連',6:'原因・理由・目的',7:'条件・仮定',8:'逆接・譲歩',9:'無視・不問・対比',10:'様子・状態・傾向',11:'感情・極限・不可避',12:'評価・判断・不必要',13:'禁止・結末・文語的表現'}
GROUP_THEME={1:['thoi-gian'],2:['bo-sung'],3:['nhan-manh'],4:['pham-vi'],5:['can-cu'],6:['nguyen-nhan'],7:['dieu-kien'],8:['nghich-tiep'],9:['bat-chap'],10:['trang-thai'],11:['cam-xuc'],12:['danh-gia'],13:['kha-nang']}
def rng(a,b): return list(range(a,b+1))
THEME_OVR={
 '010':['thoi-gian','cam-xuc'],'050':['thoi-gian','can-cu'],'094':['trang-thai','thoi-gian'],
 '017':['bo-sung','thoi-gian'],'018':['bo-sung'],'019':['bo-sung','thoi-gian'],'020':['so-sanh','nhan-manh'],
 '021':['nhan-manh'],'022':['nhan-manh','cam-xuc'],'023':['nhan-manh'],'024':['nhan-manh','danh-gia'],'025':['nhan-manh','pham-vi'],'026':['nhan-manh'],
 '027':['liet-ke','nghich-tiep'],'028':['liet-ke'],'029':['liet-ke'],'030':['liet-ke'],
 '031':['pham-vi','danh-gia'],'032':['danh-gia'],'033':['pham-vi','danh-gia'],'034':['pham-vi'],'035':['danh-gia','kha-nang'],'036':['chu-de','danh-gia'],'037':['danh-gia'],'038':['danh-gia','dieu-kien'],'039':['muc-dich','dieu-kien'],'040':['chu-de','cam-xuc'],
 '046':['can-cu','dieu-kien'],'047':['bat-chap','can-cu'],'048':['pham-vi'],'049':['chu-de'],
 '056':['nguyen-nhan','so-sanh'],'057':['danh-gia','cam-xuc'],'058':['muc-dich'],'059':['muc-dich'],'060':['nguyen-nhan'],
 '067':['dieu-kien','bat-chap'],'069':['dieu-kien','so-sanh'],'070':['dieu-kien','ket-qua'],'068':['dieu-kien','ket-qua'],
 '075':['nghich-tiep','cam-xuc'],'079':['nghich-tiep','pham-vi'],
 '086':['chu-de','bat-chap'],'087':['bat-chap','danh-gia'],'088':['so-sanh'],'089':['so-sanh'],'090':['bat-chap'],
 '100':['ket-qua','trang-thai'],'108':['kha-nang','ket-qua'],'109':['kha-nang'],'110':['kha-nang','ket-qua'],
 '111':['kha-nang','danh-gia'],'112':['kha-nang','so-sanh'],'113':['kha-nang','danh-gia'],'114':['danh-gia'],'115':['danh-gia','cam-xuc'],'116':['kha-nang','danh-gia'],'117':['kha-nang'],'118':['kha-nang'],'119':['kha-nang','ket-qua'],'120':['danh-gia'],
 '121':['kha-nang','danh-gia'],'122':['kha-nang'],'123':['ket-qua'],'124':['pham-vi','kha-nang'],'125':['cam-xuc'],'126':['trang-thai','so-sanh'],'127':['cam-xuc','danh-gia'],'128':['kha-nang'],'129':['dieu-kien'],'130':['kha-nang','danh-gia'],
}
for i in ['101','102','103']: THEME_OVR[i]=['cam-xuc','nhan-manh']
for i in ['104','105','106','107']: THEME_OVR[i]=['cam-xuc']
for i in rng(91,99) : pass
CTX={
 'hoi-thoai':'003 004 005 010 026 028 029 030 034 037 040 056 057 062 063 070 073 075 085 086 087 093 095 096 099 100 106 111 112 113 118 119 123 124 130 132 133 134 135 137 138 141 142 143 131 078 077 066 088 089 018 019 020 033 045 045'.split(),
 'email':'008 017 053 054 061 102 103 104 105 110 112 115 132 143 007 050'.split(),
 'cong-ty':'031 032 036 038 039 041 042 043 044 046 047 049 058 059 061 081 083 116 118 121 122 133 139 009 051 052 055 064 065 067 068 071 072 111 117 129 136'.split(),
 'bao-chi':'006 007 013 014 032 033 036 038 048 050 052 081 082 083 084 090 110 124 127 140 141 131 139 012 021 025 091 101 114'.split(),
 'phien-dich':'008 009 016 020 031 032 035 038 043 044 048 051 053 058 059 102 103 104 105 110 114 115 129 013 014 015 041 042 046 047'.split(),
 'van-ban':'014 015 016 022 023 024 025 026 039 041 042 044 045 049 051 053 055 059 060 064 065 071 072 074 079 080 101 103 107 114 116 117 120 121 122 125 126 127 128 129 130 136 139 140 011 012 027 094'.split(),
 'van-hoc':'054 074 076 091 092 093 094 097 098 107 115 126 127 128 105 022 089 092'.split(),
 'phien-dich2':[],
}
ctxmap={}
for c,ids in CTX.items():
    for i in ids: ctxmap.setdefault(i,[])
    for i in ids:
        if c not in ctxmap[i] and c!='phien-dich2': ctxmap[i].append(c)
SENSE={
 '008':[('Lấy mốc … (thời điểm bắt đầu, kết thúc)',[0,1]),('Bằng, với (phương tiện, cách thức)',[2,3])],
 '010':[('Mỗi khi … là lại … (cảm xúc nảy sinh)',[0,1]),('Dù … hay … đều (～につけ～につけ, 何かにつけ)',[2,3])],
 '022':[('Chỉ cần … thôi cũng đã …',[0,1]),('Ngay cả … cũng không … (Nだに～ない)',[2,3])],
 '024':[('Phải là … mới (Nにしてはじめて)',[0]),('Đến (tuổi, mức) … mới',[1]),('Ngay cả … cũng …',[2]),('Vừa là … vừa là …',[3]),('Chỉ trong … (一瞬にして)',[4])],
 '065':[('Mà không … (bỏ qua bước lẽ ra phải có)',[0]),('Nếu không có … thì không … (なしでは)',[1,2])],
 '074':[('Ngay cả … cũng … (私とて)',[0,1]),('Dù có … cũng … (たとて)',[2])],
 '093':[('Không có chủ ý …, vô tình …',[0,1]),('Không rõ … nào (どこからともなく)',[2])],
 '108':[('Sự việc chắc chắn gây ra cảm xúc, tác động',[0,1]),('Ý chí mạnh của người nói',[2])],
 '112':[('Không cần phải …',[0,1]),('Không bằng …',[2])],
 '115':[('Đáng để … (に堪える)',[0]),('Không thể chịu nổi … (見る・聞くに堪えない)',[1]),('Vô cùng (cảm xúc) … (感謝に堪えない)',[2])],
 '119':[('Chỉ còn cách … (V辞書形)',[0,1]),('Chỉ là … mà thôi (Vた形)',[2])],
 '129':[('Mà không … (làm B mà không làm A)',[1]),('Nếu không … thì không thể … (ことなしには)',[0,2])],
}
KEYS={
'008':['をもちまして','をもって'],'014':['re:(ただ).*?(のみならず)','re:(ただ).*?(のみ)'],'015':['re:(ひとり).*?(だけ|のみならず|のみ)'],'016':['相まって'],
'026':['re:(一)[^、。]{0,2}?(として)'],'027':['re:(であれ).*?(であれ)','であれ'],'028':['re:(なり).*?(なり)'],'029':['re:(といい).*?(といい)'],'030':['re:(といわず).*?(といわず)'],
'031':['をおいて'],'042':['にのっとり','にのっとって'],'043':['を踏まえ'],'047':['いかんにかかわらず','いかんによらず','いかんを問わず'],'057':['だけのことは'],
'063':['うものなら','ようものなら'],'069':['-'],'073':['たところで','だところで'],'077':['re:[ぁ-ん]う(?:が|と)'],'078':['re:([ぁ-ん]う(?:が|と)).*?(まい(?:が|と))'],
'091':['んばかり'],'094':['ながら'],'097':['めい'],'098':['じみ'],'101':['極まり','極まる'],'104':['てやま','てやみ'],'105':['を禁じ得'],'106':['といったら'],
'107':['てはばから'],'109':['ずにはすま','ないではすま'],'110':['を余儀なく'],'112':['には及び','には及ば'],'115':['堪え'],'116':['しかるべき'],'117':['べくもな'],
'119':['までのことだ','までだ','までです','たまで'],'131':['といったところ'],'135':['-'],'136':['難くない'],'137':['-'],'138':['re:(?:[てで]|ばかり)(?:は|なんか)?いられ'],'142':['っぱなし'],'143':['限り'],
}
BOOK={1:'001 002 003 004 005 009',2:'006 048 007 008 131',3:'031 032 013 012 011',4:'028 027 029 030',5:'046 047 081 082 067',6:'091 092 093 094 099',7:'019 017 018',8:'132 075 072 071 076',9:'061 066 133 065 134',10:'077 078 027 073 135',11:'058 059 008',12:'051 052 056 055 053',13:'136 137 138 117 122 121',14:'040 036 139 035 037',15:'088 020 079',16:'140 141 100 142',17:'023 021 022 024 038 025',18:'111 119 068 113 120',19:'114 115 106 143 101 125',20:'104 115 109 108 105 110'}
bookmap={}
for u,ids in BOOK.items():
    for k,i in enumerate(ids.split()): bookmap.setdefault(i,[]).append((u,k+1))
out=['@level n1','']
for g in d['groups']:
    out.append(f"@group {g['n']} | {g['ja'] if False else GROUP_JA[g['n']]} | {g['vi']} | {g['desc']}")
out.append('')
# new patterns
new=open('n1_new.txt').read().strip().split('\n\n')
newmap={}
for blk in new:
    m=re.match(r'@p (\d+) \|',blk); newmap[m.group(1)]=blk
def tags(pid,g):
    th=THEME_OVR.get(pid,GROUP_THEME[g])
    cx=ctxmap.get(pid,['van-ban'])
    return th,cx
for p in d['pats']:
    pid=p['id']; g=p['g']
    out.append(f"@p {pid} | {p['pat']}")
    out.append(f"@group {g}")
    out.append(f"@mean {p['mean']}")
    out.append(f"@core {p['core']}")
    if pid in KEYS: out.append("@key "+" ;; ".join(KEYS[pid]))
    for s in p['struct']: out.append(f"@form {s}")
    for e in p['exp']: out.append(f"@exp {e}")
    if pid in SENSE:
        for k,(lab,ix) in enumerate(SENSE[pid]):
            out.append(f"@sense {k+1} | {lab}")
            for j in ix: out.append(f"@ex {p['ex'][j]['ja']} | {p['ex'][j]['vi']}")
        assert sorted(sum([ix for _,ix in SENSE[pid]],[]))==list(range(len(p['ex']))),pid
    else:
        for e in p['ex']: out.append(f"@ex {e['ja']} | {e['vi']}")
    for c in p['cmp']: out.append(f"@cmp {c['pat']} | {c['lv']} | {c['desc']}")
    for n in p['note']: out.append(f"@note {n}")
    th,cx=tags(pid,g)
    out.append('@theme '+', '.join(th)); out.append('@ctx '+', '.join(cx))
    for u,k in bookmap.get(pid,[]): out.append(f"@book shin-n1 | {u} | {k}")
    out.append('')
for pid in sorted(newmap):
    blk=newmap[pid]
    out.append(blk); out.append('')
for t in d['tests']:
    out.append(f"@test {t['n']}")
    for k in range(1,11):
        q=t['qs'][k-1]; a=t['ans'][str(k)]
        out.append(f"@tq {q['q']} | "+' | '.join(q['opts'])+f" | {a['a']} | {a['ja']} | {a['vi']} | {a['exp']}")
    out.append('')
open('../source/gram/n1.txt','w').write('\n'.join(out))
print(len(out))
missing=[p['id'] for p in d['pats'] if p['id'] not in ctxmap]
print('no ctx (default van-ban):',len(missing))
