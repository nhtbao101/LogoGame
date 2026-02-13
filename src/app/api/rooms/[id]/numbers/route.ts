import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase/client';
import type { Database } from '@/types/supabase';
import type { Room } from '@/types/loto';

type CalledNumberInsert =
  Database['public']['Tables']['called_numbers']['Insert'];

/**
 * POST /api/rooms/[id]/numbers
 * Call a new number in the room (host only)
 *
 * Body: { number: number, hostId: string }
 * Response: { success: true, number: number }
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;
    const body = await request.json();
    const { number, hostId } = body;

    // Validation
    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    if (!number || typeof number !== 'number') {
      return NextResponse.json(
        { error: 'Valid number is required' },
        { status: 400 }
      );
    }

    if (number < 1 || number > 90) {
      return NextResponse.json(
        { error: 'Number must be between 1 and 90' },
        { status: 400 }
      );
    }

    if (!hostId) {
      return NextResponse.json(
        { error: 'Host ID is required' },
        { status: 400 }
      );
    }

    // Verify room exists and user is the host
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const roomData = room as unknown as Room;

    if (roomData.host_id !== hostId) {
      return NextResponse.json(
        { error: 'Only the host can call numbers' },
        { status: 403 }
      );
    }

    if (roomData.status === 'completed') {
      return NextResponse.json(
        { error: 'Game has already ended' },
        { status: 400 }
      );
    }

    // Check if number was already called
    const { data: existing } = await supabase
      .from('called_numbers')
      .select('*')
      .eq('room_id', roomId)
      .eq('number', number)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'This number has already been called' },
        { status: 400 }
      );
    }

    // Start the game if it's in waiting status
    if (roomData.status === 'waiting') {
      await supabase
        .from('rooms')
        // @ts-expect-error - Supabase type inference issue without live connection
        .update({ status: 'active', started_at: new Date().toISOString() })
        .eq('id', roomId);
    }

    // Insert the called number
    const { error: insertError } = await supabase
      .from('called_numbers')
      // @ts-expect-error - Supabase type inference issue without live connection
      .insert({
        room_id: roomId,
        number,
        called_at: new Date().toISOString(),
        called_by: hostId
      } as CalledNumberInsert);

    if (insertError) {
      console.error('Insert called_number error:', insertError);
      return NextResponse.json(
        { error: 'Failed to record called number' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, number });
  } catch (error) {
    console.error('POST /api/rooms/[id]/numbers error:', error);

    const message =
      error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/**
 * GET /api/rooms/[id]/numbers
 * Get all called numbers for a room
 *
 * Response: { numbers: number[], count: number }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: roomId } = await params;

    if (!roomId) {
      return NextResponse.json(
        { error: 'Room ID is required' },
        { status: 400 }
      );
    }

    // Verify room exists
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (roomError || !room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Get all called numbers
    const { data: calledNumbers, error } = await supabase
      .from('called_numbers')
      .select('number, called_at')
      .eq('room_id', roomId)
      .order('called_at', { ascending: true });

    if (error) {
      console.error('Get called_numbers error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch called numbers' },
        { status: 500 }
      );
    }

    const numbers = (calledNumbers as Array<{ number: number; called_at: string }>)?.map((cn) => cn.number) || [];

    return NextResponse.json({
      numbers,
      count: numbers.length
    });
  } catch (error) {
    console.error('GET /api/rooms/[id]/numbers error:', error);

    const message =
      error instanceof Error ? error.message : 'Internal server error';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
