'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePremium } from '@/hooks/usePremium';
import { PremiumPromo } from '@/components/PremiumPromo';

export default function TravelModePage() {
  const router = useRouter();
  const { isPremium, isLoading: premiumLoading } = usePremium();
  const [isActive, setIsActive] = useState(false);
  const [city, setCity] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showCitySearch, setShowCitySearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Show promo for non-premium users
  if (!premiumLoading && !isPremium) {
    return <PremiumPromo feature="Travel Mode" fullPage />;
  }

  const popularCities = [
    { name: 'New York, NY', country: 'USA', icon: '🗽' },
    { name: 'Los Angeles, CA', country: 'USA', icon: '🌴' },
    { name: 'San Francisco, CA', country: 'USA', icon: '🌉' },
    { name: 'Chicago, IL', country: 'USA', icon: '🏙️' },
    { name: 'Miami, FL', country: 'USA', icon: '🏖️' },
    { name: 'Las Vegas, NV', country: 'USA', icon: '🎰' },
    { name: 'London', country: 'UK', icon: '🇬🇧' },
    { name: 'Paris', country: 'France', icon: '🇫🇷' },
    { name: 'Barcelona', country: 'Spain', icon: '🇪🇸' },
    { name: 'Amsterdam', country: 'Netherlands', icon: '🇳🇱' },
    { name: 'Berlin', country: 'Germany', icon: '🇩🇪' },
    { name: 'Tokyo', country: 'Japan', icon: '🇯🇵' },
    { name: 'Bangkok', country: 'Thailand', icon: '🇹🇭' },
    { name: 'Sydney', country: 'Australia', icon: '🇦🇺' },
    { name: 'Mexico City', country: 'Mexico', icon: '🇲🇽' },
    { name: 'Toronto', country: 'Canada', icon: '🇨🇦' }
  ];

  const filteredCities = popularCities.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.country.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    // Load saved travel mode settings
    const saved = localStorage.getItem('travelMode');
    if (saved) {
      const data = JSON.parse(saved);
      setIsActive(data.isActive || false);
      setCity(data.city || '');
      setStartDate(data.startDate || '');
      setEndDate(data.endDate || '');
    }
  }, []);

  const handleSave = () => {
    if (!city || !startDate || !endDate) {
      alert('Please select city and dates');
      return;
    }

    const travelData = {
      isActive: true,
      city,
      startDate,
      endDate
    };

    localStorage.setItem('travelMode', JSON.stringify(travelData));
    setIsActive(true);
    router.back();
  };

  const handleDeactivate = () => {
    localStorage.removeItem('travelMode');
    setIsActive(false);
    setCity('');
    setStartDate('');
    setEndDate('');
  };

  const selectCity = (cityName: string) => {
    setCity(cityName);
    setShowCitySearch(false);
    setSearchQuery('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: '#000',
      color: '#fff',
      fontFamily: "'Cormorant Garamond', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, serif"
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        background: 'rgba(0,0,0,0.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid #1c1c1e',
        padding: '16px 20px',
        zIndex: 100,
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
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
        <h1 style={{ fontSize: '20px', fontWeight: 700, margin: 0 }}>
          Travel Mode
        </h1>
      </header>

      <div style={{ padding: '20px' }}>
        {/* Info Banner */}
        <div style={{
          background: 'rgba(255,107,53,0.1)',
          border: '1px solid rgba(255,107,53,0.3)',
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '24px'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '12px', textAlign: 'center' }}>✈️</div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px', textAlign: 'center' }}>
            Browse Before You Travel
          </h3>
          <p style={{ fontSize: '14px', color: '#aaa', lineHeight: 1.6, textAlign: 'center' }}>
            Set your destination and travel dates. Your profile will appear in that city, and you'll see profiles from there.
          </p>
        </div>

        {/* Active Travel Mode Banner */}
        {isActive && city && (
          <div style={{
            background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>🌍</div>
            <div style={{ fontSize: '18px', fontWeight: 700, marginBottom: '4px' }}>
              Travel Mode Active
            </div>
            <div style={{ fontSize: '14px', opacity: 0.9 }}>
              {city}
            </div>
            <div style={{ fontSize: '13px', opacity: 0.8, marginTop: '4px' }}>
              {startDate} - {endDate}
            </div>
            <button
              onClick={handleDeactivate}
              style={{
                marginTop: '16px',
                background: 'rgba(0,0,0,0.2)',
                border: 'none',
                borderRadius: '12px',
                padding: '10px 24px',
                color: '#fff',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              Deactivate
            </button>
          </div>
        )}

        {/* City Selection */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            Destination City
          </label>
          <button
            onClick={() => setShowCitySearch(true)}
            style={{
              width: '100%',
              background: '#1c1c1e',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '16px',
              color: city ? '#fff' : '#666',
              fontSize: '16px',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span>{city || 'Select a city...'}</span>
            <span style={{ fontSize: '20px' }}>🌍</span>
          </button>
        </div>

        {/* Date Range */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{ display: 'block', fontSize: '14px', fontWeight: 600, marginBottom: '12px' }}>
            Travel Dates
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                Start Date
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  background: '#1c1c1e',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '12px', color: '#888', marginBottom: '8px' }}>
                End Date
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                min={startDate || new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  background: '#1c1c1e',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={!city || !startDate || !endDate}
          style={{
            width: '100%',
            background: (city && startDate && endDate) ? '#FF6B35' : '#333',
            border: 'none',
            borderRadius: '12px',
            padding: '16px',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 700,
            cursor: (city && startDate && endDate) ? 'pointer' : 'not-allowed',
            opacity: (city && startDate && endDate) ? 1 : 0.5,
            marginBottom: '24px'
          }}
        >
          {isActive ? 'Update Travel Mode' : 'Activate Travel Mode'}
        </button>

        {/* Premium Badge */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255,107,53,0.2) 0%, rgba(255,107,53,0.05) 100%)',
          border: '1px solid rgba(255,107,53,0.3)',
          borderRadius: '16px',
          padding: '20px',
          textAlign: 'center'
        }}>
          <div style={{ fontSize: '28px', marginBottom: '12px' }}>⭐</div>
          <h4 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
            Premium Feature
          </h4>
          <p style={{ fontSize: '14px', color: '#aaa', marginBottom: '16px', lineHeight: 1.6 }}>
            Travel Mode is available with SLTR Premium
          </p>
          <a
            href="/premium"
            style={{
              display: 'inline-block',
              background: '#FF6B35',
              border: 'none',
              borderRadius: '12px',
              padding: '12px 32px',
              color: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              textDecoration: 'none',
              cursor: 'pointer'
            }}
          >
            Upgrade Now
          </a>
        </div>
      </div>

      {/* City Search Modal */}
      {showCitySearch && (
        <>
          <div
            onClick={() => setShowCitySearch(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.8)',
              zIndex: 998
            }}
          />
          <div style={{
            position: 'fixed',
            inset: '10% 5% 5%',
            background: '#1c1c1e',
            borderRadius: '24px 24px 0 0',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}>
            {/* Search Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid #333'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <button
                  onClick={() => setShowCitySearch(false)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#FF6B35',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: 0
                  }}
                >
                  ✕
                </button>
                <h3 style={{ fontSize: '18px', fontWeight: 700, margin: 0 }}>
                  Select Destination
                </h3>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cities..."
                autoFocus
                style={{
                  width: '100%',
                  background: '#000',
                  border: '1px solid #333',
                  borderRadius: '12px',
                  padding: '14px 16px',
                  color: '#fff',
                  fontSize: '15px',
                  outline: 'none'
                }}
              />
            </div>

            {/* Cities List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px'
            }}>
              <div style={{ marginBottom: '16px', fontSize: '13px', fontWeight: 600, color: '#888' }}>
                POPULAR DESTINATIONS
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredCities.map((c, i) => (
                  <button
                    key={i}
                    onClick={() => selectCity(c.name)}
                    style={{
                      background: city === c.name ? 'rgba(255,107,53,0.2)' : '#000',
                      border: city === c.name ? '1px solid #FF6B35' : '1px solid #333',
                      borderRadius: '12px',
                      padding: '16px',
                      color: '#fff',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      textAlign: 'left'
                    }}
                  >
                    <span style={{ fontSize: '28px' }}>{c.icon}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '16px', fontWeight: 600 }}>{c.name}</div>
                      <div style={{ fontSize: '13px', color: '#888' }}>{c.country}</div>
                    </div>
                    {city === c.name && (
                      <span style={{ color: '#FF6B35', fontSize: '20px' }}>✓</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
