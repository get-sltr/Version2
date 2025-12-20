'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AccountSettingsPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [showEmailEdit, setShowEmailEdit] = useState(false);
  const [showPhoneEdit, setShowPhoneEdit] = useState(false);
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  useEffect(() => {
    // Load user data from localStorage
    const savedEmail = localStorage.getItem('userEmail') || 'user@example.com';
    const savedPhone = localStorage.getItem('userPhone') || '+1 (555) 123-4567';
    setEmail(savedEmail);
    setPhone(savedPhone);
    setNewEmail(savedEmail);
    setNewPhone(savedPhone);
  }, []);

  const handleEmailUpdate = () => {
    if (newEmail && newEmail !== email) {
      localStorage.setItem('userEmail', newEmail);
      setEmail(newEmail);
      setShowEmailEdit(false);
      alert('Email updated successfully! A verification email has been sent.');
    }
  };

  const handlePhoneUpdate = () => {
    if (newPhone && newPhone !== phone) {
      localStorage.setItem('userPhone', newPhone);
      setPhone(newPhone);
      setShowPhoneEdit(false);
      alert('Phone number updated successfully! A verification code has been sent.');
    }
  };

  const handlePasswordChange = () => {
    if (!currentPassword) {
      alert('Please enter your current password');
      return;
    }
    if (newPassword.length < 8) {
      alert('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    // Mock password change
    localStorage.setItem('lastPasswordChange', new Date().toISOString());
    setShowPasswordChange(false);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    alert('Password changed successfully!');
  };

  const handleDeleteAccount = () => {
    if (deleteConfirmText.toLowerCase() === 'delete') {
      // Mock account deletion
      localStorage.clear();
      alert('Your account has been permanently deleted.');
      router.push('/');
    } else {
      alert('Please type "DELETE" to confirm account deletion');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif",
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        background: '#000',
        borderBottom: '1px solid #333',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        zIndex: 10
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            fontSize: '16px',
            cursor: 'pointer',
            padding: 0
          }}
        >
          ← Back
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
          Account Settings
        </h1>
      </div>

      <div style={{ padding: '20px' }}>
        {/* Email Section */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #333'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: showEmailEdit ? '16px' : 0
          }}>
            <div>
              <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '4px' }}>Email</div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>{email}</div>
              <div style={{ fontSize: '12px', color: '#4CAF50', marginTop: '4px' }}>✓ Verified</div>
            </div>
            <button
              onClick={() => setShowEmailEdit(!showEmailEdit)}
              style={{
                background: showEmailEdit ? '#333' : 'rgba(255,107,53,0.1)',
                border: showEmailEdit ? '1px solid #555' : '1px solid rgba(255,107,53,0.3)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: showEmailEdit ? '#fff' : '#FF6B35',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {showEmailEdit ? 'Cancel' : 'Change'}
            </button>
          </div>

          {showEmailEdit && (
            <div>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="Enter new email"
                style={{
                  width: '100%',
                  background: '#2c2c2e',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  marginBottom: '12px'
                }}
              />
              <button
                onClick={handleEmailUpdate}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Update Email
              </button>
            </div>
          )}
        </div>

        {/* Phone Section */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #333'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: showPhoneEdit ? '16px' : 0
          }}>
            <div>
              <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '4px' }}>Phone Number</div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>{phone}</div>
              <div style={{ fontSize: '12px', color: '#4CAF50', marginTop: '4px' }}>✓ Verified</div>
            </div>
            <button
              onClick={() => setShowPhoneEdit(!showPhoneEdit)}
              style={{
                background: showPhoneEdit ? '#333' : 'rgba(255,107,53,0.1)',
                border: showPhoneEdit ? '1px solid #555' : '1px solid rgba(255,107,53,0.3)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: showPhoneEdit ? '#fff' : '#FF6B35',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {showPhoneEdit ? 'Cancel' : 'Change'}
            </button>
          </div>

          {showPhoneEdit && (
            <div>
              <input
                type="tel"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="Enter new phone number"
                style={{
                  width: '100%',
                  background: '#2c2c2e',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  marginBottom: '12px'
                }}
              />
              <button
                onClick={handlePhoneUpdate}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Update Phone
              </button>
            </div>
          )}
        </div>

        {/* Password Section */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #333'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: showPasswordChange ? '16px' : 0
          }}>
            <div>
              <div style={{ fontSize: '14px', color: '#aaa', marginBottom: '4px' }}>Password</div>
              <div style={{ fontSize: '16px', fontWeight: 600 }}>••••••••</div>
              <div style={{ fontSize: '12px', color: '#aaa', marginTop: '4px' }}>Last changed 30 days ago</div>
            </div>
            <button
              onClick={() => setShowPasswordChange(!showPasswordChange)}
              style={{
                background: showPasswordChange ? '#333' : 'rgba(255,107,53,0.1)',
                border: showPasswordChange ? '1px solid #555' : '1px solid rgba(255,107,53,0.3)',
                borderRadius: '8px',
                padding: '8px 16px',
                color: showPasswordChange ? '#fff' : '#FF6B35',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              {showPasswordChange ? 'Cancel' : 'Change'}
            </button>
          </div>

          {showPasswordChange && (
            <div>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current password"
                style={{
                  width: '100%',
                  background: '#2c2c2e',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  marginBottom: '12px'
                }}
              />
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New password (min 8 characters)"
                style={{
                  width: '100%',
                  background: '#2c2c2e',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  marginBottom: '12px'
                }}
              />
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                style={{
                  width: '100%',
                  background: '#2c2c2e',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  marginBottom: '12px'
                }}
              />
              <button
                onClick={handlePasswordChange}
                style={{
                  width: '100%',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer'
                }}
              >
                Change Password
              </button>
            </div>
          )}
        </div>

        {/* Connected Accounts */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #333'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Connected Accounts
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              background: '#2c2c2e',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>🍎</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Apple</div>
                  <div style={{ fontSize: '12px', color: '#4CAF50' }}>Connected</div>
                </div>
              </div>
              <button style={{
                background: '#333',
                border: '1px solid #555',
                borderRadius: '6px',
                padding: '6px 12px',
                color: '#fff',
                fontSize: '12px',
                cursor: 'pointer'
              }}>
                Disconnect
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              background: '#2c2c2e',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>🔵</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Google</div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>Not connected</div>
                </div>
              </div>
              <button style={{
                background: 'rgba(255,107,53,0.1)',
                border: '1px solid rgba(255,107,53,0.3)',
                borderRadius: '6px',
                padding: '6px 12px',
                color: '#FF6B35',
                fontSize: '12px',
                cursor: 'pointer'
              }}>
                Connect
              </button>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px',
              background: '#2c2c2e',
              borderRadius: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ fontSize: '24px' }}>📘</div>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 600 }}>Facebook</div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>Not connected</div>
                </div>
              </div>
              <button style={{
                background: 'rgba(255,107,53,0.1)',
                border: '1px solid rgba(255,107,53,0.3)',
                borderRadius: '6px',
                padding: '6px 12px',
                color: '#FF6B35',
                fontSize: '12px',
                cursor: 'pointer'
              }}>
                Connect
              </button>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #333'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                Two-Factor Authentication
              </div>
              <div style={{ fontSize: '13px', color: '#aaa' }}>
                Add an extra layer of security to your account
              </div>
            </div>
            <div style={{
              width: '44px',
              height: '24px',
              background: '#4CAF50',
              borderRadius: '12px',
              position: 'relative',
              cursor: 'pointer'
            }}>
              <div style={{
                width: '20px',
                height: '20px',
                background: '#fff',
                borderRadius: '50%',
                position: 'absolute',
                top: '2px',
                right: '2px'
              }} />
            </div>
          </div>
        </div>

        {/* Data & Privacy */}
        <div style={{
          background: '#1c1c1e',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
          border: '1px solid #333'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>
            Data & Privacy
          </h3>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={() => alert('Downloading your data...')}
              style={{
                width: '100%',
                background: '#2c2c2e',
                border: '1px solid #444',
                borderRadius: '8px',
                padding: '14px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>📥 Download My Data</span>
              <span style={{ color: '#aaa' }}>→</span>
            </button>

            <button
              onClick={() => router.push('/settings/privacy')}
              style={{
                width: '100%',
                background: '#2c2c2e',
                border: '1px solid #444',
                borderRadius: '8px',
                padding: '14px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>🔒 Privacy Settings</span>
              <span style={{ color: '#aaa' }}>→</span>
            </button>

            <button
              onClick={() => alert('Opening cookie preferences...')}
              style={{
                width: '100%',
                background: '#2c2c2e',
                border: '1px solid #444',
                borderRadius: '8px',
                padding: '14px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                textAlign: 'left',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>🍪 Cookie Preferences</span>
              <span style={{ color: '#aaa' }}>→</span>
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{
          background: 'rgba(244,67,54,0.1)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(244,67,54,0.3)'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: '#f44336' }}>
            Danger Zone
          </h3>
          <p style={{ fontSize: '13px', color: '#aaa', marginBottom: '16px' }}>
            Once you delete your account, there is no going back. Please be certain.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                width: '100%',
                background: 'rgba(244,67,54,0.2)',
                border: '1px solid rgba(244,67,54,0.5)',
                borderRadius: '8px',
                padding: '12px',
                color: '#f44336',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Delete Account
            </button>
          ) : (
            <div>
              <p style={{ fontSize: '13px', color: '#f44336', marginBottom: '12px' }}>
                Type <strong>DELETE</strong> to confirm account deletion:
              </p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                placeholder="Type DELETE"
                style={{
                  width: '100%',
                  background: '#2c2c2e',
                  border: '1px solid rgba(244,67,54,0.5)',
                  borderRadius: '8px',
                  padding: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  marginBottom: '12px'
                }}
              />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false);
                    setDeleteConfirmText('');
                  }}
                  style={{
                    flex: 1,
                    background: '#333',
                    border: '1px solid #555',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteAccount}
                  style={{
                    flex: 1,
                    background: '#f44336',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '12px',
                    color: '#fff',
                    fontSize: '14px',
                    fontWeight: 700,
                    cursor: 'pointer'
                  }}
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
