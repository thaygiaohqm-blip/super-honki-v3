/* Chạy thử trên máy, gồm cả tài khoản đồng bộ (dùng Redis giả trong bộ nhớ, tắt server là mất dữ liệu).
   Dùng:  node dev-server.js   rồi mở http://localhost:8000
   Nếu đã đặt KV_REST_API_URL, KV_REST_API_TOKEN, AUTH_SECRET trong môi trường thì dùng Redis thật. */
const http = require("http"), fs = require("fs"), path = require("path");
if (!process.env.KV_REST_API_URL) {
  const store = new Map();
  process.env.KV_REST_API_URL = "http://memory/"; process.env.KV_REST_API_TOKEN = "dev";
  process.env.AUTH_SECRET = process.env.AUTH_SECRET || "dev-secret-" + "x".repeat(30);
  global.fetch = async (_u, o) => {
    const [cmd, ...a] = JSON.parse(o.body); let r = null;
    const zs = k => store.get(k) || (store.set(k, new Map()), store.get(k));
    if (cmd === "GET") r = store.has(a[0]) && typeof store.get(a[0]) === "string" ? store.get(a[0]) : null;
    else if (cmd === "GETDEL") { r = store.has(a[0]) ? store.get(a[0]) : null; store.delete(a[0]); }
    else if (cmd === "DEL") { store.delete(a[0]); r = 1; }
    else if (cmd === "SET") { const nx = a.includes("NX"); if (nx && store.has(a[0])) r = null; else { store.set(a[0], String(a[1])); r = "OK"; const ei = a.indexOf("EX"); if (ei > 0) setTimeout(() => store.delete(a[0]), a[ei + 1] * 1000).unref(); } }
    else if (cmd === "ZADD") { const m = zs(a[0]); const gt = a[1] === "GT"; const [sc, mem] = gt ? [a[2], a[3]] : [a[1], a[2]]; if (!gt || !m.has(mem) || +sc > m.get(mem)) m.set(mem, +sc); r = 1; }
    else if (cmd === "ZSCORE") { const m = store.get(a[0]); r = m && m.has(a[1]) ? String(m.get(a[1])) : null; }
    else if (cmd === "ZREVRANK") { const m = store.get(a[0]); if (!m || !m.has(a[1])) r = null; else r = [...m.entries()].sort((x, y) => y[1] - x[1]).findIndex(e => e[0] === a[1]); }
    else if (cmd === "ZREVRANGE") { const m = store.get(a[0]) || new Map(); const l = [...m.entries()].sort((x, y) => y[1] - x[1]).slice(+a[1], +a[2] + 1); r = a[3] ? l.flatMap(e => [e[0], String(e[1])]) : l.map(e => e[0]); }
    else if (cmd === "RPUSH") { const l = JSON.parse(store.get(a[0]) || "[]"); l.push(a[1]); store.set(a[0], JSON.stringify(l)); r = l.length; }
    else if (cmd === "ZINCRBY") { const m = zs(a[0]); m.set(a[2], (m.get(a[2]) || 0) + +a[1]); r = String(m.get(a[2])); }
    else if (cmd === "HSET") { const h = zs(a[0]); h.set(a[1], a[2]); r = 1; }
    else if (cmd === "HMGET") { const h = store.get(a[0]) || new Map(); r = a.slice(1).map(f => h.has(f) ? h.get(f) : null); }
    else if (cmd === "INCR") { const v = Number(store.get(a[0]) || 0) + 1; store.set(a[0], String(v)); r = v; }
    else if (cmd === "EXPIRE") r = 1;
    else if (cmd === "LPUSH") { const l = JSON.parse(store.get(a[0]) || "[]"); l.unshift(a[1]); store.set(a[0], JSON.stringify(l)); r = l.length; }
    else if (cmd === "LTRIM") { const l = JSON.parse(store.get(a[0]) || "[]"); store.set(a[0], JSON.stringify(l.slice(+a[1], +a[2] + 1))); r = "OK"; }
    else if (cmd === "LRANGE") { r = JSON.parse(store.get(a[0]) || "[]").slice(+a[1], +a[2] + 1); }
    else if (cmd === "EVAL") { const [, , k1, k2, rv, text] = a, rev = Number(store.get(k2) || 0); if (rev !== Number(rv)) r = [0, rev]; else { store.set(k1, text); store.set(k2, String(rev + 1)); r = [1, rev + 1]; } }
    return { ok: true, status: 200, json: async () => ({ result: r }) };
  };
  console.log("Chế độ thử: Redis giả trong bộ nhớ.");
}
const MIME = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".png": "image/png", ".json": "application/json" };
http.createServer(async (req, res) => {
  const u = new URL(req.url, "http://x");
  if (u.pathname.startsWith("/api/")) {
    const name = u.pathname.slice(5).replace(/[^a-z_]/g, ""), file = path.join(__dirname, "api", name + ".js");
    if (!fs.existsSync(file)) { res.statusCode = 404; return res.end("{}"); }
    let raw = ""; for await (const c of req) raw += c;
    try { req.body = raw ? JSON.parse(raw) : {}; } catch (e) { req.body = {}; }
    req.query = Object.fromEntries(u.searchParams);
    res.status = c => { res.statusCode = c; return res; };
    res.json = o => { res.setHeader("Content-Type", "application/json"); res.end(JSON.stringify(o)); };
    return require(file)(req, res);
  }
  let p = path.join(__dirname, decodeURIComponent(u.pathname));
  if (!p.startsWith(__dirname)) { res.statusCode = 403; return res.end(); }
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, "index.html");
  if (!fs.existsSync(p)) { res.statusCode = 404; return res.end("Không tìm thấy"); }
  res.setHeader("Content-Type", MIME[path.extname(p)] || "application/octet-stream"); fs.createReadStream(p).pipe(res);
}).listen(process.env.PORT || 8000, () => console.log("http://localhost:" + (process.env.PORT || 8000)));
