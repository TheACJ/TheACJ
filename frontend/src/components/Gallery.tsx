import { useState } from 'react';
import { motion } from 'framer-motion';
import { blogService, BlogPost } from '../services/api';
import { useScrollAnimation } from '../hooks/useAnimations';
import { MdChevronRight } from 'react-icons/md';
import { ExternalLink } from 'lucide-react';
import useSWR from 'swr';
import LazyLoad from 'react-lazyload';

const Gallery = () => {
  const { ref, controls, variants } = useScrollAnimation();
  const [error, setError] = useState<string | null>(null); // Retain error state for manual handling

  
  // Use SWR for fetching posts
  const fetcher = () => blogService.getRecentPosts().then((res) => res.data.slice(0, 4));
  const { data: posts = [], isLoading } = useSWR<BlogPost[]>('/blog-posts', fetcher, {
    onError: (err) => {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts.');
    },
  });


  if (isLoading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>Loading posts...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 bg-gray-50 dark:bg-gray-900 dark:text-[#b9b8b8]">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={variants}
          className="text-center mb-16"
        >
          <span className="text-sm text-gray-500 dark:text-gray-200 uppercase tracking-wider">Gallery</span>
          <h2 className="text-3xl font-bold mt-2">Top Blog Posts</h2>
          {error && <p className="text-red-500 mt-2">{error}</p>}
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post, index) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              variants={{
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.2 },
                },
              }}
              className="bg-white dark:bg-gray-900 dark:text-[#b9b8b8] rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {(post.image || post.image_url) && (
                <LazyLoad height={192} offset={100} once>
                  <img
                    src={post.image || post.image_url}
                    alt={post.title}
                    className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-300"
                    loading="lazy" // Native lazy loading
                  />
                </LazyLoad>
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  <p className="hover:text-primary transition-colors">{post.title}</p>
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-200 mb-4">
                  <span>{new Date(post.date_published).toLocaleDateString()}</span>
                  {post.category && <span> | {post.category.name}</span>}
                </div>
                <p className="text-gray-600 dark:text-gray-100">{post.content}</p>
              </div>
              <a
                href={post.link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center p-6 text-primary hover:text-blue-600 transition-colors ml-1 pb-5"
              >
                View Post <ExternalLink className="w-4 h-4 ml-1" />
              </a>
            </motion.div>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <a
            href="/all-posts"
            className="inline-flex items-center text-primary font-semibold hover:text-blue-700"
          >
            View All Posts
            <MdChevronRight className="ml-2" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default Gallery;