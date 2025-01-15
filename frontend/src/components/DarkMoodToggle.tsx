import React, { useState, useEffect } from 'react';
// import '../assets/button.css'
import "../assets/style.css"


const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem('darkMode');
    return savedMode ? JSON.parse(savedMode) : false;
  });

  useEffect(() => {
    // Update document root class and save preference
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#121212';
      
      document.body.style.color = '#ffffff';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    }
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };


  return (
    <div className="toggle-button-cover">
        <div className="button-cover">
            <div className="button r" id="button-1">
                <input type="checkbox" className="checkbox" 
                checked={darkMode}
                onChange={toggleDarkMode}/>
                <div className="knobs"><i></i></div>
                <div className="layer"></div>
            </div>
        </div>
    </div>

/*     <button
      onClick={toggleDarkMode}
      className="p-2 rounded-lg bg-gray-800 text-white dark:bg-gray-400 dark:text-black transition-colors duration-300 right-0"
    >
      {darkMode ? '🌙 Dark Mode' : '☀️ Light Mode'}
    </button> */
  );
};

export default DarkModeToggle;
