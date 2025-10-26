using System;
using System.Collections.Generic;

namespace Api.Models.Entities
{
    /// <summary>
    /// Represents an academic subject or course (e.g., "Mathematics", "English").
    /// Subjects group related questions and classes.  Each subject
    /// should have a unique code (e.g., "MATH101") and a human
    /// friendly name.  A subject may have multiple classes across
    /// different terms.
    /// </summary>
    public class Subject
    {
        /// <summary>
        /// Primary key.
        /// </summary>
        public int Id { get; set; }

        /// <summary>
        /// Unique subject code used for identification and import/export.
        /// </summary>
        public string SubjectCode { get; set; } = string.Empty;

        /// <summary>
        /// Descriptive name of the subject.
        /// </summary>
        public string Name { get; set; } = string.Empty;

        /// <summary>
        /// Optional detailed description.
        /// </summary>
        public string? Description { get; set; }

        /// <summary>
        /// Collection of classes associated with this subject.
        /// </summary>
        public virtual ICollection<Class> Classes { get; set; } = new List<Class>();

        /// <summary>
        /// Collection of questions associated with this subject.
        /// Questions may optionally be organized into a bank per subject.
        /// </summary>
        public virtual ICollection<Question> Questions { get; set; } = new List<Question>();
    }
}