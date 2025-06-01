import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ListChecks, Users, Wrench } from 'lucide-react';

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4 bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-4 text-foreground">Admin Dashboard</h1>
      <nav className="mb-4">
        <ul className="flex space-x-4">
          <li>
            <Button
              asChild
              variant="default"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-lg shadow-md"
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
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-lg shadow-md"
            >
              <Link to="manage-users">
                <Users className="mr-2 size-5" /> {}
                Manage Users
              </Link>
            </Button>
          </li>
          <li>
            <Button
              asChild
              variant="default"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 text-lg shadow-md"
            >
              <Link to="manage-skills">
                <Wrench className="mr-2 size-5" /> {}
                Manage Skills
              </Link>
            </Button>
          </li>
        </ul>
      </nav>
      <div className="mt-4 bg-card text-card-foreground p-6 rounded-lg shadow-lg">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
