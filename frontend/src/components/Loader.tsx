import { motion } from 'framer-motion';
import logo from '../assets/img/logo.png';

const Loader = () => {
  return (
    <motion.div 
      className="fixed inset-0 z-[2000]"
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div id="loader-wrapper">
        {/* Logo positioned absolutely */}
        <img
          src={logo}
          alt="ACJ Logo"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 nospin"
        />
        
        <div id="loader">
          {/* The rotating part of the loader */}
        </div>

        <div className="loader-section section-left"></div>
        <div className="loader-section section-right"></div>
      </div>

      <style>{`
        #loader-wrapper {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 2000;
        }

        #loader {
          display: block;
          position: absolute;
          left: 50%;
          top: 50%;
          width: 150px;
          height: 150px;
          margin: -75px 0 0 -75px;
          border-radius: 50%;
          border: 6px solid transparent;
          border-top-color: #2c98f0;
          animation: spin 2s linear infinite;
          z-index: 10001;
        }

        #loader:before {
          content: "";
          position: absolute;
          top: 5px;
          left: 5px;
          right: 5px;
          bottom: 5px;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #f9c922;
          animation: spin 7s linear infinite;
        }

        #loader:after {
          content: "";
          position: absolute;
          top: 15px;
          left: 15px;
          right: 15px;
          bottom: 15px;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: #2c98f0;
          animation: spin 1.5s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loader-section {
          position: fixed;
          top: 0;
          width: 51%;
          height: 100%;
          background: #000;
          z-index: 1000;
          transform: translateX(0);
        }

        .loader-section.section-left { left: 0; }
        .loader-section.section-right { right: 0; }

        .loaded .loader-section.section-left {
          transform: translateX(-100%);
          transition: all 0.7s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        }

        .loaded .loader-section.section-right {
          transform: translateX(100%);
          transition: all 0.7s 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
        }

        .loaded #loader {
          opacity: 0;
          transition: all 0.3s ease-out;
        }

        .loaded #loader-wrapper {
          visibility: hidden;
          transform: translateY(-100%);
          transition: all 0.3s 1s ease-out;
        }

        .nospin {
          animation: none !important; /* Forcefully stop animation */
          z-index: 10002; /* Ensure logo stays above loader */
        }
      `}</style>
    </motion.div>
  );
};

export default Loader;
