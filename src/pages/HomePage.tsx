import React from 'react';
import HeroSection from '@/components/common/HeroSection';
import FeaturedTutorsSection from '@/components/common/FeaturedTutorsSection';
import FeaturedCoursesSection from '@/components/common/FeaturedCoursesSection';
import PageFooter from '@/components/common/PageFooter';
// Assuming Header is part of a layout component wrapping this page
// import Header from '@/components/layout/Header'; 

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen">
      {/* <Header /> // Header would typically be in App.tsx or a Layout component */}
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
