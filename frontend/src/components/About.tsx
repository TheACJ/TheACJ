import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle2, Briefcase, ArrowRight } from 'lucide-react';
import { useContent } from '../hooks/useContent';
import '../assets/style.css';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 10
    }
  }
};

// --- Sub-components ---
const SkeletonLoader = () => (
  <section id="about" className="py-20 bg-white dark:bg-gray-900">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col items-center space-y-4 mb-12">
        <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-10 w-64 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      </div>
      <div className="space-y-4 max-w-3xl mx-auto mb-16">
        <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-4 w-4/6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2].map((i) => (
          <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  </section>
);

const About = () => {
  const { content, loading } = useContent();

  // Robust check for data availability
  const hasData = content?.about?.title || content?.about?.description;
  const achievements = content?.about?.achievements || [];

  if (loading && !hasData) return <SkeletonLoader />;

  if (!hasData) {
    return (
      <section id="about" className="py-20 bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center text-gray-500 dark:text-[#b9b8b8]">
          <h2 className="text-xl font-medium">Content currently unavailable</h2>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* --- Header Section --- */}
          <motion.div 
            variants={itemVariants}
            className="text-center mb-16"
          >
            <span className="inline-block py-1 px-3 rounded-full bg-primary/10 text-primary text-xs font-bold tracking-widest uppercase mb-4">
              Who I Am
            </span>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent bg-[length:200%_auto] animate-gradient">
              {content.about.title}
            </h2>
            <div className="w-24 h-1.5 bg-gradient-to-r from-primary to-secondary mx-auto mt-6 rounded-full" />
          </motion.div>

          {/* --- Main Description --- */}
          <div className="grid lg:grid-cols-12 gap-12 items-start mb-20">
            {/* Bio Text */}
            <motion.div 
              variants={itemVariants} 
              className="lg:col-span-8 lg:col-start-3 text-center"
            >
              <div className="prose prose-lg dark:prose-invert mx-auto">
                <p className="text-lg md:text-xl text-gray-600 dark:text-[#b9b8b8] leading-relaxed font-light">
                  <span className="text-4xl font-serif text-primary mr-2 block md:inline mb-2 md:mb-0">
                    Hello.
                  </span>
                  {content.about.description}
                </p>
              </div>
            </motion.div>
          </div>

          {/* --- Achievements Grid --- */}
          {achievements.length > 0 && (
            <motion.div 
              variants={itemVariants}
              className="mb-20"
            >
              <div className="flex items-center justify-center gap-2 mb-8 text-gray-400 dark:text-gray-600">
                <div className="h-px w-12 bg-current" />
                <h3 className="text-sm font-semibold uppercase tracking-widest">Milestones</h3>
                <div className="h-px w-12 bg-current" />
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement: string, index: number) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    className="group relative bg-white dark:bg-gray-800/50 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="relative flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
                         {/* Dynamic Icon choice could go here, defaulting to Award */}
                        <Award size={24} />
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-gray-200 leading-snug">
                          {achievement}
                        </p>
                        <CheckCircle2 className="w-4 h-4 text-green-500 mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* --- Call to Action Banner --- */}
          <motion.div 
            variants={itemVariants}
            className="relative rounded-3xl overflow-hidden"
          >
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-r from-secondary via-yellow-500 to-secondary bg-[length:200%_100%] animate-gradient" />
            <div className="absolute inset-0 bg-black/10 backdrop-blur-[1px]" />
            
            {/* Pattern Overlay */}
            <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }} />

            <div className="relative p-8 md:p-12 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                Ready to bring your ideas to life?
              </h2>
              <p className="text-gray-800 font-medium mb-8 text-lg">
                I am happy to inform you that 15+ projects are done successfully!
              </p>
              
              <motion.a
                href="https://wa.me/2348119137762?text=Hi%20ACJ!%20I%20saw%20your%20portfolio%20and%20would%20like%20to%20hire%20you.%20Are%20you%20available%20for%20a%20project%3F"
                target="_blank"
                rel="noopener noreferrer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="inline-flex items-center gap-3 px-8 py-4 bg-gray-900 text-white font-bold rounded-xl hover:bg-black hover:shadow-2xl hover:shadow-black/25 transition-all duration-300 group"
              >
                <span>Hire Me</span>
                <span className="relative">
                  <Briefcase size={20} className="group-hover:hidden" />
                  <ArrowRight size={20} className="hidden group-hover:block animate-bounce-x" />
                </span>
              </motion.a>
            </div>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
};

export default About;