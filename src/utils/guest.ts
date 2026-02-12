/**
 * Guest Identity Management
 *
 * Handles creating and retrieving guest user IDs from localStorage.
 * Each browser gets a unique guest_id that persists across sessions.
 */

import type { GuestIdentity } from '@/types/loto';

const GUEST_ID_KEY = 'loto_guest_id';
const GUEST_CREATED_KEY = 'loto_guest_created';

/**
 * Generates a UUID v4
 */
function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * Gets or creates a guest identity
 *
 * @returns Guest identity with ID and creation timestamp
 *
 * @example
 * const { guest_id } = getOrCreateGuestId();
 * console.log('Your guest ID:', guest_id);
 */
export function getOrCreateGuestId(): GuestIdentity {
  if (typeof window === 'undefined') {
    // Server-side: return temporary ID
    return {
      guest_id: 'server-temp-id',
      created_at: new Date().toISOString()
    };
  }

  try {
    // Check if guest ID already exists
    const existingId = localStorage.getItem(GUEST_ID_KEY);
    const existingCreated = localStorage.getItem(GUEST_CREATED_KEY);

    if (existingId && existingCreated) {
      return {
        guest_id: existingId,
        created_at: existingCreated
      };
    }

    // Create new guest ID
    const newGuestId = generateUUID();
    const createdAt = new Date().toISOString();

    localStorage.setItem(GUEST_ID_KEY, newGuestId);
    localStorage.setItem(GUEST_CREATED_KEY, createdAt);

    return {
      guest_id: newGuestId,
      created_at: createdAt
    };
  } catch (error) {
    console.error('Failed to access localStorage:', error);
    // Fallback: return session-only ID
    return {
      guest_id: generateUUID(),
      created_at: new Date().toISOString()
    };
  }
}

/**
 * Gets the current guest ID (without creating a new one)
 *
 * @returns Guest ID or null if not set
 */
export function getGuestId(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(GUEST_ID_KEY);
  } catch {
    return null;
  }
}

/**
 * Clears the guest identity (useful for testing)
 */
export function clearGuestId(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(GUEST_ID_KEY);
    localStorage.removeItem(GUEST_CREATED_KEY);
  } catch (error) {
    console.error('Failed to clear guest ID:', error);
  }
}

/**
 * Checks if guest ID exists
 */
export function hasGuestId(): boolean {
  return getGuestId() !== null;
}
