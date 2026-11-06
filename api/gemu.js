/* Super Gemu: bảng xếp hạng mọi thời đại và ghép trận online (thăm dò định kỳ qua Redis, không cần websocket).
   GET  /api/gemu?lb=<game>                      -> {top:[{n,s,l,t}], me}
   POST /api/gemu {action:"start", game, level}  (đăng nhập) -> bắt đầu lượt, để kiểm tra thời gian khi nộp điểm
   POST /api/gemu {action:"submit", game, level, score} (đăng nhập) -> {ok, best, rank}
   POST /api/gemu {action:"queue", name, game, level} -> {status:"waiting"|"matched", ticket, match}
   POST /api/gemu {action:"poll", ticket, game, level} -> như trên
   POST /api/gemu {action:"report", match, ticket, score, done} -> cập nhật điểm của mình
   POST /api/gemu {action:"state", match, ticket} -> {now, start, seed, me, opp}
   Điểm do trình duyệt gửi lên nên không thể xác minh tuyệt đối: máy chủ chỉ chặn điểm vô lý và lượt chơi quá nhanh. */
const crypto = require("crypto");
const L = require("./_lib");

const GAMES = { noi: { max: 0, min: 0 }, chon: { max: 150, min: 15 }, chop: { max: 900, min: 80 }, doan: { max: 300, min: 15 }, vua: { max: 900, min: 80 } };
const okLv = l => /^[1-5]$/.test(String(l));
const rid = () => crypto.randomBytes(9).toString("base64url");
const cleanName = s => String(s || "Khách").replace(/[<>\u0000-\u001f]/g, "").trim().slice(0, 24) || "Khách";

module.exports = async (req, res) => {
  try {
    if (!L.ready()) return L.send(res, 503, { error: "Máy chủ chưa được cấu hình." });
    const url = new URL(req.url, "http://x");
    if (req.method === "GET") {
      const g = url.searchParams.get("lb");
      if (!GAMES[g]) return L.send(res, 400, { error: "Trò chơi không hợp lệ." });
      const raw = await L.redis("ZREVRANGE", "lb:" + g, 0, 49, "WITHSCORES");
      const ids = [], sc = [];
      for (let i = 0; i < raw.length; i += 2) { ids.push(raw[i]); sc.push(Number(raw[i + 1])); }
      const meta = ids.length ? await L.redis("HMGET", "lbn:" + g, ...ids) : [];
      const top = ids.map((u, i) => { let m = {}; try { m = JSON.parse(meta[i] || "{}"); } catch (e) { /* bỏ qua */ } return { n: m.n || "Ẩn danh", l: m.l || 0, t: m.t || 0, s: sc[i] }; });
      let me = null; const uid = L.readToken(req.headers.authorization);
      if (uid) { const s = await L.redis("ZSCORE", "lb:" + g, uid); if (s != null) { const r = await L.redis("ZREVRANK", "lb:" + g, uid); me = { s: Number(s), rank: Number(r) + 1 }; } }
      return L.send(res, 200, { top, me });
    }
    if (req.method !== "POST") return L.send(res, 405, { error: "Phương thức không hợp lệ." });
    const b = await L.body(req); const act = b.action;
    const ipk = "gemurl:" + L.ip(req);
    if (await L.limited(ipk, 900, 60)) return L.send(res, 429, { error: "Bạn thao tác quá nhanh, hãy chờ một chút." });

    /* ----- Nối từ: phòng nhiều người, nhật ký (log) các hành động, trình duyệt tự phát lại để biết trạng thái ----- */
    if (act && act.startsWith("room_")) {
      const name = cleanName(b.name), code0 = String(b.code || "").toUpperCase();
      const RK = c => "gemur:" + c, LK = c => "gemurl:" + c, TK = (c, t) => "gemurt:" + c + ":" + t;
      const push = async (code, e) => { e.at = Date.now(); await L.redis("RPUSH", LK(code), JSON.stringify(e)); await L.redis("EXPIRE", LK(code), 7200); };
      const seat = async (code, ticket, nm) => {
        const n = await L.redis("INCR", "gemurc:" + code); await L.redis("EXPIRE", "gemurc:" + code, 7200);
        if (n > 6) return false;
        const uid = L.readToken(req.headers.authorization) || "";
        await L.redis("SET", TK(code, ticket), uid || "-", "EX", 7200);
        await push(code, { t: "join", p: ticket, n: nm }); return true;
      };
      const create = async (level) => {
        const code = crypto.randomBytes(4).toString("hex").slice(0, 5).toUpperCase(), ticket = rid();
        await L.redis("SET", RK(code), JSON.stringify({ level, host: ticket, ts: Date.now() }), "EX", 7200);
        await seat(code, ticket, name); return { code, ticket };
      };
      if (act === "room_create") { if (!okLv(b.level)) return L.send(res, 400, { error: "Cấp độ không hợp lệ." }); const r = await create(+b.level); return L.send(res, 200, r); }
      if (act === "room_join" || act === "room_quick") {
        let code = code0, level = +b.level;
        if (act === "room_quick") {
          if (!okLv(level)) return L.send(res, 400, { error: "Cấp độ không hợp lệ." });
          const open = await L.redis("GET", "gemuopen:" + level);
          if (open) { const st = await L.redis("GET", "gemurs:" + open); const cnt = Number(await L.redis("GET", "gemurc:" + open) || 0); if (!st && cnt < 6) code = open; }
          if (!code) { const r = await create(level); await L.redis("SET", "gemuopen:" + level, r.code, "EX", 300); return L.send(res, 200, r); }
        }
        const meta = await L.redis("GET", RK(code)); if (!meta) return L.send(res, 404, { error: "Không tìm thấy phòng này." });
        if (await L.redis("GET", "gemurs:" + code)) return L.send(res, 409, { error: "Phòng này đã bắt đầu chơi." });
        const ticket = rid(); if (!(await seat(code, ticket, name))) return L.send(res, 409, { error: "Phòng đã đủ 6 người." });
        return L.send(res, 200, { code, ticket });
      }
      const code = code0, ticket = String(b.ticket || "");
      const metaRaw = await L.redis("GET", RK(code)); if (!metaRaw) return L.send(res, 404, { error: "Phòng không còn tồn tại." });
      const meta = JSON.parse(metaRaw); const who = await L.redis("GET", TK(code, ticket));
      if (who == null) return L.send(res, 403, { error: "Bạn không thuộc phòng này." });
      if (act === "room_log") {
        const from = Math.max(0, parseInt(b.from) || 0);
        const raw = await L.redis("LRANGE", LK(code), from, from + 199);
        const status = (await L.redis("GET", "gemurs:" + code)) ? "play" : "wait";
        return L.send(res, 200, { now: Date.now(), level: meta.level, host: meta.host, status, entries: raw.map((x, i) => Object.assign(JSON.parse(x), { i: from + i })) });
      }
      if (act === "room_push") {
        const e = b.entry || {}, t = e.t;
        if (await L.limited("gemurp:" + ticket, 120, 60)) return L.send(res, 429, { error: "Thao tác quá nhanh." });
        if (t === "start") {
          if (ticket !== meta.host) return L.send(res, 403, { error: "Chỉ chủ phòng mới bắt đầu được." });
          const ok = await L.redis("SET", "gemurs:" + code, "1", "NX", "EX", 7200); if (ok !== "OK") return L.send(res, 200, { ok: true });
          await push(code, { t: "start", p: ticket }); return L.send(res, 200, { ok: true });
        }
        if (t === "w") { const x = String(e.x || "").slice(0, 40); if (!x) return L.send(res, 400, { error: "Từ trống." }); await push(code, { t: "w", p: ticket, x }); return L.send(res, 200, { ok: true }); }
        if (t === "to") { await push(code, { t: "to", p: String(e.target || ""), by: ticket }); return L.send(res, 200, { ok: true }); }
        if (t === "lv") { await push(code, { t: "lv", p: ticket }); return L.send(res, 200, { ok: true }); }
        return L.send(res, 400, { error: "Hành động không hợp lệ." });
      }
      if (act === "room_score") {
        const uid = L.readToken(req.headers.authorization);
        if (!uid || uid !== who) return L.send(res, 401, { error: "Hãy đăng nhập để lưu điểm lên bảng xếp hạng." });
        const n = Number(await L.redis("GET", "gemurc:" + code) || 0), pts = Math.floor(Number(b.points));
        if (!(pts >= 0 && pts <= 10 * (n - 1)) || n < 2) return L.send(res, 400, { error: "Điểm không hợp lệ." });
        const first = await L.redis("SET", "gemurd:" + code + ":" + uid, "1", "NX", "EX", 86400);
        if (first !== "OK") return L.send(res, 200, { ok: true, dup: true });
        if (pts > 0) { await L.redis("ZINCRBY", "lb:noi", pts, uid); await L.redis("HSET", "lbn:noi", uid, JSON.stringify({ n: name, l: meta.level, t: Date.now() })); }
        const total = await L.redis("ZSCORE", "lb:noi", uid), rank = total == null ? null : Number(await L.redis("ZREVRANK", "lb:noi", uid)) + 1;
        return L.send(res, 200, { ok: true, total: Number(total || 0), rank });
      }
      return L.send(res, 400, { error: "Yêu cầu không hợp lệ." });
    }

    if (act === "start" || act === "submit") {
      const uid = L.readToken(req.headers.authorization);
      if (!uid) return L.send(res, 401, { error: "Hãy đăng nhập để lưu điểm lên bảng xếp hạng." });
      const g = b.game; if (!GAMES[g] || g === "noi" || !okLv(b.level)) return L.send(res, 400, { error: "Dữ liệu không hợp lệ." });
      const rk = "gerun:" + uid + ":" + g;
      if (act === "start") { await L.redis("SET", rk, String(Date.now()), "EX", 1800); return L.send(res, 200, { ok: true }); }
      const score = Math.floor(Number(b.score));
      if (!(score >= 0 && score <= GAMES[g].max)) return L.send(res, 400, { error: "Điểm không hợp lệ." });
      const t0 = Number(await L.redis("GET", rk) || 0);
      if (!t0 || (Date.now() - t0) / 1000 < GAMES[g].min) return L.send(res, 400, { error: "Lượt chơi không hợp lệ hoặc quá nhanh." });
      await L.redis("DEL", rk);
      if (score <= 0) return L.send(res, 200, { ok: true, best: false });
      const cur = await L.redis("ZSCORE", "lb:" + g, uid);
      const better = cur == null || score > Number(cur);
      if (better) {
        const name = cleanName(b.name);
        await L.redis("ZADD", "lb:" + g, "GT", score, uid);
        await L.redis("HSET", "lbn:" + g, uid, JSON.stringify({ n: name, l: +b.level, t: Date.now() }));
      }
      const rank = Number(await L.redis("ZREVRANK", "lb:" + g, uid)) + 1;
      return L.send(res, 200, { ok: true, best: better, rank });
    }

    /* ----- ghép trận ----- */
    const mk = (g, l, a, c) => {
      const id = rid(), seed = crypto.randomInt(1, 2 ** 31 - 1);
      return { id, rec: { seed, game: g, level: l, start: Date.now() + 7000, p: [a, c] } };
    };
    if (act === "queue" || act === "poll") {
      const g = b.game, l = +b.level;
      if (!GAMES[g] || !okLv(l)) return L.send(res, 400, { error: "Dữ liệu không hợp lệ." });
      const ticket = act === "poll" ? String(b.ticket || "") : rid();
      if (!/^[\w-]{6,20}$/.test(ticket)) return L.send(res, 400, { error: "Vé không hợp lệ." });
      const name = cleanName(b.name);
      const got = await L.redis("GET", "gemut:" + ticket);
      if (got) return L.send(res, 200, { status: "matched", ticket, match: got });
      const qk = "gemuq:" + g + ":" + l;
      const mine = JSON.stringify({ t: ticket, n: name, ts: Date.now() });
      const set = await L.redis("SET", qk, mine, "NX", "EX", 40);
      if (set === "OK") return L.send(res, 200, { status: "waiting", ticket });
      const other = await L.redis("GETDEL", qk);
      let o = null; try { o = other ? JSON.parse(other) : null; } catch (e) { /* bỏ qua */ }
      if (!o || o.t === ticket || Date.now() - o.ts > 35000) { await L.redis("SET", qk, mine, "NX", "EX", 40); return L.send(res, 200, { status: "waiting", ticket }); }
      const m = mk(g, l, { t: o.t, n: o.n }, { t: ticket, n: name });
      await L.redis("SET", "gemum:" + m.id, JSON.stringify(m.rec), "EX", 1800);
      await L.redis("SET", "gemut:" + o.t, m.id, "EX", 600);
      await L.redis("SET", "gemut:" + ticket, m.id, "EX", 600);
      return L.send(res, 200, { status: "matched", ticket, match: m.id });
    }
    if (act === "report" || act === "state") {
      const id = String(b.match || ""), t = String(b.ticket || "");
      const raw = await L.redis("GET", "gemum:" + id); if (!raw) return L.send(res, 404, { error: "Trận đấu đã kết thúc." });
      const m = JSON.parse(raw); const me = m.p.find(p => p.t === t), op = m.p.find(p => p.t !== t);
      if (!me) return L.send(res, 403, { error: "Bạn không thuộc trận này." });
      if (act === "report") {
        const sc = Math.max(0, Math.min(GAMES[m.game].max, Math.floor(Number(b.score) || 0)));
        await L.redis("SET", "gemus:" + id + ":" + t, JSON.stringify({ s: sc, d: !!b.done }), "EX", 1800);
      }
      const mv = await L.redis("GET", "gemus:" + id + ":" + t), ov = await L.redis("GET", "gemus:" + id + ":" + op.t);
      const pj = v => { try { return v ? JSON.parse(v) : { s: 0, d: false }; } catch (e) { return { s: 0, d: false }; } };
      return L.send(res, 200, { now: Date.now(), start: m.start, seed: m.seed, game: m.game, level: m.level, me: Object.assign({ n: me.n }, pj(mv)), opp: Object.assign({ n: op.n }, pj(ov)) });
    }
    return L.send(res, 400, { error: "Yêu cầu không hợp lệ." });
  } catch (e) {
    console.error(e);
    return L.send(res, 500, { error: "Máy chủ gặp lỗi, hãy thử lại sau." });
  }
};
