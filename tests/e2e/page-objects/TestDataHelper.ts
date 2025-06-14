import { TEST_USER } from "../config";

export function generateUniqueEmail(): string {
  const timestamp = Date.now();
  const randomSuffix = Math.random().toString(36).substring(2, 8);
  return `test-user-${timestamp}-${randomSuffix}@example.com`;
}

export function generateTestUser() {
  return {
    email: generateUniqueEmail(),
    password: "ValidPassword123!",
  };
}

export function getExistingTestUser() {
  return {
    email: TEST_USER.email,
    password: TEST_USER.password,
  };
}

export function getValidPassword(): string {
  return "ValidPassword123!";
}

export function getInvalidPassword(): string {
  return "short";
}

export function getInvalidEmail(): string {
  return "invalid-email-format";
}

export function getPasswordMismatchData() {
  const user = generateTestUser();
  return {
    email: user.email,
    password: user.password,
    passwordConfirm: "DifferentPassword123!",
  };
}

export function getEmptyFormData() {
  return {
    email: "",
    password: "",
    passwordConfirm: "",
  };
}

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
