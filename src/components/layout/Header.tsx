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
            className="bg-blue-500 hover:bg-blue-600 shadow-xs" 
            asChild
          >
            <Link to="/login" className="!text-white">Sign In</Link>
          </Button>
          <Button
            variant="default" 
            className="bg-green-500 hover:bg-green-600 shadow-xs" 
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
