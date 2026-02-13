'use client';

import { LotoLogo } from '@/components/ui/loto-logo';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative mt-auto border-t-4 border-red-700 bg-gradient-to-b from-red-900 via-red-800 to-red-950">
      {/* Decorative top border */}
      <div className="h-1 bg-gradient-to-r from-yellow-400 via-red-500 to-yellow-400" />

      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left side: Logo & Greeting */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="transform transition-transform hover:scale-105">
              <LotoLogo size="sm" clickable={true} className="drop-shadow-lg" />
            </div>
            <div className="hidden md:block w-px h-12 bg-yellow-500/30" />
            <div className="text-center md:text-left">
              <p className="text-lg font-bold bg-gradient-to-r from-yellow-400 to-yellow-300 bg-clip-text text-transparent">
                Chúc mừng năm mới
              </p>
              <p className="text-sm font-semibold text-yellow-200">
                An Khang Thịnh Vượng
              </p>
            </div>
          </div>

          {/* Right side: Copyright & Decorations */}
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="flex gap-3 text-xl opacity-60">
              <span>🏮</span>
              <span>🧧</span>
              <span>🏮</span>
            </div>
            <div className="text-center md:text-right">
              <p className="text-sm text-yellow-100/90">
                © {currentYear} Designed by{' '}
                <span className="font-bold text-yellow-300">Bảo Nguyễn</span>
              </p>
              <p className="text-xs text-yellow-200/70">
                Trò chơi Lô Tô truyền thống
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom decorative pattern */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-900 via-yellow-600 to-red-900 opacity-50" />
    </footer>
  );
}
