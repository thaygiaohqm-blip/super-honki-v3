/* Super Bunpou - Số đếm (助数詞): danh mục, bảng đọc, luyện tập */
(() => {
  "use strict";
  const { S, mark, stateOf, esc, jp, rich, kana, plain, hira, speak, toast, $, $$, shuffle, band, lvtag, ICON_SPEAK, ICON_FLIP, celebrate, wobble, verdict, buzz, pickWord, verdictHTML, doneHTML, afterDone, romaji } = SB;
  const main = $("#main");
  const CATS = [
    { id: "chung", vi: "Đếm đồ vật thông thường" }, { id: "nguoi", vi: "Người" }, { id: "tg", vi: "Thời gian và lịch" },
    { id: "sach", vi: "Vật dẹt, sách, máy móc, đồ dùng" }, { id: "cong", vi: "Nhà cửa, trường học, công ty, công trình" }, { id: "xe", vi: "Tàu thuyền, máy bay, toa tàu" },
    { id: "dv", vi: "Động vật" }, { id: "an", vi: "Đồ ăn, thức uống, thuốc" }, { id: "so", vi: "Số lần, tầng, thứ hạng, tỉ lệ" },
    { id: "ngon", vi: "Bài hát, từ ngữ, câu hỏi, tập phim" }, { id: "do", vi: "Tuổi, tiền, đo lường" }
  ];
  // [id, ký hiệu, nhóm, cấp, tên, đếm gì, 11 cách đọc (1–10, 何; phân tách / là cách đọc khác cũng đúng), lưu ý, ví dụ ja, vi]
  const RAW = window.SB_DEM || { D: [], OBJ: [] };
  const D = RAW.D.map(l => {
    const [id, sym, cat, lv, name, what, rd, note, ja, vi] = l.split("|");
    return { id, sym, cat, lv, name, what, rd: rd.split(",").map(x => x.split("/")), note, ex: [ja, vi], objs: [] };
  });
  const CM = Object.fromEntries(D.map(c => [c.id, c]));
  RAW.OBJ.forEach(([cid, ja, vi, alt]) => { if (CM[cid]) CM[cid].objs.push({ ja, vi, alt: (alt || "").split(",").filter(Boolean) }); });
  const NUMS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "何"];
  const nn = (c, i) => `${i === 10 ? "何" : i + 1}${c.sym.length ? c.sym : ""}`;
  const st = id => stateOf("dem:" + id);
  const RULES = `<p>Hầu hết các trợ số từ đi sau số đếm 1–10 theo một vài quy luật. Học nhóm theo âm đầu của trợ số từ sẽ nhớ nhanh hơn.</p>
    <ul class="gform"><li><b>Hàng か・さ・た (こ, かい, さい, つう…)</b>: số 1, 6, 8, 10 đổi thành âm ngắt: いっ, ろっ, はっ, じゅっ. Ví dụ いっこ, ろっかい.</li>
    <li><b>Hàng は (ほん, はい, ひき)</b>: sau 1, 6, 8, 10 chuyển thành ぱ-hàng (ぽん, ぱい, ぴき); sau 3 và 何 chuyển thành ば-hàng (ぼん, ばい, びき); còn lại giữ nguyên.</li>
    <li><b>分 (ふん/ぷん)</b>: ぷん sau 1, 3, 4, 6, 8, 10 và 何; ふん sau 2, 5, 7, 9.</li>
    <li><b>Số 4, 7, 9</b>: thường đọc よん, なな, きゅう. Ngoại lệ phải nhớ: 4時 よじ, 7時 しちじ, 9時 くじ, 4月 しがつ, 4円 よえん, 4人 よにん, 4年 よねん.</li>
    <li><b>Ngoại lệ hoàn toàn</b>: ひとり、ふたり (1, 2 người), ngày trong tháng (ついたち, ふつか…), tuổi 20 (はたち).</li></ul>`;

  function list() {
    SB.setNav("dem");
    main.innerHTML = band({ big: "数", bigJp: true, title: "Số đếm tiếng Nhật", text: "Hơn tám mươi trợ số từ (助数詞) từ N5 đến N2: bảng đọc từ 1 đến 10, quy tắc biến âm, cách chọn đơn vị đếm cho đồ vật và luyện tập.", meta: `<b>${D.length}</b><span>trợ số từ</span>`,
        extra: '<div class="band__cta"><a class="btn btn--primary" href="#/dem/luyen">Luyện số đếm</a><a class="btn btn--ghost" href="#/dem/quy-tac">Quy tắc biến âm</a></div>' }) +
      `<section class="sec"><div class="wrap">${CATS.map(g => {
        const its = D.filter(c => c.cat === g.id);
        return `<div class="sec__head"><h2>${esc(g.vi)}</h2></div><ul class="posrows">${its.map(c => `<li><a href="#/dem/${c.id}"><span><span class="row__ja jp" lang="ja">${jp(c.name.replace(/\(.*\)/, ""), { hl: false })}</span><br><span class="row__vi">${esc(c.what)}</span></span>
          <span class="row__side">${lvtag(c.lv)} ${st(c.id) === "ok" ? '<span class="state state--ok">Đã luyện</span>' : st(c.id) === "rv" ? '<span class="state state--rv">Cần ôn</span>' : ""}</span></a></li>`).join("")}</ul>`;
      }).join("")}</div></section>`;
    SB.setCur({ refresh: list });
  }
  function rules() {
    SB.setNav("dem");
    main.innerHTML = band({ big: "規則", bigJp: true, crumb: "Số đếm", crumbHref: "#/dem", title: "Quy tắc biến âm", text: "Những quy luật chung giúp bạn không phải học thuộc từng chữ một.", compact: true }) +
      `<section class="sec"><div class="wrap"><section class="gbox">${RULES}</section><div class="tablewrap"><table class="ctable"><thead><tr><th>Trợ số từ</th>${NUMS.map(n => `<th>${n}</th>`).join("")}</tr></thead>
        <tbody>${D.filter(c => !["tsu", "nichi"].includes(c.id)).map(c => `<tr><th><a href="#/dem/${c.id}" class="jp" lang="ja">${esc(c.sym)}</a></th>${c.rd.map(r => `<td class="jp" lang="ja">${esc(r[0])}</td>`).join("")}</tr>`).join("")}</tbody></table></div></div></section>`;
    SB.setCur({ refresh: rules });
  }
  function detail(id) {
    const c = CM[id]; if (!c) return SB.notFound();
    SB.setNav("dem");
    const i = D.indexOf(c), prev = D[i - 1], next = D[i + 1];
    main.innerHTML = band({ big: c.sym.slice(0, 2), bigJp: true, crumb: "Số đếm", crumbHref: "#/dem", title: `<span class="jp" lang="ja">${esc(c.name)}</span>`, text: esc(c.what), compact: true, meta: lvtag(c.lv) }) +
      `<section class="sec gram"><div class="wrap gram__in"><article class="gram__main">
        <section class="gbox"><h2>Bảng đọc</h2><div class="tablewrap"><table class="ctable"><thead><tr>${NUMS.map(n => `<th>${n}</th>`).join("")}</tr></thead><tbody><tr>${c.rd.map((r, k) => `<td class="jp" lang="ja">${r.map(x => `<button class="rdbtn" type="button" data-say="${esc(x)}">${esc(x)}</button>`).join("<br>")}</td>`).join("")}</tr></tbody></table></div><p class="muted">Bấm vào từng cách đọc để nghe. Dấu “/” là các cách đọc cùng được chấp nhận.</p></section>
        <section class="gbox gbox--note"><h2>Lưu ý</h2><p>${esc(c.note)}</p></section>
        ${c.objs.length ? `<section class="gbox"><h2>Hay dùng để đếm</h2><ul class="objlist">${c.objs.map(o => `<li><span class="jp" lang="ja">${jp(o.ja, { hl: false })}</span><span class="muted">${esc(o.vi)}${o.alt.length ? ` · cũng dùng ${o.alt.map(a => esc(CM[a].sym)).join("、")}` : ""}</span></li>`).join("")}</ul></section>` : ""}
        <section class="gbox"><h2>Ví dụ</h2><ol class="gex-list"><li class="gex"><span class="gex__n">1</span><div class="gex__b"><div class="gex__ja" lang="ja">${jp(c.ex[0])}</div>${S.romaji ? `<div class="romaji">${esc(romaji(kana(c.ex[0])))}</div>` : ""}<div class="gex__vi">${esc(c.ex[1])}</div></div><button class="icon-btn gex__say" type="button" data-say="${esc(plain(c.ex[0]))}" aria-label="Nghe">${ICON_SPEAK}</button></li></ol></section>
        <section class="gbox gbox--try"><h2>Luyện trợ số từ này</h2><a class="btn btn--primary" href="#/dem/luyen?c=${c.id}">Luyện ${esc(c.sym)}</a></section>
        <nav class="unitnav gnav">${prev ? `<a class="unitnav__a" href="#/dem/${prev.id}">← ${esc(prev.sym)}</a>` : "<span></span>"}${next ? `<a class="unitnav__a" href="#/dem/${next.id}">${esc(next.sym)} →</a>` : "<span></span>"}</nav>
      </article></div></section>`;
    $$("[data-say]", main).forEach(b => b.addEventListener("click", () => speak(b.dataset.say)));
    SB.setCur({ refresh: () => detail(id) });
  }

  function setup(q) {
    SB.setNav("dem");
    const sel = new Set((q.get("c") || "").split(",").filter(x => CM[x]));
    const draw = () => {
      main.innerHTML = band({ big: "練", bigJp: true, crumb: "Số đếm", crumbHref: "#/dem", title: "Luyện số đếm", text: "Học cách đọc (viết hiragana, ghép cặp, trắc nghiệm) và học cách chọn đơn vị đếm cho từng đồ vật. Chọn trợ số từ muốn luyện rồi bắt đầu.", compact: true }) +
        `<section class="sec"><div class="wrap"><div class="setup"><h3>Chọn trợ số từ</h3>
          <div class="chips chips--wrap"><button class="chip" type="button" data-all="n5">Mọi chữ N5</button><button class="chip" type="button" data-all="n4">Đến N4</button><button class="chip" type="button" data-all="n3">Đến N3</button><button class="chip" type="button" data-all="*">Tất cả</button><button class="chip" type="button" data-all="">Bỏ chọn</button></div>
          <div class="chips chips--wrap">${CATS.map(g => `<button class="chip" type="button" data-cat="${g.id}">${esc(g.vi)}</button>`).join("")}</div>
          <div class="chips chips--wrap">${D.map(c => `<button class="chip jp" lang="ja" type="button" data-c="${c.id}" aria-pressed="${sel.has(c.id)}">${esc(c.sym)} <small>${c.lv.toUpperCase()}</small></button>`).join("")}</div>
          <div class="card__actions"><button class="btn btn--primary" type="button" data-go ${sel.size ? "" : "disabled"}>Bắt đầu (${sel.size} trợ số từ)</button></div></div></div></section>`;
      $$("[data-c]").forEach(b => b.onclick = () => { sel.has(b.dataset.c) ? sel.delete(b.dataset.c) : sel.add(b.dataset.c); draw(); });
      $$("[data-all]").forEach(b => b.onclick = () => { sel.clear(); const k = b.dataset.all; const L = { n5: ["n5"], n4: ["n5", "n4"], n3: ["n5", "n4", "n3"] }; D.forEach(c => { if (k === "*" || (L[k] && L[k].includes(c.lv))) sel.add(c.id); }); draw(); });
      $$("[data-cat]").forEach(b => b.onclick = () => { D.filter(c => c.cat === b.dataset.cat).forEach(c => sel.add(c.id)); draw(); });
      $("[data-go]").onclick = () => session([...sel].map(id => CM[id]));
    };
    draw(); SB.setCur({ refresh: draw });
  }
  function makeItems(cs, n = 30) {
    const pairs = shuffle(cs.flatMap(c => c.rd.map((r, i) => ({ c, i, r })))).slice(0, n);
    return pairs.map(({ c, i, r }) => ({ c, i, r, ans: r[0], q: nn(c, i) }));
  }
  const good = (it, a) => it.r.some(x => hira(x) === hira(a.replace(/\s/g, "")));
  function distract(it) {
    const out = new Set(); const want = it.ans;
    it.c.rd.forEach((r, k) => { if (k !== it.i && r[0] !== want) out.add(r[0]); });
    D.filter(x => x.id !== it.c.id).forEach(x => { if (x.rd[it.i] && x.rd[it.i][0] !== want) out.add(x.rd[it.i][0].replace(x.sym, it.c.sym)); });
    return shuffle([...out].filter(x => !it.r.includes(x))).slice(0, 3);
  }
  /* ---- chọn đơn vị đếm: (1) đồ vật → đơn vị, (2) điền đơn vị vào câu ---- */
  const LEAD = /^[〇一二三四五六七八九十百千万何]+/;
  function sentOf(c) {
    const m = c.ex[0].match(/\{([^}]*)\}/); if (!m) return null;
    const lead = (m[1].replace(/\[[^\]]*\]/g, "").match(LEAD) || [])[0]; if (!lead) return null;
    return c.ex[0].slice(0, m.index) + lead + "（　　）" + c.ex[0].slice(m.index + m[0].length);
  }
  // các cặp có thể thay thế nhau trong nhiều ngữ cảnh: không dùng làm đáp án nhiễu của nhau
  const EQUIV = [["seki_ship", "sou_boat"], ["ko", "tsu"], ["nin", "mei"], ["mai", "chaku"], ["satsu", "kan_vol"], ["wa", "hiki"], ["ken", "ko_house"], ["ken", "kenji"], ["dai", "kyaku"], ["hon", "tsuu"], ["tsuu", "kenji"], ["hon", "kan_can"], ["ko", "hako"], ["ko", "fukuro"], ["ko", "kire"], ["ko", "sara"], ["ko", "kan_sushi"], ["tou_build", "ken"], ["ko", "tsubu"], ["ko", "jou_pill"], ["ki_build", "ki_plane"], ["tou", "hiki"]];
  const COMMON = ["ko", "hon", "mai", "dai", "satsu", "hiki", "tsu", "nin", "hai", "kai_f"];
  function unitOpts(c, alt) {
    const near = new Set(EQUIV.filter(p => p.includes(c.id)).flat());
    const okSym = new Set([c.sym, ...alt.map(a => CM[a].sym)]), bad = x => okSym.has(x.sym) || x.id === c.id || near.has(x.id) || (x.id === "tsu" && c.id !== "tsu");
    const out = [];
    const take = list => { for (const x of list) { if (out.length >= 3) break; if (!bad(x) && !out.some(y => y.sym === x.sym)) out.push(x); } };
    take(shuffle(D.filter(x => x.cat === c.cat)).slice(0, 2)); take(shuffle(COMMON.map(i => CM[i]))); take(shuffle(D));
    return shuffle([{ c, ok: true }, ...out.map(x => ({ c: x }))]);
  }
  function makeUnitItems(cs, n = 20) {
    const pool = [];
    cs.forEach(c => { c.objs.forEach(o => pool.push({ type: "obj", c, o, alt: o.alt })); const st = sentOf(c); if (st) pool.push({ type: "sent", c, st, alt: [] }); });
    return shuffle(pool).slice(0, n).map(it => Object.assign(it, { opts: unitOpts(it.c, it.alt) }));
  }
  function session(cs) {
    const s = { mode: "card", items: makeItems(cs), i: 0, flip: false, quiz: null, match: null, rw: null, un: null };
    const reset = () => { s.items = makeItems(cs); s.i = 0; s.flip = false; s.quiz = s.match = s.rw = s.un = null; };
    main.innerHTML = band({ big: "練", bigJp: true, crumb: "Chọn lại", crumbHref: "#/dem/luyen", title: "Luyện số đếm", text: cs.map(c => c.sym).join("、"), compact: true }) +
      `<section class="study"><div class="wrap"><div class="study__bar"><div class="modes" role="group" aria-label="Chế độ">
        <button type="button" data-mode="card"><span class="jp" lang="ja">札</span>Học thẻ</button><button type="button" data-mode="rw"><span class="jp" lang="ja">書</span>Viết lại</button>
        <button type="button" data-mode="match"><span class="jp" lang="ja">合</span>Ghép cặp</button><button type="button" data-mode="quiz"><span class="jp" lang="ja">択</span>Trắc nghiệm cách đọc</button><button type="button" data-mode="unit"><span class="jp" lang="ja">助</span>Chọn đơn vị đếm</button></div>
        <div class="study__stats"><button class="btn btn--ghost btn--sm" type="button" data-new>Bộ khác</button></div></div><div data-stage></div></div></section>`;
    const stage = $("[data-stage]");
    $("[data-new]").onclick = () => { reset(); paint(); };
    $$("[data-mode]").forEach(b => b.onclick = () => { s.mode = b.dataset.mode; paint(); });
    const rec = (it, ok) => mark("dem:" + it.c.id, ok ? "ok" : "rv");
    const q = it => `<div class="say" lang="ja">${esc(it.q)}</div><div class="card__hint">${esc(it.c.what)}</div>`;
    const fin = (r, t, x) => { stage.innerHTML = doneHTML(`Xong ${t} mục`, r, t, x, '<button class="btn btn--primary" type="button" data-again>Bộ mới</button>'); afterDone(stage, r, t); $("[data-again]", stage).onclick = () => { reset(); paint(); }; };
    function paint() { $$("[data-mode]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === s.mode)); ({ card: pCard, match: pMatch, quiz: pQuiz, rw: pRw, unit: pUnit })[s.mode](); }
    let dir = "";
    function pCard() {
      const it = s.items[s.i];
      const top = `${lvtag(it.c.lv)}<span>${esc(it.c.name.replace(/\(.*\)/, ""))}</span><span class="card__num">${String(s.i + 1).padStart(2, "0")} <small>/ ${s.items.length}</small></span>`;
      const back = `<div class="say" lang="ja">${esc(it.ans)}</div>${it.r.length > 1 ? `<div class="card__hint">Cũng đúng: ${esc(it.r.slice(1).join("、"))}</div>` : ""}`;
      SB.simpleCard(stage, { top, front: q(it), back, say: it.ans, flip: s.flip, dir, onAct: a => {
        if (a === "prev") s.i = (s.i - 1 + s.items.length) % s.items.length; else s.i = (s.i + 1) % s.items.length;
        if (a === "ok" || a === "rv") rec(it, a === "ok");
        dir = a === "prev" ? "prev" : "next"; s.flip = false; pCard(); }, onFlip: f => { s.flip = f; } });
      dir = "";
    }
    function pUnit() {
      if (!s.un) s.un = { k: 0, right: 0, deck: makeUnitItems(cs) };
      const z = s.un;
      if (!z.deck.length) { stage.innerHTML = '<div class="card"><p class="muted">Các trợ số từ đã chọn chưa có câu hỏi chọn đơn vị. Hãy chọn thêm trợ số từ.</p></div>'; return; }
      if (z.k >= z.deck.length) return fin(z.right, z.deck.length, `Đúng ${z.right} trên ${z.deck.length}.`);
      const it = z.deck[z.k];
      const ask = it.type === "obj"
        ? `<p class="muted">Đếm vật này bằng đơn vị nào?</p><div class="say" lang="ja">${jp(it.o.ja, { hl: false })}</div><div class="card__hint">${esc(it.o.vi)}</div>`
        : `<p class="muted">Điền đơn vị đếm vào chỗ trống</p><div class="unitsent jp" lang="ja">${jp(it.st, { hl: false }).replace("（　　）", '<span class="hole">（　　）</span>')}</div><div class="card__hint">${esc(it.c.ex[1])}</div>`;
      stage.innerHTML = `<div class="card"><div class="quiz"><div class="card__top"><span>${it.type === "obj" ? "Chọn đơn vị đếm" : "Điền đơn vị vào câu"}</span><span class="card__num">${z.k + 1} <small>/ ${z.deck.length}</small></span></div><div class="quiz__q">${ask}</div>
        <div class="opts">${it.opts.map((o, i) => `<button class="opt jp-opt" type="button" data-o="${i}" lang="ja"><span class="k">${i + 1}</span><span class="unitsym">${esc(o.c.sym)}</span></button>`).join("")}</div>
        <div class="feedback" aria-live="polite"></div><div class="card__actions" hidden data-nw><button class="btn btn--primary" type="button" data-next>Câu tiếp</button></div></div></div>`;
      $$("[data-o]", stage).forEach(b => b.onclick = () => {
        const i = +b.dataset.o, ok = !!it.opts[i].ok; if (ok) z.right++; rec({ c: it.c }, ok);
        $$("[data-o]", stage).forEach((x, k) => { x.disabled = true; if (it.opts[k].ok) x.classList.add("is-right"); else if (k === i) x.classList.add("is-wrong"); });
        const c = it.c, rd = [0, 1, 2].map(k => `${k + 1}${c.sym} = ${c.rd[k][0]}`).join("、");
        const fb = $(".feedback", stage); fb.className = "feedback " + (ok ? "ok" : "no");
        fb.innerHTML = verdictHTML(ok, pickWord(ok), `<span class="jp" lang="ja"><b>${esc(c.sym)}</b></span>: ${esc(c.what)}.${it.alt.length ? ` Cũng dùng được: <span class="jp" lang="ja">${it.alt.map(a => esc(CM[a].sym)).join("、")}</span>.` : ""}<br><span class="jp" lang="ja">${esc(rd)}</span>`);
        verdict(fb, ok); ok ? celebrate(b) : (wobble(b), buzz()); $("[data-nw]", stage).hidden = false;
      });
      $("[data-next]", stage).onclick = () => { z.k++; pUnit(); };
    }
    function pQuiz() {
      if (!s.quiz) s.quiz = { k: 0, right: 0, deck: s.items.map(it => ({ it, opts: shuffle([{ t: it.ans, ok: true }, ...distract(it).map(t => ({ t }))]) })) };
      const z = s.quiz; if (z.k >= z.deck.length) return fin(z.right, z.deck.length, `Đúng ${z.right} trên ${z.deck.length}.`);
      const c = z.deck[z.k];
      stage.innerHTML = `<div class="card"><div class="quiz"><div class="card__top"><span>Chọn cách đọc đúng</span><span class="card__num">${z.k + 1} <small>/ ${z.deck.length}</small></span></div><div class="quiz__q">${q(c.it)}</div>
        <div class="opts">${c.opts.map((o, i) => `<button class="opt jp-opt" type="button" data-o="${i}" lang="ja"><span class="k">${i + 1}</span><span>${esc(o.t)}</span></button>`).join("")}</div>
        <div class="feedback" aria-live="polite"></div><div class="card__actions" hidden data-nw><button class="btn btn--primary" type="button" data-next>Câu tiếp</button></div></div></div>`;
      $$("[data-o]", stage).forEach(b => b.onclick = () => {
        const i = +b.dataset.o, ok = !!c.opts[i].ok; if (ok) z.right++; rec(c.it, ok);
        $$("[data-o]", stage).forEach((x, k) => { x.disabled = true; if (c.opts[k].ok) x.classList.add("is-right"); else if (k === i) x.classList.add("is-wrong"); });
        const fb = $(".feedback", stage); fb.className = "feedback " + (ok ? "ok" : "no"); fb.innerHTML = verdictHTML(ok, pickWord(ok), `<span class="jp" lang="ja">${esc(c.it.q)} = ${esc(c.it.ans)}</span>`); verdict(fb, ok); ok ? celebrate(b) : (wobble(b), buzz());
        $("[data-nw]", stage).hidden = false;
      });
      $("[data-next]", stage).onclick = () => { z.k++; pQuiz(); };
    }
    function pRw() {
      if (!s.rw) s.rw = { k: 0, right: 0, checked: false };
      const z = s.rw; if (z.k >= s.items.length) return fin(z.right, s.items.length, `Đúng ${z.right} trên ${s.items.length}.`);
      const it = s.items[z.k];
      stage.innerHTML = `<div class="card"><div class="quiz"><div class="card__top"><span>Viết cách đọc bằng hiragana</span><span class="card__num">${z.k + 1} <small>/ ${s.items.length}</small></span></div><div class="quiz__q">${q(it)}</div>
        <input class="finder rw__in" lang="ja" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Ví dụ: さんぼん" data-in aria-label="Đáp án">
        <div class="feedback" aria-live="polite"></div><div class="card__actions"><button class="btn btn--primary" type="button" data-chk>Kiểm tra</button><button class="btn btn--primary" type="button" data-next hidden>Câu tiếp</button><button class="btn btn--ghost btn--sm" type="button" data-skip>Xem đáp án</button></div></div></div>`;
      const inp = $("[data-in]", stage); inp.focus({ preventScroll: true });
      const reveal = ok => { z.checked = true; if (ok) z.right++; rec(it, ok); inp.readOnly = true;
        const fb = $(".feedback", stage); fb.className = "feedback " + (ok ? "ok" : "no"); fb.innerHTML = verdictHTML(ok, pickWord(ok), `<span class="jp" lang="ja">${esc(it.q)} = ${esc(it.r.join("、"))}</span> <button class="icon-btn" type="button" data-say="${esc(it.ans)}">${ICON_SPEAK}</button>`);
        $$("[data-say]", fb).forEach(b => b.onclick = () => speak(b.dataset.say)); verdict(fb, ok); ok ? celebrate(inp) : (wobble(inp), buzz());
        $("[data-chk]", stage).hidden = true; $("[data-skip]", stage).hidden = true; $("[data-next]", stage).hidden = false; $("[data-next]", stage).focus({ preventScroll: true }); };
      const check = () => { if (z.checked) return; const a = inp.value.trim(); if (a) reveal(good(it, a)); };
      $("[data-chk]", stage).onclick = check; $("[data-skip]", stage).onclick = () => { if (!z.checked) reveal(false); };
      inp.addEventListener("keydown", ev => { if (ev.key === "Enter" && !ev.isComposing) { ev.preventDefault(); z.checked ? $("[data-next]", stage).click() : check(); } });
      $("[data-next]", stage).onclick = () => { z.k++; z.checked = false; pRw(); };
    }
    function pMatch() {
      if (!s.match) s.match = { deck: s.items, round: 0, miss: 0, pairs: 0, done: {}, sel: null, order: null };
      const m = s.match, set = m.deck.slice(m.round * 5, m.round * 5 + 5);
      if (!set.length) return fin(m.pairs, m.pairs + m.miss, `Ghép nhầm ${m.miss} lần.`);
      if (!m.order) { m.order = { L: shuffle(set), R: shuffle(set) }; }
      const idx = it => s.items.indexOf(it);
      stage.innerHTML = `<div class="card"><div class="match"><div class="card__top"><span>Ghép số + trợ số từ với cách đọc</span><span class="card__num">Lượt ${m.round + 1} <small>/ ${Math.ceil(m.deck.length / 5)}</small></span></div>
        <div class="match__grid"><div class="match__col">${m.order.L.map(it => `<button class="tile jp-tile" type="button" lang="ja" data-l="${idx(it)}" ${m.done[idx(it)] ? "disabled" : ""}>${esc(it.q)}</button>`).join("")}</div>
          <div class="match__col">${m.order.R.map(it => `<button class="tile jp-tile" type="button" lang="ja" data-r="${idx(it)}" ${m.done[idx(it)] ? "disabled" : ""}>${esc(it.ans)}</button>`).join("")}</div></div><div class="match__foot"><span>Ghép nhầm: <b>${m.miss}</b></span></div></div></div>`;
      $$(".tile", stage).forEach(t => t.addEventListener("click", () => {
        const side = t.dataset.l != null ? "l" : "r", id = t.dataset.l ?? t.dataset.r;
        if (!m.sel || m.sel.side === side) { $$(".tile.is-sel", stage).forEach(x => x.classList.remove("is-sel")); m.sel = { side, id }; t.classList.add("is-sel"); return; }
        const o = m.sel; m.sel = null; $$(".tile.is-sel", stage).forEach(x => x.classList.remove("is-sel"));
        const a = s.items[+o.id], b = s.items[+id], match = o.id === id || (a.ans === b.ans);
        if (match) { const ids = [o.id, id]; m.done[o.id] = m.done[id] = 1; m.pairs++; rec(s.items[+(side === "l" ? id : o.id)], true);
          const pr = $$(`[data-${o.side}="${o.id}"],[data-${side}="${id}"]`, stage); pr.forEach(x => { x.classList.add("is-hit"); celebrate(x); }); setTimeout(() => pr.forEach(x => { x.disabled = true; x.classList.add("is-done"); }), 380);
          if (m.order.L.every(it => m.done[idx(it)])) setTimeout(() => { m.round++; m.order = null; pMatch(); }, 1000);
        } else { m.miss++; rec(s.items[+(side === "l" ? id : o.id)], false); const el = $(`[data-${o.side}="${o.id}"]`, stage); [t, el].forEach(x => { x.classList.add("is-wrong"); wobble(x); setTimeout(() => x.classList.remove("is-wrong"), 500); }); buzz(); $(".match__foot b", stage).textContent = m.miss; }
      }));
    }
    paint(); SB.setCur({ refresh: paint });
  }
  SB.dem = { route(b) { if (!b) return list(); if (b === "luyen") return setup(new URLSearchParams(location.hash.split("?")[1] || "")); if (b === "quy-tac") return rules(); return detail(b); } };
})();
