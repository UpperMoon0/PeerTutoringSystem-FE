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
    <header className="bg-primary text-primary-foreground shadow-lg">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-3 text-xl font-bold text-primary-foreground hover:text-primary-foreground/80 transition-colors">
              <img
                src="/icon.png"
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
                    ? 'bg-highlight text-primary-foreground shadow-lg'
                    : 'text-primary-foreground/80 hover:text-primary-foreground'
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
                        ? 'bg-highlight text-primary-foreground shadow-lg'
                        : 'text-primary-foreground/80 hover:text-primary-foreground'
                    }`}
                  >
                    Upcoming Sessions
                  </Link>
                  <Link
                    to="/student/booking-history"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname === '/student/booking-history'
                        ? 'bg-highlight text-primary-foreground shadow-lg'
                        : 'text-primary-foreground/80 hover:text-primary-foreground'
                    }`}
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/transaction-history"
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      location.pathname === '/transaction-history'
                        ? 'bg-highlight text-primary-foreground shadow-lg'
                        : 'text-primary-foreground/80 hover:text-primary-foreground'
                    }`}
                  >
                    Transaction History
                  </Link>
                </>
              )}

              {/* Tutor-specific Navigation */}
              {currentUser && currentUser.role === 'Tutor' && (
                <Link
                  to="/tutor"
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    (location.pathname === '/tutor' || location.pathname.startsWith('/tutor/'))
                      ? 'bg-highlight text-primary-foreground shadow-lg'
                      : 'text-primary-foreground/80 hover:text-primary-foreground'
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
                      ? 'bg-highlight text-primary-foreground shadow-lg'
                      : 'text-primary-foreground/80 hover:text-primary-foreground'
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
                      ? 'bg-highlight text-primary-foreground shadow-lg'
                      : 'text-primary-foreground/80 hover:text-primary-foreground'
                  }`}
                >
                  Become a Tutor
                </Link>
              )}
            </div>
          </div>
          <nav className="flex items-center space-x-3">
            {loading ? (
              <div className="text-primary-foreground">Loading...</div>
            ) : currentUser ? (
              <>
                {(currentUser.role === 'Tutor' || currentUser.role === 'Student') && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => navigate('/student/chat')}
                    className="text-primary-foreground/80 hover:text-primary-foreground"
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
                  variant="secondary"
                  className="text-sm px-4 py-2 rounded-lg transition-colors duration-200 shadow-lg"
                  asChild
                >
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button
                  variant="secondary"
                  className="bg-card text-card-foreground hover:bg-card/90 text-sm px-4 py-2 rounded-lg transition-all duration-200 shadow-lg"
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
