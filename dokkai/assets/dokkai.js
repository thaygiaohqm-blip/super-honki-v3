/* Super Dokkai — bài đọc hiểu JLPT chia theo cấp độ và dạng bài. Bấm vào chữ để tra từ; tự làm rồi xem bài chữa. */
(function () {
  const { esc, jp, plain } = SK;
  const main = document.getElementById("main");
  const DK_KIND = { 10: "Đoạn ngắn", 11: "Đoạn trung", 12: "Tổng hợp A・B", 13: "Đoạn dài", 14: "Tìm thông tin" };
  const DK_JA = { 10: "内容理解（短文）", 11: "内容理解（中文）", 12: "統合理解", 13: "主張理解（長文）", 14: "情報検索" };
  const DK_HINT = {
    10: "Đoạn văn ngắn khoảng 200 chữ: thư, thông báo, bài luận. Mỗi bài thường có 1 câu hỏi về lí do, ý chính hoặc ý nghĩa của phần gạch chân.",
    11: "Đoạn văn trung bình khoảng 500 chữ: bài luận, giải thích. Có 3 câu hỏi hỏi về lí do, ý nghĩa, quan điểm tác giả.",
    12: "Hai đoạn văn A và B bàn về cùng một chủ đề. Câu hỏi so sánh điểm giống và khác giữa hai ý kiến.",
    13: "Bài dài khoảng 900 chữ, thường là bình luận hay tùy bút. Phải nắm được chủ trương và lập luận của tác giả.",
    14: "Tìm thông tin theo điều kiện trong bảng, thông báo, quảng cáo. Đọc kĩ điều kiện rồi đối chiếu."
  };
  let LIST = [];
  const done = () => SK.json("dokkai:done", {});
  const style = () => SK.get("dokkai:style") || "a";
  const HK = { "内容理解(短文)": 10, "内容理解(中文)": 11, "内容理解(長文)": 13, "統合理解": 12, "主張理解(長文)": 13, "情報検索": 14 };
  const kOf = x => x.k || DK_KIND[x.n] || "";
  const kjOf = x => x.kj || DK_JA[x.n] || "";
  const hintOf = x => DK_HINT[x.kj ? HK[x.kj] : x.n] || "";
  const lv = () => SK.get("dokkai:level") || "n2";
  const tp = () => +(SK.get("dokkai:type") || 0);
  let cur = null;                                     // trạng thái bài đang làm

  SK.attachLookup(main, el => el.textContent.slice(0, 160));

  /* ---------- danh sách ---------- */
  function setNav(k) { document.querySelectorAll("[data-nav]").forEach(a => k && a.dataset.nav === k ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")); }
  function home(view) {
    view = view || "list"; setNav(view);
    cur = null; document.title = "Super Dokkai — Luyện đọc hiểu JLPT";
    const L = lv(), T = tp(), D = done(), items = LIST.filter(x => x.level === L && (!T || x.n === T) && (view === "list" || (D[x.id] && (view === "done" || D[x.id].ok < D[x.id].n))));
    let h = '<section class="sk"><h1>' + ({ list: "Bài đọc hiểu", done: "Bài đã làm", wrong: "Bài làm sai" })[view] + '</h1><p class="sk__sub">Toàn bộ bài đọc hiểu trong đề thi JLPT các năm, chia theo cấp độ và dạng bài. <b>Bấm vào từ bất kì</b> trong bài để tra nghĩa, hoặc bôi chọn cả cụm. Tự làm trước, chọn xong đáp án sẽ hiện bài chữa có dịch tiếng Việt và <mark class="key">câu then chốt</mark> thể hiện ý đồ tác giả.</p>';
    h += '<div class="sk__lv">' + SK.LEVELS.slice().reverse().map(l => { const n = LIST.filter(x => x.level === l).length; return '<button type="button" data-lv="' + l + '" aria-pressed="' + (l === L) + '"' + (n ? "" : ' class="is-empty"') + ">" + l.toUpperCase() + "<small>" + (n ? n + " bài" : "đang cập nhật") + "</small></button>"; }).join("") + "</div>";
    if (!LIST.some(x => x.level === L)) { main.innerHTML = h + '<div class="sk__empty">Bài đọc ' + L.toUpperCase() + " đang được số hóa và sẽ có sớm.</div></section>"; bindHome(); return; }
    const kinds = Array.from(new Set(LIST.filter(x => x.level === L).map(x => x.n))).sort((a, b) => a - b);
    h += '<div class="dkf" role="group" aria-label="Dạng bài"><button type="button" data-t="0" aria-pressed="' + (!T) + '">Tất cả dạng</button>' + kinds.map(n => '<button type="button" data-t="' + n + '" aria-pressed="' + (T === n) + '"><span lang="ja">問題' + n + "</span> " + kOf(LIST.find(x => x.level === L && x.n === n)) + " (" + LIST.filter(x => x.level === L && x.n === n).length + ")</button>").join("") + "</div>";
    if (T) h += '<p class="sk__note"><b lang="ja">' + kjOf(LIST.find(x => x.level === L && x.n === T)) + "</b>. " + hintOf(LIST.find(x => x.level === L && x.n === T)) + "</p>";
    const st = x => { const d = D[x.id]; return d ? (d.ok >= d.n ? " dki--ok" : " dki--bad") : ""; };
    h += items.length ? '<div class="dkl">' + items.map(x => {
      const d = D[x.id];
      return '<a class="dki' + st(x) + '" href="#/read/' + x.ex + "/" + x.pid + '"><div class="dki__n"><span lang="ja">問題</span><b>' + x.n + '</b>' + (d ? '<span class="dki__s">' + d.ok + "/" + d.n + "</span>" : "") + '</div><div class="dki__t">' + esc(x.head) + '…</div><div class="dki__m">' + esc(kOf(x)) + " · " + x.len + " chữ · " + x.nq + " câu hỏi</div></a>";
    }).join("") + "</div></section>" : '<div class="sk__empty">' + (view === "done" ? "Bạn chưa làm bài nào ở cấp này." : view === "wrong" ? "Chưa có bài nào làm sai ở cấp này." : "Không có bài nào.") + "</div></section>";
    main.innerHTML = h; bindHome();
  }
  function bindHome() {
    main.querySelectorAll("[data-lv]").forEach(b => b.onclick = () => { SK.put("dokkai:level", b.dataset.lv); SK.put("dokkai:type", 0); home(); });
    main.querySelectorAll("[data-t]").forEach(b => b.onclick = () => { SK.put("dokkai:type", b.dataset.t); home(); });
  }

  /* ---------- đọc một bài ---------- */
  async function read(exId, pid) {
    main.innerHTML = '<p class="empty">Đang tải bài đọc…</p>';
    const [ex, vi] = await Promise.all([SK.exam(exId), SK.vi(exId)]);
    const text = ex.passages[pid]; if (!text) { location.hash = "#/"; return; }
    let qs = [], mon = 0, mk = "", mj = "";
    ex.sections.forEach(s => s.mondai.forEach(m => m.qs.forEach(q => { if (String(q.p) === String(pid)) { qs.push(q); mon = m.n; mk = m.kind || ""; mj = m.ja || ""; } })));
    const id = exId + "|" + pid, pos = LIST.findIndex(x => x.id === id);
    cur = { ex, exId, pid, text, qs, mon, mk, mj, id, pos, ans: {}, mode: "self", ov: (vi.p && vi.p[pid]) || null, qov: vi.q || {}, lookup: SK.get("dokkai:lookup") !== "0" };
    document.title = "Đọc hiểu " + ex.title + " — Super Dokkai";
    render();
  }
  const SEG = (name, a, items) => '<div class="seg" data-seg="' + name + '">' + items.map(([k, t]) => '<button type="button" data-k="' + k + '" aria-pressed="' + (a === k) + '">' + t + "</button>").join("") + "</div>";
  function sentences() {
    const o = cur.ov;
    if (o && o.s && o.s.length) return o.s.map(s => ({ ja: s.ja, vi: s.vi, nl: !!s.p }));
    return SK.sentences(cur.text).map(s => ({ ja: s.ja, vi: "", nl: s.nl }));
  }
  const keySet = () => new Set((cur.ov && cur.ov.key) || []);
  function head() {
    const c = cur, kind = c.ex.level === "n2" ? (DK_KIND[c.mon] || "") : (c.mk || ""), hint = DK_HINT[c.ex.level === "n2" ? c.mon : HK[c.mj]] || "";
    return '<section class="sk"><p><a class="btn btn--ghost btn--sm" href="#/">← Danh sách bài đọc</a></p><h1><span lang="ja">問題' + c.mon + "</span> · " + esc(kind) + '</h1><p class="sk__sub">' + esc(hint) + "</p>";
  }
  function render() {
    const c = cur; let h = head();
    h += '<div class="dkm">' + SEG("mode", c.mode, [["self", "Tự làm"], ["review", "Xem bài chữa"]]) + '<label><input type="checkbox" id="dk-look"' + (c.lookup ? " checked" : "") + '> Bấm chữ để tra từ</label>' + (c.mode === "review" && !(c.ov && !c.ov.s && c.ov.full) ? SEG("style", style(), [["a", "Nhật trên, Việt dưới + giải thích"], ["b", "Song ngữ từng câu"]]) : "") + "</div>";
    h += '<div id="dk-body">' + (c.mode === "self" ? selfHTML() : reviewHTML()) + "</div>";
    h += '<p class="dk-cite">Trích từ đề thi JLPT ' + c.ex.level.toUpperCase() + " tháng " + c.ex.m + "/" + c.ex.y + ", <span lang=\"ja\">問題" + c.mon + "</span>.</p>";
    const pr = c.pos > 0 ? LIST[c.pos - 1] : null, nx = c.pos >= 0 && c.pos < LIST.length - 1 ? LIST[c.pos + 1] : null;
    h += '<div class="dknav">' + (pr ? '<a class="btn btn--ghost btn--sm" href="#/read/' + pr.ex + "/" + pr.pid + '">← Bài trước</a>' : "<span></span>") + (nx ? '<a class="btn btn--primary btn--sm" href="#/read/' + nx.ex + "/" + nx.pid + '">Bài tiếp →</a>' : "") + "</div></section>";
    main.innerHTML = h; main.classList.toggle("nolookup", !c.lookup); bind();
    window.scrollTo(0, 0);
  }
  function paraHTML(t) {
    return String(t).split("\n").map(l => { const r = l.trim(); if (!r) return ""; const note = /^[(（]注/.test(r); return '<p class="' + (note ? "skp__note" : "") + '">' + jp(r) + "</p>"; }).join("");
  }
  function selfHTML() {
    const c = cur;
    let h = '<div class="dkp"><div class="dkp__h">Bài đọc</div><div class="jp">' + paraHTML(c.text) + "</div></div>";
    h += c.qs.map((q, i) => '<article class="sq" data-i="' + i + '"><div class="sq__no">' + q.no + '</div><div class="sq__body">' + (q.s ? '<div class="sq__stem jp">' + jp(q.s) + "</div>" : "") + (q.x ? '<div class="sq__warn">Câu này đang được rà soát lại cách trình bày lựa chọn.</div>' : "") + '<div class="sq__opts">' + q.c.map((t, k) => '<button type="button" class="sq__opt' + (c.ans[i] === k ? " is-pick" : "") + '" data-k="' + k + '"><b>' + (k + 1) + '</b><span>' + jp(t) + "</span></button>").join("") + "</div></div></article>").join("");
    const n = Object.keys(c.ans).length;
    h += '<p class="sk__note">Đã chọn ' + n + "/" + c.qs.length + ". Chọn xong tất cả đáp án, bài chữa sẽ tự hiện ra.</p><p><button class=\"btn btn--ghost btn--sm\" id=\"dk-skip\">Xem bài chữa luôn</button></p>";
    return h;
  }
  function renderSent(s, i, key, keyq) {
    return '<span class="dks' + (key.has(i) ? " key" : "") + (keyq.has(i) ? " keyq" : "") + '" data-s="' + i + '">' + esc(s.ja) + "</span>";
  }
  function reviewHTML() {
    const c = cur, S = sentences(), key = keySet(), full = c.ov && !c.ov.s && c.ov.full && c.ov.full.length ? c.ov.full : null, noOv = !(c.ov && c.ov.s) && !full, st = full ? "a" : style();
    let right = 0; c.qs.forEach((q, i) => { if (c.ans[i] === q.a - 1) right++; });
    const answered = Object.keys(c.ans).length;
    let h = "";
    if (answered) h += '<div class="skres"><div class="skres__big">' + right + "<small> / " + c.qs.length + " câu đúng</small></div></div>";
    if (noOv) h += '<div class="sa"><div class="miss">Bản dịch tiếng Việt và lời giải của bài đọc này đang được soạn.</div></div>';
    h += '<div class="dkleg"><span><i></i>Câu then chốt thể hiện ý đồ của tác giả, là mấu chốt để chọn đáp án đúng</span></div>';
    if (st === "a") {
      h += '<div class="dkp"><div class="dkp__h">Nguyên văn tiếng Nhật</div><div class="jp" id="dk-ja">' + paraSent(S, key, "ja") + "</div></div>";
      h += '<div class="dkp" style="margin-top:12px"><div class="dkp__h">Bản dịch tiếng Việt</div><div id="dk-vi">' + (full ? full.map(t => '<p class="dkv-p">' + esc(t) + "</p>").join("") : noOv ? '<p class="miss">Chưa có bản dịch.</p>' : paraSent(S, key, "vi")) + "</div></div>";
    } else {
      h += '<div class="dkp dkbi"><div class="dkp__h">Song ngữ từng câu</div>' + S.map((s, i) => '<div class="dkbi__row' + (s.nl ? " nl" : "") + '" data-s="' + i + '"><div class="jp dks' + (key.has(i) ? " key" : "") + '">' + esc(s.ja) + '</div>' + (s.vi ? '<div class="dkv' + (key.has(i) ? " key" : "") + '">' + esc(s.vi) + "</div>" : "") + "</div>").join("") + "</div>";
    }
    h += "<h2>Giải thích đáp án</h2>" + c.qs.map((q, i) => qReview(q, i)).join("");
    const V = (c.ov && c.ov.v) || [];
    if (V.length) h += "<h2>Từ vựng khó trong bài</h2><div class=\"sa__chips\">" + V.map(v => '<span class="sa__chip"><b lang="ja">' + esc(v[0]) + "</b> " + (v[1] ? '<i lang="ja">' + esc(v[1]) + "</i> " : "") + esc(v[2] || "") + "</span>").join("") + "</div>";
    return h;
  }
  function paraSent(S, key, f) {
    let out = "", open = false;
    S.forEach((s, i) => {
      if (s.nl && open) { out += "</p>"; open = false; }
      if (!open) { out += '<p' + (f === "vi" ? ' class="dkv-p"' : "") + ">"; open = true; }
      const t = f === "ja" ? s.ja : (s.vi || "");
      out += '<span class="dks' + (key.has(i) ? " key" : "") + '" data-s="' + i + '">' + esc(t) + (f === "vi" ? " " : "") + "</span>";
    });
    return out + (open ? "</p>" : "");
  }
  function qReview(q, i) {
    const c = cur, k = c.ans[i], ok = k === q.a - 1, ov = c.qov[q.no] || {};
    let h = '<article class="sq"><div class="sq__no">' + q.no + '</div><div class="sq__body">' + (q.s ? '<div class="sq__stem jp">' + jp(q.s) + "</div>" : "") + '<div class="sq__opts">' + q.c.map((t, j) => '<div class="sq__opt ' + (j === q.a - 1 ? "is-ok" : j === k ? "is-bad" : "") + '"><b>' + (j + 1) + '</b><span>' + jp(t) + "</span></div>").join("") + "</div>";
    h += '<div class="sa ' + (k == null ? "" : ok ? "sa--ok" : "sa--bad") + '"><div class="sa__v">' + (k == null ? "" : ok ? "Bạn chọn đúng. " : "Bạn chọn " + SK.CIRCLE[k] + ". ") + "Đáp án đúng: " + SK.CIRCLE[q.a - 1] + "</div>";
    if (ov.vi) h += '<h4>Dịch câu hỏi</h4><div class="sa__vi">' + esc(ov.vi) + "</div>";
    if (ov.cv && ov.cv.length) h += '<h4>Các đáp án</h4><ul class="sa__cv">' + ov.cv.map((t, j) => '<li class="' + (j === q.a - 1 ? "is-ans" : "") + '">' + SK.CIRCLE[j] + " " + esc(t) + "</li>").join("") + "</ul>";
    if (ov.exp) h += "<h4>Vì sao chọn đáp án này</h4><div>" + esc(ov.exp).replace(/\n/g, "<br>") + "</div>";
    else h += '<div class="miss">Chưa có lời giải soạn sẵn cho câu này.</div>';
    if (ov.key && ov.key.length) h += '<div class="sa__btns"><button class="btn btn--ghost btn--sm" data-showkey="' + ov.key.join(",") + '">Chỉ ra câu then chốt của câu này</button></div>';
    return h + "</div></div></article>";
  }

  /* ---------- tương tác ---------- */
  function bind() {
    const c = cur;
    main.querySelectorAll("[data-seg=mode] button").forEach(b => b.onclick = () => { c.mode = b.dataset.k; render(); });
    main.querySelectorAll("[data-seg=style] button").forEach(b => b.onclick = () => { SK.put("dokkai:style", b.dataset.k); render(); });
    const lk = document.getElementById("dk-look"); if (lk) lk.onchange = () => { c.lookup = lk.checked; SK.put("dokkai:lookup", lk.checked ? "1" : "0"); main.classList.toggle("nolookup", !c.lookup); };
    const sk = document.getElementById("dk-skip"); if (sk) sk.onclick = () => { c.mode = "review"; render(); };
    main.querySelectorAll(".sq__opts button.sq__opt").forEach(b => b.onclick = () => {
      const i = +b.closest(".sq").dataset.i; c.ans[i] = +b.dataset.k;
      b.closest(".sq__opts").querySelectorAll(".sq__opt").forEach((x, j) => x.classList.toggle("is-pick", j === c.ans[i]));
      const n = Object.keys(c.ans).length;
      main.querySelector(".sk__note").textContent = "Đã chọn " + n + "/" + c.qs.length + ". Chọn xong tất cả đáp án, bài chữa sẽ tự hiện ra.";
      if (n === c.qs.length) finish();
    });
    main.querySelectorAll("[data-showkey]").forEach(b => b.onclick = () => {
      const ks = b.dataset.showkey.split(",").map(Number);
      main.querySelectorAll(".keyq").forEach(e => e.classList.remove("keyq"));
      let first = null;
      ks.forEach(k => main.querySelectorAll('[data-s="' + k + '"]').forEach(e => { const t = e.classList.contains("dks") ? e : e.querySelector(".dks"); if (t) { t.classList.add("keyq"); if (!first) first = t; } }));
      if (first) first.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }
  function finish() {
    const c = cur; let ok = 0; c.qs.forEach((q, i) => { if (c.ans[i] === q.a - 1) ok++; });
    const D = done(); D[c.id] = { ok, n: c.qs.length, t: Date.now() }; SK.save("dokkai:done", D);
    c.mode = "review"; render();
  }

  /* ---------- định tuyến ---------- */
  async function route() {
    const p = location.hash.replace(/^#\/?/, "").split("/");
    try {
      if (!LIST.length) LIST = await SK.fetch("dokkai.json");
      if (p[0] === "read" && p[1] && p[2]) { setNav("list"); await read(p[1], p[2]); } else home(p[0] === "done" ? "done" : p[0] === "wrong" ? "wrong" : "list");
    } catch (e) { main.innerHTML = '<section class="sk"><p class="sk__empty">Không tải được dữ liệu bài đọc (' + esc(e.message) + "). Hãy tải lại trang.</p></section>"; }
  }
  window.addEventListener("hashchange", route);
  route();
})();
