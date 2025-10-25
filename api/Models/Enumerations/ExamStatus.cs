namespace Api.Models.Enumerations
{
    /// <summary>
    /// Enumerates the statuses for a student’s exam attempt.  These
    /// values are stored in the ExamStudent.Status field and used
    /// throughout the monitoring and grading workflows.
    /// </summary>
    public enum ExamStatus
    {
        /// <summary>
        /// The exam session has been created but not started.
        /// </summary>
        NotStarted = 0,
        /// <summary>
        /// The student is currently taking the exam.
        /// </summary>
        InProgress = 1,
        /// <summary>
        /// The student has submitted the exam.
        /// </summary>
        Completed = 2,
        /// <summary>
        /// The exam time has expired and the session was auto
        /// submitted.
        /// </summary>
        Expired = 3
    }
}