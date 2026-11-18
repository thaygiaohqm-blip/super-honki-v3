(function () {
  "use strict";
  var REG_URL = "https://ankipan.net/classes/admissions/org_sm9r9rha3chh";
  var TEACHER_FORM = "https://docs.google.com/forms/d/e/1FAIpQLSetSZQdxM087qRaLsBXkoloy2ZK4OGIiJBkHoaQudDH4qL2OQ/viewform?usp=sharing";
  var main = document.getElementById("main");
  var esc = function (s) { return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) { return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]; }); };

  /* ---- Khung giáo trình và phân bổ buổi học (theo file Tổng quan quy trình giảng dạy) ---- */
  var CURR = {
    n5: { lv: "lv5", book: "Kanji: Kanji Master + PPT · Từ vựng: Web Super Goi + Test · Ngữ pháp: Minna no Nihongo + PPT · Đọc hiểu, Nghe hiểu: tài liệu sưu tầm · Luyện đề: đề thi thật các năm + bộ giáo trình luyện đề toàn tập",
      b: ["Kanji, Từ vựng", "Ngữ pháp", "Đọc hiểu, Nghe hiểu"] },
    n4: { lv: "lv4", book: "Kanji: Kanji Master + PPT · Từ vựng: Web Super Goi + Test · Ngữ pháp: Minna no Nihongo + PPT · Đọc hiểu, Nghe hiểu: tài liệu sưu tầm · Luyện đề: đề thi thật các năm + bộ giáo trình luyện đề toàn tập",
      b: ["Kanji, Từ vựng", "Ngữ pháp", "Đọc hiểu, Nghe hiểu"] },
    n3: { lv: "lv3", book: "Kanji: Kanji Master + PPT · Từ vựng: Mimikara Oboeru + Web Super Goi · Ngữ pháp: Try! / Shinkanzen + Web Super Bunpou · Đọc hiểu, Nghe hiểu: Shinkanzen · Luyện đề: đề thi thật các năm + bộ giáo trình luyện đề toàn tập",
      b: ["Từ vựng, Kaiwa (giao tiếp)", "Kanji, Ngữ pháp", "Đọc hiểu, Nghe hiểu"] },
    n2: { lv: "lv2", book: "Kanji: Kanji Master + PPT · Từ vựng: Mimikara Oboeru + Web Super Goi · Ngữ pháp: giáo trình nội bộ + Web Super Bunpou · Đọc hiểu: Shinkanzen Dokkai · Nghe hiểu: Shinkanzen Choukai · Luyện đề: đề thi thật các năm + bộ giáo trình luyện đề toàn tập",
      b: ["Từ vựng, Nghe hiểu", "Kanji, Ngữ pháp", "Đọc hiểu"] }
  };
  var TERM = "Tháng 12/2026 – tháng 7/2027";
  var DAYS = { "246": "Thứ 2 – 4 – 6", "357": "Thứ 3 – 5 – 7" };
  /* [tên lớp, trình độ, buổi, ngày, giờ, chủ nhiệm khối, [GV1,GV2,GV3], [TG1,TG2,TG3]] — theo bảng phân bổ giáo viên kì 12/2026 – 7/2027 */
  var NEW = [
    ["N5 HARU 5", "n5", "morning", "246", "5:30 – 7:00", "Hồng Trang", ["Kim Ngân (đọc, nghe thứ 2, 4, 6)", "Phùng Xuân", "Niềm (ngữ pháp thứ 2, 4, 6)"], ["Văn Trung Hiếu", "Hạnh Sang", "Nguyễn Thị Ngọc"]],
    ["N5 HARU 7", "n5", "morning", "246", "7:30 – 9:00", "Hồng Trang", ["Tú Trinh (kanji, đọc thứ 2, 6)", "Vạn Trúc (ngữ pháp, thứ 4)", "Phương Thảo"], []],
    ["N4 NATSU 5", "n4", "morning", "246", "5:30 – 7:00", "Ngọc Tâm", ["Ưng Thu Nguyệt", "Vương Hạnh", "Nguyễn Vân"], ["Tạ Thùy Linh", "Nguyễn Tiêu Nhất Duy", "Minh Diễm"]],
    ["N4 NATSU 7", "n4", "morning", "246", "7:30 – 9:00", "Ngọc Tâm", ["Ngô Thuỷ", "Minh Ngọc", "Hạnh Sang"], []],
    ["N3 AKI 5", "n3", "morning", "357", "5:30 – 7:00", "Hoài Linh", ["Trần Gấm (thứ 7, ngữ pháp)", "Nhàn Nguyễn"], ["Mỹ Hạnh (ngữ pháp thứ 5, thứ 7)", "Mỹ Hạnh (đọc hiểu thứ 5, thứ 7)", "Ngọc Hoàn (thứ 3)"]],
    ["N3 AKI 7", "n3", "morning", "357", "7:30 – 9:00", "Hoài Linh", ["Linh (đọc)", "Phúc Hiền (ngữ pháp)", "Thảo Thảo"], ["Diệu Liên (thứ 3)", "Bé Hoan (thứ 5)"]],
    ["N2 FUYU 5", "n2", "morning", "357", "5:30 – 7:00", "Nguyễn Liên", ["Kim Phụng (thứ 7: từ vựng + nghe)", "Hồng Nhung"], []],
    ["N2 FUYU 7", "n2", "morning", "357", "7:30 – 9:00", "Nguyễn Liên", ["Trần Gấm (thứ 3: đọc hiểu)", "Nguyễn Dương (thứ 5: ngữ pháp)", "Nguyễn Thị Liên (thứ 7: từ vựng + nghe)"], []],
    ["N5 HARU 4", "n5", "evening", "246", "17:30 – 19:00", "Lê Trang", ["Loan Xoăn", "Nguyễn Hồng Phượng", "Lê Cúc"], ["Khưu Gia Lập", "Đỗ Xuân Tốt", "Bảo Anh"]],
    ["N5 HARU 6", "n5", "evening", "246", "19:30 – 21:00", "Lê Trang", ["Cao Tuấn (thứ 2 – 4: tất cả)", "Thu Huyền (thứ 2)", "Lê Hoa"], ["Bùi Hằng", "Thu Huyền Trần", "Trần Hiếu"]],
    ["N4 NATSU 4", "n4", "evening", "246", "17:30 – 19:00", "Thùy Dung", ["Nụ Hương Hoà (ngữ pháp, thứ 4)", "Bảo Minh (đọc, nghe)", "Phố Ng"], ["Ngô Thị Anh", "Hà Hạnh", "Dương Trúc (thứ 2, thứ 4)"]],
    ["N4 NATSU 6", "n4", "evening", "246", "19:30 – 21:00", "Thùy Dung", ["Trâm", "Lê Hoa", "Mỹ Ngọc"], ["Nguyễn Hiền", "Ngân Nhí", "Trang Quách"]],
    ["N3 AKI 4", "n3", "evening", "357", "17:30 – 19:00", "Hoàng Quỳnh", ["Anh Đào", "Nguyệt Nguyễn (thứ 7)"], ["Nguyễn Huyền (thứ 7)", "Bùi Thị Hằng (thứ 5, ngữ pháp)", "Bé Hoan (thứ 3)"]],
    ["N3 AKI 6", "n3", "evening", "357", "19:30 – 21:00", "Hoàng Quỳnh", ["Đỗ Thị Thúy (đọc, nghe)", "Ưng Thu Nguyệt (kanji, ngữ pháp)", "Đỗ Đức Duy (từ vựng, kaiwa)"], ["Phương Em", "Ngân Nhí", "Dương Hà (thứ 3, thứ 5)"]],
    ["N2 FUYU 4.2", "n2", "evening", "357", "17:30 – 19:00", "Lê Hoa", ["Kim Phụng (từ vựng, nghe thứ 7)"], []],
    ["N2 FUYU 6", "n2", "evening", "357", "19:30 – 21:00", "Lê Hoa", ["Thu Hằng", "Yến Yến", "Phương Chi (ngữ pháp, thứ 3 hoặc thứ 5)"], ["Kim Dung"]]
  ].map(function (r) {
    var c = CURR[r[1]];
    return { code: r[1].toUpperCase(), name: r[0], lvl: c.lv, session: r[2], status: "open", registerUrl: REG_URL,
      schedule: DAYS[r[3]] + ", " + r[4] + " (giờ Việt Nam)", duration: TERM + " (3 buổi/tuần)", textbook: c.book,
      start: "Tháng 12/2026", head: r[5], gv: r[6], tg: r[7], buoi: c.b };
  });
  var OLD = [

    {
      code:"N5", name:"N5 HARU 3", lvl:"lv5", session:"morning", status:"closed", registerUrl:null,
      schedule:"Sáng Thứ 2 – 4 – 6, 7:30 – 9:00 (giờ Việt Nam)",
      duration:"6 tháng", textbook:"Minna no Nihongo",
      start:"Tuần thứ 3, tháng 9/2026", teacher:"Cô Lương Thu, Cô Trần Nhung",
      note:"Lớp dành cho người mới bắt đầu, xây nền chữ viết – ngữ pháp – từ vựng cơ bản."
    },
    {
      code:"N4", name:"N4 NATSU 3", lvl:"lv4", session:"morning", status:"closed", registerUrl:null,
      schedule:"Sáng Thứ 2 – 4 – 6, 7:30 – 9:00 (giờ Việt Nam)",
      duration:"7 tháng", textbook:"Minna no Nihongo",
      start:"Tuần thứ 3, tháng 9/2026", teacher:"Cô Võ Thùy, Cô Ngọc Tâm, Cô Lan Nhi",
      note:"Củng cố ngữ pháp sơ cấp, mở rộng vốn từ và kỹ năng giao tiếp."
    },
    {
      code:"N3", name:"N3 AKI 3", lvl:"lv3", session:"morning", status:"closed", registerUrl:null,
      schedule:"Sáng Thứ 3 – 5 – 7, 7:30 – 9:00 (giờ Việt Nam)",
      duration:"3 tháng", textbook:"Từ vựng: Mimikara Oboeru Goi · Kanji: Kanji Master · Ngữ pháp: Try · Đọc–nghe hiểu: Shinkanzen",
      start:"Tuần thứ 3, tháng 9/2026", teacher:"Cô Hoài Linh, Cô Bùi Thảo",
      note:"Định hướng thi kỳ thi JLPT tháng 12/2026, luyện đọc hiểu và nghe hiểu nâng cao."
    },
    {
      code:"N2", name:"N2 FUYU 4", lvl:"lv2", session:"morning", status:"closed", registerUrl:null,
      schedule:"Sáng Thứ 3 – 5 – 7, 7:30 – 9:00 (giờ Việt Nam)",
      duration:"3 tháng", textbook:"Kanji: Kanji Master · Từ vựng: Mimikara Oboeru · Ngữ pháp: Shinkanzen, Soumatome 45 nichi · Đọc hiểu: Shinkanzen Dokkai",
      start:"Tuần thứ 3, tháng 9/2026", teacher:"Cô Gấm, Cô Đoàn Thanh, Cô Nguyễn Dương",
      note:"Định hướng thi kỳ thi JLPT tháng 12/2026, luyện văn phong và diễn đạt trung – cao cấp."
    },
    {
      code:"N5", name:"N5 HARU 2", lvl:"lv5", session:"evening", status:"closed", registerUrl:null,
      schedule:"Tối Thứ 2 – 4 – 6, 19:30 – 21:00 (giờ Việt Nam)",
      duration:"6 tháng", textbook:"Minna no Nihongo (dự kiến, như lớp N5 HARU 3)",
      start:"Tuần thứ 2, tháng 9/2026", teacher:"Cô Thúy, Cô Nhật Quỳnh, Cô Đoàn Hường",
      note:"Lớp buổi tối dành cho người mới bắt đầu, xây nền chữ viết – ngữ pháp – từ vựng cơ bản."
    },
    {
      code:"N4", name:"N4 NATSU 2", lvl:"lv4", session:"evening", status:"closed", registerUrl:null,
      schedule:"Tối Thứ 2 – 4 – 6, 19:30 – 21:00 (giờ Việt Nam)",
      duration:"6 tháng", textbook:"Minna no Nihongo (dự kiến, như lớp N4 NATSU 3)",
      start:"Tuần thứ 2, tháng 9/2026", teacher:"Cô Huyên, Cô Trang, Cô Oanh",
      note:"Lớp buổi tối củng cố ngữ pháp sơ cấp, mở rộng vốn từ và kỹ năng giao tiếp."
    },
    {
      code:"N3", name:"N3 AKI 2", lvl:"lv3", session:"evening", status:"closed", registerUrl:null,
      schedule:"Tối Thứ 3 – 5 – 7, 19:30 – 21:00 (giờ Việt Nam)",
      duration:"6 tháng", textbook:"Dự kiến như lớp N3 AKI 3 — Mimikara Oboeru Goi · Kanji Master · Try · Shinkanzen",
      start:"Tuần thứ 2, tháng 9/2026", teacher:"Cô Huyền, Cô Hoàng Quỳnh, Cô Diệu",
      note:"Lớp buổi tối, định hướng thi JLPT, luyện đọc hiểu và nghe hiểu nâng cao."
    },
    {
      code:"N2", name:"N2 FUYU 3", lvl:"lv2", session:"evening", status:"closed", registerUrl:null,
      schedule:"Tối Thứ 3 – 5 – 7, 19:30 – 21:00 (giờ Việt Nam)",
      duration:"3 tháng", textbook:"Dự kiến như lớp N2 FUYU 4 — Kanji Master · Mimikara Oboeru · Shinkanzen, Soumatome 45 nichi · Shinkanzen Dokkai",
      start:"Tuần thứ 2, tháng 9/2026", teacher:"Thầy Dương, Cô Hoa, Thầy Khánh, Cô Hiền",
      note:"Lớp buổi tối, luyện văn phong và diễn đạt trung – cao cấp."
    }
  ].map(function (c) { c.status = "running"; c.old = true; return c; });
  var MATERIALS = [
    {code:"N5", lvl:"lv5", desc:"Nền tảng chữ viết, ngữ pháp và từ vựng cơ bản để bắt đầu hành trình tiếng Nhật.", links:[
      {label:"Giáo trình", url:"https://drive.google.com/drive/folders/1YDqh_t72djrWIwCsz2c7dzitlyJL0fNk?usp=sharing"},
      {label:"File nghe", url:"https://drive.google.com/drive/folders/1afTDLcBORgVskTiU1C3IT4HOO9GVJmKe?usp=sharing"}
    ]},
    {code:"N4", lvl:"lv4", desc:"Mở rộng ngữ pháp sơ cấp, luyện nghe – nói trong các tình huống thường ngày.", links:[
      {label:"Giáo trình", url:"https://drive.google.com/drive/folders/1VMNst9rBS69jXCDuPAUD-pLZ5xsztSYF?usp=sharing"},
      {label:"File nghe", url:"https://drive.google.com/drive/folders/1F32u6c-ZnoH4NihJQaU7vYaWtQMg8Zz3?usp=sharing"}
    ]},
    {code:"N3", lvl:"lv3", desc:"Bước chuyển sang trình độ trung cấp, tăng cường đọc hiểu văn bản dài. Từ vựng Mimikara Oboeru Goi · Kanji Master · Ngữ pháp Try · Đọc–nghe Shinkanzen.", links:[
      {label:"Tài liệu", url:"https://drive.google.com/drive/folders/11Rd5wITaHQE4VzUp3fP1WYta5KkWWb-c?usp=sharing"}
    ]},
    {code:"N2", lvl:"lv2", desc:"Ngữ pháp – từ vựng trung cao cấp, luyện đề theo cấu trúc đề thi thật. Kanji Master · Mimikara Oboeru · Shinkanzen & Soumatome 45 nichi · Shinkanzen Dokkai.", links:[
      {label:"Tài liệu", url:"https://drive.google.com/drive/folders/1qKdF-Yxwn2x7HJAT-Or38LMRa3aG9c96?usp=sharing"}
    ]},
    {code:"N1", lvl:"lv1", desc:"Trình độ cao cấp, hoàn thiện kỹ năng đọc – nghe – luận học thuật.", links:[]}
  ];
  var TEACHERS = [
    {name:"Nguyễn Hiền", level:"N1", lvl:"lv1", photo:"images/team/nguyen-hien.jpg", bio:"Đang sinh sống tại Nhật Bản, bước sang năm thứ 9. Cô hiện làm việc tại một nhà hàng Nhật được 3 năm, tích lũy vốn tiếng Nhật thực tế từ môi trường làm việc và cuộc sống hàng ngày tại Nhật."},
    {name:"Lê Hoa", level:"N1", lvl:"lv1", photo:"images/team/le-hoa.jpg", bio:"Sang Nhật Bản sinh sống đã 17 năm, có kinh nghiệm làm việc tại nghiệp đoàn quản lý thực tập sinh kỹ năng và lao động tokutei, cùng gần 10 năm làm phiên dịch. Hiện cô là phiên dịch viên tự do, đồng thời tìm kiếm các đơn hàng kết nối lao động với doanh nghiệp."},
    {name:"Hoàng Quỳnh", level:"N1", lvl:"lv1", photo:"images/team/hoang-quynh.jpg", bio:"Giáo viên Cống hiến đồng hành cùng dự án."},
    {name:"Đào Huyền", level:"N1", lvl:"lv1", photo:"images/team/dao-huyen.jpg", bio:"Có bằng Kaigofukushi (chứng chỉ điều dưỡng – chăm sóc người cao tuổi của Nhật Bản) và hiện đang làm việc trong ngành kaigo tại Nhật."},
    {name:"Xuân Dương", level:"N1", lvl:"lv1", photo:"images/team/xuan-duong.jpg", bio:"Giáo viên Cống hiến đồng hành cùng dự án."},
    {name:"Xuân Khánh", level:"N1", lvl:"lv1", photo:"images/team/xuan-khanh.jpg", bio:"Giáo viên Cống hiến, cùng học viên chinh phục tiếng Nhật mỗi ngày."},
    {name:"Thanh Nam", level:"N1", lvl:"lv1", photo:null, bio:"Đỗ JLPT N1 từ năm 2022, hiện đang làm việc tại Nhật Bản và sử dụng tiếng Nhật giao tiếp hàng ngày trong công việc."},
    {name:"Nhật Quỳnh", level:"N2", lvl:"lv2", photo:"images/team/nhat-quynh.jpg", bio:"Sống tại Nhật 10 năm, từng học 2 năm tại trường tiếng Nhật và 2 năm tại trường senmon chuyên ngành phiên dịch – khách sạn, đỗ JLPT N2 cách đây 5–6 năm. Từng làm việc trong lĩnh vực tổ chức sự kiện, thế mạnh của cô là khả năng giao tiếp tự nhiên và những tips học tiếng Nhật hấp dẫn, dễ tiếp cận."},
    {name:"Bảo Linh", level:"N2", lvl:"lv2", photo:"images/team/bao-linh.jpg", bio:"Giáo viên Cống hiến đồng hành cùng dự án."},
    {name:"Thùy Dung", level:"N2", lvl:"lv2", photo:"images/team/thuy-dung.jpg", bio:"Có 4 năm sinh sống tại Nhật Bản, đỗ JLPT N2 cách đây 2 năm. Cô tham gia CỐNG HIẾN với mong muốn hỗ trợ cộng đồng người Việt còn khó khăn trong việc tìm lớp học tiếng Nhật, đồng thời chia sẻ những trải nghiệm thực tế về Nhật Bản đến các bạn có dự định sang Nhật hoặc quan tâm đến đất nước này."},
    {name:"Đoàn Hường", level:"N2", lvl:"lv2", photo:"images/team/doan-huong.jpg", bio:"Đồng hành cùng CỐNG HIẾN trên hành trình lan tỏa tiếng Nhật miễn phí."},
    {name:"Lê Thúy", level:"N2", lvl:"lv2", photo:"images/team/le-thuy.jpg", bio:"Giáo viên Cống hiến, luôn sẵn sàng hỗ trợ học viên của dự án."},
    {name:"Thùy Duyên", level:"N2", lvl:"lv2", photo:"images/team/thuy-duyen.jpg", bio:"Có 3 năm làm việc tại Nhật Bản. Do tính chất công việc cũng như niềm yêu thích tìm tòi, khám phá, cô thường xuyên giao tiếp với người Nhật và trải nghiệm văn hóa bản địa, đồng thời có kinh nghiệm tự học tiếng Nhật hiệu quả."},
    {name:"Thủy Tiên", level:"N2", lvl:"lv2", photo:"images/team/thuy-tien.jpg", bio:"Có kinh nghiệm giảng dạy trình độ N5 và hiện là chủ nhiệm một câu lạc bộ tiếng Nhật. Thế mạnh của cô là kỹ năng hội thoại (kaiwa), với chất giọng dễ nghe, dễ tiếp cận với người học."},
    {name:"Nguyễn Trang", level:"N2", lvl:"lv2", photo:"images/team/nguyen-trang.jpg", bio:"Tốt nghiệp chuyên ngành tiếng Nhật và đã có nhiều năm kinh nghiệm giảng dạy tiếng Nhật tại các trung tâm."},
    {name:"Lưu Tú", level:"N2", lvl:"lv2", photo:"images/team/luu-tu.jpg", bio:"Giáo viên Cống hiến, luôn sẵn sàng hỗ trợ học viên của dự án."},
    {name:"Việt Đức", level:"N2", lvl:"lv2", photo:"images/team/viet-duc.jpg", bio:"Giáo viên Cống hiến đồng hành cùng dự án."}
  ];
  var SESSIONS = [{ key: "morning", label: "Sáng (5:30 – 9:00)", icon: "☀️" }, { key: "afternoon", label: "Các lớp buổi chiều", icon: "🌤️" }, { key: "evening", label: "Chiều – tối (17:30 – 21:00)", icon: "🌙" }];
  var OLDSESS = [{ key: "morning", label: "Các lớp buổi sáng", icon: "☀️" }, { key: "evening", label: "Các lớp buổi tối", icon: "🌙" }];

  /* ---- Các ô điều hướng ---- */
  var TABS = [
    { id: "lop-hoc", t: "Lớp đã & đang mở", s: "24 lớp N5 – N2", ja: "講", ic: "🏫", c: "t1" },
    { id: "giao-vien", t: "Đội ngũ giáo viên", s: "Giáo viên Cống hiến", ja: "師", ic: "👩‍🏫", c: "t2" },
    { id: "tai-lieu", t: "Tài liệu", s: "Kho Google Drive", ja: "資", ic: "📚", c: "t3" },
    { id: "gioi-thieu", t: "Giới thiệu", s: "Về dự án", ja: "紹", ic: "💡", c: "t4" },
    { id: "dang-ky-hoc", t: "Đăng ký học", s: "Miễn phí 100%", ja: "学", ic: "✍️", c: "t5" },
    { id: "dang-ky-day", t: "Đăng ký dạy", s: "Trở thành GV Cống hiến", ja: "教", ic: "🤝", c: "t6" }
  ];
  function tiles(cur, title) {
    return '<section class="ch-tiles-wrap"><div class="ch-wrap">' + (title ? "<h2>" + title + "</h2>" : "") + '<nav class="ch-tiles" aria-label="Các mục của Dự án Cống hiến">' +
      TABS.map(function (t) { return '<a class="ch-tile ' + t.c + '" href="#/' + t.id + '"' + (t.id === cur ? ' aria-current="page"' : "") + '><span class="ch-tile__ja" lang="ja" aria-hidden="true">' + t.ja + '</span><span class="ch-tile__ic" aria-hidden="true">' + t.ic + "</span><b>" + t.t + "</b><small>" + t.s + "</small></a>"; }).join("") + "</nav></div></section>";
  }
  function band(eyebrow, h1, p, kanji, extra, cls) {
    return '<section class="ch-band ' + (cls || "") + '"><span class="ch-band__kanji" lang="ja" aria-hidden="true">' + kanji + '</span><div class="ch-wrap"><span class="ch-eyebrow">' + eyebrow + "</span><h1>" + h1 + "</h1>" + (p ? "<p>" + p + "</p>" : "") + (extra || "") + "</div></section>";
  }
  var head = function (k, h, p) { return '<div class="ch-head"><span class="ch-kicker">' + k + "</span><h2>" + h + "</h2>" + (p ? "<p>" + p + "</p>" : "") + "</div>"; };

  /* ---- Lớp học ---- */
  function classCard(c) {
    var cta = c.status === "open"
      ? '<a class="ch-btn ch-btn--red" href="' + c.registerUrl + '" target="_blank" rel="noopener">Đăng ký lớp này ↗</a>'
      : "";
    var tagTop = c.status === "open" ? '<span class="ch-tag ch-tag--ok">Đang nhận đăng ký</span>' : '<span class="ch-tag ch-tag--gray">Đã đủ học viên</span>';
    var rows = '<dt>Lịch học</dt><dd>' + esc(c.schedule) + "</dd><dt>Thời lượng</dt><dd>" + esc(c.duration) + "</dd>" +
      (c.buoi ? "<dt>Nội dung</dt><dd>" + c.buoi.map(function (b, i) { return "<b>Buổi " + (i + 1) + ":</b> " + esc(b); }).join("<br>") + "</dd>" : "") +
      "<dt>Giáo trình</dt><dd>" + esc(c.textbook) + "</dd><dt>Khai giảng</dt><dd>" + esc(c.start) + "</dd>" + (c.old ? "<dt>Giáo viên</dt><dd>" + esc(c.teacher) + "</dd>" : "") +
      (c.head ? "<dt>Chủ nhiệm</dt><dd>" + esc(c.head) + "</dd>" : "");
    var staff = c.head ? '<div class="ch-staff"><div><b>Giáo viên</b>' + c.gv.map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("") + "</div>" +
      (c.tg && c.tg.length ? '<div><b>Trợ giảng</b>' + c.tg.map(function (x) { return "<span>" + esc(x) + "</span>"; }).join("") + "</div>" : "") + "</div>" : "";
    return '<article class="ch-class ' + c.lvl + '"><div class="ch-class__top"><span class="ch-lv">' + c.code + "</span><h4>" + esc(c.name) + "</h4>" + tagTop + "</div><dl>" + rows + "</dl>" + staff + '<div class="ch-class__cta">' + cta + "</div></article>";
  }
  function group(list, sess, note) {
    return sess.map(function (s) {
      var l = list.filter(function (c) { return c.session === s.key; }); if (!l.length) return "";
      return '<div class="ch-session"><h3><span>' + s.icon + "</span>" + s.label + '<span class="n">' + l.length + ' lớp</span></h3><div class="ch-classes">' + l.map(classCard).join("") + "</div></div>";
    }).join("");
  }
  function pClasses() {
    return band("Lớp học", "Lớp đã &amp; đang mở", "Mỗi lớp học 3 buổi mỗi tuần qua Google Meet, sĩ số chuẩn 50 học viên, có 3 giáo viên và 3 trợ giảng. Việc học và đăng ký hoàn toàn miễn phí.", "講") +
      '<section class="ch-sec"><div class="ch-wrap">' +
      '<div class="ch-term">📌 Học kì ' + TERM + '<small>· 16 lớp, nhận đăng ký qua trang Ankipan</small></div>' + group(NEW, SESSIONS) +
      '<div class="ch-term" style="margin-top:36px">🗂️ Các lớp đã triển khai<small>· khai giảng tháng 9/2026, đã đủ học viên</small></div>' + group(OLD, OLDSESS) +
      '</div></section>' + tiles("lop-hoc");
  }

  /* ---- Giáo viên ---- */
  function teacherRow(t) {
    var photo = t.photo ? '<img src="' + t.photo + '" alt="Chân dung ' + esc(t.name) + '" loading="lazy">' : '<svg viewBox="0 0 100 100" width="60" height="60" aria-hidden="true"><circle cx="50" cy="38" r="18" fill="currentColor" opacity=".35"/><path d="M12 98c0-23.2 17-35.6 38-35.6s38 12.4 38 35.6" fill="currentColor" opacity=".35"/></svg>';
    return '<article class="ch-t"><div class="ch-t__p">' + photo + '</div><div><h4>' + esc(t.name) + '</h4><span class="ch-lv ' + t.lvl + '">JLPT ' + t.level + "</span><p>" + esc(t.bio) + "</p></div></article>";
  }
  function founder(withHead) {
    return '<div class="ch-founder"><img src="images/minh-dokkai.jpg" alt="Chân dung thầy Minh Dokkai, người sáng lập Dự án Cống hiến" loading="lazy"><div class="ch-founder__b"><div><span class="ch-tag ch-tag--coral">Người sáng lập dự án</span><h3>Minh Dokkai</h3><div class="ch-role">Người sáng lập &amp; Giáo viên chính</div></div>' +
      '<div class="ch-chips"><span class="ch-chip">🇻🇳 Hiện sống tại Việt Nam</span><span class="ch-chip">🇯🇵 Từng sống &amp; làm việc tại Nhật Bản</span><span class="ch-chip">JLPT N1</span><span class="ch-chip">Chứng chỉ giáo viên tiếng Nhật</span></div>' +
      '<p class="ch-bio">Tác giả bộ sách <em>Huyền Lục Thư — Học Kanji bằng Lục Thư cải tiến</em> (3 cuốn) và cuốn <em>14 NGÀY học hết từ vựng N5, N4</em>. Từng đảm nhiệm vị trí Giám đốc đào tạo tại một công ty chuyên đào tạo thực tập sinh kỹ năng, có nhiều năm sống và làm việc tại Nhật Bản trước khi trở về Việt Nam, sáng lập Dự án Cống hiến để mang cơ hội học tiếng Nhật đến mọi người.</p>' +
      '<div class="ch-social"><a href="https://www.facebook.com/minhdokkai/" target="_blank" rel="noopener">Facebook ↗</a><a href="https://www.youtube.com/@MinhDokkai" target="_blank" rel="noopener">YouTube ↗</a></div></div></div>';
  }
  function pTeachers() {
    return band("Đội ngũ", "Những người đứng lớp của Dự án Cống hiến", "Đội ngũ Giáo viên Cống hiến, sống và làm việc ở cả Việt Nam lẫn Nhật Bản.", "師") +
      '<section class="ch-sec"><div class="ch-wrap">' + founder() +
      '<h3 style="margin:36px 0 4px;font-size:22px;color:var(--brand-ink)">Giáo viên Cống hiến</h3><p style="margin:0;color:var(--muted)">Những thầy cô đã đăng ký đồng hành cùng dự án, xếp theo trình độ JLPT.</p>' +
      '<div class="ch-tgrid">' + TEACHERS.map(teacherRow).join("") + "</div>" +
      '<div class="ch-expand"><div><h3>Đội ngũ đang mở rộng mỗi ngày</h3><p>Dự án luôn cần thêm Giáo viên Cống hiến ở mọi trình độ, từ N5 đến N1.</p></div><a class="ch-btn ch-btn--red" href="#/dang-ky-day">Đăng ký giảng dạy →</a></div>' +
      '</div></section>' + tiles("giao-vien");
  }

  /* ---- Tài liệu ---- */
  function pMaterials() {
    var rows = MATERIALS.map(function (m) {
      var act = m.links.length ? m.links.map(function (l) { return '<a class="ch-btn ch-btn--line" href="' + l.url + '" target="_blank" rel="noopener">' + l.label + " ↗</a>"; }).join("") : '<span class="ch-tag ch-tag--gray">Đang cập nhật</span>';
      return '<div class="ch-matrow ' + m.lvl + '"><div class="b">' + m.code + '</div><div><h3>Tài liệu JLPT ' + m.code + "</h3><p>" + esc(m.desc) + '</p></div><div class="act">' + act + "</div></div>";
    }).join("");
    return band("Tài liệu học tập", "Tài liệu ôn luyện theo từng cấp độ JLPT", "Mỗi cấp độ có một thư mục tài liệu riêng trên Google Drive, được đội ngũ tổng hợp và cập nhật liên tục.", "資") +
      '<section class="ch-sec"><div class="ch-wrap"><div class="ch-mat">' + rows + '</div></div></section>' + tiles("tai-lieu");
  }

  /* ---- Giới thiệu ---- */
  function currTable() {
    var th = "<tr><th>Kỹ năng</th><th>N5</th><th>N4</th><th>N3</th><th>N2</th><th>N1</th></tr>";
    var R = [
      ["Kanji", ["Kanji Master + PPT", "Kanji Master + PPT", "Kanji Master + PPT", "Kanji Master + PPT", "Kanji Master + PPT"]],
      ["Từ vựng", ["Web Super Goi + Test", "Web Super Goi + Test", "Mimikara Oboeru + Web Super Goi", "Mimikara Oboeru + Web Super Goi", "Mimikara Oboeru + Web Super Goi"]],
      ["Ngữ pháp", ["Minna no Nihongo + PPT", "Minna no Nihongo + PPT", "Try! / Shinkanzen + Web Super Bunpou", "Giáo trình nội bộ + Web Super Bunpou", "Giáo trình nội bộ + Web Super Bunpou"]],
      ["Đọc hiểu", ["Sưu tầm", "Sưu tầm", "Shinkanzen", "Shinkanzen Dokkai", "Shinkanzen Dokkai"]],
      ["Nghe hiểu", ["Sưu tầm", "Sưu tầm", "Shinkanzen", "Shinkanzen Choukai", "Shinkanzen Choukai"]]
    ];
    return '<div class="ch-scroll"><table class="ch-table"><thead>' + th + "</thead><tbody>" + R.map(function (r) { return "<tr><th>" + r[0] + "</th>" + r[1].map(function (x) { return "<td>" + x + "</td>"; }).join("") + "</tr>"; }).join("") +
      '<tr><th>Luyện đề</th><td colspan="5">Đề thi thật các năm + bộ giáo trình luyện đề toàn tập (áp dụng chung N5 – N1)</td></tr></tbody></table></div>';
  }
  function sessTable() {
    var R = [["N5", "Kanji, Từ vựng", "Ngữ pháp", "Đọc hiểu, Nghe hiểu"], ["N4", "Kanji, Từ vựng", "Ngữ pháp", "Đọc hiểu, Nghe hiểu"], ["N3", "Từ vựng, Kaiwa", "Kanji, Ngữ pháp", "Đọc hiểu, Nghe hiểu"], ["N2", "Từ vựng, Nghe hiểu", "Kanji, Ngữ pháp", "Đọc hiểu"]];
    return '<div class="ch-scroll"><table class="ch-table"><thead><tr><th>Trình độ</th><th>Buổi 1</th><th>Buổi 2</th><th>Buổi 3</th></tr></thead><tbody>' + R.map(function (r) { return "<tr><th>" + r[0] + "</th><td>" + r[1] + "</td><td>" + r[2] + "</td><td>" + r[3] + "</td></tr>"; }).join("") + "</tbody></table></div>";
  }
  function pAbout() {
    return band("Về chúng tôi", "Cống hiến — học để trưởng thành, dạy để cống hiến", "", "縁") +
      '<section class="ch-sec"><div class="ch-wrap"><p class="ch-quote">“Dự án Cống hiến dạy tiếng Nhật hoàn toàn miễn phí, ra đời từ một mong muốn giản dị: những người dạy có tâm đồng hành cùng học viên ham học và chăm chỉ, để việc học ngoại ngữ không còn bị giới hạn bởi chi phí.”</p>' +
      '<p style="max-width:70ch;color:var(--hero-text)">Dự án hoạt động phi lợi nhuận, không thu bất kỳ khoản học phí nào. Giáo viên tham gia trên tinh thần tự nguyện, chủ động sắp xếp thời gian giảng dạy phù hợp với công việc và cuộc sống riêng. Đổi lại, dự án chỉ có một mong muốn: học viên nghiêm túc, chuyên cần và trân trọng công sức của người đứng lớp.</p>' +
      '<div class="ch-values"><div class="ch-val"><i lang="ja">縁</i><h4>Đồng hành</h4><p>Thầy và trò cùng đi hết một lộ trình học, không chỉ dạy một buổi rồi thôi.</p></div><div class="ch-val"><i lang="ja">誠</i><h4>Tận tâm</h4><p>Giáo viên chuẩn bị bài giảng nghiêm túc như với một lớp học thu phí.</p></div><div class="ch-val"><i lang="ja">律</i><h4>Kỷ luật</h4><p>Học viên cam kết chuyên cần, điều kiện duy nhất để lớp học miễn phí tồn tại lâu dài.</p></div><div class="ch-val"><i lang="ja">和</i><h4>Phi lợi nhuận</h4><p>Không học phí, không phụ thu, vận hành bằng tinh thần tự nguyện.</p></div></div></div></section>' +
      '<section class="ch-sec ch-sec--alt"><div class="ch-wrap">' + head("Cách vận hành", "Mô hình lớp học &amp; công cụ hỗ trợ", "") +
      '<div class="ch-flow"><div class="ch-card"><h3>Lớp học &amp; nhân sự</h3><p>Sĩ số chuẩn 50 học viên mỗi lớp. Đội ngũ gồm 3 giáo viên và 3 trợ giảng. Học trực tuyến qua Google Meet, thảo luận trong nhóm Messenger của lớp. Đăng ký học và quản lý giảng dạy hoàn toàn miễn phí.</p></div>' +
      '<div class="ch-card"><h3>Tài liệu &amp; công cụ</h3><p>Kho tài liệu chung trên Google Drive, PowerPoint (Minna N5–N4, Kanji, Từ vựng, Đọc hiểu N3) và hệ thống website Super Goi, Super Bunpou cùng từ điển trực tuyến của Super Honki.</p></div></div>' +
      '<h3 style="margin:30px 0 12px;font-size:20px;color:var(--brand-ink)">Khung giáo trình theo kỹ năng và trình độ</h3>' + currTable() +
      '<h3 style="margin:30px 0 12px;font-size:20px;color:var(--brand-ink)">Phân bổ nội dung 3 buổi học mỗi tuần</h3>' + sessTable() + '</div></section>' +
      '<section class="ch-sec"><div class="ch-wrap">' + head("Người sáng lập", "Minh Dokkai", "") + founder() + '</div></section>' + tiles("gioi-thieu");
  }

  /* ---- Đăng ký ---- */
  function pRegStudent() {
    return band("Đăng ký học", "Bắt đầu hành trình tiếng Nhật của bạn", "Việc đăng ký thực hiện trên trang Ankipan, mất khoảng 3 phút. Học hoàn toàn miễn phí.", "学") +
      '<section class="ch-sec"><div class="ch-wrap ch-reg"><div>' + head("Chuẩn bị", "Trước khi đăng ký, bạn cần chuẩn bị", "") +
      '<ul class="ch-list"><li>Họ và tên, năm sinh</li><li>Nguyện vọng học tiếng Nhật (mục tiêu, lý do bạn muốn học)</li><li>Đường link Facebook cá nhân và địa chỉ email</li><li>Lớp bạn muốn đăng ký (xem tại mục Lớp đã &amp; đang mở)</li></ul>' +
      '<div class="ch-commit"><b>Cam kết học viên.</b> Khi hoàn tất đăng ký, bạn xác nhận sẽ tham gia lớp một cách nghiêm túc, có mặt đầy đủ các buổi theo lịch, chủ động ôn luyện và hoàn thành bài tập được giao, để xứng đáng với tâm huyết mà Giáo viên Cống hiến đã dành cho lớp học.</div></div>' +
      '<aside class="ch-panel"><span class="ch-tag ch-tag--ok">Đang nhận đăng ký</span><h3>Đăng ký học trên Ankipan</h3><p>16 lớp N5 – N2 của học kì ' + TERM + ' đang nhận đăng ký. Bấm nút bên dưới để mở trang đăng ký và chọn lớp phù hợp.</p>' +
      '<a class="ch-btn ch-btn--red ch-btn--big ch-btn--block" href="' + REG_URL + '" target="_blank" rel="noopener">Đăng ký học ↗</a>' +
      '<a class="ch-btn ch-btn--line ch-btn--block" style="margin-top:12px" href="#/lop-hoc">Xem danh sách lớp →</a></aside></div></section>' + tiles("dang-ky-hoc");
  }
  function pRegTeacher() {
    return band("Đăng ký giảng dạy", "Trở thành Giáo viên Cống hiến", "Dự án chào đón những người có kiến thức tiếng Nhật vững vàng và mong muốn chia sẻ, dù bạn nhận vai trò giáo viên chính hay trợ giảng.", "教") +
      '<section class="ch-sec"><div class="ch-wrap ch-reg"><div>' + head("Thông tin cần chuẩn bị", "Phiếu đăng ký giáo viên", "") +
      '<ul class="ch-list"><li>Họ và tên, năm sinh</li><li>Thời gian có thể đảm nhiệm (khung giờ, số buổi mỗi tuần)</li><li>Trình độ lớp có thể đảm nhiệm (N5 – N1)</li><li>Vai trò mong muốn: giáo viên chính hoặc trợ giảng</li><li>Đường link Facebook cá nhân và địa chỉ email</li></ul>' +
      '<h3 style="margin:26px 0 8px;font-size:18px;color:var(--brand-ink)">Yêu cầu cơ bản dành cho giáo viên</h3><ul class="ch-list"><li>Tham gia giảng dạy đúng giờ, không bỏ buổi khi không có lý do chính đáng.</li><li>Luôn bật camera trong suốt quá trình dạy trực tuyến.</li><li>Tích cực hỗ trợ, giải đáp thắc mắc và chăm sóc học viên sau giờ học.</li><li>Sử dụng thành thạo PowerPoint, Word, trình chiếu và tương tác trực tiếp trên file PDF.</li><li>Phối hợp chặt chẽ với nhóm giáo viên và trợ giảng trong lớp; khuyến khích sáng tạo phương pháp giảng dạy.</li></ul>' +
      '<div class="ch-commit"><b>Vì sao cần những thông tin này.</b> Dự án sắp xếp lớp dựa trên thời gian rảnh và chuyên môn thực tế của từng giáo viên, để mỗi lớp được đồng hành đều đặn và phù hợp năng lực.</div></div>' +
      '<aside class="ch-panel"><span class="ch-tag">Biểu mẫu đăng ký</span><h3>Phiếu đăng ký Giáo viên Cống hiến</h3><p>Biểu mẫu hỏi thông tin cá nhân, thời gian, trình độ có thể đảm nhiệm, vai trò mong muốn và thông tin liên hệ.</p><a class="ch-btn ch-btn--red ch-btn--big ch-btn--block" href="' + TEACHER_FORM + '" target="_blank" rel="noopener">Mở form đăng ký giáo viên ↗</a></aside></div></section>' + tiles("dang-ky-day");
  }

  /* ---- Trang chính ---- */
  function pHome() {
    return band("Dự án Cống hiến · Dạy – học tiếng Nhật miễn phí vì cộng đồng", "Học tiếng Nhật miễn phí,<br>cùng <em>những người thầy có tâm</em>", "Dự án kết nối các Giáo viên Cống hiến giàu kinh nghiệm, sẵn sàng đứng lớp hoàn toàn miễn phí, với những học viên ham học và kỷ luật.",
      "献", '<div class="ch-cta"><a class="ch-btn ch-btn--red" href="#/dang-ky-hoc">Đăng ký học ngay</a><a class="ch-btn ch-btn--ghost" href="#/dang-ky-day">Tôi muốn trở thành Giáo viên Cống hiến</a></div>' +
      '<div class="ch-stats"><div class="ch-stat"><b>100%</b><span>Miễn phí toàn bộ, không thu bất kỳ khoản nào</span></div><div class="ch-stat"><b>N5 → N2</b><span>Lớp học theo khung trình độ JLPT</span></div><div class="ch-stat"><b>3 GV + 3 TG</b><span>Mỗi lớp, sĩ số chuẩn 50 học viên</span></div><div class="ch-stat"><b>24 lớp</b><span>Đã và đang mở</span></div></div>', "ch-band--home") +
      tiles("", "Khám phá dự án") +
      '<section class="ch-sec"><div class="ch-wrap">' + head("Lời mời gọi", "Một lớp học, hai lời hứa", "Người dạy cho đi thời gian và kiến thức, người học đáp lại bằng sự nghiêm túc và chuyên cần. Đó là lý do dự án có thể duy trì việc dạy học miễn phí lâu dài.") +
      '<div class="ch-grid2"><div class="ch-card"><span class="ch-tag ch-tag--coral">Gửi các bạn học viên</span><h3>Đừng để học phí là lý do bạn dừng lại</h3><p>Điều duy nhất dự án mong ở học viên là sự nghiêm túc: đi học đầy đủ, chăm chỉ luyện tập và trân trọng công sức của người đứng lớp.</p><a class="ch-btn ch-btn--red" href="#/dang-ky-hoc">Đăng ký học viên</a></div>' +
      '<div class="ch-card"><span class="ch-tag">Gửi các thầy cô</span><h3>Một giờ dạy của bạn, một cánh cửa cho người học</h3><p>Bạn chủ động chọn vai trò giáo viên chính hay trợ giảng, khung giờ và trình độ lớp phù hợp với mình, không gò bó, không ràng buộc dài hạn.</p><a class="ch-btn ch-btn--line" href="#/dang-ky-day">Đăng ký giảng dạy</a></div></div></div></section>';
  }

  var ROUTES = { "": pHome, "lop-hoc": pClasses, "giao-vien": pTeachers, "tai-lieu": pMaterials, "gioi-thieu": pAbout, "dang-ky-hoc": pRegStudent, "dang-ky-day": pRegTeacher };
  function route() {
    var k = location.hash.replace(/^#\/?/, "").split("?")[0];
    var f = ROUTES[k] || pHome;
    main.innerHTML = f(); window.scrollTo(0, 0);
    var t = TABS.filter(function (x) { return x.id === k; })[0];
    document.title = (t ? t.t + " · " : "") + "Dự án Cống hiến | Super Honki";
  }
  window.addEventListener("hashchange", route);
  route();
})();
