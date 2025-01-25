
import '../assets/style.css'

const About = () => {
  return (
    <section id="about" className="py-20 bg-white  dark:bg-gray-900 dark:text-[#b9b8b8]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm text-gray-500 uppercase tracking-wider dark:text-[#b9b8b8]">About Me</span>
          <h2 className="text-3xl font-bold mt-2">Meet The ACJ!</h2>
        </div>

        <div className="mb-16">
          <p className="text-lg text-gray-700 mb-6 dark:text-[#b9b8b8]">
            <strong> Hello </strong> I am Agbai Chisom Joshua - The ACJ a tech professional passionate about making digital technology accessible and user-friendly. My expertise spans web development, data analytics, and blockchain innovation.
            Web Development: I build websites and apps using Django, React, and Tailwind CSS, creating intuitive digital experiences from frontend design to backend functionality.
            Data Analytics: Using Python and Excel, I transform raw data into strategic insights, helping businesses make smarter decisions by uncovering hidden patterns.
            Blockchain & Web3: I'm exploring the next digital frontier, developing projects that simplify blockchain technology and create meaningful connections in the Web3 ecosystem.
            My core mission? To bridge technology and human potential, making complex digital solutions simple and engaging for everyone.
          </p>
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