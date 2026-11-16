/* Lời nhắc dùng chung cho api/shiken-ai.js và shiken/tools/gen_vi.js */
const SYS = "Bạn là giáo viên tiếng Nhật người Việt, chuyên luyện thi JLPT. Chỉ trả về MỘT đối tượng JSON hợp lệ, không kèm chữ nào khác, không dùng ```.";
const ch = c => (c || []).map((x, i) => (i + 1) + ". " + String(x).replace(/<\/?u>/g, "")).join("\n");
function promptQuestion(o) {
  return "Câu hỏi JLPT " + (o.level || "").toUpperCase() + " (dạng: " + (o.kind || "") + ").\n" +
    (o.passage ? "Bài đọc:\n" + String(o.passage).replace(/<\/?u>/g, "") + "\n\n" : "") +
    "Đề: " + String(o.stem || "").replace(/<\/?u>/g, "") + "\nLựa chọn:\n" + ch(o.choices) + "\nĐáp án đúng: " + o.answer + "\n\n" +
    'Trả về JSON dạng {"vi":"dịch tiếng Việt hoàn chỉnh của câu/đề bài (đã điền đáp án đúng vào chỗ trống nếu có)","cv":["dịch lựa chọn 1","dịch lựa chọn 2","dịch lựa chọn 3","dịch lựa chọn 4"],"exp":"giải thích ngắn gọn vì sao đáp án đúng và vì sao các đáp án khác sai (tiếng Việt)","v":[["từ khó trong đề","cách đọc hiragana","nghĩa tiếng Việt"]]}. Mảng "v" liệt kê 2 đến 6 từ vựng hoặc mẫu ngữ pháp khó nhất.' +
    (o.passage ? ' Thêm "key":[số thứ tự các câu của bài đọc (đếm từ 0 theo trình tự câu kết thúc bằng 。) là mấu chốt để chọn đáp án đúng].' : "");
}
function promptPassage(o) {
  const qs = (o.questions || []).map(q => "Câu " + q.no + ": " + String(q.stem || "").replace(/<\/?u>/g, "") + "\n" + ch(q.choices) + "\nĐáp án đúng: " + q.answer).join("\n\n");
  return "Bài đọc hiểu JLPT " + (o.level || "").toUpperCase() + " (dạng: " + (o.kind || "") + ").\nNguyên văn:\n" + String(o.text).replace(/<\/?u>/g, "") + "\n\n" + qs + "\n\n" +
    'Trả về JSON: {"s":[{"ja":"một câu tiếng Nhật, cắt đúng theo dấu 。 hoặc ！？, giữ nguyên văn","vi":"bản dịch tiếng Việt tự nhiên, đầy đủ","p":1 nếu câu mở đầu đoạn mới (bỏ qua nếu không)}],"key":[số thứ tự câu (đếm từ 0) thể hiện rõ ý đồ, chủ trương của tác giả và là mấu chốt để chọn đáp án],"q":{"<số câu>":{"exp":"giải thích đáp án: nêu câu then chốt, vì sao đáp án đúng và các đáp án sai bị loại vì sao (tiếng Việt)","key":[số câu then chốt riêng cho câu hỏi này],"cv":["dịch lựa chọn 1","dịch lựa chọn 2","dịch lựa chọn 3","dịch lựa chọn 4"],"vi":"dịch câu hỏi"}},"v":[["từ khó","cách đọc","nghĩa tiếng Việt"]]}. Mảng "s" phải bao trùm toàn bộ bài đọc (kể cả chú thích), không bỏ câu nào. "v" liệt kê 8 đến 15 từ vựng khó.';
}
function promptWord(o) { return 'Từ/cụm từ tiếng Nhật: 「' + o.text + '」' + (o.context ? "\nNgữ cảnh: " + o.context : "") + '\nTrả về JSON {"reading":"cách đọc hiragana","meaning":"nghĩa tiếng Việt ngắn gọn, đúng với ngữ cảnh"}'; }
module.exports = { SYS, promptQuestion, promptPassage, promptWord };
