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



function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  // Ensure cookies are included with every request.

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
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

  const rippleColor = isDarkMode
    ? 'rgba(255, 255, 255, 0.8)'
    : 'rgba(0, 0, 0, 0.4)';
    
  const colorsword = isDarkMode
    ? 'white'
    : 'black'

  return (

    <div className="min-h-screen bg-gray-50  dark:bg-gray-900 dark:text-[#b9b8b8]">
      
      <ConstellationFieldBackground
        particleColor={particleColor}
        connectionColor={connectionColor}
        rippleColor={rippleColor}
        color={particleColor}
        constfill={colorsword}
        // lineWidth ={10}
        text="THE ACJ"
      />
      <AnimatePresence>
        {loading && <Loader />}
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

export default App;