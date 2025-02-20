
import '../assets/style.css'

import React from 'react';

const AnimatedDivider = () => (
  <div className="flex justify-center my-4">
    <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-yellow-400 rounded animate-pulse"></div>
  </div>
);

const About = () => {
  return (
    <section id="about" className="py-20 bg-white dark:bg-gray-900 dark:text-[#b9b8b8]">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16 transform transition-all hover:scale-105 duration-300">
          <span className="text-sm text-gray-500 uppercase tracking-wider dark:text-[#b9b8b8]">
            About Me
          </span>
          <h2 className="text-3xl font-bold mt-2 bg-gradient-to-r from-blue-600 to-yellow-400 bg-clip-text text-transparent">
            Meet The ACJ!
          </h2>
        </div>

        {/* Main Content */}
        <div className="mb-16 space-y-6">
          <div className="transform transition-all hover:scale-102 duration-300">
            <strong className="text-xl">Hello</strong> I am Agbai Chisom Joshua - The ACJ a tech professional passionate about making digital technology accessible and user-friendly. My expertise spans web development, data analytics, and blockchain innovation.
          </div>

          <AnimatedDivider />

          <div className="transform transition-all hover:scale-102 duration-300">
            <span className="font-semibold text-blue-600 dark:text-blue-400">Web Development:</span>{" "}
            I build websites and apps using Django, React, and Tailwind CSS, creating intuitive digital experiences from frontend design to backend functionality.
          </div>

          <AnimatedDivider />

          <div className="transform transition-all hover:scale-102 duration-300">
            <span className="font-semibold text-blue-600 dark:text-blue-400">Data Analytics:</span>{" "}
            Using Python and Excel, I transform raw data into strategic insights, helping businesses make smarter decisions by uncovering hidden patterns.
          </div>

          <AnimatedDivider />

          <div className="transform transition-all hover:scale-102 duration-300">
            <span className="font-semibold text-blue-600 dark:text-blue-400">Blockchain & Web3:</span>{" "}
            I'm exploring the next digital frontier, developing projects that simplify blockchain technology and create meaningful connections in the Web3 ecosystem.
          </div>

          <AnimatedDivider />

          <div className="transform transition-all hover:scale-102 duration-300 text-center font-medium italic">
            My core mission? To bridge technology and human potential, making complex digital solutions simple and engaging for everyone.
          </div>
        </div>

        {/* Call to Action Section */}
        <div className="mt-16 bg-gradient-to-r from-yellow-400 to-yellow-300 p-8 rounded-lg shadow-lg transform transition-all hover:scale-102 duration-300">
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