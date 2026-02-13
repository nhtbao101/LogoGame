import { NextRequest, NextResponse } from 'next/server';
import { getRoomByCode } from '@/services/database.service';

/**
 * GET /api/rooms/code/[code]
 * Get room details by room code
 *
 * Response: { room: Room } or 404
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code || code.length !== 6) {
      return NextResponse.json(
        { error: 'Invalid room code. Must be 6 characters.' },
        { status: 400 }
      );
    }

    const room = await getRoomByCode(code.toUpperCase());

    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    return NextResponse.json({ room });
  } catch (error) {
    console.error('GET /api/rooms/[code] error:', error);

    const message =
      error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
