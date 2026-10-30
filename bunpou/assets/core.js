/* Super Bunpou - loi dung chung: luu tru, hien thi tieng Nhat, giong doc, hieu ung. */
window.SB = window.SB || {};
(() => {
  "use strict";
  const C = window.SB_CATALOG;
  /* ------------------------------------------------------------ lưu trữ */
  const store = {
    get(k, d) { try { const v = localStorage.getItem("sb:" + k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set(k, v) { try { localStorage.setItem("sb:" + k, JSON.stringify(v)); } catch (e) { /* bỏ qua */ } }
  };
  const S = Object.assign({ kanji: true, romaji: true, furi: true, quizDir: "jv" }, store.get("settings", {}));
  const P = Object.assign({ ok: {}, rv: {}, gt: {}, ts: {}, clr: 0 }, store.get("progress", {}));
  try { const th = localStorage.getItem("honki:theme"); if (th) S.theme = th; } catch (e) { /* bỏ qua */ }     // màu giao diện dùng chung cả Super Honki
  const saveS = () => { store.set("settings", S); try { if (S.theme) localStorage.setItem("honki:theme", S.theme); } catch (e) { /* bỏ qua */ } };
  // Mọi thay đổi tiến độ đều báo cho module tài khoản (assets/auth.js) để đồng bộ khi đã đăng nhập.
  const listeners = [];
  const notify = () => listeners.forEach(f => { try { f(); } catch (e) { console.error(e); } });
  const saveP = () => { store.set("progress", P); paintReviewBadge(); notify(); };
  const nowSec = () => Math.floor(Date.now() / 1000);   // dấu thời gian (giây) để gộp tiến độ giữa các thiết bị
  function mark(id, st) {
    if (st === "ok") { P.ok[id] = nowSec(); delete P.rv[id]; }
    if (st === "rv") { P.rv[id] = nowSec(); delete P.ok[id]; }
    saveP();
  }
  const stateOf = id => P.rv[id] ? "rv" : P.ok[id] ? "ok" : "";

  /* ------------------------------------------------------------ tiếng Nhật */
  const KJ = "\\u3400-\\u4dbf\\u4e00-\\u9fff\\uf900-\\ufaff々〆ヶヵ";
  const TOK = new RegExp(`(\\{)|(\\})|([${KJ}]+)\\[([^\\]]+)\\]|( )|([^{}])`, "g");
  const RUBY = new RegExp(`([${KJ}]+)\\[([^\\]]+)\\]`, "g");
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  function jp(m, o = {}) {
    if (!m) return "";
    const kanji = o.kanji ?? S.kanji;
    let out = "", hidden = false;
    for (const x of m.matchAll(TOK)) {
      if (x[1]) { if (o.blank) { hidden = true; out += '<span class="blank" aria-label="chỗ trống">＿</span>'; } else if (o.hl !== false) out += '<mark class="hw">'; continue; }
      if (x[2]) { if (hidden) hidden = false; else if (!o.blank && o.hl !== false) out += "</mark>"; continue; }
      if (hidden) continue;
      if (x[3]) out += kanji ? ((o.furi ?? S.furi) ? `<ruby>${x[3]}<rt>${x[4]}</rt></ruby>` : x[3]) : x[4];
      else if (x[5]) out += kanji ? "" : '<span class="sp"></span>';
      else out += esc(x[6]);
    }
    return out;
  }
  const kana = m => (m || "").replace(RUBY, "$2").replace(/[{} ]/g, "");
  const surf = m => (m || "").replace(RUBY, "$1").replace(/[{} ]/g, "");
  const hira = s => s.replace(/[ァ-ヶ]/g, c => String.fromCharCode(c.charCodeAt(0) - 0x60));

  const BASE = { あ:"a",い:"i",う:"u",え:"e",お:"o",か:"ka",き:"ki",く:"ku",け:"ke",こ:"ko",さ:"sa",し:"shi",す:"su",せ:"se",そ:"so",た:"ta",ち:"chi",つ:"tsu",て:"te",と:"to",な:"na",に:"ni",ぬ:"nu",ね:"ne",の:"no",は:"ha",ひ:"hi",ふ:"fu",へ:"he",ほ:"ho",ま:"ma",み:"mi",む:"mu",め:"me",も:"mo",や:"ya",ゆ:"yu",よ:"yo",ら:"ra",り:"ri",る:"ru",れ:"re",ろ:"ro",わ:"wa",を:"o",ん:"n",が:"ga",ぎ:"gi",ぐ:"gu",げ:"ge",ご:"go",ざ:"za",じ:"ji",ず:"zu",ぜ:"ze",ぞ:"zo",だ:"da",ぢ:"ji",づ:"zu",で:"de",ど:"do",ば:"ba",び:"bi",ぶ:"bu",べ:"be",ぼ:"bo",ぱ:"pa",ぴ:"pi",ぷ:"pu",ぺ:"pe",ぽ:"po",ゔ:"vu",ぁ:"a",ぃ:"i",ぅ:"u",ぇ:"e",ぉ:"o",ゃ:"ya",ゅ:"yu",ょ:"yo" };
  const DI = { きゃ:"kya",きゅ:"kyu",きょ:"kyo",しゃ:"sha",しゅ:"shu",しょ:"sho",ちゃ:"cha",ちゅ:"chu",ちょ:"cho",にゃ:"nya",にゅ:"nyu",にょ:"nyo",ひゃ:"hya",ひゅ:"hyu",ひょ:"hyo",みゃ:"mya",みゅ:"myu",みょ:"myo",りゃ:"rya",りゅ:"ryu",りょ:"ryo",ぎゃ:"gya",ぎゅ:"gyu",ぎょ:"gyo",じゃ:"ja",じゅ:"ju",じょ:"jo",びゃ:"bya",びゅ:"byu",びょ:"byo",ぴゃ:"pya",ぴゅ:"pyu",ぴょ:"pyo",ふぁ:"fa",ふぃ:"fi",ふぇ:"fe",ふぉ:"fo",てぃ:"ti",でぃ:"di",うぃ:"wi",うぇ:"we",しぇ:"she",じぇ:"je",ちぇ:"che" };
  function romaji(k) {
    const s = hira(k); let out = "";
    const at = i => DI[s.substr(i, 2)] || BASE[s[i]] || "";
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === "っ") { const n = at(i + 1); out += n.startsWith("ch") ? "t" : (n[0] || ""); continue; }
      if (c === "ー") { const v = out.slice(-1); out += "aiueo".includes(v) ? v : ""; continue; }
      if (DI[s.substr(i, 2)]) { out += DI[s.substr(i, 2)]; i++; continue; }
      out += BASE[c] ?? c;
    }
    return out;
  }
  const norm = s => (s || "").trim().toLowerCase().replace(/[\s・。、.,'’\-]/g, "");
  const loose = r => r.replace(/n'/g, "n").replace(/ou/g, "o").replace(/oo/g, "o").replace(/uu/g, "u").replace(/aa/g, "a").replace(/ii/g, "i").replace(/ee/g, "e").replace(/ei/g, "e");

  /* ------------------------------------------------------------ giọng đọc */
  let jaVoice = null, voicesChecked = false;
  function pickVoice() {
    if (!("speechSynthesis" in window)) return;
    const vs = speechSynthesis.getVoices();
    if (vs.length) voicesChecked = true;
    jaVoice = vs.find(v => /^ja[-_]JP/i.test(v.lang) && /google|kyoko|o-ren|nanami|haruka/i.test(v.name)) || vs.find(v => /^ja/i.test(v.lang)) || null;
  }
  if ("speechSynthesis" in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }
  function speak(text) {
    if (!("speechSynthesis" in window)) return toast("Trình duyệt này chưa hỗ trợ đọc thành tiếng.");
    if (voicesChecked && !jaVoice) toast("Thiết bị chưa có giọng đọc tiếng Nhật. Hãy cài thêm giọng Nhật trong phần cài đặt ngôn ngữ.");
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP"; if (jaVoice) u.voice = jaVoice; u.rate = 0.88;
    speechSynthesis.speak(u);
  }
  const ICON_SPEAK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16.5 8.5a5 5 0 0 1 0 7"/><path d="M19 6a8.5 8.5 0 0 1 0 12"/></svg>';
  const ICON_FLIP = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M3 12a9 9 0 0 1 15.5-6.2L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-15.5 6.2L3 16"/><path d="M3 21v-5h5"/></svg>';

  /* ------------------------------------------------------------ hiệu ứng đúng / sai */
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
      d.style.cssText = `left:${x0}px;top:${y0}px;background:${cols[i % cols.length]};${i % 3 ? "" : "border-radius:50%;"}`;
      document.body.appendChild(d);
      const ang = Math.random() * Math.PI * 2, dist = (big ? 140 : 70) + Math.random() * (big ? 160 : 60);
      const dx = Math.cos(ang) * dist, dy = Math.sin(ang) * dist * .7 - (big ? 60 : 30);
      d.animate([
        { transform: "translate(-50%,-50%) rotate(0) scale(1)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random() * 540 - 270}deg) scale(.9)`, opacity: 1, offset: .6 },
        { transform: `translate(calc(-50% + ${dx * 1.1}px), calc(-50% + ${dy + 70}px)) rotate(${Math.random() * 720}deg) scale(.6)`, opacity: 0 }
      ], { duration: 750 + Math.random() * 450, easing: "cubic-bezier(.2,.7,.4,1)" }).onfinish = () => d.remove();
    }
  }
  function wobble(el) {
    if (!el) return;
    if (calm()) { el.animate([{ opacity: 1 }, { opacity: .55 }, { opacity: 1 }], { duration: 300 }); return; }
    el.animate([{ transform: "translateX(0)" }, { transform: "translateX(-9px)" }, { transform: "translateX(8px)" }, { transform: "translateX(-6px)" }, { transform: "translateX(4px)" }, { transform: "translateX(0)" }], { duration: 420, easing: "ease-out" });
  }
  function verdict(el, ok) {
    if (!el) return;
    el.classList.remove("pop");
    void el.offsetWidth;
    el.classList.add("pop");
  }
  function glow(el, ok) {
    if (!el || calm()) return;
    const c = getComputedStyle(document.documentElement).getPropertyValue(ok ? "--mint" : "--coral").trim();
    el.animate(ok ? [{ boxShadow: `0 0 0 0 ${c}99` }, { boxShadow: `0 0 0 16px ${c}00` }]
                  : [{ boxShadow: `inset 0 0 0 2px ${c}` }, { boxShadow: `inset 0 0 0 0 ${c}00` }], { duration: ok ? 700 : 600, easing: "ease-out" });
  }
  const buzz = () => { try { if (navigator.vibrate) navigator.vibrate(45); } catch (e) { /* bỏ qua */ } };
  const PRAISE = [["Chính xác!", "正解"], ["Tuyệt vời!", "すごい"], ["Giỏi lắm!", "いいね"], ["Chuẩn rồi!", "完璧"], ["Đúng rồi!", "その通り"]];
  const OOPS = [["Chưa đúng", "惜しい"], ["Suýt nữa rồi", "もう少し"], ["Chưa chính xác", "残念"]];
  const pickWord = ok => { const l = ok ? PRAISE : OOPS; return l[Math.floor(Math.random() * l.length)]; };
  const ICON_OK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const ICON_NO = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" aria-hidden="true"><path d="M7 7l10 10"/><path d="M17 7L7 17"/></svg>';
  function verdictHTML(ok, word, ans, streak) {
    const [vi, ja] = word || (ok ? PRAISE[0] : OOPS[0]);
    return `<span class="verdict verdict--${ok ? "ok" : "no"}"><span class="verdict__icon">${ok ? ICON_OK : ICON_NO}</span>
      <span class="verdict__word">${vi}<span class="verdict__ja" lang="ja">${ja}${ok ? "！" : "…"}</span></span>${ok && streak >= 3 ? `<span class="streak">${streak} câu đúng liên tiếp</span>` : ""}</span>${ans ? `<div class="verdict__ans">${ans}</div>` : ""}`;
  }
  function scoreRing(right, total) {
    const c = 2 * Math.PI * 52, pct = total ? right / total : 0;
    return `<svg class="score-ring" viewBox="0 0 120 120" role="img" aria-label="Đúng ${Math.round(pct * 100)} phần trăm"><circle class="bg" cx="60" cy="60" r="52"/>
      <circle class="fg" cx="60" cy="60" r="52" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${c.toFixed(1)}" data-off="${(c * (1 - pct)).toFixed(1)}"/>
      <text x="60" y="69" text-anchor="middle">${Math.round(pct * 100)}%</text></svg>`;
  }
  function doneHTML(title, right, total, note, buttons) {
    const pct = total ? right / total : 0;
    const msg = pct >= .9 ? "Xuất sắc! Bạn nắm rất chắc gói này." : pct >= .7 ? "Rất tốt. Ôn lại vài từ sai là trọn vẹn." : pct >= .5 ? "Khá ổn. Hãy luyện lại các câu sai nhé." : "Cần ôn thêm. Thử học thẻ trước rồi quay lại.";
    return `<div class="card"><div class="done">${scoreRing(right, total)}<h3>${title}</h3><p class="done__msg">${msg}</p><p>${note}</p>
      <div class="hero__actions">${buttons}</div></div></div>`;
  }
  function afterDone(root, right, total) {
    const fg = root.querySelector(".score-ring .fg");
    if (fg) requestAnimationFrame(() => requestAnimationFrame(() => { fg.style.strokeDashoffset = fg.dataset.off; }));
    if (total && right / total >= .7) setTimeout(() => celebrate(root.querySelector(".score-ring"), true), 650);
  }

  /* ------------------------------------------------------------ tiện ích */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const fmt = n => n.toLocaleString("vi-VN");
  const shuffle = a => { const b = a.slice(); for (let i = b.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [b[i], b[j]] = [b[j], b[i]]; } return b; };
  let toastTimer;
  function toast(msg) {
    const t = $(".toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
  }
  function paintReviewBadge() {
    const n = Object.keys(P.rv).length;
    $$("[data-review-count]").forEach(b => { b.hidden = !n; b.textContent = n; });
  }
  const meter = (a, b) => `<div class="meter" role="img" aria-label="Đã học ${a} trên ${b}"><i style="width:${b ? Math.round(a / b * 100) : 0}%"></i></div>`;
  function band({ crumb, crumbHref, big, bigJp, title, text, meta, extra, compact }) {
    const noBig = bigJp || !big;
    return `<section class="band${compact ? " band--compact" : ""}${noBig ? " band--nobig" : ""}"><div class="wrap band__in">
      ${noBig ? "" : `<div class="band__big">${big}</div>`}
      <div>${crumb ? `<a class="crumb" href="${crumbHref}"><span aria-hidden="true">←</span> ${esc(crumb)}</a>` : ""}
        <h1>${title}</h1>${text ? `<p>${text}</p>` : ""}${extra || ""}</div>
      ${meta ? `<div class="band__meta">${meta}</div>` : ""}
    </div></section>`;
  }

  const lvtag = lv => `<span class="lvtag" data-lv="${lv}">${String(lv).toUpperCase()}</span>`;
  /* van ban hon hop (tieng Viet + tieng Nhat co furigana): giu khoang trang */
  function rich(t, o = {}) {
    if (!t) return "";
    const kanji = o.kanji ?? S.kanji, furi = o.furi ?? S.furi;
    return esc(t).replace(new RegExp(`([${KJ}]+)\\[([^\\]]+)\\]`, "g"), (m, k, r) => kanji ? (furi ? `<ruby>${k}<rt>${r}</rt></ruby>` : k) : r)
      .replace(/「([^」]*)」/g, (m, x) => `<span class="jq" lang="ja">「${x}」</span>`);
  }
  const plain = s => (s || "").replace(RUBY, "$1").replace(/[{}]/g, "");
  Object.assign(window.SB, { C, store, S, P, saveS, saveP, mark, stateOf, listeners, notify, nowSec, esc, jp, rich, kana, surf, plain, hira, romaji, speak, toast,
    ICON_SPEAK, ICON_FLIP, calm, celebrate, wobble, verdict, glow, buzz, pickWord, verdictHTML, scoreRing, doneHTML, afterDone, $, $$, fmt, shuffle, meter, lvtag, band, paintReviewBadge, KJ });
})();
