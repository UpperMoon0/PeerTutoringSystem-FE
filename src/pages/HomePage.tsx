import React from 'react';
import HeroSection from '@/components/common/HeroSection';
import HowItWorksSection from '@/components/common/HowItWorksSection';
import SubjectCategoriesSection from '@/components/common/SubjectCategoriesSection';
import FeaturedTutorsCarousel from '@/components/common/FeaturedTutorsCarousel';
import SuccessStoriesSection from '@/components/common/SuccessStoriesSection';
import FeaturesSection from '@/components/common/FeaturesSection';
import CallToActionSection from '@/components/common/CallToActionSection';
import PageFooter from '@/components/common/PageFooter';

const HomePage: React.FC = () => {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <main className="flex-grow">
        <HeroSection />
        <HowItWorksSection />
        <SubjectCategoriesSection />
        <FeaturedTutorsCarousel />
        <SuccessStoriesSection />
        <FeaturesSection />
        <CallToActionSection />
      </main>
      <PageFooter />
    </div>
  );
};

export default HomePage;
