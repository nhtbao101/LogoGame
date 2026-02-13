import { cn } from '@/lib/utils';
import type { TicketGrid } from '@/types/loto';

interface TicketDisplayProps {
  /** The 3x9 ticket grid with numbers and nulls */
  ticketData: TicketGrid;
  /** Set of numbers that have been called/marked */
  markedNumbers?: Set<number>;
  /** Optional click handler for interactive tickets */
  onCellClick?: (number: number) => void;
  /** Size variant for the ticket */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes */
  className?: string;
  /** Show row labels */
  showRowLabels?: boolean;
}

const sizeClasses = {
  sm: {
    cell: 'text-sm h-8 w-8',
    grid: 'gap-1'
  },
  md: {
    cell: 'text-lg h-12 w-12',
    grid: 'gap-2'
  },
  lg: {
    cell: 'text-xl h-16 w-16',
    grid: 'gap-3'
  }
};

/**
 * TicketDisplay Component
 *
 * Displays a 3x9 Loto ticket with visual distinction for:
 * - Empty cells (null values)
 * - Unmarked numbers
 * - Marked/called numbers
 *
 * @example
 * ```tsx
 * <TicketDisplay
 *   ticketData={ticket.ticket_data}
 *   markedNumbers={new Set([1, 23, 45])}
 *   size="md"
 * />
 * ```
 */
export function TicketDisplay({
  ticketData,
  markedNumbers = new Set(),
  onCellClick,
  size = 'md',
  className,
  showRowLabels = false
}: TicketDisplayProps) {
  const sizeConfig = sizeClasses[size];

  return (
    <div className={cn('w-full', className)}>
      {/* Column Headers (optional) */}
      {/* <div className="grid grid-cols-9 gap-2 mb-2">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((col) => (
          <div key={col} className="text-center text-xs text-gray-500">
            {col}
          </div>
        ))}
      </div> */}

      {/* Ticket Grid */}
      <div className="space-y-1">
        {ticketData.map((row, rowIndex) => (
          <div key={rowIndex} className="flex items-center gap-1">
            {/* Row Label (optional) */}
            {showRowLabels && (
              <div className="w-6 text-xs text-gray-500 text-center">
                {rowIndex + 1}
              </div>
            )}

            {/* Row Cells */}
            <div className={cn('grid grid-cols-9 flex-1', sizeConfig.grid)}>
              {row.map((cell, colIndex) => {
                const isEmpty = cell === null;
                const isMarked = cell !== null && markedNumbers.has(cell);
                const isClickable = !isEmpty && onCellClick;

                return (
                  <button
                    key={`${rowIndex}-${colIndex}`}
                    onClick={() => cell && onCellClick?.(cell)}
                    disabled={isEmpty || !onCellClick}
                    className={cn(
                      'flex items-center justify-center rounded-lg font-bold transition-all duration-200',
                      sizeConfig.cell,
                      isEmpty && 'bg-gray-100 cursor-default',
                      !isEmpty &&
                        !isMarked &&
                        'bg-white border-2 border-gray-300 text-gray-900',
                      !isEmpty &&
                        isMarked &&
                        'bg-green-500 text-white shadow-lg scale-105',
                      isClickable &&
                        !isMarked &&
                        'hover:bg-gray-50 hover:border-blue-400 active:scale-95',
                      isClickable && 'cursor-pointer',
                      !isClickable && !isEmpty && 'cursor-default'
                    )}
                    aria-label={
                      isEmpty
                        ? 'Empty cell'
                        : isMarked
                        ? `Number ${cell} - marked`
                        : `Number ${cell}`
                    }
                  >
                    {cell}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Ticket Info */}
      <div className="mt-3 flex justify-between text-xs text-gray-600">
        <span>
          Row 1: {ticketData[0].filter((c) => c !== null).length} numbers
        </span>
        <span>
          Row 2: {ticketData[1].filter((c) => c !== null).length} numbers
        </span>
        <span>
          Row 3: {ticketData[2].filter((c) => c !== null).length} numbers
        </span>
      </div>
    </div>
  );
}

/**
 * CompactTicketDisplay Component
 *
 * Minimal version without borders and styling for printing or previews
 */
export function CompactTicketDisplay({
  ticketData,
  markedNumbers = new Set(),
  className
}: Omit<TicketDisplayProps, 'size' | 'onCellClick' | 'showRowLabels'>) {
  return (
    <div className={cn('w-full', className)}>
      <div className="grid grid-cols-9 gap-1">
        {ticketData.flat().map((cell, index) => {
          const isEmpty = cell === null;
          const isMarked = cell !== null && markedNumbers.has(cell);

          return (
            <div
              key={index}
              className={cn(
                'flex items-center justify-center h-8 w-8 text-sm font-semibold rounded',
                isEmpty && 'bg-gray-50',
                !isEmpty && !isMarked && 'bg-white border border-gray-300',
                !isEmpty && isMarked && 'bg-green-400 text-white'
              )}
            >
              {cell}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * PrintableTicketDisplay Component
 *
 * Optimized for printing with minimal colors and clear borders
 */
export function PrintableTicketDisplay({
  ticketData,
  ticketId,
  roomCode,
  className
}: {
  ticketData: TicketGrid;
  ticketId?: string;
  roomCode?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'border-2 border-gray-800 rounded-lg p-4 bg-white print:break-inside-avoid',
        className
      )}
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-300">
        <h3 className="font-bold text-lg">LOTO TICKET</h3>
        <div className="text-right text-sm">
          {roomCode && <div className="font-bold">Room: {roomCode}</div>}
          {ticketId && (
            <div className="text-gray-600 text-xs">
              ID: {ticketId.substring(0, 8)}
            </div>
          )}
        </div>
      </div>

      {/* Ticket Grid */}
      <div className="grid grid-cols-9 gap-1">
        {ticketData.flat().map((cell, index) => (
          <div
            key={index}
            className={cn(
              'flex items-center justify-center h-10 w-10 text-base font-bold border border-gray-400 rounded',
              cell === null ? 'bg-gray-100' : 'bg-white'
            )}
          >
            {cell}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t border-gray-300 text-xs text-gray-600 text-center">
        Mark numbers as they are called • Good luck!
      </div>
    </div>
  );
}
