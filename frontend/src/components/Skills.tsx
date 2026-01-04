import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { 
  Code2, Layout, Server, Database, Cloud, Link2, Users, Sparkles,
  Zap, BarChart3, Terminal
} from 'lucide-react';
import { useContent } from '../hooks/useContent';
import '../assets/style.css';

// --- TypeScript Interfaces ---
interface Skill {
  name: string;
  level: number;
  icon: string;
}

interface CategorizedSkills {
  [category: string]: Skill[];
}

// --- Category Configuration ---
const CATEGORY_ICONS: { [key: string]: React.ReactNode } = {
  "Programming Languages": <Code2 size={18} />,
  "Frontend Technologies": <Layout size={18} />,
  "Backend Technologies": <Server size={18} />,
  "Databases": <Database size={18} />,
  "Data Science": <BarChart3 size={18} />,
  "DevOps & Cloud": <Cloud size={18} />,
  "Blockchain": <Link2 size={18} />,
  "Soft Skills": <Users size={18} />,
  "Tools": <Zap size={18} />,
  "Others": <Sparkles size={18} />
};

// --- Animation Variants ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 }
  }
};

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring', stiffness: 100, damping: 15 }
  },
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } }
};

// --- Helper Functions ---

// Automatically categorizes raw skill data based on keywords
const categorizeSkills = (skills: Skill[]): CategorizedSkills => {
  const categories: CategorizedSkills = {
    "Programming Languages": [],
    "Frontend Technologies": [],
    "Backend Technologies": [],
    "Databases": [],
    "DevOps & Cloud": [],
    "Blockchain": [],
    "Soft Skills": [],
    "Tools": [],
    "Others": []
  };

  skills.forEach(skill => {
    const name = skill.name.toLowerCase();
    
    if (name.includes('python') || name.includes('javascript') || name.includes('typescript') || name.includes('rust') || name.includes('java') || name.includes('c++') || name.includes('go') || name.includes('solidity')) {
      if(name.includes('solidity')) categories["Blockchain"].push(skill);
      else categories["Programming Languages"].push(skill);
    } else if (name.includes('html') || name.includes('css') || name.includes('react') || name.includes('vue') || name.includes('angular') || name.includes('tailwind') || name.includes('bootstrap') || name.includes('next') || name.includes('redux')) {
      categories["Frontend Technologies"].push(skill);
    } else if (name.includes('node') || name.includes('express') || name.includes('django') || name.includes('flask') || name.includes('nest') || name.includes('php') || name.includes('laravel')) {
      categories["Backend Technologies"].push(skill);
    } else if (name.includes('mongo') || name.includes('sql') || name.includes('redis') || name.includes('firebase') || name.includes('postgres')) {
      categories["Databases"].push(skill);
    } else if (name.includes('docker') || name.includes('aws') || name.includes('kubernetes') || name.includes('jenkins') || name.includes('ci/cd') || name.includes('azure')) {
      categories["DevOps & Cloud"].push(skill);
    } else if (name.includes('web3') || name.includes('ethereum') || name.includes('smart contract') || name.includes('blockchain')) {
      categories["Blockchain"].push(skill);
    } else if (name.includes('communication') || name.includes('leadership') || name.includes('agile') || name.includes('scrum') || name.includes('team')) {
      categories["Soft Skills"].push(skill);
    } else if (name.includes('git') || name.includes('github') || name.includes('jira') || name.includes('vscode') || name.includes('figma')) {
      categories["Tools"].push(skill);
    } else {
      categories["Others"].push(skill);
    }
  });

  // Clean up empty categories and sort by level
  const result: CategorizedSkills = {};
  Object.keys(categories).forEach(category => {
    if (categories[category].length > 0) {
      categories[category].sort((a, b) => b.level - a.level);
      result[category] = categories[category];
    }
  });

  return result;
};

// Returns styling based on proficiency percentage
const getSkillLevelInfo = (level: number): { color: string; bgColor: string; text: string } => {
  if (level >= 90) return { color: 'from-emerald-400 to-emerald-600', bgColor: 'bg-emerald-500', text: 'Expert' };
  if (level >= 80) return { color: 'from-blue-400 to-blue-600', bgColor: 'bg-blue-500', text: 'Advanced' };
  if (level >= 70) return { color: 'from-violet-400 to-violet-600', bgColor: 'bg-violet-500', text: 'Proficient' };
  if (level >= 50) return { color: 'from-amber-400 to-amber-600', bgColor: 'bg-amber-500', text: 'Intermediate' };
  return { color: 'from-rose-400 to-rose-600', bgColor: 'bg-rose-500', text: 'Learning' };
};

// --- Sub-components ---

const SkeletonLoader = () => (
  <section className="py-24 bg-gray-50 dark:bg-gray-900">
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col items-center mb-12 space-y-4">
        <div className="h-4 w-28 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
        <div className="h-4 w-80 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
      </div>
      <div className="flex justify-center gap-3 mb-12 flex-wrap">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 w-36 bg-gray-200 dark:bg-gray-800 rounded-full animate-pulse" />
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-32 bg-white dark:bg-gray-800 rounded-xl shadow-sm animate-pulse p-6" />
        ))}
      </div>
    </div>
  </section>
);

interface SkillCardProps {
  skill: Skill;
  index: number;
  isVisible: boolean;
}

const SkillCard = ({ skill, index, isVisible }: SkillCardProps) => {
  const { color, bgColor, text } = getSkillLevelInfo(skill.level);
  
  // Handle both Image URLs and FontAwesome classes for backward compatibility
  const renderIcon = () => {
    if (!skill.icon) return <Terminal size={20} />;
    
    if (skill.icon.includes('fa-') || skill.icon.includes('icon-')) {
      return <i className={`${skill.icon} text-2xl`} aria-hidden="true" />;
    }
    return <img src={skill.icon} alt={skill.name} className="w-7 h-7 object-contain" />;
  };

  return (
    <motion.div
      variants={cardVariants}
      layout
      className="group relative bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm hover:shadow-xl border border-gray-100 dark:border-gray-700/50 transition-all duration-300 overflow-hidden"
    >
      {/* Decorative gradient blob on hover */}
      <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${color} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`} />

      {/* Header: Icon & Name */}
      <div className="flex items-center justify-between mb-5 relative z-10">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} p-0.5 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <div className="w-full h-full bg-white dark:bg-gray-900 rounded-[10px] flex items-center justify-center text-gray-700 dark:text-gray-200">
              {renderIcon()}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white">{skill.name}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">{text}</span>
          </div>
        </div>
        <div className="text-xl font-bold text-gray-900 dark:text-white font-mono">
          {skill.level}%
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative h-2.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
        <motion.div
          className={`absolute inset-y-0 left-0 bg-gradient-to-r ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: isVisible ? `${skill.level}%` : 0 }}
          transition={{ duration: 1.2, delay: index * 0.05, ease: "easeOut" }}
        />
      </div>
    </motion.div>
  );
};

// --- Main Component ---
const Skills = () => {
  const { content, loading } = useContent();
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  
  const { ref, inView } = useInView({ threshold: 0.1, triggerOnce: true });

  const skills: Skill[] = useMemo(() => content?.skills || [], [content]);
  
  // Memoize categorization so it doesn't run on every render
  const categorizedSkills = useMemo(() => categorizeSkills(skills), [skills]);
  const categoryKeys = useMemo(() => Object.keys(categorizedSkills), [categorizedSkills]);

  // Set initial category
  useEffect(() => {
    if (categoryKeys.length > 0 && !categoryKeys.includes(selectedCategory)) {
      setSelectedCategory(categoryKeys[0]);
    }
  }, [categoryKeys, selectedCategory]);

  const handleCategoryChange = useCallback((category: string) => {
    setSelectedCategory(category);
  }, []);

  // Stats for the footer
  const avgProficiency = useMemo(() => {
    if (skills.length === 0) return 0;
    return Math.round(skills.reduce((acc, s) => acc + s.level, 0) / skills.length);
  }, [skills]);

  const expertCount = useMemo(() => skills.filter(s => s.level >= 80).length, [skills]);

  if (loading && skills.length === 0) return <SkeletonLoader />;

  if (skills.length === 0) {
    return (
      <section id="skills" className="py-24 bg-gray-50 dark:bg-gray-900 text-center">
        <p className="text-gray-500">Skills data unavailable.</p>
      </section>
    );
  }

  return (
    <section id="skills" ref={ref} className="py-24 overflow-hidden relative">
      {/* Decorative background dots */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#6366f1 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : -20 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-bold text-primary tracking-[0.2em] uppercase block mb-3">My Specialty</span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">Technical Skills</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-4 max-w-xl mx-auto">
            A comprehensive toolkit built through years of hands-on experience across diverse projects and stacks.
          </p>
        </motion.div>

        {/* Category Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-14">
          {categoryKeys.map((category) => (
            <button
              key={category}
              onClick={() => handleCategoryChange(category)}
              className={`
                inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold
                transition-all duration-300 border-2
                ${selectedCategory === category
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30 transform scale-105'
                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:text-primary'
                }
              `}
            >
              {CATEGORY_ICONS[category] || <Sparkles size={18} />}
              <span>{category}</span>
              <span className={`ml-1 px-2 py-0.5 text-xs rounded-full ${selectedCategory === category ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'}`}>
                {categorizedSkills[category].length}
              </span>
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            className="grid md:grid-cols-2 gap-6"
          >
            {categorizedSkills[selectedCategory]?.map((skill, index) => (
              <SkillCard
                key={`${selectedCategory}-${skill.name}`}
                skill={skill}
                index={index}
                isVisible={inView}
              />
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Stats Footer */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: inView ? 1 : 0, y: inView ? 0 : 30 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-20"
        >
          <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 border border-gray-100 dark:border-gray-700 shadow-xl">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-x divide-gray-100 dark:divide-gray-700">
              <div className="p-2">
                <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{skills.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Technologies</div>
              </div>
              <div className="p-2">
                <div className="text-3xl font-bold text-primary mb-1">{avgProficiency}%</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Avg. Proficiency</div>
              </div>
              <div className="p-2">
                <div className="text-3xl font-bold text-green-500 mb-1">{expertCount}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Expert Level</div>
              </div>
              <div className="p-2">
                <div className="text-3xl font-bold text-purple-500 mb-1">{categoryKeys.length}</div>
                <div className="text-xs text-gray-500 uppercase tracking-wider">Categories</div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
};

export default Skills;