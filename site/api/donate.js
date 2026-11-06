/* POST /api/donate {name?, msg?} -> {ok, count}   (người học bấm "Mình đã chuyển khoản")
   GET  /api/donate  với  Authorization: Bearer <AUTH_SECRET>  -> {count, log[]}   (tác giả xem danh sách lời nhắn) */
const L = require("./_lib");

module.exports = async (req, res) => {
  try {
    if (!L.ready()) return L.send(res, 200, { ok: true, saved: false });
    if (req.method === "GET") {
      const h = String(req.headers.authorization || "");
      const want = "Bearer " + (process.env.AUTH_SECRET || "");
      const a = Buffer.from(h), b = Buffer.from(want);
      if (a.length !== b.length || !L.crypto.timingSafeEqual(a, b)) return L.send(res, 401, { error: "Không có quyền xem." });
      const [count, raw] = await Promise.all([L.redis("GET", "donate:count"), L.redis("LRANGE", "donate:log", 0, 99)]);
      return L.send(res, 200, { count: Number(count || 0), log: (raw || []).map(s => { try { return JSON.parse(s); } catch (e) { return { raw: s }; } }) });
    }
    if (req.method !== "POST") return L.send(res, 405, { error: "Phương thức không hợp lệ." });
    if (await L.limited("rl:d:" + L.ip(req), 5, 3600)) return L.send(res, 200, { ok: true, saved: false });   // quá nhiều lần: vẫn cảm ơn nhưng không ghi thêm
    const b = await L.body(req);
    const clean = (s, n) => String(s || "").replace(/[\u0000-\u001f<>]/g, " ").trim().slice(0, n);
    const entry = { t: Date.now(), name: clean(b.name, 40), msg: clean(b.msg, 200) };
    const count = await L.redis("INCR", "donate:count");
    await L.redis("LPUSH", "donate:log", JSON.stringify(entry));
    await L.redis("LTRIM", "donate:log", 0, 199);
    return L.send(res, 200, { ok: true, saved: true, count });
  } catch (e) {
    console.error(e);
    return L.send(res, 200, { ok: true, saved: false });
  }
};
