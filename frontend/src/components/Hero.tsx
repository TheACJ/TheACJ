// The Flip - 3D rotation transition effect using MongoDB data

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useContent } from '../hooks/useContent';
import mycv from '../assets/JoshuaAgbai.pdf'
import "../assets/style.css"

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { content, loading } = useContent();
  
  // Use slides from MongoDB, fallback to empty array if loading or no data
  const slides = content.hero.slides || [];

  useEffect(() => {
    if (slides.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);

      return () => clearInterval(timer);
    }
  }, [slides.length]);

  // Show loading state while content is being fetched
  if (loading) {
    return (
      <section id="home" className="relative h-screen overflow-hidden dark:bg-gray-900 dark:text-[#b9b8b8] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        <span className="ml-4 text-white">Loading hero content from MongoDB...</span>
      </section>
    );
  }

  // Show error state if no slides available
  if (slides.length === 0) {
    return (
      <section id="home" className="relative h-screen overflow-hidden dark:bg-gray-900 dark:text-[#b9b8b8] flex items-center justify-center">
        <div className="text-center text-white">
          <h2 className="text-2xl mb-4">No Hero Slides Available</h2>
          <p className="text-lg">Please check your MongoDB content sections.</p>
        </div>
      </section>
    );
  }

  const currentSlideData = slides[currentSlide];

  return (
    <section id="home" className="relative h-screen overflow-hidden dark:bg-gray-900 dark:text-[#b9b8b8]" style={{ perspective: '1000px' }}>
      {/* Background Layer */}
      <div className="absolute inset-0" style={{ transformStyle: 'preserve-3d' }}>
        <AnimatePresence initial={false} mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ rotateY: 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: -90, opacity: 0 }}
            transition={{
              type: "tween",
              duration: 0.8,
              ease: "easeInOut"
            }}
            className="absolute inset-0"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${currentSlideData.bgImage})`,
                backfaceVisibility: 'hidden'
              }}
            >
              <div className="absolute inset-0 bg-black/30" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Content Layer */}
      <div className="relative h-full flex items-center justify-center lg:justify-start lg:pl-[400px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ rotateX: 90, opacity: 0, y: 50 }}
            animate={{ rotateX: 0, opacity: 1, y: 0 }}
            exit={{ rotateX: -90, opacity: 0, y: -50 }}
            transition={{
              duration: 0.6,
              delay: 0.2,
              ease: "easeOut"
            }}
            className="text-center lg:text-left p-8"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <motion.div
              initial={{ rotateX: 45, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
                {currentSlideData.title} <br />
                <span>{currentSlideData.subtitle}</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ rotateX: 45, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h2 className="text-xl md:text-2xl text-white/90 mb-8">
                {currentSlideData.description}
              </h2>
            </motion.div>

            <motion.button
              initial={{ rotateX: 45, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="px-6 py-3 border-2 border-transparent text-white bg-gradient-to-r from-primary to-secondary hover:scale-105 relative overflow-hidden"
              whileHover={{
                scale: 1.05,
                transition: { duration: 0.2 }
              }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundSize: '200% 100%',
                animation: 'gradientMove 3s linear infinite',
                transformStyle: 'preserve-3d'
              }}
            >
              {/* Handle different button types from MongoDB */}
              {currentSlideData.buttonLink?.includes('.pdf') ? (
                <a href={currentSlideData.buttonLink} download="TheACJ.pdf" className="block">
                  {currentSlideData.buttonText || 'View CV'}
                </a>
              ) : (
                <>
                  {currentSlideData.buttonText || 'View Portfolio'}
                  {currentSlideData.buttonIcon && <span className={currentSlideData.buttonIcon}></span>}
                </>
              )}
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-8 z-10">
        <div className="flex flex-col space-y-2">
          {slides.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-3 h-3 rounded-full ${
                index === currentSlide ? 'bg-white' : 'bg-white/50'
              }`}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.8 }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default Hero;