import React from 'react';
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import LoginPage from '../pages/LoginPage';
import StudentRegisterPage from '../pages/StudentRegisterPage';
import TutorRegisterPage from '../pages/TutorRegisterPage';
import App from '../App';
import HomePage from '../pages/HomePage';
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import AdminBookingsPage from '@/pages/admin/AdminBookingsPage';
import ProtectedRoute from './ProtectedRoute';
import UserProfilePage from '@/pages/UserProfilePage';
import TutorListPage from '@/pages/TutorListPage';
import TutorDetailPage from '@/pages/TutorDetailPage';
import TutorDashboardPage from '@/pages/tutor/TutorDashboardPage';
import StudentBookingHistoryPage from '@/pages/StudentBookingHistoryPage';
import StudentUpcomingSessionsPage from '@/pages/StudentUpcomingSessionsPage';
import ChatPage from '../pages/ChatPage';
import PaymentSuccessPage from '@/pages/PaymentSuccessPage';
import CheckoutPage from '@/pages/CheckoutPage';
import TutorFinancePage from '@/pages/tutor/TutorFinancePage';
import TransactionHistoryPage from '@/pages/transaction-history';

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
        path: 'payment-success',
        element: <PaymentSuccessPage />,
      },
      {
        path: 'checkout',
        element: <CheckoutPage />,
      },
      {
        path: 'transaction-history',
        element: <TransactionHistoryPage />,
      },
      {
        path: 'student',
        element: <ProtectedRoute allowedRoles={['Student', 'Tutor']} />,
        children: [
          {
            path: 'upcoming-sessions',
            element: <StudentUpcomingSessionsPage />,
          },
          {
            path: 'booking-history',
            element: <StudentBookingHistoryPage />,
          },
          {
            path: 'chat',
            element: <ChatPage />,
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
          {
            path: 'finance',
            element: <TutorFinancePage />,
          },
        ],
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
          { path: 'bookings', element: <AdminBookingsPage /> },
        ],
      },
    ],
  },
]);

const AppRouter: React.FC = () => { 
  return <RouterProvider router={router} />;
};

export default AppRouter;
