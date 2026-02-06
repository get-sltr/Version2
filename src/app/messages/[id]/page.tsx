'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { usePremium, useMessage } from '@/hooks/usePremium';
import { PremiumPromo } from '@/components/PremiumPromo';
import { listMyAlbums, listPhotosInAlbum, getAlbumWithPhotos } from '@/lib/api/albumMedia';
import posthog from 'posthog-js';

// =============================================================================
// Custom SVG Icons - No Emojis
// =============================================================================

const Icons = {
  // Navigation & Actions
  Back: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 18l-6-6 6-6" />
    </svg>
  ),

  MoreHorizontal: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <circle cx="5" cy="12" r="2" />
      <circle cx="12" cy="12" r="2" />
      <circle cx="19" cy="12" r="2" />
    </svg>
  ),

  Close: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
      <path d="M18 6L6 18M6 6l12 12" />
    </svg>
  ),

  // Communication
  VideoCall: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 7l-7 5 7 5V7z" />
      <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
    </svg>
  ),

  Phone: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
    </svg>
  ),

  Send: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
    </svg>
  ),

  // Media & Content
  Camera: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  ),

  Image: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="M21 15l-5-5L5 21" />
    </svg>
  ),

  Album: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </svg>
  ),

  // User & Profile
  User: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),

  UserShare: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <path d="M20 8v6M23 11h-6" />
    </svg>
  ),

  // Status & Indicators
  Eye: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),

  Clock: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),

  Timer: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2 2M5 3L2 6M22 6l-3-3M12 2v2" />
    </svg>
  ),

  Vanish: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3c-1.2 0-2.4.6-3 1.7A3.6 3.6 0 0 0 4.6 9c-1 .6-1.6 1.7-1.6 3 0 2.1 1.5 3.9 3.4 4.3.2.9.6 1.7 1.3 2.3.8.7 1.9 1 2.9 1 1.1 0 2.1-.4 2.9-1.1.7-.6 1.1-1.3 1.3-2.2 2-.4 3.4-2.1 3.4-4.3 0-1.3-.6-2.4-1.6-3a3.6 3.6 0 0 0-4.6-4.3A3.7 3.7 0 0 0 12 3z" opacity="0.5" />
      <path d="M12 3c-1.2 0-2.4.6-3 1.7" />
      <path d="M3 21l18-18" />
    </svg>
  ),

  // Read Receipts - Single & Double Check
  CheckSingle: ({ size = 14, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 6L9 17l-5-5" />
    </svg>
  ),

  CheckDouble: ({ size = 16, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6L7 17l-4-4" />
      <path d="M22 6L11 17" />
    </svg>
  ),

  // Emoji/Expression (for emoji picker)
  Smile: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
    </svg>
  ),

  // Alert & Warning
  AlertCircle: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),

  // Trash/Delete
  Trash: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
    </svg>
  ),

  // Loading spinner
  Loader: ({ size = 20, color = 'currentColor' }: { size?: number; color?: string }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ animation: 'spin 1s linear infinite' }}>
      <path d="M21 12a9 9 0 11-6.219-8.56" />
    </svg>
  ),
};

// Animated Typing Indicator Component
const TypingIndicator = ({ color }: { color: string }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '12px 16px',
    background: 'rgba(255, 255, 255, 0.08)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderRadius: '18px 18px 18px 4px',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    width: 'fit-content',
  }}>
    {[0, 1, 2].map((i) => (
      <div
        key={i}
        style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: color,
          opacity: 0.7,
          animation: `typingBounce 1.4s ease-in-out ${i * 0.16}s infinite`,
        }}
      />
    ))}
    <style jsx>{`
      @keyframes typingBounce {
        0%, 60%, 100% { transform: translateY(0); }
        30% { transform: translateY(-8px); }
      }
    `}</style>
  </div>
);

// Read Receipt Component with Animation
const ReadReceipt = ({ read, sent, isPremium }: { read: boolean; sent: boolean; isPremium: boolean }) => {
  if (!sent) return null;

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '3px',
      marginLeft: '6px',
    }}>
      {read && isPremium ? (
        <div style={{
          display: 'flex',
          animation: 'receiptPop 0.3s ease-out',
        }}>
          <Icons.CheckDouble size={14} color="#30D158" />
        </div>
      ) : (
        <Icons.CheckSingle size={12} color="rgba(255,255,255,0.5)" />
      )}
      <style jsx>{`
        @keyframes receiptPop {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

// Liquid Glass Styles Helper
const liquidGlass = {
  primary: {
    background: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
  },
  surface: {
    background: 'rgba(255, 255, 255, 0.06)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    border: '1px solid rgba(255, 255, 255, 0.08)',
  },
  accent: {
    background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.9) 0%, rgba(255, 140, 90, 0.9) 100%)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
  },
  header: {
    background: 'rgba(0, 0, 0, 0.4)',
    backdropFilter: 'blur(24px)',
    WebkitBackdropFilter: 'blur(24px)',
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
};

type MessageRecord = {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string | null;
  type: string;
  read_at: string | null;
  created_at: string;
  image_url?: string | null;
  shared_profile_id?: string | null;
  shared_album_id?: string | null;
  is_expiring?: boolean;
  expiring_duration?: number; // seconds
};

type OtherUserProfile = {
  id: string;
  display_name: string | null;
  photo_url: string | null;
};

type ShareableProfile = {
  id: string;
  display_name: string | null;
  photo_url: string | null;
};

type ShareableAlbum = {
  id: string;
  name: string;
  description: string | null;
  cover_photo_url: string | null;
  photo_count?: number;
};

const MAX_MESSAGE_LENGTH = 2000;

// Common emojis for quick picker (keeping emojis for actual content only)
const QUICK_EMOJIS = ['😀', '😂', '😍', '🔥', '👍', '👎', '❤️', '😘', '😏', '🙈', '💪', '🍆', '🍑', '👀', '😈', '🥵', '💦', '🤤', '😜', '🤙'];

// Countdown component for expiring photos with circular progress
function ExpiringCountdown({ startTime, duration, onExpire }: { startTime: number; duration: number; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(duration);

  useEffect(() => {
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      const newRemaining = Math.max(0, duration - elapsed);
      setRemaining(newRemaining);

      if (newRemaining <= 0) {
        clearInterval(interval);
        onExpire();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [startTime, duration, onExpire]);

  const progress = remaining / duration;
  const circumference = 2 * Math.PI * 12;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
      <svg width="28" height="28" viewBox="0 0 28 28">
        <circle
          cx="14"
          cy="14"
          r="12"
          fill="none"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="2"
        />
        <circle
          cx="14"
          cy="14"
          r="12"
          fill="none"
          stroke="#FF6B35"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 14 14)"
          style={{ transition: 'stroke-dashoffset 0.1s linear' }}
        />
      </svg>
      <span style={{
        color: '#fff',
        fontSize: '14px',
        fontWeight: 700,
        fontVariantNumeric: 'tabular-nums',
        minWidth: '24px',
      }}>
        {remaining}s
      </span>
    </div>
  );
}

export default function ConversationPage() {
  const params = useParams();
  const router = useRouter();
  const { colors } = useTheme();
  const otherUserId = params.id as string;
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [messages, setMessages] = useState<MessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [otherTyping, setOtherTyping] = useState(false);
  const [otherUser, setOtherUser] = useState<OtherUserProfile | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastTypingSentRef = useRef<number>(0);
  const currentUserIdRef = useRef<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // UI states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showProfileShare, setShowProfileShare] = useState(false);
  const [shareableProfiles, setShareableProfiles] = useState<ShareableProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [sharedProfilesCache, setSharedProfilesCache] = useState<Record<string, ShareableProfile>>({});
  const [startingVideoCall, setStartingVideoCall] = useState(false);

  // Album sharing states
  const [showAlbumShare, setShowAlbumShare] = useState(false);
  const [shareableAlbums, setShareableAlbums] = useState<ShareableAlbum[]>([]);
  const [loadingAlbums, setLoadingAlbums] = useState(false);
  const [sharedAlbumsCache, setSharedAlbumsCache] = useState<Record<string, ShareableAlbum>>({});

  // Album viewer states
  const [viewingAlbum, setViewingAlbum] = useState<ShareableAlbum | null>(null);
  const [viewingAlbumPhotos, setViewingAlbumPhotos] = useState<{id: string; public_url: string}[]>([]);
  const [loadingAlbumPhotos, setLoadingAlbumPhotos] = useState(false);

  // Hide chat photos feature
  const [hideChatPhotos, setHideChatPhotos] = useState<{ enabled: boolean; blurLevel: 'light' | 'heavy' }>({ enabled: false, blurLevel: 'light' });
  const [revealedImages, setRevealedImages] = useState<Set<string>>(new Set());

  // Premium status
  const { isPremium, messagesRemaining } = usePremium();
  const [showPremiumPromo, setShowPremiumPromo] = useState(false);
  const [premiumFeature, setPremiumFeature] = useState('');

  // Expiring photos feature
  const [showExpiringOption, setShowExpiringOption] = useState(false);
  const [expiringDuration, setExpiringDuration] = useState<number>(5); // seconds
  const [viewedExpiringPhotos, setViewedExpiringPhotos] = useState<Record<string, number>>({}); // messageId -> viewedAt timestamp
  const [expiredPhotos, setExpiredPhotos] = useState<Set<string>>(new Set());

  // Load hide chat photos settings
  useEffect(() => {
    const saved = localStorage.getItem('hideChatPhotos');
    if (saved) {
      setHideChatPhotos(JSON.parse(saved));
    }
  }, []);

  const toggleImageReveal = (messageId: string) => {
    setRevealedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(messageId)) {
        newSet.delete(messageId);
      } else {
        newSet.add(messageId);
      }
      return newSet;
    });
  };

  // Load other user's profile
  useEffect(() => {
    const loadOtherUser = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, photo_url')
        .eq('id', otherUserId)
        .single();

      if (data) {
        setOtherUser(data);
      }
    };
    loadOtherUser();
  }, [otherUserId]);

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      setError(null);

      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError) {
        console.error('Session error:', sessionError);
      }

      if (!session) {
        if (mounted) {
          setError('Please log in to view messages.');
          setLoading(false);
        }
        return;
      }

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        if (mounted) {
          setError('Please log in to view messages.');
          setLoading(false);
        }
        return;
      }

      setCurrentUserId(user.id);
      currentUserIdRef.current = user.id;

      const { data, error: msgError } = await supabase
        .from('messages')
        .select('*')
        .or(
          `and(sender_id.eq.${user.id},recipient_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},recipient_id.eq.${user.id})`
        )
        .order('created_at', { ascending: true })
        .limit(500);

      if (msgError) {
        if (mounted) {
          setError('Unable to load conversation.');
          setLoading(false);
        }
        return;
      }

      const thread = data || [];

      // Load shared profiles data
      const sharedProfileIds = thread
        .filter(m => m.type === 'profile_share' && m.shared_profile_id)
        .map(m => m.shared_profile_id as string);

      if (sharedProfileIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, display_name, photo_url')
          .in('id', sharedProfileIds);

        if (profiles) {
          const cache: Record<string, ShareableProfile> = {};
          profiles.forEach(p => { cache[p.id] = p; });
          setSharedProfilesCache(prev => ({ ...prev, ...cache }));
        }
      }

      // Load shared albums data
      const sharedAlbumIds = thread
        .filter(m => m.type === 'album_share' && m.shared_album_id)
        .map(m => m.shared_album_id as string);

      if (sharedAlbumIds.length > 0) {
        const { data: albums } = await supabase
          .from('profile_albums')
          .select('id, name, description, cover_photo_url')
          .in('id', sharedAlbumIds);

        if (albums) {
          const cache: Record<string, ShareableAlbum> = {};
          albums.forEach(a => { cache[a.id] = a; });
          setSharedAlbumsCache(prev => ({ ...prev, ...cache }));
        }
      }

      if (mounted) {
        setMessages(thread);
        setLoading(false);

        const unreadIds = thread
          .filter((m) => m.recipient_id === user.id && !m.read_at)
          .map((m) => m.id);

        if (unreadIds.length) {
          try {
            const readTime = new Date().toISOString();
            const { error } = await supabase
              .from('messages')
              .update({ read_at: readTime })
              .in('id', unreadIds);

            if (!error) {
              // Update local state immediately so sender sees "Seen"
              setMessages(prev => prev.map(m =>
                unreadIds.includes(m.id) ? { ...m, read_at: readTime } : m
              ));
            }
          } catch (err) {
            console.error('Failed to mark messages as read:', err);
          }
        }

        setTimeout(() => {
          listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
        }, 50);
      }
    };

    load();

    const channelMessages: RealtimeChannel = supabase
      .channel(`messages-thread-${otherUserId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, () => load())
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'messages' }, () => load())
      .subscribe();

    const channelTyping: RealtimeChannel = supabase
      .channel('messages-typing')
      .on('broadcast', { event: 'typing' }, (payload) => {
        const senderId = (payload as any)?.payload?.userId;
        const threadId = (payload as any)?.payload?.threadId;
        if (senderId === otherUserId && threadId === currentUserIdRef.current) {
          setOtherTyping(true);
          if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
          typingTimeoutRef.current = setTimeout(() => setOtherTyping(false), 2000);
        }
      })
      .subscribe();

    return () => {
      mounted = false;
      supabase.removeChannel(channelMessages);
      supabase.removeChannel(channelTyping);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    };
  }, [otherUserId]);

  const sendMessage = async (type: string = 'text', content?: string, imageUrl?: string, sharedProfileId?: string, sharedAlbumId?: string) => {
    const messageContent = content ?? input.trim();

    if (type === 'text' && !messageContent) {
      return;
    }

    if (!currentUserId) {
      setError('You must be logged in to send messages.');
      return;
    }

    if (!otherUserId) {
      setError('Invalid conversation.');
      return;
    }

    if (type === 'text' && messageContent.length > MAX_MESSAGE_LENGTH) {
      setError(`Message too long. Maximum ${MAX_MESSAGE_LENGTH} characters.`);
      return;
    }

    setSending(true);
    setError(null);

    const isExpiringImage = type === 'expiring_image';
    const optimisticMessage: MessageRecord = {
      id: `temp-${Date.now()}`,
      sender_id: currentUserId,
      recipient_id: otherUserId,
      content: messageContent || null,
      type,
      read_at: null,
      created_at: new Date().toISOString(),
      image_url: imageUrl || null,
      shared_profile_id: sharedProfileId || null,
      shared_album_id: sharedAlbumId || null,
      is_expiring: isExpiringImage,
      expiring_duration: isExpiringImage ? expiringDuration : undefined,
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    if (type === 'text') setInput('');

    setTimeout(() => {
      listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' });
    }, 50);

    try {
      const insertData: any = {
        sender_id: currentUserId,
        recipient_id: otherUserId,
        content: messageContent || null,
        type,
      };
      if (imageUrl) insertData.image_url = imageUrl;
      if (sharedProfileId) insertData.shared_profile_id = sharedProfileId;
      if (sharedAlbumId) insertData.shared_album_id = sharedAlbumId;

      const { error: sendError } = await supabase.from('messages').insert(insertData);

      setSending(false);

      if (!sendError) {
        // Capture message_sent event in PostHog
        posthog.capture('message_sent', {
          message_type: type,
          recipient_id: otherUserId,
          has_image: !!imageUrl,
          has_shared_profile: !!sharedProfileId,
          has_shared_album: !!sharedAlbumId,
          is_expiring: isExpiringImage,
        });
      }

      if (sendError) {
        setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
        if (sendError.code === '42501' || sendError.message?.includes('policy')) {
          setError('Unable to send message. You may be blocked by this user.');
        } else if (sendError.code === '23503') {
          setError('User not found. They may have deleted their account.');
        } else {
          setError(`Failed to send message: ${sendError.message || 'Unknown error'}`);
        }
      }
    } catch (err) {
      setSending(false);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setError('An unexpected error occurred. Please try again.');
    }
  };

  const handleTyping = () => {
    const now = Date.now();
    if (now - lastTypingSentRef.current > 800 && currentUserId) {
      supabase.channel('messages-typing').send({
        type: 'broadcast',
        event: 'typing',
        payload: { userId: currentUserId, threadId: otherUserId },
      });
      lastTypingSentRef.current = now;
    }
  };

  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be less than 10MB');
      return;
    }

    setPendingImageFile(file);
    setShowExpiringOption(true);
  };

  const handleImageUpload = async (isExpiring: boolean = false) => {
    if (!pendingImageFile || !currentUserId) return;

    setShowExpiringOption(false);
    setUploadingImage(true);

    try {
      const ext = pendingImageFile.name.split('.').pop() || 'jpg';
      const path = `${currentUserId}/msg-${Date.now()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from('message-media')
        .upload(path, pendingImageFile, { cacheControl: '3600', upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('message-media')
        .getPublicUrl(path);

      await sendMessage(isExpiring ? 'expiring_image' : 'image', '', publicUrl);
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
    } finally {
      setUploadingImage(false);
      setPendingImageFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const loadShareableProfiles = async () => {
    if (!currentUserId) return;
    setLoadingProfiles(true);

    try {
      // Get profiles user has messaged
      const { data: conversations } = await supabase
        .from('messages')
        .select('sender_id, recipient_id')
        .or(`sender_id.eq.${currentUserId},recipient_id.eq.${currentUserId}`)
        .limit(100);

      const userIds = new Set<string>();
      conversations?.forEach(c => {
        if (c.sender_id !== currentUserId) userIds.add(c.sender_id);
        if (c.recipient_id !== currentUserId) userIds.add(c.recipient_id);
      });

      // Also get nearby profiles from grid
      const { data: nearbyProfiles } = await supabase
        .from('profiles')
        .select('id, display_name, photo_url')
        .neq('id', currentUserId)
        .limit(50);

      nearbyProfiles?.forEach(p => userIds.add(p.id));

      // Fetch all profile details
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, display_name, photo_url')
        .in('id', Array.from(userIds))
        .neq('id', otherUserId);

      setShareableProfiles(profiles || []);
    } catch (err) {
      console.error('Failed to load profiles:', err);
    } finally {
      setLoadingProfiles(false);
    }
  };

  const shareProfile = async (profileId: string) => {
    const profile = shareableProfiles.find(p => p.id === profileId);
    if (profile) {
      setSharedProfilesCache(prev => ({ ...prev, [profileId]: profile }));
    }
    await sendMessage('profile_share', `Shared a profile`, undefined, profileId);
    setShowProfileShare(false);
  };

  const loadShareableAlbums = async () => {
    if (!currentUserId) return;
    setLoadingAlbums(true);

    try {
      const albums = await listMyAlbums();
      // Get photo count for each album
      const albumsWithCount = await Promise.all(
        (albums || []).map(async (album: any) => {
          const photos = await listPhotosInAlbum(album.id);
          return {
            id: album.id,
            name: album.name,
            description: album.description,
            cover_photo_url: album.cover_photo_url || (photos?.[0]?.public_url || null),
            photo_count: photos?.length || 0,
          };
        })
      );
      setShareableAlbums(albumsWithCount);
    } catch (err) {
      console.error('Failed to load albums:', err);
    } finally {
      setLoadingAlbums(false);
    }
  };

  const shareAlbum = async (albumId: string) => {
    const album = shareableAlbums.find(a => a.id === albumId);
    if (album) {
      setSharedAlbumsCache(prev => ({ ...prev, [albumId]: album }));
    }
    await sendMessage('album_share', `Shared an album: ${album?.name || 'Album'}`, undefined, undefined, albumId);
    setShowAlbumShare(false);
  };

  // Open album viewer to show album photos
  const openAlbumViewer = async (albumId: string, albumInfo?: ShareableAlbum) => {
    setLoadingAlbumPhotos(true);
    try {
      // Set album info from cache or provided info
      const album = albumInfo || sharedAlbumsCache[albumId];
      if (album) {
        setViewingAlbum(album);
      } else {
        setViewingAlbum({ id: albumId, name: 'Album', description: null, cover_photo_url: null });
      }

      // Load photos from the album
      const photos = await listPhotosInAlbum(albumId);
      setViewingAlbumPhotos(photos || []);
    } catch (err) {
      console.error('Failed to load album photos:', err);
      setViewingAlbumPhotos([]);
    } finally {
      setLoadingAlbumPhotos(false);
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!confirm('Delete this message?')) return;

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', messageId)
      .eq('sender_id', currentUserId);

    if (error) {
      setError('Failed to delete message');
    } else {
      setMessages(prev => prev.filter(m => m.id !== messageId));
    }
  };

  const handleBlockUser = async () => {
    if (!confirm(`Block ${otherUser?.display_name || 'this user'}? They won't be able to message you.`)) return;

    try {
      await supabase.from('blocked_users').insert({
        blocker_id: currentUserId,
        blocked_id: otherUserId,
      });

      // Capture user_blocked event in PostHog
      posthog.capture('user_blocked', {
        blocked_user_id: otherUserId,
      });

      router.push('/messages');
    } catch (err) {
      setError('Failed to block user');
    }
  };

  const handleReportUser = async (reason: string) => {
    try {
      await supabase.from('reports').insert({
        reporter_id: currentUserId,
        reported_id: otherUserId,
        reason,
      });
      setShowReportModal(false);
      alert('Report submitted. Thank you.');
    } catch (err) {
      setError('Failed to submit report');
    }
  };

  const startVideoCall = async () => {
    if (!currentUserId || !otherUserId) return;

    // Premium check for video calls
    if (!isPremium) {
      setPremiumFeature('Video Calls');
      setShowPremiumPromo(true);
      return;
    }

    setStartingVideoCall(true);
    setError(null);

    try {
      // Request camera/mic permissions BEFORE creating the room
      // In Capacitor WKWebView, this triggers the native iOS permission dialog
      if (typeof navigator !== 'undefined' && navigator.mediaDevices?.getUserMedia) {
        try {
          const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
          stream.getTracks().forEach((t) => t.stop());
        } catch (permErr: any) {
          if (permErr?.name === 'NotAllowedError') {
            throw new Error('Camera/microphone access denied. Please enable in Settings.');
          }
          // Non-permission errors (no hardware, etc.) — continue anyway
        }
      }

      const response = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ participantId: otherUserId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create video call');
      }

      if (data.room?.url) {
        // Record the call in messages
        await supabase.from('messages').insert({
          sender_id: currentUserId,
          recipient_id: otherUserId,
          content: 'Video call started',
          type: 'video_call',
        });

        // Capture video_call_started event in PostHog
        posthog.capture('video_call_started', {
          recipient_id: otherUserId,
        });

        // Navigate to our own call page with the Daily room URL
        router.push(`/call/${otherUserId}?room=${encodeURIComponent(data.room.url)}`);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to start video call');
    } finally {
      setStartingVideoCall(false);
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Yesterday ' + date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    } else if (diffDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' }) + ' ' + date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  const renderMessage = (m: MessageRecord) => {
    const mine = m.sender_id === currentUserId;
    const isSent = !m.id.startsWith('temp-');

    if (m.type === 'image' && m.image_url) {
      const isBlurred = hideChatPhotos.enabled && !revealedImages.has(m.id);
      const blurAmount = hideChatPhotos.blurLevel === 'heavy' ? '20px' : '8px';

      return (
        <div
          key={m.id}
          style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: '12px' }}
        >
          <div style={{ maxWidth: '70%', position: 'relative' }}>
            <div style={{
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '16px',
              ...liquidGlass.surface,
              padding: '4px',
            }}>
              <img
                src={m.image_url}
                alt="Shared image"
                style={{
                  maxWidth: '100%',
                  maxHeight: '300px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  filter: isBlurred ? `blur(${blurAmount})` : 'none',
                  transition: 'filter 0.3s ease',
                  display: 'block',
                }}
                onClick={() => {
                  if (isBlurred) {
                    toggleImageReveal(m.id);
                  } else if (hideChatPhotos.enabled) {
                    toggleImageReveal(m.id);
                  } else {
                    window.open(m.image_url!, '_blank');
                  }
                }}
              />
              {isBlurred && (
                <div
                  style={{
                    position: 'absolute',
                    inset: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.4)',
                    backdropFilter: 'blur(8px)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleImageReveal(m.id)}
                >
                  <div style={{
                    ...liquidGlass.primary,
                    padding: '10px 18px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}>
                    <Icons.Eye size={16} color="#fff" />
                    <span>Tap to reveal</span>
                  </div>
                </div>
              )}
            </div>
            <div style={{
              fontSize: '10px',
              color: colors.textSecondary,
              marginTop: '6px',
              textAlign: mine ? 'right' : 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: mine ? 'flex-end' : 'flex-start',
              gap: '4px',
            }}>
              {formatTime(m.created_at)}
              {mine && <ReadReceipt read={!!m.read_at} sent={isSent} isPremium={isPremium} />}
            </div>
            {mine && isSent && (
              <button
                onClick={() => handleDeleteMessage(m.id)}
                style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  ...liquidGlass.primary,
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icons.Close size={14} color="#fff" />
              </button>
            )}
          </div>
        </div>
      );
    }

    // Expiring image
    if (m.type === 'expiring_image' && m.image_url) {
      const isExpired = expiredPhotos.has(m.id);
      const viewedAt = viewedExpiringPhotos[m.id];
      const duration = m.expiring_duration || 5;
      const isViewing = viewedAt && !isExpired;

      // Handle viewing expiring photo
      const handleViewExpiringPhoto = () => {
        if (isExpired || mine) return;

        if (!viewedAt) {
          const now = Date.now();
          setViewedExpiringPhotos(prev => ({ ...prev, [m.id]: now }));

          setTimeout(() => {
            setExpiredPhotos(prev => {
              const newSet = new Set(prev);
              newSet.add(m.id);
              return newSet;
            });
          }, duration * 1000);
        }
      };

      return (
        <div
          key={m.id}
          style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: '12px' }}
        >
          <div style={{ maxWidth: '70%', position: 'relative' }}>
            {isExpired ? (
              // Expired placeholder with liquid glass
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '16px',
                ...liquidGlass.surface,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed rgba(255,255,255,0.2)',
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}>
                  <Icons.Vanish size={24} color="rgba(255,255,255,0.4)" />
                </div>
                <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', fontWeight: 600 }}>Photo Expired</span>
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '4px' }}>This photo has disappeared</span>
              </div>
            ) : !viewedAt && !mine ? (
              // Unrevealed expiring photo - tap to view
              <div
                onClick={handleViewExpiringPhoto}
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '16px',
                  ...liquidGlass.accent,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.08) 10px, rgba(0,0,0,0.08) 20px)',
                }} />
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                  zIndex: 1,
                }}>
                  <Icons.Timer size={28} color="#fff" />
                </div>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700, zIndex: 1 }}>Expiring Photo</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginTop: '4px', zIndex: 1 }}>Tap to view ({duration}s)</span>
              </div>
            ) : (
              // Viewing expiring photo (or sender viewing their own)
              <div style={{
                position: 'relative',
                overflow: 'hidden',
                borderRadius: '16px',
                ...liquidGlass.surface,
                padding: '4px',
              }}>
                <img
                  src={m.image_url}
                  alt="Expiring photo"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '12px',
                    display: 'block',
                  }}
                />
                {isViewing && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    ...liquidGlass.primary,
                    padding: '8px 12px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <ExpiringCountdown
                      startTime={viewedAt}
                      duration={duration}
                      onExpire={() => setExpiredPhotos(prev => { const s = new Set(prev); s.add(m.id); return s; })}
                    />
                  </div>
                )}
                {mine && (
                  <div style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    ...liquidGlass.accent,
                    padding: '6px 12px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <Icons.Timer size={12} color="#fff" />
                    Expires after {duration}s view
                  </div>
                )}
              </div>
            )}
            <div style={{
              fontSize: '10px',
              color: colors.textSecondary,
              marginTop: '6px',
              textAlign: mine ? 'right' : 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: mine ? 'flex-end' : 'flex-start',
              gap: '4px',
            }}>
              {formatTime(m.created_at)}
              {mine && <ReadReceipt read={!!m.read_at} sent={isSent} isPremium={isPremium} />}
            </div>
          </div>
        </div>
      );
    }

    if (m.type === 'profile_share' && m.shared_profile_id) {
      const sharedProfile = sharedProfilesCache[m.shared_profile_id];
      return (
        <div
          key={m.id}
          style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: '12px' }}
        >
          <div
            style={{
              maxWidth: '70%',
              ...(mine ? liquidGlass.accent : liquidGlass.surface),
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
              transition: 'transform 0.2s ease',
            }}
            onClick={() => router.push(`/profile/${m.shared_profile_id}`)}
          >
            <div style={{ padding: '12px 14px', display: 'flex', alignItems: 'center', gap: '12px' }}>
              {sharedProfile?.photo_url ? (
                <img
                  src={sharedProfile.photo_url}
                  alt=""
                  style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '2px solid rgba(255,255,255,0.2)',
                  }}
                />
              ) : (
                <div style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(255,255,255,0.2)',
                }}>
                  <Icons.User size={22} color="rgba(255,255,255,0.6)" />
                </div>
              )}
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '15px' }}>
                  {sharedProfile?.display_name || 'Profile'}
                </div>
                <div style={{
                  fontSize: '12px',
                  color: 'rgba(255,255,255,0.6)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  marginTop: '2px',
                }}>
                  <Icons.UserShare size={12} color="rgba(255,255,255,0.6)" />
                  Tap to view profile
                </div>
              </div>
            </div>
            <div style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.5)',
              padding: '0 14px 10px',
              textAlign: mine ? 'right' : 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: mine ? 'flex-end' : 'flex-start',
              gap: '4px',
            }}>
              {formatTime(m.created_at)}
              {mine && <ReadReceipt read={!!m.read_at} sent={isSent} isPremium={isPremium} />}
            </div>
          </div>
        </div>
      );
    }

    // Album share message
    if (m.type === 'album_share' && m.shared_album_id) {
      const sharedAlbum = sharedAlbumsCache[m.shared_album_id];
      return (
        <div
          key={m.id}
          style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: '12px' }}
        >
          <div
            style={{
              maxWidth: '70%',
              ...(mine ? liquidGlass.accent : liquidGlass.surface),
              borderRadius: '16px',
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={() => {
              openAlbumViewer(m.shared_album_id!, sharedAlbumsCache[m.shared_album_id!]);
            }}
          >
            <div style={{
              width: '100%',
              height: '120px',
              background: sharedAlbum?.cover_photo_url
                ? `url(${sharedAlbum.cover_photo_url}) center/cover`
                : 'linear-gradient(135deg, rgba(255, 107, 53, 0.6) 0%, rgba(255, 140, 90, 0.6) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              {!sharedAlbum?.cover_photo_url && (
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icons.Album size={28} color="#fff" />
                </div>
              )}
              {sharedAlbum?.photo_count && (
                <div style={{
                  position: 'absolute',
                  top: '8px',
                  right: '8px',
                  ...liquidGlass.primary,
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: '#fff',
                }}>
                  {sharedAlbum.photo_count} photos
                </div>
              )}
            </div>
            <div style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Icons.Image size={18} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#fff', fontSize: '14px' }}>
                    {sharedAlbum?.name || 'Album'}
                  </div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    Tap to view album
                  </div>
                </div>
              </div>
            </div>
            <div style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.5)',
              padding: '0 14px 10px',
              textAlign: mine ? 'right' : 'left',
              display: 'flex',
              alignItems: 'center',
              justifyContent: mine ? 'flex-end' : 'flex-start',
              gap: '4px',
            }}>
              {formatTime(m.created_at)}
              {mine && <ReadReceipt read={!!m.read_at} sent={isSent} isPremium={isPremium} />}
            </div>
          </div>
        </div>
      );
    }

    // Video call message
    if (m.type === 'video_call') {
      return (
        <div key={m.id} style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              ...liquidGlass.surface,
              borderRadius: '24px',
              padding: '12px 18px',
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: mine
                ? 'linear-gradient(135deg, #30D158 0%, #34C759 100%)'
                : 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: mine
                ? '0 4px 12px rgba(48, 209, 88, 0.3)'
                : '0 4px 12px rgba(255, 107, 53, 0.3)',
            }}>
              {mine ? <Icons.VideoCall size={20} color="#fff" /> : <Icons.Phone size={20} color="#fff" />}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text }}>
                {mine ? 'Outgoing Video Call' : 'Incoming Video Call'}
              </div>
              <div style={{ fontSize: '12px', color: colors.textSecondary }}>
                {formatTime(m.created_at)}
              </div>
            </div>
            <button
              onClick={startVideoCall}
              style={{
                background: 'linear-gradient(135deg, #30D158 0%, #34C759 100%)',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginLeft: '8px',
                boxShadow: '0 4px 12px rgba(48, 209, 88, 0.3)',
              }}
              title="Call back"
            >
              <Icons.Phone size={16} color="#fff" />
            </button>
          </div>
        </div>
      );
    }

    // Text message
    return (
      <div key={m.id} style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: '10px', position: 'relative' }}>
        <div
          style={{
            maxWidth: '70%',
            ...(mine ? liquidGlass.accent : liquidGlass.surface),
            color: '#fff',
            padding: '12px 14px',
            borderRadius: mine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
            whiteSpace: 'pre-wrap',
            position: 'relative',
            boxShadow: mine
              ? '0 4px 16px rgba(255, 107, 53, 0.2)'
              : '0 4px 16px rgba(0, 0, 0, 0.1)',
          }}
        >
          <span style={{ fontSize: '15px', lineHeight: 1.4 }}>{m.content}</span>
          <div style={{
            fontSize: '10px',
            marginTop: '6px',
            opacity: 0.7,
            textAlign: 'right',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: '2px',
          }}>
            {formatTime(m.created_at)}
            {mine && <ReadReceipt read={!!m.read_at} sent={isSent} isPremium={isPremium} />}
          </div>
          {mine && isSent && (
            <button
              onClick={() => handleDeleteMessage(m.id)}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                ...liquidGlass.primary,
                borderRadius: '50%',
                width: '22px',
                height: '22px',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Icons.Close size={12} color="#fff" />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.background, color: colors.text, display: 'flex', flexDirection: 'column' }}>
      {/* Global styles for animations */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes typingBounce {
          0%, 60%, 100% { transform: translateY(0); }
          30% { transform: translateY(-8px); }
        }
        @keyframes receiptPop {
          0% { transform: scale(0.5); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>

      {/* Header with Liquid Glass */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 16px',
        ...liquidGlass.header,
        position: 'sticky',
        top: 0,
        zIndex: 10,
      }}>
        <Link href="/messages" style={{
          color: colors.text,
          textDecoration: 'none',
          width: '40px',
          height: '40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '12px',
          background: 'rgba(255,255,255,0.06)',
        }}>
          <Icons.Back size={22} color={colors.text} />
        </Link>

        <Link href={`/profile/${otherUserId}`} style={{
          textDecoration: 'none',
          color: 'inherit',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '6px 12px',
          borderRadius: '24px',
          background: 'rgba(255,255,255,0.04)',
        }}>
          {otherUser?.photo_url ? (
            <img
              src={otherUser.photo_url}
              alt=""
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                objectFit: 'cover',
                border: '2px solid rgba(255,255,255,0.15)',
              }}
            />
          ) : (
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(255,255,255,0.15)',
            }}>
              <Icons.User size={18} color="rgba(255,255,255,0.6)" />
            </div>
          )}
          <span style={{ fontWeight: 700, fontSize: '16px' }}>{otherUser?.display_name || 'User'}</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={startVideoCall}
            disabled={startingVideoCall}
            style={{
              background: startingVideoCall ? 'rgba(255,255,255,0.04)' : 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
              border: 'none',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: startingVideoCall ? 'not-allowed' : 'pointer',
              opacity: startingVideoCall ? 0.5 : 1,
              boxShadow: startingVideoCall ? 'none' : '0 4px 12px rgba(255, 107, 53, 0.3)',
            }}
            title="Video call"
          >
            {startingVideoCall ? (
              <Icons.Loader size={18} color="#fff" />
            ) : (
              <Icons.VideoCall size={18} color="#fff" />
            )}
          </button>
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <Icons.MoreHorizontal size={20} color={colors.text} />
          </button>
        </div>
      </div>

      {/* More options dropdown */}
      {showMoreOptions && (
        <div style={{
          position: 'absolute',
          top: '72px',
          right: '16px',
          ...liquidGlass.primary,
          borderRadius: '14px',
          zIndex: 20,
          minWidth: '180px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
          overflow: 'hidden',
        }}>
          <button
            onClick={() => { router.push(`/profile/${otherUserId}`); setShowMoreOptions(false); }}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              color: colors.text,
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
            }}
          >
            <Icons.User size={18} color={colors.textSecondary} />
            View Profile
          </button>
          <button
            onClick={() => { setShowReportModal(true); setShowMoreOptions(false); }}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'none',
              border: 'none',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              color: colors.text,
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
            }}
          >
            <Icons.AlertCircle size={18} color={colors.textSecondary} />
            Report User
          </button>
          <button
            onClick={() => { handleBlockUser(); setShowMoreOptions(false); }}
            style={{
              width: '100%',
              padding: '14px 16px',
              background: 'none',
              border: 'none',
              color: '#ff4444',
              textAlign: 'left',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '14px',
            }}
          >
            <Icons.Close size={18} color="#ff4444" />
            Block User
          </button>
        </div>
      )}

      {/* Messages */}
      <div ref={listRef} style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
        {error && <div style={{ textAlign: 'center', padding: '20px', color: '#ff4444', background: 'rgba(255,68,68,0.1)', borderRadius: '8px', marginBottom: '16px' }}>{error}</div>}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textSecondary }}>Loading...</div>
        ) : messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '60px 20px',
            ...liquidGlass.surface,
            borderRadius: '20px',
            margin: '20px',
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, rgba(255, 107, 53, 0.3) 0%, rgba(255, 140, 90, 0.3) 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
            }}>
              <Icons.Send size={28} color={colors.accent} />
            </div>
            <div style={{ color: colors.text, fontSize: '16px', fontWeight: 600, marginBottom: '8px' }}>
              Start a conversation
            </div>
            <div style={{ color: colors.textSecondary, fontSize: '14px' }}>
              Send a message to say hello
            </div>
          </div>
        ) : (
          messages.map(renderMessage)
        )}
        {otherTyping && (
          <div style={{ padding: '4px 12px' }}>
            <TypingIndicator color={colors.accent} />
          </div>
        )}
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div style={{
          padding: '14px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          ...liquidGlass.surface,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          justifyContent: 'center',
        }}>
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => { setInput(prev => prev + emoji); setShowEmojiPicker(false); }}
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '10px',
                fontSize: '22px',
                cursor: 'pointer',
                padding: '8px',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'transform 0.15s ease',
              }}
            >
              {emoji}
            </button>
          ))}
        </div>
      )}

      {/* Profile share modal */}
      {showProfileShare && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
        onClick={() => setShowProfileShare(false)}
        >
          <div
            style={{
              background: colors.background,
              borderRadius: '16px 16px 0 0',
              width: '100%',
              maxHeight: '70vh',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '16px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '18px' }}>Share a Profile</span>
              <button onClick={() => setShowProfileShare(false)} style={{ background: 'none', border: 'none', color: colors.text, fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '16px', maxHeight: '50vh', overflowY: 'auto' }}>
              {loadingProfiles ? (
                <div style={{ textAlign: 'center', padding: '20px', color: colors.textSecondary }}>Loading profiles...</div>
              ) : shareableProfiles.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: colors.textSecondary }}>No profiles to share</div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
                  {shareableProfiles.map(profile => (
                    <button
                      key={profile.id}
                      onClick={() => shareProfile(profile.id)}
                      style={{
                        background: colors.surface,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '12px',
                        cursor: 'pointer',
                        textAlign: 'center',
                      }}
                    >
                      {profile.photo_url ? (
                        <img
                          src={profile.photo_url}
                          alt=""
                          style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px', border: '2px solid rgba(255,255,255,0.1)' }}
                        />
                      ) : (
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: 'rgba(255,255,255,0.1)', margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid rgba(255,255,255,0.1)' }}>
                          <Icons.User size={22} color="rgba(255,255,255,0.5)" />
                        </div>
                      )}
                      <div style={{ fontSize: '12px', color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {profile.display_name || 'User'}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Album share modal */}
      {showAlbumShare && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'center',
        }}
        onClick={() => setShowAlbumShare(false)}
        >
          <div
            style={{
              background: colors.background,
              borderRadius: '16px 16px 0 0',
              width: '100%',
              maxHeight: '70vh',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '16px', borderBottom: `1px solid ${colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 700, fontSize: '18px' }}>Share an Album</span>
              <button onClick={() => setShowAlbumShare(false)} style={{ background: 'none', border: 'none', color: colors.text, fontSize: '20px', cursor: 'pointer' }}>×</button>
            </div>
            <div style={{ padding: '16px', maxHeight: '50vh', overflowY: 'auto' }}>
              {loadingAlbums ? (
                <div style={{ textAlign: 'center', padding: '20px', color: colors.textSecondary }}>Loading albums...</div>
              ) : shareableAlbums.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: colors.textSecondary }}>
                  <p>No albums to share</p>
                  <p style={{ fontSize: '13px', marginTop: '8px' }}>
                    Create albums in your profile to share them here
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px' }}>
                  {shareableAlbums.map(album => (
                    <button
                      key={album.id}
                      onClick={() => shareAlbum(album.id)}
                      style={{
                        background: colors.surface,
                        border: `1px solid ${colors.border}`,
                        borderRadius: '12px',
                        padding: '0',
                        cursor: 'pointer',
                        textAlign: 'left',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{
                        width: '100%',
                        height: '100px',
                        background: album.cover_photo_url ? `url(${album.cover_photo_url}) center/cover` : 'linear-gradient(135deg, rgba(255, 107, 53, 0.6) 0%, rgba(255, 140, 90, 0.6) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        {!album.cover_photo_url && (
                          <div style={{
                            width: '44px',
                            height: '44px',
                            borderRadius: '50%',
                            background: 'rgba(255,255,255,0.2)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}>
                            <Icons.Album size={24} color="#fff" />
                          </div>
                        )}
                      </div>
                      <div style={{ padding: '10px' }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: colors.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {album.name}
                        </div>
                        <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '4px' }}>
                          {album.photo_count || 0} photos
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Report modal */}
      {showReportModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}
        onClick={() => setShowReportModal(false)}
        >
          <div
            style={{
              background: colors.background,
              borderRadius: '16px',
              width: '100%',
              maxWidth: '400px',
              overflow: 'hidden',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ padding: '16px', borderBottom: `1px solid ${colors.border}` }}>
              <span style={{ fontWeight: 700, fontSize: '18px' }}>Report User</span>
            </div>
            <div style={{ padding: '8px 0' }}>
              {['Spam', 'Harassment', 'Inappropriate content', 'Fake profile', 'Underage', 'Other'].map(reason => (
                <button
                  key={reason}
                  onClick={() => handleReportUser(reason)}
                  style={{
                    width: '100%',
                    padding: '14px 16px',
                    background: 'none',
                    border: 'none',
                    borderBottom: `1px solid ${colors.border}`,
                    color: colors.text,
                    textAlign: 'left',
                    cursor: 'pointer',
                  }}
                >
                  {reason}
                </button>
              ))}
            </div>
            <div style={{ padding: '12px 16px' }}>
              <button
                onClick={() => setShowReportModal(false)}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: colors.surface,
                  border: `1px solid ${colors.border}`,
                  borderRadius: '8px',
                  color: colors.text,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Premium Promo Modal */}
      {showPremiumPromo && (
        <PremiumPromo
          feature={premiumFeature}
          onClose={() => setShowPremiumPromo(false)}
        />
      )}

      {/* Composer with Liquid Glass */}
      <div style={{
        padding: '12px 16px',
        ...liquidGlass.header,
        borderTop: '1px solid rgba(255,255,255,0.08)',
        position: 'sticky',
        bottom: 0,
      }}>
        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            style={{
              ...liquidGlass.surface,
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: uploadingImage ? 'not-allowed' : 'pointer',
              opacity: uploadingImage ? 0.5 : 1,
            }}
            title="Send photo"
          >
            <Icons.Camera size={20} color={colors.textSecondary} />
          </button>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{
              ...liquidGlass.surface,
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Emoji"
          >
            <Icons.Smile size={20} color={colors.textSecondary} />
          </button>
          <button
            onClick={() => { setShowProfileShare(true); loadShareableProfiles(); }}
            style={{
              ...liquidGlass.surface,
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Share profile"
          >
            <Icons.UserShare size={20} color={colors.textSecondary} />
          </button>
          <button
            onClick={() => { setShowAlbumShare(true); loadShareableAlbums(); }}
            style={{
              ...liquidGlass.surface,
              borderRadius: '12px',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
            title="Share album"
          >
            <Icons.Album size={20} color={colors.textSecondary} />
          </button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          style={{ display: 'none' }}
        />

        {/* Expiring Photo Option Modal */}
        {showExpiringOption && (
          <>
            <div
              onClick={() => {
                setShowExpiringOption(false);
                setPendingImageFile(null);
              }}
              style={{
                position: 'fixed',
                inset: 0,
                background: 'rgba(0,0,0,0.7)',
                zIndex: 1000,
              }}
            />
            <div style={{
              position: 'fixed',
              bottom: '100px',
              left: '20px',
              right: '20px',
              background: '#1c1c1e',
              borderRadius: '16px',
              padding: '20px',
              zIndex: 1001,
            }}>
              <h3 style={{ margin: '0 0 16px', fontSize: '18px', fontWeight: 700, textAlign: 'center' }}>
                Send Photo
              </h3>
              <p style={{ margin: '0 0 20px', fontSize: '14px', color: '#888', textAlign: 'center' }}>
                Choose how to send your photo
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => handleImageUpload(false)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    ...liquidGlass.surface,
                    borderRadius: '14px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                  }}
                >
                  <Icons.Camera size={22} color="#fff" />
                  Send Normal Photo
                </button>
                <button
                  onClick={() => handleImageUpload(true)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    ...liquidGlass.accent,
                    borderRadius: '14px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px',
                    boxShadow: '0 4px 16px rgba(255, 107, 53, 0.3)',
                  }}
                >
                  <Icons.Timer size={22} color="#fff" />
                  <span>Send Expiring Photo</span>
                  <span style={{ fontSize: '11px', opacity: 0.8 }}>(disappears)</span>
                </button>
              </div>
              <button
                onClick={() => {
                  setShowExpiringOption(false);
                  setPendingImageFile(null);
                }}
                style={{
                  width: '100%',
                  marginTop: '12px',
                  padding: '12px',
                  background: 'transparent',
                  border: 'none',
                  color: '#888',
                  fontSize: '14px',
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </>
        )}

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <input
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
              handleTyping();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey && !sending) {
                e.preventDefault();
                sendMessage();
              }
            }}
            maxLength={MAX_MESSAGE_LENGTH}
            placeholder="Type a message..."
            disabled={sending || uploadingImage}
            style={{
              flex: 1,
              padding: '14px 18px',
              borderRadius: '24px',
              ...liquidGlass.surface,
              color: colors.text,
              fontSize: '15px',
              opacity: sending || uploadingImage ? 0.7 : 1,
              outline: 'none',
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={sending || !input.trim() || uploadingImage}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              border: 'none',
              background: sending || !input.trim()
                ? 'rgba(255,255,255,0.1)'
                : 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: sending ? 0.7 : 1,
              boxShadow: sending || !input.trim()
                ? 'none'
                : '0 4px 16px rgba(255, 107, 53, 0.4)',
              transition: 'all 0.2s ease',
            }}
          >
            {sending ? (
              <Icons.Loader size={20} color="#fff" />
            ) : (
              <Icons.Send size={20} color={input.trim() ? '#fff' : colors.textSecondary} />
            )}
          </button>
        </div>

        {input.length > MAX_MESSAGE_LENGTH * 0.9 && (
          <div style={{ fontSize: '11px', color: input.length >= MAX_MESSAGE_LENGTH ? '#ff4444' : colors.textSecondary, textAlign: 'right', marginTop: '4px' }}>
            {input.length}/{MAX_MESSAGE_LENGTH}
          </div>
        )}

        {uploadingImage && (
          <div style={{ fontSize: '12px', color: colors.textSecondary, marginTop: '8px', textAlign: 'center' }}>
            Uploading image...
          </div>
        )}
      </div>

      {/* Album Viewer Modal */}
      {viewingAlbum && (
        <>
          <div
            onClick={() => {
              setViewingAlbum(null);
              setViewingAlbumPhotos([]);
            }}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.9)',
              zIndex: 1000,
            }}
          />
          <div style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '90%',
            maxWidth: '500px',
            maxHeight: '80vh',
            background: '#1c1c1e',
            borderRadius: '16px',
            overflow: 'hidden',
            zIndex: 1001,
            display: 'flex',
            flexDirection: 'column',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '16px',
              borderBottom: '1px solid rgba(255,255,255,0.1)',
              ...liquidGlass.header,
            }}>
              <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Icons.Album size={20} color={colors.accent} />
                {viewingAlbum.name}
              </h3>
              <button
                onClick={() => {
                  setViewingAlbum(null);
                  setViewingAlbumPhotos([]);
                }}
                style={{
                  ...liquidGlass.surface,
                  borderRadius: '10px',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                }}
              >
                <Icons.Close size={18} color="#fff" />
              </button>
            </div>

            {/* Photos Grid */}
            <div style={{
              padding: '16px',
              overflowY: 'auto',
              flex: 1,
            }}>
              {loadingAlbumPhotos ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                  Loading photos...
                </div>
              ) : viewingAlbumPhotos.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>
                  No photos in this album
                </div>
              ) : (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '8px',
                }}>
                  {viewingAlbumPhotos.map((photo) => (
                    <div
                      key={photo.id}
                      style={{
                        aspectRatio: '1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        background: '#333',
                      }}
                    >
                      <img
                        src={photo.public_url}
                        alt="Album photo"
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer with photo count */}
            <div style={{
              padding: '12px 16px',
              borderTop: '1px solid #333',
              textAlign: 'center',
              fontSize: '14px',
              color: '#888',
            }}>
              {viewingAlbumPhotos.length} photo{viewingAlbumPhotos.length !== 1 ? 's' : ''}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
