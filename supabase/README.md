# Supabase Database Setup

This directory contains database migrations and setup instructions for the Loto Game.

## Quick Setup

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Fill in project details:
   - **Name:** lotogame (or your preferred name)
   - **Database Password:** (save this securely)
   - **Region:** Choose closest to your users
4. Wait for project to finish provisioning (~2 minutes)

### 2. Run the Migration

1. Open your Supabase project dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy the contents of `migrations/001_initial_schema.sql`
5. Paste into the SQL editor
6. Click **Run** or press `Ctrl+Enter`

You should see: `Success. No rows returned`

### 3. Get Your API Keys

1. Go to **Project Settings** > **API**
2. Copy these values:
   - **Project URL** (e.g., `https://xxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### 4. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:** Never commit `.env.local` to git! It's already in `.gitignore`.

### 5. Install Supabase Client

```bash
pnpm add @supabase/supabase-js
```

### 6. Verify Setup

Create a test file `test-db.ts`:

```typescript
import { supabase } from '@/utils/supabase/client';

async function testConnection() {
  const { data, error } = await supabase.from('rooms').select('*').limit(1);

  if (error) {
    console.error('Connection failed:', error);
  } else {
    console.log('✅ Connected to Supabase!');
  }
}

testConnection();
```

Run: `npx tsx test-db.ts`

## Database Schema Overview

### Tables

#### `rooms`

- Stores game rooms with unique codes
- Tracks status (waiting → active → completed)
- Auto-expires after 24 hours

#### `tickets`

- Stores 3x9 Loto tickets for players
- Unique constraint: (room_id, ticket_hash)
- Prevents duplicate tickets in same room

#### `called_numbers`

- History of numbers called by host
- Ordered by timestamp for replay

### Security (RLS)

All tables use **Row Level Security (RLS)** with permissive policies for guest access:

- ✅ Anyone can **read** all data
- ✅ Anyone can **create** rooms, tickets, numbers
- ❌ **Updates** restricted (tickets/numbers immutable)
- ❌ **Deletes** restricted (use application logic)

**Note:** Since we're using guest mode (no auth), the application layer must validate sensitive operations (e.g., only host can call numbers).

## Cleanup & Maintenance

### Manual Cleanup

Delete old rooms (>24 hours):

```sql
DELETE FROM rooms
WHERE created_at < NOW() - INTERVAL '24 hours'
  AND status IN ('waiting', 'completed');
```

### Automated Cleanup (Future)

Set up a Supabase Edge Function or cron job:

1. Create function: `supabase/functions/cleanup-rooms/index.ts`
2. Schedule via GitHub Actions or Supabase Cron
3. Runs daily to clean up expired rooms

## Development Tips

### View All Rooms

```sql
SELECT room_code, status, created_at
FROM rooms
ORDER BY created_at DESC
LIMIT 10;
```

### Count Players in a Room

```sql
SELECT
  r.room_code,
  COUNT(t.id) as player_count
FROM rooms r
LEFT JOIN tickets t ON r.id = t.room_id
WHERE r.room_code = 'ABC123'
GROUP BY r.room_code;
```

### See Called Numbers History

```sql
SELECT number, called_at
FROM called_numbers
WHERE room_id = 'your-room-uuid'
ORDER BY called_at ASC;
```

## Troubleshooting

### Error: "relation does not exist"

- Make sure you ran the migration in Supabase SQL Editor
- Check you're on the correct project

### Error: "JWT expired" or auth errors

- Not applicable for this project (we use guest mode)
- If you see this, check your anon key is correct

### Error: "violates unique constraint"

- For `room_code`: Code already exists (very rare, retry)
- For `ticket_hash`: Duplicate ticket in room (algorithm will auto-retry)

### Slow Queries

- Check indexes are created: `\di` in SQL editor
- Monitor query performance in Supabase Dashboard > Logs

## Production Checklist

Before deploying:

- [ ] RLS policies verified and tested
- [ ] Environment variables set in Vercel
- [ ] Database password is strong and secure
- [ ] Backups enabled in Supabase project settings
- [ ] Set up cleanup cron job for old rooms
- [ ] Monitor query performance via Supabase Dashboard
- [ ] Consider upgrading Supabase plan if needed (free tier: 500MB, 2GB bandwidth)

## Future Enhancements

Planned database features:

1. **Real-time subscriptions** - Listen for called_numbers changes
2. **Room passwords** - Add `password_hash` column to rooms
3. **Player statistics** - Track wins, games played
4. **Game replay** - Store complete game state for replay

---

**Need Help?**

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
