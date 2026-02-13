'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import QRCode from 'qrcode';
import type { Room } from '@/types/loto';

export default function HostRoomPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>('');
  const [room, setRoom] = useState<Room | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Unwrap params
  useEffect(() => {
    params.then((p) => setRoomId(p.id));
  }, [params]);

  // Fetch room data
  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}`);
        if (!response.ok) throw new Error('Room not found');

        const data = await response.json();
        setRoom(data.room);

        // Generate QR code
        const joinUrl = `${window.location.origin}/room/${data.room.id}`;
        const qrDataUrl = await QRCode.toDataURL(joinUrl, {
          width: 300,
          margin: 2
        });
        setQrCodeUrl(qrDataUrl);

        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load room');
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [roomId]);

  // Fetch called numbers
  useEffect(() => {
    if (!roomId) return;

    const fetchNumbers = async () => {
      try {
        const response = await fetch(`/api/rooms/${roomId}/numbers`);
        if (response.ok) {
          const data = await response.json();
          setCalledNumbers(data.numbers);
        }
      } catch (err) {
        console.error('Failed to fetch numbers:', err);
      }
    };

    fetchNumbers();
    const interval = setInterval(fetchNumbers, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  const handleStartGame = () => {
    router.push(`/host/${roomId}/game`);
  };

  const copyRoomCode = () => {
    if (room) {
      navigator.clipboard.writeText(room.room_code);
      alert('Room code copied!');
    }
  };

  const copyJoinLink = () => {
    if (room) {
      const joinUrl = `${window.location.origin}/room/${room.id}`;
      navigator.clipboard.writeText(joinUrl);
      alert('Join link copied!');
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-gray-600">Loading room...</p>
        </div>
      </div>
    );
  }

  if (error || !room) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
          <p className="text-gray-600 mb-4">{error || 'Room not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Host Room</h1>
          <div className="flex gap-2">
            {calledNumbers.length > 0 && (
              <button
                onClick={() => router.push(`/host/${roomId}/game`)}
                className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 font-medium"
              >
                Back to Game
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
            >
              Leave
            </button>
          </div>
        </div>

        {/* Room Code Card */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-2">Room Code</p>
            <div className="flex items-center justify-center gap-4">
              <p className="text-5xl font-bold tracking-widest font-mono text-blue-600">
                {room.room_code}
              </p>
              <button
                onClick={copyRoomCode}
                className="rounded-lg bg-blue-100 p-3 text-blue-600 hover:bg-blue-200"
                title="Copy room code"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Share this code with players to join
            </p>
          </div>
        </div>

        {/* QR Code & Join Link */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* QR Code */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4 text-center">
              Scan to Join
            </h2>
            {qrCodeUrl && (
              <div className="flex justify-center">
                <Image
                  src={qrCodeUrl}
                  alt="QR Code to join room"
                  width={300}
                  height={300}
                  className="rounded-lg border-4 border-gray-200"
                  priority
                />
              </div>
            )}
          </div>

          {/* Room Info */}
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Room Info
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Status:</span>
                <span
                  className={`font-semibold ${
                    room.status === 'waiting'
                      ? 'text-yellow-600'
                      : room.status === 'active'
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}
                >
                  {room.status.charAt(0).toUpperCase() + room.status.slice(1)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Numbers Called:</span>
                <span className="font-semibold">
                  {calledNumbers.length} / 90
                </span>
              </div>
              <div className="pt-4">
                <button
                  onClick={copyJoinLink}
                  className="w-full rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700 hover:bg-gray-200"
                >
                  📋 Copy Join Link
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Start Game Button */}
        {room.status === 'waiting' && (
          <div className="rounded-lg bg-white p-6 shadow-lg text-center">
            <p className="text-gray-600 mb-4">Waiting for players to join...</p>
            <button
              onClick={handleStartGame}
              className="rounded-lg bg-green-600 px-8 py-3 text-lg font-semibold text-white hover:bg-green-700"
            >
              Start Game
            </button>
          </div>
        )}

        {/* Called Numbers Preview */}
        {calledNumbers.length > 0 && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Called Numbers
            </h2>
            <div className="flex flex-wrap gap-2">
              {calledNumbers.map((num) => (
                <span
                  key={num}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-white font-semibold"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
