import { useState } from 'react';
import { motion } from 'framer-motion';
import { contactService } from '../services/api_node';
import { useScrollAnimation } from '../hooks/useAnimations';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const { ref, controls, variants } = useScrollAnimation();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'loading') return;
    
    setStatus('loading');
    setErrorMessage('');

    try {
      await contactService.sendMessage(formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error: any) {
      setStatus('error');
      setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
      console.error('Error sending message:', error);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const ContactInfoItem = ({ icon, title, value, href }: {
    icon: string;
    title: string;
    value: string;
    href?: string;
  }) => (
    <div className="flex items-start gap-6 p-4 rounded-lg transition-colors hover:bg-gray-50 dark:hover:bg-gray-800">
      <div className="shrink-0 p-3 rounded-md bg-slate-700 dark:bg-slate-300 shadow-md">
        <i className={`${icon} text-4xl text-[#2c98f0]`} aria-hidden="true" />
      </div>
      <div>
        <h4 className="text-lg font-medium mb-1 text-gray-800 dark:text-[#b9b8b8]">{title}</h4>
        {href ? (
          <a
            href={href}
            className="text-primary dark:text-blue-300 hover:text-primary transition-colors"
          >
            {value}
          </a>
        ) : (
          <p className="text-primary dark:text-blue-300">{value}</p>
        )}
      </div>
    </div>
  );

  return (
    <section id="contact" className="py-20 bg-white dark:bg-gray-900 dark:text-[#b9b8b8]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          {/* Form Section */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg dark:bg-gray-900">
            <h3 className="text-2xl font-semibold mb-6">Send us a message</h3>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Subject
                  </label>
                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-2 dark:text-gray-300">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-800 dark:border-gray-700"
                    rows={4}
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={status === 'loading'}
                  className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-live="polite"
                >
                  {status === 'loading' ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                      Sending...
                    </span>
                  ) : (
                    'Send Message'
                  )}
                </button>

                {status === 'error' && (
                  <div className="mt-4 p-3 text-red-700 bg-red-100 rounded-lg dark:bg-red-900 dark:text-red-200">
                    {errorMessage}
                  </div>
                )}

                {status === 'success' && (
                  <div className="mt-4 p-3 text-green-700 bg-green-100 rounded-lg dark:bg-green-900 dark:text-green-200">
                    Message sent successfully!
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Contact Info Section */}
          <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg dark:bg-gray-900">
            <h3 className="text-2xl font-semibold mb-8">Contact Information</h3>
            <div className="space-y-6">
              <ContactInfoItem
                icon="icon-map"
                title="Location"
                value="Lagos, Nigeria"
              />
              <ContactInfoItem
                icon="icon-phone"
                title="Phone"
                value="+234 811 913 7762"
                href="tel:+2348119137762"
              />
              <ContactInfoItem
                icon="icon-email"
                title="Email"
                value="inquire@theacj.com.ng"
                href="mailto:inquire@theacj.com.ng"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;