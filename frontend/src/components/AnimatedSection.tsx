import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
}

const AnimatedSection = ({ children, className = '' }: AnimatedSectionProps) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};
export default AnimatedSection;
