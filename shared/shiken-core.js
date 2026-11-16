/* Super Shiken / Super Dokkai — phần dùng chung: nạp dữ liệu đề, tra từ khi bấm vào chữ, lưu tiến độ. */
(function () {
  const me = document.currentScript && document.currentScript.src || "";
  const ROOT = me.replace(/shared\/shiken-core\.js.*$/, "");
  const DATA = ROOT + "shiken/data/";
  const SK = window.SK = {};
  const cache = {};
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const put = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } };
  SK.get = get; SK.put = put;
  SK.json = (k, d) => { try { return JSON.parse(get(k)) || d; } catch (e) { return d; } };
  SK.save = (k, v) => put(k, JSON.stringify(v));
  SK.esc = t => String(t == null ? "" : t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  /* chỉ giữ lại thẻ <u> (gạch chân trong đề), mọi thẻ khác thành chữ thường */
  SK.jp = t => SK.esc(String(t == null ? "" : t).replace(/<u>/g, "\u0001").replace(/<\/u>/g, "\u0002")).replace(/\u0001/g, "<u>").replace(/\u0002/g, "</u>").replace(/\n/g, "<br>");
  SK.plain = t => String(t || "").replace(/<\/?u>/g, "");
  SK.LEVELS = ["n5", "n4", "n3", "n2", "n1"];
  SK.fetch = (name) => cache[name] || (cache[name] = fetch(DATA + name).then(r => { if (!r.ok) throw new Error(name); return r.json(); }));
  SK.index = () => SK.fetch("index.json");
  SK.exam = id => SK.fetch(id + ".json");
  SK.vi = id => SK.fetch("vi/" + id + ".json").then(o => { const l = []; Object.values(o.q || {}).forEach(x => (x.v || []).forEach(v => l.push(v))); Object.values(o.p || {}).forEach(x => (x.v || []).forEach(v => l.push(v))); if (SK.addVocab) SK.addVocab(l); return o; }).catch(() => ({ q: {}, p: {} }));
  SK.ROOT = ROOT;

  /* ---- chia câu ---- */
  SK.sentences = text => {
    const out = [];
    String(text || "").split("\n").forEach((para, pi) => {
      const t = para.trim(); if (!t) return;
      const re = /[^。！？!?]*(?:[。！？!?]+[」』）)]*|$)/g; let m, first = true;
      while ((m = re.exec(t)) && m[0] !== "") { const s = m[0].trim(); if (s) { out.push({ ja: s, nl: first }); first = false; } if (re.lastIndex >= t.length) break; }
    });
    return out;
  };

  /* ---- tra từ ---- */
  let dictP = null;
  const dict = () => dictP || (dictP = SK.fetch("dict.json").catch(() => ({})));
  const RULES = (() => {
    const r = [];
    const add = (suf, rep) => r.push([suf, rep]);
    // tính từ i
    [["かった", "い"], ["くない", "い"], ["くなかった", "い"], ["くて", "い"], ["ければ", "い"], ["く", "い"], ["さ", "い"]].forEach(a => add(a[0], a[1]));
    // động từ nhóm 2
    [["た", "る"], ["て", "る"], ["ない", "る"], ["なかった", "る"], ["ます", "る"], ["ました", "る"], ["ません", "る"], ["れば", "る"], ["よう", "る"], ["られる", "る"], ["させる", "る"], ["られた", "る"], ["させられる", "る"], ["ず", "る"], ["ずに", "る"]].forEach(a => add(a[0], a[1]));
    // nhóm 1
    const row = { "う": ["っ", "わ", "い", "え", "お"], "つ": ["っ", "た", "ち", "て", "と"], "る": ["っ", "ら", "り", "れ", "ろ"], "む": ["ん", "ま", "み", "め", "も"], "ぶ": ["ん", "ば", "び", "べ", "ぼ"], "ぬ": ["ん", "な", "に", "ね", "の"], "く": ["い", "か", "き", "け", "こ"], "ぐ": ["い", "が", "ぎ", "げ", "ご"], "す": ["し", "さ", "し", "せ", "そ"] };
    Object.keys(row).forEach(u => {
      const [ta, na, ma, ba, ou] = row[u]; const te = (u === "ぶ" || u === "む" || u === "ぬ") ? ["んで", "んだ"] : (u === "く") ? ["いて", "いた"] : (u === "ぐ") ? ["いで", "いだ"] : (u === "す") ? ["して", "した"] : ["って", "った"];
      add(te[0], u); add(te[1], u); add(na + "ない", u); add(na + "なかった", u); add(ma + "ます", u); add(ma + "ました", u); add(ma + "ません", u); add(ma, u);
      add(ba + "ば", u); add(ou + "う", u); add(na + "れる", u); add(na + "せる", u); add(ba, u);
    });
    add("った", "う"); add("って", "う"); add("った", "つ"); add("った", "る");
    // する・来る
    [["した", "する"], ["して", "する"], ["しない", "する"], ["します", "する"], ["しました", "する"], ["される", "する"], ["させる", "する"], ["できる", "する"], ["し", "する"], ["すれば", "する"], ["しよう", "する"], ["しなかった", "する"], ["きた", "くる"], ["きて", "くる"], ["こない", "くる"], ["きます", "くる"]].forEach(a => add(a[0], a[1]));
    // tính từ na / danh từ + だ・な・に・の
    ["だ", "な", "に", "の", "で", "です", "だった", "でした"].forEach(s => add(s, ""));
    return r;
  })();
  const AUX = ["ている", "ていた", "ています", "ていました", "ていない", "てしまう", "てしまった", "てくる", "てきた", "ていく", "ていった", "ておく", "てある", "てみる", "てもらう", "てあげる", "てくれる", "ちゃう", "ちゃった", "られている", "ながら", "たい", "たく", "たがる", "そう", "すぎる", "すぎ", "やすい", "にくい"];
  const cands = s => {
    const set = new Set([s]);
    const step = t => { RULES.forEach(([suf, rep]) => { if (t.length > suf.length && t.endsWith(suf)) set.add(t.slice(0, -suf.length) + rep); }); };
    step(s);
    AUX.forEach(a => { if (s.length > a.length && s.endsWith(a)) { const b = s.slice(0, -a.length); set.add(b); step(b + "て"); step(b + "た"); set.add(b + "る"); } });
    Array.from(set).forEach(x => { if (x !== s) step(x); });
    return Array.from(set);
  };
  SK.lookupAt = async (text, i) => {
    const d = await dict();
    for (let L = Math.min(12, text.length - i); L >= 1; L--) {
      const s = text.substr(i, L);
      if (/^[\s、。「」『』（）()・!！?？\d０-９a-zA-Z]+$/.test(s)) continue;
      const cs = cands(s);
      for (const c of cs) { if (/^[\u3040-\u309f]{1,2}$/.test(c)) continue; if (d[c]) return { surface: s, base: c, e: d[c] }; }
    }
    return null;
  };
  SK.lookupText = async text => {
    const d = await dict(); text = text.trim();
    if (d[text]) return { surface: text, base: text, e: d[text] };
    for (const c of cands(text)) if (d[c]) return { surface: text, base: c, e: d[c] };
    return SK.lookupAt(text, 0);
  };

  /* ---- sổ từ ---- */
  SK.notebook = () => SK.json("shiken:words", []);
  SK.addWord = (w, r, m) => { const l = SK.notebook(); if (!l.some(x => x[0] === w)) { l.unshift([w, r, m, Date.now()]); SK.save("shiken:words", l.slice(0, 1000)); } };

  /* ---- hộp tra từ khi bấm vào chữ / bôi chọn ---- */
  let pop = null;
  const hidePop = () => { if (pop) { pop.remove(); pop = null; } };
  const showPop = (x, y, html) => {
    hidePop(); pop = document.createElement("div"); pop.className = "skpop"; pop.innerHTML = html;
    document.body.appendChild(pop);
    const w = pop.offsetWidth, h = pop.offsetHeight, vw = document.documentElement.clientWidth;
    let left = Math.max(8, Math.min(x - w / 2, vw - w - 8)), top = y + 18;
    if (top + h > window.scrollY + window.innerHeight - 8) top = Math.max(window.scrollY + 8, y - h - 30);
    pop.style.left = left + "px"; pop.style.top = top + "px";
    return pop;
  };
  const card = (r, ctx) => {
    const e = r.e, same = r.surface === r.base;
    return '<div class="skpop__w" lang="ja">' + SK.esc(r.surface) + (same ? "" : ' <small>← ' + SK.esc(r.base) + "</small>") + "</div>" +
      (e[0] ? '<div class="skpop__r" lang="ja">' + SK.esc(e[0]) + "</div>" : "") +
      '<div class="skpop__m">' + SK.esc(e[1]) + "</div>" + (e[2] ? '<div class="skpop__h">' + SK.esc(e[2]) + "</div>" : "") +
      '<div class="skpop__a"><button type="button" data-save>★ Lưu vào sổ từ</button></div>';
  };
  /* Tra từ bằng các từ vựng chuẩn bị sẵn: từ điển được quét trước, từ nào có trong từ điển sẽ được tô nhẹ, bấm vào là hiện nghĩa */
  const START = /[\u4e00-\u9fff\u30a1-\u30fa々]/;
  const okBase = (c, d) => c.length >= 2 && !/^[\u3040-\u309f]+$/.test(c) && d[c];
  const matchAt = (text, i, d) => {
    for (let L = Math.min(12, text.length - i); L >= 2; L--) {
      const s = text.substr(i, L);
      if (/[\s、。「」『』（）()・!！?？\d０-９a-zA-Z_]/.test(s)) continue;
      for (const c of cands(s)) if (okBase(c, d)) { const rest = s.slice(c.length); return { surface: s.startsWith(c) && /^(だ|な|に|の|で|です|だった|でした)$/.test(rest) ? c : s, base: c, e: d[c] }; }
    }
    return null;
  };
  SK.addVocab = list => dict().then(d => { (list || []).forEach(v => { if (v && v[0] && !d[v[0]]) d[v[0]] = [v[1] || "", v[2] || "", ""]; }); });
  SK.markWords = async root => {
    const d = await dict(); if (!d || !Object.keys(d).length) return;
    const nodes = [];
    root.querySelectorAll(".jp").forEach(el => {
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, { acceptNode: n => n.parentElement.closest(".vw,rt,rp,button,a,select,input,textarea") ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT });
      let n; while ((n = w.nextNode())) if (START.test(n.textContent)) nodes.push(n);
    });
    nodes.forEach(n => {
      const t = n.textContent; let i = 0, last = 0, frag = null;
      while (i < t.length) {
        if (!START.test(t[i])) { i++; continue; }
        const m = matchAt(t, i, d);
        if (!m) { i++; continue; }
        frag = frag || document.createDocumentFragment();
        if (i > last) frag.appendChild(document.createTextNode(t.slice(last, i)));
        const sp = document.createElement("span"); sp.className = "vw"; sp.dataset.b = m.base; sp.dataset.s = m.surface; sp.textContent = m.surface; frag.appendChild(sp);
        i += m.surface.length; last = i;
      }
      if (frag) { if (last < t.length) frag.appendChild(document.createTextNode(t.slice(last))); n.parentNode.replaceChild(frag, n); }
    });
  };
  SK.attachLookup = (root, getCtx) => {
    const enabled = () => !root.classList.contains("nolookup");
    let busy = false, timer = 0;
    const run = async () => { busy = true; try { await SK.markWords(root); } finally { busy = false; } };
    new MutationObserver(() => { if (busy) return; clearTimeout(timer); timer = setTimeout(run, 30); }).observe(root, { childList: true, subtree: true });
    run();
    root.addEventListener("click", async ev => {
      const vw = ev.target.closest && ev.target.closest(".vw"); if (!vw || !enabled()) return;
      if (ev.target.closest("button,a,select,input")) return;
      const d = await dict(), base = vw.dataset.b, e = d[base]; if (!e) return;
      const b = vw.getBoundingClientRect();
      const r = { surface: vw.dataset.s, base, e };
      const p = showPop(b.left + b.width / 2 + window.scrollX, b.bottom + window.scrollY, card(r));
      p.querySelector("[data-save]").onclick = () => { SK.addWord(r.base, r.e[0], r.e[1]); p.querySelector("[data-save]").textContent = "✓ Đã lưu"; };
      ev.stopPropagation();
    });
    document.addEventListener("click", ev => { if (pop && !pop.contains(ev.target) && !ev.target.closest(".vw")) hidePop(); });
    document.addEventListener("keydown", ev => { if (ev.key === "Escape") hidePop(); });
  };

  /* ---- chuỗi câu hỏi theo từng dạng bài, dùng chung cho cả hai app ---- */
  SK.KIND = { 1: "Cách đọc Kanji", 2: "Viết Kanji / Biểu ký", 3: "Tạo từ ghép", 4: "Điền từ theo ngữ cảnh", 5: "Từ đồng nghĩa", 6: "Cách dùng từ", 7: "Ngữ pháp: chọn hình thức đúng", 8: "Ngữ pháp: sắp xếp câu (★)", 9: "Ngữ pháp: điền vào đoạn văn", 10: "Đọc hiểu đoạn ngắn", 11: "Đọc hiểu đoạn trung", 12: "Đọc hiểu tổng hợp (A và B)", 13: "Đọc hiểu đoạn dài (nắm chủ trương)", 14: "Tìm kiếm thông tin" };
  SK.JA = { 1: "漢字読み", 2: "表記", 3: "語形成", 4: "文脈規定", 5: "言い換え類義", 6: "用法", 7: "文の文法1", 8: "文の文法2 ★", 9: "文章の文法", 10: "内容理解（短文）", 11: "内容理解（中文）", 12: "統合理解", 13: "主張理解（長文）", 14: "情報検索" };
  SK.CIRCLE = ["①", "②", "③", "④"];
})();
