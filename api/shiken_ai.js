/* POST /api/shiken_ai — dịch và giải thích khi một câu chưa có bản dịch sẵn. Kết quả lưu vào Upstash Redis để lần sau không tốn thêm.
   Cần biến môi trường ANTHROPIC_API_KEY (tùy chọn ANTHROPIC_MODEL). Không có khóa thì trả 503 và giao diện chỉ ẩn nút "Hỏi AI". */
const { redis, ready, body, send, ip, limited, crypto } = require("./_lib");
const { SYS, promptQuestion, promptPassage, promptWord } = require("./_shiken_prompt");
const KEY = process.env.ANTHROPIC_API_KEY || "";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

async function ask(prompt, max) {
  const r = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST", headers: { "x-api-key": KEY, "anthropic-version": "2023-06-01", "content-type": "application/json" },
    body: JSON.stringify({ model: MODEL, max_tokens: max, system: SYS, messages: [{ role: "user", content: prompt }] })
  });
  const j = await r.json();
  if (!r.ok) throw new Error((j.error && j.error.message) || "AI lỗi " + r.status);
  const t = (j.content || []).map(c => c.text || "").join("").trim();
  const a = t.indexOf("{"), b = t.lastIndexOf("}");
  return JSON.parse(t.slice(a, b + 1));
}

module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "POST" });
  if (!KEY) return send(res, 503, { error: "Chưa bật AI trên máy chủ (thiếu ANTHROPIC_API_KEY)." });
  const o = await body(req);
  const kind = o.kind;
  if (!["question", "passage", "word"].includes(kind)) return send(res, 400, { error: "kind không hợp lệ" });
  const text = JSON.stringify(o);
  if (text.length > 30000) return send(res, 400, { error: "Quá dài" });
  const ck = "shiken:ai:" + crypto.createHash("sha1").update(text).digest("hex");
  const db = ready();
  try {
    if (db) { const hit = await redis("GET", ck); if (hit) return send(res, 200, JSON.parse(hit)); if (await limited("shiken:rl:" + ip(req), 40, 3600)) return send(res, 429, { error: "Bạn hỏi AI quá nhiều, thử lại sau một giờ." }); }
    const out = kind === "question" ? await ask(promptQuestion(o), 1800) : kind === "passage" ? await ask(promptPassage(o), 8000) : await ask(promptWord(o), 300);
    if (db) await redis("SET", ck, JSON.stringify(out));
    return send(res, 200, out);
  } catch (e) { return send(res, 500, { error: "AI không trả lời được: " + e.message }); }
};
