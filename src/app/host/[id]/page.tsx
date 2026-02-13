'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import QRCode from 'qrcode';
import { Header } from '@/components/layout/header';
import { Background } from '@/components/layout/background';
import { Footer } from '@/components/layout/footer';
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
      <Background>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center bg-white/90 backdrop-blur rounded-xl p-8 shadow-xl border-4 border-red-600">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto" />
            <p className="text-red-800 font-semibold">Đang tải phòng...</p>
          </div>
        </div>
      </Background>
    );
  }

  if (error || !room) {
    return (
      <Background>
        <div className="flex min-h-screen items-center justify-center p-4">
          <div className="text-center bg-white/90 backdrop-blur rounded-xl p-8 shadow-xl border-4 border-red-600">
            <h1 className="text-3xl font-bold text-red-600 mb-4">❌ Lỗi</h1>
            <p className="text-gray-700 mb-6 text-lg">
              {error || 'Không tìm thấy phòng'}
            </p>
            <button
              onClick={() => router.push('/')}
              className="rounded-lg bg-gradient-to-r from-red-600 to-red-700 px-8 py-3 text-white font-bold hover:from-red-700 hover:to-red-800 shadow-lg transform hover:-translate-y-0.5 transition-all"
            >
              🏠 Về trang chủ
            </button>
          </div>
        </div>
      </Background>
    );
  }

  return (
    <Background>
      <Header
        title="Phòng chủ"
        subtitle={`Mã: ${room.room_code}`}
        action={
          <div className="flex gap-2">
            {calledNumbers.length > 0 && (
              <button
                onClick={() => router.push(`/host/${roomId}/game`)}
                className="rounded-lg bg-yellow-400 px-4 py-2 text-red-900 font-bold hover:bg-yellow-500 shadow-lg transition-all"
              >
                Quay lại game
              </button>
            )}
            <button
              onClick={() => router.push('/')}
              className="rounded-lg bg-white/90 backdrop-blur px-4 py-2 text-red-700 font-semibold hover:bg-white border-2 border-white/50 shadow-lg transition-all"
            >
              Rời phòng
            </button>
          </div>
        }
      />

      <div className="mx-auto max-w-4xl space-y-6 p-4">
        {/* Room Code Card */}
        <div className="rounded-xl bg-white/95 backdrop-blur p-8 shadow-2xl border-4 border-red-600">
          <div className="text-center">
            <p className="text-sm text-red-700 mb-3 font-semibold flex items-center justify-center gap-2">
              Mã phòng
            </p>
            <div className="flex items-center justify-center gap-4">
              <p className="text-6xl font-bold tracking-widest font-mono bg-gradient-to-r from-red-600 to-yellow-600 bg-clip-text text-transparent drop-shadow-lg">
                {room.room_code}
              </p>
              <button
                onClick={copyRoomCode}
                className="rounded-lg bg-red-100 p-3 text-red-600 hover:bg-red-200 shadow-lg transition-all transform hover:scale-110"
                title="Sao chép mã phòng"
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
            <p className="mt-4 text-sm text-gray-700 font-medium">
              Chia sẻ mã này để người chơi tham gia
            </p>
          </div>
        </div>

        {/* QR Code & Join Link */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* QR Code */}
          <div className="rounded-xl bg-white/95 backdrop-blur p-6 shadow-xl border-2 border-red-300">
            <h2 className="text-xl font-semibold text-red-800 mb-4 text-center flex items-center justify-center gap-2">
              Quét mã để tham gia
            </h2>
            {qrCodeUrl && (
              <div className="flex justify-center">
                <Image
                  src={qrCodeUrl}
                  alt="Mã QR để tham gia phòng"
                  width={300}
                  height={300}
                  className="rounded-lg border-4 border-red-400 shadow-lg"
                  priority
                />
              </div>
            )}
          </div>

          {/* Room Info */}
          <div className="rounded-xl bg-white/95 backdrop-blur p-6 shadow-xl border-2 border-red-300">
            <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center gap-2">
              Thông tin phòng
            </h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-gray-700 font-medium">Trạng thái:</span>
                <span
                  className={`font-bold ${
                    room.status === 'waiting'
                      ? 'text-yellow-600'
                      : room.status === 'active'
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }`}
                >
                  {room.status === 'waiting'
                    ? 'Đang chờ'
                    : room.status === 'active'
                    ? 'Đang chơi'
                    : 'Đã kết thúc'}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-gray-700 font-medium">Số đã gọi:</span>
                <span className="font-bold text-red-600">
                  {calledNumbers.length} / 90
                </span>
              </div>
              <div className="pt-2">
                <button
                  onClick={copyJoinLink}
                  className="w-full rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 px-4 py-3 text-red-900 font-bold hover:from-yellow-500 hover:to-yellow-600 shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  Sao chép link tham gia
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Start Game Button */}
        {room.status === 'waiting' && (
          <div className="rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 p-8 shadow-xl border-4 border-green-500 text-center">
            <p className="text-green-800 mb-4 text-lg font-semibold">
              Đang chờ người chơi tham gia...
            </p>
            <button
              onClick={handleStartGame}
              className="rounded-lg bg-gradient-to-r from-green-600 to-green-700 px-12 py-4 text-xl font-bold text-white hover:from-green-700 hover:to-green-800 shadow-2xl transform hover:scale-105 transition-all"
            >
              Bắt đầu chơi
            </button>
          </div>
        )}

        {/* Called Numbers Preview */}
        {calledNumbers.length > 0 && (
          <div className="rounded-xl bg-white/95 backdrop-blur p-6 shadow-xl border-2 border-red-300">
            <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center gap-2">
              Các số đã gọi
            </h2>
            <div className="flex flex-wrap gap-2">
              {calledNumbers.map((num) => (
                <span
                  key={num}
                  className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-red-600 to-red-700 text-white font-bold shadow-lg"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </Background>
  );
}
