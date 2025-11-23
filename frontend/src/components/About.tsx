import '../assets/style.css'

import React from 'react';
import { useContent } from '../hooks/useContent';

const AnimatedDivider = () => (
  <div className="flex justify-center my-4">
    <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary rounded animate-pulse"></div>
  </div>
);

const About = () => {
  const { content, loading } = useContent();

  // Show loading state while content is being fetched
  if (loading) {
    return (
      <section id="about" className="py-20 bg-white dark:bg-gray-900 dark:text-[#b9b8b8]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <span className="ml-4 dark:text-[#b9b8b8]">Loading about content from MongoDB...</span>
          </div>
        </div>
      </section>
    );
  }

  // Show error state if no about content available
  if (!content.about.title && !content.about.description) {
    return (
      <section id="about" className="py-20 bg-white dark:bg-gray-900 dark:text-[#b9b8b8]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center text-gray-500 dark:text-[#b9b8b8]">
            <h2 className="text-2xl mb-4">No About Content Available</h2>
            <p>Please check your MongoDB content sections.</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900 dark:text-[#b9b8b8]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16 transform transition-all hover:scale-105 duration-300">
          <span className="text-sm text-gray-500 uppercase tracking-wider dark:text-[#b9b8b8]">
            About Me
          </span>
          <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            {content.about.title}
          </h2>
        </div>

        {/* Main Content */}
        {content.about.description && (
          <div className="mb-16 space-y-6">
            <div className="transform transition-all hover:scale-102 duration-300">
              <strong className="text-xl">Hello</strong> {content.about.description}
            </div>
          </div>
        )}

        {/* Achievements Section */}
        {content.about.achievements && content.about.achievements.length > 0 && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-center mb-8">Achievements</h3>
            <div className="grid md:grid-cols-2 gap-6">
              {content.about.achievements.map((achievement, index) => (
                <div key={index} className="bg-gradient-to-r from-primary/10 to-secondary/10 p-6 rounded-lg border border-primary/20">
                  <div className="flex items-center">
                    <i className="fas fa-trophy text-primary mr-3"></i>
                    <span className="font-medium">{achievement}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Call to Action Section */}
        <div className="mt-16 bg-gradient-to-r from-secondary to-yellow-300 p-8 rounded-lg shadow-lg transform transition-all hover:scale-102 duration-300">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6 dark:text-[#0f0f0f]">
              I am happy to inform you that 15+ projects are done successfully!
            </h2>
            <a
              href="https://wa.me/message/CR5WD4DPDZE7O1"
              className="inline-block px-8 py-3 bg-black text-white rounded dark:text-[#b9b8b8] hover:bg-gray-800 transition-colors group"
            >
              Hire me &nbsp;
              <i className="icon-briefcase transform group-hover:scale-110 inline-block transition-transform"></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;