/* Super Kanji — ứng dụng tĩnh, định tuyến bằng hash. Dữ liệu nạp từ data/*.js (xem tools/build.py khi cần tạo lại). */
(() => {
  "use strict";
  const K = window.KANJI;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const rnd = a => a[Math.random() * a.length | 0];
  const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.random() * (i + 1) | 0; [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const uniq = a => [...new Set(a)];
  const LEVELS = [5, 4, 3, 2, 1];
  const LVN = { 5: "N5", 4: "N4", 3: "N3", 2: "N2", 1: "N1" };
  const main = $("#main");
  const shortM = m => (m || "").split(";")[0].trim();

  /* ---------- dữ liệu ---------- */
  const A = { all: [], by: {}, lv: {}, radN: {}, radK: {}, famBy: {}, fams: [] };
  LEVELS.forEach(l => { A.lv[l] = K.L[l] || []; A.lv[l].forEach(r => { A.all.push(r); A.by[r.k] = r; }); });
  (K.M.rad || []).forEach(r => { A.radN[r.n] = r; A.radK[r.n] = []; });
  A.all.forEach(r => (r.rd || []).forEach(n => { if (A.radK[n]) A.radK[n].push(r); }));
  Object.values(A.radK).forEach(a => a.sort((x, y) => y.l - x.l || x.s - y.s));
  A.fams = (K.M.fam || []).map(f => { f.recs = [...f.ks].map(c => A.by[c]).filter(Boolean); A.famBy[f.h] = f; return f; }).filter(f => f.recs.length >= 3);

  /* ---------- tiến độ (lưu trên thiết bị, đồng bộ khi đã đăng nhập) ---------- */
  const PK = "honki:kanji:v1";
  let P = { known: {}, unk: {}, wrong: {}, tests: {}, place: {} };
  try { const j = JSON.parse(localStorage.getItem(PK) || "null"); if (j) P = Object.assign(P, j); } catch (e) { /* bỏ qua */ }
  const nowS = () => Math.floor(Date.now() / 1000);
  let inQuiz = false, pushT = null;
  const saveP = () => { try { localStorage.setItem(PK, JSON.stringify(P)); } catch (e) { /* bỏ qua */ } clearTimeout(pushT); pushT = setTimeout(syncNow, 2500); };
  const setKnown = (k, b) => { if (b) { P.known[k] = nowS(); delete P.unk[k]; } else { delete P.known[k]; P.unk[k] = nowS(); } saveP(); };
  const toastEl = $(".toast"); let toastT;
  const toast = t => { toastEl.textContent = t; toastEl.classList.add("show"); clearTimeout(toastT); toastT = setTimeout(() => toastEl.classList.remove("show"), 2200); };
  const markWrong = r => { P.wrong[r.k] = (P.wrong[r.k] || 0) + 1; saveP(); };
  const markRight = r => { if (P.wrong[r.k]) { P.wrong[r.k]--; if (P.wrong[r.k] <= 0) delete P.wrong[r.k]; saveP(); } };

  const sess = () => { try { const a = JSON.parse(localStorage.getItem("honki:auth") || "null"); return a && a.mode === "remote" && a.token ? a : null; } catch (e) { return null; } };
  async function api(method, body) {
    const a = sess(); if (!a) return null;
    try {
      const res = await fetch("/api/progress?app=kanji", { method, cache: "no-store", headers: Object.assign({ "Content-Type": "application/json", Authorization: "Bearer " + a.token }), body: body ? JSON.stringify(body) : undefined });
      return res.ok ? await res.json() : null;
    } catch (e) { return null; }
  }
  function mergeP(loc, remote) {
    const rp = (remote && remote.progress) || {}, out = { known: {}, unk: {}, tests: {} };
    const ks = new Set([...Object.keys(loc.known), ...Object.keys(loc.unk), ...Object.keys(rp.ok || {}), ...Object.keys(rp.rv || {})]);
    ks.forEach(k => {
      const c = [[1, loc.known[k]], [0, loc.unk[k]], [1, (rp.ok || {})[k]], [0, (rp.rv || {})[k]]].filter(x => x[1]).sort((a, b) => b[1] - a[1])[0];
      if (!c) return; if (c[0]) out.known[k] = c[1]; else out.unk[k] = c[1];
    });
    new Set([...Object.keys(loc.tests), ...Object.keys(rp.gt || {})]).forEach(k => {
      const a = loc.tests[k], b = (rp.gt || {})[k];
      out.tests[k] = !a ? b : !b ? a : { best: Math.max(a.best || 0, b.best || 0), last: (a.n || 0) >= (b.n || 0) ? a.last : b.last, n: Math.max(a.n || 0, b.n || 0) };
    });
    out.place = {};
    const lp = loc.place || {}, rpl = (remote && remote.placement) || {};
    new Set([...Object.keys(lp), ...Object.keys(rpl)]).forEach(k => { const a = lp[k] || {}, b = rpl[k] || {}; out.place[k] = { best: Math.max(a.best || 0, b.best || 0), pass: !!(a.pass || b.pass), n: Math.max(a.n || 0, b.n || 0) }; });
    return out;
  }
  let syncing = false;
  async function syncNow() {
    if (!sess() || syncing) return; syncing = true;
    try {
      for (let t = 0; t < 3; t++) {
        const j = await api("GET"); if (!j) break;
        const m = mergeP(P, j.data); P.known = m.known; P.unk = m.unk; P.tests = m.tests; P.place = m.place;
        try { localStorage.setItem(PK, JSON.stringify(P)); } catch (e) { /* bỏ qua */ }
        const r = await api("PUT", { data: { progress: { ok: P.known, rv: P.unk, gt: P.tests, ts: {}, clr: 0 }, placement: P.place || {} }, ifRev: j.rev || 0 });
        if (r && r.ok) break;
      }
    } finally { syncing = false; if (!inQuiz && !dlg.open) route(); }
  }
  window.addEventListener("honki:auth", () => { if (sess()) syncNow(); });

  /* ---------- cách đọc ---------- */
  const fmtKun = x => { const t = x.replace(/^-/, "〜").replace(/-$/, "〜"); const [a, b] = t.split("."); return esc(a) + (b ? "<i>" + esc(b) + "</i>" : ""); };
  function items(r) {
    if (r._it) return r._it;
    const out = [];
    r.on.forEach(x => out.push({ w: r.k, r: x, t: "on" }));
    const add = (x, strict) => { if (strict && /^-|-$/.test(x)) return; const y = x.replace(/-/g, ""); const [s, o] = y.split("."); out.push({ w: r.k + (o || ""), r: s + (o || ""), t: "kun" }); };
    r.kun.forEach(x => add(x, true));
    if (!out.length) r.kun.forEach(x => add(x, false));
    return r._it = out;
  }
  const rtBadge = t => '<b class="rt rt--' + t + '">' + (t === "on" ? "âm On" : "âm Kun") + "</b>";
  const rtPill = t => '<span class="rt rt--' + t + '">' + (t === "on" ? "ÂM ON · 音読み" : "ÂM KUN · 訓読み") + "</span>";

  /* ---------- nét viết ---------- */
  const sLoad = {};
  const loadS = l => sLoad[l] || (sLoad[l] = new Promise(res => { const s = document.createElement("script"); s.src = "data/s/s" + l + ".js"; s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s); }));
  function strokeSvg(k) {
    const d = K.S[k]; if (!d) return "";
    return '<svg viewBox="0 0 109 109" role="img" aria-label="Thứ tự nét của ' + k + '">' + d[0].map((p, i) => '<path d="' + p + '" pathLength="1" style="--i:' + i + '"/>').join("") + d[1].map((n, i) => '<text x="' + n[0] + '" y="' + n[1] + '" style="--i:' + i + '">' + (i + 1) + "</text>").join("") + "</svg>";
  }
  async function fillStrokes(root) {
    for (const el of $$("[data-st]", root)) {
      const r = A.by[el.dataset.st]; if (!r) continue;
      await loadS(r.l);
      if (!el.isConnected) continue;
      el.innerHTML = strokeSvg(r.k) + (K.S[r.k] ? '<button class="btn btn--ghost btn--sm" type="button" data-play>▶ Xem thứ tự nét</button>' : "<span>Chưa có dữ liệu nét.</span>");
    }
  }
  document.addEventListener("click", e => {
    const b = e.target.closest("[data-play]"); if (!b) return;
    const box = b.closest(".strokes"); box.classList.remove("play"); void box.offsetWidth; box.classList.add("play");
  });

  /* ---------- hiệu ứng đúng / sai (cùng kiểu với Super Goi) ---------- */
  const calm = () => window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  function celebrate(el, big) {
    if (!el) return;
    el.animate([{ transform: "scale(1)" }, { transform: "scale(1.045)" }, { transform: "scale(1)" }], { duration: 380, easing: "cubic-bezier(.3,1.6,.5,1)" });
    if (calm()) return;
    const r = el.getBoundingClientRect(), cs = getComputedStyle(document.documentElement);
    const cols = ["--mint", "--coral", "--green", "--mint"].map(v => cs.getPropertyValue(v).trim() || "#27c4b5");
    const n = big ? 46 : 16, x0 = r.left + r.width / 2, y0 = r.top + r.height / 2;
    for (let i = 0; i < n; i++) {
      const d = document.createElement("i");
      d.className = "confetto";
      d.style.cssText = "left:" + x0 + "px;top:" + y0 + "px;background:" + cols[i % cols.length] + ";" + (i % 3 ? "" : "border-radius:50%;");
      document.body.appendChild(d);
      const ang = Math.random() * Math.PI * 2, dist = (big ? 140 : 70) + Math.random() * (big ? 160 : 60);
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist * .7 - (big ? 60 : 30);
      d.animate([
        { transform: "translate(-50%,-50%) rotate(0) scale(1)", opacity: 1 },
        { transform: "translate(calc(-50% + " + dx + "px), calc(-50% + " + dy + "px)) rotate(" + (Math.random() * 540 - 270) + "deg) scale(.9)", opacity: 1, offset: .6 },
        { transform: "translate(calc(-50% + " + dx * 1.1 + "px), calc(-50% + " + (dy + 70) + "px)) rotate(" + Math.random() * 720 + "deg) scale(.6)", opacity: 0 }
      ], { duration: 750 + Math.random() * 450, easing: "cubic-bezier(.2,.7,.4,1)" }).onfinish = () => d.remove();
    }
  }
  function wobble(el) {
    if (!el) return;
    if (calm()) { el.animate([{ opacity: 1 }, { opacity: .55 }, { opacity: 1 }], { duration: 300 }); return; }
    el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-9px)" }, { transform: "translateX(8px)" }, { transform: "translateX(-6px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }], { duration: 420, easing: "ease-out" });
  }
  function glow(el, ok) {
    if (!el || calm()) return;
    const c = getComputedStyle(document.documentElement).getPropertyValue(ok ? "--mint" : "--coral").trim();
    el.animate(ok ? [{ boxShadow: "0 0 0 0 " + c + "99" }, { boxShadow: "0 0 0 16px " + c + "00" }] : [{ boxShadow: "inset 0 0 0 2px " + c }, { boxShadow: "inset 0 0 0 0 " + c + "00" }], { duration: ok ? 700 : 600, easing: "ease-out" });
  }
  const buzz = () => { try { if (navigator.vibrate) navigator.vibrate(45); } catch (e) { /* bỏ qua */ } };
  const PRAISE = [["Chính xác!", "正解"], ["Tuyệt vời!", "すごい"], ["Giỏi lắm!", "いいね"], ["Chuẩn rồi!", "完璧"], ["Đúng rồi!", "その通り"]];
  const OOPS = [["Chưa đúng", "惜しい"], ["Suýt nữa rồi", "もう少し"], ["Chưa chính xác", "残念"]];
  const pickWord = ok => { const l = ok ? PRAISE : OOPS; return rnd(l); };
  const ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ICON_NO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10"/><path d="M17 7L7 17"/></svg>';
  const verdictHTML = (ok, word, streak) => {
    const [vi, ja] = word || (ok ? PRAISE[0] : OOPS[0]);
    return '<span class="verdict verdict--' + (ok ? "ok" : "no") + '"><span class="verdict__icon">' + (ok ? ICON_OK : ICON_NO) + '</span><span class="verdict__word">' + vi + '<span class="verdict__ja" lang="ja">' + ja + (ok ? "！" : "…") + "</span></span>" + (ok && streak >= 3 ? '<span class="streak">' + streak + " câu đúng liên tiếp</span>" : "") + "</span>";
  };
  const scoreRing = (right, total) => {
    const c = 2 * Math.PI * 52, pct = total ? right / total : 0;
    return '<svg class="score-ring" viewBox="0 0 120 120" role="img" aria-label="Đúng ' + Math.round(pct * 100) + ' phần trăm"><circle class="bg" cx="60" cy="60" r="52"/><circle class="fg" cx="60" cy="60" r="52" stroke-dasharray="' + c.toFixed(1) + '" stroke-dashoffset="' + c.toFixed(1) + '" data-off="' + (c * (1 - pct)).toFixed(1) + '"/><text x="60" y="69" text-anchor="middle">' + Math.round(pct * 100) + "%</text></svg>";
  };
  function afterDone(root, right, total) {
    const fg = root.querySelector(".score-ring .fg");
    if (fg) requestAnimationFrame(() => requestAnimationFrame(() => { fg.style.strokeDashoffset = fg.dataset.off; }));
    if (total && right / total >= .7) setTimeout(() => celebrate(root.querySelector(".score-ring"), true), 650);
  }

  /* ---------- từ vựng nối từ Super Goi ---------- */
  const GL = ["n5", "n4", "n3", "n2", "n1", "nganh"], GN = { n5: "N5", n4: "N4", n3: "N3", n2: "N2", n1: "N1", nganh: "Chuyên ngành" };
  const WD = { rows: null, idx: null, p: null };
  function loadWords() {
    if (WD.p) return WD.p;
    return WD.p = new Promise(res => {
      const s = document.createElement("script"); s.src = "data/words.js";
      s.onload = () => {
        WD.rows = K.W || []; WD.idx = {};
        WD.rows.forEach((r, i) => { const seen = new Set(); for (const ch of r[1].replace(/\[[^\]]*\]/g, "")) { if (A.by[ch] && !seen.has(ch)) { seen.add(ch); (WD.idx[ch] = WD.idx[ch] || []).push(i); } } });
        res(true);
      };
      s.onerror = () => res(false); document.head.appendChild(s);
    });
  }
  const KJ = "\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff々〆ヶヵ";
  const TOK = new RegExp("(\\{)|(\\})|([" + KJ + "]+)\\[([^\\]]+)\\]|( )|([^{}])", "g");
  function jpHTML(m, mark, hl) {
    let out = "";
    for (const x of (m || "").matchAll(TOK)) {
      if (x[1]) { if (hl) out += '<mark class="hw">'; continue; }
      if (x[2]) { if (hl) out += "</mark>"; continue; }
      if (x[3]) { let b = esc(x[3]); if (mark) b = b.split(mark).join('<b class="hk">' + mark + "</b>"); out += "<ruby>" + b + "<rt>" + esc(x[4]) + "</rt></ruby>"; }
      else if (x[5]) out += '<span class="sp"></span>';
      else out += esc(x[6]);
    }
    return out;
  }
  const wordRow = (r, k) => '<button type="button" class="wrow" data-wid="' + esc(r[0]) + '"><span class="wrow__w" lang="ja">' + jpHTML(r[1], k) + '</span><span class="wrow__m">' + esc(r[2]) + "</span></button>";
  async function fillWords(root) {
    for (const el of $$("[data-words]", root)) {
      el.innerHTML = '<p class="note">Đang tải từ vựng từ Super Goi…</p>';
      const ok = await loadWords(); if (!el.isConnected) continue;
      const k = el.dataset.words, g = {};
      if (!ok) { el.innerHTML = '<p class="note">Không tải được dữ liệu từ vựng.</p>'; continue; }
      (WD.idx[k] || []).forEach(i => { const r = WD.rows[i]; (g[r[0].split("-")[0]] = g[r[0].split("-")[0]] || []).push(r); });
      const total = (WD.idx[k] || []).length;
      el.innerHTML = (total ? "" : '<p class="note">Chưa có từ vựng chứa chữ này trong Super Goi.</p>') + GL.filter(l => g[l]).map(l => {
        const rows = g[l];
        return '<div class="wg"><div class="wg__h"><span class="tag tag--lv">' + GN[l] + "</span><small>" + rows.length + ' từ</small></div><div class="wlist">' + rows.map((r, n) => (n === 8 ? '<div class="wmore" hidden>' : "") + wordRow(r, k) + (n === rows.length - 1 && rows.length > 8 ? "</div>" : "")).join("") + "</div>" + (rows.length > 8 ? '<button type="button" class="btn btn--ghost btn--sm" data-wmore>Xem thêm ' + (rows.length - 8) + " từ</button>" : "") + "</div>";
      }).join("");
      const h = el.previousElementSibling; if (h && h.tagName === "H4") h.innerHTML = "Từ vựng chứa chữ này <small>" + total + " từ · lấy từ Super Goi, xếp theo cấp độ</small>";
    }
  }
  document.addEventListener("click", e => {
    const m = e.target.closest("[data-wmore]"); if (!m) return;
    const box = m.previousElementSibling.querySelector(".wmore"); if (box) { box.hidden = !box.hidden; m.textContent = box.hidden ? "Xem thêm từ" : "Thu gọn"; }
  });
  /* cửa sổ từ vựng: nạp dữ liệu Super Goi khi cần */
  const MDL = { lv: {}, w: {}, cat: null };
  window.MD = { register(d) { d.topics.forEach(t => t.items.forEach(e => { e.lv = d.level; e.t = t.id; })); MDL.lv[d.level] = d; (MDL.w[d.level] || []).forEach(f => f()); delete MDL.w[d.level]; }, registerBooks() { } };
  const loadScript = src => new Promise(res => { const s = document.createElement("script"); s.src = src; s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s); });
  const loadGoi = lv => MDL.lv[lv] ? Promise.resolve(true) : (MDL.w[lv] ? new Promise(res => MDL.w[lv].push(() => res(true))) : (MDL.w[lv] = [], new Promise(res => { MDL.w[lv].push(() => res(true)); loadScript("../goi/data/" + lv + ".js").then(ok => { if (!ok) res(false); }); })));
  const loadCat = () => window.MD_CATALOG ? Promise.resolve(true) : loadScript("../goi/data/catalog.js");
  const wdlg = $("#wmodal");
  let jaVoice = null;
  const pickVoice = () => { if (!("speechSynthesis" in window)) return; jaVoice = speechSynthesis.getVoices().find(v => /^ja/i.test(v.lang)) || null; };
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  const speak = t => { if (!("speechSynthesis" in window)) return toast("Trình duyệt chưa hỗ trợ đọc thành tiếng."); speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(t); u.lang = "ja-JP"; if (jaVoice) u.voice = jaVoice; u.rate = .88; speechSynthesis.speak(u); };
  const plain = m => (m || "").replace(new RegExp("([" + KJ + "]+)\\[([^\\]]+)\\]", "g"), "$2").replace(/[{} ]/g, "");
  async function openWord(id) {
    const lv = id.split("-")[0];
    $("#wbody").innerHTML = '<p class="note">Đang mở từ trong Super Goi…</p>'; if (!wdlg.open) wdlg.showModal();
    const [ok] = await Promise.all([loadGoi(lv), loadCat()]);
    let e = null; if (ok && MDL.lv[lv]) for (const t of MDL.lv[lv].topics) { e = t.items.find(x => x.id === id); if (e) break; }
    if (!e) { $("#wbody").innerHTML = '<p class="note">Không tìm thấy từ này trong Super Goi.</p>'; return; }
    const C = window.MD_CATALOG || { posName: {} }, pos = e.p.split(",").map(x => (C.posName || {})[x] || x).join(", ");
    const link = "../goi/#/" + (lv === "nganh" ? "nganh/" : lv + "/") + e.t;
    $("#wbody").innerHTML = '<div class="wd"><div class="wd__top"><span class="tag tag--lv">' + GN[lv] + "</span><span class=\"tag\">" + esc(pos) + '</span></div><div class="wd__w" lang="ja">' + jpHTML(e.w, "", false) + '</div><div class="wd__rm">' + esc(e.rm) + "</div>" +
      '<dl class="wd__dl"><dt>Nghĩa</dt><dd><b>' + esc(e.vi) + "</b></dd>" + (e.hv ? "<dt>Hán Việt</dt><dd class=\"hvv\">" + esc(e.hv) + "</dd>" : "") + "</dl>" +
      (e.c ? '<div class="wd__ph" lang="ja">' + jpHTML(e.c, "", true) + "</div><div class=\"wd__vi\">" + esc(e.cv) + "</div>" : "") +
      (e.e ? '<div class="ex"><div class="ex__ja" lang="ja">' + jpHTML(e.e, "", false) + '</div><div class="ex__vi">' + esc(e.ev) + "</div></div>" : "") +
      '<div class="kd__acts"><button class="btn btn--ghost btn--sm" type="button" data-say="' + esc(plain(e.e || e.w)) + '">🔊 Nghe</button><a class="btn btn--primary btn--sm" href="' + link + '" target="_blank" rel="noopener">Mở trong Super Goi ↗</a></div></div>';
  }
  document.addEventListener("click", e => {
    const w = e.target.closest("[data-wid]"); if (w) { openWord(w.dataset.wid); return; }
    const s = e.target.closest("[data-say]"); if (s) speak(s.dataset.say);
  });
  $("[data-wclose]").onclick = () => wdlg.close();
  wdlg.addEventListener("click", e => { if (e.target === wdlg) wdlg.close(); });

  /* ---------- chi tiết một chữ ---------- */
  const LSN = { TH: "Tượng hình · 象形", CS: "Chỉ sự · 指事", HY: "Hội ý · 会意", HT: "Hình thanh · 形声", CC: "Chuyển chú · 転注", GT: "Giả tá · 仮借" };
  function etyHTML(r) {
    const tags = (r.ls || "").split(",").filter(Boolean).map(x => '<span class="ls ls--' + x + '">' + (LSN[x] || x) + "</span>").join("");
    const paras = (r.o || "").split("¶").map(t => t.trim()).filter(Boolean).map(t => "<p>" + esc(t) + "</p>").join("");
    return "<h4>Nguồn gốc theo Lục thư</h4>" + (tags ? '<div class="lsrow">' + tags + "</div>" : "") + (paras || "<p>Chưa có.</p>") + (r.a ? '<p class="note">Mục này đang là bản tổng hợp tự động từ cấu tạo chữ, chưa được biên soạn kỹ.</p>' : "");
  }
  function detailHTML(r, fold) {
    const rad = A.radN[r.r];
    const fams = (r.f || []).map(h => A.famBy[h]).filter(Boolean);
    const partTile = p => {
      const k = A.by[p[0]];
      const sub = (shortM(p[2]) || "") + (p[3] ? (p[2] ? " · " : "") + "dạng biến của " + p[3] : "");
      const at = k ? 'data-k="' + p[0] + '"' : 'data-comp="' + esc(p[0]) + '" data-chv="' + esc(p[1] || "") + '" data-cm="' + esc(p[2] || "") + '" data-cv="' + esc(p[3] || "") + '"';
      return '<button type="button" class="part" ' + at + ' title="Bấm để xem chi tiết"><span class="g" lang="ja">' + esc(p[0]) + "</span><span><b>" + esc(p[1] || "") + "</b><small>" + esc(sub) + "</small></span></button>";
    };
    const parts = (r.p || []).map(partTile).join("");
    const out = '<div class="kd"><div class="kd__head"><div class="kd__glyph" lang="ja">' + r.k + '</div><div class="kd__info"><div class="kd__hv">' + esc(r.hv) + '</div><div class="kd__m">' + esc(r.m) + '</div><div class="tags"><span class="tag tag--lv">' + LVN[r.l] + '</span><span class="tag">' + r.s + " nét</span>" + (rad ? '<button type="button" class="tag tag--btn" data-comp="' + esc(rad.g) + '" data-chv="' + esc(rad.hv) + '" data-cm="' + esc(rad.m) + '" data-cv="">Bộ ' + esc(rad.g) + " " + esc(rad.hv) + " · #" + rad.n + "</button>" : "") + '</div></div><div class="kd__st"><div class="strokes" data-st="' + r.k + '"><span>Đang tải…</span></div></div></div>' +
      '<div class="rdg"><div><small class="on">ÂM ON · 音読み</small><div class="v" lang="ja">' + (r.on.length ? r.on.map(esc).join("；") : "—") + '</div></div><div><small>ÂM KUN · 訓読み</small><div class="v" lang="ja">' + (r.kun.length ? r.kun.map(fmtKun).join("；") : "—") + "</div></div></div>" +
      "<h4>Phân tích bộ thủ</h4>" + (parts ? '<div class="parts">' + parts + "</div>" : "<p>Chữ độc thể, không tách được thành các bộ nhỏ hơn.</p>") +
      etyHTML(r) + "\u0001" +
      fams.map(f => "<h4>Gia đình chữ “" + esc(f.h) + "”" + (f.hv ? " · " + esc(f.hv) : "") + " <small>" + f.recs.length + " chữ" + (f.kd.includes("CC") ? " · nhóm chuyển chú" : f.kd.includes("HT") ? " · cùng phần chỉ âm" : "") + "</small></h4>" + '<table class="famtab"><thead><tr><th>Chữ</th><th>Hán Việt</th><th>Âm on</th><th>Nghĩa</th></tr></thead><tbody>' + f.recs.map(x => '<tr class="' + (x === r ? "is-me" : "") + '"><td><span class="g" lang="ja" data-k="' + x.k + '">' + x.k + '</span></td><td class="hv">' + esc(x.hv) + '</td><td lang="ja">' + esc(x.on.slice(0, 2).join("・") || "—") + "</td><td>" + esc(shortM(x.m)) + "</td></tr>").join("") + "</tbody></table>").join("") +
      '<h4>Từ vựng chứa chữ này</h4><div class="kwords" data-words="' + r.k + '"></div></div>';
    if (!fold) return out.replace("\u0001", "");
    return out.replace("\u0001", '<button type="button" class="kd__loc" aria-expanded="false"><span>📍 Định vị chữ</span><small>Gia đình chữ · từ vựng chứa chữ này</small><i aria-hidden="true">▾</i></button><div class="kd__more" hidden>').replace(/<\/div>$/, "</div></div>");
  }
  const dlg = $("#kmodal"); let CTX = [], CUR = null, KSTACK = [];
  const glyphOf = o => o.k || o.g;
  function compHTML(o) {
    const radN = Object.values(A.radN).find(r => r.g === o.g || (o.v && r.g === o.v));
    const has = A.all.filter(r => (r.p || []).some(x => x[0] === o.g) || (radN && (r.rd || []).includes(radN.n)));
    const g = {}; has.forEach(r => (g[r.l] = g[r.l] || []).push(r));
    const info = [o.hv ? "<b>" + esc(o.hv) + "</b>" : "", o.m ? esc(o.m) : "", o.v ? "dạng biến của " + esc(o.v) : ""].filter(Boolean).join(" · ");
    return '<div class="kd"><div class="kd__head kd__head--comp"><div class="kd__glyph" lang="ja">' + esc(o.g) + '</div><div class="kd__info"><div class="kd__hv">' + esc(o.hv || o.g) + '</div><div class="kd__m">' + esc(o.m || "Thành phần cấu tạo chữ") + '</div><div class="tags"><span class="tag tag--lv">Bộ thủ / thành phần</span>' + (radN ? '<span class="tag">Bộ số ' + radN.n + " · " + radN.s + " nét</span>" : "") + '<span class="tag">' + has.length + " chữ chứa</span></div>" + (info ? '<p class="note" style="margin-top:8px">' + info + "</p>" : "") + "</div></div>" +
      "<h4>Các chữ chứa thành phần này <small>xếp theo cấp độ · bấm để xem, rồi bấm “Quay lại” để về chữ đang học</small></h4>" +
      (LEVELS.filter(l => g[l]).map(l => '<div class="lvhead"><span>' + LVN[l] + "</span><small>" + g[l].length + ' chữ</small></div><div class="ktiles">' + sortList(g[l]).map(tile).join("") + "</div>").join("") || "<p>Chưa có chữ nào trong danh sách.</p>") + "</div>";
  }
  function show(o, mode) {
    if (!o) return;
    if (mode === "push") { if (CUR && CUR !== o) KSTACK.push(CUR); } else if (mode !== "back") KSTACK = [];
    CUR = o;
    $("#kbody").innerHTML = o.comp ? compHTML(o) : detailHTML(o) + '<div class="kd__acts"><button class="btn ' + (P.known[o.k] ? "btn--primary" : "btn--ghost") + ' btn--sm" type="button" data-known="' + o.k + '">' + (P.known[o.k] ? "✓ Đã thuộc" : "Đánh dấu đã thuộc") + "</button></div>";
    $("#kbody").scrollTop = 0;
    if (!dlg.open) dlg.showModal();
    if (!o.comp) { fillStrokes($("#kbody")); fillWords($("#kbody")); }
    const i = o.comp ? -1 : CTX.indexOf(o), back = $("[data-kback]");
    $("[data-kprev]").disabled = i < 1 || KSTACK.length > 0; $("[data-knext]").disabled = i < 0 || i >= CTX.length - 1 || KSTACK.length > 0;
    back.hidden = !KSTACK.length;
    if (KSTACK.length) back.innerHTML = '‹ Quay lại <span lang="ja">' + esc(glyphOf(KSTACK[KSTACK.length - 1])) + "</span>";
  }
  const openK = (c, mode) => show(A.by[c], mode);
  const stepK = d => { if (KSTACK.length || !CUR || CUR.comp) return; const i = CTX.indexOf(CUR); if (i >= 0 && CTX[i + d]) openK(CTX[i + d].k); };
  $("[data-kprev]").onclick = () => stepK(-1); $("[data-knext]").onclick = () => stepK(1);
  $("[data-kback]").onclick = () => { const p = KSTACK.pop(); if (p) show(p, "back"); };
  $("[data-kclose]").onclick = () => dlg.close();
  dlg.addEventListener("close", () => { KSTACK = []; });
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  document.addEventListener("click", e => {
    const kb = e.target.closest("[data-known]");
    if (kb) { const k = kb.dataset.known; setKnown(k, !P.known[k]); kb.className = "btn btn--sm " + (P.known[k] ? "btn--primary" : "btn--ghost"); kb.textContent = P.known[k] ? "✓ Đã thuộc" : "Đánh dấu đã thuộc"; $$('.kt[data-k="' + k + '"]').forEach(t => t.classList.toggle("is-known", !!P.known[k])); return; }
    const cp = e.target.closest("[data-comp]");
    if (cp) { show({ comp: 1, g: cp.dataset.comp, hv: cp.dataset.chv, m: cp.dataset.cm, v: cp.dataset.cv }, cp.closest("#kbody") ? "push" : undefined); return; }
    const t = e.target.closest("[data-k]");
    if (t) openK(t.dataset.k, t.closest("#kbody") ? "push" : undefined);
  });

  /* ---------- phạm vi học ---------- */
  const TABS = {
    "jlpt": { name: "JLPT", hash: "#/", icon: "級" },
    "gia-dinh": { name: "Gia đình Kanji", hash: "#/gia-dinh", icon: "族" },
    "giao-trinh": { name: "Giáo trình Kanji Master", hash: "#/giao-trinh", icon: "課" },
    "bo-thu": { name: "Bộ thủ", hash: "#/bo-thu", icon: "部" },
    "dau-vao": { name: "Test đầu vào", hash: "#/dau-vao" },
    "tim-kiem": { name: "Tìm kiếm", hash: "#/tim-kiem" },
    "ly-thuyet": { name: "Lý thuyết", hash: "#/ly-thuyet" }
  };
  const chapterList = (lv, no) => {
    const ch = (K.M.toc[lv] || []).find(c => c.no === no); if (!ch) return null;
    return { ch, list: uniq(ch.u.flatMap(u => [...u[1]])).map(c => A.by[c]).filter(Boolean) };
  };
  function getScope(tab, id) {
    const S = { tab, id, key: tab + "/" + id, list: [], title: "", sub: "", back: TABS[tab].hash, groups: null };
    if (tab === "jlpt") {
      if (id === "all") { S.title = "Tất cả Kanji JLPT"; S.list = A.all; S.groups = LEVELS.map(l => ({ title: "JLPT " + LVN[l], list: A.lv[l] })); }
      else { const l = +id.slice(1); if (!A.lv[l]) return null; S.title = "JLPT " + LVN[l]; S.list = A.lv[l]; S.sub = "Các chữ Kanji thuộc cấp " + LVN[l] + " theo thứ tự trong giáo trình Kanji Master."; }
    } else if (tab === "gia-dinh") {
      if (id.startsWith("f~")) { const f = A.famBy[id.slice(2)]; if (!f) return null; S.fam = f; S.title = "Gia đình “" + f.h + "”"; S.sub = "Các chữ có chung thành phần " + f.h + (f.hv ? " (" + f.hv + ")" : "") + ": hình giống nhau, rất dễ nhầm."; S.list = f.recs; }
      else { const lv = id.startsWith("all~") ? +id.slice(5) : 0; S.title = lv ? "Mọi gia đình Kanji · " + LVN[lv] : "Mọi gia đình Kanji"; S.sub = "Luyện toàn bộ các chữ nằm trong nhóm gia đình."; const fs = A.fams.filter(f => !lv || f.recs.some(r => r.l === lv)); S.list = uniq(fs.flatMap(f => f.recs)).filter(r => !lv || r.l === lv); S.groups = LEVELS.map(l => ({ title: "JLPT " + LVN[l], list: S.list.filter(r => r.l === l) })); }
    } else if (tab === "giao-trinh") {
      const [lv, no] = id.split("~"); if (!K.M.toc[lv]) return null;
      const L = +lv.slice(1);
      if (no == null) { S.title = "Kanji Master " + lv.toUpperCase(); S.sub = (K.M.toc[lv] || []).length + " chương, theo đúng thứ tự giáo trình."; S.groups = K.M.toc[lv].map(c => ({ title: "Chương " + c.no + " · " + c.jp, sub: c.vi, list: chapterList(lv, c.no).list })); S.list = uniq(S.groups.flatMap(g => g.list)); S.lv = L; }
      else { const c = chapterList(lv, +no); if (!c) return null; S.title = lv.toUpperCase() + " · Chương " + c.ch.no + ": " + c.ch.jp; S.sub = c.ch.vi; S.list = c.list; S.lv = L; S.ch = c.ch; S.groups = c.ch.u.map(u => ({ title: u[0] || "", list: [...u[1]].map(x => A.by[x]).filter(Boolean) })); S.back = TABS[tab].hash + "?l=" + lv; }
    } else if (tab === "bo-thu") {
      if (id === "all") { S.title = "Tất cả bộ thủ"; S.sub = "Luyện các chữ Hán theo bộ thủ chứa trong chữ."; S.list = A.all.filter(r => (r.rd || []).length); S.groups = LEVELS.map(l => ({ title: "JLPT " + LVN[l], list: S.list.filter(r => r.l === l) })); }
      else { const rad = A.radN[+id]; if (!rad) return null; S.rad = rad; S.title = "Bộ " + rad.g + " · " + rad.hv; S.sub = "Bộ thủ số " + rad.n + " (" + rad.s + " nét): " + rad.m + ". Danh sách các chữ chứa bộ này, xếp theo cấp độ."; S.list = A.radK[rad.n]; S.groups = LEVELS.map(l => ({ title: "JLPT " + LVN[l], list: S.list.filter(r => r.l === l) })); }
    }
    S.groups = S.groups ? S.groups.filter(g => g.list.length) : null;
    return S;
  }

  /* ---------- tiện ích giao diện ---------- */
  const knownCount = list => list.filter(r => P.known[r.k]).length;
  const hero = (title, sub, pills) => '<section class="kh"><div class="kh__in"><div><h1>' + title + "</h1>" + (sub ? "<p>" + sub + "</p>" : "") + '</div><div class="kh__stat">' + (pills || "") + "</div></div></section>";
  const pill = (t, b) => '<span class="pill">' + t + (b != null ? " <b>" + b + "</b>" : "") + "</span>";
  const tile = r => '<button type="button" class="kt' + (P.known[r.k] ? " is-known" : "") + '" data-k="' + r.k + '" title="' + esc(r.hv + " · " + r.m) + '"><span class="kt__g" lang="ja">' + r.k + '</span><span class="kt__hv">' + esc(r.hv) + '</span><span class="kt__m">' + esc(shortM(r.m)) + "</span></button>";
  const hvKey = r => (!r.hv || r.hv === "—" ? "~" : r.hv);
  const vcmp = (a, b) => a.localeCompare(b, "vi");
  const SORTS = { def: null, hv: (a, b) => vcmp(hvKey(a), hvKey(b)) || a.s - b.s, st: (a, b) => a.s - b.s || vcmp(hvKey(a), hvKey(b)) };
  let SORT = "def"; try { SORT = localStorage.getItem("honki:kanji:sort") || "def"; if (!(SORT in SORTS)) SORT = "def"; } catch (e) { /* bỏ qua */ }
  const sortList = l => SORTS[SORT] ? l.slice().sort(SORTS[SORT]) : l;
  const sortSeg = () => '<span class="seg seg--sort" role="group" aria-label="Sắp xếp chữ"><span class="seg__l">Sắp xếp</span>' + [["def", "Mặc định"], ["hv", "A–Z Hán Việt"], ["st", "Số nét"]].map(x => '<button type="button" data-sort="' + x[0] + '" aria-pressed="' + (SORT === x[0]) + '">' + x[1] + "</button>").join("") + "</span>";
  const bindSort = redraw => $$("[data-sort]").forEach(b => b.onclick = () => { SORT = b.dataset.sort; try { localStorage.setItem("honki:kanji:sort", SORT); } catch (e) { /* bỏ qua */ } $$("[data-sort]").forEach(x => x.setAttribute("aria-pressed", x.dataset.sort === SORT)); redraw(); });
  const bar = (a, b) => '<div class="bar"><i style="width:' + (b ? Math.round(100 * a / b) : 0) + '%"></i></div>';
  const bestOf = key => { const t = P.tests[key]; return t ? t.best : null; };
  function setNav(tab) { $$("[data-nav]").forEach(a => { if (a.dataset.nav === tab) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current"); }); }

  /* ---------- trang đầu mỗi tab ---------- */
  function vJlpt() {
    const one = l => {
      const ls = A.lv[l], kn = knownCount(ls), b = bestOf("jlpt/n" + l);
      return '<a class="card card--lv" data-lv="' + l + '" href="#/jlpt/n' + l + '"><div class="card__top"><span class="big">' + LVN[l] + '</span><span class="pill">' + ls.length + ' chữ</span></div><p>' + (l === 5 ? "Chữ cơ bản đầu tiên" : l === 4 ? "Mở rộng đời sống hằng ngày" : l === 3 ? "Trình độ trung cấp" : l === 2 ? "Trung cao cấp" : "Cao cấp, chữ khó") + '</p><div class="card__glyphs" lang="ja">' + ls.slice(0, 8).map(r => r.k).join("") + "</div>" + bar(kn, ls.length) + "<p>Đã thuộc " + kn + "/" + ls.length + (b != null ? " · Test tốt nhất " + b + "/20" : "") + "</p></a>";
    };
    const all = '<a class="card card--lv card--all" href="#/jlpt/all"><div class="card__top"><span class="big" lang="ja">全</span><span class="pill">' + A.all.length + ' chữ</span></div><h3>Toàn bộ cấp độ</h3><p>Luyện và thi thử cả N5 đến N1 trong một bộ lớn.</p><div class="card__glyphs" lang="ja">' + A.all.slice(0, 14).map(r => r.k).join("") + "</div>" + bar(knownCount(A.all), A.all.length) + "<p>Đã thuộc " + knownCount(A.all) + "/" + A.all.length + "</p></a>";
    main.innerHTML = hero("Kanji theo cấp độ JLPT", "Chọn một cấp để xem danh sách chữ, luyện tập bằng flashcard, trắc nghiệm, ghép cặp và làm bài test 20 câu giống đề thi.", pill("Tổng số chữ", A.all.length) + pill("Đã thuộc", knownCount(A.all))) +
      '<div class="wrap lvgrid"><div class="lvrow">' + one(5) + one(4) + '</div><div class="lvrow">' + one(3) + one(2) + '</div><div class="lvrow lvrow--1">' + one(1) + '</div><div class="lvrow lvrow--1">' + all + '</div></div>';
  }
  /* ---------- test đầu vào ---------- */
  const PASS = 16;
  function vPlace() {
    P.place = P.place || {};
    const done = LEVELS.filter(l => (P.place["n" + l] || {}).pass);
    const hi = done.length ? Math.min(...done) : null;
    const card = l => {
      const st = P.place["n" + l] || {}, open = true;
      const tag = st.pass ? '<span class="pl__ok">✓ Đã qua · ' + st.best + "/20</span>" : open ? '<span class="pl__go">Sẵn sàng' + (st.best != null ? " · cao nhất " + st.best + "/20" : "") + "</span>" : '<span class="pl__lock">🔒 Qua ' + LVN[l + 1] + " để mở</span>";
      return '<' + (open ? 'a href="#/dau-vao/n' + l + '"' : 'div') + ' class="card card--lv pl' + (open ? "" : " is-lock") + (st.pass ? " is-pass" : "") + '"><div class="card__top"><span class="big">' + LVN[l] + '</span><span class="pill">20 câu</span></div><p>Thi đầu vào Kanji ' + LVN[l] + ': 10 câu cách đọc + 10 câu chọn Kanji. Đạt từ 80% (16/20) để lên ' + (l > 1 ? LVN[l - 1] : "cấp cao nhất") + (l < 5 ? "; chưa đạt sẽ được gợi ý làm " + LVN[l + 1] : "; chưa đạt hãy ôn lại " + LVN[l]) + ".</p>" + tag + "</" + (open ? "a" : "div") + ">";
    };
    main.innerHTML = hero("Test đầu vào", "Chọn bất kỳ cấp nào để thử sức. Mỗi bài gồm 2 mondai, 20 câu. Đạt từ 80% (16/20) thì nên thử cấp cao hơn; chưa đạt thì làm cấp thấp hơn để xác định đúng trình độ.", pill("Cấp cao nhất đã qua", hi ? LVN[hi] : "Chưa có") + pill("Điều kiện qua", "≥ 80%")) +
      '<div class="wrap lvgrid"><div class="lvrow">' + card(5) + card(4) + '</div><div class="lvrow">' + card(3) + card(2) + '</div><div class="lvrow lvrow--1">' + card(1) + "</div></div>";
  }
  function vPlaceLv(id) {
    const l = +String(id).slice(1); if (!A.lv[l]) return vPlace();
    const S = { tab: "dau-vao", id: "n" + l, key: "dau-vao/n" + l, list: A.lv[l], title: "Test đầu vào " + LVN[l], sub: "", back: "#/dau-vao", groups: null, lv: l };
    document.title = "Super Kanji — " + S.title; CTX = S.list;
    quizPage(S, () => buildTest(S), { test: true, after: (sc, n, root) => {
      const ok = sc >= PASS, st = P.place["n" + l] || { n: 0 }; st.n = (st.n || 0) + 1; st.best = Math.max(st.best || 0, sc); if (ok) st.pass = true; P.place["n" + l] = st; saveP();
      const up = l > 1 ? LVN[l - 1] : null, dn = l < 5 ? LVN[l + 1] : null, pc = Math.round(100 * sc / n);
      const box = document.createElement("div"); box.className = "pl__res " + (ok ? "ok" : "no");
      box.innerHTML = ok ? "<b>🎉 Đạt " + pc + "%!</b> Bạn đã qua " + LVN[l] + (up ? ". Hãy thử tiếp cấp " + up + " để xem trình độ của mình ở đâu." : ". Bạn đã hoàn thành mọi cấp, trình độ cao nhất!") + (up ? ' <a class="btn btn--primary btn--sm" href="#/dau-vao/n' + (l - 1) + '">Làm ' + up + " →</a>" : "") : "<b>Chưa đạt (" + pc + "%).</b> Cần ít nhất " + PASS + "/20 (80%) để qua " + LVN[l] + ". Bạn được " + sc + "/20. " + (dn ? "Hãy làm " + dn + " để kiểm tra lại trình độ." : "Hãy ôn lại " + LVN[l] + " từ đầu rồi thử lại nhé.") + (dn ? ' <a class="btn btn--primary btn--sm" href="#/dau-vao/n' + (l + 1) + '">Làm ' + dn + " →</a>" : "") + ' <a class="btn btn--ghost btn--sm" href="#/jlpt/n' + l + '">Ôn ' + LVN[l] + "</a>";
      const res = root.querySelector(".res"); if (res) res.insertBefore(box, res.querySelector(".act")); else root.appendChild(box);
    } });
  }
  const ST = { famLv: 0, famQ: "", radQ: "" };
  function vFam() {
    main.innerHTML = hero("Gia đình Kanji", "Những chữ có chung một phần gốc được gom lại thành một “gia đình”: cùng nhìn, cùng so sánh để không còn nhầm giữa các chữ giống nhau.", pill("Số gia đình", A.fams.length) + pill("Số chữ", uniq(A.fams.flatMap(f => f.recs)).length)) +
      '<div class="wrap"><div class="chips" id="famchips"></div><div class="famgrid" id="famgrid"></div></div>';
    const draw = () => {
      $("#famchips").innerHTML = [0, ...LEVELS].map(l => '<button class="chip" type="button" data-fl="' + l + '" aria-current="' + (ST.famLv === l) + '">' + (l ? LVN[l] : "Tất cả") + "</button>").join("") + '<input class="search" type="search" id="famq" placeholder="Tìm chữ hoặc Hán Việt…" value="' + esc(ST.famQ) + '" aria-label="Tìm gia đình">' + sortSeg() + '<a class="chip" href="#/gia-dinh/' + (ST.famLv ? "all~n" + ST.famLv : "all") + '">Luyện / Test mọi gia đình' + (ST.famLv ? " " + LVN[ST.famLv] : "") + " →</a>";
      const q = ST.famQ.trim().toLowerCase();
      let fs = A.fams.filter(f => (!ST.famLv || f.recs.some(r => r.l === ST.famLv)) && (!q || f.ks.includes(q) || f.h === q || (f.hv || "").toLowerCase().includes(q) || f.recs.some(r => r.hv.toLowerCase().includes(q))));
      if (SORT === "hv") fs = fs.slice().sort((a, b) => vcmp(a.hv || "~", b.hv || "~")); else if (SORT === "st") fs = fs.slice().sort((a, b) => (a.s || 0) - (b.s || 0) || vcmp(a.hv || "~", b.hv || "~"));
      $("#famgrid").innerHTML = fs.map(f => '<a class="fam" href="#/gia-dinh/f~' + encodeURIComponent(f.h) + '"><div class="fam__h" lang="ja">' + esc(f.h) + "<small>" + esc(f.hv || "") + '</small></div><div><div class="fam__k" lang="ja">' + f.recs.map(r => r.k).join("") + '</div><div class="fam__n">' + f.recs.length + " chữ · " + uniq(f.recs.map(r => LVN[r.l])).join(", ") + "</div></div></a>").join("") || '<p class="empty">Không có gia đình phù hợp.</p>';
      $$("[data-fl]").forEach(b => b.onclick = () => { ST.famLv = +b.dataset.fl; draw(); });
      bindSort(() => { const pos = $("#famq").selectionStart; draw(); });
      const qi = $("#famq"); qi.oninput = () => { ST.famQ = qi.value; const pos = qi.selectionStart; draw(); const n = $("#famq"); n.focus(); n.setSelectionRange(pos, pos); };
    };
    draw();
  }
  function vBook(lv) {
    lv = lv && K.M.toc[lv] ? lv : "n5";
    const chs = K.M.toc[lv]; const L = +lv.slice(1);
    main.innerHTML = hero("Giáo trình Kanji Master", "Các chương theo đúng thứ tự trong sách Kanji Master từ N5 đến N1. Mỗi chương có đầy đủ chữ, gói luyện tập và bài test riêng.", pill("Cấp", lv.toUpperCase()) + pill("Số chương", chs.length)) +
      '<div class="wrap"><div class="chips">' + LEVELS.map(l => '<a class="chip" href="#/giao-trinh?l=n' + l + '" aria-current="' + (lv === "n" + l) + '">' + LVN[l] + "</a>").join("") + '<a class="chip" href="#/giao-trinh/' + lv + '">Luyện cả cấp ' + lv.toUpperCase() + ' →</a></div><div class="cards">' +
      chs.map(c => { const cl = chapterList(lv, c.no).list; const kn = knownCount(cl); const b = bestOf("giao-trinh/" + lv + "~" + c.no); return '<a class="card" href="#/giao-trinh/' + lv + "~" + c.no + '"><div class="card__top"><span class="card__no">' + c.no + '</span><span class="pill">' + cl.length + ' chữ</span></div><h3>' + esc(c.jp) + "</h3><p>" + esc(c.vi) + '</p><div class="card__glyphs" lang="ja">' + cl.map(r => r.k).join("") + "</div>" + bar(kn, cl.length) + (b != null ? "<p>Test tốt nhất " + b + "/20</p>" : "") + "</a>"; }).join("") + "</div></div>";
  }
  function vRad() {
    main.innerHTML = hero("Bộ thủ", "214 bộ thủ Khang Hy. Chọn một bộ để xem mọi chữ chứa bộ đó (xếp theo cấp độ) và luyện nhận diện bộ thủ.", pill("Bộ có chữ", Object.values(A.radK).filter(a => a.length).length)) +
      '<div class="wrap"><div class="chips"><input class="search" type="search" id="radq" placeholder="Tìm bộ (vd. thủy, 氵, nước)…" value="' + esc(ST.radQ) + '" aria-label="Tìm bộ thủ"><span class="seg seg--sort"><span class="seg__l">Sắp xếp bộ</span><button type="button" data-sort="st" aria-pressed="' + (SORT !== "hv") + '">Số nét</button><button type="button" data-sort="hv" aria-pressed="' + (SORT === "hv") + '">A–Z Hán Việt</button></span><a class="chip" href="#/bo-thu/all">Luyện / Test mọi bộ thủ →</a></div><div id="radgrid"></div></div>';
    const draw = () => {
      const q = ST.radQ.trim().toLowerCase(); const by = {};
      Object.values(A.radN).forEach(r => {
        if (!A.radK[r.n].length) return;
        if (q && !(r.g === q || r.hv.toLowerCase().includes(q) || r.m.toLowerCase().includes(q) || String(r.n) === q)) return;
        (by[SORT === "hv" ? "AZ" : r.s] = by[SORT === "hv" ? "AZ" : r.s] || []).push(r);
      });
      if (by.AZ) by.AZ.sort((x, y) => vcmp(x.hv, y.hv));
      $("#radgrid").innerHTML = Object.keys(by).sort((a, b) => a === "AZ" ? 0 : a - b).map(s => '<div class="radgroup"><h3>' + (s === "AZ" ? "A–Z theo Hán Việt" : s + " nét") + '</h3><div class="radrow">' + by[s].map(r => '<a class="rad" href="#/bo-thu/' + r.n + '" title="' + esc(r.m) + '"><b lang="ja">' + esc(r.g) + "</b><span>" + esc(r.hv) + "</span><small>" + A.radK[r.n].length + " chữ</small></a>").join("") + "</div></div>").join("") || '<p class="empty">Không tìm thấy bộ thủ.</p>';
    };
    draw(); bindSort(draw);
    const qi = $("#radq"); qi.oninput = () => { ST.radQ = qi.value; draw(); };
  }

  /* ---------- tìm kiếm ---------- */
  const fold = t => (t || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").trim();
  const toHira = t => (t || "").replace(/[\u30a1-\u30f6]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60)).replace(/[.\-・\s]/g, "");
  const CJK = /[\u3400-\u4dbf\u4e00-\u9fff\uf900-\ufaff]/;
  function searchKanji(q) {
    q = q.trim(); if (!q) return [];
    if (CJK.test(q)) return uniq([...q].map(c => A.by[c]).filter(Boolean));
    const f = fold(q), h = toHira(q), res = [];
    A.all.forEach(r => {
      const hv = fold(r.hv); let sc = 0;
      if (hv === f) sc = 100; else if (hv.startsWith(f)) sc = 80; else if (f.length > 1 && hv.includes(f)) sc = 60;
      else if (fold(r.m).split(/[;,/ ]+/).some(w => w === f)) sc = 50; else if (f.length > 1 && fold(r.m).includes(f)) sc = 40;
      else if (/[\u3040-\u30ff]/.test(q) && h && [...r.on, ...r.kun].some(x => toHira(x) === h || (h.length > 1 && toHira(x).startsWith(h)))) sc = 55;
      else if (f.length > 2 && (r.en || []).some(e => fold(e).includes(f))) sc = 30;
      if (sc) res.push([sc, r]);
    });
    return res.sort((a, b) => b[0] - a[0] || a[1].l - b[1].l || a[1].s - b[1].s).map(x => x[1]);
  }
  function vSearch(q0) {
    let q = q0 || "";
    main.innerHTML = hero("Tìm kiếm Kanji", "Gõ chữ Hán, âm Hán Việt (có hoặc không dấu), nghĩa tiếng Việt, hoặc cách đọc bằng kana. Có thể dán cả một từ để tra từng chữ.", pill("Kho chữ", A.all.length)) +
      '<div class="wrap"><div class="sbox"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg><input class="search search--big" type="search" id="sq" placeholder="Ví dụ: môn, thuỷ, 門, 勉強, かん…" autocomplete="off" value="' + esc(q) + '" aria-label="Từ khoá tìm kiếm"></div>' +
      '<div class="chips" id="srcmeta" style="margin-top:12px"></div><div id="sres"></div></div>';
    const draw = () => {
      const res = searchKanji(q); CTX = res;
      const rads = q.trim() && !CJK.test(q) ? Object.values(A.radN).filter(r => A.radK[r.n].length && (fold(r.hv) === fold(q) || fold(r.m).split(/[;,/ ]+/).includes(fold(q)))) : (CJK.test(q) ? Object.values(A.radN).filter(r => A.radK[r.n].length && q.includes(r.g)) : []);
      const fams = q.trim() ? A.fams.filter(f => CJK.test(q) ? q.includes(f.h) : fold(f.hv || "") === fold(q)) : [];
      $("#srcmeta").innerHTML = q.trim() ? '<span class="pill">Kết quả <b>' + res.length + "</b></span>" + (res.length ? sortSeg() : "") + rads.map(r => '<a class="chip" href="#/bo-thu/' + r.n + '">Bộ <span lang="ja">' + esc(r.g) + "</span> " + esc(r.hv) + "</a>").join("") + fams.map(f => '<a class="chip" href="#/gia-dinh/f~' + encodeURIComponent(f.h) + '">Gia đình <span lang="ja">' + esc(f.h) + "</span> · " + f.recs.length + " chữ</a>").join("") : "";
      const box = $("#sres");
      if (!q.trim()) { box.innerHTML = '<p class="empty">Nhập từ khoá để bắt đầu tìm.</p>'; return; }
      if (!res.length) { box.innerHTML = '<p class="empty">Không tìm thấy chữ nào khớp với “' + esc(q) + '”.</p>'; return; }
      const g = {}; res.forEach(r => (g[r.l] = g[r.l] || []).push(r));
      box.innerHTML = LEVELS.filter(l => g[l]).map(l => '<div class="lvhead"><span>' + LVN[l] + "</span><small>" + g[l].length + ' chữ</small></div><div class="ktiles">' + (SORT === "def" ? g[l] : sortList(g[l])).map(tile).join("") + "</div>").join("");
      bindSort(draw);
    };
    const inp = $("#sq"); inp.oninput = () => { q = inp.value; history.replaceState(null, "", "#/tim-kiem" + (q.trim() ? "?q=" + encodeURIComponent(q.trim()) : "")); draw(); };
    draw(); if (!q) inp.focus({ preventScroll: true });
  }

  /* ---------- trang một phạm vi ---------- */
  const svg = d => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + d + "</svg>";
  const ICO = {
    flash: svg('<rect x="3" y="7" width="14" height="12" rx="2.2"/><path d="M7 7V5.2A1.2 1.2 0 0 1 8.2 4H19a2 2 0 0 1 2 2v8.8a1.2 1.2 0 0 1-1.2 1.2H17"/><path d="M7 12h6M7 15h3"/>'),
    mc1: svg('<path d="M4 5h16v10H9l-4 4v-4H4z"/><path d="M8 9h8M8 12h5"/>'),
    mc2: svg('<path d="M4 5.5A1.5 1.5 0 0 1 5.5 4H11v15H5.5A1.5 1.5 0 0 0 4 20.5z"/><path d="M20 5.5A1.5 1.5 0 0 0 18.5 4H13v15h5.5a1.5 1.5 0 0 1 1.5 1.5z"/>'),
    mc3: svg('<path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
    mc4: svg('<path d="M5 19l4.2-12h1.6L15 19"/><path d="M6.6 14.5h7.8"/><path d="M18 8v9M15.5 10.5 18 8l2.5 2.5"/>'),
    match: svg('<rect x="3" y="4" width="7" height="7" rx="1.6"/><rect x="14" y="13" width="7" height="7" rx="1.6"/><path d="M10 7.5h2.5a2 2 0 0 1 2 2v3.5M14 16.5h-2.5a2 2 0 0 1-2-2V11"/>'),
    rad: svg('<path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4z"/><path d="M16.5 13v7M13 16.5h7"/>'),
    diff: svg('<rect x="3" y="6" width="12" height="12" rx="2"/><rect x="9" y="3" width="12" height="12" rx="2" fill="currentColor" fill-opacity=".14"/>'),
    wrong: svg('<path d="M20 12a8 8 0 1 1-2.6-5.9"/><path d="M20 4v5h-5"/>'),
    test: svg('<rect x="5" y="4" width="14" height="17" rx="2.2"/><path d="M9 4V3h6v1"/><path d="M8.5 12.5l2.2 2.2 4.3-4.6"/><path d="M8.5 18h7"/>')
  };
  function modesFor(S) {
    const m = [
      { id: "flash", t: "Flashcard", d: "Lật thẻ: mặt trước là chữ, mặt sau đủ thông tin" },
      ...(S.tab === "jlpt" ? [{ id: "goi", t: "Flashcard theo gói", d: "Chia chữ thành gói 10 hoặc 20 chữ để học từng chút" }] : []),
      { id: "mc1", t: "Chữ → Hán Việt", d: "Nhìn chữ, chọn âm Hán Việt" },
      { id: "mc2", t: "Hán Việt + nghĩa → chữ", d: "Nhìn âm Hán Việt và nghĩa, chọn chữ" },
      { id: "mc3", t: "Cách đọc → chữ", d: "Nhìn cách đọc (On/Kun), chọn chữ" },
      { id: "mc4", t: "Chữ → cách đọc", d: "Nhìn chữ, chọn cách đọc On hoặc Kun" },
      { id: "match", t: "Ghép cặp", d: "Nối chữ với Hán Việt hoặc cách đọc" }];
    if (S.tab === "bo-thu") m.push({ id: "rad", t: "Chọn chữ chứa bộ thủ", d: "Chữ nào chứa bộ thủ X, và ngược lại" });
    if (S.tab === "gia-dinh") m.push({ id: "diff", t: "Phân biệt chữ giống nhau", d: "Chọn đúng chữ trong nhóm chữ gần giống" });
    const w = S.list.filter(r => P.wrong[r.k]).length;
    if (w) m.push({ id: "wrong", t: "Ôn " + w + " chữ hay sai", d: "Flashcard các chữ bạn từng chọn nhầm" });
    return m;
  }
  const href = (S, mode) => "#/" + (S.tab === "jlpt" ? "jlpt" : S.tab) + "/" + encodeURIComponent(S.id).replace(/%7E/g, "~") + (mode ? "/" + mode : "");
  function vScope(S) {
    const b = bestOf(S.key), kn = knownCount(S.list);
    CTX = S.list;
    const groups = S.groups || [{ title: "", list: S.list }];
    const best = b != null ? '<span class="mode__best">Cao nhất ' + b + "/20</span>" : "";
    main.innerHTML = hero(esc(S.title), esc(S.sub), pill("Số chữ", S.list.length) + pill("Đã thuộc", kn + "/" + S.list.length) + (b != null ? pill("Test tốt nhất", b + "/20") : "")) +
      '<div class="wrap"><a class="crumb" href="' + S.back + '">← ' + esc(TABS[S.tab].name) + "</a>" +
      '<h2 class="sec">Luyện tập <small>Chọn một cách ôn, chữ chọn sai sẽ được ghi nhớ để ôn lại</small></h2><div class="modes">' +
      modesFor(S).map((m, i) => '<a class="mode" style="--mh:var(--h' + (i % 6) + ')" href="' + href(S, m.id) + '"><span class="mode__ic">' + (ICO[m.id] || ICO.flash) + '</span><span class="mode__t"><b>' + m.t + "</b><small>" + m.d + '</small></span><span class="mode__go" aria-hidden="true">→</span></a>').join("") + "</div>" +
      '<h2 class="sec">Bài test <small>20 câu · 2 mondai như đề JLPT</small></h2><div class="modes modes--test"><a class="mode mode--test" href="' + href(S, "test") + '"><span class="mode__ic">' + ICO.test + '</span><span class="mode__t"><b>Làm bài test 20 câu</b><small>' + (S.tab === "gia-dinh" ? "Mondai 1: chọn cách đọc · Mondai 2: phân biệt chữ giống nhau" : "Mondai 1: chọn cách đọc · Mondai 2: chọn Kanji") + "</small>" + best + '</span><span class="mode__go" aria-hidden="true">→</span></a></div>' +
      '<h2 class="sec">Danh sách chữ <small>Bấm vào một chữ để xem nguồn gốc, bộ thủ, thứ tự nét và từ vựng</small></h2><div class="chips" style="margin-top:0">' + sortSeg() + '</div><div id="klists"></div></div>';
    const drawL = () => { $("#klists").innerHTML = groups.map(g => (g.title ? '<div class="lvhead"><span>' + esc(g.title) + "</span>" + (g.sub ? "<small>" + esc(g.sub) + "</small>" : "") + "<small>" + g.list.length + " chữ</small></div>" : "") + '<div class="ktiles">' + sortList(g.list).map(tile).join("") + "</div>").join(""); };
    drawL(); bindSort(drawL);
  }

  /* ---------- chọn nhiễu ---------- */
  function simOf(r) {
    if (r._sim) return r._sim;
    const s = new Set();
    (r.f || []).forEach(h => { const f = A.famBy[h]; if (f) f.recs.forEach(x => x !== r && s.add(x)); });
    shuffle((A.radK[r.r] || []).filter(x => x !== r && Math.abs(x.s - r.s) <= 1)).slice(0, 8).forEach(x => s.add(x));
    return r._sim = [...s];
  }
  function dpool(r, S, sim) {
    const s = shuffle(simOf(r)), sc = shuffle(S.list), lv = shuffle(A.lv[r.l]).slice(0, 60), rest = shuffle(A.all).slice(0, 220);
    const order = sim === 2 ? [...s, ...sc, ...lv, ...rest] : sim === 1 ? [...s.slice(0, 1), ...sc, ...s.slice(1), ...lv, ...rest] : [...sc, ...lv, ...rest];
    return order.filter(x => x !== r);
  }
  function pickD(r, S, sim, n, okf) {
    const out = [];
    for (const x of dpool(r, S, sim)) { if (okf(x) && !out.includes(x)) { out.push(x); if (out.length >= n) break; } }
    return out;
  }
  const mkOpts = (right, wrongs) => shuffle([right, ...wrongs]);
  const MONDAI = {
    1: { t: "問題1", d: "Chọn cách đọc đúng của chữ Hán được gạch chân." },
    2: { t: "問題2", d: "Chọn chữ Hán viết đúng cho cách đọc / ý nghĩa đã cho." }
  };

  /* ---------- các dạng câu hỏi ---------- */
  const radOpt = (n, ok) => ({ t: A.radN[n].hv, g: A.radN[n].g, rad: A.radN[n], ok: ok ? 1 : 0 });
  function qHV(r, S, sim) {
    const seen = new Set([r.hv]);
    const d = pickD(r, S, sim, 3, x => !seen.has(x.hv) && seen.add(x.hv));
    return { r, ask: "Âm Hán Việt của chữ này là gì?", big: '<span lang="ja">' + r.k + "</span>", opts: mkOpts({ t: r.hv, ok: 1, rec: r }, d.map(x => ({ t: x.hv, rec: x }))) };
  }
  function qKanjiFromHV(r, S, sim) {
    const d = pickD(r, S, sim, 3, x => x.hv !== r.hv || x.m !== r.m);
    return { r, ask: "Chữ Hán nào có âm Hán Việt và nghĩa dưới đây?", big: '<span class="vi">' + esc(r.hv) + " | " + esc(r.m) + "</span>", bigClass: "sm", opts: mkOpts({ t: r.k, jp: 1, ok: 1, rec: r }, d.map(x => ({ t: x.k, jp: 1, rec: x }))) };
  }
  function qRead(r, S, sim) {
    const all = items(r), it = rnd(all);
    const acc = new Set(all.filter(i => i.w === it.w).map(i => i.r));
    const used = new Set(acc), wr = [];
    for (const x of dpool(r, S, sim)) {
      const c = items(x).filter(i => i.t === it.t && !used.has(i.r));
      if (c.length) { const j = rnd(c); used.add(j.r); wr.push({ t: j.r, ja: 1, rec: x }); if (wr.length >= 3) break; }
    }
    return { r, ask: "Chọn cách đọc " + rtBadge(it.t) + " của chữ được gạch chân.", big: '<u lang="ja">' + esc(it.w) + "</u>", rt: it.t, opts: mkOpts({ t: it.r, ok: 1, ja: 1, rec: r }, wr) };
  }
  function qFromRead(r, S, sim, showHv) {
    const it = rnd(items(r)), used = new Set([it.w]), wr = [];
    for (const x of dpool(r, S, sim)) {
      if (items(x).some(i => i.r === it.r)) continue;
      const c = items(x).filter(i => i.t === it.t), j = rnd(c.length ? c : items(x));
      if (!j || used.has(j.w)) continue;
      used.add(j.w); wr.push({ t: j.w, jp: 1, rec: x }); if (wr.length >= 3) break;
    }
    return { r, ask: "Chữ Hán nào có cách đọc " + rtBadge(it.t) + " dưới đây?", big: '<span class="sm" lang="ja">' + esc(it.r) + "</span>", rt: it.t, vi: showHv ? r.hv + " · " + r.m : r.m, bigClass: "sm", opts: mkOpts({ t: it.w, jp: 1, ok: 1, rec: r }, wr) };
  }
  function qDiffFam(r, S) { const q = qKanjiFromHV(r, S, 2); q.ask = "Trong các chữ giống nhau, chữ nào có âm Hán Việt và nghĩa dưới đây?"; return q; }
  function qRadContains(n, S) {
    const rad = A.radN[n], own = A.radK[n];
    const inScope = own.filter(x => S.list.includes(x)), right = rnd(inScope.length ? inScope : own);
    const wr = shuffle(uniq([...S.list, ...shuffle(A.all).slice(0, 120)])).filter(x => !(x.rd || []).includes(n)).slice(0, 3);
    return { r: right, ask: "Chữ Hán nào có chứa bộ thủ này?", big: '<span lang="ja">' + esc(rad.g) + "</span>", vi: rad.hv + " · " + shortM(rad.m), opts: mkOpts({ t: right.k, jp: 1, ok: 1, rec: right }, wr.map(x => ({ t: x.k, jp: 1, rec: x }))) };
  }
  function qRadOf(r) {
    const mine = r.rd || [], ok = rnd(mine);
    const wr = shuffle(Object.keys(A.radN).map(Number).filter(n => A.radK[n].length && !mine.includes(n))).slice(0, 3);
    return { r, ask: "Chữ này chứa bộ thủ nào?", big: '<span lang="ja">' + r.k + "</span>", vi: r.hv + " · " + r.m, opts: mkOpts(radOpt(ok, 1), wr.map(n => radOpt(n, 0))) };
  }
  const targets = (S, n) => { let t = []; while (t.length < n) t = t.concat(shuffle(S.list)); return t.slice(0, n); };
  const practiceN = S => Math.min(20, Math.max(6, S.list.length * 2));

  /* ---------- bộ chạy trắc nghiệm ---------- */
  let KEYS = null, TIMERS = [];
  const clean = () => { KEYS = null; inQuiz = false; TIMERS.forEach(clearTimeout); TIMERS = []; };
  const rdOf = x => "On: " + esc(x.on.join("・") || "—") + " · Kun: " + esc(x.kun.join("・").replace(/\./g, "") || "—");
  function optInfo(q, chosen) {
    return '<div class="oinfo"><h5>Thông tin của cả 4 đáp án</h5>' + q.opts.map((op, n) => {
      const st = op.ok ? "oi--ok" : n === chosen ? "oi--bad" : "", tag = op.ok ? "Đáp án đúng" : n === chosen ? "Bạn đã chọn" : "";
      if (op.rec) { const x = op.rec; return '<div class="oi ' + st + '"><button type="button" class="oi__g" lang="ja" data-k="' + x.k + '">' + x.k + '</button><div class="oi__b"><b>' + esc(x.hv) + "</b> · " + esc(x.m) + "<br><small>" + rdOf(x) + " · " + LVN[x.l] + "</small></div>" + (tag ? '<span class="oi__tag">' + tag + "</span>" : "") + "</div>"; }
      if (op.rad) { const x = op.rad; return '<div class="oi ' + st + '"><span class="oi__g" lang="ja">' + esc(x.g) + '</span><div class="oi__b"><b>' + esc(x.hv) + "</b> · " + esc(x.m) + "<br><small>Bộ thủ số " + x.n + " · " + x.s + " nét</small></div>" + (tag ? '<span class="oi__tag">' + tag + "</span>" : "") + "</div>"; }
      return "";
    }).join("") + "</div>";
  }
  function runQuiz(S, qs, o) {
    const test = o.test; let i = 0, streak = 0; const ans = new Array(qs.length).fill(null), meta = [];
    inQuiz = true;
    const finish = () => {
      let sc = 0; const m = { 1: 0, 2: 0 }, mt = { 1: 0, 2: 0 }; const bad = [];
      qs.forEach((q, n) => { const ok = ans[n] != null && ans[n] >= 0 && q.opts[ans[n]].ok; if (q.m) { mt[q.m]++; if (ok) m[q.m]++; } if (ok) sc++; else bad.push(n); if (test) { if (ok) markRight(q.r); else markWrong(q.r); } });
      if (test) { const t = P.tests[S.key] || { n: 0 }; t.n++; t.last = sc; t.best = Math.max(t.best || 0, sc); P.tests[S.key] = t; saveP(); }
      inQuiz = false;
      KEYS = e => { if (e.key === "Enter") location.hash = href(S); };
      const pct = Math.round(100 * sc / qs.length);
      main.innerHTML = '<div class="stage"><div class="res">' + scoreRing(sc, qs.length) + '<div class="res__score">' + sc + "<small>/" + qs.length + "</small></div><p>" + (pct >= 90 ? "Xuất sắc! Bạn nắm chắc phần này." : pct >= 70 ? "Khá tốt. Ôn thêm vài chữ nữa là vững." : pct >= 50 ? "Tạm ổn, hãy xem lại các chữ sai bên dưới." : "Cần ôn lại. Hãy dùng flashcard rồi làm lại bài.") + "</p>" +
        (test ? '<div class="res__m"><div>問題1 · Cách đọc<b>' + m[1] + "/" + mt[1] + '</b></div><div>問題2 · ' + (S.tab === "gia-dinh" ? "Phân biệt chữ" : "Chọn Kanji") + "<b>" + m[2] + "/" + mt[2] + "</b></div></div>" : "") +
        '<div class="act" style="justify-content:center"><button class="btn btn--primary" type="button" data-again>Làm lại</button><a class="btn btn--ghost" href="' + href(S) + '">Về trang ' + esc(S.title) + "</a></div></div>" +
        (bad.length ? '<h2 class="sec">Các câu sai <small>' + bad.length + ' câu</small></h2><div class="wrong">' + bad.map(n => { const q = qs[n], r = q.r, right = q.opts.find(x => x.ok); return '<div class="wrong__i"><span class="g" lang="ja">' + r.k + '</span><p><b>' + esc(r.hv) + "</b> · " + esc(r.m) + '<br><small>Đáp án đúng: <b lang="ja">' + esc((right.g ? right.g + " " : "") + right.t) + "</b>" + (q.rt ? " (" + (q.rt === "on" ? "âm On" : "âm Kun") + ")" : "") + (ans[n] != null && ans[n] >= 0 ? " · Bạn chọn: " + esc(q.opts[ans[n]].t) : " · Bạn chưa trả lời") + '</small></p><button class="btn btn--ghost btn--sm" type="button" data-k="' + r.k + '">Xem chữ</button></div>'; }).join("") + "</div>" : "") + "</div>";
      CTX = uniq(bad.map(n => qs[n].r));
      if (o.after) o.after(sc, qs.length, main);
      $("[data-again]").onclick = () => o.again();
      afterDone(main, sc, qs.length);
    };
    const render = () => {
      const q = qs[i], done = ans[i] != null, nq = qs.length;
      const ok = done && ans[i] >= 0 && q.opts[ans[i]].ok, mt = meta[i] || {};
      const mhead = q.m ? '<span class="mond">' + MONDAI[q.m].t + " · " + (S.tab === "gia-dinh" && q.m === 2 ? "Phân biệt chữ giống nhau" : MONDAI[q.m].d) + "</span>" : "";
      main.innerHTML = '<div class="stage"><div class="sbar"><a class="x" href="' + href(S) + '">✕ Thoát</a><div class="bar"><i style="width:' + Math.round(100 * (i + (done && !test ? 1 : 0)) / nq) + '%"></i></div><span class="cnt">' + (i + 1) + "/" + nq + "</span></div>" +
        '<div class="q">' + mhead + (q.ask ? '<p class="q__ask">' + q.ask + "</p>" : "") + '<div class="q__big ' + (q.bigClass || "") + '">' + q.big + "</div>" + (q.rt ? '<div class="q__rt">' + rtPill(q.rt) + "</div>" : "") + (q.vi ? '<div class="q__vi">' + esc(q.vi) + "</div>" : "") +
        '<div class="opts">' + q.opts.map((op, n) => { let c = "opt" + (op.jp ? " is-jp" : ""); if (test) { if (ans[i] === n) c += " is-pick"; } else if (done) { if (op.ok) c += " is-right"; else if (ans[i] === n) c += " is-wrong"; } return '<button type="button" class="' + c + '" data-o="' + n + '"' + (done && !test ? " disabled" : "") + '><i>' + (n + 1) + "</i>" + (op.g ? '<span class="og" lang="ja">' + esc(op.g) + "</span>" : "") + "<span" + (op.ja ? ' lang="ja"' : "") + ">" + esc(op.t) + "</span></button>"; }).join("") + "</div>" +
        (!test && done ? '<div class="feedback ' + (ok ? "ok" : "no") + '" aria-live="polite">' + verdictHTML(ok, mt.word, mt.streak) + "</div>" + optInfo(q, ans[i]) : "") +
        "</div>" +
        (test ? '<div class="dots">' + qs.map((_, n) => '<i class="' + (ans[n] != null ? "on " : "") + (n === i ? "cur" : "") + '" data-d="' + n + '">' + (n + 1) + "</i>").join("") + '</div><div class="act"><button class="btn btn--ghost" type="button" data-prev ' + (i ? "" : "disabled") + '>← Câu trước</button>' + (i < nq - 1 ? '<button class="btn btn--primary" type="button" data-next>Câu sau →</button>' : '<button class="btn btn--coral" type="button" data-submit>Nộp bài</button>') + "</div>" :
          '<div class="act"><span></span>' + (done ? '<button class="btn btn--primary" type="button" data-next>' + (i < nq - 1 ? "Câu tiếp →" : "Xem kết quả") + "</button>" : '<button class="btn btn--ghost" type="button" data-skip>Bỏ qua</button>') + "</div>") + "</div>";
      $$("[data-o]").forEach(b => b.onclick = () => pick(+b.dataset.o));
      const nx = $("[data-next]"); if (nx) nx.onclick = next;
      const pv = $("[data-prev]"); if (pv) pv.onclick = () => { i--; render(); };
      const sm = $("[data-submit]"); if (sm) sm.onclick = () => { const un = ans.filter(a => a == null).length; if (un && !confirm("Còn " + un + " câu chưa trả lời. Vẫn nộp bài?")) return; finish(); };
      const sk = $("[data-skip]"); if (sk) sk.onclick = () => { ans[i] = -1; streak = 0; markWrong(q.r); next(); };
      $$("[data-d]").forEach(d => d.onclick = () => { i = +d.dataset.d; render(); });
      CTX = [q.r];
    };
    const pick = n => {
      if (!test && ans[i] != null) return;
      ans[i] = n;
      if (test) { render(); return; }
      const q = qs[i], ok = !!q.opts[n].ok;
      streak = ok ? streak + 1 : 0; meta[i] = { word: pickWord(ok), streak };
      if (ok) markRight(q.r); else markWrong(q.r);
      render();
      const el = $$("[data-o]")[n], card = $(".q");
      if (ok) { celebrate(el, streak > 0 && streak % 5 === 0); glow(card, true); } else { wobble(el); glow(card, false); buzz(); }
      const fb = $(".feedback"); if (fb) { fb.classList.remove("pop"); void fb.offsetWidth; fb.classList.add("pop"); }
      const nb = $("[data-next]"); if (nb) nb.focus({ preventScroll: true });
    };
    const next = () => { if (i < qs.length - 1) { i++; render(); } else finish(); };
    KEYS = e => {
      if (e.key >= "1" && e.key <= "4") { const n = +e.key - 1; if (qs[i] && qs[i].opts[n]) pick(n); }
      else if (e.key === "Enter" || e.key === " ") { if (ans[i] != null || test) { e.preventDefault(); if (test && i === qs.length - 1) return; next(); } }
      else if (test && e.key === "ArrowLeft" && i) { i--; render(); }
      else if (test && e.key === "ArrowRight" && i < qs.length - 1) { i++; render(); }
    };
    render();
  }
  const quizPage = (S, builder, o) => { const start = () => { const qs = builder(); runQuiz(S, qs, Object.assign({ again: start }, o || {})); }; start(); };

  function buildTest(S) {
    const sim = S.tab === "gia-dinh" ? 2 : 1;
    let pool = shuffle(S.list); const t1 = [], t2 = [];
    const take = () => { if (!pool.length) pool = shuffle(S.list); return pool.pop(); };
    for (let n = 0; n < 10; n++) t1.push(take());
    for (let n = 0; n < 10; n++) t2.push(take());
    const m2 = r => S.tab === "gia-dinh" ? qDiffFam(r, S) : (Math.random() < 0.8 ? qFromRead(r, S, sim, false) : qKanjiFromHV(r, S, sim));
    return [...t1.map(r => qRead(r, S, sim)), ...t2.map(m2)].map((q, n) => { q.m = n < 10 ? 1 : 2; return q; });
  }
  function vTest(S) { CTX = S.list; quizPage(S, () => buildTest(S), { test: true }); }
  function vMC(S, mode) {
    CTX = S.list;
    quizPage(S, () => targets(S, practiceN(S)).map(r => mode === "mc1" ? qHV(r, S, 1) : mode === "mc2" ? qKanjiFromHV(r, S, 1) : mode === "mc3" ? qFromRead(r, S, 1, false) : qRead(r, S, 1)));
  }
  function vRadMode(S) {
    CTX = S.list;
    const rads = S.rad ? [S.rad.n] : Object.keys(A.radN).map(Number).filter(n => A.radK[n].length >= 3);
    quizPage(S, () => targets(S, 20).map(r => {
      if (S.rad) return Math.random() < 0.75 ? qRadContains(S.rad.n, S) : qRadOf(r);
      const mine = (r.rd || []).filter(n => rads.includes(n));
      return Math.random() < 0.7 && mine.length ? qRadContains(rnd(mine), S) : qRadOf(r);
    }));
  }
  function vDiff(S) { CTX = S.list; quizPage(S, () => targets(S, practiceN(S)).map((r, n) => n % 2 ? qFromRead(r, S, 2, true) : qDiffFam(r, S))); }

  /* ---------- flashcard (lật thẻ 3D, vuốt, hiệu ứng như Super Goi) ---------- */
  const ICON_FLIP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/></svg>';
  let PACK = 10; try { PACK = +localStorage.getItem("honki:kanji:pack") === 20 ? 20 : 10; } catch (e) { /* bỏ qua */ }
  function vPacks(S) {
    const draw = () => {
      const n = PACK, groups = S.groups || [{ title: "", list: S.list }];
      const one = (idx) => { const ls = S.list.slice(idx * n, idx * n + n), kn = knownCount(ls); return '<a class="card card--pack' + (kn === ls.length ? " is-done" : "") + '" href="' + href(S, "flash") + "/" + n + "-" + (idx + 1) + '"><div class="card__top"><span class="card__no">' + (idx + 1) + '</span><span class="pill">' + ls.length + ' chữ</span></div><div class="card__glyphs" lang="ja">' + ls.map(r => r.k).join("") + "</div>" + bar(kn, ls.length) + "<p>Đã thuộc " + kn + "/" + ls.length + "</p></a>"; };
      const pos = new Map(S.list.map((r, i) => [r, i]));
      const html = groups.map(g => { const ids = uniq(g.list.map(r => Math.floor(pos.get(r) / n))); return (g.title ? '<div class="lvhead"><span>' + esc(g.title) + "</span><small>" + g.list.length + " chữ · " + ids.length + " gói</small></div>" : "") + '<div class="cards">' + ids.map(one).join("") + "</div>"; }).join("");
      $("#packs").innerHTML = html;
      $$("[data-pk]").forEach(b => b.setAttribute("aria-pressed", +b.dataset.pk === PACK));
      $("#packn").textContent = Math.ceil(S.list.length / n) + " gói";
    };
    main.innerHTML = hero("Flashcard theo gói · " + esc(S.title), "Chia " + S.list.length + " chữ thành các gói nhỏ để học từng chút. Học xong một gói thì chuyển sang gói tiếp theo.", pill("Số chữ", S.list.length) + pill("Đã thuộc", knownCount(S.list) + "/" + S.list.length)) +
      '<div class="wrap"><a class="crumb" href="' + href(S) + '">← ' + esc(S.title) + '</a><div class="chips"><span class="seg"><span class="seg__l">Mỗi gói</span><button type="button" data-pk="10">10 chữ</button><button type="button" data-pk="20">20 chữ</button></span><span class="pill" id="packn"></span></div><div id="packs"></div></div>';
    $$("[data-pk]").forEach(b => b.onclick = () => { PACK = +b.dataset.pk; try { localStorage.setItem("honki:kanji:pack", PACK); } catch (e) { /* bỏ qua */ } draw(); });
    draw();
  }
  function vFlash(S, wrongOnly) {
    const exit = S.exit || href(S);
    const base = wrongOnly ? S.list.filter(r => P.wrong[r.k]) : S.list;
    const opt = { shuffle: true, onlyNew: false };
    let queue = [], i = 0, flipped = false, seen = 0, ok = 0, swipedAt = -1e9;
    const init = () => {
      let l = base.slice(); if (opt.onlyNew) l = l.filter(r => !P.known[r.k]); if (opt.shuffle) l = shuffle(l);
      queue = l; i = 0; flipped = false; seen = 0; ok = 0; CTX = queue.slice(); render("");
    };
    const toolbar = () => '<div class="chips" style="margin:0 0 6px"><span class="seg"><button type="button" data-opt="shuffle" aria-pressed="' + opt.shuffle + '">Xáo trộn</button><button type="button" data-opt="order" aria-pressed="' + !opt.shuffle + '">Theo thứ tự</button></span><span class="seg"><button type="button" data-opt="all" aria-pressed="' + !opt.onlyNew + '">Tất cả</button><button type="button" data-opt="new" aria-pressed="' + opt.onlyNew + '">Chưa thuộc</button></span></div>';
    function render(dir) {
      if (i >= queue.length) {
        KEYS = e => { if (e.key === "Enter") init(); };
        main.innerHTML = '<div class="stage stage--wide"><div class="res">' + scoreRing(ok, seen || 1) + '<div class="res__score">' + ok + "<small>/" + seen + "</small></div><p>" + (queue.length ? "Bạn đã xem hết bộ thẻ. Những chữ chưa thuộc nằm trong phần “Chưa thuộc”." : "Không có thẻ nào để học ở chế độ này.") + '</p><div class="act" style="justify-content:center"><button class="btn btn--primary" type="button" data-again>Học lại</button><a class="btn btn--ghost" href="' + exit + '">Về ' + (S.exit ? "danh sách gói" : "trang " + esc(S.title)) + "</a></div></div></div>";
        $("[data-again]").onclick = init; afterDone(main, ok, seen || 1); return;
      }
      const r = queue[i], st = P.known[r.k] ? '<span class="state state--ok">Đã thuộc</span>' : P.wrong[r.k] ? '<span class="state state--rv">Cần ôn</span>' : "";
      main.innerHTML = '<div class="stage stage--wide">' + toolbar() + '<div class="sbar"><a class="x" href="' + href(S) + '">✕ Thoát</a><div class="bar"><i style="width:' + Math.round(100 * i / queue.length) + '%"></i></div><span class="cnt">' + (i + 1) + "/" + queue.length + "</span></div>" +
        '<div class="flip' + (flipped ? " is-flipped" : "") + (dir ? " deal-" + dir : "") + '"><div class="flip__inner">' +
        '<div class="kcard"><div class="card__face front" data-flip tabindex="0" role="button" aria-label="Lật thẻ"><div class="card__top"><span class="tag tag--lv">' + LVN[r.l] + "</span>" + st + '<span class="card__num">' + String(i + 1).padStart(3, "0") + " <small>/ " + queue.length + '</small></span></div><div class="card__main"><div class="fglyph" lang="ja">' + r.k + '</div></div><div class="card__actions"><button class="icon-btn" type="button" data-flip>' + ICON_FLIP + " Lật thẻ</button></div></div></div>" +
        '<div class="kcard"><div class="card__face back" tabindex="-1">' + detailHTML(r, true) + '<p class="back-hint">Chạm vào chỗ trống để lật lại · vuốt trái/phải để đổi thẻ</p></div></div></div></div>' +
        '<div class="ctl"><button class="btn btn--coral" type="button" data-act="no">↺ Chưa thuộc</button><button class="nav-btn" type="button" data-act="prev" aria-label="Thẻ trước">‹</button><button class="nav-btn" type="button" data-act="next" aria-label="Thẻ sau">›</button><button class="btn btn--primary" type="button" data-act="ok">✓ Đã thuộc</button></div>' +
        '<p class="kbd-hint"><kbd>Space</kbd> lật thẻ · <kbd>←</kbd><kbd>→</kbd> chuyển thẻ · <kbd>1</kbd> chưa thuộc · <kbd>2</kbd> đã thuộc</p><p class="swipe-hint" aria-hidden="true"><span>‹</span> Vuốt phải: thẻ trước · Vuốt trái: thẻ sau <span>›</span></p></div>';
      $$("[data-opt]").forEach(b => b.onclick = () => { const v = b.dataset.opt; if (v === "shuffle") opt.shuffle = true; else if (v === "order") opt.shuffle = false; else opt.onlyNew = v === "new"; init(); });
      $$("[data-flip]").forEach(el => el.addEventListener("click", ev => { ev.stopPropagation(); if (performance.now() - swipedAt < 400) return; turn(); }));
      $$("[data-act]").forEach(b => b.onclick = () => act(b.dataset.act));
      const back = $(".card__face.back"); fillStrokes(back); fillWords(back);
      const loc = back.querySelector(".kd__loc");
      if (loc) loc.onclick = ev => { ev.stopPropagation(); const more = back.querySelector(".kd__more"), open = more.hidden; more.hidden = !open; loc.setAttribute("aria-expanded", open); loc.classList.toggle("is-open", open); if (open) setTimeout(() => more.scrollIntoView({ block: "nearest", behavior: calm() ? "auto" : "smooth" }), 30); };
      back.addEventListener("click", ev => { if (ev.target.closest("button,a,input,[data-k],[data-comp],[data-say],.part,.kd__more table,.kd__loc")) return; if (performance.now() - swipedAt < 400) return; turn(); });
      bindSwipe();
    }
    const turn = () => { flipped = !flipped; const f = $(".flip"); f.classList.remove("deal-next", "deal-prev"); f.classList.toggle("is-flipped", flipped); const b = $(".card__face.back"); if (b) b.scrollTop = 0; };
    function act(a) {
      const r = queue[i];
      if (a === "prev") { if (i > 0) { i--; flipped = false; render("prev"); } return; }
      if (a === "next") { i++; flipped = false; render("next"); return; }
      seen++;
      if (a === "ok") { setKnown(r.k, true); ok++; markRight(r); } else { setKnown(r.k, false); markWrong(r); queue.splice(Math.min(queue.length, i + 6), 0, r); }
      i++; flipped = false; render("next");
    }
    function bindSwipe() {
      const f = $(".flip"); if (!f) return;
      let pid = null, sx = 0, sy = 0, dx = 0, t0 = 0, axis = null;
      const reset = anim => { f.style.transition = anim ? "transform .22s cubic-bezier(.2,.8,.3,1), opacity .22s" : ""; f.style.transform = ""; f.style.opacity = ""; if (anim) setTimeout(() => { f.style.transition = ""; }, 240); };
      f.addEventListener("pointerdown", ev => { if (pid !== null || (ev.pointerType === "mouse" && ev.button !== 0)) return; if (ev.target.closest("button,a,input,[data-k],[data-comp],.part")) return; pid = ev.pointerId; sx = ev.clientX; sy = ev.clientY; dx = 0; t0 = performance.now(); axis = null; });
      f.addEventListener("pointermove", ev => {
        if (ev.pointerId !== pid) return;
        const mx = ev.clientX - sx, my = ev.clientY - sy;
        if (!axis) { if (Math.abs(mx) < 8 && Math.abs(my) < 8) return; axis = Math.abs(mx) > Math.abs(my) * 1.2 ? "x" : "y"; if (axis === "x") { try { f.setPointerCapture(pid); } catch (e) { /* bỏ qua */ } } }
        if (axis !== "x") return;
        dx = mx; const lim = Math.min(Math.abs(dx), 140) * Math.sign(dx);
        f.style.transition = "none"; f.style.transform = "translateX(" + dx + "px) rotate(" + Math.max(-8, Math.min(8, lim / 18)) + "deg)"; f.style.opacity = String(1 - Math.min(Math.abs(dx) / 420, .45));
      });
      const finish = ev => {
        if (ev.pointerId !== pid) return;
        const was = axis; pid = null; axis = null; if (was !== "x") return;
        swipedAt = performance.now();
        const v = Math.abs(dx) / Math.max(1, performance.now() - t0), far = Math.abs(dx) > Math.min(90, f.offsetWidth * .2) || (Math.abs(dx) > 36 && v > .5);
        if (ev.type === "pointercancel" || !far) return reset(true);
        const dir = dx < 0 ? "next" : "prev";
        if (calm()) { reset(false); return act(dir); }
        f.style.transition = "transform .16s ease-in, opacity .16s"; f.style.transform = "translateX(" + (dx < 0 ? "-" : "") + Math.max(f.offsetWidth, 280) + "px) rotate(" + (dx < 0 ? -10 : 10) + "deg)"; f.style.opacity = "0";
        setTimeout(() => act(dir), 150);
      };
      f.addEventListener("pointerup", finish); f.addEventListener("pointercancel", finish);
    }
    KEYS = e => {
      if (i >= queue.length) return;
      if (e.key === " " || e.key === "Enter") { e.preventDefault(); turn(); }
      else if (e.key === "ArrowRight") act("next"); else if (e.key === "ArrowLeft") act("prev");
      else if (e.key === "1") act("no"); else if (e.key === "2") act("ok");
    };
    init();
  }

  /* ---------- ghép cặp ---------- */
  function vMatch(S) {
    CTX = S.list; let kind = "hv"; let order, round, sel, pairs, t0, errs, total;
    const init = () => { order = shuffle(S.list); round = 0; total = 0; errs = 0; t0 = Date.now(); nextRound(); };
    const label = (r, used) => { if (kind === "hv") return r.hv + (shortM(r.m) ? "\n" + shortM(r.m) : ""); const its = items(r), free = its.filter(i => !used.has(i.r)), it = rnd(free.length ? free : its); used.add(it.r); return it.r; };
    const nextRound = () => {
      const chunk = order.slice(round * 6, round * 6 + 6);
      if (!chunk.length) return end();
      const used = new Set(); pairs = chunk.map(r => ({ r, lab: label(r, used), done: false })); sel = null; draw();
    };
    const end = () => {
      KEYS = e => { if (e.key === "Enter") init(); };
      const sec = Math.round((Date.now() - t0) / 1000);
      main.innerHTML = '<div class="stage"><div class="res"><div class="res__score">' + total + "<small> cặp</small></div><p>Hoàn thành sau " + sec + " giây với " + errs + " lần ghép sai.</p><div class=\"act\" style=\"justify-content:center\"><button class=\"btn btn--primary\" type=\"button\" data-again>Chơi lại</button><a class=\"btn btn--ghost\" href=\"" + href(S) + "\">Về trang " + esc(S.title) + "</a></div></div></div>";
      $("[data-again]").onclick = init;
    };
    const draw = () => {
      const right = shuffle(pairs);
      const nR = Math.ceil(order.length / 6);
      main.innerHTML = '<div class="stage stage--wide"><div class="sbar"><a class="x" href="' + href(S) + '">✕ Thoát</a><div class="bar"><i style="width:' + Math.round(100 * round / nR) + '%"></i></div><span class="cnt">Vòng ' + (round + 1) + "/" + nR + '</span></div><div class="chips" style="margin:0 0 6px"><span class="seg"><button type="button" data-kind="hv" aria-pressed="' + (kind === "hv") + '">Chữ ↔ Hán Việt</button><button type="button" data-kind="rd" aria-pressed="' + (kind === "rd") + '">Chữ ↔ Cách đọc</button></span></div>' +
        '<div class="match"><div class="mcol">' + pairs.map(p => '<button type="button" class="mt jp' + (p.done ? " is-done" : "") + '" data-l="' + p.r.k + '" lang="ja">' + p.r.k + "</button>").join("") + '</div><div class="mcol">' + right.map(p => '<button type="button" class="mt' + (p.done ? " is-done" : "") + '" data-r="' + p.r.k + '"' + (kind === "rd" ? ' lang="ja"' : "") + ">" + esc(p.lab).replace(/\n/g, "<br><small style='font-weight:500;color:var(--muted)'>") + (p.lab.includes("\n") ? "</small>" : "") + "</button>").join("") + "</div></div></div>";
      $$("[data-kind]").forEach(b => b.onclick = () => { kind = b.dataset.kind; init(); });
      const L = $$("[data-l]"), R = $$("[data-r]");
      let a = null, b = null;
      const check = () => {
        if (!a || !b) return;
        const labOf = k => pairs.find(p => p.r.k === k).lab;
        if (a.dataset.l === b.dataset.r || labOf(a.dataset.l) === labOf(b.dataset.r)) {
          a.classList.add("is-done"); b.classList.add("is-done"); a.classList.remove("is-sel"); b.classList.remove("is-sel"); total++;
          pairs.find(p => p.r.k === a.dataset.l).done = true; $$("[data-r]").forEach(el => { if (el === b) return; }); markRight(A.by[a.dataset.l]);
          a = b = null;
          if (pairs.every(p => p.done)) { round++; TIMERS.push(setTimeout(nextRound, 450)); }
        } else {
          errs++; markWrong(A.by[a.dataset.l]); const x = a, y = b; a = b = null;
          x.classList.add("is-no"); y.classList.add("is-no");
          TIMERS.push(setTimeout(() => { x.classList.remove("is-no", "is-sel"); y.classList.remove("is-no", "is-sel"); }, 380));
        }
      };
      L.forEach(el => el.onclick = () => { if (a) a.classList.remove("is-sel"); a = el; el.classList.add("is-sel"); check(); });
      R.forEach(el => el.onclick = () => { if (b) b.classList.remove("is-sel"); b = el; el.classList.add("is-sel"); check(); });
    };
    KEYS = null; init();
  }

  /* ---------- lý thuyết (Huyền Lục Thư) ---------- */
  const TH = { p: null };
  function vTheory(id) {
    main.innerHTML = '<div class="wrap"><p class="empty">Đang tải bài viết…</p></div>';
    (TH.p = TH.p || loadScript("data/theory.js")).then(() => {
      const T = K.T; if (!T) { main.innerHTML = '<div class="wrap"><p class="empty">Không tải được nội dung lý thuyết.</p></div>'; return; }
      const idx = T.arts.findIndex(a => a.id === id);
      if (idx < 0) {
        document.title = "Super Kanji — Lý thuyết";
        main.innerHTML = hero("Lý thuyết học Kanji", "Phương pháp học Kanji bằng Lục thư cải tiến, trích từ sách “" + esc(T.book) + "” của " + esc(T.authors) + ".", pill("Số bài", T.arts.length)) +
          '<div class="wrap"><div class="cards theory">' + T.arts.map((a, n) => '<a class="card card--th" href="#/ly-thuyet/' + a.id + '"><span class="th__n">' + String(n + 1).padStart(2, "0") + "</span><h3>" + esc(a.t) + "</h3><p>" + esc(a.d) + '</p><small class="th__by">' + esc(T.by) + "</small></a>").join("") + "</div></div>";
        return;
      }
      const a = T.arts[idx], pv = T.arts[idx - 1], nx = T.arts[idx + 1];
      document.title = "Super Kanji — " + a.t;
      main.innerHTML = '<article class="theory-art wrap"><a class="crumb" href="#/ly-thuyet">← Lý thuyết</a><header><span class="th__kicker">' + esc(T.book) + ' · Bài ' + (idx + 1) + "/" + T.arts.length + "</span><h1>" + esc(a.t) + '</h1><p class="th__byline">' + esc(T.by) + '</p></header><div class="th__toc-slot"></div><div class="th__body">' + a.h + '</div><button type="button" class="th__top" hidden>↑ Mục lục</button><footer class="th__foot"><p class="th__sign">— ' + esc(T.sign) + '</p><div class="act">' + (pv ? '<a class="btn btn--ghost" href="#/ly-thuyet/' + pv.id + '">← ' + esc(pv.t) + "</a>" : "<span></span>") + (nx ? '<a class="btn btn--primary" href="#/ly-thuyet/' + nx.id + '">' + esc(nx.t) + " →</a>" : "") + "</div></footer></article>";
      const hs = $$(".th__body h3, .th__body h4");
      if (hs.length > 2) {
        hs.forEach((h, n) => { h.id = "m" + n; h.classList.add("th__h"); });
        let html = "", open = false;
        hs.forEach(h => {
          const sub = h.tagName === "H4", ln = '<a href="#/ly-thuyet/' + a.id + '" data-to="' + h.id + '">' + esc(h.textContent.replace(/:\s*$/, "")) + "</a>";
          if (!sub) { if (open) html += "</ol></li>"; html += "<li>" + ln + "<ol>"; open = true; }
          else { if (!open) { html += "<li><ol>"; open = true; } html += "<li>" + ln + "</li>"; }
        });
        if (open) html += "</ol></li>";
        $(".th__toc-slot").outerHTML = '<nav class="th__toc" id="th-toc" aria-label="Mục lục"><b>Mục lục</b><ol class="th__tl">' + html + "</ol></nav>";
        const toTop = $(".th__top"), nav = $("#th-toc");
        $$("[data-to]").forEach(l => l.onclick = ev => { ev.preventDefault(); const t = document.getElementById(l.dataset.to); if (t) { t.scrollIntoView({ behavior: calm() ? "auto" : "smooth", block: "start" }); t.classList.remove("flash"); void t.offsetWidth; t.classList.add("flash"); } });
        toTop.onclick = () => nav.scrollIntoView({ behavior: calm() ? "auto" : "smooth", block: "start" });
        const onS = () => { if (!nav.isConnected) { window.removeEventListener("scroll", onS); return; } toTop.hidden = nav.getBoundingClientRect().bottom > 0; };
        window.addEventListener("scroll", onS, { passive: true }); onS();
      }
    });
  }

  /* ---------- định tuyến ---------- */
  function route() {
    clean();
    if (dlg.open) dlg.close();
    const raw = location.hash.replace(/^#\/?/, ""); const [pathPart, qs] = raw.split("?"); const seg = pathPart.split("/").filter(Boolean).map(decodeURIComponent);
    const params = new URLSearchParams(qs || "");
    let tab = seg[0] || "jlpt"; if (!TABS[tab]) tab = "jlpt";
    setNav(tab); window.scrollTo(0, 0);
    const id = seg[1], mode = seg[2];
    document.title = "Super Kanji — " + TABS[tab].name;
    if (tab === "dau-vao") return id ? vPlaceLv(id) : vPlace();
    if (tab === "tim-kiem") return vSearch(params.get("q") || "");
    if (tab === "ly-thuyet") return vTheory(id);
    if (!id) { if (tab === "jlpt") vJlpt(); else if (tab === "gia-dinh") vFam(); else if (tab === "giao-trinh") vBook(params.get("l")); else vRad(); return; }
    const S = getScope(tab, id);
    if (!S || !S.list.length) { main.innerHTML = '<div class="wrap"><p class="empty">Không tìm thấy phạm vi này. <a href="' + TABS[tab].hash + '">Quay lại</a></p></div>'; return; }
    if (!mode) return vScope(S);
    document.title = "Super Kanji — " + S.title;
    if (mode === "goi") return vPacks(S);
    if (mode === "flash" && seg[3]) {
      const m = /^(10|20)-(\d+)$/.exec(seg[3]), n = m && +m[1], q = m && +m[2] - 1, ls = m ? S.list.slice(q * n, q * n + n) : [];
      if (ls.length) { const S2 = Object.assign({}, S, { list: ls, title: S.title + " · Gói " + (q + 1), exit: href(S, "goi"), groups: null }); document.title = "Super Kanji — " + S2.title; return vFlash(S2); }
      return vPacks(S);
    }
    if (mode === "flash") return vFlash(S);
    if (mode === "wrong") return vFlash(S, true);
    if (/^mc[1-4]$/.test(mode)) return vMC(S, mode);
    if (mode === "match") return vMatch(S);
    if (mode === "rad") return vRadMode(S);
    if (mode === "diff") return vDiff(S);
    if (mode === "test") return vTest(S);
    vScope(S);
  }
  window.addEventListener("hashchange", route);
  document.addEventListener("keydown", e => {
    if (dlg.open) { if (e.key === "ArrowLeft") stepK(-1); else if (e.key === "ArrowRight") stepK(1); return; }
    if (e.target.closest && e.target.closest("input,textarea,select")) return;
    if (KEYS) KEYS(e);
  });

  route();
})();
