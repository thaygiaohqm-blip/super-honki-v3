# Super Honki

Bộ công cụ học tiếng Nhật của Minh Dokkai. Website tĩnh (HTML, CSS, JavaScript thuần), không cần build; chỉ chức năng tài khoản đồng bộ nhiều thiết bị cần thêm cơ sở dữ liệu.

```
index.html            trang chủ Super Honki
shared/               logo, thanh chuyển app, hộp "Sách của Minh Dokkai", ảnh sách
goi/                  Super Goi (từ vựng theo cụm), có README riêng ở tools/
bunpou/               Super Bunpou (ngữ pháp N5–N1)
api/                  đăng ký, đăng nhập, lưu tiến độ (Vercel Functions)
package.json, vercel.json, .env.example
```

Sắp tới sẽ thêm thư mục `kanji/` (Super Kanji). Muốn thêm một app: tạo thư mục mới, trong `index.html` của app thêm `<body data-honki="tên">` và `<script src="../shared/honki.js"></script>`, rồi thêm một thẻ vào trang chủ.

## Chạy thử trên máy

Mở terminal trong thư mục này và gõ `python3 -m http.server 8000`, rồi vào http://localhost:8000. Khi chưa có máy chủ tài khoản, nút Đăng nhập chạy ở "chế độ trên thiết bị": tài khoản và tiến độ chỉ nằm trong trình duyệt đó.

## Đưa lên Vercel và bật tài khoản (làm một lần, khoảng 3 phút)

1. Đẩy cả thư mục lên GitHub rồi vào vercel.com, Add New, Project, chọn repo. Framework chọn "Other", không cần lệnh build.
2. Trong dự án, vào Storage (hoặc Marketplace), thêm "Upstash Redis" (gói miễn phí đủ dùng) và nối vào dự án. Vercel tự thêm `KV_REST_API_URL` và `KV_REST_API_TOKEN`.
3. Vào Settings, Environment Variables, thêm `AUTH_SECRET` là một chuỗi ngẫu nhiên dài (chạy `openssl rand -hex 32`). Đừng đổi sau này, nếu đổi thì mọi người phải đăng nhập lại. Mẫu các biến có trong `.env.example`.
4. Deploy lại. Mở Super Goi hoặc Super Bunpou, bấm Đăng nhập: hộp thoại không còn dòng "Chế độ trên thiết bị" là đã chạy bằng máy chủ.

Một tài khoản dùng chung cho cả hai app. Tiến độ mỗi app lưu riêng (`/api/progress?app=goi` và `?app=bunpou`), nên học bên này không ghi đè bên kia. Mật khẩu băm bằng scrypt, đăng nhập sai quá 10 lần trong 15 phút sẽ bị khóa tạm. Chưa có quên mật khẩu qua email.

Netlify không chạy được thư mục `api/` theo định dạng này; muốn có tài khoản đồng bộ hãy dùng Vercel.

## Sửa dữ liệu

Super Goi: sửa `goi/source/<cấp>/tXX.txt` rồi chạy `python3 goi/tools/build.py`.

Super Bunpou: sửa `bunpou/source/gram/<cấp>.txt` rồi chạy `python3 bunpou/tools/build.py`. Đề trắc nghiệm Minna nằm ở `bunpou/tools/minnasrc/`; sau khi sửa chạy `python3 bunpou/tools/ex_build.py minna`. Bản dịch tiếng Việt hiện sau mỗi câu nằm ở `bunpou/tools/minnasrc/vi-minna.tsv` (mỗi dòng: câu hoàn chỉnh, một dấu Tab, bản dịch); chạy `python3 bunpou/tools/vi_build.py` để cập nhật, và `node bunpou/tools/vi_todo.js` để liệt kê câu mới còn thiếu bản dịch.

## Chạy thử trên máy

`node dev-server.js` (mặc định cổng 8000, đổi bằng biến PORT). Máy chủ phục vụ các trang tĩnh và giả lập /api bằng bộ nhớ tạm, nên đăng ký và đăng nhập thử được mà không cần Upstash. Khi triển khai thật cần KV_REST_API_URL, KV_REST_API_TOKEN và AUTH_SECRET.

## Màu giao diện và tài khoản dùng chung

Màu chủ đề lưu ở khoá `honki:theme`, phiên đăng nhập ở `honki:auth` (cùng một nguồn gốc nên trang chủ, /goi/ và /bunpou/ dùng chung). Nút Màu và Tài khoản luôn nằm góc trên bên phải của thanh Super Honki. Tiến độ học vẫn lưu riêng từng app (`app=goi` hoặc `app=bunpou`).
