import { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Sidebar from './components/Sidebar';
import Loader from './components/Loader';
import DarkModeToggle from './components/DarkMoodToggle';

const Home = lazy(() => import('./components/Home'));
const WorkForm = lazy(() => import('./components/AddWork'));
const BlogForm = lazy(() => import('./components/AddBlog'));
const AllPosts = lazy(() => import('./components/AllPosts'));

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 dark:text-[#b9b8b8]">
        <AnimatePresence>
          {loading && <Loader />}
        </AnimatePresence>

        <Sidebar />
        <DarkModeToggle />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/works/add" element={<WorkForm />} />
            <Route path="/blogs/add" element={<BlogForm />} />
            <Route path="/works/:id/edit" element={<WorkForm />} />
            <Route path="/all-posts" element={<AllPosts />} />
          </Routes>
        </Suspense>
      </div>
  );
}

export default App;