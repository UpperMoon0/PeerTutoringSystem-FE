import React from 'react';
import { Link, Outlet } from 'react-router-dom';

const AdminDashboardPage: React.FC = () => {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <nav className="mb-4">
        <ul className="flex space-x-4">
          <li>
            <Link to="tutor-verifications" className="text-blue-500 hover:underline">
              Tutor Verifications
            </Link>
          </li>
          {}
        </ul>
      </nav>
      <div className="mt-4">
        <Outlet />
      </div>
    </div>
  );
};

export default AdminDashboardPage;
