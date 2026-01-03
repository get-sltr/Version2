'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function CruisingUpdatesPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<'time' | 'distance'>('time');
  const [updateText, setUpdateText] = useState('');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [updates, setUpdates] = useState<any[]>([]);

  useEffect(() => {
    // Generate mock cruising updates
    const mockUpdates = [
      {
        id: 1,
        userId: 1,
        name: null, // Anonymous - shows body stats
        stats: '5\'7", 165lb, average, bottom',
        image: '/images/5.jpg',
        text: 'I\'m hosting.',
        timestamp: '8 minutes ago',
        distance: '0.75 miles',
        online: true,
        isHosting: true
      },
      {
        id: 2,
        userId: 2,
        name: '21',
        stats: null,
        image: '/images/6.jpg',
        text: '19-24 make out/oral. hung/fit bro hmu',
        timestamp: '4 minutes ago',
        distance: '2.00 miles',
        online: true,
        isHosting: false
      },
      {
        id: 3,
        userId: 3,
        name: null,
        stats: '62, 5\'5", 185lb, 6" cut, chubby, gay, side, d...',
        image: '/images/5.jpg',
        text: 'I\'m at echo lake park right now',
        timestamp: '2 minutes ago',
        distance: '2.50 miles',
        online: true,
        isHosting: false
      },
      {
        id: 4,
        userId: 4,
        name: 'Bottom',
        stats: null,
        image: '/images/6.jpg',
        text: 'I\'m hosting.',
        timestamp: 'a minute ago',
        distance: '1.50 miles',
        online: true,
        isHosting: true
      },
      {
        id: 5,
        userId: 5,
        name: null,
        stats: '5\'9", 195lb, 6.5" uncut, average, vers',
        image: '/images/5.jpg',
        text: 'I\'m hosting.',
        timestamp: 'a few seconds ago',
        distance: '1.75 miles',
        online: true,
        isHosting: true
      }
    ];
    
    setUpdates(mockUpdates);
  }, []);

  const handlePostUpdate = () => {
    if (!updateText.trim()) return;
    
    // Add new update
    const newUpdate = {
      id: Date.now(),
      userId: 999,
      name: 'You',
      stats: null,
      image: '/images/5.jpg',
      text: updateText,
      timestamp: 'just now',
      distance: '0 miles',
      online: true,
      isHosting: false
    };
    
    setUpdates([newUpdate, ...updates]);
    setUpdateText('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1c1c1e',
        padding: '12px 20px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <button
          onClick={() => router.back()}
          style={{
            background: 'none',
            border: 'none',
            color: '#FF6B35',
            fontSize: '28px',
            cursor: 'pointer',
            padding: 0,
            lineHeight: 1
          }}
        >
          ←
        </button>
        
        <h1 style={{
          fontSize: '18px',
          fontWeight: 700,
          margin: 0,
          flex: 1,
          textAlign: 'center'
        }}>
          Cruising Updates
        </h1>
        
        <button
          onClick={() => setShowSortMenu(!showSortMenu)}
          style={{
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '24px',
            cursor: 'pointer',
            padding: 0,
            position: 'relative'
          }}
        >
          ☰
        </button>

        {/* Sort Menu Dropdown */}
        {showSortMenu && (
          <>
            <div 
              onClick={() => setShowSortMenu(false)}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.6)',
                zIndex: 998
              }}
            />
            <div style={{
              position: 'absolute',
              top: '60px',
              right: '20px',
              background: '#1c1c1e',
              borderRadius: '12px',
              overflow: 'hidden',
              zIndex: 999,
              minWidth: '160px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
            }}>
              <button
                onClick={() => {
                  setSortBy('time');
                  setShowSortMenu(false);
                }}
                style={{
                  width: '100%',
                  background: sortBy === 'time' ? 'rgba(255,107,53,0.2)' : 'transparent',
                  border: 'none',
                  padding: '14px 16px',
                  color: sortBy === 'time' ? '#FF6B35' : '#fff',
                  fontSize: '15px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  borderBottom: '1px solid #333'
                }}
              >
                Sort by Time
              </button>
              <button
                onClick={() => {
                  setSortBy('distance');
                  setShowSortMenu(false);
                }}
                style={{
                  width: '100%',
                  background: sortBy === 'distance' ? 'rgba(255,107,53,0.2)' : 'transparent',
                  border: 'none',
                  padding: '14px 16px',
                  color: sortBy === 'distance' ? '#FF6B35' : '#fff',
                  fontSize: '15px',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                Sort by Distance
              </button>
            </div>
          </>
        )}
      </header>

      {/* Sort By Indicator */}
      <div style={{
        padding: '12px 20px',
        display: 'flex',
        justifyContent: 'flex-end',
        fontSize: '13px',
        color: '#888'
      }}>
        Sort by: <span style={{ color: '#fff', marginLeft: '6px', textDecoration: 'underline' }}>
          {sortBy === 'time' ? 'Time' : 'Distance'}
        </span>
      </div>

      {/* Updates Feed */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        paddingBottom: '140px'
      }}>
        {updates.map((update, index) => (
          <div
            key={update.id}
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid #1c1c1e',
              display: 'flex',
              gap: '12px',
              position: 'relative'
            }}
          >
            {/* Profile Image */}
            <div style={{ position: 'relative', flexShrink: 0 }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  backgroundImage: `url(${update.image})`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  border: '2px solid #333'
                }}
              />
              {/* Online Indicator */}
              {update.online && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: '#007AFF',
                  border: '2px solid #000'
                }} />
              )}
              {/* Hosting Badge */}
              {update.isHosting && (
                <div style={{
                  position: 'absolute',
                  bottom: 0,
                  right: -4,
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  background: '#FF6B35',
                  border: '2px solid #000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '14px'
                }}>
                  🔊
                </div>
              )}
            </div>

            {/* Update Content */}
            <div style={{ flex: 1, minWidth: 0 }}>
              {/* Name/Stats */}
              <div style={{
                fontSize: '14px',
                color: '#aaa',
                marginBottom: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: '12px'
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {update.name || update.stats}
                </div>
                <div style={{
                  fontSize: '13px',
                  fontStyle: 'italic',
                  color: '#888',
                  whiteSpace: 'nowrap'
                }}>
                  {update.timestamp}, {update.distance}
                </div>
              </div>

              {/* Update Text */}
              <div style={{
                fontSize: '16px',
                color: update.isHosting ? '#FF6B35' : '#4A9EFF',
                marginBottom: '8px',
                lineHeight: 1.4
              }}>
                {update.text}
              </div>
            </div>

            {/* Navigate Button */}
            <button
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                fontSize: '28px',
                cursor: 'pointer',
                padding: 0,
                flexShrink: 0,
                lineHeight: 1
              }}
            >
              🎯
            </button>

            {/* More Menu */}
            <button
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '20px',
                background: 'none',
                border: 'none',
                color: '#666',
                fontSize: '20px',
                cursor: 'pointer',
                padding: 0
              }}
            >
              ⋯
            </button>
          </div>
        ))}

        {/* New Updates Banner */}
        <div style={{
          position: 'sticky',
          bottom: '80px',
          left: 0,
          right: 0,
          padding: '20px',
          display: 'flex',
          justifyContent: 'center',
          pointerEvents: 'none'
        }}>
          <button
            onClick={() => {
              // Scroll to top and refresh updates
              window.scrollTo({ top: 0, behavior: 'smooth' });
              // TODO: Fetch new updates from API when implemented
            }}
            style={{
              background: '#007AFF',
              borderRadius: '24px',
              padding: '12px 24px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 20px rgba(0,122,255,0.4)',
              pointerEvents: 'all'
            }}
          >
            ↓ See New Updates
          </button>
        </div>
      </div>

      {/* Post Input */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        background: '#000',
        borderTop: '1px solid #1c1c1e',
        padding: '16px 20px 24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <input
          type="text"
          value={updateText}
          onChange={(e) => setUpdateText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handlePostUpdate()}
          placeholder="Post a Cruising Update..."
          style={{
            flex: 1,
            background: '#1c1c1e',
            border: 'none',
            borderRadius: '24px',
            padding: '14px 20px',
            color: '#fff',
            fontSize: '15px',
            outline: 'none'
          }}
        />
        <button
          onClick={handlePostUpdate}
          disabled={!updateText.trim()}
          style={{
            background: updateText.trim() ? '#FF6B35' : '#333',
            border: 'none',
            borderRadius: '50%',
            width: '48px',
            height: '48px',
            color: '#fff',
            fontSize: '20px',
            cursor: updateText.trim() ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            opacity: updateText.trim() ? 1 : 0.5,
            transition: 'all 0.2s'
          }}
        >
          ➤
        </button>
      </div>
    </div>
  );
}
