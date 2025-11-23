import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useContent } from '../hooks/useContent';

interface CategorizedSkills {
  [category: string]: Array<{
    name: string;
    level: number;
    icon: string;
  }>;
}

// Skill categorization logic
const categorizeSkills = (skills: Array<{ name: string; level: number; icon: string }>): CategorizedSkills => {
  const categories: CategorizedSkills = {
    "Programming Languages": [],
    "Frontend Technologies": [],
    "Backend Technologies": [],
    "Databases": [],
    "Data Science": [],
    "DevOps & Cloud": [],
    "Blockchain": [],
    "Tools & Version Control": [],
    "Soft Skills": [],
    "Others": []
  };

  skills.forEach(skill => {
    const name = skill.name.toLowerCase();
    
    if (name.includes('python') || name.includes('javascript') || name.includes('typescript')  || name.includes('rust')) {
      categories["Programming Languages"].push(skill);
    } else if (name.includes('html') || name.includes('css') || name.includes('react') || name.includes('tailwind') || name.includes('bootstrap') || name.includes('responsive')) {
      categories["Frontend Technologies"].push(skill);
    } else if (name.includes('node') || name.includes('express') || name.includes('django') || name.includes('api') || name.includes('full-stack')) {
      categories["Backend Technologies"].push(skill);
    } else if (name.includes('mongodb') || name.includes('postgresql') || name.includes('mysql') || name.includes('redis') || name.includes('sql')) {
      categories["Databases"].push(skill);
    } /*else if (name.includes('pandas') || name.includes('numpy') || name.includes('matplotlib') || name.includes('jupyter') || name.includes('excel') || name.includes('data visualization')) {
      categories["Data Science"].push(skill);
    } */ else if (name.includes('docker') || name.includes('aws') || name.includes('git') || name.includes('github')) {
      categories["DevOps & Cloud"].push(skill);
    } else if (name.includes('solidity') || name.includes('web3')) {
      categories["Blockchain"].push(skill);
    } else if (name.includes('collaboration') || name.includes('problem') || name.includes('project')) {
      categories["Soft Skills"].push(skill);
    } else {
      // Default category for unrecognized skills
      categories["Others"].push(skill);
    }
  });

  // Filter out empty categories
  const result: CategorizedSkills = {};
  Object.keys(categories).forEach(category => {
    if (categories[category].length > 0) {
      // Sort skills by level within each category
      categories[category].sort((a, b) => b.level - a.level);
      result[category] = categories[category];
    }
  });

  return result;
};

// Skill level colors
const getSkillLevelColor = (level: number): string => {
  if (level >= 90) return 'from-green-400 to-green-600'; // Expert
  if (level >= 80) return 'from-blue-400 to-blue-600';   // Advanced
  if (level >= 70) return 'from-yellow-400 to-yellow-600'; // Intermediate
  if (level >= 60) return 'from-orange-400 to-orange-600'; // Developing
  return 'from-red-400 to-red-600'; // Beginner
};

// Skill level badge
const SkillLevelBadge = ({ level }: { level: number }) => {
  let color = 'bg-gray-500';
  let text = 'Beginner';
  
  if (level >= 90) { color = 'bg-green-500'; text = 'Expert'; }
  else if (level >= 80) { color = 'bg-blue-500'; text = 'Advanced'; }
  else if (level >= 70) { color = 'bg-yellow-500'; text = 'Intermediate'; }
  else if (level >= 60) { color = 'bg-orange-500'; text = 'Developing'; }

  return (
    <span className={`${color} text-white text-xs px-2 py-1 rounded-full`}>
      {text}
    </span>
  );
};

const Skills = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("Programming Languages");
  const { content, loading } = useContent();
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    if (inView) {
      setIsVisible(true);
    }
  }, [inView]);

  // Categorize skills from MongoDB data
  const categorizedSkills = categorizeSkills(content.skills);

  // Set first available category as default
  useEffect(() => {
    const categories = Object.keys(categorizedSkills);
    if (categories.length > 0 && !categorizedSkills[selectedCategory]) {
      setSelectedCategory(categories[0]);
    }
  }, [categorizedSkills, selectedCategory]);

  const renderIcon = (skill: { name: string; level: number; icon: string }) => {
    if (skill.icon.startsWith('fab ') || skill.icon.startsWith('fas ') || skill.icon.startsWith('far ')) {
      // FontAwesome icon
      return (
        <i
          className={`${skill.icon} text-xl ${
            skill.level >= 80 ? 'text-green-500' : skill.level >= 70 ? 'text-blue-500' : 'text-gray-500'
          }`}
        />
      );
    } else {
      // SVG or other icon type
      return (
        <img
          src={skill.icon}
          alt={skill.name}
          className="w-6 h-6 filter-primary"
        />
      );
    }
  };

  if (loading) {
    return (
      <section id="skills" ref={ref} className="py-20 bg-gray-50 dark:bg-gray-900 dark:text-[#b9b8b8]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="skills" ref={ref} className="py-20 bg-gray-50 dark:bg-gray-900 dark:text-[#b9b8b8]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm text-gray-500 uppercase tracking-wider dark:text-[#b9b8b8]">
            My Specialty
          </span>
          <h2 className="text-3xl font-bold mt-2">My Skills</h2>
          <p className="text-gray-600 dark:text-[#b9b8b8] mt-4">
            Comprehensive skillset across multiple technologies and domains
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          {Object.keys(categorizedSkills).map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                selectedCategory === category
                  ? 'bg-primary text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-300'
              }`}
            >
              {category} ({categorizedSkills[category].length})
            </button>
          ))}
        </div>

        {/* Skills Display */}
        <motion.div
          className="grid md:grid-cols-1 lg:grid-cols-2 gap-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {categorizedSkills[selectedCategory]?.map((skill, index) => (
            <div
              key={`${selectedCategory}-${skill.name}`}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  {renderIcon(skill)}
                  <h3 className="text-lg font-semibold ml-3 dark:text-white">{skill.name}</h3>
                </div>
                <SkillLevelBadge level={skill.level} />
              </div>
              
              {/* Skill Progress Bar */}
              <div className="relative">
                <div className="bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                  <motion.div
                    className={`h-3 rounded-full bg-gradient-to-r ${getSkillLevelColor(skill.level)}`}
                    initial={{ width: 0 }}
                    animate={{ width: isVisible ? `${skill.level}%` : 0 }}
                    transition={{ duration: 1.2, delay: index * 0.1 }}
                  />
                </div>
                
                {/* Level Indicator */}
                <motion.div
                  className="absolute top-1/2 transform -translate-y-1/2 w-5 h-5 rounded-full border-2 border-white shadow-lg bg-white"
                  initial={{ left: 0 }}
                  animate={{ left: isVisible ? `calc(${skill.level}% - 10px)` : 0 }}
                  transition={{ duration: 1.2, delay: index * 0.1 }}
                >
                  <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${getSkillLevelColor(skill.level)} m-0.5`}></div>
                </motion.div>
              </div>
              
              {/* Level Percentage */}
              <motion.div
                className="flex justify-between items-center mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: isVisible ? 1 : 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 + 0.3 }}
              >
                <span className="text-sm text-gray-600 dark:text-[#b9b8b8]">Proficiency</span>
                <span className="text-sm font-semibold dark:text-white">{skill.level}%</span>
              </motion.div>
            </div>
          ))}
        </motion.div>

        {/* Skills Summary */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : 20 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        >
          <div className="bg-gradient-to-r from-primary to-secondary text-white p-8 rounded-lg">
            <h3 className="text-2xl font-bold mb-4">Total Skills Portfolio</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-3xl font-bold">{content.skills.length}</div>
                <div className="text-sm opacity-90">Technologies</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {Math.round(content.skills.reduce((acc, skill) => acc + skill.level, 0) / content.skills.length)}%
                </div>
                <div className="text-sm opacity-90">Average Proficiency</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {content.skills.filter(skill => skill.level >= 80).length}
                </div>
                <div className="text-sm opacity-90">Expert Level</div>
              </div>
              <div>
                <div className="text-3xl font-bold">
                  {Object.keys(categorizedSkills).length}
                </div>
                <div className="text-sm opacity-90">Categories</div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;