'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { IconBack, IconReport, IconTrash } from '@/components/Icons';

export default function DeleteAccountPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [step, setStep] = useState<'warning' | 'confirm' | 'processing' | 'scheduled'>('warning');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletionDate, setDeletionDate] = useState<string | null>(null);

  const consequences = [
    'Your profile and all photos will be permanently deleted',
    'All your messages and conversation history will be erased',
    'Your favorites, taps, and views will be removed',
    'Any active subscriptions will be cancelled (no refund)',
    'This action cannot be undone after 24 hours',
  ];

  const handleConfirmDelete = async () => {
    setError(null);
    setLoading(true);

    try {
      // First verify password by re-authenticating
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) {
        setError('Unable to verify account. Please try again.');
        return;
      }

      // Re-authenticate with password
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (signInError) {
        setError('Incorrect password. Please try again.');
        return;
      }

      // Call the delete account API
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ confirm: true }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to schedule account deletion');
        return;
      }

      setDeletionDate(data.deletionDate);
      setStep('scheduled');

    } catch (err) {
      console.error('Delete account error:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/account/delete', {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        router.push('/settings');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to cancel deletion');
      }
    } catch (err) {
      setError('Failed to cancel deletion');
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
                We're sorry to see you go. Before you proceed, please understand what happens when you delete your account.
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

            <div style={{
              background: 'rgba(255, 193, 7, 0.1)',
              border: '1px solid rgba(255, 193, 7, 0.3)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '32px',
            }}>
              <p style={{ fontSize: '14px', margin: 0, color: '#FFC107' }}>
                <strong>24-hour grace period:</strong> After requesting deletion, you have 24 hours to change your mind. Log back in to cancel.
              </p>
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
                Enter your password to confirm account deletion
              </p>
            </div>

            <div style={{ marginBottom: '24px' }}>
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
              disabled={!password || loading}
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
                opacity: !password ? 0.5 : 1,
                marginBottom: '12px',
              }}
            >
              {loading ? 'Processing...' : 'Delete My Account'}
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

        {/* Scheduled Step */}
        {step === 'scheduled' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center' }}
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
            }}>
              <IconTrash size={40} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px' }}>
              Deletion Scheduled
            </h1>
            <p style={{ fontSize: '15px', color: colors.textSecondary, marginBottom: '24px', lineHeight: 1.6 }}>
              Your account has been scheduled for deletion. It will be permanently deleted on:
            </p>
            <div style={{
              padding: '20px',
              background: colors.surface,
              borderRadius: '12px',
              marginBottom: '24px',
            }}>
              <p style={{ fontSize: '20px', fontWeight: 600, margin: 0, color: colors.text }}>
                {deletionDate ? new Date(deletionDate).toLocaleString() : '24 hours from now'}
              </p>
            </div>
            <p style={{ fontSize: '14px', color: colors.textSecondary, marginBottom: '32px' }}>
              Changed your mind? You can cancel the deletion within the next 24 hours by logging back in.
            </p>

            <button
              onClick={handleCancelDeletion}
              disabled={loading}
              style={{
                width: '100%',
                padding: '16px',
                background: '#4CAF50',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                cursor: loading ? 'wait' : 'pointer',
                marginBottom: '12px',
              }}
            >
              {loading ? 'Cancelling...' : 'Cancel Deletion'}
            </button>

            <button
              onClick={() => supabase.auth.signOut().then(() => router.push('/login'))}
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
              Sign Out
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
