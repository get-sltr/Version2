'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface PhoneOTPInputProps {
  length?: number;
  onComplete: (code: string) => void;
  disabled?: boolean;
  error?: string;
}

export function PhoneOTPInput({
  length = 6,
  onComplete,
  disabled = false,
  error,
}: PhoneOTPInputProps) {
  const [digits, setDigits] = useState<string[]>(new Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = useCallback(
    (index: number, value: string) => {
      if (disabled) return;

      // Handle paste (multi-character input)
      if (value.length > 1) {
        const pasted = value.replace(/\D/g, '').slice(0, length);
        const newDigits = [...digits];
        for (let i = 0; i < pasted.length && index + i < length; i++) {
          newDigits[index + i] = pasted[i];
        }
        setDigits(newDigits);
        const nextIdx = Math.min(index + pasted.length, length - 1);
        inputRefs.current[nextIdx]?.focus();
        if (newDigits.every((d) => d !== '')) {
          onComplete(newDigits.join(''));
        }
        return;
      }

      // Single character
      if (value && !/^\d$/.test(value)) return;

      const newDigits = [...digits];
      newDigits[index] = value;
      setDigits(newDigits);

      if (value && index < length - 1) {
        inputRefs.current[index + 1]?.focus();
      }

      if (newDigits.every((d) => d !== '')) {
        onComplete(newDigits.join(''));
      }
    },
    [digits, disabled, length, onComplete]
  );

  const handleKeyDown = useCallback(
    (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Backspace' && !digits[index] && index > 0) {
        const newDigits = [...digits];
        newDigits[index - 1] = '';
        setDigits(newDigits);
        inputRefs.current[index - 1]?.focus();
      }
    },
    [digits]
  );

  const handlePaste = useCallback(
    (e: React.ClipboardEvent) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
      if (!pasted) return;
      const newDigits = new Array(length).fill('');
      for (let i = 0; i < pasted.length; i++) {
        newDigits[i] = pasted[i];
      }
      setDigits(newDigits);
      const nextIdx = Math.min(pasted.length, length - 1);
      inputRefs.current[nextIdx]?.focus();
      if (newDigits.every((d) => d !== '')) {
        onComplete(newDigits.join(''));
      }
    },
    [length, onComplete]
  );

  return (
    <>
      <style jsx>{`
        .otp-container {
          display: flex;
          gap: 8px;
          justify-content: center;
        }
        .otp-input {
          width: 48px;
          height: 56px;
          text-align: center;
          font-size: 24px;
          font-weight: 600;
          font-family: 'Orbitron', monospace;
          background: rgba(255, 255, 255, 0.03);
          border: 2px solid rgba(255, 255, 255, 0.08);
          border-radius: 10px;
          color: #fff;
          outline: none;
          transition: all 0.3s ease;
          caret-color: #FF6B35;
        }
        .otp-input:focus {
          border-color: rgba(255, 107, 53, 0.5);
          background: rgba(255, 255, 255, 0.05);
          box-shadow: 0 0 20px rgba(255, 107, 53, 0.15);
        }
        .otp-input-filled {
          border-color: rgba(255, 107, 53, 0.4);
        }
        .otp-input-error {
          border-color: rgba(255, 80, 80, 0.5);
        }
        .otp-input:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .otp-error {
          text-align: center;
          color: #ff8888;
          font-size: 13px;
          margin-top: 8px;
        }
      `}</style>
      <div>
        <div className="otp-container" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete={i === 0 ? 'one-time-code' : 'off'}
              maxLength={i === 0 ? length : 1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={disabled}
              className={`otp-input${digit ? ' otp-input-filled' : ''}${error ? ' otp-input-error' : ''}`}
              aria-label={`Digit ${i + 1} of ${length}`}
            />
          ))}
        </div>
        {error && <p className="otp-error">{error}</p>}
      </div>
    </>
  );
}

interface ResendButtonProps {
  onResend: () => Promise<void>;
  cooldownSeconds?: number;
}

export function ResendCodeButton({ onResend, cooldownSeconds = 30 }: ResendButtonProps) {
  const [countdown, setCountdown] = useState(cooldownSeconds);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0 || sending) return;
    setSending(true);
    try {
      await onResend();
      setCountdown(cooldownSeconds);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <style jsx>{`
        .resend-btn {
          background: none;
          border: none;
          color: ${countdown > 0 ? 'rgba(255, 255, 255, 0.3)' : '#FF6B35'};
          font-size: 13px;
          font-weight: 500;
          cursor: ${countdown > 0 ? 'default' : 'pointer'};
          padding: 8px 0;
          min-height: 44px;
          display: inline-flex;
          align-items: center;
          transition: color 0.3s ease;
        }
        .resend-btn:hover:not(:disabled) {
          text-shadow: 0 0 10px rgba(255, 107, 53, 0.4);
        }
      `}</style>
      <button
        className="resend-btn"
        onClick={handleResend}
        disabled={countdown > 0 || sending}
      >
        {sending
          ? 'Sending...'
          : countdown > 0
            ? `Resend code in ${countdown}s`
            : 'Resend code'}
      </button>
    </>
  );
}

export default PhoneOTPInput;
