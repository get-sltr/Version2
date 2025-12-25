'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabase';
import { useTheme } from '../../contexts/ThemeContext';
import { IconSearch, IconMap, IconMenu, IconStar, IconUser, IconCheck, IconEye, IconCrown, IconClose } from '@/components/Icons';
import BottomNav from '@/components/BottomNav';
import ProBadge from '@/components/ProBadge';
import OrbitBadge from '@/components/OrbitBadge';
import { DTFNButton, DTFNBadge } from '@/components/dtfn';
import { usePremium } from '@/hooks/usePremium';

export default function Dashboard() {
  const router = useRouter();
  const { colors } = useTheme();
  const { isPremium } = usePremium();
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
      // Consider "online" if last_seen within last 24 hours (show active users)
      const oneDayAgo = new Date();
      oneDayAgo.setDate(oneDayAgo.getDate() - 1);
      query = query.gte('last_seen', oneDayAgo.toISOString());
    } else if (activeFilter === 'fresh') {
      // Show profiles created in the last 7 days
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      query = query.gte('created_at', sevenDaysAgo.toISOString());
    } else if (activeFilter === 'dtfn') {
      // Show only DTFN users with active DTFN (dtfn_active_until > now)
      query = query.gt('dtfn_active_until', new Date().toISOString());
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
    } else if (filter.id === 'dtfn') {
      // DTFN filter is premium-only
      if (!isPremium) {
        router.push('/premium');
        return;
      }
      setActiveFilter(filter.id);
      setShowPositionDropdown(false);
      setShowAgeDropdown(false);
      setShowTribesDropdown(false);
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
          <a href="/map" style={{
            width: '44px',
            height: '44px',
            borderRadius: '8px',
            background: '#0a0a0a',
            border: '1px solid #ff6b35',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textDecoration: 'none',
            flexShrink: 0,
            color: '#ff6b35',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(255,107,53,0.25)',
            transition: 'all 0.3s ease-out'
          }}>
            <span style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: '#ff6b35', boxShadow: '0 0 10px rgba(255,107,53,0.8)' }} />
            <IconMap size={20} />
          </a>
        </div>
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '5px', marginLeft: '-15px', marginRight: '-15px', paddingLeft: '15px', paddingRight: '15px' }}>
          <a href="/settings" style={{
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#888',
            fontSize: '14px',
            flexShrink: 0,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            transition: 'all 0.3s ease-out'
          }}>
            <span style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: '#333' }} />
            <IconMenu size={16} />
          </a>
          <a href="/favorites" style={{
            background: '#0a0a0a',
            border: '1px solid #333',
            borderRadius: '6px',
            padding: '8px 12px',
            color: '#888',
            fontSize: '14px',
            flexShrink: 0,
            textDecoration: 'none',
            display: 'flex',
            alignItems: 'center',
            position: 'relative',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'all 0.3s ease-out'
          }}>
            <span style={{ position: 'absolute', bottom: 0, left: 0, width: '100%', height: '2px', background: '#333' }} />
            <IconStar size={16} />
          </a>
          {filters.map(filter => {
            const isFilterActive = (filter.id === 'position' && selectedPositions.length > 0) ||
                                   (filter.id === 'age' && (ageMin || ageMax)) ||
                                   (filter.id === 'tribes' && selectedTribes.length > 0) ||
                                   activeFilter === filter.id;

            const isDropdownOpen = (filter.id === 'age' && showAgeDropdown) ||
                                   (filter.id === 'position' && showPositionDropdown) ||
                                   (filter.id === 'tribes' && showTribesDropdown);

            // Special DTFN button with droplets
            if (filter.id === 'dtfn') {
              return (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter)}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#0a0a0a',
                    color: isFilterActive ? '#ff6b35' : '#888',
                    border: isFilterActive ? '1px solid #ff6b35' : '1px solid #333',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: isFilterActive ? '0 4px 20px rgba(255,107,53,0.25)' : 'none',
                    transition: 'all 0.3s ease-out',
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: isFilterActive ? '#ff6b35' : '#333',
                    boxShadow: isFilterActive ? '0 0 10px rgba(255,107,53,0.8)' : 'none',
                    transition: 'all 0.3s',
                  }} />
                  <span style={{ position: 'relative', zIndex: 10, display: 'flex', alignItems: 'center' }}>
                    DTFN
                    <span style={{ display: 'inline-flex', alignItems: 'flex-end', marginLeft: '2px', gap: 0 }}>
                      <svg style={{ width: '12px', height: '12px', fill: isFilterActive ? '#ff6b35' : '#888', filter: isFilterActive ? 'drop-shadow(0 0 4px rgba(255,107,53,0.8))' : 'none', transition: 'all 0.3s' }} viewBox="0 0 24 24">
                        <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
                      </svg>
                      <svg style={{ width: '8px', height: '8px', marginLeft: '-1px', fill: isFilterActive ? '#ff6b35' : '#888', filter: isFilterActive ? 'drop-shadow(0 0 4px rgba(255,107,53,0.8))' : 'none', transition: 'all 0.3s' }} viewBox="0 0 24 24">
                        <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
                      </svg>
                    </span>
                  </span>
                </button>
              );
            }

            // Online button with green dot
            if (filter.id === 'online') {
              return (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter)}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#0a0a0a',
                    color: isFilterActive ? '#ff6b35' : '#888',
                    border: isFilterActive ? '1px solid #ff6b35' : '1px solid #333',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: isFilterActive ? '0 4px 20px rgba(255,107,53,0.25)' : 'none',
                    transition: 'all 0.3s ease-out',
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: isFilterActive ? '#ff6b35' : '#333',
                    boxShadow: isFilterActive ? '0 0 10px rgba(255,107,53,0.8)' : 'none',
                    transition: 'all 0.3s',
                  }} />
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isFilterActive ? '#4caf50' : '#555', position: 'relative', zIndex: 10 }} />
                  <span style={{ position: 'relative', zIndex: 10 }}>Online</span>
                </button>
              );
            }

            // New button with star icon
            if (filter.id === 'fresh') {
              return (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter)}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#0a0a0a',
                    color: isFilterActive ? '#ff6b35' : '#888',
                    border: isFilterActive ? '1px solid #ff6b35' : '1px solid #333',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: isFilterActive ? '0 4px 20px rgba(255,107,53,0.25)' : 'none',
                    transition: 'all 0.3s ease-out',
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: isFilterActive ? '#ff6b35' : '#333',
                    boxShadow: isFilterActive ? '0 0 10px rgba(255,107,53,0.8)' : 'none',
                    transition: 'all 0.3s',
                  }} />
                  <svg style={{ width: '14px', height: '14px', fill: isFilterActive ? '#ff6b35' : '#888', position: 'relative', zIndex: 10, transition: 'all 0.3s' }} viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                  </svg>
                  <span style={{ position: 'relative', zIndex: 10 }}>New</span>
                </button>
              );
            }

            // Photos button with camera icon
            if (filter.id === 'photos') {
              return (
                <button
                  key={filter.id}
                  onClick={() => handleFilterClick(filter)}
                  style={{
                    position: 'relative',
                    overflow: 'hidden',
                    background: '#0a0a0a',
                    color: isFilterActive ? '#ff6b35' : '#888',
                    border: isFilterActive ? '1px solid #ff6b35' : '1px solid #333',
                    borderRadius: '6px',
                    padding: '8px 16px',
                    fontSize: '13px',
                    fontWeight: 'bold',
                    letterSpacing: '0.5px',
                    flexShrink: 0,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: isFilterActive ? '0 4px 20px rgba(255,107,53,0.25)' : 'none',
                    transition: 'all 0.3s ease-out',
                  }}
                >
                  <span style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    height: '2px',
                    background: isFilterActive ? '#ff6b35' : '#333',
                    boxShadow: isFilterActive ? '0 0 10px rgba(255,107,53,0.8)' : 'none',
                    transition: 'all 0.3s',
                  }} />
                  <svg style={{ width: '14px', height: '14px', fill: isFilterActive ? '#ff6b35' : '#888', position: 'relative', zIndex: 10, transition: 'all 0.3s' }} viewBox="0 0 24 24">
                    <path d="M4 4H7L9 2H15L17 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4ZM12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17ZM12 9C13.65 9 15 10.35 15 12C15 13.65 13.65 15 12 15C10.35 15 9 13.65 9 12C9 10.35 10.35 9 12 9Z"/>
                  </svg>
                  <span style={{ position: 'relative', zIndex: 10 }}>Photos</span>
                </button>
              );
            }

            // Regular filter buttons (Age, Position, Tribes) with dropdown
            return (
              <button
                key={filter.id}
                onClick={() => handleFilterClick(filter)}
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: '#0a0a0a',
                  color: isFilterActive ? '#ff6b35' : '#888',
                  border: isFilterActive ? '1px solid #ff6b35' : '1px solid #333',
                  borderRadius: '6px',
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: 'bold',
                  letterSpacing: '0.5px',
                  flexShrink: 0,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  boxShadow: isFilterActive ? '0 4px 20px rgba(255,107,53,0.25)' : 'none',
                  transition: 'all 0.3s ease-out',
                }}
              >
                <span style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '100%',
                  height: '2px',
                  background: isFilterActive ? '#ff6b35' : '#333',
                  boxShadow: isFilterActive ? '0 0 10px rgba(255,107,53,0.8)' : 'none',
                  transition: 'all 0.3s',
                }} />
                <span style={{ position: 'relative', zIndex: 10 }}>{getFilterButtonLabel(filter)}</span>
                {filter.hasDropdown && (
                  <span style={{
                    position: 'relative',
                    zIndex: 10,
                    fontSize: '10px',
                    transition: 'transform 0.2s',
                    transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}>▾</span>
                )}
              </button>
            );
          })}
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

              {/* PnP Orbit badge - top left */}
              {profile.pnp_visible && (
                <div style={{ position: 'absolute', top: '6px', left: '6px', zIndex: 2 }}>
                  <OrbitBadge size="sm" />
                </div>
              )}

              {/* Badges container - top right */}
              <div style={{ position: 'absolute', top: '6px', right: '6px', zIndex: 2, display: 'flex', gap: '4px', alignItems: 'center' }}>
                {profile.dtfn_active_until && new Date(profile.dtfn_active_until) > new Date() && (
                  <DTFNBadge isActive={true} size="sm" />
                )}
                {profile.is_premium && (
                  <ProBadge size="sm" />
                )}
              </div>

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
        <DTFNButton />
      </div>

      <BottomNav active="explore" />
    </div>
  );
}
