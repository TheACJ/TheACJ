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

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time
    const timer = setTimeout(() => {
      setLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (

    <div className="min-h-screen bg-gray-50  dark:bg-gray-900 dark:text-[#b9b8b8]">
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