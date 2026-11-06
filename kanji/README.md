# Super Kanji

Ứng dụng tĩnh (HTML/CSS/JS, không cần build) nằm ở `kanji/`, chạy cùng các app khác của Super Honki.

- `index.html`, `assets/app.js`, `assets/style.css`: giao diện và logic (4 tab: JLPT, Gia đình Kanji, Giáo trình, Bộ thủ).
- `data/k1.js … k5.js`: dữ liệu từng cấp N1–N5 (Hán Việt, nghĩa, on/kun, số nét, bộ thủ, thành phần, nguồn gốc, cách nhớ, gia đình).
- `data/meta.js`: 214 bộ thủ, cấu trúc các chương giáo trình, danh sách gia đình Kanji.
- `data/s/s1.js … s5.js`: nét viết từ KanjiVG, chỉ tải khi mở chi tiết chữ.
- `tools/`: script `build.py` và dữ liệu biên soạn để sinh lại các file `data/`.

## Sửa nội dung

Hán Việt và nghĩa tiếng Việt nằm ở `tools/data/vi/*.txt` (mỗi dòng `chữ|HÁN VIỆT|nghĩa`). Cấu trúc chương nằm ở `tools/data/toc.txt`. Tên và nghĩa của 214 bộ thủ ở `tools/data/radicals.txt`. Sửa xong chạy lại `build.py`.

Phần “nguồn gốc” và “cách nhớ” hiện sinh tự động từ cấu tạo chữ (hình thanh hay hội ý, thành phần, âm đọc). Muốn viết tay cho từng chữ, thêm một bảng ghi đè trong `build.py` (ví dụ `OVERRIDE = {"瞳": {"o": "...", "n": "..."}}`) rồi áp dụng sau khi tạo bản ghi.

## Sinh lại dữ liệu

Tải nguồn mở vào `tools/work/src/` (không đưa lên git): `kanjidic2.xml.gz` (EDRDG), thư mục `kanjivg/kanji/*.svg` (KanjiVG), `ids.txt` (cjkvi-ids). Sau đó chạy `python3 tools/build.py`.

## Giấy phép dữ liệu

KANJIDIC2 (EDRDG, CC BY-SA 4.0), KanjiVG (CC BY-SA 3.0), CHISE IDS / cjkvi-ids (GPL). Đã ghi nguồn ở chân trang. Nội dung sách Kanji Master chỉ được dùng để dựng cấu trúc chương và danh sách chữ trong từng chương; không sao chép phần giải thích của sách.

## Tiến độ

Lưu trong `localStorage` khoá `honki:kanji:v1` (chữ đã thuộc, chữ hay sai, điểm test tốt nhất). Chưa đồng bộ qua tài khoản; muốn đồng bộ cần mở rộng `api/progress.js` (danh sách app hợp lệ hiện là `goi|bunpou`).
