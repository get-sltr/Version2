import { NextResponse } from 'next/server';
import { isValidAge, validatePassword, isValidEmail } from '@/lib/validation';
import {
  checkUpstashRateLimit,
  getClientIdentifier,
  rateLimitHeaders,
} from '@/lib/upstash-rate-limit';

interface SignupValidationRequest {
  email: string;
  password: string;
  dob: string;
}

/**
 * Server-side validation for signup data
 * This provides an additional layer of security beyond client-side validation
 */
export async function POST(request: Request) {
  // Rate limiting - use strict 'auth' limits to prevent enumeration attacks
  const clientId = getClientIdentifier(request);
  const rateLimitResult = await checkUpstashRateLimit(clientId, 'auth');

  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: 'Too many attempts. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': Math.ceil((rateLimitResult.reset - Date.now()) / 1000).toString(),
          ...rateLimitHeaders(rateLimitResult),
        },
      }
    );
  }

  try {
    const body = await request.json().catch(() => null);

    if (!body) {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    const { email, password, dob } = body as SignupValidationRequest;
    const errors: Record<string, string> = {};

    // Validate email
    if (!email) {
      errors.email = 'Email is required';
    } else if (!isValidEmail(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Validate password
    if (!password) {
      errors.password = 'Password is required';
    } else {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.valid) {
        errors.password = passwordValidation.errors[0];
      }
    }

    // Validate date of birth - CRITICAL for age-restricted platform
    if (!dob) {
      errors.dob = 'Date of birth is required';
    } else {
      const birthDate = new Date(dob);

      // Check if date is valid
      if (isNaN(birthDate.getTime())) {
        errors.dob = 'Invalid date format';
      } else if (birthDate > new Date()) {
        errors.dob = 'Date of birth cannot be in the future';
      } else if (!isValidAge(dob, 18)) {
        errors.dob = 'You must be at least 18 years old to use SLTR';
      }
    }

    if (Object.keys(errors).length > 0) {
      return NextResponse.json(
        { valid: false, errors },
        { status: 400, headers: rateLimitHeaders(rateLimitResult) }
      );
    }

    return NextResponse.json(
      { valid: true },
      { headers: rateLimitHeaders(rateLimitResult) }
    );
  } catch (error) {
    console.error('Signup validation error:', error);
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500, headers: rateLimitHeaders(rateLimitResult) }
    );
  }
}
