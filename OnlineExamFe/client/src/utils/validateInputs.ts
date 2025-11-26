/**
 * Input validation helpers.
 *
 * Contains functions to validate common form inputs such as email
 * addresses, passwords, required fields and selections for multi-choice
 * questions.  Each function returns either `true` (valid) or a string
 * describing the validation error.  Use these helpers to enforce
 * consistent validation rules across the application.
 */

// Validate that a value is non-empty.  Returns true if valid or an
// error message otherwise.
export function validateRequired(value: string): true | string {
  return value.trim() !== '' || 'This field is required.';
}

// Validate an email address using a simple regex.  Returns true if
// valid or an error message otherwise.  Note: This regex does not
// capture every possible valid email but works for common cases.
export function validateEmail(email: string): true | string {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return pattern.test(email) || 'Please enter a valid email address.';
}

// Validate a password meets minimum length requirements.  Adjust
// criteria (e.g. include numbers, symbols) as needed.  Returns true
// if valid or an error message otherwise.
export function validatePassword(password: string, minLength = 8): true | string {
  return password.length >= minLength || `Password must be at least ${minLength} characters.`;
}

// Validate that at least `min` and at most `max` options have been
// selected for a multi-choice question.  Returns true if valid or an
// error message otherwise.
export function validateMultiChoice(selection: number[], min = 1, max?: number): true | string {
  if (selection.length < min) {
    return `Please select at least ${min} option${min > 1 ? 's' : ''}.`;
  }
  if (max !== undefined && selection.length > max) {
    return `Please select no more than ${max} option${max > 1 ? 's' : ''}.`;
  }
  return true;
}

// Aggregate validation: returns an object containing validation errors
// keyed by field name.  Pass an object where keys are field names and
// values are functions returning true or error strings.  Useful for
// validating entire forms at once.
export function validateFields(rules: Record<string, () => true | string>): Record<string, string> {
  const errors: Record<string, string> = {};
  Object.entries(rules).forEach(([field, validator]) => {
    const result = validator();
    if (result !== true) {
      errors[field] = result as string;
    }
  });
  return errors;
}