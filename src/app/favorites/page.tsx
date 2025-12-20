'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/ThemeContext';
import { getMyFavorites, removeFavorite } from '@/lib/api/favorites';
import type { FavoriteWithProfile } from '@/types/database';
import { IconBack, IconStar, IconLocation } from '@/components/Icons';

export default function FavoritesPage() {
  const router = useRouter();
  const { colors } = useTheme();
  const [favorites, setFavorites] = useState<FavoriteWithProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMyFavorites();
      setFavorites(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (e: React.MouseEvent, userId: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await removeFavorite(userId);
      setFavorites(favorites.filter(f => f.favorited_user_id !== userId));
    } catch (err: any) {
      alert(err.message || 'Failed to remove favorite');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: colors.background,
      color: colors.text,
      fontFamily: "'Cormorant Garamond', 'Space Mono', -apple-system, BlinkMacSystemFont, serif"
    }}>
      {/* Header */}
      <header style={{
        padding: '15px 20px',
        borderBottom: `1px solid ${colors.border}`,
        position: 'sticky',
        top: 0,
        background: colors.background,
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              color: colors.accent,
              cursor: 'pointer',
              padding: 0,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <IconBack size={24} />
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: 600, margin: 0 }}>Favorites</h1>
          <div style={{ width: '24px' }} />
        </div>
      </header>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: colors.textSecondary }}>
            Loading favorites...
          </div>
        )}

        {error && (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: colors.accent
          }}>
            <div style={{ marginBottom: '16px' }}>{error}</div>
            <button
              onClick={loadFavorites}
              style={{
                background: colors.accent,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '10px 20px',
                cursor: 'pointer'
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {!loading && !error && favorites.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ marginBottom: '20px', opacity: 0.3, display: 'flex', justifyContent: 'center' }}>
              <IconStar size={64} />
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '10px' }}>
              No Favorites Yet
            </h3>
            <p style={{ fontSize: '14px', color: colors.textSecondary }}>
              Tap the star on profiles to save them here
            </p>
          </div>
        )}

        {!loading && !error && favorites.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px' }}>
            {favorites.map(fav => (
              <a
                key={fav.id}
                href={`/profile/${fav.profile.id}`}
                style={{
                  textDecoration: 'none',
                  color: colors.text,
                  background: colors.surface,
                  borderRadius: '12px',
                  overflow: 'hidden',
                  position: 'relative'
                }}
              >
                {/* Image */}
                <div
                  style={{
                    width: '100%',
                    paddingTop: '133%',
                    background: '#333',
                    backgroundImage: fav.profile.photo_url
                      ? `url(${fav.profile.photo_url})`
                      : 'none',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    position: 'relative'
                  }}
                >
                  {/* Online Indicator */}
                  {fav.profile.is_online && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: colors.accent,
                        border: `2px solid ${colors.background}`
                      }}
                    />
                  )}

                  {/* Favorite Star Button */}
                  <button
                    onClick={(e) => handleRemoveFavorite(e, fav.favorited_user_id)}
                    style={{
                      position: 'absolute',
                      top: '10px',
                      left: '10px',
                      background: 'rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(10px)',
                      WebkitBackdropFilter: 'blur(10px)',
                      border: 'none',
                      borderRadius: '50%',
                      width: '32px',
                      height: '32px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: colors.accent
                    }}
                  >
                    <IconStar size={16} />
                  </button>
                </div>

                {/* Info */}
                <div style={{ padding: '12px' }}>
                  <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                    {fav.profile.display_name || 'User'}
                    {fav.profile.age && `, ${fav.profile.age}`}
                  </div>
                  {fav.profile.distance && (
                    <div style={{ fontSize: '13px', color: colors.textSecondary, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <IconLocation size={14} /> {fav.profile.distance} away
                    </div>
                  )}
                  {fav.profile.position && (
                    <div style={{ fontSize: '13px', color: colors.textSecondary }}>
                      {fav.profile.position}
                    </div>
                  )}
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
