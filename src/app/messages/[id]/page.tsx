'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '../../../contexts/ThemeContext';
import { supabase } from '../../../lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { usePremium, useMessage } from '@/hooks/usePremium';
import { PremiumPromo } from '@/components/PremiumPromo';

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

const MAX_MESSAGE_LENGTH = 2000;

// Common emojis for quick picker
const QUICK_EMOJIS = ['😀', '😂', '😍', '🔥', '👍', '👎', '❤️', '😘', '😏', '🙈', '💪', '🍆', '🍑', '👀', '😈', '🥵', '💦', '🤤', '😜', '🤙'];

// Countdown component for expiring photos
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

  return (
    <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700, fontVariantNumeric: 'tabular-nums' }}>
      {remaining}s
    </span>
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

  const sendMessage = async (type: string = 'text', content?: string, imageUrl?: string, sharedProfileId?: string) => {
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

      const { error: sendError } = await supabase.from('messages').insert(insertData);

      setSending(false);

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
      await supabase.from('blocks').insert({
        blocker_id: currentUserId,
        blocked_id: otherUserId,
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

    if (m.type === 'image' && m.image_url) {
      const isBlurred = hideChatPhotos.enabled && !revealedImages.has(m.id);
      const blurAmount = hideChatPhotos.blurLevel === 'heavy' ? '20px' : '8px';

      return (
        <div
          key={m.id}
          style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: '10px' }}
        >
          <div style={{ maxWidth: '70%', position: 'relative' }}>
            <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
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
                    inset: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: 'rgba(0,0,0,0.3)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                  }}
                  onClick={() => toggleImageReveal(m.id)}
                >
                  <div style={{
                    background: 'rgba(0,0,0,0.6)',
                    padding: '8px 16px',
                    borderRadius: '20px',
                    fontSize: '13px',
                    color: '#fff',
                  }}>
                    👁 Tap to reveal
                  </div>
                </div>
              )}
            </div>
            <div style={{ fontSize: '10px', color: colors.textSecondary, marginTop: '4px', textAlign: mine ? 'right' : 'left' }}>
              {formatTime(m.created_at)}
              {mine && m.read_at && isPremium && <span style={{ marginLeft: '6px' }}>Seen</span>}
            </div>
            {mine && (
              <button
                onClick={() => handleDeleteMessage(m.id)}
                style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '50%', width: '24px', height: '24px', color: '#fff', cursor: 'pointer', fontSize: '12px' }}
              >
                ×
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

      // Calculate remaining time
      let remainingSeconds = duration;
      if (viewedAt) {
        const elapsed = Math.floor((Date.now() - viewedAt) / 1000);
        remainingSeconds = Math.max(0, duration - elapsed);
      }

      // Handle viewing expiring photo
      const handleViewExpiringPhoto = () => {
        if (isExpired || mine) return;

        if (!viewedAt) {
          // First view - start countdown
          const now = Date.now();
          setViewedExpiringPhotos(prev => ({ ...prev, [m.id]: now }));

          // Set up expiration timer
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
          style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: '10px' }}
        >
          <div style={{ maxWidth: '70%', position: 'relative' }}>
            {isExpired ? (
              // Expired placeholder
              <div style={{
                width: '200px',
                height: '200px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px dashed #444',
              }}>
                <span style={{ fontSize: '32px', marginBottom: '8px' }}>💨</span>
                <span style={{ color: '#666', fontSize: '14px', fontWeight: 600 }}>Photo Expired</span>
                <span style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>This photo has disappeared</span>
              </div>
            ) : !viewedAt && !mine ? (
              // Unrevealed expiring photo - tap to view
              <div
                onClick={handleViewExpiringPhoto}
                style={{
                  width: '200px',
                  height: '200px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
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
                  background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.1) 10px, rgba(0,0,0,0.1) 20px)',
                }} />
                <span style={{ fontSize: '32px', marginBottom: '8px', zIndex: 1 }}>⏱️</span>
                <span style={{ color: '#fff', fontSize: '14px', fontWeight: 700, zIndex: 1 }}>Expiring Photo</span>
                <span style={{ color: 'rgba(255,255,255,0.8)', fontSize: '12px', marginTop: '4px', zIndex: 1 }}>Tap to view ({duration}s)</span>
              </div>
            ) : (
              // Viewing expiring photo (or sender viewing their own)
              <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '12px' }}>
                <img
                  src={m.image_url}
                  alt="Expiring photo"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '300px',
                    borderRadius: '12px',
                  }}
                />
                {isViewing && (
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    background: 'rgba(0,0,0,0.7)',
                    padding: '6px 12px',
                    borderRadius: '20px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}>
                    <span style={{ fontSize: '14px' }}>⏱️</span>
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
                    top: '8px',
                    left: '8px',
                    background: 'rgba(255,107,53,0.9)',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#fff',
                  }}>
                    Expires after {duration}s view
                  </div>
                )}
              </div>
            )}
            <div style={{ fontSize: '10px', color: colors.textSecondary, marginTop: '4px', textAlign: mine ? 'right' : 'left' }}>
              {formatTime(m.created_at)}
              {mine && m.read_at && isPremium && <span style={{ marginLeft: '6px' }}>Seen</span>}
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
          style={{ display: 'flex', justifyContent: mine ? 'flex-end' : 'flex-start', marginBottom: '10px' }}
        >
          <div
            style={{
              maxWidth: '70%',
              background: mine ? colors.accent : colors.surface,
              borderRadius: '12px',
              border: `1px solid ${colors.border}`,
              overflow: 'hidden',
              cursor: 'pointer',
            }}
            onClick={() => router.push(`/profile/${m.shared_profile_id}`)}
          >
            <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              {sharedProfile?.photo_url ? (
                <img
                  src={sharedProfile.photo_url}
                  alt=""
                  style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                />
              ) : (
                <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: colors.border, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  👤
                </div>
              )}
              <div>
                <div style={{ fontWeight: 600, color: mine ? '#fff' : colors.text }}>
                  {sharedProfile?.display_name || 'Profile'}
                </div>
                <div style={{ fontSize: '12px', color: mine ? 'rgba(255,255,255,0.7)' : colors.textSecondary }}>
                  Tap to view profile
                </div>
              </div>
            </div>
            <div style={{ fontSize: '10px', color: mine ? 'rgba(255,255,255,0.7)' : colors.textSecondary, padding: '0 12px 8px', textAlign: mine ? 'right' : 'left' }}>
              {formatTime(m.created_at)}
              {mine && m.read_at && isPremium && <span style={{ marginLeft: '6px' }}>Seen</span>}
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
              gap: '10px',
              background: 'rgba(255,107,53,0.1)',
              border: '1px solid rgba(255,107,53,0.3)',
              borderRadius: '20px',
              padding: '10px 16px',
            }}
          >
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: mine ? '#30D158' : 'rgba(255,107,53,0.8)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '18px',
            }}>
              {mine ? '📹' : '📞'}
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
                background: '#30D158',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                marginLeft: '8px',
              }}
              title="Call back"
            >
              📞
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
            background: mine ? colors.accent : colors.surface,
            color: mine ? '#fff' : colors.text,
            padding: '10px 12px',
            borderRadius: mine ? '12px 12px 4px 12px' : '12px 12px 12px 4px',
            border: `1px solid ${colors.border}`,
            whiteSpace: 'pre-wrap',
            position: 'relative',
          }}
        >
          {m.content}
          <div style={{ fontSize: '10px', marginTop: '6px', opacity: 0.7, textAlign: 'right' }}>
            {formatTime(m.created_at)}
            {mine && m.read_at && isPremium && <span style={{ marginLeft: '6px' }}>Seen</span>}
          </div>
          {mine && !m.id.startsWith('temp-') && (
            <button
              onClick={() => handleDeleteMessage(m.id)}
              style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                background: colors.surface,
                border: `1px solid ${colors.border}`,
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                color: colors.textSecondary,
                cursor: 'pointer',
                fontSize: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ minHeight: '100vh', background: colors.background, color: colors.text, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderBottom: `1px solid ${colors.border}`, position: 'sticky', top: 0, background: colors.background, zIndex: 10 }}>
        <Link href="/messages" style={{ color: colors.text, textDecoration: 'none', fontSize: '20px' }}>←</Link>

        <Link href={`/profile/${otherUserId}`} style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center', gap: '10px' }}>
          {otherUser?.photo_url ? (
            <img
              src={otherUser.photo_url}
              alt=""
              style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }}
            />
          ) : (
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: colors.surface, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              👤
            </div>
          )}
          <span style={{ fontWeight: 700 }}>{otherUser?.display_name || 'User'}</span>
        </Link>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={startVideoCall}
            disabled={startingVideoCall}
            style={{
              background: 'none',
              border: 'none',
              color: startingVideoCall ? colors.textSecondary : colors.accent,
              fontSize: '20px',
              cursor: startingVideoCall ? 'not-allowed' : 'pointer',
              opacity: startingVideoCall ? 0.5 : 1,
            }}
            title="Video call"
          >
            {startingVideoCall ? '⏳' : '📹'}
          </button>
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            style={{ background: 'none', border: 'none', color: colors.text, fontSize: '20px', cursor: 'pointer' }}
          >
            ⋯
          </button>
        </div>
      </div>

      {/* More options dropdown */}
      {showMoreOptions && (
        <div style={{
          position: 'absolute',
          top: '56px',
          right: '16px',
          background: colors.surface,
          border: `1px solid ${colors.border}`,
          borderRadius: '8px',
          zIndex: 20,
          minWidth: '160px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          <button
            onClick={() => { router.push(`/profile/${otherUserId}`); setShowMoreOptions(false); }}
            style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderBottom: `1px solid ${colors.border}`, color: colors.text, textAlign: 'left', cursor: 'pointer' }}
          >
            View Profile
          </button>
          <button
            onClick={() => { setShowReportModal(true); setShowMoreOptions(false); }}
            style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', borderBottom: `1px solid ${colors.border}`, color: colors.text, textAlign: 'left', cursor: 'pointer' }}
          >
            Report User
          </button>
          <button
            onClick={() => { handleBlockUser(); setShowMoreOptions(false); }}
            style={{ width: '100%', padding: '12px 16px', background: 'none', border: 'none', color: '#ff4444', textAlign: 'left', cursor: 'pointer' }}
          >
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
          <div style={{ textAlign: 'center', padding: '40px', color: colors.textSecondary }}>Say hello 👋</div>
        ) : (
          messages.map(renderMessage)
        )}
        {otherTyping && (
          <div style={{ padding: '4px 12px', color: colors.textSecondary, fontSize: '12px' }}>Typing...</div>
        )}
      </div>

      {/* Emoji picker */}
      {showEmojiPicker && (
        <div style={{
          padding: '12px',
          borderTop: `1px solid ${colors.border}`,
          background: colors.surface,
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          justifyContent: 'center',
        }}>
          {QUICK_EMOJIS.map(emoji => (
            <button
              key={emoji}
              onClick={() => { setInput(prev => prev + emoji); setShowEmojiPicker(false); }}
              style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', padding: '4px' }}
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
                          style={{ width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px' }}
                        />
                      ) : (
                        <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: colors.border, margin: '0 auto 8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                          👤
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

      {/* Composer */}
      <div style={{ padding: '12px 16px', borderTop: `1px solid ${colors.border}`, background: colors.background, position: 'sticky', bottom: 0 }}>
        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '8px' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploadingImage}
            style={{ background: 'none', border: 'none', color: colors.textSecondary, fontSize: '20px', cursor: 'pointer', opacity: uploadingImage ? 0.5 : 1 }}
            title="Send photo"
          >
            📷
          </button>
          <button
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            style={{ background: 'none', border: 'none', color: colors.textSecondary, fontSize: '20px', cursor: 'pointer' }}
            title="Emoji"
          >
            😀
          </button>
          <button
            onClick={() => { setShowProfileShare(true); loadShareableProfiles(); }}
            style={{ background: 'none', border: 'none', color: colors.textSecondary, fontSize: '20px', cursor: 'pointer' }}
            title="Share profile"
          >
            👤
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
                    background: '#333',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                  }}
                >
                  📷 Send Normal Photo
                </button>
                <button
                  onClick={() => handleImageUpload(true)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    background: 'linear-gradient(135deg, #FF6B35 0%, #ff8c5a 100%)',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '16px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                  }}
                >
                  ⏱️ Send Expiring Photo
                  <span style={{ fontSize: '12px', opacity: 0.9 }}>(disappears after viewing)</span>
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

        <div style={{ display: 'flex', gap: '8px' }}>
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
              padding: '12px 14px',
              borderRadius: '24px',
              border: `1px solid ${colors.border}`,
              background: colors.surface,
              color: colors.text,
              fontSize: '15px',
              opacity: sending || uploadingImage ? 0.7 : 1,
            }}
          />
          <button
            onClick={() => sendMessage()}
            disabled={sending || !input.trim() || uploadingImage}
            style={{
              padding: '12px 18px',
              borderRadius: '24px',
              border: 'none',
              background: sending || !input.trim() ? colors.textSecondary : colors.accent,
              color: '#fff',
              fontWeight: 700,
              cursor: sending || !input.trim() ? 'not-allowed' : 'pointer',
              opacity: sending ? 0.7 : 1,
            }}
          >
            {sending ? '...' : 'Send'}
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
    </div>
  );
}
