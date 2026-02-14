'use client';

import { useEffect, useState } from 'react';

interface Petal {
  id: number;
  left: number;
  animationDuration: number;
  animationDelay: number;
  size: number;
  swayAmount: number;
}

export function CherryBlossomRain() {
  const [mounted, setMounted] = useState(false);
  const [petals, setPetals] = useState<Petal[]>([]);

  useEffect(() => {
    // Generate petals only on client side after mount
    setPetals(
      Array.from({ length: 20 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        animationDuration: 8 + Math.random() * 7,
        animationDelay: Math.random() * 5,
        size: 0.5 + Math.random() * 1,
        swayAmount: 20 + Math.random() * 30
      }))
    );
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-[200]">
      {petals.map((petal) => (
        <div
          key={petal.id}
          className="absolute animate-fall-sway"
          style={
            {
              left: `${petal.left}%`,
              top: '-10%',
              animationDuration: `${petal.animationDuration}s`,
              animationDelay: `${petal.animationDelay}s`,
              '--sway-amount': `${petal.swayAmount}px`
            } as React.CSSProperties
          }
        >
          <svg
            width={20 * petal.size}
            height={20 * petal.size}
            viewBox="0 0 20 20"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="opacity-80"
          >
            {/* Cherry blossom petal shape */}
            <path
              d="M10 2C10 2 8 4 8 6C8 8 9 10 10 10C11 10 12 8 12 6C12 4 10 2 10 2Z"
              fill="#FF69B4"
            />
            <path
              d="M10 10C10 10 12 12 14 12C16 12 18 10 18 10C18 10 16 8 14 8C12 8 10 10 10 10Z"
              fill="#FF85C0"
            />
            <path
              d="M10 10C10 10 8 12 6 12C4 12 2 10 2 10C2 10 4 8 6 8C8 8 10 10 10 10Z"
              fill="#FFA0D0"
            />
            <path
              d="M10 10C10 10 8 14 8 16C8 18 10 18 10 18C10 18 12 18 12 16C12 14 10 10 10 10Z"
              fill="#FFBCE0"
            />
            <circle cx="10" cy="10" r="2" fill="#FFD700" />
          </svg>
        </div>
      ))}

      <style jsx>{`
        @keyframes fall-sway {
          0% {
            transform: translateY(0) translateX(0) rotate(0deg);
            opacity: 0;
          }
          10% {
            opacity: 0.7;
          }
          50% {
            transform: translateY(50vh) translateX(var(--sway-amount))
              rotate(180deg);
            opacity: 0.7;
          }
          100% {
            transform: translateY(110vh) translateX(0) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-fall-sway {
          animation: fall-sway linear infinite;
        }
      `}</style>
    </div>
  );
}
