import { cn } from '@/lib/utils';
import type { WinPattern } from '@/lib/loto/win-detection';

interface WinCelebrationProps {
  pattern: WinPattern;
  onClose?: () => void;
  className?: string;
}

const patternConfig: Record<
  WinPattern,
  {
    emoji: string;
    title: string;
    subtitle: string;
    bgGradient: string;
    textColor: string;
  }
> = {
  'top-line': {
    emoji: '🎉',
    title: 'Top Line!',
    subtitle: 'You completed the first row!',
    bgGradient: 'from-blue-400 to-blue-600',
    textColor: 'text-white'
  },
  'middle-line': {
    emoji: '🎊',
    title: 'Middle Line!',
    subtitle: 'You completed the second row!',
    bgGradient: 'from-purple-400 to-purple-600',
    textColor: 'text-white'
  },
  'bottom-line': {
    emoji: '🎈',
    title: 'Bottom Line!',
    subtitle: 'You completed the third row!',
    bgGradient: 'from-pink-400 to-pink-600',
    textColor: 'text-white'
  },
  'full-house': {
    emoji: '🏆',
    title: 'FULL HOUSE!',
    subtitle: 'All numbers marked! Congratulations!',
    bgGradient: 'from-yellow-400 to-orange-500',
    textColor: 'text-gray-900'
  }
};

/**
 * WinCelebration Component
 *
 * Displays an animated celebration when a player achieves a winning pattern
 */
export function WinCelebration({
  pattern,
  onClose,
  className
}: WinCelebrationProps) {
  const config = patternConfig[pattern];

  return (
    <div
      className={cn(
        'rounded-lg p-8 shadow-lg text-center animate-pulse',
        `bg-gradient-to-br ${config.bgGradient}`,
        className
      )}
    >
      {/* Emoji */}
      <div className="text-8xl mb-4 animate-bounce">{config.emoji}</div>

      {/* Title */}
      <h2 className={cn('text-4xl font-bold mb-2', config.textColor)}>
        {config.title}
      </h2>

      {/* Subtitle */}
      <p className={cn('text-xl mb-6', config.textColor)}>{config.subtitle}</p>

      {/* Close Button (optional) */}
      {onClose && (
        <button
          onClick={onClose}
          className={cn(
            'rounded-lg px-6 py-3 font-semibold transition-colors',
            pattern === 'full-house'
              ? 'bg-gray-900 text-white hover:bg-gray-800'
              : 'bg-white text-gray-900 hover:bg-gray-100'
          )}
        >
          Continue
        </button>
      )}

      {/* Confetti effect could be added here with a library like react-confetti */}
    </div>
  );
}

/**
 * Compact Win Badge Component
 *
 * Smaller indicator for wins
 */
export function WinBadge({
  pattern,
  className
}: {
  pattern: WinPattern;
  className?: string;
}) {
  const config = patternConfig[pattern];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold',
        `bg-gradient-to-r ${config.bgGradient}`,
        config.textColor,
        className
      )}
    >
      <span>{config.emoji}</span>
      <span>{config.title}</span>
    </div>
  );
}

/**
 * Win Progress Indicator
 *
 * Shows how close to each win condition
 */
export function WinProgressIndicator({
  numbersToWin,
  className
}: {
  numbersToWin: {
    topLine: number;
    middleLine: number;
    bottomLine: number;
    fullHouse: number;
  };
  className?: string;
}) {
  const rows = [
    { label: 'Top Line', count: numbersToWin.topLine, color: 'blue' },
    { label: 'Middle Line', count: numbersToWin.middleLine, color: 'purple' },
    { label: 'Bottom Line', count: numbersToWin.bottomLine, color: 'pink' },
    { label: 'Full House', count: numbersToWin.fullHouse, color: 'orange' }
  ];

  return (
    <div className={cn('space-y-2', className)}>
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        Numbers to Win
      </h3>
      {rows.map((row) => (
        <div
          key={row.label}
          className="flex items-center justify-between text-sm"
        >
          <span className="text-gray-600">{row.label}</span>
          <span
            className={cn(
              'font-bold',
              row.count === 0
                ? 'text-green-600'
                : row.count <= 2
                ? `text-${row.color}-600`
                : 'text-gray-500'
            )}
          >
            {row.count === 0 ? '✓ Complete' : `${row.count} left`}
          </span>
        </div>
      ))}
    </div>
  );
}
