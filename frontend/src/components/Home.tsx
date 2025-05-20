
import Hero from './Hero';
import About from './About';
import Services from './Services';
import Skills from './Skills';
import Work from './Work';
import Gallery from './Gallery';
import Contact from './Contact';
import Counter from './Counter';
// import Loader from './components/Loader';
import AnimatedSection from './AnimatedSection';
function Home() {
    return (
    <main className="lg:ml-[300px]  dark:bg-gray-900 dark:text-[#b9b8b8]  ">
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
    </main>
  );
}

export default Home;