# Hướng dẫn Deploy qua Docker Hub (Cho nhiều máy chạy)

Mô hình: **1 người đóng gói (Developer)** -> **Nhiều người dùng (Client/Giám thị)**.
Người dùng KHÔNG cần source code, chỉ cần Docker.

---

## Phần 1: Dành cho Developer (Bạn đóng gói)

### 1. Sửa code để tự động tạo Database
Để người dùng không phải chạy lệnh `migrate` thủ công, Backend đã được cấu hình tự động chạy Migration khi khởi động (trong `Program.cs`).
*Đảm bảo bạn đã commit file Migration mới nhất lên Git trước khi build.*

### 2. Build & Push lên Docker Hub
Giả sử tài khoản Docker Hub của bạn là `hungpham`.

**Bước 1: Login**
```powershell
docker login
```

**Bước 2: Build Image (cho chip Intel/AMD phổ thông)**
```powershell
# Build image backend
docker build -t hungpham/onlineexam-backend:latest ./OnlineExamBe

# Build image frontend
docker build -t hungpham/onlineexam-frontend:latest ./OnlineExamFe/client
```

**Bước 3: Push lên Hub**
```powershell
docker push hungpham/onlineexam-backend:latest
docker push hungpham/onlineexam-frontend:latest
```

---

## Phần 2: Dành cho Người dùng (Client/Giám thị)

Người dùng chỉ cần tạo 1 thư mục bất kỳ trên máy, và tạo 2 file sau:

### File 1: `.env`
(Copy nội dung từ file mẫu bạn gửi cho họ, nhớ sửa `DB_PASSWORD`)

### File 2: `docker-compose.yml`
Nội dung file này SẼ KHÁC file gốc (vì không build nữa mà lấy từ Hub):

```yaml
services:
  db:
    image: mcr.microsoft.com/mssql/server:2022-latest
    container_name: onlineexam-db
    environment:
      ACCEPT_EULA: "Y"
      MSSQL_PID: "Developer"
      MSSQL_SA_PASSWORD: ${DB_PASSWORD}
    ports:
      - "${DB_PORT}:1433"
    volumes:
      - db_data:/var/opt/mssql
    healthcheck:
      test: [ "CMD-SHELL", "/opt/mssql-tools/bin/sqlcmd -S localhost -U sa -P $$MSSQL_SA_PASSWORD -C -Q \"SELECT 1\" >/dev/null || /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P $$MSSQL_SA_PASSWORD -C -Q \"SELECT 1\" >/dev/null" ]
      interval: 10s
      timeout: 5s
      retries: 15
      start_period: 20s
    restart: unless-stopped

  backend:
    image: hungpham/onlineexam-backend:latest  # <--- Lấy từ Docker Hub của bạn
    container_name: onlineexam-backend
    environment:
      ASPNETCORE_URLS: http://0.0.0.0:8080
      ASPNETCORE_ENVIRONMENT: Production # Chạy chế độ Production cho nhẹ
      ConnectionStrings__DefaultConnection: "Server=${DB_HOST};Database=${DB_NAME};User Id=${DB_USER};Password=${DB_PASSWORD};TrustServerCertificate=True;Encrypt=False;MultipleActiveResultSets=true"
    ports:
      - "${BE_HTTP_PORT}:8080"
    depends_on:
      db:
        condition: service_healthy
    restart: unless-stopped

  frontend:
    image: hungpham/onlineexam-frontend:latest # <--- Image Frontend từ Hub
    container_name: onlineexam-frontend
    environment:
      VITE_API_BASE_URL: ""
      VITE_API_TARGET: "http://backend:8080" # Gọi nội bộ sang container backend
    ports:
      - "${FE_PORT}:5173"
    depends_on:
      - backend
    restart: unless-stopped

volumes:
  db_data:
```

### Cách chạy (End-User)
Chỉ cần mở terminal tại thư mục đó và gõ:

```powershell
docker compose up -d
```
Xong! Hệ thống sẽ tự tải về, tự tạo Database và chạy.
