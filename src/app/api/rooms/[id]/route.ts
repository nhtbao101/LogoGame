import { NextRequest, NextResponse } from 'next/server';
import { getRoomById } from '@/services/database.service';

/**
 * GET /api/rooms/[id]
 * Get room details by room ID
 *
 * Response: { room: Room } or 404
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    const room = await getRoomById(id);

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('GET /api/rooms/[id] error:', error);

    const message =
      error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
