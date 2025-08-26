import React, { useRef, useEffect } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

interface PlasmaVortexBackgroundProps {
  turbulence?: number;
  colorStops?: string[];
  swirlFactor?: number;
  mouseVortexStrength?: number;
  className?: string;
}

const PlasmaVortexBackground: React.FC<PlasmaVortexBackgroundProps> = ({
  turbulence = 0.5,
  colorStops = ['#000000', '#8a2be2', '#00bfff'],
  swirlFactor = 1.2,
  mouseVortexStrength = 0.8,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const mouseRef = useRef<MousePosition>({
    x: window.innerWidth / 2,
    y: window.innerHeight / 2,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const parse = (hex: string): [number, number, number] => {
        if (!hex || typeof hex !== 'string' || !hex.startsWith('#')) return [0, 0, 0];
        const clean = hex.replace('#', '');
        const parts = clean.length === 3
            ? clean.split('').map(c => parseInt(c + c, 16))
            : clean.match(/.{1,2}/g)?.map(v => parseInt(v, 16)) || [0, 0, 0];

        return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
        };

        const lerpColor = (a: string, bi: string, t: number): string => {
        const [r1, g1, b1] = parse(a);
        const [r2, g2, b2] = parse(bi);
        const r = Math.round(r1 + (r2 - r1) * t);
        const g = Math.round(g1 + (g2 - g1) * t);
        const b = Math.round(b1 + (b2 - b1) * t);
        return `rgb(${r}, ${g}, ${b})`;
        };

        const getGradientColor = (t: number): string => {
        const safeStops = colorStops.length >= 2 ? colorStops : ['#000000', '#ffffff'];
        const index = t * (safeStops.length - 1);
        const lower = Math.floor(index);
        const upper = Math.min(safeStops.length - 1, lower + 1);
        const ratio = index - lower;
        return lerpColor(safeStops[lower], safeStops[upper], ratio);
        };


    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now() * 0.001 * turbulence;

      const gridSize = 10;
      for (let x = 0; x < canvas.width; x += gridSize) {
        for (let y = 0; y < canvas.height; y += gridSize) {
          const dx = x - mouseRef.current.x;
          const dy = y - mouseRef.current.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const vortexEffect = distance < 200 ? mouseVortexStrength * (200 - distance) / 200 : 0;
          const angle = Math.atan2(dy, dx) + time + vortexEffect;

          const noise = (Math.sin(x * 0.01 + angle * swirlFactor) +
                         Math.sin(y * 0.01 + angle * swirlFactor)) / 2 + 0.5;

          ctx.fillStyle = getGradientColor(noise);
          ctx.fillRect(x, y, gridSize, gridSize);
        }
      }

      animationRef.current = requestAnimationFrame(draw);
    };

    resizeCanvas();
    draw();

    const handleInteraction = (e: MouseEvent | TouchEvent) => {
      const pos = 'touches' in e
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX, y: e.clientY };
      mouseRef.current = pos;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchmove', handleInteraction);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchmove', handleInteraction);
    };
  }, [turbulence, colorStops, swirlFactor, mouseVortexStrength]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default PlasmaVortexBackground;
