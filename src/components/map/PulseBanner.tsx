// =============================================================================
// PulseBanner - Promotional banner for The Pulse live video feature
// =============================================================================

import { useTheme } from '@/contexts/ThemeContext';
import styles from './Map.module.css';

export function PulseBanner() {
  const { colors } = useTheme();

  return (
    <a href="/pulse" className={styles.pulseBanner}>
      <div className={styles.pulseIcon}>⚡</div>
      <div className={styles.pulseContent}>
        <div style={{ color: colors.text }} className={styles.pulseTitle}>
          The Pulse
        </div>
        <div style={{ color: colors.textSecondary }} className={styles.pulseSubtitle}>
          Join 400+ in live video rooms
        </div>
      </div>
      <div style={{ color: colors.textSecondary }} className={styles.pulseArrow}>
        ›
      </div>
    </a>
  );
}
