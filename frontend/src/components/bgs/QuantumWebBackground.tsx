import React, { useRef, useEffect } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  trail: Array<{ x: number; y: number }>;
}

interface MousePosition {
  x: number;
  y: number;
}

interface QuantumWebBackgroundProps {
  particleCount?: number;
  connectionDistance?: number;
  colors?: string[];
  mouseRepelStrength?: number;
  mouseAttractStrength?: number;
  className?: string;
}

const QuantumWebBackground: React.FC<QuantumWebBackgroundProps> = ({
  particleCount = 500,
  connectionDistance = 150,
  colors = ['#ff00ff', '#00ffff', '#ffff00'],
  mouseRepelStrength = 0.5,
  mouseAttractStrength = 0.2,
  className = '',
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const particlesRef = useRef<Particle[]>([]);
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
      initParticles();
    };

    const initParticles = () => {
      particlesRef.current = Array.from({ length: particleCount }, () => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        trail: [],
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const now = Date.now();

      particlesRef.current.forEach((p, i) => {
        const dx = p.x - mouseRef.current.x;
        const dy = p.y - mouseRef.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          const angle = Math.atan2(dy, dx);
          p.vx += Math.cos(angle) * mouseRepelStrength;
          p.vy += Math.sin(angle) * mouseRepelStrength;
        } else {
          p.vx -= dx * mouseAttractStrength * 0.01;
          p.vy -= dy * mouseAttractStrength * 0.01;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 10) p.trail.shift();

        // Draw particle core
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.fill();

        // Draw trail
        p.trail.forEach((pos, j) => {
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2);
          const opacity = (j + 1) / p.trail.length;
          ctx.fillStyle = applyAlpha(p.color, opacity * 0.4);
          ctx.fill();
        });

        // Connect to nearby particles
        for (let j = i + 1; j < particlesRef.current.length; j++) {
          const o = particlesRef.current[j];
          const dist = Math.sqrt((p.x - o.x) ** 2 + (p.y - o.y) ** 2);
          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.5;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(o.x, o.y);
            ctx.strokeStyle = applyAlpha(p.color, alpha);
            ctx.lineWidth = Math.sin(now * 0.001) * 0.5 + 0.5;
            ctx.stroke();
          }
        }
      });

      animationRef.current = requestAnimationFrame(draw);
    };

    const applyAlpha = (hexColor: string, alpha: number): string => {
      const hex = hexColor.replace('#', '');
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    };

    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      const pos = 'touches' in e
        ? { x: e.touches[0].clientX, y: e.touches[0].clientY }
        : { x: e.clientX, y: e.clientY };
      mouseRef.current = pos;
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
  }, [
    particleCount,
    connectionDistance,
    colors,
    mouseRepelStrength,
    mouseAttractStrength,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed top-0 left-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
};

export default QuantumWebBackground;
