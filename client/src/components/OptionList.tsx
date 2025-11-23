/**
 * OptionList component.
 *
 * Renders a list of selectable answer options for single or multiple choice
 * questions.  It accepts an array of options, a question type flag, a list
 * of selected option IDs, and a callback to update selections.  Radios are
 * used for single-choice questions and checkboxes for multi-choice.  You can
 * customize styling or wrap this component in another component to add
 * additional behaviours (e.g. disabling options after submission).
 */
// lựa chọn react
import React from 'react';

// Representation of an option
export interface OptionItem {
  id: number;
  text: string;
}

export interface OptionListProps {
  options: OptionItem[];
  /**
   * Question type: 1 = SINGLE_CHOICE, 2 = MULTI_CHOICE.  Other values can
   * be ignored here (e.g. 3 = ESSAY).  For essay questions, this component
   * should not be rendered.
   */
  questionType: number;
  /**
   * Array of currently selected option IDs.  For single-choice questions,
   * this array will contain at most one element.
   */
  selected: number[];
  /**
   * Callback invoked when the selection changes.  Receives the new list of
   * selected option IDs.  Parent components should update their state
   * accordingly.
   */
  onChange: (selected: number[]) => void;
}

const OptionList: React.FC<OptionListProps> = ({ options, questionType, selected, onChange }) => {
  const handleSelect = (id: number, checked: boolean) => {
    if (questionType === 1) {
      // SINGLE_CHOICE: replace selection with the clicked option
      onChange(checked ? [id] : []);
    } else {
      // MULTI_CHOICE: toggle the clicked option
      const newSelected = checked
        ? [...selected, id]
        : selected.filter((optionId) => optionId !== id);
      onChange(newSelected);
    }
  };

  return (
    <ul className="space-y-2">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        return (
          <li key={opt.id} className="flex items-start space-x-2">
            <input
              type={questionType === 1 ? 'radio' : 'checkbox'}
              name={`question-option-${opt.id}`}
              id={`option-${opt.id}`}
              checked={isSelected}
              onChange={(e) => handleSelect(opt.id, e.target.checked)}
            />
            <label htmlFor={`option-${opt.id}`} className="flex-1 cursor-pointer">
              {opt.text}
            </label>
          </li>
        );
      })}
    </ul>
  );
};

export default OptionList;