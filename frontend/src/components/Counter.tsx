import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useContent } from '../hooks/useContent';

const Counter = () => {
  const { content, loading } = useContent();
  const [counts, setCounts] = useState<number[]>([]);
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView && content.counter && content.counter.length > 0) {
      content.counter.forEach((counter, index) => {
        // Extract numeric value from string (e.g., "50+" -> 50)
        const targetValue = parseInt(counter.value.replace(/\D/g, '')) || 0;
        
        let start = 0;
        const increment = targetValue / 50;
        const timer = setInterval(() => {
          start += increment;
          if (start >= targetValue) {
            start = targetValue;
            clearInterval(timer);
          }
          setCounts(prev => {
            const newCounts = [...prev];
            newCounts[index] = Math.floor(start);
            return newCounts;
          });
        }, 40);
      });
    }
  }, [inView, content.counter]);

  if (loading) {
    return (
      <section ref={ref} className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          <span className="ml-4 text-white">Loading counter content from MongoDB...</span>
        </div>
      </section>
    );
  }

  if (!content.counter || content.counter.length === 0) {
    return (
      <section ref={ref} className="relative h-[400px] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-secondary" />
        <div className="absolute inset-0 bg-black/60" />
        <div className="relative h-full flex items-center justify-center">
          <div className="text-center text-white">
            <h2 className="text-2xl mb-4">No Counter Data Available</h2>
            <p>Please check your MongoDB content sections.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative h-[400px] overflow-hidden">
      {/* Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover"
      >
        <source
          src="https://static.videezy.com/system/resources/previews/000/056/476/original/Glowy-things-2-.mp4"
          type="video/mp4"
        />
      </video>

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/60" />

      {/* Content */}
      <div className="relative h-full max-w-6xl mx-auto px-4">
        <div className="h-full grid md:grid-cols-4 gap-8 items-center">
          {content.counter.map((counter, index) => (
            <motion.div
              key={counter._id || index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              <div className="flex items-center justify-center mb-2">
                <i className={`${counter.icon} text-3xl text-white mr-2`}></i>
                <span className="text-5xl font-bold text-white">
                  {counts[index] || 0}
                </span>
              </div>
              <span className="text-lg text-white/80 uppercase tracking-wider block">
                {counter.title}
              </span>
              <span className="text-sm text-white/60">
                {counter.value}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Counter;