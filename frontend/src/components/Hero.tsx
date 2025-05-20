// The Flip - 3D rotation transition effect

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import slider1 from '../assets/img/theacj.jpg';
import slider2 from '../assets/img/data_analytics.jpg';
import slider3 from '../assets/img/web2.jpg';
import slider4 from '../assets/img/Web3.webp';
import mycv from '../assets/JoshuaAgbai.pdf'
import "../assets/style.css"

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Hi!",
      subtitle: "The ACJ",
      description: "With us Tech Emancipation is achievable",
      bgImage: slider1,
      buttonText: <a href={mycv} download="TheACJ.pdf">View CV</a>,
      buttonIcon: "icon-download"
    },
    {
      title: "I am a",
      subtitle: "Data Analyst",
      description: "Where there is Data, The ACJ will make sense of it",
      bgImage: slider2,
      buttonText: <a href='#work'>View Portfolio</a>,
      buttonIcon: "icon-briefcase"
    },
    {
      title: "I am a",
      subtitle: "Web2 Developer",
      description: "Imagine it, The ACJ will make it real",
      bgImage: slider3,
      buttonText: <a href='#work'>View Portfolio</a>,
      buttonIcon: "icon-briefcase"
    },
    {
      title: "I am a",
      subtitle: "Web3 Developer",
      description: "Building worldclass solution using Blockchain Technology",
      bgImage: slider4,
      buttonText: <a href='#work'>View Portfolio</a>,
      buttonIcon: "icon-briefcase"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

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
                backgroundImage: `url(${slides[currentSlide].bgImage})`,
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
                {slides[currentSlide].title} <br />
                <span>{slides[currentSlide].subtitle}</span>
              </h1>
            </motion.div>

            <motion.div
              initial={{ rotateX: 45, opacity: 0 }}
              animate={{ rotateX: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              <h2 className="text-xl md:text-2xl text-white/90 mb-8">
                {slides[currentSlide].description}
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
              {slides[currentSlide].buttonText}&nbsp;
              <span className={slides[currentSlide].buttonIcon}></span>
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