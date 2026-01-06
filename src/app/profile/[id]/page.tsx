'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '../../../lib/supabase';
import { IconFlame, IconWave, IconWink, IconEye, IconStar, IconChat, IconClose, IconBack } from '@/components/Icons';
import ProBadge from '@/components/ProBadge';
import OrbitBadge from '@/components/OrbitBadge';
import { DTFNBadge } from '@/components/dtfn';
import { recordProfileView } from '@/lib/api/views';
import posthog from 'posthog-js';

// Tap types available - now using components
const TAP_TYPES = [
  { id: 'flame', label: 'Fire', Icon: IconFlame },
  { id: 'wave', label: 'Wave', Icon: IconWave },
  { id: 'wink', label: 'Wink', Icon: IconWink },
  { id: 'looking', label: 'Looking', Icon: IconEye },
];

// Section Header component
const SectionHeader = ({ title }: { title: string }) => (
  <div style={{
    fontSize: '11px',
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
    marginBottom: '10px',
    letterSpacing: '1px',
    fontWeight: 600
  }}>
    {title}
  </div>
);

// Tag component for displaying values
const Tag = ({ children, variant = 'default' }: { children: React.ReactNode; variant?: 'primary' | 'stat' | 'health' | 'looking' | 'tribe' | 'default' }) => {
  const styles: Record<string, React.CSSProperties> = {
    primary: { background: 'rgba(255,107,53,0.3)', color: '#FF6B35', fontWeight: 600 },
    stat: { background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.9)' },
    health: { background: 'rgba(76,175,80,0.2)', color: '#81c784' },
    looking: { background: 'rgba(100,181,246,0.2)', color: '#90caf9' },
    tribe: { background: 'rgba(255,107,53,0.2)', color: '#ffab91' },
    default: { background: 'rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.8)' },
  };

  return (
    <span style={{
      fontSize: '13px',
      padding: '6px 12px',
      borderRadius: '6px',
      display: 'inline-block',
      ...styles[variant]
    }}>
      {children}
    </span>
  );
};

// Info Row component for key-value pairs
const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
    <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px' }}>{label}</span>
    <span style={{ color: '#fff', fontSize: '14px' }}>{value}</span>
  </div>
);

export default function ProfileViewPage() {
  const params = useParams();
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isFavorited, setIsFavorited] = useState(false);
  const [hasTapped, setHasTapped] = useState(false);
  const [showTapMenu, setShowTapMenu] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [hostedGroups, setHostedGroups] = useState<any[]>([]);
  const [photoIndex, setPhotoIndex] = useState<number | null>(null);

  // Validate and extract profile ID
  const profileId = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : null;

  useEffect(() => {
    const loadProfile = async () => {
      // Validate profileId
      if (!profileId) {
        setError('Invalid profile ID');
        setLoading(false);
        return;
      }

      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setCurrentUserId(user.id);

          // Check if already favorited (use maybeSingle to avoid error on no results)
          const { data: favData } = await supabase
            .from('favorites')
            .select('id')
            .eq('user_id', user.id)
            .eq('favorited_user_id', profileId)
            .maybeSingle();

          if (favData) setIsFavorited(true);

          // Check if already tapped
          const { data: tapData } = await supabase
            .from('taps')
            .select('id')
            .eq('sender_id', user.id)
            .eq('recipient_id', profileId)
            .maybeSingle();

          if (tapData) setHasTapped(true);
        }

        // Load profile
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', profileId)
          .maybeSingle();

        if (profileError) {
          console.error('Error loading profile:', profileError);
          setError('Failed to load profile');
        } else if (data) {
          setProfile(data);

          // Record profile view (only if viewing someone else's profile)
          if (user && profileId !== user.id) {
            recordProfileView(profileId).catch(err => {
              console.error('Failed to record profile view:', err);
            });
          }

          // Fetch hosted groups that are active (posted)
          const { data: groupsData } = await supabase
            .from('groups')
            .select('id, name, type, start_time, location, attendees, max_attendees')
            .eq('host_id', profileId)
            .eq('is_active', true)
            .order('start_time', { ascending: true });

          if (groupsData) {
            setHostedGroups(groupsData);
          }
        } else {
          setError('Profile not found');
        }
      } catch (err) {
        console.error('Error in loadProfile:', err);
        setError('An error occurred');
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [profileId]);

  // Handle Tap
  const handleTap = async (tapType: string) => {
    if (!currentUserId || actionLoading) return;
    setActionLoading(true);
    setShowTapMenu(false);

    try {
      if (hasTapped) {
        // Remove tap
        await supabase
          .from('taps')
          .delete()
          .eq('sender_id', currentUserId)
          .eq('recipient_id', profileId);
        setHasTapped(false);
      } else {
        // Add tap
        const { error: tapError } = await supabase
          .from('taps')
          .insert({
            sender_id: currentUserId,
            recipient_id: profileId,
            tap_type: tapType
          });

        if (tapError) {
          console.error('Tap insert error:', tapError);
          alert(`Failed to send tap: ${tapError.message}`);
          return;
        }

        setHasTapped(true);

        // Capture tap_sent event in PostHog
        posthog.capture('tap_sent', {
          tap_type: tapType,
          recipient_id: profileId,
        });
      }
    } catch (error: any) {
      console.error('Tap error:', error);
      alert(`Tap failed: ${error.message || 'Unknown error'}`);
    }
    setActionLoading(false);
  };

  // Handle Favorite
  const handleFavorite = async () => {
    if (!currentUserId || actionLoading) return;
    setActionLoading(true);

    try {
      if (isFavorited) {
        // Remove favorite
        await supabase
          .from('favorites')
          .delete()
          .eq('user_id', currentUserId)
          .eq('favorited_user_id', profileId);
        setIsFavorited(false);
      } else {
        // Add favorite
        await supabase
          .from('favorites')
          .insert({
            user_id: currentUserId,
            favorited_user_id: profileId
          });
        setIsFavorited(true);

        // Capture favorite_added event in PostHog
        posthog.capture('favorite_added', {
          favorited_user_id: profileId,
        });
      }
    } catch (error) {
      console.error('Favorite error:', error);
    }
    setActionLoading(false);
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff'
      }}>
        Loading...
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div style={{
        minHeight: '100vh',
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#fff',
        flexDirection: 'column',
        gap: '20px',
        padding: '20px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '24px', fontWeight: 600 }}>
          {error || 'Profile not found'}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', maxWidth: '300px' }}>
          This profile may have been deleted or is no longer available.
        </p>
        <button
          onClick={() => router.back()}
          style={{
            padding: '12px 24px',
            background: '#FF6B35',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 600
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  // Check if sections have content
  const hasAbout = profile.about || profile.bio;
  const hasStats = profile.height || profile.weight || profile.body_type || profile.ethnicity;
  const hasPosition = profile.position;
  const hasLookingFor = profile.looking_for && Array.isArray(profile.looking_for) && profile.looking_for.length > 0;
  const hasMeetAt = profile.meet_at && Array.isArray(profile.meet_at) && profile.meet_at.length > 0;
  const hasIdentity = profile.gender || profile.pronouns || profile.relationship_status;
  const hasHealth = profile.hiv_status || (profile.health_practices && profile.health_practices.length > 0) || (profile.vaccinations && profile.vaccinations.length > 0);
  const hasTribes = profile.tribes && Array.isArray(profile.tribes) && profile.tribes.length > 0;
  const hasTags = profile.tags && Array.isArray(profile.tags) && profile.tags.length > 0;
  const hasSocials = profile.instagram || profile.twitter || profile.facebook;
  const hasPhotos = profile.photo_urls && Array.isArray(profile.photo_urls) && profile.photo_urls.length > 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(10px)',
        padding: '12px 15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        borderBottom: '1px solid rgba(255,255,255,0.1)'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            cursor: 'pointer',
            padding: '5px',
            display: 'flex',
            alignItems: 'center'
          }}
        >
          <IconBack size={24} />
        </button>
        <span style={{ fontSize: '16px', fontWeight: 600 }}>Profile</span>
        <button style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.6)',
          fontSize: '20px',
          cursor: 'pointer',
          padding: '5px'
        }}>
          ...
        </button>
      </header>

      {/* Main Photo - clean, just the image */}
      <div style={{
        width: '100%',
        aspectRatio: '1',
        background: '#1a1a1a',
        position: 'relative'
      }}>
        {profile.photo_url && (
          <img
            src={profile.photo_url}
            alt={profile.display_name || 'Profile'}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }}
          />
        )}

        {/* Name overlay on photo */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
          padding: '40px 15px 15px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            {profile.is_online && (
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#4caf50' }} />
            )}
            <span style={{ fontSize: '28px', fontWeight: 600 }}>
              {profile.display_name || 'New User'}{profile.age ? `, ${profile.age}` : ''}
            </span>
            {profile.pnp_visible && <OrbitBadge size="md" />}
            {profile.is_premium && <ProBadge size="md" />}
            <DTFNBadge isActive={profile.dtfn_active_until && new Date(profile.dtfn_active_until) > new Date()} size="md" />
          </div>
          <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', marginTop: '4px' }}>
            Nearby
          </div>
        </div>
      </div>

      {/* Profile Card - All information organized by category */}
      <div style={{ padding: '0 15px' }}>

        {/* About Section */}
        {hasAbout && (
          <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <SectionHeader title="About" />
            <p style={{ margin: 0, fontSize: '15px', lineHeight: '1.6', color: 'rgba(255,255,255,0.9)' }}>
              {profile.about || profile.bio}
            </p>
          </div>
        )}

        {/* Position Section */}
        {hasPosition && (
          <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <SectionHeader title="Position" />
            <Tag variant="primary">{profile.position}</Tag>
          </div>
        )}

        {/* Stats Section */}
        {hasStats && (
          <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <SectionHeader title="Stats" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {profile.height && <Tag variant="stat">{profile.height}</Tag>}
              {profile.weight && <Tag variant="stat">{profile.weight}</Tag>}
              {profile.body_type && <Tag variant="stat">{profile.body_type}</Tag>}
              {profile.ethnicity && <Tag variant="stat">{profile.ethnicity}</Tag>}
            </div>
          </div>
        )}

        {/* Looking For Section */}
        {hasLookingFor && (
          <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <SectionHeader title="Looking For" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {profile.looking_for.map((item: string) => (
                <Tag key={item} variant="looking">{item}</Tag>
              ))}
            </div>
          </div>
        )}

        {/* Meet At Section */}
        {hasMeetAt && (
          <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <SectionHeader title="Meet At" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {profile.meet_at.map((item: string) => (
                <Tag key={item} variant="default">{item}</Tag>
              ))}
            </div>
          </div>
        )}

        {/* Identity Section */}
        {hasIdentity && (
          <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <SectionHeader title="Identity" />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {profile.gender && <InfoRow label="Gender" value={profile.gender} />}
              {profile.pronouns && <InfoRow label="Pronouns" value={profile.pronouns} />}
              {profile.relationship_status && <InfoRow label="Relationship" value={profile.relationship_status} />}
            </div>
          </div>
        )}

        {/* Health & Safety Section */}
        {hasHealth && (
          <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <SectionHeader title="Health & Safety" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {profile.hiv_status && <Tag variant="health">{profile.hiv_status}</Tag>}
              {profile.health_practices && Array.isArray(profile.health_practices) && profile.health_practices.map((item: string) => (
                <Tag key={item} variant="health">{item}</Tag>
              ))}
              {profile.vaccinations && Array.isArray(profile.vaccinations) && profile.vaccinations.map((item: string) => (
                <Tag key={item} variant="health">{item}</Tag>
              ))}
            </div>
          </div>
        )}

        {/* Tribes Section */}
        {hasTribes && (
          <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <SectionHeader title="Tribes" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {profile.tribes.map((tribe: string) => (
                <Tag key={tribe} variant="tribe">{tribe}</Tag>
              ))}
            </div>
          </div>
        )}

        {/* Tags/Interests Section */}
        {hasTags && (
          <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <SectionHeader title="Tags & Interests" />
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {profile.tags.map((tag: string) => (
                <Tag key={tag} variant="default">{tag}</Tag>
              ))}
            </div>
          </div>
        )}

        {/* Social Links Section */}
        {hasSocials && (
          <div style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
            <SectionHeader title="Social" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {profile.instagram && (
                <a href={`https://instagram.com/${profile.instagram}`} target="_blank" rel="noopener noreferrer"
                   style={{ color: '#E1306C', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Instagram: @{profile.instagram}
                </a>
              )}
              {profile.twitter && (
                <a href={`https://twitter.com/${profile.twitter}`} target="_blank" rel="noopener noreferrer"
                   style={{ color: '#1DA1F2', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Twitter: @{profile.twitter}
                </a>
              )}
              {profile.facebook && (
                <a href={`https://facebook.com/${profile.facebook}`} target="_blank" rel="noopener noreferrer"
                   style={{ color: '#4267B2', textDecoration: 'none', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  Facebook: {profile.facebook}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Additional Photos Section */}
        {hasPhotos && (
          <div style={{ padding: '20px 0', borderBottom: hostedGroups.length > 0 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
            <SectionHeader title="Photos" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
              {profile.photo_urls.filter((url: string) => url).map((url: string, index: number) => (
                <div
                  key={index}
                  onClick={() => setPhotoIndex(index)}
                  style={{
                    aspectRatio: '1',
                    background: '#1a1a1a',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    cursor: 'pointer'
                  }}
                >
                  <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hosted Groups Section */}
        {hostedGroups.length > 0 && (
          <div style={{ padding: '20px 0' }}>
            <SectionHeader title="Hosting" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {hostedGroups.map((group) => {
                const eventDate = group.start_time ? new Date(group.start_time) : null;
                const dateStr = eventDate ? eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : '';
                const timeStr = eventDate ? eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '';

                return (
                  <a
                    key={group.id}
                    href={`/groups/${group.id}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '14px',
                      padding: '14px',
                      background: 'rgba(255,107,53,0.08)',
                      border: '1px solid rgba(255,107,53,0.2)',
                      borderRadius: '12px',
                      textDecoration: 'none',
                      color: '#fff'
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '12px',
                      background: 'rgba(255,107,53,0.2)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '24px',
                      flexShrink: 0
                    }}>
                      👥
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px', color: '#fff' }}>
                        {group.name}
                      </div>
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.6)' }}>
                        {group.type} • {dateStr} {timeStr && `at ${timeStr}`}
                      </div>
                      <div style={{ fontSize: '12px', color: '#FF6B35', marginTop: '4px' }}>
                        {group.attendees}/{group.max_attendees} attending
                      </div>
                    </div>
                    <div style={{ fontSize: '20px', color: 'rgba(255,255,255,0.4)' }}>›</div>
                  </a>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Tap Menu Popup */}
      {showTapMenu && (
        <div style={{
          position: 'fixed',
          bottom: '80px',
          left: '15px',
          right: '15px',
          background: 'rgba(30,30,30,0.98)',
          borderRadius: '16px',
          padding: '16px',
          zIndex: 200,
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <div style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', textAlign: 'center' }}>
            Send a Tap
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {TAP_TYPES.map((tap) => (
              <button
                key={tap.id}
                onClick={() => handleTap(tap.id)}
                disabled={actionLoading}
                style={{
                  padding: '12px 8px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  color: '#fff'
                }}
              >
                <tap.Icon size={24} />
                <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>{tap.label}</span>
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowTapMenu(false)}
            style={{
              width: '100%',
              marginTop: '12px',
              padding: '12px',
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.6)',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      )}

      {/* Photo Gallery Lightbox */}
      {photoIndex !== null && profile.photo_urls && (() => {
        const photos = profile.photo_urls.filter((url: string) => url);
        const currentPhoto = photos[photoIndex];
        const hasPrev = photoIndex > 0;
        const hasNext = photoIndex < photos.length - 1;

        return (
          <div
            onClick={() => setPhotoIndex(null)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.95)',
              zIndex: 300,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '20px'
            }}
          >
            {/* Close button */}
            <button
              onClick={() => setPhotoIndex(null)}
              style={{
                position: 'absolute',
                top: '20px',
                right: '20px',
                background: 'rgba(255,255,255,0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                color: '#fff',
                fontSize: '24px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10
              }}
            >
              ✕
            </button>

            {/* Photo counter */}
            <div style={{
              position: 'absolute',
              top: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '14px'
            }}>
              {photoIndex + 1} / {photos.length}
            </div>

            {/* Previous arrow */}
            {hasPrev && (
              <button
                onClick={(e) => { e.stopPropagation(); setPhotoIndex(photoIndex - 1); }}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ‹
              </button>
            )}

            {/* Next arrow */}
            {hasNext && (
              <button
                onClick={(e) => { e.stopPropagation(); setPhotoIndex(photoIndex + 1); }}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '48px',
                  height: '48px',
                  color: '#fff',
                  fontSize: '24px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                ›
              </button>
            )}

            {/* Photo */}
            <img
              src={currentPhoto}
              alt=""
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: '100%',
                maxHeight: '80vh',
                objectFit: 'contain',
                borderRadius: '8px'
              }}
            />

            {/* Dots */}
            {photos.length > 1 && (
              <div style={{
                display: 'flex',
                gap: '8px',
                marginTop: '20px'
              }}>
                {photos.map((_: string, i: number) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setPhotoIndex(i); }}
                    style={{
                      width: i === photoIndex ? '24px' : '8px',
                      height: '8px',
                      borderRadius: '4px',
                      background: i === photoIndex ? '#FF6B35' : 'rgba(255,255,255,0.3)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        );
      })()}

      {/* Fixed Action Buttons at Bottom */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        padding: '12px 15px',
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(10px)',
        borderTop: '1px solid rgba(255,255,255,0.1)'
      }}>
        {/* Tap Button */}
        <button
          onClick={() => hasTapped ? handleTap('flame') : setShowTapMenu(true)}
          disabled={actionLoading}
          style={{
            padding: '12px',
            background: hasTapped ? 'rgba(255,107,53,0.3)' : 'rgba(255,255,255,0.1)',
            border: hasTapped ? '1px solid #FF6B35' : 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
            color: hasTapped ? '#FF6B35' : '#fff',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          <IconFlame size={18} />
          <span>{hasTapped ? 'Tapped' : 'Tap'}</span>
        </button>

        {/* Fave Button */}
        <button
          onClick={handleFavorite}
          disabled={actionLoading}
          style={{
            padding: '12px',
            background: isFavorited ? 'rgba(255,215,0,0.2)' : 'rgba(255,255,255,0.1)',
            border: isFavorited ? '1px solid #FFD700' : 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
            color: isFavorited ? '#FFD700' : '#fff',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          <IconStar size={18} />
          <span>{isFavorited ? 'Faved' : 'Fave'}</span>
        </button>

        {/* Message Button */}
        <button
          onClick={() => router.push(`/messages/${profileId}`)}
          style={{
            padding: '12px',
            background: '#FF6B35',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 600,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          <IconChat size={18} />
          <span>Message</span>
        </button>

        {/* Close Button */}
        <button
          onClick={() => router.back()}
          style={{
            padding: '12px',
            background: 'rgba(255,255,255,0.1)',
            border: 'none',
            borderRadius: '8px',
            fontSize: '12px',
            fontWeight: 500,
            color: '#fff',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '2px'
          }}
        >
          <IconClose size={18} />
          <span>Close</span>
        </button>
      </div>
    </div>
  );
}
