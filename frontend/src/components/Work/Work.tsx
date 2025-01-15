import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkItems } from './useWorkItems';
import { i } from 'framer-motion/client';

interface WorkItemProps {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
  link?: string;
}

let categories


const Work = ({ id, title, category, image, description, link }: WorkItemProps) => {
  const { posts, loading, error } = useWorkItems();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const filteredWorks = selectedCategory 
    ? posts.filter((work: { category: string; }) => work.category === selectedCategory)
    : [];
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;



  return (
    <section id="work" className="py-20 bg-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm text-gray-500 uppercase tracking-wider">My Work</span>
          <h2 className="text-3xl font-bold mt-2">Recent Work</h2>
        </div>

        <div className="mb-8">
          <div className="flex justify-center space-x-4">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 hover:text-blue-500'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {selectedCategory && (
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
                      key={id}
                      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 mx-auto max-w-2xl"
                    >
                      <div className="relative h-64">
                        <img 
                          src={image}
                          alt={title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{work.title}</h3>
                        <p className="text-gray-600 mb-4">{description}</p>
                        {link && (
                          <a 
                            href={link}
                            className="text-blue-500 hover:text-blue-600 transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            View Project →
                          </a>
                        )}
                      </div>
                    </div>
                  )
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {selectedCategory && (
            <div className="flex justify-center mt-8 space-x-2">
              {[0, 1, 2, 3].map((index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    currentSlide === index ? 'bg-blue-500' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {!selectedCategory && (
          <div className="text-center text-gray-500">
            Select a category to view projects
          </div>
        )}
      </div>
    </section>
  );
};

export default Work;