/**
 * Loto Ticket Generator
 *
 * Generates unique 3x9 Vietnamese Loto tickets following strict rules:
 * - 3 rows × 9 columns
 * - Each row has exactly 5 numbers and 4 blanks
 * - Column ranges: Col 0: 1-9, Col 1: 10-19, ..., Col 8: 80-90
 * - Each column must have at least 1 number (max 3)
 * - Numbers in each column sorted ascending (top to bottom)
 * - Total 15 unique numbers per ticket
 */

export type TicketCell = number | null;
export type TicketGrid = TicketCell[][];

/**
 * Column number ranges for Vietnamese Loto
 * Index 0 = Column 0 (1-9), Index 1 = Column 1 (10-19), etc.
 */
export const COLUMN_RANGES: [number, number][] = [
  [1, 9], // Column 0
  [10, 19], // Column 1
  [20, 29], // Column 2
  [30, 39], // Column 3
  [40, 49], // Column 4
  [50, 59], // Column 5
  [60, 69], // Column 6
  [70, 79], // Column 7
  [80, 90] // Column 8 (special case: 80-90 = 11 numbers)
];

const ROWS = 3;
const COLS = 9;
const NUMBERS_PER_ROW = 5;
const TOTAL_NUMBERS = 15;

/**
 * Generates a valid 3x9 Loto ticket
 *
 * @returns A 3x9 grid where each cell is either a number (1-90) or null (blank)
 *
 * @example
 * const ticket = generateLotoTicket();
 * // Returns:
 * // [
 * //   [5, null, 23, null, 45, null, 67, null, 82],
 * //   [null, 12, null, 34, null, 56, null, 78, null],
 * //   [8, null, 29, null, 49, null, 69, null, 88]
 * // ]
 */
export function generateLotoTicket(): TicketGrid {
  const maxAttempts = 100;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const grid = createTicketGrid();
      if (isValidTicket(grid)) {
        return grid;
      }
    } catch (error) {
      // Retry on generation failure
      continue;
    }
  }

  throw new Error('Failed to generate valid ticket after maximum attempts');
}

/**
 * Creates a ticket grid following all Loto rules
 */
function createTicketGrid(): TicketGrid {
  // Step 1: Determine how many numbers each column will have (1-3)
  const columnCounts = distributeNumbersAcrossColumns();

  // Step 2: Determine which rows get numbers in each column
  const columnRowAssignments = assignRowsToColumns(columnCounts);

  // Step 3: Generate random numbers for each column
  const columnNumbers = generateNumbersForColumns(columnCounts);

  // Step 4: Build the grid
  const grid = buildGrid(columnRowAssignments, columnNumbers);

  return grid;
}

/**
 * Distributes 15 numbers across 9 columns
 * Each column gets 1-3 numbers
 * Returns array of counts [col0_count, col1_count, ..., col8_count]
 */
function distributeNumbersAcrossColumns(): number[] {
  const counts = new Array(COLS).fill(0);
  let remaining = TOTAL_NUMBERS;

  // First pass: Give each column at least 1 number
  for (let col = 0; col < COLS; col++) {
    counts[col] = 1;
    remaining--;
  }

  // Second pass: Distribute remaining 6 numbers (max 2 more per column)
  while (remaining > 0) {
    const col = Math.floor(Math.random() * COLS);
    if (counts[col] < 3) {
      counts[col]++;
      remaining--;
    }
  }

  return counts;
}

/**
 * For each column, determine which rows will have numbers
 * Returns a 2D array: columnRowAssignments[col] = [row indices]
 */
function assignRowsToColumns(columnCounts: number[]): number[][] {
  const assignments: number[][] = [];
  const rowCounts = [0, 0, 0]; // Track how many numbers each row has

  for (let col = 0; col < COLS; col++) {
    const count = columnCounts[col];
    const rows: number[] = [];

    // Try to assign rows for this column
    const availableRows = [0, 1, 2];

    for (let i = 0; i < count; i++) {
      // Filter rows that still have space (< 5 numbers)
      const validRows = availableRows.filter(
        (row) => rowCounts[row] < NUMBERS_PER_ROW && !rows.includes(row)
      );

      if (validRows.length === 0) {
        throw new Error('Cannot assign rows - constraint violation');
      }

      // Pick a random valid row
      const rowIndex = Math.floor(Math.random() * validRows.length);
      const selectedRow = validRows[rowIndex];

      rows.push(selectedRow);
      rowCounts[selectedRow]++;
    }

    // Sort rows ascending for this column
    rows.sort((a, b) => a - b);
    assignments.push(rows);
  }

  // Validate that each row has exactly 5 numbers
  for (let row = 0; row < ROWS; row++) {
    if (rowCounts[row] !== NUMBERS_PER_ROW) {
      throw new Error(
        `Row ${row} has ${rowCounts[row]} numbers, expected ${NUMBERS_PER_ROW}`
      );
    }
  }

  return assignments;
}

/**
 * Generate random unique numbers for each column within its range
 * Returns array where columnNumbers[col] = [sorted numbers]
 */
function generateNumbersForColumns(columnCounts: number[]): number[][] {
  const columnNumbers: number[][] = [];

  for (let col = 0; col < COLS; col++) {
    const count = columnCounts[col];
    const [min, max] = COLUMN_RANGES[col];

    // Generate unique random numbers within range
    const numbers: number[] = [];
    const availableNumbers = Array.from(
      { length: max - min + 1 },
      (_, i) => min + i
    );

    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * availableNumbers.length);
      numbers.push(availableNumbers[randomIndex]);
      availableNumbers.splice(randomIndex, 1);
    }

    // Sort numbers ascending
    numbers.sort((a, b) => a - b);
    columnNumbers.push(numbers);
  }

  return columnNumbers;
}

/**
 * Build the final 3x9 grid from row assignments and numbers
 */
function buildGrid(
  columnRowAssignments: number[][],
  columnNumbers: number[][]
): TicketGrid {
  // Initialize grid with all nulls
  const grid: TicketGrid = Array(ROWS)
    .fill(null)
    .map(() => Array(COLS).fill(null));

  // Fill in numbers
  for (let col = 0; col < COLS; col++) {
    const rows = columnRowAssignments[col];
    const numbers = columnNumbers[col];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const number = numbers[i];
      grid[row][col] = number;
    }
  }

  return grid;
}

/**
 * Validates that a ticket follows all Loto rules
 */
function isValidTicket(grid: TicketGrid): boolean {
  // Rule 1: Grid is 3x9
  if (grid.length !== ROWS) return false;
  if (grid.some((row) => row.length !== COLS)) return false;

  // Rule 2: Each row has exactly 5 numbers
  for (let row = 0; row < ROWS; row++) {
    const numberCount = grid[row].filter((cell) => cell !== null).length;
    if (numberCount !== NUMBERS_PER_ROW) return false;
  }

  // Rule 3: Each column has 1-3 numbers
  for (let col = 0; col < COLS; col++) {
    const numberCount = grid.filter((row) => row[col] !== null).length;
    if (numberCount < 1 || numberCount > 3) return false;
  }

  // Rule 4: Total 15 numbers
  const totalNumbers = grid.flat().filter((cell) => cell !== null).length;
  if (totalNumbers !== TOTAL_NUMBERS) return false;

  // Rule 5: Numbers in each column are sorted ascending
  for (let col = 0; col < COLS; col++) {
    const columnNumbers: number[] = [];
    for (let row = 0; row < ROWS; row++) {
      if (grid[row][col] !== null) {
        columnNumbers.push(grid[row][col] as number);
      }
    }

    for (let i = 1; i < columnNumbers.length; i++) {
      if (columnNumbers[i] <= columnNumbers[i - 1]) return false;
    }
  }

  // Rule 6: Numbers are within column ranges
  for (let col = 0; col < COLS; col++) {
    const [min, max] = COLUMN_RANGES[col];
    for (let row = 0; row < ROWS; row++) {
      const cell = grid[row][col];
      if (cell !== null && (cell < min || cell > max)) {
        return false;
      }
    }
  }

  // Rule 7: All numbers are unique
  const numbers = grid.flat().filter((cell) => cell !== null) as number[];
  const uniqueNumbers = new Set(numbers);
  if (uniqueNumbers.size !== numbers.length) return false;

  return true;
}

/**
 * Formats a ticket grid for display (useful for debugging)
 */
export function formatTicket(grid: TicketGrid): string {
  return grid
    .map((row) =>
      row
        .map((cell) =>
          cell === null ? '  ' : cell.toString().padStart(2, ' ')
        )
        .join(' | ')
    )
    .join('\n' + '-'.repeat(40) + '\n');
}

/**
 * Converts a ticket grid to a compact string representation
 * Useful for uniqueness checking
 */
export function serializeTicket(grid: TicketGrid): string {
  return JSON.stringify(grid);
}

/**
 * Parses a serialized ticket back to grid format
 */
export function deserializeTicket(serialized: string): TicketGrid {
  return JSON.parse(serialized) as TicketGrid;
}
