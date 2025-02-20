import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import nodejs from '../assets/img/Node.js.svg';
import solidity from '../assets/img/Solidity.svg';
import djangorest from '../assets/img/Django REST.svg';
import reactlogo from '../assets/img/React.svg';
import rustlogo from '../assets/img/Rust.svg';
import tailwind from '../assets/img/Tailwind.svg';
import typescript from '../assets/img/TypeScript.svg';
import expressjs from '../assets/img/Express.svg';
import excel from '../assets/img/icons8-excel.svg'
import pandas from '../assets/img/Pandas.svg'
// import numpy from '../assets/img/Numpy.svg' ??
import matplotlib from '../assets/img/Matplotlib.svg'
import jupyter from '../assets/img/Jupyter.svg'

const skillsData = {
  "Programming Languages": [
    { name: "JavaScript", value: 75, icon: "icon-javascript", type: "icomoon" },
    { name: "Python", value: 75, icon: "icon-python", type: "icomoon" },
    { name: "TypeScript", value: 65, icon: typescript, type: "svg" },
    { name: "R", value: 80, icon: "icon-r", type: "icomoon" },
    { name: "Rust", value: 60, icon: rustlogo, type: "svg" },
    { name: "Solidity", value: 50, icon: solidity, type: "svg" }
  ],
  "Frontend & Markup": [
    { name: "HTML5", value: 85, icon: "icon-html5", type: "icomoon" },
    { name: "CSS3", value: 90, icon: "icon-css3", type: "icomoon" },
    { name: "React", value: 70, icon: reactlogo, type: "svg" },
    { name: "Tailwind CSS", value: 75, icon: tailwind, type: "svg" }
  ],
  "Data Analytics & Data Science": [
    { name: "SQL", value: 70, icon: "icon-mysql", type: "icomoon" },
    { name: "Tableau", value: 60, icon: "icon-tableau", type: "icomoon" },
    { name: "PowerBI", value: 70, icon: "icon-googleanalytics", type: "icomoon" },
    { name: "Excel", value: 75, icon: excel, type: "svg" },
    { name: "Matplotlib", value: 65, icon: matplotlib, type: "svg" },
    // { name: "NumPy", value: 60, icon: numpy, type: "svg" },
    { name: "Pandas", value: 65, icon: pandas, type: "svg" },
    { name: "Jupyter", value: 70, icon: jupyter, type: "svg" }
  ],
  "Frameworks & Backend": [
    { name: "Django Rest", value: 85, icon: djangorest, type: "svg" },
    { name: "Node.js", value: 75, icon: nodejs, type: "svg" },
    { name: "Express.js", value: 70, icon: expressjs, type: "svg" }
  ]
};

const Skills = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Programming Languages");
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      setIsVisible(true);
    }
  }, [inView]);

  const renderIcon = (skill, isEven) => {
    if (skill.type === "icomoon") {
      return (
        <i
          className={`${skill.icon} text-xl ${
            isEven ? 'text-blue-500' : 'text-yellow-500'
          }`}
        />
      );
    } else {
      return (
        <img 
          src={skill.icon} 
          alt={skill.name}
          className={`w-6 h-6 ${
            isEven ? 'filter-blue-500' : 'filter-yellow-500'
          }`}
        />
      );
    }
  };

  return (
    <section id="skills" ref={ref} className="py-20 bg-gray-50 dark:bg-gray-900 dark:text-[#b9b8b8]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm text-gray-500 uppercase tracking-wider dark:text-[#b9b8b8]">
            My Specialty
          </span>
          <h2 className="text-3xl font-bold mt-2">My Skills</h2>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {Object.keys(skillsData).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <motion.div
          className="grid md:grid-cols-2 gap-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {skillsData[selectedCategory].map((skill, index) => (
            <div key={`${selectedCategory}-${skill.name}`} className="mb-6">
              <div className="flex items-center mb-2">
                {renderIcon(skill, index % 2 === 0)}
                <h3 className="text-lg font-semibold ml-2">{skill.name}</h3>
              </div>
              <div className="bg-gray-200 rounded-full h-2.5 relative dark:bg-gray-900">
                <motion.div 
                  className={`h-2.5 rounded-full ${
                    index % 2 === 0 ? 'bg-blue-500' : 'bg-yellow-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: isVisible ? `${skill.value}%` : 0 }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
                <motion.div
                  className={`absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full border-2 ${
                    index % 2 === 0
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-yellow-500 bg-yellow-500'
                  }`}
                  initial={{ left: 0 }}
                  animate={{ left: isVisible ? `${skill.value}%` : 0 }}
                  transition={{ duration: 1, delay: index * 0.1 }}
                />
              </div>
              <motion.span 
                className="text-sm text-gray-600 mt-1 block dark:text-[#b9b8b8]"
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {skill.value}%
              </motion.span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;