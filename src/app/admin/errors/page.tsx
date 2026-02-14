'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { isFounder } from '@/lib/admin';

interface AppError {
  id: string;
  timestamp: string;
  level: 'error' | 'warning' | 'info';
  source: string;
  message: string;
  stack?: string;
  userId?: string;
  userEmail?: string;
  metadata?: Record<string, unknown>;
  request?: {
    method?: string;
    url?: string;
    userAgent?: string;
    ip?: string;
  };
}

interface ErrorStats {
  total: number;
  byLevel: {
    error: number;
    warning: number;
    info: number;
  };
  last24Hours: number;
  lastHour: number;
}

interface ErrorData {
  errors: AppError[];
  stats: ErrorStats;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export default function AdminErrorsPage() {
  const [data, setData] = useState<ErrorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedError, setSelectedError] = useState<AppError | null>(null);
  const [levelFilter, setLevelFilter] = useState<string>('');
  const [isUserFounder, setIsUserFounder] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setIsUserFounder(isFounder(user?.email));
    });
  }, []);

  const fetchErrors = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(levelFilter && { level: levelFilter }),
      });

      const response = await fetch(`/api/admin/errors?${params}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to fetch errors');
      }

      setData(result);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load errors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrors();
  }, [levelFilter]);

  const clearAllErrors = async () => {
    if (!confirm('Are you sure you want to clear ALL error logs? This cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch('/api/admin/errors', { method: 'DELETE' });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to clear errors');
      }

      fetchErrors();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to clear errors');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return '#FF3B30';
      case 'warning':
        return '#FF9500';
      case 'info':
        return '#2196F3';
      default:
        return '#888';
    }
  };

  const getLevelBg = (level: string) => {
    switch (level) {
      case 'error':
        return 'rgba(255, 59, 48, 0.15)';
      case 'warning':
        return 'rgba(255, 149, 0, 0.15)';
      case 'info':
        return 'rgba(33, 150, 243, 0.15)';
      default:
        return 'rgba(136, 136, 136, 0.15)';
    }
  };

  if (loading && !data) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
        Loading error logs...
      </div>
    );
  }

  if (error && !data) {
    return (
      <div style={{
        padding: '40px',
        textAlign: 'center',
        color: '#FF3B30',
        background: 'rgba(255, 59, 48, 0.1)',
        borderRadius: '12px',
      }}>
        {error}
      </div>
    );
  }

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Error Logs</h1>
        {isUserFounder && data && data.stats.total > 0 && (
          <button
            onClick={clearAllErrors}
            style={{
              background: 'rgba(255, 59, 48, 0.1)',
              border: '1px solid rgba(255, 59, 48, 0.3)',
              borderRadius: '8px',
              padding: '8px 16px',
              color: '#FF3B30',
              cursor: 'pointer',
              fontSize: '13px',
            }}
          >
            Clear All Logs
          </button>
        )}
      </div>

      {/* Stats */}
      {data && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '12px',
          marginBottom: '24px',
        }}>
          <div style={{
            background: '#151515',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #222',
          }}>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Total</div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{data.stats.total}</div>
          </div>
          <div style={{
            background: '#151515',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #222',
          }}>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Last Hour</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: data.stats.lastHour > 0 ? '#FF3B30' : '#4CAF50' }}>
              {data.stats.lastHour}
            </div>
          </div>
          <div style={{
            background: '#151515',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #222',
          }}>
            <div style={{ color: '#FF3B30', fontSize: '12px', marginBottom: '4px' }}>Errors</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#FF3B30' }}>
              {data.stats.byLevel.error}
            </div>
          </div>
          <div style={{
            background: '#151515',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid #222',
          }}>
            <div style={{ color: '#FF9500', fontSize: '12px', marginBottom: '4px' }}>Warnings</div>
            <div style={{ fontSize: '24px', fontWeight: 700, color: '#FF9500' }}>
              {data.stats.byLevel.warning}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{
        display: 'flex',
        gap: '12px',
        marginBottom: '16px',
      }}>
        <select
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
          style={{
            background: '#151515',
            border: '1px solid #333',
            borderRadius: '8px',
            padding: '8px 16px',
            color: '#fff',
            fontSize: '14px',
            cursor: 'pointer',
          }}
        >
          <option value="">All Levels</option>
          <option value="error">Errors Only</option>
          <option value="warning">Warnings Only</option>
          <option value="info">Info Only</option>
        </select>
        <button
          onClick={() => fetchErrors()}
          style={{
            background: '#333',
            border: 'none',
            borderRadius: '8px',
            padding: '8px 16px',
            color: '#fff',
            cursor: 'pointer',
          }}
        >
          Refresh
        </button>
      </div>

      {/* Error List */}
      {data && (
        <div style={{
          background: '#151515',
          borderRadius: '16px',
          border: '1px solid #222',
          overflow: 'hidden',
        }}>
          {data.errors.length === 0 ? (
            <div style={{
              padding: '60px 40px',
              textAlign: 'center',
              color: '#666',
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
              <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No errors!</div>
              <div style={{ fontSize: '14px' }}>Everything is running smoothly</div>
            </div>
          ) : (
            <div>
              {data.errors.map((err) => (
                <div
                  key={err.id}
                  style={{
                    padding: '16px 20px',
                    borderBottom: '1px solid #222',
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onClick={() => setSelectedError(err)}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#1a1a1a'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                  }}>
                    <span style={{
                      background: getLevelBg(err.level),
                      color: getLevelColor(err.level),
                      padding: '3px 8px',
                      borderRadius: '6px',
                      fontSize: '10px',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      flexShrink: 0,
                    }}>
                      {err.level}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        marginBottom: '4px',
                        color: getLevelColor(err.level),
                      }}>
                        {err.source}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        color: '#ccc',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {err.message}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '11px',
                      color: '#666',
                      flexShrink: 0,
                    }}>
                      {formatTime(err.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {data && data.pagination.totalPages > 1 && (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          marginTop: '24px',
        }}>
          <button
            onClick={() => fetchErrors(data.pagination.page - 1)}
            disabled={data.pagination.page <= 1}
            style={{
              background: '#222',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              color: data.pagination.page <= 1 ? '#555' : '#fff',
              cursor: data.pagination.page <= 1 ? 'not-allowed' : 'pointer',
            }}
          >
            Previous
          </button>
          <span style={{ padding: '8px 16px', color: '#888' }}>
            Page {data.pagination.page} of {data.pagination.totalPages}
          </span>
          <button
            onClick={() => fetchErrors(data.pagination.page + 1)}
            disabled={data.pagination.page >= data.pagination.totalPages}
            style={{
              background: '#222',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              color: data.pagination.page >= data.pagination.totalPages ? '#555' : '#fff',
              cursor: data.pagination.page >= data.pagination.totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            Next
          </button>
        </div>
      )}

      {/* Error Detail Modal */}
      {selectedError && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px',
          }}
          onClick={() => setSelectedError(null)}
        >
          <div
            style={{
              background: '#151515',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '600px',
              maxHeight: '80vh',
              overflow: 'auto',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '20px',
            }}>
              <span style={{
                background: getLevelBg(selectedError.level),
                color: getLevelColor(selectedError.level),
                padding: '4px 10px',
                borderRadius: '6px',
                fontSize: '11px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}>
                {selectedError.level}
              </span>
              <span style={{ fontSize: '14px', color: '#888' }}>
                {formatTime(selectedError.timestamp)}
              </span>
            </div>

            <h3 style={{ fontSize: '16px', marginBottom: '12px', color: getLevelColor(selectedError.level) }}>
              {selectedError.source}
            </h3>

            <div style={{
              background: '#1a1a1a',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>Message</div>
              <div style={{ fontSize: '14px', wordBreak: 'break-word' }}>{selectedError.message}</div>
            </div>

            {selectedError.stack && (
              <div style={{
                background: '#1a1a1a',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Stack Trace</div>
                <pre style={{
                  fontSize: '11px',
                  fontFamily: 'monospace',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-all',
                  color: '#FF3B30',
                  margin: 0,
                }}>
                  {selectedError.stack}
                </pre>
              </div>
            )}

            {selectedError.request && (
              <div style={{
                background: '#1a1a1a',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '8px' }}>Request Info</div>
                <div style={{ fontSize: '12px' }}>
                  {selectedError.request.method && (
                    <div><strong>Method:</strong> {selectedError.request.method}</div>
                  )}
                  {selectedError.request.url && (
                    <div style={{ wordBreak: 'break-all' }}><strong>URL:</strong> {selectedError.request.url}</div>
                  )}
                  {selectedError.request.ip && (
                    <div><strong>IP:</strong> {selectedError.request.ip}</div>
                  )}
                </div>
              </div>
            )}

            {selectedError.userId && (
              <div style={{
                background: '#1a1a1a',
                borderRadius: '8px',
                padding: '16px',
                marginBottom: '16px',
              }}>
                <div style={{ fontSize: '13px', color: '#888', marginBottom: '4px' }}>User</div>
                <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                  {selectedError.userEmail || selectedError.userId}
                </div>
              </div>
            )}

            <div style={{
              background: '#1a1a1a',
              borderRadius: '8px',
              padding: '12px',
              marginBottom: '20px',
            }}>
              <div style={{ fontSize: '11px', color: '#666', fontFamily: 'monospace' }}>
                ID: {selectedError.id}
              </div>
            </div>

            <button
              onClick={() => setSelectedError(null)}
              style={{
                width: '100%',
                background: '#333',
                border: 'none',
                borderRadius: '8px',
                padding: '12px',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
