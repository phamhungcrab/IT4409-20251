import { render, screen, fireEvent } from '@testing-library/react';
import QuestionCard from '../../../client/src/components/QuestionCard';

/**
 * Tests for the QuestionCard component.  These tests verify
 * that single‑choice and essay question types render the
 * appropriate input controls and that selecting an answer
 * triggers the provided callback.  For multi‑choice questions
 * similar assertions should be added when needed.
 */
describe('QuestionCard', () => {
  test('renders single‑choice question with options', () => {
    const handleAnswer = jest.fn();
    render(
      <QuestionCard
        question={{
          id: 1,
          text: 'What is 2+2?',
          type: 'SINGLE_CHOICE',
          options: [
            { id: 1, text: '3', isCorrect: false },
            { id: 2, text: '4', isCorrect: true },
          ],
        }}
        onAnswer={handleAnswer}
      />
    );
    // The question text should be displayed
    expect(screen.getByText(/What is 2\+2\?/i)).toBeInTheDocument();
    // Options should be rendered as radio buttons
    const radio = screen.getByLabelText('4') as HTMLInputElement;
    fireEvent.click(radio);
    expect(handleAnswer).toHaveBeenCalledWith({ optionIds: [2], essayText: undefined });
  });

  test('renders essay question with textarea', () => {
    const handleAnswer = jest.fn();
    render(
      <QuestionCard
        question={{
          id: 2,
          text: 'Explain your reasoning.',
          type: 'ESSAY',
          options: [],
        }}
        onAnswer={handleAnswer}
      />
    );
    // The textarea should be present
    const textarea = screen.getByPlaceholderText(/type your answer/i);
    fireEvent.change(textarea, { target: { value: 'Because of reasons.' } });
    expect(handleAnswer).toHaveBeenCalledWith({ optionIds: undefined, essayText: 'Because of reasons.' });
  });
});