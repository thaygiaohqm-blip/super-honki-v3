/* Super Honki — thanh thương hiệu chung, màu giao diện, tài khoản và hộp sách của Minh Dokkai.
   Dùng cho trang chủ, Super Goi và Super Bunpou. Tải ngay đầu <body> để thanh hiện cùng lúc với trang, không bị giật. */
(function () {
  const me = document.currentScript && document.currentScript.src || "";
  const base = me.replace(/honki\.js.*$/, "");
  const root = base.replace(/shared\/$/, "");
  const PRODUCTS = [
    { img: base + "img/huyen-luc-thu.jpg", name: "Bộ sách Huyền Lục Thư", sub: "Học Kanji bằng Lục Thư cải tiến (3 cuốn)", url: "https://www.minhdokkai.com/s%C3%A1ch/huy%E1%BB%81n-l%E1%BB%A5c-th%C6%B0-3-cu%E1%BB%91n" },
    { img: base + "img/14-ngay.jpg", name: "14 NGÀY học hết từ vựng tiếng Nhật N5, N4", sub: "Sách của Minh Dokkai", url: "https://www.minhdokkai.com/s%C3%A1ch/14-ng%C3%A0y-h%E1%BB%8Dc-h%E1%BA%BFt-t%E1%BB%AB-v%E1%BB%B1ng-n5-n4" },
    { img: base + "img/hanh-trinh-phien-dich.jpg", name: "Hành trình Phiên dịch sống động", sub: "Luyện tập phiên dịch tiếng Nhật trong thực tế", url: "https://www.minhdokkai.com/s%C3%A1ch/h%C3%A0nh-tr%C3%ACnh-phi%C3%AAn-d%E1%BB%8Bch-s%E1%BB%91ng-%C4%91%E1%BB%99ng" }
  ];
  window.HONKI = { products: PRODUCTS, root };

  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
  const put = (k, v) => { try { localStorage.setItem(k, v); } catch (e) { /* bỏ qua */ } };
  const del = k => { try { localStorage.removeItem(k); } catch (e) { /* bỏ qua */ } };
  const ready = fn => document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", fn) : fn();

  if (!document.querySelector('link[href*="shared/honki.css"]')) { const css = document.createElement("link"); css.rel = "stylesheet"; css.href = base + "honki.css"; document.head.appendChild(css); }

  const page = document.body.dataset.honki;           // "home" | "goi" | "bunpou"
  const THEMES = [
    { id: "reu", ja: "苔", name: "Rêu", note: "Xanh rêu, mặc định", c: ["#004646", "#27c4b5", "#ed3838", "#f7f4ed"] },
    { id: "ai", ja: "藍", name: "Chàm", note: "Xanh chàm, dịu mắt", c: ["#233a63", "#5fa8d8", "#e0533d", "#f1f3f7"] },
    { id: "sakura", ja: "桜", name: "Anh đào", note: "Hồng mận, ấm áp", c: ["#7a2e4a", "#ee8fae", "#d23b3b", "#fbf1f2"] },
    { id: "matcha", ja: "抹茶", name: "Trà xanh", note: "Xanh lá, tự nhiên", c: ["#3f5a22", "#a3c45a", "#d9622b", "#f4f2e4"] },
    { id: "momiji", ja: "紅葉", name: "Lá phong", note: "Nâu đỏ mùa thu", c: ["#7a2f14", "#f2a04a", "#c8102e", "#faf0e3"] },
    { id: "yoru", ja: "夜", name: "Ban đêm", note: "Nền tối, học buổi tối", c: ["#0b1416", "#134e4c", "#3fd1c0", "#ff6b6b"] }];

  /* ---------- Super Goi / Super Bunpou: thanh thương hiệu dựng ngay khi trang bắt đầu tải ---------- */
  if (page === "goi" || page === "bunpou") {
    const link = (id, label) => '<a href="' + root + id + '/"' + (page === id ? ' aria-current="true"' : "") + ">" + label + "</a>";
    const s = document.createElement("div"); s.className = "hk-strip";
    s.innerHTML = '<div class="hk-strip__in"><a class="hk-strip__brand" href="' + root + '" title="Về trang chủ Super Honki"><img src="' + base + 'logo-mark.svg" alt="" width="48" height="48"><span><b>Super</b> Honki</span></a>' +
      '<nav class="hk-strip__nav" aria-label="Các công cụ của Super Honki">' + link("goi", "Super Goi") + link("bunpou", "Super Bunpou") + '<span class="hk-strip__soon" title="Sắp ra mắt">Super Kanji · sắp có</span></nav><span class="hk-strip__grow"></span><div class="hk-strip__tools" data-hk-tools></div></div>';
    const sw = document.createElement("nav"); sw.className = "hk-switch"; sw.setAttribute("aria-label", "Chuyển công cụ");
    sw.innerHTML = link("goi", "Super Goi") + link("bunpou", "Super Bunpou");
    document.body.insertBefore(sw, document.body.firstChild);
    document.body.insertBefore(s, document.body.firstChild);
    const setH = () => document.documentElement.style.setProperty("--hk-h", s.offsetHeight + "px");
    setH(); window.addEventListener("resize", setH); if (window.ResizeObserver) new ResizeObserver(setH).observe(s);
    // màu giao diện và tài khoản của từng app được chuyển lên thanh chung (giữ nguyên nút để mã của app vẫn hoạt động)
    ready(() => {
      const tools = s.querySelector("[data-hk-tools]");
      ["themes", "acct"].forEach(c => { const el = document.querySelector(".top ." + c); if (el) tools.appendChild(el); });
      tools.classList.add("is-ready");
      setH();
    });
  }

  /* ---------- Trang chủ: màu giao diện, tài khoản, hộp thoại đăng nhập ngay tại chỗ ---------- */
  if (page === "home") ready(() => {
    const tools = document.querySelector("[data-hk-tools]");
    const applyTheme = id => { if (!id || id === "reu") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = id; };
    applyTheme(get("honki:theme"));
    if (!tools) return;
    tools.innerHTML = '<div class="hk-themes"><button class="hk-btn" type="button" aria-haspopup="true" aria-expanded="false" data-hk-theme title="Đổi màu giao diện"><i class="hk-dot"></i><span>Màu</span></button><div class="hk-menu" role="menu" hidden></div></div><div class="hk-acct"></div>';
    const tb = tools.querySelector("[data-hk-theme]"), menu = tools.querySelector(".hk-menu");
    menu.innerHTML = "<p>Màu giao diện (dùng chung cho cả Super Honki)</p>" + THEMES.map(t => '<button class="hk-opt" type="button" role="menuitemradio" data-t="' + t.id + '"><span class="hk-sw">' + t.c.map(c => '<i style="background:' + c + '"></i>').join("") + '</span><b>' + t.name + '<small>' + t.note + '</small></b><span class="hk-ja" lang="ja">' + t.ja + '</span></button>').join("");
    const mark = () => { const cur = get("honki:theme") || "reu"; menu.querySelectorAll(".hk-opt").forEach(o => o.setAttribute("aria-checked", o.dataset.t === cur)); };
    mark();
    tb.onclick = e => { e.stopPropagation(); menu.hidden = !menu.hidden; tb.setAttribute("aria-expanded", !menu.hidden); };
    menu.onclick = e => { const o = e.target.closest(".hk-opt"); if (!o) return; put("honki:theme", o.dataset.t); applyTheme(o.dataset.t); mark(); menu.hidden = true; };
    document.addEventListener("click", () => { menu.hidden = true; });

    const acct = tools.querySelector(".hk-acct");
    const session = () => { try { return JSON.parse(get("honki:auth") || "null"); } catch (e) { return null; } };
    const USER_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"/></svg>';
    const paintAcct = () => {
      const ses = session();
      if (!ses) {
        acct.innerHTML = '<button class="hk-btn hk-btn--solid" type="button" data-hk-login>' + USER_ICON + '<span>Đăng nhập</span></button>';
        acct.querySelector("button").onclick = e => { e.stopPropagation(); openLogin(); };
        return;
      }
      const nm = ses.name || ses.email || "?";
      acct.innerHTML = '<button class="hk-btn hk-btn--solid" type="button" title="' + esc(ses.email || "") + '"><b class="hk-av">' + esc(nm.trim().charAt(0).toUpperCase()) + '</b><span>' + esc(nm) + '</span></button><div class="hk-menu hk-menu--sm" hidden><p>' + esc(ses.email || "") + '</p><button class="hk-opt hk-out" type="button">Đăng xuất</button></div>';
      const bt = acct.querySelector("button"), mn = acct.querySelector(".hk-menu");
      bt.onclick = e => { e.stopPropagation(); mn.hidden = !mn.hidden; };
      acct.querySelector(".hk-out").onclick = () => { del("honki:auth"); paintAcct(); };
    };
    paintAcct();

    /* hộp thoại đăng nhập / tạo tài khoản; gọi /api/auth giống trong các app, phiên lưu ở khoá honki:auth dùng chung */
    let dlg = null, probe = null;
    const detect = () => probe || (probe = fetch("/api/auth", { cache: "no-store" }).then(r => r.json()).then(j => !!(j && j.ok && j.ready)).catch(() => false));
    async function openLogin(startMode) {
      if (!dlg) {
        dlg = document.createElement("dialog"); dlg.className = "hk-dlg"; dlg.setAttribute("aria-labelledby", "hk-dlg-t");
        document.body.appendChild(dlg);
        dlg.addEventListener("click", ev => { if (ev.target === dlg) dlg.close(); });
      }
      let mode = startMode || "login", busy = false;
      const ok = await detect();
      const draw = err => {
        const reg = mode === "register";
        dlg.innerHTML = '<div class="hk-dlg__in"><button class="hk-dlg__x" type="button" data-x aria-label="Đóng">×</button>' +
          '<h2 id="hk-dlg-t">' + (reg ? "Tạo tài khoản" : "Đăng nhập") + '</h2>' +
          '<p class="hk-dlg__lead">Một tài khoản dùng chung cho Super Goi và Super Bunpou. Lưu tiến độ học, danh sách từ cần ôn, dùng được trên mọi thiết bị.</p>' +
          (ok ? "" : '<p class="hk-dlg__note"><b>Máy chủ tài khoản chưa bật.</b> Bạn vẫn học bình thường, tiến độ lưu trên thiết bị này. Khi chủ web hoàn tất cấu hình, nút này sẽ hoạt động.</p>') +
          '<div class="hk-dlg__tabs" role="tablist"><button type="button" role="tab" aria-selected="' + !reg + '" data-tab="login">Đăng nhập</button><button type="button" role="tab" aria-selected="' + reg + '" data-tab="register">Tạo tài khoản</button></div>' +
          '<form class="hk-dlg__form" novalidate>' +
          (reg ? '<label>Tên hiển thị <small>(không bắt buộc)</small><input name="name" autocomplete="nickname" maxlength="40"></label>' : "") +
          '<label>Email<input name="email" type="email" autocomplete="email" inputmode="email" required></label>' +
          '<label>Mật khẩu' + (reg ? " <small>(ít nhất 8 ký tự)</small>" : "") + '<span class="hk-pw"><input name="password" type="password" autocomplete="' + (reg ? "new-password" : "current-password") + '" required minlength="8"><button type="button" data-eye aria-pressed="false">Hiện</button></span></label>' +
          '<p class="hk-dlg__err" role="alert">' + esc(err || "") + '</p>' +
          '<button class="hk-go" type="submit"' + (ok ? "" : " disabled") + ">" + (reg ? "Tạo tài khoản" : "Đăng nhập") + '</button>' +
          '<p class="hk-dlg__fine">Chúng tôi chỉ lưu email, tên hiển thị và tiến độ học của bạn.' + (reg ? " Hiện chưa có chức năng khôi phục mật khẩu qua email, hãy nhớ mật khẩu của bạn." : "") + '</p></form></div>';
        dlg.querySelector("[data-x]").onclick = () => dlg.close();
        dlg.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { mode = b.dataset.tab; draw(); first(); });
        dlg.querySelector("[data-eye]").onclick = ev => { const i = dlg.querySelector("input[name=password]"), show = i.type === "password"; i.type = show ? "text" : "password"; ev.currentTarget.textContent = show ? "Ẩn" : "Hiện"; ev.currentTarget.setAttribute("aria-pressed", show); };
        dlg.querySelector("form").addEventListener("submit", submit);
      };
      const first = () => { const i = dlg.querySelector("input"); if (i) i.focus(); };
      async function submit(ev) {
        ev.preventDefault();
        if (busy) return;
        const f = ev.currentTarget, email = f.email.value.trim(), password = f.password.value, name = f.name ? f.name.value.trim() : "";
        const go = dlg.querySelector(".hk-go"), errEl = dlg.querySelector(".hk-dlg__err");
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { errEl.textContent = "Email chưa đúng định dạng."; return; }
        if (password.length < 8) { errEl.textContent = "Mật khẩu cần ít nhất 8 ký tự."; return; }
        errEl.textContent = ""; busy = true; go.disabled = true; go.textContent = "Đang xử lý…";
        try {
          const res = await fetch("/api/auth", { method: "POST", cache: "no-store", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: mode, email, password, name }) });
          const j = await res.json().catch(() => ({}));
          if (!res.ok) { errEl.textContent = j.error || "Máy chủ báo lỗi, hãy thử lại sau."; busy = false; go.disabled = false; go.textContent = mode === "register" ? "Tạo tài khoản" : "Đăng nhập"; return; }
          put("honki:auth", JSON.stringify({ mode: "remote", token: j.token, email: j.user.email, name: j.user.name || "" }));
          dlg.close(); paintAcct();
        } catch (e) {
          errEl.textContent = "Không kết nối được máy chủ. Hãy kiểm tra mạng.";
          busy = false; go.disabled = false; go.textContent = mode === "register" ? "Tạo tài khoản" : "Đăng nhập";
        }
      }
      draw(); if (!dlg.open) dlg.showModal(); first();
    }
    window.HONKI.openLogin = openLogin;
    document.querySelectorAll("[data-open-login]").forEach(a => a.addEventListener("click", ev => { ev.preventDefault(); if (!session()) openLogin(); }));
    if (!session() && /[?&]login=1/.test(location.search)) setTimeout(openLogin, 300);
  });

  /* ---------- Hộp sách của Minh Dokkai (góc dưới bên phải) ---------- */
  ready(() => {
    const f = document.createElement("div"); f.className = "hk-fab";
    f.innerHTML = '<div class="hk-fab__panel" id="hk-panel" role="dialog" aria-label="Sách của Minh Dokkai"><div class="hk-fab__head"><span>Sách của Minh Dokkai</span><button class="hk-fab__x" type="button" aria-label="Đóng">×</button></div>' +
      '<div class="hk-fab__list">' + PRODUCTS.map(p => '<a class="hk-prod" href="' + p.url + '" target="_blank" rel="noopener"><img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy"><span>' + esc(p.name) + '<small>Xem giới thiệu →</small></span></a>').join("") + '</div></div>' +
      '<button class="hk-fab__btn" type="button" aria-expanded="false" aria-controls="hk-panel" aria-label="Sách của Minh Dokkai"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5V5.5"/><path d="M9 8h6"/></svg><span>Sách của Minh Dokkai</span></button>';
    document.body.appendChild(f);
    const btn = f.querySelector(".hk-fab__btn"), toggle = open => { f.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", open); };
    btn.onclick = e => { e.stopPropagation(); toggle(!f.classList.contains("is-open")); };
    f.querySelector(".hk-fab__x").onclick = () => toggle(false);
    document.addEventListener("click", e => { if (!f.contains(e.target)) toggle(false); });
    document.addEventListener("keydown", e => { if (e.key === "Escape") toggle(false); });
  });
})();
