'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createAlbum, uploadAlbumPhoto } from '../../../../../lib/api/albumMedia';

export default function CreateAlbumPage() {
  const router = useRouter();
  const [albumName, setAlbumName] = useState('');
  const [albumDescription, setAlbumDescription] = useState('');
  const [albumType, setAlbumType] = useState<'public' | 'private'>('public');
  const [media, setMedia] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [expiresIn, setExpiresIn] = useState('never');
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [isClient, setIsClient] = useState(false);

  const MAX_MEDIA = 7;

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleAddMedia = async (type: 'photo' | 'video') => {
    if (media.length >= MAX_MEDIA) {
      setShowLimitWarning(true);
      setTimeout(() => setShowLimitWarning(false), 3000);
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'photo' ? 'image/*' : 'video/*';
    input.multiple = true;

    input.onchange = async (e: any) => {
      const files = e.target.files;
      if (!files) return;

      for (let i = 0; i < files.length; i++) {
        if (media.length + i >= MAX_MEDIA) break;

        const file = files[i];
        const reader = new FileReader();

        reader.onload = (event) => {
          setMedia(prev => [...prev, {
            id: Date.now() + i,
            type,
            url: event.target?.result as string,
            file,
            caption: ''
          }]);
        };
        reader.readAsDataURL(file);
      }
    };

    input.click();
  };

  const handleRemoveMedia = (id: number) => {
    setMedia(media.filter(m => m.id !== id));
  };

  const handleMediaCaption = (id: number, caption: string) => {
    setMedia(media.map(m => m.id === id ? { ...m, caption } : m));
  };

  const handleSave = async () => {
    if (!albumName.trim()) {
      alert('Please enter an album name');
      return;
    }

    if (media.length === 0) {
      alert('Please add at least one photo');
      return;
    }

    setUploading(true);

    try {
      console.log('Creating album:', { albumName, albumDescription, isPrivate: albumType === 'private' });

      // Create album in database
      const album = await createAlbum(
        albumName,
        albumDescription,
        albumType === 'private'
      );

      console.log('Album created:', album);

      // Upload all photos
      for (let i = 0; i < media.length; i++) {
        const photo = media[i];
        if (photo.file) {
          console.log(`Uploading photo ${i + 1}/${media.length}`);
          await uploadAlbumPhoto(photo.file, album.id, {
            caption: photo.caption || undefined,
            isPrivate: albumType === 'private'
          });
        }
      }

      console.log('All photos uploaded');
      router.push('/profile/edit');
    } catch (error: any) {
      console.error('Album creation error:', error);
      alert(error.message || 'Failed to create album. Check console for details.');
    } finally {
      setUploading(false);
    }
  };
  if (!isClient) {
    return <div style={{ minHeight: '100vh', background: '#000' }} />;
  }

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff', paddingBottom: '100px' }}>
      {/* Header */}
      <header style={{ padding: '15px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid #1c1c1e', position: 'sticky', top: 0, background: '#000', zIndex: 100 }}>
        <button 
          onClick={() => router.back()}
          style={{ color: '#FF6B35', background: 'none', border: 'none', fontSize: '16px', cursor: 'pointer' }}
        >
          Cancel
        </button>
        <span style={{ fontSize: '17px', fontWeight: 600 }}>Create Album</span>
        <button 
          onClick={handleSave}
          style={{ color: '#FF6B35', background: 'none', border: 'none', fontSize: '16px', fontWeight: 600, cursor: 'pointer' }}
        >
          Create
        </button>
      </header>

      {/* Content */}
      <div style={{ padding: '20px' }}>
        {/* Album Name */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '8px' }}>
            Album Name *
          </label>
          <input
            type="text"
            value={albumName}
            onChange={(e) => setAlbumName(e.target.value)}
            placeholder="e.g., Beach Trip 2025"
            maxLength={30}
            style={{
              width: '100%',
              background: '#1c1c1e',
              border: '1px solid #333',
              borderRadius: '10px',
              padding: '14px',
              color: '#fff',
              fontSize: '16px',
              boxSizing: 'border-box'
            }}
          />
          <div style={{ fontSize: '12px', color: '#666', marginTop: '6px' }}>
            {albumName.length}/30 characters
          </div>
        </div>

        {/* Album Type */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '12px' }}>
            Privacy
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              onClick={() => setAlbumType('public')}
              style={{
                flex: 1,
                background: albumType === 'public' ? '#FF6B35' : '#1c1c1e',
                border: albumType === 'public' ? '1px solid #FF6B35' : '1px solid #333',
                borderRadius: '12px',
                padding: '16px',
                color: '#fff',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              🌍 Public
            </button>
            <button
              type="button"
              onClick={() => setAlbumType('private')}
              style={{
                flex: 1,
                background: albumType === 'private' ? '#FF6B35' : '#1c1c1e',
                border: albumType === 'private' ? '1px solid #FF6B35' : '1px solid #333',
                borderRadius: '12px',
                padding: '16px',
                color: '#fff',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              🔒 Private
            </button>
          </div>
        </div>

        {/* Expiring Albums */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ fontSize: '13px', color: '#888', marginBottom: '12px', display: 'block' }}>
            Auto-Delete After (Premium)
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
            {[
              { value: 'never', label: 'Never' },
              { value: '1h', label: '1h' },
              { value: '24h', label: '24h' },
              { value: '7d', label: '7d' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setExpiresIn(option.value)}
                style={{
                  background: expiresIn === option.value ? 'rgba(255,107,53,0.2)' : '#1c1c1e',
                  border: expiresIn === option.value ? '1px solid #FF6B35' : '1px solid #333',
                  borderRadius: '12px',
                  padding: '12px',
                  color: '#fff',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Media Grid */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <label style={{ fontSize: '13px', color: '#888' }}>
              Photos & Videos
            </label>
            <span style={{ fontSize: '12px', color: '#666' }}>
              {media.length}/{MAX_MEDIA}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', marginBottom: '12px' }}>
            {media.map((item) => (
              <div
                key={item.id}
                style={{
                  position: 'relative',
                  paddingBottom: '100%',
                  background: '#1c1c1e',
                  borderRadius: '12px',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundImage: `url(${item.url})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                />
                <button
                  onClick={() => handleRemoveMedia(item.id)}
                  style={{
                    position: 'absolute',
                    top: '6px',
                    right: '6px',
                    background: 'rgba(0,0,0,0.7)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '24px',
                    height: '24px',
                    color: '#fff',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          {/* Add Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleAddMedia('photo')}
              disabled={media.length >= MAX_MEDIA}
              style={{
                flex: 1,
                background: '#1c1c1e',
                border: '1px dashed #333',
                borderRadius: '12px',
                padding: '16px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              📷 Add Photo
            </button>
            <button
              onClick={() => handleAddMedia('video')}
              disabled={media.length >= MAX_MEDIA}
              style={{
                flex: 1,
                background: '#1c1c1e',
                border: '1px dashed #333',
                borderRadius: '12px',
                padding: '16px',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              🎥 Add Video
            </button>
          </div>

          {showLimitWarning && (
            <div style={{
              marginTop: '12px',
              background: 'rgba(255,107,53,0.1)',
              border: '1px solid #FF6B35',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '13px',
              color: '#FF6B35',
              textAlign: 'center'
            }}>
              ⚠️ Maximum {MAX_MEDIA} items per album
            </div>
          )}
        </div>
      </div>

      {/* Create Button (Fixed) */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        padding: '16px 20px',
        background: '#000',
        borderTop: '1px solid #1c1c1e',
        zIndex: 99
      }}>
        <button
          type="button"
          onClick={handleSave}
          disabled={uploading}
          style={{
            width: '100%',
            background: uploading ? '#666' : '#FF6B35',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 600,
            cursor: uploading ? 'not-allowed' : 'pointer',
            boxSizing: 'border-box'
          }}
        >
          {uploading ? 'Creating...' : 'Create Album'}
        </button>
      </div>
    </div>
  );
}
