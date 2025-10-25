-- Online Examination System Schema
-- This SQL script creates all tables, constraints and enumerations required
-- for the Online Examination System.  It targets Microsoft SQL Server.

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/*
 * Lookup tables (enumerations)
 */

-- Role definitions.  A lookup table makes it easy to add new roles later.
CREATE TABLE dbo.Role (
    RoleId     INT           NOT NULL PRIMARY KEY,
    Name       NVARCHAR(50)  NOT NULL UNIQUE,
    Description NVARCHAR(200) NULL
);

-- Question types: single choice, multiple choice, essay.
CREATE TABLE dbo.QuestionType (
    QuestionTypeId INT           NOT NULL PRIMARY KEY,
    Name           NVARCHAR(50)  NOT NULL UNIQUE
);

-- Exam status per student: in progress, completed, expired.
CREATE TABLE dbo.ExamStatus (
    ExamStatusId INT           NOT NULL PRIMARY KEY,
    Name         NVARCHAR(50)  NOT NULL UNIQUE
);

/*
 * Core domain tables
 */

-- Users (accounts) for all actors: admins, teachers and students.
-- Passwords must be hashed using a modern algorithm (e.g., Argon2id or bcrypt)
-- before insertion into this table.  Store timestamps in UTC; do not store
-- plaintext passwords.
CREATE TABLE dbo.[User] (
    UserId       INT             IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Email        NVARCHAR(256)   NOT NULL UNIQUE,
    PasswordHash NVARCHAR(255)   NOT NULL,
    FullName     NVARCHAR(100)   NOT NULL,
    StudentCode  NVARCHAR(50)    NULL,
    RoleId       INT             NOT NULL,
    IsLocked     BIT             NOT NULL DEFAULT (0),
    CreatedAt    DATETIME2(3)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    UpdatedAt    DATETIME2(3)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_User_Role FOREIGN KEY (RoleId) REFERENCES dbo.Role(RoleId)
);

-- Subjects offered by the institution.
CREATE TABLE dbo.Subject (
    SubjectId   INT             IDENTITY(1,1) NOT NULL PRIMARY KEY,
    SubjectCode NVARCHAR(50)    NOT NULL,
    Name        NVARCHAR(100)   NOT NULL,
    Description NVARCHAR(500)   NULL,
    CreatedAt   DATETIME2(3)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    UpdatedAt   DATETIME2(3)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT UQ_Subject_SubjectCode UNIQUE (SubjectCode)
);

-- Classes (groups of students).  Each class belongs to a subject and has a
-- teacher assigned.  The relationship to students is modeled via a bridge
-- table StudentClass.
CREATE TABLE dbo.Class (
    ClassId     INT           IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Name        NVARCHAR(100) NOT NULL,
    SubjectId   INT           NOT NULL,
    TeacherId   INT           NOT NULL,
    CreatedAt   DATETIME2(3)  NOT NULL DEFAULT (SYSUTCDATETIME()),
    UpdatedAt   DATETIME2(3)  NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_Class_Subject FOREIGN KEY (SubjectId) REFERENCES dbo.Subject(SubjectId),
    CONSTRAINT FK_Class_Teacher FOREIGN KEY (TeacherId) REFERENCES dbo.[User](UserId)
);

-- Bridge table linking students to classes (many-to-many).  A unique
-- constraint prevents duplicate enrollments.  Students are users with the
-- 'STUDENT' role, but the role is not enforced here to allow teachers/admins
-- to be enrolled if needed (e.g., for testing or auditing).
CREATE TABLE dbo.StudentClass (
    ClassId    INT          NOT NULL,
    StudentId  INT          NOT NULL,
    EnrolledAt DATETIME2(3) NOT NULL DEFAULT (SYSUTCDATETIME()),
    PRIMARY KEY (ClassId, StudentId),
    CONSTRAINT FK_StudentClass_Class FOREIGN KEY (ClassId) REFERENCES dbo.Class(ClassId),
    CONSTRAINT FK_StudentClass_User FOREIGN KEY (StudentId) REFERENCES dbo.[User](UserId)
);

-- Questions in the question bank.  AuthorId refers to the teacher who
-- created the question.  QuestionTypeId references the QuestionType lookup
-- table.  Once an exam is published, the text/options are snapshotted in
-- QuestionExam and OptionExam; edits to the original question do not
-- retroactively affect running exams.
CREATE TABLE dbo.Question (
    QuestionId    INT             IDENTITY(1,1) NOT NULL PRIMARY KEY,
    AuthorId      INT             NOT NULL,
    QuestionTypeId INT            NOT NULL,
    Content       NVARCHAR(MAX)   NOT NULL,
    CreatedAt     DATETIME2(3)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    UpdatedAt     DATETIME2(3)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    IsDeleted     BIT             NOT NULL DEFAULT (0),
    CONSTRAINT FK_Question_User FOREIGN KEY (AuthorId) REFERENCES dbo.[User](UserId),
    CONSTRAINT FK_Question_QuestionType FOREIGN KEY (QuestionTypeId) REFERENCES dbo.QuestionType(QuestionTypeId)
);

-- Options for objective questions.  For essay questions, this table will
-- contain no rows.  The IsCorrect flag is part of the original question
-- definition; the correct answer will be copied to the snapshot tables when
-- the exam is created/published.
CREATE TABLE dbo.[Option] (
    OptionId   INT             IDENTITY(1,1) NOT NULL PRIMARY KEY,
    QuestionId INT             NOT NULL,
    Content    NVARCHAR(1000)  NOT NULL,
    IsCorrect  BIT             NOT NULL DEFAULT (0),
    OrderIndex INT             NOT NULL DEFAULT (0),
    CONSTRAINT FK_Option_Question FOREIGN KEY (QuestionId) REFERENCES dbo.Question(QuestionId)
);

-- Exams.  An exam belongs to a subject and is created by a teacher.  The
-- StartTime and EndTime are stored in UTC; the application layer should
-- convert to local time as needed.  PublishedAt is the timestamp when
-- questions are frozen and assignments can begin.
CREATE TABLE dbo.Exam (
    ExamId      INT             IDENTITY(1,1) NOT NULL PRIMARY KEY,
    Title       NVARCHAR(200)   NOT NULL,
    Description NVARCHAR(MAX)   NULL,
    SubjectId   INT             NOT NULL,
    TeacherId   INT             NOT NULL,
    StartTime   DATETIME2(3)    NOT NULL,
    EndTime     DATETIME2(3)    NOT NULL,
    PublishedAt DATETIME2(3)    NULL,
    CreatedAt   DATETIME2(3)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    UpdatedAt   DATETIME2(3)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT CK_Exam_Time CHECK (StartTime < EndTime),
    CONSTRAINT FK_Exam_Subject FOREIGN KEY (SubjectId) REFERENCES dbo.Subject(SubjectId),
    CONSTRAINT FK_Exam_Teacher FOREIGN KEY (TeacherId) REFERENCES dbo.[User](UserId)
);

-- Snapshotted questions bound to an exam.  When an exam is published,
-- the contents of the original question and its correct answer(s) are
-- copied here to preserve history.  QuestionTypeId is stored to determine
-- grading policy.  CorrectAnswer stores a canonical list of correct
-- option IDs as comma-separated values for multiple choice questions; for
-- single choice, it contains a single integer; for essay, it can be NULL.
CREATE TABLE dbo.QuestionExam (
    QuestionExamId   INT             IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ExamId           INT             NOT NULL,
    OriginalQuestionId INT          NOT NULL,
    QuestionTypeId   INT             NOT NULL,
    QuestionText     NVARCHAR(MAX)   NOT NULL,
    CorrectAnswer    NVARCHAR(1000)  NULL,
    CreatedAt        DATETIME2(3)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT UQ_QuestionExam UNIQUE (ExamId, OriginalQuestionId),
    CONSTRAINT FK_QuestionExam_Exam FOREIGN KEY (ExamId) REFERENCES dbo.Exam(ExamId),
    CONSTRAINT FK_QuestionExam_Question FOREIGN KEY (OriginalQuestionId) REFERENCES dbo.Question(QuestionId),
    CONSTRAINT FK_QuestionExam_QuestionType FOREIGN KEY (QuestionTypeId) REFERENCES dbo.QuestionType(QuestionTypeId)
);

-- Snapshotted options bound to QuestionExam.  This table preserves the
-- option order and correct flags at the time of exam publication.
CREATE TABLE dbo.OptionExam (
    OptionExamId    INT             IDENTITY(1,1) NOT NULL PRIMARY KEY,
    QuestionExamId  INT             NOT NULL,
    OptionText      NVARCHAR(1000)  NOT NULL,
    IsCorrect       BIT             NOT NULL DEFAULT (0),
    OrderIndex      INT             NOT NULL DEFAULT (0),
    CONSTRAINT FK_OptionExam_QuestionExam FOREIGN KEY (QuestionExamId) REFERENCES dbo.QuestionExam(QuestionExamId)
);

-- Assignment of exams to students.  Each student can have at most one
-- assignment per exam.  The Status column tracks the progression of
-- the student's exam (IN_PROGRESS, COMPLETED, EXPIRED).  StartTime and
-- EndTime may be adjusted per student (e.g., for accommodations).
CREATE TABLE dbo.ExamStudent (
    ExamStudentId INT             IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ExamId        INT             NOT NULL,
    StudentId     INT             NOT NULL,
    ExamStatusId  INT             NOT NULL,
    StartTime     DATETIME2(3)    NOT NULL,
    EndTime       DATETIME2(3)    NOT NULL,
    SubmittedAt   DATETIME2(3)    NULL,
    CreatedAt     DATETIME2(3)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT UQ_ExamStudent UNIQUE (ExamId, StudentId),
    CONSTRAINT FK_ExamStudent_Exam FOREIGN KEY (ExamId) REFERENCES dbo.Exam(ExamId),
    CONSTRAINT FK_ExamStudent_Student FOREIGN KEY (StudentId) REFERENCES dbo.[User](UserId),
    CONSTRAINT FK_ExamStudent_Status FOREIGN KEY (ExamStatusId) REFERENCES dbo.ExamStatus(ExamStatusId)
);

-- Per‑student mapping of exam questions.  This table stores the randomized
-- order of questions for each student.  The OrderIndex is assigned at
-- exam start.  SelectedAnswer stores the student's answer in canonical form
-- (comma-separated option IDs for multiple choice; text for essay).  Grade
-- holds the score for this question; it is computed automatically for
-- objective questions and manually for essays.
CREATE TABLE dbo.StudentQuestion (
    StudentQuestionId  INT            IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ExamStudentId      INT            NOT NULL,
    QuestionExamId     INT            NOT NULL,
    OrderIndex         INT            NOT NULL,
    SelectedAnswer     NVARCHAR(MAX)  NULL,
    Grade              DECIMAL(5,2)   NULL,
    IsAutoGraded       BIT            NULL,
    AnsweredAt         DATETIME2(3)   NULL,
    CONSTRAINT UQ_StudentQuestion UNIQUE (ExamStudentId, QuestionExamId),
    CONSTRAINT FK_StudentQuestion_ExamStudent FOREIGN KEY (ExamStudentId) REFERENCES dbo.ExamStudent(ExamStudentId),
    CONSTRAINT FK_StudentQuestion_QuestionExam FOREIGN KEY (QuestionExamId) REFERENCES dbo.QuestionExam(QuestionExamId)
);

-- Scores summarizing a student's performance on an exam.  ObjectiveScore
-- aggregates the marks from auto-graded questions; SubjectiveScore is
-- entered by a teacher after grading essays.  TotalScore can be computed
-- as ObjectiveScore + SubjectiveScore, but is stored for quick access.
CREATE TABLE dbo.Score (
    ScoreId        INT           IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ExamStudentId  INT           NOT NULL,
    ObjectiveScore DECIMAL(5,2)  NOT NULL DEFAULT (0),
    SubjectiveScore DECIMAL(5,2) NOT NULL DEFAULT (0),
    TotalScore     DECIMAL(5,2)  NOT NULL DEFAULT (0),
    GradedAt       DATETIME2(3)  NULL,
    CONSTRAINT UQ_Score UNIQUE (ExamStudentId),
    CONSTRAINT FK_Score_ExamStudent FOREIGN KEY (ExamStudentId) REFERENCES dbo.ExamStudent(ExamStudentId)
);

-- Announcements sent during an exam.  Announcements can be broadcast to
-- an entire exam or to specific classes.  For simplicity, this version
-- stores only exam-level announcements.
CREATE TABLE dbo.Announcement (
    AnnouncementId INT           IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ExamId         INT           NOT NULL,
    SenderId       INT           NOT NULL,
    Message        NVARCHAR(2000) NOT NULL,
    CreatedAt      DATETIME2(3)  NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_Announcement_Exam FOREIGN KEY (ExamId) REFERENCES dbo.Exam(ExamId),
    CONSTRAINT FK_Announcement_Sender FOREIGN KEY (SenderId) REFERENCES dbo.[User](UserId)
);

-- Central audit log capturing sensitive operations.  Payload stores a JSON
-- object describing the operation (e.g., changed fields).  IPAddress and
-- UserAgent help trace the origin.  Timestamps are in UTC.
CREATE TABLE dbo.AuditEvent (
    AuditEventId  BIGINT          IDENTITY(1,1) NOT NULL PRIMARY KEY,
    ActorId       INT             NOT NULL,
    EntityType    NVARCHAR(64)    NOT NULL,
    EntityId      NVARCHAR(64)    NOT NULL,
    Action        NVARCHAR(64)    NOT NULL,
    Payload       NVARCHAR(MAX)   NULL,
    IpAddress     NVARCHAR(45)    NULL,
    UserAgent     NVARCHAR(200)   NULL,
    CreatedAt     DATETIME2(3)    NOT NULL DEFAULT (SYSUTCDATETIME()),
    CONSTRAINT FK_AuditEvent_Actor FOREIGN KEY (ActorId) REFERENCES dbo.[User](UserId)
);

/*
 * Indexes to optimize common query paths.  Additional indexes may be
 * added based on observed workloads (e.g., filtered indexes on active
 * exams).  Index names follow the convention IX_<Table>_<Columns>.
 */

CREATE INDEX IX_User_RoleId ON dbo.[User] (RoleId);
CREATE INDEX IX_Class_SubjectId ON dbo.Class (SubjectId);
CREATE INDEX IX_Class_TeacherId ON dbo.Class (TeacherId);
CREATE INDEX IX_StudentClass_StudentId ON dbo.StudentClass (StudentId);
CREATE INDEX IX_Question_AuthorId ON dbo.Question (AuthorId);
CREATE INDEX IX_Question_QuestionTypeId ON dbo.Question (QuestionTypeId);
CREATE INDEX IX_Option_QuestionId ON dbo.[Option] (QuestionId);
CREATE INDEX IX_Exam_SubjectId ON dbo.Exam (SubjectId);
CREATE INDEX IX_Exam_TeacherId ON dbo.Exam (TeacherId);
CREATE INDEX IX_QuestionExam_ExamId ON dbo.QuestionExam (ExamId);
CREATE INDEX IX_OptionExam_QuestionExamId ON dbo.OptionExam (QuestionExamId);
CREATE INDEX IX_ExamStudent_ExamId ON dbo.ExamStudent (ExamId);
CREATE INDEX IX_ExamStudent_StudentId ON dbo.ExamStudent (StudentId);
CREATE INDEX IX_StudentQuestion_ExamStudentId ON dbo.StudentQuestion (ExamStudentId);
CREATE INDEX IX_StudentQuestion_QuestionExamId ON dbo.StudentQuestion (QuestionExamId);
CREATE INDEX IX_Score_ExamStudentId ON dbo.Score (ExamStudentId);

GO