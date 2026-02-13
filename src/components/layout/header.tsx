'use client';

import { LotoLogo } from '@/components/ui/loto-logo';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export function Header({ title, subtitle, action, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b-4 border-red-700',
        'bg-gradient-to-r from-red-600 via-red-500 to-yellow-600',
        'shadow-lg',
        className
      )}
    >
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <LotoLogo size="sm" className="text-white drop-shadow-lg" />
            {title && (
              <div className="hidden md:block border-l-2 border-white/30 pl-4">
                <h1 className="text-xl font-bold text-white drop-shadow-md">
                  {title}
                </h1>
                {subtitle && (
                  <p className="text-sm text-yellow-100">{subtitle}</p>
                )}
              </div>
            )}
          </div>

          {/* Action */}
          {action && <div>{action}</div>}
        </div>

        {/* Mobile title */}
        {title && (
          <div className="md:hidden mt-2 border-t border-white/20 pt-2">
            <h1 className="text-lg font-bold text-white drop-shadow-md">
              {title}
            </h1>
            {subtitle && <p className="text-sm text-yellow-100">{subtitle}</p>}
          </div>
        )}
      </div>

      {/* Decorative bottom pattern */}
      <div className="h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400" />
    </header>
  );
}
