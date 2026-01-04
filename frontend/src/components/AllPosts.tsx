import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { blogService, type BlogPost } from '../services/api_node';
import { 
  ArrowLeft, ArrowRight, Calendar, Clock, Image as ImageIcon, 
  AlertCircle, RefreshCw, BookOpen, Search, X, Filter
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  }
};

// --- Helper Functions (Same as Gallery for consistency) ---

const extractPostsFromResponse = (response: any): BlogPost[] => {
  if (!response) return [];
  if (response?.data?.data && Array.isArray(response.data.data)) return response.data.data;
  if (response?.data && Array.isArray(response.data)) return response.data;
  if (Array.isArray(response)) return response;
  
  console.warn('Unexpected response structure:', response);
  return [];
};

const calculateReadingTime = (text: string | undefined): string => {
  if (!text) return '1 min read';
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return `${minutes} min read`;
};

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
    {[1, 2, 3, 4, 5, 6].map((i) => (
      <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden h-full flex flex-col">
        <div className="h-56 bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="p-6 space-y-4 flex-1">
          <div className="flex justify-between">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="h-6 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-6 w-2/3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          <div className="h-20 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        </div>
      </div>
    ))}
  </div>
);

const ErrorState = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <motion.div 
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    className="text-center py-16 bg-red-50 dark:bg-red-900/10 rounded-2xl border border-red-100 dark:border-red-800/30"
  >
    <AlertCircle className="mx-auto h-16 w-16 text-red-500 mb-6" />
    <h3 className="text-xl font-bold text-red-800 dark:text-red-400 mb-2">Failed to load posts</h3>
    <p className="text-red-600 dark:text-red-300 mb-8 max-w-md mx-auto">{message}</p>
    <motion.button
      onClick={onRetry}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl shadow-lg transition-colors"
    >
      <RefreshCw className="w-5 h-5" />
      Try Again
    </motion.button>
  </motion.div>
);

const EmptyState = ({ searchTerm }: { searchTerm: string }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="text-center py-20"
  >
    <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
      <BookOpen size={40} className="text-gray-400" />
    </div>
    <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
      {searchTerm ? 'No matching posts found' : 'No blog posts yet'}
    </h3>
    <p className="text-gray-500 dark:text-gray-400">
      {searchTerm 
        ? `Try adjusting your search term "${searchTerm}"`
        : 'Check back later for new content!'
      }
    </p>
  </motion.div>
);

// --- Blog Card Component ---
interface BlogCardProps {
  post: BlogPost;
  index: number;
}

const BlogCard = ({ post, index }: BlogCardProps) => {
  const readingTime = calculateReadingTime(post.content || post.excerpt);
  const displayDate = formatDate(post.publishedAt || post.createdAt);
  const categoryName = post.category?.friendlyName || post.category?.name || 'Tech';
  const imageUrl = post.image || post.imageUrl;

  return (
    <motion.article
      variants={cardVariants}
      layout
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
        
        {/* Category Badge */}
        <div className="absolute top-4 right-4">
          <span className="px-3 py-1.5 bg-black/50 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider rounded-full border border-white/20">
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
          <a href={`/blog/${post.slug}`}>
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
            href={`/blog/${post.slug}`}
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
};

// --- Main Component ---

const AllPosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

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

      setPosts(validPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Could not retrieve blog posts. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  // Extract unique categories from posts
  const categories = useMemo(() => {
    const cats = new Set<string>();
    cats.add('All');
    posts.forEach(post => {
      const cat = post.category?.friendlyName || post.category?.name;
      if (cat) cats.add(cat);
    });
    return Array.from(cats);
  }, [posts]);

  // Filter posts based on search and category
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = searchTerm === '' || 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const postCategory = post.category?.friendlyName || post.category?.name || '';
      const matchesCategory = selectedCategory === 'All' || postCategory === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [posts, searchTerm, selectedCategory]);

  return (
    <section className="min-h-screen py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden">
      {/* Decorative Background */}
      <div className="absolute inset-0 opacity-[0.02] dark:opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => navigate(-1)}
          className="group inline-flex items-center gap-2 mb-8 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-primary dark:hover:text-primary font-medium rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-all duration-300"
        >
          <ArrowLeft size={20} className="transition-transform group-hover:-translate-x-1" />
          <span>Back</span>
        </motion.button>

        {/* Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <span className="text-sm font-bold text-primary tracking-[0.2em] uppercase block mb-3">
            Blog Archive
          </span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            All Blog Posts
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Explore all my articles on technology, coding tutorials, and insights from my journey as a developer.
          </p>
        </motion.div>

        {/* Search & Filter Controls */}
        {!loading && !error && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-12 space-y-6"
          >
            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-12 py-3.5 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all shadow-sm dark:text-white"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Category Filters */}
            {categories.length > 1 && (
              <div className="flex flex-wrap justify-center gap-3">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`
                      inline-flex items-center gap-2 px-5 py-2 rounded-full text-sm font-semibold
                      transition-all duration-300 border-2
                      ${selectedCategory === category
                        ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:text-primary'
                      }
                    `}
                  >
                    {category === 'All' && <Filter size={14} />}
                    <span>{category}</span>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${selectedCategory === category ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                      {category === 'All' 
                        ? posts.length 
                        : posts.filter(p => (p.category?.friendlyName || p.category?.name) === category).length
                      }
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Content Area */}
        <div className="min-h-[400px]">
          {loading ? (
            <BlogSkeleton />
          ) : error ? (
            <ErrorState message={error} onRetry={fetchPosts} />
          ) : filteredPosts.length === 0 ? (
            <EmptyState searchTerm={searchTerm} />
          ) : (
            <>
              {/* Results Count */}
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-gray-500 dark:text-gray-400 mb-8 text-center"
              >
                Showing <span className="font-semibold text-gray-700 dark:text-gray-200">{filteredPosts.length}</span> 
                {filteredPosts.length === 1 ? ' article' : ' articles'}
                {searchTerm && <span> for "<span className="text-primary">{searchTerm}</span>"</span>}
              </motion.p>

              {/* Posts Grid */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {filteredPosts.map((post, index) => (
                    <BlogCard key={post._id || index} post={post} index={index} />
                  ))}
                </AnimatePresence>
              </motion.div>
            </>
          )}
        </div>

        {/* Footer / Back to Top */}
        {!loading && !error && filteredPosts.length > 6 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-center mt-16"
          >
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="group inline-flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold rounded-full shadow-lg hover:shadow-xl border border-gray-100 dark:border-gray-700 transition-all duration-300 hover:text-primary"
            >
              <span>Back to Top</span>
              <ArrowRight size={18} className="rotate-[-90deg] group-hover:-translate-y-1 transition-transform duration-300" />
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default AllPosts;