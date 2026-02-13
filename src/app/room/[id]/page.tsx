'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getOrCreateGuestId } from '@/utils/guest';
import { TicketDisplay } from '@/components/loto/ticket-display';
import {
  WinCelebration,
  WinProgressIndicator
} from '@/components/loto/win-celebration';
import { checkWinCondition, getNumbersToWin } from '@/lib/loto/win-detection';
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
  const [manuallyMarkedNumbers, setManuallyMarkedNumbers] = useState<Set<number>>(new Set());
  const [isMarkingMode, setIsMarkingMode] = useState(false);
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
    const interval = setInterval(fetchNumbers, 3000);
    return () => clearInterval(interval);
  }, [roomId]);

  // Count marked numbers in ticket
  const markedCount = manuallyMarkedNumbers.size;
  const totalNumbers =
    ticket?.ticket_data.flat().filter((cell) => cell !== null).length || 15;

  // Handle manual marking
  const handleNumberClick = (number: number) => {
    if (!isMarkingMode) return;
    
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
  const numbersToWin = ticket
    ? getNumbersToWin(ticket.ticket_data, manuallyMarkedNumbers)
    : null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-blue-600 border-t-transparent mx-auto" />
          <p className="text-gray-600">Joining room...</p>
        </div>
      </div>
    );
  }

  if (error || !room || !ticket) {
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
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 p-4">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-lg bg-white p-4 shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Room: {room.room_code}
            </h1>
            <p className="text-sm text-gray-600">
              Status:{' '}
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
            </p>
          </div>
          <button
            onClick={() => router.push('/')}
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          >
            Leave
          </button>
        </div>

        {/* Progress */}
        <div className="rounded-lg bg-white p-4 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Numbers Marked
            </span>
            <span className="text-sm font-semibold text-blue-600">
              {markedCount} / {totalNumbers}
            </span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500"
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
          <div className="rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 p-6 shadow-lg text-center">
            <p className="text-white text-sm mb-2">Last Called</p>
            <div className="text-6xl font-bold text-white">
              {calledNumbers[calledNumbers.length - 1]}
            </div>
          </div>
        )}
        {/* Ticket Display */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Your Ticket</h2>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-500">
                ID: {ticket.id.substring(0, 8)}...
              </span>
              <button
                onClick={() => setIsMarkingMode(!isMarkingMode)}
                className={`flex items-center gap-2 rounded-lg px-4 py-2 font-medium transition-colors ${
                  isMarkingMode
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                </svg>
                {isMarkingMode ? 'Marking Mode ON' : 'Tap to Mark'}
              </button>
            </div>
          </div>

          {isMarkingMode && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-800">
                ✏️ <strong>Marking mode is active.</strong> Tap numbers on your ticket to mark them.
              </p>
            </div>
          )}

          {/* Use TicketDisplay Component */}
          <TicketDisplay
            ticketData={ticket.ticket_data}
            markedNumbers={manuallyMarkedNumbers}
            onCellClick={isMarkingMode ? handleNumberClick : undefined}
            size="lg"
          />
        </div>

        {/* Win Progress Indicator */}
        {numbersToWin && !winResult.hasWon && (
          <div className="rounded-lg bg-white p-6 shadow-lg">
            <WinProgressIndicator numbersToWin={numbersToWin} />
          </div>
        )}

        {/* Called Numbers History */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Called Numbers ({calledNumbers.length})
          </h2>
          <div className="flex flex-wrap gap-2">
            {calledNumbers.length === 0 ? (
              <p className="text-gray-500">No numbers called yet</p>
            ) : (
              calledNumbers.map((num, index) => (
                <span
                  key={num}
                  className={`
                    flex h-10 w-10 items-center justify-center rounded-full font-semibold text-white
                    ${
                      index === calledNumbers.length - 1
                        ? 'bg-blue-600 ring-4 ring-blue-200'
                        : 'bg-gray-600'
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
    </div>
  );
}
