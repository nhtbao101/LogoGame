'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrCreateGuestId } from '@/utils/guest';
import { Header } from '@/components/layout/header';
import { Background } from '@/components/layout/background';
import { Footer } from '@/components/layout/footer';
import type { Room } from '@/types/loto';

export default function HostGamePage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>('');
  const [room, setRoom] = useState<Room | null>(null);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [availableNumbers, setAvailableNumbers] = useState<number[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<number | null>(null);
  const [isCalling, setIsCalling] = useState(false);
  const [error, setError] = useState('');

  // Unwrap params
  useEffect(() => {
    params.then((p) => setRoomId(p.id));
  }, [params]);

  // Initialize available numbers (1-90)
  useEffect(() => {
    setAvailableNumbers(Array.from({ length: 90 }, (_, i) => i + 1));
  }, []);

  // Fetch room and numbers
  useEffect(() => {
    if (!roomId) return;

    const fetchRoom = async () => {
      try {
        const roomResponse = await fetch(`/api/rooms/${roomId}`);
        if (roomResponse.ok) {
          const roomData = await roomResponse.json();
          setRoom(roomData.room);
        }
      } catch (err) {
        console.error('Failed to fetch room:', err);
      }
    };

    const fetchNumbers = async () => {
      try {
        const numbersResponse = await fetch(`/api/rooms/${roomId}/numbers`);
        if (numbersResponse.ok) {
          const numbersData = await numbersResponse.json();
          setCalledNumbers(numbersData.numbers);
        }
      } catch (err) {
        console.error('Failed to fetch numbers:', err);
      }
    };

    // Initial fetch
    fetchRoom(); // Fetch room once
    fetchNumbers();

    // Only poll called numbers (they change frequently)
    const interval = setInterval(fetchNumbers, 5000);
    return () => clearInterval(interval);
  }, [roomId]);

  const handleCallNumber = async (number: number) => {
    if (calledNumbers.includes(number)) {
      setError('This number has already been called!');
      return;
    }

    setIsCalling(true);
    setError('');
    setSelectedNumber(number);

    try {
      const { guest_id } = getOrCreateGuestId();

      const response = await fetch(`/api/rooms/${roomId}/numbers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number,
          hostId: guest_id
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to call number');
      }

      // Update called numbers
      setCalledNumbers((prev) => [...prev, number]);
      setSelectedNumber(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to call number');
    } finally {
      setIsCalling(false);
    }
  };

  const handleRandomNumber = () => {
    const available = availableNumbers.filter(
      (n) => !calledNumbers.includes(n)
    );
    if (available.length === 0) {
      setError('All numbers have been called!');
      return;
    }

    const randomNum = available[Math.floor(Math.random() * available.length)];
    handleCallNumber(randomNum);
  };

  const handleEndGame = async () => {
    if (confirm('Bạn có chắc muốn kết thúc trò chơi?')) {
      router.push('/');
    }
  };

  // Group numbers by tens
  const numberGroups = [
    { range: '1-10', numbers: availableNumbers.slice(0, 10) },
    { range: '11-20', numbers: availableNumbers.slice(10, 20) },
    { range: '21-30', numbers: availableNumbers.slice(20, 30) },
    { range: '31-40', numbers: availableNumbers.slice(30, 40) },
    { range: '41-50', numbers: availableNumbers.slice(40, 50) },
    { range: '51-60', numbers: availableNumbers.slice(50, 60) },
    { range: '61-70', numbers: availableNumbers.slice(60, 70) },
    { range: '71-80', numbers: availableNumbers.slice(70, 80) },
    { range: '81-90', numbers: availableNumbers.slice(80, 90) }
  ];

  if (!room) {
    return (
      <Background>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center bg-white/90 backdrop-blur rounded-xl p-8 shadow-xl border-4 border-red-600">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto" />
            <p className="text-red-800 font-semibold">Đang tải game...</p>
          </div>
        </div>
      </Background>
    );
  }

  return (
    <Background>
      <Header
        title={`Mã phòng: ${room.room_code}`}
        subtitle={`Đã gọi: ${calledNumbers.length}/90`}
        action={
          <button
            onClick={handleEndGame}
            className="rounded-lg bg-white/90 backdrop-blur px-6 py-2 text-red-700 font-bold hover:bg-white border-2 border-white/50 shadow-lg transition-all"
          >
            Kết thúc game
          </button>
        }
      />

      <div className="mx-auto max-w-6xl space-y-6 p-4">
        {/* Last Called Number */}
        <div className="rounded-lg bg-gradient-to-br from-green-500 to-green-600 p-8 shadow-lg text-center">
          <p className="text-white text-lg mb-2">Số vừa gọi</p>
          <div className="text-8xl font-bold text-white">
            {calledNumbers.length > 0
              ? calledNumbers[calledNumbers.length - 1]
              : '--'}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2">
          <button
            onClick={handleRandomNumber}
            disabled={isCalling || calledNumbers.length === 90}
            className="rounded-lg bg-blue-600 px-6 py-4 text-lg font-semibold text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            🎲 Gọi số ngẫu nhiên
          </button>
          <button
            onClick={() => router.push(`/host/${roomId}`)}
            className="rounded-lg bg-gray-600 px-6 py-4 text-lg font-semibold text-white hover:bg-gray-700"
          >
            📊 Xem thông tin phòng
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-100 border-2 border-red-400 p-4 text-red-800 font-semibold">
            ⚠️ {error}
          </div>
        )}

        {/* Number Grid */}
        <div className="rounded-xl bg-white/95 backdrop-blur p-6 shadow-2xl border-2 border-red-300">
          <h2 className="text-xl font-semibold text-red-800 mb-6 flex items-center gap-2">
            <span>🎯</span> Chọn số để gọi
          </h2>
          <div className="space-y-6">
            {numberGroups.map((group) => (
              <div key={group.range}>
                <p className="text-sm font-bold text-red-700 mb-3 bg-red-50 px-3 py-1 rounded-lg inline-block">
                  {group.range}
                </p>
                <div className="grid grid-cols-5 gap-2 sm:grid-cols-10">
                  {group.numbers.map((num) => {
                    const isCalled = calledNumbers.includes(num);
                    const isSelected = selectedNumber === num;

                    return (
                      <button
                        key={num}
                        onClick={() => handleCallNumber(num)}
                        disabled={isCalled || isCalling}
                        className={`
                          aspect-square rounded-lg text-lg font-bold transition-all shadow-md
                          ${
                            isCalled
                              ? 'bg-gray-300 text-gray-500 cursor-not-allowed line-through'
                              : isSelected
                              ? 'bg-gradient-to-br from-yellow-400 to-yellow-500 text-red-900 scale-110 shadow-xl ring-4 ring-yellow-300'
                              : 'bg-white border-2 border-red-500 text-red-600 hover:bg-red-50 hover:scale-105 active:scale-95'
                          }
                        `}
                      >
                        {num}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Called Numbers History */}
        <div className="rounded-xl bg-white/95 backdrop-blur p-6 shadow-2xl border-2 border-red-300">
          <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center gap-2">
            <span>📋</span> Lịch sử các số đã gọi ({calledNumbers.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {calledNumbers.map((num, index) => (
              <span
                key={num}
                className={`
                  flex h-14 w-14 items-center justify-center rounded-full font-bold text-white shadow-lg transition-all
                  ${
                    index === calledNumbers.length - 1
                      ? 'bg-gradient-to-br from-green-500 to-green-600 ring-4 ring-green-300 scale-110'
                      : 'bg-gradient-to-br from-red-600 to-red-700'
                  }
                `}
              >
                {num}
              </span>
            ))}
            {calledNumbers.length === 0 && (
              <p className="text-gray-500 italic">Chưa có số nào được gọi</p>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </Background>
  );
}
