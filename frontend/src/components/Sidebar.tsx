import { Menu, Github, Twitter, Linkedin, Facebook, X } from 'lucide-react';
import { useState, useEffect, useRef, useCallback } from 'react';
import about from '../assets/img/about.jpg';
import logo from '../assets/img/logo.png';
import "../assets/style.css";

// --- Configuration Constants ---
const MENU_ITEMS = [
  { href: '/', text: 'Home', id: 'home' }, // 'id' helps with scroll detection if you have a top div
  { href: '#about', text: 'About', id: 'about' },
  { href: '#services', text: 'Services', id: 'services' },
  { href: '#skills', text: 'Skills', id: 'skills' },
  { href: '#work', text: 'Work', id: 'work' },
  { href: '#blog', text: 'Gallery', id: 'blog' },
  { href: '#contact', text: 'Contact', id: 'contact' },
];

const SOCIAL_LINKS = [
  { href: "https://facebook.com/joshua.agbai.3", icon: <Facebook size={20} />, label: "Facebook" },
  { href: "https://twitter.com/realACJoshua", icon: <i className='icon-x not-italic text-lg'></i>, label: "X (Twitter)" }, // Preserved your custom icon class
  { href: "https://github.com/TheACJ", icon: <Github size={20} />, label: "Github" },
  { href: "#", icon: <Linkedin size={20} />, label: "LinkedIn" },
];

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('/');
  const sidebarRef = useRef<HTMLDivElement>(null);

  // --- Logic: Handle Scroll Detection ---
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY + 150; // Offset trigger point

    // Special check for top of page (Home)
    if (window.scrollY < 100) {
      setActiveSection('/');
      return;
    }

    // Check other sections
    MENU_ITEMS.forEach((item) => {
      if (item.href === '/') return;
      
      const targetId = item.href.replace('#', '');
      const element = document.getElementById(targetId);

      if (element) {
        const { offsetTop, offsetHeight } = element;
        if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
          setActiveSection(item.href);
        }
      }
    });
  }, []);

  // Performance: Use requestAnimationFrame for smoother scroll handling
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, [handleScroll]);

  // --- Logic: Click Outside to Close (Mobile) ---
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (isOpen && sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // --- Logic: Navigation Click Handler ---
  const handleNavClick = (href: string) => {
    setActiveSection(href);
    setIsOpen(false); // Close sidebar on mobile when link is clicked
  };

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle Navigation"
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-50/90 dark:bg-gray-900/90 rounded-md shadow-md hover:text-blue-600 transition-colors"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay (Backdrop) */}
      <div 
        className={`
          fixed inset-0 bg-black/50 z-30 transition-opacity duration-300 lg:hidden
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        aria-hidden="true"
      />

      {/* Sidebar Container */}
      <aside
        ref={sidebarRef}
        className={`
          fixed top-0 left-0 h-full w-[300px] bg-gray-50 dark:bg-gray-900 dark:text-[#b9b8b8]
          p-8 overflow-y-auto z-40 shadow-2xl lg:shadow-none
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Header Section */}
        <div className="text-center flex flex-col items-center">
          <div className="relative group cursor-pointer">
            <div
              className="w-[150px] h-[150px] rounded-full bg-cover bg-center mb-6 relative z-10 
                         shadow-lg group-hover:shadow-blue-500/30 transition-shadow duration-300 border-4 border-gray-200 dark:border-gray-800"
              style={{ backgroundImage: `url("${about}")` }}
              role="img"
              aria-label="Profile Picture"
            />
            {/* Optional glowing effect behind image */}
            <div className="absolute inset-0 rounded-full bg-blue-500 opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-300"></div>
          </div>

          <img src={logo} alt="ACJ Logo" className="w-8 h-8 mb-2" />
          
          <h1 className="text-2xl font-bold mb-2 tracking-tight text-gray-900 dark:text-white">
            THE ACJ
          </h1>
          
          <div className="text-sm text-gray-600 italic dark:text-[#b9b8b8] leading-relaxed">
            <span className="flex items-center justify-center gap-2">
              Software Engineering <span className="icon-toolbox1 text-blue-800 dark:text-blue-500" />
            </span>
            <span className="flex items-center justify-center gap-2">
              Web Developer <span className="icon-global text-blue-800 dark:text-blue-500" />
            </span>
            <span className="flex items-center justify-center gap-2">
              Blockchain Developer <span className="icon-globe1 text-blue-800 dark:text-blue-500" />
            </span>
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="mt-8" role="navigation">
          <ul className="space-y-4 text-center">
            {MENU_ITEMS.map((item, index) => {
              const isActive = activeSection === item.href;
              // Logic for alternating border colors (Blue vs Yellow)
              const activeBorderClass = index % 2 === 0 
                ? 'border-blue-600 dark:border-blue-500 text-blue-700 dark:text-white' 
                : 'border-yellow-500 text-yellow-700 dark:text-yellow-500';

              return (
                <li key={item.href}>
                  <a
                    href={item.href}
                    onClick={() => handleNavClick(item.href)}
                    className={`
                      block py-1 text-sm font-semibold uppercase tracking-wider 
                      transition-all duration-200 border-b-2 border-transparent
                      hover:text-blue-600 dark:hover:text-white
                      ${isActive 
                        ? `${activeBorderClass} border-b-4` 
                        : 'text-gray-700 dark:text-[#b9b8b8]'}
                    `}
                  >
                    {item.text}
                  </a>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer / Socials */}
        <footer className="mt-12 text-center">
          <p className="text-xs text-gray-500 mb-6 dark:text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} All rights reserved.<br />
            Made with ❤️ by The ACJ
          </p>
          
          <div className="flex justify-center items-center space-x-5">
            {SOCIAL_LINKS.map((social, idx) => (
              <a 
                key={idx}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-white transform hover:scale-110 transition-transform duration-200"
              >
                {social.icon}
              </a>
            ))}
          </div>
        </footer>
      </aside>
    </>
  );
};

export default Sidebar;