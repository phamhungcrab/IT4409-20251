using System.Collections.Generic;
using System.Threading.Tasks;
using Api.Models.DTOs.Exam;

namespace Api.Services.Interfaces
{
    /// <summary>
    /// Defines operations for managing exams.  An exam consists of a set
    /// of questions, scheduling information and assignment metadata.  The
    /// service should enforce snapshot and timing policies when
    /// publishing exams and ensure that questions cannot be modified
    /// once an exam is published【329956817899352†L59-L84】.  Assignment
    /// operations should create <see cref="ExamStudent"/> records as
    /// appropriate.
    /// </summary>
    public interface IExamService
    {
        /// <summary>
        /// Create a new draft exam.  The authorId identifies the
        /// teacher or admin creating the exam.  The returned
        /// <see cref="ExamResponse"/> includes the generated examId.
        /// </summary>
        Task<ExamResponse> CreateExamAsync(CreateExamRequest request, int authorId);

        /// <summary>
        /// Update an existing exam draft.  Once an exam has been
        /// published no further edits should be allowed; implementations
        /// should enforce this rule by throwing if the exam is already
        /// published.  Only the original author or an admin may
        /// update the exam.
        /// </summary>
        Task<ExamResponse> UpdateExamAsync(int examId, CreateExamRequest request);

        /// <summary>
        /// Delete an exam.  Exams that have been published or have
        /// associated results should not be hard deleted; instead a
        /// soft delete flag should be set.  Implementations may
        /// restrict deletion based on policy.
        /// </summary>
        Task DeleteExamAsync(int examId);

        /// <summary>
        /// Publish an exam.  This operation snapshots the current
        /// questions into <see cref="QuestionExam"/> records, freezes
        /// correct answers and schedules the exam start and end
        /// times.  After publishing, the exam becomes visible to
        /// assigned students/classes.  The optional
        /// <see cref="PublishExamRequest"/> parameter may contain
        /// additional settings such as delayed publish or
        /// notifications.
        /// </summary>
        Task PublishExamAsync(int examId, PublishExamRequest? request = null);

        /// <summary>
        /// Assign an exam to one or more classes.  Creates
        /// <see cref="ExamStudent"/> entries for all students enrolled
        /// in the given class.  If a student is already assigned the
        /// exam directly, the duplicate should be ignored.
        /// </summary>
        Task AssignExamToClassesAsync(int examId, IEnumerable<int> classIds);

        /// <summary>
        /// Assign an exam directly to a list of students.  This is
        /// useful for make up exams or special cases.  Students who
        /// already have the exam via a class assignment should not
        /// receive duplicate assignments.
        /// </summary>
        Task AssignExamToStudentsAsync(int examId, IEnumerable<int> studentIds);

        /// <summary>
        /// Retrieve an exam by its identifier.  For unpublished exams
        /// only the author and admins may view details; once
        /// published teachers and assigned students may retrieve the
        /// exam metadata.  Exam content should not expose correct
        /// answers to students.
        /// </summary>
        Task<ExamResponse> GetExamByIdAsync(int examId);

        /// <summary>
        /// Retrieve a list of exams.  Optional filters allow
        /// returning only exams authored by a teacher or only
        /// published exams.  Implementations should handle
        /// pagination if necessary.
        /// </summary>
        Task<IReadOnlyList<ExamResponse>> GetExamsAsync(int? authorId = null, bool? onlyPublished = null);
    }
}