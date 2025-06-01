import React from 'react';
import { Button } from '@/components/ui/button';

const HeroSection: React.FC = () => {
  return (
    <section className="bg-gray-900 text-white py-12 md:py-24">
      <div className="container mx-auto px-4 grid md:grid-cols-2 gap-8 items-center">
        <div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
            Find the right tutor for you.
          </h1>
          <p className="text-lg md:text-xl mb-8 text-gray-400">
            Tội ác xâm chiếm cả bầu trời, tai ương lan khắp vũ trụ, chẳng còn ai có thể hạn chế sự tự do của ngươi. Nhưng số phận ngươi vẫn gắn liền với thế giới này, cũng như một ngày không xa, ngươi sẽ đưa đệ tử của mình đến nơi này.
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
