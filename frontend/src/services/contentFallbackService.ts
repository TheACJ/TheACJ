/**
 * Content Fallback Service
 * Provides fallback content when the backend API is unavailable
 */

import contentFallback from '../data/content-fallback.json';

export interface ContentSections {
  hero: {
    slides: Array<{
      title: string;
      subtitle: string;
      description: string;
      bgImage: string;
      buttonText: string;
      buttonIcon: string;
      buttonLink: string;
    }>;
    socialLinks: Array<{
      platform: string;
      url: string;
      icon: string;
    }>;
  };
  about: {
    title: string;
    description: string;
    image: string;
    achievements: string[];
  };
  services: Array<{
    title: string;
    description: string;
    icon: string;
    order: number;
  }>;
  counter: Array<{
    title: string;
    value: string;
    icon: string;
  }>;
  skills: Array<{
    name: string;
    level: number;
    icon: string;
  }>;
}

export class ContentFallbackService {
  private static instance: ContentFallbackService;
  private content: ContentSections | null = null;

  static getInstance(): ContentFallbackService {
    if (!ContentFallbackService.instance) {
      ContentFallbackService.instance = new ContentFallbackService();
    }
    return ContentFallbackService.instance;
  }

  async getContent(): Promise<ContentSections> {
    if (this.content) {
      return this.content;
    }

    try {
      // Try to load from JSON file
      this.content = contentFallback.data as ContentSections;
      return this.content;
    } catch (error) {
      console.warn('Failed to load fallback content:', error);
      return this.getDefaultContent();
    }
  }

  private getDefaultContent(): ContentSections {
    return {
      hero: {
        slides: [
          {
            title: "Hi!",
            subtitle: "The ACJ",
            description: "With us Tech Emancipation is achievable",
            bgImage: "/assets/img/theacj.jpg",
            buttonText: "View CV",
            buttonIcon: "icon-download",
            buttonLink: "/assets/JoshuaAgbai.pdf"
          },
          {
            title: "I am a",
            subtitle: "Software Engineer",
            description: "Crafting Reliable Software from concept to production readiness",
            bgImage: "/assets/img/software-engineer.jpg",
            buttonText: "View Portfolio",
            buttonIcon: "icon-briefcase",
            buttonLink: "#work"
          },
          {
            title: "I am a",
            subtitle: "Full-Stack Developer",
            description: "Imagine it, The ACJ will make it real",
            bgImage: "/assets/img/web2.jpg",
            buttonText: "View Portfolio",
            buttonIcon: "icon-briefcase",
            buttonLink: "#work"
          },
          {
            title: "I am a",
            subtitle: "Web3 Developer",
            description: "Building worldclass solution using Blockchain Technology",
            bgImage: "/assets/img/Web3.webp",
            buttonText: "View Portfolio",
            buttonIcon: "icon-briefcase",
            buttonLink: "#work"
          }
        ],
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
          "5+ Years of Programming Experience",
          "10+ Projects Completed",
          "Multiple Technology Certifications",
          "Full-Stack Development Expertise"
        ]
      },
      services: [
        {
          title: "Software Engineering",
          description: "Transform concept into production ready applications and utilities",
          icon: "fas fa-chart-bar",
          order: 1
        },
        {
          title: "Full-Stack Web Development",
          description: "Build responsive, modern web applications using React, Node.js, Django, MongoDB and other cutting-edge technologies.",
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
          title: "API and MicroService Development",
          description: "Create robust and scalable RESTful APIs, GraphQL and micro services for modern solutions and applications.",
          icon: "fas fa-cogs",
          order: 4
        }
      ],
      counter: [
        { title: "Projects Completed", value: "10+", icon: "fas fa-project-diagram" },
        { title: "Happy Clients", value: "7+", icon: "fas fa-smile" },
        { title: "Years Experience", value: "5+", icon: "fas fa-calendar" },
        { title: "Technologies", value: "15+", icon: "fas fa-laptop-code" }
      ],
      skills: [
        { name: "Python", level: 95, icon: "fab fa-python" },
        { name: "JavaScript", level: 90, icon: "fab fa-js" },
        { name: "React", level: 88, icon: "fab fa-react" },
        { name: "TypeScript", level: 88, icon: "fab fa-js-square" },
        { name: "HTML5", level: 92, icon: "fab fa-html5" },
        { name: "CSS3", level: 90, icon: "fab fa-css3-alt" },
        { name: "Git", level: 92, icon: "fab fa-git-alt" },
        { name: "Nodejs", level: 85, icon: "fab fa-node-js" },
        { name: "Django", level: 80, icon: "fab fa-django" },
        { name: "MongoDB", level: 80, icon: "fas fa-database" },
        { name: "Expressjs", level: 82, icon: "fab fa-node-js" },
        { name: "API Development", level: 85, icon: "fas fa-cogs" },
        { name: "SQL", level: 85, icon: "fas fa-database" },
        { name: "Tailwind CSS", level: 85, icon: "fab fa-tailwind" },
        { name: "GitHub", level: 90, icon: "fab fa-github" },
        { name: "PostgreSQL", level: 78, icon: "fas fa-database" },
        { name: "Bootstrap", level: 75, icon: "fab fa-bootstrap" },
        { name: "GraphQL", level: 75, icon: "fas fa-project-diagram" },
        { name: "MySQL", level: 75, icon: "fas fa-database" },
        { name: "R", level: 70, icon: "fas fa-chart-line" },
        { name: "Redis", level: 70, icon: "fas fa-database" },
        { name: "Solidity", level: 65, icon: "fab fa-ethereum" },
        { name: "AWS", level: 65, icon: "fab fa-aws" },
        { name: "Docker", level: 68, icon: "fab fa-docker" },
        { name: "Web3", level: 65, icon: "fas fa-link" },
        { name: "Rust", level: 70, icon: "fas fa-link" }
      ]
    };
  }

  /**
   * Check if fallback content is available
   */
  isFallbackAvailable(): boolean {
    try {
      return !!contentFallback && !!contentFallback.data;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get the last modified time of the fallback file (if available)
   */
  getLastModified(): string {
    try {
      // This would need to be implemented based on your file system access
      // For now, return a placeholder
      return new Date().toISOString();
    } catch (error) {
      return 'Unknown';
    }
  }
}

// Export singleton instance
export const contentFallbackService = ContentFallbackService.getInstance();