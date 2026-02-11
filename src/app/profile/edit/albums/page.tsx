'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { listMyAlbums, deleteAlbum } from '@/lib/api/albumMedia';
import { IconBack } from '@/components/Icons';

type Album = {
  id: string;
  name: string;
  description: string | null;
  is_private: boolean;
  cover_photo_url: string | null;
  created_at: string;
};

export default function AlbumsPage() {
  const router = useRouter();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAlbums();
  }, []);

  const loadAlbums = async () => {
    try {
      const data = await listMyAlbums();
      setAlbums(data || []);
    } catch (err) {
      console.error('Failed to load albums:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (albumId: string) => {
    setDeleting(true);
    try {
      await deleteAlbum(albumId);
      setAlbums(albums.filter(a => a.id !== albumId));
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete album:', err);
      alert('Failed to delete album');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.9)',
        backdropFilter: 'blur(20px)',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        zIndex: 100,
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: '#FF6B35', cursor: 'pointer', padding: '8px' }}
        >
          <IconBack size={24} />
        </button>
        <span style={{ fontSize: '18px', fontWeight: 600, flex: 1 }}>My Albums</span>
        <a
          href="/profile/edit/albums/create"
          style={{
            background: '#FF6B35',
            color: '#fff',
            padding: '8px 16px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          + New
        </a>
      </header>

      <div style={{ padding: '16px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.5)' }}>
            Loading...
          </div>
        ) : albums.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>No Albums Yet</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '24px' }}>
              Create albums to organize your photos
            </div>
            <a
              href="/profile/edit/albums/create"
              style={{
                display: 'inline-block',
                background: '#FF6B35',
                color: '#fff',
                padding: '12px 24px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontSize: '15px',
                fontWeight: 600,
              }}
            >
              Create Album
            </a>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {albums.map(album => (
              <div
                key={album.id}
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                <a
                  href={`/profile/edit/albums/${album.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '14px',
                    padding: '14px',
                    textDecoration: 'none',
                    color: '#fff',
                  }}
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '8px',
                    background: album.cover_photo_url
                      ? `url(${album.cover_photo_url}) center/cover`
                      : 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    {!album.cover_photo_url && <span style={{ fontSize: '24px' }}>📷</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>
                      {album.name}
                      {album.is_private && (
                        <span style={{ marginLeft: '8px', fontSize: '12px', color: '#FF6B35' }}>🔒 Private</span>
                      )}
                    </div>
                    {album.description && (
                      <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {album.description}
                      </div>
                    )}
                  </div>
                  <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '20px' }}>›</div>
                </a>
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex' }}>
                  <a
                    href={`/profile/edit/albums/${album.id}`}
                    style={{
                      flex: 1,
                      padding: '12px',
                      textAlign: 'center',
                      color: 'rgba(255,255,255,0.6)',
                      textDecoration: 'none',
                      fontSize: '14px',
                      borderRight: '1px solid rgba(255,255,255,0.1)',
                    }}
                  >
                    Edit
                  </a>
                  <button
                    onClick={() => setDeleteConfirm(album.id)}
                    style={{
                      flex: 1,
                      padding: '12px',
                      textAlign: 'center',
                      color: '#ff4444',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '14px',
                      cursor: 'pointer',
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          onClick={() => !deleting && setDeleteConfirm(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: '#1c1c1e',
              borderRadius: '16px',
              padding: '24px',
              maxWidth: '340px',
              width: '100%',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>Delete Album?</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
              This will permanently delete the album and all photos in it. This cannot be undone.
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255,255,255,0.1)',
                  border: 'none',
                  borderRadius: '10px',
                  color: '#fff',
                  fontSize: '15px',
                  fontWeight: 600,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={deleting}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: 'rgba(255,68,68,0.2)',
                  border: '1px solid rgba(255,68,68,0.5)',
                  borderRadius: '10px',
                  color: '#ff4444',
                  fontSize: '15px',
                  fontWeight: 700,
                  cursor: deleting ? 'not-allowed' : 'pointer',
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
