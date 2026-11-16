/* Giọng đọc chung cho cả bốn ứng dụng: tiếng Nhật chuẩn Tokyo, giọng nữ.
   Trình duyệt tự có sẵn các giọng này tùy thiết bị, nên module chọn giọng nữ Nhật tốt nhất đang có,
   theo thứ tự ưu tiên, và loại hẳn các giọng nam đã biết. */
(function () {
  if (window.HonkiTTS) return;
  const ok = "speechSynthesis" in window;
  /* giọng nữ, xếp từ tự nhiên nhất xuống */
  const FEMALE = [
    /nanami/i,                 /* Microsoft Nanami Online (Natural), Edge và Windows 11 */
    /kyoko.*(premium|enhanced|プレミアム|拡張)/i,
    /kyoko|きょうこ/i,         /* iPhone, iPad, Mac */
    /o-?ren|オーレン/i,        /* iPhone, Mac */
    /google.*(日本語|japanese)|(日本語|japanese).*google/i,  /* Chrome, Android */
    /ayumi/i, /haruka/i, /sayaka/i, /mizuki/i, /shiori/i, /mei\b/i, /hikari/i, /sakura/i
  ];
  /* giọng nam hoặc giọng không phải Tokyo: không dùng */
  const MALE = /otoya|hattori|ichiro|keita|takumi|daichi|naoki|ryo\b|kenji|jiro|male(?!\w)|男|osaka|kansai/i;
  let voice = null, checked = false;

  function pick() {
    if (!ok) return;
    const vs = speechSynthesis.getVoices().filter(v => /^ja([-_]|$)/i.test(v.lang) || /japan|日本/i.test(v.name));
    if (!vs.length) return;
    checked = true;
    const fine = vs.filter(v => !MALE.test(v.name));
    const pool = fine.length ? fine : vs;
    let best = null;
    for (const re of FEMALE) {
      const hit = pool.filter(v => re.test(v.name));
      if (hit.length) { best = hit[0]; break; }
    }
    voice = best || pool.find(v => /^ja[-_]JP/i.test(v.lang)) || pool[0];
  }
  if (ok) { pick(); speechSynthesis.addEventListener("voiceschanged", pick); }

  function utter(text, rate) {
    const u = new SpeechSynthesisUtterance(text);
    u.lang = "ja-JP";
    if (voice) u.voice = voice;
    u.rate = rate || 0.9;
    u.pitch = 1.08;           /* hơi cao hơn một chút cho đúng chất giọng nữ */
    return u;
  }

  window.HonkiTTS = {
    supported: ok,
    hasVoice: () => !ok || !checked || !!voice,
    voiceName: () => voice ? voice.name : "",
    utter,
    speak(text, rate) {
      if (!ok || !text) return false;
      speechSynthesis.cancel();
      speechSynthesis.speak(utter(text, rate));
      return true;
    }
  };
})();
