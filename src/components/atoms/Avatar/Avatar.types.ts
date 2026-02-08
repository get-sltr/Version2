export interface AvatarProps {
  src?: string;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  online?: boolean;
  onClick?: () => void;
}
