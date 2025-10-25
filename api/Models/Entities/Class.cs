using System;
using System.Collections.Generic;

namespace Api.Models.Entities
{
    /// <summary>
    /// Represents a specific cohort of students taking a subject.
    /// Examples include "Math 101 - Fall 2025".  A class is linked
    /// to a subject and optionally assigned to a teacher.  Students
    /// enroll in classes which in turn are used to assign exams.
    /// </summary>
    public class Class
    {
        /// <summary>
        /// Primary key.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Optional code or number identifying the class (e.g., "2025F-1").
        /// </summary>
        public string? ClassCode { get; set; }
;
        /// <summary>
        /// Name of the class.  Usually includes the subject and term.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Foreign key to the subject this class is teaching.
        /// </summary>
        public int SubjectId { get; set; }
;
        /// <summary>
        /// Optional foreign key to the teacher assigned to this class.
        /// Null if no teacher is assigned.
        /// </summary>
        public int? TeacherId { get; set; }
;
        /// <summary>
        /// Navigation property for the subject.
        /// </summary>
        public virtual Subject Subject { get; set; } = null!;

        /// <summary>
        /// Navigation property for the teacher.
        /// </summary>
        public virtual User? Teacher { get; set; }
;
        /// <summary>
        /// Collection of exams associated with this class.  Exams may
        /// be shared across multiple classes.
        /// </summary>
        public virtual ICollection<Exam> Exams { get; set; } = new List<Exam>();

        /// <summary>
        /// Collection of students enrolled in this class.  This is a
        /// many-to-many relationship; however, for simplicity we
        /// model it as a collection of users here.  In a normalized
        /// schema a separate join table (ClassStudent) would be used.
        /// </summary>
        public virtual ICollection<User> Students { get; set; } = new List<User>();

        /// <summary>
        /// Announcements posted to this class (not tied to a specific exam).
        /// </summary>
        public virtual ICollection<Announcement> Announcements { get; set; } = new List<Announcement>();
    }
}