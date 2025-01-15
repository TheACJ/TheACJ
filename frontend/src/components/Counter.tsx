import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const counters = [
  { value: 20, label: "Projects" },
  { value: 4, label: "Clients" },
  { value: 3, label: "Partners" }
];

const Counter = () => {
  const [counts, setCounts] = useState(counters.map(() => 0));
  const { ref, inView } = useInView({
    threshold: 0.5,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      counters.forEach((counter, index) => {
        let start = 0;
        const increment = counter.value / 50;
        const timer = setInterval(() => {
          start += increment;
          if (start >= counter.value) {
            start = counter.value;
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
  }, [inView]);

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
        <div className="h-full grid md:grid-cols-3 gap-8 items-center">
          {counters.map((counter, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="text-center"
            >
              <span className="text-5xl font-bold text-white block mb-2">
                {counts[index]}
              </span>
              <span className="text-lg text-white/80 uppercase tracking-wider">
                {counter.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Counter;