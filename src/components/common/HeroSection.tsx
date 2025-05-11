import React from 'react';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-primary text-primary-foreground py-12 md:py-24">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find the right tutor for you.
          </h1>
          <p className="text-lg md:text-xl mb-8">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
          <Button variant="secondary" size="lg">
            Learn More
          </Button>
        </div>
        <div className="flex justify-center md:justify-end">
          {/* Placeholder for image - will replace with actual image or a more robust solution later */}
          <img 
            src="https://via.placeholder.com/400x500?text=Student+Image" 
            alt="Student with books" 
            className="rounded-lg shadow-lg max-w-xs md:max-w-sm lg:max-w-md"
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
