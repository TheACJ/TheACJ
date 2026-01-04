import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useContent } from '../hooks/useContent';
import '../assets/style.css';

// --- Configuration ---
const ANIMATION_DURATION_MS = 2000; // Total time for counter animation
const FRAME_RATE = 60;

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30, scale: 0.9 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 12 }
  }
};

// --- Helper: Format number with commas ---
const formatNumber = (num: number): string => {
  return num.toLocaleString('en-US');
};

// --- Helper: Parse numeric value from string like "50+" or "1,250" ---
const parseValue = (value: string): { target: number; suffix: string } => {
  const numericPart = parseInt(value.replace(/[^0-9]/g, ''), 10) || 0;
  const suffix = value.replace(/[0-9,]/g, '').trim(); // Extracts '+', '%', etc.
  return { target: numericPart, suffix };
};

// --- Sub-components ---

const SkeletonLoader = () => (
  <section className="relative h-[450px] overflow-hidden bg-gradient-to-r from-gray-800 to-gray-900">
    <div className="absolute inset-0 bg-black/50" />
    <div className="relative h-full max-w-6xl mx-auto px-4 flex items-center justify-center">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 w-full">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex flex-col items-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-white/10 animate-pulse" />
            <div className="h-8 w-24 bg-white/10 rounded animate-pulse" />
            <div className="h-4 w-20 bg-white/10 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

const EmptyState = () => (
  <section className="relative h-[450px] overflow-hidden bg-gradient-to-r from-primary to-secondary">
    <div className="absolute inset-0 bg-black/60" />
    <div className="relative h-full flex items-center justify-center text-white text-center">
      <div>
        <span className="text-6xl mb-4 block">📊</span>
        <h2 className="text-2xl font-bold">Counter Data Unavailable</h2>
      </div>
    </div>
  </section>
);

// --- Individual Counter Item Component ---
interface CounterItemProps {
  icon: string;
  title: string;
  value: string;
  index: number;
  inView: boolean;
  reducedMotion: boolean;
}

const CounterItem = ({ icon, title, value, index, inView, reducedMotion }: CounterItemProps) => {
  const [displayValue, setDisplayValue] = useState(0);
  const { target, suffix } = useMemo(() => parseValue(value), [value]);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (!inView) return;

    if (reducedMotion) {
      setDisplayValue(target);
      return;
    }

    const totalFrames = (ANIMATION_DURATION_MS / 1000) * FRAME_RATE;
    let frame = 0;

    const animate = () => {
      frame++;
      // Ease-out cubic for a satisfying deceleration
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
      setDisplayValue(Math.floor(progress * target));

      if (frame < totalFrames) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setDisplayValue(target); // Ensure final value is exact
      }
    };
    
    // Stagger start based on index
    const delay = setTimeout(() => {
      frameRef.current = requestAnimationFrame(animate);
    }, index * 150);

    return () => {
      clearTimeout(delay);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [inView, target, index, reducedMotion]);

  const progress = target > 0 ? (displayValue / target) * 100 : 0;
  const isEven = index % 2 === 0;

  return (
    <motion.div
      variants={itemVariants}
      className="relative flex flex-col items-center text-center group p-4"
    >
      {/* Icon with Progress Ring */}
      <div className="relative w-24 h-24 mb-4">
        {/* Background Ring */}
        <svg className="absolute inset-0 w-full h-full -rotate-90">
          <circle
            cx="48" cy="48" r="44"
            className="fill-none stroke-white/10"
            strokeWidth="4"
          />
          {/* Animated Progress Ring */}
          <motion.circle
            cx="48" cy="48" r="44"
            className={`fill-none ${isEven ? 'stroke-primary' : 'stroke-yellow-400'}`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 44}
            initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
            animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - progress / 100) }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </svg>
        {/* Icon Container */}
        <div className={`
          absolute inset-2 rounded-full flex items-center justify-center 
          bg-white/5 backdrop-blur-sm border border-white/10
          group-hover:scale-110 group-hover:bg-white/10 transition-all duration-300
        `}>
          <i className={`${icon} text-3xl ${isEven ? 'text-primary' : 'text-yellow-400'}`} aria-hidden="true"></i>
        </div>
      </div>

      {/* Counting Number */}
      <div className="flex items-baseline justify-center">
        <span className="text-5xl md:text-6xl font-bold text-white tracking-tight">
          {formatNumber(displayValue)}
        </span>
        {suffix && (
          <span className={`text-3xl font-bold ml-1 ${isEven ? 'text-primary' : 'text-yellow-400'}`}>
            {suffix}
          </span>
        )}
      </div>

      {/* Title */}
      <span className="text-base text-white/70 uppercase tracking-[0.15em] mt-3 font-medium">
        {title}
      </span>
    </motion.div>
  );
};


// --- Main Counter Component ---
const Counter = () => {
  const { content, loading } = useContent();
  const prefersReducedMotion = useReducedMotion() ?? false;
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoLoaded, setVideoLoaded] = useState(false);

  const { ref, inView } = useInView({
    threshold: 0.3,
    triggerOnce: true
  });

  const counters = content?.counter || [];

  // Handle video load state
  const handleVideoLoad = useCallback(() => setVideoLoaded(true), []);

  // Pause video when not in view for performance
  useEffect(() => {
    if (videoRef.current) {
      inView ? videoRef.current.play() : videoRef.current.pause();
    }
  }, [inView]);

  if (loading && counters.length === 0) return <SkeletonLoader />;
  if (counters.length === 0) return <EmptyState />;

  return (
    <section 
      ref={ref} 
      className="relative min-h-[450px] md:h-[500px] overflow-hidden flex items-center"
      aria-label="Achievements and Statistics"
    >
      {/* Fallback Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-primary/30 to-gray-900 z-0" />

      {/* Background Video */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        onCanPlay={handleVideoLoad}
        className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-1000 ${videoLoaded ? 'opacity-100' : 'opacity-0'}`}
      >
        <source
          src="https://static.videezy.com/system/resources/previews/000/056/476/original/Glowy-things-2-.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/70 z-20" />
      
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-primary to-transparent z-30" />
      <div className="absolute bottom-0 right-0 w-1/3 h-px bg-gradient-to-r from-transparent via-yellow-400 to-transparent z-30" />

      {/* Content */}
      <div className="relative z-30 w-full max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
          className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8"
        >
          {counters.map((counter, index) => (
            <CounterItem
              key={counter._id || index}
              icon={counter.icon}
              title={counter.title}
              value={counter.value}
              index={index}
              inView={inView}
              reducedMotion={prefersReducedMotion}
            />
          ))}
        </motion.div>
      </div>

      {/* Screen Reader Live Region */}
      <div aria-live="polite" className="sr-only">
        {inView && counters.map(c => `${c.title}: ${c.value}`).join('. ')}
      </div>
    </section>
  );
};

export default Counter;