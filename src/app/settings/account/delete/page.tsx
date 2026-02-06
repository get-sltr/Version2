'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { IconBack, IconReport, IconTrash } from '@/components/Icons';

export default function DeleteAccountPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [step, setStep] = useState<'warning' | 'confirm' | 'processing' | 'done'>('warning');
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [isOAuth, setIsOAuth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Detect if user signed in with OAuth (Google/Apple) — no password to verify
  useEffect(() => {
    const checkAuthMethod = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const provider = user.app_metadata?.provider;
        setIsOAuth(provider !== 'email' && provider !== undefined);
      }
    };
    checkAuthMethod();
  }, []);

  const consequences = [
    'Your profile and all photos will be permanently deleted',
    'All your messages and conversation history will be erased',
    'Your favorites, taps, and views will be removed',
    'Any active subscriptions will be cancelled (no refund)',
    'This action cannot be undone',
  ];

  const handleConfirmDelete = async () => {
    setError(null);
    setLoading(true);

    try {
      if (isOAuth) {
        // OAuth users: confirm by typing DELETE
        if (confirmText !== 'DELETE') {
          setError('Please type DELETE to confirm.');
          setLoading(false);
          return;
        }
      } else {
        // Email/password users: re-authenticate with password
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.email) {
          setError('Unable to verify account. Please try again.');
          setLoading(false);
          return;
        }

        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: user.email,
          password,
        });

        if (signInError) {
          setError('Incorrect password. Please try again.');
          setLoading(false);
          return;
        }
      }

      setStep('processing');

      // Call the delete account API
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ confirm: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to delete account');
        setStep('confirm');
        setLoading(false);
        return;
      }

      setStep('done');

      // Sign out and redirect after a brief moment
      setTimeout(async () => {
        await supabase.auth.signOut();
        router.push('/login');
      }, 2000);

    } catch (err) {
      console.error('Delete account error:', err);
      setError('An error occurred. Please try again.');
      setStep('confirm');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      color: colors.text,
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    }}>
      {/* Header */}
      <header style={{
        padding: '16px 20px',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 16px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: `1px solid ${colors.border}`,
        position: 'sticky',
        top: 0,
        background: colors.background,
        zIndex: 100,
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'transparent',
            border: 'none',
            color: colors.text,
            cursor: 'pointer',
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <IconBack size={24} />
        </button>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Delete Account</span>
        <span style={{ width: '40px' }} />
      </header>

      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        {/* Warning Step */}
        {step === 'warning' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              textAlign: 'center',
              marginBottom: '32px',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(244, 67, 54, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <IconReport size={40} />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px' }}>
                Delete Your Account?
              </h1>
              <p style={{ fontSize: '15px', color: colors.textSecondary, margin: 0, lineHeight: 1.6 }}>
                This will permanently delete your account and all associated data. This action cannot be undone.
              </p>
            </div>

            <div style={{
              background: 'rgba(244, 67, 54, 0.05)',
              border: '1px solid rgba(244, 67, 54, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px', color: '#f44336' }}>
                What will be deleted:
              </h3>
              <ul style={{ margin: 0, padding: '0 0 0 20px', listStyle: 'disc' }}>
                {consequences.map((item, index) => (
                  <li key={index} style={{
                    fontSize: '14px',
                    color: colors.textSecondary,
                    marginBottom: '8px',
                    lineHeight: 1.5,
                  }}>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setStep('confirm')}
              style={{
                width: '100%',
                padding: '16px',
                background: '#f44336',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
                marginBottom: '12px',
              }}
            >
              I understand, continue
            </button>

            <button
              onClick={() => router.back()}
              style={{
                width: '100%',
                padding: '16px',
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                color: colors.text,
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </motion.div>
        )}

        {/* Confirm Step */}
        {step === 'confirm' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'rgba(244, 67, 54, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 20px',
              }}>
                <IconTrash size={40} />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px' }}>
                Confirm Deletion
              </h1>
              <p style={{ fontSize: '15px', color: colors.textSecondary, margin: 0 }}>
                {isOAuth
                  ? 'Type DELETE below to permanently delete your account'
                  : 'Enter your password to confirm account deletion'
                }
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
              {isOAuth ? (
                <>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '8px',
                    color: colors.text,
                  }}>
                    Type <strong style={{ color: '#f44336' }}>DELETE</strong> to confirm
                  </label>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                    placeholder="Type DELETE"
                    autoComplete="off"
                    style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '16px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '12px',
                      background: colors.surface,
                      color: colors.text,
                      outline: 'none',
                      letterSpacing: '2px',
                      textAlign: 'center',
                      fontWeight: 700,
                    }}
                  />
                </>
              ) : (
                <>
                  <label style={{
                    display: 'block',
                    fontSize: '14px',
                    fontWeight: 500,
                    marginBottom: '8px',
                    color: colors.text,
                  }}>
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    style={{
                      width: '100%',
                      padding: '16px',
                      fontSize: '16px',
                      border: `1px solid ${colors.border}`,
                      borderRadius: '12px',
                      background: colors.surface,
                      color: colors.text,
                      outline: 'none',
                    }}
                  />
                </>
              )}
            </div>

            {error && (
              <div style={{
                padding: '12px 16px',
                marginBottom: '24px',
                background: 'rgba(244, 67, 54, 0.1)',
                border: '1px solid rgba(244, 67, 54, 0.3)',
                borderRadius: '8px',
                color: '#f44336',
                fontSize: '14px',
              }}>
                {error}
              </div>
            )}

            <button
              onClick={handleConfirmDelete}
              disabled={isOAuth ? confirmText !== 'DELETE' || loading : !password || loading}
              style={{
                width: '100%',
                padding: '16px',
                background: loading ? 'rgba(244, 67, 54, 0.5)' : '#f44336',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                opacity: (isOAuth ? confirmText !== 'DELETE' : !password) ? 0.5 : 1,
                marginBottom: '12px',
              }}
            >
              {loading ? 'Deleting...' : 'Permanently Delete My Account'}
            </button>

            <button
              onClick={() => setStep('warning')}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: 'transparent',
                border: `1px solid ${colors.border}`,
                borderRadius: '12px',
                color: colors.text,
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Go Back
            </button>
          </motion.div>
        )}

        {/* Processing Step */}
        {step === 'processing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ textAlign: 'center', paddingTop: '60px' }}
          >
            <div style={{
              width: '60px',
              height: '60px',
              border: '3px solid rgba(244, 67, 54, 0.2)',
              borderTop: '3px solid #f44336',
              borderRadius: '50%',
              margin: '0 auto 24px',
              animation: 'spin 1s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            <h2 style={{ fontSize: '20px', fontWeight: 600, margin: '0 0 12px' }}>
              Deleting your account...
            </h2>
            <p style={{ fontSize: '14px', color: colors.textSecondary }}>
              Removing all your data. This may take a moment.
            </p>
          </motion.div>
        )}

        {/* Done Step */}
        {step === 'done' && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            style={{ textAlign: 'center', paddingTop: '60px' }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(76, 175, 80, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
              fontSize: '36px',
            }}>
              &#10003;
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px' }}>
              Account Deleted
            </h1>
            <p style={{ fontSize: '15px', color: colors.textSecondary, lineHeight: 1.6 }}>
              Your account and all associated data have been permanently deleted. You will be redirected shortly.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
