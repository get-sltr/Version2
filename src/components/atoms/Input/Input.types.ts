export interface InputProps {
  /** Input type */
  type?: 'text' | 'email' | 'password' | 'tel' | 'url' | 'date' | 'number';
  /** Visible label text */
  label: string;
  /** Placeholder text */
  placeholder?: string;
  /** Current value */
  value: string;
  /** Change handler */
  onChange: (value: string) => void;
  /** Error message to display */
  error?: string;
  /** Helper text below input */
  helperText?: string;
  /** Disabled state */
  disabled?: boolean;
  /** Required field */
  required?: boolean;
  /** Input name for form submission */
  name?: string;
  /** Auto-complete hint */
  autoComplete?: string;
  /** Input size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Full width */
  fullWidth?: boolean;
  /** Minimum length */
  minLength?: number;
  /** Maximum length */
  maxLength?: number;
}
