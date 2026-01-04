import { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ConstellationFieldBackground, ParticlesBackground } from 'interactive-backgrounds';

import Sidebar from './components/Sidebar';
import Home from './components/Home';
import WorkForm from './components/AddWork';
import Loader from './components/Loader';
import DarkModeToggle from './components/DarkMoodToggle';
import AllPosts from './components/AllPosts';
import BlogForm from './components/AddBlog';
import { ContentProvider, useContent } from './hooks/useContent';
import analytics from './services/analytics';

// Inner component for logic separation
function AppContent() {
  const { isReady, loading: contentLoading } = useContent();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [minLoadTimeElapsed, setMinLoadTimeElapsed] = useState(false);
  const location = useLocation();

  // Minimum loading time for smooth UX
  useEffect(() => {
    const timer = setTimeout(() => setMinLoadTimeElapsed(true), 1000);
    return () => clearTimeout(timer);
  }, []);

  // Handle Loader State
  useEffect(() => {
    if (isReady && minLoadTimeElapsed && !contentLoading) {
      const timer = setTimeout(() => {
        setAppLoading(false);
        document.body.classList.add('loaded');
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [isReady, minLoadTimeElapsed, contentLoading]);

  // Analytics
  useEffect(() => {
    analytics.initialize().catch(console.error);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  
  // Theme Observer
  useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    setIsDarkMode(document.documentElement.classList.contains('dark'));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-[#b9b8b8] transition-colors duration-300">
      
      {/* Background Layer */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <ConstellationFieldBackground
          particleColor={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.2)'}
          connectionColor={isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'}
          constfill={isDarkMode ? 'white' : 'black'}
        />
        <ParticlesBackground 
          particleCount={40} 
          connectionDistance={80}
          particleColor={isDarkMode ? 'rgba(255, 255, 255, 0.6)' : 'rgba(0, 0, 0, 0.2)'}
           />
        
      </div>

      <AnimatePresence>
        {appLoading && <Loader />}
      </AnimatePresence>

      <Sidebar />
      <DarkModeToggle />

      {/* Main Content Wrapper - Handles the Sidebar Offset Globally */}
      <main className="relative z-10 lg:ml-[300px] min-h-screen transition-all duration-300">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/works/add" element={<WorkForm />} />
          <Route path="/blogs/add" element={<BlogForm />} />
          <Route path="/works/:id/edit" element={<WorkForm />} />
          <Route path="/all-posts" element={<AllPosts />} />
        </Routes>
      </main>
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