/**
 * Input validation helpers.
 */

// Validate that a value is non-empty.
export function isRequired(value: string): boolean {
  return value.trim() !== '';
}

// Validate an email address using a regex.
export function isValidEmail(email: string): boolean {
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  return pattern.test(email);
}

// Validate a password meets complexity rules.
// Example: At least 8 chars, 1 uppercase, 1 lowercase, 1 number.
export function isValidPassword(password: string): boolean {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);

  return (
    password.length >= minLength &&
    hasUpperCase &&
    hasLowerCase &&
    hasNumber
  );
}

// Validate multi-choice selection
export function isValidSelection(selection: number[], min = 1): boolean {
  return selection.length >= min;
}