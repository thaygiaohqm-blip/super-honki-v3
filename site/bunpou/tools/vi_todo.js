// Liệt kê các câu cần dịch (câu hoàn chỉnh sau khi điền đáp án) của đề Minna. Dùng: node tools/vi_todo.js > /tmp/todo.txt
const fs = require("fs"); let D; global.SB = { exData: d => D = d };
eval(fs.readFileSync(__dirname + "/../data/ex-minna.js", "utf8"));
const strip = t => String(t).replace(/\s+/g, "");
function filled(s, q) {
  const t = q.t || s.type, JA = /[぀-ヿ一-鿿]/;
  if (t === "ord") { const o = q.order.split("").map(c => q.opts[c - 1]).join(""); return strip(q.pre + o + q.post); }
  if (t === "fill") { if (!JA.test(q.q) || !/（|＿|\(/.test(q.q)) return null; return strip(q.q.replace(/（\s*）|（　+）|＿+/, (q.acc || [""])[0])); }
  if (t === "mc") { if (!JA.test(q.q) || !/[。？?（(＿…]/.test(q.q) || q.q.length <= 6) return null; return strip(q.q.replace(/（\s*）|（　+）|＿+|\(\s*\)/, q.opts[q.ans[0] - 1])); }
  return null;
}
module.exports = { filled, strip, D: () => D };
if (require.main === module) {
  const seen = new Map();
  D.sets.forEach(s => s.qs.forEach(q => { const f = filled(s, q); if (f && !seen.has(f)) seen.set(f, seen.size + 1); }));
  const have = fs.existsSync("/tmp/vi_have.json") ? JSON.parse(fs.readFileSync("/tmp/vi_have.json")) : {};
  let i = 0; for (const [f, n] of seen) { i++; if (!have[f]) console.log(n + "|" + f); }
}
