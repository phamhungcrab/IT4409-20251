-- Online Examination System Seed Data
-- Populates enumeration tables and inserts sample data for development/testing.

SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/*
 * Enumerations
 */

-- Insert roles
INSERT INTO dbo.Role (RoleId, Name, Description)
VALUES
    (1, 'ADMIN',   'Administrator user'),
    (2, 'TEACHER', 'Teacher user'),
    (3, 'STUDENT', 'Student user');

-- Insert question types
INSERT INTO dbo.QuestionType (QuestionTypeId, Name)
VALUES
    (1, 'SINGLE_CHOICE'),
    (2, 'MULTI_CHOICE'),
    (3, 'ESSAY');

-- Insert exam statuses
INSERT INTO dbo.ExamStatus (ExamStatusId, Name)
VALUES
    (1, 'IN_PROGRESS'),
    (2, 'COMPLETED'),
    (3, 'EXPIRED');

/*
 * Users
 */

-- NOTE: Replace PasswordHash values with real hashes generated using
-- Argon2id or bcrypt.  These placeholders are for demonstration only.
INSERT INTO dbo.[User] (Email, PasswordHash, FullName, StudentCode, RoleId)
VALUES
    ('admin@example.com',   'dummy-hash-admin',   'Alice Admin',   NULL, 1),
    ('teacher@example.com', 'dummy-hash-teacher', 'Bob Teacher',   NULL, 2),
    ('student@example.com', 'dummy-hash-student', 'Charlie Student','S2025001', 3);

/*
 * Subjects and classes
 */

-- Insert a subject
INSERT INTO dbo.Subject (SubjectCode, Name, Description)
VALUES ('MATH101', 'Mathematics', 'Basic mathematics subject');

-- Insert a class assigned to the teacher (UserId 2)
INSERT INTO dbo.Class (Name, SubjectId, TeacherId)
VALUES ('Math-101', 1, 2);

-- Enroll the student (UserId 3) into the class
INSERT INTO dbo.StudentClass (ClassId, StudentId)
VALUES (1, 3);

/*
 * Questions and options
 */

-- Single choice question with three options (Option 1 is correct)
INSERT INTO dbo.Question (AuthorId, QuestionTypeId, Content)
VALUES (2, 1, 'What is 2 + 2?');

-- Retrieve the generated question ID
DECLARE @Q1Id INT = SCOPE_IDENTITY();

INSERT INTO dbo.[Option] (QuestionId, Content, IsCorrect, OrderIndex)
VALUES
    (@Q1Id, '4',       1, 1),
    (@Q1Id, '3',       0, 2),
    (@Q1Id, '5',       0, 3);

-- Multi choice question with four options (two correct)
INSERT INTO dbo.Question (AuthorId, QuestionTypeId, Content)
VALUES (2, 2, 'Select prime numbers less than 6');

DECLARE @Q2Id INT = SCOPE_IDENTITY();

INSERT INTO dbo.[Option] (QuestionId, Content, IsCorrect, OrderIndex)
VALUES
    (@Q2Id, '2', 1, 1),
    (@Q2Id, '3', 1, 2),
    (@Q2Id, '4', 0, 3),
    (@Q2Id, '5', 1, 4);

/*
 * Exam and question snapshots
 */

-- Create an exam for the subject, scheduled one week from now, lasting 120 minutes.
DECLARE @StartTime DATETIME2(3) = DATEADD(DAY, 7, SYSUTCDATETIME());
DECLARE @EndTime   DATETIME2(3) = DATEADD(MINUTE, 120, @StartTime);

INSERT INTO dbo.Exam (Title, Description, SubjectId, TeacherId, StartTime, EndTime, PublishedAt)
VALUES ('Math Midterm', 'Midterm exam covering basic arithmetic and primes', 1, 2, @StartTime, @EndTime, SYSUTCDATETIME());

DECLARE @ExamId INT = SCOPE_IDENTITY();

-- Publish questions to the exam (snapshot).  Note: CorrectAnswer for multi
-- choice questions stores comma-separated option IDs.  For Q2, the correct
-- option IDs are 1 and 2 relative to the original question's option IDs.

-- Snapshot for first question (single choice)
INSERT INTO dbo.QuestionExam (ExamId, OriginalQuestionId, QuestionTypeId, QuestionText, CorrectAnswer)
VALUES (@ExamId, @Q1Id, 1, 'What is 2 + 2?', '1');

DECLARE @QE1Id INT = SCOPE_IDENTITY();

-- Snapshot options for first question
INSERT INTO dbo.OptionExam (QuestionExamId, OptionText, IsCorrect, OrderIndex)
VALUES
    (@QE1Id, '4', 1, 1),
    (@QE1Id, '3', 0, 2),
    (@QE1Id, '5', 0, 3);

-- Snapshot for second question (multi choice)
INSERT INTO dbo.QuestionExam (ExamId, OriginalQuestionId, QuestionTypeId, QuestionText, CorrectAnswer)
VALUES (@ExamId, @Q2Id, 2, 'Select prime numbers less than 6', '1,2,4');
-- Note: CorrectAnswer '1,2,4' corresponds to the OptionExam rows inserted next.

DECLARE @QE2Id INT = SCOPE_IDENTITY();

INSERT INTO dbo.OptionExam (QuestionExamId, OptionText, IsCorrect, OrderIndex)
VALUES
    (@QE2Id, '2', 1, 1),
    (@QE2Id, '3', 1, 2),
    (@QE2Id, '4', 0, 3),
    (@QE2Id, '5', 1, 4);

/*
 * Assign exam to the student
 */

INSERT INTO dbo.ExamStudent (ExamId, StudentId, ExamStatusId, StartTime, EndTime)
VALUES (@ExamId, 3, 1, @StartTime, @EndTime);

DECLARE @ExamStudentId INT = SCOPE_IDENTITY();

-- Assign questions to the student with randomized order.  For this seed, we
-- assign in fixed order; in production, shuffle OrderIndex per student.

INSERT INTO dbo.StudentQuestion (ExamStudentId, QuestionExamId, OrderIndex)
VALUES
    (@ExamStudentId, @QE1Id, 1),
    (@ExamStudentId, @QE2Id, 2);

/*
 * Initial score placeholder.  The ObjectiveScore and TotalScore will be
 * computed after grading; here we leave them as zero.
 */

INSERT INTO dbo.Score (ExamStudentId)
VALUES (@ExamStudentId);

/*
 * Insert a welcome announcement for the exam
 */

INSERT INTO dbo.Announcement (ExamId, SenderId, Message)
VALUES (@ExamId, 2, 'Welcome to the math midterm! Good luck to all.');

GO