import React from 'react';
import { colors } from '../../../tokens';

export interface SpinnerProps {
  /** Size of spinner */
  size?: 'sm' | 'md' | 'lg';
  /** Color of spinner */
  color?: 'primary' | 'white' | 'current';
  /** Accessible label */
  label?: string;
}

const sizeMap = {
  sm: 16,
  md: 24,
  lg: 32,
};

export const Spinner: React.FC<SpinnerProps> = ({
  size = 'md',
  color = 'primary',
  label = 'Loading',
}) => {
  const dimension = sizeMap[size];
  const strokeWidth = size === 'sm' ? 2 : size === 'md' ? 3 : 4;

  const colorMap = {
    primary: colors.primary.electricLime,
    white: colors.neutral.white,
    current: 'currentColor',
  };

  return (
    <div
      role="status"
      aria-label={label}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 24 24"
        fill="none"
        style={{
          animation: 'spin 1s linear infinite',
        }}
      >
        <style>
          {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
        </style>
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="31.4 31.4"
          opacity={0.25}
        />
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke={colorMap[color]}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="31.4 31.4"
          strokeDashoffset="23.55"
        />
      </svg>
      <span className="sr-only" style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
        {label}
      </span>
    </div>
  );
};
