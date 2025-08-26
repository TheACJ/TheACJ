import React, { useRef, useEffect } from 'react';

interface Drop {
  x: number;
  y: number;
  speed: number;
  chars: string[];
}

interface MousePosition {
  x: number;
  y: number;
}

interface DataRainBackgroundProps {
  density?: number;
  speedVariance?: number;
  charSet?: string[];
  highlightChars?: boolean;
  neonStreaks?: number;
  mouseInteraction?: 'deflect' | 'attract';
  className?: string;
  color?: string;
}

const DataRainBackground: React.FC<DataRainBackgroundProps> = ({
  density = 0.01,
  speedVariance = 1.8,
  charSet = ['0', '1', 'あ', 'ｱ', 'Æ', 'Ψ'],
  highlightChars = true,
  neonStreaks = 3,
  mouseInteraction = 'deflect',
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const dropsRef = useRef<Drop[]>([]);
  const mouseRef = useRef<MousePosition>({ x: window.innerWidth / 2, y: window.innerHeight / 2 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDrops();
    };

    const initDrops = () => {
      const columns = Math.floor(canvas.width * density);
      dropsRef.current = Array.from({ length: columns }, (_, i) => ({
        x: i * (canvas.width / columns),
        y: Math.random() * canvas.height,
        speed: Math.random() * speedVariance + 1,
        chars: Array.from({ length: 20 }, () => charSet[Math.floor(Math.random() * charSet.length)]),
      }));
    };

    const draw = () => {
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '9px monospace';

      dropsRef.current.forEach((drop) => {
        const dx = mouseRef.current.x - drop.x;
        const dy = mouseRef.current.y - drop.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 80) {
          const force = (mouseInteraction === 'deflect' ? 1 : -1) * 2 * (80 - distance) / 80;
          drop.x += (dx / distance) * force;
        }

        drop.y += drop.speed;
        if (drop.y > canvas.height + 200) {
          drop.y = -300;
          drop.x = Math.random() * canvas.width;
        }

        drop.chars.forEach((char, i) => {
          ctx.fillStyle = highlightChars && i === 0 ? '#00ff66' : '#003300';
          ctx.fillText(char, drop.x, drop.y - i * 15);
        });
      });

      // Optional neon streaks
      for (let i = 0; i < neonStreaks; i++) {
        ctx.beginPath();
        ctx.moveTo(mouseRef.current.x, mouseRef.current.y - i * 10);
        ctx.lineTo(
          mouseRef.current.x + (Math.random() - 0.5) * 20,
          mouseRef.current.y - (i + 1) * 10
        );
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const point = 'touches' in e
        ? e.touches[0]
        : e as MouseEvent;
      mouseRef.current = { x: point.clientX, y: point.clientY };
    };

    resizeCanvas();
    draw();

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleMouseMove);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleMouseMove);
    };
  }, [density, speedVariance, charSet, highlightChars, neonStreaks, mouseInteraction]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default DataRainBackground;
