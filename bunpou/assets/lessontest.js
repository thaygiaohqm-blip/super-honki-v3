/* Super Bunpou - bài test 16 câu cho mỗi bài giáo trình / mỗi nhóm ngữ pháp.
   Câu hỏi lấy từ các chức năng ôn tập (điền chỗ trống, mẫu↔nghĩa, sắp xếp câu, chia từ, ghép cặp), trộn ngẫu nhiên.
   Điểm: từ 80% xanh, 60–79% vàng, dưới 60% đỏ; có đáp án sau từng câu và lời khuyên cuối bài. */
(() => {
  "use strict";
  const { esc, jp, plain, speak, $, $$, shuffle, band, lvtag, verdictHTML, pickWord, verdict, celebrate, wobble, glow, buzz, scoreRing, afterDone, ICON_SPEAK, rich } = SB;
  const main = $("#main");
  const TOTAL = 16;
  const PLAN = [["cloze", 5], ["pm", 2], ["mp", 2], ["sao", 3], ["chia", 3], ["match", 1]];
  const G = () => SB.G.gen;
  const norm = s => String(s || "").normalize("NFKC").replace(/\s+/g, "").replace(/[。、]/g, "");
  const KIND = { v: "động từ", i: "tính từ い", na: "tính từ な" };
  const pick = a => a[Math.floor(Math.random() * a.length)];

  /* ---------------------------------------------------------- tạo đề */
  function build(items) {
    const g = G(), out = [], seen = new Set(), usedEx = new Set();
    const order = () => shuffle(items.slice());
    const add = (q, key) => { if (seen.has(key)) return false; seen.add(key); out.push(q); return true; };
    const make = {
      cloze(p) { const q = g.clozeQ(p, items, usedEx); if (!q) return false; const ok = add({ t: "mc", kind: "cloze", p, e: q.e, opts: q.opts, ans: q.ans }, "cloze|" + q.e.ja); if (ok) usedEx.add(q.e.ja); return ok; },
      pm(p) { const o = g.meanOpts(p, items, "mean"); return o.length >= 2 && add({ t: "mc", kind: "pm", p, opts: o, ans: o.indexOf(p) }, "pm|" + p.id); },
      mp(p) { const o = g.meanOpts(p, items, "pat"); return o.length >= 2 && add({ t: "mc", kind: "mp", p, opts: o, ans: o.indexOf(p) }, "mp|" + p.id); },
      sao(p) { const ex = g.exAll(p).filter(e => e.so && !seen.has("sao|" + e.ja)); if (!ex.length) return false; const e = pick(ex); return add({ t: "sao", p, e, shuf: null, place: [] }, "sao|" + e.ja); },
      chia(p) { const ex = g.exAll(p).filter(e => e.cj && !seen.has("chia|" + e.ja)); if (!ex.length) return false; const e = pick(ex); return add({ t: "chia", p, e }, "chia|" + e.ja); },
      match() {
        const pool = shuffle(items.slice()), set = [], means = new Set();
        for (const p of pool) { const m = g.shortMean(p); if (!means.has(m)) { means.add(m); set.push(p); } if (set.length >= 4) break; }
        if (set.length < 3) return false; return add({ t: "match", set, p: set[0], rt: shuffle(set.map(p => g.shortMean(p))) }, "match|" + set.map(p => p.id).join());
      }
    };
    for (const [type, n] of PLAN) {
      let got = 0, guard = 0, lst = order();
      while (got < n && guard++ < 60) { if (type === "match" ? make.match() : make[type](lst[guard % lst.length])) got++; }
    }
    for (let guard = 0; out.length < TOTAL && guard < 300; guard++) {         // thiếu loại nào thì bù bằng các loại luôn tạo được
      const t = pick(["cloze", "cloze", "pm", "mp", "sao", "chia"]); const lst = order(); make[t](lst[guard % lst.length]);
    }
    return shuffle(out).slice(0, TOTAL);
  }

  /* ---------------------------------------------------------- chạy bài */
  function run(ctx) {
    const deck = build(ctx.items);
    const st = { k: 0, right: 0, log: [], streak: 0 };
    main.innerHTML = band({ big: "", title: `${esc(ctx.title)}<span class="jp" lang="ja" style="display:block;font-size:.62em;color:#bcd3d1;margin-top:4px">${ctx.titleJa ? jp(ctx.titleJa, { hl: false }) : ""}</span>`, crumb: ctx.crumb, crumbHref: ctx.crumbHref, text: `Bài test ${deck.length} câu trộn từ các dạng ôn tập. Có đáp án sau từng câu và chấm điểm cuối bài.`, compact: true }).replace('<div class="band__big"', '<div class="band__big" hidden') +
      `<section class="study"><div class="wrap exwrap"><div class="exprog"><span data-pg></span><span class="exprog__bar"><i data-bar></i></span></div><div data-stage></div></div></section>`;
    SB.setCur({ refresh: () => {} });
    const stage = $("[data-stage]");
    const prog = () => { $("[data-pg]").textContent = `Câu ${Math.min(st.k + 1, deck.length)} / ${deck.length} · đúng ${st.right}`; $("[data-bar]").style.width = (st.k / deck.length * 100) + "%"; };
    if (!deck.length) { stage.innerHTML = `<div class="card"><div class="empty"><h3>Chưa đủ dữ liệu để ra đề</h3><p>Phần này có quá ít mẫu hoặc ví dụ. Hãy vào phần Ôn tập.</p><a class="btn btn--primary" href="${ctx.studyHref}">Vào ôn tập</a></div></div>`; return; }

    const finishQ = (q, ok, anchor, ansHTML, host) => {
      st.word = pickWord(ok); st.streak = ok ? st.streak + 1 : 0;
      if (ok) st.right++; else SB.mark(q.p.id, "rv");
      st.log.push({ q, ok });
      const fb = $(".feedback", stage); fb.className = "feedback " + (ok ? "ok" : "no");
      fb.innerHTML = verdictHTML(ok, st.word, ansHTML, st.streak); verdict(fb, ok);
      if (anchor) { if (ok) celebrate(anchor, st.streak > 0 && st.streak % 5 === 0); else { wobble(anchor); } } glow($(".card", stage), ok); if (!ok) buzz();
      $$("[data-say]", fb).forEach(b => b.onclick = () => speak(b.dataset.say));
      const nx = $("[data-next]", stage); nx.hidden = false; nx.focus({ preventScroll: true }); prog();
      $(".ltm__chk", stage) && ($(".ltm__chk", stage).hidden = true);
    };
    const frame = (inner, label, hasCheck) => {
      stage.innerHTML = `<div class="card"><div class="quiz"><div class="card__top"><span>${label}</span><span class="card__num">${st.k + 1} <small>/ ${deck.length}</small></span></div>${inner}
        <div class="feedback" aria-live="polite"></div><div class="card__actions">${hasCheck ? '<button class="btn btn--primary" type="button" data-check>Kiểm tra</button>' : ""}<button class="btn btn--primary" type="button" data-next hidden>${st.k + 1 >= deck.length ? "Xem kết quả" : "Câu tiếp"}</button></div></div></div>`;
      $("[data-next]", stage).onclick = () => { st.k++; step(); window.scrollTo({ top: 0 }); };
      prog();
    };
    const say = t => `<button class="icon-btn" type="button" data-say="${esc(plain(t))}">${ICON_SPEAK} Nghe câu</button>`;

    function qMC(q) {
      const p = q.p, cl = q.kind === "cloze";
      const stem = cl ? `<p class="test-ask">Chọn mẫu ngữ pháp điền vào chỗ trống</p><div class="say say--sm" lang="ja">${jp(q.e.ja, { blank: true })}</div><div class="card__hint">${esc(q.e.vi)}</div>`
        : q.kind === "pm" ? `<p class="test-ask">Mẫu này có nghĩa là gì?</p><div class="say" lang="ja">${jp(p.pat, { hl: false })}</div>` : `<p class="test-ask">Mẫu ngữ pháp nào có nghĩa như sau?</p><div class="back__mean">${esc(G().shortMean(p))}</div>`;
      const label = o => cl ? jp(o.t, { hl: false }) : q.kind === "pm" ? esc(G().shortMean(o)) : jp(o.pat, { hl: false });
      const jpO = q.kind !== "pm";
      frame(`<div class="quiz__q">${stem}</div><div class="opts">${q.opts.map((o, i) => `<button class="opt${jpO ? " jp-opt" : ""}" type="button" data-o="${i}" ${jpO ? 'lang="ja"' : ""}><span class="k">${i + 1}</span><span>${label(o)}</span></button>`).join("")}</div>`, cl ? "Điền chỗ trống" : q.kind === "pm" ? "Mẫu → Nghĩa" : "Nghĩa → Mẫu");
      $$("[data-o]", stage).forEach(b => b.onclick = () => {
        if ($("[data-next]", stage).hidden === false) return; const i = +b.dataset.o, ok = i === q.ans;
        $$("[data-o]", stage).forEach((x, k) => { x.disabled = true; if (k === q.ans) x.classList.add("is-right"); else if (k === i) x.classList.add("is-wrong"); });
        const ans = (cl ? `<span lang="ja" class="jp">${jp(q.e.ja, { hl: true })}</span><br>${say(q.e.ja)}<br>` : "") + `<span lang="ja" class="jp">${jp(p.pat, { hl: false })}</span> = ${esc(G().shortMean(p))}`;
        finishQ(q, ok, b, ans);
      });
    }
    function qSao(q) {
      const so = q.e.so; if (!q.shuf) { let sh; do { sh = shuffle([0, 1, 2, 3]); } while (sh.every((v, i) => v === i)); q.shuf = sh; }
      const paint = () => {
        const slot = i => { const idx = q.place[i]; return `<button class="slot${idx != null ? " is-fill" : ""}" type="button" data-slot="${i}" lang="ja">${idx != null ? jp(so.c[idx], { hl: false }) : "　"}</button>`; };
        $(".ltsao", stage).innerHTML = `<div class="sao" lang="ja"><span class="sao__fix">${jp(so.pre, { hl: false })}</span>${[0, 1, 2, 3].map(slot).join("")}<span class="sao__fix">${jp(so.post, { hl: false })}</span></div>
          <div class="card__hint">${esc(q.e.vi)}</div><div class="chunks">${q.shuf.map(idx => `<button class="chunk" type="button" data-ch="${idx}" lang="ja" ${q.place.includes(idx) ? "disabled" : ""}>${jp(so.c[idx], { hl: false })}</button>`).join("")}</div>`;
        $$("[data-ch]", stage).forEach(b => b.onclick = () => { if (q.done || q.place.length >= 4) return; q.place.push(+b.dataset.ch); paint(); });
        $$("[data-slot]", stage).forEach(b => b.onclick = () => { if (q.done) return; const i = +b.dataset.slot; if (q.place[i] != null) { q.place.splice(i, 1); paint(); } });
        $("[data-check]", stage).disabled = q.place.length < 4;
      };
      frame(`<p class="test-ask">Sắp xếp các cụm thành câu hoàn chỉnh</p><div class="ltsao"></div>`, "Sắp xếp câu", true);
      paint();
      $("[data-check]", stage).onclick = () => {
        if (q.place.length < 4 || q.done) return; q.done = true;
        const ok = q.place.every((v, i) => v === i);
        $$(".slot", stage).forEach((b, i) => b.classList.add(q.place[i] === i ? "is-right" : "is-wrong")); $("[data-check]", stage).hidden = true;
        finishQ(q, ok, $(".sao", stage), `<span lang="ja" class="jp">${jp(q.e.ja, { hl: true })}</span><br>${say(q.e.ja)} <small>${esc(q.p.mean)}</small>`);
      };
    }
    function qChia(q) {
      const cj = q.e.cj, p = q.p;
      frame(`<p class="test-ask">Chia từ cho đúng theo mẫu: <b class="jp" lang="ja">${jp(p.pat, { hl: false })}</b> <span class="muted">(${esc(p.mean)})</span></p>
        <div class="say say--sm chia__s" lang="ja"><span>${jp(cj.pre, { hl: false })}</span><input class="chia__in" type="text" lang="ja" autocomplete="off" autocapitalize="off" spellcheck="false" size="${Math.max(5, plain(cj.ans[0]).length + 2)}" aria-label="Chỗ trống" data-in><span>${jp(cj.post)}</span></div>
        <div class="card__hint">${esc(q.e.vi)}</div><div class="chia__base"><span>Từ gốc</span><b class="jp" lang="ja">${esc(cj.base)}</b><small>${KIND[cj.k]}</small></div>`, "Chia từ", true);
      const inp = $("[data-in]", stage); inp.focus({ preventScroll: true });
      const go = () => {
        if (inp.disabled) return; const v = norm(inp.value); if (!v) return inp.focus();
        const ok = cj.ans.some(a => norm(a) === v); inp.disabled = true; inp.classList.add(ok ? "is-right" : "is-wrong"); $("[data-check]", stage).hidden = true;
        finishQ(q, ok, inp, `Đáp án: <b class="jp" lang="ja">${esc(cj.ans[0])}</b>${cj.ans[1] ? ` <small>(${esc(cj.ans[1])})</small>` : ""}<br><span lang="ja" class="jp">${jp(q.e.ja, { hl: true })}</span><br>${say(q.e.ja)}`);
      };
      $("[data-check]", stage).onclick = go; inp.onkeydown = ev => { if (ev.key === "Enter") go(); };
    }
    function qMatch(q) {
      const rows = q.set.map((p, i) => `<div class="ltm__row" data-r="${i}"><span class="jp" lang="ja">${jp(p.pat, { hl: false })}</span><select aria-label="Nghĩa của mẫu ${i + 1}"><option value="">Chọn nghĩa…</option>${q.rt.map(m => `<option value="${esc(m)}">${esc(m)}</option>`).join("")}</select></div>`).join("");
      frame(`<p class="test-ask">Ghép mỗi mẫu với nghĩa đúng của nó</p><div class="ltm">${rows}</div>`, "Ghép cặp", true);
      $("[data-check]", stage).onclick = () => {
        const sel = $$(".ltm__row select", stage); if (sel.some(s => !s.value)) return toastMsg("Hãy chọn nghĩa cho cả " + sel.length + " mẫu.");
        let ok = true; const fix = [];
        sel.forEach((s, i) => { const good = s.value === G().shortMean(q.set[i]); s.disabled = true; s.parentElement.classList.add(good ? "is-right" : "is-wrong"); if (!good) ok = false; fix.push(`<span lang="ja" class="jp">${jp(q.set[i].pat, { hl: false })}</span> = ${esc(G().shortMean(q.set[i]))}`); });
        $("[data-check]", stage).hidden = true;
        finishQ(q, ok, $(".ltm", stage), fix.join("<br>"));
      };
    }
    const toastMsg = m => SB.toast(m);
    function step() {
      if (st.k >= deck.length) return done();
      const q = deck[st.k];
      if (q.t === "mc") qMC(q); else if (q.t === "sao") qSao(q); else if (q.t === "chia") qChia(q); else qMatch(q);
    }
    function done() {
      const total = deck.length, pct = Math.round(st.right / total * 100), cls = pct >= 80 ? "g" : pct >= 60 ? "y" : "r";
      const rec = ctx.save(pct);
      const wrong = [...new Map(st.log.filter(x => !x.ok).map(x => [x.q.p.id, x.q.p])).values()];
      const wl = wrong.length ? `<ul>${wrong.map(p => `<li><a href="#/ngu-phap/${p.id}"><span class="jp" lang="ja">${jp(p.pat, { hl: false })}</span></a> · ${esc(G().shortMean(p))}</li>`).join("")}</ul>` : "";
      const adv = cls === "g" ? { h: "Đạt, xuất sắc!", t: `Bạn nắm chắc phần này, ${ctx.what} được tô xanh. Sang bài tiếp theo, vài ngày sau quay lại làm test một lần nữa để giữ trí nhớ.` }
        : cls === "y" ? { h: "Khá, nhưng chưa chắc", t: `${ctx.what} được tô vàng. Hãy đọc lại lý thuyết các mẫu làm sai bên dưới, ôn bằng ghép cặp và trắc nghiệm, rồi làm test lần nữa để lên mức xanh (từ 80%).` }
          : { h: "Chưa vững, cần học lại", t: `${ctx.what} được tô đỏ. Đừng vội làm tiếp bài sau. Hãy đọc lại lý thuyết từng mẫu sai, học thẻ cho đến khi nhớ nghĩa và cấu trúc, làm chia từ cho quen cách nối, rồi quay lại test.` };
      const msg = ctx.after ? ctx.after(pct) : "";
      stage.innerHTML = `<div class="card"><div class="done lt__res">${scoreRing(st.right, total)}<h3>${st.right} / ${total} câu đúng</h3>
        <div class="lt__adv lt__adv--${cls}" style="text-align:left"><h3>${adv.h}</h3><p>${adv.t}</p>${wrong.length ? `<p><b>Mẫu cần xem lại:</b></p>${wl}` : ""}</div>
        <p class="muted">Điểm tốt nhất của bạn: <b>${rec.best}%</b> (đã làm ${rec.n} lần). ${msg}</p>
        <div class="hero__actions"><button class="btn btn--primary" type="button" data-again>Làm lại test (đề mới)</button><a class="btn btn--ghost" href="${ctx.studyHref}">Ôn tập</a><a class="btn btn--ghost" href="${ctx.backHref}">${ctx.backLabel}</a></div></div></div>`;
      afterDone(stage, st.right, total); $("[data-pg]").textContent = `Điểm ${pct}%`; $("[data-bar]").style.width = "100%";
      $("[data-again]", stage).onclick = () => run(ctx);
    }
    step();
  }

  /* ---------------------------------------------------------- hai nơi dùng */
  async function runBook(bid, n) {
    const g = G(); await g.loadAll();
    const b = g.bookOf(bid), u = b && b.units.find(x => String(x.n) === String(n)); if (!u) return SB.notFound();
    let items = g.bookItems(b, u); if (!items.length) return SB.notFound();
    /* bài chỉ có 1–4 mẫu: bổ sung mẫu của các bài liền trước để đủ 16 câu */
    for (let k = b.units.indexOf(u) - 1; items.length < 5 && k >= 0; k--) { const more = g.bookItems(b, b.units[k]); items = items.concat(more.filter(p => !items.includes(p))); }
    run({ items, title: `${b.short} · Bài ${u.n} · Test`, titleJa: u.ja, crumb: `Bài ${u.n}`, crumbHref: `#/giao-trinh/${bid}/${u.n}`, studyHref: `#/giao-trinh/${bid}/${u.n}/on-tap`, backHref: `#/giao-trinh/${bid}`, backLabel: "Về danh sách bài", what: `Bài ${u.n}`,
      save: pct => g.tsSet("bk:" + bid, u.n, pct), after: pct => { if (pct < 80) return ""; const m = g.gtPass(b, u); return m || ""; } });
  }
  async function runGroup(lv, n) {
    const g = G(), D = await g.load(lv), grp = D.groups.find(x => x.n === +n); if (!grp) return SB.notFound();
    const items = D.pats.filter(p => p.g === grp.n);
    run({ items, title: `${lv.toUpperCase()} · Nhóm ${grp.n} · Test`, titleJa: grp.ja, crumb: `Các nhóm ${lv.toUpperCase()}`, crumbHref: `#/cap-do/${lv}`, studyHref: `#/cap-do/${lv}/nhom/${grp.n}`, backHref: `#/cap-do/${lv}`, backLabel: "Về danh sách nhóm", what: `Nhóm ${grp.n}`,
      save: pct => g.tsSet("lv:" + lv, grp.n, pct) });
  }
  SB.lt = { runBook, runGroup, build };
})();
