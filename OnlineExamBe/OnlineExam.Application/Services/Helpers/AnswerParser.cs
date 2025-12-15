using System.Text.Json;
using System.Text.RegularExpressions;

namespace OnlineExam.Application.Services.Helpers
{
    public record AnswerParseResult(List<string> CleanOptions, List<int> CorrectOptionIds);

    /// <summary>
    /// Shared helper to parse answer strings that use '*' to mark correct options.
    /// Supports multi-select (multiple '*' in the option list).
    /// </summary>
    public static class AnswerParser
    {
        public static AnswerParseResult ParseOptions(string raw)
        {
            var cleanOptions = new List<string>();
            var correctIds = new List<int>();

            if (!string.IsNullOrWhiteSpace(raw))
            {
                var parts = raw.Split('|', StringSplitOptions.RemoveEmptyEntries);
                int idx = 1;
                foreach (var part in parts)
                {
                    var option = part.Trim();
                    var isCorrect = option.EndsWith("*");
                    if (isCorrect) option = option.TrimEnd('*').Trim();

                    cleanOptions.Add(option);
                    if (isCorrect) correctIds.Add(idx);
                    idx++;
                }
            }

            return new AnswerParseResult(cleanOptions, correctIds);
        }

        /// <summary>
        /// Normalize correct answer from question.Answer ("opt1*|opt2") to a stable text string.
        /// </summary>
        public static string NormalizeCorrectAnswer(string questionAnswerRaw)
        {
            var tokens = ParseCorrectTokens(questionAnswerRaw);
            return NormalizeTokens(tokens);
        }

        /// <summary>
        /// Normalize any answer string to tokens, supporting both "*" markers and plain text answers.
        /// </summary>
        public static string NormalizeAnswerFlexible(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return string.Empty;

            var tokens = raw.Contains('*')
                ? ParseCorrectTokens(raw)
                : ParseAnswerTokens(raw);

            return NormalizeTokens(tokens);
        }

        /// <summary>
        /// Normalize a student answer (could be numeric indices or text) to a stable text string.
        /// </summary>
        public static string NormalizeStudentAnswer(string rawAnswer, string questionAnswerRaw)
        {
            var tokens = MapAnswerToTokens(rawAnswer, questionAnswerRaw);
            return NormalizeTokens(tokens);
        }

        /// <summary>
        /// Normalize tokens (text) to "token1|token2" sorted, lowercased.
        /// </summary>
        public static string NormalizeTokens(IEnumerable<string> tokens)
        {
            return string.Join("|", tokens
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Select(NormalizeToken)
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(t => t, StringComparer.OrdinalIgnoreCase));
        }

        /// <summary>
        /// Parse an answer payload (student or correct) into a sorted token list.
        /// Accepts JSON array, "1|3", "a|b", etc. Trims '*' markers and lowercases text.
        /// </summary>
        public static List<string> ParseAnswerTokens(string raw)
        {
            if (string.IsNullOrWhiteSpace(raw)) return new List<string>();

            var trimmed = raw.Trim();
            var tokens = new List<string>();

            // Try JSON array
            if (trimmed.StartsWith("[") && trimmed.EndsWith("]"))
            {
                try
                {
                    using var doc = JsonDocument.Parse(trimmed);
                    foreach (var el in doc.RootElement.EnumerateArray())
                    {
                        tokens.Add(NormalizeToken(el.ToString()));
                    }
                }
                catch
                {
                    // fall back to split
                }
            }

            if (tokens.Count == 0)
            {
                var parts = trimmed.Split(new[] { '|', ',', ';' }, StringSplitOptions.RemoveEmptyEntries);
                foreach (var p in parts)
                {
                    tokens.Add(NormalizeToken(p));
                }
            }

            return tokens
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Distinct()
                .OrderBy(t => t, StringComparer.InvariantCultureIgnoreCase)
                .ToList();
        }

        private static string NormalizeToken(string token)
        {
            var trimmed = token
                .Trim()
                .TrimEnd('*')
                .Trim();

            // Collapse/strip all whitespace to avoid mismatches like "sin(x)+c" vs "sin(x) + c"
            trimmed = Regex.Replace(trimmed, @"\s+", string.Empty);

            return trimmed.ToLowerInvariant();
        }

        /// <summary>
        /// Extract correct option tokens (text) from question.Answer where correct marked by '*'.
        /// </summary>
        public static List<string> ParseCorrectTokens(string questionAnswerRaw)
        {
            var result = new List<string>();
            if (string.IsNullOrWhiteSpace(questionAnswerRaw)) return result;

            var parts = questionAnswerRaw.Split('|', StringSplitOptions.RemoveEmptyEntries);
            foreach (var part in parts)
            {
                var token = part.Trim();
                var isCorrect = token.EndsWith("*");
                if (isCorrect)
                {
                    token = token.TrimEnd('*').Trim();
                    result.Add(NormalizeToken(token));
                }
            }
            return result
                .Where(t => !string.IsNullOrWhiteSpace(t))
                .Distinct(StringComparer.OrdinalIgnoreCase)
                .OrderBy(t => t, StringComparer.OrdinalIgnoreCase)
                .ToList();
        }

        /// <summary>
        /// Map a student raw answer (could be indices "1|3" or text) to tokens based on question's options.
        /// </summary>
        public static List<string> MapAnswerToTokens(string rawAnswer, string questionAnswerRaw)
        {
            if (string.IsNullOrWhiteSpace(rawAnswer)) return new List<string>();

            var looksNumeric = rawAnswer.All(ch => char.IsDigit(ch) || ch == '|' || char.IsWhiteSpace(ch));
            var options = questionAnswerRaw?
                .Split('|', StringSplitOptions.RemoveEmptyEntries)
                .Select(o => o.Trim().TrimEnd('*').Trim())
                .ToList() ?? new List<string>();

            if (looksNumeric && options.Count > 0)
            {
                var nums = rawAnswer.Split('|', StringSplitOptions.RemoveEmptyEntries);
                var tokens = new List<string>();
                foreach (var n in nums)
                {
                    if (int.TryParse(n.Trim(), out int idx) && idx > 0 && idx <= options.Count)
                    {
                        tokens.Add(NormalizeToken(options[idx - 1]));
                    }
                }
                return tokens
                    .Distinct(StringComparer.OrdinalIgnoreCase)
                    .OrderBy(t => t, StringComparer.OrdinalIgnoreCase)
                    .ToList();
            }

            // fallback to generic parser (text/JSON array)
            return ParseAnswerTokens(rawAnswer);
        }
    }
}
