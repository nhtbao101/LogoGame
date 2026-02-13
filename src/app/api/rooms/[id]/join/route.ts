import { NextRequest, NextResponse } from 'next/server';
import { joinRoomAndGetTicket } from '@/services/database.service';

/**
 * POST /api/rooms/[id]/join
 * Join a room and receive a ticket
 *
 * Body: { playerId: string, playerName?: string }
 * Response: { room: Room, ticket: LotoTicket, is_new_ticket: boolean }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const body = await request.json();
    const { playerId, playerName } = body;

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    if (!playerId) {
      return NextResponse.json(
        { error: 'playerId is required' },
        { status: 400 }
      );
    }

    // Join room and get ticket
    const result = await joinRoomAndGetTicket(
      roomId,
      playerId,
      playerName || `Player ${playerId.substring(0, 8)}`
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Failed to join room. Room may not exist or be full.' },
        { status: 400 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/rooms/[id]/join error:', error);

    const message =
      error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
