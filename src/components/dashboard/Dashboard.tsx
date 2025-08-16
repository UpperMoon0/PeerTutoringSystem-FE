import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import DashboardSidebar from './DashboardSidebar';
import DashboardContent from './DashboardContent';
import type { DashboardProps, TutorSessionStats } from '@/types/dashboard.types';
import { SessionService } from '@/services/SessionService';

const Dashboard: React.FC<DashboardProps> = ({
  config,
  activeSection: propActiveSection,
  onSectionChange,
  children,
  className
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState<string>(propActiveSection || 'overview');
  const [sessionStats, setSessionStats] = useState<TutorSessionStats | null>(null);

  // Handle URL-based navigation
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const urlSection = searchParams.get('section');
    
    // Determine the valid sections for this dashboard
    const validSections = Object.keys(config.sections);
    
    if (urlSection && validSections.includes(urlSection)) {
      setActiveSection(urlSection);
    } else {
      setActiveSection('overview');
    }
  }, [location.search, config.sections]);

  useEffect(() => {
    if (config.role === 'tutor') {
      SessionService.getTutorSessionStats().then(result => {
        if (result.success) {
          setSessionStats(result.data);
        }
      });
    }
  }, [config.role]);

  // Sync with parent component if needed
  useEffect(() => {
    if (propActiveSection && propActiveSection !== activeSection) {
      setActiveSection(propActiveSection);
    }
  }, [propActiveSection, activeSection]);

  // Handle section changes
  const handleSectionChange = (section: string) => {
    setActiveSection(section);
    
    // Update URL
    const newUrl = `${config.basePath}?section=${section}`;
    navigate(newUrl, { replace: true });
    
    // Call parent handler if provided
    if (onSectionChange) {
      onSectionChange(section);
    }
  };

  // Create enhanced config with section handlers
  const enhancedConfig = {
    ...config,
    sidebarItems: config.sidebarItems.map(item => ({
      ...item,
      onClick: item.onClick || (() => {
        // Extract section from href for automatic navigation
        try {
          const url = new URL(item.href, window.location.origin);
          const section = url.searchParams.get('section') || 'overview';
          handleSectionChange(section);
        } catch (error) {
          console.warn('Error parsing item href for section change:', item.href, error);
        }
      })
    }))
  };

  return (
    <div className={cn("h-screen bg-background flex", className)}>
      {/* Sidebar */}
      <DashboardSidebar
        config={enhancedConfig}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        sessionStats={sessionStats}
        className="flex-shrink-0"
      />
      
      {/* Main Content */}
      <DashboardContent
        config={config}
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        className="flex-1"
      >
        {children}
      </DashboardContent>
    </div>
  );
};

export default Dashboard;