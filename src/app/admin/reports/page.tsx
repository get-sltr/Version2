'use client';

import { useEffect, useState } from 'react';

interface CruisingReport {
  id: string;
  update_id: string;
  reporter_id: string;
  reason: string;
  details: string | null;
  status: 'pending' | 'reviewed' | 'actioned' | 'dismissed';
  created_at: string;
  reviewed_at: string | null;
  update_text: string | null;
  update_user_id: string | null;
}

export default function AdminReportsPage() {
  const [reports, setReports] = useState<CruisingReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/reports?status=${filter}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch reports');
      }

      setReports(data.reports || []);
      setError(null);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
      setError(err instanceof Error ? err.message : 'Failed to load reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [filter]);

  const handleAction = async (reportId: string, action: 'reviewed' | 'actioned' | 'dismissed', deletePost = false) => {
    setActionLoading(reportId);
    try {
      const response = await fetch('/api/admin/reports', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reportId, action, deletePost }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update report');
      }

      // Refresh list
      fetchReports();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update report');
    } finally {
      setActionLoading(null);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const getReasonBadge = (reason: string) => {
    const colors: Record<string, string> = {
      spam: '#9C27B0',
      offensive: '#F44336',
      harassment: '#E91E63',
      fake: '#FF9800',
      other: '#607D8B',
    };
    return (
      <span style={{
        background: colors[reason] || '#607D8B',
        color: '#fff',
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'capitalize',
      }}>
        {reason}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      pending: { bg: 'rgba(255, 152, 0, 0.2)', text: '#FF9800' },
      reviewed: { bg: 'rgba(33, 150, 243, 0.2)', text: '#2196F3' },
      actioned: { bg: 'rgba(76, 175, 80, 0.2)', text: '#4CAF50' },
      dismissed: { bg: 'rgba(158, 158, 158, 0.2)', text: '#9E9E9E' },
    };
    const color = colors[status] || colors.pending;
    return (
      <span style={{
        background: color.bg,
        color: color.text,
        padding: '4px 10px',
        borderRadius: '12px',
        fontSize: '11px',
        fontWeight: 600,
        textTransform: 'capitalize',
      }}>
        {status}
      </span>
    );
  };

  return (
    <div>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, margin: 0 }}>Cruising Reports</h1>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setFilter('pending')}
            style={{
              padding: '8px 16px',
              background: filter === 'pending' ? '#FF6B35' : '#222',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            Pending
          </button>
          <button
            onClick={() => setFilter('all')}
            style={{
              padding: '8px 16px',
              background: filter === 'all' ? '#FF6B35' : '#222',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            All Reports
          </button>
        </div>
      </div>

      {loading ? (
        <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
          Loading reports...
        </div>
      ) : error ? (
        <div style={{
          padding: '40px',
          textAlign: 'center',
          color: '#FF3B30',
          background: 'rgba(255, 59, 48, 0.1)',
          borderRadius: '12px',
        }}>
          {error}
          <button
            onClick={fetchReports}
            style={{
              marginTop: '16px',
              padding: '8px 16px',
              background: '#FF6B35',
              border: 'none',
              borderRadius: '8px',
              color: '#fff',
              cursor: 'pointer',
              display: 'block',
              margin: '16px auto 0',
            }}
          >
            Retry
          </button>
        </div>
      ) : reports.length === 0 ? (
        <div style={{
          padding: '60px',
          textAlign: 'center',
          color: '#666',
          background: '#151515',
          borderRadius: '16px',
          border: '1px solid #222',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
            {filter === 'pending' ? 'No pending reports' : 'No reports found'}
          </div>
          <div style={{ fontSize: '14px', color: '#888' }}>
            {filter === 'pending' ? 'All reports have been reviewed' : 'No cruising reports have been submitted yet'}
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {reports.map((report) => (
            <div
              key={report.id}
              style={{
                background: '#151515',
                borderRadius: '16px',
                padding: '20px',
                border: '1px solid #222',
              }}
            >
              {/* Header */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                marginBottom: '16px',
              }}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  {getReasonBadge(report.reason)}
                  {getStatusBadge(report.status)}
                </div>
                <div style={{ color: '#666', fontSize: '12px' }}>
                  {formatTime(report.created_at)}
                </div>
              </div>

              {/* Reported Content */}
              <div style={{
                background: '#1a1a1a',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                borderLeft: '3px solid #FF6B35',
              }}>
                <div style={{ color: '#888', fontSize: '11px', marginBottom: '8px' }}>
                  REPORTED POST
                </div>
                <div style={{ color: '#fff', fontSize: '14px', lineHeight: 1.5 }}>
                  {report.update_text || '[Post deleted]'}
                </div>
                {report.update_user_id && (
                  <div style={{ marginTop: '8px' }}>
                    <a
                      href={`/profile/${report.update_user_id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: '#FF6B35', fontSize: '12px', textDecoration: 'none' }}
                    >
                      View poster profile →
                    </a>
                  </div>
                )}
              </div>

              {/* Report Details */}
              {report.details && (
                <div style={{
                  background: '#1a1a1a',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <div style={{ color: '#888', fontSize: '11px', marginBottom: '8px' }}>
                    ADDITIONAL DETAILS
                  </div>
                  <div style={{ color: '#ccc', fontSize: '13px' }}>
                    {report.details}
                  </div>
                </div>
              )}

              {/* Actions */}
              {report.status === 'pending' && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => handleAction(report.id, 'dismissed')}
                    disabled={actionLoading === report.id}
                    style={{
                      padding: '10px 20px',
                      background: 'transparent',
                      border: '1px solid #444',
                      borderRadius: '8px',
                      color: '#888',
                      cursor: actionLoading === report.id ? 'wait' : 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    Dismiss
                  </button>
                  <button
                    onClick={() => handleAction(report.id, 'reviewed')}
                    disabled={actionLoading === report.id}
                    style={{
                      padding: '10px 20px',
                      background: '#2196F3',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: actionLoading === report.id ? 'wait' : 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    Mark Reviewed
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('This will delete the reported post. Continue?')) {
                        handleAction(report.id, 'actioned', true);
                      }
                    }}
                    disabled={actionLoading === report.id}
                    style={{
                      padding: '10px 20px',
                      background: '#F44336',
                      border: 'none',
                      borderRadius: '8px',
                      color: '#fff',
                      cursor: actionLoading === report.id ? 'wait' : 'pointer',
                      fontSize: '13px',
                      fontWeight: 500,
                    }}
                  >
                    Remove Post
                  </button>
                </div>
              )}

              {/* Reviewed info */}
              {report.reviewed_at && (
                <div style={{
                  marginTop: '12px',
                  padding: '12px',
                  background: 'rgba(255,255,255,0.02)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: '#666',
                }}>
                  Reviewed on {formatTime(report.reviewed_at)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
