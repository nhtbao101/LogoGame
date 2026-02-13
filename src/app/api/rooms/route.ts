import { NextRequest, NextResponse } from 'next/server';
import { createRoom } from '@/services/database.service';

/**
 * POST /api/rooms
 * Create a new room
 *
 * Body: { hostId: string }
 * Response: { room: Room }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { hostId } = body;

    if (!hostId) {
      return NextResponse.json(
        { error: 'hostId is required' },
        { status: 400 }
      );
    }

    // Create the room
    const room = await createRoom({
      host_id: hostId
    });

    if (!room) {
      return NextResponse.json(
        { error: 'Failed to create room' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { room },
      {
        status: 201,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('POST /api/rooms error:', error);

    const message =
      error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
