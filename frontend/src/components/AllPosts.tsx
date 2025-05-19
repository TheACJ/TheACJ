import { useState, useEffect } from 'react';
import { blogService, BlogPost } from '../services/api';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '../hooks/useAnimations';

const AllPosts = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ref, controls, variants } = useScrollAnimation();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await blogService.getRecentPosts();
        setPosts(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching posts:', error);
        setError('Failed to load posts.');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p>Loading posts...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gray-50 lg:ml-[300px] dark:bg-gray-900 dark:text-[#b9b8b8]">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={variants}
          className="text-center mb-16"
        >
          <span className="text-sm text-gray-500 uppercase tracking-wider">All Posts</span>
          <h2 className="text-3xl font-bold mt-2">All Blog Posts</h2>
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
                  transition: { delay: index * 0.2 }
                }
              }}
              className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {(post.image || post.image_url) && (
                <img 
                  src={post.image || post.image_url}
                  alt={post.title}
                  className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  <a href={post.link} className="hover:text-primary transition-colors">{post.title}</a>
                </h3>
                <div className="text-sm text-gray-500 mb-4">
                  <span>{new Date(post.date_published).toLocaleDateString()}</span>
                  {post.category && <span> | {post.category.name}</span>}
                </div>
                <p className="text-gray-600">{post.content}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default AllPosts;
