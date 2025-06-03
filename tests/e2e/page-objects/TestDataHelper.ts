import { TEST_USER } from "../config";

export class TestDataHelper {
  /**
   * Generate a unique email for new user registration tests
   */
  static generateUniqueEmail(): string {
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `test-user-${timestamp}-${randomSuffix}@example.com`;
  }

  /**
   * Generate a new test user with unique email
   */
  static generateTestUser() {
    return {
      email: this.generateUniqueEmail(),
      password: "ValidPassword123!",
    };
  }

  /**
   * Get existing test user for login/conflict tests
   * This user should already exist in the system
   */
  static getExistingTestUser() {
    return {
      email: TEST_USER.email,
      password: TEST_USER.password,
    };
  }

  /**
   * Get a valid password that meets requirements
   */
  static getValidPassword(): string {
    return "ValidPassword123!";
  }

  /**
   * Get an invalid password (too short)
   */
  static getInvalidPassword(): string {
    return "short";
  }

  /**
   * Get an invalid email format
   */
  static getInvalidEmail(): string {
    return "invalid-email-format";
  }

  /**
   * Get test data for password mismatch scenario
   */
  static getPasswordMismatchData() {
    const user = this.generateTestUser();
    return {
      email: user.email,
      password: user.password,
      passwordConfirm: "DifferentPassword123!",
    };
  }

  /**
   * Get test data for validation errors (empty fields)
   */
  static getEmptyFormData() {
    return {
      email: "",
      password: "",
      passwordConfirm: "",
    };
  }
}
