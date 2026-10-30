/* Super Bunpou - luyện chia từ: câu tiếng Nhật có một chỗ trống, cho từ gốc, người học tự chia đúng theo mẫu. Không cần AI. */
(() => {
  "use strict";
  const { esc, jp, plain, speak, $, $$, shuffle, lvtag, verdictHTML, pickWord, verdict, celebrate, wobble, glow, buzz, doneHTML, afterDone, ICON_SPEAK } = SB;
  const KIND = { v: "động từ", i: "tính từ い", na: "tính từ な" };
  const norm = s => String(s || "").normalize("NFKC").replace(/\s+/g, "").replace(/[。、]/g, "");
  const LIMIT = 10;
  function buildDeck(items) {
    const pool = [];
    for (const p of shuffle(items)) {
      const ex = shuffle(p.senses.flatMap(s => s.ex).filter(e => e.cj));
      if (ex.length) pool.push(ex.slice(0, 2).map(e => ({ p, e })));
    }
    // mỗi mẫu một câu trước, rồi mới đến câu thứ hai, để đủ 10 câu mà vẫn đa dạng
    const first = pool.map(x => x[0]), second = shuffle(pool.map(x => x[1]).filter(Boolean));
    const deck = shuffle(first).concat(second).slice(0, LIMIT);
    return deck.sort(() => Math.random() - .5);
  }
  function paint(stage, items, o = {}) {
    let st = stage._chia;
    if (!st) st = stage._chia = { deck: buildDeck(items), k: 0, right: 0, wrong: [], done: false, hint: false };
    const again = () => { stage._chia = null; paint(stage, items, o); };
    if (!st.deck.length) { stage.innerHTML = `<div class="card"><div class="empty"><h3>Chưa có câu để luyện chia từ</h3><p>Các mẫu trong bộ này chưa có câu ví dụ có từ đứng ngay trước mẫu. Hãy thử chế độ khác.</p></div></div>`; return; }
    if (st.k >= st.deck.length) {
      stage.innerHTML = doneHTML(`Xong ${st.deck.length} câu`, st.right, st.deck.length, `Đúng ${st.right}, sai ${st.wrong.length}. Mẫu làm sai đã vào danh sách cần ôn.`,
        `<button class="btn btn--primary" type="button" data-again>Làm lại với câu khác</button>`);
      afterDone(stage, st.right, st.deck.length); if (o.onResult && !st.reported) { st.reported = true; o.onResult("chia", st.right, st.deck.length); }
      $("[data-again]", stage).onclick = again; return;
    }
    const { p, e } = st.deck[st.k], cj = e.cj;
    stage.innerHTML = `<div class="card"><div class="quiz chia">
      <div class="card__top">${lvtag(p.lv)}<span>Chia từ cho đúng theo mẫu</span><span class="card__num">${st.k + 1} <small>/ ${st.deck.length}</small></span></div>
      <p class="test-ask">Mẫu: <b class="jp" lang="ja">${jp(p.pat, { hl: false })}</b> <span class="muted">(${esc(p.mean)})</span></p>
      <div class="say say--sm chia__s" lang="ja"><span>${jp(cj.pre, { hl: false })}</span><input class="chia__in" type="text" lang="ja" autocomplete="off" autocapitalize="off" spellcheck="false" size="${Math.max(5, plain(cj.ans[0]).length + 2)}" aria-label="Chỗ trống" data-in><span>${jp(cj.post)}</span></div>
      <div class="card__hint">${esc(e.vi)}</div>
      <div class="chia__base"><span>Từ gốc</span><b class="jp" lang="ja">${esc(cj.base)}</b><small>${KIND[cj.k]}</small>
        <button class="btn btn--ghost btn--sm" type="button" data-hint>Gợi ý cấu trúc</button></div>
      <div class="chia__form" data-form hidden>${p.form.map(f => `<div lang="ja">${SB.rich(f)}</div>`).join("")}</div>
      <div class="feedback" aria-live="polite"></div>
      <div class="card__actions"><button class="btn btn--primary" type="button" data-check>Kiểm tra</button><button class="btn btn--primary" type="button" data-next hidden>${st.k + 1 >= st.deck.length ? "Xem kết quả" : "Câu tiếp"}</button></div></div></div>`;
    const inp = $("[data-in]", stage), fb = $(".feedback", stage), ck = $("[data-check]", stage), nx = $("[data-next]", stage);
    $("[data-hint]", stage).onclick = () => { $("[data-form]", stage).hidden = !$("[data-form]", stage).hidden; };
    inp.focus({ preventScroll: true });
    const go = () => {
      const v = norm(inp.value); if (!v) return inp.focus();
      const ok = cj.ans.some(a => norm(a) === v);
      inp.disabled = true; inp.classList.add(ok ? "is-right" : "is-wrong");
      st.word = pickWord(ok); st.streak = ok ? (st.streak || 0) + 1 : 0;
      if (ok) { st.right++; SB.mark(p.id, "ok"); } else { st.wrong.push({ p, e }); SB.mark(p.id, "rv"); }
      if (o.onMark) o.onMark(p.id, ok ? "ok" : "rv");
      fb.className = "feedback " + (ok ? "ok" : "no");
      fb.innerHTML = verdictHTML(ok, st.word, `Đáp án: <b class="jp" lang="ja">${esc(cj.ans[0])}</b>${cj.ans[1] ? ` <small>(${esc(cj.ans[1])})</small>` : ""}<br><span lang="ja" class="jp">${jp(e.ja, { hl: true })}</span><br>
        <button class="icon-btn" type="button" data-say="${esc(plain(e.ja))}">${ICON_SPEAK} Nghe câu</button> <a href="#/ngu-phap/${p.id}">Xem mẫu</a>`, st.streak);
      verdict(fb, ok); if (ok) { celebrate(inp); glow($(".card", stage), true); } else { wobble(inp); glow($(".card", stage), false); buzz(); }
      $$("[data-say]", fb).forEach(b => b.onclick = () => speak(b.dataset.say));
      ck.hidden = true; nx.hidden = false; nx.focus({ preventScroll: true });
    };
    ck.onclick = go; inp.onkeydown = ev => { if (ev.key === "Enter") go(); };
    nx.onclick = () => { st.k++; paint(stage, items, o); };
  }
  SB.chia = { paint };
})();
