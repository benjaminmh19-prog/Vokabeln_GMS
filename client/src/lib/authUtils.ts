/**
 * Authentication utilities for player login/registration
 */

/**
 * Hash a password using a simple method
 * Note: In production, use bcrypt or similar on the backend
 */
export function hashPassword(password: string): string {
  // Simple hash for client-side (not cryptographically secure)
  // In production, this should be done on the backend with bcrypt
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16);
}

/**
 * Validate player answer against correct answer
 * Supports multiple answers separated by commas or semicolons
 * @param userAnswer - The answer provided by the player
 * @param correctAnswer - The correct answer(s) from the database
 * @returns true if the answer matches any of the correct answers
 */
export function validateAnswer(userAnswer: string, correctAnswer: string): boolean {
  if (!userAnswer || !correctAnswer) return false;

  // Normalize user answer
  const normalizedUser = userAnswer.trim().toLowerCase();

  // Split correct answer by comma or semicolon
  const answers = correctAnswer
    .split(/[,;]/)
    .map((answer) => answer.trim().toLowerCase())
    .filter((answer) => answer.length > 0);

  // Check if user answer matches any of the correct answers
  return answers.some((answer) => {
    // Exact match
    if (normalizedUser === answer) return true;

    // Partial match (for longer answers)
    if (normalizedUser.includes(answer) || answer.includes(normalizedUser)) {
      return true;
    }

    return false;
  });
}

/**
 * Parse multiple answers from a string
 * @param answerString - String with answers separated by commas or semicolons
 * @returns Array of individual answers
 */
export function parseAnswers(answerString: string): string[] {
  return answerString
    .split(/[,;]/)
    .map((answer) => answer.trim())
    .filter((answer) => answer.length > 0);
}

/**
 * Validate username format
 */
export function isValidUsername(username: string): boolean {
  // Username must be 3-20 characters, alphanumeric and underscores only
  const regex = /^[a-zA-Z0-9_]{3,20}$/;
  return regex.test(username);
}

/**
 * Validate password strength
 */
export function isValidPassword(password: string): boolean {
  // Password must be at least 6 characters
  return password.length >= 6;
}

/**
 * Get password strength indicator
 */
export function getPasswordStrength(password: string): 'weak' | 'medium' | 'strong' {
  if (password.length < 6) return 'weak';
  if (password.length < 10) return 'medium';
  if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) {
    return 'strong';
  }
  return 'medium';
}
