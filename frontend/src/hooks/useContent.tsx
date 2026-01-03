import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { contentService, type ContentSections } from '../services/api_node';

// Empty content structure for when MongoDB is unavailable
const EMPTY_CONTENT: ContentSections = {
  hero: { slides: [], socialLinks: [] },
  about: { title: '', description: '', image: '', achievements: [] },
  services: [],
  counter: [],
  skills: []
};

interface ContentContextType {
  content: ContentSections;
  loading: boolean;
  error: string | null;
  refreshContent: () => Promise<void>;
  isReady: boolean; // True when content is loaded and has essential data
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

interface ContentProviderProps {
  children: ReactNode;
}

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  // Try to load cached content immediately for instant display
  const getCachedContent = (): ContentSections | null => {
    try {
      const cached = localStorage.getItem('content_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        const cacheTime = localStorage.getItem('content_cache_time');
        // Use cache if less than 5 minutes old
        if (cacheTime && Date.now() - parseInt(cacheTime) < 5 * 60 * 1000) {
          return parsed;
        }
      }
    } catch (e) {
      // Ignore cache errors
    }
    return null;
  };

  const cachedContent = getCachedContent();
  const [content, setContent] = useState<ContentSections>(cachedContent || EMPTY_CONTENT);
  const [loading, setLoading] = useState(!cachedContent); // Start with true if no cache
  const [error, setError] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false); // Track if content is ready
  const loadingRef = React.useRef(false); // Prevent multiple simultaneous loads

  const loadContent = async () => {
    // Prevent multiple simultaneous loads
    if (loadingRef.current) {
      return;
    }

    try {
      loadingRef.current = true;
      setLoading(true);
      setError(null);

      // Only log in development
      if (import.meta.env.DEV) {
        console.log('🔍 [useContent] Loading content...');
      }
      
      const response = await contentService.getPublicContent();

      if (response.success && response.data) {
        // Merge with defaults for any missing sections (non-blocking)
        const mergedContent: ContentSections = {
          hero: response.data.hero || EMPTY_CONTENT.hero,
          about: response.data.about || EMPTY_CONTENT.about,
          services: response.data.services || EMPTY_CONTENT.services,
          counter: response.data.counter || EMPTY_CONTENT.counter,
          skills: response.data.skills || EMPTY_CONTENT.skills
        };

        // Always update content - components handle empty states themselves
        setContent(mergedContent);
        
        // Content is ready once loaded
        setIsReady(true);
        
        // Cache the content for faster subsequent loads
        try {
          localStorage.setItem('content_cache', JSON.stringify(mergedContent));
          localStorage.setItem('content_cache_time', Date.now().toString());
        } catch (e) {
          // Ignore cache errors
        }
        
        if (import.meta.env.DEV) {
          console.log('✅ [useContent] Content loaded successfully', mergedContent);
        }
      } else {
        // Use cached content if available, otherwise use empty
        const cached = getCachedContent();
        if (cached) {
          setContent(cached);
        } else {
          setContent(EMPTY_CONTENT);
        }
        setError(response.error || 'Failed to load content');
        // Still mark as ready so app can render (with empty/error state)
        setIsReady(true);
      }
    } catch (err) {
      // Use cached content on error if available
      const cached = getCachedContent();
      if (cached) {
        setContent(cached);
        if (import.meta.env.DEV) {
          console.warn('⚠️ [useContent] Using cached content due to error');
        }
      } else {
        setContent(EMPTY_CONTENT);
      }
      setError(err instanceof Error ? err.message : 'Failed to load content');
      
      if (import.meta.env.DEV) {
        console.error('❌ [useContent] Error:', err);
      }
    } finally {
      setLoading(false);
      loadingRef.current = false;
      // Mark as ready once loading completes (even if there was an error)
      setIsReady(true);
    }
  };

  const refreshContent = async () => {
    await loadContent();
  };

  useEffect(() => {
    // If we have cached content, mark as ready immediately
    if (cachedContent) {
      setIsReady(true);
    }
    
    // Load content - if cached, show immediately and refresh in background
    const cached = getCachedContent();
    if (cached) {
      // We already set content from cache in useState, just refresh in background
      loadContent();
    } else {
      // No cache, load immediately
      loadContent();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value: ContentContextType = {
    content,
    loading,
    error,
    refreshContent,
    isReady
  };

  return (
    <ContentContext.Provider value={value}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = (): ContentContextType => {
  const context = useContext(ContentContext);
  if (context === undefined) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};

export default useContent;