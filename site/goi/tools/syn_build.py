#!/usr/bin/env python3
"""Biên dịch source/dongnghia/*.txt thành data/dongnghia.js.

Định dạng:  @ Tiêu đề | nhãn kanji     (bắt đầu nhóm)
            > ghi chú phân biệt         (tuỳ chọn)
            từ | sắc thái
Mỗi từ được đối chiếu với kho từ (data/n*.js, giaotrinh.js, nganh.js) theo mặt chữ.
Từ không có trong kho bị bỏ và được báo cáo; nhóm còn <2 từ bị loại.
Chạy: python3 tools/syn_build.py [--report]
"""
import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent))
import build as B
ROOT = Path(__file__).resolve().parent.parent
RUBY = re.compile(r"([㐀-䶿一-鿿豈-﫿々〆ヶヵ]+)\[([^\]]+)\]")

def surf(w): return RUBY.sub(lambda m: m.group(1), w).replace(" ", "")

def load_items():
    items = []
    for f in sorted((ROOT/"data").glob("*.js")):
        if not re.fullmatch(r"n[1-5]\.js", f.name): continue
        txt = f.read_text(encoding="utf-8")
        s = txt.index("(") + 1
        try: obj = json.loads(txt[s:txt.rindex(")")])
        except Exception: continue
        for t in obj.get("topics", []): items += t.get("items", [])
    return items

def keys(it):
    s = surf(it["w"]); out = {s}
    for suf in ("する", "な", "に", "と"):
        if s.endswith(suf) and len(s) > len(suf): out.add(s[:-len(suf)])
    return out

def parse():
    groups, g = [], None
    for f in sorted((ROOT/"source"/"dongnghia").glob("*.txt")):
        for ln in f.read_text(encoding="utf-8").splitlines():
            ln = ln.rstrip()
            if not ln or ln.startswith("#"): continue
            if ln.startswith("@"):
                a = [x.strip() for x in ln[1:].split("|")]
                g = {"t": a[0], "k": a[1] if len(a) > 1 else "", "n": "", "m": [], "src": f.stem}
                groups.append(g)
            elif ln.startswith(">"): g["n"] = ln[1:].strip()
            else:
                a = [x.strip() for x in ln.split("|", 2)]
                g["m"].append({"w": a[0], "nu": a[1] if len(a) > 1 else "", "ex": a[2] if len(a) > 2 else ""})
    return groups

def main():
    items = load_items(); extras = []
    ef = ROOT/"source"/"dongnghia"/"extras.txt"
    for ln in ef.read_text(encoding="utf-8").splitlines():
        if not ln.startswith("+"): continue
        a = [x.strip() for x in ln[1:].split("|")]
        it = {"w": a[0], "r": a[1], "rm": B.phrase_romaji(a[0]), "p": a[2], "hv": a[3], "vi": a[4], "c": "", "cr": "", "cv": "",
              "e": a[5], "ev": a[6], "id": "x-%03d" % (len(extras)+1), "lv": "n3"}
        extras.append(it); items.append(it)
    idx = {}
    for it in items:
        for k in keys(it): idx.setdefault(k, []).append(it)
    out, miss, dropped, used = [], [], [], 0
    for g in parse():
        mem, seen = [], set()
        for m in g["m"]:
            c = idx.get(m["w"])
            if not c: miss.append((g["t"], m["w"])); continue
            it = c[0]
            if it["id"] in seen: continue
            seen.add(it["id"]); mem.append({"id": it["id"], "nu": m["nu"]})
        if len(mem) < 2: dropped.append(g["t"]); continue
        out.append({"t": g["t"], "k": g["k"], "n": g["n"], "m": mem}); used += len(mem)
    js = "MD.registerSyn(" + json.dumps({"groups": out, "extras": extras}, ensure_ascii=False, separators=(",", ":")) + ");\n"
    (ROOT/"data"/"dongnghia.js").write_text(js, encoding="utf-8")
    print(f"kho {len(items)} từ | nhóm {len(out)} | thành viên {used} | thiếu {len(miss)} | nhóm bỏ {len(dropped)}")
    if "--report" in sys.argv:
        Path("/tmp/syn_miss.txt").write_text("\n".join(f"{a}\t{b}" for a, b in miss), encoding="utf-8")
        Path("/tmp/syn_drop.txt").write_text("\n".join(dropped), encoding="utf-8")
main()
