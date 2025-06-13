import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  ListChecks,
  Users,
  Wrench,
  Home,
  Menu,
  X,
  Shield
} from 'lucide-react';

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href?: string;
  onClick?: () => void;
}

interface AdminSidebarProps {
  className?: string;
  onTutorVerificationClick?: () => void;
  onManageUsersClick?: () => void;
  onManageSkillsClick?: () => void;
}

const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  className, 
  onTutorVerificationClick, 
  onManageUsersClick, 
  onManageSkillsClick 
}) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const sidebarItems: SidebarItem[] = [
    { 
      icon: Home, 
      label: 'Dashboard', 
      onClick: () => location.pathname !== '/admin' || location.search !== '' ? undefined : (() => {}), 
      href: '/admin?section=overview' 
    },
    { 
      icon: ListChecks, 
      label: 'Tutor Verifications', 
      onClick: onTutorVerificationClick || (() => {}), 
      href: onTutorVerificationClick ? undefined : '/admin?section=tutor-verifications' 
    },
    { 
      icon: Users, 
      label: 'Manage Users', 
      onClick: onManageUsersClick || (() => {}), 
      href: onManageUsersClick ? undefined : '/admin?section=manage-users' 
    },
    { 
      icon: Wrench, 
      label: 'Manage Skills', 
      onClick: onManageSkillsClick || (() => {}), 
      href: onManageSkillsClick ? undefined : '/admin?section=manage-skills' 
    },
  ];

  const handleItemClick = (item: SidebarItem) => {
    if (item.onClick) {
      item.onClick();
    }
    setIsMobileMenuOpen(false); // Close mobile menu on item click
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
            <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-white font-semibold text-lg">Admin Portal</h2>
              <p className="text-gray-400 text-sm">System Management</p>
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
          // Determine active state based on section query parameter for dashboard items
          const searchParams = new URLSearchParams(location.search);
          const currentSection = searchParams.get('section');
          let isActive = false;
          if (item.href) {
            const itemUrl = new URL(item.href, window.location.origin);
            const itemSection = itemUrl.searchParams.get('section');
            if (location.pathname === itemUrl.pathname) {
              if (itemSection) {
                isActive = itemSection === currentSection;
                 // Special case for overview: active if section is 'overview' or no section param
                if (itemSection === 'overview' && (currentSection === 'overview' || currentSection === null)) {
                    isActive = true;
                }
              } else { // For items without section (e.g. /admin/analytics)
                 isActive = location.pathname === item.href && !itemSection && !currentSection;
              }
            }
          }

          const Icon = item.icon;
          const key = item.href || `item-${index}-${item.label}`;
          
          const commonProps = {
            className: cn(
              "w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group",
              isActive
                ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg"
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
            </>
          );
          
          // If item.href is not present, it means it's purely an onClick driven by parent (AdminDashboardPage)
          // or it's a placeholder for a future link.
          // We prioritize onClick passed from parent if available.
          if (item.onClick && !item.href) {
            return (
              <button
                key={key}
                onClick={() => handleItemClick(item)}
                {...commonProps}
              >
                {content}
              </button>
            );
          }
          
          // If item.href is present, it's a Link.
          // If item.onClick is also present (e.g. from parent), it will also be called.
          return (
            <Link
              key={key}
              to={item.href!}
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
            <Shield className="w-5 h-5 text-red-400" />
            <span className="text-gray-300 text-sm font-medium">System Stats</span>
          </div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Users</span>
              <span className="text-blue-400 font-medium">1,250</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Pending Verifications</span>
              <span className="text-yellow-400 font-medium">12</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
};

export default AdminSidebar;