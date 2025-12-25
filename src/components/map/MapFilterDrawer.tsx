// =============================================================================
// MapFilterDrawer - Filter drawer for map profiles
// =============================================================================

'use client';

import { useState, useEffect } from 'react';
import { IconClose } from '@/components/Icons';
import styles from './Map.module.css';

interface MapFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: MapFilters) => void;
}

export interface MapFilters {
  positions: string[];
  ageMin: number;
  ageMax: number;
  tribes: string[];
  dtfn: boolean;
  pnp: boolean;
}

const POSITIONS = ['Top', 'Bottom', 'Versatile', 'Vers Top', 'Vers Bottom', 'Side'];
const TRIBES = ['Bear', 'Twink', 'Jock', 'Otter', 'Daddy', 'Leather', 'Pup', 'Geek', 'Rugged', 'Trans', 'Queer'];

export function MapFilterDrawer({ isOpen, onClose, onApply }: MapFilterDrawerProps) {
  const [positions, setPositions] = useState<string[]>([]);
  const [ageMin, setAgeMin] = useState(18);
  const [ageMax, setAgeMax] = useState(80);
  const [tribes, setTribes] = useState<string[]>([]);
  const [dtfn, setDtfn] = useState(false);
  const [pnp, setPnp] = useState(false);

  // Load saved filters on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedPositions = localStorage.getItem('mapFilterPositions');
      const savedAgeMin = localStorage.getItem('mapFilterAgeMin');
      const savedAgeMax = localStorage.getItem('mapFilterAgeMax');
      const savedTribes = localStorage.getItem('mapFilterTribes');
      const savedDtfn = localStorage.getItem('mapFilterDtfn');
      const savedPnp = localStorage.getItem('mapFilterPnp');

      if (savedPositions) setPositions(JSON.parse(savedPositions));
      if (savedAgeMin) setAgeMin(parseInt(savedAgeMin));
      if (savedAgeMax) setAgeMax(parseInt(savedAgeMax));
      if (savedTribes) setTribes(JSON.parse(savedTribes));
      if (savedDtfn) setDtfn(savedDtfn === 'true');
      if (savedPnp) setPnp(savedPnp === 'true');
    }
  }, []);

  const togglePosition = (pos: string) => {
    setPositions(prev =>
      prev.includes(pos) ? prev.filter(p => p !== pos) : [...prev, pos]
    );
  };

  const toggleTribe = (tribe: string) => {
    setTribes(prev =>
      prev.includes(tribe) ? prev.filter(t => t !== tribe) : [...prev, tribe]
    );
  };

  const handleApply = () => {
    // Save to localStorage
    localStorage.setItem('mapFilterPositions', JSON.stringify(positions));
    localStorage.setItem('mapFilterAgeMin', ageMin.toString());
    localStorage.setItem('mapFilterAgeMax', ageMax.toString());
    localStorage.setItem('mapFilterTribes', JSON.stringify(tribes));
    localStorage.setItem('mapFilterDtfn', dtfn.toString());
    localStorage.setItem('mapFilterPnp', pnp.toString());

    onApply({ positions, ageMin, ageMax, tribes, dtfn, pnp });
    onClose();
  };

  const handleClear = () => {
    setPositions([]);
    setAgeMin(18);
    setAgeMax(80);
    setTribes([]);
    setDtfn(false);
    setPnp(false);
  };

  const activeFilterCount =
    positions.length +
    tribes.length +
    (ageMin > 18 || ageMax < 80 ? 1 : 0) +
    (dtfn ? 1 : 0) +
    (pnp ? 1 : 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <button
        className={styles.drawerBackdrop}
        onClick={onClose}
        aria-label="Close filters"
      />

      {/* Drawer */}
      <div className={styles.drawer} style={{ maxHeight: '80vh' }}>
        <button className={styles.drawerClose} onClick={onClose}>
          <IconClose size={18} />
        </button>

        <div style={{ padding: '20px', paddingTop: '30px' }}>
          <h2 style={{ margin: '0 0 20px', fontSize: '22px', fontWeight: 700 }}>
            Filters
          </h2>

          {/* Position */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#888' }}>
              Position
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {POSITIONS.map(pos => (
                <button
                  key={pos}
                  onClick={() => togglePosition(pos)}
                  style={{
                    padding: '10px 16px',
                    background: positions.includes(pos) ? '#FF6B35' : '#2a2a2a',
                    color: '#fff',
                    border: positions.includes(pos) ? '1px solid #FF6B35' : '1px solid #444',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {pos}
                </button>
              ))}
            </div>
          </div>

          {/* Age Range */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#888' }}>
              Age Range
            </h3>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <input
                type="number"
                min="18"
                max="99"
                value={ageMin}
                onChange={(e) => setAgeMin(parseInt(e.target.value) || 18)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#2a2a2a',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px',
                }}
                placeholder="Min"
              />
              <span style={{ color: '#666' }}>—</span>
              <input
                type="number"
                min="18"
                max="99"
                value={ageMax}
                onChange={(e) => setAgeMax(parseInt(e.target.value) || 80)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#2a2a2a',
                  border: '1px solid #444',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '16px',
                }}
                placeholder="Max"
              />
            </div>
          </div>

          {/* Tribes */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#888' }}>
              Tribes
            </h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {TRIBES.map(tribe => (
                <button
                  key={tribe}
                  onClick={() => toggleTribe(tribe)}
                  style={{
                    padding: '10px 16px',
                    background: tribes.includes(tribe) ? '#FF6B35' : '#2a2a2a',
                    color: '#fff',
                    border: tribes.includes(tribe) ? '1px solid #FF6B35' : '1px solid #444',
                    borderRadius: '20px',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  {tribe}
                </button>
              ))}
            </div>
          </div>

          {/* DTFN & PnP toggles */}
          <div style={{ marginBottom: '24px' }}>
            <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '12px', color: '#888' }}>
              Looking For
            </h3>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => setDtfn(!dtfn)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: dtfn ? '#FF6B35' : '#2a2a2a',
                  color: '#fff',
                  border: dtfn ? '1px solid #FF6B35' : '1px solid #444',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                💦 DTFN
              </button>
              <button
                onClick={() => setPnp(!pnp)}
                style={{
                  flex: 1,
                  padding: '14px',
                  background: pnp ? '#FF6B35' : '#2a2a2a',
                  color: '#fff',
                  border: pnp ? '1px solid #FF6B35' : '1px solid #444',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                🪐 PnP
              </button>
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: '12px', marginTop: '30px' }}>
            <button
              onClick={handleClear}
              style={{
                flex: 1,
                padding: '16px',
                background: '#2a2a2a',
                color: '#fff',
                border: '1px solid #444',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Clear All
            </button>
            <button
              onClick={handleApply}
              style={{
                flex: 2,
                padding: '16px',
                background: '#FF6B35',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                fontSize: '16px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Show Results {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
