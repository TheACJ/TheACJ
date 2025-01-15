import { Lightbulb, Globe, BarChart3, AppWindow } from 'lucide-react';

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
      title: "Web Development",
      description: "Having a rooted background in HTML, CSS and Javascript, I even went further to get a hold of backend skills such as SQL, Django, Nodejs. I am the ACJ, I Prioritize beauty and scalability."
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: "Data Analysis",
      description: "The ACJ is able to draw insight from Data by cleaning, wrangling and mining Data, to tell a compelling story with this Data to draw an inference or a conclusion that benefits all concerned",
      border: "text-yellow-400"
    },
    {
      icon: <AppWindow className="w-8 h-8" />,
      title: "Application",
      description: "Building robust and scalable applications that solve real-world problems is my passion. I create applications that are not just functional but also user-friendly and maintainable."
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
            <strong>Hi I am The ACJ</strong>, I am a Web Developer, Programmer, Data Analyst, Graphics Designer and Tech Enthusiast. Let's build something beautiful together. If you dare to imagine it, The ACJ will make it real. Also bear in mind that by using existing and collected Data your organisation will be placed in the right position to succeed
          </p>
          <p className="text-lg text-gray-700 dark:text-[#b9b8b8]">
            I am assertive communication experts with a passion for communication and technology. I have a sound background in Web Development, Data Analysis and Computer Networking. I am a web builder/web designer, Data Analyst and Graphic Designer unafraid to push beyond the natural comfort zone. I possess excellent digital communication and problem-solving skills. I always dare to be the difference.
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
              Hire me
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;