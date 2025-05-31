import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  Calendar,
  BookOpen,
  User,
  DollarSign,
  BarChart3,
  Settings,
  Home,
  Menu,
  X
} from 'lucide-react';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface TutorSidebarProps {
  className?: string;
  onAvailabilityClick?: () => void;
  onBookingsClick?: () => void;
}

const TutorSidebar: React.FC<TutorSidebarProps> = ({ className, onAvailabilityClick, onBookingsClick }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    { icon: Home, label: 'Dashboard', href: '/tutor' },
    { icon: BookOpen, label: 'My Bookings', onClick: onBookingsClick || (() => {}), href: onBookingsClick ? undefined : '/tutor/bookings' },
    { icon: Calendar, label: 'Manage Availability', onClick: onAvailabilityClick || (() => {}), href: onAvailabilityClick ? undefined : '/tutor/availability' },
    { icon: User, label: 'Profile', href: '/profile' },
    { icon: BarChart3, label: 'Analytics', href: '/tutor/analytics' },
    { icon: Settings, label: 'Settings', href: '/tutor/settings' },
  ];

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-gray-900 text-white rounded-lg shadow-lg"
        aria-label="Open menu"
      >
        <Menu className="w-6 h-6" />
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "w-64 bg-gray-900 border-r border-gray-800 flex flex-col h-full",
        "lg:relative lg:translate-x-0",
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}>
      {/* Header */}
      <div className="p-6 border-b border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <User className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Tutor Portal</h2>
              <p className="text-gray-400 text-sm">Manage your sessions</p>
            </div>
          </div>
          {/* Mobile Close Button */}
          <button
            onClick={() => setIsMobileMenuOpen(false)}
            className="lg:hidden p-1 text-gray-400 hover:text-white"
            aria-label="Close menu"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {sidebarItems.map((item, index) => {
          const isActive = location.pathname === item.href;
          const Icon = item.icon;
          const key = item.href || `item-${index}`;
          
          if (item.onClick) {
            return (
              <button
                key={key}
                onClick={item.onClick}
                className={cn(
                  "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                    : "text-gray-300 hover:text-white hover:bg-gray-800"
                )}
                aria-label={item.label}
              >
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                )} />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          }
          
          return (
            <Link
              key={key}
              to={item.href!}
              className={cn(
                "flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg"
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              )}
              aria-label={item.label}
            >
              <Icon className={cn(
                "w-5 h-5 transition-colors",
                isActive ? "text-white" : "text-gray-400 group-hover:text-white"
              )} />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-800">
        <div className="bg-gray-800 rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-3">
            <DollarSign className="w-5 h-5 text-green-400" />
            <span className="text-gray-300 text-sm font-medium">Quick Stats</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">This Month</span>
              <span className="text-green-400 font-medium">$1,250</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Sessions</span>
              <span className="text-blue-400 font-medium">24</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default TutorSidebar;