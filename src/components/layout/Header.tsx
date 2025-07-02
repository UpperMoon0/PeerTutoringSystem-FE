import React from 'react';
import { Button } from '@/components/ui/button';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import HeaderUserProfile from './HeaderUserProfile';
import { MessageSquare } from 'lucide-react';

const Header: React.FC = () => {
  const { currentUser, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/'); 
  };

  return (
    <header className="bg-background border-b border-border text-foreground shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3 text-xl font-bold text-foreground hover:text-muted-foreground transition-colors">
              <img
                src="/src/assets/images/icon.png"
                alt="TheTutorGroup Icon"
                className="w-16 h-16 object-contain hover:drop-shadow-[0_0_20px_rgba(255,255,255,1)] transition-all duration-300"
                style={{
                  animation: 'flicker 4s infinite ease-in-out',
                  filter: 'drop-shadow(0 0 8px rgba(255,255,255,0.7)) drop-shadow(0 0 16px rgba(255,255,255,0.4)) drop-shadow(0 0 24px rgba(255,255,255,0.2))'
                }}
              />
              <span>TheTutorGroup</span>
            </Link>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/tutors"
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === '/tutors'
                    ? 'bg-primary text-primary-foreground shadow-lg'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                Find Tutors
              </Link>
              
              {/* Student Navigation - Available to both Students and Tutors */}
              {currentUser && (currentUser.role === 'Student' || currentUser.role === 'Tutor') && (
                <>
                  <Link
                    to="/student/upcoming-sessions"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname === '/student/upcoming-sessions'
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    Upcoming Sessions
                  </Link>
                  <Link
                    to="/student/booking-history"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname === '/student/booking-history'
                        ? 'bg-primary text-primary-foreground shadow-lg'
                        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    My Bookings
                  </Link>
                </>
              )}

              {/* Tutor-specific Navigation */}
              {currentUser && currentUser.role === 'Tutor' && (
                <Link
                  to="/tutor"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    (location.pathname === '/tutor' || location.pathname.startsWith('/tutor/'))
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Tutor Dashboard
                </Link>
              )}

              {/* Admin Navigation */}
              {currentUser && currentUser.role === 'Admin' && (
                <Link
                  to="/admin"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname.startsWith('/admin')
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Admin Dashboard
                </Link>
              )}

              {/* Become a Tutor - Only for Students who aren't tutors yet */}
              {currentUser && currentUser.role === 'Student' && (
                <Link
                  to="/register-tutor"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    location.pathname === '/register-tutor'
                      ? 'bg-primary text-primary-foreground shadow-lg'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                >
                  Become a Tutor
                </Link>
              )}
            </div>
          </div>
          <nav className="flex items-center space-x-3">
            {loading ? (
              <div className="text-muted-foreground">Loading...</div>
            ) : currentUser ? (
              <>
                {(currentUser.role === 'Tutor' || currentUser.role === 'Student') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/student/chat')}
                    className="text-muted-foreground hover:text-primary"
                  >
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                )}
                <HeaderUserProfile />
                <Button
                  variant="destructive"
                  className="text-sm px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="default"
                  className="text-sm px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg"
                  asChild
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  variant="default"
                  className="bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90 text-primary-foreground text-sm px-4 py-2 rounded-lg transition-all duration-200 shadow-lg"
                  asChild
                >
                  <Link to="/register/student">Sign Up</Link>
                </Button>
              </>
            )}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
