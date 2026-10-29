/**
 * GOOGLE APPS SCRIPT CHO HỆ THỐNG GIÁM SÁT VỆ SINH TAY - BVĐK TÂN PHÚ
 * Sheet mục tiêu: "BC VST"
 * 
 * HƯỚNG DẪN CÀI ĐẶT QUAN TRỌNG:
 * 1. Mở Google Sheet của bạn.
 * 2. Vào menu Tiện ích mở rộng (Extensions) -> Apps Script.
 * 3. Xoá hết mã cũ trong file Code.gs và dán toàn bộ đoạn mã này vào.
 * 4. Nhấn biểu tượng ĐĨA MỀM (Save / Lưu dự án).
 * 5. Bấm nút Triển khai (Deploy) -> Tùy chọn triển khai mới (New deployment).
 * 6. Chọn loại (Select type): Ứng dụng web (Web app).
 * 7. CẤU HÌNH BẮT BUỘC (NẾU CHỌN SAI SẼ BỊ LỖI 401 CHẶN ĐẨY DỮ LIỆU):
 *    - Thực thi dưới tên (Execute as): "Tôi" (Me)
 *    - Người có quyền truy cập (Who has access): "BẤT KỲ AI" (Anyone)
 * 8. Bấm Triển khai (Deploy), cấp quyền cho tài khoản Google của bạn nếu được hỏi.
 * 9. Sao chép URL của Ứng dụng web (có đuôi /exec) và dán vào ứng dụng VST.
 */

const SHEET_NAME = "BC VST";

const HEADERS = [
  "Ngày giám sát",
  "Nhân viên giám sát",
  "Khoa được giám sát",
  "Nhân viên được giám sát",
  "Chức danh",
  "Chỉ định",
  "Hành động",
  "Quy trình",
  "Thời gian báo cáo",
  "Trước tiếp xúc người bệnh",
  "Trước thủ thuật vô khuẩn/sạch",
  "Sau khi có nguy cơ phơi nhiễm máu/dịch cơ thể",
  "Sau tiếp xúc người bệnh",
  "Sau tiếp xúc môi trường xung quanh người bệnh",
  "Có tuân thủ VST",
  "STT",
  "KHU VỰC",
  "Column 18"
];

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: "ok",
    message: "Hệ thống Google Apps Script Giám sát VST Tân Phú đang hoạt động tốt!",
    targetSheet: SHEET_NAME,
    timestamp: new Date().toISOString()
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  // Khóa trong 30 giây để tránh xung đột ghi đè đồng thời từ nhiều thiết bị
  lock.tryLock(30000);

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);

    // Nếu chưa có sheet "BC VST", tự động tạo mới
    if (!sheet) {
      sheet = ss.insertSheet(SHEET_NAME);
    }

    // Kiểm tra hàng tiêu đề, nếu chưa có thì ghi tiêu đề chuẩn
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(HEADERS);
      const headerRange = sheet.getRange(1, 1, 1, HEADERS.length);
      headerRange.setFontWeight("bold");
      headerRange.setBackground("#E0F2FE"); // Xanh nhạt
      headerRange.setHorizontalAlignment("center");
    }

    if (!e || !e.postData || !e.postData.contents) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "error",
        message: "Không tìm thấy dữ liệu gửi lên (postData rỗng)"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    let payload;
    try {
      payload = JSON.parse(e.postData.contents);
    } catch (parseErr) {
      payload = e.parameter || {};
    }

    // Lấy danh sách các dòng dữ liệu (hỗ trợ cả dạng { rows }, { data }, hoặc mảng thuần)
    let rowsData = [];
    if (Array.isArray(payload)) {
      rowsData = payload;
    } else if (payload && Array.isArray(payload.rows)) {
      rowsData = payload.rows;
    } else if (payload && Array.isArray(payload.data)) {
      rowsData = payload.data;
    } else if (payload && typeof payload === 'object') {
      rowsData = [payload];
    }

    if (rowsData.length === 0) {
      return ContentService.createTextOutput(JSON.stringify({
        status: "warning",
        message: "Không có dòng quan sát nào để thêm"
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // Đọc danh sách obsId hiện có ở cột R (cột 18) để chống trùng lặp khi bấm "Đồng bộ" nhiều lần
    const lastRow = sheet.getLastRow();
    const existingIds = new Set();
    if (lastRow > 1) {
      const idValues = sheet.getRange(2, 18, lastRow - 1, 1).getValues();
      for (let i = 0; i < idValues.length; i++) {
        const val = idValues[i][0];
        if (val) existingIds.add(String(val).trim());
      }
    }

    const rowsToAppend = [];
    let skippedCount = 0;

    for (let i = 0; i < rowsData.length; i++) {
      const row = rowsData[i];
      if (!row) continue;

      let rowArray = [];

      // Nếu frontend đã đóng gói sẵn asArray 18 phần tử
      if (Array.isArray(row.asArray) && row.asArray.length === 18) {
        rowArray = row.asArray;
      } else {
        // Trích xuất từng trường theo đúng cấu trúc tiêu đề A -> R (hỗ trợ cả tiếng Việt và tiếng Anh)
        const dateVal = row["Ngày giám sát"] || row.date || "";
        const observerVal = row["Nhân viên giám sát"] || row.observer || "";
        const deptVal = row["Khoa được giám sát"] || row.department || "";
        const staffNameVal = row["Nhân viên được giám sát"] || row.staffName || "---";
        const profVal = row["Chức danh"] || row.profession || "";
        const indVal = row["Chỉ định"] || row.indication || "";
        const actVal = row["Hành động"] || row.action || "";
        const procVal = row["Quy trình"] || row.procedure || "N/A";
        const createdVal = row["Thời gian báo cáo"] || row.createdAt || "";

        // 5 cột chỉ định (J -> N): Nếu có thời điểm đó thì điền 1, KHÔNG CÓ THÌ ĐỂ TRỐNG ""
        const isT1 = (row["Trước tiếp xúc người bệnh"] === 1 || row["Trước tiếp xúc người bệnh"] === "1" || row.t1 === 1 || row.t1 === "1" || row.T1 === 1 || row.T1 === "1") || indVal.indexOf("Trước tiếp xúc người bệnh") !== -1;
        const isT2 = (row["Trước thủ thuật vô khuẩn/sạch"] === 1 || row["Trước thủ thuật vô khuẩn/sạch"] === "1" || row.t2 === 1 || row.t2 === "1" || row.T2 === 1 || row.T2 === "1") || indVal.indexOf("Trước thủ thuật vô khuẩn/sạch") !== -1;
        const isT3 = (row["Sau khi có nguy cơ phơi nhiễm máu/dịch cơ thể"] === 1 || row["Sau khi có nguy cơ phơi nhiễm máu/dịch cơ thể"] === "1" || row.t3 === 1 || row.t3 === "1" || row.T3 === 1 || row.T3 === "1") || indVal.indexOf("Sau khi có nguy cơ phơi nhiễm máu/dịch cơ thể") !== -1;
        const isT4 = (row["Sau tiếp xúc người bệnh"] === 1 || row["Sau tiếp xúc người bệnh"] === "1" || row.t4 === 1 || row.t4 === "1" || row.T4 === 1 || row.T4 === "1") || indVal.indexOf("Sau tiếp xúc người bệnh") !== -1;
        const isT5 = (row["Sau tiếp xúc môi trường xung quanh người bệnh"] === 1 || row["Sau tiếp xúc môi trường xung quanh người bệnh"] === "1" || row.t5 === 1 || row.t5 === "1" || row.T5 === 1 || row.T5 === "1") || indVal.indexOf("Sau tiếp xúc môi trường xung quanh người bệnh") !== -1;

        const t1 = isT1 ? 1 : "";
        const t2 = isT2 ? 1 : "";
        const t3 = isT3 ? 1 : "";
        const t4 = isT4 ? 1 : "";
        const t5 = isT5 ? 1 : "";

        // Tuân thủ VST (Cột O)
        const isNonHygiene = actVal === "Không VST" || actVal === "Mang găng và không VST";
        const compliance = row["Có tuân thủ VST"] || row["Tuân thủ"] || row.compliance || row.tuanThu || (!isNonHygiene ? "Có" : "Không");

        const stt = row["STT"] || row.stt || (i + 1);
        const khuVuc = row["KHU VỰC"] || row["Khu vực"] || row.khuVuc || row.patientType || "N/A";
        const obsId = row["Column 18"] || row.obsId || row.column18 || (dateVal + "_" + observerVal + "_" + staffNameVal + "_" + i);

        rowArray = [
          dateVal,         // A: Ngày giám sát
          observerVal,     // B: Nhân viên giám sát
          deptVal,         // C: Khoa được giám sát
          staffNameVal,    // D: Nhân viên được giám sát
          profVal,         // E: Chức danh
          indVal,          // F: Chỉ định
          actVal,          // G: Hành động
          procVal,         // H: Quy trình
          createdVal,      // I: Thời gian báo cáo
          t1,              // J: Trước tiếp xúc người bệnh
          t2,              // K: Trước thủ thuật vô khuẩn/sạch
          t3,              // L: Sau khi có nguy cơ phơi nhiễm máu/dịch cơ thể
          t4,              // M: Sau tiếp xúc người bệnh
          t5,              // N: Sau tiếp xúc môi trường xung quanh người bệnh
          compliance,      // O: Có tuân thủ VST
          stt,             // P: STT
          khuVuc,          // Q: KHU VỰC
          obsId            // R: Column 18 (Mã quan sát)
        ];
      }

      const obsIdCheck = String(rowArray[17] || "").trim();
      // Chống trùng lặp nếu obsId này đã có trong sheet
      if (obsIdCheck && existingIds.has(obsIdCheck)) {
        skippedCount++;
        continue;
      }

      if (obsIdCheck) {
        existingIds.add(obsIdCheck);
      }
      rowsToAppend.push(rowArray);
    }

    if (rowsToAppend.length > 0) {
      // Ghi hàng loạt (batch write) để tối ưu tốc độ
      const startRow = sheet.getLastRow() + 1;
      sheet.getRange(startRow, 1, rowsToAppend.length, HEADERS.length).setValues(rowsToAppend);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      sheet: SHEET_NAME,
      inserted: rowsToAppend.length,
      skipped: skippedCount,
      totalReceived: rowsData.length
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
