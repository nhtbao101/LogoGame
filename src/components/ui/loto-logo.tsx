'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LotoLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  clickable?: boolean;
}

export function LotoLogo({
  className,
  size = 'md',
  clickable = true
}: LotoLogoProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  };

  const logo = (
    <div
      className={cn(
        'font-bold tracking-wider inline-flex items-center',
        sizeClasses[size],
        className
      )}
    >
      <span
        className="bg-gradient-to-br from-yellow-500 via-yellow-400 to-yellow-600 bg-clip-text text-transparent"
        style={{
          textShadow: '2px 2px 4px rgba(234, 179, 8, 0.3)'
        }}
      >
        LOTO
      </span>
    </div>
  );

  if (clickable) {
    return (
      <Link
        href="/"
        className="hover:opacity-80 transition-opacity cursor-pointer"
        aria-label="Loto - Về trang chủ"
      >
        {logo}
      </Link>
    );
  }

  return logo;
}
