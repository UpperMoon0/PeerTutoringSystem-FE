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
import ManageSkillsPage from '@/pages/admin/ManageSkillsPage'; 
import ProtectedRoute from './ProtectedRoute';
import UserProfilePage from '@/pages/UserProfilePage';
import TutorListPage from '@/pages/TutorListPage'; 
import ManageAvailabilityPage from '@/pages/ManageAvailabilityPage';

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
        path: '/tutors', 
        element: <TutorListPage />, 
      },
      {
        path: '/manage-availability', 
        element: <ProtectedRoute allowedRoles={['Tutor']} />,
        children: [
          { index: true, element: <ManageAvailabilityPage /> }
        ]
      },
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['Admin']} />, 
        children: [
          { index: true, element: <AdminDashboardPage /> },
          { path: 'tutor-verifications', element: <TutorVerificationPage /> },
          { path: 'manage-users', element: <ManageUsersPage /> }, 
          { path: 'manage-skills', element: <ManageSkillsPage /> }, 
        ],
      },
    ],
  },
]);

const AppRouter: React.FC = () => { 
  return <RouterProvider router={router} />;
};

export default AppRouter;
