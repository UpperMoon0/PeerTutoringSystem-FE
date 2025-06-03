import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import StudentRegisterPage from '../pages/StudentRegisterPage';
import TutorRegisterPage from '../pages/TutorRegisterPage';
import App from '../App';
import HomePage from '../pages/HomePage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
// import TutorVerificationPage from '@/pages/admin/TutorVerificationPage'; // No longer needed
// import ManageUsersPage from '@/pages/admin/ManageUsersPage';  // No longer needed
// import ManageSkillsPage from '@/pages/admin/ManageSkillsPage'; // No longer needed
import ProtectedRoute from './ProtectedRoute';
import UserProfilePage from '@/pages/UserProfilePage';
import TutorListPage from '@/pages/TutorListPage';
import TutorDetailPage from '@/pages/TutorDetailPage';
import TutorDashboardPage from '@/pages/tutor/TutorDashboardPage';
import StudentBookingHistoryPage from '@/pages/StudentBookingHistoryPage';

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
        path: 'student',
        element: <ProtectedRoute allowedRoles={['Student']} />,
        children: [
          {
            path: 'booking-history',
            element: <StudentBookingHistoryPage />,
          },
        ],
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
          {
            path: 'bookings',
            element: <Navigate to="/tutor?section=bookings" replace />
          },
          {
            path: 'bookings/:bookingId',
            element: <Navigate to="/tutor?section=bookings" replace />
          },
        ],
      },
      // Backward compatibility routes
      {
        path: '/manage-availability',
        element: <Navigate to="/tutor?section=availability" replace />
      },
      // Backward compatibility for bookings routes
      {
        path: '/tutor/bookings',
        element: <Navigate to="/tutor?section=bookings" replace />
      },
      {
        path: '/tutor/bookings/:bookingId',
        element: <Navigate to="/tutor?section=bookings" replace />
      },
      {
        path: 'admin',
        element: <ProtectedRoute allowedRoles={['Admin']} />, 
        children: [
          { index: true, element: <AdminDashboardPage /> },
          // The following routes are now handled within AdminDashboardPage
          // { path: 'tutor-verifications', element: <TutorVerificationPage /> },
          // { path: 'manage-users', element: <ManageUsersPage /> },
          // { path: 'manage-skills', element: <ManageSkillsPage /> },
        ],
      },
    ],
  },
]);

const AppRouter: React.FC = () => { 
  return <RouterProvider router={router} />;
};

export default AppRouter;
