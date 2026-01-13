# Student Exam Flow (Start → WS → Submit)

This documents all branches and data flow in code for the student taking an exam: HTTP start, WebSocket timing/answers, and FE handling.

## HTTP Start Exam (REST)
- Endpoint: `POST /api/Exam/start-exam` (`OnlineExamBe/OnlineExam/Controllers/ExamController.cs`).
- Auth: `SessionMiddleware` requires `Session` header on all `/api/**` except `/api/auth/**`. FE `apiClient` sets `Session` from `localStorage.token`.
- Request body: `{ examId, studentId }` (`ExamStartRequest` in `OnlineExamFe/client/src/services/examService.ts`).
- Response cases:
  - `status: "create"` + `wsUrl` + `data` (generated exam payload) when no prior attempt; also inserts `ExamStudent` with `IN_PROGRESS`.
  - `status: "in_progress"` + `wsUrl` if attempt exists and deadline not passed.
  - `status: "completed"` + `data` summary if already submitted.
  - `status: "expired"` when past deadline/endTime; `status: "not_started"` if before startTime (returned as 400).
  - `wsUrl` is built from current request scheme/host: `{ws|wss}://{host}/ws?examId=...&studentId=...`.
- Other exam endpoints used in flow:  
  - `GET /api/Exam/exams/{examId}/current-question?studentId=...` to recover questions if needed.

## FE Start Flow (ExamListPage → ExamRoomPage)
- `ExamListPage` (`OnlineExamFe/client/src/pages/ExamListPage.tsx`):
  - Calls `examService.startExam({ examId, studentId })`.
  - Logs response, normalizes `wsUrl` for local dev vs deploy (switch wss→ws, replace host if mixing localhost/onrender, or prefix when wsUrl is relative).
  - Navigates to `/exam/:examId` (ExamRoomPage) with `state` containing `wsUrl`, `duration`, `questions` (payload).
- `examService.startExam` (`OnlineExamFe/client/src/services/examService.ts`) wraps the REST call. `apiClient` unwraps `ResultApiModel` and injects `Session` header.

## Exam Room Initialization (ExamRoomPage)
- Reads `examId` from route params; `wsUrl`, `duration`, `questions` from `location.state`.
- Sets local state: `questions`, `answers`, `currentQuestionIndex`, `internalWsUrl`, `internalDuration`.
- Recovery path: if `location.state` missing (refresh), calls `startExam` again (line ~440) to fetch `wsUrl`/questions; may set `duration` from response.
- Timer: uses `useTimer` with `timerStorageKey=exam_${examId}_timer_start` (sessionStorage) to persist countdown across refresh; can be updated by WS time sync.

## WebSocket Handshake & Transport
- FE builds final WS URL in `useExam` (`OnlineExamFe/client/src/hooks/useExam.ts`) and appends `session=<token>` query param if token exists.
- Server WS endpoint: `/ws` handled by `ExamWebSocketMiddleware` (`OnlineExamBe/OnlineExam/Middleware/ExamWebSocketMiddleware.cs`):
  - Validates query `examId`, `studentId`; if `session` query present, validates session and enforces `UserId == studentId` (401/403 otherwise). Session is optional in code for easier testing.
  - Accepts WS and starts two loops: send loop (time ticks) and receive loop (actions).

### Server → Client messages
- Send loop runs every second:
  - Loads `ExamStudent` + `Exam` to compute `remainingTime = exam.DurationMinutes*60 - (now - startTime)`.
  - If `remainingTime <= 0` or `exam.EndTime` passed ⇒ `HandleSubmitExam` (auto-submit), close socket.
  - Otherwise sends `remainingTime` as text (number string).
- `HandleSubmitExam`:
  - Calls `ExamGradingService.GradeAndSaveAsync`, clears `IExamAnswerCache`, sends `{ status: "submitted" }`, closes WS.
- `HandleSync`:
  - Reads answers from `IExamAnswerCache`, sends JSON array.
- Errors: `SendWsError` sends `{ status:"error", code, message }`.

### Client → Server messages (FE useExam)
- Payloads sent via `useExam`:
  - `SubmitAnswer`: `{ Action: "SubmitAnswer", Order, QuestionId, Answer }` on every change.
  - `SubmitExam`: `{ Action: "SubmitExam" }` when user confirms submit.
  - `SyncState`: `{ Action: "SyncState" }` auto on connect and on requestSync.
  - `Heartbeat`: `{ Action: "Heartbeat" }` every 30s to keep-alive.
- Server receive loop (`ExamWebSocketMiddleware`) routes by `WebsocketAction`:
  - `SubmitAnswer` → validates attempt status + inputs, caches answer in `IExamAnswerCache`, echoes `{ status: "submitted", order, questionId, answer }`.
  - `SubmitExam` → calls `HandleSubmitExam`.
  - `SyncState`/`Reconnect` → calls `HandleSync`.
  - `Heartbeat` → echoes `{ status: "Heartbeat" }`.

## FE WS Handling (useExam + ExamRoomPage)
- `useExam`:
  - Manages WS lifecycle: states `connecting/connected/reconnecting/disconnected`, exponential backoff (1s→10s) up to 5 attempts.
  - Appends `session` query token to WS URL.
  - On open: sends `SyncState`, starts 30s heartbeat interval.
  - On message:
    - Number/string digits ⇒ `onTimeSync(remainingSeconds)` (updates timer).
    - `status: "submitted"` ⇒ `onSubmitted`.
    - Array ⇒ `onSynced` (restore answers).
    - `status/type: "error"` ⇒ `onError`.
  - On close: clears heartbeat, schedules reconnect or reports error after max attempts.
  - Exposes `syncAnswer`, `submitExam`, `requestSync`.
- Answer persistence on FE:
  - On each `syncAnswer` call: if WS open, send `SubmitAnswer` and store backup in `localStorage` (`exam_${examId}_q_${questionId}`); if WS closed, only stores locally.
  - `onSynced` merges server answers into state; handles both camelCase/PascalCase.
- Timer handling:
  - `useTimer` (not shown here) runs countdown from `duration` and sessionStorage start time; `onTimeSync` from WS can override `remainingTime`.
  - When time hits 0, UI triggers submit via `submitExam`.

## Navigation & State Persistence
- After start-exam, `ExamListPage` navigates with `state` to avoid re-fetch; `ExamRoomPage` keeps `internalWsUrl/internalDuration` so reconnections use latest values.
- If WS URL missing and `status=in_progress`, ExamRoomPage re-calls `startExam` to get `wsUrl` and uses `requestSync` to fetch cached answers.
- Submission UI: confirm modal triggers `submitExam`; server response with `status:"submitted"` sets `submitResult` (score/maxScore) and removes timer key from sessionStorage.

## Key Files
- FE: `OnlineExamFe/client/src/pages/ExamListPage.tsx`, `OnlineExamFe/client/src/pages/ExamRoomPage.tsx`, `OnlineExamFe/client/src/hooks/useExam.ts`, `OnlineExamFe/client/src/services/examService.ts`, `OnlineExamFe/client/src/services/monitoringService.ts`.
- BE: `OnlineExamBe/OnlineExam/Controllers/ExamController.cs` (`start-exam`), `OnlineExamBe/OnlineExam/Middleware/SessionMiddleware.cs` (Session header), `OnlineExamBe/OnlineExam/Middleware/ExamWebSocketMiddleware.cs` (WS), `OnlineExamBe/OnlineExam.Application/Services/Websocket/ExamGradingService.cs` (grading via `HandleSubmitExam`).
