// =============================================================================
// MapHeader - Glass style header with Grid, Search, Cruising Update, Menu
// =============================================================================

'use client';

import { useState, useRef, useEffect } from 'react';
import type { MapHeaderProps } from '@/types/map';
import { IconGrid } from '@/components/Icons';

interface ExtendedMapHeaderProps extends MapHeaderProps {
  onRefresh?: () => void;
  onOpenFilters?: () => void;
}

// Icons
const Icons = {
  Search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2"/>
      <path d="M21 21L16.5 16.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Menu: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="6" r="2" fill="currentColor"/>
      <circle cx="12" cy="12" r="2" fill="currentColor"/>
      <circle cx="12" cy="18" r="2" fill="currentColor"/>
    </svg>
  ),
  Refresh: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C15.3019 3 18.1885 4.77814 19.7545 7.42909" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M21 3V8H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
  Filter: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M3 6H21M6 12H18M9 18H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Groups: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <circle cx="9" cy="7" r="3" stroke="currentColor" strokeWidth="2"/>
      <circle cx="17" cy="7" r="2" stroke="currentColor" strokeWidth="2"/>
      <path d="M3 21V18C3 15.7909 4.79086 14 7 14H11C13.2091 14 15 15.7909 15 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M17 14C19.2091 14 21 15.7909 21 18V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Expand: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M15 3H21V9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9 21H3V15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M21 3L14 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <path d="M3 21L10 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    </svg>
  ),
  Cruising: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),
};

// Glass button style
const glassButtonStyle = {
  background: 'rgba(255,255,255,0.03)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '12px',
  color: 'rgba(255,255,255,0.7)',
  cursor: 'pointer',
  transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  textDecoration: 'none',
};

export function MapHeader({ userImage, onRefresh, onOpenFilters }: ExtendedMapHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const menuItems = [
    { key: 'groups', label: 'Groups', icon: Icons.Groups, href: '/groups' },
    { key: 'refresh', label: 'Refresh', icon: Icons.Refresh, onClick: onRefresh },
    { key: 'filters', label: 'Filters', icon: Icons.Filter, onClick: onOpenFilters },
    { key: 'expand', label: 'Expand Map', icon: Icons.Expand, onClick: () => document.documentElement.requestFullscreen?.() },
  ];

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      padding: '12px 16px',
      background: 'rgba(10,10,15,0.85)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
    }}>
      {/* Grid Button */}
      <a
        href="/dashboard"
        style={{
          ...glassButtonStyle,
          width: 44,
          height: 44,
          background: isHovered === 'grid' ? 'rgba(255,107,53,0.1)' : 'rgba(255,255,255,0.03)',
          borderColor: isHovered === 'grid' ? 'rgba(255,107,53,0.3)' : 'rgba(255,255,255,0.08)',
          color: isHovered === 'grid' ? '#FF6B35' : 'rgba(255,255,255,0.7)',
        } as React.CSSProperties}
        onMouseEnter={() => setIsHovered('grid')}
        onMouseLeave={() => setIsHovered(null)}
        aria-label="Back to grid"
      >
        <IconGrid size={20} />
      </a>

      {/* Search Bar */}
      <a
        href="/search"
        style={{
          ...glassButtonStyle,
          flex: 1,
          height: 44,
          padding: '0 16px',
          gap: '10px',
          justifyContent: 'flex-start',
          background: isHovered === 'search' ? 'rgba(255,107,53,0.06)' : 'rgba(255,255,255,0.03)',
          borderColor: isHovered === 'search' ? 'rgba(255,107,53,0.2)' : 'rgba(255,255,255,0.08)',
        } as React.CSSProperties}
        onMouseEnter={() => setIsHovered('search')}
        onMouseLeave={() => setIsHovered(null)}
      >
        <Icons.Search />
        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '11px',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.4)',
        }}>
          Search
        </span>
      </a>

      {/* Cruising Update Button */}
      <a
        href="/cruising"
        style={{
          ...glassButtonStyle,
          height: 44,
          padding: '0 16px',
          gap: '8px',
          background: isHovered === 'cruising'
            ? 'linear-gradient(135deg, rgba(255,107,53,0.2), rgba(255,140,66,0.15))'
            : 'linear-gradient(135deg, rgba(255,107,53,0.1), rgba(255,140,66,0.05))',
          borderColor: isHovered === 'cruising' ? 'rgba(255,107,53,0.4)' : 'rgba(255,107,53,0.2)',
          boxShadow: isHovered === 'cruising'
            ? '0 0 20px rgba(255,107,53,0.2), inset 0 1px 0 rgba(255,255,255,0.1)'
            : 'inset 0 1px 0 rgba(255,255,255,0.05)',
        } as React.CSSProperties}
        onMouseEnter={() => setIsHovered('cruising')}
        onMouseLeave={() => setIsHovered(null)}
      >
        <Icons.Cruising />
        <span style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: '10px',
          fontWeight: 500,
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          color: '#FF6B35',
        }}>
          Cruising
        </span>
      </a>

      {/* Menu Button */}
      <div ref={menuRef} style={{ position: 'relative' }}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            ...glassButtonStyle,
            width: 44,
            height: 44,
            background: menuOpen
              ? 'rgba(255,107,53,0.15)'
              : isHovered === 'menu'
                ? 'rgba(255,107,53,0.1)'
                : 'rgba(255,255,255,0.03)',
            borderColor: menuOpen || isHovered === 'menu'
              ? 'rgba(255,107,53,0.3)'
              : 'rgba(255,255,255,0.08)',
            color: menuOpen || isHovered === 'menu' ? '#FF6B35' : 'rgba(255,255,255,0.7)',
          } as React.CSSProperties}
          onMouseEnter={() => setIsHovered('menu')}
          onMouseLeave={() => setIsHovered(null)}
          aria-label="Menu"
        >
          <Icons.Menu />
        </button>

        {/* Dropdown Menu */}
        {menuOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            right: 0,
            marginTop: '8px',
            background: 'rgba(15,15,20,0.95)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '16px',
            padding: '8px',
            minWidth: '180px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(255,107,53,0.1)',
            zIndex: 1000,
            overflow: 'hidden',
          }}>
            {/* Shine effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '200%',
              height: '1px',
              background: 'linear-gradient(90deg, transparent, rgba(255,107,53,0.5), transparent)',
              animation: 'shimmer 2s ease infinite',
            }} />

            {menuItems.map((item) => {
              const ItemIcon = item.icon;
              const isItemHovered = isHovered === item.key;

              const content = (
                <>
                  <ItemIcon />
                  <span style={{
                    fontFamily: "'Orbitron', sans-serif",
                    fontSize: '11px',
                    letterSpacing: '0.05em',
                  }}>
                    {item.label}
                  </span>
                </>
              );

              const itemStyle: React.CSSProperties = {
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '10px',
                background: isItemHovered ? 'rgba(255,107,53,0.1)' : 'transparent',
                color: isItemHovered ? '#FF6B35' : 'rgba(255,255,255,0.7)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                border: 'none',
                width: '100%',
                textAlign: 'left',
                textDecoration: 'none',
              };

              if (item.href) {
                return (
                  <a
                    key={item.key}
                    href={item.href}
                    style={itemStyle}
                    onMouseEnter={() => setIsHovered(item.key)}
                    onMouseLeave={() => setIsHovered(null)}
                    onClick={() => setMenuOpen(false)}
                  >
                    {content}
                  </a>
                );
              }

              return (
                <button
                  key={item.key}
                  style={itemStyle}
                  onMouseEnter={() => setIsHovered(item.key)}
                  onMouseLeave={() => setIsHovered(null)}
                  onClick={() => {
                    item.onClick?.();
                    setMenuOpen(false);
                  }}
                >
                  {content}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
}
