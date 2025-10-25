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
    <article className="p-4 border rounded-md bg-white shadow-sm space-y-4">
      {/* Display question index if provided */}
      {orderIndex !== undefined && (
        <div className="text-sm text-gray-500">Question {orderIndex}</div>
      )}
      <h2 className="font-medium text-gray-800">{text}</h2>
      {questionType === 3 ? (
        // Essay question: show a textarea for free-form input
        <textarea
          className="w-full border rounded-md p-2 resize-y"
          rows={4}
          onChange={handleEssayChange}
          placeholder="Type your answer here..."
        />
      ) : (
        // Objective question: render the list of options
        <OptionList
          options={options}
          questionType={questionType}
          selected={selectedOptions}
          onChange={handleOptionChange}
        />
      )}
    </article>
  );
};

export default QuestionCard;