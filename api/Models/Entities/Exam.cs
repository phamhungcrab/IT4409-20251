using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;
using Api.Models.Enumerations;

namespace Api.Models.Entities
{
    /// <summary>
    /// Represents an exam which contains a set of questions and
    /// scheduling information.  Exams can be assigned to classes or
    /// individual students.  Once published, the question content is
    /// snapshotted and immutable.  A published exam can be started
    /// by students via an exam session.  The IsPublished flag and
    /// PublishedAt timestamp help enforce immutability.
    /// </summary>
    public class Exam
    {
        public int Id { get; set; }

        /// <summary>
        /// Title of the exam (e.g., "Midterm Exam").
        /// </summary>
        public string Title { get; set; } = string.Empty;

        /// <summary>
        /// Optional description or instructions.
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// UTC start time when the exam becomes available.
        /// </summary>
        public DateTime StartTime { get; set; }

        /// <summary>
        /// UTC end time when the exam closes.  Students must submit
        /// before this time; auto submit will be triggered.
        /// </summary>
        public DateTime EndTime { get; set; }

        /// <summary>
        /// Indicates whether the exam has been published (questions
        /// snapped).  Once true, the exam should not be modified.
        /// </summary>
        public bool IsPublished { get; set; }

        /// <summary>
        /// Timestamp when the exam was published.  Null if not
        /// yet published.
        /// </summary>
        public DateTime? PublishedAt { get; set; }

        /// <summary>
        /// Foreign key to the user who authored this exam.
        /// </summary>
        public int CreatedById { get; set; }

        /// <summary>
        /// Navigation to the exam author (teacher or admin).
        /// </summary>
        public virtual User CreatedBy { get; set; } = null!;

        /// <summary>
        /// Collection of question snapshots associated with this exam.
        /// </summary>
        public virtual ICollection<QuestionExam> QuestionExams { get; set; } = new List<QuestionExam>();

        /// <summary>
        /// Collection of assignments of this exam to students.
        /// </summary>
        public virtual ICollection<ExamStudent> ExamStudents { get; set; } = new List<ExamStudent>();

        /// <summary>
        /// Classes that this exam is assigned to.  This collection is
        /// optional; assignments may also be individual.
        /// </summary>
        public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

        /// <summary>
        /// Announcements posted for this exam (e.g., clarifications
        /// during the exam).  Students should see these in real time.
        /// </summary>
        public virtual ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();
        public DateTime StartTimeUtc { get; internal set; }
        public DateTime EndTimeUtc { get; internal set; }
        public DateTime? PublishedAtUtc { get; internal set; }
        [NotMapped]
        public int AuthorId { get; internal set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        public bool IsDeleted { get; set; } = false;
        public ExamStatus Status { get; set; }
        [NotMapped]
        public User? Author { get; set; }

    }
}