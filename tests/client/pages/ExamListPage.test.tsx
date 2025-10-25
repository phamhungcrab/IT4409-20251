import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ExamListPage from '../../../client/src/pages/ExamListPage';

/**
 * Tests for the ExamListPage.  These tests ensure that the
 * component renders a list of exams and displays appropriate
 * call‑to‑action links (e.g., Start, View Results) depending
 * on the exam status.  Currently the page uses sample data,
 * so the assertions reflect the mock content defined in the
 * component.  Adjust these tests when connecting to the API.
 */
describe('ExamListPage', () => {
  test('renders a list of upcoming exams', () => {
    render(
      <BrowserRouter>
        <ExamListPage />
      </BrowserRouter>
    );
    // Sample data includes an exam titled "Midterm 1".  Assert it's displayed.
    expect(screen.getByText(/Midterm 1/i)).toBeInTheDocument();
    // Verify that a start link/button is available for the upcoming exam.
    expect(screen.getByRole('link', { name: /start/i })).toBeInTheDocument();
  });
});