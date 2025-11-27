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
  /** Optional name for the radio/checkbox group to improve accessibility. */
  groupName?: string;
}

const OptionList: React.FC<OptionListProps> = ({ options, questionType, selected, onChange, groupName }) => {
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
    <ul className="space-y-3" role="list">
      {options.map((opt) => {
        const isSelected = selected.includes(opt.id);
        const isSingle = questionType === 1;
        return (
          <li key={opt.id}>
            <label
              htmlFor={`option-${opt.id}`}
              className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition
                ${isSelected ? 'border-sky-400/70 bg-white/5 shadow-lg shadow-sky-500/10' : 'border-white/10 bg-white/0 hover:border-white/25'}`}
            >
              <input
                type={isSingle ? 'radio' : 'checkbox'}
                name={groupName || 'option-group'}
                id={`option-${opt.id}`}
                className="sr-only"
                checked={isSelected}
                onChange={(e) => handleSelect(opt.id, e.target.checked)}
              />
              <span
                className={`mt-1 flex h-5 w-5 items-center justify-center rounded-full border transition
                  ${isSelected ? 'border-sky-300 bg-sky-500/30' : 'border-white/20 bg-white/5'}`}
                role="presentation"
              >
                {!isSingle && (
                  <span
                    className={`h-2.5 w-2.5 rounded-sm ${isSelected ? 'bg-white' : 'bg-transparent'}`}
                  />
                )}
                {isSingle && (
                  <span className={`h-2.5 w-2.5 rounded-full ${isSelected ? 'bg-white' : 'bg-transparent'}`} />
                )}
              </span>
              <span className="flex-1 text-sm leading-relaxed text-slate-100">{opt.text}</span>
            </label>
          </li>
        );
      })}
    </ul>
  );
};

export default OptionList;
