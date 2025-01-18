import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

const skills = [
  { 
    name: "Graphic Tools", 
    value: 75, 
    iconClass: "icon-design_services"
  },
  { 
    name: "JavaScript", 
    value: 60, 
    iconClass: "icon-javascript"
  },
  { 
    name: "HTML5", 
    value: 85, 
    iconClass: "icon-html5"
  },
  { 
    name: "CSS3", 
    value: 90, 
    iconClass: "icon-css3"
  },
  { 
    name: "React", 
    value: 70, 
    iconClass: "icon-app_settings_alt"
  },
  { 
    name: "TypeScript", 
    value: 65, 
    iconClass: "icon-embed2"
  },
  { 
    name: "Django", 
    value: 85, 
    iconClass: "icon-django"
  },
  { 
    name: "Python", 
    value: 60, 
    iconClass: "icon-python"
  },
  { 
    name: "SQL", 
    value: 80, 
    iconClass: "icon-file-sql"
  },
  { 
    name: "Tableau", 
    value: 70, 
    iconClass: "icon-tableau"
  },
  { 
    name: "PowerBI", 
    value: 70, 
    iconClass: "icon-piechart"
  },
  { 
    name: "R", 
    value: 80, 
    iconClass: "icon-r"
  },
  { 
    name: "Rust", 
    value: 55, 
    iconClass: "icon-waterfall_chart"
  },
  { 
    name: "Solidity", 
    value: 50, 
    iconClass: "icon-network"
  }
];

const Skills = () => {
  const [isVisible, setIsVisible] = useState(false);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      setIsVisible(true);
    }
  }, [inView]);

  return (
    <section id="skills" ref={ref} className="py-20 bg-gray-50 dark:bg-gray-900 dark:text-[#b9b8b8]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm text-gray-500 uppercase tracking-wider dark:text-[#b9b8b8]">My Specialty</span>
          <h2 className="text-3xl font-bold mt-2">My Skills</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {skills.map((skill, index) => (
            <div key={index} className="mb-6">
              <div className="flex items-center mb-2">
                <i 
                  className={`${skill.iconClass} text-xl ${
                    index % 2 === 0 ? 'text-blue-500' : 'text-yellow-500'
                  }`}
                />
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
                    index % 2 === 0 ? 'border-blue-500 bg-blue-500' : 'border-yellow-500 bg-yellow-500'
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
        </div>
      </div>
    </section>
  );
};

export default Skills;