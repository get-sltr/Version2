/**
 * Validation utilities for Primal
 * Contains shared validation logic for both client and server-side use
 */

/**
 * Calculate age from date of birth accurately
 * Accounts for month and day, not just year difference
 */
export function calculateAge(dob: Date): number {
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  // If birth month hasn't occurred yet this year, or
  // if we're in the birth month but the day hasn't occurred yet
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }

  return age;
}

/**
 * Validate that a date of birth meets minimum age requirement
 */
export function isValidAge(dob: string | Date, minimumAge: number = 18): boolean {
  const birthDate = typeof dob === 'string' ? new Date(dob) : dob;

  // Check if date is valid
  if (isNaN(birthDate.getTime())) {
    return false;
  }

  // Check if date is not in the future
  if (birthDate > new Date()) {
    return false;
  }

  // Check minimum age
  const age = calculateAge(birthDate);
  return age >= minimumAge;
}

/**
 * Validate phone number in E.164 format
 * Accepts: +1XXXXXXXXXX, 1XXXXXXXXXX, XXXXXXXXXX (assumes US +1)
 */
export function isValidPhone(phone: string): boolean {
  // Strip all non-digit characters except leading +
  const cleaned = phone.replace(/[^\d+]/g, '');
  // E.164: starts with +, followed by 1-15 digits
  const e164Regex = /^\+[1-9]\d{6,14}$/;
  if (e164Regex.test(cleaned)) return true;
  // US number without +: 10 digits or 11 digits starting with 1
  const digitsOnly = cleaned.replace(/\D/g, '');
  if (digitsOnly.length === 10) return true;
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) return true;
  return false;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 * Enforces minimum security requirements for user passwords
 */
export function validatePassword(password: string): {
  valid: boolean;
  errors: string[];
  strength: 'weak' | 'fair' | 'strong';
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (password.length > 128) {
    errors.push('Password must be 128 characters or less');
  }

  // Require at least one uppercase letter
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter');
  }

  // Require at least one lowercase letter
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter');
  }

  // Require at least one number
  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain at least one number');
  }

  // Check for common weak passwords
  const commonPasswords = [
    'password', '12345678', 'qwerty123', 'letmein', 'welcome',
    'admin123', 'iloveyou', 'sunshine', 'princess', 'football',
  ];
  if (commonPasswords.some(common => password.toLowerCase().includes(common))) {
    errors.push('Password is too common. Please choose a more unique password');
  }

  // Calculate password strength
  let strengthScore = 0;
  if (password.length >= 8) strengthScore++;
  if (password.length >= 12) strengthScore++;
  if (/[A-Z]/.test(password)) strengthScore++;
  if (/[a-z]/.test(password)) strengthScore++;
  if (/[0-9]/.test(password)) strengthScore++;
  if (/[^A-Za-z0-9]/.test(password)) strengthScore++; // Special chars

  let strength: 'weak' | 'fair' | 'strong';
  if (strengthScore <= 3) {
    strength = 'weak';
  } else if (strengthScore <= 5) {
    strength = 'fair';
  } else {
    strength = 'strong';
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
}

/**
 * Sanitize display name - remove potentially dangerous characters
 */
export function sanitizeDisplayName(name: string): string {
  return name
    .trim()
    .slice(0, 50) // Max 50 characters
    .replace(/[<>]/g, ''); // Remove potential HTML injection chars
}

/**
 * Validate profile data
 */
export interface ProfileValidation {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateProfileData(data: {
  display_name?: string;
  age?: number;
  bio?: string;
}): ProfileValidation {
  const errors: Record<string, string> = {};

  if (data.display_name !== undefined) {
    if (data.display_name.length < 2) {
      errors.display_name = 'Display name must be at least 2 characters';
    }
    if (data.display_name.length > 50) {
      errors.display_name = 'Display name must be 50 characters or less';
    }
  }

  if (data.age !== undefined) {
    if (data.age < 18) {
      errors.age = 'You must be at least 18 years old';
    }
    if (data.age > 120) {
      errors.age = 'Please enter a valid age';
    }
  }

  if (data.bio !== undefined && data.bio.length > 500) {
    errors.bio = 'Bio must be 500 characters or less';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
