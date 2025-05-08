import React from 'react';
import { Button } from '@/components/ui/button'; 

const Header: React.FC = () => {
  return (
    <header className="p-4 bg-gradient-to-r from-[var(--btn-primary-gradient-color-from)] to-[var(--btn-primary-gradient-color-to)] text-white">
      <div className="container mx-auto flex items-center justify-between">
        <div className="text-xl font-bold">
          TheTutorGroup
        </div>
        <nav className="flex items-center space-x-4">
          <Button
            variant="default" 
            className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 shadow-xs text-white"
          >
            Sign In
          </Button>
          <Button
            variant="default" 
            className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 shadow-xs text-white"
          >
            Sign Up
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
