import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const Header: React.FC = () => {
  const { currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/'); // Redirect to homepage after logout
  };

  return (
    <header className="p-4 bg-gradient-to-r from-[var(--interactive-primary-gradient-from)] to-[var(--interactive-primary-gradient-to)] text-white">
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-xl font-bold !text-white hover:text-gray-200 transition-colors">
          TheTutorGroup
        </Link>
        <nav className="flex items-center space-x-4">
          {loading ? (
            <p>Loading...</p> 
          ) : currentUser ? (
            <>
              <span className="text-white">Welcome, {currentUser.fullName}</span>
              <Button
                variant="default"
                className="bg-red-500 hover:bg-red-600 shadow-xs !text-white"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
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
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
