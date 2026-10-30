/* Super Bunpou - Thể động từ: danh mục, lý thuyết, công cụ chia thể và luyện tập 4 dạng */
(() => {
  "use strict";
  const { S, P, mark, stateOf, esc, jp, rich, kana, plain, speak, toast, $, $$, shuffle, band, lvtag, ICON_SPEAK, ICON_FLIP, celebrate, wobble, verdict, glow, buzz, pickWord, verdictHTML, doneHTML, afterDone, romaji, meter, calm } = SB;
  const main = $("#main");

  /* ---------------- từ mẫu: động từ (kind v; nhóm 1 五段, 2 一段, 3 bất quy tắc), tính từ い (i), tính từ な (na), danh từ (n) */
  const V = `書[か]く|viết|1|5;行[い]く|đi|1|5;泳[およ]ぐ|bơi|1|5;話[はな]す|nói chuyện|1|5;待[ま]つ|đợi|1|5;死[し]ぬ|chết|1|5;遊[あそ]ぶ|chơi|1|5;読[よ]む|đọc|1|5;帰[かえ]る|trở về|1|5;買[か]う|mua|1|5;会[あ]う|gặp|1|5;飲[の]む|uống|1|5;聞[き]く|nghe, hỏi|1|5;呼[よ]ぶ|gọi|1|5;取[と]る|lấy|1|5;使[つか]う|dùng|1|5;急[いそ]ぐ|vội|1|4;貸[か]す|cho mượn|1|5;乗[の]る|đi (xe)|1|5;作[つく]る|làm, tạo|1|5;入[はい]る|vào|1|5;走[はし]る|chạy|1|5;洗[あら]う|rửa|1|4;歩[ある]く|đi bộ|1|5;思[おも]う|nghĩ|1|4;持[も]つ|cầm, mang|1|5;頼[たの]む|nhờ|1|4;言[い]う|nói|1|5;知[し]る|biết|1|5;もらう|nhận|1|5;ある|có (vật)|1|5;切[き]る|cắt|1|5;食[た]べる|ăn|2|5;見[み]る|nhìn|2|5;起[お]きる|thức dậy|2|5;寝[ね]る|ngủ|2|5;開[あ]ける|mở|2|5;閉[し]める|đóng|2|5;教[おし]える|dạy|2|5;覚[おぼ]える|nhớ|2|5;着[き]る|mặc|2|5;借[か]りる|mượn|2|5;降[お]りる|xuống (xe)|2|5;出[で]る|ra|2|5;忘[わす]れる|quên|2|4;考[かんが]える|suy nghĩ|2|4;始[はじ]める|bắt đầu|2|4;決[き]める|quyết định|2|4;答[こた]える|trả lời|2|4;浴[あ]びる|tắm (vòi)|2|5;いる|có, ở (người)|2|5;くれる|cho (tôi)|2|5;あげる|cho, tặng|2|5;見[み]せる|cho xem|2|5;する|làm|3|5;勉強[べんきょう]する|học|3|5;散歩[さんぽ]する|đi dạo|3|5;連絡[れんらく]する|liên lạc|3|4;来[く]る|đến|3|5`
    .split(";").map(s => { const [w, vi, g, lv] = s.split("|"); return { kind: "v", w: w.replace(/\s/g, ""), vi, g: +g, lv: "n" + lv, kuru: w.startsWith("来"), suru: +g === 3 && w.endsWith("する") }; });
  V.forEach(v => { v.tricky = ["帰[かえ]る", "入[はい]る", "走[はし]る", "行[い]く", "切[き]る", "知[し]る"].includes(v.w); });
  const mk = (kind, str) => str.split(";").map(s => { const [w, vi, lv] = s.split("|"); return { kind, w, vi, lv: "n" + lv, ii: w === "いい", g: 0 }; });
  const AI = mk("i", "高[たか]い|cao, đắt|5;安[やす]い|rẻ|5;大[おお]きい|to, lớn|5;小[ちい]さい|nhỏ|5;新[あたら]しい|mới|5;古[ふる]い|cũ|5;暑[あつ]い|nóng (thời tiết)|5;寒[さむ]い|lạnh|5;面白[おもしろ]い|thú vị|5;忙[いそが]しい|bận|5;美味[おい]しい|ngon|5;楽[たの]しい|vui|5;難[むずか]しい|khó|5;易[やさ]しい|dễ|5;悪[わる]い|xấu, tệ|5;いい|tốt|5;長[なが]い|dài|5;早[はや]い|sớm, nhanh|5;遠[とお]い|xa|5;近[ちか]い|gần|5;多[おお]い|nhiều|5;少[すく]ない|ít|5;強[つよ]い|mạnh|4;重[おも]い|nặng|4;眠[ねむ]い|buồn ngủ|4;痛[いた]い|đau|4;若[わか]い|trẻ|4;厳[きび]しい|nghiêm khắc|3");
  const ANA = mk("na", "静[しず]か|yên tĩnh|5;便利[べんり]|tiện lợi|5;有名[ゆうめい]|nổi tiếng|5;元気[げんき]|khoẻ|5;きれい|đẹp, sạch|5;親切[しんせつ]|tử tế|5;上手[じょうず]|giỏi|5;好[す]き|thích|5;嫌[きら]い|ghét|5;大切[たいせつ]|quan trọng|4;大変[たいへん]|vất vả|4;丈夫[じょうぶ]|bền, khoẻ|4;暇[ひま]|rảnh|5;簡単[かんたん]|đơn giản|4;複雑[ふくざつ]|phức tạp|3;安全[あんぜん]|an toàn|4;自由[じゆう]|tự do|4;不便[ふべん]|bất tiện|4;賑[にぎ]やか|náo nhiệt|4;真面目[まじめ]|nghiêm túc|4");
  const NN = mk("n", "学生[がくせい]|sinh viên|5;先生[せんせい]|giáo viên|5;雨[あめ]|mưa|5;休[やす]み|nghỉ|5;病気[びょうき]|bệnh|5;日曜日[にちようび]|chủ nhật|5;会社員[かいしゃいん]|nhân viên công ty|5;医者[いしゃ]|bác sĩ|5;天気[てんき]|thời tiết|5;友達[ともだち]|bạn bè|5;本[ほん]|sách|5;留学生[りゅうがくせい]|du học sinh|4;独身[どくしん]|độc thân|3;禁煙[きんえん]|cấm hút thuốc|3");
  const ALL = [...V, ...AI, ...ANA, ...NN];

  /* ---------------- bộ máy chia */
  const ROW = {
    a: { う: "わ", く: "か", ぐ: "が", す: "さ", つ: "た", ぬ: "な", ぶ: "ば", む: "ま", る: "ら" },
    i: { う: "い", く: "き", ぐ: "ぎ", す: "し", つ: "ち", ぬ: "に", ぶ: "び", む: "み", る: "り" },
    e: { う: "え", く: "け", ぐ: "げ", す: "せ", つ: "て", ぬ: "ね", ぶ: "べ", む: "め", る: "れ" },
    o: { う: "お", く: "こ", ぐ: "ご", す: "そ", つ: "と", ぬ: "の", ぶ: "ぼ", む: "も", る: "ろ" }
  };
  function te(v) {
    const w = v.w, H = w.slice(0, -1), c = w.slice(-1);
    if (v.kuru) return "来[き]て"; if (v.suru) return w.slice(0, -2) + "して"; if (v.g === 2) return H + "て";
    if ("うつる".includes(c)) return H + "って";
    if ("むぶぬ".includes(c)) return H + "んで";
    if (c === "く") return w === "行[い]く" ? H + "って" : H + "いて";
    if (c === "ぐ") return H + "いで";
    return H + "して";
  }
  const ta = v => te(v).replace(/て$/, "た").replace(/で$/, "だ");
  function B(v, o) { // o: g1(H,c), g2(H), suru(HS), kuru()
    const w = v.w;
    if (v.kuru) return o.kuru; if (v.suru) return o.suru(w.slice(0, -2)); if (v.g === 2) return o.g2(w.slice(0, -1));
    return o.g1(w.slice(0, -1), w.slice(-1));
  }
  const nai = v => v.w === "ある" ? "な" + "い" : B(v, { g1: (H, c) => H + ROW.a[c] + "ない", g2: H => H + "ない", suru: S0 => S0 + "しない", kuru: "来[こ]ない" });
  const stemI = v => B(v, { g1: (H, c) => H + ROW.i[c], g2: H => H, suru: S0 => S0 + "し", kuru: "来[き]" });
  // ない形 bỏ ない: dùng cho ぬ, ん, ざる
  const naiStem = v => v.w === "ある" ? "あら" : B(v, { g1: (H, c) => H + ROW.a[c], g2: H => H, suru: S0 => S0 + "せ", kuru: "来[こ]" });
  const sub = (s, a, b) => s.replace(a, b);
  const iS = v => v.ii ? "よ" : v.w === "ない" ? "な" : v.w.slice(0, -1);   // gốc tính từ い
  // kính ngữ (尊敬語 / 謙譲語): bảng động từ đặc biệt; null = không dùng được
  const SK = { "行[い]く": ["いらっしゃる", "おいでになる"], "来[く]る": ["いらっしゃる", "お越[こ]しになる"], "いる": ["いらっしゃる", "おいでになる"], "食[た]べる": ["召[め]し上[あ]がる"], "飲[の]む": ["召[め]し上[あ]がる"], "言[い]う": ["おっしゃる"], "見[み]る": ["ご覧[らん]になる"], "する": ["なさる"], "くれる": ["くださる"], "知[し]る": ["ご存[ぞん]じだ"], "着[き]る": ["お召[め]しになる"], "寝[ね]る": ["お休[やす]みになる"], "死[し]ぬ": ["お亡[な]くなりになる"], "ある": null, "あげる": null, "もらう": null };
  const KJ = { "行[い]く": ["参[まい]る", "伺[うかが]う"], "来[く]る": ["参[まい]る"], "いる": ["おる"], "食[た]べる": ["いただく"], "飲[の]む": ["いただく"], "言[い]う": ["申[もう]す", "申[もう]し上[あ]げる"], "見[み]る": ["拝見[はいけん]する"], "する": ["いたす"], "聞[き]く": ["伺[うかが]う", "お聞[き]きする"], "会[あ]う": ["お目[め]にかかる", "お会[あ]いする"], "知[し]る": ["存[ぞん]じる", "存[ぞん]じ上[あ]げる"], "あげる": ["差[さ]し上[あ]げる"], "もらう": ["いただく"], "頼[たの]む": ["お願[ねが]いする"], "連絡[れんらく]する": ["ご連絡[れんらく]する", "連絡[れんらく]いたす"] };
  const KJ_GEN = ["待[ま]つ", "持[も]つ", "貸[か]す", "借[か]りる", "呼[よ]ぶ", "取[と]る", "作[つく]る", "教[おし]える", "読[よ]む", "見[み]せる", "開[あ]ける", "切[き]る"];
  const keigo = (tab, gen) => v => {
    if (Object.prototype.hasOwnProperty.call(tab, v.w)) return tab[v.w];
    if (v.suru) return tab === SK ? [v.w.slice(0, -2) + "なさる"] : [v.w.slice(0, -2) + "いたす"];
    return gen(v);
  };
  const skF = keigo(SK, v => v.w === "死[し]ぬ" ? null : ["お" + stemI(v) + "になる"]);
  const kjF = keigo(KJ, v => KJ_GEN.includes(v.w) ? ["お" + stemI(v) + "する"] : null);
  const shrink = (v, a, b) => { const t = te(v); return t.endsWith("で") ? t.slice(0, -1) + b : t.slice(0, -1) + a; };
  const Fm = (v, st, ...r) => [st(v), ...r.map(x => x(v))];

  /* f: dạng cho động từ; a: {i, na, n} cho tính từ い / な / danh từ (trả về chuỗi hoặc [chính, ...cũng đúng]);
     lab: tên gọi khi áp dụng cho tính từ / danh từ; alts: đáp án thay thế cho động từ */
  const FORMS = [
    { id: "masu", ja: "ます形", vi: "Thể lịch sự", lv: "n5", f: v => stemI(v) + "ます", a: { i: v => v.w + "です", na: v => v.w + "です", n: v => v.w + "です" }, lab: ["です形", "Lịch sự hiện tại (です)"] },
    { id: "jisho", ja: "辞書形", vi: "Thể từ điển", lv: "n5", f: v => v.w },
    { id: "nai", ja: "ない形", vi: "Thể phủ định", lv: "n5", f: nai,
      a: { i: v => iS(v) + "くない", na: v => [v.w + "ではない", v.w + "じゃない"], n: v => [v.w + "ではない", v.w + "じゃない"] }, lab: ["否定形", "Phủ định (thể thường)"] },
    { id: "nakatta", ja: "なかった形", vi: "Phủ định quá khứ", lv: "n5", f: v => nai(v).replace(/い$/, "かった"),
      a: { i: v => iS(v) + "くなかった", na: v => [v.w + "ではなかった", v.w + "じゃなかった"], n: v => [v.w + "ではなかった", v.w + "じゃなかった"] }, lab: ["過去否定形", "Phủ định quá khứ (thể thường)"] },
    { id: "ta", ja: "た形", vi: "Thể quá khứ", lv: "n5", f: ta,
      a: { i: v => iS(v) + "かった", na: v => v.w + "だった", n: v => v.w + "だった" }, lab: ["過去形", "Quá khứ (thể thường)"] },
    { id: "te", ja: "て形", vi: "Thể て", lv: "n5", f: te,
      a: { i: v => iS(v) + "くて", na: v => v.w + "で", n: v => v.w + "で" } },
    { id: "masen", ja: "ません形", vi: "Phủ định lịch sự", lv: "n5", f: v => stemI(v) + "ません",
      a: { i: v => [iS(v) + "くありません", iS(v) + "くないです"], na: v => [v.w + "ではありません", v.w + "じゃありません"], n: v => [v.w + "ではありません", v.w + "じゃありません"] }, lab: ["丁寧否定形", "Phủ định lịch sự (ありません)"] },
    { id: "mashita", ja: "ました形", vi: "Quá khứ lịch sự", lv: "n5", f: v => stemI(v) + "ました",
      a: { i: v => iS(v) + "かったです", na: v => v.w + "でした", n: v => v.w + "でした" }, lab: ["丁寧過去形", "Quá khứ lịch sự (でした)"] },
    { id: "masendeshita", ja: "ませんでした形", vi: "Phủ định quá khứ lịch sự", lv: "n5", f: v => stemI(v) + "ませんでした",
      a: { i: v => [iS(v) + "くありませんでした", iS(v) + "くなかったです"], na: v => [v.w + "ではありませんでした", v.w + "じゃありませんでした"], n: v => [v.w + "ではありませんでした", v.w + "じゃありませんでした"] }, lab: ["丁寧過去否定形", "Phủ định quá khứ lịch sự"] },
    { id: "adv", ja: "副詞形", vi: "Thể trạng từ (く / に)", lv: "n5", a: { i: v => iS(v) + "く", na: v => v.w + "に" } },
    { id: "rentai", ja: "連体形", vi: "Bổ nghĩa danh từ (い / な / の)", lv: "n5", a: { i: v => v.w, na: v => v.w + "な", n: v => v.w + "の" } },
    { id: "tai", ja: "たい形", vi: "Thể muốn làm", lv: "n5", f: v => stemI(v) + "たい" },
    { id: "kano", ja: "可能形", vi: "Thể khả năng", lv: "n4", f: v => B(v, { g1: (H, c) => H + ROW.e[c] + "る", g2: H => H + "られる", suru: S0 => S0 + "できる", kuru: "来[こ]られる" }) },
    { id: "ukemi", ja: "受身形", vi: "Thể bị động", lv: "n4", f: v => B(v, { g1: (H, c) => H + ROW.a[c] + "れる", g2: H => H + "られる", suru: S0 => S0 + "される", kuru: "来[こ]られる" }) },
    { id: "shieki", ja: "使役形", vi: "Thể sai khiến", lv: "n4", f: v => B(v, { g1: (H, c) => H + ROW.a[c] + "せる", g2: H => H + "させる", suru: S0 => S0 + "させる", kuru: "来[こ]させる" }) },
    { id: "ikou", ja: "意向形", vi: "Thể ý chí", lv: "n4", f: v => B(v, { g1: (H, c) => H + ROW.o[c] + "う", g2: H => H + "よう", suru: S0 => S0 + "しよう", kuru: "来[こ]よう" }) },
    { id: "meirei", ja: "命令形", vi: "Thể mệnh lệnh", lv: "n4", f: v => B(v, { g1: (H, c) => H + ROW.e[c], g2: H => H + "ろ", suru: S0 => S0 + "しろ", kuru: "来[こ]い" }) },
    { id: "kinshi", ja: "禁止形", vi: "Thể cấm chỉ", lv: "n4", f: v => v.w + "な" },
    { id: "ba", ja: "条件形（ば）", vi: "Thể điều kiện ば", lv: "n4", f: v => B(v, { g1: (H, c) => H + ROW.e[c] + "ば", g2: H => H + "れば", suru: S0 => S0 + "すれば", kuru: "来[く]れば" }),
      a: { i: v => iS(v) + "ければ", na: v => [v.w + "ならば", v.w + "であれば", v.w + "なら"], n: v => [v.w + "ならば", v.w + "であれば", v.w + "なら"] } },
    { id: "tara", ja: "たら形", vi: "Thể điều kiện たら", lv: "n4", f: v => ta(v) + "ら", a: { i: v => iS(v) + "かったら", na: v => v.w + "だったら", n: v => v.w + "だったら" } },
    { id: "tari", ja: "たり形", vi: "Thể liệt kê たり", lv: "n4", f: v => ta(v) + "り", a: { i: v => iS(v) + "かったり", na: v => v.w + "だったり", n: v => v.w + "だったり" } },
    { id: "nasai", ja: "なさい形", vi: "Thể chỉ thị nhẹ", lv: "n4", f: v => stemI(v) + "なさい" },
    { id: "daro", ja: "推量形", vi: "Thể phỏng đoán (だろう)", lv: "n4", f: v => [v.w + "だろう", v.w + "でしょう"], a: { i: v => [v.w + "だろう", v.w + "でしょう"], na: v => [v.w + "だろう", v.w + "でしょう"], n: v => [v.w + "だろう", v.w + "でしょう"] } },
    { id: "sou", ja: "様態形（そう）", vi: "Có vẻ (そう)", lv: "n4", f: v => stemI(v) + "そう",
      a: { i: v => v.ii || v.w === "少[すく]ない" ? iS(v) + "さそう" : iS(v) + "そう", na: v => v.w + "そう" } },
    { id: "sugiru", ja: "すぎる形", vi: "Quá mức (すぎる)", lv: "n4", f: v => stemI(v) + "すぎる", a: { i: v => iS(v) + "すぎる", na: v => v.w + "すぎる" } },
    { id: "sonkei", ja: "尊敬形", vi: "Kính ngữ tôn kính", lv: "n4", f: v => { const r = skF(v); return r && r[0]; }, alts: v => (skF(v) || []).slice(1) },
    { id: "kenjo", ja: "謙譲形", vi: "Kính ngữ khiêm nhường", lv: "n4", f: v => { const r = kjF(v); return r && r[0]; }, alts: v => (kjF(v) || []).slice(1) },
    { id: "renyo", ja: "連用形", vi: "Thể liên dụng (gốc ます)", lv: "n3", f: stemI },
    { id: "zu", ja: "ず形", vi: "Thể phủ định ず", lv: "n3", f: v => naiStem(v) + "ず" },
    { id: "shiekiuke", ja: "使役受身形", vi: "Thể sai khiến bị động", lv: "n3", f: v => B(v, { g1: (H, c) => H + ROW.a[c] + "せられる", g2: H => H + "させられる", suru: S0 => S0 + "させられる", kuru: "来[こ]させられる" }),
      alts: v => (!v.suru && !v.kuru && v.g === 1 && v.w.slice(-1) !== "す") ? [v.w.slice(0, -1) + ROW.a[v.w.slice(-1)] + "される"] : [] },
    { id: "sa", ja: "名詞化（さ）", vi: "Danh từ hoá (さ)", lv: "n3", a: { i: v => iS(v) + "さ", na: v => v.w + "さ" } },
    { id: "chau", ja: "ちゃう形", vi: "Rút gọn てしまう", lv: "n3", f: v => shrink(v, "ちゃう", "じゃう") },
    { id: "toku", ja: "とく形", vi: "Rút gọn ておく", lv: "n3", f: v => shrink(v, "とく", "どく") },
    { id: "teru", ja: "てる形", vi: "Rút gọn ている", lv: "n3", f: v => shrink(v, "てる", "でる") },
    { id: "mai", ja: "まい形", vi: "Phủ định ý chí / phỏng đoán (まい)", lv: "n2",
      f: v => B(v, { g1: () => v.w + "まい", g2: H => H + "まい", suru: S0 => S0 + "するまい", kuru: "来[く]るまい" }),
      alts: v => v.g === 2 ? [v.w + "まい"] : v.suru ? [v.w.slice(0, -2) + "しまい", v.w.slice(0, -2) + "すまい"] : v.kuru ? ["来[こ]まい"] : [] },
    { id: "maika", ja: "まいか形", vi: "…まいか (có nên không / phải chăng)", lv: "n2",
      f: v => B(v, { g1: () => v.w + "まいか", g2: H => H + "まいか", suru: S0 => S0 + "するまいか", kuru: "来[く]るまいか" }),
      alts: v => v.g === 2 ? [v.w + "まいか"] : v.suru ? [v.w.slice(0, -2) + "しまいか", v.w.slice(0, -2) + "すまいか"] : v.kuru ? ["来[こ]まいか"] : [] },
    { id: "zaru", ja: "ざる形", vi: "Phủ định cổ (ざる)", lv: "n2", f: v => naiStem(v) + "ざる" },
    { id: "beki", ja: "べき形", vi: "Nên / cần phải (べき)", lv: "n2",
      f: v => v.suru ? v.w.slice(0, -2) + "するべき" : v.w + "べき", alts: v => v.suru ? [v.w.slice(0, -2) + "すべき"] : [] },
    { id: "nu", ja: "ぬ形", vi: "Phủ định văn viết (ぬ)", lv: "n1", f: v => naiStem(v) + "ぬ" },
    { id: "nn", ja: "ん形", vi: "Phủ định rút gọn (ん)", lv: "n1", f: v => naiStem(v) + "ん" }
  ];
  const FM = Object.fromEntries(FORMS.map(f => [f.id, f]));
  const norm = r => r == null ? null : Array.isArray(r) ? (r[0] ? { s: r[0], alts: r.slice(1) } : null) : { s: r, alts: [] };
  const NOF = { "ある": "kano ukemi shieki meirei kinshi tai nasai shiekiuke ikou sonkei kenjo toku", "死[し]ぬ": "kano shieki meirei kinshi tai nasai shiekiuke toku", "いる": "meirei kinshi", "くれる": "kano shieki ukemi" };
  const conj = (f, v) => {
    if (NOF[v.w] && NOF[v.w].split(" ").includes(f.id)) return null;
    if (v.kind === "v") { const s = f.f ? f.f(v) : null; if (!s) return null; const al = f.alts ? f.alts(v) : []; return Array.isArray(s) ? { s: s[0], alts: [...s.slice(1), ...al] } : { s, alts: al }; }
    const fn = f.a && f.a[v.kind]; return fn ? norm(fn(v)) : null;
  };
  const kinds = f => ["v", "i", "na", "n"].filter(k => k === "v" ? !!f.f : !!(f.a && f.a[k]));
  const lab = (f, v) => v.kind !== "v" && f.lab ? { ja: f.lab[0], vi: f.lab[1] } : { ja: f.ja, vi: f.vi };
  const GN = { 1: "Nhóm 1 (五段)", 2: "Nhóm 2 (一段)", 3: "Nhóm 3 (bất quy tắc)" };
  const KN = { i: "Tính từ い", na: "Tính từ な", n: "Danh từ" };
  const kindOf = v => v.kind === "v" ? GN[v.g] : KN[v.kind];
  const kindKey = v => v.kind === "v" ? "v" + v.g : v.kind;

  /* ---------------- nội dung lý thuyết */
  const T = {
    masu: { sum: "Dạng lịch sự, dùng khi nói chuyện với người lạ, cấp trên, trong thông báo và văn bản trang trọng.",
      how: ["Nhóm 1: đổi âm cuối hàng う sang hàng い, thêm ます. 書く → 書き + ます.", "Nhóm 2: bỏ る, thêm ます. 食べる → 食べ + ます.", "Nhóm 3: します, 来ます (きます)."],
      use: ["Câu khẳng định lịch sự: ~ます. Phủ định: ~ません. Quá khứ: ~ました. Phủ định quá khứ: ~ませんでした.", "Đứng trước các mẫu như ~たい, ~ながら, ~に行く (gốc ます)."],
      ex: [["毎朝[まいあさ]、コーヒーを{飲[の]みます}。", "Sáng nào tôi cũng uống cà phê."], ["昨日[きのう]は何[なに]も{食[た]べませんでした}。", "Hôm qua tôi không ăn gì cả."]], note: ["Gốc ます (bỏ ます) là nền cho たい, なさい, ながら, そう, すぎる…"] },
    jisho: { sum: "Dạng nguyên thể trong từ điển, cũng là dạng thường (suồng sã) hiện tại, khẳng định.",
      how: ["Không biến đổi. Nhóm 1 kết thúc bằng âm hàng う; nhóm 2 kết thúc bằng いる hoặc える (phần lớn); nhóm 3 là する và 来る."],
      use: ["Nói thân mật với bạn bè, người nhà: 毎日[まいにち]走[はし]る.", "Đứng trước danh từ: 読[よ]む本[ほん] (cuốn sách sẽ đọc).", "Đi với ことができる, つもり, 予定[よてい]…, ために, まえに."],
      ex: [["明日[あした]は早[はや]く{起[お]きる}つもりです。", "Ngày mai tôi định dậy sớm."], ["日本語[にほんご]を{話[はな]す}ことができます。", "Tôi nói được tiếng Nhật."]], note: ["Cách phân biệt nhóm 2 và nhóm 1: 帰る、入る、走る、切る、知る… trông như nhóm 2 nhưng thuộc nhóm 1."] },
    nai: { sum: "Dạng phủ định thường, tương ứng với ません ở thể lịch sự.",
      how: ["Nhóm 1: đổi âm cuối sang hàng あ, thêm ない. 書く → 書かない. Riêng う → わ: 買う → 買わない.", "Nhóm 2: bỏ る, thêm ない. 食べる → 食べない.", "Nhóm 3: しない, 来ない (こない). Đặc biệt: ある → ない."],
      use: ["Phủ định thân mật: 今日[きょう]は行[い]かない.", "Gốc cho ~ないで、~なければならない、~ないほうがいい、~なくてもいい."],
      ex: [["今日[きょう]は学校[がっこう]に{行[い]かない}。", "Hôm nay tôi không đến trường."], ["お酒[さけ]は{飲[の]まない}ほうがいいですよ。", "Bạn không nên uống rượu."]], note: ["ない chia như tính từ い: ない・なかった・なくて・なければ."] },
    nakatta: { sum: "Phủ định ở quá khứ, dạng thường.",
      how: ["Lấy ない形, đổi い thành かった. 書かない → 書かなかった. 食べない → 食べなかった."],
      use: ["Kể chuyện thân mật: 昨日[きのう]は何[なに]も食[た]べなかった.", "Đứng trước ので、から… trong câu giải thích."],
      ex: [["昨日[きのう]は宿題[しゅくだい]を{しなかった}。", "Hôm qua tôi đã không làm bài tập."], ["雨[あめ]で、どこへも{行[い]かなかった}。", "Vì mưa nên tôi chẳng đi đâu cả."]], note: ["Lịch sự: ~ませんでした."] },
    ta: { sum: "Quá khứ thường, cũng dùng cho hành động đã hoàn thành và trong nhiều mẫu như ~たことがある.",
      how: ["Chia giống て形, đổi て → た, で → だ.", "Nhóm 1: う・つ・る → った; む・ぶ・ぬ → んだ; く → いた (行く → 行った); ぐ → いだ; す → した.", "Nhóm 2: 食べた. Nhóm 3: した, 来た (きた)."],
      use: ["Quá khứ thân mật: 昨日[きのう]映画[えいが]を見[み]た.", "~たことがある (có kinh nghiệm), ~たばかり (vừa mới), ~たほうがいい (nên), ~たまま."],
      ex: [["日本[にほん]へ{行[い]った}ことがありますか。", "Bạn đã từng đến Nhật chưa?"], ["さっき昼[ひる]ご飯[はん]を{食[た]べた}ばかりです。", "Tôi vừa mới ăn trưa xong."]], note: ["Ngoại lệ 行く → 行った (không phải 行いた)."] },
    te: { sum: "Dạng nối câu, dùng để nhờ vả, diễn tả trạng thái đang diễn ra, và là nền của rất nhiều mẫu ngữ pháp.",
      how: ["Nhóm 1: う・つ・る → って; む・ぶ・ぬ → んで; く → いて; ぐ → いで; す → して. Ngoại lệ 行く → 行って.", "Nhóm 2: bỏ る, thêm て. 食べて.", "Nhóm 3: して, 来て (きて)."],
      use: ["Nhờ vả: ~てください、~てもらえますか.", "Đang làm: ~ている. Xin phép: ~てもいい. Cấm: ~てはいけない.", "Nối hành động theo thứ tự: 起[お]きて、顔[かお]を洗[あら]って、朝[あさ]ご飯[はん]を食[た]べます.", "Nêu nguyên nhân: 雨[あめ]が降[ふ]って、試合[しあい]が中止[ちゅうし]になった."],
      ex: [["ちょっと{待[ま]って}ください。", "Xin hãy đợi một chút."], ["朝[あさ]、起[お]き{て}、シャワーを浴[あ]び{て}、会社[かいしゃ]へ行[い]きます。", "Buổi sáng tôi dậy, tắm vòi sen rồi đi làm."]], note: ["Ghi nhớ quy tắc bằng bảng âm: う・つ・る gặp っ; む・ぶ・ぬ gặp ん; く・ぐ gặp い."] },
    tai: { sum: "Diễn đạt mong muốn của người nói (hoặc người nghe trong câu hỏi).",
      how: ["Lấy gốc ます, thêm たい. 飲む → 飲みたい. 食べる → 食べたい. する → したい.", "たい chia như tính từ い: たくない, たかった, たくなかった."],
      use: ["~たいです: tôi muốn làm gì đó.", "Trợ từ đi kèm: を hoặc が (水を/が飲みたい).", "Nói về mong muốn của người khác: ~たがっている."],
      ex: [["夏休[なつやす]みに日本[にほん]へ{行[い]きたい}です。", "Kỳ nghỉ hè tôi muốn đi Nhật."], ["今[いま]は何[なに]も{食[た]べたくない}。", "Bây giờ tôi chẳng muốn ăn gì."]], note: ["Không dùng ~たい trực tiếp để nói mong muốn của người thứ ba."] },
    kano: { sum: "Diễn tả khả năng hoặc việc có thể xảy ra.",
      how: ["Nhóm 1: đổi âm cuối sang hàng え, thêm る. 書く → 書ける. 読む → 読める.", "Nhóm 2: bỏ る, thêm られる. 食べる → 食べられる.", "Nhóm 3: できる, 来られる (こられる)."],
      use: ["Tân ngữ thường chuyển が: 日本語[にほんご]が話[はな]せる.", "Khả năng, điều kiện cho phép: ここでは写真[しゃしん]が撮[と]れない."],
      ex: [["漢字[かんじ]が{読[よ]める}ようになりました。", "Tôi đã đọc được chữ Hán rồi."], ["この店[みせ]ではカードが{使[つか]えます}。", "Ở cửa hàng này có thể dùng thẻ."]], note: ["Thể khả năng của nhóm 2 trùng với thể bị động (食べられる). Phân biệt nhờ ngữ cảnh."] },
    ukemi: { sum: "Diễn tả bị tác động, hoặc nêu hành vi từ góc nhìn của đối tượng chịu tác động.",
      how: ["Nhóm 1: đổi âm cuối sang hàng あ, thêm れる. 書く → 書かれる. Riêng う → われる.", "Nhóm 2: bỏ る, thêm られる.", "Nhóm 3: される, 来られる."],
      use: ["Bị làm phiền (bị động gián tiếp): 雨[あめ]に降[ふ]られた.", "Câu trực tiếp: 先生[せんせい]に褒[ほ]められた.", "Văn viết khách quan: この本[ほん]は多[おお]くの人[ひと]に読[よ]まれている."],
      ex: [["先生[せんせい]に{褒[ほ]められました}。", "Tôi được thầy khen."], ["電車[でんしゃ]で足[あし]を{踏[ふ]まれた}。", "Tôi bị giẫm chân trên tàu điện."]], note: ["Tác nhân thường đi với に (đôi khi から, によって)."] },
    shieki: { sum: "Diễn tả bắt hoặc cho phép ai đó làm gì.",
      how: ["Nhóm 1: đổi sang hàng あ, thêm せる. 書く → 書かせる.", "Nhóm 2: bỏ る, thêm させる.", "Nhóm 3: させる, 来させる (こさせる)."],
      use: ["Bắt buộc: 母[はは]は子[こ]どもに野菜[やさい]を食[た]べさせた.", "Cho phép: 好[す]きなことをさせてあげる.", "~(さ)せてください: xin cho phép tôi làm."],
      ex: [["部長[ぶちょう]は私[わたし]に資料[しりょう]を{作[つく]らせた}。", "Trưởng phòng bắt tôi làm tài liệu."], ["少[すこ]し考[かんが]え{させて}ください。", "Xin cho tôi suy nghĩ một chút."]], note: ["Người bị sai khiến đi với に (nếu động từ có tân ngữ を) hoặc を (nếu là động từ không tân ngữ)."] },
    ikou: { sum: "Diễn tả ý định, lời rủ rê (tôi sẽ… / chúng ta hãy…).",
      how: ["Nhóm 1: đổi sang hàng お, thêm う. 書く → 書こう.", "Nhóm 2: bỏ る, thêm よう. 食べよう.", "Nhóm 3: しよう, 来よう (こよう)."],
      use: ["Rủ rê thân mật: 一緒[いっしょ]に行[い]こう.", "~(よ)うと思[おも]う: tôi định làm.", "~(よ)うとする: cố gắng, sắp sửa làm."],
      ex: [["週末[しゅうまつ]に映画[えいが]を{見[み]よう}と思[おも]っています。", "Cuối tuần tôi định xem phim."], ["そろそろ{帰[かえ]ろう}か。", "Sắp về thôi nhỉ?"]], note: ["Lịch sự tương ứng: ~ましょう."] },
    meirei: { sum: "Dạng ra lệnh mạnh, thường nghe thấy ở nam giới, biển báo, thể thao hay khẩu hiệu.",
      how: ["Nhóm 1: đổi sang hàng え. 書く → 書け.", "Nhóm 2: bỏ る, thêm ろ. 食べろ.", "Nhóm 3: しろ, 来い (こい)."],
      use: ["Ra lệnh: 早[はや]く{しろ}!", "Biển báo: 止[と]まれ (dừng lại).", "Dẫn lại lệnh: ~と言[い]われた."],
      ex: [["もっと{頑張[がんば]れ}!", "Cố gắng hơn nữa đi!"], ["危[あぶ]ないから、{逃[に]げろ}!", "Nguy hiểm đấy, chạy đi!"]], note: ["Rất mạnh, tránh dùng với người trên hoặc người lạ. Lịch sự hơn dùng ~てください."] },
    kinshi: { sum: "Dạng cấm đoán mạnh, nghĩa là “đừng làm ~”.",
      how: ["Thêm な vào sau thể từ điển. 行く → 行くな. 食べる → 食べるな."],
      use: ["Cấm đoán thân mật hoặc biển báo: 入[はい]るな.", "Dẫn lại: 行[い]くなと言[い]われた."],
      ex: [["ここで{吸[す]うな}。", "Đừng hút thuốc ở đây."], ["泣[な]くな。", "Đừng khóc."]], note: ["Lịch sự hơn: ~ないでください."] },
    ba: { sum: "Điều kiện giả định: nếu ~ thì (kết quả).",
      how: ["Nhóm 1: đổi sang hàng え, thêm ば. 書く → 書けば.", "Nhóm 2: bỏ る, thêm れば. 食べれば.", "Nhóm 3: すれば, 来れば (くれば)."],
      use: ["Điều kiện chung và quy luật: 春[はる]になれば、花[はな]が咲[さ]く.", "Gợi ý: ~ばいい (chỉ cần ~ là được).", "Cặp ~ば~ほど (càng ~ càng ~)."],
      ex: [["急[いそ]げば、まだ間[ま]に合[あ]います。", "Nếu nhanh lên thì vẫn kịp."], ["{練習[れんしゅう]すれば}練習[れんしゅう]するほど上手[じょうず]になる。", "Càng luyện tập càng giỏi."]], note: ["Vế sau không dùng ý chí hay mệnh lệnh khi vế trước là trạng thái; dùng ~たら hoặc ~なら thay thế."] },
    tara: { sum: "Điều kiện, hoặc “sau khi ~ xong thì”, nói chung dùng rất rộng rãi.",
      how: ["Lấy た形, thêm ら. 書いたら, 食べたら, したら, 来たら."],
      use: ["Giả định: 雨[あめ]が降[ふ]ったら、行[い]きません.", "Sau khi ~ xong: 宿題[しゅくだい]が終[お]わったら、遊[あそ]びに行[い]く.", "Phát hiện bất ngờ: 開[あ]けたら、猫[ねこ]がいた."],
      ex: [["時間[じかん]が{あったら}、手伝[てつだ]ってください。", "Nếu có thời gian thì giúp tôi nhé."], ["家[いえ]に{着[つ]いたら}、電話[でんわ]します。", "Về đến nhà tôi sẽ gọi điện."]], note: ["Vế sau tự do, có thể là ý chí, mệnh lệnh hay nhờ vả."] },
    tari: { sum: "Liệt kê vài hành động tiêu biểu, không nhất thiết đủ hết, hoặc diễn tả hành động lặp lại luân phiên.",
      how: ["Lấy た形, thêm り. 書いたり, 食べたり, したり, 来たり."],
      use: ["~たり~たりする: lúc thì ~ lúc thì ~.", "Hai trạng thái trái ngược: 暑[あつ]かったり寒[さむ]かったり."],
      ex: [["休[やす]みの日[ひ]は、本[ほん]を{読[よ]んだり}、映画[えいが]を{見[み]たり}します。", "Ngày nghỉ tôi hay đọc sách, xem phim."], ["天気[てんき]が{良[よ]かったり悪[わる]かったり}です。", "Thời tiết lúc tốt lúc xấu."]], note: ["Luôn có し cuối câu (する)."] },
    nasai: { sum: "Chỉ thị nhẹ nhàng nhưng có tính ra lệnh, của cha mẹ, thầy cô hoặc trong đề thi.",
      how: ["Lấy gốc ます, thêm なさい. 書く → 書きなさい. 食べる → 食べなさい."],
      use: ["Cha mẹ nói với con: 早[はや]く寝[ね]なさい.", "Đề bài: 次[つぎ]の文[ぶん]を読[よ]みなさい."],
      ex: [["早[はや]く{起[お]きなさい}。", "Dậy sớm đi con."], ["正[ただ]しいものを{選[えら]びなさい}。", "Hãy chọn đáp án đúng."]], note: ["Không dùng với người trên."] },
    renyo: { sum: "Gốc của ます, tức dạng nối. Nền tảng để tạo danh từ và nhiều mẫu ghép.",
      how: ["Nhóm 1: đổi sang hàng い. 書く → 書き.", "Nhóm 2: bỏ る. 食べる → 食べ.", "Nhóm 3: し, 来 (き)."],
      use: ["Nối câu văn viết: 朝[あさ]起[お]き、顔[かお]を洗[あら]う.", "Danh từ hoá: 休[やす]み (nghỉ), 話[はなし] (câu chuyện), 手伝[てつだ]い (giúp đỡ).", "Ghép: ~ながら, ~に行[い]く, ~やすい, ~にくい, ~すぎる, ~そうだ."],
      ex: [["音楽[おんがく]を{聞[き]き}ながら勉強[べんきょう]します。", "Tôi vừa nghe nhạc vừa học."], ["この靴[くつ]は{歩[ある]き}やすいです。", "Đôi giày này dễ đi."]], note: ["Trong văn viết dùng thay て形 để nối nhiều vế."] },
    zu: { sum: "Dạng phủ định văn viết hoặc cổ điển, tương đương ない.",
      how: ["Lấy ない形, thay ない bằng ず. 書かない → 書かず. Riêng する → せず, 来ない → 来ず (こず)."],
      use: ["~ずに: không làm ~ mà (làm khác): 何[なに]も食[た]べずに寝[ね]た.", "Văn viết trang trọng, thông báo."],
      ex: [["朝[あさ]ご飯[はん]を{食[た]べずに}学校[がっこう]へ行[い]った。", "Tôi đi học mà không ăn sáng."], ["連絡[れんらく]も{せず}、休[やす]んだ。", "Anh ta nghỉ mà không hề liên lạc."]], note: ["Ngoại lệ: する → せず (không phải しず)."] },
    shiekiuke: { sum: "Bị bắt buộc phải làm điều gì đó (thường với cảm giác miễn cưỡng).",
      how: ["Nhóm 1: đổi sang hàng あ, thêm せられる (dạng ngắn: される, trừ động từ kết thúc bằng す). 書く → 書かせられる / 書かされる.", "Nhóm 2: bỏ る, thêm させられる. 食べる → 食べさせられる.", "Nhóm 3: させられる, 来させられる (こさせられる)."],
      use: ["Bị ép: 上司[じょうし]に残業[ざんぎょう]を{させられた}.", "Cảm xúc: 嫌[きら]いな野菜[やさい]を食[た]べさせられた."],
      ex: [["子[こ]どもの頃[ころ]、毎日[まいにち]ピアノを{練習[れんしゅう]させられた}。", "Hồi nhỏ ngày nào tôi cũng bị bắt luyện đàn."], ["飲[の]めないのに、お酒[さけ]を{飲[の]まされた}。", "Tôi không uống được mà vẫn bị ép uống rượu."]], note: ["Dạng ngắn rất hay gặp trong hội thoại."] }
    ,
    masen: { sum: "Dạng phủ định lịch sự: không làm / không phải là / không ~.",
      how: ["Động từ: gốc ます + ません. 書く → 書きません. 食べる → 食べません.", "Tính từ い: bỏ い, thêm くありません (hoặc くないです). 高い → 高くありません.", "Tính từ な và danh từ: thêm ではありません (hội thoại: じゃありません). 静か → 静かではありません."],
      use: ["Nói lịch sự về điều không xảy ra hoặc không đúng.", "Thể thường tương ứng: ~ない."],
      ex: [["私[わたし]はコーヒーを{飲[の]みません}。", "Tôi không uống cà phê."], ["この部屋[へや]は{静[しず]かではありません}。", "Căn phòng này không yên tĩnh."]], note: ["Tính từ い không dùng 高いではありません; phải là 高くありません."] },
    mashita: { sum: "Quá khứ lịch sự của động từ, tính từ và danh từ.",
      how: ["Động từ: gốc ます + ました. 書く → 書きました.", "Tính từ い: bỏ い, thêm かったです. 高い → 高かったです.", "Tính từ な và danh từ: thêm でした. 静か → 静かでした. 学生 → 学生でした."],
      use: ["Kể lại sự việc đã xảy ra bằng văn phong lịch sự.", "Thể thường tương ứng: ~た / ~かった / ~だった."],
      ex: [["昨日[きのう]は映画[えいが]を{見[み]ました}。", "Hôm qua tôi đã xem phim."], ["試験[しけん]は{難[むずか]しかったです}。", "Bài thi đã khó."]], note: ["Không nói 高いでした. Phải là 高かったです."] },
    masendeshita: { sum: "Phủ định ở quá khứ, văn phong lịch sự.",
      how: ["Động từ: gốc ます + ませんでした. 書く → 書きませんでした.", "Tính từ い: bỏ い, thêm くありませんでした (hoặc くなかったです). 高い → 高くありませんでした.", "Tính từ な và danh từ: ではありませんでした (hội thoại: じゃありませんでした)."],
      use: ["Nói lịch sự về điều đã không xảy ra hoặc đã không đúng.", "Thể thường tương ứng: ~なかった."],
      ex: [["昨日[きのう]は学校[がっこう]へ{行[い]きませんでした}。", "Hôm qua tôi đã không đi học."], ["天気[てんき]は{良[よ]くありませんでした}。", "Thời tiết đã không tốt."]], note: ["いい chia như よい: よくありません, よかったです."] },
    adv: { sum: "Dạng làm trạng từ, đứng trước động từ hoặc tính từ khác để bổ nghĩa.",
      how: ["Tính từ い: bỏ い, thêm く. 早い → 早く. Đặc biệt いい → よく.", "Tính từ な: thêm に. 静か → 静かに. きれい → きれいに."],
      use: ["早[はや]く起[お]きる (dậy sớm), 静[しず]かに話[はな]す (nói khẽ).", "Với なる / する: 暑[あつ]くなる (trở nên nóng), 元気[げんき]にする (làm cho khoẻ)."],
      ex: [["もっと{ゆっくり}話[はな]してください。", "Hãy nói chậm hơn nữa."], ["図書館[としょかん]では{静[しず]かに}してください。", "Ở thư viện xin hãy giữ yên lặng."]], note: ["Danh từ không có dạng trạng từ riêng; dùng に hoặc として tuỳ ý nghĩa."] },
    rentai: { sum: "Dạng đứng trước danh từ để bổ nghĩa cho danh từ đó.",
      how: ["Tính từ い: giữ nguyên い. 高い山.", "Tính từ な: thêm な. 静かな町.", "Danh từ: thêm の. 学生の頃 (hồi còn là sinh viên)."],
      use: ["Cặp danh từ + danh từ: 日本語[にほんご]の先生[せんせい]. Quá khứ vẫn giữ: 高かった山 (ngọn núi đã từng cao), 学生だった頃.", "Với mệnh đề (thể thường): 食[た]べる人[ひと], 食[た]べた物[もの]."],
      ex: [["{静[しず]かな}町[まち]に住[す]んでいます。", "Tôi sống ở một thị trấn yên tĩnh."], ["{学生[がくせい]の}ときは、よく旅行[りょこう]しました。", "Hồi còn là sinh viên tôi hay đi du lịch."]], note: ["Danh từ nối danh từ dùng の, nhưng nối trước ので và のに thì な: 静かなので, 学生なので."] },
    daro: { sum: "Phỏng đoán, ước chừng của người nói: chắc là ~.",
      how: ["Động từ và tính từ い: thể thường + だろう. 行く → 行くだろう. 高い → 高いだろう.", "Tính từ な và danh từ: bỏ だ, thêm だろう. 静かだろう. 雨だろう.", "Lịch sự: でしょう."],
      use: ["Ngày mai chắc là mưa: 明日[あした]は雨[あめ]だろう.", "Hỏi xác nhận (lên giọng): そうでしょう?"],
      ex: [["あの店[みせ]は{高[たか]いだろう}。", "Quán đó chắc đắt."], ["彼[かれ]は{来[こ]ないだろう}。", "Chắc anh ấy sẽ không đến."]], note: ["Danh từ và tính từ な không thêm だ trước だろう (×雨だだろう)."] },
    sou: { sum: "Có vẻ, trông như sắp (suy đoán từ vẻ bề ngoài hoặc dấu hiệu).",
      how: ["Động từ: gốc ます + そう. 降る → 降りそう (sắp mưa).", "Tính từ い: bỏ い, thêm そう. 高い → 高そう. Đặc biệt: いい → よさそう, ない → なさそう.", "Tính từ な: thêm そう. 静か → 静かそう."],
      use: ["Dự đoán sắp xảy ra: 雨[あめ]が降[ふ]りそうだ.", "Ấn tượng từ ngoại hình: おいしそう (trông ngon)."],
      ex: [["今[いま]にも雨[あめ]が{降[ふ]りそう}です。", "Trời trông như sắp mưa."], ["このケーキは{おいしそう}ですね。", "Cái bánh này trông ngon quá."]], note: ["Khác với そうだ truyền đạt (nghe nói): thể thường + そうだ."] },
    sugiru: { sum: "Quá mức, quá nhiều so với mức thích hợp.",
      how: ["Động từ: gốc ます + すぎる. 食べる → 食べすぎる.", "Tính từ い: bỏ い, thêm すぎる. 高い → 高すぎる. いい → よすぎる.", "Tính từ な: thêm すぎる. 静か → 静かすぎる."],
      use: ["Chê hoặc phàn nàn: この服[ふく]は大[おお]きすぎる.", "Cảnh báo: 飲[の]みすぎないでください."],
      ex: [["昨日[きのう]はお酒[さけ]を{飲[の]みすぎました}。", "Hôm qua tôi uống rượu quá nhiều."], ["この靴[くつ]は{小[ちい]さすぎる}。", "Đôi giày này nhỏ quá."]], note: ["すぎる chia như động từ nhóm 2: すぎた, すぎない, すぎて."] },
    sonkei: { sum: "Kính ngữ nâng cao người được nói tới (người trên, khách hàng).",
      how: ["Mẫu chung: お + gốc ます + になる. 書く → お書きになる. 読む → お読みになる.", "Động từ đặc biệt có từ riêng: 行く・来る・いる → いらっしゃる; 食べる・飲む → 召し上がる; 言う → おっしゃる; 見る → ご覧になる; する → なさる; くれる → くださる; 知る → ご存じだ.", "Động từ する ghép với danh từ: 勉強する → 勉強なさる."],
      use: ["先生[せんせい]はもうお帰[かえ]りになりました (thầy đã về rồi).", "Cũng có thể dùng thể bị động (れる/られる) với nghĩa tôn kính nhẹ hơn."],
      ex: [["社長[しゃちょう]は何[なに]を{召[め]し上[あ]がります}か。", "Giám đốc dùng món gì ạ?"], ["先生[せんせい]が{いらっしゃいました}。", "Thầy đã tới."]], note: ["Không dùng cho hành động của chính mình hoặc người trong nhóm mình khi nói với người ngoài."] },
    kenjo: { sum: "Kính ngữ hạ mình, nói về hành động của bản thân để nâng người nghe lên.",
      how: ["Mẫu chung: お + gốc ます + する. 持つ → お持ちする. 待つ → お待ちする.", "Động từ đặc biệt: 行く・来る → 参る / 伺う; 食べる・飲む・もらう → いただく; 言う → 申す; 見る → 拝見する; する → いたす; 聞く → 伺う; 会う → お目にかかる; 知る → 存じる.", "Danh từ + する: ご連絡する / 連絡いたす."],
      use: ["Khi làm gì cho người trên: 荷物[にもつ]をお持[も]ちします.", "Giới thiệu bản thân: 田中[たなか]と申[もう]します."],
      ex: [["私[わたし]は田中[たなか]と{申[もう]します}。", "Tôi tên là Tanaka."], ["明日[あした]、お宅[たく]に{伺[うかが]います}。", "Ngày mai tôi sẽ đến thăm nhà ngài."]], note: ["Động từ cảm xúc hoặc trạng thái (走る, 泳ぐ…) không dùng mẫu お〜する."] },
    sa: { sum: "Biến tính từ thành danh từ chỉ mức độ, tính chất.",
      how: ["Tính từ い: bỏ い, thêm さ. 高い → 高さ. いい → よさ.", "Tính từ な: thêm さ. 静か → 静かさ. 便利 → 便利さ."],
      use: ["Mức độ, thước đo: 山[やま]の高[たか]さ, 部屋[へや]の広[ひろ]さ.", "Trừu tượng: 大切[たいせつ]さ, 難[むずか]しさ."],
      ex: [["日本語[にほんご]の{難[むずか]しさ}を感[かん]じた。", "Tôi cảm nhận được sự khó của tiếng Nhật."], ["この道具[どうぐ]の{便利[べんり]さ}に驚[おどろ]いた。", "Tôi ngạc nhiên trước sự tiện lợi của dụng cụ này."]], note: ["Cũng có み (重み, 強み) nhưng ít tính từ dùng được."] },
    chau: { sum: "Dạng rút gọn hội thoại của ～てしまう (lỡ làm, làm xong hoàn toàn).",
      how: ["Thể て + しまう → ちゃう (て) / じゃう (で). 食べてしまう → 食べちゃう. 飲んでしまう → 飲んじゃう.", "Quá khứ: ちゃった / じゃった."],
      use: ["Tiếc nuối: 財布[さいふ]を忘[わす]れちゃった.", "Hoàn tất: 全部[ぜんぶ]食[た]べちゃった."],
      ex: [["しまった、寝坊[ねぼう]し{ちゃった}!", "Chết rồi, tôi ngủ quên mất!"], ["ケーキを全部[ぜんぶ]食[た]べ{ちゃった}。", "Tôi đã ăn hết cái bánh mất rồi."]], note: ["Chỉ dùng trong hội thoại thân mật, tránh trong văn viết trang trọng."] },
    toku: { sum: "Dạng rút gọn hội thoại của ～ておく (làm sẵn, chuẩn bị trước).",
      how: ["Thể て + おく → とく (て) / どく (で). 買っておく → 買っとく. 読んでおく → 読んどく."],
      use: ["Chuẩn bị: 先[さき]に予約[よやく]しとくね.", "Để nguyên: そのままにしとく."],
      ex: [["飲[の]み物[もの]を{買[か]っとく}ね。", "Tôi mua sẵn đồ uống nhé."], ["資料[しりょう]は先[さき]に{読[よ]んどいて}。", "Hãy đọc tài liệu trước đi."]], note: ["Văn viết dùng ておく."] },
    teru: { sum: "Dạng rút gọn hội thoại của ～ている (đang làm, trạng thái).",
      how: ["Thể て + いる → てる (bỏ い). 食べている → 食べてる. 読んでいる → 読んでる."],
      use: ["Đang diễn ra: 今[いま]何[なに]してる?", "Trạng thái: もう知[し]ってる."],
      ex: [["今[いま]、何[なに]を{してる}の?", "Bây giờ cậu đang làm gì thế?"], ["彼[かれ]のことは{知[し]ってる}よ。", "Tớ biết anh ấy đấy."]], note: ["Nếu bỏ い của ている thì ている → てる, ていた → てた."] },
    mai: { sum: "Phủ định ý chí (quyết không làm) hoặc phỏng đoán phủ định (chắc là không). Văn viết, trang trọng.",
      how: ["Nhóm 1: thể từ điển + まい. 書く → 書くまい.", "Nhóm 2: gốc + まい (hoặc từ điển + まい). 食べる → 食べまい / 食べるまい.", "Nhóm 3: するまい / しまい / すまい; 来る → 来るまい / 来まい (こまい)."],
      use: ["Ý chí phủ định: 二度[にど]とあの店[みせ]には行[い]くまい (quyết không đến quán đó nữa).", "Phỏng đoán phủ định: 彼[かれ]は来[こ]まい (chắc anh ấy không đến).", "Cặp ～(よ)うが～まいが: dù làm hay không làm."],
      ex: [["もう二度[にど]と{嘘[うそ]をつくまい}と決[き]めた。", "Tôi đã quyết không bao giờ nói dối nữa."], ["この天気[てんき]では、誰[だれ]も{来[こ]まい}。", "Với thời tiết này chắc không ai đến."]], note: ["Nhóm 2 và する, 来る có nhiều cách chia; cách trong ngoặc đều được chấp nhận."] },
    maika: { sum: "Hai cách dùng: do dự giữa làm và không làm (～(よ)うか～まいか); hoặc phải chăng (～ではあるまいか).",
      how: ["Thể ý chí + か, thể まい + か. 行こうか行くまいか.", "Với dạng đơn: まい + か. 書くまいか; 食べまいか; するまいか; 来るまいか."],
      use: ["Phân vân: 行[い]こうか行[い]くまいか迷[まよ]っている.", "Suy đoán nhẹ trong văn viết: ～のではあるまいか (phải chăng là ~)."],
      ex: [["言[い]おうか{言[い]うまいか}、迷[まよ]っている。", "Tôi đang phân vân nên nói hay không nên nói."], ["これは彼[かれ]の失敗[しっぱい]では{あるまいか}。", "Phải chăng đây là lỗi của anh ấy?"]], note: ["Mẫu 2 thường gặp trong văn viết và đề thi N1."] },
    zaru: { sum: "Dạng phủ định cổ ざる, đứng trước danh từ hoặc trong ～ざるを得ない.",
      how: ["Lấy ない形, thay ない bằng ざる. 書かない → 書かざる. Đặc biệt する → せざる, 来る → 来ざる (こざる)."],
      use: ["～ざるを得ない: đành phải ~: 行[い]かざるを得ない.", "Trước danh từ: 知[し]らざる事実[じじつ] (sự thật chưa ai biết)."],
      ex: [["雨[あめ]でも、仕事[しごと]だから{行[い]かざる}を得[え]ない。", "Dù mưa vì là công việc nên đành phải đi."], ["この計画[けいかく]は見直[みなお]さ{ざる}を得[え]ない。", "Đành phải xem xét lại kế hoạch này."]], note: ["する đổi thành せ (せざる), không phải しざる."] },
    beki: { sum: "Nên, cần phải, lẽ ra phải (mang tính nghĩa vụ, lẽ đương nhiên).",
      how: ["Động từ: thể từ điển + べき. 行く → 行くべき. 食べる → 食べるべき.", "する → するべき hoặc すべき. Văn viết dùng すべき nhiều hơn."],
      use: ["Lời khuyên mạnh: もっと勉強[べんきょう]するべきだ.", "Trước danh từ: 守[まも]るべきルール.", "Phủ định: ～べきではない (không nên)."],
      ex: [["約束[やくそく]は{守[まも]るべき}だ。", "Lời hứa thì phải giữ."], ["人[ひと]の悪口[わるくち]は{言[い]うべきではない}。", "Không nên nói xấu người khác."]], note: ["Nói về hành động của người khác, べき có thể nghe như trách móc."] },
    nu: { sum: "Dạng phủ định ぬ, văn viết cổ điển hoặc cố định trong thành ngữ.",
      how: ["Lấy ない形, thay ない bằng ぬ. 書かない → 書かぬ. する → せぬ, 来る → 来ぬ (こぬ), ある → あらぬ."],
      use: ["Thành ngữ: 知[し]らぬ間[ま]に (khi không hay biết), 言[い]わぬが花[はな].", "Thế hệ cũ: 申[もう]さぬ (không nói)."],
      ex: [["知[し]ら{ぬ}間[ま]に、日[ひ]が暮[く]れていた。", "Lúc không hay biết thì trời đã tối."], ["言[い]わぬが花[はな]だ。", "Không nói ra thì hơn."]], note: ["Biến âm của ず, tương đương ない."] },
    nn: { sum: "Dạng rút gọn của ぬ thành ん, thường đi với ばかり.",
      how: ["Lấy ない形, thay ない bằng ん. 言わない → 言わん. する → せん, 来る → こん."],
      use: ["～んばかり: gần như, dường như sắp ~: 泣[な]かんばかり (như sắp khóc).", "～んがため: để mà ~ (văn viết)."],
      ex: [["彼[かれ]は{怒[おこ]らんばかり}の顔[かお]だった。", "Anh ta có vẻ mặt như sắp nổi giận."], ["勝[か]た{んが}ために、練習[れんしゅう]を重[かさ]ねた。", "Để chiến thắng, anh ta đã luyện tập chồng chất."]], note: ["Cũng là cách nói phương ngữ: 知らん (không biết)."] }
  };
  // quy tắc cho tính từ い / な và danh từ của các thể dùng chung
  const ADJ = {
    masu: ["Tính từ và danh từ không có ます. Dùng です: 高いです, 静かです, 学生です."],
    nai: ["Tính từ い: bỏ い, thêm くない. 高い → 高くない. Đặc biệt いい → よくない.", "Tính từ な và danh từ: thêm ではない (hội thoại: じゃない). 静か → 静かではない. 学生 → 学生ではない."],
    nakatta: ["Tính từ い: bỏ い, thêm くなかった. 高い → 高くなかった.", "Tính từ な và danh từ: ではなかった (じゃなかった). 静か → 静かではなかった."],
    ta: ["Tính từ い: bỏ い, thêm かった. 高い → 高かった. いい → よかった.", "Tính từ な và danh từ: thêm だった. 静か → 静かだった. 学生 → 学生だった."],
    te: ["Tính từ い: bỏ い, thêm くて. 高い → 高くて. いい → よくて.", "Tính từ な và danh từ: thêm で. 静か → 静かで. 学生 → 学生で."],
    ba: ["Tính từ い: bỏ い, thêm ければ. 高い → 高ければ. いい → よければ.", "Tính từ な và danh từ: ならば / であれば (văn nói: なら). 静かならば. 学生ならば."],
    tara: ["Tính từ い: bỏ い, thêm かったら. 高かったら.", "Tính từ な và danh từ: だったら. 静かだったら. 学生だったら."],
    tari: ["Tính từ い: かったり. 高かったり.", "Tính từ な và danh từ: だったり. 静かだったり. 学生だったり."]
  };

  const SAMPLE = ["書[か]く", "食[た]べる", "する", "来[く]る"];   // mỗi nhóm một từ đại diện
  const SPECIAL = ["行[い]く", "ある"];
  const SAMPLE_A = ["高[たか]い", "静[しず]か", "学生[がくせい]"];
  const wordBy = w => ALL.find(v => v.w === w);
  /* từ đại diện + các trường hợp đặc biệt thật sự khác quy tắc ở thể f */
  function specialsFor(f) {
    const out = [], P_ = w => { const c = conj(f, wordBy(w)); return c ? plain(c.s) : null; };
    if (f.f) {
      const a = P_("行[い]く"), b = P_("書[か]く"); if (a && b && /[っ]/.test(a) && /い[てたでだ]/.test(b) && !/った$|って$/.test(b)) out.push("行[い]く");
      const c = P_("ある"); if (c && !c.startsWith("あ")) out.push("ある");
    }
    if (f.a) { const d = P_("いい"); if (d && /よ/.test(d)) out.push("いい"); }
    return out;
  }
  const repWords = f => (f.f ? SAMPLE.map(wordBy) : []).concat(f.a ? SAMPLE_A.filter(w => w !== "いい[]").map(wordBy) : []);
  SB.The = { V, FORMS, conj, ALL };

  const kindTags = f => kinds(f).map(k => `<span class="state">${{ v: "Động từ", i: "Tính từ い", na: "Tính từ な", n: "Danh từ" }[k]}</span>`).join(" ");
  function ctable(words, forms, showLab, spec) {
    const rows = forms.filter(f => words.some(v => conj(f, v)));
    return `<div class="tablewrap"><table class="ctable"><thead><tr><th>Thể</th>${words.map(v => `<th class="jp${spec && spec.includes(v.w) ? " th--sp" : ""}" lang="ja">${jp(v.w, { hl: false })}<small>${spec && spec.includes(v.w) ? "ngoại lệ" : `${esc(v.vi)} · ${esc(kindOf(v).replace(/ \(.*\)/, ""))}`}</small></th>`).join("")}</tr></thead>
      <tbody>${rows.map(f => `<tr><th><a href="#/the/${f.id}">${jp(f.ja, { hl: false })}</a><small>${lvtag(f.lv)}</small></th>${words.map(v => { const c = conj(f, v); return `<td class="jp" lang="ja">${c ? jp(c.s, { hl: false }) + (c.alts.length && !showLab ? `<small>cũng: ${c.alts.map(a => jp(a, { hl: false })).join("、")}</small>` : "") : '<span class="muted">–</span>'}</td>`; }).join("")}</tr>`).join("")}</tbody></table></div>`;
  }

  /* ---------------- trang chủ của thể */
  const done = id => stateOf("the:" + id);
  function list() {
    SB.setNav("the");
    const byLv = ["n5", "n4", "n3", "n2", "n1"].map(lv => ({ lv, items: FORMS.filter(f => f.lv === lv) })).filter(g => g.items.length);
    main.innerHTML = band({ title: "Thể của từ", text: "Các thể của động từ, tính từ và danh từ theo cấp JLPT, kể cả các dạng văn viết như まい, ぬ, ざる. Bấm vào từng thể để xem lý thuyết, cách chia, cách dùng; hoặc vào phần luyện chia thể.", meta: `<b>${FORMS.length}</b><span>thể</span>`,
        extra: '<div class="band__cta"><a class="btn btn--primary" href="#/the/luyen">Luyện chia thể</a><a class="btn btn--ghost" href="#/the/bang">Bảng chia nhanh</a></div>' }) +
      `<section class="sec"><div class="wrap">${byLv.map(g => `<div class="sec__head"><h2>${lvtag(g.lv)} ${g.items.length} thể</h2></div><ul class="posrows">${g.items.map(f => `<li><a href="#/the/${f.id}"><span><span class="row__ja jp" lang="ja">${jp(f.ja, { hl: false })}</span><br><span class="row__vi">${esc(f.vi)}</span><br><span class="row__sub">${esc(T[f.id].sum)}</span><br>${kindTags(f)}</span>
        <span class="row__side">${lvtag(f.lv)} ${done(f.id) === "ok" ? '<span class="state state--ok">Đã luyện</span>' : done(f.id) === "rv" ? '<span class="state state--rv">Cần ôn</span>' : ""}</span></a></li>`).join("")}</ul>`).join("")}</div></section>`;
    SB.setCur({ refresh: list });
  }
  const tricky = `<p class="muted">Dễ nhầm: ${["帰[かえ]る", "入[はい]る", "走[はし]る", "切[き]る", "知[し]る"].map(w => `<span class="jp" lang="ja">${jp(w, { hl: false })}</span>`).join("・")} tuy đuôi giống nhóm 2 nhưng chia theo nhóm 1.</p>`;
  function table() {
    SB.setNav("the");
    main.innerHTML = band({ crumb: "Thể", crumbHref: "#/the", title: "Bảng chia nhanh", text: "Mỗi nhóm một từ đại diện: 書く (nhóm 1), 食べる (nhóm 2), する và 来る (nhóm 3), 高い, 静か, 学生; hai cột cuối là các từ ngoại lệ." }) +
      `<section class="sec"><div class="wrap"><div class="sec__head"><h2>Động từ</h2></div>${ctable(SAMPLE.concat(SPECIAL).map(wordBy), FORMS.filter(f => f.f), false, SPECIAL)}${tricky}
        <div class="sec__head"><h2>Tính từ và danh từ</h2></div>${ctable(SAMPLE_A.concat("いい").map(wordBy), FORMS.filter(f => f.a), false, ["いい"])}</div></section>`;
    SB.setCur({ refresh: table });
  }
  function detail(id) {
    const f = FM[id], t = T[id]; if (!f) return SB.notFound();
    SB.setNav("the");
    const i = FORMS.indexOf(f), prev = FORMS[i - 1], next = FORMS[i + 1];
    const hasV = !!f.f, hasA = !!f.a;
    main.innerHTML = band({ crumb: "Thể", crumbHref: "#/the", title: `<span class="jp" lang="ja">${jp(f.ja, { hl: false })}</span> · ${esc(f.vi)}`, text: esc(t.sum), compact: true, meta: `${lvtag(f.lv)}` }) +
      `<section class="sec gram"><div class="wrap gram__in"><article class="gram__main">
        <section class="gbox"><h2>Cách chia</h2><ul class="gform">${t.how.map(x => `<li>${rich(x)}</li>`).join("")}</ul>
          ${hasV ? ctable(SAMPLE.concat(specialsFor(f).filter(w => w !== "いい")).map(wordBy), [f], false, specialsFor(f)) + tricky : ""}${hasA ? `${ADJ[id] ? `<ul class="gform">${ADJ[id].map(x => `<li>${rich(x)}</li>`).join("")}</ul>` : ""}${ctable(SAMPLE_A.concat(specialsFor(f).filter(w => w === "いい")).map(wordBy), [f], false, specialsFor(f))}` : ""}</section>
        <section class="gbox"><h2>Cách dùng</h2>${t.use.map(x => `<p>${rich(x)}</p>`).join("")}</section>
        <section class="gbox"><h2>Ví dụ</h2><ol class="gex-list">${t.ex.map((e, k) => `<li class="gex"><span class="gex__n">${k + 1}</span><div class="gex__b"><div class="gex__ja" lang="ja">${jp(e[0])}</div>${S.romaji ? `<div class="romaji">${esc(romaji(kana(e[0])))}</div>` : ""}<div class="gex__vi">${esc(e[1])}</div></div><button class="icon-btn gex__say" type="button" data-say="${esc(plain(e[0]))}" aria-label="Nghe">${ICON_SPEAK}</button></li>`).join("")}</ol></section>
        <section class="gbox gbox--note"><h2>Lưu ý</h2>${t.note.map(x => `<p>${rich(x)}</p>`).join("")}</section>
        <section class="gbox gbox--try"><h2>Luyện thể này</h2><p>Làm thử với nhiều từ để nhớ quy tắc.</p><a class="btn btn--primary" href="#/the/luyen?f=${f.id}">Luyện ${f.ja}</a></section>
        <nav class="unitnav gnav">${prev ? `<a class="unitnav__a" href="#/the/${prev.id}">← ${esc(prev.ja)}</a>` : "<span></span>"}${next ? `<a class="unitnav__a" href="#/the/${next.id}">${esc(next.ja)} →</a>` : "<span></span>"}</nav>
      </article></div></section>`;
    $$("[data-say]", main).forEach(b => b.addEventListener("click", () => speak(b.dataset.say)));
    SB.setCur({ refresh: () => detail(id) });
  }

  /* ---------------- luyện tập */
  const KOPT = [["v1", "Động từ nhóm 1"], ["v2", "Động từ nhóm 2"], ["v3", "Động từ nhóm 3"], ["i", "Tính từ い"], ["na", "Tính từ な"], ["n", "Danh từ"]];
  const N_ITEMS = 30;
  function setup(q) {
    SB.setNav("the");
    const sel = new Set((q.get("f") || "").split(",").filter(x => FM[x]));
    const grp = new Set(KOPT.map(k => k[0]));
    const draw = () => {
      const forms = FORMS.filter(f => sel.has(f.id)), pool = ALL.filter(v => grp.has(kindKey(v)));
      const n = forms.length ? forms.flatMap(f => pool.filter(v => conj(f, v))).length : 0;
      main.innerHTML = band({ crumb: "Thể", crumbHref: "#/the", title: "Luyện chia thể", text: `Mỗi lượt ${N_ITEMS} câu ngẫu nhiên. Chọn thể muốn luyện và loại từ (động từ, tính từ, danh từ), rồi chọn cách luyện: học thẻ, viết lại, ghép cặp hoặc điền vào câu.`, compact: true }) +
        `<section class="sec"><div class="wrap"><div class="setup"><h3>Thể cần luyện</h3>
          <div class="chips">${["n5", "n4", "n3", "n2", "n1"].map(l => `<button class="chip" type="button" data-all="${l}" aria-pressed="${FORMS.filter(f => f.lv === l).every(f => sel.has(f.id))}">Mọi thể ${l.toUpperCase()}</button>`).join("")}<button class="chip" type="button" data-all="*" aria-pressed="${FORMS.every(f => sel.has(f.id))}">Tất cả</button><button class="chip" type="button" data-all="">Bỏ chọn</button></div>
          <div class="chips chips--wrap">${FORMS.map(f => `<button class="chip jp" lang="ja" type="button" data-f="${f.id}" aria-pressed="${sel.has(f.id)}">${esc(f.ja)} <small>${f.lv.toUpperCase()}</small></button>`).join("")}</div>
          <h3>Loại từ</h3><div class="chips chips--wrap">${KOPT.map(([k, t]) => `<button class="chip" type="button" data-g="${k}" aria-pressed="${grp.has(k)}">${t}</button>`).join("")}</div>
          <p class="muted">${forms.length ? (n ? `Có ${n} tổ hợp thể và từ để rút ${Math.min(N_ITEMS, n)} câu.` : "Các thể này không áp dụng cho loại từ đã chọn. Hãy chọn thêm loại từ.") : "Hãy chọn ít nhất một thể."}</p>
          <div class="card__actions"><button class="btn btn--primary" type="button" data-go ${n ? "" : "disabled"}>Bắt đầu (${forms.length} thể)</button></div></div></div></section>`;
      $$("[data-f]").forEach(b => b.onclick = () => { sel.has(b.dataset.f) ? sel.delete(b.dataset.f) : sel.add(b.dataset.f); draw(); });
      $$("[data-all]").forEach(b => b.onclick = () => {   // bật/tắt từng gói, chọn được nhiều gói cùng lúc
        const k = b.dataset.all; if (!k) { sel.clear(); return draw(); }
        const grpF = FORMS.filter(f => k === "*" || f.lv === k), on = grpF.every(f => sel.has(f.id));
        grpF.forEach(f => on ? sel.delete(f.id) : sel.add(f.id)); draw(); });
      $$("[data-g]").forEach(b => b.onclick = () => { const g = b.dataset.g; if (grp.has(g) && grp.size > 1) grp.delete(g); else grp.add(g); draw(); });
      $("[data-go]").onclick = () => session(forms, pool);
    };
    draw();
    SB.setCur({ refresh: draw });
  }
  function makeItems(forms, words, n = N_ITEMS) {
    const pairs = [];
    forms.forEach(f => words.forEach(v => { const c = conj(f, v); if (c) pairs.push(Object.assign({ f, v }, c)); }));
    // chia đều theo thể để mọi thể được gặp
    const byF = new Map(); shuffle(pairs).forEach(p => { (byF.get(p.f.id) || byF.set(p.f.id, []).get(p.f.id)).push(p); });
    const out = []; const qs = shuffle([...byF.values()]);
    for (let r = 0; out.length < n && qs.some(q => q.length); r++) qs.forEach(q => { if (q.length && out.length < n) out.push(q.shift()); });
    return shuffle(out);
  }
  const ok1 = (it, a) => { const s = a.replace(/\s/g, ""); return [it.s, ...it.alts].some(x => s === plain(x) || s === kana(x)); };
  let SENT = [];
  SB.theSent = d => { SENT = d; };
  function session(forms, words) {
    const st = { mode: "card", items: makeItems(forms, words), i: 0, flip: false, match: null, rw: null, fill: null };
    const newSet = () => { st.items = makeItems(forms, words); st.i = 0; st.flip = false; st.match = st.rw = st.fill = null; };
    main.innerHTML = band({ crumb: "Chọn lại thể", crumbHref: "#/the/luyen", title: "Luyện chia thể", text: forms.map(f => f.ja).join("、"), compact: true }) +
      `<section class="study"><div class="wrap"><div class="study__bar"><div class="modes" role="group" aria-label="Chế độ">
        <button type="button" data-mode="card"><span class="jp" lang="ja">札</span>Học thẻ</button><button type="button" data-mode="rw"><span class="jp" lang="ja">書</span>Viết lại</button>
        <button type="button" data-mode="match"><span class="jp" lang="ja">合</span>Ghép cặp</button><button type="button" data-mode="fill"><span class="jp" lang="ja">填</span>Điền vào câu</button></div>
        <div class="study__stats"><button class="btn btn--ghost btn--sm" type="button" data-new>Bộ khác</button></div></div><div data-stage></div></div></section>`;
    const stage = $("[data-stage]");
    $("[data-new]").onclick = () => { newSet(); paint(); };
    $$("[data-mode]").forEach(b => b.onclick = () => { st.mode = b.dataset.mode; paint(); });
    const req = it => { const l = lab(it.f, it.v); return `<div class="thereq">→ <b class="jp" lang="ja">${esc(l.ja)}</b> <span class="muted">${esc(l.vi)}</span></div>`; };
    const q = it => `<div class="say" lang="ja">${jp(it.v.w, { hl: false })}</div><div class="card__hint">${esc(it.v.vi)} · ${kindOf(it.v)}${it.v.tricky ? " · dễ nhầm" : ""}</div>${req(it)}`;
    function paint() {
      $$("[data-mode]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === st.mode));
      ({ card: pCard, match: pMatch, rw: pRw, fill: pFill })[st.mode]();
    }
    const fin = (el, r, t, extra) => { stage.innerHTML = doneHTML(`Xong ${t} mục`, r, t, extra, '<button class="btn btn--primary" type="button" data-again>Bộ mới</button>'); afterDone(stage, r, t); $("[data-again]", stage).onclick = () => { newSet(); paint(); }; };
    const rec = (it, good) => mark("the:" + it.f.id, good ? "ok" : "rv");
    let dir = "";
    function pCard() {
      const it = st.items[st.i], l = lab(it.f, it.v);
      const top = `${lvtag(it.f.lv)}<span>${esc(l.ja)}</span><span class="card__num">${String(st.i + 1).padStart(2, "0")} <small>/ ${st.items.length}</small></span>`;
      const front = q(it);
      const back = `<div class="say" lang="ja">${jp(it.s, { hl: false })}</div>${S.romaji ? `<div class="romaji">${esc(romaji(kana(it.s)))}</div>` : ""}<div class="card__hint">${esc(l.ja)} của ${jp(it.v.w, { hl: false })}</div>${it.alts.length ? `<div class="card__hint">Cũng đúng: ${it.alts.map(a => jp(a, { hl: false })).join("、")}</div>` : ""}`;
      SB.simpleCard(stage, { top, front, back, say: kana(it.s), flip: st.flip, dir, onAct: a => {
        if (a === "prev") st.i = (st.i - 1 + st.items.length) % st.items.length; else st.i = (st.i + 1) % st.items.length;
        if (a === "ok" || a === "rv") rec(it, a === "ok");
        dir = a === "prev" ? "prev" : "next"; st.flip = false; pCard(); }, onFlip: f => { st.flip = f; } });
      dir = "";
    }
    function pRw() {
      if (!st.rw) st.rw = { k: 0, right: 0, checked: false };
      const z = st.rw;
      if (z.k >= st.items.length) return fin(0, z.right, st.items.length, `Đúng ${z.right} trên ${st.items.length}.`);
      const it = st.items[z.k];
      stage.innerHTML = `<div class="card"><div class="quiz"><div class="card__top"><span>Viết dạng đúng (kanji hoặc hiragana đều được)</span><span class="card__num">${z.k + 1} <small>/ ${st.items.length}</small></span></div><div class="quiz__q">${q(it)}</div>
        <input class="finder rw__in" lang="ja" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Gõ đáp án…" data-in aria-label="Đáp án" ${z.checked ? "readonly" : ""}>
        <div class="feedback" aria-live="polite"></div><div class="card__actions"><button class="btn btn--primary" type="button" data-chk>Kiểm tra</button><button class="btn btn--primary" type="button" data-next hidden>Câu tiếp</button><button class="btn btn--ghost btn--sm" type="button" data-skip>Xem đáp án</button></div></div></div>`;
      const inp = $("[data-in]", stage); inp.focus({ preventScroll: true });
      const reveal = good => {
        z.checked = true; if (good) z.right++; rec(it, good); inp.readOnly = true;
        const fb = $(".feedback", stage); fb.className = "feedback " + (good ? "ok" : "no");
        fb.innerHTML = verdictHTML(good, pickWord(good), `<span class="jp" lang="ja">${jp(it.s, { hl: false })}</span>${it.alts.length ? ` · cũng đúng: ${it.alts.map(a => jp(a, { hl: false })).join("、")}` : ""} <button class="icon-btn" type="button" data-say="${esc(kana(it.s))}">${ICON_SPEAK}</button>`);
        $$("[data-say]", fb).forEach(b => b.onclick = () => speak(b.dataset.say));
        verdict(fb, good); good ? celebrate(inp) : (wobble(inp), buzz());
        $("[data-chk]", stage).hidden = true; $("[data-skip]", stage).hidden = true; $("[data-next]", stage).hidden = false; $("[data-next]", stage).focus({ preventScroll: true });
      };
      const check = () => { if (z.checked) return; const a = inp.value.trim(); if (!a) return; reveal(ok1(it, a)); };
      $("[data-chk]", stage).onclick = check; $("[data-skip]", stage).onclick = () => { if (!z.checked) reveal(false); };
      inp.addEventListener("keydown", ev => { if (ev.key === "Enter" && !ev.isComposing) { ev.preventDefault(); z.checked ? $("[data-next]", stage).click() : check(); } });
      $("[data-next]", stage).onclick = () => { z.k++; z.checked = false; pRw(); };
    }
    /* điền vào câu: gõ dạng đã chia của động từ để hoàn thành câu */
    function pFill() {
      if (!st.fill) {
        const ids = new Set(forms.map(f => f.id)), fm = id => FORMS.find(f => f.id === id);
        const deck = shuffle(SENT.filter(x => ids.has(x.f))).map(x => {
          const f = fm(x.f), v = { kind: "v", w: x.w, vi: "", g: x.g, lv: f.lv, kuru: plain(x.w).startsWith("来"), suru: x.g === 3 && plain(x.w).endsWith("する") }, c = conj(f, v);
          return c ? { x, f, v, c } : null;
        }).filter(Boolean);
        // mỗi thể ít nhất một câu trước, tối đa N_ITEMS câu
        const seen = new Set(), first = deck.filter(d => !seen.has(d.f.id) && seen.add(d.f.id)), rest = deck.filter(d => !first.includes(d));
        st.fill = { k: 0, right: 0, checked: false, deck: shuffle(first.concat(rest).slice(0, N_ITEMS)) };
      }
      const z = st.fill;
      if (!z.deck.length) { stage.innerHTML = '<div class="card"><div class="empty"><h3>Chưa có câu cho các thể đã chọn</h3><p>Tab này dành cho động từ. Hãy chọn thêm thể như ます形, て形, た形, ない形, 可能形, 受身形, 使役形, 条件形…</p></div></div>'; return; }
      if (z.k >= z.deck.length) return fin(0, z.right, z.deck.length, `Đúng ${z.right} trên ${z.deck.length}.`);
      const d = z.deck[z.k], l = lab(d.f, d.v), ans = [d.c.s, ...d.c.alts];
      stage.innerHTML = `<div class="card"><div class="quiz"><div class="card__top">${lvtag(d.f.lv)}<span>Chia động từ cho vừa câu</span><span class="card__num">${z.k + 1} <small>/ ${z.deck.length}</small></span></div>
        <div class="say say--sm chia__s" lang="ja"><span>${jp(d.x.pre, { hl: false })}</span><input class="chia__in" type="text" lang="ja" autocomplete="off" autocapitalize="off" spellcheck="false" size="${Math.max(6, plain(d.c.s).length + 3)}" data-in aria-label="Chỗ trống" ${z.checked ? "readonly" : ""}><span>${jp(d.x.post, { hl: false })}</span></div>
        <div class="card__hint">${esc(d.x.vi)}</div>
        <div class="chia__base"><span>${d.f.id === "jisho" ? "Dạng ます" : "Từ gốc"}</span><b class="jp" lang="ja">${d.f.id === "jisho" ? jp(conj(FM.masu, d.v).s, { hl: false }) : jp(d.v.w, { hl: false })}</b><small>${kindOf(d.v)}</small><span>Chia theo</span><b class="jp" lang="ja">${esc(l.ja)}</b><small>${esc(l.vi)}</small></div>
        <div class="feedback" aria-live="polite"></div><div class="card__actions"><button class="btn btn--primary" type="button" data-chk>Kiểm tra</button><button class="btn btn--primary" type="button" data-next hidden>${z.k + 1 >= z.deck.length ? "Xem kết quả" : "Câu tiếp"}</button><button class="btn btn--ghost btn--sm" type="button" data-skip>Xem đáp án</button></div></div></div>`;
      const inp = $("[data-in]", stage); inp.focus({ preventScroll: true });
      const full = () => `${d.x.pre}${d.c.s}${d.x.post}`;
      const reveal = good => {
        z.checked = true; if (good) z.right++; rec(d, good); inp.readOnly = true; inp.classList.add(good ? "is-right" : "is-wrong");
        const fb = $(".feedback", stage); fb.className = "feedback " + (good ? "ok" : "no");
        fb.innerHTML = verdictHTML(good, pickWord(good), `Đáp án: <b class="jp" lang="ja">${jp(d.c.s, { hl: false })}</b>${ans.length > 1 ? ` · cũng đúng: ${ans.slice(1).map(a => jp(a, { hl: false })).join("、")}` : ""}<br><span class="jp" lang="ja">${jp(full(), { hl: false })}</span> <button class="icon-btn" type="button" data-say="${esc(kana(full()))}">${ICON_SPEAK}</button>`);
        $$("[data-say]", fb).forEach(b => b.onclick = () => speak(b.dataset.say));
        verdict(fb, good); good ? celebrate(inp) : (wobble(inp), buzz());
        $("[data-chk]", stage).hidden = true; $("[data-skip]", stage).hidden = true; $("[data-next]", stage).hidden = false; $("[data-next]", stage).focus({ preventScroll: true });
      };
      const check = () => { if (z.checked) return; const a = inp.value.trim(); if (!a) return; reveal(ok1({ s: d.c.s, alts: d.c.alts }, a)); };
      $("[data-chk]", stage).onclick = check; $("[data-skip]", stage).onclick = () => { if (!z.checked) reveal(false); };
      inp.addEventListener("keydown", ev => { if (ev.key === "Enter" && !ev.isComposing) { ev.preventDefault(); z.checked ? $("[data-next]", stage).click() : check(); } });
      $("[data-next]", stage).onclick = () => { z.k++; z.checked = false; pFill(); };
    }
    function pMatch() {
      if (!st.match) { const seen = new Set(), deck = st.items.filter(it => !seen.has(plain(it.s)) && seen.add(plain(it.s))); st.match = { deck, round: 0, miss: 0, pairs: 0, done: {}, sel: null, order: null }; }
      const m = st.match, set = m.deck.slice(m.round * 5, m.round * 5 + 5);
      if (!set.length) return fin(0, m.pairs, m.pairs + m.miss, `Ghép nhầm ${m.miss} lần.`);
      if (!m.order) m.order = { L: shuffle(set), R: shuffle(set) };
      const idx = it => st.items.indexOf(it);
      stage.innerHTML = `<div class="card"><div class="match"><div class="card__top"><span>Ghép từ + thể với dạng đúng</span><span class="card__num">Lượt ${m.round + 1} <small>/ ${Math.ceil(m.deck.length / 5)}</small></span></div>
        <div class="match__grid"><div class="match__col">${m.order.L.map(it => `<button class="tile jp-tile" type="button" lang="ja" data-l="${idx(it)}" ${m.done[idx(it)] ? "disabled" : ""}>${jp(it.v.w, { hl: false })}<small> → ${esc(lab(it.f, it.v).ja)}</small></button>`).join("")}</div>
          <div class="match__col">${m.order.R.map(it => `<button class="tile jp-tile" type="button" lang="ja" data-r="${idx(it)}" ${m.done[idx(it)] ? "disabled" : ""}>${jp(it.s, { hl: false })}</button>`).join("")}</div></div>
        <div class="match__foot"><span>Ghép nhầm: <b>${m.miss}</b></span></div></div></div>`;
      $$(".tile", stage).forEach(t => t.addEventListener("click", () => {
        const side = t.dataset.l != null ? "l" : "r", id = t.dataset.l ?? t.dataset.r;
        if (!m.sel || m.sel.side === side) { $$(".tile.is-sel", stage).forEach(x => x.classList.remove("is-sel")); m.sel = { side, id }; t.classList.add("is-sel"); return; }
        const o = m.sel; m.sel = null; $$(".tile.is-sel", stage).forEach(x => x.classList.remove("is-sel"));
        if (o.id === id) {
          m.done[id] = 1; m.pairs++; rec(st.items[+id], true);
          const pr = $$(`[data-l="${id}"],[data-r="${id}"]`, stage); pr.forEach(x => { x.classList.add("is-hit"); celebrate(x); });
          setTimeout(() => pr.forEach(x => { x.disabled = true; x.classList.add("is-done"); }), 380);
          if (m.order.L.every(it => m.done[idx(it)])) setTimeout(() => { m.round++; m.order = null; pMatch(); }, 1000);
        } else {
          m.miss++; rec(st.items[+(side === "l" ? id : o.id)], false); const a = $(`[data-${o.side}="${o.id}"]`, stage);
          [t, a].forEach(x => { x.classList.add("is-wrong"); wobble(x); setTimeout(() => x.classList.remove("is-wrong"), 500); }); buzz(); $(".match__foot b", stage).textContent = m.miss;
        }
      }));
    }
    paint();
    SB.setCur({ refresh: paint });
  }

  SB.the = { route(b, c) { if (!b) return list(); if (b === "luyen") return setup(new URLSearchParams((location.hash.split("?")[1]) || "")); if (b === "bang") return table(); return detail(b); } };
})();
