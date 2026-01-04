// The Flip - 3D rotation transition effect using MongoDB data

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, RefreshCw } from 'lucide-react';
import { useContent } from '../hooks/useContent';
import mycv from '../assets/JoshuaAgbai.pdf';
import "../assets/style.css";

// --- Configuration Constants ---
const SLIDE_DURATION = 5000;
const TRANSITION_DURATION = 0.8;
const SWIPE_THRESHOLD = 50;

// --- TypeScript Interfaces ---
interface Slide {
  bgImage: string;
  title: string;
  subtitle: string;
  description: string;
  buttonText?: string;
  buttonLink?: string;
  buttonIcon?: string;
}

// --- Animation Variants ---
const backgroundVariants = {
  enter: { rotateY: 90, opacity: 0 },
  center: { rotateY: 0, opacity: 1 },
  exit: { rotateY: -90, opacity: 0 }
};

const contentVariants = {
  enter: { rotateX: 90, opacity: 0, y: 50 },
  center: { rotateX: 0, opacity: 1, y: 0 },
  exit: { rotateX: -90, opacity: 0, y: -50 }
};

const textVariants = {
  hidden: { rotateX: 45, opacity: 0 },
  visible: (delay: number) => ({
    rotateX: 0,
    opacity: 1,
    transition: { delay, duration: 0.5 }
  })
};

// --- Sub-components ---
const LoadingState = () => (
  <section 
    id="home" 
    className="relative h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center"
    aria-label="Loading hero section"
  >
    <div className="flex flex-col items-center space-y-6">
      {/* Animated loader */}
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 border-4 border-white/10 rounded-full" />
        <div className="absolute inset-0 border-4 border-transparent border-t-primary border-r-secondary rounded-full animate-spin" />
        <div className="absolute inset-2 border-4 border-transparent border-b-primary rounded-full animate-spin animation-delay-150" style={{ animationDirection: 'reverse' }} />
      </div>
      <div className="text-center">
        <span className="text-white text-xl font-semibold animate-pulse">Loading</span>
        <span className="inline-flex ml-1">
          <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
          <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
        </span>
      </div>
    </div>
  </section>
);

const ErrorState = ({ onRetry }: { onRetry?: () => void }) => (
  <section 
    id="home" 
    className="relative h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center"
    aria-label="Error loading hero section"
  >
    <div className="text-center text-white p-8 max-w-md">
      <motion.div 
        className="mb-6 text-7xl"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
        transition={{ duration: 0.5 }}
      >
        ⚠️
      </motion.div>
      <h2 className="text-3xl font-bold mb-4">Oops! Something Went Wrong</h2>
      <p className="text-lg text-white/70 mb-8 leading-relaxed">
        We couldn't load the hero content. Please check your connection and try again.
      </p>
      {onRetry && (
        <motion.button
          onClick={onRetry}
          className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-primary to-secondary hover:opacity-90 rounded-lg font-semibold transition-all duration-300 shadow-lg shadow-primary/25"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RefreshCw size={20} />
          <span>Try Again</span>
        </motion.button>
      )}
    </div>
  </section>
);

const ProgressBar = ({ progress, isPaused }: { progress: number; isPaused: boolean }) => (
  <div className="absolute top-0 left-0 right-0 h-1 bg-white/10 z-20 overflow-hidden">
    <motion.div
      className="h-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%]"
      style={{ 
        width: `${progress}%`,
        animation: 'gradientMove 2s linear infinite'
      }}
      transition={{ duration: isPaused ? 0 : 0.1, ease: 'linear' }}
    />
  </div>
);

const NavigationArrows = ({ 
  onPrev, 
  onNext,
  show
}: { 
  onPrev: () => void; 
  onNext: () => void;
  show: boolean;
}) => (
  <AnimatePresence>
    {show && (
      <>
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          onClick={onPrev}
          aria-label="Previous slide"
          className="absolute left-4 lg:left-[320px] top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white border border-white/10 transition-all duration-300 hover:scale-110 hover:border-white/30"
        >
          <ChevronLeft size={28} />
        </motion.button>
        <motion.button
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.2 }}
          onClick={onNext}
          aria-label="Next slide"
          className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-black/40 hover:bg-black/60 backdrop-blur-md rounded-full text-white border border-white/10 transition-all duration-300 hover:scale-110 hover:border-white/30"
        >
          <ChevronRight size={28} />
        </motion.button>
      </>
    )}
  </AnimatePresence>
);

const NavigationDots = ({ 
  slides, 
  currentSlide, 
  onSlideSelect,
  isPaused,
  onTogglePause
}: { 
  slides: Slide[]; 
  currentSlide: number; 
  onSlideSelect: (index: number) => void;
  isPaused: boolean;
  onTogglePause: () => void;
}) => (
  <div className="absolute bottom-8 left-8 z-20">
    <div className="flex flex-col items-center space-y-4 bg-black/20 backdrop-blur-sm rounded-full p-2">
      {/* Pause/Play Button */}
      <motion.button
        onClick={onTogglePause}
        aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
        className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-all duration-300"
        whileHover={{ scale: 1.15 }}
        whileTap={{ scale: 0.9 }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={isPaused ? 'play' : 'pause'}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            transition={{ duration: 0.2 }}
          >
            {isPaused ? <Play size={16} /> : <Pause size={16} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      {/* Separator */}
      <div className="w-6 h-px bg-white/30" />

      {/* Dots */}
      <div className="flex flex-col space-y-3">
        {slides.map((_, index) => (
          <motion.button
            key={index}
            onClick={() => onSlideSelect(index)}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentSlide ? 'true' : 'false'}
            className="relative p-1 group"
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.8 }}
          >
            <span 
              className={`block w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide 
                  ? 'bg-white scale-125' 
                  : 'bg-white/40 group-hover:bg-white/70'
              }`}
            />
            {index === currentSlide && (
              <motion.span
                layoutId="activeDot"
                className="absolute inset-0 rounded-full border-2 border-white/50"
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              />
            )}
          </motion.button>
        ))}
      </div>
    </div>
  </div>
);

const SlideCounter = ({ current, total }: { current: number; total: number }) => (
  <motion.div 
    className="absolute bottom-8 right-8 z-20 flex items-baseline gap-1 text-white font-mono"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.5 }}
  >
    <span className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
      {String(current + 1).padStart(2, '0')}
    </span>
    <span className="text-white/50 text-lg">/</span>
    <span className="text-white/70 text-lg">{String(total).padStart(2, '0')}</span>
  </motion.div>
);

// --- Main Hero Component ---
const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  
  const { content, loading, refetch } = useContent();
  const prefersReducedMotion = useReducedMotion();
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const sectionRef = useRef<HTMLElement>(null);

  const slides: Slide[] = content?.hero?.slides || [];

  // --- Navigation Functions ---
  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
    setProgress(0);
  }, []);

  const goToNext = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
      setProgress(0);
    }
  }, [slides.length]);

  const goToPrev = useCallback(() => {
    if (slides.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
      setProgress(0);
    }
  }, [slides.length]);

  const togglePause = useCallback(() => {
    setIsPaused((prev) => !prev);
  }, []);

  // --- Keyboard Navigation ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle if Hero section is in view
      if (!sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      const isInView = rect.top < window.innerHeight && rect.bottom > 0;
      
      if (!isInView) return;

      switch (e.key) {
        case 'ArrowRight':
          goToNext();
          break;
        case 'ArrowLeft':
          goToPrev();
          break;
        case ' ':
          e.preventDefault();
          togglePause();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [goToNext, goToPrev, togglePause]);

  // --- Touch/Swipe Support ---
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    if (touchStart === null) return;
    
    const touchEnd = e.changedTouches[0].clientX;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > SWIPE_THRESHOLD) {
      diff > 0 ? goToNext() : goToPrev();
    }
    setTouchStart(null);
  }, [touchStart, goToNext, goToPrev]);

  // --- Auto-advance Timer ---
  useEffect(() => {
    const shouldPause = slides.length === 0 || isPaused || isHovering;
    
    if (shouldPause) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
      return;
    }

    // Progress bar update (100ms interval)
    const progressStep = 100 / (SLIDE_DURATION / 100);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + progressStep, 100));
    }, 100);

    // Slide advance timer
    slideTimerRef.current = setTimeout(goToNext, SLIDE_DURATION);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, [slides.length, currentSlide, isPaused, isHovering, goToNext]);

  // --- Image Preloading ---
  useEffect(() => {
    if (slides.length === 0) return;
    
    const preloadImages = () => {
      slides.forEach((slide) => {
        const img = new Image();
        img.src = slide.bgImage;
      });
    };
    
    preloadImages();
  }, [slides]);

  // --- Loading & Error States ---
  if (loading && slides.length === 0) {
    return <LoadingState />;
  }

  if (slides.length === 0) {
    return <ErrorState onRetry={refetch} />;
  }

  const currentSlideData = slides[currentSlide];

  const animationSettings = prefersReducedMotion 
    ? { duration: 0.01 } 
    : { type: "tween", duration: TRANSITION_DURATION, ease: "easeInOut" };

  return (
    <section 
      ref={sectionRef}
      id="home" 
      className="relative h-screen overflow-hidden dark:bg-gray-900 dark:text-[#b9b8b8]" 
      style={{ perspective: '1000px' }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      aria-roledescription="carousel"
      aria-label="Hero slideshow"
    >
      {/* Progress Bar */}
      <ProgressBar progress={progress} isPaused={isPaused || isHovering} />

      {/* Background Layer */}
      <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentSlide}
            variants={backgroundVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={animationSettings}
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <motion.div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${currentSlideData.bgImage})`,
                backfaceVisibility: 'hidden'
              }}
              animate={{ scale: isHovering ? 1.05 : 1 }}
              transition={{ duration: 8, ease: 'easeOut' }}
            >
              {/* Enhanced gradient overlays - reduced opacity to show interactive background */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/20 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/10" />
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows */}
      <NavigationArrows 
        onPrev={goToPrev} 
        onNext={goToNext} 
        show={isHovering}
      />

      {/* Content Layer */}
      <div className="relative h-full flex items-center justify-center lg:justify-start lg:pl-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentSlide}`}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ ...animationSettings, delay: 0.2 }}
            className="text-center lg:text-left p-8 max-w-3xl"
            style={{ transformStyle: 'preserve-3d' }}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${currentSlide + 1} of ${slides.length}`}
          >
            {/* Title */}
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
              custom={0.3}
            >
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-4 drop-shadow-2xl leading-tight">
                {currentSlideData.title}
                <br />
                <span className="relative inline-block">
                  <span className="bg-gradient-to-r from-primary via-yellow-400 to-secondary bg-clip-text text-transparent">
                    {currentSlideData.subtitle}
                  </span>
                  <motion.span 
                    className="absolute -bottom-2 left-0 h-1 bg-gradient-to-r from-primary to-secondary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ delay: 0.8, duration: 0.6 }}
                  />
                </span>
              </h1>
            </motion.div>

            {/* Description */}
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
              custom={0.4}
            >
              <p className="text-lg sm:text-xl md:text-2xl text-white/90 mb-10 drop-shadow-lg max-w-xl leading-relaxed">
                {currentSlideData.description}
              </p>
            </motion.div>

            {/* CTA Button */}
            <motion.div
              variants={textVariants}
              initial="hidden"
              animate="visible"
              custom={0.5}
            >
              <motion.button
                className="group relative inline-flex items-center gap-3 px-8 py-4 text-white font-bold text-lg rounded-xl overflow-hidden shadow-2xl shadow-primary/30"
                whileHover={{
                  scale: 1.05,
                  boxShadow: '0 25px 50px rgba(0,0,0,0.4)',
                }}
                whileTap={{ scale: 0.95 }}
                style={{ transformStyle: 'preserve-3d' }}
              >
                {/* Animated gradient background */}
                <span 
                  className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%]"
                  style={{ animation: 'gradientMove 3s linear infinite' }}
                />
                
                {/* Shine effect */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out" />
                
                {/* Border glow */}
                <span className="absolute inset-0 rounded-xl border-2 border-white/20 group-hover:border-white/40 transition-colors" />
                
                {/* Button content */}
                <span className="relative flex items-center gap-2">
                  {currentSlideData.buttonLink?.includes('.pdf') ? (
                    <a 
                      href={currentSlideData.buttonLink || mycv} 
                      download="TheACJ.pdf" 
                      className="flex items-center gap-2"
                    >
                      <span>{currentSlideData.buttonText || 'View CV'}</span>
                      <motion.span 
                        className="inline-block"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        →
                      </motion.span>
                    </a>
                  ) : (
                    <>
                      <span>{currentSlideData.buttonText || 'View Portfolio'}</span>
                      {currentSlideData.buttonIcon && (
                        <span className={currentSlideData.buttonIcon}></span>
                      )}
                      <motion.span 
                        className="inline-block"
                        animate={{ x: [0, 5, 0] }}
                        transition={{ repeat: Infinity, duration: 1.5 }}
                      >
                        →
                      </motion.span>
                    </>
                  )}
                </span>
              </motion.button>
            </motion.div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <NavigationDots
        slides={slides}
        currentSlide={currentSlide}
        onSlideSelect={goToSlide}
        isPaused={isPaused}
        onTogglePause={togglePause}
      />

      {/* Slide Counter */}
      <SlideCounter current={currentSlide} total={slides.length} />

      {/* Screen Reader Announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {`Slide ${currentSlide + 1} of ${slides.length}: ${currentSlideData.title}`}
      </div>
    </section>
  );
};

export default Hero;