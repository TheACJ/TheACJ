import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { WorkItem, workService } from '../services/api';
import useSWR from 'swr';
import LazyLoad from 'react-lazyload';

// Extend WorkItem interface
interface ExtendedWorkItem extends WorkItem {
  image1?: string | null;
  image2?: string | null;
  image3?: string | null;
}

interface WorkModalProps {
  workId: number | null;
  onClose: () => void;
}

const WorkModal = ({ workId, onClose }: WorkModalProps) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Use SWR for fetching work details
  const fetcher = (id: string) => workService.getWorkItem(id).then((res) => res.data);
  const { data: work, error, isLoading } = useSWR<ExtendedWorkItem>(
    workId ? `/work-items/${workId}` : null,
    fetcher
  );

  // Get all images from the work item
  const getImages = (work: ExtendedWorkItem | null): string[] => {
    if (!work) return [];
    return [work.image, work.image1, work.image2, work.image3].filter(
      (img): img is string => !!img
    );
  };

  const images = getImages(work ?? null);

  // Navigate images
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') nextImage();
      if (e.key === 'ArrowLeft') prevImage();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, images.length]);

  // Prevent body scrolling
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, []);

  const noImages = images.length === 0 && !isLoading;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-80"
      onClick={onClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 20 }}
        className="bg-white dark:bg-gray-800 rounded-xl overflow-hidden max-w-6xl w-full max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
        >
          <X size={20} />
        </button>

        {isLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="h-96 flex items-center justify-center text-red-500">
            Failed to load work details
          </div>
        ) : (
          <div className="flex flex-col md:flex-row h-full">
            <div className="w-full md:w-2/3 relative bg-gray-900">
              {noImages ? (
                <div className="h-96 flex items-center justify-center text-white">
                  No images available
                </div>
              ) : (
                <>
                  <div className="h-96 relative overflow-hidden">
                    <AnimatePresence mode="wait">
                      <LazyLoad height={384} offset={100} once>
                        <motion.img
                          key={currentImageIndex}
                          src={images[currentImageIndex]}
                          alt={`${work?.title} - image ${currentImageIndex + 1}`}
                          className="w-full h-full object-contain"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          loading="lazy" // Native lazy loading
                        />
                      </LazyLoad>
                    </AnimatePresence>
                  </div>

                  {images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={nextImage}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black bg-opacity-50 text-white hover:bg-opacity-70 transition-all"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}

                  {images.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2 px-4">
                      {images.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentImageIndex(index)}
                          className={`w-3 h-3 rounded-full transition-all ${
                            currentImageIndex === index
                              ? 'bg-primary scale-125'
                              : 'bg-white bg-opacity-50 hover:bg-opacity-75'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="w-full md:w-1/3 p-6 overflow-y-auto max-h-96 dark:bg-gray-800 dark:text-gray-200">
              <h2 className="text-2xl font-bold mb-4">{work?.title}</h2>
              <p className="text-sm text-primary dark:text-blue-400 mb-4">{work?.category}</p>
              <p className="text-gray-700 dark:text-gray-300 mb-6">{work?.description}</p>

              {work?.link && (
                <a
                  href={work.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  View Project
                </a>
              )}
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default WorkModal;