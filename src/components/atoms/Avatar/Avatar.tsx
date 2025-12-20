import React from 'react';
import { colors, effects } from '../../../tokens';
import { AvatarProps } from './Avatar.types';

const sizeMap = { xs: 24, sm: 32, md: 48, lg: 64, xl: 96 };

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = 'Avatar',
  size = 'md',
  online,
  onClick,
}) => {
  const dimension = sizeMap[size];

  return (
    <div style={{ position: 'relative', width: dimension, height: dimension, cursor: onClick ? 'pointer' : 'default' }} onClick={onClick}>
      {src ? (
        <img src={src} alt={alt} style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
      ) : (
        <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: colors.neutral.gray800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
      )}
      {online && (
        <div style={{ position: 'absolute', bottom: 2, right: 2, width: dimension * 0.25, height: dimension * 0.25, backgroundColor: colors.semantic.online, borderRadius: '50%', border: '2px solid black', boxShadow: effects.shadow.glow.online }} />
      )}
    </div>
  );
};
