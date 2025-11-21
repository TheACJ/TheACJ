import React, { useEffect, useRef, useState, useCallback } from 'react';

interface NeuralPulseBackgroundProps {
  layers?: number;
  nodesPerLayer?: number;
  activationColor?: string;
  idleColor?: string;
  connectionColor?: string;
  pulseSpeed?: number;
  responseCurve?: 'sigmoid' | 'linear' | 'relu' | 'tanh' | 'exponential';
  groups?: number;
  groupSpread?: number;
  movementSpeed?: number;
  autoActivation?: boolean;
  particleTrails?: boolean;
  networkDensity?: number;
  glowIntensity?: number;
  className?: string;
  showStats?: boolean;
  trailOpacity?: number;
  interactionEnabled?: boolean;
  blendMode?: 'normal' | 'screen' | 'overlay' | 'lighten' | 'darken';
  zIndex?: number;
}

interface Neuron {
  id: string;
  group: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  radius: number;
  charge: number;
  maxCharge: number;
  threshold: number;
  firing: boolean;
  lastFired: number;
  recovery: number;
  color: string;
  connections: Connection[];
  activationCount: number;
  type: 'input' | 'output' | 'hidden';
  layer: number;
  node: number;
  groupCenter: { x: number; y: number };
  resonancePhase: number;
  energyLevel: number;
  lastActivation: number;
}

interface Connection {
  id: string;
  source: Neuron;
  target: Neuron;
  strength: number;
  signalProgress: number;
  signalActive: boolean;
  signalCharge: number;
  activationCount: number;
  delay: number;
  plasticity: number;
  lastUsed: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
  alpha: number;
}

const NeuralPulseBackground: React.FC<NeuralPulseBackgroundProps> = ({
  layers = 6,
  nodesPerLayer = 15,
  activationColor = '#00ffff',
  idleColor = '#2a2a2a',
  connectionColor = '#444444',
  pulseSpeed = 0.025,
  responseCurve = 'sigmoid',
  groups = 2,
  groupSpread = 180,
  movementSpeed = 0.8,
  autoActivation = true,
  particleTrails = true,
  networkDensity = 0.4,
  glowIntensity = 1.2,
  className = '',
  showStats = false,
  trailOpacity = 0.03,
  interactionEnabled = true,
  blendMode = 'screen',
  zIndex = 0
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number | null>(null);
  const neuronsRef = useRef<Neuron[]>([]);
  const connectionsRef = useRef<Connection[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ 
    x: null as number | null, 
    y: null as number | null, 
    radius: 250,
    intensity: 1.0
  });
  const timeRef = useRef(0);
  const [stats, setStats] = useState({ 
    neurons: 0, 
    connections: 0, 
    firing: 0,
    mode: 'PASSIVE',
    groups: groups,
    avgActivity: 0,
    networkHealth: 100
  });

  // Enhanced response curve functions with more variety
  const responseCurves = {
    sigmoid: (x: number) => 1 / (1 + Math.exp(-12 * (x - 0.5))),
    linear: (x: number) => Math.max(0, Math.min(1, x)),
    relu: (x: number) => Math.max(0, x * 1.2),
    tanh: (x: number) => (Math.tanh(x * 4) + 1) / 2,
    exponential: (x: number) => Math.pow(x, 2.5)
  };

  // Utility function for smooth color interpolation
  const interpolateColor = useCallback((color1: string, color2: string, factor: number) => {
    const hex1 = color1.replace('#', '');
    const hex2 = color2.replace('#', '');
    
    const r1 = parseInt(hex1.substr(0, 2), 16);
    const g1 = parseInt(hex1.substr(2, 2), 16);
    const b1 = parseInt(hex1.substr(4, 2), 16);
    
    const r2 = parseInt(hex2.substr(0, 2), 16);
    const g2 = parseInt(hex2.substr(2, 2), 16);
    const b2 = parseInt(hex2.substr(4, 2), 16);
    
    const r = Math.round(r1 + (r2 - r1) * factor);
    const g = Math.round(g1 + (g2 - g1) * factor);
    const b = Math.round(b1 + (b2 - b1) * factor);
    
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }, []);

  // Create particle effects
  const createParticle = useCallback((x: number, y: number, color: string, intensity = 1) => {
    if (!particleTrails) return;
    
    for (let i = 0; i < 3 * intensity; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      
      particlesRef.current.push({
        x: x + (Math.random() - 0.5) * 10,
        y: y + (Math.random() - 0.5) * 10,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 60,
        maxLife: 60,
        size: Math.random() * 3 + 1,
        color,
        alpha: 0.8
      });
    }
  }, [particleTrails]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let width = window.innerWidth;
    let height = window.innerHeight;
    
    // Set canvas dimensions with high DPI support
    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      width = window.innerWidth;
      height = window.innerHeight;
      
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      
      ctx.scale(dpr, dpr);
    };
    
    setCanvasSize();
    
    // Handle window resize
    const handleResize = () => {
      setCanvasSize();
      initNeurons();
    };
    
    window.addEventListener('resize', handleResize);
    
    // Initialize enhanced neural network
    const initNeurons = () => {
      neuronsRef.current = [];
      connectionsRef.current = [];
      particlesRef.current = [];
      
      const totalNeurons = groups * layers * nodesPerLayer;
      
      // Create group centers with better distribution
      const groupCenters = [];
      for (let g = 0; g < groups; g++) {
        const angle = (g / groups) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.25;
        const centerX = width / 2 + Math.cos(angle) * radius;
        const centerY = height / 2 + Math.sin(angle) * radius;
        
        groupCenters.push({
          x: centerX + (Math.random() - 0.5) * 100,
          y: centerY + (Math.random() - 0.5) * 100
        });
      }
      
      // Create neurons with enhanced properties
      for (let group = 0; group < groups; group++) {
        const groupCenter = groupCenters[group];
        
        for (let layer = 0; layer < layers; layer++) {
          for (let node = 0; node < nodesPerLayer; node++) {
            const isInputLayer = layer === 0;
            const isOutputLayer = layer === layers - 1;
            const isHiddenLayer = !isInputLayer && !isOutputLayer;
            
            // Enhanced positioning with organic distribution
            const layerAngle = (layer / (layers - 1)) * Math.PI;
            const nodeAngle = ((node / nodesPerLayer) * Math.PI * 2) + (group * 0.3);
            
            const layerRadius = groupSpread * 0.8;
            const nodeRadius = (Math.sin(layerAngle) * layerRadius) + (Math.random() - 0.5) * 40;
            
            const x = groupCenter.x + Math.cos(nodeAngle) * nodeRadius;
            const y = groupCenter.y + Math.sin(nodeAngle) * nodeRadius + (layer - layers/2) * (groupSpread * 0.3);
            
            const neuron: Neuron = {
              id: `${group}-${layer}-${node}`,
              group,
              x,
              y,
              vx: (Math.random() - 0.5) * movementSpeed,
              vy: (Math.random() - 0.5) * movementSpeed,
              baseX: x,
              baseY: y,
              radius: isInputLayer ? 6 : isOutputLayer ? 8 : Math.random() * 2 + 4,
              charge: 0,
              maxCharge: 1,
              threshold: isInputLayer ? 0.4 : isHiddenLayer ? 0.6 : 0.5,
              firing: false,
              lastFired: 0,
              recovery: 0,
              color: idleColor,
              connections: [],
              activationCount: 0,
              type: isInputLayer ? 'input' : isOutputLayer ? 'output' : 'hidden',
              layer,
              node,
              groupCenter,
              resonancePhase: Math.random() * Math.PI * 2,
              energyLevel: Math.random() * 0.3,
              lastActivation: 0
            };
            
            neuronsRef.current.push(neuron);
          }
        }
      }
      
      // Create enhanced connections with plasticity
      for (let group = 0; group < groups; group++) {
        // Layer-to-layer connections
        for (let layer = 0; layer < layers - 1; layer++) {
          for (let srcNode = 0; srcNode < nodesPerLayer; srcNode++) {
            const source = neuronsRef.current.find(
              (n) => n.group === group && n.layer === layer && n.node === srcNode
            );
            
            for (let tgtNode = 0; tgtNode < nodesPerLayer; tgtNode++) {
              if (Math.random() > networkDensity) continue;
              
              const target = neuronsRef.current.find(
                (n) => n.group === group && n.layer === layer + 1 && n.node === tgtNode
              );
              
              if (source && target) {
                const connection: Connection = {
                  id: `${source.id}-${target.id}`,
                  source,
                  target,
                  strength: Math.random() * 0.6 + 0.3,
                  signalProgress: 0,
                  signalActive: false,
                  signalCharge: 0,
                  activationCount: 0,
                  delay: Math.floor(Math.random() * 8) + 3,
                  plasticity: Math.random() * 0.1 + 0.05,
                  lastUsed: 0
                };
                
                connectionsRef.current.push(connection);
                source.connections.push(connection);
              }
            }
          }
        }
        
        // Skip connections within layers
        for (let layer = 0; layer < layers; layer++) {
          for (let i = 0; i < nodesPerLayer * 0.3; i++) {
            const sourceIdx = Math.floor(Math.random() * nodesPerLayer);
            const targetIdx = Math.floor(Math.random() * nodesPerLayer);
            
            if (sourceIdx === targetIdx) continue;
            
            const source = neuronsRef.current.find(
              (n) => n.group === group && n.layer === layer && n.node === sourceIdx
            );
            const target = neuronsRef.current.find(
              (n) => n.group === group && n.layer === layer && n.node === targetIdx
            );
            
            if (source && target && Math.random() < 0.4) {
              const connection: Connection = {
                id: `${source.id}-${target.id}`,
                source,
                target,
                strength: Math.random() * 0.4 + 0.2,
                signalProgress: 0,
                signalActive: false,
                signalCharge: 0,
                activationCount: 0,
                delay: Math.floor(Math.random() * 12) + 8,
                plasticity: Math.random() * 0.05 + 0.02,
                lastUsed: 0
              };
              
              connectionsRef.current.push(connection);
              source.connections.push(connection);
            }
          }
        }
      }
      
      // Inter-group connections for complex behavior
      for (let i = 0; i < totalNeurons * 0.1; i++) {
        const source = neuronsRef.current[Math.floor(Math.random() * neuronsRef.current.length)];
        const targetGroup = (source.group + 1) % groups;
        const targetsInGroup = neuronsRef.current.filter(n => n.group === targetGroup);
        const target = targetsInGroup[Math.floor(Math.random() * targetsInGroup.length)];
        
        if (source && target && Math.abs(source.layer - target.layer) <= 2) {
          const connection: Connection = {
            id: `${source.id}-${target.id}`,
            source,
            target,
            strength: Math.random() * 0.3 + 0.1,
            signalProgress: 0,
            signalActive: false,
            signalCharge: 0,
            activationCount: 0,
            delay: Math.floor(Math.random() * 15) + 10,
            plasticity: Math.random() * 0.08 + 0.03,
            lastUsed: 0
          };
          
          connectionsRef.current.push(connection);
          source.connections.push(connection);
        }
      }
      
      setStats({
        neurons: totalNeurons,
        connections: connectionsRef.current.length,
        firing: 0,
        mode: 'PASSIVE',
        groups,
        avgActivity: 0,
        networkHealth: 100
      });
    };
    
    // Enhanced mouse interaction
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactionEnabled) return;
      mouseRef.current.x = e.clientX;
      mouseRef.current.y = e.clientY;
      mouseRef.current.intensity = Math.min(2.0, mouseRef.current.intensity + 0.1);
    };
    
    const handleMouseLeave = () => {
      if (!interactionEnabled) return;
      mouseRef.current.x = null;
      mouseRef.current.y = null;
      mouseRef.current.intensity = 1.0;
      setStats(prev => ({...prev, mode: 'PASSIVE'}));
    };
    
    if (interactionEnabled) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseleave', handleMouseLeave);
    }
    
    // Enhanced neuron updates with emergent behavior
    const updateNeurons = () => {
      const mouse = mouseRef.current;
      let firingCount = 0;
      let totalActivity = 0;
      timeRef.current += 0.016; // 60fps
      
      let mouseNearNeuron = false;
      
      neuronsRef.current.forEach((neuron, index) => {
        // Update resonance phase for organic movement
        neuron.resonancePhase += 0.02 + (neuron.energyLevel * 0.01);
        
        // Organic color transitions
        const baseColorIntensity = 0.3 + (neuron.energyLevel * 0.7);
        const resonanceOffset = Math.sin(neuron.resonancePhase) * 0.2;
        
        // Dynamic charge decay based on network activity
        const decayRate = 0.008 + (Math.sin(timeRef.current + index * 0.1) * 0.002);
        neuron.charge = Math.max(0, neuron.charge - decayRate);
        
        // Update recovery with exponential decay
        if (neuron.recovery > 0) {
          neuron.recovery = Math.max(0, neuron.recovery - 1.2);
        }
        
        // Enhanced mouse interaction with falloff
        if (mouse.x !== null && mouse.y !== null) {
          const dx = neuron.x - mouse.x;
          const dy = neuron.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < mouse.radius) {
            mouseNearNeuron = true;
            const force = Math.pow((mouse.radius - distance) / mouse.radius, 1.5);
            const curveFn = responseCurves[responseCurve];
            const chargeIncrease = curveFn(force) * pulseSpeed * mouse.intensity;
            
            neuron.charge = Math.min(1, neuron.charge + chargeIncrease);
            neuron.energyLevel = Math.min(1, neuron.energyLevel + chargeIncrease * 0.1);
          }
        }
        
        // Auto-activation for dynamic behavior
        if (autoActivation && Math.random() < 0.0008 + (neuron.energyLevel * 0.0005)) {
          neuron.charge = Math.min(1, neuron.charge + Math.random() * 0.3);
        }
        
        // Enhanced movement with resonance
        const resonanceX = Math.cos(neuron.resonancePhase) * 0.3;
        const resonanceY = Math.sin(neuron.resonancePhase * 0.7) * 0.2;
        
        neuron.vx += (Math.random() - 0.5) * 0.08 + resonanceX;
        neuron.vy += (Math.random() - 0.5) * 0.08 + resonanceY;
        
        // Stronger drift back to base position
        const driftX = (neuron.baseX - neuron.x) * 0.015;
        const driftY = (neuron.baseY - neuron.y) * 0.015;
        neuron.vx += driftX;
        neuron.vy += driftY;
        
        // Apply velocity with momentum
        neuron.x += neuron.vx;
        neuron.y += neuron.vy;
        
        // Enhanced damping
        neuron.vx *= 0.92;
        neuron.vy *= 0.92;
        
        // Group boundary constraints with smooth transitions
        const groupBoundary = groupSpread * 1.6;
        const dxGroup = neuron.x - neuron.groupCenter.x;
        const dyGroup = neuron.y - neuron.groupCenter.y;
        const distanceFromCenter = Math.sqrt(dxGroup * dxGroup + dyGroup * dyGroup);
        
        if (distanceFromCenter > groupBoundary) {
          const angle = Math.atan2(dyGroup, dxGroup);
          const targetX = neuron.groupCenter.x + Math.cos(angle) * groupBoundary * 0.85;
          const targetY = neuron.groupCenter.y + Math.sin(angle) * groupBoundary * 0.85;
          
          neuron.vx += (targetX - neuron.x) * 0.1;
          neuron.vy += (targetY - neuron.y) * 0.1;
        }
        
        // Enhanced firing logic with refractory period
        const dynamicThreshold = neuron.threshold + (Math.sin(timeRef.current * 2 + index) * 0.1);
        if (!neuron.firing && neuron.charge > dynamicThreshold && neuron.recovery <= 0) {
          neuron.firing = true;
          neuron.lastFired = 0;
          neuron.lastActivation = timeRef.current;
          neuron.activationCount++;
          firingCount++;
          
          // Create particle effects
          createParticle(neuron.x, neuron.y, activationColor, neuron.charge);
          
          // Send enhanced signals
          neuron.connections.forEach((connection) => {
            connection.signalActive = true;
            connection.signalProgress = 0;
            connection.signalCharge = neuron.charge * (0.8 + Math.random() * 0.4);
            connection.activationCount++;
            connection.lastUsed = timeRef.current;
          });
        }
        
        // Update firing state with dynamic duration
        if (neuron.firing) {
          neuron.lastFired++;
          const firingDuration = 12 + (neuron.charge * 8);
          
          if (neuron.lastFired > firingDuration) {
            neuron.firing = false;
            neuron.charge = Math.max(0, neuron.charge - 0.3);
            neuron.recovery = 20 + Math.random() * 15;
          }
        }
        
        // Update energy level with decay
        neuron.energyLevel = Math.max(0, neuron.energyLevel - 0.002);
        totalActivity += neuron.charge + (neuron.firing ? 0.5 : 0);
      });
      
      // Update stats with network health
      const avgActivity = totalActivity / neuronsRef.current.length;
      const networkHealth = Math.min(100, Math.max(0, 100 - (avgActivity > 0.8 ? (avgActivity - 0.8) * 500 : 0)));
      
      setStats(prev => ({
        ...prev,
        firing: firingCount,
        mode: mouseNearNeuron ? 'ACTIVE' : autoActivation ? 'AUTONOMOUS' : 'PASSIVE',
        avgActivity: Math.round(avgActivity * 100),
        networkHealth: Math.round(networkHealth)
      }));
    };
    
    // Enhanced connection updates with plasticity
    const updateConnections = () => {
      connectionsRef.current.forEach((connection) => {
        // Update active signals with variable speed
        if (connection.signalActive) {
          const speedMultiplier = 1 + (connection.strength * 0.5);
          connection.signalProgress += pulseSpeed * speedMultiplier;
          
          if (connection.signalProgress >= 1) {
            connection.signalActive = false;
            const chargeTransfer = connection.signalCharge * connection.strength * 0.9;
            connection.target.charge = Math.min(1, connection.target.charge + chargeTransfer);
            
            // Create particle effect at target
            if (particleTrails && chargeTransfer > 0.3) {
              createParticle(connection.target.x, connection.target.y, activationColor, chargeTransfer);
            }
          }
        }
        
        // Enhanced plasticity - strengthen frequently used connections
        const timeSinceLastUse = timeRef.current - connection.lastUsed;
        if (connection.activationCount > 8 && timeSinceLastUse < 100) {
          connection.strength = Math.min(1, connection.strength + connection.plasticity);
          connection.activationCount = 0;
        }
        
        // Weaken unused connections (synaptic pruning)
        if (timeSinceLastUse > 500) {
          connection.strength = Math.max(0.1, connection.strength - connection.plasticity * 0.1);
        }
        
        // Dynamic connection forces based on activity
        const activityForce = connection.strength * 0.008 * (1 + connection.activationCount * 0.01);
        const dx = connection.target.x - connection.source.x;
        const dy = connection.target.y - connection.source.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 15 && distance < 300) {
          const directionX = dx / distance;
          const directionY = dy / distance;
          
          connection.source.vx += directionX * activityForce;
          connection.source.vy += directionY * activityForce;
          connection.target.vx -= directionX * activityForce * 0.5;
          connection.target.vy -= directionY * activityForce * 0.5;
        }
      });
    };
    
    // Update particle system
    const updateParticles = () => {
      if (!particleTrails) return;
      
      particlesRef.current = particlesRef.current.filter(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vx *= 0.98;
        particle.vy *= 0.98;
        particle.life--;
        particle.alpha = particle.life / particle.maxLife;
        particle.size *= 0.99;
        
        return particle.life > 0 && particle.size > 0.1;
      });
    };
    
    // Enhanced rendering with improved effects
    const render = () => {
      // Clear with subtle trail effect
      ctx.fillStyle = `rgba(0, 0, 0, ${trailOpacity})`;
      ctx.fillRect(0, 0, width, height);
      
      // Draw ambient group fields
      neuronsRef.current.forEach((neuron, index) => {
        if (index % (nodesPerLayer * layers) === 0) { // One per group
          const groupActivity = neuronsRef.current
            .filter(n => n.group === neuron.group)
            .reduce((sum, n) => sum + n.energyLevel, 0) / (layers * nodesPerLayer);
          
          if (groupActivity > 0.1) {
            const fieldRadius = groupSpread * 1.8 * (0.3 + groupActivity);
            const gradient = ctx.createRadialGradient(
              neuron.groupCenter.x, neuron.groupCenter.y, 0,
              neuron.groupCenter.x, neuron.groupCenter.y, fieldRadius
            );
            
            gradient.addColorStop(0, `${activationColor}${Math.floor(groupActivity * 20).toString(16).padStart(2, '0')}`);
            gradient.addColorStop(0.6, `${activationColor}05`);
            gradient.addColorStop(1, `${activationColor}00`);
            
            ctx.beginPath();
            ctx.arc(neuron.groupCenter.x, neuron.groupCenter.y, fieldRadius, 0, Math.PI * 2);
            ctx.fillStyle = gradient;
            ctx.fill();
          }
        }
      });
      
      // Draw enhanced connections
      connectionsRef.current.forEach((connection) => {
        const opacity = Math.max(0.02, connection.strength * 0.15);
        
        if (connection.signalActive) {
          // Animated signal
          const progress = connection.signalProgress;
          const signalX = connection.source.x + (connection.target.x - connection.source.x) * progress;
          const signalY = connection.source.y + (connection.target.y - connection.source.y) * progress;
          
          // Connection line with glow
          ctx.beginPath();
          ctx.moveTo(connection.source.x, connection.source.y);
          ctx.lineTo(connection.target.x, connection.target.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 2})`;
          ctx.lineWidth = connection.strength * 2;
          ctx.stroke();
          
          // Signal pulse
          const pulseSize = 2 + (connection.signalCharge * 4);
          const gradient = ctx.createRadialGradient(
            signalX, signalY, 0,
            signalX, signalY, pulseSize * 3
          );
          
          gradient.addColorStop(0, `${activationColor}ff`);
          gradient.addColorStop(0.4, `${activationColor}aa`);
          gradient.addColorStop(1, `${activationColor}00`);
          
          ctx.beginPath();
          ctx.arc(signalX, signalY, pulseSize * 3, 0, Math.PI * 2);
          ctx.fillStyle = gradient;
          ctx.fill();
          
          // Core signal
          ctx.beginPath();
          ctx.arc(signalX, signalY, pulseSize, 0, Math.PI * 2);
          ctx.fillStyle = activationColor;
          ctx.fill();
        } else {
          // Inactive connection with dynamic opacity
          const baseOpacity = Math.min(opacity, 0.08);
          ctx.beginPath();
          ctx.moveTo(connection.source.x, connection.source.y);
          ctx.lineTo(connection.target.x, connection.target.y);
          ctx.strokeStyle = `${connectionColor}${Math.floor(baseOpacity * 255).toString(16).padStart(2, '0')}`;
          ctx.lineWidth = Math.max(0.3, connection.strength * 1.2);
          ctx.stroke();
        }
      });
      
      // Draw particles
      if (particleTrails) {
        particlesRef.current.forEach(particle => {
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
          ctx.fillStyle = `${particle.color}${Math.floor(particle.alpha * 255).toString(16).padStart(2, '0')}`;
          ctx.fill();
        });
      }
      
      // Draw enhanced neurons
      neuronsRef.current.forEach((neuron) => {
        const chargeLevel = neuron.charge;
        const energyGlow = neuron.energyLevel * glowIntensity;
        
        // Dynamic size based on activity
        const dynamicRadius = neuron.radius * (1 + chargeLevel * 0.3 + energyGlow * 0.2);
        
        // Outer glow for active neurons
        if (neuron.firing || energyGlow > 0.1) {
          const glowRadius = dynamicRadius * (2 + Math.sin(timeRef.current * 8) * 0.3);
          const glowGradient = ctx.createRadialGradient(
            neuron.x, neuron.y, dynamicRadius * 0.5,
            neuron.x, neuron.y, glowRadius * glowIntensity
          );
          
          const glowAlpha = Math.floor((neuron.firing ? 0.8 : energyGlow) * 255).toString(16).padStart(2, '0');
          glowGradient.addColorStop(0, `${activationColor}${glowAlpha}`);
          glowGradient.addColorStop(0.3, `${activationColor}${Math.floor(parseInt(glowAlpha, 16) * 0.6).toString(16).padStart(2, '0')}`);
          glowGradient.addColorStop(1, `${activationColor}00`);
          
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, glowRadius * glowIntensity, 0, Math.PI * 2);
          ctx.fillStyle = glowGradient;
          ctx.fill();
        }
        
        // Main neuron body with charge visualization
        const bodyGradient = ctx.createRadialGradient(
          neuron.x - dynamicRadius * 0.3, neuron.y - dynamicRadius * 0.3, 0,
          neuron.x, neuron.y, dynamicRadius * 1.2
        );
        
        if (neuron.firing) {
          bodyGradient.addColorStop(0, activationColor);
          bodyGradient.addColorStop(0.4, interpolateColor(activationColor, idleColor, 0.3));
          bodyGradient.addColorStop(1, `${idleColor}80`);
        } else {
          const chargeColor = chargeLevel > 0.1 ? interpolateColor(idleColor, activationColor, chargeLevel) : idleColor;
          bodyGradient.addColorStop(0, chargeColor);
          bodyGradient.addColorStop(0.6, interpolateColor(chargeColor, idleColor, 0.5));
          bodyGradient.addColorStop(1, `${idleColor}60`);
        }
        
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, dynamicRadius, 0, Math.PI * 2);
        ctx.fillStyle = bodyGradient;
        ctx.fill();
        
        // Charge level indicator
        if (chargeLevel > 0.2) {
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, dynamicRadius * chargeLevel * 0.8, 0, Math.PI * 2);
          ctx.fillStyle = neuron.firing ? '#ffffff' : `${activationColor}cc`;
          ctx.fill();
        }
        
        // Core nucleus
        const nucleusRadius = dynamicRadius * 0.35;
        const nucleusGradient = ctx.createRadialGradient(
          neuron.x, neuron.y, 0,
          neuron.x, neuron.y, nucleusRadius
        );
        
        if (neuron.firing) {
          nucleusGradient.addColorStop(0, '#ffffff');
          nucleusGradient.addColorStop(1, activationColor);
        } else {
          nucleusGradient.addColorStop(0, '#888888');
          nucleusGradient.addColorStop(1, '#444444');
        }
        
        ctx.beginPath();
        ctx.arc(neuron.x, neuron.y, nucleusRadius, 0, Math.PI * 2);
        ctx.fillStyle = nucleusGradient;
        ctx.fill();
        
        // Type indicator (subtle)
        if (neuron.type !== 'hidden') {
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, dynamicRadius + 2, 0, Math.PI * 2);
          ctx.strokeStyle = neuron.type === 'input' ? `${activationColor}40` : `${activationColor}60`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      });
      
      // Draw mouse influence area
      if (mouseRef.current.x !== null && mouseRef.current.y !== null && interactionEnabled) {
        const influenceGradient = ctx.createRadialGradient(
          mouseRef.current.x, mouseRef.current.y, 0,
          mouseRef.current.x, mouseRef.current.y, mouseRef.current.radius
        );
        
        influenceGradient.addColorStop(0, `${activationColor}20`);
        influenceGradient.addColorStop(0.7, `${activationColor}08`);
        influenceGradient.addColorStop(1, `${activationColor}00`);
        
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, mouseRef.current.radius, 0, Math.PI * 2);
        ctx.fillStyle = influenceGradient;
        ctx.fill();
        
        // Pulsing border
        ctx.beginPath();
        ctx.arc(mouseRef.current.x, mouseRef.current.y, mouseRef.current.radius * (0.9 + Math.sin(timeRef.current * 4) * 0.1), 0, Math.PI * 2);
        ctx.strokeStyle = `${activationColor}40`;
        ctx.setLineDash([8, 8]);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        ctx.setLineDash([]);
      }
      
      // Network statistics visualization (optional debug info)
      if (window.location.search.includes('debug')) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.font = '12px monospace';
        ctx.fillText(`Activity: ${stats.avgActivity}%`, 20, height - 60);
        ctx.fillText(`Health: ${stats.networkHealth}%`, 20, height - 40);
        ctx.fillText(`Time: ${timeRef.current.toFixed(1)}s`, 20, height - 20);
      }
    };
    
    // Main animation loop with performance optimization
    let lastTime = 0;
    const targetFPS = 60;
    const frameInterval = 1000 / targetFPS;
    
    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= frameInterval) {
        updateNeurons();
        updateConnections();
        updateParticles();
        render();
        lastTime = currentTime;
      }
      
      animationRef.current = requestAnimationFrame(animate);
    };
    
    // Initialize and start animation
    initNeurons();
    animationRef.current = requestAnimationFrame(animate);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (interactionEnabled) {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseleave', handleMouseLeave);
      }
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [
    layers, nodesPerLayer, activationColor, idleColor, connectionColor,
    pulseSpeed, responseCurve, groups, groupSpread, movementSpeed,
    autoActivation, particleTrails, networkDensity, glowIntensity,
    showStats, trailOpacity, interactionEnabled, blendMode, zIndex,
    interpolateColor, createParticle
  ]);
  
  return (
    <div 
      className={`fixed top-0 left-0 w-full h-full overflow-hidden pointer-events-none ${className}`}
      style={{ zIndex }}
    >
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
        style={{ 
          background: 'transparent',
          mixBlendMode: blendMode
        }}
      />
      
      {/* Enhanced Stats Panel */}
      {showStats && (
        <div className="absolute bottom-4 left-4 p-4 bg-black bg-opacity-30 backdrop-blur-sm rounded-lg text-xs text-white pointer-events-auto border border-gray-600">
          <div className="flex items-center gap-4 mb-3">
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full animate-pulse" 
                style={{ backgroundColor: idleColor }}
              ></div>
              <span className="text-gray-300">Idle</span>
            </div>
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full animate-pulse" 
                style={{ backgroundColor: activationColor }}
              ></div>
              <span className="text-gray-300">Active</span>
            </div>
            <div className={`px-2 py-1 rounded text-[10px] font-mono ${
              stats.mode === 'ACTIVE' ? 'bg-cyan-600' : 
              stats.mode === 'AUTONOMOUS' ? 'bg-blue-600' : 'bg-gray-600'
            }`}>
              {stats.mode}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] uppercase tracking-wide">Groups</span>
              <span className="text-white font-mono text-sm">{stats.groups}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] uppercase tracking-wide">Neurons</span>
              <span className="text-white font-mono text-sm">{stats.neurons}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] uppercase tracking-wide">Synapses</span>
              <span className="text-white font-mono text-sm">{stats.connections}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] uppercase tracking-wide">Firing</span>
              <span className="text-cyan-400 font-mono text-sm">{stats.firing}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] uppercase tracking-wide">Activity</span>
              <span className="text-green-400 font-mono text-sm">{stats.avgActivity}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-gray-400 text-[10px] uppercase tracking-wide">Health</span>
              <span className={`font-mono text-sm ${stats.networkHealth > 80 ? 'text-green-400' : stats.networkHealth > 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                {stats.networkHealth}%
              </span>
            </div>
          </div>
          
          <div className="mt-4 pt-3 border-t border-gray-600">
            <div className="text-gray-400 text-[9px] space-y-1">
              <p>
                <span className="text-gray-500">Curve:</span> 
                <span className="font-mono text-cyan-300 ml-1">{responseCurve}</span>
              </p>
              <p>
                <span className="text-gray-500">Density:</span> 
                <span className="font-mono text-blue-300 ml-1">{Math.round(networkDensity * 100)}%</span>
              </p>
              <p className="text-gray-500">
                {autoActivation ? 'Autonomous mode • ' : ''}
                {particleTrails ? 'Particle trails • ' : ''}
                {interactionEnabled ? 'Mouse interaction' : ''}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NeuralPulseBackground;