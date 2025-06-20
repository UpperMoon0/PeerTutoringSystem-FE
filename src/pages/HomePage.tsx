import React from 'react';
import HeroSection from '@/components/common/HeroSection';
import FeaturedTutorsSection from '@/components/common/FeaturedTutorsSection';
import PageFooter from '@/components/common/PageFooter';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      {}
      <main className="flex-grow">
        <HeroSection />
        <FeaturedTutorsSection />
      </main>
      <PageFooter />
    </div>
  );
};

export default HomePage;
