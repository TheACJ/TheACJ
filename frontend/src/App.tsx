import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Home from './components/Home';
// import WorkForm from './components/WorkItemForm';
import WorkForm from './components/AddWork';
import Loader from './components/Loader';
import DarkModeToggle from './components/DarkMoodToggle';
import AllPosts from './components/AllPosts';
import BlogForm from './components/AddBlog';
// import ParticlesBackground from 'interactive-backgrounds';
import { ConstellationFieldBackground  } from 'interactive-backgrounds';
import { ContentProvider, useContent } from './hooks/useContent';
import analytics from './services/analytics'; // Import analytics service

// Inner component that has access to content context
function AppContent() {
  const { isReady, loading: contentLoading } = useContent();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [minLoadTimeElapsed, setMinLoadTimeElapsed] = useState(false);

  // Minimum loading time for smooth UX (500ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setMinLoadTimeElapsed(true);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Wait for content to be ready AND minimum load time
  useEffect(() => {
    if (isReady && minLoadTimeElapsed && !contentLoading) {
      // Small delay to ensure smooth transition
      const timer = setTimeout(() => {
        setAppLoading(false);
        // Add 'loaded' class to body for loader animation
        document.body.classList.add('loaded');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isReady, minLoadTimeElapsed, contentLoading]);

  // Initialize analytics
  useEffect(() => {
    console.log('[App] Initializing analytics service...');
    analytics.initialize().catch(error => {
      console.error('[App] Failed to initialize analytics:', error);
    });
  }, []);
  
  useEffect(() => {
    // Assuming dark mode is controlled by adding 'dark' class on <html>
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark');
      setIsDarkMode(isDark);
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    });

    // Initial check
    setIsDarkMode(document.documentElement.classList.contains('dark'));

    return () => observer.disconnect();
  }, []);

  const particleColor = isDarkMode
    ? 'rgba(255, 255, 255, 0.8)'   // white particles for dark mode
    : 'rgba(0, 0, 0, 0.3)';        // blackish particles for light mode

  const connectionColor = isDarkMode
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.05)';
    
  const colorsword = isDarkMode
    ? 'white'
    : 'black';

  return (
    <div className="min-h-screen bg-gray-50  dark:bg-gray-900 dark:text-[#b9b8b8]">
      <ConstellationFieldBackground
        particleColor={particleColor}
        connectionColor={connectionColor}
        constfill={colorsword}
      />
      <AnimatePresence>
        {appLoading && <Loader />}
      </AnimatePresence>

      <Sidebar />
      <DarkModeToggle />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/works/add" element={<WorkForm />} />
        <Route path="/blogs/add" element={<BlogForm />} />
        <Route path="/works/:id/edit" element={<WorkForm />} />
        <Route path="/all-posts" element={<AllPosts />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <ContentProvider>
      <AppContent />
    </ContentProvider>
  );
}

export default App;