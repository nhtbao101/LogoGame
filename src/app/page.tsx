'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrCreateGuestId } from '@/utils/guest';
import { LotoLogo } from '@/components/ui/loto-logo';
import { Background } from '@/components/layout/background';
import { Footer } from '@/components/layout/footer';

export default function Home() {
  const router = useRouter();
  const [roomCode, setRoomCode] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');

  const handleCreateRoom = async () => {
    setIsCreating(true);
    setError('');

    try {
      const { guest_id } = getOrCreateGuestId();

      const response = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hostId: guest_id })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create room');
      }

      const { room } = await response.json();
      router.push(`/host/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create room');
      setIsCreating(false);
    }
  };

  const handleJoinRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    setError('');

    const code = roomCode.trim().toUpperCase();

    if (code.length !== 6) {
      setError('Room code must be 6 characters');
      setIsJoining(false);
      return;
    }

    try {
      // Verify room exists
      const response = await fetch(`/api/rooms/code/${code}`);

      if (!response.ok) {
        throw new Error('Room not found');
      }

      const { room } = await response.json();
      router.push(`/room/${room.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to join room');
      setIsJoining(false);
    }
  };

  return (
    <Background>
      <div className="flex min-h-screen items-center justify-center p-4">
        <main className="w-full max-w-md space-y-8">
          {/* Logo */}
          <div className="text-center">
            <LotoLogo size="lg" clickable={false} className="justify-center" />
            <p className="mt-4 text-lg text-red-800 font-semibold">
              🎊 Chúc Mừng Năm Mới 🎊
            </p>
            <p className="text-gray-700">
              Trò chơi Lô Tô truyền thống Việt Nam
            </p>
          </div>

          <div className="rounded-xl bg-white/95 backdrop-blur p-8 shadow-2xl border-4 border-red-600 space-y-6">
            {/* Create Room Section */}
            <div>
              <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center gap-2">
                Làm chủ phòng
              </h2>
              <button
                onClick={handleCreateRoom}
                disabled={isCreating}
                className="w-full rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-4 py-3 text-white font-medium hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
              >
                {isCreating ? 'Đang tạo...' : 'Tạo phòng mới'}
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t-2 border-red-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white px-4 text-red-600 font-semibold">
                  hoặc
                </span>
              </div>
            </div>

            {/* Join Room Section */}
            <div>
              <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center gap-2">
                <span>🎯</span> Tham gia phòng
              </h2>
              <form onSubmit={handleJoinRoom} className="space-y-4">
                <div>
                  <label
                    htmlFor="roomCode"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Nhập mã phòng
                  </label>
                  <input
                    id="roomCode"
                    type="text"
                    value={roomCode}
                    onChange={(e) =>
                      setRoomCode(e.target.value.toUpperCase().slice(0, 6))
                    }
                    placeholder="ABC123"
                    maxLength={6}
                    className="w-full rounded-lg border-2 border-red-300 px-4 py-3 text-center text-2xl font-mono uppercase tracking-widest focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 bg-yellow-50"
                    disabled={isJoining}
                  />
                </div>
                <button
                  type="submit"
                  disabled={isJoining || roomCode.length !== 6}
                  className="w-full rounded-lg bg-gradient-to-r from-yellow-500 to-yellow-600 px-4 py-3 text-red-900 font-bold hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed disabled:text-white transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  {isJoining ? 'Đang tham gia...' : 'Vào phòng'}
                </button>
              </form>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-100 border-2 border-red-300 p-4 text-sm text-red-800 font-medium">
                ⚠️ {error}
              </div>
            )}
          </div>
        </main>
      </div>
      <Footer />
    </Background>
  );
}
