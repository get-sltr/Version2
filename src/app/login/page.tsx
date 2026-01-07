'use client';

import { motion } from 'framer-motion';
import { useState, useId } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import posthog from 'posthog-js';

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
    <svg width="20" height="20" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'twitter' | 'facebook' | null>(null);

  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
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

  const handleOAuthLogin = async (provider: 'google' | 'twitter' | 'facebook') => {
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
      const errorMessage = err instanceof Error ? err.message : 'OAuth login failed';
      setError(errorMessage);
      setOauthLoading(null);
    }
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
          src="/icons/signin.webp"
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
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
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
            href="/signup"
            style={{
              fontSize: '13px',
              color: '#FF6B35',
              textDecoration: 'none',
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            Sign up
          </Link>
        </header>

        {/* Main Form */}
        <main
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px 24px',
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              width: '100%',
              maxWidth: '400px',
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
              Welcome Back
            </h1>
            <p
              style={{
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.5)',
                textAlign: 'center',
                marginBottom: '40px',
              }}
            >
              Log in to continue
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
              <div style={{ marginBottom: '20px' }}>
                <label
                  htmlFor={emailId}
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 500,
                    marginBottom: '8px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
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
                  aria-required="true"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    fontSize: '15px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    color: '#FFFFFF',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FF6B35';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ marginBottom: '8px' }}>
                <label
                  htmlFor={passwordId}
                  style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: 500,
                    marginBottom: '8px',
                    color: 'rgba(255, 255, 255, 0.7)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
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
                  aria-required="true"
                  style={{
                    width: '100%',
                    padding: '16px 20px',
                    fontSize: '15px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '8px',
                    boxSizing: 'border-box',
                    outline: 'none',
                    color: '#FFFFFF',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = '#FF6B35';
                    e.target.style.boxShadow = '0 0 0 3px rgba(255, 107, 53, 0.1)';
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    e.target.style.boxShadow = 'none';
                  }}
                />
              </div>

              <div style={{ textAlign: 'right', marginBottom: '24px' }}>
                <Link
                  href="/forgot-password"
                  style={{
                    fontSize: '13px',
                    color: 'rgba(255, 255, 255, 0.5)',
                    textDecoration: 'none',
                  }}
                >
                  Forgot password?
                </Link>
              </div>

              <motion.button
                type="submit"
                disabled={loading || oauthLoading !== null}
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
                  cursor: loading || oauthLoading !== null ? 'not-allowed' : 'pointer',
                  opacity: loading || oauthLoading !== null ? 0.6 : 1,
                  outline: 'none',
                  boxShadow: '0 0 30px rgba(255, 107, 53, 0.4)',
                  transition: 'box-shadow 0.2s',
                }}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </motion.button>
            </form>

            {/* OAuth Divider */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                margin: '28px 0',
                gap: '16px',
              }}
            >
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
              <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                or continue with
              </span>
              <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.15)' }} />
            </div>

            {/* OAuth Buttons */}
            <div style={{ display: 'flex', gap: '12px' }}>
              <motion.button
                type="button"
                onClick={() => handleOAuthLogin('google')}
                disabled={loading || oauthLoading !== null}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '50px',
                  cursor: oauthLoading !== null ? 'not-allowed' : 'pointer',
                  opacity: oauthLoading !== null ? 0.6 : 1,
                  outline: 'none',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                <GoogleIcon />
                {oauthLoading === 'google' ? '...' : 'Google'}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => handleOAuthLogin('twitter')}
                disabled={loading || oauthLoading !== null}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '50px',
                  cursor: oauthLoading !== null ? 'not-allowed' : 'pointer',
                  opacity: oauthLoading !== null ? 0.6 : 1,
                  outline: 'none',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                <TwitterIcon />
                {oauthLoading === 'twitter' ? '...' : 'X'}
              </motion.button>

              <motion.button
                type="button"
                onClick={() => handleOAuthLogin('facebook')}
                disabled={loading || oauthLoading !== null}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  padding: '14px 16px',
                  fontSize: '13px',
                  fontWeight: 500,
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#FFFFFF',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '50px',
                  cursor: oauthLoading !== null ? 'not-allowed' : 'pointer',
                  opacity: oauthLoading !== null ? 0.6 : 1,
                  outline: 'none',
                  transition: 'background 0.2s, border-color 0.2s',
                }}
              >
                <FacebookIcon />
                {oauthLoading === 'facebook' ? '...' : 'Facebook'}
              </motion.button>
            </div>

            <p
              style={{
                marginTop: '32px',
                textAlign: 'center',
                fontSize: '14px',
                color: 'rgba(255, 255, 255, 0.5)',
              }}
            >
              Don't have an account?{' '}
              <Link
                href="/signup"
                style={{
                  color: '#FF6B35',
                  textDecoration: 'none',
                  fontWeight: 600,
                }}
              >
                Sign up
              </Link>
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
