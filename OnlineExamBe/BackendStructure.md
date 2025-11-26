# Backend structure notes

This document summarizes the ASP.NET Core backend currently in the repository.

## Solution and hosting
- `OnlineExamBe/OnlineExam/Program.cs` wires up MVC, Swagger, EF Core with SQL Server, JWT bearer auth, dependency injection bindings for repositories/services, and WebSocket middleware before mapping controllers.【F:OnlineExamBe/OnlineExam/Program.cs†L1-L104】
- `OnlineExamBe/OnlineExam/Properties/launchSettings.json` keeps local profiles for development hosting.

## Domain layer (`OnlineExam.Domain`)
- Entities capture the relational model: users with roles and navigation collections, classes/subjects with relationships, exams, questions, blueprint snapshots, and per-student progress (`ExamStudent`, `StudentQuestion`).【F:OnlineExamBe/OnlineExam.Domain/Entities/User.cs†L6-L22】【F:OnlineExamBe/OnlineExam.Domain/Entities/Exam.cs†L1-L31】【F:OnlineExamBe/OnlineExam.Domain/Entities/ExamBlueprint.cs†L1-L31】
- DTO classes for creating exam blueprints list required chapter-level question counts; supporting enums cover roles, statuses, question types, difficulties, and websocket actions.【F:OnlineExamBe/OnlineExam.Domain/Enums/CreateExamBlueprintDto.cs†L9-L22】【F:OnlineExamBe/OnlineExam.Domain/Enums/UserRole.cs†L1-L13】【F:OnlineExamBe/OnlineExam.Domain/Enums/WebsocketAction.cs†L1-L12】
- `Interfaces/IRepository.cs` defines the generic data access contract used by services.

## Infrastructure layer (`OnlineExam.Infrastructure`)
- `Data/ExamSystemDbContext.cs` exposes DbSets for all aggregates and configures keys, indexes, enum conversions, default values, and relationships (including composite keys for exam/question snapshots).【F:OnlineExamBe/OnlineExam.Infrastructure/Data/ExamSystemDbContext.cs†L6-L182】
- `Repositories/Repository.cs` implements the generic repository with basic CRUD, LINQ queries, and `SaveChangesAsync()` to persist operations.【F:OnlineExamBe/OnlineExam.Infrastructure/Repositories/Repository.cs†L13-L48】
- `Migrations/*.cs` hold EF Core migration history (initial schema and later exam updates).

## Application layer (`OnlineExam.Application`)
- DTO folders describe request/response payloads for authentication, questions, subjects, exams, exam blueprints, and websocket messages.
- Interfaces specify service responsibilities (auth, JWT, email, refresh token, CRUD wrappers, question/subject/exam management, blueprint creation, websocket grading/cache helpers).
- `Services/Base/CrudService.cs` (and `ICrudService`) provide shared CRUD operations backed by the generic repository for other services.
- Auth flow: `Services/Auth/AuthService.cs` handles registration, login/logout, password changes, OTP generation, and delegates token creation/storage to `JwtService` and refresh-token service while caching OTP codes in memory.【F:OnlineExamBe/OnlineExam.Application/Services/Auth/AuthService.cs†L27-L296】
- Exam blueprint & exam generation: `ExamBlueprintService` stores blueprints and chapters; `ExamService` produces exams per student and manages assignments (see controllers below).
- Question/subject/user services encapsulate validation plus repository operations for their respective aggregates.
- Email delivery uses `EmailService` with settings from `Settings/SmtpSettings.cs`.
- Realtime exam flow: `Services/Websocket/ExamAnswerCache.cs` keeps in-memory answer lists per exam/student connection, while `Services/Websocket/ExamGradingService.cs` grades cached answers against the question snapshot, writes `StudentQuestion` rows, updates `ExamStudent` status/score, and clears cache.【F:OnlineExamBe/OnlineExam.Application/Services/Websocket/ExamAnswerCache.cs†L12-L89】【F:OnlineExamBe/OnlineExam.Application/Services/Websocket/ExamGradingService.cs†L14-L96】

## API layer (`OnlineExam` project)
- Controllers expose REST endpoints:
  - `AuthController` wraps auth service for login/logout and OTP endpoints, returning unified `ResultApiModel` responses.【F:OnlineExamBe/OnlineExam/Controllers/AuthController.cs†L13-L54】
  - `UserController` supports listing users, bulk creation from uploaded JSON, single create/update/delete, and a user self-update route.【F:OnlineExamBe/OnlineExam/Controllers/UserController.cs†L18-L83】
  - `SubjectController` lists/queries subjects, enforces unique subject codes on create/update, deletes, and imports JSON batches.【F:OnlineExamBe/OnlineExam/Controllers/SubjectController.cs†L14-L108】【F:OnlineExamBe/OnlineExam/Controllers/SubjectController.cs†L110-L161】
  - `QuestionController` lists questions, imports JSON, CRUDs individual questions.【F:OnlineExamBe/OnlineExam/Controllers/QuestionController.cs†L14-L88】【F:OnlineExamBe/OnlineExam/Controllers/QuestionController.cs†L90-L135】
  - `ExamBlueprintController` creates an exam blueprint from the DTO provided by the application layer.【F:OnlineExamBe/OnlineExam/Controllers/ExamBlueprintController.cs†L8-L20】
  - `ExamController` lets teachers create exams and students start/generate exams, handling prior attempts and returning WebSocket URLs/state flags.【F:OnlineExamBe/OnlineExam/Controllers/ExamController.cs†L13-L92】
- `Middleware/ExamWebSocketMiddleware.cs` accepts `/ws` connections, routes messages to cache/grading services for answer syncing and final submission, and responds with status/score payloads over the socket.【F:OnlineExamBe/OnlineExam/Middleware/ExamWebSocketMiddleware.cs†L9-L114】
- `OnlineExam.http` provides HTTP scratch requests for local testing; `appsettings.Development.json` keeps dev connection string and JWT settings.

## Runtime wiring for WebSockets
- Program registers `IExamAnswerCache` as singleton and `IExamGradingService` as scoped, then enables `UseWebSockets()` and the custom middleware so that REST + realtime features share the same host.【F:OnlineExamBe/OnlineExam/Program.cs†L57-L83】【F:OnlineExamBe/OnlineExam/Program.cs†L89-L103】

## What is missing
- FE/BE integration is not yet wired; controllers provide REST + websocket endpoints but the React client still needs to call them.
- Some features are stubbed/not fully implemented (e.g., password hashing is placeholder, reset-password not implemented, OTP email templates minimal).
