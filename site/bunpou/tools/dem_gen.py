# -*- coding: utf-8 -*-
"""Sinh dữ liệu Số đếm: giữ 29 trợ số từ viết tay trong dem.js cũ, thêm trợ số từ mới bằng quy tắc biến âm,
rồi xuất assets/dem-data.js."""
import re, json, sys, io
BASE = ["いち","に","さん","よん","ご","ろく","なな","はち","きゅう","じゅう","なん"]
def gen(cls, k, p=None, b=None, ov=None, y4=None):
    r = [[x + k] for x in BASE]
    if y4: r[3] = [y4 + k]
    if cls == "K":
        for i, s in {0: "いっ", 5: "ろっ", 7: "はっ", 9: "じゅっ"}.items(): r[i] = [s + k]
    elif cls == "S":
        for i, s in {0: "いっ", 7: "はっ", 9: "じゅっ"}.items(): r[i] = [s + k]
    elif cls in ("H", "P"):
        for i, s in {0: "いっ", 5: "ろっ", 7: "はっ", 9: "じゅっ"}.items(): r[i] = [s + p]
        r[2] = [BASE[2] + (b if cls == "H" else p)]; r[10] = [BASE[10] + (b if cls == "H" else p)]
    for i, v in (ov or {}).items(): r[i] = v.split("/")
    return ",".join("/".join(x) for x in r)
W12 = lambda k: {0: "ひと" + k, 1: "ふた" + k}
# (id, ký hiệu, nhóm, cấp, tên, đếm gì, class, stems, ov, ghi chú, ví dụ ja, vi)
NEW = [
 ("kasho","箇所","chung","n3","~箇所 (chỗ, địa điểm)","Địa điểm, vị trí, chỗ cần xử lý","K",("かしょ",),{},"Cũng viết ヶ所, か所. 1, 6, 8, 10 đổi âm ngắt.","地図[ちず]に{三箇所[さんかしょ]}印[しるし]をつけた。","Tôi đã đánh dấu ba chỗ trên bản đồ."),
 ("kenji","件","chung","n3","~件 (vụ việc)","Vụ việc, hồ sơ, email, cuộc gọi","K",("けん",),{},"1, 6, 8, 10 đổi âm ngắt. Khác với 軒 (nhà, quán) dù cùng đọc けん.","今日[きょう]は{三件[さんけん]}の問[と]い合[あ]わせがあった。","Hôm nay có ba yêu cầu hỏi đáp."),
 ("ten","点","chung","n3","~点 (điểm, món)","Điểm số, món đồ, tác phẩm","S",("てん",),{},"1, 8, 10 đổi âm ngắt; 6 đọc ろくてん.","試験[しけん]で{八十点[はちじゅってん]}を取[と]った。","Tôi được tám mươi điểm trong kỳ thi."),
 ("kumi","組","chung","n3","~組 (cặp, bộ, lớp)","Cặp, bộ, nhóm, lớp học (一組 ひとくみ)","N",("くみ",),{0:"ひとくみ/いちくみ",1:"ふたくみ/にくみ",5:"ろくくみ/ろっくみ"},"1, 2 thường đọc ひとくみ, ふたくみ.","{二組[ふたくみ]}の夫婦[ふうふ]が来[き]ました。","Có hai cặp vợ chồng đã đến."),
 ("shurui","種類","chung","n4","~種類 (loại)","Chủng loại, loại","S",("しゅるい",),{},"1, 8, 10 đổi âm ngắt.","このお店[みせ]にはパンが{十種類[じっしゅるい]}ある。","Quán này có mười loại bánh mì."),
 ("mei","名","nguoi","n3","~名 (người, lịch sự)","Người (lịch sự, trong văn bản, nhà hàng)","N",("めい",),{},"Dùng thay 人 trong ngữ cảnh trang trọng: 何名様 (mấy vị).","予約[よやく]は{四名[よんめい]}です。","Đặt bàn cho bốn người."),
 ("byou","秒","tg","n4","~秒 (giây)","Giây","N",("びょう",),{},"Đọc đều, không biến âm.","百[ひゃく]メートルを{十秒[じゅうびょう]}で走[はし]った。","Tôi chạy một trăm mét trong mười giây."),
 ("haku","泊","tg","n4","~泊 (đêm trọ)","Số đêm lưu trú ở khách sạn","P",("はく","ぱく","ぱく"),{},"Đi cùng 日: 二泊三日 (にはくみっか: 2 đêm 3 ngày). 1, 3, 6, 8, 10 → ぱく.","京都[きょうと]に{二泊[にはく]}しました。","Tôi đã nghỉ hai đêm ở Kyoto."),
 ("shuu","周","so","n3","~周 (vòng)","Số vòng chạy, vòng quanh","S",("しゅう",),{},"1, 8, 10 đổi âm ngắt. Khác 週間 (tuần lễ).","グラウンドを{三周[さんしゅう]}走[はし]った。","Tôi chạy ba vòng quanh sân."),
 ("bai","倍","so","n4","~倍 (lần, gấp)","Gấp mấy lần","N",("ばい",),{},"Đọc đều. Ví dụ 二倍 (gấp đôi).","今年[ことし]の売[う]り上[あ]げは去年[きょねん]の{二倍[にばい]}だ。","Doanh thu năm nay gấp đôi năm ngoái."),
 ("wari","割","so","n3","~割 (phần mười)","Một phần mười, tỉ lệ (三割 = 30%)","N",("わり",),{},"Dùng để nói tỉ lệ: 五割 là 50%.","学生[がくせい]の{三割[さんわり]}が留学[りゅうがく]を希望[きぼう]している。","Ba phần mười số sinh viên muốn đi du học."),
 ("i","位","so","n3","~位 (hạng)","Thứ hạng","N",("い",),{},"Đọc đều: 一位 いちい, 二位 にい.","マラソンで{三位[さんい]}になった。","Tôi đã về hạng ba trong cuộc chạy marathon."),
 ("sen","戦","so","n2","~戦 (trận)","Trận đấu, chiến dịch","S",("せん",),{},"1, 8, 10 đổi âm ngắt.","今[いま]のところ{三戦[さんせん]}二勝[にしょう]一敗[いっぱい]です。","Hiện giờ là ba trận thắng hai thua một."),
 ("fukuro","袋","an","n4","~袋 (túi, gói)","Túi, gói, bao","N",("ふくろ",),W12("ふくろ"),"1, 2 thường đọc ひとふくろ, ふたふくろ.","お米[こめ]を{二袋[ふたふくろ]}買[か]いました。","Tôi đã mua hai bao gạo."),
 ("hako","箱","an","n4","~箱 (hộp)","Hộp, thùng","N",("はこ",),W12("はこ"),"1, 2 thường đọc ひとはこ, ふたはこ.","ティッシュを{三箱[さんはこ]}買[か]った。","Tôi đã mua ba hộp khăn giấy."),
 ("sara","皿","an","n4","~皿 (đĩa)","Đĩa, món ăn đựng trong đĩa","N",("さら",),W12("さら"),"1, 2 thường đọc ひとさら, ふたさら.","サラダを{二皿[ふたさら]}頼[たの]んだ。","Tôi gọi hai đĩa salad."),
 ("kan_can","缶","an","n3","~缶 (lon)","Đồ đóng hộp, lon","K",("かん",),{},"Cùng đọc かん với 巻 và 貫 nhưng chữ khác nhau.","ビールを{二缶[にかん]}飲[の]んだ。","Tôi đã uống hai lon bia."),
 ("kire","切れ","an","n3","~切れ (miếng, lát)","Miếng, lát, miếng cắt (bánh, thịt, cá)","N",("きれ",),W12("きれ"),"1, 2 thường đọc ひときれ, ふたきれ.","ケーキを{二切[ふたき]れ}食[た]べた。","Tôi đã ăn hai miếng bánh."),
 ("tsubu","粒","an","n3","~粒 (hạt)","Hạt nhỏ, viên nhỏ: gạo, đậu, nho","N",("つぶ",),{0:"ひとつぶ",1:"ふたつぶ",2:"みつぶ/さんつぶ",3:"よつぶ/よんつぶ"},"1, 2 đọc ひとつぶ, ふたつぶ.","ぶどうを{三粒[みつぶ]}食[た]べた。","Tôi ăn ba quả nho."),
 ("jou_pill","錠","an","n2","~錠 (viên thuốc)","Viên thuốc","N",("じょう",),{},"Đọc đều.","この薬[くすり]は一回[いっかい]に{二錠[にじょう]}飲[の]みます。","Thuốc này mỗi lần uống hai viên."),
 ("hou_pack","包","an","n2","~包 (gói thuốc bột)","Gói thuốc bột, gói nhỏ","P",("ほう","ぽう","ぽう"),{},"1, 3, 6, 8, 10 → ぽう.","粉薬[こなぐすり]を{一包[いっぽう]}飲[の]んだ。","Tôi đã uống một gói thuốc bột."),
 ("kan_sushi","貫","an","n2","~貫 (miếng sushi)","Miếng sushi nigiri","K",("かん",),{},"Cùng đọc かん với 缶 và 巻. Cũng dùng 個 trong hội thoại.","お寿司[すし]を{八貫[はっかん]}食[た]べた。","Tôi đã ăn tám miếng sushi."),
 ("zen","膳","an","n2","~膳 (đôi đũa, bát cơm)","Đôi đũa, bát cơm đặt trên khay","N",("ぜん",),{},"Đũa đếm theo đôi 一膳; cơm cũng đếm 膳 trong nhà hàng cổ điển.","お箸[はし]を{二膳[にぜん]}ください。","Cho tôi hai đôi đũa."),
 ("chou_tofu","丁","an","n2","~丁 (miếng đậu phụ)","Đậu phụ, món mì ramen trong quán","S",("ちょう",),{},"1, 8, 10 đổi âm ngắt.","豆腐[とうふ]を{二丁[にちょう]}買[か]った。","Tôi đã mua hai miếng đậu phụ."),
 ("chaku","着","sach","n3","~着 (bộ quần áo)","Bộ quần áo, thứ tự về đích","S",("ちゃく",),{},"1, 8, 10 đổi âm ngắt. Dùng cho bộ đồ: スーツ一着.","スーツを{二着[にちゃく]}買[か]った。","Tôi đã mua hai bộ com-lê."),
 ("kyaku","脚","sach","n2","~脚 (ghế, bàn chân dài)","Ghế, bàn, đồ có chân","K",("きゃく",),{},"1, 6, 8, 10 đổi âm ngắt.","会議室[かいぎしつ]に椅子[いす]が{十脚[じゅっきゃく]}ある。","Phòng họp có mười cái ghế."),
 ("men","面","sach","n2","~面 (gương, màn hình)","Gương, màn hình, sân","N",("めん",),{},"Đọc đều.","この部屋[へや]には鏡[かがみ]が{二面[にめん]}ある。","Phòng này có hai tấm gương."),
 ("bu","部","sach","n3","~部 (bản, bộ)","Bản sao, tờ báo, tài liệu","N",("ぶ",),{},"Đọc đều.","資料[しりょう]を{三十部[さんじゅうぶ]}コピーした。","Tôi đã photo ba mươi bản tài liệu."),
 ("kan_vol","巻","sach","n3","~巻 (tập)","Tập trong bộ sách hoặc cuộn","K",("かん",),{},"1, 6, 8, 10 đổi âm ngắt. Cùng đọc かん với 缶 và 貫.","この小説[しょうせつ]は全[ぜん]{十巻[じゅっかん]}ある。","Bộ tiểu thuyết này có tất cả mười tập."),
 ("gou","号","sach","n3","~号 (số hiệu)","Số phòng, số báo, số hiệu","N",("ごう",),{},"Đọc đều: 一号, 二号.","私[わたし]の部屋[へや]は{二〇三号[にひゃくさんごう]}室[しつ]です。","Phòng của tôi là phòng số 203."),
 ("rin","輪","sach","n2","~輪 (bông hoa, bánh xe)","Bông hoa, bánh xe","N",("りん",),{},"Đọc đều.","テーブルに花[はな]が{一輪[いちりん]}飾[かざ]ってある。","Trên bàn có cắm một bông hoa."),
 ("taba","束","sach","n2","~束 (bó)","Bó hoa, bó rau","N",("たば",),{0:"ひとたば",1:"ふたたば",2:"さんたば"},"1, 2 đọc ひとたば, ふたたば.","花[はな]を{二束[ふたたば]}買[か]った。","Tôi đã mua hai bó hoa."),
 ("tou_build","棟","cong","n2","~棟 (toà nhà)","Toà nhà, dãy nhà","N",("とう",),{0:"いっとう",5:"ろくとう/ろっとう",7:"はっとう/はちとう",9:"じゅっとう"},"Cùng đọc とう với 頭 (con vật lớn) nhưng chữ khác nhau.","この団地[だんち]には{十棟[じゅっとう]}の建物[たてもの]がある。","Khu chung cư này có mười toà nhà."),
 ("ko_house","戸","cong","n2","~戸 (hộ gia đình)","Hộ gia đình, căn nhà (nhà riêng)","K",("こ",),{},"Cùng đọc こ với 個. Thường gặp trong 一戸建[いっこだ]て (nhà riêng).","この村[むら]には{五十戸[ごじゅっこ]}の家[いえ]がある。","Ngôi làng này có năm mươi hộ."),
 ("heya","部屋","cong","n4","~部屋 (phòng)","Phòng","N",("へや",),W12("へや"),"1, 2 thường đọc ひとへや, ふたへや.","このホテルの客室[きゃくしつ]は{五十部屋[ごじゅうへや]}ある。","Khách sạn này có năm mươi phòng."),
 ("ki_build","基","cong","n2","~基 (công trình)","Đập nước, tháp, mộ, lò phản ứng","K",("き",),{},"1, 6, 8, 10 đổi âm ngắt.","この県[けん]には原子炉[げんしろ]が{三基[さんき]}ある。","Tỉnh này có ba lò phản ứng hạt nhân."),
 ("kou","校","cong","n3","~校 (trường)","Trường học","K",("こう",),{},"1, 6, 8, 10 đổi âm ngắt.","この市[し]には小学校[しょうがっこう]が{十校[じっこう]}ある。","Thành phố này có mười trường tiểu học."),
 ("sha","社","cong","n3","~社 (công ty)","Công ty, đền thờ","S",("しゃ",),{},"1, 8, 10 đổi âm ngắt.","{三社[さんしゃ]}から内定[ないてい]をもらった。","Tôi nhận được lời mời làm việc từ ba công ty."),
 ("seki_ship","隻","xe","n2","~隻 (tàu lớn)","Tàu thuỷ lớn","S",("せき",),{},"1, 8, 10 đổi âm ngắt. Thuyền nhỏ dùng 艘.","港[みなと]に船[ふね]が{三隻[さんせき]}泊[と]まっている。","Ở cảng có ba chiếc tàu đang neo."),
 ("sou_boat","艘","xe","n2","~艘 (thuyền)","Thuyền nhỏ, ca nô","S",("そう",),{},"1, 8, 10 đổi âm ngắt.","川[かわ]にボートが{二艘[にそう]}浮[う]かんでいる。","Trên sông có hai chiếc thuyền đang nổi."),
 ("ki_plane","機","xe","n3","~機 (máy bay)","Máy bay, trực thăng","K",("き",),{},"Cùng đọc き với 基. 1, 6, 8, 10 đổi âm ngắt.","空港[くうこう]に飛行機[ひこうき]が{五機[ごき]}止[と]まっている。","Ở sân bay có năm chiếc máy bay đỗ."),
 ("ryou","両","xe","n3","~両 (toa tàu)","Toa tàu, xe lửa","N",("りょう",),{},"Đọc đều: 十両編成 (đoàn tàu mười toa).","この電車[でんしゃ]は{十両[じゅうりょう]}編成[へんせい]です。","Đoàn tàu này gồm mười toa."),
 ("bin","便","xe","n3","~便 (chuyến bay)","Chuyến bay, chuyến xe, chuyến gửi","N",("びん",),{},"Đọc đều: 一便, 二便.","東京[とうきょう]行[ゆ]きの{三便[さんびん]}に乗[の]る。","Tôi đi chuyến bay thứ ba đến Tokyo."),
 ("kyoku","曲","ngon","n3","~曲 (bài hát)","Bài hát, bản nhạc","K",("きょく",),{},"1, 6, 8, 10 đổi âm ngắt.","コンサートで{五曲[ごきょく]}歌[うた]った。","Tôi đã hát năm bài trong buổi hoà nhạc."),
 ("wa_story","話","ngon","n3","~話 (tập, câu chuyện)","Tập phim, câu chuyện, chương","N",("わ",),{},"Đọc đều. Cùng đọc わ với 羽, nhưng 羽 đổi âm.","このアニメは全[ぜん]{二十四話[にじゅうよんわ]}です。","Bộ phim hoạt hình này có tất cả hai mươi bốn tập."),
 ("go_word","語","ngon","n3","~語 (từ)","Từ vựng, ngôn ngữ","N",("ご",),{},"Đọc đều.","毎日[まいにち]{五語[ごご]}ずつ単語[たんご]を覚[おぼ]える。","Mỗi ngày tôi học thuộc năm từ vựng."),
 ("mon","問","ngon","n4","~問 (câu hỏi)","Câu hỏi trong đề thi","N",("もん",),{},"Đọc đều.","この試験[しけん]は{五十問[ごじゅうもん]}ある。","Bài thi này có năm mươi câu."),
 ("ji_char","字","ngon","n4","~字 (chữ)","Chữ, ký tự","N",("じ",),{},"Cùng đọc じ với 時 (giờ), phân biệt nhờ ngữ cảnh.","このレポートは{二千字[にせんじ]}以内[いない]で書[か]いてください。","Hãy viết bài báo cáo này trong vòng hai nghìn chữ."),
 ("gyou","行","ngon","n3","~行 (dòng)","Dòng chữ","N",("ぎょう",),{},"Đọc đều.","この詩[し]は{十行[じゅうぎょう]}ある。","Bài thơ này có mười dòng."),
 ("page","ページ","do","n5","~ページ (trang)","Trang sách","K",("ページ",),{5:"ろっページ/ろくページ"},"1, 6, 8, 10 đổi âm ngắt: いっページ, ろくページ/ろっページ.","{三十ページ[さんじゅっページ]}まで読[よ]んだ。","Tôi đã đọc đến trang ba mươi."),
 ("meetoru","メートル","do","n5","~メートル (mét)","Mét","N",("メートル",),{},"Đọc đều.","駅[えき]まで{五百メートル[ごひゃくメートル]}ある。","Đến ga còn năm trăm mét."),
 ("senchi","センチ","do","n5","~センチ (xăng-ti-mét)","Xăng-ti-mét","S",("センチ",),{5:"ろくセンチ/ろっセンチ"},"1, 8, 10 đổi âm ngắt.","身長[しんちょう]は{百七十センチ[ひゃくななじゅっセンチ]}です。","Chiều cao của tôi là một mét bảy mươi."),
 ("guramu","グラム","do","n5","~グラム (gam)","Gam","N",("グラム",),{},"Đọc đều.","砂糖[さとう]を{二百グラム[にひゃくグラム]}入[い]れる。","Cho vào hai trăm gam đường."),
 ("rittoru","リットル","do","n5","~リットル (lít)","Lít","N",("リットル",),{5:"ろくリットル/ろくリッター"},"Đọc đều.","水[みず]を{二リットル[にリットル]}飲[の]んだ。","Tôi đã uống hai lít nước."),
 ("paasento","パーセント","do","n4","~パーセント (phần trăm)","Phần trăm","K",("パーセント",),{5:"ろくパーセント/ろっパーセント"},"1, 6, 8, 10 đổi âm ngắt: いっパーセント, じゅっパーセント.","合格[ごうかく]した人[ひと]は{十パーセント[じゅっパーセント]}だけだった。","Chỉ có mười phần trăm số người đã đỗ."),
 ("doru","ドル","do","n5","~ドル (đô-la)","Đô-la Mỹ","N",("ドル",),{},"Đọc đều.","この本[ほん]は{十ドル[じゅうドル]}です。","Cuốn sách này giá mười đô-la."),
 ("choume","丁目","do","n4","~丁目 (khu phố)","Số khu phố trong địa chỉ","K",("ちょうめ",),{0:"いっちょうめ",5:"ろくちょうめ",7:"はっちょうめ",9:"じゅっちょうめ"},"Dùng trong địa chỉ: 三丁目 さんちょうめ.","住所[じゅうしょ]は渋谷[しぶや]{二丁目[にちょうめ]}です。","Địa chỉ là Shibuya khu hai."),
]
OBJ = """
tsu|お菓子[かし]|bánh kẹo (nhiều thứ)|ko
ko|消[け]しゴム|cục tẩy|tsu
ko|卵[たまご]|quả trứng|tsu
nin|学生[がくせい]|sinh viên|mei
nin|友達[ともだち]|bạn bè|mei
mei|お客様[きゃくさま]（レストランの予約[よやく]）|khách hàng (đặt bàn nhà hàng)|nin
mai|紙[かみ]|tờ giấy|
mai|切手[きって]|con tem|
mai|シャツ|cái áo sơ mi|chaku
mai|ピザ（丸ごと）|cái pizza nguyên|
hon|鉛筆[えんぴつ]|cây bút chì|
hon|傘[かさ]|cái ô|
hon|ネクタイ|cà vạt|
hon|ビールの瓶[びん]|chai bia|
hon|映画[えいが]|bộ phim|
hon|電話[でんわ]（かかってきた電話）|cuộc điện thoại|tsuu
satsu|本[ほん]|cuốn sách|
satsu|雑誌[ざっし]|tạp chí|
satsu|ノート|quyển vở|
dai|車[くるま]|chiếc ô tô|
dai|パソコン|máy tính|
dai|洗濯機[せんたくき]|máy giặt|
dai|自転車[じてんしゃ]|xe đạp|
ken|喫茶店[きっさてん]|quán cà phê|
ken|家[いえ]|căn nhà|ko_house
soku|靴[くつ]|đôi giày|
soku|靴下[くつした]|đôi tất|
tsuu|手紙[てがみ]|bức thư|
tsuu|メール|email|ken
hiki|猫[ねこ]|con mèo|
hiki|魚[さかな]|con cá|
hiki|虫[むし]|con sâu bọ|
wa|鳥[とり]|con chim|
wa|うさぎ|con thỏ|hiki
tou|牛[うし]|con bò|
tou|馬[うま]|con ngựa|
tou|象[ぞう]|con voi|
hai|コーヒー（カップに入[はい]った）|cốc cà phê|
hai|ご飯[はん]|bát cơm|
hai|ジュース（コップ）|ly nước ép|
hai|イカ|con mực (đã đánh bắt)|
kai_f|マンションのフロア|tầng của chung cư|
fukuro|砂糖[さとう]|bao đường|
hako|ティッシュ|hộp khăn giấy|
hako|チョコレート（箱入[はこい]り）|hộp sô-cô-la|
sara|サラダ|đĩa salad|
sara|刺身[さしみ]|đĩa sashimi|
kan_can|缶[かん]ジュース|lon nước ngọt|hon
kire|ケーキ（切[き]ったもの）|miếng bánh ngọt|
kire|パン（切[き]ったもの）|lát bánh mì|
tsubu|米[こめ]|hạt gạo|
tsubu|ぶどう|quả nho|
jou_pill|錠剤[じょうざい]|viên thuốc|
hou_pack|粉薬[こなぐすり]|gói thuốc bột|
kan_sushi|握[にぎ]り寿司[ずし]|miếng sushi nigiri|ko
zen|お箸[はし]|đôi đũa|
chou_tofu|豆腐[とうふ]|miếng đậu phụ|
chaku|スーツ|bộ com-lê|
chaku|ワンピース|cái váy liền|mai
kyaku|椅子[いす]|cái ghế|
men|鏡[かがみ]|tấm gương|
bu|新聞[しんぶん]|tờ báo (bản in)|
bu|資料[しりょう]（コピー）|bản tài liệu photo|
kan_vol|全集[ぜんしゅう]|bộ toàn tập (từng tập)|satsu
rin|花[はな]（一[ひと]つ）|một bông hoa|
taba|花束[はなたば]|bó hoa|
tou_build|ビル|toà nhà|
tou_build|アパート|dãy chung cư|
heya|ホテルの客室[きゃくしつ]|phòng khách sạn|
ki_build|ダム|con đập|
ki_build|お墓[はか]|ngôi mộ|
kou|小学校[しょうがっこう]|trường tiểu học|
sha|会社[かいしゃ]|công ty|
seki_ship|大[おお]きな船[ふね]|tàu lớn|
sou_boat|ボート|chiếc thuyền nhỏ|
ki_plane|飛行機[ひこうき]|máy bay|
ryou|電車[でんしゃ]の車両[しゃりょう]|toa tàu điện|
bin|飛行機[ひこうき]の便[びん]|chuyến bay|
kyoku|歌[うた]|bài hát|
kyoku|ピアノの曲[きょく]|bản nhạc piano|
wa_story|ドラマ|một tập phim truyền hình|
go_word|単語[たんご]|từ vựng|
mon|試験[しけん]の問題[もんだい]|câu hỏi thi|
ji_char|漢字[かんじ]|chữ Hán|
gyou|詩[し]|dòng thơ|
"""
def old_lines():
    s = io.open("/home/claude/bunpou/tools/dem_old.txt", encoding="utf-8").read()
    return [l for l in s.strip().split("\n") if l.strip()]
def main():
    lines = old_lines()
    # đổi nhóm
    out = []
    for l in lines:
        f = l.split("|")
        if f[0] == "ken": f[2] = "cong"
        out.append("|".join(f))
    for (i, sym, cat, lv, name, what, cls, st, ov, note, ja, vi) in NEW:
        if len(st) == 1: rd = gen(cls, st[0], ov=ov)
        else: rd = gen(cls, st[0], st[1], st[2], ov=ov)
        out.append("|".join([i, sym, cat, lv, name, what, rd, note, ja, vi]))
    objs = [l.split("|") for l in OBJ.strip().split("\n") if l.strip()]
    ids = {l.split("|")[0] for l in out}
    for o in objs:
        assert o[0] in ids, o
        for a in o[3].split(",") if len(o) > 3 and o[3] else []:
            assert a in ids, (o, a)
    js = "/* Dữ liệu số đếm, sinh bởi tools/dem_gen.py */\nwindow.SB_DEM = " + json.dumps({"D": out, "OBJ": objs}, ensure_ascii=False, indent=0) + ";\n"
    io.open("/home/claude/bunpou/assets/dem-data.js", "w", encoding="utf-8").write(js)
    print(len(out), "trợ số từ,", len(objs), "đồ vật")
main()
