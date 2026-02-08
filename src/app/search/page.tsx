'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { usePremium } from '@/hooks/usePremium';
import { supabase } from '@/lib/supabase';

interface SearchProfile {
  id: string;
  display_name: string;
  photo_url: string | null;
  age: number | null;
  position: string | null;
  tribes: string[] | null;
  is_online: boolean;
}

export default function SearchPage() {
  const router = useRouter();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showPremiumPrompt, setShowPremiumPrompt] = useState(false);
  const [profiles, setProfiles] = useState<SearchProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);

  // Filters
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(80);
  const [distance, setDistance] = useState(30);
  const [position, setPosition] = useState<string[]>([]);
  const [tribes, setTribes] = useState<string[]>([]);
  const [onlineOnly, setOnlineOnly] = useState(false);
  const [withPhotos, setWithPhotos] = useState(false);

  // Fetch real profiles from Supabase
  useEffect(() => {
    const fetchProfiles = async () => {
      setLoadingProfiles(true);
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('id, display_name, photo_url, age, position, tribes, is_online')
          .limit(50);

        if (error) {
          console.error('Error fetching profiles:', error);
        } else {
          setProfiles(data || []);
        }
      } catch (err) {
        console.error('Failed to fetch profiles:', err);
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, []);

  // Track which filter category is active (for free users - only 1 allowed)
  const getActiveFilterType = (): string | null => {
    if (ageMin !== 18 || ageMax !== 80) return 'age';
    if (distance !== 30) return 'distance';
    if (position.length > 0) return 'position';
    if (tribes.length > 0) return 'tribes';
    if (onlineOnly) return 'online';
    if (withPhotos) return 'photos';
    return null;
  };

  const activeFilterType = getActiveFilterType();
  const canUseFilter = (filterType: string) => {
    if (premiumLoading || isPremium) return true;
    if (!activeFilterType) return true;
    return activeFilterType === filterType;
  };

  const handleFilterAttempt = (filterType: string, action: () => void) => {
    if (canUseFilter(filterType)) {
      action();
    } else {
      setShowPremiumPrompt(true);
    }
  };

  const positions = ['Top', 'Bottom', 'Versatile', 'Top Vers', 'Btm Vers', 'Side'];
  const tribeOptions = ['Bear', 'Twink', 'Jock', 'Otter', 'Daddy', 'Leather', 'Poz', 'Discreet', 'Clean Cut'];

  const togglePosition = (pos: string) => {
    setPosition(prev =>
      prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
    );
  };

  const toggleTribe = (tribe: string) => {
    setTribes(prev =>
      prev.includes(tribe) ? prev.filter(t => t !== tribe) : [...prev, tribe]
    );
  };

  const filteredProfiles = profiles.filter(profile => {
    // Search query
    if (searchQuery && !(profile.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Age range
    if (profile.age != null && (profile.age < ageMin || profile.age > ageMax)) return false;
    // Position
    if (position.length > 0 && (!profile.position || !position.includes(profile.position))) return false;
    // Tribes
    if (tribes.length > 0 && (!profile.tribes || !tribes.some(t => profile.tribes!.includes(t)))) return false;
    // Online only
    if (onlineOnly && !profile.is_online) return false;
    // With photos
    if (withPhotos && !profile.photo_url) return false;

    return true;
  });

  const clearFilters = () => {
    setAgeMin(18);
    setAgeMax(80);
    setDistance(30);
    setPosition([]);
    setTribes([]);
    setOnlineOnly(false);
    setWithPhotos(false);
  };

  const activeFilterCount =
    (ageMin !== 18 || ageMax !== 80 ? 1 : 0) +
    (distance !== 30 ? 1 : 0) +
    position.length +
    tribes.length +
    (onlineOnly ? 1 : 0) +
    (withPhotos ? 1 : 0);

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
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
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
          <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0, flex: 1 }}>
            Search
          </h1>
        </div>

        {/* Search Bar */}
        <div style={{ position: 'relative' }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by username..."
            style={{
              width: '100%',
              background: '#1c1c1e',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '12px 16px',
              color: '#fff',
              fontSize: '16px'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: '#666',
                fontSize: '20px',
                cursor: 'pointer',
                padding: 0
              }}
            >
              ×
            </button>
          )}
        </div>

        {/* Filter Button */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            width: '100%',
            marginTop: '12px',
            background: activeFilterCount > 0 ? 'rgba(255,107,53,0.2)' : '#1c1c1e',
            border: activeFilterCount > 0 ? '1px solid rgba(255,107,53,0.5)' : '1px solid #333',
            borderRadius: '12px',
            padding: '12px 16px',
            color: activeFilterCount > 0 ? '#FF6B35' : '#fff',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px'
          }}
        >
          <span>🎛️</span>
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span style={{
              background: '#FF6B35',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '12px',
              color: '#fff'
            }}>
              {activeFilterCount}
            </span>
          )}
        </button>
      </div>

      {/* Filter Panel */}
      {showFilters && (
        <div style={{
          background: '#1c1c1e',
          borderBottom: '1px solid #333',
          padding: '20px',
          maxHeight: '60vh',
          overflowY: 'auto'
        }}>
          {/* Free user warning */}
          {!premiumLoading && !isPremium && (
            <div style={{
              background: 'rgba(255,107,53,0.1)',
              border: '1px solid rgba(255,107,53,0.3)',
              borderRadius: '12px',
              padding: '12px 16px',
              marginBottom: '20px',
              fontSize: '13px',
              color: '#FF6B35'
            }}>
              🔒 Free users can use 1 filter type. <span onClick={() => router.push('/premium')} style={{ textDecoration: 'underline', cursor: 'pointer' }}>Upgrade</span> for unlimited filters.
            </div>
          )}

          {/* Age Range */}
          <div style={{ marginBottom: '24px', opacity: canUseFilter('age') ? 1 : 0.4 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#aaa' }}>
              Age Range: {ageMin} - {ageMax}
              {!canUseFilter('age') && <span style={{ color: '#FF6B35', marginLeft: '8px' }}>🔒</span>}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="range"
                min="18"
                max="80"
                value={ageMin}
                onChange={(e) => handleFilterAttempt('age', () => setAgeMin(Math.min(parseInt(e.target.value), ageMax - 1)))}
                style={{ flex: 1 }}
                disabled={!canUseFilter('age')}
              />
              <input
                type="range"
                min="18"
                max="80"
                value={ageMax}
                onChange={(e) => handleFilterAttempt('age', () => setAgeMax(Math.max(parseInt(e.target.value), ageMin + 1)))}
                style={{ flex: 1 }}
                disabled={!canUseFilter('age')}
              />
            </div>
          </div>

          {/* Distance */}
          <div style={{ marginBottom: '24px', opacity: canUseFilter('distance') ? 1 : 0.4 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#aaa' }}>
              Maximum Distance: {distance} mi
              {!canUseFilter('distance') && <span style={{ color: '#FF6B35', marginLeft: '8px' }}>🔒</span>}
            </div>
            <input
              type="range"
              min="1"
              max="100"
              value={distance}
              onChange={(e) => handleFilterAttempt('distance', () => setDistance(parseInt(e.target.value)))}
              style={{ width: '100%' }}
              disabled={!canUseFilter('distance')}
            />
          </div>

          {/* Position */}
          <div style={{ marginBottom: '24px', opacity: canUseFilter('position') ? 1 : 0.4 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#aaa' }}>
              Position
              {!canUseFilter('position') && <span style={{ color: '#FF6B35', marginLeft: '8px' }}>🔒</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {positions.map(pos => (
                <button
                  key={pos}
                  onClick={() => handleFilterAttempt('position', () => togglePosition(pos))}
                  style={{
                    background: position.includes(pos) ? 'rgba(255,107,53,0.2)' : '#2c2c2e',
                    border: position.includes(pos) ? '1px solid rgba(255,107,53,0.5)' : '1px solid #444',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    color: position.includes(pos) ? '#FF6B35' : '#fff',
                    fontSize: '14px',
                    cursor: canUseFilter('position') ? 'pointer' : 'not-allowed'
                  }}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Tribes */}
          <div style={{ marginBottom: '24px', opacity: canUseFilter('tribes') ? 1 : 0.4 }}>
            <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#aaa' }}>
              Tribes
              {!canUseFilter('tribes') && <span style={{ color: '#FF6B35', marginLeft: '8px' }}>🔒</span>}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {tribeOptions.map(tribe => (
                <button
                  key={tribe}
                  onClick={() => handleFilterAttempt('tribes', () => toggleTribe(tribe))}
                  style={{
                    background: tribes.includes(tribe) ? 'rgba(255,107,53,0.2)' : '#2c2c2e',
                    border: tribes.includes(tribe) ? '1px solid rgba(255,107,53,0.5)' : '1px solid #444',
                    borderRadius: '20px',
                    padding: '8px 16px',
                    color: tribes.includes(tribe) ? '#FF6B35' : '#fff',
                    fontSize: '14px',
                    cursor: canUseFilter('tribes') ? 'pointer' : 'not-allowed'
                  }}
                >
                  {tribe}
                </button>
              ))}
            </div>
          </div>

          {/* Toggles */}
          <div style={{ marginBottom: '24px' }}>
            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              cursor: canUseFilter('online') ? 'pointer' : 'not-allowed',
              opacity: canUseFilter('online') ? 1 : 0.4
            }}>
              <span style={{ fontSize: '15px' }}>
                Online Only
                {!canUseFilter('online') && <span style={{ color: '#FF6B35', marginLeft: '8px' }}>🔒</span>}
              </span>
              <div
                onClick={() => handleFilterAttempt('online', () => setOnlineOnly(!onlineOnly))}
                style={{
                  width: '44px',
                  height: '24px',
                  background: onlineOnly ? '#4CAF50' : '#444',
                  borderRadius: '12px',
                  position: 'relative',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: '#fff',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: onlineOnly ? '22px' : '2px',
                  transition: 'left 0.2s'
                }} />
              </div>
            </label>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 0',
              cursor: canUseFilter('photos') ? 'pointer' : 'not-allowed',
              opacity: canUseFilter('photos') ? 1 : 0.4
            }}>
              <span style={{ fontSize: '15px' }}>
                With Photos Only
                {!canUseFilter('photos') && <span style={{ color: '#FF6B35', marginLeft: '8px' }}>🔒</span>}
              </span>
              <div
                onClick={() => handleFilterAttempt('photos', () => setWithPhotos(!withPhotos))}
                style={{
                  width: '44px',
                  height: '24px',
                  background: withPhotos ? '#4CAF50' : '#444',
                  borderRadius: '12px',
                  position: 'relative',
                  transition: 'background 0.2s'
                }}
              >
                <div style={{
                  width: '20px',
                  height: '20px',
                  background: '#fff',
                  borderRadius: '50%',
                  position: 'absolute',
                  top: '2px',
                  left: withPhotos ? '22px' : '2px',
                  transition: 'left 0.2s'
                }} />
              </div>
            </label>
          </div>

          {/* Filter Actions */}
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={clearFilters}
              style={{
                flex: 1,
                background: '#2c2c2e',
                border: '1px solid #444',
                borderRadius: '12px',
                padding: '12px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Clear All
            </button>
            <button
              onClick={() => setShowFilters(false)}
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                border: 'none',
                borderRadius: '12px',
                padding: '12px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 700,
                cursor: 'pointer'
              }}
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* Results */}
      <div style={{ padding: '20px' }}>
        <div style={{
          fontSize: '14px',
          color: '#aaa',
          marginBottom: '16px'
        }}>
          {loadingProfiles ? 'Loading...' : `${filteredProfiles.length} ${filteredProfiles.length === 1 ? 'result' : 'results'}`}
        </div>

        {loadingProfiles ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '16px' }}>Loading profiles...</div>
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: '#666'
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              No results found
            </div>
            <div style={{ fontSize: '14px' }}>
              Try adjusting your filters
            </div>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: '12px'
          }}>
            {filteredProfiles.map(profile => (
              <div
                key={profile.id}
                onClick={() => router.push(`/profile/${profile.id}`)}
                style={{
                  position: 'relative',
                  aspectRatio: '3/4',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  background: '#1c1c1e'
                }}
              >
                {profile.photo_url ? (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${profile.photo_url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }} />
                ) : (
                  <div style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '40px',
                    color: '#444'
                  }}>
                    👤
                  </div>
                )}

                {/* Online Indicator */}
                {profile.is_online && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '12px',
                    height: '12px',
                    borderRadius: '50%',
                    background: '#4CAF50',
                    border: '2px solid #000'
                  }} />
                )}

                {/* Profile Info */}
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
                  padding: '40px 12px 12px'
                }}>
                  <div style={{
                    fontSize: '14px',
                    fontWeight: 700,
                    marginBottom: '4px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {profile.display_name || 'New User'}
                  </div>
                  <div style={{
                    fontSize: '11px',
                    color: '#aaa',
                    display: 'flex',
                    gap: '6px'
                  }}>
                    {profile.age && <span>{profile.age}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Premium Prompt Modal */}
      {showPremiumPrompt && (
        <div
          onClick={() => setShowPremiumPrompt(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '20px'
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1c1c1e',
              borderRadius: '20px',
              padding: '32px 24px',
              maxWidth: '340px',
              width: '100%',
              textAlign: 'center',
              border: '1px solid rgba(255,107,53,0.3)'
            }}
          >
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔒</div>
            <h3 style={{
              fontSize: '22px',
              fontWeight: 700,
              marginBottom: '12px',
              color: '#fff'
            }}>
              Multiple Filters
            </h3>
            <p style={{
              fontSize: '15px',
              color: '#aaa',
              marginBottom: '24px',
              lineHeight: 1.5
            }}>
              Free users can only use one filter type at a time. Upgrade to Premium for unlimited filters.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => {
                  setShowPremiumPrompt(false);
                  router.push('/premium');
                }}
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(255,107,53,0.4)'
                }}
              >
                Upgrade to Premium
              </button>
              <button
                onClick={() => setShowPremiumPrompt(false)}
                style={{
                  background: 'transparent',
                  border: '1px solid #444',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#aaa',
                  fontSize: '16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
