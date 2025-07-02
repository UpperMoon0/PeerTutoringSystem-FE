import React from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import { createDashboardConfig } from '@/config/dashboards';

const AdminDashboardPage: React.FC = () => {
  const config = createDashboardConfig('admin');
  
  if (!config) {
    return (
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Configuration Error</h2>
          <p className="text-muted-foreground">Unable to load admin dashboard configuration.</p>
        </div>
      </div>
    );
  }

  return <Dashboard config={config} />;
};

export default AdminDashboardPage;
