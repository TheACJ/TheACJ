import { Lightbulb, Globe, BarChart3, AppWindow } from 'lucide-react';

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

const Services = () => {
  return (
    <section id="services" className="py-20 bg-white  dark:bg-gray-900 dark:text-[#b9b8b8] mt-[-100px]">
      
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
    </section>
  );
};

export default Services;