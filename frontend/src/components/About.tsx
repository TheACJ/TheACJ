
import '../assets/style.css'

const About = () => {
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