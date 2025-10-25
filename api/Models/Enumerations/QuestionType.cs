namespace Api.Models.Enumerations
{
    /// <summary>
    /// Enumerates the supported question types.  These values
    /// correspond to the design specification and are used to
    /// determine how to present and grade questions.
    /// </summary>
    public enum QuestionType
    {
        /// <summary>
        /// A question with exactly one correct option.
        /// </summary>
        SingleChoice = 1,
        /// <summary>
        /// A question with multiple correct options.  Scoring rules
        /// are defined by the multi choice scoring policy.
        /// </summary>
        MultiChoice = 2,
        /// <summary>
        /// A free form text question requiring manual grading.
        /// </summary>
        Essay = 3
    }
}