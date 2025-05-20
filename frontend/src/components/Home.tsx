import { Suspense, lazy } from 'react';
import AnimatedSection from './AnimatedSection';

// Lazy load heavy components to improve initial load time
const Hero = lazy(() => import('./Hero'));
const About = lazy(() => import('./About'));
const Services = lazy(() => import('./Services'));
const Skills = lazy(() => import('./Skills'));
const Work = lazy(() => import('./Work'));
const Gallery = lazy(() => import('./Gallery'));
const Contact = lazy(() => import('./Contact'));
const Counter = lazy(() => import('./Counter'));

function Home() {
  return (
    <main className="lg:ml-[300px] dark:bg-gray-900 dark:text-[#b9b8b8]">
      <Suspense fallback={<div>Loading section...</div>}>
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
      </Suspense>
    </main>
  );
}

export default Home;