'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrCreateGuestId } from '@/utils/guest';
import { TetLotoTicket } from '@/components/loto/tet-loto-ticket';
import { WinCelebration } from '@/components/loto/win-celebration';
import { checkWinCondition } from '@/lib/loto/win-detection';
import { Header } from '@/components/layout/header';
import { Background } from '@/components/layout/background';
import { Footer } from '@/components/layout/footer';
import type { Room, LotoTicket } from '@/types/loto';

export default function PlayerRoomPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [roomId, setRoomId] = useState<string>('');
  const [room, setRoom] = useState<Room | null>(null);
  const [ticket, setTicket] = useState<LotoTicket | null>(null);
  const [calledNumbers, setCalledNumbers] = useState<number[]>([]);
  const [manuallyMarkedNumbers, setManuallyMarkedNumbers] = useState<
    Set<number>
  >(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Unwrap params
  useEffect(() => {
    params.then((p) => setRoomId(p.id));
  }, [params]);

  // Join room and get ticket
  useEffect(() => {
    if (!roomId) return;

    const joinRoom = async () => {
      try {
        const { guest_id } = getOrCreateGuestId();

        const response = await fetch(`/api/rooms/${roomId}/join`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            playerId: guest_id,
            playerName: `Player ${guest_id.substring(0, 8)}`
          })
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to join room');
        }

        const data = await response.json();
        setRoom(data.room);
        setTicket(data.ticket);
        setIsLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to join room');
        setIsLoading(false);
      }
    };

    joinRoom();
  }, [roomId]);

  // Fetch called numbers periodically
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
    const interval = setInterval(fetchNumbers, 100000);
    return () => clearInterval(interval);
  }, [roomId]);

  // Count marked numbers in ticket
  const markedCount = manuallyMarkedNumbers.size;
  const totalNumbers =
    ticket?.ticket_data.flat().filter((cell) => cell !== null).length || 15;

  // Handle manual marking
  const handleNumberClick = (number: number) => {
    setManuallyMarkedNumbers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(number)) {
        newSet.delete(number);
      } else {
        newSet.add(number);
      }
      return newSet;
    });
  };

  // Win detection using manually marked numbers
  const winResult = ticket
    ? checkWinCondition(ticket.ticket_data, manuallyMarkedNumbers)
    : { hasWon: false, completedRows: [] };

  if (isLoading) {
    return (
      <Background>
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center bg-white/90 backdrop-blur rounded-xl p-8 shadow-xl border-4 border-red-600">
            <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-red-600 border-t-transparent mx-auto" />
            <p className="text-red-800 font-semibold">Đang tham gia phòng...</p>
          </div>
        </div>
      </Background>
    );
  }

  if (error || !room || !ticket) {
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
        title={`Phòng: ${room.room_code}`}
        subtitle={
          room.status === 'waiting'
            ? 'Đang chờ'
            : room.status === 'active'
            ? 'Đang chơi'
            : 'Đã kết thúc'
        }
        action={
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-white/90 backdrop-blur px-4 py-2 text-red-700 font-semibold hover:bg-white border-2 border-white/50 shadow-lg transition-all"
          >
            Rời phòng
          </button>
        }
      />

      <div className="mx-auto max-w-4xl space-y-6 p-4">
        {/* Progress */}
        <div className="rounded-xl bg-white/95 backdrop-blur p-6 shadow-xl border-2 border-red-300">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-red-800">
              Số đã đánh dấu
            </span>
            <span className="text-sm font-bold text-red-600">
              {markedCount} / {totalNumbers}
            </span>
          </div>
          <div className="h-3 bg-red-100 rounded-full overflow-hidden border border-red-200">
            <div
              className="h-full bg-gradient-to-r from-red-500 to-yellow-500 transition-all duration-500"
              style={{ width: `${(markedCount / totalNumbers) * 100}%` }}
            />
          </div>
        </div>

        {/* Win Celebration */}
        {winResult.hasWon && winResult.pattern && (
          <WinCelebration pattern={winResult.pattern} />
        )}

        {/* Last Called Number */}
        {calledNumbers.length > 0 && (
          <div className="rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-yellow-600 p-8 shadow-xl text-center border-4 border-yellow-400">
            <p className="text-yellow-100 text-sm mb-2 font-semibold">
              🎯 Số vừa gọi
            </p>
            <div className="text-7xl font-bold text-white drop-shadow-lg">
              {calledNumbers[calledNumbers.length - 1]}
            </div>
          </div>
        )}

        {/* Ticket Display */}
        <div className="rounded-lg md:p-0 p-0">
          {/* Use TetLotoTicket Component */}
          <TetLotoTicket
            data={ticket.ticket_data}
            markedNumbers={manuallyMarkedNumbers}
            onCellClick={handleNumberClick}
          />
        </div>

        {/* Called Numbers History */}
        <div className="rounded-xl bg-white/95 backdrop-blur p-6 shadow-xl border-2 border-red-300">
          <h2 className="text-xl font-semibold text-red-800 mb-4 flex items-center gap-2">
            <span>📋</span> Các số đã gọi ({calledNumbers.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {calledNumbers.length === 0 ? (
              <p className="text-gray-500 italic">Chưa có số nào được gọi</p>
            ) : (
              calledNumbers.map((num, index) => (
                <span
                  key={num}
                  className={`
                    flex h-12 w-12 items-center justify-center rounded-full font-bold text-white shadow-lg transition-all
                    ${
                      index === calledNumbers.length - 1
                        ? 'bg-gradient-to-br from-red-600 to-red-700 ring-4 ring-yellow-400 scale-110'
                        : 'bg-gradient-to-br from-gray-600 to-gray-700'
                    }
                  `}
                >
                  {num}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
      <Footer />
    </Background>
  );
}
