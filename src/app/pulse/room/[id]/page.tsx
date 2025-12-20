'use client';

import { useParams, useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

// Dynamically import LiveKit component to avoid SSR issues
const VideoConference = dynamic(
  () => import('@/components/LiveKit/VideoConference'),
  {
    ssr: false,
    loading: () => (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#000',
        color: '#fff',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚡</div>
          <div style={{ fontSize: '18px' }}>Loading Pulse Room...</div>
        </div>
      </div>
    )
  }
);

export default function PulseRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params.id as string;

  const handleLeave = () => {
    router.push('/pulse/lobby');
  };

  return (
    <VideoConference
      roomName={roomId}
      onLeave={handleLeave}
    />
  );
}
