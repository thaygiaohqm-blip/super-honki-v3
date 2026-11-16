import sys,json,os; sys.path.insert(0,'/home/claude/tools')
from lines import exam_lines
from parse_gen import parse_rows
C=[('n3-2016-07','n3',"N3__7-2016__Đe_N3_7-2016.pdf"),('n3-2016-12','n3',"N3__12-2016__Đe_N3_12-2016.pdf"),('n3-2017-07','n3',"N3__7-2017__2017.07.N3.pdf"),
('n3-2021-12','n3',"N3__12-2021__N3_T12-2021_Final_Version.pdf"),('n3-2022-07','n3',"N3__7-2022__N3_T7-2022_Final_Version.pdf"),('n3-2022-12','n3',"N3__12-2022__Đe_N3_T12-2022_Final_Version.pdf"),('n3-2023-07','n3',"N3__7-2023__Đe_N3_T7-2023.pdf"),
('n4-2023-07','n4',"N4__2023年7月__Đề_N4_T7-2023.pdf"),
('n1-2021-07','n1',"N1__2021年7月__2021.7.N1.pdf"),('n1-2025-07','n1',"N1__2025年7月__JLPT_N1_2025-7.pdf"),('n1-2025-12','n1',"N1__2025年12月__JLPT_N1_2025-12.pdf")]
for eid,lv,f in C:
    try:
        rows=[{'t':l['t'],'x0':l['x0'],'p':l['p']} for l in exam_lines('/home/claude/raw/pdf/'+f,True)]
        e=parse_rows(rows,lv)
    except Exception as ex:
        print(eid,'ERR',ex);continue
    json.dump(e,open('/home/claude/work/gen/%s.json'%eid,'w'),ensure_ascii=False)
    print(eid,[len(m['questions']) for m in e['mondai']],'P',len(e['passages']),e['warn'][:6])
