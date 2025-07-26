import React from 'react';
import { Button } from '@/components/ui/button';
import bannerImage from '@/assets/images/banner.jpg';

const HeroSection: React.FC = () => {
  return (
    <section className="relative text-white py-12 md:py-24 overflow-hidden min-h-[600px]">
      {/* Video Background */}
      <img
        src={bannerImage}
        alt="Banner"
        className="absolute inset-0 w-full h-full object-cover z-0"
      />
      
      
      {/* Content */}
      <div className="relative z-20 container mx-auto px-4 flex items-center">
        <div className="max-w-4xl">
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6" style={{ color: 'white', textShadow: '2px 2px 8px rgba(0, 0, 0, 0.8)' }}>
            Find the right tutor for you.
          </h1>
          <p className="text-xl md:text-2xl lg:text-3xl mb-12 font-medium max-w-4xl" style={{
                      color: 'white',
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      padding: '20px 24px',
                      borderRadius: '12px',
                      backdropFilter: 'blur(5px)'
                    }}>
            Connect with expert peer tutors who understand your learning style and academic goals. Experience personalized one-on-one sessions that boost your confidence and unlock your full potential in any subject.
          </p>
          <Button size="lg" className="bg-secondary border-border hover:bg-accent text-secondary-foreground text-lg px-8 py-3">
            Learn More
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
