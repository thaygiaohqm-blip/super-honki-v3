import json, re
d=json.load(open('n2.json'))
GROUP_THEME={1:['thoi-gian'],2:['bo-sung'],3:['can-cu'],4:['chu-de'],5:['nguyen-nhan'],6:['trang-thai'],7:['dieu-kien'],8:['nghich-tiep'],9:['kha-nang'],10:['suy-doan'],11:['cam-xuc']}
T={'006':'thoi-gian trang-thai','009':'thoi-gian nguyen-nhan','010':'thoi-gian trang-thai','012':'nhan-manh bo-sung','016':'pham-vi nhan-manh','017':'danh-gia nhan-manh','018':'liet-ke','019':'nhan-manh','020':'trang-thai','021':'can-cu','022':'can-cu','025':'can-cu dieu-kien','026':'can-cu nguyen-nhan','029':'pham-vi thoi-gian','030':'pham-vi','031':'chu-de so-sanh','032':'chu-de','037':'chu-de','038':'so-sanh danh-gia','039':'so-sanh danh-gia','040':'cam-xuc','041':'nguyen-nhan ket-qua','042':'nguyen-nhan ket-qua','047':'cam-xuc nguyen-nhan','048':'can-cu','049':'y-chi can-cu','050':'ket-qua nguyen-nhan','055':'so-sanh','056':'so-sanh','057':'so-sanh','058':'bo-sung','059':'trang-thai','060':'thoi-gian','061':'dieu-kien suy-doan','062':'dieu-kien y-chi','064':'dieu-kien danh-gia','066':'bat-chap dieu-kien','067':'bat-chap ket-qua','070':'thoi-gian ket-qua','072':'nghich-tiep','074':'cam-xuc nghich-tiep','078':'bat-chap liet-ke','079':'so-sanh danh-gia','080':'so-sanh','081':'y-chi kha-nang','082':'y-chi','083':'kha-nang','084':'kha-nang','085':'kha-nang','086':'suy-doan','087':'kha-nang','088':'y-chi danh-gia','089':'cam-xuc kha-nang','090':'cam-xuc kha-nang','093':'ket-qua suy-doan','094':'suy-doan nhan-manh','095':'danh-gia','096':'trang-thai','097':'trang-thai','098':'trang-thai','099':'trang-thai cam-xuc','100':'so-sanh trang-thai','101':'y-chi','102':'y-chi','103':'danh-gia cam-xuc','104':'nhan-manh','105':'y-chi danh-gia','106':'cam-xuc','107':'cam-xuc','108':'y-chi kha-nang','109':'nhan-manh danh-gia','110':'suy-doan nhan-manh','051':'trang-thai','052':'trang-thai','053':'trang-thai','054':'trang-thai','013':'bo-sung','014':'bo-sung','001':'thoi-gian','002':'thoi-gian','027':'can-cu','028':'can-cu danh-gia'}
THEME_OVR={k:v.split() for k,v in T.items()}
CTXL={
'hoi-thoai':'001 002 004 005 006 019 020 037 038 039 040 041 042 046 062 074 075 077 080 085 086 093 094 095 096 097 098 099 100 101 102 103 104 105 106 107 110 057 056 090 089',
'email':'003 007 008 036 081 083 085 031 025 034',
'cong-ty':'003 007 008 021 023 024 025 031 034 035 036 043 048 049 081 082 083 088 009 054 071 072',
'bao-chi':'009 011 014 018 026 027 029 030 032 033 051 052 053 054 056 057 059 060 071 073 087 092 045 055',
'phien-dich':'018 021 022 023 025 031 032 033 036 071 073 079 080 029 030',
'van-ban':'011 012 013 015 017 021 022 028 029 030 035 044 045 047 055 058 066 067 068 069 070 072 073 076 078 079 088 091 092 109 108 064 065 084 087 082 016',
'van-hoc':'002 010 075 076 099 100 107 109 047 091',
}
ctxmap={}
for c,ids in CTXL.items():
    for i in ids.split(): ctxmap.setdefault(i,[]); 
    for i in ids.split():
        if c not in ctxmap[i]: ctxmap[i].append(c)
SENSE={
'003':[('Hễ ... xong là lập tức ... (Vます＋次第)',[0,1,2]),('Tùy theo ... (N＋次第)',[3])],
'005':[('Nhân lúc còn ... hãy làm (うちに)',[0]),('Trước khi ... thì hãy làm (ないうちに)',[1,2]),('Đang làm A thì B xảy ra lúc nào không hay',[3])],
'020':[('Toàn là ..., chỉ ... (Nばかり)',[0]),('Cứ ... mãi (Vてばかりいる)',[1,3]),('Ngày càng ... (Vるばかりだ)',[2])],
'023':[('Theo, đúng theo ...',[0,1,3]),('Dọc theo ...',[2])],
'026':[('Tùy theo ... mà khác nhau',[0,3]),('Do ... (nguyên nhân)',[1]),('Bằng ... (phương tiện, cách thức)',[2])],
'030':[('Thông qua ... (trung gian, phương tiện)',[0,1,3]),('Suốt ... (toàn bộ khoảng thời gian)',[2])],
'031':[('Đối với ... (đối tượng của hành động, thái độ)',[0,1,3]),('Trái lại, so với ... (đối lập)',[2])],
'045':[('Lý do của tên gọi, tình trạng',[0,3]),('Căn cứ để suy đoán',[1,2])],
'052':[('Càng ... thì càng ... (biến đổi cùng chiều)',[0,1]),('Làm theo, tuân theo ...',[2,3])],
'053':[('Cùng với ... (cùng nhau)',[0]),('Cùng với sự thay đổi của ...',[1,3]),('Vừa là ... đồng thời là ...',[2])],
'056':[('Một mặt ... đồng thời ... (hai việc song song)',[0,2]),('Mặt khác, ngược lại ... (đối lập)',[1,3])],
'060':[('Đồng thời, cùng lúc ...',[0,2]),('Vừa là ... đồng thời là ... (hai tư cách)',[1]),('Cùng với ... (kéo theo thay đổi)',[3])],
'069':[('Chừng nào còn ... (điều kiện kéo dài)',[0,2,3]),('Trong phạm vi hiểu biết ...',[1])],
'075':[('Tuy ... nhưng ... (trái ngược)',[0,1,2]),('Cách nói lịch sự cố định (残念ながら)',[3])],
'078':[('Dù là ... thì cũng ... (nhượng bộ)',[0,1]),('Dù ... hay ... (X にしても Y にしても)',[2]),('Ngay cả ... (cũng)',[3])],
'080':[('Thay cho, thay vì ...',[0]),('Đổi lại, đền đáp ...',[1]),('Bù lại (mặt tốt mặt xấu)',[2,3])],
'087':[('Có thể ... (得る)',[0,1,3]),('Không thể ... (得ない)',[2])],
'088':[('Nên ... (べき)',[0,1,3]),('Không nên ... (べきではない)',[2])],
'103':[('Hồi tưởng thói quen quá khứ (ものだ)',[0]),('Chân lý chung, bản tính con người',[1]),('Nên, lẽ đương nhiên (ものだ／ものではない)',[2,3])],
'016':[('Cứ đúng lúc ... thì (trớ trêu) / Riêng ... thì không đời nào',[0,1]),('Chỉ giới hạn ở ... (限り)',[2,3])],
}
KEYS={'001':['re:(か).*?(ないかのうちに)'],'005':['うちに','ないうちに'],'020':['ばかり'],'026':['によって','により','による'],'037':['といえば','というと','といったら'],'055':['re:(ば).*?(ほど)'],'065':['re:(さえ).*?(ば)'],'078':['にしても','にせよ','にしろ'],'076':['つつも','つつ'],'089':['ずにはいられ','ずにはいられない'],'090':['ないではいられ'],'093':['わけだ'],'094':['わけがない','わけはない'],'095':['わけではない','というものではない'],'087':['得る','得ない','得ません','うる','えない'],'088':['べき'],'040':['ことに'],'044':['だけに'],'097':['気味'],'098':['っぽい'],'099':['げ'],'100':['かのよう'],'061':['としたら','とすれば','とすると'],'062':['ものなら'],'063':['ないことには'],'064':['ようでは'],'068':['ない限り','ないかぎり'],'069':['限り'],'083':['わけにはいかない'],'082':['ないわけにはいかない'],'106':['てならない'],'107':['てたまらない'],'108':['ほかない','よりほかない'],'109':['にほかならない'],'110':['に決まっている'],'101':['ことはない'],'102':['までもない'],'104':['ものか'],'105':['ことだ'],'103':['ものだ','ものではない']}
BOOK={1:'007 008 002 111 001',2:'004 005 141 020 059 076',3:'070 003 010',4:'018 112 029 030 069',5:'016 069',6:'015 011 012 013 014',7:'036 032 113 031 136',8:'022 021 023 114',9:'051 054 053 025',10:'078',11:'115 116 117 118 119',12:'094 120 104 095',13:'037',14:'071 072 073 075 076 077',15:'061 062 063 137 066 078',16:'026 046 041 042 047 138',17:'127 128 044 050 049 048',18:'126 083 085 084 087 120',19:'039 038 044 035 034',20:'121 122 123 125 124',21:'019 135',22:'139 086 092 140 091 110',23:'103 017 109 129 108 088',24:'134 105 103 101 140 104',25:'130 107 106 090 089 082 081',26:'133 103 131 132 105'}
KEYS.update({'004':['最中'],'010':['て以来','以来'],'017':['に過ぎ'],'021':['に基づ','に基づき','に基づい'],'023':['に沿っ','に沿い','に沿う','に沿った'],'024':['どおり','とおり'],'025':['に応じ','に応じて','に応じた'],'029':['にわたっ','にわたり','にわたる'],'031':['に対し','に対する','に対して'],'032':['をめぐっ','をめぐり','をめぐる'],'036':['に関し','に関する','に関して'],'042':['せい'],'044':['だけあって','だけに','だけのことはある'],'054':['に伴っ','に伴い','に伴う'],'067':['たところで','だところで'],'081':['ざるをえ','ざるを得'],'085':['かね'],'096':['がち'],'098':['っぽ'],'102':['までもな'],'104':['ものか','ものですか'],'106':['てならない','でならない'],'108':['ほかなかっ','ほかない','よりほか'],'120':['どころでは','どころか'],'130':['しかたが','しょうがな','しかたな'],'134':['じゃないか','ではないか'],'138':['につき']})
bookmap={}
for u,ids in BOOK.items():
    for k,i in enumerate(ids.split()): bookmap.setdefault(i,[]).append((u,k+1))
out=['@level n2','']
for g in d['groups']:
    out.append(f"@group {g['n']} | {g['ja']} | {g['vi']} | {g['desc']}")
out.append('')
for p in d['pats']:
    pid=p['id']; g=p['g']
    out.append(f"@p {pid} | {p['pat']}"); out.append(f"@group {g}"); out.append(f"@mean {p['mean']}"); out.append(f"@core {p['core']}")
    if pid in KEYS: out.append("@key "+" ;; ".join(KEYS[pid]))
    for s in p['struct']: out.append(f"@form {s}")
    for e in p['exp']: out.append(f"@exp {e}")
    if pid in SENSE:
        assert sorted(sum([ix for _,ix in SENSE[pid]],[]))==list(range(len(p['ex']))),pid
        for k,(lab,ix) in enumerate(SENSE[pid]):
            out.append(f"@sense {k+1} | {lab}")
            for j in ix: out.append(f"@ex {p['ex'][j]['ja']} | {p['ex'][j]['vi']}")
    else:
        for e in p['ex']: out.append(f"@ex {e['ja']} | {e['vi']}")
    for c in p['cmp']: out.append(f"@cmp {c['pat']} | {c['lv']} | {c['desc']}")
    for n in p['note']: out.append(f"@note {n}")
    out.append('@theme '+', '.join(THEME_OVR.get(pid,GROUP_THEME[g]))); out.append('@ctx '+', '.join(ctxmap.get(pid,['van-ban'])))
    for u,k in bookmap.get(pid,[]): out.append(f"@book shin-n2 | {u} | {k}")
    out.append('')
new=open('n2_new.txt').read().strip().split('\n\n')
for blk in new:
    pid=re.match(r'@p (\d+)',blk).group(1)
    blk=re.sub(r'^@book shin-n2 \| (\d+)$',lambda m:'@book shin-n2 | %s'%m.group(1),blk,flags=re.M)
    # đặt thứ tự theo BOOK
    lines=[l for l in blk.split('\n') if not l.startswith('@book')]
    for u,k in bookmap.get(pid,[]): lines.append(f"@book shin-n2 | {u} | {k}")
    out.append('\n'.join(lines)); out.append('')
for t in d['tests']:
    out.append(f"@test {t['n']}")
    for k in range(1,11):
        q=t['qs'][k-1]; a=t['ans'][str(k)]
        out.append(f"@tq {q['q']} | "+' | '.join(q['opts'])+f" | {a['a']} | {a['ja']} | {a['vi']} | {a['exp']}")
    out.append('')
open('../source/gram/n2.txt','w').write('\n'.join(out))
print(len(out))
