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
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

interface ContentProviderProps {
  children: ReactNode;
}

export const ContentProvider: React.FC<ContentProviderProps> = ({ children }) => {
  const [content, setContent] = useState<ContentSections>(EMPTY_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 [useContent] Loading content from MongoDB API...');
      console.log('🔍 [useContent] API URL:', import.meta.env.VITE_API_URL || 'http://localhost:5000/api');
      
      const response = await contentService.getPublicContent();
      
      console.log('📡 [useContent] API Response received:', response);

      if (response.success && response.data) {
        console.log('✅ [useContent] Content loaded successfully from MongoDB!');
        
        // Log the content structure
        console.log('🎯 [useContent] MongoDB Content structure:');
        console.log('  - Hero slides:', response.data.hero?.slides?.length || 0);
        console.log('  - About section:', response.data.about?.title ? '✅' : '❌');
        console.log('  - Services:', response.data.services?.length || 0);
        console.log('  - Skills:', response.data.skills?.length || 0);
        console.log('  - Counter items:', response.data.counter?.length || 0);
        
        // Validate that we have essential content sections
        if (!response.data.hero?.slides || response.data.hero.slides.length === 0) {
          throw new Error('No hero slides found in MongoDB');
        }
        
        if (!response.data.skills || response.data.skills.length === 0) {
          throw new Error('No skills found in MongoDB');
        }

        console.log('📦 [useContent] Using MongoDB content exclusively');
        setContent(response.data);
        
        // Log successful load
        console.log('🎉 [useContent] MongoDB content state updated successfully!');
        
      } else {
        const errorMsg = response.error || 'API response missing data';
        console.error('❌ [useContent] Invalid API response:', errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      console.error('❌ [useContent] Failed to load content from MongoDB:', err);
      console.error('❌ [useContent] Error details:', {
        message: err instanceof Error ? err.message : 'Unknown error',
        stack: err instanceof Error ? err.stack : undefined
      });
      setError(err instanceof Error ? err.message : 'Failed to load content from MongoDB');
      
      // Set empty content instead of fallback defaults
      setContent(EMPTY_CONTENT);
      
      console.warn('⚠️ [useContent] Using empty content - MongoDB data required for frontend to display properly');
    } finally {
      setLoading(false);
      console.log('🏁 [useContent] Content loading finished');
    }
  };

  const refreshContent = async () => {
    await loadContent();
  };

  useEffect(() => {
    loadContent();
  }, []);

  const value: ContentContextType = {
    content,
    loading,
    error,
    refreshContent
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