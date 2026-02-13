import React from 'react';
import styles from './tet-loto-ticket.module.scss';
import { cn } from '@/lib/utils';

interface TetLotoTicketProps {
  /** 3x9 grid data: (number | null)[][] */
  data: (number | null)[][];
  /** Set of marked numbers */
  markedNumbers?: Set<number>;
  /** Click handler for marking numbers */
  onCellClick?: (number: number) => void;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Apricot Blossom SVG Icon
 * Traditional Vietnamese Hoa Mai (Yellow Apricot Blossom)
 */
function ApricotBlossom() {
  return (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <g>
        {/* Petals */}
        <ellipse cx="50" cy="25" rx="12" ry="18" fill="#FFD700" opacity="0.9" />
        <ellipse cx="75" cy="50" rx="12" ry="18" fill="#FFD700" opacity="0.9" transform="rotate(72 50 50)" />
        <ellipse cx="63" cy="82" rx="12" ry="18" fill="#FFD700" opacity="0.9" transform="rotate(144 50 50)" />
        <ellipse cx="37" cy="82" rx="12" ry="18" fill="#FFD700" opacity="0.9" transform="rotate(216 50 50)" />
        <ellipse cx="25" cy="50" rx="12" ry="18" fill="#FFD700" opacity="0.9" transform="rotate(288 50 50)" />
        
        {/* Center */}
        <circle cx="50" cy="50" r="8" fill="#FFA500" />
        <circle cx="50" cy="50" r="5" fill="#FF8C00" />
        
        {/* Stamens */}
        <circle cx="50" cy="50" r="2" fill="#8B4513" opacity="0.6" />
        <circle cx="54" cy="48" r="1.5" fill="#8B4513" opacity="0.5" />
        <circle cx="46" cy="48" r="1.5" fill="#8B4513" opacity="0.5" />
        <circle cx="52" cy="52" r="1.5" fill="#8B4513" opacity="0.5" />
        <circle cx="48" cy="52" r="1.5" fill="#8B4513" opacity="0.5" />
      </g>
    </svg>
  );
}

/**
 * TetLotoTicket Component
 * 
 * Vietnamese Lunar New Year (Tết) themed Loto ticket with traditional styling:
 * - Deep red background with silk pattern
 * - Metallic gold accents and borders
 * - Apricot blossom decorations
 * - Calligraphic Vietnamese styling
 * 
 * @example
 * ```tsx
 * <TetLotoTicket
 *   data={ticketData}
 *   markedNumbers={new Set([1, 23, 45])}
 *   onCellClick={handleMark}
 * />
 * ```
 */
export function TetLotoTicket({
  data,
  markedNumbers = new Set(),
  onCellClick,
  className
}: TetLotoTicketProps) {
  // Validate data structure
  if (data.length !== 3 || data.some((row) => row.length !== 9)) {
    console.error('TetLotoTicket: data must be 3x9 grid');
    return null;
  }

  return (
    <div className={cn(styles.tetTicket, className)}>
      {/* Decorative Blossoms */}
      <div className={`${styles.blossom} ${styles.topLeft}`}>
        <ApricotBlossom />
      </div>
      <div className={`${styles.blossom} ${styles.topRight}`}>
        <ApricotBlossom />
      </div>
      <div className={`${styles.blossom} ${styles.bottomLeft}`}>
        <ApricotBlossom />
      </div>
      <div className={`${styles.blossom} ${styles.bottomRight}`}>
        <ApricotBlossom />
      </div>

      {/* Header Banner */}
      <div className={styles.header}>
        <h2>CHÚC MỪNG NĂM MỚI</h2>
      </div>

      {/* Grid Container */}
      <div className={styles.gridContainer}>
        <div className={styles.grid}>
          {data.flat().map((cell, index) => {
            const rowIndex = Math.floor(index / 9);
            const colIndex = index % 9;
            const isEmpty = cell === null;
            const isMarked = !isEmpty && markedNumbers.has(cell);
            const isClickable = !isEmpty && onCellClick;

            return (
              <div
                key={`${rowIndex}-${colIndex}`}
                className={cn(
                  styles.cell,
                  isEmpty ? styles.empty : styles.hasNumber,
                  isMarked && styles.marked
                )}
                onClick={() => !isEmpty && onCellClick?.(cell)}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                aria-label={
                  isEmpty
                    ? 'Ô trống'
                    : isMarked
                    ? `Số ${cell} - đã đánh dấu`
                    : `Số ${cell}`
                }
              >
                {!isEmpty && <span className={styles.number}>{cell}</span>}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Banner */}
      <div className={styles.footer}>
        <p>Vạn sự như ý • Phát tài phát lộc</p>
      </div>
    </div>
  );
}

export default TetLotoTicket;
