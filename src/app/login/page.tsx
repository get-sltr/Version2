'use client';

import { motion } from 'framer-motion';
import { useState, useId } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { supabase } from '../../lib/supabase';
import posthog from 'posthog-js';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
                {loading ? 'Logging in...' : 'Log In'}
              </motion.button>
            </form>

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
