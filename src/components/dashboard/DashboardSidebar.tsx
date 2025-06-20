import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X, AlertCircle } from 'lucide-react';
import type { SidebarProps, SidebarItem } from '@/types/dashboard.types';

const DashboardSidebar: React.FC<SidebarProps> = ({
  config,
  className
}) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleItemClick = (item: SidebarItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsMobileMenuOpen(false); // Close mobile menu on item click
  };

  const isItemActive = (item: SidebarItem): boolean => {
    if (!item.href) return false;

    const searchParams = new URLSearchParams(location.search);
    const currentSection = searchParams.get('section');
    
    try {
      const itemUrl = new URL(item.href, window.location.origin);
      const itemSection = itemUrl.searchParams.get('section');
      
      // Check if we're on the same path
      if (location.pathname === itemUrl.pathname) {
        if (itemSection) {
          // Special case for overview: active if section is 'overview' or no section param
          if (itemSection === 'overview') {
            return currentSection === 'overview' || currentSection === null;
          } else {
            return itemSection === currentSection;
          }
        } else {
          // For items without section (exact path match)
          return location.pathname === item.href && !itemSection && !currentSection;
        }
      }
    } catch (error) {
      console.warn('Error parsing item href:', item.href, error);
      // Fallback to simple path comparison
      return location.pathname === item.href;
    }
    
    return false;
  };

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
              <div className={cn(
                "w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center",
                `from-${config.theme.primaryColor} to-${config.theme.iconColor}`
              )}>
                {React.createElement(config.sidebarItems[0]?.icon || Menu, {
                  className: "w-6 h-6 text-white"
                })}
              </div>
              <div>
                <h2 className="text-white font-semibold text-lg">{config.title}</h2>
                <p className="text-gray-400 text-sm">{config.subtitle}</p>
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
          {config.sidebarItems.map((item, index) => {
            const isActive = isItemActive(item);
            const Icon = item.icon;
            const key = item.href || `item-${index}-${item.label}`;
            
            const commonProps = {
              className: cn(
                "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
                isActive
                  ? `bg-gradient-to-r ${config.theme.gradientColors[0]} ${config.theme.gradientColors[1]} text-white shadow-lg`
                  : "text-gray-300 hover:text-white hover:bg-gray-800"
              ),
              "aria-label": item.label,
            };

            const content = (
              <>
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-white" : "text-gray-400 group-hover:text-white"
                )} />
                <span className="font-medium">{item.label}</span>
                {/* Show indicator if configured */}
                {item.indicator?.show && (
                  <div className="ml-auto" title={item.indicator.tooltip || ''}>
                    <AlertCircle className={cn(
                      "w-4 h-4",
                      item.indicator.variant === 'warning' && "text-yellow-400",
                      item.indicator.variant === 'error' && "text-red-400",
                      item.indicator.variant === 'info' && "text-blue-400",
                      item.indicator.variant === 'success' && "text-green-400"
                    )} />
                  </div>
                )}
              </>
            );
            
            // Always render as Link since href is always provided
            // onClick handler will still be called via handleItemClick
            return (
              <Link
                key={key}
                to={item.href}
                onClick={() => handleItemClick(item)}
                {...commonProps}
              >
                {content}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-800">
          <div className="bg-gray-800 rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              {React.createElement(config.sidebarItems[0]?.icon || Menu, {
                className: `w-5 h-5 text-${config.theme.iconColor.split('-')[0]}-400`
              })}
              <span className="text-gray-300 text-sm font-medium">
                {config.role === 'admin' ? 'System Stats' : 'Quick Stats'}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {config.role === 'admin' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Total Users</span>
                    <span className="text-blue-400 font-medium">1,250</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Pending Verifications</span>
                    <span className="text-yellow-400 font-medium">12</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-400">This Month</span>
                    <span className="text-green-400 font-medium">$1,250</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Sessions</span>
                    <span className="text-blue-400 font-medium">24</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardSidebar;