'use client';

import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { isValidAge, validatePassword, isValidEmail, calculateAge } from '../../lib/validation';
import posthog from 'posthog-js';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const dobId = useId();
  const termsId = useId();
  const errorId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate email format
    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Validate password strength
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.errors[0]);
      return;
    }

    // Validate date of birth is provided
    if (!dob) {
      setError('Please enter your date of birth');
      return;
    }

    // Check age (must be 18+) using accurate calculation
    if (!isValidAge(dob, 18)) {
      setError('You must be at least 18 years old to use SLTR');
      return;
    }

    // Calculate age for storing in user metadata
    const birthDate = new Date(dob);
    const userAge = calculateAge(birthDate);

    if (!agreed) {
      setError('You must agree to the terms');
      return;
    }

    setLoading(true);

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            dob: dob,
            age: userAge,
            age_verified: true,
            age_verified_at: new Date().toISOString(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        }
      });

      if (signUpError) throw signUpError;

      try {
        localStorage.setItem('lastSignupEmail', email);
      } catch {
        // ignore storage failures
      }

      // Identify user and capture signup event in PostHog
      if (data.user) {
        posthog.identify(data.user.id, {
          email: email,
          age: userAge,
          created_at: new Date().toISOString(),
        });
        posthog.capture('user_signed_up', {
          email: email,
          age: userAge,
          source: 'signup_page',
        });
      }

      // Redirect to verify page
      router.push(`/verify?email=${encodeURIComponent(email)}`);
    } catch (error: unknown) {
      // Use generic error message to avoid leaking information
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign up';
      // Don't expose specific Supabase errors like "user already exists"
      if (errorMessage.toLowerCase().includes('already') || errorMessage.toLowerCase().includes('exist')) {
        setError('Unable to create account. Please try again or use a different email.');
      } else {
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '16px 20px',
    fontSize: '15px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    outline: 'none',
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    boxSizing: 'border-box',
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '14px',
    fontWeight: 500,
    marginBottom: '8px',
    color: '#333',
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#000';
    e.target.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.1)';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#ddd';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#fff', 
      color: '#000',
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        padding: '30px',
        borderBottom: '1px solid #eee',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <a href="/" style={{
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '32px',
          fontWeight: 700,
          letterSpacing: '0.3em',
          textDecoration: 'none',
          color: '#000',
          textTransform: 'lowercase'
        }}>s l t r</a>
        <a href="/login" style={{
          fontSize: '13px',
          color: '#000',
          textDecoration: 'none',
          letterSpacing: '0.1em'
        }}>Already have an account? <strong>Log in</strong></a>
      </header>

      {/* Main */}
      <main style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 30px'
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: '42px',
            fontWeight: 300,
            marginBottom: '10px',
            textAlign: 'center'
          }}>Create Account</h1>
          
          <p style={{
            fontSize: '13px',
            opacity: 0.5,
            textAlign: 'center',
            marginBottom: '40px'
          }}>Join the community</p>

          {error && (
            <div
              role="alert"
              id={errorId}
              style={{
                background: '#ffebee',
                color: '#c62828',
                padding: '15px',
                marginBottom: '20px',
                fontSize: '14px',
                borderLeft: '3px solid #c62828'
              }}
            >
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} aria-describedby={error ? errorId : undefined}>
            <div style={{ marginBottom: '20px' }}>
              <label htmlFor={emailId} style={labelStyle}>
                Email address <span style={{ color: '#c62828' }} aria-hidden="true">*</span>
              </label>
              <input
                id={emailId}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                aria-required="true"
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor={passwordId} style={labelStyle}>
                Password <span style={{ color: '#c62828' }} aria-hidden="true">*</span>
              </label>
              <input
                id={passwordId}
                type="password"
                placeholder="Min 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                aria-required="true"
                aria-describedby={`${passwordId}-hint`}
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              <p id={`${passwordId}-hint`} style={{ fontSize: '12px', color: '#666', marginTop: '6px', marginBottom: 0 }}>
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor={confirmPasswordId} style={labelStyle}>
                Confirm Password <span style={{ color: '#c62828' }} aria-hidden="true">*</span>
              </label>
              <input
                id={confirmPasswordId}
                type="password"
                placeholder="Re-enter your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                autoComplete="new-password"
                aria-required="true"
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label htmlFor={dobId} style={labelStyle}>
                Date of Birth <span style={{ color: '#c62828' }} aria-hidden="true">*</span>
              </label>
              <input
                id={dobId}
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                required
                aria-required="true"
                aria-describedby={`${dobId}-hint`}
                style={inputStyle}
                onFocus={handleInputFocus}
                onBlur={handleInputBlur}
              />
              <p id={`${dobId}-hint`} style={{ fontSize: '12px', color: '#666', marginTop: '6px', marginBottom: 0 }}>
                You must be at least 18 years old to use SLTR
              </p>
            </div>

            <div style={{ marginBottom: '30px' }}>
              <label
                htmlFor={termsId}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  lineHeight: 1.5
                }}
              >
                <input
                  id={termsId}
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  required
                  aria-required="true"
                  style={{
                    marginTop: '3px',
                    width: '18px',
                    height: '18px',
                    accentColor: '#000',
                  }}
                />
                <span style={{ color: '#555' }}>
                  I am at least 18 years old and agree to the{' '}
                  <a href="/terms" style={{ color: '#000', textDecoration: 'underline' }}>Terms of Service</a>,{' '}
                  <a href="/privacy" style={{ color: '#000', textDecoration: 'underline' }}>Privacy Policy</a>, and{' '}
                  <a href="/guidelines" style={{ color: '#000', textDecoration: 'underline' }}>Community Guidelines</a>
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '18px',
                fontSize: '14px',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '3px',
                background: '#000',
                color: '#fff',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.6 : 1,
                fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
                outline: 'none',
                transition: 'box-shadow 0.2s',
              }}
              onFocus={(e) => {
                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,0,0,0.3)';
              }}
              onBlur={(e) => {
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <p style={{
            textAlign: 'center',
            marginTop: '30px',
            fontSize: '12px',
            opacity: 0.4
          }}>
            By signing up, you confirm you are at least 18 years old.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer style={{
        padding: '20px 30px',
        borderTop: '1px solid #eee',
        textAlign: 'center'
      }}>
        <p style={{
          fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          fontSize: '10px',
          opacity: 0.3
        }}>© 2025 SLTR Digital LLC. All rights reserved.</p>
      </footer>
    </div>
  );
}
