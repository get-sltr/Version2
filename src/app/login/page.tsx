'use client';

import { motion } from 'framer-motion';
import { useState, useId } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
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


export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'apple' | null>(null);

  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!ageConfirmed) {
      setError('You must confirm you are at least 18 years old');
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        posthog.identify(data.user.id, {
          email: email,
        });
        posthog.capture('user_logged_in', {
          email: email,
          source: 'login_page',
        });
      }

      window.location.href = '/dashboard';
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid email or password';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthLogin = async (provider: 'apple') => {
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
      const errorMessage = err instanceof Error ? err.message : 'Sign in with Apple failed';
      setError(errorMessage);
      setOauthLoading(null);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800;900&display=swap');

        .login-container {
          min-height: 100vh;
          background: #0a0a0f;
          color: #fff;
          font-family: 'DM Sans', -apple-system, sans-serif;
          position: relative;
          overflow-x: hidden;
        }

        .login-bg {
          position: fixed;
          inset: 0;
          z-index: 1;
        }

        .login-bg-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(10,10,15,0.8) 0%, rgba(10,10,15,0.55) 50%, rgba(10,10,15,0.8) 100%);
        }

        .login-ambient {
          position: absolute;
          top: 15%;
          left: 50%;
          transform: translateX(-50%);
          width: 700px;
          height: 700px;
          background: radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, rgba(200, 220, 255, 0.03) 40%, transparent 70%);
          pointer-events: none;
        }

        .login-content {
          position: relative;
          z-index: 10;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .login-header {
          padding: 20px 32px;
          padding-top: calc(env(safe-area-inset-top, 0px) + 20px);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .login-header-btn {
          font-size: 14px;
          color: #FF6B35;
          font-weight: 600;
          text-decoration: none;
          padding: 12px 20px;
          min-height: 44px;
          border: 1px solid rgba(255, 107, 53, 0.3);
          border-radius: 8px;
          background: rgba(255, 107, 53, 0.05);
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
        }

        .login-header-btn:hover {
          background: rgba(255, 107, 53, 0.15);
          border-color: rgba(255, 107, 53, 0.5);
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.2);
        }

        .login-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px 24px;
        }

        .login-card {
          width: 100%;
          max-width: 420px;
          background: rgba(255, 255, 255, 0.02);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border-radius: 20px;
          border: 1px solid rgba(255, 255, 255, 0.06);
          padding: 40px 32px;
          box-shadow:
            0 25px 50px rgba(0, 0, 0, 0.5),
            inset 0 1px 0 rgba(255, 255, 255, 0.05),
            inset 0 -1px 0 rgba(0, 0, 0, 0.2);
        }

        .login-title {
          font-family: 'Orbitron', sans-serif;
          font-size: 28px;
          font-weight: 600;
          margin-bottom: 8px;
          text-align: center;
          background: linear-gradient(135deg, #ffffff 0%, #FF6B35 50%, #ffffff 100%);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          filter: drop-shadow(0 0 20px rgba(255, 107, 53, 0.3));
        }

        .login-subtitle {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.4);
          text-align: center;
          margin-bottom: 32px;
        }

        .login-error {
          background: rgba(255, 80, 80, 0.1);
          backdrop-filter: blur(10px);
          color: #ff8888;
          padding: 16px;
          margin-bottom: 24px;
          font-size: 14px;
          border-left: 3px solid rgba(255, 80, 80, 0.5);
          border-radius: 8px;
        }

        .login-label {
          display: block;
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 8px;
          color: rgba(255, 255, 255, 0.5);
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .login-input {
          width: 100%;
          padding: 16px 20px;
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

        .login-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .login-input:focus {
          border-color: rgba(255, 107, 53, 0.5);
          background: rgba(255, 255, 255, 0.05);
          box-shadow:
            0 0 20px rgba(255, 107, 53, 0.15),
            inset 0 1px 0 rgba(255, 255, 255, 0.05);
        }

        .login-forgot {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          text-decoration: none;
          transition: all 0.3s ease;
        }

        .login-forgot:hover {
          color: #FF6B35;
          text-shadow: 0 0 10px rgba(255, 107, 53, 0.4);
        }

        /* Glass Card Button - Log In */
        .login-submit {
          width: 100%;
          padding: 18px;
          font-family: 'Orbitron', sans-serif;
          font-size: 14px;
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

        .login-submit::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 107, 53, 0.2), transparent);
          animation: submitShine 3s ease-in-out infinite;
        }

        .login-submit:hover:not(:disabled) {
          background: rgba(255, 107, 53, 0.2);
          border-color: rgba(255, 107, 53, 0.6);
          color: #fff;
          box-shadow:
            0 0 40px rgba(255, 107, 53, 0.4),
            0 0 80px rgba(255, 107, 53, 0.2),
            inset 0 1px 0 rgba(255, 200, 150, 0.2);
          text-shadow: 0 0 20px rgba(255, 107, 53, 0.8);
        }

        .login-submit:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        @keyframes submitShine {
          0% { left: -100%; }
          50%, 100% { left: 150%; }
        }

        .login-divider {
          display: flex;
          align-items: center;
          margin: 28px 0;
          gap: 16px;
        }

        .login-divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255, 107, 53, 0.2), transparent);
        }

        .login-divider-text {
          font-size: 11px;
          color: rgba(255, 255, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .login-oauth {
          display: flex;
          gap: 12px;
        }

        .login-oauth-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 14px 16px;
          min-height: 44px;
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

        .login-oauth-btn:hover:not(:disabled) {
          background: rgba(255, 255, 255, 0.05);
          border-color: rgba(255, 255, 255, 0.15);
          color: #fff;
        }

        .login-oauth-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .login-signup-link {
          margin-top: 28px;
          text-align: center;
          font-size: 14px;
          color: rgba(255, 255, 255, 0.4);
        }

        .login-signup-link a {
          color: #FF6B35;
          text-decoration: none;
          font-weight: 600;
          transition: all 0.3s ease;
        }

        .login-signup-link a:hover {
          text-shadow: 0 0 15px rgba(255, 107, 53, 0.5);
        }

        .login-footer {
          padding: 24px;
          padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 24px);
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }

        .login-footer-company {
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.15em;
          color: rgba(255, 255, 255, 0.2);
        }

        .login-footer-tagline {
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
          margin-bottom: 20px;
        }


        .otp-section {
          text-align: center;
          margin-bottom: 20px;
        }

        .otp-section p {
          font-size: 13px;
          color: rgba(255, 255, 255, 0.4);
          margin-bottom: 20px;
        }

        .otp-actions {
          display: flex;
          justify-content: center;
          gap: 16px;
          margin-top: 16px;
          font-size: 13px;
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

      <div className="login-container">
        <div className="login-bg">
          <Image
            src="/icons/signin.webp"
            alt="Background"
            fill
            priority
            style={{ objectFit: 'cover', objectPosition: 'center' }}
          />
          <div className="login-bg-overlay" />
          <div className="login-ambient" />
        </div>

        <div className="login-content">
          <header className="login-header">
            <AnimatedLogo size="small" href="/" />
            <Link href="/signup" className="login-header-btn">
              Sign up
            </Link>
          </header>

          <main className="login-main">
            <motion.div
              className="login-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="login-title">Welcome Back</h1>
              <p className="login-subtitle">Log in to continue</p>

              {error && (
                <motion.div
                  className="login-error"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  role="alert"
                  id={errorId}
                >
                  {error}
                </motion.div>
              )}

              <form onSubmit={handleSubmit} aria-describedby={error ? errorId : undefined}>
                  <div className="field-group">
                    <label htmlFor={emailId} className="login-label">
                      Email address
                    </label>
                    <input
                      id={emailId}
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                      className="login-input"
                    />
                  </div>

                  <div className="field-group" style={{ marginBottom: '8px' }}>
                    <label htmlFor={passwordId} className="login-label">
                      Password
                    </label>
                    <input
                      id={passwordId}
                      type="password"
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete="current-password"
                      className="login-input"
                    />
                  </div>

                  <div style={{ textAlign: 'right', marginBottom: '16px' }}>
                    <Link href="/forgot-password" className="login-forgot">
                      Forgot password?
                    </Link>
                  </div>

                  <label style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    marginBottom: '20px',
                    cursor: 'pointer',
                    fontSize: '13px',
                    color: 'rgba(255,255,255,0.7)',
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 44, height: 44, flexShrink: 0 }}>
                      <input
                        type="checkbox"
                        checked={ageConfirmed}
                        onChange={(e) => setAgeConfirmed(e.target.checked)}
                        style={{
                          width: '20px',
                          height: '20px',
                          accentColor: '#FF6B35',
                        }}
                      />
                    </span>
                    I confirm I am at least 18 years old
                  </label>

                  <motion.button
                    type="submit"
                    disabled={loading || oauthLoading !== null}
                    className="login-submit"
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? 'Logging in...' : 'Log In'}
                  </motion.button>
                </form>

              <div className="login-divider">
                <div className="login-divider-line" />
                <span className="login-divider-text">or continue with</span>
                <div className="login-divider-line" />
              </div>

              <div className="login-oauth">
                <button
                  type="button"
                  onClick={() => handleOAuthLogin('apple')}
                  disabled={loading || oauthLoading !== null}
                  className="login-oauth-btn"
                  style={{ background: 'rgba(255, 255, 255, 0.05)' }}
                >
                  <AppleIcon />
                  {oauthLoading === 'apple' ? '...' : 'Sign in with Apple'}
                </button>
              </div>

              <p className="login-signup-link">
                Don't have an account? <Link href="/signup">Sign up</Link>
              </p>
            </motion.div>
          </main>

          <footer className="login-footer">
            <span className="login-footer-company">© 2025–2026 Primal</span>
            <span className="login-footer-tagline">INTELLIGENT | INNOVATIVE | INTUITIVE</span>
          </footer>
        </div>
      </div>
    </>
  );
}
