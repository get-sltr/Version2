'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createAlbum } from '@/lib/api/albumMedia';
import { IconBack } from '@/components/Icons';

export default function CreateAlbumPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPrivate, setIsPrivate] = useState(false);
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      alert('Please enter an album name');
      return;
    }

    setCreating(true);
    try {
      const album = await createAlbum(name.trim(), description.trim(), isPrivate);
      router.replace(`/profile/edit/albums/${album.id}`);
    } catch (err) {
      console.error('Failed to create album:', err);
      alert('Failed to create album');
      setCreating(false);
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
        justifyContent: 'space-between',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        zIndex: 100,
      }}>
        <button
          onClick={() => router.back()}
          style={{ background: 'none', border: 'none', color: '#FF6B35', cursor: 'pointer', padding: '8px' }}
        >
          <IconBack size={24} />
        </button>
        <span style={{ fontSize: '18px', fontWeight: 600 }}>New Album</span>
        <button
          onClick={handleCreate}
          disabled={creating || !name.trim()}
          style={{
            background: name.trim() ? '#FF6B35' : 'rgba(255,255,255,0.1)',
            color: name.trim() ? '#fff' : 'rgba(255,255,255,0.3)',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            fontSize: '14px',
            fontWeight: 600,
            cursor: creating || !name.trim() ? 'not-allowed' : 'pointer',
          }}
        >
          {creating ? 'Creating...' : 'Create'}
        </button>
      </header>

      <div style={{ padding: '20px' }}>
        {/* Album Name */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>
            Album Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Summer 2024"
            maxLength={50}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '16px',
              outline: 'none',
            }}
          />
        </div>

        {/* Description */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '8px', color: 'rgba(255,255,255,0.7)' }}>
            Description (optional)
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add a description..."
            maxLength={200}
            rows={3}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              color: '#fff',
              fontSize: '16px',
              outline: 'none',
              resize: 'none',
            }}
          />
        </div>

        {/* Private Toggle */}
        <div
          onClick={() => setIsPrivate(!isPrivate)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '12px',
            cursor: 'pointer',
          }}
        >
          <div>
            <div style={{ fontSize: '16px', fontWeight: 600, marginBottom: '4px' }}>Private Album</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)' }}>
              Only people you share with can see this album
            </div>
          </div>
          <div style={{
            width: '52px',
            height: '32px',
            borderRadius: '16px',
            background: isPrivate ? '#FF6B35' : 'rgba(255,255,255,0.2)',
            position: 'relative',
            transition: 'background 0.2s',
          }}>
            <div style={{
              position: 'absolute',
              top: '3px',
              left: isPrivate ? '23px' : '3px',
              width: '26px',
              height: '26px',
              borderRadius: '13px',
              background: '#fff',
              transition: 'left 0.2s',
            }} />
          </div>
        </div>

        <div style={{ marginTop: '16px', padding: '16px', background: 'rgba(255,107,53,0.1)', borderRadius: '12px', border: '1px solid rgba(255,107,53,0.2)' }}>
          <div style={{ fontSize: '13px', color: '#FF6B35', lineHeight: 1.5 }}>
            <strong>Tip:</strong> Private albums are perfect for explicit photos. Only users you grant access to can view them.
          </div>
        </div>
      </div>
    </div>
  );
}
