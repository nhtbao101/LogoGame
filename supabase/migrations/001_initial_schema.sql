-- ============================================================================
-- Loto Game Database Schema with Row Level Security (RLS)
-- ============================================================================
-- This file contains the complete database schema for the Loto Game.
-- Run this in your Supabase SQL Editor to set up the database.
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLES
-- ============================================================================

-- Rooms Table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_code VARCHAR(8) UNIQUE NOT NULL,
  host_id VARCHAR(255) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  started_at TIMESTAMP WITH TIME ZONE,
  ended_at TIMESTAMP WITH TIME ZONE
);

-- Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  player_id VARCHAR(255) NOT NULL,
  player_name VARCHAR(255),
  ticket_data JSONB NOT NULL,
  ticket_hash VARCHAR(64) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(room_id, ticket_hash) -- Prevent duplicate tickets in same room
);

-- Called Numbers Table
CREATE TABLE IF NOT EXISTS called_numbers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  number INTEGER NOT NULL CHECK (number BETWEEN 1 AND 90),
  called_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  called_by VARCHAR(255) NOT NULL
);

-- ============================================================================
-- INDEXES
-- ============================================================================

-- Room code lookup (frequent query)
CREATE INDEX IF NOT EXISTS idx_rooms_room_code ON rooms(room_code);

-- Room status filtering
CREATE INDEX IF NOT EXISTS idx_rooms_status ON rooms(status);

-- Ticket lookups by room and player
CREATE INDEX IF NOT EXISTS idx_tickets_room_id ON tickets(room_id);
CREATE INDEX IF NOT EXISTS idx_tickets_player_id ON tickets(player_id);
CREATE INDEX IF NOT EXISTS idx_tickets_room_player ON tickets(room_id, player_id);

-- Called numbers by room (for history)
CREATE INDEX IF NOT EXISTS idx_called_numbers_room_id ON called_numbers(room_id);
CREATE INDEX IF NOT EXISTS idx_called_numbers_room_time ON called_numbers(room_id, called_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE called_numbers ENABLE ROW LEVEL SECURITY;

-- ----------------------------------------------------------------------------
-- ROOMS POLICIES
-- ----------------------------------------------------------------------------

-- Anyone can read any room (guest access)
CREATE POLICY "Rooms are publicly readable"
  ON rooms FOR SELECT
  USING (true);

-- Anyone can create a room (guest access)
CREATE POLICY "Anyone can create a room"
  ON rooms FOR INSERT
  WITH CHECK (true);

-- Only the host can update their room
-- Note: We can't enforce host_id check with guest mode, so we allow all updates
-- The application layer should validate host_id before updating
CREATE POLICY "Rooms can be updated"
  ON rooms FOR UPDATE
  USING (true);

-- No one can delete rooms (handle via application expiration logic)
CREATE POLICY "Rooms cannot be deleted by users"
  ON rooms FOR DELETE
  USING (false);

-- ----------------------------------------------------------------------------
-- TICKETS POLICIES
-- ----------------------------------------------------------------------------

-- Anyone can read tickets in any room (for host to see all players)
CREATE POLICY "Tickets are publicly readable"
  ON tickets FOR SELECT
  USING (true);

-- Anyone can create a ticket (guest join)
CREATE POLICY "Anyone can create a ticket"
  ON tickets FOR INSERT
  WITH CHECK (true);

-- No updates to tickets once created
CREATE POLICY "Tickets cannot be updated"
  ON tickets FOR UPDATE
  USING (false);

-- No deletes (tickets are permanent record)
CREATE POLICY "Tickets cannot be deleted by users"
  ON tickets FOR DELETE
  USING (false);

-- ----------------------------------------------------------------------------
-- CALLED NUMBERS POLICIES
-- ----------------------------------------------------------------------------

-- Anyone can read called numbers in any room
CREATE POLICY "Called numbers are publicly readable"
  ON called_numbers FOR SELECT
  USING (true);

-- Anyone can insert called numbers (host calling)
-- Note: Application should validate host_id matches room.host_id
CREATE POLICY "Anyone can call numbers"
  ON called_numbers FOR INSERT
  WITH CHECK (true);

-- No updates or deletes
CREATE POLICY "Called numbers cannot be updated"
  ON called_numbers FOR UPDATE
  USING (false);

CREATE POLICY "Called numbers cannot be deleted by users"
  ON called_numbers FOR DELETE
  USING (false);

-- ============================================================================
-- FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to auto-cleanup old rooms (optional - run as cron job)
CREATE OR REPLACE FUNCTION cleanup_old_rooms()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Delete rooms older than 24 hours that are not active
  DELETE FROM rooms
  WHERE created_at < NOW() - INTERVAL '24 hours'
    AND status IN ('waiting', 'completed');
END;
$$;

-- ============================================================================
-- INITIAL DATA / SEED (optional)
-- ============================================================================

-- You can add test data here for development
-- Example:
-- INSERT INTO rooms (room_code, host_id, status) 
-- VALUES ('TEST01', 'test-host-id', 'waiting');

-- ============================================================================
-- NOTES ON RLS IMPLEMENTATION
-- ============================================================================
/*
SECURITY CONSIDERATIONS:

1. Guest Mode Limitations:
   - RLS policies are permissive because we have no auth system
   - Anyone with the room code can join
   - Anyone can create rooms and tickets
   - Application layer must validate host_id for sensitive operations

2. Data Protection:
   - Rooms auto-expire after 24 hours (run cleanup_old_rooms() via cron)
   - Tickets are tied to rooms (CASCADE delete)
   - No personal information stored (just ephemeral guest_id)

3. Uniqueness Guarantees:
   - room_code is unique (prevents collisions)
   - (room_id, ticket_hash) unique (prevents duplicate tickets in same room)
   - Ticket hash uses SHA-256 of ticket_data

4. Future Enhancements:
   - Add rate limiting via Supabase Edge Functions
   - Add room passwords for private games
   - Add user authentication (optional, preserve guest mode)

5. Performance:
   - Indexes on frequently queried columns
   - JSONB for flexible ticket_data storage
   - Partitioning called_numbers by room_id (if scale grows)
*/
