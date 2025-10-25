using System;
using System.Collections.Generic;
using System.Linq;
using Api.Models.Enumerations;

namespace Api.Helpers
{
    /// <summary>
    /// Provides helper methods for calculating scores on multi
    /// choice questions according to a selected scoring policy.
    /// Policies are defined by <see cref="MultiChoiceScoringPolicy"/>.
    /// </summary>
    public static class PartialScoringHelper
    {
        /// <summary>
        /// Calculates the score for a multi choice question based on
        /// the correct option IDs, the student’s selected option IDs,
        /// the scoring policy and the maximum points available for
        /// the question.  The returned value is bounded between 0 and
        /// maxScore.
        /// </summary>
        /// <param name="correctOptionIds">The set of option IDs that are correct.</param>
        /// <param name="selectedOptionIds">The set of option IDs selected by the student.</param>
        /// <param name="policy">The scoring policy to apply.</param>
        /// <param name="maxScore">The maximum score achievable for the question.</param>
        /// <returns>A decimal score between 0 and maxScore.</returns>
        public static decimal CalculateScore(IEnumerable<int> correctOptionIds, IEnumerable<int> selectedOptionIds, MultiChoiceScoringPolicy policy, decimal maxScore = 1m)
        {
            var correct = new HashSet<int>(correctOptionIds ?? Enumerable.Empty<int>());
            var selected = new HashSet<int>(selectedOptionIds ?? Enumerable.Empty<int>());
            // If no correct options defined, return full score for any selection
            if (correct.Count == 0)
            {
                return selected.Count == 0 ? maxScore : 0m;
            }
            // Determine intersection and differences
            int correctSelectedCount = selected.Count(id => correct.Contains(id));
            int incorrectSelectedCount = selected.Count - correctSelectedCount;
            int missedCount = correct.Count - correctSelectedCount;
            switch (policy)
            {
                case MultiChoiceScoringPolicy.AllOrNothing:
                    // Only award full points if all correct options are selected and no extras
                    return (incorrectSelectedCount == 0 && missedCount == 0) ? maxScore : 0m;
                case MultiChoiceScoringPolicy.PartialCredit:
                    {
                        // Award points for each correct selection; subtract penalty for wrong picks
                        decimal perCorrect = maxScore / correct.Count;
                        decimal score = perCorrect * correctSelectedCount;
                        // Penalize incorrect selections by removing equivalent fraction
                        if (incorrectSelectedCount > 0)
                        {
                            decimal perIncorrect = maxScore / (correct.Count + incorrectSelectedCount);
                            score -= perIncorrect * incorrectSelectedCount;
                        }
                        return Math.Max(0m, Math.Min(maxScore, score));
                    }
                case MultiChoiceScoringPolicy.Proportional:
                    {
                        // Pure proportion of correct selections; ignore wrong picks but cap at max
                        decimal fraction = (decimal)correctSelectedCount / correct.Count;
                        return Math.Max(0m, Math.Min(maxScore, fraction * maxScore));
                    }
                default:
                    throw new ArgumentOutOfRangeException(nameof(policy), policy, null);
            }
        }
    }
}