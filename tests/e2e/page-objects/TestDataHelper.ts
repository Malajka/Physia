import { TEST_USER } from "../config";

/**
 * Generate a unique email for new user registration tests
 */
export function generateUniqueEmail(): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `test-user-${timestamp}-${randomSuffix}@example.com`;
}

/**
 * Generate a new test user with unique email
 */
export function generateTestUser() {
  return {
    email: generateUniqueEmail(),
    password: "ValidPassword123!",
  };
}

/**
 * Get existing test user for login/conflict tests.
 * This user should already exist in the system.
 */
export function getExistingTestUser() {
  return {
    email: TEST_USER.email,
    password: TEST_USER.password,
  };
}

/**
 * Get a valid password that meets requirements
 */
export function getValidPassword(): string {
  return "ValidPassword123!";
}

/**
 * Get an invalid password (e.g., too short)
 */
export function getInvalidPassword(): string {
  return "short";
}

/**
 * Get an invalid email format
 */
export function getInvalidEmail(): string {
  return "invalid-email-format";
}

/**
 * Get test data for password mismatch scenario
 */
export function getPasswordMismatchData() {
  const user = generateTestUser();
  return {
    email: user.email,
    password: user.password,
    passwordConfirm: "DifferentPassword123!",
  };
}

/**
 * Get test data for validation errors (empty fields)
 */
export function getEmptyFormData() {
  return {
    email: "",
    password: "",
    passwordConfirm: "",
  };
}

// Legacy class export for backward compatibility
export const TestDataHelper = {
  generateUniqueEmail,
  generateTestUser,
  getExistingTestUser,
  getValidPassword,
  getInvalidPassword,
  getInvalidEmail,
  getPasswordMismatchData,
  getEmptyFormData,
};
