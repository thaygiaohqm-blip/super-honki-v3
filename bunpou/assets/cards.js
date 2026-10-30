/* Thẻ lật dùng chung cho Thể động từ và Số đếm, cùng giao diện với học thẻ ở các tab khác */
(() => {
  "use strict";
  const { $, $$, speak, ICON_SPEAK, ICON_FLIP } = SB;
  /* o: { top (html), front (html), back (html), say (text cho nút nghe mặt sau), flip, dir, onFlip(f), onAct(act) } */
  SB.simpleCard = (stage, o) => {
    const face = (cls, inner) => `<div class="card"><div class="card__face ${cls}" data-flip tabindex="0" role="button" aria-label="Lật thẻ">${inner}</div></div>`;
    stage.innerHTML = `<div class="flip${o.flip ? " is-flipped" : ""}${o.dir ? " deal-" + o.dir : ""}"><div class="flip__inner">
      ${face("card__face--front", `<div class="card__top">${o.top}</div><div class="card__main">${o.front}</div>
        <div class="card__actions"><button class="icon-btn" type="button" data-flip>${ICON_FLIP} Xem đáp án</button></div>`)}
      ${face("back", `<div class="card__top">${o.top}</div><div class="card__main">${o.back}</div>
        <div class="card__actions">${o.say ? `<button class="icon-btn" type="button" data-say="${SB.esc(o.say)}">${ICON_SPEAK} Nghe</button>` : ""}<button class="icon-btn" type="button" data-flip>${ICON_FLIP} Mặt trước</button></div>`)}
      </div></div>
      <div class="ctl"><button class="btn btn--coral" type="button" data-act="rv">↺ Chưa thuộc</button><button class="nav-btn prev" type="button" data-act="prev" aria-label="Thẻ trước">‹</button><button class="nav-btn" type="button" data-act="next" aria-label="Thẻ sau">›</button><button class="btn btn--primary" type="button" data-act="ok">✓ Đã thuộc</button></div>
      <p class="kbd-hint"><kbd>Space</kbd> lật thẻ · <kbd>←</kbd><kbd>→</kbd> chuyển thẻ · <kbd>1</kbd> chưa thuộc · <kbd>2</kbd> đã thuộc</p>`;
    const f = $(".flip", stage), [front, back] = $$(".flip__inner > .card", f);
    const sync = () => { front.inert = o.flip; back.inert = !o.flip; };
    sync();
    const turn = () => { o.flip = !o.flip; f.classList.remove("deal-next", "deal-prev"); f.classList.toggle("is-flipped", o.flip); sync(); if (o.onFlip) o.onFlip(o.flip); };
    $$("[data-flip]", stage).forEach(el => el.addEventListener("click", ev => { ev.stopPropagation(); if (ev.target.closest("[data-say]")) return; turn(); }));
    $$("[data-say]", stage).forEach(b => b.addEventListener("click", ev => { ev.stopPropagation(); speak(b.dataset.say); }));
    $$("[data-act]", stage).forEach(b => b.addEventListener("click", () => o.onAct(b.dataset.act)));
    const key = ev => {
      if (!document.body.contains(f)) return document.removeEventListener("keydown", key);
      if (ev.target.matches("input, textarea") || ev.metaKey || ev.ctrlKey || ev.altKey) return;
      if (ev.key === " ") { if (ev.target.closest("button, a")) return; ev.preventDefault(); turn(); }
      else if (ev.key === "ArrowRight") o.onAct("next"); else if (ev.key === "ArrowLeft") o.onAct("prev");
      else if (ev.key === "1") o.onAct("rv"); else if (ev.key === "2") o.onAct("ok");
    };
    document.addEventListener("keydown", key);
  };
})();
