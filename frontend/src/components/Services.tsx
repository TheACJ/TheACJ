import { motion } from 'framer-motion';
import { useContent } from '../hooks/useContent';
import { Layers, Activity } from 'lucide-react'; // Fallback icons just in case
import '../assets/style.css';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

// --- Sub-components ---

// 1. Skeleton Loader (Prevents Layout Shift)
const ServiceSkeleton = () => (
  <section className="py-24 bg-gray-50 dark:bg-gray-900">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col items-center mb-16 space-y-4">
        <div className="h-4 w-32 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-10 w-96 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-64 bg-white dark:bg-gray-800 rounded-xl shadow-sm border-b-4 border-gray-200 animate-pulse p-6">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />
            <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        ))}
      </div>
    </div>
  </section>
);

// 2. Empty State
const EmptyState = () => (
  <section className="py-24 bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-[50vh]">
    <div className="text-center text-gray-500 dark:text-gray-400">
      <Layers size={48} className="mx-auto mb-4 opacity-50" />
      <h2 className="text-2xl font-bold mb-2">No Services Found</h2>
      <p>Services data is currently unavailable.</p>
    </div>
  </section>
);

const Services = () => {
  const { content, loading } = useContent();
  const services = content?.services || [];

  // Loading State
  if (loading && services.length === 0) return <ServiceSkeleton />;

  // Error/Empty State
  if (services.length === 0) return <EmptyState />;

  return (
    <section id="services" className="py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      {/* Optional Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, gray 1px, transparent 0)', backgroundSize: '32px 32px' }}>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-20"
        >
          <span className="text-sm font-bold text-primary tracking-[0.2em] uppercase block mb-3">
            What I Do
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white relative inline-block">
            My Expertise
            <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-primary to-yellow-500 rounded-full"></span>
          </h2>
        </motion.div>

        {/* Grid */}
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
        >
          {services.map((service, index) => {
            // Determine styling based on even/odd index (Backward Compatibility)
            const isEven = index % 2 === 0;
            const borderColor = isEven ? 'border-primary' : 'border-yellow-500';
            const iconColor = isEven ? 'text-primary' : 'text-yellow-500';
            const iconBg = isEven ? 'bg-primary/10' : 'bg-yellow-500/10';

            return (
              <motion.div
                key={service._id || index}
                variants={cardVariants}
                className={`
                  group relative flex flex-col h-full p-8 
                  bg-white dark:bg-gray-800 
                  rounded-2xl shadow-lg hover:shadow-2xl 
                  border-b-[6px] ${borderColor}
                  transition-all duration-300 ease-in-out
                  hover:-translate-y-2
                `}
              >
                {/* Icon Wrapper */}
                <div className={`
                  w-14 h-14 rounded-xl flex items-center justify-center mb-6 
                  ${iconBg} ${iconColor} 
                  transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3
                `}>
                  <i className={`${service.icon} text-2xl`} aria-hidden="true"></i>
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold mb-4 text-gray-900 dark:text-white group-hover:text-primary transition-colors">
                  {service.title}
                </h3>
                
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-sm flex-grow">
                  {service.description}
                </p>

                {/* Decorative Watermark Icon (Absolute Positioned) */}
                <div className={`
                  absolute -bottom-4 -right-4 text-9xl opacity-0 group-hover:opacity-[0.03] 
                  transition-opacity duration-500 pointer-events-none select-none
                  dark:text-white text-black
                `}>
                  <i className={service.icon}></i>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
};

export default Services;