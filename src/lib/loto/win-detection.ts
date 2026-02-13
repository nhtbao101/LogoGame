import type { TicketGrid } from '@/types/loto';

/**
 * Win pattern types for Loto game
 */
export type WinPattern =
  | 'top-line' // Top row complete
  | 'middle-line' // Middle row complete
  | 'bottom-line' // Bottom row complete
  | 'full-house'; // All numbers marked

export interface WinResult {
  hasWon: boolean;
  pattern?: WinPattern;
  completedRows: number[];
}

/**
 * Checks if a row is complete (all non-null numbers are marked)
 */
function isRowComplete(
  row: (number | null)[],
  markedNumbers: Set<number>
): boolean {
  const rowNumbers = row.filter((cell): cell is number => cell !== null);
  return (
    rowNumbers.length > 0 && rowNumbers.every((num) => markedNumbers.has(num))
  );
}

/**
 * Checks for winning patterns in a Loto ticket
 *
 * Win conditions:
 * - Top Line: All numbers in row 1 are marked
 * - Middle Line: All numbers in row 2 are marked
 * - Bottom Line: All numbers in row 3 are marked
 * - Full House: All numbers in all rows are marked
 *
 * @param ticketData - The 3x9 ticket grid
 * @param markedNumbers - Set of called/marked numbers
 * @returns Win result with pattern and completed rows
 *
 * @example
 * ```typescript
 * const result = checkWinCondition(ticket.ticket_data, new Set([1, 2, 3, 15, 23, 45]));
 * if (result.hasWon) {
 *   console.log(`Won with pattern: ${result.pattern}`);
 * }
 * ```
 */
export function checkWinCondition(
  ticketData: TicketGrid,
  markedNumbers: Set<number>
): WinResult {
  const completedRows: number[] = [];

  // Check each row
  ticketData.forEach((row, index) => {
    if (isRowComplete(row, markedNumbers)) {
      completedRows.push(index);
    }
  });

  // No wins
  if (completedRows.length === 0) {
    return { hasWon: false, completedRows: [] };
  }

  // Full house - all 3 rows complete
  if (completedRows.length === 3) {
    return {
      hasWon: true,
      pattern: 'full-house',
      completedRows
    };
  }

  // Single line wins
  if (completedRows.length === 1) {
    const rowIndex = completedRows[0];
    const pattern: WinPattern =
      rowIndex === 0
        ? 'top-line'
        : rowIndex === 1
        ? 'middle-line'
        : 'bottom-line';

    return {
      hasWon: true,
      pattern,
      completedRows
    };
  }

  // Multiple lines (but not full house)
  // For now, return the first completed line as the win
  // You can customize this logic based on game rules
  const firstRow = completedRows[0];
  const pattern: WinPattern =
    firstRow === 0
      ? 'top-line'
      : firstRow === 1
      ? 'middle-line'
      : 'bottom-line';

  return {
    hasWon: true,
    pattern,
    completedRows
  };
}

/**
 * Gets a display message for a win pattern
 */
export function getWinMessage(pattern: WinPattern): string {
  switch (pattern) {
    case 'top-line':
      return '🎉 Top Line!';
    case 'middle-line':
      return '🎉 Middle Line!';
    case 'bottom-line':
      return '🎉 Bottom Line!';
    case 'full-house':
      return '🏆 FULL HOUSE!';
  }
}

/**
 * Gets progress towards full house
 */
export function getProgress(
  ticketData: TicketGrid,
  markedNumbers: Set<number>
): {
  marked: number;
  total: number;
  percentage: number;
} {
  const allNumbers = ticketData
    .flat()
    .filter((cell): cell is number => cell !== null);
  const markedCount = allNumbers.filter((num) => markedNumbers.has(num)).length;

  return {
    marked: markedCount,
    total: allNumbers.length,
    percentage: Math.round((markedCount / allNumbers.length) * 100)
  };
}

/**
 * Checks how many numbers away from a win
 */
export function getNumbersToWin(
  ticketData: TicketGrid,
  markedNumbers: Set<number>
): {
  topLine: number;
  middleLine: number;
  bottomLine: number;
  fullHouse: number;
} {
  const countUnmarked = (row: (number | null)[]) => {
    return row.filter(
      (cell): cell is number => cell !== null && !markedNumbers.has(cell)
    ).length;
  };

  return {
    topLine: countUnmarked(ticketData[0]),
    middleLine: countUnmarked(ticketData[1]),
    bottomLine: countUnmarked(ticketData[2]),
    fullHouse: ticketData
      .flat()
      .filter(
        (cell): cell is number => cell !== null && !markedNumbers.has(cell)
      ).length
  };
}
