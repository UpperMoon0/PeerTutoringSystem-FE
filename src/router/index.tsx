import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
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
import TutorDetailPage from '@/pages/TutorDetailPage';
import TutorBookingsPage from '@/pages/TutorBookingsPage';
import TutorBookingDetailPage from '@/pages/TutorBookingDetailPage';
import TutorDashboardPage from '@/pages/tutor/TutorDashboardPage';

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
        path: '/tutors/:tutorId',
        element: <TutorDetailPage />,
      },
      {
        path: 'tutor',
        element: <ProtectedRoute allowedRoles={['Tutor']} />,
        children: [
          { index: true, element: <TutorDashboardPage /> },
          {
            path: 'availability',
            element: <Navigate to="/tutor?section=availability" replace />
          },
          { path: 'bookings', element: <TutorBookingsPage /> },
          { path: 'bookings/:bookingId', element: <TutorBookingDetailPage /> },
        ],
      },
      // Backward compatibility routes
      {
        path: '/manage-availability',
        element: <Navigate to="/tutor?section=availability" replace />
      },
      {
        path: '/tutor/bookings',
        element: <ProtectedRoute allowedRoles={['Tutor']} />,
        children: [
          { index: true, element: <TutorBookingsPage /> },
          { path: ':bookingId', element: <TutorBookingDetailPage /> },
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
