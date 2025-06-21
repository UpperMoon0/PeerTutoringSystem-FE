import React from 'react';
import { Button } from '@/components/ui/button';
import homeVideo from '@/assets/videos/home_video.mp4';

const HeroSection: React.FC = () => {
  return (
    <section className="relative text-white py-12 md:py-24 overflow-hidden min-h-[600px]">
      {/* Video Background */}
      <video
        className="absolute inset-0 w-full h-full object-cover z-0"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src={homeVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      
      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white" style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8), 0 0 8px rgba(0, 0, 0, 0.6)' }}>
            Find the right tutor for you.
          </h1>
          <p className="text-lg md:text-xl mb-8 text-white font-medium" style={{
            textShadow: '4px 4px 16px rgba(0, 0, 0, 1), 0 0 32px rgba(0, 0, 0, 0.95), 0 0 48px rgba(0, 0, 0, 0.8), 8px 8px 24px rgba(0, 0, 0, 0.9), -2px -2px 8px rgba(0, 0, 0, 0.7)',
            background: 'linear-gradient(135deg, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.5))',
            padding: '16px 20px',
            borderRadius: '12px',
            backdropFilter: 'blur(8px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}>
            Connect with expert peer tutors who understand your learning style and academic goals. Experience personalized one-on-one sessions that boost your confidence and unlock your full potential in any subject.
          </p>
          <Button size="lg" className="bg-gray-800 border-gray-700 hover:bg-gray-700 text-white">
            Learn More
          </Button>
        </div>
        <div className="flex justify-center md:justify-end">
          {}
          <img 
            src="src/assets/images/skirk.png"
            alt="Skirk" 
            className="rounded-lg shadow-lg max-w-xs md:max-w-sm lg:max-w-md"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
