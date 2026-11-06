/* Super Bunpou - bài tập trong giáo trình: danh sách bộ đề, làm bài, giải thích từng câu, câu sai.
   Dữ liệu: data/ex-<cấp>.js gọi SB.exData({...}). Tiến độ lưu cục bộ ở sb:ex (không đồng bộ). */
(() => {
  "use strict";
  const { esc, jp, plain, speak, store, toast, $, $$, band, meter, doneHTML, afterDone, ICON_SPEAK, verdictHTML, pickWord, celebrate, wobble, glow, buzz } = SB;
  const main = $("#main");
  const DATA = {}, pending = {};
  const X = Object.assign({ sets: {}, wrong: {} }, store.get("ex", {}));
  const saveX = () => store.set("ex", X);
  SB.exData = d => { DATA[d.book] = d; (pending[d.book] || []).forEach(f => f(d)); delete pending[d.book]; };

  function ensure(bid) {
    if (DATA[bid]) return Promise.resolve(DATA[bid]);
    const m = bid === "minna" ? [0, "minna"] : /^shin-(n\d)$/.exec(bid); if (!m) return Promise.resolve(null);
    if (pending[bid]) return new Promise(ok => pending[bid].push(ok));
    return new Promise(ok => {
      pending[bid] = [ok];
      const s = document.createElement("script"); s.src = `data/ex-${m[1]}.js`;
      s.onerror = () => { (pending[bid] || []).forEach(f => f(null)); delete pending[bid]; };
      document.head.appendChild(s);
    });
  }
  let VI = {};
  SB.viMinna = d => { VI = d; };
  const sq = t => String(t).replace(/\s+/g, "");
  /* bản dịch tiếng Việt của câu hoàn chỉnh (sau khi điền đáp án đúng); tra theo data/vi-minna.js */
  function trOf(s, q) {
    const t = q.t || s.type; let f = null;
    try {
      if (t === "ord") f = q.pre + q.order.split("").map(c => q.opts[c - 1]).join("") + q.post;
      else if (t === "fill") f = q.q.replace(/（\s*）|（　+）|＿+/, (q.acc || [""])[0]);
      else if (t === "mc" && q.ans) f = q.q.replace(/（\s*）|（　+）|＿+|\(\s*\)/, q.opts[q.ans[0] - 1]);
    } catch (e) { return ""; }
    return f ? VI[sq(f)] || "" : "";
  }
  const hasJa = t => /[\u3040-\u30ff\u3400-\u9fff]/.test(plain(String(t)));
  const tx = (t, o) => hasJa(t) ? jp(t, o) : esc(String(t));        // tiếng Việt: giữ dấu cách, dùng phông thường
  const pctCls = p => p >= 80 ? "g" : p >= 60 ? "y" : "r";
  const ADV = {
    g: { h: "Đạt, xuất sắc!", t: "Bạn nắm chắc phần này. Sang bài tiếp theo, vài ngày sau quay lại làm lại một lần để giữ trí nhớ." },
    y: { h: "Khá, nhưng chưa chắc", t: "Hãy xem lại các câu sai (mục Làm lại câu sai), đọc lại ngữ pháp và từ vựng của bài, rồi làm lại để lên mức xanh (từ 80%)." },
    r: { h: "Chưa vững, cần học lại", t: "Đừng vội sang bài sau. Học lại từ vựng và mẫu câu của bài, làm lại các câu sai, rồi thử lại bộ đề này." } };
  const advHTML = pct => { const c = pctCls(pct), a = ADV[c]; return `<div class="lt__adv lt__adv--${c}" style="text-align:left;margin:10px 0"><h3>${a.h} · ${pct}%</h3><p>${a.t}</p></div>`; };
  const KIND = { mix: "Tổng hợp", mc: "Trắc nghiệm", ord: "Sắp xếp câu ★", fill: "Điền từ", pfill: "Điền vào đoạn văn", pmc: "Chọn vào đoạn văn" };
  const nq = s => s.qs.length;
  /* bộ đề hiện ở bài cuối cùng trong danh sách bài của nó (các bài tổng hợp nằm ở cuối) */
  const setsOf = (d, n) => d ? d.sets.filter(s => s.units[s.units.length - 1] === String(n)) : [];
  const wrongKeys = d => Object.keys(X.wrong).filter(k => d.sets.some(s => k.startsWith(s.id + ":")));
  const norm = s => String(s || "").normalize("NFKC").replace(/\s+/g, "").replace(/[。、.,]/g, "");
  const letters = "1234567";
  const speakBtn = t => `<button class="btn btn--ghost btn--sm exq__say" type="button" data-say="${esc(t)}" aria-label="Nghe câu hoàn chỉnh">${ICON_SPEAK} Nghe</button>`;
  const hook = root => $$("[data-say]", root).forEach(b => { b.onclick = () => speak(b.dataset.say); });

  function setRow(bid, s, unitNo) {
    const r = X.sets[s.id], pct = r ? Math.round(r.r / r.t * 100) : null;
    const span = s.units.length > 1 && !/bài \d/.test(s.title) ? ` <small>(bài ${esc(s.units[0])}–${esc(s.units[s.units.length - 1])})</small>` : "";
    return `<li><a class="exset${r ? " exset--done exset--" + pctCls(Math.round((r.best || r.r) / r.t * 100)) : ""}" href="#/giao-trinh/${bid}/bai-tap/${esc(s.id)}"><span class="exset__t jp" lang="ja">${bid === "minna" ? esc(s.title) : jp(s.title, { hl: false })}${span}</span>
      <span class="exset__m">${KIND[s.type]} · ${nq(s)} câu</span><span class="exset__r">${r ? `Gần nhất ${r.r}/${r.t} · tốt nhất ${Math.round((r.best || r.r) / r.t * 100)}%` : "Chưa làm"}</span></a></li>`;
  }

  /* trang bài: tóm tắt bài + danh sách bộ đề (dùng cho bài chưa có mẫu ngữ pháp, hoặc xem riêng bài tập) */
  async function unitPage(b, n) {
    const d = await ensure(b.id); if (!d) return false;
    const i = b.units.findIndex(u => String(u.n) === String(n)); if (i < 0) return false;
    const u = b.units[i], prev = b.units[i - 1], nxt = b.units[i + 1];
    const les = d.lessons.filter(l => l.units.includes(String(n))), sets = setsOf(d, n);
    if (!les.length && !sets.length) return false;
    const link = (x, dir) => x ? `<a class="unitnav__a" href="#/giao-trinh/${b.id}/${x.n}">${dir < 0 ? "← " : ""}Bài ${esc(x.n)}${dir > 0 ? " →" : ""}</a>` : "<span></span>";
    const nsets = sets.length, wr = wrongKeys(d).filter(k => sets.some(s => k.startsWith(s.id + ":"))).length;
    main.innerHTML = band({ big: "", title: `${esc(b.short)} · Bài ${esc(u.n)}`, crumb: b.name, crumbHref: `#/giao-trinh/${b.id}`, text: `${esc(u.vi)}. ${nsets} bộ đề, ${sets.reduce((a, s) => a + nq(s), 0)} câu.`, compact: true }).replace('<div class="band__big"', '<div class="band__big" hidden') +
      `<section class="sec"><div class="wrap exwrap">
        ${les.map(l => `<article class="exlesson"><h2 class="jp" lang="ja">${jp(l.title, { hl: false })}</h2>${l.lines.map(x => `<p>${esc(x)}</p>`).join("")}</article>`).join("")}
        ${nsets ? `<div class="sec__head"><h2>${b.id === "minna" ? "Kiểm tra trắc nghiệm" : "Bài tập trong sách"}</h2></div>
        <ul class="exsets">${sets.map(s => setRow(b.id, s, n)).join("")}</ul>
        ${wr ? `<p><a class="btn btn--coral btn--sm" href="#/giao-trinh/${b.id}/bai-tap/sai?u=${encodeURIComponent(n)}">Làm lại ${wr} câu sai trong bài này</a></p>` : ""}` : ""}
        <nav class="unitnav" aria-label="Chuyển bài">${link(prev, -1)}${link(nxt, 1)}</nav></div></section>`;
    SB.setCur({ refresh: () => unitPage(b, n) });
    return true;
  }
  /* đoạn ngắn chèn vào trang bài có mẫu: số bộ đề + liên kết */
  async function unitLink(b, n) {
    const d = await ensure(b.id), sets = setsOf(d, n); if (!sets.length) return "";
    return `<p class="exlink"><b>${b.id === "minna" ? "Kiểm tra trắc nghiệm" : "Bài tập trong sách"}:</b> ${sets.length} bộ đề (${sets.reduce((a, s) => a + nq(s), 0)} câu) <a href="#/giao-trinh/${b.id}/${esc(n)}/bai-tap">Làm bài tập →</a></p>`;
  }
  const countFor = (bid, n) => setsOf(DATA[bid], n).length;
  async function hub(b) {
    const d = await ensure(b.id); if (!d) return "";
    const total = d.sets.reduce((a, s) => a + nq(s), 0), done = d.sets.filter(s => X.sets[s.id]).length, wr = wrongKeys(d).length;
    return `<section class="sec"><div class="wrap"><div class="sec__head"><h2>${b.id === "minna" ? "Kiểm tra trắc nghiệm theo bài" : "Bài tập trong sách"}</h2></div>
      <div class="plan"><div class="plan__c"><span class="plan__k">Đã làm</span><b>${done} / ${d.sets.length} bộ đề</b>${meter(done, d.sets.length)}</div>
      <div class="plan__c"><span class="plan__k">Câu làm sai</span><b>${wr} câu</b>${wr ? `<a class="btn btn--coral btn--sm" href="#/giao-trinh/${b.id}/bai-tap/sai">Làm lại câu sai</a>` : "<span>Chưa có câu sai.</span>"}</div></div></div></section>`;
  }

  /* ------------------------------------------------------------ làm bài */
  function pagesOf(d, sets, only) {
    const out = [];
    sets.forEach(s => {
      if (s.type === "pfill" || s.type === "pmc") {
        if (!only || s.qs.some(q => only.has(s.id + ":" + q.n))) out.push({ s, passage: true, qs: s.qs });
      } else s.qs.forEach(q => { if (!only || only.has(s.id + ":" + q.n)) out.push({ s, q }); });
    });
    return out;
  }
  function mark(s, q, ok) { const k = s.id + ":" + q.n; if (ok) delete X.wrong[k]; else X.wrong[k] = Date.now(); }

  async function run(b, id, qs) {
    const d = await ensure(b.id); if (!d) return SB.notFound();
    let sets, title, back, only = null;
    if (id === "sai") {
      const u = new URLSearchParams(qs || "").get("u"), keys = wrongKeys(d).filter(k => !u || (d.sets.find(s => k.startsWith(s.id + ":")) || { units: [] }).units.includes(u));
      if (!keys.length) { location.hash = `#/giao-trinh/${b.id}`; return; }
      only = new Set(keys); sets = d.sets.filter(s => keys.some(k => k.startsWith(s.id + ":")));
      title = "Làm lại câu sai"; back = `#/giao-trinh/${b.id}`;
    } else {
      const s = d.sets.find(x => x.id === id); if (!s) return SB.notFound();
      sets = [s]; title = s.title; back = `#/giao-trinh/${b.id}/${s.units[s.units.length - 1]}`;
    }
    const pages = pagesOf(d, sets, only), total = pages.reduce((a, p) => a + (p.passage ? p.qs.length : 1), 0);
    let i = 0, right = 0, answered = 0;
    main.innerHTML = band({ big: "", title: id === "sai" || b.id === "minna" ? esc(title) : `<span class="jp" lang="ja">${jp(title, { hl: false })}</span>`, crumb: "Quay lại bài", crumbHref: back, text: `${total} câu. Có giải thích sau mỗi câu.`, compact: true }).replace('<div class="band__big"', '<div class="band__big" hidden') +
      `<section class="study"><div class="wrap exwrap"><div class="exprog"><span data-pg></span><span class="exprog__bar"><i data-bar></i></span></div><div class="card exq" data-stage></div></div></section>`;
    SB.setCur({ refresh: () => {} });
    const stage = $("[data-stage]");
    const prog = () => { $("[data-pg]").textContent = `Trang ${Math.min(i + 1, pages.length)} / ${pages.length} · đúng ${right}/${answered}`; $("[data-bar]").style.width = (i / pages.length * 100) + "%"; };
    const next = () => { i++; render(); window.scrollTo({ top: 0 }); };
    const nextBtn = () => `<button class="btn btn--primary" type="button" data-next>${i + 1 >= pages.length ? "Xem kết quả" : "Câu tiếp"}</button>`;
    let streak = 0;
    const feedback = (ok, ansText, exp, say, tr) => { streak = ok ? streak + 1 : 0;
      return `<div class="exfb ${ok ? "exfb--ok" : "exfb--no"}" role="status">${verdictHTML(ok, pickWord(ok), "", streak)} ${ansText ? `<span class="exfb__ans ${hasJa(ansText) ? "jp" : ""}" lang="${hasJa(ansText) ? "ja" : "vi"}">Đáp án: ${ansText}</span>` : ""}
      ${tr ? `<p class="exfb__tr"><b>Dịch:</b> ${esc(tr)}</p>` : ""}${exp && !/^(Đáp án|Thứ tự đúng đã)/.test(exp) ? `<p>${esc(exp)}</p>` : ""}<div class="exfb__bar">${say ? speakBtn(say) : ""}${nextBtn()}</div></div>`; };
    const fx = (ok, el) => { const fb = $(".exfb", stage); if (ok) { celebrate(el || fb); } else { wobble(el || fb); buzz(); } if (fb) glow(fb, ok); };

    function done() {
      const k = id === "sai" ? null : sets[0].id;
      if (k) { const old = X.sets[k]; X.sets[k] = { r: right, t: total, ts: Date.now(), best: Math.max(old ? old.best || old.r : 0, right) }; }
      saveX();
      const pctNow = total ? Math.round(right / total * 100) : 0;
      if (k && b.id === "minna" && SB.G && SB.G.gen) { const m = /^k(\d+)(?:-(\d+))?$/.exec(k); if (m) [m[1], m[2]].filter(Boolean).forEach(u => SB.G.gen.tsSet("bk:minna", u, pctNow)); }
      const wr = wrongKeys(d).filter(x => sets.some(s => x.startsWith(s.id + ":"))).length;
      stage.innerHTML = doneHTML(id === "sai" ? "Xong lượt làm lại" : "Xong bộ đề", right, total, `Đúng ${right} / ${total} câu (${pctNow}%).${wr ? ` Còn ${wr} câu sai đang được lưu.` : ""}</p>${advHTML(pctNow)}<p>`,
        `${k ? `<a class="btn btn--ghost" href="#/giao-trinh/${b.id}/bai-tap/${esc(k)}" data-again>Làm lại</a>` : ""}${wr ? `<a class="btn btn--coral" href="#/giao-trinh/${b.id}/bai-tap/sai${id === "sai" ? "" : "?u=" + encodeURIComponent(sets[0].units[sets[0].units.length - 1])}">Làm lại câu sai</a>` : ""}<a class="btn btn--primary" href="${back}">Về bài</a>`);
      afterDone(stage, right, total);
      const again = $("[data-again]", stage); if (again) again.onclick = e => { e.preventDefault(); i = 0; right = 0; answered = 0; render(); };
      $("[data-pg]").textContent = `Đúng ${right}/${total}`; $("[data-bar]").style.width = "100%";
    }
    function render() {
      if (i >= pages.length) return done();
      prog();
      const p = pages[i];
      if (p.passage) return passage(p);
      const t = p.q.t || p.s.type;
      if (t === "mc") return mc(p); if (t === "ord") return ord(p); return fill(p);
    }
    /* trắc nghiệm */
    function mc({ s, q }) {
      const multi = q.ans.length > 1, sel = new Set();
      stage.innerHTML = `<div class="exq__n">Câu ${q.n}${multi ? ` <span class="exq__tag">chọn ${q.ans.length} đáp án</span>` : ""}</div><p class="exq__stem ${hasJa(q.q) ? "jp" : "exq__stem--vi"}" lang="${hasJa(q.q) ? "ja" : "vi"}">${tx(q.q, { hl: false })}</p>
        <div class="opts">${q.opts.map((o, k) => `<button class="opt ${hasJa(o) ? "jp-opt" : "opt--vi"}" type="button" data-k="${k + 1}"><span class="k">${letters[k]}</span><span lang="${hasJa(o) ? "ja" : "vi"}">${tx(o, { hl: false })}</span></button>`).join("")}</div>
        ${multi ? `<div class="exq__bar"><button class="btn btn--primary" type="button" data-check disabled>Kiểm tra</button></div>` : ""}<div data-fb></div>`;
      const btns = $$(".opt", stage);
      const sayText = () => { const w = plain(q.q), a = plain(q.opts[q.ans[0] - 1] || ""); return /[（(]\s*[）)]/.test(w) ? w.replace(/[（(]\s*[）)]/, a) : w; };
      const grade = () => {
        const ok = q.ans.length === sel.size && q.ans.every(a => sel.has(a));
        btns.forEach(bn => { const k = +bn.dataset.k; bn.disabled = true; if (q.ans.includes(k)) bn.classList.add("is-right"); else if (sel.has(k)) bn.classList.add("is-wrong"); });
        const chk = $("[data-check]", stage); if (chk) chk.remove();
        mark(s, q, ok); saveX(); answered++; if (ok) right++; prog();
        $("[data-fb]", stage).innerHTML = feedback(ok, ok ? "" : q.ans.map(a => letters[a - 1] + ". " + plain(q.opts[a - 1] || "")).join(" ／ "), q.exp, sayText(), trOf(s, q));
        fx(ok, ok ? $(".opt.is-right", stage) : $(".opt.is-wrong", stage)); hook(stage); $("[data-next]", stage).onclick = next; $("[data-next]", stage).focus();
      };
      btns.forEach(bn => bn.onclick = () => {
        const k = +bn.dataset.k;
        if (!multi) { sel.add(k); return grade(); }
        if (sel.has(k)) { sel.delete(k); bn.classList.remove("is-pick"); } else { sel.add(k); bn.classList.add("is-pick"); }
        $("[data-check]", stage).disabled = sel.size !== q.ans.length;
      });
      const chk = $("[data-check]", stage); if (chk) chk.onclick = grade;
    }
    /* sắp xếp câu: 4 ô, ô thứ 3 là ★ */
    function ord({ s, q }) {
      const slots = [null, null, null, null], ST = q.star == null ? 2 : q.star;
      stage.innerHTML = `<div class="exq__n">Câu ${q.n} <span class="exq__tag">xếp 4 mục, chọn mục ở ô ★</span></div>
        <p class="exq__stem jp exq__ord" lang="ja"><span>${jp(q.pre, { hl: false })}</span>${[0, 1, 2, 3].map(k => `<button class="xslot${k === ST ? " xslot--star" : ""}" type="button" data-slot="${k}" aria-label="Ô ${k + 1}${k === ST ? " (★)" : ""}">${k === 2 ? "<i>★</i>" : "<i>＿</i>"}<span></span></button>`).join("")}<span>${jp(q.post, { hl: false })}</span></p>
        <div class="chips">${q.opts.map((o, k) => `<button class="chip jp" type="button" data-o="${k}" lang="ja">${jp(o, { hl: false })}</button>`).join("")}</div>
        <div class="exq__bar"><button class="btn btn--ghost btn--sm" type="button" data-reset>Xếp lại</button><button class="btn btn--primary" type="button" data-check disabled>Kiểm tra</button></div><div data-fb></div>`;
      const slotEls = $$(".xslot", stage), chips = $$(".chip", stage);
      const paint = () => {
        slotEls.forEach((el, k) => { const v = slots[k]; $("span", el).innerHTML = v == null ? "" : jp(q.opts[v], { hl: false }); el.classList.toggle("is-filled", v != null); });
        chips.forEach((c, k) => { c.disabled = slots.includes(k); });
        $("[data-check]", stage).disabled = slots.some(v => v == null);
      };
      chips.forEach((c, k) => c.onclick = () => { const e = slots.indexOf(null); if (e >= 0) { slots[e] = k; paint(); } });
      slotEls.forEach((el, k) => el.onclick = () => { if (slots[k] != null && !$("[data-next]", stage)) { slots[k] = null; paint(); } });
      $("[data-reset]", stage).onclick = () => { if ($("[data-next]", stage)) return; slots.fill(null); paint(); };
      $("[data-check]", stage).onclick = () => {
        const got = slots.map(v => v + 1).join(""), ok = got === q.order, ans = q.order.split("").map(c => +c - 1);
        const full = plain(q.pre) + ans.map(k => plain(q.opts[k])).join("") + plain(q.post);
        slotEls.forEach((el, k) => el.classList.add(slots[k] === ans[k] ? "is-right" : "is-wrong"));
        $$("[data-reset],[data-check]", stage).forEach(e => e.remove()); $$(".chip,.xslot", stage).forEach(e => e.disabled = true);
        mark(s, q, ok); saveX(); answered++; if (ok) right++; prog();
        $("[data-fb]", stage).innerHTML = feedback(ok, `${ans.map(k => jp(q.opts[k], { hl: false })).join(" → ")} <small>(★ = ${jp(q.opts[ans[ST]], { hl: false })})</small>`, q.exp, full, trOf(s, q));
        fx(ok, $(".exq__ord", stage)); hook(stage); $("[data-next]", stage).onclick = next; $("[data-next]", stage).focus();
      };
      paint();
    }
    /* điền từ */
    function fill({ s, q }) {
      stage.innerHTML = `<div class="exq__n">Câu ${q.n} <span class="exq__tag">Từ gợi ý: ${esc(q.hint)}</span></div><p class="exq__stem jp" lang="ja">${jp(q.q, { hl: false }).replace(/＿+/g, '<span class="blank blank--in">＿＿＿</span>')}</p>
        <div class="exq__bar"><input class="exin" type="text" lang="ja" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="Nhập đáp án" data-in><button class="btn btn--primary" type="button" data-check>Kiểm tra</button></div><div data-fb></div>`;
      const inp = $("[data-in]", stage); inp.focus();
      const go = () => {
        const v = norm(inp.value); if (!v) return inp.focus();
        const ok = q.acc.some(a => norm(a) === v);
        inp.disabled = true; inp.classList.add(ok ? "is-right" : "is-wrong"); $("[data-check]", stage).remove();
        mark(s, q, ok); saveX(); answered++; if (ok) right++; prog();
        const say = plain(q.q).replace(/＿+/, q.acc[0]);
        $("[data-fb]", stage).innerHTML = feedback(ok, q.acc.map(esc).join(" ／ "), q.exp, say, trOf(s, q));
        fx(ok, inp); hook(stage); $("[data-next]", stage).onclick = next;
      };
      $("[data-check]", stage).onclick = go; inp.onkeydown = e => { if (e.key === "Enter") go(); };
    }
    /* đoạn văn: nhiều chỗ trống, chấm một lượt */
    function passage({ s, qs: Q }) {
      const byN = new Map(Q.map(q => [String(q.n), q])), seen = {};
      const isMc = s.type === "pmc";
      const body = s.text.map(seg => {
        if (seg.t != null) return `<span lang="ja">${jp(seg.t, { hl: false })}</span>`;
        const q = byN.get(seg.b), occ = seen[seg.b] = (seen[seg.b] || 0) + 1;
        if (!q) return `<span class="pb">【${esc(seg.b)}】</span>`;
        if (occ > 1) return `<span class="pb pb--dup" data-dup="${esc(seg.b)}">【${esc(seg.b)}】b</span>`;
        if (isMc) {
          const dup = s.text.filter(x => x.b === seg.b).length > 1;
          return `<span class="pb"><label>【${esc(seg.b)}】${dup ? "a" : ""}<select data-b="${esc(seg.b)}"><option value="">—</option>${q.opts.map((o, k) => `<option value="${k + 1}">${esc(plain(o))}</option>`).join("")}</select></label></span>`;
        }
        return `<span class="pb"><label>【${esc(seg.b)}】<input type="text" lang="ja" size="6" autocomplete="off" spellcheck="false" data-b="${esc(seg.b)}" aria-label="Chỗ trống ${esc(seg.b)}"></label></span>`;
      }).join("");
      const hints = isMc ? Q.filter(q => q.label && q.label.length > String(q.n).length + 2).map(q => `<li>${esc(q.label)}</li>`).join("") : Q.map(q => `<li>【${q.n}】 ${esc(q.hint)}</li>`).join("");
      stage.innerHTML = `<div class="exq__n">${isMc ? "Chọn đáp án đúng cho từng chỗ trống" : "Điền dạng đúng vào từng chỗ trống"} <span class="exq__tag">${Q.length} chỗ</span></div>
        <div class="exq__pass jp">${body}</div>${hints ? `<ul class="exq__hints">${hints}</ul>` : ""}
        <div class="exq__bar"><button class="btn btn--primary" type="button" data-check>Kiểm tra</button></div><div data-fb></div>`;
      const first = $("[data-b]", stage); if (first) first.focus();
      $("[data-check]", stage).onclick = () => {
        let ok = 0; const rows = [], fills = {};
        Q.forEach(q => {
          const el = $(`[data-b="${CSS.escape(String(q.n))}"]`, stage); if (!el) return;
          let good, shown;
          if (isMc) { const v = +el.value; good = q.ans.includes(v); shown = plain(q.opts[q.ans[0] - 1] || ""); fills[q.n] = q.opts[q.ans[0] - 1] || ""; }
          else { good = q.acc.some(a => norm(a) === norm(el.value)); shown = q.acc.join(" ／ "); fills[q.n] = q.acc[0]; }
          el.disabled = true; el.classList.add(good ? "is-right" : "is-wrong");
          if (good) ok++; mark(s, q, good);
          rows.push(`<li class="${good ? "ok" : "no"}"><b>【${q.n}】${good ? "✓" : "✗"}</b> <span class="jp" lang="ja">${good ? "" : "Đáp án: "}${esc(shown)}</span><p>${esc(q.exp)}</p></li>`);
        });
        $("[data-check]", stage).remove();
        saveX(); answered += Q.length; right += ok; prog();
        const cnt = {};
        const full = s.text.map(seg => {
          if (seg.t != null) return plain(seg.t);
          const f = fills[seg.b] || ""; cnt[seg.b] = (cnt[seg.b] || 0) + 1;
          const m = /^a(.*)／b(.*)$/s.exec(plain(f)); return plain(m ? m[cnt[seg.b]] || m[1] : f);
        }).join("");
        $("[data-fb]", stage).innerHTML = `<div class="exfb ${ok === Q.length ? "exfb--ok" : "exfb--no"}"><b>Đúng ${ok} / ${Q.length} chỗ.</b><ul class="exres">${rows.join("")}</ul><div class="exfb__bar">${speakBtn(full)}${nextBtn()}</div></div>`;
        hook(stage); $("[data-next]", stage).onclick = next;
      };
    }
    render();
  }

  /* #/giao-trinh/<sách>/bai-tap[/<id>] */
  async function route(bid, id, qs) {
    const b = SB.C.books.find(x => x.id === bid); if (!b) return SB.notFound();
    if (id) return run(b, id, qs);
    location.hash = `#/giao-trinh/${bid}`;
  }
  SB.ex = { ensure, unitPage, unitLink, countFor, hub, route, wrongKeys: bid => DATA[bid] ? wrongKeys(DATA[bid]) : [] };
})();
