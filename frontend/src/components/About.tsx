import { Lightbulb, Globe, BarChart3, AppWindow } from 'lucide-react';
import '../assets/style.css'

const About = () => {
  const services = [
    {
      icon: <Lightbulb className="w-8 h-8" />,
      title: "Innovative Ideas",
      description: "I endear my Innovative ideas as I believe that Tech will change the World even much more. So I am always developing myself through innovation, acquiring new Tech ideas towards civilization",
      border: "text-yellow-400"
    },
    {
      icon: <Globe className="w-8 h-8" />,
      title: " Fullstack Web Development",
      description: "Having a rooted background in HTML, CSS, Javascript, I even went further to get a hold of backend skills such as SQL, Django, Nodejs. I am the ACJ, I Prioritize beauty and scalability."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Data Analysis",
      description: "The ACJ is able to draw insight from Data by cleaning, wrangling and mining Data, to tell a compelling story with this Data to draw an inference or a conclusion that benefits all concerned",
      border: "text-yellow-400"
    },
    {
      icon: <AppWindow className="w-8 h-8" />,
      title: "Web 3 Development",
      description: "Building robust and scalable Web3 applications that solve real-world problems is my passion. I write smart contracts that are scalable using Solidity & Rust."
    }
  ];

  return (
    <section id="about" className="py-20 bg-white  dark:bg-gray-900 dark:text-[#b9b8b8]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm text-gray-500 uppercase tracking-wider dark:text-[#b9b8b8]">About Me</span>
          <h2 className="text-3xl font-bold mt-2">Who Am I?</h2>
        </div>

        <div className="mb-16">
          <p className="text-lg text-gray-700 mb-6 dark:text-[#b9b8b8]">
            <strong> Hello! I’m The ACJ</strong>, a passionate and multifaceted tech professional with a proven track record in web development, data analytics, and blockchain innovation. My journey has been marked by an unwavering dedication to solving problems and creating innovative solutions that bridge the gap between technology and human potential.
          </p>
          <h2 className="text-3xl font-bold mt-2  text-center">What I do</h2>
          <p className="text-lg text-gray-700 dark:text-[#b9b8b8]">
          I'm a web developer at heart, and I love building websites and apps that are both powerful and easy to use. I work with modern tools like Django and React, and I make sure everything looks great with Tailwind CSS. Think of it like building a house – I handle everything from the beautiful exterior (the frontend that users see) to the solid foundation (the backend that makes everything work).<br/>
          I'm also really into making sense of data. Using Python and Excel, I help turn numbers and information into useful insights – kind of like being a detective who helps businesses make smarter choices based on what the data tells us.<br />
          I am also a blockchain and Web3 developer – it's like the next frontier of the internet! I've worked on projects and is building a platform to help people connect in the Web3 world. My goal is to make this new technology as user-friendly as possible, so everyone can benefit from it, not just tech experts.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className={`p-6 bg-white rounded-lg shadow-lg border-b-4  dark:bg-gray-900 ${index % 2 === 0 ? 'border-blue-500' : 'border-yellow-500'}`}>
              <div className={`${index % 2 == 0 ? 'text-blue-500 mb-4' : 'text-yellow-500 mb-4'}  dark:bg-gray-900`}>
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-600 dark:text-[#b9b8b8]">{service.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-yellow-400 p-8 rounded-lg">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-6 dark:text-[#0f0f0f]">
              I am happy to inform you that 15+ projects are done successfully!
            </h2>
            <a 
              href="https://wa.me/message/CR5WD4DPDZE7O1"
              className="inline-block px-8 py-3 bg-black text-white rounded dark:text-[#b9b8b8] hover:bg-gray-800 transition-colors"
            >
              Hire me &nbsp; <i className='icon-briefcase'></i>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;