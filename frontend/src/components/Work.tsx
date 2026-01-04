import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Eye, ExternalLink, Grid, Layers, 
  Smartphone, FileCode, Globe, AlertTriangle, RefreshCw, Pause, Play
} from 'lucide-react';
import { workService, type WorkItem } from '../services/api_node';
import WorkModal from './WorkModal';
import toast from 'react-hot-toast';
import '../assets/style.css';

// --- Configuration ---
const SLIDE_INTERVAL = 5000;

const CATEGORY_ICONS: { [key: string]: React.ReactNode } = {
  'Web App': <Globe size={18} />,
  'Smart Contracts': <FileCode size={18} />,
  'Mobile App': <Smartphone size={18} />,
};

// --- Animation Variants ---
const cardVariants = {
  hidden: { opacity: 0, scale: 0.9, y: 20 },
  visible: { opacity: 1, scale: 1, y: 0, transition: { type: 'spring', stiffness: 100, damping: 15 } },
  exit: { opacity: 0, scale: 0.9, y: -20, transition: { duration: 0.2 } }
};

const gridContainerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

// --- Sub-components ---

const SkeletonLoader = () => (
  <section className="py-24 bg-white dark:bg-gray-900">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col items-center mb-12 space-y-3">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      </div>
      <div className="flex justify-center gap-4 mb-12">
        {[1, 2, 3].map(i => <div key={i} className="h-10 w-32 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />)}
      </div>
      <div className="max-w-3xl mx-auto">
        <div className="h-80 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />
      </div>
    </div>
  </section>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <section className="py-24 bg-white dark:bg-gray-900">
    <div className="max-w-md mx-auto px-4 text-center">
      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="mb-6">
        <AlertTriangle size={64} className="mx-auto text-amber-500" />
      </motion.div>
      <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">Oops! Something went wrong</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>
      <motion.button
        onClick={onRetry}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        <RefreshCw size={18} />
        <span>Try Again</span>
      </motion.button>
    </div>
  </section>
);

const EmptyState = ({ category }: { category: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-16 px-4"
  >
    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <Layers size={40} className="text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No Projects Yet</h3>
    <p className="text-gray-500 dark:text-gray-500">No work found in the "{category}" category.</p>
  </motion.div>
);

interface WorkCardProps {
  work: WorkItem;
  onClick: (id: number) => void;
  isCarousel?: boolean;
}

const WorkCard = ({ work, onClick, isCarousel = false }: WorkCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <motion.div
      variants={cardVariants}
      layout
      className={`group relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-700/50 ${isCarousel ? 'max-w-3xl mx-auto' : ''}`}
    >
      {/* Image Container */}
      <div
        className="relative h-64 md:h-72 cursor-pointer overflow-hidden"
        onClick={() => onClick(work.id)}
      >
        {/* Placeholder / Blur-up */}
        <div className={`absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 ${imageLoaded ? 'opacity-0' : 'opacity-100'} transition-opacity duration-500`} />
        
        {work.image && (
          <img
            src={work.image}
            alt={work.title}
            loading="lazy"
            onLoad={() => setImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-110 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
          />
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col items-center justify-end p-6">
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            whileHover={{ scale: 1.05 }}
            className="flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-bold rounded-xl shadow-2xl mb-4"
          >
            <Eye size={20} />
            <span>View Gallery</span>
          </motion.button>
        </div>
        
        {/* Category Badge */}
        <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/50 backdrop-blur-md text-white text-xs font-bold rounded-full flex items-center gap-1.5">
          {CATEGORY_ICONS[work.category] || <Layers size={14}/>}
          <span>{work.category}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary transition-colors">
          {work.title}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2 mb-4">
          {work.description}
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onClick(work.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 font-semibold rounded-lg hover:bg-primary hover:text-white transition-all duration-300"
          >
            <Eye size={16} />
            <span>Gallery</span>
          </button>
          {work.liveUrl && (
            <a
              href={work.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-lg hover:bg-primary hover:text-white transition-all"
              aria-label="View live site"
            >
              <ExternalLink size={18} />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
};


// --- Main Work Component ---
const Work = () => {
  const categories = ['Web App', 'Smart Contracts', 'Mobile App'];

  const [works, setWorks] = useState<WorkItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const [viewMode, setViewMode] = useState<'carousel' | 'grid'>('carousel');
  const [progress, setProgress] = useState(0);

  const sectionRef = useRef<HTMLElement>(null);
  const progressIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredWorks = useMemo(() => 
    works.filter(work => work.category === selectedCategory),
  [works, selectedCategory]);

  // --- Fetching Logic ---
  const fetchWorks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await workService.getWorkItems();
      setWorks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error('Error fetching works:', err);
      setError('Failed to load projects. Please check your connection.');
      setWorks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWorks();
  }, [fetchWorks]);

  // --- Carousel Navigation ---
  const goToNext = useCallback(() => {
    if (filteredWorks.length === 0) return;
    setCurrentSlide((prev) => (prev + 1) % filteredWorks.length);
    setProgress(0);
  }, [filteredWorks.length]);

  const goToPrev = useCallback(() => {
    if (filteredWorks.length === 0) return;
    setCurrentSlide((prev) => (prev - 1 + filteredWorks.length) % filteredWorks.length);
    setProgress(0);
  }, [filteredWorks.length]);

  // --- Auto-advance Timer ---
  useEffect(() => {
    if (viewMode !== 'carousel' || filteredWorks.length <= 1 || isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
      return;
    }

    const progressStep = 100 / (SLIDE_INTERVAL / 100);
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => Math.min(prev + progressStep, 100));
    }, 100);

    slideTimerRef.current = setTimeout(goToNext, SLIDE_INTERVAL);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      if (slideTimerRef.current) clearTimeout(slideTimerRef.current);
    };
  }, [viewMode, filteredWorks.length, currentSlide, isPaused, goToNext]);

  // --- Reset slide on category change ---
  useEffect(() => {
    setCurrentSlide(0);
    setProgress(0);
  }, [selectedCategory]);

  // --- Keyboard Navigation ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'carousel' || !sectionRef.current) return;
      const rect = sectionRef.current.getBoundingClientRect();
      if (rect.top > window.innerHeight || rect.bottom < 0) return;
      
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'ArrowLeft') goToPrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, goToNext, goToPrev]);

  // --- Modal Handlers ---
  const openWorkModal = useCallback((workId: number) => {
    setSelectedWorkId(workId);
  }, []);

  const closeWorkModal = useCallback(() => {
    setSelectedWorkId(null);
  }, []);

  // --- Render States ---
  if (loading) return <SkeletonLoader />;
  if (error) return <ErrorState message={error} onRetry={fetchWorks} />;

  const currentWork = filteredWorks[currentSlide];

  return (
    <section ref={sectionRef} id="work" className="py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <span className="text-sm font-bold text-primary tracking-[0.2em] uppercase block mb-3">Portfolio</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Recent Work</h2>
        </motion.div>

        {/* Controls: Categories + View Toggle */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12">
          {/* Category Tabs */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => {
              const count = works.filter(w => w.category === category).length;
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 border-2 ${
                    selectedCategory === category
                      ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary'
                  }`}
                >
                  {CATEGORY_ICONS[category]}
                  <span>{category}</span>
                  <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${selectedCategory === category ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
          
          {/* View Mode Toggle */}
          <div className="flex items-center gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button
              onClick={() => setViewMode('carousel')}
              aria-label="Carousel View"
              className={`p-2 rounded-md transition-all ${viewMode === 'carousel' ? 'bg-white dark:bg-gray-700 shadow-md text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Layers size={20} />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              aria-label="Grid View"
              className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white dark:bg-gray-700 shadow-md text-primary' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Grid size={20} />
            </button>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="relative min-h-[450px]">
          {filteredWorks.length === 0 ? (
            <EmptyState category={selectedCategory} />
          ) : viewMode === 'carousel' ? (
            /* --- Carousel View --- */
            <div 
              className="relative"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Progress Bar */}
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-full max-w-3xl h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden z-10">
                <motion.div
                  className="h-full bg-gradient-to-r from-primary to-secondary"
                  style={{ width: `${progress}%` }}
                  transition={{ duration: 0.1, ease: 'linear' }}
                />
              </div>

              {/* Navigation Arrows */}
              {filteredWorks.length > 1 && (
                <>
                  <motion.button
                    onClick={goToPrev}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute left-0 md:-left-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-primary transition-colors"
                    aria-label="Previous project"
                  >
                    <ChevronLeft size={24} />
                  </motion.button>
                  <motion.button
                    onClick={goToNext}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute right-0 md:-right-4 top-1/2 -translate-y-1/2 z-20 p-3 bg-white dark:bg-gray-800 rounded-full shadow-xl border border-gray-100 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:text-primary transition-colors"
                    aria-label="Next project"
                  >
                    <ChevronRight size={24} />
                  </motion.button>
                </>
              )}

              {/* Slide */}
              <AnimatePresence mode="wait">
                {currentWork && (
                  <motion.div
                    key={currentWork.id}
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ type: 'spring', stiffness: 100, damping: 20 }}
                  >
                    <WorkCard work={currentWork} onClick={openWorkModal} isCarousel />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Dots & Pause/Play */}
              {filteredWorks.length > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8">
                  <button 
                    onClick={() => setIsPaused(p => !p)} 
                    className="p-2 text-gray-500 hover:text-primary transition-colors"
                    aria-label={isPaused ? "Play slideshow" : "Pause slideshow"}
                  >
                    {isPaused ? <Play size={20}/> : <Pause size={20}/>}
                  </button>
                  <div className="flex gap-2">
                    {filteredWorks.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => { setCurrentSlide(index); setProgress(0); }}
                        className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                          currentSlide === index ? 'bg-primary w-6' : 'bg-gray-300 dark:bg-gray-600 hover:bg-primary/50'
                        }`}
                        aria-label={`Go to slide ${index + 1}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* --- Grid View --- */
            <motion.div
              variants={gridContainerVariants}
              initial="hidden"
              animate="visible"
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              {filteredWorks.map((work) => (
                <WorkCard key={work.id} work={work} onClick={openWorkModal} />
              ))}
            </motion.div>
          )}
        </div>
      </div>

      {/* Work Modal */}
      <AnimatePresence>
        {selectedWorkId !== null && (
          <WorkModal workId={selectedWorkId} onClose={closeWorkModal} />
        )}
      </AnimatePresence>
    </section>
  );
};

export default Work;