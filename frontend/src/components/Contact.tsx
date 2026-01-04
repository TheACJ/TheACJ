import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MapPin, Phone, Mail, Send, Loader2, 
  CheckCircle2, AlertCircle, ArrowRight 
} from 'lucide-react';
import { contactService } from '../services/api_node';
import '../assets/style.css';

// --- Animation Variants (Matching Common Pattern) ---
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { type: 'spring', stiffness: 100, damping: 10 }
  }
};

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  // --- Handlers (Preserving Logic) ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'loading') return;
    
    setStatus('loading');
    setErrorMessage('');

    try {
      await contactService.sendMessage(formData);
      setStatus('success');
      setFormData({ name: '', email: '', subject: '', message: '' });
      
      // Auto-reset status after 5 seconds to allow sending another message
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error: any) {
      setStatus('error');
      // Backward compatibility for error response structure
      setErrorMessage(error.response?.data?.message || 'An error occurred. Please try again.');
      console.error('Error sending message:', error);
    }
  };

  // --- Sub-components ---
  const ContactCard = ({ icon: Icon, title, value, href, delay }: any) => (
    <motion.a
      href={href}
      variants={itemVariants}
      whileHover={{ y: -5, scale: 1.02 }}
      className={`
        flex items-start gap-5 p-6 rounded-2xl border transition-all duration-300
        bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl
        border-gray-100 dark:border-gray-700 hover:border-primary/30
        ${href ? 'cursor-pointer' : 'cursor-default'}
      `}
    >
      <div className="shrink-0 p-4 rounded-xl bg-primary/10 text-primary dark:bg-primary/20 dark:text-blue-300">
        <Icon size={24} />
      </div>
      <div>
        <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{title}</h4>
        <p className="text-gray-600 dark:text-[#b9b8b8] font-medium leading-relaxed">
          {value}
        </p>
      </div>
    </motion.a>
  );

  return (
    <section id="contact" className="py-24 bg-gray-50 dark:bg-gray-900 overflow-hidden relative">
      {/* Decorative Background Elements (Similar to Counter/About) */}
      <div className="absolute top-0 left-0 w-1/3 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
      <div className="absolute -left-20 top-20 w-72 h-72 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -right-20 bottom-20 w-72 h-72 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* --- Header --- */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-sm font-bold text-primary tracking-[0.2em] uppercase block mb-3">
            Get in Touch
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Let's Start a Conversation
          </h2>
          <p className="text-lg text-gray-600 dark:text-[#b9b8b8] max-w-2xl mx-auto">
            Have a project in mind or just want to say hi? I'd love to hear from you.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          className="grid lg:grid-cols-12 gap-12"
        >
          {/* --- Left Column: Contact Info --- */}
          <div className="lg:col-span-5 space-y-6">
            <ContactCard
              icon={MapPin}
              title="Location"
              value="Lagos, Nigeria"
            />
            <ContactCard
              icon={Phone}
              title="Phone"
              value="+234 811 913 7762"
              href="tel:+2348119137762"
            />
            <ContactCard
              icon={Mail}
              title="Email"
              value="inquire@theacj.com.ng"
              href="mailto:inquire@theacj.com.ng"
            />
            
            {/* Social Proof / Extra Text */}
            <motion.div 
              variants={itemVariants}
              className="mt-8 p-6 bg-gradient-to-br from-primary to-secondary rounded-2xl text-white shadow-lg"
            >
              <h4 className="font-bold text-xl mb-2">Available for Freelance</h4>
              <p className="opacity-90 text-sm mb-4">
                I am currently open to new projects and collaborations. Let's build something amazing together.
              </p>
              <div className="h-1 w-12 bg-white/30 rounded-full" />
            </motion.div>
          </div>

          {/* --- Right Column: Form --- */}
          <div className="lg:col-span-7">
            <motion.div 
              variants={itemVariants}
              className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 p-8 md:p-10 relative overflow-hidden"
            >
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-2">
                Send a Message
                <span className="h-px flex-1 bg-gray-100 dark:bg-gray-700 ml-4" />
              </h3>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Name</label>
                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      placeholder="John Doe"
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:text-white"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john@example.com"
                      className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="subject" className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Subject</label>
                  <input
                    id="subject"
                    type="text"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Project Inquiry"
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all dark:text-white"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-semibold text-gray-700 dark:text-gray-300 ml-1">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell me about your project..."
                    rows={5}
                    className="w-full px-5 py-3 rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all resize-none dark:text-white"
                  />
                </div>

                <div className="pt-2">
                  <motion.button
                    type="submit"
                    disabled={status === 'loading' || status === 'success'}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      w-full py-4 px-8 rounded-xl font-bold text-white flex items-center justify-center gap-3 transition-all
                      ${status === 'success' 
                        ? 'bg-green-600 cursor-default' 
                        : 'bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/25'}
                      disabled:opacity-70 disabled:cursor-not-allowed
                    `}
                  >
                    {status === 'loading' ? (
                      <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>Sending Message...</span>
                      </>
                    ) : status === 'success' ? (
                      <>
                        <CheckCircle2 size={20} />
                        <span>Message Sent!</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send size={18} />
                      </>
                    )}
                  </motion.button>
                </div>

                {/* Status Notifications */}
                <AnimatePresence>
                  {status === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 p-4 text-red-700 bg-red-50 dark:bg-red-900/20 dark:text-red-200 rounded-xl border border-red-100 dark:border-red-900/50"
                    >
                      <AlertCircle size={20} className="shrink-0" />
                      <p className="text-sm font-medium">{errorMessage}</p>
                    </motion.div>
                  )}

                  {status === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="flex items-center gap-3 p-4 text-green-700 bg-green-50 dark:bg-green-900/20 dark:text-green-200 rounded-xl border border-green-100 dark:border-green-900/50"
                    >
                      <CheckCircle2 size={20} className="shrink-0" />
                      <p className="text-sm font-medium">Thank you! I will get back to you as soon as possible.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;