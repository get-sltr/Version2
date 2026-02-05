'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Position, Tribe } from '@/types/database';
import posthog from 'posthog-js';

const POSITIONS: { value: Position; label: string; emoji: string }[] = [
  { value: 'top', label: 'Top', emoji: '🔝' },
  { value: 'vers-top', label: 'Vers Top', emoji: '↗️' },
  { value: 'versatile', label: 'Versatile', emoji: '↔️' },
  { value: 'vers-bottom', label: 'Vers Bottom', emoji: '↘️' },
  { value: 'bottom', label: 'Bottom', emoji: '🔻' },
  { value: 'side', label: 'Side', emoji: '➡️' },
];

const TRIBES: { value: Tribe; label: string }[] = [
  { value: 'bear', label: 'Bear' },
  { value: 'twink', label: 'Twink' },
  { value: 'jock', label: 'Jock' },
  { value: 'otter', label: 'Otter' },
  { value: 'daddy', label: 'Daddy' },
  { value: 'leather', label: 'Leather' },
  { value: 'clean-cut', label: 'Clean-Cut' },
  { value: 'geek', label: 'Geek' },
  { value: 'rugged', label: 'Rugged' },
  { value: 'pup', label: 'Pup' },
  { value: 'trans', label: 'Trans' },
  { value: 'queer', label: 'Queer' },
  { value: 'discreet', label: 'Discreet' },
  { value: 'military', label: 'Military' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  // Phone verification state
  const [phone, setPhone] = useState('');
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [otpSent, setOtpSent] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Form data
  const [displayName, setDisplayName] = useState('');
  const [position, setPosition] = useState<Position | null>(null);
  const [selectedTribes, setSelectedTribes] = useState<Tribe[]>([]);
  const [bio, setBio] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      setUserId(user.id);

      // Check if profile is already complete (has phone verified and display_name)
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, position, tribes, bio, phone')
        .eq('id', user.id)
        .single();

      // If profile has essential info AND phone, skip to dashboard
      if (profile?.display_name && profile?.position && profile?.phone) {
        router.push('/dashboard');
        return;
      }

      // If phone is already verified, skip to step 2
      if (profile?.phone) {
        setPhoneVerified(true);
        setStep(2);
      }

      // Pre-fill any existing data
      if (profile) {
        if (profile.display_name) setDisplayName(profile.display_name);
        if (profile.position) setPosition(profile.position as Position);
        if (profile.tribes) setSelectedTribes(profile.tribes as Tribe[]);
        if (profile.bio) setBio(profile.bio);
      }

      setLoading(false);
    };

    checkAuth();
  }, [router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX
    if (digits.length <= 3) {
      return digits;
    } else if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    } else {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhoneNumber(e.target.value);
    setPhone(formatted);
    setPhoneError('');
  };

  const getE164Phone = () => {
    // Convert formatted phone to E.164 format (+1XXXXXXXXXX)
    const digits = phone.replace(/\D/g, '');
    return `+1${digits}`;
  };

  const handleSendOtp = async () => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setPhoneError('Please enter a valid 10-digit phone number');
      return;
    }

    setSendingOtp(true);
    setPhoneError('');

    try {
      const e164Phone = getE164Phone();
      const { error } = await supabase.auth.signInWithOtp({
        phone: e164Phone,
      });

      if (error) throw error;

      setOtpSent(true);
      setResendCooldown(60);

      // Focus first OTP input
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);

      posthog.capture('phone_otp_sent', { phone_country: 'US' });
    } catch (error) {
      console.error('Error sending OTP:', error);
      setPhoneError(error instanceof Error ? error.message : 'Failed to send verification code');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    // Only allow digits
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otpCode];
    newOtp[index] = value;
    setOtpCode(newOtp);
    setPhoneError('');

    // Auto-focus next input
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits entered
    if (value && index === 5 && newOtp.every(d => d !== '')) {
      handleVerifyOtp(newOtp.join(''));
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpCode[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtpCode(newOtp);
      handleVerifyOtp(pastedData);
    }
  };

  const handleVerifyOtp = async (code?: string) => {
    const otpToVerify = code || otpCode.join('');
    if (otpToVerify.length !== 6) {
      setPhoneError('Please enter the 6-digit code');
      return;
    }

    setVerifyingOtp(true);
    setPhoneError('');

    try {
      const e164Phone = getE164Phone();
      const { error } = await supabase.auth.verifyOtp({
        phone: e164Phone,
        token: otpToVerify,
        type: 'sms',
      });

      if (error) throw error;

      // Update profile with phone number
      if (userId) {
        await supabase
          .from('profiles')
          .upsert({
            id: userId,
            phone: e164Phone,
          });
      }

      setPhoneVerified(true);
      posthog.capture('phone_verified', { phone_country: 'US' });

      // Move to next step
      setStep(2);
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setPhoneError(error instanceof Error ? error.message : 'Invalid verification code');
      setOtpCode(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setVerifyingOtp(false);
    }
  };

  const toggleTribe = (tribe: Tribe) => {
    if (selectedTribes.includes(tribe)) {
      setSelectedTribes(selectedTribes.filter(t => t !== tribe));
    } else if (selectedTribes.length < 5) {
      setSelectedTribes([...selectedTribes, tribe]);
    }
  };

  const handleNext = () => {
    if (step === 1 && !phoneVerified) {
      return;
    }
    if (step === 2 && !displayName.trim()) {
      return;
    }
    if (step === 3 && !position) {
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    // Can't go back from phone verification
    if (step > 2 || (step === 2 && phoneVerified)) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    if (!userId) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          display_name: displayName.trim(),
          position,
          tribes: selectedTribes,
          bio: bio.trim() || null,
        });

      if (error) throw error;

      // Capture onboarding completed event in PostHog
      posthog.capture('onboarding_completed', {
        display_name: displayName.trim(),
        position: position,
        tribes: selectedTribes,
        has_bio: !!bio.trim(),
        phone_verified: true,
      });

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
      }}>
        Loading...
      </div>
    );
  }

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Progress Bar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '4px',
        background: '#222',
        zIndex: 100,
      }}>
        <div style={{
          width: `${progress}%`,
          height: '100%',
          background: 'linear-gradient(90deg, #FF6B35, #ff8c5a)',
          transition: 'width 0.3s',
        }} />
      </div>

      {/* Header */}
      <div style={{
        padding: '60px 20px 20px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontFamily: "'Audiowide', sans-serif",
          fontSize: '28px',
          fontWeight: 700,
          letterSpacing: '0.15em',
          marginBottom: '8px',
          background: 'linear-gradient(90deg, #a8b5c9 0%, #ffffff 50%, #a8b5c9 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}>
          PRIMAL
        </h1>
        <p style={{ color: '#666', fontSize: '13px' }}>
          Step {step} of {totalSteps}
        </p>
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '500px',
        margin: '0 auto',
        padding: '20px',
      }}>
        {/* Step 1: Phone Verification */}
        {step === 1 && (
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '12px',
              textAlign: 'center',
            }}>
              Verify Your Phone
            </h2>
            <p style={{
              color: '#888',
              textAlign: 'center',
              marginBottom: '40px',
              fontSize: '15px',
            }}>
              We need to verify your phone number to keep Primal safe
            </p>

            {!otpSent ? (
              <>
                {/* Phone Input */}
                <div style={{ marginBottom: '24px' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '11px',
                    fontWeight: 600,
                    marginBottom: '8px',
                    color: '#666',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}>
                    Phone Number (US)
                  </label>
                  <div style={{
                    display: 'flex',
                    gap: '12px',
                    alignItems: 'center',
                  }}>
                    <div style={{
                      padding: '18px 16px',
                      background: '#151515',
                      border: '2px solid #333',
                      borderRadius: '12px',
                      color: '#888',
                      fontSize: '18px',
                      fontWeight: 500,
                    }}>
                      +1
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={handlePhoneChange}
                      placeholder="(555) 123-4567"
                      maxLength={14}
                      autoFocus
                      style={{
                        flex: 1,
                        background: '#151515',
                        border: '2px solid #333',
                        borderRadius: '12px',
                        padding: '18px 20px',
                        fontSize: '18px',
                        color: '#fff',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#FF6B35'}
                      onBlur={(e) => e.target.style.borderColor = '#333'}
                    />
                  </div>
                </div>

                {phoneError && (
                  <p style={{
                    color: '#ff6b6b',
                    fontSize: '14px',
                    textAlign: 'center',
                    marginBottom: '20px',
                  }}>
                    {phoneError}
                  </p>
                )}

                <button
                  onClick={handleSendOtp}
                  disabled={sendingOtp || phone.replace(/\D/g, '').length !== 10}
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: sendingOtp || phone.replace(/\D/g, '').length !== 10
                      ? '#333'
                      : 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: sendingOtp || phone.replace(/\D/g, '').length !== 10
                      ? 'not-allowed'
                      : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {sendingOtp ? 'Sending...' : 'Send Verification Code'}
                </button>
              </>
            ) : (
              <>
                {/* OTP Input */}
                <p style={{
                  color: '#888',
                  fontSize: '14px',
                  textAlign: 'center',
                  marginBottom: '24px',
                }}>
                  Enter the 6-digit code sent to {phone}
                </p>

                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '8px',
                  marginBottom: '24px',
                }}>
                  {otpCode.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => { otpInputRefs.current[index] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(index, e)}
                      onPaste={index === 0 ? handleOtpPaste : undefined}
                      aria-label={`Digit ${index + 1} of verification code`}
                      title={`Digit ${index + 1}`}
                      style={{
                        width: '48px',
                        height: '56px',
                        background: '#151515',
                        border: `2px solid ${digit ? '#FF6B35' : '#333'}`,
                        borderRadius: '12px',
                        fontSize: '24px',
                        fontWeight: 700,
                        color: '#fff',
                        textAlign: 'center',
                        outline: 'none',
                        transition: 'border-color 0.2s',
                      }}
                    />
                  ))}
                </div>

                {phoneError && (
                  <p style={{
                    color: '#ff6b6b',
                    fontSize: '14px',
                    textAlign: 'center',
                    marginBottom: '20px',
                  }}>
                    {phoneError}
                  </p>
                )}

                <button
                  onClick={() => handleVerifyOtp()}
                  disabled={verifyingOtp || otpCode.some(d => d === '')}
                  style={{
                    width: '100%',
                    padding: '18px',
                    background: verifyingOtp || otpCode.some(d => d === '')
                      ? '#333'
                      : 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: verifyingOtp || otpCode.some(d => d === '')
                      ? 'not-allowed'
                      : 'pointer',
                    marginBottom: '16px',
                  }}
                >
                  {verifyingOtp ? 'Verifying...' : 'Verify Code'}
                </button>

                <button
                  onClick={() => {
                    setOtpSent(false);
                    setOtpCode(['', '', '', '', '', '']);
                    setPhoneError('');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'none',
                    border: 'none',
                    color: '#666',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Change phone number
                </button>

                <button
                  onClick={handleSendOtp}
                  disabled={resendCooldown > 0 || sendingOtp}
                  style={{
                    width: '100%',
                    padding: '12px',
                    background: 'none',
                    border: 'none',
                    color: resendCooldown > 0 ? '#444' : '#FF6B35',
                    fontSize: '14px',
                    cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  {resendCooldown > 0
                    ? `Resend code in ${resendCooldown}s`
                    : "Didn't receive code? Resend"}
                </button>
              </>
            )}
          </div>
        )}

        {/* Step 2: Display Name */}
        {step === 2 && (
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '12px',
              textAlign: 'center',
            }}>
              What should we call you?
            </h2>
            <p style={{
              color: '#888',
              textAlign: 'center',
              marginBottom: '40px',
              fontSize: '15px',
            }}>
              Choose a display name for your profile
            </p>

            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Enter your name"
              maxLength={50}
              autoFocus
              style={{
                width: '100%',
                background: '#151515',
                border: '2px solid #333',
                borderRadius: '12px',
                padding: '18px 20px',
                fontSize: '18px',
                color: '#fff',
                outline: 'none',
                textAlign: 'center',
                transition: 'border-color 0.2s',
              }}
              onFocus={(e) => e.target.style.borderColor = '#FF6B35'}
              onBlur={(e) => e.target.style.borderColor = '#333'}
            />
            <p style={{
              textAlign: 'center',
              color: '#666',
              fontSize: '12px',
              marginTop: '12px',
            }}>
              {displayName.length}/50 characters
            </p>
          </div>
        )}

        {/* Step 3: Position */}
        {step === 3 && (
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '12px',
              textAlign: 'center',
            }}>
              What&apos;s your position?
            </h2>
            <p style={{
              color: '#888',
              textAlign: 'center',
              marginBottom: '40px',
              fontSize: '15px',
            }}>
              Let others know what you&apos;re into
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
            }}>
              {POSITIONS.map((pos) => (
                <button
                  key={pos.value}
                  onClick={() => setPosition(pos.value)}
                  style={{
                    background: position === pos.value
                      ? 'linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(255,107,53,0.05) 100%)'
                      : '#151515',
                    border: `2px solid ${position === pos.value ? '#FF6B35' : '#333'}`,
                    borderRadius: '12px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: '28px', display: 'block', marginBottom: '8px' }}>
                    {pos.emoji}
                  </span>
                  <span style={{
                    color: position === pos.value ? '#FF6B35' : '#fff',
                    fontSize: '16px',
                    fontWeight: 600,
                  }}>
                    {pos.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Tribes & Bio */}
        {step === 4 && (
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '12px',
              textAlign: 'center',
            }}>
              Almost done!
            </h2>
            <p style={{
              color: '#888',
              textAlign: 'center',
              marginBottom: '32px',
              fontSize: '15px',
            }}>
              Add some finishing touches
            </p>

            {/* Tribes */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '12px',
                color: '#888',
              }}>
                Select your tribes (up to 5)
              </label>
              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '8px',
              }}>
                {TRIBES.map((tribe) => {
                  const selected = selectedTribes.includes(tribe.value);
                  return (
                    <button
                      key={tribe.value}
                      onClick={() => toggleTribe(tribe.value)}
                      style={{
                        background: selected ? '#FF6B35' : '#222',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '8px 16px',
                        color: selected ? '#fff' : '#888',
                        fontSize: '13px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {tribe.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: 600,
                marginBottom: '12px',
                color: '#888',
              }}>
                Bio (optional)
              </label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell others about yourself..."
                maxLength={500}
                style={{
                  width: '100%',
                  height: '120px',
                  background: '#151515',
                  border: '2px solid #333',
                  borderRadius: '12px',
                  padding: '16px',
                  fontSize: '15px',
                  color: '#fff',
                  outline: 'none',
                  resize: 'none',
                  transition: 'border-color 0.2s',
                }}
                onFocus={(e) => e.target.style.borderColor = '#FF6B35'}
                onBlur={(e) => e.target.style.borderColor = '#333'}
              />
              <p style={{
                textAlign: 'right',
                color: '#666',
                fontSize: '12px',
                marginTop: '8px',
              }}>
                {bio.length}/500
              </p>
            </div>
          </div>
        )}

        {/* Navigation */}
        {step > 1 && (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginTop: '40px',
          }}>
            {step > 2 && (
              <button
                onClick={handleBack}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: '#222',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Back
              </button>
            )}
            {step < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={(step === 2 && !displayName.trim()) || (step === 3 && !position)}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: ((step === 2 && !displayName.trim()) || (step === 3 && !position))
                    ? '#333'
                    : 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: ((step === 2 && !displayName.trim()) || (step === 3 && !position))
                    ? 'not-allowed'
                    : 'pointer',
                }}
              >
                Continue
              </button>
            ) : (
              <button
                onClick={handleFinish}
                disabled={saving}
                style={{
                  flex: 1,
                  padding: '16px',
                  background: saving
                    ? '#333'
                    : 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: saving ? 'not-allowed' : 'pointer',
                }}
              >
                {saving ? 'Saving...' : 'Get Started'}
              </button>
            )}
          </div>
        )}

        {/* Skip option - only for steps 2-3, NOT for phone verification */}
        {step > 1 && step < totalSteps && (
          <button
            onClick={() => router.push('/dashboard')}
            style={{
              width: '100%',
              marginTop: '16px',
              padding: '12px',
              background: 'none',
              border: 'none',
              color: '#666',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            Skip for now
          </button>
        )}
      </div>
    </div>
  );
}
