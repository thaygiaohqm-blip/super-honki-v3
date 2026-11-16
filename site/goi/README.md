
## Từ đồng nghĩa

Trang `#/tu-loai/dong-nghia` gom từ gần nghĩa thành nhóm (tính từ, động từ và danh từ chỉ hành động, phó từ và liên từ), mỗi từ có ghi chú sắc thái. Lọc theo loại, cấp độ, tìm kiếm, luyện cả nhóm, và mặt sau thẻ có dòng "Đồng nghĩa".

- Nguồn: `source/dongnghia/*.txt` (định dạng: `@ Tiêu đề | nhãn kanji`, dòng `>` là ghi chú phân biệt, mỗi từ một dòng `từ | sắc thái`). `extras.txt` thêm những từ chưa có trong kho (ví dụ 美しい).
- Biên dịch: `python3 tools/syn_build.py --report` tạo `data/dongnghia.js` và ghi báo cáo từ chưa có trong kho vào `/tmp/syn_miss.txt`. Chỉ đối chiếu với kho N5 đến N1; từ không có trong kho bị bỏ, nhóm còn dưới 2 từ bị loại.
