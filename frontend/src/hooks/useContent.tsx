import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { contentService } from '../services/api_node';
import { type ContentSections } from '../services/contentFallbackService';
import contentFallback from '../data/content-fallback.json';

// Fallback content structure for when API is unavailable
const FALLBACK_CONTENT: ContentSections = contentFallback.data as ContentSections;

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
  const [content, setContent] = useState<ContentSections>(cachedContent || FALLBACK_CONTENT);
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
          hero: response.data.hero || FALLBACK_CONTENT.hero,
          about: response.data.about || FALLBACK_CONTENT.about,
          services: response.data.services || FALLBACK_CONTENT.services,
          counter: response.data.counter || FALLBACK_CONTENT.counter,
          skills: response.data.skills || FALLBACK_CONTENT.skills
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
        // Use cached content if available, otherwise use fallback
        const cached = getCachedContent();
        if (cached) {
          setContent(cached);
        } else {
          setContent(FALLBACK_CONTENT);
        }
        setError(null); // No error since we provide fallback content
        // Still mark as ready so app can render
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
        setContent(FALLBACK_CONTENT);
      }
      setError(null); // No error since we provide content
      
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