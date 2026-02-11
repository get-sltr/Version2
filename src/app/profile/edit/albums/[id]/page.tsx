'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getAlbumWithPhotos, deleteAlbumPhoto, deleteAlbum } from '@/lib/api/albumMedia';
import { IconBack } from '@/components/Icons';

type Album = {
  id: string;
  name: string;
  description: string | null;
  is_private: boolean;
};

type Photo = {
  id: string;
  public_url: string;
  caption: string | null;
};

export default function AlbumDetailPage() {
  const router = useRouter();
  const params = useParams();
  const albumId = params.id as string;

  const [album, setAlbum] = useState<Album | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<'photo' | 'album' | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadAlbum();
  }, [albumId]);

  const loadAlbum = async () => {
    try {
      const { album: albumData, photos: photosData } = await getAlbumWithPhotos(albumId);
      setAlbum(albumData);
      setPhotos(photosData || []);
    } catch (err) {
      console.error('Failed to load album:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePhoto = async () => {
    if (!selectedPhoto) return;
    setDeleting(true);
    try {
      await deleteAlbumPhoto(selectedPhoto.id);
      setPhotos(photos.filter(p => p.id !== selectedPhoto.id));
      setSelectedPhoto(null);
      setDeleteConfirm(null);
    } catch (err) {
      console.error('Failed to delete photo:', err);
      alert('Failed to delete photo');
    } finally {
      setDeleting(false);
    }
  };

  const handleDeleteAlbum = async () => {
    setDeleting(true);
    try {
      await deleteAlbum(albumId);
      router.replace('/profile/edit/albums');
    } catch (err) {
      console.error('Failed to delete album:', err);
      alert('Failed to delete album');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  if (!album) {
    return (
      <div style={{ minHeight: '100vh', background: '#000', color: '#fff', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
        <div style={{ fontSize: '18px', marginBottom: '16px' }}>Album not found</div>
        <button
          onClick={() => router.back()}
          style={{ background: '#FF6B35', color: '#fff', padding: '12px 24px', borderRadius: '8px', border: 'none', cursor: 'pointer' }}
        >
          Go Back
        </button>
      </div>
    );
  }

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
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '18px', fontWeight: 600 }}>{album.name}</div>
          {album.is_private && (
            <div style={{ fontSize: '12px', color: '#FF6B35' }}>Private Album</div>
          )}
        </div>
        <button
          onClick={() => setDeleteConfirm('album')}
          style={{
            background: 'rgba(255,68,68,0.1)',
            border: '1px solid rgba(255,68,68,0.3)',
            color: '#ff4444',
            padding: '8px 12px',
            borderRadius: '8px',
            fontSize: '13px',
            cursor: 'pointer',
          }}
        >
          Delete Album
        </button>
      </header>

      {/* Album Description */}
      {album.description && (
        <div style={{ padding: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
          {album.description}
        </div>
      )}

      {/* Photos Grid */}
      <div style={{ padding: '8px' }}>
        {photos.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>📷</div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>No Photos</div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)' }}>
              This album is empty
            </div>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' }}>
            {photos.map(photo => (
              <div
                key={photo.id}
                onClick={() => setSelectedPhoto(photo)}
                style={{
                  aspectRatio: '1',
                  background: `url(${photo.public_url}) center/cover`,
                  cursor: 'pointer',
                  borderRadius: '4px',
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Photo Detail Modal */}
      {selectedPhoto && !deleteConfirm && (
        <div
          onClick={() => setSelectedPhoto(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.95)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <button
            onClick={() => setSelectedPhoto(null)}
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
              fontSize: '20px',
              cursor: 'pointer',
            }}
          >
            X
          </button>

          <img
            src={selectedPhoto.public_url}
            alt=""
            onClick={(e) => e.stopPropagation()}
            style={{ maxWidth: '100%', maxHeight: '70vh', objectFit: 'contain', borderRadius: '8px' }}
          />

          {selectedPhoto.caption && (
            <div style={{ marginTop: '16px', color: 'rgba(255,255,255,0.8)', fontSize: '14px', textAlign: 'center' }}>
              {selectedPhoto.caption}
            </div>
          )}

          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirm('photo');
            }}
            style={{
              marginTop: '24px',
              background: 'rgba(255,68,68,0.2)',
              border: '1px solid rgba(255,68,68,0.5)',
              color: '#ff4444',
              padding: '12px 32px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Delete Photo
          </button>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          onClick={() => !deleting && setDeleteConfirm(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            zIndex: 1100,
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
            <div style={{ fontSize: '18px', fontWeight: 600, marginBottom: '12px' }}>
              {deleteConfirm === 'album' ? 'Delete Album?' : 'Delete Photo?'}
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginBottom: '24px' }}>
              {deleteConfirm === 'album'
                ? 'This will permanently delete the album and all photos in it. This cannot be undone.'
                : 'This will permanently delete this photo. This cannot be undone.'}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  setDeleteConfirm(null);
                  if (deleteConfirm === 'photo') setSelectedPhoto(null);
                }}
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
                onClick={deleteConfirm === 'album' ? handleDeleteAlbum : handleDeletePhoto}
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
