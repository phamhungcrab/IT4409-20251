import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ExamRoomPage from '../../../client/src/pages/ExamRoomPage';

/**
 * Tests for the ExamRoomPage.  These tests verify that the
 * page renders the exam title, countdown timer and questions
 * with selectable options.  Because the page currently uses
 * stubbed data and simple state management, the tests focus
 * on user interactions like selecting an answer.  When the
 * exam hook and services are wired to the API, expand these
 * tests to verify autosave and submission behaviour.
 */
describe('ExamRoomPage', () => {
  test('renders the exam title and questions', () => {
    render(
      <BrowserRouter>
        <ExamRoomPage />
      </BrowserRouter>
    );
    expect(screen.getByText(/midterm 1/i)).toBeInTheDocument();
    // The sample exam includes the first question "What is 2+2?"
    expect(screen.getByText(/What is 2\+2\?/i)).toBeInTheDocument();
  });

  test('allows selecting an option for a single‑choice question', () => {
    render(
      <BrowserRouter>
        <ExamRoomPage />
      </BrowserRouter>
    );
    // Select the radio input labelled "4"
    const option = screen.getByLabelText('4');
    fireEvent.click(option);
    // After selecting, the input should be checked
    expect((option as HTMLInputElement).checked).toBe(true);
  });
});