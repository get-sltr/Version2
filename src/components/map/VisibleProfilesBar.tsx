// =============================================================================
// VisibleProfilesBar - Horizontal scroll of visible profiles at map bottom
// =============================================================================

import { useTheme } from '@/contexts/ThemeContext';
import { formatDistance } from '@/lib/geo';
import type { VisibleProfilesBarProps, MapProfile } from '@/types/map';
import styles from './Map.module.css';

export function VisibleProfilesBar({ profiles, onSelectProfile }: VisibleProfilesBarProps) {
  const { colors } = useTheme();

  if (profiles.length === 0) return null;

  return (
    <div className={styles.visibleProfilesBar}>
      <div className={styles.visibleProfilesScroll}>
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            colors={colors}
            onSelect={() => onSelectProfile(profile)}
          />
        ))}
      </div>
    </div>
  );
}

// Internal component for each profile card
interface ProfileCardProps {
  profile: MapProfile;
  colors: any;
  onSelect: () => void;
}

function ProfileCard({ profile, colors, onSelect }: ProfileCardProps) {
  const ariaLabel = `View profile of ${profile.name}${profile.age ? `, ${profile.age}` : ''}`;

  return (
    <button
      type="button"
      onClick={onSelect}
      className={styles.profileCard}
      aria-label={ariaLabel}
    >
      <div
        className={styles.profileCardImage}
        style={{ backgroundImage: `url(${profile.image || '/images/5.jpg'})` }}
      />
      <div style={{ color: colors.text }}>
        <div className={styles.profileCardName}>
          {profile.name}
          {profile.age ? `, ${profile.age}` : ''}
        </div>
        <div className={styles.profileCardDistance} style={{ color: colors.textSecondary }}>
          {formatDistance(profile.distance)}
        </div>
      </div>
    </button>
  );
}
