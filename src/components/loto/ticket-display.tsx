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
    cell: 'h-10 sm:h-12',
    fontSize: 'text-xl sm:text-2xl'
  },
  md: {
    cell: 'h-12 sm:h-14 md:h-16',
    fontSize: 'text-2xl sm:text-3xl md:text-4xl'
  },
  lg: {
    cell: 'h-14 sm:h-16 md:h-20',
    fontSize: 'text-3xl sm:text-4xl md:text-5xl'
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
 * Calligraphic Brush-Stroke X SVG Component
 * Animated drawing with refined calligraphic style and ink-bleed texture
 */
function BrushStrokeX() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 m-auto pointer-events-none z-10"
      style={{
        width: '80%',
        height: '80%'
      }}
    >
      <defs>
        {/* Ink bleed effect with turbulence */}
        <filter id="inkBleed" x="-50%" y="-50%" width="200%" height="200%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.8"
            numOctaves="4"
            seed="2"
            result="turbulence"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="turbulence"
            scale="1.5"
            xChannelSelector="R"
            yChannelSelector="G"
            result="displacement"
          />
          <feGaussianBlur stdDeviation="0.3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Soft edge glow */}
        <filter id="softGlow">
          <feGaussianBlur stdDeviation="0.5" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* First stroke: top-left to bottom-right with animation */}
      <path
        d="M 20,15 Q 35,30 50,50 Q 65,70 80,85"
        stroke="#b31d1d"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
        filter="url(#inkBleed)"
        strokeDasharray="100"
        strokeDashoffset="100"
        style={{
          animation: 'drawStroke 0.3s ease-out forwards'
        }}
      >
        <animate
          attributeName="stroke-width"
          values="8;10;12;10"
          dur="0.3s"
          fill="freeze"
        />
      </path>

      {/* Second stroke: top-right to bottom-left with delayed animation */}
      <path
        d="M 80,15 Q 65,30 50,50 Q 35,70 20,85"
        stroke="#b31d1d"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        opacity="0.7"
        filter="url(#inkBleed)"
        strokeDasharray="100"
        strokeDashoffset="100"
        style={{
          animation: 'drawStroke 0.3s ease-out 0.15s forwards'
        }}
      >
        <animate
          attributeName="stroke-width"
          values="8;10;12;10"
          dur="0.3s"
          begin="0.15s"
          fill="freeze"
        />
      </path>

      {/* Subtle accent strokes for depth */}
      <path
        d="M 25,20 L 50,45"
        stroke="#b31d1d"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
        filter="url(#softGlow)"
        strokeDasharray="40"
        strokeDashoffset="40"
        style={{
          animation: 'drawStroke 0.2s ease-out 0.1s forwards'
        }}
      />
      <path
        d="M 75,20 L 50,45"
        stroke="#b31d1d"
        strokeWidth="6"
        strokeLinecap="round"
        fill="none"
        opacity="0.4"
        filter="url(#softGlow)"
        strokeDasharray="40"
        strokeDashoffset="40"
        style={{
          animation: 'drawStroke 0.2s ease-out 0.25s forwards'
        }}
      />

      <style>{`
        @keyframes drawStroke {
          to {
            stroke-dashoffset: 0;
          }
        }
      `}</style>
    </svg>
  );
}

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
                          'w-full h-full flex items-center justify-center font-bold transition-all duration-200 relative',
                          'bg-white text-black',
                          isClickable &&
                            !isMarked &&
                            'hover:bg-gray-100 active:scale-95',
                          isClickable ? 'cursor-pointer' : 'cursor-default'
                        )}
                        style={{
                          fontSize: 'clamp(1rem, 5.7vw, 4rem)'
                        }}
                        aria-label={
                          isMarked
                            ? `Number ${cell} - marked`
                            : `Number ${cell}`
                        }
                      >
                        {cell}
                        {/* Brush-stroke X overlay for marked numbers */}
                        {isMarked && <BrushStrokeX />}
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
                      'font-semibold'
                    )}
                  >
                    {!isEmpty && (
                      <div
                        className={cn(
                          'w-full h-full flex items-center justify-center relative',
                          'bg-white text-black font-bold'
                        )}
                        style={{
                          fontSize: 'clamp(0.75rem, 5.67vw, 2rem)'
                        }}
                      >
                        {cell}
                        {/* Brush-stroke X overlay for marked numbers */}
                        {isMarked && <BrushStrokeX />}
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
                    'font-bold aspect-[3/4]'
                  )}
                >
                  {cell !== null && (
                    <div
                      className="w-full h-full flex items-center justify-center bg-white text-black"
                      style={{
                        fontSize: 'clamp(1rem, 6.67vw, 3rem)'
                      }}
                    >
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
