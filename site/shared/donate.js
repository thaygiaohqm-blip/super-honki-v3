/* Mục ủng hộ trên trang chủ: sao chép số tài khoản, nút "Mình đã chuyển khoản" (cảm ơn + báo cho tác giả) */
(function () {
  const done = document.getElementById("donate-done"), thanks = document.getElementById("donate-thanks"), msg = document.getElementById("donate-msg");
  if (!done) return;
  document.querySelectorAll("[data-copy]").forEach(b => b.addEventListener("click", async () => {
    const old = b.textContent;
    try { await navigator.clipboard.writeText(b.dataset.copy); b.textContent = "Đã chép"; }
    catch (e) { const r = document.createRange(); r.selectNodeContents(document.getElementById("donate-acc")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); b.textContent = "Hãy nhấn Ctrl+C"; }
    b.classList.add("is-ok"); setTimeout(() => { b.textContent = old; b.classList.remove("is-ok"); }, 1800);
  }));
  const burst = () => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const r = done.getBoundingClientRect(), box = document.createElement("div"); box.className = "donate__burst"; box.setAttribute("aria-hidden", "true");
    box.style.left = r.left + r.width / 2 + scrollX + "px"; box.style.top = r.top + scrollY + "px";
    const faces = ["♥", "♥", "✦", "♥", "✿"];
    for (let i = 0; i < 18; i++) {
      const h = document.createElement("i"), a = (Math.PI * 2 * i) / 18 + Math.random() * .4, d = 70 + Math.random() * 90;
      h.textContent = faces[i % faces.length];
      h.style.setProperty("--dx", Math.cos(a) * d + "px"); h.style.setProperty("--dy", Math.sin(a) * d - 60 + "px");
      h.style.setProperty("--s", (.8 + Math.random() * .9).toFixed(2)); h.style.color = ["#ed3838", "#ff7a8a", "#ffb454", "#27c4b5"][i % 4];
      box.appendChild(h);
    }
    document.body.appendChild(box); setTimeout(() => box.remove(), 1500);
  };
  done.addEventListener("click", () => {
    if (done.classList.contains("is-done")) return;
    done.classList.add("is-done"); done.innerHTML = '<span class="heart" aria-hidden="true">♥</span> Cảm ơn bạn rất nhiều!';
    thanks.hidden = false; burst();
    if (msg) msg.disabled = true;
    // báo cho tác giả (máy chủ ghi lại lượt và lời nhắn); không có máy chủ thì chỉ hiện lời cảm ơn
    try { fetch("/api/donate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ msg: msg ? msg.value : "" }) }).catch(() => {}); } catch (e) { /* bỏ qua */ }
  });
})();
