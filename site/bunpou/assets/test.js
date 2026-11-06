/* Super Bunpou - Test đầu vào N5 → N1 */
(() => {
  "use strict";
  const { store, esc, jp, rich, shuffle, band, lvtag, $, $$, verdict, celebrate, wobble, buzz, pickWord, verdictHTML, meter, speak, plain } = SB;
  const main = $("#main");
  const RAW = {
    n5: `私は毎朝コーヒー（　）飲みます。|を|が|に|で|1|Tân ngữ của động từ 飲む đi với trợ từ を.
図書館（　）本を読みます。|で|を|に|が|1|Nơi diễn ra hành động dùng trợ từ で.
昨日、友達（　）会いました。|を|に|が|で|2|会う đi với đối tượng gặp bằng trợ từ に.
これは私（　）かばんです。|の|を|に|は|1|Sở hữu: danh từ A の danh từ B.
日本語は難しいです（　）、おもしろいです。|が|から|ので|て|1|Hai vế trái nghĩa nối bằng が (nhưng).
明日は日曜日ですから、学校へ行き（　）。|ません|ないです|ませんでした|なかった|1|Thể lịch sự phủ định hiện tại/tương lai là ません.
部屋に誰（　）いません。|も|が|か|で|1|誰も + phủ định: không có ai.
窓を開け（　）ください。|て|た|ない|ます|1|Nhờ vả: động từ thể て + ください.
私は泳ぐ（　）できます。|ことが|ものが|ところが|ときが|1|Động từ nguyên thể + ことができる: có thể làm gì.
駅まで歩いて10分（　）かかります。|ぐらい|から|まで|ごろ|1|Ước chừng thời lượng: ぐらい.`,
    n4: `雨が降っ（　）、試合は中止になります。|たら|たり|たい|ない|1|Điều kiện giả định: Vたら, nếu mưa thì...
先生に宿題を忘れて、（　）。|叱られました|叱りました|叱ります|叱って|1|Bị thầy mắng: thể bị động 叱られる.
日本語が話せる（　）なりました。|ように|ために|ことに|ばかりに|1|Thay đổi trạng thái (khả năng): ようになる.
昨日は食べ（　）ので、お腹が痛いです。|すぎた|すぎて|すぎる|すぎ|1|Vすぎる ở quá khứ + ので.
母は私に野菜を食べ（　）。|させました|されました|られました|ました|1|Thể sai khiến: mẹ bắt con ăn.
日曜日は掃除をしたり、洗濯を（　）します。|したり|して|したら|すれば|1|Liệt kê: ~たり~たりする.
窓が開け（　）あります。|て|ない|た|ず|1|Trạng thái còn lại do ai đó cố ý làm: Vてある.
医者に「たばこを吸わない（　）」と言われました。|ように|ことに|ために|のに|1|Lời khuyên gián tiếp: ~ないようにと言われた.
せっかく勉強した（　）、試験に落ちた。|のに|ので|から|と|1|Kết quả trái với kỳ vọng: のに.
この薬は一日三回、食事の（　）飲んでください。|あとで|あとに|あとの|あとを|1|N の後で: sau khi.`,
    n3: `彼は今日来る（　）だったが、急に用事ができて来られなくなった。|つもり|はず|わけ|ため|1|Dự định đã có nhưng không thực hiện được: つもりだった.
この道を行くと、駅に着く（　）です。|はず|つもり|わけ|ところ|1|Suy đoán có căn cứ: はずだ.
駅へ行く（　）、この手紙を出してきてくれませんか。|ついでに|たびに|ばかりに|うちに|1|Nhân tiện làm việc khác: Vるついでに.
薬を飲んだ（　）、熱が下がった。|おかげで|せいで|ために|くせに|1|Kết quả tốt nhờ nguyên nhân: おかげで.
食べた（　）なのに、もうお腹が空いた。|ばかり|ところ|ほど|まま|1|Vừa mới làm xong: Vたばかり.
やっと日本に来られた（　）、まだ友達がいない。|ものの|ものか|ものなら|ものだ|1|Thừa nhận vế trước nhưng vế sau không như mong đợi: ものの.
電気をつけた（　）寝てしまった。|まま|ところ|ばかり|うち|1|Giữ nguyên trạng thái mà làm việc khác: Vたまま.
来週から運動をする（　）にした。|こと|もの|はず|わけ|1|Quyết định của bản thân: ことにする.
彼はまだ若い（　）、しっかりしている。|わりに|のに|ものの|くせに|1|Trái với kỳ vọng thông thường: わりに.
先生に言われた（　）に、宿題を出した。|とおり|まま|ため|ように|1|Làm đúng như đã được nói: とおりに.`,
    n2: `彼は病気（　）、毎日会社に来ている。|にもかかわらず|にしたがって|にとって|に対して|1|Nghịch tiếp trang trọng: にもかかわらず.
この店は味がいい（　）、サービスもいい。|うえに|わりに|くせに|だけに|1|Bổ sung thêm điều tốt/xấu: うえに.
年をとる（　）、体力が落ちる。|につれて|に対して|にとって|にわたって|1|Thay đổi song song: につれて.
会議は明日の午後に行われる（　）。|ことになっている|ことにしている|ようにしている|ものにしている|1|Quy định, sắp đặt đã có: ことになっている.
彼女の話を聞いて、泣かず（　）いられなかった。|には|では|に|で|1|Không thể không: ずにはいられない.
努力した（　）、成功したのだ。|からこそ|からには|ものの|とはいえ|1|Nhấn mạnh lý do chính: からこそ.
約束した（　）、必ず守ります。|からには|からこそ|としても|とはいえ|1|Đã làm điều đó thì phải: からには.
忙しい（　）、電話一本くらいできるはずだ。|とはいえ|にしたがって|ことから|ばかりか|1|Dù nói vậy nhưng: とはいえ.
この仕事は私一人（　）無理だ。|では|には|とは|へは|1|Điều kiện/giới hạn: 一人では無理.
彼女は優しい（　）、責任感も強い。|ばかりか|ばかりに|とばかり|ばかり|1|Không những... mà còn: ばかりか.`
  };
  const bank = {};
  for (const [lv, txt] of Object.entries(RAW)) bank[lv] = txt.split("\n").map(l => { const [q, a, b, c, d, ans, exp] = l.split("|"); return { q, o: [a, b, c, d], ans: +ans, exp }; });
  const PER = 6, PASS = 4, ORDER = ["n5", "n4", "n3", "n2", "n1"];

  async function route() {
    SB.setNav("test");
    const saved = store.get("placement", null);
    main.innerHTML = band({ big: "試", bigJp: true, title: "Test đầu vào", text: "Làm từ N5 lên N1, mỗi cấp 6 câu. Đúng từ 4 câu thì sang cấp tiếp theo; kết quả gợi ý bạn nên bắt đầu học từ cấp nào.", meta: `<b>${PER * 5}</b><span>câu tối đa</span>` }) +
      `<section class="sec"><div class="wrap">${saved ? resultHTML(saved, true) : ""}<div class="card__actions"><button class="btn btn--primary" type="button" data-start>${saved ? "Làm lại test" : "Bắt đầu"}</button></div></div></section>`;
    $("[data-start]").onclick = start;
    SB.setCur({ refresh: route });
  }
  function resultHTML(r, old) {
    return `<div class="presult"><h2>${old ? "Kết quả gần nhất" : "Kết quả của bạn"}</h2><p class="presult__lv">Nên bắt đầu từ: <b>${r.start.toUpperCase()}</b></p>
      <ul class="plist">${ORDER.map(lv => r.s[lv] ? `<li>${lvtag(lv)} <b>${r.s[lv][0]}/${r.s[lv][1]}</b> ${meter(r.s[lv][0], r.s[lv][1])} ${r.s[lv][0] >= PASS ? "Đạt" : "Chưa đạt"}</li>` : `<li>${lvtag(lv)} <span class="muted">Không làm</span></li>`).join("")}</ul>
      <p>${esc(r.note)}</p><div class="card__actions"><a class="btn btn--primary" href="#/cap-do/${r.start}">Học ${r.start.toUpperCase()}</a><a class="btn btn--ghost" href="#/giao-trinh">Xem giáo trình</a></div></div>`;
  }
  async function start() {
    const fromDocx = async lv => shuffle((await SB.G.load(lv)).tests.flatMap(t => t.qs)).slice(0, PER).map(q => ({ q: q.q, o: q.opts, ans: q.ans, exp: q.exp, rich: true }));
    const docxQ = { n1: await fromDocx("n1"), n2: await fromDocx("n2") };
    const qs = {}; ORDER.forEach(lv => qs[lv] = docxQ[lv] ? docxQ[lv] : shuffle(bank[lv]).slice(0, PER).map(x => { const idx = shuffle([0, 1, 2, 3]), o = idx.map(i => x.o[i]); return { q: x.q, o, ans: idx.indexOf(x.ans - 1) + 1, exp: x.exp }; }));
    const st = { li: 0, k: 0, right: 0, s: {}, ans: null };
    function next() {
      const lv = ORDER[st.li];
      if (st.k >= PER) {
        st.s[lv] = [st.right, PER];
        if (st.right < PASS || st.li === ORDER.length - 1) return finish();
        st.li++; st.k = 0; st.right = 0;
      }
      draw();
    }
    function draw() {
      const lv = ORDER[st.li], q = qs[lv][st.k];
      main.innerHTML = band({ big: lv.toUpperCase(), title: `Câu ${st.k + 1} / ${PER}`, text: `Cấp ${lv.toUpperCase()}`, compact: true }) +
        `<section class="sec"><div class="wrap"><div class="card"><div class="quiz"><div class="quiz__q"><p class="test-ask">Chọn đáp án đúng</p><div class="say say--sm" lang="ja">${jp(q.q, { hl: false })}</div></div>
          <div class="opts">${q.o.map((o, i) => `<button class="opt jp-opt" type="button" data-o="${i}" lang="ja"><span class="k">${i + 1}</span><span>${jp(o, { hl: false })}</span></button>`).join("")}</div>
          <div class="feedback" aria-live="polite"></div><div class="card__actions" hidden data-nw><button class="btn btn--primary" type="button" data-next>Tiếp</button></div></div></div></div></section>`;
      $$("[data-o]").forEach(b => b.onclick = () => {
        const i = +b.dataset.o, ok = i === q.ans - 1; if (ok) st.right++;
        $$("[data-o]").forEach((x, k) => { x.disabled = true; if (k === q.ans - 1) x.classList.add("is-right"); else if (k === i) x.classList.add("is-wrong"); });
        const fb = $(".feedback"); fb.className = "feedback " + (ok ? "ok" : "no"); fb.innerHTML = verdictHTML(ok, pickWord(ok), rich(q.exp)); verdict(fb, ok); ok ? celebrate(b) : (wobble(b), buzz());
        $("[data-nw]").hidden = false; $("[data-next]").focus({ preventScroll: true });
      });
      $("[data-next]").onclick = () => { st.k++; next(); };
    }
    function finish() {
      let start = "n5", note = "";
      const done = ORDER.filter(lv => st.s[lv] && st.s[lv][0] >= PASS);
      if (!done.length) { start = "n5"; note = "Hãy bắt đầu từ nền tảng N5 để chắc kiến thức."; }
      else if (done.length === ORDER.length) { start = "n1"; note = "Bạn vượt qua cả năm cấp. Hãy học N1 để mở rộng và hệ thống hoá."; }
      else { const last = ORDER[ORDER.indexOf(done[done.length - 1]) + 1]; start = last; note = `Bạn vững đến ${done[done.length - 1].toUpperCase()}. Nên bắt đầu từ ${last.toUpperCase()}, rồi quay lại ôn các mẫu hay sai.`; }
      const r = { start, s: st.s, note, t: Date.now() };
      store.set("placement", r); SB.notify();
      main.innerHTML = band({ big: "結果", bigJp: true, title: "Kết quả test đầu vào", compact: true }) + `<section class="sec"><div class="wrap">${resultHTML(r)}<div class="card__actions"><button class="btn btn--ghost" type="button" data-again>Làm lại</button></div></div></section>`;
      $("[data-again]").onclick = start_;
    }
    const start_ = start;
    draw();
  }
  SB.test = { route };
})();
