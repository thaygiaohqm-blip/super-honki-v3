/* Soạn sẵn bản dịch, lời giải, từ vựng cho cả một đề bằng AI.  Dùng: ANTHROPIC_API_KEY=... node shiken/tools/gen_vi.js n2-2025-12
   Kết quả ghi vào shiken/data/vi/<mã đề>.json (giữ nguyên những câu đã có, chỉ bổ sung câu còn thiếu). */
const fs = require("fs"), path = require("path");
const { SYS, promptQuestion, promptPassage } = require("../../api/_shiken_prompt");
const KEY = process.env.ANTHROPIC_API_KEY, MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
if (!KEY) { console.error("Thiếu ANTHROPIC_API_KEY"); process.exit(1); }
const id = process.argv[2]; if (!id) { console.error("Dùng: node gen_vi.js <mã đề>"); process.exit(1); }
const dir = path.join(__dirname, "..", "data"), exam = JSON.parse(fs.readFileSync(path.join(dir, id + ".json"), "utf8"));
const out = path.join(dir, "vi", id + ".json"); fs.mkdirSync(path.dirname(out), { recursive: true });
const ov = fs.existsSync(out) ? JSON.parse(fs.readFileSync(out, "utf8")) : { q: {}, p: {} };
async function ask(prompt, max) {
  const r = await fetch("https://api.anthropic.com/v1/messages", { method: "POST", headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" }, body: JSON.stringify({ model: MODEL, max_tokens: max, system: SYS, messages: [{ role: "user", content: prompt }] }) });
  const j = await r.json(); if (!r.ok) throw new Error(JSON.stringify(j));
  const t = j.content.map(c => c.text || "").join(""); return JSON.parse(t.slice(t.indexOf("{"), t.lastIndexOf("}") + 1));
}
(async () => {
  for (const sec of exam.sections) for (const m of sec.mondai) {
    const groups = {}; m.qs.forEach(q => { const k = q.p ? "p" + q.p : "q" + q.no; (groups[k] = groups[k] || []).push(q); });
    for (const k of Object.keys(groups)) {
      const qs = groups[k]; if (qs.every(q => ov.q[q.no])) continue;
      try {
        if (qs[0].p) {
          const j = await ask(promptPassage({ level: exam.level, kind: m.kind, text: exam.passages[qs[0].p], questions: qs.map(q => ({ no: q.no, stem: q.s, choices: q.c, answer: q.a })) }), 8000);
          ov.p[qs[0].p] = { s: j.s, key: j.key, v: j.v }; Object.assign(ov.q, j.q);
        } else for (const q of qs) ov.q[q.no] = await ask(promptQuestion({ level: exam.level, kind: m.kind, stem: q.s, choices: q.c, answer: q.a }), 1800);
        fs.writeFileSync(out, JSON.stringify(ov)); console.log("xong", k);
      } catch (e) { console.error("lỗi", k, e.message); }
    }
  }
})();
