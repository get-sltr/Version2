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
function AppleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
    </svg>
  );
}

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


export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [dob, setDob] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'apple' | 'google' | null>(null);

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
      setError('You must be 18 years old or older on the day of sign up. We do not accept users under 18.');
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

  const handleOAuthSignup = async (provider: 'apple' | 'google') => {
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
      const errorMessage = err instanceof Error ? err.message : `Sign up with ${provider} failed`;
      setError(errorMessage);
      setOauthLoading(null);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');

        .signup-container {
          min-height: 100vh;
          background: #0a0a0f;
          color: #fff;
          font-family: 'DM Sans', -apple-system, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .signup-bg {
          position: fixed;
          inset: 0;
          z-index: 1;
        }

        .signup-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(10,10,15,0.85) 0%, rgba(10,10,15,0.6) 50%, rgba(10,10,15,0.85) 100%);
        }

        .signup-ambient {
          position: absolute;
          top: 10%;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, rgba(200, 220, 255, 0.03) 40%, transparent 70%);
          pointer-events: none;
        }

        .signup-content {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .signup-header {
          padding: 20px 32px;
          padding-top: calc(env(safe-area-inset-top, 0px) + 20px);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .signup-header-link {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.5);
          text-decoration: none;
        }

        .signup-header-btn {
          color: #FF6B35;
          font-weight: 600;
          margin-left: 8px;
          padding: 12px 16px;
          min-height: 44px;
          border: 1px solid rgba(255, 107, 53, 0.3);
          border-radius: 8px;
          background: rgba(255, 107, 53, 0.05);
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }

        .signup-header-btn:hover {
          background: rgba(255, 107, 53, 0.15);
          border-color: rgba(255, 107, 53, 0.5);
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.2);
        }

        .signup-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px 24px 40px;
        }

        .signup-card {
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 32px 28px;
          box-shadow:
            0 25px 50px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
        }

        .signup-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 26px;
          font-weight: 600;
          margin-bottom: 6px;
          text-align: center;
          background: linear-gradient(135deg, #ffffff 0%, #FF6B35 50%, #ffffff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 20px rgba(255, 107, 53, 0.3));
        }

        .signup-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
          margin-bottom: 28px;
        }

        .signup-error {
          background: rgba(255, 80, 80, 0.1);
          backdrop-filter: blur(10px);
          color: #ff8888;
          padding: 14px;
          margin-bottom: 20px;
          font-size: 14px;
          border-left: 3px solid rgba(255, 80, 80, 0.5);
          border-radius: 8px;
        }

        .signup-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .signup-label-required {
          color: #FF6B35;
        }

        .signup-input {
          width: 100%;
          padding: 14px 18px;
          font-size: 15px;
          font-family: inherit;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #fff;
          outline: none;
          transition: all 0.3s ease;
          box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.03);
        }

        .signup-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .signup-input:focus {
          border-color: rgba(255, 107, 53, 0.5);
          background: rgba(255, 255, 255, 0.05);
          box-shadow:
            0 0 20px rgba(255, 107, 53, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .signup-hint {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.3);
          margin-top: 6px;
        }

        .signup-checkbox-wrap {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          cursor: pointer;
          font-size: 13px;
          line-height: 1.6;
        }

        .signup-checkbox-container {
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 44px;
          min-height: 44px;
          flex-shrink: 0;
        }

        .signup-checkbox {
          width: 20px;
          height: 20px;
          accent-color: #FF6B35;
        }

        .signup-checkbox-text {
          color: rgba(255, 255, 255, 0.5);
        }

        .signup-checkbox-text a {
          color: #FF6B35;
          text-decoration: none;
        }

        .signup-checkbox-text a:hover {
          text-shadow: 0 0 10px rgba(255, 107, 53, 0.5);
        }

        /* Glass Card Button - Create Account */
        .signup-submit {
          width: 100%;
          padding: 18px;
          font-family: 'Orbitron', sans-serif;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          background: rgba(255, 107, 53, 0.1);
          backdrop-filter: blur(20px);
          color: #FF6B35;
          border: 1px solid rgba(255, 107, 53, 0.4);
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          box-shadow:
            0 0 30px rgba(255, 107, 53, 0.2),
            inset 0 1px 0 rgba(255, 200, 150, 0.1);
        }

        .signup-submit::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.2), transparent);
          animation: submitShine 3s ease-in-out infinite;
        }

        .signup-submit:hover:not(:disabled) {
          background: rgba(255, 107, 53, 0.2);
          border-color: rgba(255, 107, 53, 0.6);
          color: #fff;
          box-shadow:
            0 0 40px rgba(255, 107, 53, 0.4),
            0 0 80px rgba(255, 107, 53, 0.2),
            inset 0 1px 0 rgba(255, 200, 150, 0.2);
          text-shadow: 0 0 20px rgba(255, 107, 53, 0.8);
        }

        .signup-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes submitShine {
          0% { left: -100%; }
          50%, 100% { left: 150%; }
        }

        .signup-divider {
          display: flex;
          align-items: center;
          margin: 24px 0;
          gap: 16px;
        }

        .signup-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255, 107, 53, 0.2), transparent);
        }

        .signup-divider-text {
          font-size: 10px;
          color: rgba(255, 255, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .signup-oauth {
          display: flex;
          gap: 10px;
        }

        .signup-oauth-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px;
          font-size: 13px;
          font-weight: 500;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(10px);
          color: rgba(255, 255, 255, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .signup-oauth-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
          color: #fff;
        }

        .signup-oauth-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .signup-footer-note {
          text-align: center;
          margin-top: 20px;
          font-size: 11px;
          color: rgba(255, 255, 255, 0.25);
        }

        .signup-footer {
          padding: 24px;
          padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .signup-footer-company {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.2);
        }

        .signup-footer-tagline {
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          background: linear-gradient(90deg,
            rgba(255, 107, 53, 0.6) 0%,
            rgba(255, 200, 150, 1) 25%,
            rgba(255, 107, 53, 0.6) 50%,
            rgba(255, 200, 150, 1) 75%,
            rgba(255, 107, 53, 0.6) 100%
          );
          background-size: 200% 100%;
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          animation: taglineShimmer 3s ease-in-out infinite;
          filter: drop-shadow(0 0 10px rgba(255, 107, 53, 0.4));
        }

        @keyframes taglineShimmer {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .field-group {
          margin-bottom: 16px;
        }

        .otp-verify-section {
          text-align: center;
          margin-bottom: 16px;
        }

        .otp-verify-section p {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 16px;
        }

        .otp-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 12px;
        }

        .otp-change-number {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.4);
          cursor: pointer;
          font-size: 13px;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          font-family: inherit;
        }

        .otp-change-number:hover {
          color: #FF6B35;
        }
      `}</style>

      <div className="signup-container">
        <div className="signup-bg">
          <Image
            src="/icons/signup.png"
            alt="Background"
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
          <div className="signup-bg-overlay" />
          <div className="signup-ambient" />
        </div>

        <div className="signup-content">
          <header className="signup-header">
            <AnimatedLogo size="small" href="/" />
            <Link href="/login" className="signup-header-link">
              Already have an account?
              <span className="signup-header-btn">Log in</span>
            </Link>
          </header>

          <main className="signup-main">
            <motion.div
              className="signup-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="signup-title">Create Account</h1>
              <p className="signup-subtitle">Join the community</p>

              {error && (
                <motion.div
                  className="signup-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  id={errorId}
                >
                  {error}
                </motion.div>
              )}

              <div className="signup-oauth" style={{ marginBottom: '0', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  type="button"
                  onClick={() => handleOAuthSignup('apple')}
                  disabled={loading || oauthLoading !== null}
                  className="signup-oauth-btn"
                  style={{
                    background: '#000',
                    color: '#fff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    fontWeight: 500,
                    width: '100%',
                  }}
                >
                  <AppleIcon />
                  {oauthLoading === 'apple' ? 'Signing up...' : 'Sign up with Apple'}
                </button>
                <button
                  type="button"
                  onClick={() => handleOAuthSignup('google')}
                  disabled={loading || oauthLoading !== null}
                  className="signup-oauth-btn"
                  style={{
                    background: '#fff',
                    color: '#333',
                    border: '1px solid rgba(0, 0, 0, 0.1)',
                    fontWeight: 500,
                    width: '100%',
                  }}
                >
                  <GoogleIcon />
                  {oauthLoading === 'google' ? 'Signing up...' : 'Sign up with Google'}
                </button>
              </div>

              <div className="signup-divider">
                <div className="signup-divider-line" />
                <span className="signup-divider-text">or continue with email</span>
                <div className="signup-divider-line" />
              </div>

              <form onSubmit={handleSubmit} aria-describedby={error ? errorId : undefined}>
                <div className="field-group">
                  <label htmlFor={emailId} className="signup-label">
                    Email address <span className="signup-label-required">*</span>
                  </label>
                  <input
                    id={emailId}
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="signup-input"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor={passwordId} className="signup-label">
                    Password <span className="signup-label-required">*</span>
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
                    className="signup-input"
                  />
                  <p className="signup-hint">Must include uppercase, lowercase, and number</p>
                </div>

                <div className="field-group">
                  <label htmlFor={confirmPasswordId} className="signup-label">
                    Confirm Password <span className="signup-label-required">*</span>
                  </label>
                  <input
                    id={confirmPasswordId}
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="signup-input"
                  />
                </div>

                <div className="field-group">
                  <label htmlFor={dobId} className="signup-label">
                    Date of Birth <span className="signup-label-required">*</span>
                  </label>
                  <input
                    id={dobId}
                    type="date"
                    value={dob}
                    onChange={(e) => setDob(e.target.value)}
                    required
                    className="signup-input"
                    style={{ colorScheme: 'dark' }}
                  />
                  <p className="signup-hint">You must be 18+ on the day of sign up. No exceptions.</p>
                </div>

                <div className="field-group" style={{ marginBottom: '24px' }}>
                  <label htmlFor={termsId} className="signup-checkbox-wrap">
                    <span className="signup-checkbox-container">
                      <input
                        id={termsId}
                        type="checkbox"
                        checked={agreed}
                        onChange={(e) => setAgreed(e.target.checked)}
                        required
                        className="signup-checkbox"
                      />
                    </span>
                    <span className="signup-checkbox-text">
                      I am at least 18 years old and agree to the{' '}
                      <Link href="/terms">Terms of Service</Link>,{' '}
                      <Link href="/privacy">Privacy Policy</Link>, and{' '}
                      <Link href="/guidelines">Community Guidelines</Link>
                    </span>
                  </label>
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  className="signup-submit"
                  whileTap={{ scale: 0.98 }}
                >
                  {loading ? 'Creating Account...' : 'Create Account'}
                </motion.button>
              </form>

              <p className="signup-footer-note">
                By signing up, you confirm you are 18 years old or older. Users under 18 are strictly prohibited.
              </p>
            </motion.div>
          </main>

          <footer className="signup-footer">
            <span className="signup-footer-company">© 2025–2026 Primal Men</span>
            <span className="signup-footer-tagline">INTELLIGENT | INNOVATIVE | INTUITIVE</span>
          </footer>
        </div>
      </div>
    </>
  );
}
