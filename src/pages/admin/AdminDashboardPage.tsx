import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ListChecks, Users } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <nav className="mb-4">
        <ul className="flex space-x-4">
          <li>
            {}
            <Button
              asChild
              variant="default"
              className="bg-gradient-to-r from-yellow-300 to-yellow-500 hover:from-yellow-400 hover:to-yellow-600 text-white px-6 py-3 text-lg shadow-xs"
            >
              <Link to="tutor-verifications">
                <ListChecks className="mr-2 size-5" /> {}
                Tutor Verifications
              </Link>
            </Button>
          </li>
          <li>
            <Button
              asChild
              variant="default"
              className="bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white px-6 py-3 text-lg shadow-xs"
            >
              <Link to="manage-users">
                <Users className="mr-2 size-5" /> {}
                Manage Users
              </Link>
            </Button>
          </li>
        </ul>
      </nav>
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
