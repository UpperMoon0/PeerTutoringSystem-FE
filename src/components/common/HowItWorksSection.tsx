import React from 'react';
import { Search, Users, BookOpen } from 'lucide-react';

const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      icon: Search,
      title: "Search",
      description: "Browse through our extensive database of qualified peer tutors and find the perfect match for your subject and learning style."
    },
    {
      icon: Users,
      title: "Connect",
      description: "Schedule a session with your chosen tutor at a time that works for both of you. Connect via our secure video platform."
    },
    {
      icon: BookOpen,
      title: "Learn",
      description: "Engage in personalized one-on-one tutoring sessions designed to help you master concepts and achieve your academic goals."
    }
  ];

  return (
    <section className="bg-gray-950 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            How It Works
          </h2>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            Getting started with peer tutoring is simple. Follow these three easy steps to begin your learning journey.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => {
            const IconComponent = step.icon;
            return (
              <div key={index} className="text-center group">
                <div className="relative mb-6">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto group-hover:scale-110 transition-transform duration-300">
                    <IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-gray-900 font-bold text-sm">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {step.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Connection lines for desktop */}
        <div className="hidden md:block relative mt-8">
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-full max-w-4xl">
            <div className="flex justify-between items-center relative">
              <div className="w-1/3"></div>
              <div className="w-1/3 border-t-2 border-dashed border-gray-600 relative">
                <div className="absolute top-0 right-0 w-0 h-0 border-l-8 border-l-gray-600 border-t-4 border-t-transparent border-b-4 border-b-transparent transform translate-x-1"></div>
              </div>
              <div className="w-1/3 border-t-2 border-dashed border-gray-600 relative">
                <div className="absolute top-0 right-0 w-0 h-0 border-l-8 border-l-gray-600 border-t-4 border-t-transparent border-b-4 border-b-transparent transform translate-x-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;