import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Menu, X, AlertCircle } from 'lucide-react';
import type { SidebarProps, SidebarItem } from '@/types/dashboard.types';
import { TutorService } from '@/services/TutorService';
import type { TutorFinanceDetails } from '@/types/tutor.types';
import { AdminService } from '@/services/AdminService';
import type { AdminDashboardStatistics } from '@/types/admin.types';

const DashboardSidebar: React.FC<SidebarProps> = ({
  config,
  className,
  sessionStats
}) => {
  const [financeDetails, setFinanceDetails] = useState<TutorFinanceDetails | null>(null);
  const [adminStats, setAdminStats] = useState<AdminDashboardStatistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    const fetchFinanceDetails = async () => {
      try {
        const result = await TutorService.getTutorFinanceDetails();
        if (result.success && result.data) {
          setFinanceDetails(result.data);
        } else {
          console.error('Failed to fetch finance details for sidebar');
        }
      } catch (error) {
        console.error('Error fetching finance details for sidebar:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const fetchAdminStats = async () => {
      try {
        const result = await AdminService.getDashboardStatistics();
        if (result.success && result.data) {
          setAdminStats(result.data);
        } else {
          console.error('Failed to fetch admin stats for sidebar');
        }
      } catch (error) {
        console.error('Error fetching admin stats for sidebar:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (config.role === 'admin') {
      fetchAdminStats();
    } else {
      fetchFinanceDetails();
    }
  }, [config.role]);
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
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-card text-card-foreground rounded-lg shadow-lg"
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
        "w-64 bg-sidebar border-r border-sidebar-border flex flex-col h-full",
        "lg:relative lg:translate-x-0",
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-200 ease-in-out",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        className
      )}>
        {/* Header */}
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className={cn(
                "w-10 h-10 bg-gradient-to-br rounded-lg flex items-center justify-center",
                `from-${config.theme.primaryColor} to-${config.theme.iconColor}`
              )}>
                {React.createElement(config.sidebarItems[0]?.icon || Menu, {
                  className: "w-6 h-6 text-sidebar-primary-foreground"
                })}
              </div>
              <div>
                <h2 className="text-sidebar-foreground font-semibold text-lg">{config.title}</h2>
                <p className="text-muted-foreground text-sm">{config.subtitle}</p>
              </div>
            </div>
            {/* Mobile Close Button */}
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="lg:hidden p-1 text-muted-foreground hover:text-foreground"
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
                  ? `bg-gradient-to-r ${config.theme.gradientColors[0]} ${config.theme.gradientColors[1]} text-sidebar-primary-foreground shadow-lg`
                  : "text-sidebar-foreground hover:text-foreground hover:bg-sidebar-accent"
              ),
              "aria-label": item.label,
            };

            const content = (
              <>
                <Icon className={cn(
                  "w-5 h-5 transition-colors",
                  isActive ? "text-sidebar-primary-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                <span className="font-medium">{item.label}</span>
                {/* Show indicator if configured */}
                {item.indicator?.show && (
                  <div className="ml-auto" title={item.indicator.tooltip || ''}>
                    <AlertCircle className={cn(
                      "w-4 h-4",
                      item.indicator.variant === 'warning' && "text-yellow-400", // Keep specific color for warning
                      item.indicator.variant === 'error' && "text-destructive-foreground",
                      item.indicator.variant === 'info' && "text-primary",
                      item.indicator.variant === 'success' && "text-green-400" // Keep specific color for success
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
        <div className="p-4 border-t border-sidebar-border">
          <div className="bg-sidebar-accent rounded-lg p-4">
            <div className="flex items-center space-x-3 mb-3">
              {React.createElement(config.sidebarItems[0]?.icon || Menu, {
                className: `w-5 h-5 text-${config.theme.iconColor.split('-')[0]}-400` // Keep this as it uses config.theme.iconColor
              })}
              <span className="text-sidebar-foreground text-sm font-medium">
                {config.role === 'admin' ? 'System Stats' : 'Quick Stats'}
              </span>
            </div>
            <div className="space-y-2 text-xs">
              {isLoading ? (
                <div className="text-center text-muted-foreground">Loading...</div>
              ) : config.role === 'admin' ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Users</span>
                    <span className="text-primary font-medium">{adminStats?.totalUsers ?? 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Pending Verifications</span>
                    <span className="text-yellow-400 font-medium">{adminStats?.pendingVerifications ?? 'N/A'}</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Profit</span>
                    <span className="text-green-400 font-medium">
                      {financeDetails?.totalProfit?.toLocaleString('vi-VN') ?? 'N/A'} VND
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Sessions</span>
                    <span className="text-primary font-medium">{sessionStats?.totalSessions ?? 'N/A'}</span>
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