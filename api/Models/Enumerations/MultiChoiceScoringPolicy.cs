namespace Api.Models.Enumerations
{
    /// <summary>
    /// Defines how scores are calculated for multi choice questions.
    /// The policy determines whether partial credit is awarded for
    /// partially correct answers.  The service layer should implement
    /// the logic corresponding to each policy.
    /// </summary>
    public enum MultiChoiceScoringPolicy
    {
        /// <summary>
        /// All or nothing: the student must select exactly the set of
        /// correct options (no extra, no missing) to receive full
        /// credit.  Otherwise zero points are awarded.
        /// </summary>
        AllOrNothing = 1,
        /// <summary>
        /// Partial credit: the student receives a portion of the
        /// points based on the number of correct options selected
        /// minus any incorrect selections.  Implementers must
        /// define the exact formula.
        /// </summary>
        PartialCredit = 2,
        /// <summary>
        /// Proportional: points are awarded proportionally to the
        /// fraction of correct options selected.  Incorrect options
        /// may reduce the score.  This policy is similar to
        /// PartialCredit but allows finer granularity.
        /// </summary>
        Proportional = 3
    }
}