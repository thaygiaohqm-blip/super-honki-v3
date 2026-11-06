/* Super Honki — chọn đáp án nhiễu "cùng dạng" với đáp án đúng.
 *
 * Lỗi cần tránh: đáp án đúng khác hẳn các đáp án còn lại về hình thức
 * (vd. chỉ một lựa chọn kết thúc bằng う, hoặc chỉ một lựa chọn có okurigana),
 * khiến người làm bài loại được đáp án chỉ bằng cách nhìn đuôi/độ dài.
 *
 *   HKD.pick(correct, pool, n, rnd, kind)          -> n chuỗi nhiễu
 *   HKD.pickBy(correct, cands, n, rnd, kind, key)  -> n phần tử nhiễu (cands là object, key lấy chuỗi)
 *   HKD.order(opts, ci, kind)                      -> {elim, feats}: số đáp án có thể loại bằng "mẹo hình thức"
 *
 * kind: "jp" (chữ Nhật: đuôi kana, kiểu chữ, độ dài), "vi" (câu/cụm tiếng Việt), "hv" (âm Hán Việt)
 */
(function (root) {
  const KJ = /[一-鿿㐀-䶿々]/, HI = /[ぁ-ゟ]/, KA = /[゠-ヿ]/;
  const cls = ch => !ch ? "" : KJ.test(ch) ? "K" : HI.test(ch) ? "h" : KA.test(ch) ? "k" : /[A-Za-zÀ-ỹ]/.test(ch) ? "a" : /[0-9０-９]/.test(ch) ? "d" : "o";
  const sig = s => [...s].map(cls).join("").replace(/(.)\1+/g, "$1");
  const clean = s => String(s == null ? "" : s).replace(/\[[^\]]*\]/g, "").replace(/[\s・.\-{}～〜~]/g, "");

  function shape(s, kind) {
    if (kind === "vi") {
      const t = String(s || "").trim();
      return { len: t.length, words: t.split(/\s+/).filter(Boolean).length, paren: /[(（]/.test(t) ? 1 : 0, comma: /[,;/]/.test(t) ? 1 : 0, dots: /\.\.\./.test(t) ? 1 : 0 };
    }
    if (kind === "hv") return { len: clean(s).length };
    const a = [...clean(s)];
    return { len: a.length, sig: sig(a.join("")), end: a[a.length - 1] || "", end2: a.slice(-2).join(""), ec: cls(a[a.length - 1]), first: cls(a[0]) };
  }

  function sim(a, b, kind) {
    let v = 0;
    if (kind === "vi") {
      v -= Math.abs(a.len - b.len) / 6;
      v -= 1.2 * Math.abs(a.words - b.words);
      v += a.paren === b.paren ? 1 : -3; v += a.comma === b.comma ? .6 : -1.2; v += a.dots === b.dots ? .6 : -1.2;
      return v;
    }
    if (kind === "hv") return -Math.abs(a.len - b.len) * 2;
    if (a.end === b.end) v += a.ec === "K" ? 3 : 7; else if (a.ec === b.ec) v += 2;
    if (a.end2 === b.end2) v += 2;
    if (a.sig === b.sig) v += 3; else if (a.ec === b.ec && a.first === b.first) v += 1;
    v -= (Math.min(a.len, b.len) <= 2 ? 4.5 : 1.8) * Math.abs(a.len - b.len);   /* chuỗi ngắn (1–2 kana): lệch 1 chữ đã lộ */
    return v;
  }

  function pickBy(correct, cands, n, rnd, kind, key, bonus) {
    kind = kind || "jp"; key = key || (x => x); rnd = rnd || Math.random;
    const cs = shape(correct, kind), seen = new Set([String(correct)]), sc = [];
    (cands || []).forEach((c, i) => {
      const t = String(key(c));
      if (!t || seen.has(t)) return; seen.add(t);
      sc.push({ c, s: sim(cs, shape(t, kind), kind) + rnd() * 2.2 + (bonus ? bonus(c, i) : 0) });
    });
    sc.sort((a, b) => b.s - a.s);
    if (kind !== "jp") return sc.slice(0, n).map(x => x.c);
    /* chọn dần từng đáp án; nếu các đáp án sai đã chọn cùng đuôi mà đuôi đó khác đáp án đúng thì đáp án đúng sẽ thành "kẻ lạc loài" → phạt */
    const out = []; sc.forEach(x => { x.sh = shape(String(key(x.c)), kind); });
    const pool = sc.slice(0, 40);
    while (out.length < n && pool.length) {
      let bi = 0, bs = -1e9;
      pool.forEach((x, i) => { let v = x.s; out.forEach(o => { if (o.sh.end === x.sh.end && o.sh.end !== cs.end) v -= 3; }); if (v > bs) { bs = v; bi = i; } });
      out.push(pool.splice(bi, 1)[0]);
    }
    return out.map(x => x.c);
  }
  const pick = (correct, pool, n, rnd, kind) => pickBy(correct, pool, n, rnd, kind, null);

  /* ---- kiểm tra: đáp án đúng có "lộ" qua hình thức không? ----
   * Đáp án đúng bị coi là "lộ" theo một đặc điểm khi nó là kẻ lạc loài: các đáp án sai
   * giống nhau về đặc điểm đó còn đáp án đúng thì khác (hoặc ngược lại: chỉ đáp án đúng giống đuôi gốc...).
   * elim = số đáp án sai có thể loại ngay nhờ đặc điểm đó (0..3). */
  function odd(vals, ci, same) {
    const me = vals[ci], others = vals.filter((_, i) => i !== ci);
    if (others.some(v => same(v, me))) return 0;                       // đáp án đúng giống ít nhất một đáp án sai → không phân biệt được
    let best = 0;                                                       // nhóm đáp án sai giống nhau lớn nhất
    others.forEach(a => { best = Math.max(best, others.filter(b => same(a, b)).length); });
    return best >= 2 ? best : 0;
  }
  function feats(opts, ci, kind) {
    kind = kind || "jp";
    const sh = opts.map(o => shape(o, kind)), F = [];
    if (kind === "jp") {
      if (sh.every(x => x.len >= 2)) {
        F.push(["end", odd(sh.map(x => x.ec === "h" || x.ec === "k" ? x.end : "~" + Math.random()), ci, (a, b) => a === b)]);
        F.push(["sig", odd(sh.map(x => x.sig), ci, (a, b) => a === b)]);
        F.push(["len", odd(sh.map(x => x.len), ci, (a, b) => Math.abs(a - b) <= (Math.min(a, b) <= 2 ? 0 : 1))]);
      }
    } else if (kind === "vi") {
      F.push(["words", odd(sh.map(x => x.words), ci, (a, b) => Math.abs(a - b) <= 1)]);
      F.push(["len", odd(sh.map(x => x.len), ci, (a, b) => b <= a * 1.8 + 4 && a <= b * 1.8 + 4)]);
      F.push(["paren", odd(sh.map(x => x.paren), ci, (a, b) => a === b)]);
    } else F.push(["len", odd(sh.map(x => x.len), ci, (a, b) => Math.abs(a - b) <= 1)]);
    return F;
  }
  function order(opts, ci, kind) {
    const F = feats(opts, ci, kind); let best = ["", 0];
    F.forEach(f => { if (f[1] > best[1]) best = f; });
    return { elim: best[1], by: best[0], feats: F };
  }

  root.HKD = { pick, pickBy, order, feats, shape, sim, cls };
  if (typeof module !== "undefined") module.exports = root.HKD;
})(typeof window !== "undefined" ? window : globalThis);
