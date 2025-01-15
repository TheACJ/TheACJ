import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWorkItems } from './Work/useWorkItems';

interface WorkItem {
  id: number;
  title: string;
  category: string;
  image: string;
  description: string;
  link?: string;
}

const works: WorkItem[] = [
  // Graphics Design
  {
    id: 1,
    title: "Brand Identity Design",
    category: "Graphics Design",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Complete brand identity package including logo, business cards, and letterhead"
  },
  {
    id: 2,
    title: "Social Media Graphics",
    category: "Graphics Design",
    image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Engaging social media content and campaign designs"
  },
  {
    id: 3,
    title: "Product Packaging",
    category: "Graphics Design",
    image: "https://images.unsplash.com/photo-1636955779321-819753cd1741?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Creative product packaging and label designs"
  },
  {
    id: 4,
    title: "Marketing Materials",
    category: "Graphics Design",
    image: "https://images.unsplash.com/photo-1572044162444-ad60f128bdea?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Brochures, flyers, and marketing collateral design"
  },
  // Web Design
  {
    id: 5,
    title: "E-commerce Platform",
    category: "Web Design",
    image: "https://images.unsplash.com/photo-1661956602116-aa6865609028?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Modern e-commerce website with responsive design"
  },
  {
    id: 6,
    title: "Portfolio Website",
    category: "Web Design",
    image: "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Creative portfolio website for photographers"
  },
  {
    id: 7,
    title: "Restaurant Website",
    category: "Web Design",
    image: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Interactive restaurant website with online ordering"
  },
  {
    id: 8,
    title: "Corporate Website",
    category: "Web Design",
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Professional corporate website with modern design"
  },
  // Software
  {
    id: 9,
    title: "Inventory System",
    category: "Software",
    image: "https://images.unsplash.com/photo-1664575602554-2087b04935a5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Custom inventory management solution"
  },
  {
    id: 10,
    title: "CRM Software",
    category: "Software",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Customer relationship management system"
  },
  {
    id: 11,
    title: "POS System",
    category: "Software",
    image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Point of sale system for retail businesses"
  },
  {
    id: 12,
    title: "Analytics Dashboard",
    category: "Software",
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Data analytics and reporting dashboard"
  },
  // Web App
  {
    id: 13,
    title: "Task Manager",
    category: "Web App",
    image: "https://images.unsplash.com/photo-1512758017271-d7b84c2113f1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Collaborative task management application"
  },
  {
    id: 14,
    title: "Learning Platform",
    category: "Web App",
    image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Online learning management system"
  },
  {
    id: 15,
    title: "Project Planner",
    category: "Web App",
    image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Project planning and tracking application"
  },
  {
    id: 16,
    title: "Social Platform",
    category: "Web App",
    image: "https://images.unsplash.com/photo-1432888498266-38ffec3eaf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80",
    description: "Community-driven social networking platform"
  }
];

const Work = () => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  
  const categories = ["Graphics Design", "Web Design", "Software", "Web App"];
  
  const filteredWorks = selectedCategory 
    ? works.filter(work => work.category === selectedCategory)
    : [];

  useEffect(() => {
    if (selectedCategory) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % 4);
      }, 3000);

      return () => clearInterval(timer);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [selectedCategory]);

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
                      key={work.id}
                      className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 mx-auto max-w-2xl"
                    >
                      <div className="relative h-64">
                        <img 
                          src={work.image}
                          alt={work.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-semibold mb-2">{work.title}</h3>
                        <p className="text-gray-600 mb-4">{work.description}</p>
                        {work.link && (
                          <a 
                            href={work.link}
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