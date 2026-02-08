'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { IconSearch, IconMap, IconUser, IconCheck, IconCrown, IconClose, IconStar } from '@/components/Icons';

// Sample mock data for preview
const mockProfiles = [
  { id: 1, name: 'Alex', age: 28, distance: '0.3 mi', online: true, isPremium: true, dth: true },
  { id: 2, name: 'Jordan', age: 32, distance: '0.5 mi', online: true, isPremium: false, dth: false },
  { id: 3, name: 'Sam', age: 25, distance: '0.8 mi', online: false, isPremium: true, dth: true },
  { id: 4, name: 'Riley', age: 30, distance: '1.2 mi', online: true, isPremium: false, dth: false },
  { id: 5, name: 'Casey', age: 27, distance: '1.5 mi', online: true, isPremium: true, dth: false },
  { id: 6, name: 'Morgan', age: 34, distance: '2.1 mi', online: false, isPremium: false, dth: true },
  { id: 7, name: 'Taylor', age: 29, distance: '2.4 mi', online: true, isPremium: false, dth: false },
  { id: 8, name: 'Drew', age: 31, distance: '3.0 mi', online: true, isPremium: true, dth: false },
  { id: 9, name: 'Quinn', age: 26, distance: '3.5 mi', online: false, isPremium: false, dth: true },
];

const filters = [
  { id: 'online', label: 'Online', icon: 'dot' },
  { id: 'dth', label: 'DTH', icon: 'droplet' },
  { id: 'age', label: 'Age' },
  { id: 'position', label: 'Position' },
  { id: 'tribes', label: 'Tribes' },
  { id: 'fresh', label: 'New', icon: 'star' },
  { id: 'photos', label: 'Photos', icon: 'camera' },
];

export default function GridMockup() {
  const [activeFilter, setActiveFilter] = useState('online');
  const [showAd, setShowAd] = useState(true);

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: "'Orbitron', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Video Background */}
      <video
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          zIndex: 0,
          opacity: 0.4,
        }}
      >
        <source src="/Videos/premiumpage.mp4" type="video/mp4" />
      </video>

      {/* Dark overlay for readability */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.8) 100%)',
        zIndex: 1,
        pointerEvents: 'none',
      }} />

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 10, paddingBottom: '100px' }}>

        {/* Liquid Glass Header */}
        <motion.header
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          style={{
            position: 'sticky',
            top: 0,
            zIndex: 100,
            padding: '12px 15px',
            background: 'rgba(10, 10, 15, 0.6)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          {/* Top Row: Avatar, Search, Map */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
            {/* User Avatar - Glass Style */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255,107,53,0.3) 0%, rgba(255,107,53,0.1) 100%)',
                border: '2px solid rgba(255, 107, 53, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                position: 'relative',
                overflow: 'hidden',
                cursor: 'pointer',
                boxShadow: '0 0 20px rgba(255, 107, 53, 0.3), inset 0 1px 0 rgba(255,255,255,0.2)',
              }}
            >
              {/* Shine effect */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '200%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
                animation: 'avatarShine 3s ease-in-out infinite',
              }} />
              <IconUser size={20} />
            </motion.div>

            {/* Search Input - Glass Style */}
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                placeholder="Search city..."
                style={{
                  width: '100%',
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  WebkitBackdropFilter: 'blur(10px)',
                  borderRadius: '12px',
                  padding: '14px 45px 14px 16px',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: '#fff',
                  fontSize: '14px',
                  outline: 'none',
                  fontFamily: 'inherit',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.1), 0 4px 15px rgba(0,0,0,0.2)',
                }}
              />
              <button style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'rgba(255, 255, 255, 0.5)',
                cursor: 'pointer',
                padding: '4px',
              }}>
                <IconSearch size={18} />
              </button>
            </div>

            {/* Map Button - Glass Style with Shine */}
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: '0 0 30px rgba(255, 107, 53, 0.5)' }}
              whileTap={{ scale: 0.95 }}
              style={{
                background: 'rgba(255, 107, 53, 0.15)',
                border: '1px solid rgba(255, 107, 53, 0.5)',
                borderRadius: '10px',
                padding: '12px 20px',
                color: '#FF6B35',
                fontSize: '13px',
                fontWeight: 700,
                letterSpacing: '1px',
                cursor: 'pointer',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 4px 20px rgba(255, 107, 53, 0.25), inset 0 1px 0 rgba(255,255,255,0.2)',
                fontFamily: 'inherit',
              }}
            >
              {/* Shine animation */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: '-100%',
                width: '200%',
                height: '100%',
                background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
                animation: 'buttonShine 2.5s ease-in-out infinite',
              }} />
              <IconMap size={14} />
              <span style={{ position: 'relative', zIndex: 1 }}>MAP</span>
            </motion.button>
          </div>

          {/* Filter Row - Scrollable Glass Chips */}
          <div style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            paddingBottom: '5px',
            marginLeft: '-15px',
            marginRight: '-15px',
            paddingLeft: '15px',
            paddingRight: '15px',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}>
            {/* Faves Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '10px',
                padding: '10px 16px',
                color: '#FF6B35',
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.5px',
                cursor: 'pointer',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'inherit',
              }}
            >
              <IconStar size={14} />
              Faves
            </motion.button>

            {/* Filter Chips */}
            {filters.map((filter) => {
              const isActive = activeFilter === filter.id;
              return (
                <motion.button
                  key={filter.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setActiveFilter(filter.id)}
                  style={{
                    background: isActive
                      ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.25) 0%, rgba(255, 107, 53, 0.15) 100%)'
                      : 'rgba(255, 255, 255, 0.05)',
                    border: isActive
                      ? '1px solid rgba(255, 107, 53, 0.6)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '10px',
                    padding: '10px 16px',
                    color: isActive ? '#FF6B35' : 'rgba(255, 255, 255, 0.7)',
                    fontSize: '12px',
                    fontWeight: 600,
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    position: 'relative',
                    overflow: 'hidden',
                    boxShadow: isActive ? '0 4px 20px rgba(255, 107, 53, 0.2)' : 'none',
                    fontFamily: 'inherit',
                  }}
                >
                  {/* Shine on active */}
                  {isActive && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: '-100%',
                      width: '200%',
                      height: '100%',
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 50%, transparent 100%)',
                      animation: 'buttonShine 3s ease-in-out infinite',
                    }} />
                  )}

                  {/* Icons */}
                  {filter.icon === 'dot' && (
                    <span style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      background: '#4caf50',
                      boxShadow: '0 0 8px rgba(76, 175, 80, 0.6)',
                    }} />
                  )}
                  {filter.icon === 'droplet' && (
                    <svg style={{ width: '14px', height: '14px', fill: isActive ? '#FF6B35' : 'rgba(255,255,255,0.7)' }} viewBox="0 0 24 24">
                      <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
                    </svg>
                  )}
                  {filter.icon === 'star' && (
                    <svg style={{ width: '14px', height: '14px', fill: isActive ? '#FF6B35' : 'rgba(255,255,255,0.7)' }} viewBox="0 0 24 24">
                      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"/>
                    </svg>
                  )}
                  {filter.icon === 'camera' && (
                    <svg style={{ width: '14px', height: '14px', fill: isActive ? '#FF6B35' : 'rgba(255,255,255,0.7)' }} viewBox="0 0 24 24">
                      <path d="M4 4H7L9 2H15L17 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6C2 4.9 2.9 4 4 4ZM12 17C14.76 17 17 14.76 17 12C17 9.24 14.76 7 12 7C9.24 7 7 9.24 7 12C7 14.76 9.24 17 12 17Z"/>
                    </svg>
                  )}

                  <span style={{ position: 'relative', zIndex: 1 }}>{filter.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.header>

        {/* Premium Ad Banner - Glass Style */}
        {showAd && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            style={{
              margin: '12px 15px',
              background: 'rgba(255, 107, 53, 0.08)',
              backdropFilter: 'blur(15px)',
              WebkitBackdropFilter: 'blur(15px)',
              borderRadius: '16px',
              padding: '16px',
              position: 'relative',
              border: '1px solid rgba(255, 107, 53, 0.2)',
              overflow: 'hidden',
            }}
          >
            {/* Background shine */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '200%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 50%, transparent 100%)',
              animation: 'buttonShine 4s ease-in-out infinite',
            }} />

            <button
              onClick={() => setShowAd(false)}
              style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                borderRadius: '50%',
                width: '26px',
                height: '26px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 2,
              }}
            >
              <IconClose size={12} />
            </button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.4) 0%, rgba(255, 107, 53, 0.2) 100%)',
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px rgba(255, 107, 53, 0.3)',
                }}>
                  <IconCrown size={24} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: '#fff' }}>Upgrade to Primal+</h3>
                  <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'rgba(255, 255, 255, 0.6)' }}>Unlimited profiles, no ads, see who viewed you</p>
                </div>
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  background: 'linear-gradient(135deg, #FF6B35 0%, #ff8a5c 100%)',
                  color: '#fff',
                  padding: '12px 24px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 700,
                  border: 'none',
                  cursor: 'pointer',
                  boxShadow: '0 4px 20px rgba(255, 107, 53, 0.4)',
                  fontFamily: 'inherit',
                }}
              >
                Upgrade
              </motion.button>
            </div>
          </motion.div>
        )}

        {/* Profile Grid - Glass Cards */}
        <main style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '3px',
          padding: '3px',
        }}>
          {mockProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ scale: 1.02, zIndex: 10 }}
              style={{
                aspectRatio: '1',
                position: 'relative',
                borderRadius: '4px',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
            >
              {/* Placeholder gradient background */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: `linear-gradient(135deg,
                  hsl(${(index * 40) % 360}, 30%, 20%) 0%,
                  hsl(${(index * 40 + 30) % 360}, 40%, 15%) 100%)`,
              }} />

              {/* Glass overlay on hover */}
              <div style={{
                position: 'absolute',
                inset: 0,
                background: 'rgba(0, 0, 0, 0.2)',
                opacity: 0,
                transition: 'opacity 0.3s',
              }} />

              {/* Premium Badge */}
              {profile.isPremium && (
                <div style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.9) 0%, rgba(255, 140, 90, 0.9) 100%)',
                  borderRadius: '4px',
                  padding: '3px 6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '3px',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                }}>
                  <IconCrown size={10} />
                  <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.5px' }}>PRO</span>
                </div>
              )}

              {/* DTH Badge */}
              {profile.dth && (
                <div style={{
                  position: 'absolute',
                  top: profile.isPremium ? '28px' : '6px',
                  right: '6px',
                  background: 'rgba(0, 150, 255, 0.8)',
                  borderRadius: '4px',
                  padding: '3px 6px',
                  backdropFilter: 'blur(5px)',
                  WebkitBackdropFilter: 'blur(5px)',
                }}>
                  <span style={{ fontSize: '8px', fontWeight: 700, letterSpacing: '0.5px' }}>DTH</span>
                </div>
              )}

              {/* Bottom Info Overlay - Glass Style */}
              <div style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                background: 'linear-gradient(transparent 0%, rgba(0,0,0,0.7) 40%, rgba(0,0,0,0.9) 100%)',
                padding: '25px 8px 8px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                  {/* Online indicator */}
                  {profile.online && (
                    <span style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '50%',
                      background: '#4caf50',
                      boxShadow: '0 0 6px rgba(76, 175, 80, 0.8)',
                      flexShrink: 0,
                    }} />
                  )}
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#fff',
                    textShadow: '0 1px 3px rgba(0,0,0,0.5)',
                  }}>
                    {profile.name}, {profile.age}
                  </span>
                </div>
                <div style={{
                  fontSize: '10px',
                  color: 'rgba(255, 255, 255, 0.6)',
                  marginTop: '2px',
                }}>
                  {profile.distance}
                </div>
              </div>
            </motion.div>
          ))}
        </main>

        {/* DTH Floating Button - Glass Style */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          style={{
            position: 'fixed',
            bottom: '100px',
            right: '15px',
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.9) 0%, rgba(255, 140, 90, 0.9) 100%)',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 6px 30px rgba(255, 107, 53, 0.5), inset 0 2px 0 rgba(255,255,255,0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            zIndex: 50,
          }}
        >
          <svg style={{ width: '24px', height: '24px', fill: '#fff' }} viewBox="0 0 24 24">
            <path d="M12 2C12 2 5 10 5 15C5 18.866 8.134 22 12 22C15.866 22 19 18.866 19 15C19 10 12 2 12 2Z" />
          </svg>
        </motion.button>

        {/* Bottom Nav - Glass Style */}
        <nav style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: 'rgba(10, 10, 15, 0.8)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          padding: '10px 0 25px',
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          zIndex: 100,
        }}>
          {[
            { icon: 'grid', label: 'Browse', active: true },
            { icon: 'heart', label: 'Likes', badge: 5 },
            { icon: 'tap', label: 'Taps', badge: 3 },
            { icon: 'message', label: 'Chat', badge: 12 },
          ].map((item, index) => (
            <motion.button
              key={index}
              whileTap={{ scale: 0.9 }}
              style={{
                background: 'none',
                border: 'none',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                position: 'relative',
                padding: '8px 16px',
              }}
            >
              {/* Badge */}
              {item.badge && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  right: '8px',
                  background: '#FF6B35',
                  color: '#fff',
                  fontSize: '9px',
                  fontWeight: 700,
                  padding: '2px 5px',
                  borderRadius: '8px',
                  minWidth: '16px',
                  textAlign: 'center',
                }}>
                  {item.badge}
                </span>
              )}

              {/* Icon placeholder */}
              <div style={{
                width: '24px',
                height: '24px',
                borderRadius: '6px',
                background: item.active ? 'rgba(255, 107, 53, 0.2)' : 'transparent',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <span style={{
                  fontSize: '16px',
                  color: item.active ? '#FF6B35' : 'rgba(255,255,255,0.5)',
                }}>
                  {item.icon === 'grid' && '▦'}
                  {item.icon === 'heart' && '♡'}
                  {item.icon === 'tap' && '👆'}
                  {item.icon === 'message' && '💬'}
                </span>
              </div>

              <span style={{
                fontSize: '10px',
                fontWeight: 500,
                color: item.active ? '#FF6B35' : 'rgba(255,255,255,0.5)',
              }}>
                {item.label}
              </span>
            </motion.button>
          ))}
        </nav>
      </div>

      {/* Global Styles */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700;800&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Hide scrollbar for filter row */
        div::-webkit-scrollbar {
          display: none;
        }

        @keyframes buttonShine {
          0% { left: -100%; }
          50%, 100% { left: 150%; }
        }

        @keyframes avatarShine {
          0% { left: -100%; }
          50%, 100% { left: 150%; }
        }
      `}</style>
    </div>
  );
}
