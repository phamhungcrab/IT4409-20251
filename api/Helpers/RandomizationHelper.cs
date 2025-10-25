using System;
using System.Collections.Generic;

namespace Api.Helpers
{
    /// <summary>
    /// Provides utility methods for randomizing the order of
    /// collections.  These helpers are used when shuffling
    /// questions and options per student.  The Fisher–Yates
    /// algorithm ensures unbiased permutations.
    /// </summary>
    public static class RandomizationHelper
    {
        private static readonly Random _rng = new();

        /// <summary>
        /// Shuffles a list in place using the Fisher–Yates
        /// algorithm.  If the list is null or has fewer than two
        /// items, it is returned unchanged.
        /// </summary>
        public static void Shuffle<T>(IList<T> list)
        {
            if (list == null || list.Count < 2) return;
            for (int i = list.Count - 1; i > 0; i--)
            {
                int j = _rng.Next(i + 1);
                (list[i], list[j]) = (list[j], list[i]);
            }
        }

        /// <summary>
        /// Returns an array of integers representing a random
        /// permutation of the numbers 0 to count-1.  Useful when
        /// storing the original order of randomized questions or
        /// options without modifying the underlying list.
        /// </summary>
        public static int[] GetRandomOrder(int count)
        {
            var indices = new int[count];
            for (int i = 0; i < count; i++) indices[i] = i;
            Shuffle(indices);
            return indices;
        }
    }
}