import React from 'react';
import Dashboard from '@/components/dashboard/Dashboard';
import { createDashboardConfig } from '@/config/dashboards';

const AdminDashboardPage: React.FC = () => {
  const config = createDashboardConfig('admin');
  
  if (!config) {
    return (
      <div className="h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Configuration Error</h2>
          <p className="text-gray-400">Unable to load admin dashboard configuration.</p>
        </div>
      </div>
    );
  }

  return <Dashboard config={config} />;
};

export default AdminDashboardPage;
