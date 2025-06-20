import React from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import { createDashboardConfig } from '@/config/dashboards';
import { useTutorBioStatus } from '@/hooks/useTutorBioStatus';

const TutorDashboardPage: React.FC = () => {
  const { hasBio, loading } = useTutorBioStatus();
  
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
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Configuration Error</h2>
          <p className="text-gray-400">Unable to load tutor dashboard configuration.</p>
        </div>
      </div>
    );
  }

  return <Dashboard config={config} />;
};

export default TutorDashboardPage;