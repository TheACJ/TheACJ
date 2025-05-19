import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkItem, workService } from '../services/apiService'; // Ensure correct import path
import { ExternalLink } from 'lucide-react';

const Work = () => {
  const categories = ['Web App', 'Data Science / Analytics', 'Web3 Dev'];
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Fetch works from the API
  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const response = await workService.getAllWorks();
        if (Array.isArray(response.data)) {
          setWorks(response.data);
        } else {
          setError('Invalid data format received from the server.');
          setWorks([]);
        }
      } catch (err) {
        console.error('Error fetching works:', err);
        setError('Failed to load works. Please try again later.');
        setWorks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchWorks();
  }, []);

  // Filter works based on the selected category
  const filteredWorks = works.filter((work) => work.category === selectedCategory);

  // Auto-rotate slides every 3 seconds
  useEffect(() => {
    if (filteredWorks.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.min(4, filteredWorks.length));
      }, 3000);

      return () => clearInterval(timer);
    }
  }, [selectedCategory, filteredWorks.length]);

  // Reset slide index when category changes
  useEffect(() => {
    setCurrentSlide(0);
  }, [selectedCategory]);

  // Loading state
  if (loading) {
    return (
      <section id="work" className="py-20 bg-white dark:bg-gray-900 dark:text-[#b9b8b8]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="animate-pulse">
            <div className="h-8 w-48 bg-gray-200 rounded mx-auto mb-4"></div>
            <div className="h-6 w-64 bg-gray-200 rounded mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section id="work" className="py-20 bg-white dark:bg-gray-900 dark:text-[#b9b8b8]">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <div className="text-red-500">{error}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="work" className="py-20 bg-white dark:bg-gray-900 dark:text-[#b9b8b8]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm text-gray-500 uppercase tracking-wider dark:text-[#b9b8b8]">My Work</span>
          <h2 className="text-3xl font-bold mt-2">Recent Work</h2>
        </div>

        {/* Category Buttons */}
        <div className="mb-8">
          <div className="flex justify-center space-x-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-primary text-white'
                    : 'text-gray-600 hover:text-primary'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Work Items */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {filteredWorks.length > 0 && (
              <motion.div
                key={currentSlide}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid md:grid-cols-2 lg:grid-cols-2 gap-8"
              >
                {[filteredWorks[currentSlide]].map((work) => (
                  work && (
                    <div
                      key={work.id}
                      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 mx-auto max-w-2xl"
                    >
                      <div className="relative h-64">
                        {work.image && (
                          <img
                            src={work.image}
                            alt={work.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{work.title}</h3>
                        <p className="text-gray-600 mb-4">{work.description}</p>
                        {work.link && (
                          <a
                            href={work.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-primary hover:text-blue-600 transition-colors"
                          >
                            View Project <ExternalLink className="w-4 h-4 ml-1" />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Slide Indicators */}
          {filteredWorks.length > 0 && (
            <div className="flex justify-center mt-8 space-x-2">
              {Array.from({ length: Math.min(4, filteredWorks.length) }).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* No Works Found */}
        {filteredWorks.length === 0 && (
          <div className="text-center text-gray-500">
            No works found in this category
          </div>
        )}
      </div>
    </section>
  );
};

export default Work;