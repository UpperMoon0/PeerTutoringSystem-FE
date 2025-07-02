import React from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import { createDashboardConfig } from '@/config/dashboards';
import { useTutorBioStatus } from '@/hooks/useTutorBioStatus';
import type { SectionComponentProps } from '@/types/dashboard.types';

interface ProfileSectionProps extends SectionComponentProps {
  onBioStatusChange: () => void;
}

const TutorDashboardPage: React.FC = () => {
  const { hasBio, loading, refresh } = useTutorBioStatus();
  
  // Create indicator callback for profile section
  const indicatorCallback = (sectionId: string) => {
    if (sectionId === 'profile' && !loading && !hasBio) {
      return {
        show: true,
        variant: 'warning' as const,
        tooltip: 'Complete your profile to attract more students'
      };
    }
    return undefined;
  };

  const config = createDashboardConfig('tutor', indicatorCallback);
  
  if (!config) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Configuration Error</h2>
          <p className="text-muted-foreground">Unable to load tutor dashboard configuration.</p>
        </div>
      </div>
    );
  }

  // Pass the refresh function to the profile section
  if (config.sections.profile?.component) {
    const OriginalProfileComponent = config.sections.profile.component;
    config.sections.profile.component = (props: SectionComponentProps) => {
      const ProfileComponent = OriginalProfileComponent as React.ComponentType<ProfileSectionProps>;
      return React.createElement(ProfileComponent, { ...props, onBioStatusChange: refresh });
    };
  }

  return <Dashboard config={config} />;
};

export default TutorDashboardPage;