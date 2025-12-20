import React from 'react';
import { colors, radius, typography } from '../../../tokens';
import { Badge } from '../../atoms/Badge';

export interface ProfileCardProps {
  name: string;
  age?: number;
  distance?: string;
  avatar?: string;
  online?: boolean;
  onClick?: () => void;
}

export const ProfileCard: React.FC<ProfileCardProps> = ({
  name,
  age,
  distance,
  avatar,
  online = false,
  onClick,
}) => {
  const handleKeyPress = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick?.();
    }
  };

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={handleKeyPress}
      style={{
        position: 'relative',
        aspectRatio: '1',
        borderRadius: radius.lg,
        overflow: 'hidden',
        cursor: onClick ? 'pointer' : 'default',
        backgroundColor: colors.neutral.gray800,
        border: 'none',
        padding: 0,
      }}
      aria-label={age ? `${name}, ${age}` : name}
    >
      {avatar ? (
        <img src={avatar} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '48px' }}>👤</div>
      )}
      {online && (
        <div style={{ position: 'absolute', top: '8px', left: '8px' }}>
          <Badge variant="online">Online</Badge>
        </div>
      )}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px', background: 'linear-gradient(transparent, rgba(0,0,0,0.8))' }}>
        <span style={{ color: colors.neutral.white, fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.semibold }}>
          {name}
          {age ? `, ${age}` : ''}
        </span>
        {distance && (
          <div style={{ marginTop: '4px' }}>
            <Badge variant="distance">{distance}</Badge>
          </div>
        )}
      </div>
    </button>
  );
};
