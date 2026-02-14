'use client';

import { useEffect, useRef } from 'react';

interface Firework {
  x: number;
  y: number;
  targetY: number;
  color: string;
  particles: Particle[];
  launched: boolean;
  exploded: boolean;
  launchSpeed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  color: string;
  trail: { x: number; y: number; alpha: number }[];
}

const COLORS = [
  '#FFD700', // Gold
  '#FF6B6B', // Red
  '#FFC700', // Yellow gold
  '#FF4757', // Bright red
  '#C0C0C0', // Silver
  '#FFFFFF' // White
];

export function FireworksDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fireworksRef = useRef<Firework[]>([]);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Create a firework
    const createFirework = () => {
      const firework: Firework = {
        x: Math.random() * canvas.width,
        y: canvas.height,
        targetY: 100 + Math.random() * (canvas.height * 0.4),
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        particles: [],
        launched: false,
        exploded: false,
        launchSpeed: 3 + Math.random() * 2
      };
      return firework;
    };

    // Create particles for explosion
    const explode = (firework: Firework) => {
      const particleCount = 60 + Math.floor(Math.random() * 40);
      // Randomly decide: 50% chance for single color, 50% for multi-color
      const isMultiColor = Math.random() > 0.5;

      for (let i = 0; i < particleCount; i++) {
        const angle = (Math.PI * 2 * i) / particleCount;
        const speed = 2 + Math.random() * 3;
        // Use firework's base color or random color based on isMultiColor
        const particleColor = isMultiColor
          ? COLORS[Math.floor(Math.random() * COLORS.length)]
          : firework.color;
        firework.particles.push({
          x: firework.x,
          y: firework.targetY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: particleColor,
          trail: []
        });
      }
      firework.exploded = true;
    };

    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Launch new fireworks randomly
      if (Math.random() < 0.03 && fireworksRef.current.length < 5) {
        fireworksRef.current.push(createFirework());
      }

      // Update and draw fireworks
      fireworksRef.current = fireworksRef.current.filter((firework) => {
        // Launch phase
        if (!firework.exploded) {
          firework.y -= firework.launchSpeed;

          // Draw launch trail
          ctx.beginPath();
          ctx.arc(firework.x, firework.y, 2, 0, Math.PI * 2);
          ctx.fillStyle = firework.color;
          ctx.fill();

          // Explode when reaching target
          if (firework.y <= firework.targetY) {
            explode(firework);
          }
        }

        // Explosion phase
        if (firework.exploded) {
          let hasVisibleParticles = false;

          firework.particles.forEach((particle) => {
            if (particle.alpha <= 0) return;

            hasVisibleParticles = true;

            // Update trail
            particle.trail.push({
              x: particle.x,
              y: particle.y,
              alpha: particle.alpha
            });
            if (particle.trail.length > 10) {
              particle.trail.shift();
            }

            // Draw trail
            particle.trail.forEach((point) => {
              ctx.beginPath();
              ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
              ctx.fillStyle = `${particle.color}${Math.floor(
                point.alpha * 0.5 * 255
              )
                .toString(16)
                .padStart(2, '0')}`;
              ctx.fill();
            });

            // Update position
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.08; // Gravity
            particle.vx *= 0.98; // Air resistance
            particle.alpha -= 0.015; // Fade out

            // Draw particle
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 2.5, 0, Math.PI * 2);
            ctx.fillStyle = `${particle.color}${Math.floor(particle.alpha * 255)
              .toString(16)
              .padStart(2, '0')}`;
            ctx.fill();

            // Add glow
            ctx.shadowBlur = 10;
            ctx.shadowColor = particle.color;
            ctx.fill();
            ctx.shadowBlur = 0;
          });

          return hasVisibleParticles;
        }

        return true;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1000]"
      style={{ background: 'transparent' }}
    />
  );
}
