import React, { useRef, useEffect } from 'react';

// Base BackgroundCanvas Component
const BackgroundCanvas = ({ render, onMouseMove, onTouchMove }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resize();
    window.addEventListener('resize', resize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      render(ctx, canvas.width, canvas.height);
      requestAnimationFrame(animate);
    };

    animate();

    if (onMouseMove) window.addEventListener('mousemove', onMouseMove);
    if (onTouchMove) window.addEventListener('touchmove', onTouchMove);

    return () => {
      window.removeEventListener('resize', resize);
      if (onMouseMove) window.removeEventListener('mousemove', onMouseMove);
      if (onTouchMove) window.removeEventListener('touchmove', onTouchMove);
    };
  }, [render, onMouseMove, onTouchMove]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        background: 'transparent',
        willChange: 'transform',
        transform: 'translate3d(0,0,0)',
      }}
    />
  );
};

// 1. Quantum Particle Web
const QuantumWebBackground = ({
  particleCount = 500,
  connectionDistance = 150,
  colors = ['#ff00ff', '#00ffff', '#ffff00'],
  mouseRepelStrength = 0.5,
  mouseAttractStrength = 0.2,
}) => {
  const particles = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });

  class Particle {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5) * 2;
      this.vy = (Math.random() - 0.5) * 2;
      this.color = colors[Math.floor(Math.random() * colors.length)];
      this.trail = [];
    }

    update(mouse) {
      const dx = this.x - mouse.x;
      const dy = this.y - mouse.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 100) {
        const angle = Math.atan2(dy, dx);
        this.vx += Math.cos(angle) * mouseRepelStrength;
        this.vy += Math.sin(angle) * mouseRepelStrength;
      } else {
        this.vx -= dx * mouseAttractStrength * 0.01;
        this.vy -= dy * mouseAttractStrength * 0.01;
      }
      this.x += this.vx;
      this.y += this.vy;
      if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
      if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;
      this.trail.push({ x: this.x, y: this.y });
      if (this.trail.length > 10) this.trail.shift();
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 2, 0, Math.PI * 2);
      ctx.fillStyle = this.color;
      ctx.fill();
      this.trail.forEach((pos, i) => {
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 1, 0, Math.PI * 2);
        ctx.fillStyle = `${this.color}${Math.floor((i / 10) * 255).toString(16)}`;
        ctx.fill();
      });
    }
  }

  useEffect(() => {
    particles.current = Array.from({ length: particleCount }, () => new Particle());
  }, [particleCount]);

  const render = (ctx, width, height) => {
    particles.current.forEach(p => {
      p.update(mouse.current);
      p.draw(ctx);
      particles.current.forEach(o => {
        const dx = p.x - o.x;
        const dy = p.y - o.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < connectionDistance) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(o.x, o.y);
          ctx.strokeStyle = `${p.color}${Math.floor((1 - distance / connectionDistance) * 255).toString(16)}`;
          ctx.lineWidth = Math.sin(Date.now() * 0.001) * 0.5 + 0.5;
          ctx.stroke();
        }
      });
    });
  };

  const onMouseMove = (e) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
  };

  return <BackgroundCanvas render={render} onMouseMove={onMouseMove} />;
};

// 2. Neural Network Pulse
const NeuralPulseBackground = ({
  layers = 5,
  nodesPerLayer = 12,
  activationColor = '#ff5500',
  idleColor = '#333333',
  pulseSpeed = 0.02,
  responseCurve = 'sigmoid',
}) => {
  const nodes = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });

  class Node {
    constructor(layer, index) {
      this.layer = layer;
      this.x = (layer / (layers - 1)) * window.innerWidth;
      this.y = (index / (nodesPerLayer - 1)) * window.innerHeight;
      this.activation = 0;
    }

    update() {
      this.activation *= 0.95;
    }

    draw(ctx) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
      ctx.fillStyle = this.activation > 0.1 ? activationColor : idleColor;
      ctx.fill();
    }
  }

  useEffect(() => {
    nodes.current = [];
    for (let l = 0; l < layers; l++) {
      for (let i = 0; i < nodesPerLayer; i++) {
        nodes.current.push(new Node(l, i));
      }
    }
  }, [layers, nodesPerLayer]);

  const render = (ctx, width, height) => {
    nodes.current.forEach(n => {
      n.update();
      n.draw(ctx);
      if (n.layer < layers - 1) {
        const nextNodes = nodes.current.filter(m => m.layer === n.layer + 1);
        nextNodes.forEach(m => {
          if (n.activation > 0.1) m.activation = Math.max(m.activation, n.activation * 0.8);
          ctx.beginPath();
          ctx.moveTo(n.x, n.y);
          ctx.lineTo(m.x, m.y);
          ctx.strokeStyle = n.activation > 0.1 ? activationColor : idleColor;
          ctx.lineWidth = n.activation;
          ctx.stroke();
        });
      }
    });
  };

  const onMouseMove = (e) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
    nodes.current.forEach(n => {
      const dx = n.x - mouse.current.x;
      const dy = n.y - mouse.current.y;
      if (Math.sqrt(dx * dx + dy * dy) < 50) n.activation = 1;
    });
  };

  return <BackgroundCanvas render={render} onMouseMove={onMouseMove} />;
};

// 3. Holographic Grid Warp
const HoloGridBackground = ({
  gridSize = 40,
  baseColor = '#00a2ff',
  warpIntensity = 0.7,
  mouseDistortionRadius = 300,
  perspective = 1200,
}) => {
  const mouse = useRef({ x: 0, y: 0 });

  const render = (ctx, width, height) => {
    const gridLines = Math.ceil(width / gridSize) + 1;
    const gridCols = Math.ceil(height / gridSize) + 1;

    for (let i = 0; i < gridLines; i++) {
      for (let j = 0; j < gridCols; j++) {
        const x = i * gridSize;
        const y = j * gridSize;
        const dx = x - mouse.current.x;
        const dy = y - mouse.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const warp = distance < mouseDistortionRadius ? (1 - distance / mouseDistortionRadius) * warpIntensity : 0;
        const warpedX = x + dx * warp;
        const warpedY = y + dy * warp;
        ctx.beginPath();
        ctx.arc(warpedX, warpedY, 1, 0, Math.PI * 2);
        ctx.fillStyle = `${baseColor}${Math.floor((1 - warp) * 255).toString(16)}`;
        ctx.fill();
      }
    }
  };

  const onMouseMove = (e) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
  };

  return <BackgroundCanvas render={render} onMouseMove={onMouseMove} />;
};

// 4. Plasma Vortex
const PlasmaVortexBackground = ({
  turbulence = 0.5,
  colorStops = ['#000000', '#8a2be2', '#00bfff'],
  swirlFactor = 1.2,
  mouseVortexStrength = 0.8,
  blendMode = 'screen',
}) => {
  const mouse = useRef({ x: 0, y: 0 });

  const render = (ctx, width, height) => {
    ctx.globalCompositeOperation = blendMode;
    for (let x = 0; x < width; x += 10) {
      for (let y = 0; y < height; y += 10) {
        const dx = x - mouse.current.x;
        const dy = y - mouse.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        const swirl = (1 - Math.min(distance / 300, 1)) * swirlFactor;
        const t = Date.now() * 0.001 * turbulence;
        const colorIndex = (Math.sin(x * 0.01 + angle * swirl + t) + Math.sin(y * 0.01 + angle * swirl + t)) / 2 + 0.5;
        ctx.fillStyle = colorStops[Math.floor(colorIndex * (colorStops.length - 1))];
        ctx.fillRect(x, y, 10, 10);
      }
    }
    ctx.globalCompositeOperation = 'source-over';
  };

  const onMouseMove = (e) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
  };

  return <BackgroundCanvas render={render} onMouseMove={onMouseMove} />;
};

// 5. Cryptic Glyph Storm
const GlyphStormBackground = ({
  glyphSet = ['䷀', '䷁', '䷂', '䷃', '☯', '꩜', '༒'],
  rotationSpeed = 0.03,
  mouseWakeIntensity = 1.5,
  collisionDetection = true,
  ancientMode = true,
}) => {
  const glyphs = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });

  class Glyph {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.vx = (Math.random() - 0.5 * 2);
      this.vy = (Math.random() - 0.5 * 2);
      this.char = glyphSet[Math.floor(Math.random() * glyphSet.length)];
      this.rotation = 0;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.rotation += rotationSpeed;
      if (this.x < 0 || this.x > window.innerWidth) this.vx *= -1;
      if (this.y < 0 || this.y > window.innerHeight) this.vy *= -1;

      if (collisionDetection) {
        glyphs.current.forEach(o => {
          if (o !== this) {
            const dx = this.x - o.x;
            const dy = this.y - o.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 30) {
              this.vx += dx * 0.05;
              this.vy += dy * 0.05;
            }
          }
        });
      }
    }

    draw(ctx) {
      ctx.save();
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.font = '20px serif';
      ctx.fillStyle = ancientMode ? '#d4a017' : '#ffffff';
      ctx.fillText(this.char, 0, 0);
      ctx.restore();
    }
  }

  useEffect(() => {
    glyphs.current = Array.from({ length: 100 }, () => new Glyph());
  }, []);

  const render = (ctx, width, height) => {
    glyphs.current.forEach(g => {
      g.update();
      g.draw(ctx);
    });
  };

  const onMouseMove = (e) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
    glyphs.current.forEach(g => {
      const dx = g.x - mouse.current.x;
      const dy = g.y - mouse.current.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < 100) {
        g.vx += (dx / distance) * mouseWakeIntensity;
        g.vy += (dy / distance) * mouseWakeIntensity;
      }
    });
  };

  return <BackgroundCanvas render={render} onMouseMove={onMouseMove} />;
};

// 6. Fractal Bloom
const FractalBloomBackground = ({
  recursionDepth = 5,
  branchAngle = Math.PI / 4,
  growthSpeed = 0.1,
  mousePollination = true,
  seasonColors = ['#ff6b6b', '#48dbfb', '#1dd1a1', '#feca57'],
}) => {
  const mouse = useRef({ x: 0, y: 0 });
  const growth = useRef(0);

  const render = (ctx, width, height) => {
    growth.current += growthSpeed;
    const drawBranch = (x, y, length, angle, depth) => {
      if (depth === 0) return;
      const x2 = x + length * Math.cos(angle);
      const y2 = y + length * Math.sin(angle);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = seasonColors[depth % seasonColors.length];
      ctx.lineWidth = depth;
      ctx.stroke();
      if (growth.current > depth) {
        drawBranch(x2, y2, length * 0.8, angle + branchAngle, depth - 1);
        drawBranch(x2, y2, length * 0.8, angle - branchAngle, depth - 1);
      }
    };

    drawBranch(width / 2, height, 100, -Math.PI / 2, recursionDepth);
    if (mousePollination) {
      const dx = mouse.current.x - width / 2;
      const dy = mouse.current.y - height;
      if (Math.sqrt(dx * dx + dy * dy) < 50) {
        drawBranch(mouse.current.x, mouse.current.y, 50, -Math.PI / 2, recursionDepth - 2);
      }
    }
  };

  const onMouseMove = (e) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
  };

  return <BackgroundCanvas render={render} onMouseMove={onMouseMove} />;
};

// 7. Cyberpunk Data Rain
const DataRainBackground = ({
  density = 0.08,
  speedVariance = 1.8,
  charSet = ['01', 'あ', 'ｱ', 'Æ', 'Ψ'],
  highlightChars = true,
  neonStreaks = 3,
  mouseInteraction = 'deflect',
}) => {
  const characters = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });

  class Character {
    constructor(x) {
      this.x = x;
      this.y = Math.random() * window.innerHeight;
      this.char = charSet[Math.floor(Math.random() * charSet.length)];
      this.speed = Math.random() * speedVariance + 1;
    }

    update() {
      this.y += this.speed;
      if (this.y > window.innerHeight) this.y = -20;
    }

    draw(ctx) {
      ctx.font = '20px monospace';
      const dx = this.x - mouse.current.x;
      const dy = this.y - mouse.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      ctx.fillStyle = dist < 50 && highlightChars ? '#00ff00' : '#006600';
      ctx.fillText(this.char, this.x, this.y);
    }
  }

  useEffect(() => {
    const numColumns = Math.ceil(window.innerWidth * density);
    characters.current = Array.from({ length: numColumns }, (_, i) => new Character(i / density));
  }, [density]);

  const render = (ctx, width, height) => {
    characters.current.forEach(c => {
      c.update();
      c.draw(ctx);
      if (mouseInteraction === 'deflect') {
        const dx = c.x - mouse.current.x;
        const dy = c.y - mouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 50) c.x += (dx / dist) * 2;
      }
    });
    for (let i = 0; i < neonStreaks; i++) {
      ctx.beginPath();
      ctx.moveTo(mouse.current.x, mouse.current.y - i * 10);
      ctx.lineTo(mouse.current.x + (Math.random() - 0.5) * 20, mouse.current.y - (i + 1) * 10);
      ctx.strokeStyle = '#00ff00';
      ctx.stroke();
    }
  };

  const onMouseMove = (e) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
  };

  return <BackgroundCanvas render={render} onMouseMove={onMouseMove} />;
};

// 8. Astral Portal
const AstralPortalBackground = ({
  portalCount = 3,
  starDensity = 0.3,
  warpEffect = true,
  mouseGravity = 0.7,
  chromaticAberration = 0.5,
  eventHorizonGlow = true,
}) => {
  const portals = useRef([]);
  const mouse = useRef({ x: 0, y: 0 });

  class Portal {
    constructor() {
      this.x = Math.random() * window.innerWidth;
      this.y = Math.random() * window.innerHeight;
      this.radius = 50 + Math.random() * 100;
    }

    draw(ctx) {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.radius);
      gradient.addColorStop(0, 'rgba(255,255,255,0.1)');
      gradient.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
      if (eventHorizonGlow) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  }

  useEffect(() => {
    portals.current = Array.from({ length: portalCount }, () => new Portal());
  }, [portalCount]);

  const render = (ctx, width, height) => {
    for (let i = 0; i < starDensity * width * height / 100; i++) {
      const x = Math.random() * width;
      const y = Math.random() * height;
      const dx = x - mouse.current.x;
      const dy = y - mouse.current.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const warp = warpEffect && dist < 100 ? (1 - dist / 100) * mouseGravity : 0;
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(x + dx * warp, y + dy * warp, 1, 1);
    }
    portals.current.forEach(p => p.draw(ctx));
  };

  const onMouseMove = (e) => {
    mouse.current.x = e.clientX;
    mouse.current.y = e.clientY;
  };

  return <BackgroundCanvas render={render} onMouseMove={onMouseMove} />;
};

// Export all components
export {
  QuantumWebBackground,
  NeuralPulseBackground,
  HoloGridBackground,
  PlasmaVortexBackground,
  GlyphStormBackground,
  FractalBloomBackground,
  DataRainBackground,
  AstralPortalBackground,
};