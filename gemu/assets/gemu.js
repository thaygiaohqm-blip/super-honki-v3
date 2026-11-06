/* Super Gemu — 5 trò chơi: Hãy chọn chữ đúng, Nhanh như chớp, Đoán chữ Kanji, Vua tốc độ, Nối từ */
(() => {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s), $$ = (s, r) => [...(r || document).querySelectorAll(s)];
  const main = $("#main");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const LVN = { 5: "N5", 4: "N4", 3: "N3", 2: "N2", 1: "N1" }, LEVELS = [5, 4, 3, 2, 1];

  const GAMES = {
    chon: { name: "Hãy chọn chữ đúng", icon: "🎴", short: "Lật từng ô chữ bằng cách trả lời câu hỏi, rồi gõ cả câu.", rules: "Một câu tiếng Nhật được úp thành các ô. Chọn một ô, trả lời đúng câu hỏi Kanji, từ vựng hoặc ngữ pháp để lật ô đó (15 giây; câu ngữ pháp được 20 giây). Sau khi lật, đáp án chi tiết của câu vừa rồi vẫn hiện cho đến khi bạn chọn ô tiếp theo. Khi đoán được câu, hãy gõ cả câu vào ô trả lời. Đoán đúng sau 1–3 ô: 50 điểm; sau 4–6 ô: 30 điểm; trên 6 ô: 20 điểm. Mỗi lượt chơi có 3 câu, đoán sai quá 3 lần thì mất điểm câu đó." },
    chop: { name: "Nhanh như chớp", icon: "⚡", short: "90 giây, trả lời đúng liên tiếp càng nhiều càng tốt.", rules: "Trong 1 phút 30 giây, hãy trả lời liên tiếp các câu hỏi. Mỗi câu đúng liên tiếp được 10 điểm (5 câu liên tiếp = 50 điểm). Trả lời sai là chuỗi bị cắt về 0. Điểm của bạn là chuỗi đúng liên tiếp dài nhất. Chơi xong, toàn bộ các câu đã trả lời được hiện lại để bạn ôn." },
    doan: { name: "Đoán chữ Kanji", icon: "🔍", short: "Trả lời câu hỏi để nhận gợi ý, rồi gõ chữ Kanji bí ẩn.", rules: "Một chữ Kanji bí ẩn được giấu đi. Mỗi lần trả lời đúng một câu hỏi, bạn nhận một gợi ý (số nét, bộ thủ, chữ cái đầu Hán Việt, nghĩa, âm on, âm kun…). Gõ chữ Kanji vào ô trả lời bất cứ lúc nào. Đoán đúng khi dùng 1–3 gợi ý: 50 điểm; 4–6 gợi ý: 30 điểm; từ 7 gợi ý: 20 điểm (chưa dùng gợi ý cũng được 50). Mỗi lượt 3 chữ, đoán sai 3 lần thì mất chữ đó." },
    vua: { name: "Vua tốc độ", icon: "👑", short: "90 giây, trả lời được bao nhiêu câu đúng cũng tính điểm.", rules: "Trong 1 phút 30 giây, hãy trả lời càng nhiều câu càng tốt. Mỗi câu đúng được 10 điểm; câu sai không bị trừ điểm nhưng bạn mất thời gian. Chơi xong, toàn bộ câu đã trả lời được hiện lại để ôn." },
    noi: { name: "Nối từ", icon: "🔗", short: "Từ hai người trở lên: nối từ bằng chữ cuối của từ trước.", rules: "Chơi từ 2 đến 6 người. Người trước nói một từ, người sau phải nói từ bắt đầu bằng chữ kết thúc của từ đó, gõ đáp án trong 30 giây. Động từ không tính đuôi る (たべる → từ tiếp theo bắt đầu bằng べ), tính từ không tính đuôi い／な. Từ phải có trong từ vựng Super Goi của cấp đã chọn, không được lặp từ, từ kết thúc bằng ん thì người nói bị loại. Hết giờ cũng bị loại. Hai người: thắng được 10 điểm. Nhiều người: người bị loại thứ n được 10×(n−1) điểm, người thắng chung cuộc được 10×(số đối thủ). Điểm cộng dồn vào bảng xếp hạng." }
  };
  const GK = ["chon", "chop", "doan", "vua", "noi"];
  const gameHead = g => { const G = GAMES[g]; return '<div class="ghead"><div class="ghead__t"><span class="ghead__ic" aria-hidden="true">' + G.icon + "</span><h1>" + G.name + '</h1></div><p class="ghead__r is-clamp">' + G.rules + '</p><button type="button" class="ghead__b" data-rules>Xem đủ luật ▾</button></div>'; };
  document.addEventListener("click", e => { const b = e.target.closest && e.target.closest("[data-rules]"); if (!b) return; const o = b.previousElementSibling.classList.toggle("is-clamp"); b.textContent = o ? "Xem đủ luật ▾" : "Thu gọn ▴"; });
  const HL = {};
  function hudSet(el, key, html) {
    if (!el) return; el.innerHTML = html; const last = HL[key] = HL[key] || {};
    $$("[data-sc]", el).forEach(p => {
      const id = p.dataset.sc, v = +p.querySelector("b").textContent, o = last[id];
      if (o !== undefined && v !== o) { p.classList.add(v > o ? "pop" : "drop"); if (v > o && p.dataset.plus) { const e = document.createElement("em"); e.className = "plus"; e.textContent = "+" + (v - o); p.appendChild(e); } }
      last[id] = v;
    });
  }
  const scp = (label, v, id, plus, cls) => '<span class="pill pill--sc ' + (cls || "") + '" data-sc="' + id + '"' + (plus ? ' data-plus="1"' : "") + ">" + label + " <b>" + v + "</b></span>";
  function countUp(el, v) { if (!el) return; const t0 = performance.now(), D = Math.min(1400, 300 + v * 8); const f = t => { const k = Math.min(1, (t - t0) / D); el.textContent = Math.round(v * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(f); }; el.textContent = "0"; requestAnimationFrame(f); }

  /* ---------- tiện ích ---------- */
  const mulberry = a => () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
  const pick = (a, r) => a[Math.floor(r() * a.length)];
  const shuf = (a, r) => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const uniq = a => [...new Set(a)];
  const sess = () => { try { const a = JSON.parse(localStorage.getItem("honki:auth") || "null"); return a && a.mode === "remote" && a.token ? a : null; } catch (e) { return null; } };
  const myName = () => { const a = sess(); return a ? (a.name || (a.email || "").split("@")[0]) : ""; };
  const api = async (method, body, qs) => {
    const a = sess(); const h = { "Content-Type": "application/json" }; if (a) h.Authorization = "Bearer " + a.token;
    try { const r = await fetch("/api/gemu" + (qs || ""), { method, cache: "no-store", headers: h, body: body ? JSON.stringify(body) : undefined }); const j = await r.json().catch(() => ({})); return Object.assign({ _ok: r.ok, _st: r.status }, j); } catch (e) { return { _ok: false, _st: 0, error: "Không kết nối được máy chủ." }; }
  };
  const timers = []; let KEYS = null;
  const later = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const every = (fn, ms) => { const t = setInterval(fn, ms); timers.push(t); return t; };
  const stopAll = () => { while (timers.length) { const t = timers.pop(); clearTimeout(t); clearInterval(t); } KEYS = null; };
  document.addEventListener("keydown", e => { if (KEYS && !(e.target.closest && e.target.closest("input,textarea"))) KEYS(e); });
  const strip = s => String(s || "").replace(/\[[^\]]*\]/g, "").replace(/[{}]/g, "");
  const norm = s => String(s || "").normalize("NFKC").replace(/[\s。、！？!?.,，．「」『』（）()・〜~…]/g, "");
  const toHira = s => String(s || "").replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));
  const radical = n => n >= 1 && n <= 214 ? String.fromCodePoint(0x2F00 + n - 1) : "";

  /* ---------- hiệu ứng ---------- */
  const COLORS = ["#ed3838", "#27c4b5", "#f4c542", "#7a5cff", "#ff8a3d", "#3ddc84"];
  function burst(host, ok, label) {
    if (!host) return; host.classList.remove("fx-ok", "fx-no"); void host.offsetWidth; host.classList.add(ok ? "fx-ok" : "fx-no");
    const layer = document.createElement("div"); layer.className = "fxl";
    if (ok) for (let i = 0; i < 44; i++) { const p = document.createElement("i"); const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 200; p.style.cssText = "--x:" + Math.cos(a) * d + "px;--y:" + (Math.sin(a) * d - 60) + "px;--r:" + Math.floor(Math.random() * 720 - 360) + "deg;background:" + COLORS[i % COLORS.length] + ";animation-delay:" + Math.random() * 120 + "ms"; layer.appendChild(p); }
    const st = document.createElement("div"); st.className = "fxs " + (ok ? "ok" : "no"); st.textContent = label || (ok ? "Chính xác!" : "Chưa chính xác"); if (label === " ") st.dataset.e = 1; layer.appendChild(st);
    host.appendChild(layer); setTimeout(() => layer.remove(), 1700);
  }

  /* ---------- tải dữ liệu theo cấp ---------- */
  const DATA = {}, VDATA = {};
  const loadJs = src => new Promise(res => { const s = document.createElement("script"); s.src = src; s.onload = () => res(true); s.onerror = () => res(false); document.head.appendChild(s); });
  let cur = {};
  window.KANJI = { L: {}, S: {}, M: null, add(l, a) { cur.k = a; }, meta() {}, strokes() {}, words() {} };
  window.MD = { register(d) { cur.v = d; }, registerBooks() {} };
  window.SB = { register(d) { cur.g = d; }, exData() {}, theSent() {} };
  let chain = Promise.resolve(); const serial = fn => (chain = chain.then(fn, fn));
  const vocabOf = d => { const V = []; ((d && d.topics) || []).forEach(t => t.items.forEach(it => { if (it.vi && it.w) V.push({ w: strip(it.w).replace(/\s+/g, ""), r: strip(it.r || "").replace(/\s+/g, ""), vi: it.vi, p: it.p || "", hv: it.hv || "" }); })); return V; };
  const loadVerbq = () => window.GEMU_VERBQ ? Promise.resolve() : loadJs("assets/verbq.js");
  const loadLevel = l => DATA[l] ? Promise.resolve(DATA[l]) : serial(async () => {
    if (DATA[l]) return DATA[l];
    const d = {}; await loadVerbq();
    for (const [key, src] of [["k", "../kanji/data/k" + l + ".js"], ["v", "../goi/data/n" + l + ".js"], ["g", "../bunpou/data/gram-n" + l + ".js"]]) { cur = {}; await loadJs(src); d[key] = cur[key]; }
    const K = (d.k || []).filter(r => r.hv && r.hv !== "—" && (r.on.length || r.kun.length) && r.m);
    const V = vocabOf(d.v); VDATA[l] = V;
    const G = [], S = [], CL = [];
    ((d.g && d.g.pats) || []).forEach(p => (p.senses || []).forEach(sn => (sn.ex || []).forEach(ex => {
      const m = /\{([^}]*)\}/.exec(ex.ja || ""); const plain = strip(ex.ja).replace(/\s+/g, "");
      if (m) { const cl = strip(m[1]); if (cl && cl.length <= 16) { CL.push(cl); G.push({ s: strip((ex.ja || "").replace(/\{[^}]*\}/, "（＿＿）")), full: strip(ex.ja), cl, vi: ex.vi || "", pat: strip(p.pat), mean: p.mean || "" }); } }
      if (plain.length >= 8 && plain.length <= 22 && !/[A-Za-z0-9]/.test(plain)) S.push({ t: plain, vi: ex.vi || "" });
    })));
    const VB = (window.GEMU_VERBQ || []).filter(x => x.lv === l);
    return DATA[l] = { K, V, G, S, VB, CL: uniq(CL), l };
  });
  const loadVocabUpTo = l => serial(async () => { const out = []; for (let k = 5; k >= l; k--) { if (!VDATA[k]) { cur = {}; await loadJs("../goi/data/n" + k + ".js"); VDATA[k] = vocabOf(cur.v); } out.push(...VDATA[k]); } return out; });

  /* ---------- tạo câu hỏi (kèm thông tin chi tiết) ---------- */
  const kana = r => { const o = r.on.concat(r.kun.filter(x => !/^-|-$/.test(x))); return uniq((o.length ? o : r.kun).map(x => String(x).replace(/[-]/g, "").replace(".", ""))); };
  const opts4 = (ok, pool, r) => { const bad = shuf(uniq(pool).filter(x => x !== ok), r).slice(0, 3); if (bad.length < 3) return null; return shuf([{ t: ok, ok: 1 }, ...bad.map(t => ({ t }))], r); };
  const infoK = k => '<div class="inf"><b class="inf__k" lang="ja">' + k.k + '</b><div><b>' + esc(k.hv) + "</b> | " + esc(k.m) + "<br>Âm On: " + esc(k.on.join("、") || "—") + " · Âm Kun: " + esc(k.kun.join("、") || "—") + " · " + k.s + " nét</div></div>";
  const infoV = v => '<div class="inf"><b class="inf__k sm" lang="ja">' + esc(v.w) + '</b><div>Cách đọc: <b lang="ja">' + esc(v.r || v.w) + "</b> · " + esc(v.vi) + (v.hv ? "<br>Hán Việt: " + esc(v.hv) : "") + "</div></div>";
  const hl = (full, cl) => esc(full).replace(esc(cl), "<mark>" + esc(cl) + "</mark>");
  function genQ(D, r) {
    for (let tries = 0; tries < 40; tries++) {
      const x = r(), kind = x < .33 ? "k" : x < .63 ? "v" : x < .85 ? "g" : "b", y = r();
      if (kind === "k" && D.K.length > 5) {
        const k = pick(D.K, r), info = infoK(k);
        if (y < .34) { const o = opts4(k.hv, D.K.map(z => z.hv), r); if (o) return { ask: "Âm Hán Việt của chữ này là gì?", big: k.k, o, tag: "Kanji", info }; }
        else if (y < .67) { const o = opts4(k.k, D.K.map(z => z.k), r); if (o) return { ask: "Chọn chữ Kanji đúng với nghĩa", big: esc(k.hv) + " | " + esc(k.m.slice(0, 40)), sm: 1, vn: 1, o: o.map(z => Object.assign(z, { jp: 1 })), tag: "Kanji", info }; }
        else { const ks = kana(k), ok = pick(ks, r), mine = new Set(ks), o = opts4(ok, D.K.flatMap(z => kana(z)).filter(z => !mine.has(z)), r); if (o) return { ask: "Chữ này có thể đọc là gì?", big: k.k, o, tag: "Kanji", info }; }
      } else if (kind === "v" && D.V.length > 5) {
        const v = pick(D.V, r), info = infoV(v);
        if (y < .45) { const o = opts4(v.vi, D.V.map(z => z.vi), r); if (o) return { ask: "Nghĩa của từ này là gì?", big: v.w, sm: 1, o, tag: "Từ vựng", info }; }
        else if (y < .75 && v.r && v.r !== v.w) { const o = opts4(v.r, D.V.map(z => z.r).filter(Boolean), r); if (o) return { ask: "Cách đọc của từ này là gì?", big: v.w, sm: 1, o: o.map(z => Object.assign(z, { jp: 1 })), tag: "Từ vựng", info }; }
        else { const o = opts4(v.w, D.V.map(z => z.w), r); if (o) return { ask: "Chọn từ đúng với nghĩa", big: esc(v.vi), sm: 1, vn: 1, o: o.map(z => Object.assign(z, { jp: 1 })), tag: "Từ vựng", info }; }
      } else if (kind === "g" && D.G.length > 5) {
        const g = pick(D.G, r), o = opts4(g.cl, D.CL, r);
        if (o) return { ask: "Chọn mẫu ngữ pháp điền vào chỗ trống", big: esc(g.s), sm: 1, vi: g.vi, o: o.map(z => Object.assign(z, { jp: 1 })), tag: "Ngữ pháp", gram: 1, info: '<div class="inf"><div><span lang="ja">' + hl(g.full, g.cl) + "</span><br>" + esc(g.vi) + "<br>Mẫu: <b lang=\"ja\">" + esc(g.pat) + "</b> — " + esc(g.mean) + "</div></div>" };
      } else if (kind === "b" && D.VB.length > 3) {
        const v = pick(D.VB, r), bad = shuf(v.bad, r).slice(0, 3); if (bad.length < 3) continue;
        const o = shuf([{ t: v.a, ok: 1, jp: 1 }, ...bad.map(b => ({ t: b.t, jp: 1, why: b.f }))], r);
        return { ask: "Chia động từ " + v.w + " sang " + v.fj + " (" + v.fv + ")", big: esc(v.pre) + "（＿＿）" + esc(v.post), sm: 1, vi: v.vi, o, tag: "Thể động từ", gram: 1, info: '<div class="inf"><div><span lang="ja">' + esc(v.pre) + "<mark>" + esc(v.a) + "</mark>" + esc(v.post) + "</span><br>" + esc(v.vi) + "<br>Động từ <b lang=\"ja\">" + esc(v.w) + "</b> (nhóm " + v.g + ") · <b>" + esc(v.fj) + "</b> (" + esc(v.fv) + ") → <b lang=\"ja\">" + esc(v.a) + "</b>" + (v.alts.length ? " (cũng đúng: " + esc(v.alts.join("、")) + ")" : "") + "</div></div>" };
      }
    }
    return null;
  }
  /* khung câu hỏi tĩnh (dùng cho cả lúc chơi lẫn lúc xem lại) */
  const optHTML = (q, st) => q.o.map((o, i) => { let c = "opt" + (o.jp ? " is-jp" : ""); if (st && st.done) { if (o.ok) c += " is-right"; else if (st.i === i) c += " is-wrong"; } return '<button type="button" class="' + c + '" data-o="' + i + '"' + (st && st.done ? " disabled" : "") + "><kbd>" + (i + 1) + "</kbd> " + esc(o.t) + (st && st.done && o.why && st.i === i ? "<small> (đây là " + esc(o.why) + ")</small>" : "") + "</button>"; }).join("");
  const qHead = q => '<span class="mond">' + q.tag + " · " + esc(q.ask) + '</span><div class="q__big' + (q.sm ? " sm" : "") + (q.vn ? " vn" : "") + '" lang="ja">' + q.big + "</div>" + (q.vi ? '<div class="q__vi">' + esc(q.vi) + "</div>" : "");
  const verdictHTML = (ok, timeout) => '<div class="vd ' + (ok ? "ok" : "no") + '">' + (ok ? "✔ Chính xác!" : timeout ? "⏰ Hết giờ" : "✘ Chưa chính xác") + "</div>";

  /* hỏi một câu trong `box`. cfg: {limit (giây), mode: "auto"|"manual"|"stay", fx: "big"|"mini", done(ok, i)} */
  function askUI(box, q, cfg) {
    cfg = cfg || {}; let done = false, iv = 0; const t0 = Date.now(), lim = (cfg.limit || 0) * 1000;
    box.innerHTML = '<div class="q fxh">' + (lim ? '<div class="gtime"><i style="width:100%"></i></div>' : "") + qHead(q) + '<div class="opts">' + optHTML(q) + '</div><div class="qres"></div></div>';
    const card = $(".q", box);
    const go = (i, timeout) => {
      if (done) return; done = true; clearInterval(iv); const ok = i >= 0 && !!q.o[i].ok;
      $(".opts", card).innerHTML = optHTML(q, { done: 1, i });
      const res = $(".qres", card);
      const acts = cfg.mode === "manual" ? '<div class="act">' + (cfg.actions ? cfg.actions(ok) : '<button class="btn btn--primary btn--lg" type="button" data-nx>' + (cfg.nextLabel || "Câu tiếp theo →") + "</button>") + "</div>" : "";
      res.innerHTML = verdictHTML(ok, timeout) + (cfg.mode === "auto" && cfg.fx === "mini" ? "" : cfg.top ? acts + q.info : q.info + acts);
      burst(card, ok, cfg.fx === "mini" ? " " : undefined);
      if (cfg.mode === "manual") { const b = $("[data-nx]", res); b.onclick = () => cfg.done(ok, i); if (cfg.bind) cfg.bind(res, ok, i); KEYS = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); b.click(); } else if (e.key === "h" || e.key === "H") { const hb = $("[data-hint]", res); if (hb && !hb.disabled) hb.click(); } }; b.focus({ preventScroll: true }); }
      else if (cfg.mode === "auto") later(() => cfg.done(ok, i), ok ? 350 : 750);
      else cfg.done(ok, i);
    };
    $$("[data-o]", card).forEach(b => b.onclick = () => go(+b.dataset.o));
    if (cfg.mode !== "manual") KEYS = e => { if (e.key >= "1" && e.key <= "4" && q.o[+e.key - 1]) go(+e.key - 1); };
    else KEYS = e => { if (e.key >= "1" && e.key <= "4" && q.o[+e.key - 1]) go(+e.key - 1); };
    if (lim) { const bar = $(".gtime", card), fill = $(".gtime i", card); iv = every(() => { const left = lim - (Date.now() - t0); fill.style.width = Math.max(0, 100 * left / lim) + "%"; bar.classList.toggle("low", left < 5000); if (left <= 0) go(-1, true); }, 150); }
    return { force: () => go(-1, true), isDone: () => done };
  }
  const reviewHTML = hist => !hist.length ? "" : '<h3 class="rv__h">Xem lại ' + hist.length + " câu đã trả lời</h3><div class='rv'>" + hist.map((h, n) => '<details class="rv__i ' + (h.ok ? "ok" : "no") + '"><summary><b>' + (n + 1) + ".</b> " + (h.ok ? "✔" : "✘") + " " + esc(h.q.tag) + " · " + esc(h.q.ask) + '</summary><div class="q">' + qHead(h.q) + '<div class="opts">' + optHTML(h.q, { done: 1, i: h.i }) + "</div>" + h.q.info + "</div></details>").join("") + "</div>";
  const bar = (ms, total, cls) => '<div class="gtime ' + (cls || "") + '"><i style="width:' + Math.max(0, Math.round(100 * ms / total)) + '%"></i></div>';

  /* ---------- Nhanh như chớp / Vua tốc độ ---------- */
  function playTimed(ctx, mode) {
    const D = ctx.D, TOTAL = 90000; let streak = 0, best = 0, right = 0, n = 0, fin = false; const hist = [];
    const score = () => mode === "chop" ? best * 10 : right * 10;
    const t0 = ctx.t0 || Date.now();
    main.innerHTML = '<div class="gm">' + gameHead(mode) + '<div class="ghud" id="hud"></div><div id="qb"></div></div>';
    const hud = () => { const left = Math.max(0, TOTAL - (Date.now() - t0)); hudSet($("#hud"), "t" + ctx.seed, '<span class="pill' + (left < 15000 ? " pill--low" : "") + '">⏱ <b>' + Math.ceil(left / 1000) + 's</b></span>' + bar(left, TOTAL, left < 15000 ? "low" : "") + (mode === "chop" ? scp(streak >= 3 ? "🔥 Chuỗi" : "Chuỗi", streak, "st", true, streak >= 3 ? "hot" : "") + scp("Kỉ lục chuỗi", best, "bs") : scp("Câu đúng", right, "rt", true)) + scp("Điểm", score(), "sc", true, "big")); if (left <= 0) end(); };
    const end = () => { if (fin) return; fin = true; stopAll(); ctx.end(score(), hist); };
    const askQ = () => {
      if (fin) return; if (Date.now() - t0 >= TOTAL) return end();
      const q = genQ(D, mulberry(ctx.seed * 131 + (n++) * 7919 + 17)); if (!q) return end();
      askUI($("#qb"), q, { mode: "auto", fx: "mini", done: (ok, i) => { hist.push({ q, i, ok }); if (ok) { streak++; right++; best = Math.max(best, streak); } else streak = 0; ctx.live(score()); hud(); askQ(); } });
    };
    hud(); every(hud, 250); askQ();
  }

  /* ---------- Hãy chọn chữ đúng ---------- */
  function playChon(ctx) {
    const D = ctx.D, ROUNDS = 3; let round = 0, total = 0, fin = false; const tEnd = ctx.online ? Date.now() + 360000 : 0; const allHist = [];
    const sentences = shuf(D.S, mulberry(ctx.seed)).slice(0, ROUNDS);
    const finish = () => { fin = true; stopAll(); ctx.end(total, allHist); };
    if (tEnd) every(() => { if (!fin && Date.now() > tEnd) finish(); }, 1000);
    const startRound = () => {
      if (round >= ROUNDS || !sentences[round]) return finish();
      const S = sentences[round], chars = [...S.t], n = Math.min(9, Math.max(5, Math.round(chars.length / 2.4)));
      const tiles = []; for (let i = 0; i < n; i++) tiles.push(chars.slice(Math.floor(i * chars.length / n), Math.floor((i + 1) * chars.length / n)).join(""));
      const open = new Set(), hist = []; let wrong = 0, sel = -1, locked = false, ended = false, typed = "";
      main.innerHTML = '<div class="gm">' + gameHead("chon") + '<div class="ghud" id="hud"></div><div class="gpanel"><p class="gvi" id="gvi"></p><div class="tiles" id="tiles"></div><div class="gmsg" id="msg"></div><div id="qb"><p class="gnote" style="text-align:center">Bấm vào ô bạn muốn lật (có thể đổi ô thoải mái). Khi đã chốt, bấm nút “Trả lời câu hỏi” để nhận câu hỏi. Đáp án của câu vừa rồi sẽ ở lại cho đến khi bạn chọn ô tiếp theo.</p></div><div id="nxw"></div><form class="gans" id="gf" autocomplete="off"><input id="gi" lang="ja" placeholder="Gõ cả câu tiếng Nhật…" aria-label="Câu tiếng Nhật"><button class="btn btn--primary" type="submit">Trả lời</button></form></div><div id="hist"></div></div>';
      const hud = () => { hudSet($("#hud"), "chon" + ctx.seed, '<span class="pill">Câu <b>' + (round + 1) + "/" + ROUNDS + '</b></span><span class="pill">Ô đã lật <b>' + open.size + "/" + n + "</b></span>" + scp("Điểm nếu đoán đúng", score(), "pot", false, "big") + scp("Tổng", total, "tot", true, "big")); };
      const drawTiles = () => {
        $("#tiles").innerHTML = tiles.map((t, k) => '<button type="button" class="tl' + (open.has(k) ? " open" : "") + (sel === k ? " sel" : "") + '" data-t="' + k + '" ' + (open.has(k) || locked || ended ? "disabled" : "") + ' lang="ja">' + (open.has(k) ? esc(t) : k + 1) + "</button>").join(""); $$("[data-t]").forEach(b => b.onclick = () => pick(+b.dataset.t));
        const left = n - open.size, show = ended || left <= 3;
        $("#gvi").innerHTML = show ? "Nghĩa: " + esc(S.vi) : '<span class="gvi__lock">🔒 Nghĩa tiếng Việt sẽ hiện khi câu chỉ còn 3 ô chưa lật (còn ' + left + " ô)</span>";
        $("#gvi").classList.toggle("is-show", show);
      };
      const drawHist = () => { $("#hist").innerHTML = reviewHTML(hist); };
      const score = () => open.size <= 3 ? 50 : open.size <= 6 ? 30 : 20;
      const msg = (t, c) => { const m = $("#msg"); m.className = "gmsg " + (c || ""); m.innerHTML = t; };
      const nextRound = () => {
        ended = true; sel = -1; drawTiles(); $("#gf").hidden = true; const last = round + 1 >= ROUNDS;
        $("#nxw").innerHTML = '<div class="gsent" lang="ja">' + esc(S.t) + '</div><p class="gnote" style="text-align:center">Hãy xem lại các ô, câu hỏi và đáp án bên dưới. Sẵn sàng thì bấm tiếp tục.</p><div class="act" style="justify-content:center"><button class="btn btn--primary btn--lg" type="button" id="nx">' + (last ? "Xem kết quả →" : "Câu tiếp theo →") + "</button></div>";
        const b = $("#nx"); b.onclick = () => { round++; startRound(); }; KEYS = e => { if (e.key === "Enter") b.click(); }; $("#nxw").scrollIntoView({ block: "nearest", behavior: "smooth" });
      };
      const guess = v => {
        if (ended || !norm(v)) return;
        if (norm(v) === norm(S.t)) { const sc = score(); total += sc; ctx.live(total); tiles.forEach((_, i) => open.add(i)); drawTiles(); hud(); msg("✔ Chính xác! +" + sc + " điểm", "ok"); burst($(".gpanel"), true, "+" + sc + " điểm!"); return nextRound(); }
        wrong++; burst($(".gpanel"), false);
        if (wrong >= 3) { tiles.forEach((_, i) => open.add(i)); drawTiles(); msg("✘ Sai 3 lần. Đáp án: " + esc(S.t), "no"); return nextRound(); }
        msg("✘ Chưa đúng, bạn còn " + (3 - wrong) + " lần đoán.", "no");
      };
      const pick = k => {
        if (locked || ended || open.has(k)) return; sel = k; drawTiles(); msg("Đã chọn ô số " + (k + 1) + ". Đổi ô khác nếu muốn, hoặc bấm nút bên dưới để trả lời.");
        $("#qb").innerHTML = '<div class="pickbar"><button class="btn btn--primary btn--lg" type="button" id="ask">❓ Trả lời câu hỏi để mở ô số ' + (k + 1) + "</button></div>";
        const b = $("#ask"); b.onclick = () => openTile(k); KEYS = e => { if (e.key === "Enter") b.click(); };
      };
      const openTile = i => {
        if (locked || ended) return; sel = i; locked = true; drawTiles(); msg("Trả lời đúng để lật ô số " + (i + 1) + ".");
        const q = genQ(D, Math.random); if (!q) { open.add(i); locked = false; sel = -1; drawTiles(); hud(); return; }
        askUI($("#qb"), q, { mode: "stay", limit: q.gram ? 20 : 15, done: (ok, pi) => {
          hist.push({ q, i: pi, ok }); allHist.push({ q, i: pi, ok }); locked = false; sel = -1;
          if (ended) { drawHist(); return; }
          if (ok) { open.add(i); msg("✔ Đã lật ô số " + (i + 1) + ": 「" + esc(tiles[i]) + "」", "ok"); } else msg("✘ Chưa đúng, ô số " + (i + 1) + " vẫn đang úp. Hãy chọn ô khác hoặc thử lại.", "no");
          drawTiles(); hud(); drawHist();
        } });
      };
      $("#gf").onsubmit = e => { e.preventDefault(); guess($("#gi").value); };
      $("#gi").oninput = e => { typed = e.target.value; };
      hud(); drawTiles();
    };
    startRound();
  }

  /* ---------- Đoán chữ Kanji ---------- */
  function playDoan(ctx) {
    const D = ctx.D, ROUNDS = 3; let round = 0, total = 0; const allHist = [];
    const targets = shuf(D.K, mulberry(ctx.seed)).slice(0, ROUNDS);
    const hintsOf = r => {
      const h = [["Số nét", r.s + " nét"], ["Bộ thủ", (radical(r.r) || "") + " (bộ số " + r.r + ")"], ["Âm Hán Việt", "bắt đầu bằng chữ “" + r.hv[0] + "”, gồm " + r.hv.replace(/\s+/g, "").length + " chữ cái"], ["Nghĩa", r.m.length > 60 ? r.m.slice(0, 60) + "…" : r.m]];
      if (r.on.length) { const x = String(r.on[0]).replace(/[-.]/g, ""); h.push(["Âm On", "bắt đầu bằng “" + x[0] + "”, gồm " + x.length + " kana"]); }
      const kn = r.kun.filter(k => !/^-|-$/.test(k)); if (kn.length) { const x = kn[0].split(".")[0].replace(/-/g, ""); h.push(["Âm Kun", "bắt đầu bằng “" + x[0] + "”, phần gốc gồm " + x.length + " kana"]); }
      h.push(["Hán Việt đầy đủ", r.hv]); return h;
    };
    const TIERS = [[1, 3, 50], [4, 6, 30], [7, 99, 20]];
    const tierOf = got => got <= 3 ? 0 : got <= 6 ? 1 : 2;
    const startRound = () => {
      if (round >= ROUNDS || !targets[round]) { stopAll(); return ctx.end(total, allHist); }
      const T = targets[round], H = hintsOf(T); let got = 0, wrong = 0, locked = false, typed = "", cur = null;
      const pot = () => TIERS[tierOf(got)][2];
      main.innerHTML = '<div class="gm">' + gameHead("doan") + '<div class="ghud" id="hud"></div><div class="dg"><aside class="dg__l"><h3>Gợi ý</h3><div id="hints"></div></aside><section class="dg__r"><div class="gpanel"><div class="pmeter" id="pm"></div><div class="gbig fxh mystery" id="target" aria-label="Chữ bí ẩn"><span class="qm">？</span><i class="sp s1">✦</i><i class="sp s2">✧</i><i class="sp s3">✦</i></div><div id="qb"></div><div class="gmsg" id="msg"></div><form class="gans" id="gf" autocomplete="off"><input id="gi" lang="ja" placeholder="Gõ chữ Kanji bạn đoán…" aria-label="Chữ Kanji"><button class="btn btn--primary" type="submit">Đoán</button></form></div><div id="hist"></div></section></div></div>';
      const hud = () => { hudSet($("#hud"), "doan" + ctx.seed, '<span class="pill">Chữ <b>' + (round + 1) + "/" + ROUNDS + '</b></span><span class="pill">Gợi ý đã mở <b>' + got + "/" + H.length + "</b></span>" + scp("Điểm nếu đoán đúng", pot(), "pot", false, "big") + scp("Tổng", total, "tot", true, "big")); };
      const drawMeter = pulse => { const cur = tierOf(got); $("#pm").innerHTML = TIERS.map((t, ti) => '<div class="pm' + (ti === cur ? " cur" : ti < cur ? " past" : "") + '"><b>' + t[2] + '</b><small>' + (ti === cur ? "Mốc hiện tại" : ti < cur ? "Đã qua" : "Mốc sau") + "</small><span>gợi ý " + t[0] + (t[1] > 90 ? "+" : "–" + t[1]) + "</span></div>").join(""); if (pulse) { const c = $(".pm.cur", $("#pm")); if (c) { c.classList.add("bump"); } } };
      const drawHints = fresh => {
        const cur = tierOf(got); let html = "";
        TIERS.forEach((t, ti) => {
          const rows = H.map((h, i) => [h, i]).filter(x => x[1] + 1 >= t[0] && x[1] + 1 <= t[1]); if (!rows.length) return;
          html += '<div class="tier' + (ti === cur ? " cur" : ti < cur ? " past" : "") + '"><div class="tier__h"><span>Gợi ý ' + t[0] + (Math.min(t[1], H.length) > t[0] ? "–" + Math.min(t[1], H.length) : "") + '</span><b>' + t[2] + " điểm</b></div>" + rows.map(([h, i]) => i < got ? '<div class="hint on' + (i === fresh ? " fresh" : "") + '"><small>' + (i + 1) + ". " + h[0] + "</small>" + esc(h[1]) + "</div>" : '<div class="hint off">' + (i + 1) + ". ?</div>").join("") + "</div>";
        });
        $("#hints").innerHTML = html;
      };
      const msg = (t, c) => { const m = $("#msg"); m.className = "gmsg " + (c || ""); m.innerHTML = t; };
      const finishR = (ok, text) => {
        locked = true; const sc = ok ? pot() : 0; total += sc; ctx.live(total); hud();
        $("#target").className = "gbig fxh reveal"; $("#target").textContent = T.k; $("#target").lang = "ja"; $("#qb").innerHTML = ""; $("#gf").hidden = true;
        msg(text + (ok ? " +" + sc + " điểm" : "") + '<br><small>' + esc(T.hv) + " · " + esc(T.m.slice(0, 80)) + "</small>", ok ? "ok" : "no"); burst($(".gpanel"), ok, ok ? "+" + sc + " điểm!" : "Mất chữ này");
        $("#qb").innerHTML = infoK(T) + '<div class="act"><button class="btn btn--primary btn--lg" type="button" id="nx">' + (round + 1 >= ROUNDS ? "Xem kết quả →" : "Chữ tiếp theo →") + "</button></div>";
        $("#nx").onclick = () => { round++; startRound(); }; KEYS = e => { if (e.key === "Enter") $("#nx").click(); };
      };
      const guess = v => {
        if (locked) return; const x = norm(v); if (!x) return;
        if (x.includes(T.k)) return finishR(true, "✔ Chính xác!");
        wrong++; burst($("#target"), false, "Sai rồi"); if (wrong >= 3) return finishR(false, "✘ Sai 3 lần.");
        msg("✘ Chưa đúng, bạn còn " + (3 - wrong) + " lần đoán.", "no");
      };
      const claim = (btn, res) => {
        if (locked || got >= H.length) return; const before = tierOf(got); got++; const idx = got - 1, up = tierOf(got) !== before;
        drawHints(idx); drawMeter(true); hud();
        const html = '<span class="hintban' + (up ? " up" : "") + '">💡 Gợi ý #' + got + " · " + esc(H[idx][0]) + ": <b>" + esc(H[idx][1]) + "</b><small>" + (up ? "⚠ Bạn vừa sang mốc mới: đoán đúng bây giờ chỉ còn " + pot() + " điểm" : "Đoán đúng ngay bây giờ được " + pot() + " điểm") + "</small></span>";
        msg(html, "ok");
        const l = $(".dg__l"); l.classList.remove("got"); void l.offsetWidth; l.classList.add("got");
        const act = $(".act", res); if (act) act.insertAdjacentHTML("beforebegin", '<div class="hintget' + (up ? " up" : "") + '">' + html + "</div>");
        btn.disabled = true; btn.textContent = "✓ Đã nhận gợi ý #" + got;
        const ph = $(".hint.fresh", $("#hints")); if (ph) ph.scrollIntoView({ block: "nearest", behavior: "smooth" });
      };
      const loadQ = () => {
        if (locked) return;
        if (got >= H.length) { $("#qb").innerHTML = '<p class="gnote" style="text-align:center">Bạn đã mở hết gợi ý. Hãy gõ chữ Kanji bí ẩn!</p>'; return; }
        let q = null; for (let t = 0; t < 14 && !q; t++) { const c = genQ(D, Math.random); if (c && !JSON.stringify(c).includes(T.k)) q = c; } if (!q) return;
        askUI($("#qb"), q, { mode: "manual", limit: 0, fx: "big", top: true,
          actions: ok => '<button class="btn btn--coral btn--lg" type="button" data-hint' + (ok ? "" : " disabled") + ">" + (ok ? "💡 Nhận gợi ý" : "💡 Chưa có gợi ý") + '</button><button class="btn btn--primary btn--lg" type="button" data-nx>Câu tiếp theo →</button>' + (ok ? '<p class="gnote hintnote">Bạn đã trả lời đúng nên chắc chắn nhận được gợi ý: bấm nút để xem ngay và đọc kỹ, hoặc sang câu tiếp theo thì gợi ý vẫn được mở. Gợi ý càng nhiều thì điểm càng giảm. <kbd>H</kbd> nhận gợi ý · <kbd>Enter</kbd> câu tiếp</p>' : '<p class="gnote hintnote">Trả lời sai nên chưa nhận được gợi ý. Hãy thử câu tiếp theo nhé!</p>'),
          bind: (res, ok, i) => { allHist.push({ q, i, ok }); cur = { res, hb: $("[data-hint]", res), ok }; if (cur.hb && ok) cur.hb.onclick = () => claim(cur.hb, res); if (ok && got >= H.length && cur.hb) { cur.hb.disabled = true; cur.hb.textContent = "Đã mở hết gợi ý"; } },
          done: ok => { if (locked) return; if (ok && cur && cur.hb && !cur.hb.disabled) claim(cur.hb, cur.res); else if (!ok) msg("Chưa đúng, thử câu khác để nhận gợi ý nhé."); loadQ(); } });
      };
      $("#gf").onsubmit = e => { e.preventDefault(); guess($("#gi").value); };
      hud(); drawHints(); drawMeter(); msg("Trả lời đúng câu hỏi để nhận gợi ý. Bạn có thể đoán bất cứ lúc nào."); loadQ();
    };
    startRound();
  }

  /* ---------- Nối từ ---------- */
  const SMALL = "ゃゅょ";
  const isVerb = p => /(^|,)v[123]/.test(p), isAdjI = p => /(^|,)adj-i/.test(p), isAdjNa = p => /(^|,)adj-na/.test(p);
  function tailKey(r, p) {
    let s = toHira(r).replace(/\s+/g, "");
    if (isVerb(p) && s.length > 1 && s.endsWith("る")) s = s.slice(0, -1);
    else if (isAdjI(p) && s.length > 1 && s.endsWith("い")) s = s.slice(0, -1);
    else if (isAdjNa(p) && s.length > 1 && s.endsWith("な")) s = s.slice(0, -1);
    s = s.replace(/ー+$/, ""); if (!s) return "";
    const L = s[s.length - 1]; return SMALL.includes(L) && s.length >= 2 ? s.slice(-2) : L;
  }
  function makeDict(V) {
    const byR = new Map(), byW = new Map();
    V.forEach(v => { if (!v.r) v.r = v.w; v.h = toHira(v.r); (byR.get(v.h) || byR.set(v.h, []).get(v.h)).push(v); (byW.get(v.w) || byW.set(v.w, []).get(v.w)).push(v); });
    return { find(text, need, used) {
      const t = String(text || "").normalize("NFKC").replace(/\s+/g, ""); const h = toHira(t);
      const c = (byR.get(h) || []).concat(byW.get(t) || []);
      return c.find(v => !used.has(v.h) && (!need || v.h.startsWith(need))) || null;
    }, has(text) { const t = String(text || "").normalize("NFKC").replace(/\s+/g, ""); return byR.has(toHira(t)) || byW.has(t); } };
  }
  /* phát lại nhật ký phòng → trạng thái; mọi máy tính ra cùng kết quả vì dùng giờ máy chủ trong từng mục */
  function replay(entries, dict) {
    const st = { players: [], started: false, over: false, cur: -1, lastAt: 0, need: "", chain: [], used: new Set(), elim: [], winner: null, n0: 0 };
    const alive = () => st.players.filter(p => !p.out), nextAlive = from => { for (let k = 1; k <= st.players.length; k++) { const i = (from + k) % st.players.length; if (!st.players[i].out) return i; } return -1; };
    const out = (idx, at) => { const p = st.players[idx]; if (p.out) return; p.out = true; st.elim.push(p.t); if (alive().length <= 1) { st.over = true; st.winner = (alive()[0] || {}).t || null; st.cur = -1; } else if (idx === st.cur) { st.cur = nextAlive(idx); st.lastAt = at; } };
    for (const e of entries) {
      if (e.t === "join") { if (!st.started && !st.players.some(p => p.t === e.p)) st.players.push({ t: e.p, n: e.n, out: false }); }
      else if (e.t === "start") { if (!st.started && st.players.length >= 2) { st.started = true; st.cur = 0; st.lastAt = e.at; st.n0 = st.players.length; } }
      else if (!st.started || st.over) continue;
      else if (e.t === "w") {
        const p = st.players[st.cur]; if (!p || p.t !== e.p || e.at > st.lastAt + 30000 + 1500) continue;
        const v = dict.find(e.x, st.need, st.used); if (!v) continue;
        st.used.add(v.h); st.chain.push({ p: p.t, n: p.n, w: v.w, r: v.r, vi: v.vi, at: e.at });
        const key = tailKey(v.r, v.p); st.lastAt = e.at;
        if (!key || key === "ん") { st.need = ""; out(st.cur, e.at); st.chain[st.chain.length - 1].lost = true; } else { st.need = key; st.cur = nextAlive(st.cur); }
      } else if (e.t === "to") { const p = st.players[st.cur]; if (p && p.t === e.p && e.at >= st.lastAt + 30000 - 400) out(st.cur, e.at); }
      else if (e.t === "lv") { const i = st.players.findIndex(p => p.t === e.p); if (i >= 0) out(i, e.at); }
    }
    return st;
  }

  async function noiLobby(code, ticket, level, name) {
    stopAll(); const V = await loadVocabUpTo(level), dict = makeDict(V);
    let entries = [], from = 0, off = 0, meta = { host: "", status: "wait" }, scored = false, toSent = "", dead = false;
    const draw = () => {
      const st = replay(entries, dict), me = ticket;
      if (!st.started) {
        const isHost = meta.host === me;
        main.innerHTML = '<div class="gm">' + gameHead("noi") + '<div class="gpanel gwait"><h3>Phòng nối từ · cấp ' + LVN[level] + '</h3><div class="roomcode" title="Mã phòng">' + esc(code) + '</div><p class="gnote">Chia sẻ mã này cho bạn bè để họ vào phòng (tối đa 6 người).</p><div class="plist">' + st.players.map(p => '<span class="pl' + (p.t === me ? " me" : "") + '">' + (p.t === meta.host ? "👑 " : "") + esc(p.n) + "</span>").join("") + '</div><div class="act" style="justify-content:center;margin-top:16px">' + (isHost ? '<button class="btn btn--primary btn--lg" id="st" type="button"' + (st.players.length < 2 ? " disabled" : "") + ">Bắt đầu (" + st.players.length + " người)</button>" : '<span class="gnote">Đang chờ chủ phòng bắt đầu…</span>') + '<button class="btn btn--ghost" id="lv" type="button">Rời phòng</button></div></div></div>';
        const b = $("#st"); if (b) b.onclick = async () => { b.disabled = true; await api("POST", { action: "room_push", code, ticket, entry: { t: "start" } }); poll(); };
        $("#lv").onclick = () => { dead = true; stopAll(); api("POST", { action: "room_push", code, ticket, entry: { t: "lv" } }); location.hash = "#/noi"; viewSetup("noi"); };
        return;
      }
      const nowS = Date.now() + off, left = st.over ? 0 : Math.max(0, st.lastAt + 30000 - nowS), cp = st.players[st.cur], mine = cp && cp.t === me;
      const last = st.chain[st.chain.length - 1];
      if (!$("#nplay")) {
        main.innerHTML = '<div class="gm">' + gameHead("noi") + '<div class="nw"><aside class="nw__l"><h3>Người chơi</h3><div id="npl"></div></aside><section class="nw__r"><div class="gpanel" id="nplay"><div id="nturn"></div><div id="ntime"></div><div class="gmsg" id="msg"></div><form class="gans" id="gf" autocomplete="off"><input id="gi" lang="ja" placeholder="Gõ từ (kanji hoặc kana)…" aria-label="Từ tiếp theo"><button class="btn btn--primary" type="submit">Gửi</button></form></div><div id="nchain"></div></section></div></div>';
        $("#gf").onsubmit = async e => {
          e.preventDefault(); const v = $("#gi").value.trim(); if (!v) return; const s2 = replay(entries, dict), c2 = s2.players[s2.cur];
          const msg = (t, c) => { const m = $("#msg"); if (m) { m.className = "gmsg " + (c || ""); m.innerHTML = t; } };
          if (s2.over || !c2 || c2.t !== me) return msg("Chưa đến lượt của bạn.", "no");
          const w = dict.find(v, s2.need, s2.used);
          if (!w) { const have = dict.has(v); burst($("#nplay"), false, "Không hợp lệ"); return msg(have ? (s2.need ? "Từ này đã dùng hoặc không bắt đầu bằng 「" + esc(s2.need) + "」." : "Từ này đã được dùng.") : "Từ này không có trong từ vựng Super Goi cấp " + LVN[level] + ".", "no"); }
          $("#gi").value = ""; await api("POST", { action: "room_push", code, ticket, entry: { t: "w", x: v } }); poll();
        };
      }
      $("#npl").innerHTML = st.players.map(p => { const idx = st.elim.indexOf(p.t); return '<div class="npl' + (p.out ? " out" : "") + (cp && cp.t === p.t && !st.over ? " turn" : "") + (st.winner === p.t ? " win" : "") + '"><span>' + (st.winner === p.t ? "🏆 " : cp && cp.t === p.t && !st.over ? "▶ " : "") + esc(p.n) + (p.t === me ? " (bạn)" : "") + "</span><small>" + (p.out ? "Bị loại thứ " + (idx + 1) : "Đang chơi") + "</small></div>"; }).join("");
      $("#nchain").innerHTML = st.chain.length ? '<h3 class="rv__h">Chuỗi từ (' + st.chain.length + ")</h3><div class='nch'>" + st.chain.slice().reverse().map(c => '<div class="nch__i' + (c.lost ? " lost" : "") + '"><b lang="ja">' + esc(c.w) + "</b> <span lang=\"ja\">" + esc(c.r !== c.w ? "（" + c.r + "）" : "") + "</span> <small>" + esc(c.vi) + " · " + esc(c.n) + (c.lost ? " · kết thúc bằng ん, bị loại" : "") + "</small></div>").join("") + "</div>" : "";
      if (st.over) {
        const n = st.n0, pts = t => { if (st.winner === t) return 10 * (n - 1); const i = st.elim.indexOf(t); return i < 0 ? 0 : 10 * i; };
        $("#nturn").innerHTML = '<div class="nbig">' + (st.winner === me ? "🏆 Bạn thắng!" : "Trò chơi kết thúc") + "</div><p>Người thắng: <b>" + esc((st.players.find(p => p.t === st.winner) || {}).n || "—") + "</b></p><p>Điểm của bạn: <b>" + pts(me) + "</b></p>";
        $("#ntime").innerHTML = ""; $("#gf").hidden = true;
        if (st.winner === me && !$(".fxl")) burst($("#nplay"), true, "Chiến thắng!");
        if (!scored) { scored = true; const a = sess(); const p = pts(me); if (a && p > 0) api("POST", { action: "room_score", code, ticket, points: p, name }).then(j => { const m = $("#msg"); if (m) m.textContent = j._ok ? (j.dup ? "" : "Đã cộng " + p + " điểm vào bảng xếp hạng. Tổng: " + j.total + (j.rank ? " (hạng #" + j.rank + ")" : "")) : (j.error || ""); }); else if (!a) { const m = $("#msg"); if (m) m.textContent = "Đăng nhập để điểm được cộng vào bảng xếp hạng."; } }
        if (!$("#again")) $("#nplay").insertAdjacentHTML("beforeend", '<div class="act" style="justify-content:center;margin-top:12px"><button class="btn btn--primary" id="again" type="button">Chơi phòng khác</button><a class="btn btn--ghost" href="#/">Về Super Gemu</a></div>');
        $("#again") && ($("#again").onclick = () => { dead = true; stopAll(); location.hash = "#/noi"; viewSetup("noi"); });
        return;
      }
      $("#nturn").innerHTML = '<div class="nturn">' + (mine ? "Đến lượt bạn!" : "Lượt của " + esc(cp ? cp.n : "…")) + "</div>" + (st.need ? '<div class="nneed">Từ phải bắt đầu bằng <b lang="ja">' + esc(st.need) + "</b>" + (last ? " <small>(từ trước: " + esc(last.w) + (last.r !== last.w ? "【" + esc(last.r) + "】" : "") + ")</small>" : "") + "</div>" : '<div class="nneed">Hãy nói một từ bất kì để bắt đầu.</div>');
      $("#ntime").innerHTML = bar(left, 30000, left < 8000 ? "low" : "") + '<div class="gnote" style="text-align:center">' + Math.ceil(left / 1000) + " giây</div>";
      $("#gi").disabled = !mine; if (mine && document.activeElement !== $("#gi")) $("#gi").focus({ preventScroll: true });
      if (left <= 0 && cp && toSent !== cp.t + st.lastAt) { toSent = cp.t + st.lastAt; later(() => api("POST", { action: "room_push", code, ticket, entry: { t: "to", target: cp.t } }).then(poll), 500); }
    };
    let busy = false;
    const poll = async () => {
      if (dead || busy) return; busy = true;
      const j = await api("POST", { action: "room_log", code, ticket, from }); busy = false; if (dead) return;
      if (j._ok) { off = j.now - Date.now(); meta = { host: j.host, status: j.status }; if (j.entries.length) { entries = entries.concat(j.entries); from += j.entries.length; } }
      else if (j._st === 404 || j._st === 403) { main.innerHTML = '<div class="gm"><p class="empty">' + esc(j.error || "Phòng không còn tồn tại.") + ' <a href="#/noi">Quay lại</a></p></div>'; dead = true; return; }
      draw();
    };
    every(poll, 1000); every(() => { if (!dead && entries.length) draw(); }, 400); poll();
  }

  function viewNoiSetup() {
    stopAll();
    main.innerHTML = '<div class="gm"><a class="x" href="#/" style="text-decoration:none">← Tất cả trò chơi</a><h1 style="margin-top:12px">🔗 ' + GAMES.noi.name + '</h1><div class="gpanel"><p class="rules">' + GAMES.noi.rules + '</p><div class="gl">Chọn cấp độ từ vựng</div><div class="gchips" id="lv">' + LEVELS.map(l => '<button class="chip" type="button" data-l="' + l + '" aria-current="' + (state.level === l) + '">' + LVN[l] + "</button>").join("") + '</div><div class="gl">Tên hiển thị</div><div class="gans"><input id="nm" maxlength="24" placeholder="Tên của bạn" value="' + esc(myName()) + '" aria-label="Tên hiển thị"></div><div class="gl">Vào chơi</div><div class="act"><button class="btn btn--primary btn--lg" id="quick" type="button">⚡ Ghép nhanh</button><button class="btn btn--ghost btn--lg" id="mk" type="button">Tạo phòng mới</button></div><form class="gans" id="jf" style="margin-top:12px"><input id="jc" maxlength="5" placeholder="Nhập mã phòng" style="text-transform:uppercase;max-width:200px" aria-label="Mã phòng"><button class="btn btn--ghost" type="submit">Vào phòng</button></form><p class="gnote" id="mnote">Ghép nhanh sẽ đưa bạn vào phòng đang chờ cùng cấp độ, hoặc mở phòng mới để người khác vào. Trò này cần ít nhất 2 người.</p></div></div>';
    $$("[data-l]").forEach(b => b.onclick = () => { state.level = +b.dataset.l; $$("[data-l]").forEach(x => x.setAttribute("aria-current", x === b)); });
    const name = () => ($("#nm").value.trim() || "Khách " + Math.floor(1000 + Math.random() * 9000)).slice(0, 24);
    const enter = async (act, extra) => {
      const nm = name(); $("#mnote").textContent = "Đang vào phòng…";
      const j = await api("POST", Object.assign({ action: act, name: nm, level: state.level }, extra || {}));
      if (!j._ok) { $("#mnote").textContent = j.error || "Không vào được phòng."; return; }
      const lg = await api("POST", { action: "room_log", code: j.code, ticket: j.ticket, from: 0 }); const lvl = lg._ok ? lg.level : state.level;
      noiLobby(j.code, j.ticket, lvl, nm);
    };
    $("#quick").onclick = () => enter("room_quick"); $("#mk").onclick = () => enter("room_create");
    $("#jf").onsubmit = e => { e.preventDefault(); const c = $("#jc").value.trim().toUpperCase(); if (c) enter("room_join", { code: c }); };
  }

  /* ---------- điều hướng, thiết lập, kết quả ---------- */
  const state = { game: null, level: 5, mode: "solo", lb: "chon" };
  const best = {}; try { Object.assign(best, JSON.parse(localStorage.getItem("gemu:best") || "{}")); } catch (e) { /* bỏ qua */ }
  const saveBest = (g, s) => { if (s > (best[g] || 0)) { best[g] = s; try { localStorage.setItem("gemu:best", JSON.stringify(best)); } catch (e) { /* bỏ qua */ } } };

  function viewHome() {
    stopAll();
    const tile = (g, cls) => '<button class="bt ' + cls + '" type="button" data-g="' + g + '"><span class="bt__i">' + GAMES[g].icon + '</span><b>' + GAMES[g].name + "</b><span>" + GAMES[g].short + '</span><em>' + (g === "noi" ? "Nhiều người" : best[g] ? "Kỉ lục của bạn: " + best[g] : "Chưa có kỉ lục") + "</em></button>";
    main.innerHTML = '<div class="gm"><h1>Super Gemu</h1><p class="gm__sub">Học mà chơi, chơi mà học. Chọn một góc bánh chưng để bắt đầu!</p><div class="bc"><div class="bc__leaf"></div><div class="bc__str bc__str--h"></div><div class="bc__str bc__str--v"></div>' +
      tile("chon", "bt--tl") + tile("chop", "bt--tr") + tile("doan", "bt--bl") + tile("vua", "bt--br") + '</div><div class="more">' + tile("noi", "bt--noi") + '</div>' +
      '<h2>🏆 Bảng xếp hạng mọi thời đại</h2><div class="gtabs">' + GK.map(g => '<button class="chip" type="button" data-lb="' + g + '" aria-current="' + (state.lb === g) + '">' + GAMES[g].name + '</button>').join("") + '</div><div id="lb"><p class="gnote">Đang tải…</p></div></div>';
    $$("[data-g]").forEach(b => b.onclick = () => { location.hash = "#/" + b.dataset.g; });
    $$("[data-lb]").forEach(b => b.onclick = () => { state.lb = b.dataset.lb; $$("[data-lb]").forEach(x => x.setAttribute("aria-current", x === b)); loadLb(); });
    loadLb();
  }
  async function loadLb() {
    const g = state.lb, j = await api("GET", null, "?lb=" + g); const el = $("#lb"); if (!el || state.lb !== g) return;
    if (!j._ok) { el.innerHTML = '<p class="gnote">' + esc(j.error || "Chưa tải được bảng xếp hạng.") + "</p>"; return; }
    if (!j.top.length) { el.innerHTML = '<p class="gnote">Chưa có ai trên bảng. Hãy là người đầu tiên lập kỉ lục!</p>'; return; }
    const me = sess() && sess().name;
    el.innerHTML = '<table class="lbt"><thead><tr><th>#</th><th>Người chơi</th><th>Cấp</th><th style="text-align:right">' + (g === "noi" ? "Tổng điểm" : "Điểm") + '</th></tr></thead><tbody>' + j.top.map((r, i) => '<tr' + (me && r.n === me ? ' class="me"' : "") + "><td>" + (i < 3 ? ["🥇", "🥈", "🥉"][i] : i + 1) + "</td><td>" + esc(r.n) + "</td><td>" + (r.l ? LVN[r.l] : "") + "</td><td>" + r.s + "</td></tr>").join("") + "</tbody></table>" + (j.me ? '<p class="gnote">Hạng của bạn: <b>#' + j.me.rank + "</b> · " + j.me.s + " điểm</p>" : "");
  }

  function viewSetup(g) {
    stopAll(); if (g === "noi") return viewNoiSetup(); const G = GAMES[g];
    main.innerHTML = '<div class="gm"><a class="x" href="#/" style="text-decoration:none">← Tất cả trò chơi</a><h1 style="margin-top:12px">' + G.icon + " " + G.name + '</h1><div class="gpanel"><p class="rules">' + G.rules + '</p><div class="gl">Chọn cấp độ</div><div class="gchips" id="lv">' + LEVELS.map(l => '<button class="chip" type="button" data-l="' + l + '" aria-current="' + (state.level === l) + '">' + LVN[l] + "</button>").join("") + '</div><div class="gl">Chế độ chơi</div><div class="gchips" id="md"><button class="chip" type="button" data-m="solo" aria-current="' + (state.mode === "solo") + '">Chơi một mình</button><button class="chip" type="button" data-m="online" aria-current="' + (state.mode === "online") + '">Ghép trận online</button></div><p class="gnote" id="mnote"></p><div class="act" style="margin-top:18px"><button class="btn btn--primary btn--lg" type="button" id="go">Bắt đầu</button></div></div></div>';
    const note = () => { $("#mnote").textContent = state.mode === "solo" ? (sess() ? "Điểm cao nhất của bạn sẽ được lưu lên bảng xếp hạng." : "Đăng nhập (nút ở góc trên bên phải) để điểm kỉ lục của bạn được lưu lên bảng xếp hạng chung.") : "Hệ thống sẽ ghép bạn với một người đang online cùng chọn trò này và cùng cấp độ. Hai người nhận cùng bộ câu hỏi, ai điểm cao hơn thắng."; };
    note();
    $$("[data-l]").forEach(b => b.onclick = () => { state.level = +b.dataset.l; $$("[data-l]").forEach(x => x.setAttribute("aria-current", x === b)); });
    $$("[data-m]").forEach(b => b.onclick = () => { state.mode = b.dataset.m; $$("[data-m]").forEach(x => x.setAttribute("aria-current", x === b)); note(); });
    $("#go").onclick = () => state.mode === "solo" ? startSolo(g) : startOnline(g);
  }

  const run = (g, ctx) => { if (g === "chop" || g === "vua") playTimed(ctx, g); else if (g === "chon") playChon(ctx); else playDoan(ctx); };
  const loading = t => { main.innerHTML = '<div class="gm"><div class="gwait"><div class="spin"></div><p>' + t + "</p></div></div>"; };

  async function startSolo(g) {
    loading("Đang chuẩn bị câu hỏi…"); const D = await loadLevel(state.level);
    if (!D || D.K.length < 8 || D.V.length < 8) { main.innerHTML = '<div class="gm"><p class="empty">Chưa tải được dữ liệu. <a href="#/' + g + '">Thử lại</a></p></div>'; return; }
    if (sess()) api("POST", { action: "start", game: g, level: state.level });
    run(g, { D, seed: Math.floor(Math.random() * 2 ** 31), t0: 0, live() {}, end: (sc, h) => soloResult(g, sc, h) });
  }

  async function soloResult(g, sc, hist) {
    stopAll(); saveBest(g, sc);
    main.innerHTML = '<div class="gm"><div class="gpanel gscore"><h3>' + GAMES[g].name + " · " + LVN[state.level] + "</h3><b id=\"fin\" class=\"finsc\">" + sc + '</b><p>điểm</p><div id="sub" class="gnote">' + (sess() ? "Đang lưu điểm…" : "Đăng nhập để lưu điểm này lên bảng xếp hạng chung.") + '</div><div class="act" style="justify-content:center;margin-top:14px"><button class="btn btn--primary" id="again" type="button">Chơi lại</button><a class="btn btn--ghost" href="#/">Về Super Gemu</a></div></div>' + reviewHTML(hist || []) + "</div>";
    $("#again").onclick = () => startSolo(g); countUp($("#fin"), sc);
    const a = sess(); if (a && sc > 0) {
      const j = await api("POST", { action: "submit", game: g, level: state.level, score: sc, name: myName() });
      const el = $("#sub"); if (el) el.textContent = j._ok ? (j.best ? "🎉 Kỉ lục mới của bạn! Hạng hiện tại: #" + j.rank : "Điểm đã ghi nhận. Kỉ lục của bạn hiện ở hạng #" + j.rank) : (j.error || "Chưa lưu được điểm.");
    }
  }

  /* ---------- ghép trận online (3 trò một người chơi cùng bộ câu hỏi) ---------- */
  async function startOnline(g) {
    const a = sess(); const name = a ? myName() : "Khách " + Math.floor(1000 + Math.random() * 9000);
    let ticket = null, cancelled = false; const t0 = Date.now();
    main.innerHTML = '<div class="gm"><div class="gpanel gwait"><div class="spin"></div><h3>Đang tìm đối thủ…</h3><p id="wt">Cùng trò “' + GAMES[g].name + '”, cấp ' + LVN[state.level] + '.</p><div class="act" style="justify-content:center"><button class="btn btn--ghost" id="cx" type="button">Huỷ</button><button class="btn btn--primary" id="solo" type="button" hidden>Chơi một mình</button></div></div></div>';
    $("#cx").onclick = () => { cancelled = true; stopAll(); viewSetup(g); };
    $("#solo").onclick = () => { cancelled = true; stopAll(); state.mode = "solo"; startSolo(g); };
    const tryMatch = async () => {
      if (cancelled) return;
      const j = await api("POST", ticket ? { action: "poll", ticket, game: g, level: state.level, name } : { action: "queue", game: g, level: state.level, name });
      if (cancelled) return;
      if (!j._ok) { const w = $("#wt"); if (w) w.textContent = j.error || "Không kết nối được máy chủ ghép trận."; if (j._st === 503 || j._st === 0) $("#solo").hidden = false; return later(tryMatch, 3000); }
      ticket = j.ticket || ticket;
      if (j.status === "matched") return playMatch(g, j.match, ticket);
      if (Date.now() - t0 > 40000) { const w = $("#wt"); if (w) w.textContent = "Chưa có ai online cùng lúc. Bạn có thể đợi thêm hoặc chơi một mình."; $("#solo").hidden = false; }
      later(tryMatch, 1500);
    };
    tryMatch();
  }

  async function playMatch(g, match, ticket) {
    stopAll();
    const st = await api("POST", { action: "state", match, ticket });
    if (!st._ok) { main.innerHTML = '<div class="gm"><p class="empty">' + esc(st.error || "Không vào được trận.") + ' <a href="#/' + g + '">Quay lại</a></p></div>'; return; }
    const off = st.now - Date.now(); state.level = +st.level; const D = await loadLevel(state.level);
    const startAt = st.start - off;
    const showCount = () => {
      const s = Math.ceil((startAt - Date.now()) / 1000);
      if (s > 0) { main.innerHTML = '<div class="gm">' + gameHead(g) + '<div class="gpanel gwait"><h3>Đã ghép trận!</h3><p>Bạn đấu với <b>' + esc(st.opp.n) + '</b> · ' + GAMES[g].name + " · " + LVN[state.level] + '</p><div class="gcount">' + s + "</div></div></div>"; return later(showCount, 250); }
      begin();
    };
    let myScore = 0, ended = false;
    const report = done => api("POST", { action: "report", match, ticket, score: myScore, done: !!done });
    const begin = () => { every(() => { if (!ended) report(false); }, 2500); run(g, { D, seed: st.seed, t0: startAt, online: true, live: sc => { myScore = sc; }, end: (sc, h) => finishMatch(sc, h) }); };
    const finishMatch = async (sc, hist) => {
      ended = true; myScore = sc; stopAll(); await report(true);
      const draw = (s, final) => {
        const me = s.me.s, op = s.opp.s, win = me > op ? "me" : op > me ? "op" : "";
        main.innerHTML = '<div class="gm"><div class="gpanel gscore"><h3>' + GAMES[g].name + " · " + LVN[state.level] + '</h3><div class="vs"><div class="' + (win === "me" ? "win" : "") + '"><small>Bạn</small><b>' + me + '</b></div><div class="' + (win === "op" ? "win" : "") + '"><small>' + esc(s.opp.n) + '</small><b>' + op + "</b></div></div><p><b>" + (!final ? "Đang chờ đối thủ hoàn thành…" : win === "me" ? "🎉 Bạn thắng!" : win === "op" ? "Bạn thua rồi, đấu lại nhé!" : "Hoà!") + '</b></p><div class="act" style="justify-content:center;margin-top:14px"><button class="btn btn--primary" id="again" type="button">Đấu trận khác</button><a class="btn btn--ghost" href="#/">Về Super Gemu</a></div></div>' + reviewHTML(hist || []) + "</div>";
        $("#again").onclick = () => startOnline(g);
      };
      const t1 = Date.now(); let s = await api("POST", { action: "state", match, ticket });
      const poll = async () => { s = await api("POST", { action: "state", match, ticket }); if (!s._ok) return draw({ me: { s: myScore }, opp: { s: 0, n: st.opp.n } }, true); const fin = s.opp.d || Date.now() - t1 > 120000; draw(s, fin); if (!fin) later(poll, 2000); };
      if (s._ok) { const fin = s.opp.d; draw(s, fin); if (!fin) later(poll, 2000); } else draw({ me: { s: myScore }, opp: { s: 0, n: st.opp.n } }, true);
      saveBest(g, sc);
    };
    showCount();
  }

  /* ---------- định tuyến ---------- */
  function route() {
    stopAll(); window.scrollTo(0, 0);
    const g = location.hash.replace(/^#\/?/, "").split("/")[0];
    document.title = "Super Gemu" + (GAMES[g] ? " — " + GAMES[g].name : "");
    if (GAMES[g]) viewSetup(g); else viewHome();
  }
  window.addEventListener("hashchange", route);
  window.addEventListener("honki:auth", () => { if (!location.hash.replace(/^#\/?/, "")) loadLb(); });
  route();
})();
