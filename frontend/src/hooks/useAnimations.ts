import { useAnimation, AnimationControls } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { useEffect } from 'react';

export const useScrollAnimation = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView({
    threshold: 0.2,
    triggerOnce: true,
  });

  useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return { ref, controls, variants: {
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' }
    },
    hidden: {
      opacity: 0,
      y: 50
    }
  }};
};