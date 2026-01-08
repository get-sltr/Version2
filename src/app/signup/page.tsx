'use client';

import { motion } from 'framer-motion';
import { useState, useId } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import { isValidAge, validatePassword, isValidEmail, calculateAge } from '../../lib/validation';
import posthog from 'posthog-js';
import { AnimatedLogo } from '../../components/AnimatedLogo';

// OAuth Icons
function GoogleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'twitter' | 'facebook' | null>(null);

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

  const handleOAuthSignup = async (provider: 'google' | 'twitter' | 'facebook') => {
    setError('');
    setOauthLoading(provider);

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'OAuth signup failed';
      setError(errorMessage);
      setOauthLoading(null);
    }
  };

  // Liquid glass input style
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '14px 18px',
    fontSize: '15px',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    borderRadius: '12px',
    boxSizing: 'border-box',
    outline: 'none',
    color: '#FFFFFF',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'all 0.3s ease',
    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '11px',
    fontWeight: 500,
    marginBottom: '8px',
    color: 'rgba(200, 220, 255, 0.6)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
  };

  const handleInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(200, 220, 255, 0.4)';
    e.target.style.boxShadow = '0 0 20px rgba(200, 220, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.1)';
    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
    e.target.style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.05)';
    e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.03)';
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
            background: 'linear-gradient(135deg, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.55) 50%, rgba(0,0,0,0.75) 100%)',
          }}
        />
        {/* Ambient glow */}
        <div
          style={{
            position: 'absolute',
            top: '15%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '600px',
            height: '600px',
            background: 'radial-gradient(circle, rgba(200, 220, 255, 0.03) 0%, transparent 60%)',
            pointerEvents: 'none',
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
        {/* Header with Animated Logo */}
        <header
          style={{
            padding: '20px 32px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <AnimatedLogo size="small" href="/" />
          <Link
            href="/login"
            style={{
              fontSize: '13px',
              color: 'rgba(200, 220, 255, 0.7)',
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}
          >
            Already have an account?{' '}
            <span
              style={{
                color: 'rgba(200, 220, 255, 0.9)',
                fontWeight: 600,
                padding: '8px 16px',
                marginLeft: '8px',
                borderRadius: '50px',
                border: '1px solid rgba(200, 220, 255, 0.2)',
                background: 'rgba(255, 255, 255, 0.03)',
              }}
            >
              Log in
            </span>
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
              maxWidth: '440px',
              background: 'rgba(255, 255, 255, 0.02)',
              backdropFilter: 'blur(40px)',
              WebkitBackdropFilter: 'blur(40px)',
              borderRadius: '24px',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              padding: '32px 28px',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
            }}
          >
            <h1
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '28px',
                fontWeight: 600,
                marginBottom: '8px',
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ffffff 0%, #c8dcff 50%, #ffffff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Create Account
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.4)',
                textAlign: 'center',
                marginBottom: '28px',
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
                  background: 'rgba(255, 100, 100, 0.1)',
                  backdropFilter: 'blur(10px)',
                  color: '#ff9999',
                  padding: '14px',
                  marginBottom: '20px',
                  fontSize: '14px',
                  borderLeft: '3px solid rgba(255, 100, 100, 0.5)',
                  borderRadius: '8px',
                }}
              >
                {error}
              </motion.div>
            )}

            <form onSubmit={handleSubmit} aria-describedby={error ? errorId : undefined}>
              <div style={{ marginBottom: '16px' }}>
                <label htmlFor={emailId} style={labelStyle}>
                  Email address <span style={{ color: 'rgba(200, 220, 255, 0.8)' }}>*</span>
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

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor={passwordId} style={labelStyle}>
                  Password <span style={{ color: 'rgba(200, 220, 255, 0.8)' }}>*</span>
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
                    fontSize: '10px',
                    color: 'rgba(200, 220, 255, 0.35)',
                    marginTop: '6px',
                    marginBottom: 0,
                  }}
                >
                  Must be at least 8 characters with uppercase, lowercase, and number
                </p>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor={confirmPasswordId} style={labelStyle}>
                  Confirm Password <span style={{ color: 'rgba(200, 220, 255, 0.8)' }}>*</span>
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

              <div style={{ marginBottom: '16px' }}>
                <label htmlFor={dobId} style={labelStyle}>
                  Date of Birth <span style={{ color: 'rgba(200, 220, 255, 0.8)' }}>*</span>
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
                    fontSize: '10px',
                    color: 'rgba(200, 220, 255, 0.35)',
                    marginTop: '6px',
                    marginBottom: 0,
                  }}
                >
                  You must be at least 18 years old to use SLTR
                </p>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <label
                  htmlFor={termsId}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    cursor: 'pointer',
                    fontSize: '12px',
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
                      marginTop: '3px',
                      width: '18px',
                      height: '18px',
                      accentColor: 'rgba(200, 220, 255, 0.8)',
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ color: 'rgba(255, 255, 255, 0.5)' }}>
                    I am at least 18 years old and agree to the{' '}
                    <Link href="/terms" style={{ color: 'rgba(200, 220, 255, 0.8)', textDecoration: 'none' }}>
                      Terms of Service
                    </Link>
                    ,{' '}
                    <Link href="/privacy" style={{ color: 'rgba(200, 220, 255, 0.8)', textDecoration: 'none' }}>
                      Privacy Policy
                    </Link>
                    , and{' '}
                    <Link href="/guidelines" style={{ color: 'rgba(200, 220, 255, 0.8)', textDecoration: 'none' }}>
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
                  padding: '16px',
                  fontSize: '14px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  background: 'linear-gradient(135deg, rgba(200, 220, 255, 0.9) 0%, rgba(255, 255, 255, 1) 50%, rgba(200, 220, 255, 0.9) 100%)',
                  color: '#0a0a0f',
                  border: 'none',
                  borderRadius: '50px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  opacity: loading ? 0.6 : 1,
                  outline: 'none',
                  boxShadow: '0 0 30px rgba(200, 220, 255, 0.3), inset 0 1px 0 rgba(255,255,255,0.5)',
                  transition: 'all 0.3s ease',
                }}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </motion.button>
            </form>

            {/* OAuth Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '20px 0',
                gap: '16px',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(200, 220, 255, 0.2), transparent)' }} />
              <span style={{ fontSize: '10px', color: 'rgba(200, 220, 255, 0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                or sign up with
              </span>
              <div style={{ flex: 1, height: '1px', background: 'linear-gradient(to right, transparent, rgba(200, 220, 255, 0.2), transparent)' }} />
            </div>

            {/* OAuth Buttons */}
            <div style={{ display: 'flex', gap: '10px' }}>
              {[
                { provider: 'google' as const, icon: <GoogleIcon />, label: 'Google' },
                { provider: 'twitter' as const, icon: <TwitterIcon />, label: 'X' },
                { provider: 'facebook' as const, icon: <FacebookIcon />, label: 'Facebook' },
              ].map(({ provider, icon, label }) => (
                <motion.button
                  key={provider}
                  type="button"
                  onClick={() => handleOAuthSignup(provider)}
                  disabled={loading || oauthLoading !== null}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '12px 14px',
                    fontSize: '13px',
                    fontWeight: 500,
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    color: '#FFFFFF',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '50px',
                    cursor: oauthLoading !== null ? 'not-allowed' : 'pointer',
                    opacity: oauthLoading !== null ? 0.6 : 1,
                    outline: 'none',
                    transition: 'all 0.3s ease',
                  }}
                >
                  {icon}
                  {oauthLoading === provider ? '...' : label}
                </motion.button>
              ))}
            </div>

            <p
              style={{
                textAlign: 'center',
                marginTop: '20px',
                fontSize: '11px',
                color: 'rgba(200, 220, 255, 0.3)',
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
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <p
            style={{
              fontSize: '11px',
              color: 'rgba(255, 255, 255, 0.2)',
              letterSpacing: '0.1em',
              margin: 0,
            }}
          >
            © 2025 SLTR DIGITAL LLC
          </p>
          <p
            style={{
              fontSize: '9px',
              color: 'rgba(200, 220, 255, 0.35)',
              letterSpacing: '0.15em',
              margin: 0,
            }}
          >
            INTELLIGENT | INNOVATIVE | INTUITIVE
          </p>
        </footer>
      </div>
    </div>
  );
}
