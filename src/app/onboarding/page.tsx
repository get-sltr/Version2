'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import type { Position, Tribe } from '@/types/database';

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

      // Check if profile is already complete
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, position, tribes, bio')
        .eq('id', user.id)
        .single();

      // If profile has essential info, skip to dashboard
      if (profile?.display_name && profile?.position) {
        router.push('/dashboard');
        return;
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

  const toggleTribe = (tribe: Tribe) => {
    if (selectedTribes.includes(tribe)) {
      setSelectedTribes(selectedTribes.filter(t => t !== tribe));
    } else if (selectedTribes.length < 5) {
      setSelectedTribes([...selectedTribes, tribe]);
    }
  };

  const handleNext = () => {
    if (step === 1 && !displayName.trim()) {
      return;
    }
    if (step === 2 && !position) {
      return;
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
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

  const totalSteps = 3;
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
          fontFamily: "'Cormorant Garamond', serif",
          fontSize: '28px',
          fontWeight: 300,
          letterSpacing: '0.2em',
          marginBottom: '8px',
        }}>
          s l t r
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
        {/* Step 1: Display Name */}
        {step === 1 && (
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

        {/* Step 2: Position */}
        {step === 2 && (
          <div>
            <h2 style={{
              fontSize: '28px',
              fontWeight: 700,
              marginBottom: '12px',
              textAlign: 'center',
            }}>
              What's your position?
            </h2>
            <p style={{
              color: '#888',
              textAlign: 'center',
              marginBottom: '40px',
              fontSize: '15px',
            }}>
              Let others know what you're into
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

        {/* Step 3: Tribes & Bio */}
        {step === 3 && (
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
        <div style={{
          display: 'flex',
          gap: '12px',
          marginTop: '40px',
        }}>
          {step > 1 && (
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
              disabled={(step === 1 && !displayName.trim()) || (step === 2 && !position)}
              style={{
                flex: 1,
                padding: '16px',
                background: ((step === 1 && !displayName.trim()) || (step === 2 && !position))
                  ? '#333'
                  : 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '16px',
                fontWeight: 600,
                cursor: ((step === 1 && !displayName.trim()) || (step === 2 && !position))
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

        {/* Skip option */}
        {step < totalSteps && (
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
