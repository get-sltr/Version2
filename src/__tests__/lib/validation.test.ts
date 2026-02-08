import {
  calculateAge,
  isValidAge,
  isValidEmail,
  validatePassword,
  sanitizeDisplayName,
  validateProfileData,
} from '@/lib/validation';

describe('calculateAge', () => {
  it('calculates age correctly for a date in the past', () => {
    // Use a fixed date for testing
    const today = new Date();
    const thirtyYearsAgo = new Date(
      today.getFullYear() - 30,
      today.getMonth(),
      today.getDate()
    );
    expect(calculateAge(thirtyYearsAgo)).toBe(30);
  });

  it('accounts for month when birthday has not occurred yet this year', () => {
    const today = new Date();
    // Birthday is next month
    const nextMonth = (today.getMonth() + 1) % 12;
    const yearAdjust = nextMonth < today.getMonth() ? 1 : 0;
    const birthDate = new Date(
      today.getFullYear() - 25 + yearAdjust,
      nextMonth,
      15
    );
    expect(calculateAge(birthDate)).toBe(24);
  });

  it('accounts for day when birthday is later this month', () => {
    const today = new Date();
    // If we're early in the month, birthday later this month
    if (today.getDate() < 28) {
      const birthDate = new Date(
        today.getFullYear() - 25,
        today.getMonth(),
        today.getDate() + 1
      );
      expect(calculateAge(birthDate)).toBe(24);
    }
  });

  it('returns correct age when birthday was earlier this year', () => {
    const today = new Date();
    // Birthday was last month
    const lastMonth = today.getMonth() === 0 ? 11 : today.getMonth() - 1;
    const yearAdjust = lastMonth > today.getMonth() ? 1 : 0;
    const birthDate = new Date(
      today.getFullYear() - 25 - yearAdjust,
      lastMonth,
      15
    );
    expect(calculateAge(birthDate)).toBe(25);
  });
});

describe('isValidAge', () => {
  it('returns true for users 18 and older', () => {
    const today = new Date();
    const eighteenYearsAgo = new Date(
      today.getFullYear() - 18,
      today.getMonth(),
      today.getDate()
    );
    expect(isValidAge(eighteenYearsAgo, 18)).toBe(true);
  });

  it('returns false for users under 18', () => {
    const today = new Date();
    const seventeenYearsAgo = new Date(
      today.getFullYear() - 17,
      today.getMonth(),
      today.getDate()
    );
    expect(isValidAge(seventeenYearsAgo, 18)).toBe(false);
  });

  it('returns false for future dates', () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    expect(isValidAge(tomorrow, 18)).toBe(false);
  });

  it('returns false for invalid date strings', () => {
    expect(isValidAge('not-a-date', 18)).toBe(false);
  });

  it('accepts string dates', () => {
    const today = new Date();
    const twentyYearsAgo = `${today.getFullYear() - 20}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    expect(isValidAge(twentyYearsAgo, 18)).toBe(true);
  });

  it('uses default minimum age of 18', () => {
    const today = new Date();
    const seventeenYearsAgo = new Date(
      today.getFullYear() - 17,
      today.getMonth(),
      today.getDate()
    );
    expect(isValidAge(seventeenYearsAgo)).toBe(false);
  });
});

describe('isValidEmail', () => {
  it('returns true for valid email addresses', () => {
    expect(isValidEmail('test@example.com')).toBe(true);
    expect(isValidEmail('user.name@domain.co')).toBe(true);
    expect(isValidEmail('user+tag@example.org')).toBe(true);
  });

  it('returns false for invalid email addresses', () => {
    expect(isValidEmail('')).toBe(false);
    expect(isValidEmail('notanemail')).toBe(false);
    expect(isValidEmail('@nodomain.com')).toBe(false);
    expect(isValidEmail('noat.com')).toBe(false);
    expect(isValidEmail('spaces in@email.com')).toBe(false);
  });
});

describe('validatePassword', () => {
  it('returns valid for strong passwords meeting all requirements', () => {
    const result = validatePassword('SecurePass123');
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.strength).toBeDefined();
  });

  it('returns invalid for passwords shorter than 8 characters', () => {
    const result = validatePassword('Short1');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be at least 8 characters');
  });

  it('returns invalid for empty passwords', () => {
    const result = validatePassword('');
    expect(result.valid).toBe(false);
  });

  it('requires at least one uppercase letter', () => {
    const result = validatePassword('lowercase123');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one uppercase letter');
  });

  it('requires at least one lowercase letter', () => {
    const result = validatePassword('UPPERCASE123');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one lowercase letter');
  });

  it('requires at least one number', () => {
    const result = validatePassword('NoNumbersHere');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must contain at least one number');
  });

  it('rejects common passwords', () => {
    const result = validatePassword('Password123');
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password is too common. Please choose a more unique password');
  });

  it('calculates password strength', () => {
    const weakResult = validatePassword('abc');
    expect(weakResult.strength).toBe('weak');

    const strongResult = validatePassword('Str0ng!Pass#2024');
    expect(strongResult.strength).toBe('strong');
  });

  it('rejects passwords longer than 128 characters', () => {
    const longPassword = 'Aa1' + 'a'.repeat(130);
    const result = validatePassword(longPassword);
    expect(result.valid).toBe(false);
    expect(result.errors).toContain('Password must be 128 characters or less');
  });
});

describe('sanitizeDisplayName', () => {
  it('removes HTML-like characters', () => {
    expect(sanitizeDisplayName('<script>alert()</script>')).toBe(
      'scriptalert()/script'
    );
  });

  it('trims whitespace', () => {
    expect(sanitizeDisplayName('  John  ')).toBe('John');
  });

  it('truncates to 50 characters', () => {
    const longName = 'a'.repeat(100);
    expect(sanitizeDisplayName(longName)).toHaveLength(50);
  });

  it('handles normal names correctly', () => {
    expect(sanitizeDisplayName('John Doe')).toBe('John Doe');
  });
});

describe('validateProfileData', () => {
  it('returns valid for correct profile data', () => {
    const result = validateProfileData({
      display_name: 'John',
      age: 25,
      bio: 'Hello there!',
    });
    expect(result.valid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it('rejects display names shorter than 2 characters', () => {
    const result = validateProfileData({ display_name: 'A' });
    expect(result.valid).toBe(false);
    expect(result.errors.display_name).toBeDefined();
  });

  it('rejects display names longer than 50 characters', () => {
    const result = validateProfileData({ display_name: 'a'.repeat(51) });
    expect(result.valid).toBe(false);
    expect(result.errors.display_name).toBeDefined();
  });

  it('rejects ages under 18', () => {
    const result = validateProfileData({ age: 17 });
    expect(result.valid).toBe(false);
    expect(result.errors.age).toBeDefined();
  });

  it('rejects unrealistic ages', () => {
    const result = validateProfileData({ age: 150 });
    expect(result.valid).toBe(false);
    expect(result.errors.age).toBeDefined();
  });

  it('rejects bios longer than 500 characters', () => {
    const result = validateProfileData({ bio: 'a'.repeat(501) });
    expect(result.valid).toBe(false);
    expect(result.errors.bio).toBeDefined();
  });

  it('validates only provided fields', () => {
    const result = validateProfileData({});
    expect(result.valid).toBe(true);
  });
});
