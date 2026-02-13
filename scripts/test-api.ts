/**
 * Test script for API routes
 * Run with: pnpm exec tsx scripts/test-api.ts
 *
 * Note: Requires dev server to be running (pnpm dev)
 */

const BASE_URL = 'http://localhost:3000';

// Helper to generate UUID v4
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

interface Room {
  id: string;
  room_code: string;
  host_id: string;
  status: string;
}

interface Ticket {
  id: string;
  room_id: string;
  player_id: string;
  ticket_data: (number | null)[][];
}

async function testAPI() {
  console.log('🧪 Testing Loto Game API Routes\n');
  console.log('Make sure dev server is running: pnpm dev\n');

  let roomId: string;
  let roomCode: string;
  const hostId = generateUUID();
  const playerId = generateUUID();

  console.log(`Host ID: ${hostId}`);
  console.log(`Player ID: ${playerId}\n`);

  try {
    // Test 1: Create a room
    console.log('1️⃣ POST /api/rooms - Create room');
    const createResponse = await fetch(`${BASE_URL}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostId })
    });

    if (!createResponse.ok) {
      throw new Error(`Failed to create room: ${createResponse.statusText}`);
    }

    const createData = await createResponse.json();
    const room: Room = createData.room;

    roomId = room.id;
    roomCode = room.room_code;

    console.log(`   ✅ Created room: ${roomCode} (${roomId})`);
    console.log(`   Status: ${room.status}\n`);

    // Test 2: Get room by code
    console.log(`2️⃣ GET /api/rooms/code/${roomCode} - Get room by code`);
    const getRoomResponse = await fetch(`${BASE_URL}/api/rooms/code/${roomCode}`);

    if (!getRoomResponse.ok) {
      throw new Error(`Failed to get room: ${getRoomResponse.statusText}`);
    }

    const getRoomData = await getRoomResponse.json();
    console.log(`   ✅ Retrieved room: ${getRoomData.room.room_code}`);
    console.log(`   Host ID: ${getRoomData.room.host_id}\n`);

    // Test 3: Join room and get ticket
    console.log(`3️⃣ POST /api/rooms/${roomId}/join - Join room`);
    const joinResponse = await fetch(`${BASE_URL}/api/rooms/${roomId}/join`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        playerId,
        playerName: 'Test Player' 
      })
    });

    if (!joinResponse.ok) {
      throw new Error(`Failed to join room: ${joinResponse.statusText}`);
    }

    const joinData = await joinResponse.json();
    const ticket: Ticket = joinData.ticket;

    console.log(`   ✅ Joined room, received ticket: ${ticket.id}`);
    console.log(`   Is new ticket: ${joinData.is_new_ticket}`);
    console.log(`   Ticket preview (first row):`);
    console.log(
      `   ${ticket.ticket_data[0].map((n) => (n === null ? '--' : n.toString().padStart(2))).join(' ')}\n`
    );

    // Test 4: Call a number
    console.log(`4️⃣ POST /api/rooms/${roomId}/numbers - Call number 42`);
    const callNumberResponse = await fetch(
      `${BASE_URL}/api/rooms/${roomId}/numbers`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: 42,
          hostId: room.host_id
        })
      }
    );

    if (!callNumberResponse.ok) {
      const error = await callNumberResponse.json();
      throw new Error(
        `Failed to call number: ${error.error || callNumberResponse.statusText}`
      );
    }

    const callNumberData = await callNumberResponse.json();
    console.log(`   ✅ Called number: ${callNumberData.number}\n`);

    // Test 5: Get called numbers
    console.log(`5️⃣ GET /api/rooms/${roomId}/numbers - Get called numbers`);
    const getNumbersResponse = await fetch(
      `${BASE_URL}/api/rooms/${roomId}/numbers`
    );

    if (!getNumbersResponse.ok) {
      throw new Error(
        `Failed to get numbers: ${getNumbersResponse.statusText}`
      );
    }

    const getNumbersData = await getNumbersResponse.json();
    console.log(`   ✅ Retrieved called numbers: [${getNumbersData.numbers.join(', ')}]`);
    console.log(`   Total count: ${getNumbersData.count}\n`);

    // Test 6: Call multiple numbers
    console.log(`6️⃣ Call multiple numbers (1, 15, 33, 67, 89)`);
    const numbersToCall = [1, 15, 33, 67, 89];

    for (const num of numbersToCall) {
      const response = await fetch(`${BASE_URL}/api/rooms/${roomId}/numbers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          number: num,
          hostId: room.host_id
        })
      });

      if (response.ok) {
        console.log(`   ✓ Called: ${num}`);
      }
    }

    // Get final list
    const finalNumbersResponse = await fetch(
      `${BASE_URL}/api/rooms/${roomId}/numbers`
    );
    const finalNumbers = await finalNumbersResponse.json();
    console.log(`   ✅ All called numbers: [${finalNumbers.numbers.join(', ')}]`);
    console.log(`   Total: ${finalNumbers.count}\n`);

    console.log('🎉 All API tests passed!\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  }
}

// Run the tests
testAPI();
