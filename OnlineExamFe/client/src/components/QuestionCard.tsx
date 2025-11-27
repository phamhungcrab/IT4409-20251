/**
 * QuestionCard component.
 *
 * Displays an individual exam question along with its answer options (for
 * objective questions) or an input area (for essay questions).  Uses the
 * `OptionList` component to render selectable options.  The parent
 * component should provide a callback to capture the student's answer and
 * persist it in state or send it to the backend on autosave.
 */

import React from 'react';
import OptionList, { OptionItem } from './OptionList';

export interface QuestionCardProps {
  /** Unique identifier for this question (e.g. QuestionExamId) */
  questionId: number;
  /** Display order index (optional) */
  orderIndex?: number;
  /** The question text shown to the student */
  text: string;
  /** Question type: 1 = SINGLE_CHOICE, 2 = MULTI_CHOICE, 3 = ESSAY */
  questionType: number;
  /** List of answer options (for objective questions).  Should be undefined for essay questions. */
  options?: OptionItem[];
  /** Currently selected option IDs for objective questions */
  selectedOptions?: number[];
  /**
   * Callback invoked when the student's answer changes.  For objective
   * questions, it receives an array of selected option IDs; for essays,
   * it receives the typed answer string.
   */
  onAnswer: (answer: number[] | string) => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({
  questionId,
  orderIndex,
  text,
  questionType,
  options = [],
  selectedOptions = [],
  onAnswer,
}) => {
  const handleOptionChange = (selected: number[]) => {
    onAnswer(selected);
  };

  const handleEssayChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onAnswer(e.target.value);
  };

  return (
    <article className="glass-card p-6 space-y-4">
      {orderIndex !== undefined && (
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-sky-100">
          <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden />
          Question {orderIndex}
        </div>
      )}
      <h2 className="text-lg font-semibold text-white leading-relaxed">{text}</h2>
      {questionType === 3 ? (
        <textarea
          className="w-full border rounded-xl p-3 resize-y bg-white/5 placeholder:text-slate-400 text-slate-100"
          rows={5}
          onChange={handleEssayChange}
          placeholder="Type your answer here..."
        />
      ) : (
        <OptionList
          options={options}
          questionType={questionType}
          selected={selectedOptions}
          onChange={handleOptionChange}
          groupName={`question-${questionId}`}
        />
      )}
    </article>
  );
};

export default QuestionCard;
