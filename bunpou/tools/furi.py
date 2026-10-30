"""Gắn furigana tự động (kanji[reading]) cho câu tiếng Nhật, giữ nguyên chú âm có sẵn."""
import re
from fugashi import Tagger
TAG = Tagger()
KJ = r'㐀-䶿一-鿿豈-﫿々〆ヶヵ'
RUBY = re.compile(f'｜([{KJ}]+)\\[([^\\]]+)\\]|([{KJ}]+)\\[([^\\]]+)\\]')
HAS_K = re.compile(f'[{KJ}]')
def kata2hira(s): return ''.join(chr(ord(c)-0x60) if 'ァ' <= c <= 'ヶ' else c for c in s)
OVR = {  # (surface, katakana reading from dictionary) -> reading ; or surface -> reading
    ('行っ','オコナッ'):'いっ', ('行っ','ギョウ'):'いっ', ('行き','オコナイ'):'いき', ('行く','オコナウ'):'いく', ('言う','ユウ'):'いう', ('言っ','ユッ'):'いっ', ('言い','ユイ'):'いい', ('言え','ユエ'):'いえ', ('言わ','ユワ'):'いわ', ('言お','ユオ'):'いお', ('行け','オコナエ'):'いけ',
    ('行か','オコナワ'):'いか', ('行こ','オコナオ'):'いこ', ('行っ','ユキ'):'いっ',
    ('今日','コンニチ'):'きょう', ('昨日','サクジツ'):'きのう', ('明日','ミョウニチ'):'あした', ('明日','アス'):'あした',
    ('大人','オトナ'):'おとな', ('一人','イチニン'):'ひとり', ('二人','ニニン'):'ふたり', ('上手','ジョウズ'):'じょうず',
    ('私','ワタクシ'):'わたし', ('何','ナン'):'なに', ('方','ホウ'):'ほう', ('人','ヒト'):'ひと', ('後','ノチ'):'あと',
    ('間','アイダ'):'あいだ',('日本','ニッポン'):'にほん',('日本語','ニッポンゴ'):'にほんご',('日本','ニホン'):'にほん',('他','ホカ'):'ほか', ('外','ソト'):'そと',
}
def reading_of(w, nxt):
    f = w.feature
    k = getattr(f, 'kana', None) or getattr(f, 'pron', None)
    s = w.surface
    key = (s, k)
    if key in OVR: return OVR[key]
    if s in OVR: return OVR[s]
    if k is None or k == '*': return None
    return kata2hira(k)
def align(surface, reading):
    """surface chứa kanji + kana (okurigana). Trả về chuỗi kanji[đọc]kana hoặc None nếu lệch."""
    parts = re.findall(f'[{KJ}]+|[^{KJ}]+', surface)
    pat = ''
    for p in parts:
        if HAS_K.match(p): pat += '(.+?)'
        else: pat += re.escape(kata2hira(p))
    m = re.fullmatch(pat, reading)
    if not m: return None
    out = ''; gi = 1
    for p in parts:
        if HAS_K.match(p): out += f'{p}[{m.group(gi)}]'; gi += 1
        else: out += p
    return out
def ruby_plain(text):
    """Chuỗi chưa có {} -> chuỗi có kanji[reading] cho mọi cụm kanji."""
    toks = list(TAG(text))
    out = ''
    for i, w in enumerate(toks):
        s = w.surface
        if not HAS_K.search(s): out += s; continue
        r = reading_of(w, toks[i+1] if i+1 < len(toks) else None)
        a = align(s, r) if r else None
        if a: out += a
        else: out += s  # không chắc: để nguyên, báo cáo sau
    # gộp các cụm kanji liền nhau do máy tách (自転[じてん]車[しゃ] -> 自転車[じてんしゃ])
    prev = None
    while prev != out:
        prev = out
        out = re.sub(f'([{KJ}]+)\\[([ぁ-ゟー]+)\\]([{KJ}]+)\\[([ぁ-ゟー]+)\\]', r'\1\3[\2\4]', out)
    return out
def add_ruby(text):
    """Giữ ruby sẵn có; gắn ruby cho phần còn lại. Trả (chuỗi, danh sách kanji chưa có đọc)."""
    out = ''; pos = 0; miss = []
    for m in RUBY.finditer(text):
        seg = text[pos:m.start()]
        out += ruby_plain(seg) if HAS_K.search(seg) else seg
        out += (m.group(1) or m.group(3)) + '[' + (m.group(2) or m.group(4)) + ']'; pos = m.end()
    seg = text[pos:]
    out += ruby_plain(seg) if HAS_K.search(seg) else seg
    # kanji chưa có ruby
    chk = RUBY.sub('', out)
    miss = HAS_K.findall(chk)
    return out, miss
