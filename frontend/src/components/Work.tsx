import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { WorkItem, workService } from '../services/api';
import { ExternalLink } from 'lucide-react';
import WorkModal from './WorkModal'; 

const Work = () => {
  const categories = ['Web App', 'Data Science / Analytics', 'Web3 Dev'];
  
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories[0]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedWorkId, setSelectedWorkId] = useState<number | null>(null);
  
  // Debug state
  const [debug, setDebug] = useState<string>('No clicks detected yet');
  
  useEffect(() => {
    const fetchWorks = async () => {
      try {
        const response = await workService.getAllWorks();
        console.log("Fetched works:", response.data); // Debug log
        setWorks(Array.isArray(response.data) ? response.data : []);
        setError(null);
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

  // Updated filteredWorks to always filter based on selectedCategory
  const filteredWorks = Array.isArray(works)
    ? works.filter(work => work.category === selectedCategory)
    : [];

  useEffect(() => {
    if (filteredWorks.length > 0) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % Math.min(4, filteredWorks.length));
      }, 3000);

      return () => clearInterval(timer);
    }
  }, [selectedCategory, filteredWorks.length]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [selectedCategory]);

  // Function to open the modal with the selected work
  const openWorkModal = (workId: number) => {
    console.log('openWorkModal called with ID:', workId); // Debug log
    setDebug(`Opening modal for work ID: ${workId}`);
    setSelectedWorkId(workId);
  };

  // Function to close the modal
  const closeWorkModal = () => {
    console.log('closeWorkModal called'); // Debug log
    setDebug('Modal closed');
    setSelectedWorkId(null);
  };

  // Handler function for card click
  const handleCardClick = (workId: number, event: React.MouseEvent) => {
    console.log('Card clicked for work ID:', workId); // Debug log
    event.preventDefault(); // Prevent any default behavior
    setDebug(`Card clicked for work ID: ${workId}`);
    openWorkModal(workId);
  };

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
          {/* Debug text - normally you'd remove this in production */}
          <div className="mt-2 text-sm text-gray-500">{debug}</div>
        </div>

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

        <div className="relative min-h-[400px] dark:bg-gray-900 dark:text-gray-200">
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
                      {/* Make only the image area clickable with a dedicated onClick handler */}
                      <div 
                        className="relative h-64 cursor-pointer"
                        onClick={(e) => handleCardClick(work.id, e)}
                      >
                        {work.image && (
                          <img 
                            src={work.image}
                            alt={work.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-20 transition-all flex items-center justify-center">
                          <div className="opacity-0 hover:opacity-100 transition-all transform translate-y-4 hover:translate-y-0">
                            <span className="bg-primary text-white px-4 py-2 rounded-lg shadow-lg">
                              View Gallery
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="p-6 dark:bg-gray-900 dark:text-gray-200">
                        <h3 className="text-xl font-semibold mb-2">{work.title}</h3>
                        <p className="text-gray-600 dark:text-gray-200 mb-4">{work.description}</p>
                        <div className="flex gap-4">
                          {/* Updated View Project button to open modal */}
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleCardClick(work.id, e);
                            }}
                            className="inline-flex items-center px-3 py-1 bg-primary text-white rounded hover:bg-purple-600 transition-colors text-sm"
                          >
                            View Project
                          </button>
                          {/* Optional: Keep gallery button if needed */}
                          <button
                            onClick={(e) => handleCardClick(work.id, e)}
                            className="inline-flex items-center px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 transition-colors text-sm"
                          >
                            View Gallery
                          </button>
                        </div>
                      </div>

                      <div className="w-full md:w-1/3 p-6 overflow-y-auto max-h-96 dark:bg-gray-800 dark:text-gray-200">
                        <h2 className="text-2xl font-bold mb-4">{work?.title}</h2>
                        <p className="text-sm text-primary dark:text-blue-400 mb-4">{work?.category}</p>
                        <p className="text-gray-700 dark:text-gray-300 mb-6">{work?.description}</p>
                        
                        {/* Add external link in modal */}
                        {work?.link && (
                          <a
                            href={work.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-600 transition-colors"
                          >
                            Visit External Site <ExternalLink className="w-4 h-4 ml-2" />
                          </a>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </motion.div>
            )}
          </AnimatePresence>

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

        {filteredWorks.length === 0 && (
          <div className="text-center text-gray-500">
            No works found in this category
          </div>
        )}
      </div>

      {/* Work Modal - Render only when a work is selected */}
      {selectedWorkId !== null && (
        <WorkModal workId={selectedWorkId} onClose={closeWorkModal} />
      )}
    </section>
  );
};

export default Work;