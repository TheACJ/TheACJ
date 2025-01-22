import { Menu, Github, Twitter, Linkedin, Facebook } from 'lucide-react';
import { useState, useEffect } from 'react';
import about from '../assets/img/about.jpg';
import logo from '../assets/img/logo.png';
import "../assets/style.css";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');
  
  const menuItems = [
    { href: '/', text: 'Home' },
    { href: '#about', text: 'About' },
    { href: '#services', text: 'Services' },
    { href: '#skills', text: 'Skills' },
    { href: '#work', text: 'Work' },
    { href: '#blog', text: 'Gallery' },
    { href: '#contact', text: 'Contact' },
  ];

  // Function to check which section is currently in view
  const checkActiveSection = () => {
    const sections = menuItems
      .filter(item => item.href !== '/')  // Skip the home href, because it can't be used with querySelector
      .map(item => document.querySelector(item.href) as HTMLElement);
      
    const scrollPosition = window.scrollY + window.innerHeight / 2; // Adjust for middle of the viewport

    sections.forEach((section, index) => {
      if (section) {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.clientHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          setActiveSection(menuItems[index + 1].href); // Adjust index to match menuItems after filtering
        }
      }
    });
  };

  // Scroll event listener to check active section
  useEffect(() => {
    window.addEventListener('scroll', checkActiveSection);

    // Cleanup listener on component unmount
    return () => {
      window.removeEventListener('scroll', checkActiveSection);
    };
  }, []);

  // Function to handle active section on click
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2"
      >
        <Menu size={24} />
      </button>

      <aside
        className={`
          fixed top-0 left-0 h-full w-[300px] bg-gray-50 p-8 overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} dark:bg-gray-900 dark:text-[#b9b8b8]
          z-40
        `}
      >
        <div className="text-center">
          <div
            className="w-[150px] h-[150px] mx-auto rounded-full bg-cover bg-center mb-6 relative bg-no-repeat z-50 hover:shadow-xl transition-shadow duration-300"
            style={{ backgroundImage: `url("${about}")` }}
          />
          <img src={logo} alt="ACJ Logo" className="w-8 h-8 mx-auto" />
          <h1 className="text-2xl font-bold mt-4 mb-2">THE ACJ</h1>
          <p className="text-sm text-gray-600 italic dark:text-[#b9b8b8]">
            Data Analyst &nbsp; <span className="icon-chart text-blue-800"> </span> <br /> Web Developer &nbsp;{" "}
            <span className="icon-global text-blue-800"></span> <br /> Blockchain Developer &nbsp;{" "}
            <span className="icon-globe1 text-blue-800"></span>
          </p>
        </div>

        <nav className="mt-8">
          <ul className="space-y-4 text-center">
            {menuItems.map((item, index) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => handleSectionChange(item.href)} // Track active section
                  className={`
                    text-sm font-semibold uppercase tracking-wider 
                    text-gray-700 dark:text-[#b9b8b8] hover:text-blue-600 
                    transition-colors
                    ${activeSection === item.href ? (index % 2 === 0 ? 'border-b-4 border-blue-600' : 'border-b-4 border-yellow-500') : ''}
                  `}
                >
                  {item.text}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <footer className="mt-12 text-center">
          <p className="text-sm text-gray-500 mb-4 dark:text-[#b9b8b8]">
            &copy; {new Date().getFullYear()} All rights reserved.<br />
            Made with ❤️ by The ACJ
          </p>
          <div className="flex justify-center space-x-4">
            <a href="https://facebook.com/joshua.agbai.3" className="text-yellow-600 hover:text-blue-600">
              <Facebook size={20} />
            </a>
            <a href="https://twitter.com/realACJoshua" className="text-yellow-600 hover:text-blue-600">
              {/* <Twitter size={20} /> */} <i className='icon-x'></i>
            </a>
            <a href="https://github.com/TheACJ" className="text-yellow-600 hover:text-blue-600">
              <Github size={20} />
            </a>
            <a href="#" className="text-yellow-600 hover:text-blue-600">
              <Linkedin size={20} />
            </a>
          </div>
        </footer>
      </aside>
    </>
  );
};

export default Sidebar;
