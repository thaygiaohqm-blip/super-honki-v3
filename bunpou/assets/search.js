/* Super Bunpou — tìm kiếm ngữ pháp trên toàn bộ các cấp */
(() => {
  "use strict";
  const { esc, jp, lvtag, band, $, $$ } = SB;
  const main = $("#main"), G = () => SB.G;
  const fold = t => String(t || "").normalize("NFKC").toLowerCase().replace(/[～〜~…・\s「」『』（）()、。.,!?]/g, "");
  const noRuby = t => String(t || "").replace(/\[[^\]]*\]/g, "").replace(/[{}]/g, "");       // chữ Hán không kèm furigana
  const plainVi = t => fold(String(t || "").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/đ/g, "d").replace(/Đ/g, "D"));
  let INDEX = null;
  function build() {
    if (INDEX) return INDEX;
    INDEX = G().allPats().map(p => {
      const ex = (p.senses || []).flatMap(s => (s.ex || []).map(e => e.ja + " " + e.vi));
      const kana = String(p.pat || "") + " " + (p.senses || []).flatMap(s => (s.ex || []).map(e => e.ja)).join(" ");
      return { p,
        a: fold(noRuby(p.pat)) + "|" + fold(p.pat) + "|" + fold(p.no) + "|" + fold(p.id),
        b: fold(p.mean) + "|" + plainVi(p.mean),
        c: fold(p.core) + "|" + plainVi(p.core) + "|" + fold((p.form || []).join(" ")),
        d: fold(noRuby(ex.join(" "))) + "|" + fold(kana) + "|" + plainVi(ex.join(" ")) };
    });
    return INDEX;
  }
  function find(q) {
    const f = fold(q), pv = plainVi(q); if (!f) return [];
    const out = [];
    for (const r of build()) {
      let s = 0;
      if (r.a.includes(f)) s = r.a.startsWith(f) ? 100 : 90;
      else if (r.b.includes(f) || (pv && r.b.includes(pv))) s = 70;
      else if (r.c.includes(f) || (pv && r.c.includes(pv))) s = 50;
      else if (r.d.includes(f) || (pv && r.d.includes(pv))) s = 30;
      if (s) out.push([s, r.p]);
    }
    return out.sort((x, y) => y[0] - x[0] || x[1].id.localeCompare(y[1].id)).map(x => x[1]);
  }
  const short = p => String(p.mean || "").replace(/\(\d\)\s*/g, "").split(/\s{2,}|\.\.\.\s*\(/)[0];
  const row = p => `<li class="row row--g"><a href="#/ngu-phap/${p.id}"><span class="row__l">${lvtag(p.lv)}<span class="row__ja jp" lang="ja">${jp(p.pat, { hl: false })}</span></span><span class="row__vi">${esc(short(p))}</span><span class="row__side"></span></a></li>`;

  async function page(q) {
    await G().loadAll(); INDEX = null;
    main.innerHTML = band({ big: "検索", bigJp: true, title: "Tìm ngữ pháp", text: "Gõ mẫu câu, nghĩa tiếng Việt (có dấu hoặc không dấu), từ trong ví dụ, hoặc số thứ tự.", compact: true }) +
      `<section class="sec"><div class="wrap"><div class="toolbar"><input class="finder finder--big" type="search" id="gq" placeholder="Ví dụ: nguyên nhân, ために, 早い, nen…" aria-label="Tìm ngữ pháp" autocomplete="off" value="${esc(q || "")}"></div>
      <p class="muted" id="gcount" aria-live="polite"></p><ul class="rows rows--tight" id="gres"></ul></div></section>`;
    const inp = $("#gq"), res = $("#gres"), cnt = $("#gcount");
    const show = () => {
      const v = inp.value.trim();
      if (!v) { res.innerHTML = ""; cnt.textContent = `Tìm trong ${G().allPats().length} mẫu từ N5 đến N1.`; return; }
      const r = find(v); cnt.textContent = r.length ? `${r.length} mẫu phù hợp${r.length > 80 ? ", hiện 80 mẫu đầu" : ""}.` : "Không thấy mẫu nào. Thử gõ ngắn hơn hoặc dùng từ khác.";
      res.innerHTML = r.slice(0, 80).map(row).join("");
      try { history.replaceState(null, "", "#/tim-kiem?q=" + encodeURIComponent(v)); } catch (e) { /* bỏ qua */ }
    };
    let t; inp.addEventListener("input", () => { clearTimeout(t); t = setTimeout(show, 120); });
    show(); if (!q) inp.focus();
    SB.setCur({ refresh: () => page(inp.value) });
  }
  SB.search = { page, find };
})();
