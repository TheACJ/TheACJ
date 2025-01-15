import { useState } from 'react';
import { motion } from 'framer-motion';
import { contactService, ContactForm } from '../services/api';
import { useScrollAnimation } from '../hooks/useAnimations';
import '../assets/style.css'

const Contact = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const { ref, controls, variants } = useScrollAnimation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');
    
    try {
      await contactService.sendMessage(formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      setStatus('error');
      console.error('Error sending message:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <section id="contact" className="py-20 bg-white  dark:bg-gray-900 dark:text-[#b9b8b8]">
      <div className="max-w-6xl mx-auto px-4">
        <motion.div
          ref={ref}
          initial="hidden"
          animate={controls}
          variants={variants}
          className="text-center mb-16"
        >
          <span className="text-sm text-gray-500 uppercase tracking-wider">Get in Touch</span>
          <h2 className="text-3xl font-bold mt-2">Contact</h2>
        </motion.div>

        {/* Rest of the component remains the same but with enhanced animations */}
      </div>
      <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow-lg  dark:bg-gray-900 dark:text-[#b9b8b8]">
            <h3 className="text-2xl font-semibold mb-6">Send us a message</h3>
            <form className="space-y-4">
              <div>
                <label className="block text-gray-700 mb-2 dark:text-[#b9b8b8]">Name</label>
                <input type="text" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-[#b9b8b8]">Email</label>
                <input type="email" className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-gray-700 mb-2 dark:text-[#b9b8b8]">Message</label>
                <textarea className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" rows={4}></textarea>
              </div>
              <button className="bg-blue-600 text-white dark:text-[#b9b8b8] px-6 py-2 rounded-md hover:bg-blue-700">Send Message</button>
            </form>
          </div>

          <div className="bg-white p-8 rounded-lg  space-y-4 shadow-lg overflow-hidden  dark:bg-gray-900 dark:text-[#b9b8b8]">
            <h3 className="text-2xl font-semibold mb-6 font-space">Contact Information</h3>
            <div className="">

              <div className="text-left w-full  mb-[33%] relative ">
                <div className='absolute top-0 left-0 w-full h-full table text-center rounded-[2px]  shadow-md'>
                  <i className='icon-map table-cell align-middle text-[#2c98f0] text-[60px] h-full text-left'></i>
                </div>
                <div className='pl-[25%] w-full align-middle'>
                  <p className='text-blue-800 z-[300] align-middle'>Lagos, Nigeria</p> 
                </div> 
              </div>
              
              <div className="text-left w-full  mb-[33%] relative">
                <div className='absolute top-0 left-0 w-full h-full table text-center  rounded-[2px] shadow-md'>
                  <a href="tel:+2349121490555" className='left-0 mr-[100%]'><i className='icon-phone table-cell align-middle text-[#2c98f0] text-[60px] h-full text-left'></i></a>
                </div>
                <div className='pl-[25%] w-full align-middle'>
                  <p className='text-blue-800 z-[300] align-middle'><a href="tel:+2349121490555">+2348119137762</a></p> 
                </div> 
              </div>

              <div className=" text-left w-full  relative">
                <div className='absolute top-0 left-0 w-full h-full table text-center rounded-[2px] shadow-md '>
                  <a href="mailto:inquire@theacj.com.ng" className='left-0 mr-[100%]'><i className='icon-email table-cell align-middle text-[#2c98f0] text-[60px] h-full text-left'></i></a>
                </div><br/>
                <div className='pl-[25%] w-full m-0 align-middle'>
                  <p className='text-blue-800 z-[300] align-middle'><a  href="mailto:inquire@theacj.com.ng">inquire@theacj.com.ng</a></p> 
                </div>
              </div>
            </div>
          </div>
        </div>
    </section>
  );
};

export default Contact;