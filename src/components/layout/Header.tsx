import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

const Header: React.FC = () => {
  return (
    <header className="p-4 bg-gradient-to-r from-[var(--btn-primary-gradient-color-from)] to-[var(--btn-primary-gradient-color-to)] text-white">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold !text-white hover:text-gray-200 transition-colors">
          TheTutorGroup
        </Link>
        <nav className="flex items-center space-x-4">
          <Button
            variant="default" 
            className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700 shadow-xs" 
            asChild
          >
            <Link to="/login" className="!text-white">Sign In</Link>
          </Button>
          <Button
            variant="default" 
            className="bg-gradient-to-r from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 shadow-xs" 
            asChild
          >
            <Link to="/register/student" className="!text-white">Sign Up</Link>
          </Button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
