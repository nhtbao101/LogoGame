'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrCreateGuestId } from '@/utils/guest';

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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <main className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Loto Game</h1>
          <p className="mt-2 text-gray-600">
            Traditional Vietnamese Bingo
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-lg space-y-6">
          {/* Create Room Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Host a Game
            </h2>
            <button
              onClick={handleCreateRoom}
              disabled={isCreating}
              className="w-full rounded-lg bg-blue-600 px-4 py-3 text-white font-medium hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
            >
              {isCreating ? 'Creating...' : 'Create New Room'}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-4 text-gray-500">or</span>
            </div>
          </div>

          {/* Join Room Section */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Join a Game
            </h2>
            <form onSubmit={handleJoinRoom} className="space-y-4">
              <div>
                <label
                  htmlFor="roomCode"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Enter Room Code
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
                  className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-2xl font-mono uppercase tracking-widest focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={isJoining}
                />
              </div>
              <button
                type="submit"
                disabled={isJoining || roomCode.length !== 6}
                className="w-full rounded-lg bg-green-600 px-4 py-3 text-white font-medium hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {isJoining ? 'Joining...' : 'Join Room'}
              </button>
            </form>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-800">
              {error}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
