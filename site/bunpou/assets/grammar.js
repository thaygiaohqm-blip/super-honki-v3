/* Super Bunpou - ngữ pháp: danh sách theo cấp độ, chủ đề, bối cảnh, giáo trình; trang chi tiết; màn luyện tập. */
(() => {
  "use strict";
  const { C, S, P, store, saveS, saveP, mark, stateOf, esc, jp, rich, kana, plain, speak, toast, $, $$, fmt, shuffle, meter, lvtag, band,
    ICON_SPEAK, ICON_FLIP, calm, celebrate, wobble, verdict, glow, buzz, pickWord, verdictHTML, doneHTML, afterDone, romaji, nowSec } = SB;
  const main = $("#main");

  /* ------------------------------------------------------------ dữ liệu */
  const LV = {}, waiting = {};
  SB.register = d => {
    d.pats.forEach(p => { p.lvName = p.lv.toUpperCase(); });
    LV[d.level] = d;
    (waiting[d.level] || []).forEach(f => f.ok(d)); delete waiting[d.level];
  };
  function load(lv) {
    if (LV[lv]) return Promise.resolve(LV[lv]);
    return new Promise((ok, no) => {
      const first = !waiting[lv];
      (waiting[lv] = waiting[lv] || []).push({ ok, no });
      if (!first) return;
      const s = document.createElement("script");
      s.src = `data/gram-${lv}.js`;
      s.onerror = () => { (waiting[lv] || []).forEach(f => f.no(new Error(lv))); delete waiting[lv]; };
      document.head.appendChild(s);
    });
  }
  const readyLevels = () => C.levels.filter(l => l.ready).map(l => l.id);
  const loadAll = () => Promise.all(readyLevels().map(load));
  const allPats = () => readyLevels().flatMap(lv => LV[lv] ? LV[lv].pats : []);
  const patById = id => { const lv = id.split("-")[0]; return LV[lv] && LV[lv].pats.find(p => p.id === id); };
  const levelOf = id => C.levels.find(l => l.id === id);
  const exAll = p => p.senses.flatMap(s => s.ex.map(e => Object.assign({ sense: s }, e)));
  const learnedIn = items => items.reduce((s, p) => s + (P.ok[p.id] ? 1 : 0), 0);
  const THEME = id => C.themes.find(t => t.id === id);
  const CTX = id => C.contexts.find(t => t.id === id);
  const bookOf = id => C.books.find(b => b.id === id);
  const title = p => jp(p.pat, { hl: false });
  const shortMean = p => p.mean.replace(/\(\d\)\s*/g, "").split(/\s{2,}|\.\.\.\s*\(/)[0];
  SB.G = { load, loadAll, allPats, patById, levelOf, exAll, learnedIn, LV, readyLevels, title };

  /* ------------------------------------------------------------ trang chi tiết một mẫu */
  const pill = (href, txt, cls = "") => `<a class="gpill ${cls}" href="${href}">${txt}</a>`;
  function bindSpeak(root) {
    $$("[data-say]", root).forEach(b => b.addEventListener("click", ev => { ev.stopPropagation(); speak(b.dataset.say); }));
  }
  function exHTML(e, i) {
    const t = plain(e.ja);
    return `<li class="gex"><span class="gex__n">${i}</span><div class="gex__b">
      <div class="gex__ja" lang="ja">${jp(e.ja)}</div>
      ${S.romaji ? `<div class="romaji">${esc(romaji(kana(e.ja)))}</div>` : ""}
      <div class="gex__vi">${esc(e.vi)}</div></div>
      <button class="icon-btn gex__say" type="button" data-say="${esc(t)}" aria-label="Nghe câu ví dụ">${ICON_SPEAK}</button></li>`;
  }
  function stateBtns(p) {
    const st = stateOf(p.id);
    return `<div class="gmark" role="group" aria-label="Đánh dấu">
      <button class="btn btn--sm ${st === "rv" ? "btn--coral" : "btn--ghost"}" type="button" data-mk="rv">${st === "rv" ? "Đang cần ôn" : "↺ Chưa thuộc"}</button>
      <button class="btn btn--sm ${st === "ok" ? "btn--primary" : "btn--ghost"}" type="button" data-mk="ok">${st === "ok" ? "✓ Đã học" : "Đánh dấu đã học"}</button></div>`;
  }
  async function detail(id) {
    const lv = id.split("-")[0];
    await load(lv);
    const p = patById(id);
    if (!p) return SB.notFound();
    const D = LV[lv], g = D.groups.find(x => x.n === p.g);
    const siblings = D.pats.filter(x => x.g === p.g), i = siblings.indexOf(p);
    const prev = siblings[i - 1], next = siblings[i + 1];
    let n = 0;
    const senses = p.senses.map(s => `
      <section class="gsense">${p.senses.length > 1 ? `<h3 class="gsense__h"><span class="gsense__n">${s.n}</span>${esc(s.label)}</h3>` : ""}
        <ol class="gex-list">${s.ex.map(e => exHTML(e, ++n)).join("")}</ol></section>`).join("");
    const books = (p.book || []).map(([b, u]) => { const B = bookOf(b); return B ? pill(`#/giao-trinh/${b}/${u}`, `${esc(B.short)} · ${B.unitName} ${u}`, "gpill--book") : ""; }).join("");
    main.innerHTML = band({ big: p.lvName, title: `<span class="gtitle jp" lang="ja">${title(p)}</span>`, crumb: `${p.lvName} · nhóm ${p.g}`, crumbHref: `#/cap-do/${lv}`,
        text: esc(p.mean), meta: `<b>${n}</b><span>câu ví dụ có audio</span>`, compact: true }) + `
      <section class="sec gram"><div class="wrap gram__in">
        <article class="gram__main">
          <div class="gtags">${lvtag(p.lv)}${g ? pill(`#/cap-do/${lv}/nhom/${g.n}`, `Nhóm ${g.n}: ${esc(g.vi)}`) : ""}
            ${p.theme.map(t => THEME(t) ? pill(`#/chu-de/${t}`, esc(THEME(t).vi), "gpill--theme") : "").join("")}
            ${p.ctx.map(t => CTX(t) ? pill(`#/boi-canh/${t}`, esc(CTX(t).vi), "gpill--ctx") : "").join("")}${books}</div>
          ${p.core ? `<div class="gcore"><span class="gcore__k">★ Cốt lõi</span><p>${rich(p.core)}</p></div>` : ""}
          <section class="gbox"><h2>Cấu trúc</h2><ul class="gform">${p.form.map(f => `<li>${rich(f)}</li>`).join("")}</ul></section>
          <section class="gbox"><h2>Giải thích</h2>${p.exp.map(t => `<p>${rich(t)}</p>`).join("")}</section>
          <section class="gbox"><h2>Ví dụ${p.senses.length > 1 ? `, tách theo ${p.senses.length} nghĩa` : ""}</h2>${senses}</section>
          ${p.cmp.length ? `<section class="gbox"><h2>Đối chiếu với ngữ pháp dễ nhầm</h2><ul class="gcmp">${p.cmp.map(c => `<li>${c.id ? `<a class="gcmp__h gcmp__a" href="#/ngu-phap/${c.id}" title="Xem chi tiết mẫu này"><span class="jp" lang="ja">${jp(c.pat, { hl: false })}</span>${c.lv ? lvtag(c.lv) : ""}<span class="gcmp__go" aria-hidden="true">Xem chi tiết →</span></a>` : `<div class="gcmp__h"><span class="jp" lang="ja">${jp(c.pat, { hl: false })}</span>${c.lv ? lvtag(c.lv) : ""}</div>`}<p>${rich(c.desc)}</p></li>`).join("")}</ul></section>` : ""}
          ${p.note.length ? `<section class="gbox gbox--note"><h2>Lưu ý khi sử dụng</h2>${p.note.map(t => `<p>${rich(t)}</p>`).join("")}</section>` : ""}
          <section class="gbox gbox--try"><h2>Thử ngay mẫu này</h2><div id="try"></div></section>
          <nav class="unitnav gnav">${prev ? `<a class="unitnav__a" href="#/ngu-phap/${prev.id}">← ${esc(plain(prev.pat))}</a>` : "<span></span>"}${next ? `<a class="unitnav__a" href="#/ngu-phap/${next.id}">${esc(plain(next.pat))} →</a>` : "<span></span>"}</nav>
        </article>
        <aside class="gram__side"><div class="gside">${stateBtns(p)}
          <a class="btn btn--primary btn--sm" href="#/cap-do/${lv}/nhom/${p.g}">Luyện cả nhóm ${p.g}</a>
          <button class="btn btn--ghost btn--sm" type="button" data-playall>▶ Nghe tất cả ví dụ</button>
          <button class="btn btn--ghost btn--sm" type="button" data-copy>Chép cấu trúc</button></div></aside>
      </div></section>`;
    bindSpeak(main);
    $$("[data-mk]").forEach(b => b.addEventListener("click", () => { mark(p.id, b.dataset.mk); $(".gside .gmark").outerHTML = stateBtns(p); rebindMk(); if (b.dataset.mk === "rv") toast("Đã thêm vào danh sách cần ôn"); }));
    const rebindMk = () => $$("[data-mk]").forEach(b => b.addEventListener("click", () => { mark(p.id, b.dataset.mk); $(".gside .gmark").outerHTML = stateBtns(p); rebindMk(); }));
    $("[data-playall]").onclick = () => { const all = exAll(p).map(e => plain(e.ja)); speakQueue(all); };
    $("[data-copy]").onclick = () => { try { navigator.clipboard.writeText(p.form.join("\n")); toast("Đã chép cấu trúc"); } catch (e) { toast("Trình duyệt chưa cho phép chép"); } };
    miniTry($("#try"), p);
    SB.setCur({ refresh: () => detail(id) });
  }
  let queueTok = 0;
  function speakQueue(list) {
    if (!("speechSynthesis" in window)) return toast("Trình duyệt này chưa hỗ trợ đọc thành tiếng.");
    const tok = ++queueTok; speechSynthesis.cancel();
    const go = i => {
      if (tok !== queueTok || i >= list.length) return;
      const u = new SpeechSynthesisUtterance(list[i]); u.lang = "ja-JP"; u.rate = .88;
      const vs = speechSynthesis.getVoices(); const v = vs.find(x => /^ja[-_]JP/i.test(x.lang)); if (v) u.voice = v;
      u.onend = () => setTimeout(() => go(i + 1), 450); speechSynthesis.speak(u);
    };
    go(0);
  }

  /* ------------------------------------------------------------ tạo câu hỏi */
  const dedupe = (arr, key) => { const seen = new Set(); return arr.filter(x => { const k = key(x); if (seen.has(k)) return false; seen.add(k); return true; }); };
  /* điền chỗ trống: đáp án sai ưu tiên mẫu hay bị nhầm (ghi ở mục đối chiếu), mẫu cùng nhóm, cùng kiểu nối, có đuôi giống */
  const tail = t => plain(t).replace(/[～（）()\s]/g, "").slice(-2);
  function clozeQ(p, setPool, used) {
    let exs = exAll(p).filter(e => e.cl);
    if (used) { const fresh = exs.filter(e => !used.has(e.ja)); if (fresh.length) exs = fresh; }
    if (!exs.length) return null;
    const e = exs[Math.floor(Math.random() * exs.length)];
    const ansP = plain(e.cl), cmpIds = new Set((p.cmp || []).map(c => c.id).filter(Boolean));
    const conf = new Set(); allPats().forEach(x => (x.cmp || []).forEach(c => { if (c.id === p.id) conf.add(x.id); }));   // mẫu khác nhắc tới p là dễ nhầm
    const pool = allPats().filter(x => x.id !== p.id && x.opt && plain(x.opt) !== ansP && !plain(x.opt).includes(ansP) && !ansP.includes(plain(x.opt)));
    const score = x => (cmpIds.has(x.id) ? 7 : 0) + (conf.has(x.id) ? 6 : 0) + (x.lv === p.lv && x.g === p.g ? 5 : 0) + (x.cc === p.cc ? 3 : 0) + (tail(x.opt) === tail(ansP) ? 3 : 0) + (x.lv === p.lv ? 1 : 0) + Math.random() * 4;
    let c = dedupe(pool.map(x => [score(x), x]).sort((a, b) => b[0] - a[0]).map(x => x[1]), x => plain(x.opt)).slice(0, 3);
    if (c.length < 3) return null;
    const opts = shuffle([{ t: e.cl, ok: true }, ...c.map(x => ({ t: x.opt, ok: false, id: x.id }))]);
    return { kind: "cloze", p, e, opts, ans: opts.findIndex(o => o.ok) };
  }
  function meanOpts(p, pool, field) {
    const world = LV[p.lv] ? LV[p.lv].pats : pool;
    const val = x => field === "mean" ? shortMean(x) : plain(x.pat);
    let c = shuffle(pool.filter(x => x.id !== p.id && val(x) !== val(p)));
    if (c.length < 3) c = c.concat(shuffle(world.filter(x => x.id !== p.id && !c.includes(x) && val(x) !== val(p))));
    c = dedupe(c, val).slice(0, 3);
    return shuffle([p, ...c]);
  }

  /* ------------------------------------------------------------ thử mẫu này (trang chi tiết) */
  function miniTry(host, p) {
    const q0 = () => clozeQ(p, []);
    let q = q0();
    if (!q) { host.innerHTML = '<p class="muted">Mẫu này chưa có câu để điền chỗ trống. Hãy xem các ví dụ phía trên.</p>'; return; }
    const paint = () => {
      host.innerHTML = `<div class="quiz quiz--inline"><div class="quiz__q"><p class="test-ask">Chọn mẫu ngữ pháp điền vào chỗ trống</p>
        <div class="say say--sm" lang="ja">${jp(q.e.ja, { blank: true })}</div><div class="card__hint">${esc(q.e.vi)}</div></div>
        <div class="opts">${q.opts.map((o, i) => `<button class="opt jp-opt" type="button" data-o="${i}" lang="ja"><span class="k">${i + 1}</span><span>${jp(o.t, { hl: false })}</span></button>`).join("")}</div>
        <div class="feedback" aria-live="polite"></div><div class="card__actions" data-nx hidden><button class="btn btn--primary btn--sm" type="button" data-next>Câu khác</button></div></div>`;
      $$("[data-o]", host).forEach(b => b.addEventListener("click", () => {
        const i = +b.dataset.o, ok = i === q.ans;
        $$("[data-o]", host).forEach((x, k) => { x.disabled = true; if (k === q.ans) x.classList.add("is-right"); else if (k === i) x.classList.add("is-wrong"); });
        const fb = $(".feedback", host); fb.className = "feedback " + (ok ? "ok" : "no");
        fb.innerHTML = verdictHTML(ok, pickWord(ok), `<span lang="ja" class="jp">${jp(q.e.ja, { hl: true })}</span>`);
        verdict(fb, ok); if (ok) celebrate(b); else { wobble(b); buzz(); }
        $("[data-nx]", host).hidden = false;
      }));
      $("[data-next]", host).onclick = () => { q = q0(); paint(); };
    };
    paint();
  }

  /* ------------------------------------------------------------ màn luyện tập cho một bộ mẫu */
  function study(cfg) {
    const items = cfg.items;
    const st = { mode: cfg.mode || "card", i: 0, flip: false, quiz: null, match: null, sao: null, listOpen: false, qk: S.quizKind || "cloze" };
    const report = (box, mode, right, total) => { if (box.reported || !cfg.onResult) return; box.reported = true; cfg.onResult(mode, right, total); };
    main.innerHTML = band({ big: "", title: `${cfg.titleJa ? `<span lang="ja" class="jp" style="display:block;font-size:.72em;color:#bcd3d1;margin-bottom:4px">${jp(cfg.titleJa, { hl: false })}</span>` : ""}${esc(cfg.title)}`,
        crumb: cfg.crumb, crumbHref: cfg.crumbHref, text: esc(cfg.sub || ""), compact: true, extra: cfg.extra || "",
        meta: `<b>${items.length}</b><span>mẫu ngữ pháp</span>` }).replace('<div class="band__big"', '<div class="band__big" hidden') +
      `<section class="study"><div class="wrap">
        <div class="study__bar">
          <div class="modes" role="group" aria-label="Chế độ luyện tập">
            <button type="button" data-mode="card"><span class="jp" lang="ja">札</span>Học thẻ</button>
            <button type="button" data-mode="quiz"><span class="jp" lang="ja">択</span>Trắc nghiệm</button>
            <button type="button" data-mode="match"><span class="jp" lang="ja">合</span>Ghép cặp</button>
            <button type="button" data-mode="sao"><span class="jp" lang="ja">並</span>Sắp xếp câu</button>
            <button type="button" data-mode="chia"><span class="jp" lang="ja">活</span>Chia từ</button>
          </div>
          <div class="study__stats"><span>Đã học <b data-s-ok></b></span><span class="rv">Cần ôn <b data-s-rv></b></span>
            <button class="btn btn--ghost btn--sm only-m" type="button" data-list>Danh sách</button></div>
        </div>
        <div class="study__grid"><div data-stage></div>
          <aside class="aside" aria-label="Danh sách mẫu"><div class="aside__head"><b>${items.length} mẫu</b>
            <button class="btn btn--ghost btn--sm only-m" type="button" data-list>Đóng</button></div><ol class="wl" data-wl></ol></aside>
        </div>
      </div></section>`;
    const stage = $("[data-stage]"), wl = $("[data-wl]"), aside = $(".aside");
    let scrim = null;
    const setList = open => {
      st.listOpen = open; aside.classList.toggle("open", open);
      if (open && !scrim) { scrim = document.createElement("div"); scrim.className = "scrim"; scrim.onclick = () => setList(false); document.body.appendChild(scrim); }
      if (!open && scrim) { scrim.remove(); scrim = null; }
    };
    $$("[data-list]").forEach(b => b.addEventListener("click", () => setList(!st.listOpen)));
    function paintList() {
      wl.innerHTML = items.map((p, i) => `<li><button type="button" data-go="${i}" ${st.mode === "card" && i === st.i ? 'aria-current="true"' : ""}>
        <span class="wl__i">${String(i + 1).padStart(2, "0")}</span>
        <span class="wl__w" lang="ja">${jp(p.pat, { hl: false })}<span class="wl__v">${esc(shortMean(p))}</span></span>
        <span class="dot ${stateOf(p.id) ? "dot--" + stateOf(p.id) : ""}"></span></button></li>`).join("");
    }
    wl.addEventListener("click", ev => { const b = ev.target.closest("[data-go]"); if (!b) return; st.mode = "card"; st.i = +b.dataset.go; st.flip = false; setList(false); paint(); });
    function paintStats() { $("[data-s-ok]").textContent = `${learnedIn(items)}/${items.length}`; $("[data-s-rv]").textContent = items.filter(p => P.rv[p.id]).length; }
    $$("[data-mode]").forEach(b => b.addEventListener("click", () => { st.mode = b.dataset.mode; st.flip = false; paint(); }));
    function paint(dir) {
      $$("[data-mode]").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === st.mode));
      if (st.mode === "card") paintCard(typeof dir === "string" ? dir : "");
      if (st.mode === "quiz") paintQuiz();
      if (st.mode === "match") paintMatch();
      if (st.mode === "sao") paintSao();
      if (st.mode === "chia") SB.chia.paint(stage, items, { onMark: () => { paintStats(); paintList(); }, onResult: (m, r, t) => report({ reported: false }, m, r, t) });
      paintStats(); paintList();
    }

    /* --- học thẻ --- */
    function frontHTML(p, i) {
      const s = stateOf(p.id);
      return `<div class="card"><div class="card__face card__face--front" data-flip tabindex="0" role="button" aria-label="Lật thẻ">
        <div class="card__top">${lvtag(p.lv)}<span>Nhóm ${p.g}</span>${s === "ok" ? '<span class="state state--ok">Đã học</span>' : s === "rv" ? '<span class="state state--rv">Cần ôn</span>' : ""}
          <span class="card__num">${String(i + 1).padStart(2, "0")} <small>/ ${items.length}</small></span></div>
        <div class="card__main"><div class="say${plain(p.pat).length > 12 ? " say--sm" : ""}" lang="ja">${jp(p.pat, { hl: false })}</div>
          ${S.romaji ? `<div class="romaji">${esc(romaji(kana(p.pat)))}</div>` : ""}</div>
        <div class="card__actions"><button class="icon-btn" type="button" data-say="${esc(plain(p.pat).replace(/[～／]/g, " "))}">${ICON_SPEAK} Nghe</button>
          <button class="icon-btn" type="button" data-flip>${ICON_FLIP} Lật thẻ</button></div></div></div>`;
    }
    function backHTML(p) {
      const e = exAll(p)[0];
      return `<div class="card"><div class="card__face back" data-flip tabindex="0" role="button" aria-label="Lật lại mặt trước">
        <div class="card__top">${lvtag(p.lv)}<span>Nghĩa, cấu trúc và ví dụ</span></div>
        <div class="back__mean">${esc(p.mean)}</div>
        ${p.core ? `<div class="back__core">★ ${rich(p.core)}</div>` : ""}
        <dl class="back__word"><dt>Cấu trúc</dt><dd lang="ja">${p.form.map(f => rich(f)).join("<br>")}</dd></dl>
        ${e ? `<div class="ex"><div class="ex__ja" lang="ja">${jp(e.ja)}</div><div class="ex__vi">${esc(e.vi)}</div></div>` : ""}
        <div class="card__actions">${e ? `<button class="icon-btn" type="button" data-say="${esc(plain(e.ja))}">${ICON_SPEAK} Nghe ví dụ</button>` : ""}
          <a class="icon-btn" href="#/ngu-phap/${p.id}">Xem đầy đủ</a>
          <button class="icon-btn" type="button" data-flip>${ICON_FLIP} Mặt trước</button></div></div></div>`;
    }
    function paintCard(dir) {
      const p = items[st.i];
      stage.innerHTML = `<div class="flip${st.flip ? " is-flipped" : ""}${dir ? " deal-" + dir : ""}"><div class="flip__inner">${frontHTML(p, st.i)}${backHTML(p)}</div></div>` +
        `<div class="ctl"><button class="btn btn--coral" type="button" data-act="rv">↺ Chưa thuộc</button>
          <button class="nav-btn prev" type="button" data-act="prev" aria-label="Mẫu trước">‹</button>
          <button class="nav-btn" type="button" data-act="next" aria-label="Mẫu sau">›</button>
          <button class="btn btn--primary" type="button" data-act="ok">✓ Đã học</button></div>
        <p class="kbd-hint"><kbd>Space</kbd> lật thẻ · <kbd>←</kbd><kbd>→</kbd> chuyển thẻ · <kbd>1</kbd> chưa thuộc · <kbd>2</kbd> đã học · <kbd>K</kbd> Kanji · <kbd>F</kbd> furigana</p>
        <p class="swipe-hint" aria-hidden="true"><span>‹</span> Vuốt phải: thẻ trước · Vuốt trái: thẻ sau <span>›</span></p>`;
      bindSpeak(stage); syncFaces();
      $$("[data-flip]", stage).forEach(el => el.addEventListener("click", ev => {
        ev.stopPropagation(); if (ev.target.closest("[data-say], a")) return;
        if (performance.now() - swipedAt < 400) return; turn();
      }));
      $$("[data-act]", stage).forEach(b => b.addEventListener("click", () => act(b.dataset.act)));
      bindSwipe();
    }
    let swipedAt = -1e9;
    function bindSwipe() {
      const f = $(".flip", stage); if (!f) return;
      let pid = null, sx = 0, sy = 0, dx = 0, t0 = 0, axis = null;
      const reset = anim => { f.classList.remove("dragging"); f.style.transition = anim ? "transform .22s cubic-bezier(.2,.8,.3,1), opacity .22s" : ""; f.style.transform = ""; f.style.opacity = ""; if (anim) setTimeout(() => { f.style.transition = ""; }, 240); };
      f.addEventListener("pointerdown", ev => { if (pid !== null || (ev.pointerType === "mouse" && ev.button !== 0)) return; if (ev.target.closest("[data-say], .icon-btn, a")) return; pid = ev.pointerId; sx = ev.clientX; sy = ev.clientY; dx = 0; t0 = performance.now(); axis = null; });
      f.addEventListener("pointermove", ev => {
        if (ev.pointerId !== pid) return; const mx = ev.clientX - sx, my = ev.clientY - sy;
        if (!axis) { if (Math.abs(mx) < 8 && Math.abs(my) < 8) return; axis = Math.abs(mx) > Math.abs(my) * 1.2 ? "x" : "y"; if (axis === "x") { try { f.setPointerCapture(pid); } catch (e) { /* bỏ qua */ } f.classList.add("dragging"); } }
        if (axis !== "x") return; dx = mx; const lim = Math.min(Math.abs(dx), 140) * Math.sign(dx);
        f.style.transition = "none"; f.style.transform = `translateX(${dx}px) rotate(${Math.max(-8, Math.min(8, lim / 18))}deg)`; f.style.opacity = String(1 - Math.min(Math.abs(dx) / 420, .45));
      });
      const finish = ev => {
        if (ev.pointerId !== pid) return; const was = axis; pid = null; axis = null; if (was !== "x") return;
        swipedAt = performance.now(); const dt = Math.max(1, performance.now() - t0), v = Math.abs(dx) / dt;
        const far = Math.abs(dx) > Math.min(90, f.offsetWidth * .2) || (Math.abs(dx) > 36 && v > .5);
        if (ev.type === "pointercancel" || !far) return reset(true);
        const dir = dx < 0 ? "next" : "prev";
        if (calm()) { reset(false); return act(dir); }
        f.style.transition = "transform .16s ease-in, opacity .16s"; f.style.transform = `translateX(${dx < 0 ? "-" : ""}${Math.max(f.offsetWidth, 280)}px) rotate(${dx < 0 ? -10 : 10}deg)`; f.style.opacity = "0";
        setTimeout(() => act(dir), 150);
      };
      f.addEventListener("pointerup", finish); f.addEventListener("pointercancel", finish);
    }
    function syncFaces() {
      const f = $(".flip", stage); if (!f) return; const [front, back] = $$(".flip__inner > .card", f);
      front.inert = st.flip; back.inert = !st.flip; front.setAttribute("aria-hidden", st.flip); back.setAttribute("aria-hidden", !st.flip);
    }
    function turn() {
      const f = $(".flip", stage); if (!f) return; st.flip = !st.flip; f.classList.remove("deal-next", "deal-prev"); f.classList.toggle("is-flipped", st.flip); syncFaces();
    }
    function act(a) {
      let dir = a === "prev" ? "prev" : "next";
      if (a === "prev") { st.i = (st.i - 1 + items.length) % items.length; st.flip = false; }
      if (a === "next") { st.i = (st.i + 1) % items.length; st.flip = false; }
      if (a === "ok" || a === "rv") { mark(items[st.i].id, a); if (a === "rv") toast("Đã thêm vào danh sách cần ôn"); st.i = (st.i + 1) % items.length; st.flip = false; }
      paint(dir);
      const cur = $('[aria-current="true"]', wl);
      if (cur) { const top = cur.offsetTop - wl.offsetTop, h = wl.clientHeight; if (top < wl.scrollTop || top > wl.scrollTop + h - cur.offsetHeight) wl.scrollTop = top - h / 3; }
    }

    /* --- trắc nghiệm: điền chỗ trống / mẫu → nghĩa / nghĩa → mẫu --- */
    const QK = { cloze: "Điền chỗ trống", pm: "Mẫu → Nghĩa", mp: "Nghĩa → Mẫu" };
    const N_CLOZE = 10;
    function buildDeck() {
      const deck = [];
      if (st.qk === "cloze") {      // luôn đủ 10 câu: lần lượt qua các mẫu trong gói, mỗi lần lấy một câu ví dụ khác nhau
        const used = new Set(), order = shuffle(items.filter(p => exAll(p).some(e => e.cl)));
        for (let r = 0; order.length && deck.length < N_CLOZE && r < N_CLOZE * 4; r++) {
          const p = order[r % order.length], q = clozeQ(p, items, used);
          if (q) { used.add(q.e.ja); deck.push(q); }
        }
        return shuffle(deck);
      }
      for (const p of shuffle(items)) {
        const opts = meanOpts(p, items, st.qk === "pm" ? "mean" : "pat");
        if (opts.length >= 2) deck.push({ kind: st.qk, p, opts, ans: opts.indexOf(p) });
      }
      return deck;
    }
    function newQuiz() { st.streak = 0; st.quiz = { deck: buildDeck(), k: 0, right: 0, wrong: [], answered: null }; }
    function paintQuiz() {
      if (!st.quiz || st.quiz.qk !== st.qk) { newQuiz(); st.quiz.qk = st.qk; }
      const q = st.quiz;
      const kinds = `<div class="chips qk" role="group" aria-label="Dạng câu hỏi">${Object.entries(QK).map(([k, v]) => `<button class="chip" type="button" data-qk="${k}" aria-pressed="${st.qk === k}">${v}</button>`).join("")}</div>`;
      if (!q.deck.length) { stage.innerHTML = `<div class="card"><div class="empty"><h3>Chưa tạo được câu hỏi</h3><p>Dạng này cần thêm dữ liệu. Hãy chọn dạng khác.</p>${kinds}</div></div>`; bindQk(); return; }
      if (q.k >= q.deck.length) {
        stage.innerHTML = doneHTML(`Xong ${q.deck.length} câu`, q.right, q.deck.length, `Đúng ${q.right}, sai ${q.wrong.length}. Các mẫu sai đã nằm trong danh sách cần ôn.`,
          `<button class="btn btn--primary" type="button" data-again>Làm lại</button>${q.wrong.length ? '<button class="btn btn--ghost" type="button" data-wrong>Chỉ làm lại câu sai</button>' : ""}`);
        afterDone(stage, q.right, q.deck.length); report(q, "quiz", q.right, q.deck.length);
        $("[data-again]", stage).onclick = () => { newQuiz(); st.quiz.qk = st.qk; paintQuiz(); };
        const w = $("[data-wrong]", stage); if (w) w.onclick = () => { const d = shuffle(q.wrong); newQuiz(); st.quiz.qk = st.qk; st.quiz.deck = d; st.quiz.reported = true; paintQuiz(); };
        return;
      }
      const cur = q.deck[q.k], p = cur.p;
      let stem;
      if (cur.kind === "cloze") stem = `<p class="test-ask">Chọn mẫu ngữ pháp điền vào chỗ trống</p><div class="say say--sm" lang="ja">${jp(cur.e.ja, { blank: true })}</div><div class="card__hint">${esc(cur.e.vi)}</div><button class="icon-btn" type="button" data-say="${esc(plain(cur.e.ja))}">${ICON_SPEAK} Nghe câu</button>`;
      else if (cur.kind === "pm") stem = `<p class="test-ask">Mẫu này có nghĩa là gì?</p><div class="say" lang="ja">${jp(p.pat, { hl: false })}</div>`;
      else stem = `<p class="test-ask">Mẫu ngữ pháp nào có nghĩa như sau?</p><div class="back__mean">${esc(shortMean(p))}</div>`;
      const label = o => cur.kind === "cloze" ? jp(o.t, { hl: false }) : cur.kind === "pm" ? esc(shortMean(o)) : jp(o.pat, { hl: false });
      const jpOpt = cur.kind !== "pm";
      stage.innerHTML = `<div class="card"><div class="quiz">
        <div class="card__top">${kinds}<span class="card__num">${q.k + 1} <small>/ ${q.deck.length}</small></span></div>
        <div class="quiz__q">${stem}</div>
        <div class="opts">${cur.opts.map((o, i) => `<button class="opt${jpOpt ? " jp-opt" : ""}" type="button" data-o="${i}" ${jpOpt ? 'lang="ja"' : ""}><span class="k">${i + 1}</span><span>${label(o)}</span></button>`).join("")}</div>
        <div class="feedback" aria-live="polite"></div>
        <div class="card__actions" data-next-wrap hidden><button class="btn btn--primary" type="button" data-next>Câu tiếp</button></div></div></div>`;
      bindSpeak(stage); bindQk();
      $$("[data-o]", stage).forEach(b => b.addEventListener("click", () => answerQuiz(+b.dataset.o)));
      $("[data-next]", stage).onclick = nextQuiz;
      if (q.answered != null) answerQuiz(q.answered, true);
    }
    function bindQk() { $$("[data-qk]", stage).forEach(b => b.addEventListener("click", () => { st.qk = b.dataset.qk; S.quizKind = st.qk; saveS(); st.quiz = null; paintQuiz(); })); }
    function answerQuiz(i, replay) {
      const q = st.quiz, cur = q.deck[q.k], p = cur.p;
      if (q.answered != null && !replay) return;
      const right = i === cur.ans;
      if (!replay) {
        q.answered = i; q.word = pickWord(right); st.streak = right ? (st.streak || 0) + 1 : 0; q.streak = st.streak;
        if (right) { q.right++; mark(p.id, "ok"); } else { q.wrong.push(cur); mark(p.id, "rv"); }
        paintStats(); paintList();
      }
      $$("[data-o]", stage).forEach((b, k) => { b.disabled = true; if (k === cur.ans) b.classList.add("is-right"); else if (k === i) b.classList.add("is-wrong"); });
      const fb = $(".feedback", stage); fb.className = "feedback " + (right ? "ok" : "no");
      const full = cur.kind === "cloze" ? `<span lang="ja" class="jp">${jp(cur.e.ja, { hl: true })}</span><br>` : "";
      fb.innerHTML = verdictHTML(right, q.word, `${full}<span lang="ja" class="jp">${jp(p.pat, { hl: false })}</span> = ${esc(shortMean(p))} · <a href="#/ngu-phap/${p.id}">Xem mẫu</a>`, q.streak);
      if (!replay) {
        verdict(fb, right); const picked = $$("[data-o]", stage)[i], card = $(".card", stage);
        if (right) { celebrate(picked, q.streak > 0 && q.streak % 5 === 0); glow(card, true); } else { wobble(picked); glow(card, false); buzz(); }
      }
      $("[data-next-wrap]", stage).hidden = false; $("[data-next]", stage).focus({ preventScroll: true });
    }
    function nextQuiz() { const q = st.quiz; q.k++; q.answered = null; paintQuiz(); }

    /* --- ghép cặp: mẫu ↔ nghĩa --- */
    function newMatch() { st.match = { deck: shuffle(items), round: 0, miss: 0, pairs: 0, done: {}, sel: null, order: null }; }
    function paintMatch() {
      if (!st.match) newMatch();
      const m = st.match, size = 5, set = m.deck.slice(m.round * size, m.round * size + size);
      if (!set.length) {
        const tries = m.pairs + m.miss;
        stage.innerHTML = doneHTML(`Đã ghép xong ${m.pairs} cặp`, m.pairs, tries, `Ghép nhầm ${m.miss} lần.`, `<button class="btn btn--primary" type="button" data-again>Chơi lại</button>`);
        afterDone(stage, m.pairs, tries); report(m, "match", m.pairs, tries);
        $("[data-again]", stage).onclick = () => { newMatch(); paintMatch(); }; return;
      }
      if (!m.order) m.order = { L: shuffle(set), R: shuffle(set) };
      const rounds = Math.ceil(m.deck.length / size);
      stage.innerHTML = `<div class="card"><div class="match"><div class="card__top"><span>Chọn một mẫu ngữ pháp, rồi chọn nghĩa đúng</span><span class="card__num">Lượt ${m.round + 1} <small>/ ${rounds}</small></span></div>
        <div class="match__grid"><div class="match__col">${m.order.L.map(p => `<button class="tile jp-tile" type="button" lang="ja" data-l="${p.id}" ${m.done[p.id] ? "disabled" : ""}>${jp(p.pat, { hl: false })}</button>`).join("")}</div>
          <div class="match__col">${m.order.R.map(p => `<button class="tile tile--sm" type="button" data-r="${p.id}" ${m.done[p.id] ? "disabled" : ""}>${esc(shortMean(p))}</button>`).join("")}</div></div>
        <div class="match__foot"><span>Ghép nhầm: <b>${m.miss}</b></span><button class="btn btn--ghost btn--sm" type="button" data-skipround>Bỏ lượt này</button></div></div></div>`;
      $$(".tile", stage).forEach(t => { const id = t.dataset.l || t.dataset.r; if (m.done[id]) t.classList.add("is-done"); t.addEventListener("click", () => pick(t)); });
      $("[data-skipround]", stage).onclick = () => { m.round++; m.order = null; m.sel = null; paintMatch(); };
    }
    function pick(t) {
      const m = st.match, side = t.dataset.l ? "l" : "r", id = t.dataset.l || t.dataset.r;
      if (!m.sel || m.sel.side === side) { $$(".tile.is-sel", stage).forEach(x => x.classList.remove("is-sel")); m.sel = { side, id }; t.classList.add("is-sel"); return; }
      const other = m.sel; m.sel = null; $$(".tile.is-sel", stage).forEach(x => x.classList.remove("is-sel"));
      if (other.id === id) {
        m.done[id] = 1; m.pairs++; mark(id, "ok");
        const pair = $$(`[data-l="${id}"],[data-r="${id}"]`, stage); pair.forEach(x => { x.classList.add("is-hit"); celebrate(x); });
        setTimeout(() => pair.forEach(x => { x.classList.remove("is-hit"); x.disabled = true; x.classList.add("is-done"); }), 380);
        paintStats(); paintList();
        if (m.order.L.every(p => m.done[p.id])) { setTimeout(() => { glow($(".card", stage), true); celebrate($(".match__grid", stage), true); }, 380); setTimeout(() => { m.round++; m.order = null; paintMatch(); }, 1100); }
      } else {
        m.miss++; const leftId = side === "l" ? id : other.id; mark(leftId, "rv"); paintStats(); paintList();
        const a = $(`[data-${other.side}="${other.id}"]`, stage);
        [t, a].forEach(x => { x.classList.add("is-wrong"); wobble(x); setTimeout(() => x.classList.remove("is-wrong"), 500); }); buzz();
        $(".match__foot b", stage).textContent = m.miss;
      }
    }

    /* --- sắp xếp câu (ghép các cụm thành câu) --- */
    function buildSao() {
      const out = [];
      for (const p of shuffle(items)) {
        const cands = exAll(p).filter(e => e.so);
        if (!cands.length) continue;
        const e = cands[Math.floor(Math.random() * cands.length)];
        out.push({ p, e });
      }
      return out;
    }
    function newSao() { st.streak = 0; st.sao = { deck: buildSao(), k: 0, right: 0, wrong: [], place: [], shuf: null, checked: false }; }
    function paintSao() {
      if (!st.sao) newSao();
      const s = st.sao;
      if (!s.deck.length) { stage.innerHTML = `<div class="card"><div class="empty"><h3>Chưa có câu để sắp xếp</h3><p>Các mẫu trong bộ này chưa có câu ví dụ đủ dài.</p></div></div>`; return; }
      if (s.k >= s.deck.length) {
        stage.innerHTML = doneHTML(`Xong ${s.deck.length} câu`, s.right, s.deck.length, `Đúng ${s.right}. Mẫu làm sai đã vào danh sách cần ôn.`, `<button class="btn btn--primary" type="button" data-again>Làm lại</button>`);
        afterDone(stage, s.right, s.deck.length); report(s, "sao", s.right, s.deck.length);
        $("[data-again]", stage).onclick = () => { newSao(); paintSao(); }; return;
      }
      const cur = s.deck[s.k], so = cur.e.so;
      if (!s.shuf) { let sh; do { sh = shuffle([0, 1, 2, 3]); } while (sh.every((v, i) => v === i)); s.shuf = sh; s.place = []; s.checked = false; }
      const slot = i => { const idx = s.place[i]; return `<button class="slot${idx != null ? " is-fill" : ""}" type="button" data-slot="${i}" lang="ja">${idx != null ? jp(so.c[idx], { hl: false }) : "　"}</button>`; };
      const chips = s.shuf.map(idx => `<button class="chunk" type="button" data-ch="${idx}" lang="ja" ${s.place.includes(idx) ? "disabled" : ""}>${jp(so.c[idx], { hl: false })}</button>`).join("");
      stage.innerHTML = `<div class="card"><div class="quiz">
        <div class="card__top">${lvtag(cur.p.lv)}<span>Sắp xếp các cụm thành câu hoàn chỉnh</span><span class="card__num">${s.k + 1} <small>/ ${s.deck.length}</small></span></div>
        <div class="sao" lang="ja"><span class="sao__fix">${jp(so.pre, { hl: false })}</span>${[0, 1, 2, 3].map(slot).join("")}<span class="sao__fix">${jp(so.post, { hl: false })}</span></div>
        <div class="card__hint">${esc(cur.e.vi)}</div>
        <div class="chunks" aria-label="Các cụm">${chips}</div>
        <div class="feedback" aria-live="polite"></div>
        <div class="card__actions"><button class="btn btn--ghost btn--sm" type="button" data-reset>Xếp lại</button>
          <button class="btn btn--primary" type="button" data-check ${s.place.length < 4 ? "disabled" : ""}>Kiểm tra</button>
          <button class="btn btn--primary" type="button" data-next hidden>Câu tiếp</button></div>
        <small class="muted">Câu có thể có hơn một cách xếp tự nhiên. Đáp án chấm theo thứ tự trong tài liệu gốc.</small></div></div>`;
      $$("[data-ch]", stage).forEach(b => b.addEventListener("click", () => { if (s.checked || s.place.length >= 4) return; s.place.push(+b.dataset.ch); paintSao(); }));
      $$("[data-slot]", stage).forEach(b => b.addEventListener("click", () => { if (s.checked) return; const i = +b.dataset.slot; if (s.place[i] != null) { s.place.splice(i, 1); paintSao(); } }));
      $("[data-reset]", stage).onclick = () => { if (s.checked) return; s.place = []; paintSao(); };
      const ck = $("[data-check]", stage), nx = $("[data-next]", stage);
      ck.onclick = () => {
        if (s.place.length < 4 || s.checked) return; s.checked = true;
        const ok = s.place.every((v, i) => v === i);
        s.word = pickWord(ok); st.streak = ok ? (st.streak || 0) + 1 : 0;
        if (ok) { s.right++; mark(cur.p.id, "ok"); } else { s.wrong.push(cur); mark(cur.p.id, "rv"); }
        paintStats(); paintList();
        $$(".slot", stage).forEach((b2, i) => b2.classList.add(s.place[i] === i ? "is-right" : "is-wrong"));
        const fb = $(".feedback", stage); fb.className = "feedback " + (ok ? "ok" : "no");
        const full = so.pre + so.c.join("") + so.post;
        fb.innerHTML = verdictHTML(ok, s.word, `<span lang="ja" class="jp">${jp(cur.e.ja, { hl: true })}</span><br><a href="#/ngu-phap/${cur.p.id}">Xem mẫu</a>`, st.streak);
        verdict(fb, ok); if (ok) { celebrate($(".sao", stage)); glow($(".card", stage), true); } else { wobble($(".sao", stage)); glow($(".card", stage), false); buzz(); }
        ck.hidden = true; nx.hidden = false; nx.focus({ preventScroll: true });
      };
      nx.onclick = () => { s.k++; s.shuf = null; paintSao(); };
    }

    /* --- bàn phím --- */
    function onKey(ev) {
      if (ev.target.matches("input, textarea") || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (st.mode === "card") {
        if (ev.key === " " || ev.key === "Enter") { if (ev.target.closest("button, a")) return; ev.preventDefault(); turn(); }
        else if (ev.key === "ArrowRight") act("next"); else if (ev.key === "ArrowLeft") act("prev");
        else if (ev.key === "1") act("rv"); else if (ev.key === "2") act("ok");
      } else if (st.mode === "quiz" && st.quiz && st.quiz.deck[st.quiz.k]) {
        if (/^[1-4]$/.test(ev.key) && st.quiz.answered == null) answerQuiz(+ev.key - 1);
        else if (ev.key === "Enter" && st.quiz.answered != null && !ev.target.closest("button")) nextQuiz();
      }
    }
    document.addEventListener("keydown", onKey);
    SB.setCur({ refresh: paint, destroy() { document.removeEventListener("keydown", onKey); if (scrim) scrim.remove(); } });
    paint();
  }
  SB.G.study = study;

  /* ------------------------------------------------------------ cấp độ */
  function rowHTML(p) {
    const k = stateOf(p.id);
    return `<li class="row row--g"><a href="#/ngu-phap/${p.id}"><span class="row__l">${lvtag(p.lv)}<span class="row__ja jp" lang="ja">${title(p)}</span></span>
      <span class="row__vi">${esc(shortMean(p))}</span><span class="row__side">${k === "ok" ? '<span class="state state--ok">Đã học</span>' : k === "rv" ? '<span class="state state--rv">Cần ôn</span>' : ""}</span></a></li>`;
  }
  function filterBox(listSel) {
    return `<div class="toolbar"><input class="finder" type="search" placeholder="Tìm mẫu hoặc nghĩa, ví dụ: nguyên nhân, 早い…" aria-label="Tìm trong danh sách" data-find></div>`;
  }
  const fold = t => String(t || "").normalize("NFKC").toLowerCase().replace(/[～〜~…・\s]/g, "");
  function rowKey(li) {
    if (li._k) return li._k;
    const c = li.cloneNode(true); c.querySelectorAll("rt, rp").forEach(x => x.remove());      // chữ Hán không kèm furigana
    return (li._k = fold(c.textContent) + "|" + fold(li.textContent) + "|" + fold(li.dataset.s));  // kèm cả bản có furigana để gõ hiragana vẫn ra
  }
  function bindFind(root) {
    const inp = $("[data-find]", root); if (!inp) return;
    inp.addEventListener("input", () => {
      const q = fold(inp.value);
      $$("li.row--g", root).forEach(li => { li.hidden = !!q && !rowKey(li).includes(q); });
      $$(".gsec", root).forEach(s => { s.hidden = !$$("li.row--g", s).some(li => !li.hidden); });
    });
  }
  async function levelList() {
    await loadAll();
    const total = allPats().length;
    main.innerHTML = band({ big: "級別", bigJp: true, title: "Ngữ pháp theo cấp độ", text: "Từ N5 đến N1. Mỗi cấp chia thành các nhóm cùng sắc thái để so sánh các mẫu gần nghĩa ngay trong nhóm.", meta: `<b>${fmt(total)}</b><span>mẫu đã mở</span>` }) +
      `<section class="sec"><div class="wrap"><ul class="rows">${C.levels.slice().reverse().reverse().map(l => {
        const D = LV[l.id], its = D ? D.pats : [], k = learnedIn(its);
        return `<li class="row ${l.ready ? "" : "row--off"}"><${l.ready ? `a href="#/cap-do/${l.id}"` : "div"}>
          <span><span class="row__ja jp" style="font-size:30px">${l.name}</span><br><span class="row__vi">${esc(l.blurb)}</span></span>
          <span class="row__side">${l.ready ? `<b>${its.length}</b> mẫu<br>${k ? `đã học ${k}` : "chưa học"}${meter(k, its.length)}` : `<b>~${l.target}</b> mẫu<br><span class="pill pill--soon">Đang biên soạn</span>`}</span></${l.ready ? "a" : "div"}></li>`;
      }).join("")}</ul></div></section>`;
    SB.setCur({ refresh: levelList });
  }
  async function level(lv) {
    const L = levelOf(lv); if (!L) return SB.notFound();
    const tabs = `<nav class="lvtabs" aria-label="Cấp độ">${C.levels.map(l => `<a href="#/cap-do/${l.id}" ${l.id === lv ? 'aria-current="page"' : ""}>${l.name}</a>`).join("")}</nav>`;
    if (!L.ready) {
      main.innerHTML = band({ big: L.name, title: `Ngữ pháp ${L.name}`, text: esc(L.blurb), extra: tabs, meta: `<b>~${L.target}</b><span>mẫu, đang biên soạn</span>` }) +
        `<section class="sec"><div class="wrap"><div class="empty"><h3>Cấp ${L.name} đang được biên soạn</h3><p>Mỗi cấp được làm trọn vẹn rồi mới mở. Hiện đã mở ${readyLevels().map(x => x.toUpperCase()).join(", ")}.</p><a class="btn btn--primary" href="#/cap-do/n1">Học N1</a></div></div></section>`;
      return SB.setCur({ refresh: () => level(lv) });
    }
    const D = await load(lv), ok = learnedIn(D.pats);
    main.innerHTML = band({ big: L.name, title: `Ngữ pháp ${L.name}`, text: esc(L.blurb), extra: tabs, meta: `<b>${fmt(ok)} / ${fmt(D.pats.length)}</b><span>mẫu đã học</span>${meter(ok, D.pats.length)}` }) +
      `<section class="sec"><div class="wrap">
        <div class="sec__head"><h2>${D.groups.length} nhóm, ${D.pats.length} mẫu</h2></div>
        ${filterBox()}
        ${D.groups.map(g => { const its = D.pats.filter(p => p.g === g.n), k = learnedIn(its); return `<section class="gsec gsec--t${tsCls(tsGet("lv:" + lv, g.n))}"><div class="ghead"><div><h3><span class="gnum">${g.n}</span>${esc(g.vi)} <span class="jp gja" lang="ja">${jp(g.ja, { hl: false })}</span></h3><p>${esc(g.desc)}</p></div>
          <div class="ghead__side"><span>${its.length} mẫu · ${k ? `đã học ${k}` : "chưa học"} ${tsPill(tsGet("lv:" + lv, g.n))}</span><span class="ghead__btns"><a class="btn btn--primary btn--sm" href="#/cap-do/${lv}/nhom/${g.n}">Luyện nhóm này</a><a class="btn btn--ghost btn--sm" href="#/cap-do/${lv}/nhom/${g.n}/test">Làm test</a></span></div></div>
          <ul class="rows rows--tight">${its.map(rowHTML).join("")}</ul></section>`; }).join("")}
      </div></section>`;
    bindFind(main);
    SB.setCur({ refresh: () => level(lv) });
  }
  async function groupStudy(lv, n) {
    const D = await load(lv), g = D.groups.find(x => x.n === +n); if (!g) return SB.notFound();
    study({ title: `${lv.toUpperCase()} · Nhóm ${g.n}: ${g.vi}`, titleJa: g.ja, sub: g.desc, crumb: `Các nhóm ${lv.toUpperCase()}`, crumbHref: `#/cap-do/${lv}`, items: D.pats.filter(p => p.g === g.n) });
  }

  /* ------------------------------------------------------------ chủ đề và bối cảnh */
  const FACETS = {
    theme: { route: "chu-de", nav: "theme", ja: "題", title: "Ngữ pháp theo chủ đề", lead: "Gom các mẫu cùng diễn đạt một ý (nguyên nhân, cảm xúc, so sánh…) qua mọi cấp độ, có nhãn N5–N1 cạnh từng mẫu.", list: () => C.themes, field: "theme", noun: "chủ đề" },
    ctx: { route: "boi-canh", nav: "ctx", ja: "場面", title: "Ngữ pháp theo bối cảnh sử dụng", lead: "Cùng một ý nhưng dùng ở đâu mới tự nhiên: trong email, ở công ty, khi phiên dịch, trong báo chí…", list: () => C.contexts, field: "ctx", noun: "bối cảnh" }
  };
  const PACK = 12;
  async function facetList(kind) {
    const F = FACETS[kind]; await loadAll(); const all = allPats();
    main.innerHTML = band({ big: F.ja, bigJp: true, title: F.title, text: F.lead, meta: `<b>${fmt(all.length)}</b><span>mẫu đã mở</span>` }) +
      `<section class="sec"><div class="wrap"><ul class="posrows">${F.list().map(t => {
        const its = all.filter(p => p[F.field].includes(t.id)), by = C.levels.map(l => [l.id, its.filter(p => p.lv === l.id).length]);
        return `<li><a href="#/${F.route}/${t.id}"><span><span class="row__ja jp" lang="ja">${jp(t.ja, { hl: false })}</span><br><span class="row__vi">${esc(t.vi)}</span><br><span class="row__sub">${esc(t.desc)}</span></span>
          <span class="row__side"><b>${fmt(its.length)}</b> mẫu<div class="lvbar" style="margin-top:6px">${by.filter(b => b[1]).map(([lv, n]) => `<i style="width:${its.length ? n / its.length * 100 : 0}%;background:${LVCOL[lv]}" title="${lv.toUpperCase()}: ${n}"></i>`).join("")}</div></span></a></li>`;
      }).join("")}</ul>
      </div></section>`;
    SB.setCur({ refresh: () => facetList(kind) });
  }
  const LVCOL = { n5: "var(--mint)", n4: "var(--step-4)", n3: "var(--step-3)", n2: "var(--green)", n1: "var(--green-deep)" };
  function facetFilter(kind, id, q) {
    const F = FACETS[kind], cap = q.get("cap") || "all";
    const items = allPats().filter(p => p[F.field].includes(id) && (cap === "all" || p.lv === cap));
    items.sort((a, b) => b.lv.localeCompare(a.lv) || a.no.localeCompare(b.no));
    items.sort((a, b) => a.lv < b.lv ? 1 : a.lv > b.lv ? -1 : 0).reverse();
    items.sort((a, b) => (+a.lv[1] < +b.lv[1] ? 1 : +a.lv[1] > +b.lv[1] ? -1 : 0) || a.no.localeCompare(b.no));
    return { cap, items };
  }
  async function facetDetail(kind, id, q) {
    const F = FACETS[kind], t = F.list().find(x => x.id === id); if (!t) return SB.notFound();
    await loadAll();
    const { cap, items } = facetFilter(kind, id, q), packs = Math.ceil(items.length / PACK);
    main.innerHTML = band({ big: [...plain(t.ja)][0], bigJp: true, crumb: `Tất cả ${F.noun}`, crumbHref: `#/${F.route}`, title: esc(t.vi), text: esc(t.desc),
        meta: `<b>${fmt(items.length)}</b><span>mẫu ${cap === "all" ? "ở mọi cấp" : "cấp " + cap.toUpperCase()}</span>` }) +
      `<section class="sec" style="padding-top:32px"><div class="wrap">
        <div class="toolbar"><div class="chips" role="group" aria-label="Lọc cấp độ"><a class="chip" href="#/${F.route}/${id}" ${cap === "all" ? 'aria-current="page"' : ""}>Tất cả</a>
          ${C.levels.map(l => l.ready ? `<a class="chip" href="#/${F.route}/${id}?cap=${l.id}" ${cap === l.id ? 'aria-current="page"' : ""}>${l.name}</a>` : `<span class="chip" style="opacity:.45" title="Đang biên soạn">${l.name}</span>`).join("")}</div></div>
        ${items.length ? `<div class="toolbar"><b style="color:var(--green)">Chọn gói để luyện</b><div class="packs">${Array.from({ length: packs }, (_, i) =>
          `<a class="btn btn--ghost btn--sm" href="#/${F.route}/${id}/hoc?cap=${cap}&goi=${i + 1}">Gói ${i + 1}: mẫu ${i * PACK + 1}–${Math.min(items.length, (i + 1) * PACK)}</a>`).join("")}</div></div>
          ${filterBox()}<ul class="rows rows--tight">${items.map(rowHTML).join("")}</ul>` :
        `<div class="empty"><h3>Chưa có mẫu nào</h3><p>Cấp độ này chưa có mẫu thuộc ${F.noun} này. Hãy chọn “Tất cả” hoặc cấp khác.</p></div>`}
      </div></section>`;
    bindFind(main);
    SB.setCur({ refresh: () => facetDetail(kind, id, q) });
  }
  async function facetStudy(kind, id, q) {
    const F = FACETS[kind], t = F.list().find(x => x.id === id); if (!t) return SB.notFound();
    await loadAll();
    const { cap, items } = facetFilter(kind, id, q), n = Math.max(1, +q.get("goi") || 1), slice = items.slice((n - 1) * PACK, n * PACK);
    if (!slice.length) return SB.notFound();
    study({ title: `${t.vi} · gói ${n}`, titleJa: t.ja, sub: `${cap === "all" ? "Mọi cấp độ" : "Cấp " + cap.toUpperCase()}, mẫu ${(n - 1) * PACK + 1}–${(n - 1) * PACK + slice.length} trên ${items.length}.`,
      crumb: t.vi, crumbHref: `#/${F.route}/${id}${cap !== "all" ? "?cap=" + cap : ""}`, items: slice });
  }

  /* ------------------------------------------------------------ giáo trình */
  const GT_GAPS = [1, 3, 7, 14, 30], GT_PASS = .8;
  const dayNo = t => { const d = new Date(t); return Math.floor((t - d.getTimezoneOffset() * 6e4) / 864e5); };
  const gtRec = (bid, n) => (P.gt[bid] || {})[n];
  function gtState(bid, u, its) {
    const r = gtRec(bid, u.n);
    if (!r) return { s: learnedIn(its) ? "doing" : "new" };
    if (r.st >= GT_GAPS.length) return { s: "solid", r };
    const left = dayNo(r.t) + GT_GAPS[r.st] - dayNo(Date.now());
    return left <= 0 ? { s: "due", k: r.st + 1, late: -left, r } : { s: "wait", k: r.st + 1, left, r };
  }
  function gtPass(b, u) {
    const bid = b.id, now = Date.now(), name = `${b.unitName} ${u.n}`, box = P.gt[bid] = P.gt[bid] || {};
    const cur = gtState(bid, u, []);
    if (!box[u.n]) { box[u.n] = { t: now, st: 0, first: now }; saveP(); return `Hoàn thành ${name}. Lượt ôn đầu tiên: ngày mai.`; }
    if (cur.s === "due") { box[u.n].st++; box[u.n].t = now; saveP(); return box[u.n].st >= GT_GAPS.length ? `${name} đã vững sau ${GT_GAPS.length} lượt ôn.` : `Xong lượt ôn ${cur.k}. Lượt tiếp theo sau ${GT_GAPS[box[u.n].st]} ngày.`; }
    return "";
  }
  /* kết quả test theo bài / nhóm: P.ts[phạm vi][mã] = { last, best, n, t }; màu theo điểm tốt nhất */
  const tsGet = (scope, id) => (P.ts && P.ts[scope] && P.ts[scope][id]) || null;
  const tsCls = r => !r ? "" : r.best >= 80 ? "g" : r.best >= 60 ? "y" : "r";
  const tsPill = r => r ? `<span class="tspill tspill--${tsCls(r)}">Test ${r.best}%</span>` : "";
  function tsSet(scope, id, pct) {
    P.ts = P.ts || {}; const box = P.ts[scope] = P.ts[scope] || {}, c = box[id] || { best: 0, n: 0 };
    box[id] = { last: pct, best: Math.max(c.best || 0, pct), n: (c.n || 0) + 1, t: Date.now() };
    saveP(); return box[id];
  }
  const gtLabel = st => st.s === "due" ? `Ôn lượt ${st.k}${st.late ? ` · trễ ${st.late} ngày` : " · hôm nay"}` : st.s === "wait" ? (st.left === 1 ? `Ôn lượt ${st.k} ngày mai` : `Ôn lượt ${st.k} sau ${st.left} ngày`) : st.s === "solid" ? "Đã vững" : st.s === "doing" ? "Đang học" : "";
  function bookItems(b, u) {
    const out = [];
    for (const lv of readyLevels()) if (LV[lv]) LV[lv].pats.forEach(p => (p.book || []).forEach(([bid, un, ord]) => { if (bid === b.id && String(un) === String(u.n)) out.push([ord, p]); }));
    return out.sort((x, y) => x[0] - y[0]).map(x => x[1]);
  }
  async function books() {
    await loadAll();
    main.innerHTML = band({ big: "教科書", bigJp: true, title: "Ngữ pháp theo giáo trình", text: "Chọn đúng cuốn sách bạn đang học. Mẫu ngữ pháp đi theo thứ tự từng bài, có lộ trình học và ôn theo lịch.", meta: `<b>${C.books.length}</b><span>giáo trình</span>` }) +
      `<section class="sec"><div class="wrap"><ul class="books">${C.books.map(b => {
        const its = b.units.flatMap(u => bookItems(b, u)), k = learnedIn(its);
        return `<li><a class="book${b.ready ? "" : " book--off"}" href="#/giao-trinh/${b.id}"><span class="book__spine" aria-hidden="true"><span lang="ja">${b.id === "minna" ? "みんな" : "新完全"}</span></span>
          <span class="book__body"><span class="book__lv">${esc(b.levels)}</span><b class="book__name">${esc(b.name)}</b><span class="book__ja" lang="ja">${jp(b.ja, { hl: false })}</span><span class="book__blurb">${esc(b.blurb)}</span>
          <span class="book__foot">${b.ready ? `<span><b>${b.units.length}</b> bài · <b>${its.length}</b> mẫu</span><span>${k ? `đã học ${k}` : "chưa học"}</span>${meter(k, its.length)}` : `<span class="pill pill--soon">Đang biên soạn</span>`}</span></span></a></li>`;
      }).join("")}</ul>
      <p class="gt-note">Super Bunpou chỉ dùng danh mục bài và thứ tự mẫu của giáo trình để sắp xếp. Phần giải thích và ví dụ là nội dung riêng của Super Bunpou.</p></div></section>`;
    SB.setCur({ refresh: books });
  }
  async function book(id) {
    const b = bookOf(id); if (!b) return SB.notFound();
    await loadAll();
    if (!b.ready) {
      main.innerHTML = band({ big: id === "minna" ? "みんな" : "新", bigJp: true, crumb: "Tất cả giáo trình", crumbHref: "#/giao-trinh", title: esc(b.name), text: esc(b.blurb), meta: `<span>đang biên soạn</span>` }) +
        `<section class="sec"><div class="wrap"><div class="empty"><h3>Giáo trình này đang được sắp xếp</h3><p>Các cấp được mở lần lượt. Hiện đã mở ${readyLevels().map(x => x.toUpperCase()).join(", ")}.</p><a class="btn btn--primary" href="#/giao-trinh">Chọn giáo trình khác</a></div></div></section>`;
      return SB.setCur({ refresh: () => book(id) });
    }
    await SB.ex.ensure(id);
    const unitsData = b.units.map(u => ({ u, its: bookItems(b, u) }));
    const all = [...new Map(unitsData.flatMap(x => x.its).map(p => [p.id, p])).values()], k = learnedIn(all);
    const next = unitsData.find(x => !gtRec(id, x.u.n) && x.its.length) || null;
    const dueU = unitsData.map(x => ({ x, st: gtState(id, x.u, x.its) })).filter(x => x.st.s === "due").sort((a, c) => c.st.late - a.st.late);
    const passed = unitsData.filter(x => gtRec(id, x.u.n)), rvN = all.filter(p => P.rv[p.id]).length;
    const upcoming = unitsData.map(x => ({ x, st: gtState(id, x.u, x.its) })).filter(x => x.st.s === "wait").sort((a, c) => a.st.left - c.st.left)[0];
    const plan = `<section class="sec plan-sec"><div class="wrap"><div class="sec__head"><h2>Hôm nay học gì</h2></div>
      <div class="plan">
        <div class="plan__c plan__c--new"><span class="plan__k">Học mới</span>${next ? `<b>${b.unitName} ${next.u.n}: ${esc(next.u.vi)}</b><span>${next.its.length} mẫu</span><a class="btn btn--primary btn--sm" href="#/giao-trinh/${id}/${next.u.n}">Bắt đầu</a>` : `<b>Đã hết bài</b><span>Bạn đã đi qua mọi bài.</span>`}</div>
        <div class="plan__c plan__c--due"><span class="plan__k">Đến hạn ôn</span>${dueU.length ? `<b>${dueU.length} bài</b><ul class="plan__list">${dueU.slice(0, 4).map(d => `<li><a href="#/giao-trinh/${id}/${d.x.u.n}">Bài ${d.x.u.n}</a> <small>${gtLabel(d.st)}</small></li>`).join("")}</ul>` : `<b>Không có</b><span>${upcoming ? `Lượt gần nhất: bài ${upcoming.x.u.n}, ${upcoming.st.left === 1 ? "ngày mai" : `sau ${upcoming.st.left} ngày`}.` : "Hoàn thành một bài để mở lịch ôn."}</span>`}</div>
        <div class="plan__c"><span class="plan__k">Đã hoàn thành</span><b>${passed.length} / ${b.units.length} bài</b>${meter(passed.length, b.units.length)}</div>
        <div class="plan__c"><span class="plan__k">Mẫu cần ôn</span><b>${rvN} mẫu</b><span>Mẫu bấm “Chưa thuộc” hoặc làm sai trong sách này.</span>${rvN ? `<a class="btn btn--coral btn--sm" href="#/giao-trinh/${id}/can-on">Ôn ngay</a>` : ""}</div>
      </div></div></section>`;
    const parts = []; b.units.forEach(u => { let g = parts.find(x => x.part === u.part); if (!g) parts.push(g = { part: u.part, units: [] }); g.units.push(u); });
    const tile = u => {
      const its = bookItems(b, u), n = learnedIn(its), gs = gtState(id, u, its), done = ["solid", "wait", "due"].includes(gs.s);
      const tr = tsGet("bk:" + id, u.n);
      return `<li><a class="lesson${done ? " lesson--done" : ""}${next && u === next.u ? " lesson--next" : ""}${gs.s === "due" ? " lesson--due" : ""}${tr ? " lesson--t" + tsCls(tr) : ""}" href="#/giao-trinh/${id}/${u.n}">${gtLabel(gs) ? `<span class="lesson__st">${gtLabel(gs)}</span>` : ""}
        <span class="lesson__no">${esc(u.n)}</span>${tr ? `<span class="lesson__ts">${tr.best}%</span>` : ""}<span class="lesson__t">${esc(u.vi)}<small class="jp" lang="ja">${esc(u.ja)}</small></span><span class="lesson__n">${[its.length ? `${its.length} mẫu${n ? ` · đã học ${n}` : ""}` : "", SB.ex.countFor(id, u.n) ? `${SB.ex.countFor(id, u.n)} bộ đề` : ""].filter(Boolean).join(" · ")}</span>${meter(n, its.length)}</a></li>`;
    };
    main.innerHTML = band({ big: "新完全", bigJp: true, crumb: "Tất cả giáo trình", crumbHref: "#/giao-trinh", title: esc(b.name), text: esc(b.blurb),
        meta: `<b>${passed.length} / ${b.units.length}</b><span>bài đã hoàn thành</span>${meter(passed.length, b.units.length)}<span class="band__sub">${fmt(k)} / ${fmt(all.length)} mẫu đã học</span>` }) + plan +
      `<section class="sec"><div class="wrap"><p class="tslegend"><span class="tspill tspill--g">Từ 80%: đạt</span><span class="tspill tspill--y">60–79%: cần ôn thêm</span><span class="tspill tspill--r">Dưới 60%: chưa vững</span><span class="tspill">Chưa làm test</span></p>${parts.map(g => `<div class="sec__head" style="margin-top:8px"><h2>${esc(g.part)}</h2></div><ol class="lessons">${g.units.map(tile).join("")}</ol>`).join("")}</div></section>`;
    const hubH = await SB.ex.hub(b); if (hubH) main.querySelector(".plan-sec").insertAdjacentHTML("afterend", hubH);
    SB.setCur({ refresh: () => book(id) });
  }
  async function bookUnit(id, n) {
    const b = bookOf(id); if (!b || !b.ready) return SB.notFound();
    await loadAll();
    const i = b.units.findIndex(u => String(u.n) === String(n)); if (i < 0) return SB.notFound();
    const u = b.units[i], its = bookItems(b, u);
    if (!its.length) return (await SB.ex.unitPage(b, n)) || SB.notFound();
    const prev = b.units[i - 1], nxt = b.units[i + 1], gs = gtState(id, u, its), tr = tsGet("bk:" + id, u.n), base = `#/giao-trinh/${id}/${u.n}`;
    const link = (x, dir) => x ? `<a class="unitnav__a" href="#/giao-trinh/${id}/${x.n}">${dir < 0 ? "← " : ""}Bài ${x.n}${dir > 0 ? " →" : ""}</a>` : "<span></span>";
    const exH = await SB.ex.unitLink(b, n), nL = learnedIn(its);
    main.innerHTML = band({ big: "", title: `${esc(b.short)} · Bài ${esc(u.n)}<span class="jp" lang="ja" style="display:block;font-size:.62em;color:#bcd3d1;margin-top:4px">${jp(u.ja, { hl: false })}</span>`, crumb: b.name, crumbHref: `#/giao-trinh/${id}`,
        text: `${esc(u.vi)}. ${its.length} mẫu ngữ pháp.${gtLabel(gs) ? ` ${esc(gtLabel(gs))}.` : ""}`, compact: true, meta: `<b>${its.length}</b><span>mẫu ngữ pháp</span>${meter(nL, its.length)}<span class="band__sub">${nL} đã học</span>` }).replace('<div class="band__big"', '<div class="band__big" hidden') +
      `<section class="sec"><div class="wrap">
        <div class="sec__head"><h2>Ngữ pháp trong bài</h2></div>
        <ul class="rows rows--tight">${its.map(rowHTML).join("")}</ul>
        <div class="sec__head" style="margin-top:34px"><h2>Luyện và kiểm tra</h2></div>
        <div class="unitacts">
          <a class="unitact" href="${base}/on-tap"><span class="unitact__k">ÔN TẬP</span><b>Học thẻ, trắc nghiệm, ghép cặp, sắp xếp câu, chia từ</b><span>Luyện thoải mái trên ${its.length} mẫu của bài, không tính điểm.</span><span class="btn btn--ghost btn--sm">Vào ôn tập</span></a>
          <a class="unitact unitact--test${tr ? " unitact--t" + tsCls(tr) : ""}" href="${base}/test"><span class="unitact__k">LÀM TEST</span><b>16 câu hỏi trộn ngẫu nhiên</b><span>${tr ? `Lần gần nhất ${tr.last}%, tốt nhất ${tr.best}% (${tr.n} lần). ` : "Đạt từ 80% là xanh, 60–79% vàng, dưới 60% đỏ. "}Có đáp án sau từng câu.</span><span class="btn btn--primary btn--sm">${tr ? "Làm lại test" : "Làm test"}</span></a>
        </div>
        ${exH}
        <nav class="unitnav" aria-label="Chuyển bài">${link(prev, -1)}${link(nxt, 1)}</nav></div></section>`;
    SB.setCur({ refresh: () => bookUnit(id, n) });
  }
  async function bookUnitStudy(id, n) {
    const b = bookOf(id); if (!b || !b.ready) return SB.notFound();
    await loadAll();
    const u = b.units.find(x => String(x.n) === String(n)); if (!u) return SB.notFound();
    const its = bookItems(b, u); if (!its.length) return SB.notFound();
    study({ mode: "card", title: `${b.short} · Bài ${u.n} · Ôn tập`, titleJa: u.ja, sub: `${u.vi}. ${its.length} mẫu, giữ đúng thứ tự trong sách. Ôn xong hãy làm test để được tính điểm.`, crumb: `Bài ${u.n}`, crumbHref: `#/giao-trinh/${id}/${u.n}`, items: its,
      extra: `<p class="unitplan"><a href="#/giao-trinh/${id}/${u.n}/test">Làm test 16 câu →</a></p>` });
  }
  async function bookReview(id) {
    const b = bookOf(id); if (!b || !b.ready) return SB.notFound(); await loadAll();
    const seen = new Set(), items = b.units.flatMap(u => bookItems(b, u)).filter(p => P.rv[p.id] && !seen.has(p.id) && seen.add(p.id));
    if (!items.length) { location.hash = `#/giao-trinh/${id}`; return; }
    study({ title: `${b.short} · Mẫu cần ôn`, sub: `${items.length} mẫu bạn chưa thuộc trong sách này.`, crumb: b.name, crumbHref: `#/giao-trinh/${id}`, items });
  }

  /* ------------------------------------------------------------ cần ôn */
  async function review() {
    await loadAll(); const items = allPats().filter(p => P.rv[p.id]);
    main.innerHTML = band({ big: "復習", bigJp: true, title: "Danh sách cần ôn", text: "Mọi mẫu bạn đánh dấu “Chưa thuộc” hoặc trả lời sai, gom từ tất cả các nơi.", meta: `<b>${items.length}</b><span>mẫu cần ôn</span>` }) +
      `<section class="sec" style="padding-top:32px"><div class="wrap">${items.length ? `<div class="toolbar"><a class="btn btn--primary" href="#/on-tap/hoc">Ôn ${items.length} mẫu này</a><span class="grow"></span><button class="btn btn--ghost btn--sm" type="button" data-clear>Xóa danh sách</button></div>
        <ul class="rows rows--tight">${items.map(rowHTML).join("")}</ul>` : `<div class="empty"><h3>Chưa có mẫu nào cần ôn</h3><p>Khi học thẻ, bấm “Chưa thuộc” để đưa mẫu vào đây. Các câu làm sai cũng tự vào đây.</p><a class="btn btn--primary" href="#/cap-do">Chọn cấp độ</a></div>`}</div></section>`;
    const c = $("[data-clear]"); if (c) c.onclick = () => { if (confirm("Xóa toàn bộ danh sách cần ôn? Tiến độ “đã học” vẫn được giữ.")) { P.rv = {}; P.clr = nowSec(); saveP(); review(); } };
    SB.setCur({ refresh: review });
  }
  async function reviewStudy() {
    await loadAll(); const items = allPats().filter(p => P.rv[p.id]);
    if (!items.length) { location.hash = "#/on-tap"; return; }
    study({ title: "Ôn các mẫu chưa thuộc", sub: `${items.length} mẫu từ nhiều nơi khác nhau.`, crumb: "Danh sách cần ôn", crumbHref: "#/on-tap", items });
  }

  SB.G.routes = { detail, levelList, level, groupStudy, facetList, facetDetail, facetStudy, books, book, bookUnit, bookUnitStudy, bookReview, review, reviewStudy };
  SB.G.gen = { exAll, clozeQ, meanOpts, shortMean, load, bookOf, bookItems, tsGet, tsSet, tsCls, gtPass, gtState, loadAll, levelOf: id => levelOf(id) };
})();
