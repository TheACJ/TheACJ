import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { blogService, type BlogPost } from '../services/api_node';
import { useScrollAnimation } from '../hooks/useAnimations';
import {  MdChevronRight } from 'react-icons/md'; // Modern arrow icons
import { ExternalLink } from 'lucide-react';

// Helper function to extract posts from different response formats
const extractPostsFromResponse = (response: any): BlogPost[] => {
  // Handle different response structures
  if (response?.data?.data && Array.isArray(response.data.data)) {
    // Node.js backend structure: response.data.data
    return response.data.data;
  } else if (response?.data && Array.isArray(response.data)) {
    // Direct array structure: response.data
    return response.data;
  } else if (Array.isArray(response)) {
    // Direct array response
    return response;
  }
  
  console.warn('Unexpected response structure:', response);
  return [];
};

const Gallery = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { ref, controls, variants } = useScrollAnimation();

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      try {
        const response = await blogService.getBlogPosts();
        
        // The api_node service returns ApiResponse<BlogPost[]>
        // The actual posts are in response.data
        const extractedPosts = extractPostsFromResponse(response);
        // Get the top 4 posts sorted by date
        setPosts(extractedPosts.slice(0, 4));
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
              key={post._id}
              initial={{ opacity: 0, y: 20 }}
              animate={controls}
              variants={{
                visible: {
                  opacity: 1,
                  y: 0,
                  transition: { delay: index * 0.2 }
                }
              }}
              className="bg-white dark:bg-gray-900 dark:text-[#b9b8b8] rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
            >
              {(post.image || post.imageUrl) && (
                <img
                  src={post.image || post.imageUrl}
                  alt={post.title}
                  className="w-full h-48 object-cover transform hover:scale-105 transition-transform duration-300"
                />
              )}
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-2">
                  <p className="hover:text-primary transition-colors">{post.title}</p>
                </h3>
                <div className="text-sm text-gray-500 dark:text-gray-200 mb-4">
                  <span>{post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}</span>
                  {post.category && <span> | {post.category.friendlyName || post.category.name}</span>}
                </div>
                <p className="text-gray-600 dark:text-gray-100">{post.excerpt || (post.content ? post.content.substring(0, 150) + '...' : 'No content available')}</p>
              </div>
              <a
               href={`/blog/${post.slug}`}
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center p-6 text-primary hover:text-blue-600 transition-colors ml-1 pb-5">
               View Post &nbsp; <ExternalLink className="w-4 h-4 ml-1" />
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
