import { render, screen, act } from '@testing-library/react';
import Timer from '../../../client/src/components/Timer';

/**
 * Tests for the Timer component.  These tests use Jest fake
 * timers to simulate the passage of time and verify that
 * the displayed countdown updates accordingly.  Note that
 * Jest must be configured with `useFakeTimers` for these
 * tests to work.  Refer to the test setup in your project.
 */
describe('Timer', () => {
  beforeAll(() => {
    jest.useFakeTimers();
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  test('counts down from initial time', () => {
    const now = new Date();
    const endTime = new Date(now.getTime() + 2000); // 2 seconds from now
    render(<Timer endTime={endTime} onExpired={() => {}} />);
    // Initially the timer should show "00:02"
    expect(screen.getByText(/00:0[12]/)).toBeInTheDocument();
    // Fast-forward 2 seconds
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    // After expiry, the timer should display "00:00"
    expect(screen.getByText(/00:00/)).toBeInTheDocument();
  });
});