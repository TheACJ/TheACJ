import { useState, useEffect } from 'react';
import { WorkItem } from '../../types';
import { workApi } from '../../services/api/workApi';

interface UseWorkItem {
  id: number;
}

const useWorkItem = ({ id }: UseWorkItem) => {
  const [post, setPost] = useState<WorkItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await workApi.getWorkItemById(id);
        setPost(response);
      } catch (err) {
        setError('Failed to fetch blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [id]);

  return { post, loading, error };
};

export { useWorkItem };
