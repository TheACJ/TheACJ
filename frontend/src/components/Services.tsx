import { useContent } from '../hooks/useContent';

const Services = () => {
  const { content, loading } = useContent();

  if (loading) {
    return (
      <section id="services" className="py-20 bg-white dark:bg-gray-900 dark:text-[#b9b8b8]">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="services" className="py-20 bg-white dark:bg-gray-900 dark:text-[#b9b8b8]">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-16">
          <span className="text-sm text-gray-500 uppercase tracking-wider dark:text-[#b9b8b8]">What I do?</span>
          <h2 className="text-3xl font-bold mt-2">Here are some of my expertise</h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {content.services.map((service, index) => (
            <div key={service._id || index} className={`p-6 bg-white rounded-lg shadow-lg border-b-4 dark:bg-gray-900 ${index % 2 === 0 ? 'border-primary' : 'border-yellow-500'}`}>
              <div className={`${index % 2 == 0 ? 'text-primary mb-4' : 'text-yellow-500 mb-4'} dark:bg-gray-900`}>
                <i className={`${service.icon} text-2xl`}></i>
              </div>
              <h3 className="text-xl font-semibold mb-3">{service.title}</h3>
              <p className="text-gray-600 dark:text-[#b9b8b8]">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;