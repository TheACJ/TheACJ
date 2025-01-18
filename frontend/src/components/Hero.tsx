import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import slider2 from '../assets/img/img_bg_1.jpg';
import slider1 from '../assets/img/img_bg_22.jpg';
import slider3 from '../assets/img/img_bg_3.jpg';
import slider4 from '../assets/img/Web3.webp';
import "../assets/style.css"

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const slides = [
    {
      title: "Hi!",
      subtitle: "The ACJ",
      description: "With us Tech Emancipation is achievable",
      bgImage: slider1,
      buttonText: <a href=''>View CV</a>,
      buttonIcon: "icon-download"
    },
    {
      title: "I am a",
      subtitle: "Data Analyst",
      description: "Where there is Data, The ACJ will make sense of it",
      bgImage: slider2,
      buttonText: <a href=''>View Portfolio</a>,
      buttonIcon: "icon-briefcase"
    },
    {
      title: "I am a",
      subtitle: "Web2 Developer",
      description: "Imagine it, The ACJ will make it real",
      bgImage: slider3,
      buttonText: <a href=''>View Portfolio</a>,
      buttonIcon: "icon-briefcase"
    },
    {
      title: "I am a",
      subtitle: "Web3 Developer",
      description: "Building worldclass solution using Blockchain Technology",
      bgImage: slider4,
      buttonText: <a href=''>View Portfolio</a>,
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
    <section id="home" className="relative h-screen overflow-hidden dark:bg-gray-900 dark:text-[#b9b8b8]">
      <div className="absolute inset-0">
        <AnimatePresence initial={false}>
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ 
              opacity: { duration: 0.7 },
              ease: "easeInOut"
            }}
            className="absolute inset-0"
          >
            <div
              className="absolute inset-0 bg-cover bg-center transform"
              style={{ backgroundImage: `url(${slides[currentSlide].bgImage})` }}
            >
              <div className="absolute inset-0 bg-black/30" />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="relative h-full flex items-center justify-center lg:justify-start lg:pl-[400px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ 
              duration: 0.5,
              ease: "easeOut"
            }}
            className="text-center lg:text-left p-8"
          >
            <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
              {slides[currentSlide].title} <br />
              <span>{slides[currentSlide].subtitle}</span>
            </h1>
            <h2 className="text-xl md:text-2xl text-white/90 mb-8">
              {slides[currentSlide].description}
            </h2>
            <motion.button 
              className="px-6 py-3 border-2 border-transparent text-white bg-gradient-to-r from-blue-500 to-yellow-400 hover:scale-105 relative overflow-hidden"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{
                backgroundSize: '200% 100%',
                animation: 'gradientMove 3s linear infinite'
              }}
            >
              {slides[currentSlide].buttonText}&nbsp;
              <span className={slides[currentSlide].buttonIcon}></span>
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

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