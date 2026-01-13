# Hướng dẫn chạy dự án bằng Docker (Dành cho Giám thị / Người chấm thi)

Tài liệu này hướng dẫn cách dựng toàn bộ hệ thống (Database + Backend) nhanh chóng bằng Docker.

## 1. Yêu cầu (Prerequisites)
- Đã cài **Docker Desktop** (trên Windows hoặc Mac).
- Đã clone source code về máy.

## 2. Các bước Setup

### Bước 1: Cấu hình biến môi trường
1. Tìm file `.env.example` ở thư mục gốc.
2. Copy nó thành file `.env`.
3. Mở file `.env` lên và điền mật khẩu Database (Bắt buộc phải mạnh, có chữ hoa, số, ký tự đặc biệt).
   *Ví dụ:* `DB_PASSWORD=YourStrong!Passw0rd`

### Bước 2: Khởi động hệ thống
Mở Terminal tại thư mục dự án và chạy lệnh:

```powershell
docker compose up -d --build db backend
```
> Lệnh này sẽ tự động tải, build VÀ CHẠY container ngầm (background).

### Bước 2.1: Kiểm tra trạng thái (Quan trọng)
Vì hệ thống cần khoảng 30s-1p để khởi động xong, bạn hãy chạy lệnh này để theo dõi:

1. **Xem có container nào bị tắt không:**
   ```powershell
   docker compose ps
   ```
   *Trạng thái `Up` hoặc `Healthy` là tốt. Nếu thấy `Exited` là lỗi.*

2. **Xem khi nào Backend sẵn sàng:**
   ```powershell
   docker compose logs -f backend
   ```
   *Khi thấy hiện dòng chữ: **"Now listening on: http://..."** thì nghĩa là Backend đã khởi động xong.* (Bấm `Ctrl+C` để thoát xem log).

### Bước 3: Khởi tạo Database (Migrate)
Sau khi Bước 2 chạy xong, chạy tiếp lệnh sau để tạo bảng dữ liệu:

```powershell
docker compose run --rm migrate
```
> Nếu thấy báo **"Done."** là thành công.

---

## 3. Kiểm tra (Testing)

### Kiểm tra Backend & API
Truy cập vào Swagger UI để test API:
👉 **URL:** [http://localhost:8080/swagger](http://localhost:8080/swagger)

*(Lưu ý: Port đọc từ `BE_HTTP_PORT` trong `.env`.)*

### (Tùy chọn) Chạy Frontend
Nếu muốn test giao diện Web (Frontend), bạn có 2 cách:

#### Cách 1: Chạy Frontend bằng Docker (OnlineExamFe)
```powershell
docker compose up -d --build frontend
```
👉 **URL:** http://localhost:5173 (hoặc FE_PORT trong `.env`).

#### Cách 2: Chạy Frontend local (Node.js)
```powershell
cd OnlineExamFe/client
npm install
npm run dev
```
👉 **URL:** http://localhost:5173

---

## 4. Xử lý sự cố thường gặp (Troubleshooting)

**Lỗi 1: Container Database cứ chạy lên rồi tắt (Exited)**
*   **Nguyên nhân:** Mật khẩu trong `.env` quá yếu (SQL Server yêu cầu password rất phức tạp).
*   **Khắc phục:** Sửa `DB_PASSWORD` mạnh hơn. Sau đó chạy: `docker compose down -v` (để xóa volume cũ) rồi `up` lại.

**Lỗi 2: Backend báo lỗi kết nối Database**
*   Chờ khoảng 10-20 giây để SQL Server khởi động xong. Docker có cơ chế healthcheck nhưng đôi khi server cần thêm thời gian.

**Lỗi 3: Port BE_HTTP_PORT bị chiếm dụng**
*   Mở file `.env`, sửa `BE_HTTP_PORT=8082` (hoặc số khác tùy ý) rồi chạy lại.
