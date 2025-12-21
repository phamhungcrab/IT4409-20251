# Cau truc thu muc va nhiem vu tung file

## Ten goi va ly do to chuc
- Repo nay la monorepo: gom 2 phan ro rang `OnlineExamBe/` (backend) va `OnlineExamFe/` (frontend) de tach build, deploy, va phan cong viec.
- Backend dung mo hinh "Clean Architecture" (Layered/Onion): `OnlineExam` (API/Presentation) -> `OnlineExam.Application` (use case) -> `OnlineExam.Domain` (core) -> `OnlineExam.Infrastructure` (data/IO). Cach nay giu phu thuoc di vao trong, de test va thay the ha tang.
- Frontend dung cau truc layer theo vai tro: `pages/` (man hinh), `components/` (UI tai su dung), `hooks/` (logic dung chung), `services/` (API), `utils/` (helper), `types/` (kieu).

## Luu y ve thu muc sinh ra
- Cac thu muc build/IDE nhu `bin/`, `obj/`, `node_modules/`, `.vs/`, `.vscode/`, `.agent/`, `tmp/` la tu sinh hoac phu thuoc may, khong nam trong danh sach chi tiet ben duoi.

## Root
- .gitignore - quy tac bo qua file build/IDE khi dung git.
- BE_SETUP.md - huong dan setup backend.
- FE_SETUP.md - huong dan setup frontend.
- TEST_CHECKLIST.md - danh sach test thu cong.
- swagger.json - mo ta API (OpenAPI) de frontend biet contract.
- testMSSSV.json - du lieu test hoac mau dau vao.
- package-lock.json - lockfile npm neu co cong viec o root.
- OnlineExamBe/ - ma nguon backend (xem muc OnlineExamBe).
- OnlineExamFe/ - ma nguon frontend (xem muc OnlineExamFe).
- tmp/ - thu muc tam.

## OnlineExamBe
- OnlineExamBe/Dockerfile - dong goi backend vao container.

## OnlineExamBe/OnlineExam (API/Presentation)
- OnlineExamBe/OnlineExam/appsettings.json - cau hinh chinh (connection string, jwt, smtp, ...).
- OnlineExamBe/OnlineExam/appsettings.Development.json - cau hinh cho moi truong dev.
- OnlineExamBe/OnlineExam/OnlineExam.csproj - file project .NET.
- OnlineExamBe/OnlineExam/OnlineExam.csproj.user - thiet lap rieng cua user IDE.
- OnlineExamBe/OnlineExam/OnlineExam.sln - solution cho Visual Studio.
- OnlineExamBe/OnlineExam/OnlineExam.http - mau request HTTP de test nhanh.
- OnlineExamBe/OnlineExam/Program.cs - entry point, DI, middleware, routing.
- OnlineExamBe/OnlineExam/Properties/launchSettings.json - profile chay local.

## OnlineExamBe/OnlineExam/Attributes
- OnlineExamBe/OnlineExam/Attributes/SessionAuthorizeAttribute.cs - attribute kiem tra session/phan quyen.

## OnlineExamBe/OnlineExam/Middleware
- OnlineExamBe/OnlineExam/Middleware/ExamWebSocketMiddleware.cs - xu ly WebSocket cho phong thi.
- OnlineExamBe/OnlineExam/Middleware/SessionMiddleware.cs - xu ly session cho request.

## OnlineExamBe/OnlineExam/Controllers
- OnlineExamBe/OnlineExam/Controllers/AboutController.cs - endpoint thong tin he thong.
- OnlineExamBe/OnlineExam/Controllers/AuthController.cs - endpoint dang nhap/OTP/doi mat khau.
- OnlineExamBe/OnlineExam/Controllers/CLassController.cs - endpoint quan ly lop hoc.
- OnlineExamBe/OnlineExam/Controllers/ExamBlueprintController.cs - endpoint de thi mau (blueprint).
- OnlineExamBe/OnlineExam/Controllers/ExamController.cs - endpoint thi va quan ly bai thi.
- OnlineExamBe/OnlineExam/Controllers/QuestionController.cs - endpoint cau hoi.
- OnlineExamBe/OnlineExam/Controllers/ResultController.cs - endpoint ket qua thi.
- OnlineExamBe/OnlineExam/Controllers/SubjectController.cs - endpoint mon hoc.
- OnlineExamBe/OnlineExam/Controllers/UserController.cs - endpoint nguoi dung.

## OnlineExamBe/OnlineExam.Application (Use case)
- OnlineExamBe/OnlineExam.Application/OnlineExam.Application.csproj - project Application layer.

## OnlineExamBe/OnlineExam.Application/Settings
- OnlineExamBe/OnlineExam.Application/Settings/SmtpSettings.cs - mo hinh cau hinh SMTP.

## OnlineExamBe/OnlineExam.Application/Helper
- OnlineExamBe/OnlineExam.Application/Helper/CheckValidHelper.cs - ham kiem tra hop le input.
- OnlineExamBe/OnlineExam.Application/Helper/RanNumGenHelper.cs - tao so ngau nhien.

## OnlineExamBe/OnlineExam.Application/Interfaces
- OnlineExamBe/OnlineExam.Application/Interfaces/IAboutService.cs - contract dich vu thong tin.
- OnlineExamBe/OnlineExam.Application/Interfaces/IClassService.cs - contract dich vu lop hoc.
- OnlineExamBe/OnlineExam.Application/Interfaces/ICrudService.cs - contract CRUD chung.
- OnlineExamBe/OnlineExam.Application/Interfaces/IEmailService.cs - contract gui email.
- OnlineExamBe/OnlineExam.Application/Interfaces/IExamBlueprintService.cs - contract dich vu blueprint.
- OnlineExamBe/OnlineExam.Application/Interfaces/IExamService.cs - contract dich vu bai thi.
- OnlineExamBe/OnlineExam.Application/Interfaces/IQuestionService.cs - contract dich vu cau hoi.
- OnlineExamBe/OnlineExam.Application/Interfaces/ISubjectService.cs - contract dich vu mon hoc.
- OnlineExamBe/OnlineExam.Application/Interfaces/IUserService.cs - contract dich vu nguoi dung.
- OnlineExamBe/OnlineExam.Application/Interfaces/Auth/IAuthService.cs - contract auth.
- OnlineExamBe/OnlineExam.Application/Interfaces/Auth/ISessionService.cs - contract session.
- OnlineExamBe/OnlineExam.Application/Interfaces/Websocket/IExamAnswerCache.cs - contract cache dap an WS.
- OnlineExamBe/OnlineExam.Application/Interfaces/Websocket/IExamGradingService.cs - contract cham diem WS.

## OnlineExamBe/OnlineExam.Application/Services
- OnlineExamBe/OnlineExam.Application/Services/AboutService.cs - xu ly nghiep vu thong tin.
- OnlineExamBe/OnlineExam.Application/Services/ClassService.cs - xu ly nghiep vu lop hoc.
- OnlineExamBe/OnlineExam.Application/Services/EmailService.cs - gui email/OTP.
- OnlineExamBe/OnlineExam.Application/Services/ExamBlueprintService.cs - nghiep vu blueprint de thi.
- OnlineExamBe/OnlineExam.Application/Services/ExamService.cs - nghiep vu bai thi.
- OnlineExamBe/OnlineExam.Application/Services/QuestionService.cs - nghiep vu cau hoi.
- OnlineExamBe/OnlineExam.Application/Services/SubjectService.cs - nghiep vu mon hoc.
- OnlineExamBe/OnlineExam.Application/Services/UserService.cs - nghiep vu nguoi dung.
- OnlineExamBe/OnlineExam.Application/Services/Auth/AuthService.cs - xu ly dang nhap/OTP/reset.
- OnlineExamBe/OnlineExam.Application/Services/Auth/SessionService.cs - xu ly session.
- OnlineExamBe/OnlineExam.Application/Services/Helpers/AnswerParser.cs - tach/parse dap an thi.
- OnlineExamBe/OnlineExam.Application/Services/base/CrudService.cs - logic CRUD chung.
- OnlineExamBe/OnlineExam.Application/Services/Websocket/ExamAnswerCache.cs - cache dap an trong WS.
- OnlineExamBe/OnlineExam.Application/Services/Websocket/ExamGradingService.cs - cham diem real-time WS.

## OnlineExamBe/OnlineExam.Application/Dtos
- OnlineExamBe/OnlineExam.Application/Dtos/SearchBaseDto.cs - thong tin tim kiem co ban.
- OnlineExamBe/OnlineExam.Application/Dtos/About/AboutDto.cs - payload cho about.
- OnlineExamBe/OnlineExam.Application/Dtos/Class/AddStudentDto.cs - payload them hoc sinh vao lop.
- OnlineExamBe/OnlineExam.Application/Dtos/Class/CreateClassDto.cs - payload tao lop.
- OnlineExamBe/OnlineExam.Application/Dtos/Class/UpdateClassDto.cs - payload cap nhat lop.
- OnlineExamBe/OnlineExam.Application/Dtos/Exam/CreateExamDto.cs - payload tao bai thi.
- OnlineExamBe/OnlineExam.Application/Dtos/Exam/ExamGenerateResultDto.cs - payload tao ket qua.
- OnlineExamBe/OnlineExam.Application/Dtos/Exam/ExamStartRequest.cs - payload bat dau thi.
- OnlineExamBe/OnlineExam.Application/Dtos/ExamBlueprint/ExamBlueprintDto.cs - thong tin blueprint de thi.
- OnlineExamBe/OnlineExam.Application/Dtos/ExamStudent/ResponseResultExamDto.cs - response ket qua thi cho sinh vien.
- OnlineExamBe/OnlineExam.Application/Dtos/Question/CreateQuestionDto.cs - payload tao cau hoi.
- OnlineExamBe/OnlineExam.Application/Dtos/ResponseDtos/ResultApiModel.cs - mau response chung.
- OnlineExamBe/OnlineExam.Application/Dtos/ResponseDtos/TokenResponse.cs - response token auth.
- OnlineExamBe/OnlineExam.Application/Dtos/Result/ResultDetailDto.cs - chi tiet ket qua thi.
- OnlineExamBe/OnlineExam.Application/Dtos/Result/StudentResultDto.cs - ket qua theo sinh vien.
- OnlineExamBe/OnlineExam.Application/Dtos/Subject/CreateSubjectDto.cs - payload tao mon hoc.
- OnlineExamBe/OnlineExam.Application/Dtos/User/CreateUserAdminDto.cs - payload tao user boi admin.
- OnlineExamBe/OnlineExam.Application/Dtos/User/SearchForAdminDto.cs - payload tim user cho admin.
- OnlineExamBe/OnlineExam.Application/Dtos/User/SearchForUserDto.cs - payload tim user.
- OnlineExamBe/OnlineExam.Application/Dtos/User/UserUpdateDto.cs - payload cap nhat user.
- OnlineExamBe/OnlineExam.Application/Dtos/WebSocket/WsMessageDto.cs - khung message WebSocket.
- OnlineExamBe/OnlineExam.Application/Dtos/RequestDtos/Auth/CheckOtpDto.cs - payload check OTP.
- OnlineExamBe/OnlineExam.Application/Dtos/RequestDtos/Auth/ChangePasswordDto.cs - payload doi mat khau.
- OnlineExamBe/OnlineExam.Application/Dtos/RequestDtos/Auth/LoginDto.cs - payload dang nhap.
- OnlineExamBe/OnlineExam.Application/Dtos/RequestDtos/Auth/LogoutDto.cs - payload dang xuat.
- OnlineExamBe/OnlineExam.Application/Dtos/RequestDtos/Auth/OtpDto.cs - payload OTP chung.
- OnlineExamBe/OnlineExam.Application/Dtos/RequestDtos/Auth/RegisterDto.cs - payload dang ky.
- OnlineExamBe/OnlineExam.Application/Dtos/RequestDtos/Auth/ResetPasswordDto.cs - payload quen mat khau.
- OnlineExamBe/OnlineExam.Application/Dtos/RequestDtos/Auth/SendOtpDto.cs - payload gui OTP.

## OnlineExamBe/OnlineExam.Domain (Core)
- OnlineExamBe/OnlineExam.Domain/OnlineExam.Domain.csproj - project Domain layer.
- OnlineExamBe/OnlineExam.Domain/README.txt - ghi chu domain.

## OnlineExamBe/OnlineExam.Domain/Interfaces
- OnlineExamBe/OnlineExam.Domain/Interfaces/IRepository.cs - contract repository chung.

## OnlineExamBe/OnlineExam.Domain/Entities
- OnlineExamBe/OnlineExam.Domain/Entities/CachedAnswer.cs - model dap an tam cache.
- OnlineExamBe/OnlineExam.Domain/Entities/Class.cs - model lop hoc.
- OnlineExamBe/OnlineExam.Domain/Entities/Exam.cs - model bai thi.
- OnlineExamBe/OnlineExam.Domain/Entities/ExamBlueprint.cs - model blueprint de thi.
- OnlineExamBe/OnlineExam.Domain/Entities/ExamBlueprintChapter.cs - chuong trong blueprint.
- OnlineExamBe/OnlineExam.Domain/Entities/ExamStudent.cs - lien ket sinh vien va bai thi.
- OnlineExamBe/OnlineExam.Domain/Entities/Question.cs - model cau hoi.
- OnlineExamBe/OnlineExam.Domain/Entities/QuestionExam.cs - lien ket cau hoi trong bai thi.
- OnlineExamBe/OnlineExam.Domain/Entities/Session.cs - model phien dang nhap.
- OnlineExamBe/OnlineExam.Domain/Entities/StudentClass.cs - lien ket sinh vien va lop.
- OnlineExamBe/OnlineExam.Domain/Entities/StudentQuestion.cs - cau hoi cua sinh vien.
- OnlineExamBe/OnlineExam.Domain/Entities/Subject.cs - model mon hoc.
- OnlineExamBe/OnlineExam.Domain/Entities/User.cs - model nguoi dung.

## OnlineExamBe/OnlineExam.Domain/Enums
- OnlineExamBe/OnlineExam.Domain/Enums/CreateExamBlueprintDto.cs - enum/const lien quan tao blueprint.
- OnlineExamBe/OnlineExam.Domain/Enums/ExamStatus.cs - trang thai bai thi.
- OnlineExamBe/OnlineExam.Domain/Enums/QuestionDifficulty.cs - do kho cau hoi.
- OnlineExamBe/OnlineExam.Domain/Enums/QuestionType.cs - loai cau hoi.
- OnlineExamBe/OnlineExam.Domain/Enums/ResponseCode.cs - ma ket qua API.
- OnlineExamBe/OnlineExam.Domain/Enums/UserRole.cs - vai tro nguoi dung.
- OnlineExamBe/OnlineExam.Domain/Enums/WebsocketAction.cs - hanh dong trong WS.

## OnlineExamBe/OnlineExam.Infrastructure (Data/IO)
- OnlineExamBe/OnlineExam.Infrastructure/OnlineExam.Infrastructure.csproj - project Infrastructure layer.
- OnlineExamBe/OnlineExam.Infrastructure/Data/ExamSystemDbContext.cs - EF Core DbContext.
- OnlineExamBe/OnlineExam.Infrastructure/Repositories/Repository.cs - generic repository.
- OnlineExamBe/OnlineExam.Infrastructure/Migrations/20251127105148_InitialCreate.cs - migration tao schema.
- OnlineExamBe/OnlineExam.Infrastructure/Migrations/20251127105148_InitialCreate.Designer.cs - metadata migration.
- OnlineExamBe/OnlineExam.Infrastructure/Migrations/ExamSystemDbContextModelSnapshot.cs - snapshot model.

## OnlineExamFe
- OnlineExamFe/.env.example - mau bien moi truong.
- OnlineExamFe/IT4409-20251.sln - solution cho IDE neu can.
- OnlineExamFe/LICENSE - giay phep du an.
- OnlineExamFe/package-lock.json - lockfile npm tai root FE.
- OnlineExamFe/client/ - ung dung React/Vite (xem muc OnlineExamFe/client).

## OnlineExamFe/client (Vite + React)
- OnlineExamFe/client/index.html - HTML entry cho Vite.
- OnlineExamFe/client/package.json - khai bao script va dependency.
- OnlineExamFe/client/package-lock.json - lockfile cho client.
- OnlineExamFe/client/tsconfig.json - cau hinh TypeScript.
- OnlineExamFe/client/vite.config.ts - cau hinh Vite.
- OnlineExamFe/client/eslintrc.js - cau hinh ESLint.
- OnlineExamFe/client/postcss.config.js - cau hinh PostCSS.
- OnlineExamFe/client/tailwind.config.js - cau hinh Tailwind.
- OnlineExamFe/client/test-login.js - script test dang nhap nhanh.

## OnlineExamFe/client/public
- OnlineExamFe/client/public/site.webmanifest - PWA manifest.
- OnlineExamFe/client/public/favicon.ico - favicon chinh.
- OnlineExamFe/client/public/favicon-16x16.png - favicon 16px.
- OnlineExamFe/client/public/favicon-32x32.png - favicon 32px.
- OnlineExamFe/client/public/apple-touch-icon.png - icon iOS.
- OnlineExamFe/client/public/android-chrome-192x192.png - icon Android 192px.
- OnlineExamFe/client/public/android-chrome-512x512.png - icon Android 512px.
- OnlineExamFe/client/public/favicon_io.zip - goi tai san favicon.

## OnlineExamFe/client/src (React source)
- OnlineExamFe/client/src/App.tsx - root component, khung app.
- OnlineExamFe/client/src/index.tsx - entry React vao DOM.
- OnlineExamFe/client/src/index.css - style global.
- OnlineExamFe/client/src/routes.tsx - dinh tuyen trang.

## OnlineExamFe/client/src/i18n
- OnlineExamFe/client/src/i18n/i18n.ts - cau hinh i18n.
- OnlineExamFe/client/src/i18n/en.json - ban dich tieng Anh.
- OnlineExamFe/client/src/i18n/vi.json - ban dich tieng Viet.

## OnlineExamFe/client/src/types
- OnlineExamFe/client/src/types/exam.ts - kieu du lieu lien quan bai thi.

## OnlineExamFe/client/src/utils
- OnlineExamFe/client/src/utils/apiClient.ts - tao HTTP client, interceptor, base URL.
- OnlineExamFe/client/src/utils/formatting.ts - ham format du lieu.
- OnlineExamFe/client/src/utils/validateInputs.ts - ham validate input.

## OnlineExamFe/client/src/services
- OnlineExamFe/client/src/services/authService.ts - goi API auth.
- OnlineExamFe/client/src/services/classService.ts - goi API lop hoc.
- OnlineExamFe/client/src/services/examService.ts - goi API bai thi.
- OnlineExamFe/client/src/services/monitoringService.ts - goi API giam sat thi.
- OnlineExamFe/client/src/services/questionService.ts - goi API cau hoi.
- OnlineExamFe/client/src/services/resultService.ts - goi API ket qua.
- OnlineExamFe/client/src/services/userService.ts - goi API nguoi dung.

## OnlineExamFe/client/src/hooks
- OnlineExamFe/client/src/hooks/useAnnouncements.ts - hook lay/thong bao thong tin.
- OnlineExamFe/client/src/hooks/useApi.ts - hook dung chung cho API.
- OnlineExamFe/client/src/hooks/useAuth.tsx - hook auth va session FE.
- OnlineExamFe/client/src/hooks/useExam.ts - hook logic thi.
- OnlineExamFe/client/src/hooks/useTimer.ts - hook dem gio.

## OnlineExamFe/client/src/components
- OnlineExamFe/client/src/components/AnnouncementBanner.tsx - banner thong bao.
- OnlineExamFe/client/src/components/Layout.tsx - layout tong the.
- OnlineExamFe/client/src/components/OptionList.tsx - danh sach dap an.
- OnlineExamFe/client/src/components/QuestionCard.tsx - the cau hoi.
- OnlineExamFe/client/src/components/ResultTable.tsx - bang ket qua.
- OnlineExamFe/client/src/components/RoleGuard.tsx - bao ve route theo role.
- OnlineExamFe/client/src/components/Sidebar.tsx - menu ben.
- OnlineExamFe/client/src/components/Timer.tsx - UI dem gio.

## OnlineExamFe/client/src/pages
- OnlineExamFe/client/src/pages/AdminPage.tsx - trang quan tri.
- OnlineExamFe/client/src/pages/ExamListPage.tsx - trang danh sach bai thi.
- OnlineExamFe/client/src/pages/ExamRoomPage.tsx - phong thi.
- OnlineExamFe/client/src/pages/ForbiddenPage.tsx - trang 403.
- OnlineExamFe/client/src/pages/HomePage.tsx - trang chu.
- OnlineExamFe/client/src/pages/LoginPage.tsx - dang nhap.
- OnlineExamFe/client/src/pages/NotFoundPage.tsx - trang 404.
- OnlineExamFe/client/src/pages/ResultDetailPage.tsx - chi tiet ket qua.
- OnlineExamFe/client/src/pages/ResultsPage.tsx - danh sach ket qua.

## OnlineExamFe/client/src/pages/home
- OnlineExamFe/client/src/pages/home/StudentDashboard.tsx - dashboard sinh vien.
- OnlineExamFe/client/src/pages/home/TeacherDashboard.tsx - dashboard giao vien.
