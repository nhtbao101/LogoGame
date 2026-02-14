'use client';

import { cn } from '@/lib/utils';
import { CherryBlossomRain } from '@/components/effects/cherry-blossom-rain';
import { FireworksDisplay } from '@/components/effects/fireworks-display';

interface BackgroundProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'dark' | 'light';
  showEffects?: boolean;
}

export function Background({
  children,
  className,
  variant = 'default',
  showEffects = true
}: BackgroundProps) {
  const backgrounds = {
    default: 'bg-gradient-to-br from-red-50 via-yellow-50 to-red-100',
    dark: 'bg-gradient-to-br from-red-900 via-red-800 to-yellow-900',
    light: 'bg-gradient-to-br from-yellow-50 via-white to-red-50'
  };

  return (
    <div className={cn('min-h-screen relative overflow-hidden', className)}>
      {/* Main gradient background */}
      <div className={cn('absolute inset-0', backgrounds[variant])} />

      {/* Decorative patterns */}
      <div className="absolute inset-0 opacity-5">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23b91c1c' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}
        />
      </div>

      {/* Floating lanterns decoration */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-100 left-10 text-6xl opacity-70 animate-bounce">
          🏮
        </div>
        <div
          className="absolute top-52 right-20 text-5xl opacity-90 animate-bounce"
          style={{ animationDelay: '1s' }}
        >
          🧧
        </div>
        <div
          className="absolute bottom-40 left-1/4 text-4xl opacity-70 animate-bounce"
          style={{ animationDelay: '2s' }}
        >
          🎊
        </div>
        <div
          className="absolute bottom-30 right-1/3 text-5xl opacity-60 animate-bounce"
          style={{ animationDelay: '0.5s' }}
        >
          🏮
        </div>
      </div>

      {/* Cherry Blossom Rain Effect */}
      {showEffects && <CherryBlossomRain />}

      {/* Fireworks Display Effect */}
      {showEffects && <FireworksDisplay />}

      {/* Content */}
      <div className="relative z-[100]">{children}</div>
    </div>
  );
}
