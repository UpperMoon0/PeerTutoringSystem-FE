import React from 'react'; 
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import StudentRegisterPage from '../pages/StudentRegisterPage';
import TutorRegisterPage from '../pages/TutorRegisterPage';
import App from '../App';
import HomePage from '../pages/HomePage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import TutorVerificationPage from '@/pages/admin/TutorVerificationPage';
import ManageUsersPage from '@/pages/admin/ManageUsersPage'; 
import ProtectedRoute from './ProtectedRoute';
import UserProfilePage from '@/pages/UserProfilePage';

const router = createBrowserRouter([
  {
    element: <App />,
    children: [
      {
        path: '/',
        element: <HomePage />,
      },
      {
        path: 'login',
        element: <LoginPage />,
      },
      {
        path: 'register/student',
        element: <StudentRegisterPage />,
      },
      {
        path: 'register-tutor',
        element: <TutorRegisterPage />,
      },
      {
        path: 'profile/:userId', 
        element: <UserProfilePage />,
      },
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['Admin']} />, 
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'tutor-verifications', element: <TutorVerificationPage /> },
          { path: 'manage-users', element: <ManageUsersPage /> }, 
        ],
      },
    ],
  },
]);

const AppRouter: React.FC = () => { 
  return <RouterProvider router={router} />;
};

export default AppRouter;
