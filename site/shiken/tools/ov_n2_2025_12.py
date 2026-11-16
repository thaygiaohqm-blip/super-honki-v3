import json,re,sys
sys.argv=['x','n2-2025-12']
exec(open('/home/claude/tools/show_p.py').read().split("only=set")[0])
P={}
Q={}
def passage(pid,vi,key,v=None,s=None):
    ss=sents(re.sub(r'</?u>','',d['passages'][str(pid)]))
    if s is None:
        assert len(vi)==len(ss),(pid,len(vi),len(ss))
        s=[{'ja':t,'vi':vi[i],**({'p':1} if f else {})} for i,(t,f) in enumerate(ss)]
    P[str(pid)]={'s':s,'key':key,'v':v or []}
def q(no,vi,cv,exp,key,v=None):
    Q[str(no)]={'vi':vi,'cv':cv,'exp':exp,'key':key,**({'v':v} if v else {})}

# ---- (1) 他人は自分を映す鏡
passage(2,["(1)",
"Người ta thường nói rằng “người khác là tấm gương phản chiếu chính mình”.",
"Nếu mình e dè (chú thích 1) mà không nói ra lòng thật (chú thích 2) của mình, thì đối phương cũng sẽ không nói ra tâm tư thật (chú thích 3) với mình.",
"Cứ không biết được lòng thật của nhau như thế thì giao tiếp cũng sẽ trở nên gượng gạo, không suôn sẻ (chú thích 4).",
"Thay vì kìm nén bản thân vì nghĩ “biết đâu mình sẽ bị ghét”, hãy thử nghĩ rằng “mình hãy nói ra tâm tư thật” và “nói như thế nào thì người ta mới hiểu được nhỉ”.",
"Tôi nghĩ những câu tự hỏi mình như vậy sẽ trở thành lòng can đảm nhỏ bé, và dần dần trở thành sức mạnh tạo nên những mối quan hệ tốt đẹp hơn.",
"(Chú thích 1) 気がね: sự e dè, ngại ngùng","(Chú thích 2) 本音: cảm xúc thật, đúng như mình nghĩ","(Chú thích 3) 本心: tấm lòng thật","(Chú thích 4) ギクシャクした: không suôn sẻ, gượng gạo"],
 [2,4,5],[["気がね","きがね","sự e dè"],["本音","ほんね","lòng thật"],["本心","ほんしん","tâm tư thật"],["ギクシャクする","","gượng gạo, trục trặc"],["抑える","おさえる","kìm nén"]])
q(52,"Về mối quan hệ giữa mình và người khác, tác giả nghĩ như thế nào?",
 ["Nếu cố gắng hiểu lòng thật của nhau thì có thể xây dựng mối quan hệ sâu sắc hơn.","Nếu mình nỗ lực nói ra lòng thật của mình thì có thể xây dựng quan hệ tốt với đối phương.","Nếu cố gắng hiểu lòng thật của đối phương thì cảm xúc của mình cũng sẽ được hiểu.","Nếu đã có quan hệ tốt thì dù nói lòng thật của mình cũng không bị ghét."],
 "Câu then chốt là câu 2 và câu 5. Tác giả nói: nếu mình giấu lòng thật thì đối phương cũng không mở lòng (câu 2), vì vậy hãy thử nói ra tâm tư thật của mình; lòng can đảm nhỏ ấy sẽ tạo nên quan hệ tốt đẹp hơn (câu 5). Đó là hành động “chủ động bày tỏ từ phía mình”, nên chọn 2.\nĐáp án 1 sai: tác giả không nói đến việc “hiểu nhau” mà nhấn mạnh việc mình bày tỏ trước. Đáp án 3 sai vì đảo ngược trình tự (hiểu đối phương trước). Đáp án 4 sai vì tác giả không khẳng định “chắc chắn không bị ghét”, chỉ khuyên đừng sợ bị ghét mà kìm nén.",[2,4,5])

# ---- (2) Thông báo bãi xe đạp
passage(3,["(2) Dưới đây là thông báo dán ở bãi giữ xe của một chung cư.",
"Ngày 1 tháng 9","Kính gửi quý cư dân Chung cư Morimura","Công ty quản lý Chung cư Morimura","Về việc di dời xe đạp",
"Hiện nay có nhiều xe đạp không được sử dụng trong thời gian dài, khiến bãi giữ xe khó sử dụng.",
"Vì vậy, chúng tôi sẽ di dời những xe đạp này đến bãi xe đạp không dùng của thành phố.",
"Từ ngày 8 tháng 9, chúng tôi sẽ dán giấy đánh dấu lên tất cả xe đạp trong bãi, những xe đang sử dụng xin quý vị tự gỡ tờ giấy đó trước ngày 30.",
"Những xe còn dán giấy từ ngày 1 tháng 10 trở đi sẽ bị di dời.",
"Chúng tôi không thể hoàn trả xe đạp sau khi đã di dời.","Mong quý vị thông cảm.","Rất mong nhận được sự hợp tác của quý vị.",
"Liên hệ: 038-359-8688 (người phụ trách: Kuroda)","Shimamoto Yōta"],
 [7,8],[["移動","いどう","di dời"],["駐輪場","ちゅうりんじょう","bãi giữ xe đạp"],["目印","めじるし","dấu hiệu"],["返却","へんきゃく","hoàn trả"]])
q(53,"Điều mà thông báo này muốn truyền đạt là gì?",
 ["Nếu xe đạp vẫn đang sử dụng thì xin gỡ tờ giấy đánh dấu trước ngày 30 tháng 9.","Nếu xe đạp vẫn đang sử dụng thì xin gỡ tờ giấy đánh dấu từ ngày 1 tháng 10 trở đi.","Nếu là xe đạp có thể vứt bỏ thì xin dán giấy đánh dấu trước ngày 30 tháng 9.","Nếu là xe đạp có thể vứt bỏ thì xin gỡ tờ giấy đánh dấu trước ngày 30 tháng 9."],
 "Câu then chốt: “ご使用中のものは、30日までにご自身でその紙を外してください” (xe đang dùng thì tự gỡ giấy trước ngày 30) và “10月1日以降に紙が残っているものは、移動します” (xe còn giấy từ 1/10 sẽ bị di dời). Vậy người dùng xe cần gỡ giấy trước 30/9, chọn 1. Đáp án 2 sai về thời hạn. Đáp án 3, 4 sai vì xe không dùng thì cứ để giấy, không phải dán hay gỡ.",[7,8])

# ---- (3) Chợ
passage(4,["(3)",
"Chợ không đơn thuần là nơi người làm ra hàng và người mua tụ tập lại.",
"Ở đó không chỉ có việc mua bán hàng hóa, mà còn có sự trao đổi đủ loại thông tin giữa người làm ra hàng và người mua.",
"Hơn hết, chính vì bị thu hút (chú thích) bởi điều đó mà mọi người tụ tập về chợ.",
"Người làm ra hàng có thể trực tiếp nghe khách đánh giá hàng làm tốt hay chưa tốt, tức là về chất lượng.",
"Đó là cơ hội để họ nhìn lại xem món hàng mình làm có tốt hay không.",
"Ngoài ra, họ cũng hiểu được sở thích của từng khách, chẳng hạn khách muốn loại hàng nào.",
"(Chú thích) 惹かれる: cảm thấy bị cuốn hút"],
 [2,3],[["交流","こうりゅう","giao lưu, trao đổi"],["惹かれる","ひかれる","bị thu hút"],["出来・不出来","できふでき","làm tốt hay không tốt"],["振り返る","ふりかえる","nhìn lại"]])
q(54,"Theo tác giả, vì sao mọi người tụ tập về chợ?",
 ["Vì có thể mua bán những món đồ mình thích.","Vì có thể trao đổi thông tin.","Vì đó là nơi có thể gặp nhiều người khác nhau.","Vì thích không khí vui vẻ của nơi đó."],
 "Tác giả viết chợ không chỉ là nơi mua bán mà còn có sự trao đổi nhiều thông tin (câu 2), và “chính vì bị thu hút bởi điều đó mà mọi người tụ tập” (câu 3). “Điều đó” chính là sự trao đổi thông tin, nên chọn 2.",[2,3])

# ---- (4) Email
passage(5,["(4) Dưới đây là email gửi đến nhân viên phụ trách bán hàng của một công ty.",
"Kính gửi anh Wakamura Kenji, Phòng Bán hàng Công ty cổ phần Sekano. Cảm ơn anh vẫn luôn giúp đỡ chúng tôi.",
"Chúng tôi đã nhận được bản báo giá máy photocopy sẽ giao vào ngày 10 tháng 11.",
"Sau khi kiểm tra nội dung, chúng tôi thấy ngoài tiền hàng còn có phí lắp đặt.",
"Tháng 11 là thời gian khuyến mãi miễn phí lắp đặt, nên chẳng phải không cần phải thanh toán khoản này sao?",
"Xin anh kiểm tra và liên lạc lại gấp cho chúng tôi bằng điện thoại hoặc email.",
"Việc giao máy photocopy xin vẫn thực hiện đúng như dự định.",
"Phòng Kinh doanh Công ty Harushita Shōji, Tsukishima Ryōko (ryoko_tsukishima@harushita.co.jp)"],
 [3,4,5],[["見積もり","みつもり","báo giá"],["納品","のうひん","giao hàng"],["設置費用","せっちひよう","phí lắp đặt"],["至急","しきゅう","gấp, khẩn"]])
q(55,"Email này đang hỏi về điều gì?",
 ["Có thể giao máy photocopy vào ngày 10 tháng 11 hay không.","Thời gian khuyến mãi kết thúc khi nào.","Có cần thanh toán phí lắp đặt hay không.","Khi nào sẽ nhận được liên lạc về tiền hàng."],
 "Người viết chỉ ra bản báo giá có phí lắp đặt (câu 3), nhưng tháng 11 được miễn phí nên “chẳng phải không cần trả sao?” (câu 4) và yêu cầu kiểm tra, liên lạc lại (câu 5). Vậy điều hỏi là có cần trả phí lắp đặt hay không, chọn 3. Việc giao hàng thì nhờ giữ nguyên (câu 6) nên 1 sai.",[3,4,5])

# ---- (5) Tài năng
passage(6,["(5)",
"Thông thường người ta cảm nhận tài năng của ai đó vào lúc nào nhỉ?",
"Đó là khi thấy một tác phẩm tuyệt vời, hay một công việc, một cách xử lý xuất sắc.",
"Khi nhìn thấy một người có tài, ta không phải thấy thứ gì như hào quang (chú thích 1) rồi tin chắc rằng người đó có tài.",
"Cho nên, ta nhìn vào thành quả và hành động thực tế rồi suy đoán (chú thích 2) rằng hẳn đã có tài năng làm tiền đề cho kết quả tuyệt vời ấy.",
"Do đó, không bao giờ có thể nói trước (chú thích 3) rằng ai đó có tài hay không có tài.",
"(Chú thích 1) オーラ: ở đây nghĩa là bầu không khí đặc biệt","(Chú thích 2) 類推する: ở đây nghĩa là phán đoán","(Chú thích 3) 前もって: trước, sự trước"],
 [3,4,5],[["才能","さいのう","tài năng"],["類推する","るいすいする","suy đoán, suy luận"],["前もって","まえもって","trước"],["確信する","かくしんする","tin chắc"]])
q(56,"Về tài năng, điều nào phù hợp với suy nghĩ của tác giả?",
 ["Bất kể kết quả, người có tài có thể được cảm nhận qua bầu không khí.","Nếu có bầu không khí đặc biệt và cũng tạo ra kết quả thì có thể nói là có tài.","Chỉ nhìn kết quả thì không thể phán đoán người đó có tài hay không.","Nếu không nhìn kết quả thì không thể phán đoán người đó có tài hay không."],
 "Tác giả phủ định việc cảm nhận tài năng qua “hào quang” (câu 3), nói rằng ta suy ra tài năng từ thành quả thực tế (câu 4), vì vậy không thể nói trước có tài hay không (câu 5). Tức là phải nhìn kết quả mới phán đoán được, chọn 4. Đáp án 1 và 2 dựa vào “bầu không khí” nên sai. Đáp án 3 sai vì tác giả coi kết quả chính là căn cứ để phán đoán.",[3,4,5])

# ---- 問題11 (1) Internet
passage(7,["(1)","Dưới đây là bài viết dành cho các bạn trẻ.",
"Tôi nghĩ thời gian bỏ ra (chú thích 1) để tìm hiểu, để nấu nướng, tức là độ dài của khoảng thời gian ấy, mới là điều quan trọng.",
"Khi có điều muốn biết mà không thể hiểu ngay, thắc mắc đó sẽ cứ nằm mãi trong một góc đầu óc.",
"Nó bám chặt (chú thích 2) ở đó.",
"Trong lúc chưa hiểu, trí tưởng tượng hoạt động: biết đâu là thế này, biết đâu là thế kia.",
"Nghĩ rằng đây là đáp án rồi đem ra kiểm chứng thì lại thấy khác.",
"Thế là lại tưởng tượng: biết đâu là thế này, biết đâu là thế kia…",
"Chính nhờ quá trình không biết chán (chú thích 3) này mà trí tưởng tượng được nuôi dưỡng.",
"Internet tiện lợi ở chỗ có thể nhận được đáp án ngay, nhưng mặt khác, nó làm giảm thời gian ta ôm lấy thắc mắc, tự nghĩ “tại sao nhỉ”, “hay là thế này nhỉ”, rồi tự mình suy nghĩ.",
"Như vậy thì trí tưởng tượng không có chỗ để hoạt động.",
"Cảm giác về thời gian “đáp án trả về ngay lập tức” này sẽ gây ảnh hưởng (chú thích 4) như thế nào đến con người nhỉ?",
"Hứng thú là thứ nảy sinh từ những điều chưa biết.",
"Nếu ngay từ đầu đã biết hết mọi thứ thì đó có thể trở thành đối tượng của tri thức, nhưng sẽ không trở thành đối tượng của hứng thú.",
"Chính vì có phần “chưa biết” mà ham muốn “muốn biết” mới nảy sinh.",
"(Lược bỏ)",
"Mình có thể duy trì những câu hỏi, thắc mắc trong lòng được bao lâu?",
"Tôi nghĩ chúng ta nên trân trọng hơn thói quen chịu đựng “khoảng thời gian chưa biết” này và còn biết tận hưởng nó; và tôi mong các bạn đọc trẻ hãy khắc ghi (chú thích 5) điều đó ngay từ bây giờ.",
"(Chú thích 1) 費やす: dùng, bỏ ra","(Chú thích 2) こびりつく: ở đây nghĩa là còn lại, không biến mất","(Chú thích 3) 飽くなき: ở đây nghĩa là kéo dài mãi","(Chú thích 4) 及ぼす: ở đây nghĩa là gây ra, đem lại","(Chú thích 5) 心する: ghi nhớ trong lòng"],
 [8,14,17],[["費やす","ついやす","bỏ ra, tiêu tốn"],["想像力","そうぞうりょく","trí tưởng tượng"],["養う","やしなう","nuôi dưỡng"],["抱え込む","かかえこむ","ôm lấy, gánh"],["欲求","よっきゅう","ham muốn"],["耐える","たえる","chịu đựng"]])
q(57,"Về việc tra cứu bằng Internet, tác giả nói như thế nào?",
 ["Vì cái gì cũng biết được nên người ta biết cả những điều không cần thiết.","Bị ảnh hưởng bởi thông tin có sức nặng nên không thể có suy nghĩ của riêng mình.","Không phát huy được trí tưởng tượng và có xu hướng dựa dẫm vào Internet.","Vì dễ dàng có được đáp án nên không có cơ hội để phát huy trí tưởng tượng."],
 "Tác giả nói Internet tiện vì có đáp án ngay, nhưng làm giảm thời gian tự suy nghĩ (câu 9), “như vậy thì trí tưởng tượng không có chỗ để hoạt động” (câu 10). Nên chọn 4. Đáp án 3 đảo nhân quả (không phải vì không có tưởng tượng mà dựa dẫm). Đáp án 1, 2 không được nhắc đến.",[9,10])
q(58,"Điều tác giả muốn nói là gì?",
 ["Nếu mở rộng đối tượng quan tâm thì có thể duy trì được cảm giác “muốn biết”.","Nếu cứ suy nghĩ về điều chưa hiểu thì sẽ trở nên biết tận hưởng việc suy nghĩ.","Không nên vội vàng đòi đáp án ngay mà nên tận hưởng việc tiếp tục suy nghĩ.","Để đến được đáp án đúng thì phải chịu đựng “khoảng thời gian chưa biết”."],
 "Kết luận ở câu cuối: chúng ta nên trân trọng thói quen chịu đựng “khoảng thời gian chưa biết” và còn biết tận hưởng nó (câu 17). Chọn 3, vì nhấn mạnh cả việc “không vội lấy đáp án” và “tận hưởng”. Đáp án 4 chỉ nói “chịu đựng” mà thiếu “tận hưởng”, lại gắn với mục đích đạt đáp án đúng nên sai ý.",[14,17])

# ---- (2) Nhịp sinh học
passage(8,["(2)",
"Nếu sống đều đặn trong ăn uống, ngủ nghỉ, sinh hoạt hằng ngày thì gần như đúng giờ nhất định ta sẽ thấy đói và buồn ngủ (chú thích 1); điều này là do nhịp điệu vốn có (chú thích 2) trong cơ thể sinh vật.",
"Trái đất quay một vòng trong 24 giờ nên sinh ra chu kỳ ngày và đêm, và các loài động vật hoang dã (chú thích 3) sống không đi ngược lại chu kỳ đó.",
"Động vật hoạt động ban ngày thì hoạt động vào ban ngày và nghỉ ngơi vào ban đêm, còn động vật hoạt động ban đêm thì ngược lại.",
"Con người là động vật hoạt động ban ngày, nhưng trong thời đại văn minh máy móc phát triển hiện nay, nhờ chiếu sáng có thể điều chỉnh độ sáng tối trong phòng nên trông như thể sống không liên quan đến chu kỳ (nhịp điệu) ngày đêm.",
"Tuy nhiên, nhịp điệu ngày đêm của thế giới tự nhiên ảnh hưởng đến nhịp điệu vốn có trong cơ thể người, và có những phần tình trạng cơ thể bị điều khiển (chú thích 4) không liên quan đến ý chí của bản thân.",
"Nếu gần đến giờ ăn mà không thấy đói, tôi nghĩ có nguyên nhân nào đó, chẳng hạn đã ăn quá nhiều ở bữa trước hoặc bữa ăn vặt (chú thích 5).",
"Lúc đó nếu nói “vì không muốn ăn” rồi bỏ bữa thì trước bữa tiếp theo lại đói bụng, rồi ăn gì đó, kết quả là lại không muốn ăn, và sẽ rơi vào (chú thích 6) vòng luẩn quẩn.",
"Để không như vậy, dù không thấy thèm ăn cũng nên ăn một chút để tự cho mình cảm giác “đã ăn rồi”, đặt dấu chấm hết (chú thích 7) cho bữa đó, điều này cũng quan trọng.",
"(Chú thích 1) 眠けを催す: buồn ngủ","(Chú thích 2) 備わる: vốn có sẵn","(Chú thích 3) 野生の: sống tự nhiên","(Chú thích 4) 制御する: điều khiển","(Chú thích 5) 間食: đồ ăn giữa các bữa chính","(Chú thích 6) 陥る: ở đây nghĩa là rơi vào","(Chú thích 7) けり: ở đây nghĩa là sự phân định, dấu chấm hết"],
 [4,8],[["リズム","","nhịp điệu"],["昼行性","ちゅうこうせい","hoạt động ban ngày"],["制御","せいぎょ","điều khiển, kiểm soát"],["悪循環","あくじゅんかん","vòng luẩn quẩn"],["陥る","おちいる","rơi vào"],["間食","かんしょく","ăn vặt"]])
q(59,"Về nhịp điệu của cơ thể con người, tác giả nói như thế nào?",
 ["Dù kỹ thuật chiếu sáng phát triển, có thể hoạt động bất kể ngày đêm, con người vẫn chịu ảnh hưởng của nhịp ngày đêm tự nhiên.","Do chiếu sáng làm ranh giới ngày đêm mờ đi nên con người đi ngược lại nhịp ngày đêm tự nhiên và trở nên thất thường.","Ngay cả hiện nay khi kỹ thuật phát triển, cũng như động vật, nhịp ngày đêm tự nhiên ảnh hưởng lớn hơn ý chí của bản thân.","Kết quả của sự phát triển kỹ thuật là khác với động vật, con người có thể sống mà không chịu ảnh hưởng của nhịp ngày đêm tự nhiên."],
 "Câu then chốt là câu 3 và 4: con người trông như sống không liên quan đến nhịp ngày đêm nhờ chiếu sáng, “tuy nhiên” nhịp ngày đêm tự nhiên vẫn ảnh hưởng đến nhịp vốn có của cơ thể. Chọn 1. Đáp án 2 sai (tác giả không nói cơ thể trở nên thất thường). Đáp án 3 sai vì không so sánh “ảnh hưởng của ý chí” với nhịp tự nhiên. Đáp án 4 trái ngược nội dung bài.",[3,4])
q(60,"Theo tác giả, nếu gần giờ ăn mà không thấy đói thì nên làm gì?",
 ["Không ép ăn, cố tự nghĩ rằng mình đã ăn rồi.","Suy nghĩ về nguyên nhân không thèm ăn và thử nhiều cách ăn khác nhau.","Ăn từng chút một cho đến khi có cảm giác muốn ăn.","Để có cảm giác muốn ăn, nên ăn dù chỉ một chút."],
 "Câu 8: để không rơi vào vòng luẩn quẩn thì dù không thèm ăn cũng nên ăn một chút để tự cho mình cảm giác “đã ăn”. Chọn 4: ăn dù chỉ một chút. Đáp án 1 sai vì không ăn. Đáp án 3 sai vì mục đích không phải ăn cho đến khi thèm ăn.",[7,8])

# ---- (3) Quan hệ con người
passage(9,["(3)",
"Nói là quan hệ con người nhưng có rất nhiều loại như quan hệ bạn bè, quan hệ khác giới, quan hệ gia đình.",
"Tuy nhiên, những phiền muộn liên quan đến các mối quan hệ này dường như có điểm chung.",
"Một trong số đó là trong phiền muộn về quan hệ với người khác luôn có “cảm giác không thể làm gì được bằng sức của bản thân”.",
"Phiền muộn trong quan hệ con người có khía cạnh “phụ thuộc vào đối phương” rất lớn.",
"Người ta thường có cảm giác như “nếu đối phương không thay đổi thì không thể làm gì được” hoặc “vì đối phương là người như vậy nên mình không làm được gì”.",
"(Lược bỏ) Khi cố gắng giải quyết tình trạng phụ thuộc vào đối phương, đôi khi người ta nỗ lực “thay đổi bản thân”.",
"Tuy nhiên, nếu nỗ lực thay đổi chỉ nhằm giải quyết tình huống đó thì dễ rơi vào trạng thái “đánh mất chính mình” (chú thích 1).",
"Trạng thái đánh mất bản thân lại càng khổ sở hơn, không mang lại (chú thích 2) thay đổi nào cho sự việc đang xảy ra, hoặc thậm chí có xu hướng làm nó tồi tệ hơn.",
"Có vẻ như nếu không phải là kiểu “thay đổi” trong đó ta tiếp tục tiến lên mà không đánh mất mình, trực diện suy nghĩ trăn trở rồi kết quả là bản thân tự nhiên thay đổi, thì sẽ không thành công.",
"Thực ra, sự thay đổi như vậy thường được gọi là “trưởng thành”.",
"(Chú thích 1) ~を見失う: không còn nhìn thấy ~","(Chú thích 2) もたらす: ở đây nghĩa là gây ra"],
 [3,9,10],[["悩み","なやみ","phiền muộn"],["相手しだい","あいてしだい","phụ thuộc vào đối phương"],["見失う","みうしなう","đánh mất, không còn thấy"],["もたらす","","mang lại"],["思い悩む","おもいなやむ","trăn trở"]])
q(61,"Điều chung mà tác giả nêu ra là điều nào?",
 ["Cảm thấy cả mình và đối phương đều có nguyên nhân.","Cảm thấy dường như mình không thể tự giải quyết được.","Dù nguyên nhân ở đối phương nhưng vẫn cảm thấy mình có lỗi.","Cảm thấy dù đối phương thay đổi cũng không giải quyết được."],
 "Câu 3: một điểm chung là “cảm giác không thể làm gì được bằng sức của bản thân” → chọn 2. Các đáp án khác không được nhắc đến trong bài.",[3,4])
q(62,"Điều nào phù hợp với suy nghĩ của tác giả?",
 ["Đối diện nghiêm túc với phiền muộn sẽ dẫn đến việc bản thân thay đổi.","Dù có phiền muộn, điều quan trọng là bản thân không thay đổi.","Chỉ cứ phiền muộn thì không thể làm bản thân thay đổi theo hướng tốt.","Nếu nỗ lực thay đổi bản thân thì phiền muộn sẽ tự nhiên được giải quyết."],
 "Câu 9: chỉ khi tiến lên mà không đánh mất mình, trực diện trăn trở, rồi tự nhiên thay đổi thì mới thành công; câu 10 gọi đó là “trưởng thành”. Chọn 1. Đáp án 4 sai vì tác giả nói nỗ lực thay đổi chỉ để giải quyết tình huống sẽ khiến đánh mất mình.",[9,10])

# ---- (4) Não và 150 người
passage(10,["(4)",
"Với con người, sống trong cộng đồng quy mô như thế nào là phù hợp?",
"Thực ra có một giả thuyết cho rằng điều đó có thể suy ra từ kích thước bộ não.",
"Bộ não con người sau khi tách khỏi tổ tiên chung với tinh tinh (chú thích 1) 7 triệu năm trước vẫn luôn nhỏ.",
"Mãi đến 2 triệu năm trước mới vượt quá kích thước não khỉ đột là 500cc và bắt đầu lớn lên, đến khoảng 400 đến 600 nghìn năm trước thì tăng gấp ba, đạt kích thước não người hiện đại.",
"Nhưng con người bắt đầu nói được khoảng 70 nghìn năm trước, nên có thể nói não không lớn lên do việc nói chuyện.",
"Vậy não lớn lên để làm gì?",
"Khi xem xét các đặc điểm có thể liên quan đến kích thước não ở các loài linh trưởng (chú thích 2) khác ngoài người, người ta thấy quy mô trung bình của nhóm mà mỗi loài hình thành có tương quan thuận (chú thích 3) rất rõ với kích thước não.",
"Tức là nhóm càng lớn, số bạn bè càng nhiều thì não càng lớn.",
"Áp dụng điều đó vào kích thước não người hiện đại thì thấy quy mô nhóm tương ứng với kích thước não của chúng ta là 150 người.",
"(Lược bỏ) Hiện nay chúng ta sống ở thành phố trong những cộng đồng quy mô hàng nghìn, hàng chục nghìn người, nhưng có thể số người thực sự xây dựng được quan hệ tin cậy và qua lại chỉ khoảng 150.",
"Tôi nghĩ đó là số khuôn mặt mà ta có thể nhớ ra mà không cần nhìn danh sách khi gửi thiệp chúc mừng năm mới.",
"Đó là số người được lưu giữ trong trí nhớ không phải bằng lời nói hay chữ viết, mà bằng kinh nghiệm cùng trải qua và cùng chia sẻ một điều gì đó.",
"Nói cách khác, con số đó chính là quy mô xã hội mà chúng ta muốn giữ quan hệ tốt đẹp hơn với nhau dựa trên tính tương hỗ (chú thích 4).",
"(Chú thích 1) チンパンジー: loài động vật cùng nhóm với khỉ","(Chú thích 2) 霊長類: nhóm động vật gồm khỉ và con người","(Chú thích 3) 正の相関: ở đây nghĩa là một bên tăng thì bên kia cũng tăng","(Chú thích 4) 互酬性: ở đây nghĩa là tính chất giúp đỡ lẫn nhau"],
 [8,9,11,12],[["規模","きぼ","quy mô"],["推定","すいてい","ước tính"],["霊長類","れいちょうるい","linh trưởng"],["相関","そうかん","tương quan"],["互酬性","ごしゅうせい","tính tương hỗ"],["年賀状","ねんがじょう","thiệp năm mới"]])
q(63,"Điều nào phù hợp với những gì tác giả nói về bộ não con người?",
 ["Bắt đầu lớn từ 7 triệu năm trước, và 2 triệu năm trước lớn hơn não khỉ đột.","Bắt đầu lớn từ 2 triệu năm trước, và 70 nghìn năm trước đạt kích thước bằng não người hiện đại.","Đã đạt kích thước bằng não người hiện đại trước khi bắt đầu nói.","Khi bắt đầu nói thì lớn hơn não khỉ đột."],
 "Câu 3-4: 7 triệu năm trước nhỏ; 2 triệu năm trước bắt đầu lớn; 400–600 nghìn năm trước đạt kích thước hiện đại. Câu 5: nói chuyện bắt đầu khoảng 70 nghìn năm trước. Vậy não đã đạt kích thước hiện đại trước khi biết nói, chọn 3.",[3,4,5])
q(64,"Về con số 150 người, tác giả nghĩ như thế nào?",
 ["Là số người được ghi nhớ nhờ kinh nghiệm cùng chia sẻ và có thể xây dựng quan hệ tin cậy.","Là số người cần thiết để con người sống tốt hơn.","Là số người mà ai cũng có thể quen biết trong cuộc sống ở thành phố.","Là số người có thể nhớ được nếu dùng lời nói, chữ viết và có thể giao thiệp tin cậy."],
 "Câu 12: số này là số người được lưu giữ trong trí nhớ nhờ kinh nghiệm cùng chia sẻ, “không phải bằng lời nói hay chữ viết”; câu 10: số người thực sự xây dựng quan hệ tin cậy khoảng 150. Chọn 1. Đáp án 4 trái ngược (không phải do lời nói/chữ viết).",[10,12])

# ---- 問題12 A và B
passage(11,["A",
"Kinh nghiệm thất bại rất quan trọng trong quá trình trưởng thành của trẻ.",
"Nhưng khi trẻ thất bại mà cha mẹ trách hành động của trẻ, trẻ sẽ nghĩ “mình đã làm điều xấu” và trở nên giấu thất bại.",
"Ngoài ra, cảm giác không muốn thất bại trở nên mạnh, trẻ sẽ thôi không dám thử thách.",
"Khi trẻ thất bại, thay vì trách móc, điều quan trọng là cùng trẻ suy nghĩ vì sao không làm được, làm thế nào thì sẽ thành công.",
"Nếu vẫn không biết thì có thể cho lời khuyên.",
"Nếu cùng trẻ suy nghĩ như vậy thì trẻ sẽ hình thành thói quen tự nghĩ ra bước tiếp theo.",
"Dẫn dắt để trẻ biết vận dụng kinh nghiệm thất bại vào lần sau là điều quan trọng hơn hết.",
"B",
"Trẻ vừa tích lũy kinh nghiệm thất bại vừa có được tinh thần mạnh mẽ.",
"Vì vậy, khi trẻ thất bại, điều quan trọng là cha mẹ kìm nén mong muốn giúp đỡ và quan sát.",
"Nếu cha mẹ không giúp, trẻ sẽ tự thử và sai (thử nghiệm), rồi cố nghĩ xem đã sai ở đâu và lần sau cần gì để thành công.",
"Kinh nghiệm đó làm cho tâm hồn trẻ mạnh mẽ hơn.",
"Có những bậc cha mẹ trách khi con thất bại, nhưng như vậy trẻ sẽ không còn tự tin vào hành động của mình, sợ thất bại và bỏ cuộc ngay từ trước khi thử thách.",
"Để trẻ vận dụng kinh nghiệm thất bại mà trưởng thành, cha mẹ tốt nhất là không trách cũng không đưa lời khuyên."],
 [4,10,14],[["責める","せめる","trách móc"],["試行錯誤","しこうさくご","thử và sai"],["見守る","みまもる","quan sát, dõi theo"],["チャレンジ","","thử thách"],["身につく","みにつく","trở thành thói quen, thấm vào"]])
q(65,"Về đứa trẻ bị cha mẹ trách khi thất bại, điều A và B cùng nói đến là gì?",
 ["Trẻ không còn kể với cha mẹ về thất bại.","Trẻ không còn muốn thử làm điều mới.","Trẻ không muốn thừa nhận mình đã thất bại.","Trẻ không còn tự tin vào việc mình đang làm."],
 "A (câu 3): vì không muốn thất bại nên trẻ thôi thử thách. B (câu 13): trẻ sợ thất bại và bỏ cuộc trước khi thử thách. Điểm chung: không còn muốn thử điều mới, chọn 2. Đáp án 1 chỉ có A nói (giấu thất bại), đáp án 4 chỉ có B nói (mất tự tin).",[3,13])
q(66,"Về cách cha mẹ ứng xử khi trẻ thất bại, A và B khuyên như thế nào?",
 ["Cả A và B đều nói nên để chính trẻ suy nghĩ vì sao thất bại.","Cả A và B đều nói nên cùng trẻ thử các cách cải thiện.","A nói nên cùng trẻ suy nghĩ nguyên nhân và cách cải thiện, B nói nên dõi theo để trẻ tự suy nghĩ nguyên nhân và cách cải thiện.","A nói nên cho lời khuyên cách vận dụng thất bại vào lần sau, B nói chỉ cần giúp những việc trẻ không tự xử lý được."],
 "A (câu 4): cùng trẻ suy nghĩ nguyên nhân và cách làm cho thành công. B (câu 10, 11, 14): cha mẹ kìm nén, quan sát; trẻ tự suy nghĩ; không trách cũng không khuyên. Chọn 3.",[4,10,11])

# ---- 問題13 Ca từ tình ca
passage(12,["Việc biến tình yêu thành bài hát có lợi thế đặc thù (chú thích 1) nào không?",
"Điều đáng chú ý ở đây là lời bài hát có ít thông tin.",
"Trong phim truyền hình hay tiểu thuyết có nhiều nhân vật xuất hiện, và mỗi nhân vật được phân biệt bằng các đặc trưng như tuổi, giới tính, ngoại hình, nghề nghiệp.",
"Hơn nữa, khi câu chuyện tiến triển, người ta dần biết cụ thể nhân vật này hành động ra sao trong tình huống này, có tính cách và con người như thế nào.",
"Vì vậy, lời thoại của nhân vật được thưởng thức như sự thể hiện cảm xúc của một con người đã được cụ thể hóa khá rõ.",
"Nhưng chính vì được cụ thể hóa mà sự khác biệt giữa nhân vật và người thưởng thức cũng lộ ra.",
"Cũng có khi người ta nghĩ “mình không thể đồng cảm (chú thích 2) với điều người này nói”.",
"Tất nhiên, nếu nhân vật và người thưởng thức có nhiều điểm chung thì lời thoại đó sẽ được coi như của riêng, khớp với trải nghiệm của mình.",
"Nhưng lời thoại của nhân vật chẳng có điểm chung nào với mình thì sẽ không trở thành lời nói thay (chú thích 3) cho cảm xúc của mình.",
"Ngược lại, lời bài hát tình ca (chú thích 4) cũng như lời thoại phim là sự bày tỏ (chú thích 5) cảm xúc của người khác, nhưng thông tin về người bày tỏ không nhiều.",
"Bài hát không nói ai yêu ai và hành động cụ thể ra sao, mà mô tả xu hướng chung “khi rơi vào tình yêu người ta sẽ làm những việc như thế này”.",
"Đúng là nếu biết tính cách của ca sĩ hay người viết lời thì người ta sẽ thưởng thức lời bài hát như sự bày tỏ cảm xúc của một con người cụ thể là ca sĩ hay người viết lời, nhưng khác với phim, trong tác phẩm không mô tả thông tin chi tiết về một người cụ thể nào.",
"Đúng hơn, thông tin có được từ lời tình ca là thông tin chung/trừu tượng áp dụng được cho nhiều người.",
"Và do ít thông tin như vậy nên lời tình ca dễ trở thành “của riêng mình” hơn so với lời thoại trong phim.",
"Nó trở nên dễ áp dụng vào bản thân.",
"Ở điểm đó có thể nói tình ca dễ nhận được sự đồng cảm của nhiều người hơn các loại hình nghệ thuật khác.",
"(Chú thích 1) 特有の: mang tính đặc trưng","(Chú thích 2) 共感する: có cùng cảm xúc","(Chú thích 3) 代弁する: ở đây nghĩa là nói thay","(Chú thích 4) ラブソング: bài hát về chủ đề tình yêu","(Chú thích 5) 表明する: bày tỏ"],
 [1,5,12,13,14],[["特有","とくゆう","đặc thù"],["共感","きょうかん","đồng cảm"],["代弁","だいべん","nói thay"],["私物化","しぶつか","coi như của riêng"],["抽象的","ちゅうしょうてき","trừu tượng"],["表明","ひょうめい","bày tỏ"]])
q(67,"Về phim truyền hình và tiểu thuyết, tác giả nói như thế nào?",
 ["Khi câu chuyện tiến triển thì không thể hiểu cảm xúc của nhân vật.","Cảm xúc nhân vật được ưu tiên hơn bối cảnh và hành động nên lại khó hiểu.","Vì cảm xúc nhân vật được mô tả cụ thể nên diễn biến câu chuyện dễ hiểu.","Vì nhân vật được mô tả chi tiết nên có thể hình dung cụ thể từng nhân vật."],
 "Câu 2 và 3: có nhiều nhân vật, được phân biệt bằng đặc điểm, và khi truyện tiến triển, tính cách, con người được làm rõ cụ thể. Chọn 4. Đáp án 3 sai vì tác giả không nói về “độ dễ hiểu của diễn biến”.",[2,3])
q(68,"Theo tác giả, so với lời tình ca, nhược điểm của lời thoại trong phim và tiểu thuyết là gì?",
 ["Nếu người thưởng thức không có cùng cảm xúc với nhân vật thì không hiểu được tác phẩm.","Chú ý quá nhiều vào cảm xúc nhân vật nên người thưởng thức không nhận ra điểm chung với mình.","Nếu không có điểm chung với nhân vật thì người thưởng thức không thể có cùng cảm xúc với nhân vật.","Dù có nhiều điểm chung với nhân vật thì người thưởng thức vẫn khó hiểu cảm xúc của nhân vật."],
 "Câu 5–8: vì được cụ thể hóa nên sự khác biệt giữa nhân vật và người xem lộ rõ; lời thoại của nhân vật không có điểm chung với mình thì không nói thay được cảm xúc của mình. Chọn 3: không có điểm chung thì không thể cùng cảm xúc.",[5,6,8])
q(69,"Về lời bài hát tình ca, tác giả nghĩ như thế nào?",
 ["Thông tin về ca sĩ và người viết lời càng ít thì người nghe càng dễ hiểu như chuyện của mình.","Khó hình dung một nhân vật cụ thể nên người nghe có thể tự do đặt cảm xúc của mình vào.","Điều cụ thể được người nghe chấp nhận hơn điều trừu tượng.","Trải nghiệm chung được mô tả chi tiết nên người nghe cảm thấy gần gũi."],
 "Câu 12–14: thông tin trong lời bài hát chung, trừu tượng; do ít thông tin nên dễ “của riêng”, dễ áp dụng vào bản thân. Chọn 2. Đáp án 1 sai vì không nói “thông tin về ca sĩ” là yếu tố (tác giả nói không mô tả người cụ thể trong tác phẩm). Đáp án 3 ngược; đáp án 4 sai vì không mô tả chi tiết.",[12,13,14])

# ---- 問題14 Thông tin tàu
Pjs=[{'ja':'丸山汽船 岩根島への船の旅 運賃と予約のご案内','vi':'Maruyama Kisen — Chuyến tàu đến đảo Iwane: hướng dẫn giá vé và đặt chỗ','p':1},
{'ja':'運賃(片道、消費税込み)','vi':'Giá vé (một chiều, đã gồm thuế tiêu thụ)','p':1},
{'ja':'赤木港〜岩根島(糸見港): 大人 特等4,600円 1等3,500円 2等2,460円 / 子供 特等2,300円 1等1,750円 2等1,230円','vi':'Cảng Akagi – đảo Iwane (cảng Itomi): người lớn hạng đặc biệt 4.600 yên, hạng 1 là 3.500 yên, hạng 2 là 2.460 yên; trẻ em lần lượt 2.300 / 1.750 / 1.230 yên.','p':1},
{'ja':'夏野港〜岩根島(糸見港): 大人 特等7,300円 1等5,020円 2等2,960円 / 子供 特等3,650円 1等2,510円 2等1,480円','vi':'Cảng Natsuno – đảo Iwane (cảng Itomi): người lớn hạng đặc biệt 7.300 yên, hạng 1 là 5.020 yên, hạng 2 là 2.960 yên; trẻ em lần lượt 3.650 / 2.510 / 1.480 yên.'},
{'ja':'特等と1等はいすの席です。2等はいすの席はなく、じゅうたんの大部屋です。','vi':'Hạng đặc biệt và hạng 1 là ghế ngồi. Hạng 2 không có ghế, là phòng lớn trải thảm.','p':1},
{'ja':'大人運賃は、12歳以上の方の運賃です。子供運賃は、6歳以上12歳未満の方の運賃です。6歳未満のお子様は無料です。','vi':'Giá người lớn dành cho người từ 12 tuổi trở lên. Giá trẻ em dành cho trẻ từ 6 đến dưới 12 tuổi. Trẻ dưới 6 tuổi được miễn phí.'},
{'ja':'予約: 丸山汽船本社、または、ご出発の港の発着所にお電話ください。','vi':'Đặt chỗ: xin gọi điện đến trụ sở Maruyama Kisen hoặc điểm đón tàu tại cảng khởi hành.','p':1},
{'ja':'予約の受付は、出発日の1か月前から、出発日の前営業日までです。','vi':'Nhận đặt chỗ từ 1 tháng trước ngày khởi hành đến ngày làm việc trước ngày khởi hành.'},
{'ja':'丸山汽船本社(平日9時〜17時30分、土曜9時〜12時、日曜休み)/ 赤木港発着所(毎日9時〜17時)/ 夏野港発着所(毎日9時〜17時30分)/ 岩根島(糸見港)発着所(毎日9時〜17時)','vi':'Trụ sở Maruyama Kisen (ngày thường 9:00–17:30, thứ Bảy 9:00–12:00, Chủ nhật nghỉ); điểm đón tàu cảng Akagi (hằng ngày 9:00–17:00); cảng Natsuno (hằng ngày 9:00–17:30); đảo Iwane (cảng Itomi) (hằng ngày 9:00–17:00).'},
{'ja':'運賃は、当日乗船受付窓口でお支払いください。現金かクレジットカードがご利用いただけます。','vi':'Giá vé xin thanh toán tại quầy tiếp nhận lên tàu vào ngày đi, có thể dùng tiền mặt hoặc thẻ tín dụng.','p':1}]
passage(13,None,[3,4],[["片道","かたみち","một chiều"],["運賃","うんちん","giá vé, cước"],["営業日","えいぎょうび","ngày làm việc"],["発着所","はっちゃくじょ","điểm đón/trả tàu"]],s=Pjs)
q(70,"Anh Nakamura muốn đi từ cảng Natsuno đến đảo Iwane cùng con gái 4 tuổi, muốn đi rẻ nhất có thể nhưng muốn ngồi ghế. Tổng giá vé của hai người là bao nhiêu?",
 ["Anh Nakamura 2.960 yên, con gái 1.480 yên","Anh Nakamura 2.960 yên, con gái miễn phí","Anh Nakamura 5.020 yên, con gái 2.510 yên","Anh Nakamura 5.020 yên, con gái miễn phí"],
 "Muốn có ghế thì phải chọn hạng 1 trở lên (hạng 2 không có ghế); rẻ nhất là hạng 1. Cảng Natsuno hạng 1 người lớn 5.020 yên. Con gái 4 tuổi (dưới 6 tuổi) được miễn phí. Chọn 4.",[3,4])
q(71,"Anh Yuki định đi đảo Iwane bằng tàu khởi hành từ cảng Akagi vào thứ Hai ngày 22 tháng 10. Cách đặt chỗ nào là đúng?",
 ["Gọi điện đến trụ sở Maruyama Kisen trước 17:30 thứ Bảy ngày 20 tháng 10.","Gọi điện đến điểm đón tàu cảng Akagi trước 17:30 thứ Bảy ngày 20 tháng 10.","Gọi điện đến trụ sở Maruyama Kisen trước 17:00 Chủ nhật ngày 21 tháng 10.","Gọi điện đến điểm đón tàu cảng Akagi trước 17:00 Chủ nhật ngày 21 tháng 10."],
 "Đặt chỗ nhận đến ngày làm việc trước ngày khởi hành. Trụ sở Maruyama nghỉ Chủ nhật, thứ Bảy chỉ làm đến 12:00 nên đáp án 1 và 3 loại. Điểm đón tàu cảng Akagi làm việc hằng ngày 9:00–17:00, nên chỉ cần gọi trước 17:00 Chủ nhật 21/10 (đáp án 4). Đáp án 2 sai vì cảng Akagi chỉ mở đến 17:00 chứ không phải 17:30.",[3,4])

out={'p':P,'q':Q}
json.dump(out,open('/home/claude/site/site/shiken/data/vi/n2-2025-12.json','w'),ensure_ascii=False,separators=(',',':'))
print(len(P),len(Q))
