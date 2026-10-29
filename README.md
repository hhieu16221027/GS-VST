# Hệ thống Giám sát Vệ sinh Tay (GIÁM SÁT VST) - BVĐK Tân Phú

Ứng dụng chuyên nghiệp dành cho nhân viên y tế để ghi nhận và báo cáo kết quả giám sát tuân thủ vệ sinh tay tại Bệnh viện Đa khoa Tân Phú.

---

## 🛠 Cấu hình Google Sheets & Google Apps Script (Sheet "BC VST")

### 1. Cấu trúc 18 Cột trong Trang tính "BC VST":
- **Cột A**: Ngày giám sát
- **Cột B**: Nhân viên giám sát
- **Cột C**: Khoa được giám sát
- **Cột D**: Nhân viên được giám sát
- **Cột E**: Chức danh
- **Cột F**: Chỉ định
- **Cột G**: Hành động
- **Cột H**: Quy trình
- **Cột I**: Thời gian báo cáo
- **Cột J**: Trước tiếp xúc người bệnh (Điền **1** nếu có, **để trống** nếu không)
- **Cột K**: Trước thủ thuật vô khuẩn/sạch (Điền **1** nếu có, **để trống** nếu không)
- **Cột L**: Sau khi có nguy cơ phơi nhiễm máu/dịch cơ thể (Điền **1** nếu có, **để trống** nếu không)
- **Cột M**: Sau tiếp xúc người bệnh (Điền **1** nếu có, **để trống** nếu không)
- **Cột N**: Sau tiếp xúc môi trường xung quanh người bệnh (Điền **1** nếu có, **để trống** nếu không)
- **Cột O**: Có tuân thủ VST ("Có" hoặc "Không")
- **Cột P**: STT
- **Cột Q**: KHU VỰC (Nội trú / Ngoại trú)
- **Cột R**: Column 18 (Mã quan sát obsId)

### 2. Các bước Triển khai Google Apps Script (BẮT BUỘC):
1. Mở file Google Sheets chứa sheet **BC VST** (hoặc để script tự tạo sheet).
2. Vào **Tiện ích mở rộng (Extensions)** -> **Apps Script**.
3. Dán toàn bộ nội dung từ file `google-apps-script.gs` vào `Code.gs`.
4. Bấm **Lưu (Save)**.
5. Nhấn nút **Triển khai (Deploy)** ở góc trên bên phải -> **Tùy chọn triển khai mới (New deployment)**.
6. Chọn loại: **Ứng dụng web (Web app)**.
7. Cấu hình quyền:
   - **Thực thi dưới tên (Execute as)**: `Tôi` (Me)
   - **Người có quyền truy cập (Who has access)**: `Bất kỳ ai` (**Anyone**) *(Lưu ý: Nếu chọn "Chỉ mình tôi", hệ thống Google sẽ trả về lỗi HTTP 401 chặn đẩy dữ liệu)*.
8. Bấm **Triển khai (Deploy)** và cấp quyền (Authorize access) bằng tài khoản Google.
9. Sao chép URL Web App nhận được (`.../exec`).

### 3. Cơ chế Đồng bộ (Sync) & Bảo toàn dữ liệu:
- Toàn bộ các phiên giám sát được lưu an toàn trong bộ nhớ máy (`localStorage`).
- Nếu bạn xoá hết dữ liệu trong Google Sheet (hoặc tạo sheet mới), chỉ cần vào tab **Nhật ký** trên app và bấm **ĐỒNG BỘ**, toàn bộ dữ liệu sẽ được đẩy lại đầy đủ mà không bị mất.
- Hệ thống hỗ trợ kiểm tra mã định danh tại Cột R để tránh bị trùng lặp dòng khi đồng bộ từ nhiều tài khoản.

---
*Phát triển bởi Đội ngũ Kiểm soát Nhiễm khuẩn - BVĐK Tân Phú.*
