# Backend changes since 89db465c11b0215cdcfa264dc0aede3ae73de991

Scope: git diff between commit 89db465c11b0215cdcfa264dc0aede3ae73de991 and current working tree for path `OnlineExamBe/`. This shareable version excludes IDE/build artifacts.

## FE action items
- Update FE exam start handling for "not_started"/"expired" statuses and UTC times.
- Adjust WebSocket submit handling to read {status, score, maxScore} on submit.
- Use ExamGenerateResultDto.CorrectOptionIds when rendering answers.
- Update login request payload to send ipAddress (not ipAdress).
- Verify FE origin matches CORS allowlist (localhost:5173 or render URL).

## FE-impacting changes
### Summary
- New API surface for exam blueprint, result, and subject management.
- Exam start/generate/grading behavior changed (UTC handling, resume behavior, answer normalization, maxScore).
- WebSocket contract changed (submit response includes maxScore, answer parsing more flexible).
- FE-relevant hosting/config changes (Kestrel ports, CORS policy, JSON cycles ignored).

### API and contract changes
#### ExamController (api/Exam)
- POST /create-exam uses CreateExamForTeacherOrAdmin {name, classId, blueprintId, durationMinutes, startTime, endTime}.
- POST /start-exam response contract changed:
  - status values: "not_started" (startTime), "expired", "in_progress" (wsUrl + data), "completed" (data), "create" (wsUrl + data).
  - wsUrl is now built from WebSocket config (DevBaseUrl/PublicBaseUrl, LocalHost/LocalPort).
  - start time and end time are normalized to UTC; expired/not_started logic added.
- GET /get-by-student?studentId=...
- GET /get-all
- POST /generate still returns {message, exam} but ExamGenerateResultDto has new field CorrectOptionIds in each question.

#### ExamBlueprintController (api/ExamBlueprint) [new]
- POST /create expects CreateExamBlueprintDto {subjectId, chapters[{chapter,easyCount,mediumCount,hardCount,veryHardCount}]}.

#### ResultController (api/Result) [new]
- GET /student/{studentId} -> StudentResultDto {examId, examName, score, status, submittedAt}.
- GET /detail?studentId=...&examId=... -> ResultDetailDto with per-question results and percentage.
- Side effect: updates StudentQuestion.Result when detail is fetched.

#### SubjectController (api/Subject) [new]
- GET /get-all, GET /{id}, GET /get-with-{code}
- POST /create, PUT /update/{id}, DELETE /delete/{id}
- POST /import-subject (multipart file JSON).

### WebSocket (ExamWebSocketMiddleware + WsMessageDto)
- WsMessageDto fields: action, order, questionId, answer (case-insensitive JSON).
- SubmitAnswer now persists raw answer to DB and caches normalized answer.
- If Answer is JSON array, it is normalized to "A|B".
- SubmitExam response changed from {status, score} to {status, score, maxScore}.
- Auto-submit timing now uses UTC and min(endTime, start+duration).

### Auth
- LoginDto field renamed IpAdress -> IpAddress (JSON property name changes).
- Login hash compare is case-insensitive; added error handling returning InternalServerError on exception.
- Added DTOs for OTP/change password/token responses (ChangePasswordDto, CheckOtpDto, OtpDto, SendOtpDto, TokenResponse).

### FE-relevant hosting/config
- Kestrel listens on https://localhost:7239 and http://localhost:7238 (WS).
- CORS policy "AllowFE" allows `http://localhost:5173` and `https://it4409-20251-frontend.onrender.com` with credentials.
- JSON ReferenceHandler is IgnoreCycles (no $id/$ref).
- HTTPS redirection disabled (keeps ws:// for local dev).

### Observable behavior changes
- Start-exam uses UTC and can return not_started/expired; auto-expire when now >= min(endTime, start+duration).
- Exam generation can reuse existing QuestionExam and reshuffle question order; adds fallback questions if shortage.
- Grading accepts numeric/text/JSON-array answers and returns maxScore.

### Request/response examples (for FE alignment)
#### POST /api/Exam/start-exam
Request:
```json
{ "examId": 101, "studentId": 2001 }
```
Responses:
```json
{ "status": "not_started", "startTime": "2025-01-10T08:00:00Z" }
```
```json
{ "status": "expired" }
```
```json
{
  "status": "in_progress",
  "wsUrl": "ws://localhost:7238/ws?examId=101&studentId=2001",
  "data": {
    "examId": 101,
    "name": "Midterm",
    "durationMinutes": 30,
    "questions": [
      {
        "id": 501,
        "order": 1,
        "content": "2+2?",
        "cleanAnswer": ["4", "5"],
        "correctOptionIds": [1]
      }
    ]
  }
}
```
```json
{
  "status": "completed",
  "data": { "examId": 101, "studentId": 2001, "points": 7.5, "status": "COMPLETED" }
}
```

#### POST /api/ExamBlueprint/create
Request:
```json
{
  "subjectId": 1,
  "chapters": [
    { "chapter": 1, "easyCount": 2, "mediumCount": 1, "hardCount": 0, "veryHardCount": 0 }
  ]
}
```
Response:
```json
{
  "id": 10,
  "subjectId": 1,
  "createdAt": "2025-01-10T08:00:00Z",
  "totalQuestions": 3,
  "chapters": [
    { "chapter": 1, "easyCount": 2, "mediumCount": 1, "hardCount": 0, "veryHardCount": 0 }
  ]
}
```

#### GET /api/Result/student/{studentId}
Response:
```json
[
  {
    "examId": 101,
    "examName": "Midterm",
    "score": 7.5,
    "status": "COMPLETED",
    "submittedAt": "2025-01-10T08:30:00Z"
  }
]
```

#### GET /api/Result/detail?studentId=2001&examId=101
Response:
```json
{
  "examId": 101,
  "examName": "Midterm",
  "status": "COMPLETED",
  "totalScore": 7.5,
  "maxScore": 10,
  "percentage": 75,
  "questions": [
    {
      "questionId": 501,
      "questionContent": "2+2?",
      "studentAnswer": "4",
      "correctAnswer": "4",
      "point": 1,
      "earned": 1
    }
  ]
}
```

#### POST /api/Subject/create
Request:
```json
{ "name": "Math", "subjectCode": "MATH101", "totalChapters": 10 }
```
Response:
```json
{ "message": "Created successfully", "id": 3 }
```

#### PUT /api/Subject/update/{id}
Request:
```json
{ "name": "Math", "subjectCode": "MATH101", "totalChapters": 12 }
```
Response:
```json
"Updated successfully"
```

#### POST /api/Subject/import-subject (multipart/form-data)
File content example (JSON array of CreateSubjectDto):
```json
[
  { "name": "Math", "subjectCode": "MATH101", "totalChapters": 10 }
]
```

#### POST /api/Auth/login (field rename: ipAddress)
Request:
```json
{
  "email": "student@example.com",
  "password": "secret",
  "ipAddress": "127.0.0.1",
  "userAgent": "Chrome",
  "deviceId": "device-1"
}
```
Response (ResultApiModel):
```json
{ "status": true, "messageCode": 200, "data": "session-string" }
```

#### WebSocket /ws
Client SubmitAnswer message:
```json
{ "action": "SubmitAnswer", "order": 1, "questionId": 501, "answer": "[\"A\",\"C\"]" }
```
Server SubmitExam response:
```json
{ "status": "submitted", "score": 7.5, "maxScore": 10 }
```

## BE-internal changes
### Summary
- New Domain/Infrastructure layers, entities/enums, and migration; auth storage changed (RefreshToken -> Session).
- Exam generation/grading internals rewritten (resume reuse, normalization, fallback question selection).
- SMTP support added (SmtpSettings + EmailService).

### Behavior changes (exam generation + grading)
- ExamService now:
  - Reuses existing QuestionExam for resume and regenerates if count mismatches blueprint.
  - Normalizes correct answers via AnswerParser and returns CleanAnswer + CorrectOptionIds.
  - Ensures total question count; adds fallback questions if shortage.
  - Handles duplicate QuestionExam insert with fallback to existing rows.
- ExamGradingService now:
  - Returns GradeResult {score, maxScore}.
  - Normalizes answers and correct tokens; accepts numeric indices and text.
  - Persists StudentQuestion answers and results, updates existing rows.

### Data model / persistence
- New Domain project with entities: Exam, ExamBlueprint, ExamBlueprintChapter, QuestionExam, StudentQuestion, Subject, CachedAnswer.
- New enums: ExamStatus, QuestionDifficulty, QuestionType, UserRole, ResponseCode, WebsocketAction.
- New Infrastructure project with DbContext + Repository.
- Migration `20251127105148_InitialCreate` drops RefreshToken table and creates Session table.

### Config / infrastructure (BE-internal)
- DbContext SQL CommandTimeout set to 120 seconds.
- appsettings.Development.json added with connection string, Jwt key, WebSocket config.
- SmtpSettings + EmailService added (SMTP support).
