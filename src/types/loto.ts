/**
 * Core type definitions for Loto Game
 * Based on the Vietnamese Bingo 3x9 grid system
 */

// ============================================================================
// Ticket Types
// ============================================================================

/**
 * A single cell in the Loto ticket grid
 * - number: A value between 1-90
 * - null: An empty cell
 */
export type TicketCell = number | null;

/**
 * A 3x9 grid representing a complete Loto ticket
 * - 3 rows
 * - 9 columns
 * - 15 total numbers
 * - 12 blank cells
 */
export type TicketGrid = TicketCell[][];

/**
 * Complete Loto ticket entity
 */
export interface LotoTicket {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string | null;
  ticket_data: TicketGrid;
  ticket_hash: string; // SHA-256 hash for uniqueness validation
  created_at: string; // ISO timestamp
}

/**
 * Input for creating a new ticket
 */
export interface CreateTicketInput {
  room_id: string;
  player_id: string;
  player_name?: string;
  ticket_data: TicketGrid;
  ticket_hash: string;
}

// ============================================================================
// Room Types
// ============================================================================

/**
 * Room status lifecycle
 * - waiting: Room created, players can join
 * - active: Game started, numbers being called
 * - completed: Game finished
 */
export type RoomStatus = 'waiting' | 'active' | 'completed';

/**
 * Game room entity
 */
export interface Room {
  id: string;
  room_code: string; // 6-character alphanumeric code (e.g., "ABC123")
  host_id: string; // Guest UUID stored in localStorage
  status: RoomStatus;
  created_at: string; // ISO timestamp
  started_at: string | null; // ISO timestamp when game started
  ended_at: string | null; // ISO timestamp when game ended
}

/**
 * Input for creating a new room
 */
export interface CreateRoomInput {
  host_id: string;
  room_code?: string; // Optional: will be auto-generated if not provided
}

/**
 * Room with additional metadata (for API responses)
 */
export interface RoomWithMetadata extends Room {
  player_count: number;
  ticket_count: number;
  has_started: boolean;
  is_active: boolean;
}

// ============================================================================
// Player Types
// ============================================================================

/**
 * Player in a game room
 * Note: We don't store players separately, they're identified by tickets
 */
export interface Player {
  player_id: string; // Guest UUID
  player_name: string | null;
  room_id: string;
  ticket_id: string;
  joined_at: string; // ISO timestamp
}

/**
 * Guest identity stored in localStorage
 */
export interface GuestIdentity {
  guest_id: string; // UUID v4
  created_at: string; // ISO timestamp
}

// ============================================================================
// Called Numbers Types
// ============================================================================

/**
 * A number called by the host during the game
 */
export interface CalledNumber {
  id: string;
  room_id: string;
  number: number; // 1-90
  called_at: string; // ISO timestamp
  called_by: string; // Host's guest_id
}

/**
 * Input for calling a new number
 */
export interface CallNumberInput {
  room_id: string;
  number: number;
  called_by: string;
}

// ============================================================================
// Win Condition Types
// ============================================================================

/**
 * Types of winning patterns in Loto
 */
export type WinType = 'full_row' | 'full_house';

/**
 * Win detection result
 */
export interface WinCondition {
  has_won: boolean;
  win_type: WinType | null;
  winning_rows?: number[]; // Row indices (0, 1, 2)
  is_full_house?: boolean;
}

// ============================================================================
// API Response Types
// ============================================================================

/**
 * Standard API success response
 */
export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
}

/**
 * Standard API error response
 */
export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: Record<string, unknown>;
}

/**
 * Combined API response type
 */
export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// ============================================================================
// Database Types (matches Supabase schema)
// ============================================================================

/**
 * Database row for rooms table
 */
export interface DbRoom {
  id: string;
  room_code: string;
  host_id: string;
  status: RoomStatus;
  created_at: string;
  started_at: string | null;
  ended_at: string | null;
}

/**
 * Database row for tickets table
 */
export interface DbTicket {
  id: string;
  room_id: string;
  player_id: string;
  player_name: string | null;
  ticket_data: TicketGrid;
  ticket_hash: string;
  created_at: string;
}

/**
 * Database row for called_numbers table
 */
export interface DbCalledNumber {
  id: string;
  room_id: string;
  number: number;
  called_at: string;
  called_by: string;
}

// ============================================================================
// Utility Types
// ============================================================================

/**
 * Ticket marking state (client-side only)
 */
export interface TicketMarkingState {
  ticket_id: string;
  marked_numbers: Set<number>;
  last_updated: string; // ISO timestamp
}

/**
 * Room join result
 */
export interface JoinRoomResult {
  room: Room;
  ticket: LotoTicket;
  is_new_ticket: boolean;
}
