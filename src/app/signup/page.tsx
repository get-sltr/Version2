'use client';

import { motion } from 'framer-motion';
import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
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

    if (!isValidEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.valid) {
      setError(passwordValidation.errors[0]);
      return;
    }

    if (!dob) {
      setError('Please enter your date of birth');
      return;
    }

    if (!isValidAge(dob, 18)) {
      setError('You must be at least 18 years old to use SLTR');
      return;
    }

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

      router.push('/welcome');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'An error occurred during sign up';
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
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '8px',
    boxSizing: 'border-box',
    outline: 'none',
    color: '#FFFFFF',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'border-color 0.2s, box-shadow 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '12px',
    fontWeight: 500,
    marginBottom: '8px',
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#FF6B35';
    e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    e.target.style.boxShadow = 'none';
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#000000',
        color: '#FFFFFF',
        fontFamily: "'DM Sans', sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Image */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1,
        }}
      >
        <Image
          src="/icons/signup.png"
          alt="Background"
          fill
          priority
          style={{
            objectFit: 'cover',
            objectPosition: 'center',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.65)',
          }}
        />
      </div>

      {/* Content */}
      <div
        style={{
          position: 'relative',
          zIndex: 10,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Header */}
        <header
          style={{
            padding: '24px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Link
            href="/"
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: '24px',
              fontWeight: 700,
              letterSpacing: '0.15em',
              textDecoration: 'none',
              color: '#FFFFFF',
            }}
          >
            sltr
          </Link>
          <Link
            href="/login"
            style={{
              fontSize: '13px',
              color: 'rgba(255, 255, 255, 0.7)',
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}
          >
            Already have an account?{' '}
            <span style={{ color: '#FF6B35', fontWeight: 600 }}>Log in</span>
          </Link>
        </header>

        {/* Main Form */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px 24px 40px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              width: '100%',
              maxWidth: '420px',
            }}
          >
            <h1
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '32px',
                fontWeight: 600,
                marginBottom: '8px',
                textAlign: 'center',
              }}
            >
              Create Account
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.5)',
                textAlign: 'center',
                marginBottom: '32px',
              }}
            >
              Join the community
            </p>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                id={errorId}
                style={{
                  background: 'rgba(255, 107, 53, 0.1)',
                  color: '#FF6B35',
                  padding: '16px',
                  marginBottom: '24px',
                  fontSize: '14px',
                  borderLeft: '3px solid #FF6B35',
                  borderRadius: '4px',
                }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} aria-describedby={error ? errorId : undefined}>
              <div style={{ marginBottom: '18px' }}>
                <label htmlFor={emailId} style={labelStyle}>
                  Email address <span style={{ color: '#FF6B35' }}>*</span>
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

              <div style={{ marginBottom: '18px' }}>
                <label htmlFor={passwordId} style={labelStyle}>
                  Password <span style={{ color: '#FF6B35' }}>*</span>
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
                <p
                  id={`${passwordId}-hint`}
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    marginTop: '6px',
                    marginBottom: 0,
                  }}
                >
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label htmlFor={confirmPasswordId} style={labelStyle}>
                  Confirm Password <span style={{ color: '#FF6B35' }}>*</span>
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

              <div style={{ marginBottom: '18px' }}>
                <label htmlFor={dobId} style={labelStyle}>
                  Date of Birth <span style={{ color: '#FF6B35' }}>*</span>
                </label>
                <input
                  id={dobId}
                  type="date"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  required
                  aria-required="true"
                  aria-describedby={`${dobId}-hint`}
                  style={{
                    ...inputStyle,
                    colorScheme: 'dark',
                  }}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                />
                <p
                  id={`${dobId}-hint`}
                  style={{
                    fontSize: '11px',
                    color: 'rgba(255, 255, 255, 0.4)',
                    marginTop: '6px',
                    marginBottom: 0,
                  }}
                >
                  You must be at least 18 years old to use SLTR
                </p>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label
                  htmlFor={termsId}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    lineHeight: 1.6,
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
                      marginTop: '4px',
                      width: '18px',
                      height: '18px',
                      accentColor: '#FF6B35',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)' }}>
                    I am at least 18 years old and agree to the{' '}
                    <Link href="/terms" style={{ color: '#FF6B35', textDecoration: 'none' }}>
                      Terms of Service
                    </Link>
                    ,{' '}
                    <Link href="/privacy" style={{ color: '#FF6B35', textDecoration: 'none' }}>
                      Privacy Policy
                    </Link>
                    , and{' '}
                    <Link href="/guidelines" style={{ color: '#FF6B35', textDecoration: 'none' }}>
                      Community Guidelines
                    </Link>
                  </span>
                </label>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  width: '100%',
                  padding: '18px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  background: '#FF6B35',
                  color: '#000000',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  outline: 'none',
                  boxShadow: '0 0 30px rgba(255, 107, 53, 0.4)',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </motion.button>
            </form>

            <p
              style={{
                textAlign: 'center',
                marginTop: '24px',
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.3)',
              }}
            >
              By signing up, you confirm you are at least 18 years old.
            </p>
          </motion.div>
        </main>

        {/* Footer */}
        <footer
          style={{
            padding: '24px',
            textAlign: 'center',
          }}
        >
          <p
            style={{
              fontSize: '12px',
              color: 'rgba(255, 255, 255, 0.3)',
            }}
          >
            © 2025 SLTR Digital LLC
          </p>
        </footer>
      </div>
    </div>
  );
}
