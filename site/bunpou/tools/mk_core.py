import re,sys
SRC=sys.argv[1]
L=open(SRC,encoding='utf8').read().split('\n')
body='\n'.join(L[39:227])
body=body.replace('"md:"','"sb:"')
body=re.sub(r"  function checkAnswer.*?\n  }\n","",body,flags=re.S)
body=body.replace('  const posName = p => p.split(",").map(x => C.posName[x] || x).join(", ");\n','').replace('  const meaningOf = e => e.c ? e.cv : e.vi;\n','')
body=re.sub(r"  const learnedIn = .*?\n","",body)
body=re.sub(r"  const lvtag = .*?\n","",body)
head='''/* Super Bunpou - loi dung chung: luu tru, hien thi tieng Nhat, giong doc, hieu ung. */
window.SB = window.SB || {};
(() => {
  "use strict";
  const C = window.SB_CATALOG;
'''
tail='''
  const lvtag = lv => `<span class="lvtag" data-lv="${lv}">${String(lv).toUpperCase()}</span>`;
  /* van ban hon hop (tieng Viet + tieng Nhat co furigana): giu khoang trang */
  function rich(t, o = {}) {
    if (!t) return "";
    const kanji = o.kanji ?? S.kanji, furi = o.furi ?? S.furi;
    return esc(t).replace(new RegExp(`([${KJ}]+)\\\\[([^\\\\]]+)\\\\]`, "g"), (m, k, r) => kanji ? (furi ? `<ruby>${k}<rt>${r}</rt></ruby>` : k) : r)
      .replace(/「([^」]*)」/g, (m, x) => `<span class="jq" lang="ja">「${x}」</span>`);
  }
  const plain = s => (s || "").replace(RUBY, "$1").replace(/[{}]/g, "");
  Object.assign(window.SB, { C, store, S, P, saveS, saveP, mark, stateOf, listeners, notify, nowSec, esc, jp, rich, kana, surf, plain, hira, romaji, speak, toast,
    ICON_SPEAK, ICON_FLIP, calm, celebrate, wobble, verdict, glow, buzz, pickWord, verdictHTML, scoreRing, doneHTML, afterDone, $, $$, fmt, shuffle, meter, lvtag, band, paintReviewBadge, KJ });
})();
'''
open('core.js','w',encoding='utf8').write(head+body+tail)
