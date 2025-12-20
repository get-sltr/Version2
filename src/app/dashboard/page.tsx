'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { IconSearch, IconMap, IconMenu, IconStar, IconUser, IconCheck, IconEye, IconCrown, IconClose } from '@/components/Icons';
import BottomNav from '@/components/BottomNav';
import ProBadge from '@/components/ProBadge';

export default function Dashboard() {
  const router = useRouter();
  const { colors } = useTheme();
  const [activeFilter, setActiveFilter] = useState('online');
  const [showAd, setShowAd] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showPositionDropdown, setShowPositionDropdown] = useState(false);
  const [selectedPositions, setSelectedPositions] = useState<string[]>([]);
  const [showAgeDropdown, setShowAgeDropdown] = useState(false);
  const [ageDonePressed, setAgeDonePressed] = useState(false);
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [showTribesDropdown, setShowTribesDropdown] = useState(false);
  const [selectedTribes, setSelectedTribes] = useState<string[]>([]);

  const filters = [
    { id: 'online', label: 'Online' },
    { id: 'dtfn', label: 'DTFN', icon: '💦' },
    { id: 'age', label: 'Age', hasDropdown: true },
    { id: 'position', label: 'Position', hasDropdown: true },
    { id: 'tribes', label: 'Tribes', hasDropdown: true },
    { id: 'fresh', label: 'New' },
    { id: 'photos', label: 'Photos' },
  ];

  const positionOptions = [
    { id: 'top', label: 'Top' },
    { id: 'vers-top', label: 'Vers Top' },
    { id: 'versatile', label: 'Versatile' },
    { id: 'vers-bottom', label: 'Vers Bottom' },
    { id: 'bottom', label: 'Bottom' },
    { id: 'side', label: 'Side' }
  ];

  const tribeOptions = [
    { id: 'bear', label: 'Bear' },
    { id: 'twink', label: 'Twink' },
    { id: 'jock', label: 'Jock' },
    { id: 'otter', label: 'Otter' },
    { id: 'daddy', label: 'Daddy' },
    { id: 'leather', label: 'Leather' },
    { id: 'poz', label: 'Poz' },
    { id: 'discreet', label: 'Discreet' },
    { id: 'clean-cut', label: 'Clean-Cut' },
    { id: 'geek', label: 'Geek' },
    { id: 'military', label: 'Military' },
    { id: 'rugged', label: 'Rugged' },
    { id: 'pup', label: 'Pup' },
    { id: 'trans', label: 'Trans' },
    { id: 'queer', label: 'Queer' }
  ];

  useEffect(() => {
    const init = async () => {
      await checkUser();
      await fetchProfiles();
      
      // Subscribe to real-time profile changes for current user
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!authUser) return;

      const subscription = supabase
        .channel(`profile:${authUser.id}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${authUser.id}`
          },
          () => {
            // When current user's profile changes, refresh profiles list
            fetchProfiles();
          }
        )
        .subscribe();

      // Also refresh profiles every 30 seconds as fallback
      const interval = setInterval(fetchProfiles, 30000);

      // Heartbeat - update last_seen every 2 minutes to show as online
      const heartbeat = setInterval(async () => {
        if (authUser) {
          await supabase
            .from('profiles')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', authUser.id);
        }
      }, 2 * 60 * 1000);

      return () => {
        subscription.unsubscribe();
        clearInterval(interval);
        clearInterval(heartbeat);
      };
    };
    
    const cleanup = init();
    return () => {
      cleanup.then(fn => fn?.());
    };
  }, []);

  // Re-fetch when filter changes
  useEffect(() => {
    fetchProfiles();
  }, [activeFilter]);

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Mark user as online
    await supabase
      .from('profiles')
      .update({ is_online: true, last_seen: new Date().toISOString() })
      .eq('id', user.id);
    
    // Get user's profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    setCurrentUser(profile);
  };

  const fetchProfiles = async () => {

    let query = supabase
      .from('profiles')
      .select('*')
      .not('photo_url', 'is', null);  // Only show profiles WITH photos

    // Apply filters based on activeFilter
    if (activeFilter === 'online') {
      // Consider "online" if last_seen within last 5 minutes
      const fiveMinutesAgo = new Date();
      fiveMinutesAgo.setMinutes(fiveMinutesAgo.getMinutes() - 5);
      query = query.gte('last_seen', fiveMinutesAgo.toISOString());
    } else if (activeFilter === 'fresh') {
      // Show profiles created in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query = query.gte('created_at', sevenDaysAgo.toISOString());
    } else if (activeFilter === 'dtfn') {
      // Show only DTFN users (looking for hookups/right now)
      query = query.eq('is_dtfn', true);
    }

    query = query.order('last_seen', { ascending: false }).limit(50);

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching profiles:', error);
    }
    
    if (data) {
      setProfiles(data);
    }
    setLoading(false);
  };

  const getProfileImage = (profile: any, index: number) => {
    // Use photo_url from profile or fallback to placeholder
    if (profile.photo_url) {
      return profile.photo_url;
    }
    // Alternate between 5.jpg and 6.jpg as fallback
    return index % 2 === 0 ? '/images/5.jpg' : '/images/6.jpg';
  };

  const togglePosition = (positionId: string) => {
    setSelectedPositions(prev => {
      if (prev.includes(positionId)) {
        return prev.filter(id => id !== positionId);
      } else {
        return [...prev, positionId];
      }
    });
  };

  const handleFilterClick = (filter: any) => {
    if (filter.id === 'position') {
      setShowPositionDropdown(!showPositionDropdown);
      setShowAgeDropdown(false);
      setShowTribesDropdown(false);
    } else if (filter.id === 'age') {
      setShowAgeDropdown(!showAgeDropdown);
      setShowPositionDropdown(false);
      setShowTribesDropdown(false);
    } else if (filter.id === 'tribes') {
      setShowTribesDropdown(!showTribesDropdown);
      setShowPositionDropdown(false);
      setShowAgeDropdown(false);
    } else {
      setActiveFilter(filter.id);
      setShowPositionDropdown(false);
      setShowAgeDropdown(false);
      setShowTribesDropdown(false);
    }
  };

  const getPositionButtonLabel = () => {
    if (selectedPositions.length === 0) return 'Position';
    if (selectedPositions.length === 1) {
      const pos = positionOptions.find(p => p.id === selectedPositions[0]);
      return pos?.label || 'Position';
    }
    return `Position (${selectedPositions.length})`;
  };

  const getAgeButtonLabel = () => {
    if (ageMin || ageMax) {
      if (ageMin && ageMax) return `Age ${ageMin}-${ageMax}`;
      if (ageMin) return `Age ${ageMin}+`;
      if (ageMax) return `Age ≤${ageMax}`;
    }
    return 'Age';
  };

  const toggleTribe = (tribeId: string) => {
    setSelectedTribes(prev => {
      if (prev.includes(tribeId)) {
        return prev.filter(id => id !== tribeId);
      } else {
        return [...prev, tribeId];
      }
    });
  };

  const getTribesButtonLabel = () => {
    if (selectedTribes.length === 0) return 'Tribes';
    if (selectedTribes.length === 1) {
      const tribe = tribeOptions.find(t => t.id === selectedTribes[0]);
      return tribe?.label || 'Tribes';
    }
    return `Tribes (${selectedTribes.length})`;
  };

  const getFilterButtonLabel = (filter: any) => {
    if (filter.id === 'position') return getPositionButtonLabel();
    if (filter.id === 'age') return getAgeButtonLabel();
    if (filter.id === 'tribes') return getTribesButtonLabel();
    return filter.label;
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: colors.background, color: colors.text, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: colors.background, color: colors.text, fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif", paddingBottom: '80px' }}>
      <header style={{ position: 'sticky', top: 0, background: colors.background, zIndex: 100, padding: '12px 15px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <a href="/settings" style={{ width: '44px', height: '44px', borderRadius: '50%', background: colors.surface, backgroundImage: currentUser?.photo_url ? `url(${currentUser.photo_url})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', flexShrink: 0, border: `2px solid ${colors.surface}`, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', color: colors.text }}>
            {!currentUser?.photo_url && <IconUser size={20} />}
          </a>
          <a href="/search" style={{ flex: 1, background: colors.surface, borderRadius: '10px', padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <span style={{ opacity: 0.5 }}><IconSearch size={16} /></span>
            <span style={{ opacity: 0.5, fontSize: '15px', color: colors.text }}>Explore more profiles</span>
          </a>
          <a href="/map" style={{ width: '44px', height: '44px', borderRadius: '10px', background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', flexShrink: 0, color: colors.text }}>
            <IconMap size={20} />
          </a>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', marginLeft: '-15px', marginRight: '-15px', paddingLeft: '15px', paddingRight: '15px' }}>
          <a href="/settings" style={{ background: colors.surface, border: 'none', borderRadius: '18px', padding: '8px 12px', color: colors.text, fontSize: '14px', flexShrink: 0, textDecoration: 'none', display: 'flex', alignItems: 'center' }}><IconMenu size={16} /></a>
          <button style={{ background: colors.surface, border: 'none', borderRadius: '18px', padding: '8px 12px', color: colors.text, fontSize: '14px', flexShrink: 0, cursor: 'pointer', display: 'flex', alignItems: 'center' }}><IconStar size={16} /></button>
          {filters.map(filter => (
            <button 
              key={filter.id} 
              onClick={() => handleFilterClick(filter)}
              style={{ 
                background: (filter.id === 'position' && selectedPositions.length > 0) || (filter.id === 'age' && (ageMin || ageMax)) || (filter.id === 'tribes' && selectedTribes.length > 0) || activeFilter === filter.id ? '#FF6B35' : 'rgba(255, 107, 53, 0.5)', 
                color: '#fff', 
                border: 'none', 
                borderRadius: '4px', 
                padding: '8px 16px',
                fontSize: '14px',
                fontWeight: '600',
                flexShrink: 0,
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              {filter.icon ? filter.icon + ' ' : ''}{getFilterButtonLabel(filter)}
              {filter.hasDropdown && <span style={{ marginLeft: '4px', fontSize: '10px' }}>▾</span>}
            </button>
          ))}
        </div>

        {/* Age Dropdown */}
        {showAgeDropdown && (
          <div style={{
            position: 'absolute',
            top: '120px',
            left: '15px',
            right: '15px',
            background: 'rgba(5,5,5,0.9)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            border: '1px solid rgba(255,255,255,0.08)',
            borderRadius: '14px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.5), inset 0 0 30px rgba(255,255,255,0.04)',
            zIndex: 200,
            padding: '16px',
            color: '#ffffff'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: '1px solid rgba(255,255,255,0.12)'
            }}>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#ffffff' }}>Age Range</span>
              <button 
                onClick={() => setShowAgeDropdown(false)}
                style={{ 
                  background: ageDonePressed ? '#FF6B35' : 'rgba(30,30,30,0.9)',
                  border: ageDonePressed ? '1px solid #FF6B35' : '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  color: ageDonePressed ? '#fff' : '#fff', 
                  fontSize: '13px', 
                  fontWeight: 700,
                  cursor: 'pointer',
                  padding: '8px 12px',
                  boxShadow: ageDonePressed ? '0 6px 20px rgba(255,107,53,0.35)' : '0 4px 16px rgba(0,0,0,0.35)'
                }}
                onMouseDown={() => setAgeDonePressed(true)}
                onMouseUp={() => setAgeDonePressed(false)}
                onMouseLeave={() => setAgeDonePressed(false)}
                onTouchStart={() => setAgeDonePressed(true)}
                onTouchEnd={() => setAgeDonePressed(false)}
              >
                Done
              </button>
            </div>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%' }}>
              <div style={{ flex: 1 }}>
                <label htmlFor="age-min" style={{ fontSize: '12px', color: '#cccccc', display: 'block', marginBottom: '6px' }}>
                  Min Age
                </label>
                <input
                  id="age-min"
                  type="number"
                  min="18"
                  max="99"
                  value={ageMin}
                  onChange={(e) => setAgeMin(e.target.value)}
                  placeholder="18"
                  style={{
                    width: '100%',
                    background: 'rgba(35,35,35,0.92)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    padding: '12px',
                    color: '#ffffff',
                    fontSize: '16px',
                    outline: 'none',
                    boxShadow: 'inset 0 0 10px rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(6px)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
              <span style={{ color: '#ffffff', paddingTop: '20px' }}>—</span>
              <div style={{ flex: 1 }}>
                <label htmlFor="age-max" style={{ fontSize: '12px', color: '#cccccc', display: 'block', marginBottom: '6px' }}>
                  Max Age
                </label>
                <input
                  id="age-max"
                  type="number"
                  min="18"
                  max="99"
                  value={ageMax}
                  onChange={(e) => setAgeMax(e.target.value)}
                  placeholder="99"
                  style={{
                    width: '100%',
                    background: 'rgba(35,35,35,0.92)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: '10px',
                    padding: '12px',
                    color: '#ffffff',
                    fontSize: '16px',
                    outline: 'none',
                    boxShadow: 'inset 0 0 10px rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.3)',
                    backdropFilter: 'blur(6px)',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>
            {(ageMin || ageMax) && (
              <button
                onClick={() => {
                  setAgeMin('');
                  setAgeMax('');
                }}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  background: 'rgba(30,30,30,0.9)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: '#ffffff',
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.35)'
                }}
              >
                Clear
              </button>
            )}
          </div>
        )}

        {/* Tribes Dropdown */}
        {showTribesDropdown && (
          <div style={{
            position: 'absolute',
            top: '120px',
            left: '15px',
            right: '15px',
            background: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 200,
            padding: '12px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: `1px solid ${colors.border}`
            }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Select Tribe(s)</span>
              <button 
                onClick={() => setShowTribesDropdown(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: colors.accent, 
                  fontSize: '14px', 
                  fontWeight: 600,
                  cursor: 'pointer' 
                }}
              >
                Done
              </button>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {tribeOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => toggleTribe(option.id)}
                  style={{
                    background: selectedTribes.includes(option.id) ? 'rgba(255,107,53,0.15)' : colors.surface,
                    border: selectedTribes.includes(option.id) ? '2px solid #FF6B35' : `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    padding: '12px',
                    color: selectedTribes.includes(option.id) ? colors.accent : colors.text,
                    fontSize: '14px',
                    fontWeight: selectedTribes.includes(option.id) ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'center',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    position: 'relative'
                  }}
                >
                  {option.label}
                  {selectedTribes.includes(option.id) && (
                    <span style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px'
                    }}><IconCheck size={12} /></span>
                  )}
                </button>
              ))}
            </div>
            {selectedTribes.length > 0 && (
              <button
                onClick={() => setSelectedTribes([])}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '10px',
                  color: colors.textSecondary,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            )}
          </div>
        )}

        {/* Position Dropdown */}
        {showPositionDropdown && (
          <div style={{
            position: 'absolute',
            top: '120px',
            left: '15px',
            right: '15px',
            background: colors.background,
            border: `1px solid ${colors.border}`,
            borderRadius: '12px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 200,
            padding: '12px',
            maxHeight: '300px',
            overflowY: 'auto'
          }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '12px',
              paddingBottom: '8px',
              borderBottom: `1px solid ${colors.border}`
            }}>
              <span style={{ fontSize: '14px', fontWeight: 600 }}>Select Position(s)</span>
              <button 
                onClick={() => setShowPositionDropdown(false)}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: colors.accent, 
                  fontSize: '14px', 
                  fontWeight: 600,
                  cursor: 'pointer' 
                }}
              >
                Done
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {positionOptions.map(option => (
                <button
                  key={option.id}
                  onClick={() => togglePosition(option.id)}
                  style={{
                    background: selectedPositions.includes(option.id) ? 'rgba(255,107,53,0.15)' : colors.surface,
                    border: selectedPositions.includes(option.id) ? '2px solid #FF6B35' : `1px solid ${colors.border}`,
                    borderRadius: '8px',
                    padding: '12px 16px',
                    color: selectedPositions.includes(option.id) ? colors.accent : colors.text,
                    fontSize: '15px',
                    fontWeight: selectedPositions.includes(option.id) ? 600 : 400,
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}
                >
                  {option.label}
                  {selectedPositions.includes(option.id) && (
                    <IconCheck size={16} />
                  )}
                </button>
              ))}
            </div>
            {selectedPositions.length > 0 && (
              <button
                onClick={() => setSelectedPositions([])}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  background: 'transparent',
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  padding: '10px',
                  color: colors.textSecondary,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Clear All
              </button>
            )}
          </div>
        )}
      </header>

      {showAd && (
        <div style={{ margin: '10px 15px', background: colors.surface, borderRadius: '12px', padding: '16px', position: 'relative', border: `1px solid ${colors.border}` }}>
          <button onClick={() => setShowAd(false)} style={{ position: 'absolute', top: '8px', right: '8px', background: 'rgba(128,128,128,0.2)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', color: colors.text, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><IconClose size={12} /></button>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
              <div style={{ width: '50px', height: '50px', background: colors.accent, borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><IconCrown size={24} /></div>
              <div>
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>Upgrade to SLTR+</h3>
                <p style={{ margin: '4px 0 0', fontSize: '13px', color: colors.textSecondary }}>Unlimited profiles, no ads, see who viewed you</p>
              </div>
            </div>
            <a href="/premium" style={{ background: colors.accent, color: '#fff', padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>Upgrade</a>
          </div>
        </div>
      )}

      <main style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', marginBottom: '100px' }}>
        {profiles.length === 0 ? (
          <div style={{ gridColumn: 'span 3', padding: '60px 20px', textAlign: 'center' }}>
            <div style={{ marginBottom: '20px', opacity: 0.3, display: 'flex', justifyContent: 'center' }}><IconEye size={48} /></div>
            <h3 style={{ fontSize: '18px', marginBottom: '10px' }}>No profiles yet</h3>
            <p style={{ fontSize: '14px', opacity: 0.6 }}>Be the first to complete your profile!</p>
            <a href="/profile/edit" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 24px', background: '#FF6B35', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}>Set Up Profile</a>
          </div>
        ) : (
          profiles.map((profile, index) => (
            <a key={profile.id} href={'/profile/' + profile.id} style={{
              aspectRatio: '1',
              position: 'relative',
              background: '#1a1a1a',
              overflow: 'hidden',
              textDecoration: 'none'
            }}>
              {/* Photo */}
              <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url(${getProfileImage(profile, index)})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }} />

              {/* Pro Badge */}
              {profile.is_premium && (
                <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 2 }}>
                  <ProBadge size="sm" />
                </div>
              )}

              {/* Minimal overlay - just name and distance */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent, rgba(0,0,0,0.8))',
                padding: '20px 8px 8px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {profile.last_seen && (Date.now() - new Date(profile.last_seen).getTime() < 5 * 60 * 1000) && <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#4caf50', flexShrink: 0 }} />}
                  <span style={{ color: '#fff', fontSize: '12px', fontWeight: 600 }}>
                    {profile.display_name || 'New User'}{profile.age ? `, ${profile.age}` : ''}
                  </span>
                </div>
                {/* Distance placeholder - would need geolocation */}
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '10px', marginTop: '2px' }}>
                  Nearby
                </div>
              </div>
            </a>
          ))
        )}
      </main>

      <div style={{ position: 'fixed', bottom: '90px', right: '15px', zIndex: 50 }}>
        <button style={{ background: 'rgba(40,40,40,0.95)', border: 'none', borderRadius: '25px', padding: '12px 18px', fontSize: '13px', fontWeight: 500, color: '#fff', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 4px 15px rgba(0,0,0,0.4)', cursor: 'pointer' }}>DTFN 💦</button>
      </div>

      <BottomNav active="explore" />
    </div>
  );
}
