/* Super Shiken — đề thi JLPT các năm. Hai chế độ: làm tự do (có đáp án ngay từng câu) và thi thử bấm giờ (nộp bài mới có đáp án). */
(function () {
  const { esc, jp, plain } = SK;
  const main = document.getElementById("main");
  const MIN = { n5: 60, n4: 70, n3: 100, n2: 105, n1: 110 };
  const SECJA = { moji: "文字・語彙", bunpou: "文法", dokkai: "読解" };
  const SECVI = { moji: "Chữ và từ vựng", bunpou: "Ngữ pháp", dokkai: "Đọc hiểu" };
  let INDEX = [], run = null, timer = null;
  const lvOf = () => (SK.get("shiken:level") || "n2");
  const hist = () => SK.json("shiken:hist", {});
  const wrong = () => SK.json("shiken:wrong", []);
  const pad = n => String(n).padStart(2, "0");
  const fmt = s => pad(Math.floor(s / 3600)) + ":" + pad(Math.floor(s % 3600 / 60)) + ":" + pad(s % 60);
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

  SK.attachLookup(main);

  /* ---------- trang đầu ---------- */
  function setNav(k) { document.querySelectorAll("[data-nav]").forEach(a => k && a.dataset.nav === k ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current")); }
  function home(view) {
    view = view || "home"; setNav(view);
    stopTimer(); run = null; document.title = "Super Shiken — Đề thi JLPT các năm";
    const lv = lvOf(), all = INDEX.filter(e => e.level === lv), exams = all.filter(e => !e.dl), scans = all.filter(e => e.dl), H = hist();
    const w = wrong().filter(k => k.startsWith(lv + "-")).length;
    const TT = { home: ["Đề thi theo năm", 'Đề thi JLPT các năm. <b>Làm tự do</b>: chọn xong câu nào hiện đáp án câu đó. <b>Thi thử bấm giờ</b>: làm hết đề, nộp bài mới có đáp án và điểm.'], types: ["Ôn tổng hợp theo dạng bài", "Gom mọi câu cùng dạng của tất cả các đề trong cấp để làm một lượt."], wrong: ["Câu đã làm sai", "Các câu bạn từng chọn sai được lưu trên thiết bị này để ôn lại."] }[view];
    let h = '<section class="sk"><h1>' + TT[0] + '</h1><p class="sk__sub">' + TT[1] + "</p>";
    h += '<div class="sk__lv" role="tablist">' + SK.LEVELS.slice().reverse().map(l => { const n = INDEX.filter(e => e.level === l && !e.dl).length; return '<button type="button" data-lv="' + l + '" aria-pressed="' + (l === lv) + '"' + (n ? "" : ' class="is-empty"') + ">" + l.toUpperCase() + "<small>" + (n ? n + " đề" : "đang cập nhật") + "</small></button>"; }).join("") + "</div>";
    if (view !== "wrong" && !exams.length && !scans.length) {
      h += '<div class="sk__empty">Đề thi ' + lv.toUpperCase() + ' đang được số hóa và sẽ có sớm. Bạn có thể chuyển sang cấp có dữ liệu ở trên.</div></section>';
      main.innerHTML = h; bindHome(); return;
    }
    if (view === "wrong") {
      h += '<div class="sk__grid">' + SK.LEVELS.slice().reverse().map(l => { const c = wrong().filter(k => k.startsWith(l + "-")).length; return c ? '<a class="skc" href="#/wrong/' + l + '"><div class="skc__t"><span>' + l.toUpperCase() + "</span><small>" + c + ' câu</small></div><div class="skc__s">Ôn lại các câu đã sai</div></a>' : ""; }).join("") + "</div>";
      if (!SK.LEVELS.some(l => wrong().some(k => k.startsWith(l + "-")))) h += '<div class="sk__empty">Chưa có câu sai nào. Làm đề xong, các câu sai sẽ hiện ở đây.</div>';
      main.innerHTML = h + "</section>"; bindHome(); return;
    }
    if (view === "types") {
      h += '<div class="sk__types">' + typeCards(lv, exams) + "</div></section>";
      main.innerHTML = h; bindHome(); return;
    }
    if (!exams.length) h += '<p class="sk__note">Chưa có đề nhập sẵn ở cấp này; xem phần đề scan bên dưới.</p>';
    h += "<div class=\"sk__grid\">" + exams.map(e => {
      const hh = H[e.id], s = e.secs || {};
      const parts = ["moji", "bunpou", "dokkai"].filter(k => s[k]).map(k => SECVI[k] + " " + s[k]).join(" · ");
      return '<div class="skc" data-e="' + e.id + '"><div class="skc__t"><span>' + lv.toUpperCase() + " · " + e.m + "/" + e.y + "</span><small>" + e.n + ' câu</small></div><div class="skc__s">' + parts + '</div>' +
        (hh ? '<div class="skc__best">Điểm gần nhất: ' + hh.ok + "/" + hh.n + " (" + Math.round(hh.ok * 100 / hh.n) + "%)</div>" : "") +
        '<select aria-label="Phạm vi"><option value="all">Toàn bộ đề</option>' + ["moji", "bunpou", "dokkai"].filter(k => s[k]).map(k => '<option value="' + k + '">' + SECJA[k] + " · " + SECVI[k] + "</option>").join("") + '</select>' +
        '<div class="skc__act"><button class="btn btn--primary btn--sm" data-go="free">Làm tự do</button><button class="btn btn--ghost btn--sm" data-go="timed">Thi thử bấm giờ</button></div></div>';
    }).join("") + "</div>";
    if (scans.length) h += "<h2>Đề dạng ảnh scan — tải về tự làm</h2><p class=\"sk__sub\">Các đề này là file scan nên chưa làm trực tiếp trên web được. Bấm để mở bản gốc trên Google Drive rồi tải về.</p><div class=\"sk__grid\">" + scans.map(e => '<a class="skc" href="' + e.dl + '" target="_blank" rel="noopener"><div class="skc__t"><span>' + lv.toUpperCase() + " · " + e.m + "/" + e.y + '</span><small>PDF</small></div><div class="skc__s">Mở và tải đề</div></a>').join("") + "</div>";
    h += '<p class="sk__note">Phần nghe hiểu (聴解) chưa nằm trong bản này. Đề dài hơn khi thi thật: bấm giờ tính theo thời gian thi Ngôn ngữ + Đọc hiểu.</p>';
    if (false) h += '<h2>Ôn tổng hợp theo dạng bài</h2><p class="sk__sub">Gom mọi câu cùng dạng của tất cả các đề ' + lv.toUpperCase() + " để làm một lượt.</p><div class=\"sk__types\">" + typeCards(lv, exams) + "</div></section>";
    main.innerHTML = h; bindHome();
  }
  function kdOf(lv, n) { const e = INDEX.find(x => x.level === lv && x.kd && x.kd[n]); return e ? e.kd[n] : [SK.KIND[n] || "Dạng " + n, SK.JA[n] || ""]; }
  function typeCards(lv, exams) {
    const cnt = {};
    exams.forEach(e => Object.keys(e.mon || {}).forEach(n => cnt[n] = (cnt[n] || 0) + e.mon[n]));
    return Object.keys(cnt).map(Number).sort((a, b) => a - b).map(n => '<div class="skt" data-n="' + n + '"><span class="skt__n" lang="ja">' + n + '</span><div class="skt__b"><b>' + esc(kdOf(lv, n)[0]) + '</b><small lang="ja">問題' + n + " · " + esc(kdOf(lv, n)[1]) + " · " + cnt[n] + ' câu</small></div><select aria-label="Số câu"><option value="10">10 câu</option><option value="20">20 câu</option><option value="40">40 câu</option><option value="0">Tất cả</option></select><button class="btn btn--primary btn--sm" data-drill>Làm</button></div>').join("");
  }
  function bindHome() {
    main.querySelectorAll("[data-lv]").forEach(b => b.onclick = () => { SK.put("shiken:level", b.dataset.lv); home(); });
    main.querySelectorAll(".skc [data-go]").forEach(b => b.onclick = () => { const c = b.closest(".skc"); location.hash = "#/exam/" + c.dataset.e + "/" + b.dataset.go + "/" + c.querySelector("select").value; });
    main.querySelectorAll(".skt [data-drill]").forEach(b => b.onclick = () => { const c = b.closest(".skt"); location.hash = "#/drill/" + lvOf() + "/" + c.dataset.n + "/" + c.querySelector("select").value; });
  }

  /* ---------- tạo danh sách câu ---------- */
  const flat = (ex) => {
    const out = [];
    ex.sections.forEach(s => s.mondai.forEach(m => m.qs.forEach(q => out.push({ ex: ex.id, exTitle: ex.title, level: ex.level, sec: s.key, n: m.n, kind: m.kind, ja: m.ja, instr: m.instr, q, ptxt: q.p ? ex.passages[q.p] : null, pid: q.p || 0 }))));
    return out;
  };
  async function examItems(id, sec) {
    const ex = await SK.exam(id); let it = flat(ex);
    if (sec && sec !== "all") it = it.filter(x => x.sec === sec);
    return { ex, items: it };
  }
  async function drillItems(lv, n, count, ids) {
    const exs = await Promise.all(INDEX.filter(e => e.level === lv).map(e => SK.exam(e.id)));
    let all = []; exs.forEach(ex => all = all.concat(flat(ex)));
    if (ids) { const s = new Set(ids); all = all.filter(x => s.has(x.ex + "#" + x.q.no)); }
    else all = all.filter(x => x.n === n);
    all = all.filter(x => x.q.a);
    // nhóm theo bài đọc để các câu cùng bài đi liền nhau
    const groups = [], map = {};
    all.forEach(x => { const k = x.pid ? x.ex + "|" + x.pid : x.ex + "|q" + x.q.no; if (!map[k]) { map[k] = []; groups.push(map[k]); } map[k].push(x); });
    let g = shuffle(groups), res = [];
    for (const a of g) { if (count && res.length >= count) break; res = res.concat(a); }
    return res;
  }

  /* ---------- màn làm bài ---------- */
  function stopTimer() { if (timer) { clearInterval(timer); timer = null; } }
  function start(items, o) {
    stopTimer();
    run = { items, o, free: o.mode === "free", ans: {}, done: false, left: o.mode === "timed" ? (o.minutes || 105) * 60 : 0, vi: {} };
    document.title = o.title + " — Super Shiken";
    let h = '<section class="sk"><p><a class="btn btn--ghost btn--sm" href="#/">← Danh mục</a></p><h1>' + esc(o.title) + '</h1><p class="sk__sub">' + (run.free ? "Chế độ làm tự do: chọn đáp án là thấy đúng sai và lời giải ngay." : "Chế độ thi thử: chọn đáp án tùy ý, đổi được. Bấm Nộp bài (hoặc hết giờ) mới hiện đáp án và điểm.") + "</p>";
    h += '<div class="skbar"><span class="skbar__t">' + items.length + ' câu</span><span class="skbar__c" id="sk-count">0/' + items.length + '</span>' + (run.free ? "" : '<span class="skbar__time" id="sk-time">' + fmt(run.left) + "</span>") + '<button class="btn btn--ghost btn--sm" id="sk-pal">Bảng câu</button>' + (run.free ? '<button class="btn btn--primary btn--sm" id="sk-sub">Kết thúc</button>' : '<button class="btn btn--coral btn--sm" id="sk-sub">Nộp bài</button>') + "</div>";
    h += '<div class="skpal" id="sk-palette">' + items.map((x, i) => '<a href="#q' + i + '" data-i="' + i + '">' + (i + 1) + "</a>").join("") + "</div>";
    let lastM = "", lastP = "";
    items.forEach((x, i) => {
      const mk = o.drill ? "" : x.ex + "|" + x.n;
      if (!o.drill && mk !== lastM) { h += '<div class="skm"><b lang="ja">問題' + x.n + " · " + esc(x.ja || SK.JA[x.n] || "") + "</b> — " + esc(x.kind) + '<small class="jp">' + jp(x.instr) + "</small></div>"; lastM = mk; lastP = ""; }
      const pk = x.ex + "|" + x.pid;
      if (x.ptxt && pk !== lastP) { h += '<div class="skp"><div class="skp__h">Bài đọc / đoạn văn' + (o.drill ? " · " + esc(x.exTitle) : "") + '</div><div class="jp">' + passageHTML(x.ptxt) + "</div></div>"; lastP = pk; }
      else if (!x.ptxt) lastP = "";
      h += qCard(x, i, o.drill);
    });
    h += '<p style="margin-top:22px"><button class="btn btn--primary" id="sk-sub2">' + (run.free ? "Kết thúc và xem kết quả" : "Nộp bài") + "</button></p></section>";
    main.innerHTML = h; window.scrollTo(0, 0);
    main.querySelectorAll(".sq__opt").forEach(b => b.onclick = () => pick(+b.closest(".sq").dataset.i, +b.dataset.k));
    document.getElementById("sk-pal").onclick = () => document.getElementById("sk-palette").classList.toggle("on");
    document.getElementById("sk-sub").onclick = document.getElementById("sk-sub2").onclick = finish;
    if (!run.free) timer = setInterval(() => { run.left--; const t = document.getElementById("sk-time"); if (t) { t.textContent = fmt(Math.max(0, run.left)); t.classList.toggle("low", run.left < 300); } if (run.left <= 0) { stopTimer(); finish(true); } }, 1000);
  }
  function passageHTML(t) {
    return String(t).split("\n").map(l => { const raw = l.trim(); if (!raw) return ""; const note = /^[(（]注/.test(raw) || /^\(注/.test(raw); return '<p class="' + (note ? "skp__note" : "") + '">' + jp(raw) + "</p>"; }).join("");
  }
  function qCard(x, i, drill) {
    const q = x.q;
    return '<article class="sq" id="q' + i + '" data-i="' + i + '"><div class="sq__no">' + (drill ? i + 1 : q.no) + '</div><div class="sq__body">' +
      (drill ? '<div class="sq__tag">' + esc(x.exTitle) + " · 問題" + x.n + " · câu " + q.no + "</div>" : "") +
      (q.s ? '<div class="sq__stem jp">' + jp(q.s) + "</div>" : "") + (q.x ? '<div class="sq__warn">Câu này đang được rà soát lại cách trình bày lựa chọn.</div>' : "") +
      '<div class="sq__opts">' + q.c.map((c, k) => '<button type="button" class="sq__opt" data-k="' + k + '"><b>' + (k + 1) + '</b><span>' + jp(c) + "</span></button>").join("") + '</div><div class="sq__ans" hidden></div></div></article>';
  }
  function updateCount() { const n = Object.keys(run.ans).length; const c = document.getElementById("sk-count"); if (c) c.textContent = n + "/" + run.items.length; }
  function pick(i, k) {
    if (run.done) return;
    const x = run.items[i]; if (run.free && run.ans[i] != null) return;
    run.ans[i] = k; updateCount();
    const card = document.getElementById("q" + i);
    document.querySelector('#sk-palette a[data-i="' + i + '"]').classList.add("is-done");
    if (run.free) { reveal(i); markWrong(x, k === x.q.a - 1); }
    else card.querySelectorAll(".sq__opt").forEach((b, j) => b.classList.toggle("is-pick", j === k));
  }
  function markWrong(x, ok) {
    const key = x.ex + "#" + x.q.no, W = wrong(), at = W.indexOf(key);
    if (ok && at >= 0) W.splice(at, 1); else if (!ok && at < 0) W.push(key); SK.save("shiken:wrong", W);
  }
  function reveal(i) {
    const x = run.items[i], q = x.q, k = run.ans[i], card = document.getElementById("q" + i), ok = k === q.a - 1;
    card.querySelectorAll(".sq__opt").forEach((b, j) => { b.disabled = true; b.classList.remove("is-pick"); if (j === q.a - 1) b.classList.add("is-ok"); else if (j === k) b.classList.add("is-bad"); });
    const pal = document.querySelector('#sk-palette a[data-i="' + i + '"]'); if (pal) { pal.classList.add(k == null ? "is-bad" : ok ? "is-ok" : "is-bad"); }
    const box = card.querySelector(".sq__ans"); box.hidden = false; box.innerHTML = answerHTML(x, k, null); loadOverlay(x, i);
  }
  /* khung đáp án: bản dịch và lời giải soạn tay (shiken/data/vi/<đề>.json) */
  function answerHTML(x, k, ov) {
    const q = x.q, ok = k === q.a - 1;
    let h = '<div class="sa ' + (k == null ? "" : ok ? "sa--ok" : "sa--bad") + '"><div class="sa__v">' + (k == null ? "Bạn chưa chọn. " : ok ? "Chính xác! " : "Chưa đúng. ") + "Đáp án: " + SK.CIRCLE[q.a - 1] + ' <span class="jp">' + jp(q.c[q.a - 1]) + "</span></div>";
    if (ov && (ov.vi || ov.exp || ov.cv || (ov.v && ov.v.length))) {
      if (ov.vi) h += '<h4>Dịch tiếng Việt</h4><div class="sa__vi">' + esc(ov.vi) + "</div>";
      if (ov.cv && ov.cv.length) h += '<h4>Các đáp án</h4><ul class="sa__cv">' + ov.cv.map((t, j) => '<li class="' + (j === q.a - 1 ? "is-ans" : "") + '">' + SK.CIRCLE[j] + " " + esc(t) + "</li>").join("") + "</ul>";
      if (ov.exp) h += '<h4>Giải thích</h4><div>' + esc(ov.exp).replace(/\n/g, "<br>") + "</div>";
      if (ov.v && ov.v.length) h += '<h4>Từ vựng, mẫu câu khó</h4><div class="sa__chips">' + ov.v.map(v => '<span class="sa__chip"><b lang="ja">' + esc(v[0]) + "</b> " + (v[1] ? '<i lang="ja">' + esc(v[1]) + "</i> " : "") + esc(v[2] || "") + "</span>").join("") + "</div>";
    } else h += '<div class="miss">Bản dịch tiếng Việt và lời giải của câu này đang được soạn.</div>';
    h += '<div class="sa__btns">';
    if (x.sec === "dokkai" && x.pid) h += '<a class="btn btn--ghost btn--sm" href="../dokkai/#/read/' + x.ex + "/" + x.pid + '">Xem bài đọc chữa chi tiết</a>';
    return h + "</div></div>";
  }
  async function loadOverlay(x, i) {
    const vi = run.vi[x.ex] || (run.vi[x.ex] = await SK.vi(x.ex));
    const ov = vi.q && vi.q[x.q.no]; if (!run || !document.getElementById("q" + i)) return;
    const box = document.getElementById("q" + i).querySelector(".sq__ans");
    box.innerHTML = answerHTML(x, run.ans[i], ov);
  }
  /* ---------- nộp bài ---------- */
  function finish(auto) {
    if (run.done) return;
    const total = run.items.length, answered = Object.keys(run.ans).length;
    if (!auto && !run.free && answered < total && !confirm("Bạn còn " + (total - answered) + " câu chưa chọn. Vẫn nộp bài?")) return;
    run.done = true; stopTimer();
    let ok = 0; const bySec = {}, W = wrong();
    run.items.forEach((x, i) => {
      const k = run.ans[i], good = k === x.q.a - 1; if (good) ok++;
      const key = x.sec, s = bySec[key] || (bySec[key] = { ok: 0, n: 0 }); s.n++; if (good) s.ok++;
      const wk = x.ex + "#" + x.q.no, at = W.indexOf(wk);
      if (good && at >= 0) W.splice(at, 1); else if (!good && at < 0) W.push(wk);
      if (!run.free || k == null) { if (k == null && run.free) run.ans[i] = undefined; reveal(i); }
    });
    SK.save("shiken:wrong", W);
    if (run.o.examId) { const H = hist(); H[run.o.examId] = { ok, n: total, mode: run.o.mode, t: Date.now() }; SK.save("shiken:hist", H); }
    const pc = Math.round(ok * 100 / total);
    let h = '<div class="skres" id="sk-res"><div class="skres__big">' + ok + "<small> / " + total + " câu đúng</small> · " + pc + "%</div>";
    if (Object.keys(bySec).length > 1) h += "<table><tr><th>Phần</th><th>Đúng</th><th></th></tr>" + Object.keys(bySec).map(k => { const s = bySec[k]; return '<tr><td lang="ja">' + (SECJA[k] || k) + " · " + (SECVI[k] || "") + "</td><td>" + s.ok + "/" + s.n + '</td><td><div class="bar"><i style="width:' + Math.round(s.ok * 100 / s.n) + '%"></i></div></td></tr>'; }).join("") + "</table>";
    h += '<p class="sk__note">Cuộn xuống để xem lại từng câu kèm đáp án, bản dịch và từ vựng. Các câu sai được lưu để ôn lại ở trang đầu.</p><p><a class="btn btn--primary btn--sm" href="#/">Về danh mục</a> <button class="btn btn--ghost btn--sm" id="sk-again">Làm lại</button></p></div>';
    const bar = main.querySelector(".skbar"); bar.insertAdjacentHTML("afterend", h);
    document.getElementById("sk-again").onclick = () => route(true);
    bar.querySelector("#sk-sub").style.display = "none"; const t = document.getElementById("sk-time"); if (t) t.style.display = "none";
    window.scrollTo({ top: document.getElementById("sk-res").offsetTop - 120, behavior: "smooth" });
  }

  /* ---------- định tuyến ---------- */
  async function route(force) {
    const p = location.hash.replace(/^#\/?/, "").split("/");
    try {
      if (!INDEX.length) INDEX = await SK.index();
      if (p[0] === "exam") {
        const id = p[1], mode = p[2] === "timed" ? "timed" : "free", sec = p[3] || "all";
        const { ex, items } = await examItems(id, sec);
        SK.put("shiken:level", ex.level);
        start(items, { title: ex.level.toUpperCase() + " · " + ex.m + "/" + ex.y + (sec !== "all" ? " · " + SECJA[sec] : ""), mode, examId: id + (sec !== "all" ? "" : ""), minutes: sec === "all" ? MIN[ex.level] : Math.round(MIN[ex.level] * items.length / ex.n * 1.0) || 30 });
      } else if (p[0] === "drill") {
        const lv = p[1], n = +p[2], cnt = +p[3] || 0;
        main.innerHTML = '<p class="empty">Đang gom câu hỏi…</p>';
        const items = await drillItems(lv, n, cnt);
        if (!items.length) { main.innerHTML = '<section class="sk"><p class="sk__empty">Chưa có câu nào cho dạng này.</p></section>'; return; }
        start(items, { title: "Ôn dạng 問題" + n + " · " + kdOf(lv, n)[0] + " (" + lv.toUpperCase() + ")", mode: "free", drill: true });
      } else if (p[0] === "wrong" && p[1]) {
        const lv = p[1]; main.innerHTML = '<p class="empty">Đang gom câu sai…</p>';
        const items = await drillItems(lv, 0, 0, wrong().filter(k => k.startsWith(lv + "-")));
        if (!items.length) { location.hash = "#/"; return; }
        start(items, { title: "Ôn lại các câu đã sai (" + lv.toUpperCase() + ")", mode: "free", drill: true });
      } else if (p[0] === "wrong" && !p[1]) home("wrong"); else if (p[0] === "types") home("types"); else home("home");
    } catch (e) { main.innerHTML = '<section class="sk"><p class="sk__empty">Không tải được dữ liệu đề thi (' + esc(e.message) + '). Hãy tải lại trang.</p></section>'; }
  }
  window.addEventListener("hashchange", () => route());
  route();
})();
