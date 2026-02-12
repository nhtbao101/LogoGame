/**
 * Database Service Layer
 *
 * Handles all Supabase database operations for rooms and tickets.
 * Implements proper error handling and type safety.
 */

import { supabase } from '@/utils/supabase/client';
import {
  generateLotoTicket,
  serializeTicket
} from '@/features/ticket/utils/loto-generator';
import type {
  Room,
  LotoTicket,
  CreateRoomInput,
  JoinRoomResult,
  RoomStatus,
  TicketGrid
} from '@/types/loto';
import type { Database } from '@/types/supabase';

// ============================================================================
// Room Management
// ============================================================================

/**
 * Generates a unique 6-character alphanumeric room code
 */
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous chars: I, O, 0, 1
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Creates a new game room
 *
 * @param input - Room creation parameters
 * @returns The created room
 * @throws Error if room creation fails
 *
 * @example
 * const room = await createRoom({ host_id: guestId });
 */
export async function createRoom(input: CreateRoomInput): Promise<Room> {
  const roomCode = input.room_code || generateRoomCode();

  const insertData: Database['public']['Tables']['rooms']['Insert'] = {
    room_code: roomCode,
    host_id: input.host_id,
    status: 'waiting'
  };

  const { data, error } = await supabase
    .from('rooms')
    // @ts-expect-error - Supabase types will be correctly inferred once DB is connected
    .insert(insertData)
    .select()
    .single();

  if (error) {
    console.error('Create room error:', error);
    throw new Error(`Failed to create room: ${error.message}`);
  }

  return data as Room;
}

/**
 * Fetches a room by its code
 *
 * @param roomCode - The 6-character room code
 * @returns The room or null if not found
 *
 * @example
 * const room = await getRoomByCode('ABC123');
 */
export async function getRoomByCode(roomCode: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('room_code', roomCode.toUpperCase())
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Get room by code error:', error);
    throw new Error(`Failed to fetch room: ${error.message}`);
  }

  return data as Room;
}

/**
 * Fetches a room by its ID
 *
 * @param roomId - The room UUID
 * @returns The room or null if not found
 */
export async function getRoomById(roomId: string): Promise<Room | null> {
  const { data, error } = await supabase
    .from('rooms')
    .select('*')
    .eq('id', roomId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    console.error('Get room by ID error:', error);
    throw new Error(`Failed to fetch room: ${error.message}`);
  }

  return data as Room;
}

/**
 * Updates a room's status
 *
 * @param roomId - The room UUID
 * @param status - The new status
 * @returns The updated room
 */
export async function updateRoomStatus(
  roomId: string,
  status: RoomStatus
): Promise<Room> {
  const updates: Database['public']['Tables']['rooms']['Update'] = { status };

  // Set timestamps based on status
  if (status === 'active') {
    updates.started_at = new Date().toISOString();
  } else if (status === 'completed') {
    updates.ended_at = new Date().toISOString();
  }

  const { data, error } = await supabase
    .from('rooms')
    // @ts-expect-error - Supabase types will be correctly inferred once DB is connected
    .update(updates)
    .eq('id', roomId)
    .select()
    .single();

  if (error) {
    console.error('Update room status error:', error);
    throw new Error(`Failed to update room status: ${error.message}`);
  }

  return data as Room;
}

// ============================================================================
// Ticket Management
// ============================================================================

/**
 * Generates a SHA-256 hash of a ticket grid for uniqueness validation
 *
 * @param ticketData - The 3x9 ticket grid
 * @returns SHA-256 hash string
 */
async function hashTicket(ticketData: TicketGrid): Promise<string> {
  const serialized = serializeTicket(ticketData);
  const encoder = new TextEncoder();
  const data = encoder.encode(serialized);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Checks if a player already has a ticket in a room
 *
 * @param roomId - The room UUID
 * @param playerId - The player's guest ID
 * @returns The existing ticket or null
 */
export async function getPlayerTicket(
  roomId: string,
  playerId: string
): Promise<LotoTicket | null> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('room_id', roomId)
    .eq('player_id', playerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found
      return null;
    }
    console.error('Get player ticket error:', error);
    throw new Error(`Failed to fetch ticket: ${error.message}`);
  }

  return data as LotoTicket;
}

/**
 * Creates a new ticket for a player in a room
 *
 * @param roomId - The room UUID
 * @param playerId - The player's guest ID
 * @param playerName - Optional player name
 * @returns The created ticket
 * @throws Error if ticket creation fails (including duplicates)
 */
async function createTicket(
  roomId: string,
  playerId: string,
  playerName?: string
): Promise<LotoTicket> {
  const maxAttempts = 10;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      // Generate a new ticket
      const ticketData = generateLotoTicket();
      const ticketHash = await hashTicket(ticketData);

      // Insert into database
      const insertData: Database['public']['Tables']['tickets']['Insert'] = {
        room_id: roomId,
        player_id: playerId,
        player_name: playerName || null,
        ticket_data: ticketData,
        ticket_hash: ticketHash
      };

      const { data, error } = await supabase
        .from('tickets')
        // @ts-expect-error - Supabase types will be correctly inferred once DB is connected
        .insert(insertData)
        .select()
        .single();

      if (error) {
        // Check if it's a uniqueness constraint violation
        if (error.code === '23505') {
          // Duplicate ticket_hash in this room - retry with new ticket
          console.warn(
            `Duplicate ticket detected (attempt ${
              attempt + 1
            }), regenerating...`
          );
          lastError = new Error('Duplicate ticket generated');
          continue;
        }
        throw new Error(`Failed to create ticket: ${error.message}`);
      }

      return data as LotoTicket;
    } catch (error) {
      lastError = error as Error;
      console.error(`Ticket creation attempt ${attempt + 1} failed:`, error);
    }
  }

  throw new Error(
    `Failed to generate unique ticket after ${maxAttempts} attempts: ${lastError?.message}`
  );
}

/**
 * Gets all tickets in a room (for host view)
 *
 * @param roomId - The room UUID
 * @returns Array of tickets in the room
 */
export async function getRoomTickets(roomId: string): Promise<LotoTicket[]> {
  const { data, error } = await supabase
    .from('tickets')
    .select('*')
    .eq('room_id', roomId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Get room tickets error:', error);
    throw new Error(`Failed to fetch room tickets: ${error.message}`);
  }

  return data as LotoTicket[];
}

// ============================================================================
// Combined Operations
// ============================================================================

/**
 * Joins a room and gets or creates a ticket for the player
 *
 * This function:
 * 1. Validates the room exists and is joinable
 * 2. Checks if player already has a ticket
 * 3. Creates a new ticket if needed (with uniqueness guarantee)
 * 4. Returns the room and ticket
 *
 * @param roomCode - The 6-character room code
 * @param playerId - The player's guest ID (from localStorage)
 * @param playerName - Optional player name
 * @returns Room and ticket information
 * @throws Error if room not found or not joinable
 *
 * @example
 * const result = await joinRoomAndGetTicket('ABC123', guestId, 'Player 1');
 * if (result.is_new_ticket) {
 *   console.log('New ticket created!');
 * }
 */
export async function joinRoomAndGetTicket(
  roomCode: string,
  playerId: string,
  playerName?: string
): Promise<JoinRoomResult> {
  // Step 1: Validate room exists
  const room = await getRoomByCode(roomCode);

  if (!room) {
    throw new Error('Room not found. Please check the room code.');
  }

  // Step 2: Check if room is joinable
  if (room.status === 'completed') {
    throw new Error('This game has already ended. You cannot join.');
  }

  // Step 3: Check if player already has a ticket
  let ticket = await getPlayerTicket(room.id, playerId);
  let isNewTicket = false;

  // Step 4: Create ticket if needed
  if (!ticket) {
    ticket = await createTicket(room.id, playerId, playerName);
    isNewTicket = true;
  }

  return {
    room,
    ticket,
    is_new_ticket: isNewTicket
  };
}

/**
 * Validates if a room code format is correct
 *
 * @param code - The room code to validate
 * @returns true if valid format
 */
export function isValidRoomCode(code: string): boolean {
  return /^[A-Z0-9]{6}$/.test(code);
}
