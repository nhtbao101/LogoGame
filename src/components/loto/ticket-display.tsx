import { cn } from '@/lib/utils';
import type { TicketGrid } from '@/types/loto';
import { useMemo } from 'react';

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
    cell: 'text-xs sm:text-sm h-10 sm:h-12',
    fontSize: 'text-xs sm:text-sm'
  },
  md: {
    cell: 'text-sm sm:text-base md:text-lg h-12 sm:h-14 md:h-16',
    fontSize: 'text-sm sm:text-base md:text-lg'
  },
  lg: {
    cell: 'text-base sm:text-lg md:text-xl h-14 sm:h-16 md:h-20',
    fontSize: 'text-base sm:text-lg md:text-xl'
  }
};

// Random background colors for the ticket (Vietnamese paper ticket aesthetic)
const ticketColors = [
  'bg-orange-100',
  'bg-yellow-100',
  'bg-green-100',
  'bg-blue-100',
  'bg-pink-100',
  'bg-purple-100',
  'bg-red-100',
  'bg-teal-100'
];

/**
 * TicketDisplay Component
 *
 * Displays a 3x9 Loto ticket that looks like a traditional Vietnamese paper ticket:
 * - Table-based layout with thick outer border
 * - Random background color for the ticket
 * - White cells with black text
 * - Cells slightly taller than wide (aspect-[3/4])
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

  // Generate random background color once per ticket (stable across renders)
  const backgroundColor = useMemo(() => {
    const randomIndex =
      Math.floor(ticketData[0][0] ?? 0 * ticketColors.length) %
      ticketColors.length;
    return ticketColors[randomIndex];
  }, [ticketData]);

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      {/* Ticket Table */}
      <table
        className={cn(
          'w-full border-collapse border-4 border-black table-fixed',
          backgroundColor
        )}
      >
        <tbody>
          {ticketData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {/* Row Label (optional) */}
              {showRowLabels && (
                <td className="text-xs text-gray-700 text-center px-2 font-semibold border border-black/20">
                  {rowIndex + 1}
                </td>
              )}

              {/* Row Cells */}
              {row.map((cell, colIndex) => {
                const isEmpty = cell === null;
                const isMarked = cell !== null && markedNumbers.has(cell);
                const isClickable = !isEmpty && onCellClick;

                return (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className={cn(
                      'border border-black/30 text-center align-middle',
                      'aspect-[3/4] relative',
                      sizeConfig.cell
                    )}
                  >
                    {!isEmpty && (
                      <button
                        onClick={() => cell && onCellClick?.(cell)}
                        disabled={!onCellClick}
                        className={cn(
                          'w-full h-full flex items-center justify-center font-bold transition-all duration-200',
                          sizeConfig.fontSize,
                          'bg-white text-black',
                          isMarked && 'bg-green-500 text-white shadow-lg',
                          isClickable &&
                            !isMarked &&
                            'hover:bg-gray-100 active:scale-95',
                          isClickable ? 'cursor-pointer' : 'cursor-default'
                        )}
                        aria-label={
                          isMarked
                            ? `Number ${cell} - marked`
                            : `Number ${cell}`
                        }
                      >
                        {cell}
                      </button>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Ticket Info */}
      <div className="mt-2 flex justify-between text-xs text-gray-600 px-1">
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
 * Minimal version using table layout for previews
 */
export function CompactTicketDisplay({
  ticketData,
  markedNumbers = new Set(),
  className
}: Omit<TicketDisplayProps, 'size' | 'onCellClick' | 'showRowLabels'>) {
  const backgroundColor = useMemo(() => {
    const randomIndex =
      Math.floor(ticketData[0][0] ?? 0 * ticketColors.length) %
      ticketColors.length;
    return ticketColors[randomIndex];
  }, [ticketData]);

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      <table
        className={cn(
          'w-full border-collapse border-2 border-black table-fixed',
          backgroundColor
        )}
      >
        <tbody>
          {ticketData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => {
                const isEmpty = cell === null;
                const isMarked = cell !== null && markedNumbers.has(cell);

                return (
                  <td
                    key={`${rowIndex}-${colIndex}`}
                    className={cn(
                      'border border-black/30 text-center align-middle h-8 sm:h-10',
                      'text-xs sm:text-sm font-semibold'
                    )}
                  >
                    {!isEmpty && (
                      <div
                        className={cn(
                          'w-full h-full flex items-center justify-center',
                          'bg-white text-black',
                          isMarked && 'bg-green-400 text-white'
                        )}
                      >
                        {cell}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * PrintableTicketDisplay Component
 *
 * Optimized for printing with table layout and clear borders
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
  const backgroundColor = useMemo(() => {
    const randomIndex =
      Math.floor(ticketData[0][0] ?? 0 * ticketColors.length) %
      ticketColors.length;
    return ticketColors[randomIndex];
  }, [ticketData]);

  return (
    <div className={cn('p-4 bg-white print:break-inside-avoid', className)}>
      {/* Header */}
      <div className="flex justify-between items-center mb-3 pb-2 border-b-2 border-gray-800">
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

      {/* Ticket Table */}
      <table
        className={cn(
          'w-full border-collapse border-4 border-black table-fixed',
          backgroundColor
        )}
      >
        <tbody>
          {ticketData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((cell, colIndex) => (
                <td
                  key={`${rowIndex}-${colIndex}`}
                  className={cn(
                    'border border-black/30 text-center align-middle h-12',
                    'text-base font-bold aspect-[3/4]'
                  )}
                >
                  {cell !== null && (
                    <div className="w-full h-full flex items-center justify-center bg-white text-black">
                      {cell}
                    </div>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer */}
      <div className="mt-3 pt-2 border-t-2 border-gray-800 text-xs text-gray-600 text-center">
        Mark numbers as they are called • Good luck!
      </div>
    </div>
  );
}
