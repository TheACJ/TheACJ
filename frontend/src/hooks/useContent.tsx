import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { contentService, type ContentSections } from '../services/api_node';

// Default content values (preserving existing content)
const DEFAULT_CONTENT: ContentSections = {
  hero: {
    title: "Joshua Agbai",
    subtitle: "Data Analyst & Web Developer",
    description: "Transforming data into insights and building exceptional web experiences with modern technologies and innovative solutions.",
    image: "/assets/img/theacj.jpg",
    ctaText: "Explore My Work",
    ctaLink: "#work",
    socialLinks: [
      { platform: "GitHub", url: "https://github.com/TheACJ", icon: "fab fa-github" },
      { platform: "LinkedIn", url: "https://linkedin.com/in/joshuaagbai", icon: "fab fa-linkedin" },
      { platform: "Twitter", url: "https://twitter.com/realACJoshua", icon: "fab fa-twitter" }
    ]
  },
  about: {
    title: "About Me",
    description: "I'm a passionate Data Analyst and Web Developer with expertise in transforming complex data into actionable insights and creating responsive web applications. With experience in Python, JavaScript, and modern frameworks, I bridge the gap between data science and web development.",
    image: "/assets/img/about.jpg",
    achievements: [
      "3+ Years of Data Analysis Experience",
      "50+ Projects Completed",
      "Multiple Technology Certifications",
      "Full-Stack Development Expertise"
    ]
  },
  services: [
    {
      title: "Data Analysis",
      description: "Transform raw data into meaningful insights using Python, Pandas, NumPy, and visualization tools.",
      icon: "fas fa-chart-bar",
      order: 1
    },
    {
      title: "Web Development",
      description: "Build responsive, modern web applications using React, Node.js, and cutting-edge technologies.",
      icon: "fas fa-code",
      order: 2
    },
    {
      title: "Blockchain Development",
      description: "Develop decentralized applications and smart contracts using Solidity and Web3 technologies.",
      icon: "fas fa-link",
      order: 3
    },
    {
      title: "API Development",
      description: "Create robust and scalable RESTful APIs and GraphQL services for modern applications.",
      icon: "fas fa-cogs",
      order: 4
    }
  ],
  counter: [
    { title: "Projects Completed", value: "50+", icon: "fas fa-project-diagram" },
    { title: "Happy Clients", value: "30+", icon: "fas fa-smile" },
    { title: "Years Experience", value: "3+", icon: "fas fa-calendar" },
    { title: "Technologies", value: "15+", icon: "fas fa-laptop-code" }
  ],
  skills: [
    { name: "Python", level: 95, icon: "fab fa-python" },
    { name: "JavaScript", level: 90, icon: "fab fa-js" },
    { name: "React", level: 88, icon: "fab fa-react" },
    { name: "Node.js", level: 85, icon: "fab fa-node-js" },
    { name: "MongoDB", level: 80, icon: "fas fa-database" },
    { name: "Django", level: 75, icon: "fab fa-django" },
    { name: "TypeScript", level: 82, icon: "fab fa-js-square" },
    { name: "Git", level: 92, icon: "fab fa-git-alt" }
  ]
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
  const [content, setContent] = useState<ContentSections>(DEFAULT_CONTENT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await contentService.getPublicContent();

      if (response.success && response.data) {
        // Merge with defaults to ensure all sections are present
        const mergedContent: ContentSections = {
          hero: { ...DEFAULT_CONTENT.hero, ...response.data.hero },
          about: { ...DEFAULT_CONTENT.about, ...response.data.about },
          services: response.data.services?.length ? response.data.services : DEFAULT_CONTENT.services,
          counter: response.data.counter?.length ? response.data.counter : DEFAULT_CONTENT.counter,
          skills: response.data.skills?.length ? response.data.skills : DEFAULT_CONTENT.skills
        };

        setContent(mergedContent);
      } else {
        // Use defaults if API fails
        setContent(DEFAULT_CONTENT);
      }
    } catch (err) {
      console.warn('Failed to load content from API, using defaults:', err);
      setError(err instanceof Error ? err.message : 'Failed to load content');
      // Keep defaults on error
      setContent(DEFAULT_CONTENT);
    } finally {
      setLoading(false);
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