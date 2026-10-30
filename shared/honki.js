/* Super Honki — thanh chuyển app + hộp sách của Minh Dokkai (dùng chung cho trang chủ, Super Goi, Super Bunpou) */
(function () {
  const me = document.currentScript && document.currentScript.src || "";
  const base = me.replace(/honki\.js.*$/, "");
  const root = base.replace(/shared\/$/, "");
  const PRODUCTS = [
    { img: base + "img/huyen-luc-thu.jpg", name: "Bộ sách Huyền Lục Thư", sub: "Học Kanji bằng Lục Thư cải tiến (3 cuốn)", url: "https://www.minhdokkai.com/s%C3%A1ch/huy%E1%BB%81n-l%E1%BB%A5c-th%C6%B0-3-cu%E1%BB%91n" },
    { img: base + "img/14-ngay.jpg", name: "14 NGÀY học hết từ vựng tiếng Nhật N5, N4", sub: "Sách của Minh Dokkai", url: "https://www.minhdokkai.com/s%C3%A1ch/14-ng%C3%A0y-h%E1%BB%8Dc-h%E1%BA%BFt-t%E1%BB%AB-v%E1%BB%B1ng-n5-n4" }
  ];
  window.HONKI = { products: PRODUCTS, root };

  const css = document.createElement("link"); css.rel = "stylesheet"; css.href = base + "honki.css"; document.head.appendChild(css);

  const esc = t => String(t).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const page = document.body.dataset.honki;           // "home" | "goi" | "bunpou"
  const THEMES = [
    { id: "reu", ja: "苔", name: "Rêu", note: "Xanh rêu, mặc định", c: ["#004646", "#27c4b5", "#ed3838", "#f7f4ed"] },
    { id: "ai", ja: "藍", name: "Chàm", note: "Xanh chàm, dịu mắt", c: ["#233a63", "#5fa8d8", "#e0533d", "#f1f3f7"] },
    { id: "sakura", ja: "桜", name: "Anh đào", note: "Hồng mận, ấm áp", c: ["#7a2e4a", "#ee8fae", "#d23b3b", "#fbf1f2"] },
    { id: "matcha", ja: "抹茶", name: "Trà xanh", note: "Xanh lá, tự nhiên", c: ["#3f5a22", "#a3c45a", "#d9622b", "#f4f2e4"] },
    { id: "momiji", ja: "紅葉", name: "Lá phong", note: "Nâu đỏ mùa thu", c: ["#7a2f14", "#f2a04a", "#c8102e", "#faf0e3"] },
    { id: "yoru", ja: "夜", name: "Ban đêm", note: "Nền tối, học buổi tối", c: ["#0b1416", "#134e4c", "#3fd1c0", "#ff6b6b"] }];
  if (page === "goi" || page === "bunpou") {
    // Thanh thương hiệu chung: logo Super Honki lớn, chuyển app, và hai công cụ dùng chung (màu giao diện, tài khoản) lấy từ phần đầu của app.
    const s = document.createElement("div"); s.className = "hk-strip";
    s.innerHTML = '<div class="hk-strip__in"><a class="hk-strip__brand" href="' + root + '" title="Về trang chủ Super Honki"><img src="' + base + 'logo-mark.svg" alt="" width="48" height="48"><span><b>Super</b> Honki</span></a>' +
      '<nav class="hk-strip__nav" aria-label="Các công cụ của Super Honki"><a href="' + root + 'goi/"' + (page === "goi" ? ' aria-current="true"' : "") + '>Super Goi</a><a href="' + root + 'bunpou/"' + (page === "bunpou" ? ' aria-current="true"' : "") + '>Super Bunpou</a><span class="hk-strip__soon" title="Sắp ra mắt">Super Kanji · sắp có</span></nav><span class="hk-strip__grow"></span><div class="hk-strip__tools" data-hk-tools></div></div>';
    document.body.insertBefore(s, document.body.firstChild);
    const setH = () => document.documentElement.style.setProperty("--hk-h", s.offsetHeight + "px");
    setH(); window.addEventListener("resize", setH); if (window.ResizeObserver) new ResizeObserver(setH).observe(s);
    const tools = s.querySelector("[data-hk-tools]");
    ["themes", "acct"].forEach(c => { const el = document.querySelector(".top ." + c); if (el) tools.appendChild(el); });
  }
  if (page === "home") {
    const tools = document.querySelector("[data-hk-tools]");
    const get = k => { try { return localStorage.getItem(k); } catch (e) { return null; } };
    const applyTheme = id => { if (!id || id === "reu") delete document.documentElement.dataset.theme; else document.documentElement.dataset.theme = id; };
    applyTheme(get("honki:theme"));
    if (tools) {
      tools.innerHTML = '<div class="hk-themes"><button class="hk-btn" type="button" aria-haspopup="true" aria-expanded="false" data-hk-theme title="Đổi màu giao diện"><i class="hk-dot"></i><span>Màu</span></button><div class="hk-menu" role="menu" hidden></div></div><div class="hk-acct"></div>';
      const tb = tools.querySelector("[data-hk-theme]"), menu = tools.querySelector(".hk-menu");
      menu.innerHTML = "<p>Màu giao diện (dùng chung cho cả Super Honki)</p>" + THEMES.map(t => '<button class="hk-opt" type="button" role="menuitemradio" data-t="' + t.id + '"><span class="hk-sw">' + t.c.map(c => '<i style="background:' + c + '"></i>').join("") + '</span><b>' + t.name + '<small>' + t.note + '</small></b><span class="hk-ja" lang="ja">' + t.ja + '</span></button>').join("");
      const mark = () => { const cur = get("honki:theme") || "reu"; menu.querySelectorAll(".hk-opt").forEach(o => o.setAttribute("aria-checked", o.dataset.t === cur)); };
      mark();
      tb.onclick = e => { e.stopPropagation(); menu.hidden = !menu.hidden; tb.setAttribute("aria-expanded", !menu.hidden); };
      menu.onclick = e => { const o = e.target.closest(".hk-opt"); if (!o) return; try { localStorage.setItem("honki:theme", o.dataset.t); } catch (x) { /* bỏ qua */ } applyTheme(o.dataset.t); mark(); menu.hidden = true; };
      document.addEventListener("click", () => { menu.hidden = true; });
      const acct = tools.querySelector(".hk-acct");
      const paintAcct = () => {
        let ses = null; try { ses = JSON.parse(get("honki:auth") || "null"); } catch (e) { /* bỏ qua */ }
        if (!ses) { acct.innerHTML = '<a class="hk-btn hk-btn--solid" href="' + root + 'bunpou/?login=1">Đăng nhập</a>'; return; }
        const nm = ses.name || ses.email || "?";
        acct.innerHTML = '<button class="hk-btn hk-btn--solid" type="button" title="' + esc(ses.email || "") + '"><b class="hk-av">' + esc(nm.trim().charAt(0).toUpperCase()) + '</b><span>' + esc(nm) + '</span></button><div class="hk-menu hk-menu--sm" hidden><p>' + esc(ses.email || "") + '</p><button class="hk-opt hk-out" type="button">Đăng xuất</button></div>';
        const bt = acct.querySelector("button"), mn = acct.querySelector(".hk-menu");
        bt.onclick = e => { e.stopPropagation(); mn.hidden = !mn.hidden; };
        acct.querySelector(".hk-out").onclick = () => { try { localStorage.removeItem("honki:auth"); } catch (e) { /* bỏ qua */ } paintAcct(); };
      };
      paintAcct();
    }
  }

  const f = document.createElement("div"); f.className = "hk-fab";
  f.innerHTML = '<div class="hk-fab__panel" id="hk-panel" role="dialog" aria-label="Sản phẩm của Minh Dokkai"><div class="hk-fab__head"><span>Sách của Minh Dokkai</span><button class="hk-fab__x" type="button" aria-label="Đóng">×</button></div>' +
    PRODUCTS.map(p => '<a class="hk-prod" href="' + p.url + '" target="_blank" rel="noopener"><img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy"><span>' + esc(p.name) + '<small>Xem giới thiệu →</small></span></a>').join("") + '</div>' +
    '<button class="hk-fab__btn" type="button" aria-expanded="false" aria-controls="hk-panel"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5V5.5"/><path d="M9 8h6"/></svg>Sách của Minh Dokkai</button>';
  document.body.appendChild(f);
  const btn = f.querySelector(".hk-fab__btn"), toggle = open => { f.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", open); };
  btn.onclick = () => toggle(!f.classList.contains("is-open"));
  f.querySelector(".hk-fab__x").onclick = () => toggle(false);
  document.addEventListener("keydown", e => { if (e.key === "Escape") toggle(false); });
})();
