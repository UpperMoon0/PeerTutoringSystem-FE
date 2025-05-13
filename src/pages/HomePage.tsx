import React from 'react';
import HeroSection from '@/components/common/HeroSection';
import FeaturedTutorsSection from '@/components/common/FeaturedTutorsSection';
import FeaturedCoursesSection from '@/components/common/FeaturedCoursesSection';
import PageFooter from '@/components/common/PageFooter';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {}
      <main className="flex-grow">
        <HeroSection />
        <FeaturedTutorsSection />
        <FeaturedCoursesSection />
      </main>
      <PageFooter />
    </div>
  );
};

export default HomePage;
