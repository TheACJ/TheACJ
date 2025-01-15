import { useState, useEffect } from 'react';
import { WorkItem } from '../../types';
import { workApi } from '../../services/api/workApi';

export const useWorkItems = () => {
  const [posts, setPosts] = useState<WorkItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
 
  
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const data = await workApi.getWorkItems();
        setPosts(data);
      } catch (err) {
        setError('Failed to fetch blog posts');
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);
  useEffect(() => {
    if (selectedCategory) {
      const timer = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % 4);
      }, 3000);

      return () => clearInterval(timer);
    }
  }, [selectedCategory]);

  useEffect(() => {
    setCurrentSlide(0);
  }, [selectedCategory]);


  return { posts, loading, error };
};