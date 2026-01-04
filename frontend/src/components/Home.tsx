import { motion } from 'framer-motion';
import { Heart, ArrowUp, Menu, Github, Twitter, Linkedin, Facebook, X  } from 'lucide-react';
import Hero from './Hero';
import About from './About';
import Services from './Services';
import Skills from './Skills';
import Work from './Work';
import Gallery from './Gallery';
import Contact from './Contact';
import Counter from './Counter';
import AnimatedSection from './AnimatedSection';

// Footer Component
const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const SOCIAL_LINKS = [
  { href: "https://facebook.com/joshua.agbai.3", icon: <Facebook size={20} />, label: "Facebook" },
  { href: "https://twitter.com/realACJoshua", icon: <i className='icon-x not-italic text-lg'></i>, label: "X (Twitter)" }, // Preserved your custom icon class
  { href: "https://github.com/TheACJ", icon: <Github size={20} />, label: "Github" },
  { href: "#", icon: <Linkedin size={20} />, label: "LinkedIn" },
];

  return (
    <footer className="relative py-12 bg-gray-900 dark:bg-black text-white overflow-hidden">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-primary" />
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex items-center gap-2 text-gray-400"
          >
             <p className="text-xs text-gray-500 mb-6 dark:text-gray-500 font-medium">
            &copy; {new Date().getFullYear()} All rights reserved.<br />
            Made with ❤️ by The ACJ
           </p>
          </motion.div>

          {/* Back to Top */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            onClick={scrollToTop}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-primary text-white rounded-full transition-all duration-300"
          >
            <span className="text-sm font-medium">Back to Top</span>
            <ArrowUp size={16} className="group-hover:-translate-y-1 transition-transform" />
          </motion.button>
        </div>

        {/* Bottom Links */}
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-6 mt-8 pt-8 border-t border-white/10"
        >
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
        </motion.div>
      </div>
    </footer>
  );
};

function Home() {
  return (
    <div className="w-full">
      <Hero />
      <AnimatedSection>
        <About />
      </AnimatedSection>
      <AnimatedSection>
        <Services />
      </AnimatedSection>
      <AnimatedSection>
        <Counter />
      </AnimatedSection>
      <AnimatedSection>
        <Skills />
      </AnimatedSection>
      <AnimatedSection>
        <Work />
      </AnimatedSection>
      <AnimatedSection>
        <Gallery />
      </AnimatedSection>
      <AnimatedSection>
        <Contact />
      </AnimatedSection>
      <Footer />
    </div>
  );
}

export default Home;