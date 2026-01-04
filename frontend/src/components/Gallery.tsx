import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { blogService, type BlogPost } from '../services/api_node';
import { 
  ArrowRight, Calendar, Clock, Image as ImageIcon, 
  ExternalLink, AlertCircle, RefreshCw, BookOpen 
} from 'lucide-react';

// --- Helper Functions ---

// Robust data extractor (Preserving backward compatibility)
const extractPostsFromResponse = (response: any): BlogPost[] => {
  if (!response) return [];
  if (response?.data?.data && Array.isArray(response.data.data)) return response.data.data;
  if (response?.data && Array.isArray(response.data)) return response.data;
  if (Array.isArray(response)) return response;
  
  console.warn('Unexpected response structure:', response);
  return [];
};

// Calculate reading time (Avg 200 words per minute)
const calculateReadingTime = (text: string | undefined): string => {
  if (!text) return '1 min read';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
};

// Format date nicely
const formatDate = (dateString: string | undefined): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// --- Sub-components ---

const BlogSkeleton = () => (
  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
    {[1, 2, 3].map((i) => (
      <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden h-full flex flex-col">
        <div className="h-48 bg-gray-200 dark:bg-gray-800 animate-pulse" />
        <div className="p-6 space-y-4 flex-1">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="h-6 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
          <div className="h-20 w-full bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div className="text-center py-12 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-800/30">
    <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
    <h3 className="text-lg font-bold text-red-800 dark:text-red-400 mb-2">Failed to load posts</h3>
    <p className="text-red-600 dark:text-red-300 mb-6">{message}</p>
    <button
      onClick={onRetry}
      className="inline-flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
    >
      <RefreshCw className="w-4 h-4 mr-2" />
      Try Again
    </button>
  </div>
);

// --- Main Component ---

const Gallery = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await blogService.getBlogPosts();
      const extractedPosts = extractPostsFromResponse(response);
      
      // Filter valid posts and sort by date (newest first)
      const validPosts = extractedPosts
        .filter(p => p.title && (p.content || p.excerpt))
        .sort((a, b) => {
          const dateA = new Date(a.publishedAt || a.createdAt || 0).getTime();
          const dateB = new Date(b.publishedAt || b.createdAt || 0).getTime();
          return dateB - dateA;
        });

      setPosts(validPosts.slice(0, 3)); // Limit to 3 for a clean grid row
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Could not retrieve the latest updates. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <section id="gallery" className="py-24 overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-bold text-primary tracking-[0.2em] uppercase block mb-3">
            My Blog
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
            Latest Insights & Gallery
          </h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Thoughts on technology, coding tutorials, and snapshots of my latest work.
          </p>
        </motion.div>

        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading ? (
            <BlogSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchPosts} />
          ) : posts.length === 0 ? (
            <div className="text-center py-20 text-gray-500">No blog posts available at the moment.</div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {posts.map((post, index) => {
                const readingTime = calculateReadingTime(post.content || post.excerpt);
                const displayDate = formatDate(post.publishedAt || post.createdAt);
                const categoryName = post.category?.friendlyName || post.category?.name || 'Tech';
                const imageUrl = post.featured_image || post.image_url || post.image || post.imageUrl;

                return (
                  <motion.article
                    key={post._id || index}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="group flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-lg hover:shadow-2xl border border-gray-100 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:-translate-y-2"
                  >
                    {/* Image Header */}
                    <div className="relative h-56 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt={post.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                          loading="lazy"
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full text-gray-300 dark:text-gray-600">
                          <ImageIcon size={48} />
                        </div>
                      )}
                      
                      {/* Floating Category Badge */}
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-black/50 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-full border border-white/20">
                          {categoryName}
                        </span>
                      </div>
                    </div>

                    {/* Content Body */}
                    <div className="flex flex-col flex-1 p-6">
                      {/* Meta Data */}
                      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-primary" />
                          <span>{displayDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock size={14} className="text-secondary" />
                          <span>{readingTime}</span>
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-primary transition-colors">
                        <a href={post.postUrl || `/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                          {post.title}
                        </a>
                      </h3>

                      {/* Excerpt */}
                      <p className="text-gray-600 dark:text-[#b9b8b8] text-sm line-clamp-3 mb-6 flex-1">
                        {post.excerpt || post.content?.substring(0, 150) + '...'}
                      </p>

                      {/* Footer Link */}
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-700">
                        <a
                          href={post.postUrl || `/blog/${post.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-sm font-bold text-primary group/link"
                        >
                          <BookOpen size={16} />
                          <span>Read Article</span>
                          <ArrowRight
                            size={16}
                            className="transition-transform duration-300 group-hover/link:translate-x-1"
                          />
                        </a>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </div>

        {/* View All Button */}
        {!loading && !error && posts.length > 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="flex justify-center mt-16"
          >
            <a 
              href="/all-posts" 
              className="group inline-flex items-center gap-2 px-8 py-3 bg-white dark:bg-gray-800 text-gray-800 dark:text-white font-semibold rounded-full shadow-lg hover:shadow-xl hover:text-primary border border-gray-100 dark:border-gray-700 transition-all duration-300"
            >
              <span>View All Posts</span>
              <ExternalLink size={18} className="group-hover:rotate-45 transition-transform duration-300" />
            </a>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default Gallery;