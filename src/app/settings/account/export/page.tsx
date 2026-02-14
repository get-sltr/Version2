'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import { useTheme } from '@/contexts/ThemeContext';
import { IconBack, IconDownload, IconCheck, IconClock } from '@/components/Icons';

export default function ExportDataPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [loading, setLoading] = useState(false);
  const [exportStatus, setExportStatus] = useState<'idle' | 'processing' | 'ready' | 'error'>('idle');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lastExport, setLastExport] = useState<string | null>(null);
  const [canExport, setCanExport] = useState(true);

  useEffect(() => {
    checkLastExport();
  }, []);

  const checkLastExport = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('last_data_export')
        .eq('user_id', user.id)
        .single();

      if (settings?.last_data_export) {
        const lastExportDate = new Date(settings.last_data_export);
        const hoursSinceExport = (Date.now() - lastExportDate.getTime()) / (1000 * 60 * 60);

        setLastExport(settings.last_data_export);

        // Rate limit: 1 export per 24 hours
        if (hoursSinceExport < 24) {
          setCanExport(false);
        }
      }
    } catch (err) {
      console.error('Error checking last export:', err);
    }
  };

  const requestExport = async () => {
    if (!canExport) {
      setError('You can only request a data export once every 24 hours.');
      return;
    }

    setLoading(true);
    setError(null);
    setExportStatus('processing');

    try {
      const response = await fetch('/api/account/export', {
        method: 'POST',
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 429) {
          setError('Export rate limit exceeded. Please try again in 24 hours.');
          setExportStatus('error');
        } else {
          setError(data.error || 'Failed to generate export');
          setExportStatus('error');
        }
        return;
      }

      if (data.downloadUrl) {
        setDownloadUrl(data.downloadUrl);
        setExportStatus('ready');
        setLastExport(new Date().toISOString());
        setCanExport(false);
      } else {
        setError('Export generated but no download URL provided');
        setExportStatus('error');
      }

    } catch (err) {
      console.error('Export error:', err);
      setError('An error occurred while generating your export');
      setExportStatus('error');
    } finally {
      setLoading(false);
    }
  };

  const dataIncluded = [
    'Profile information (name, bio, photos)',
    'Messages and conversations',
    'Taps sent and received',
    'Favorites and blocked users',
    'Profile views',
    'Settings and preferences',
    'Activity history',
  ];

  const formatLastExport = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
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
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Export Your Data</span>
        <span style={{ width: '40px' }} />
      </header>

      <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
        {/* Idle State */}
        {exportStatus === 'idle' && (
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
                background: 'rgba(255, 107, 53, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '20px',
              }}>
                <IconDownload size={40} />
              </div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px' }}>
                Download Your Data
              </h1>
              <p style={{ fontSize: '15px', color: colors.textSecondary, margin: 0, lineHeight: 1.6 }}>
                Request a copy of all your personal data stored on Primal. Your export will be ready within a few minutes.
              </p>
            </div>

            <div style={{
              background: colors.surface,
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '24px',
            }}>
              <h3 style={{ fontSize: '16px', fontWeight: 600, margin: '0 0 16px' }}>
                Data included in export:
              </h3>
              <ul style={{ margin: 0, padding: '0 0 0 20px', listStyle: 'disc' }}>
                {dataIncluded.map((item, index) => (
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

            {lastExport && (
              <div style={{
                padding: '16px',
                background: colors.surface,
                borderRadius: '12px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}>
                <IconClock size={20} />
                <div>
                  <p style={{ fontSize: '13px', color: colors.textSecondary, margin: 0 }}>
                    Last export
                  </p>
                  <p style={{ fontSize: '14px', fontWeight: 500, margin: '4px 0 0' }}>
                    {formatLastExport(lastExport)}
                  </p>
                </div>
              </div>
            )}

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
              onClick={requestExport}
              disabled={!canExport || loading}
              style={{
                width: '100%',
                padding: '16px',
                background: canExport ? '#FF6B35' : colors.surface,
                border: 'none',
                borderRadius: '12px',
                color: canExport ? '#fff' : colors.textSecondary,
                fontSize: '16px',
                fontWeight: 600,
                cursor: canExport ? 'pointer' : 'not-allowed',
                opacity: canExport ? 1 : 0.6,
              }}
            >
              {canExport ? 'Request Data Export' : 'Export available in 24 hours'}
            </button>

            <p style={{
              fontSize: '12px',
              color: colors.textSecondary,
              textAlign: 'center',
              marginTop: '16px',
            }}>
              Downloads are available for 24 hours after generation.
            </p>
          </motion.div>
        )}

        {/* Processing State */}
        {exportStatus === 'processing' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center' }}
          >
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: 'rgba(255, 107, 53, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid rgba(255, 107, 53, 0.3)',
                  borderTopColor: '#FF6B35',
                  borderRadius: '50%',
                }}
              />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px' }}>
              Generating Export
            </h1>
            <p style={{ fontSize: '15px', color: colors.textSecondary, margin: 0 }}>
              Please wait while we prepare your data...
            </p>
          </motion.div>
        )}

        {/* Ready State */}
        {exportStatus === 'ready' && downloadUrl && (
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
              <IconCheck size={40} />
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px' }}>
              Export Ready
            </h1>
            <p style={{ fontSize: '15px', color: colors.textSecondary, marginBottom: '32px' }}>
              Your data export has been generated and is ready for download.
            </p>

            <a
              href={downloadUrl}
              download="primal-data-export.json"
              style={{
                display: 'block',
                width: '100%',
                padding: '16px',
                background: '#4CAF50',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                textAlign: 'center',
                textDecoration: 'none',
                marginBottom: '12px',
              }}
            >
              Download Export
            </a>

            <p style={{
              fontSize: '12px',
              color: colors.textSecondary,
              marginTop: '16px',
            }}>
              This download link expires in 24 hours.
            </p>
          </motion.div>
        )}

        {/* Error State */}
        {exportStatus === 'error' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            style={{ textAlign: 'center' }}
          >
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
              <span style={{ fontSize: '40px' }}>!</span>
            </div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, margin: '0 0 12px' }}>
              Export Failed
            </h1>
            <p style={{ fontSize: '15px', color: colors.textSecondary, marginBottom: '24px' }}>
              {error || 'An error occurred while generating your export.'}
            </p>

            <button
              onClick={() => {
                setExportStatus('idle');
                setError(null);
              }}
              style={{
                width: '100%',
                padding: '16px',
                background: '#FF6B35',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Try Again
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
