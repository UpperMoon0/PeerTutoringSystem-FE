import React from 'react';
import HeroSection from '@/components/common/HeroSection';
import FeaturedTutorsCarousel from '@/components/common/FeaturedTutorsCarousel';
import PageFooter from '@/components/common/PageFooter';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950">
      <main className="flex-grow">
        <HeroSection />
        <FeaturedTutorsCarousel />
      </main>
      <PageFooter />
    </div>
  );
};

export default HomePage;
