import React, { useId } from 'react';
import { colors, typography, radius, effects } from '../../../tokens';
import { InputProps } from './Input.types';

export const Input: React.FC<InputProps> = ({
  type = 'text',
  label,
  placeholder,
  value,
  onChange,
  error,
  helperText,
  disabled = false,
  required = false,
  name,
  autoComplete,
  size = 'md',
  fullWidth = true,
  minLength,
  maxLength,
}) => {
  const id = useId();
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const sizeStyles: Record<string, React.CSSProperties> = {
    sm: { padding: '10px 14px', fontSize: typography.fontSize.sm, minHeight: '44px' },
    md: { padding: '14px 16px', fontSize: typography.fontSize.base, minHeight: '44px' },
    lg: { padding: '18px 20px', fontSize: typography.fontSize.lg, minHeight: '44px' },
  };

  const labelSizeStyles: Record<string, React.CSSProperties> = {
    sm: { fontSize: typography.fontSize.xs, marginBottom: '6px' },
    md: { fontSize: typography.fontSize.sm, marginBottom: '8px' },
    lg: { fontSize: typography.fontSize.base, marginBottom: '10px' },
  };

  const getBorderColor = () => {
    if (error) return colors.semantic.error;
    return '#333';
  };

  return (
    <div style={{ width: fullWidth ? '100%' : 'auto', marginBottom: '16px' }}>
      <label
        htmlFor={id}
        style={{
          display: 'block',
          color: error ? colors.semantic.error : colors.neutral.white,
          fontFamily: typography.fontFamily.primary,
          fontWeight: typography.fontWeight.medium,
          ...labelSizeStyles[size],
        }}
      >
        {label}
        {required && (
          <span style={{ color: colors.semantic.error, marginLeft: '4px' }} aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete={autoComplete}
        minLength={minLength}
        maxLength={maxLength}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? errorId : helperText ? helperId : undefined}
        style={{
          width: '100%',
          fontFamily: typography.fontFamily.primary,
          backgroundColor: colors.neutral.gray800,
          color: colors.neutral.white,
          border: `2px solid ${getBorderColor()}`,
          borderRadius: radius.lg,
          outline: 'none',
          transition: effects.transition.fast,
          boxSizing: 'border-box',
          opacity: disabled ? 0.5 : 1,
          cursor: disabled ? 'not-allowed' : 'text',
          ...sizeStyles[size],
        }}
        onFocus={(e) => {
          if (!error) {
            e.target.style.borderColor = colors.primary.electricLime;
            e.target.style.boxShadow = effects.shadow.glow.lime;
          }
        }}
        onBlur={(e) => {
          e.target.style.borderColor = getBorderColor();
          e.target.style.boxShadow = 'none';
        }}
      />
      {error && (
        <p
          id={errorId}
          role="alert"
          style={{
            color: colors.semantic.error,
            fontSize: typography.fontSize.xs,
            fontFamily: typography.fontFamily.primary,
            marginTop: '6px',
            marginBottom: 0,
          }}
        >
          {error}
        </p>
      )}
      {helperText && !error && (
        <p
          id={helperId}
          style={{
            color: '#888',
            fontSize: typography.fontSize.xs,
            fontFamily: typography.fontFamily.primary,
            marginTop: '6px',
            marginBottom: 0,
          }}
        >
          {helperText}
        </p>
      )}
    </div>
  );
};
