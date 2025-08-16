import { User, BookOpen, Calendar, Briefcase, DollarSign, CreditCard } from 'lucide-react';
import type { DashboardConfigFactory } from './types';
import TutorOverview from '@/components/dashboard/overviews/TutorOverview';
import ManageBookingsSection from '@/components/tutor/ManageBookingsSection';
import ManageAvailabilitySection from '@/components/tutor/ManageAvailabilitySection';
import TutorManageProfileSection from '@/components/tutor/TutorManageProfileSection';
import TutorFinancePage from '@/pages/tutor/TutorFinancePage';
import TutorWithdrawPage from '@/pages/tutor/TutorWithdrawPage';
import React from 'react';

export const tutorConfig: DashboardConfigFactory = {
  role: 'tutor',
  title: 'Tutor Portal',
  subtitle: 'Manage your sessions',
  basePath: '/tutor',
  theme: {
    primaryColor: 'blue',
    iconColor: 'text-blue-400',
    gradientColors: ['from-blue-500', 'to-purple-600'],
  },
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      subtitle: 'Dashboard overview and session metrics',
      icon: User,
      path: '/tutor?section=overview',
      component: TutorOverview,
    },
    {
      id: 'bookings',
      title: 'Manage Bookings',
      subtitle: 'Review and manage your tutoring sessions',
      icon: BookOpen,
      path: '/tutor?section=bookings',
      component: ManageBookingsSection,
    },
    {
      id: 'availability',
      title: 'Manage Availability',
      subtitle: 'Set your available time slots',
      icon: Calendar,
      path: '/tutor?section=availability',
      component: ManageAvailabilitySection,
    },
    {
      id: 'profile',
      title: 'Profile Management',
      subtitle: 'Update your tutor profile and skills',
      icon: Briefcase,
      path: '/tutor?section=profile',
      component: TutorManageProfileSection as React.ComponentType<unknown>,
    },
    {
      id: 'finance',
      title: 'Finance',
      subtitle: 'View your financial details',
      icon: DollarSign,
      path: '/tutor?section=finance',
      component: TutorFinancePage,
    },
    {
      id: 'withdraw',
      title: 'Withdraw',
      subtitle: 'Request a withdrawal',
      icon: CreditCard,
      path: '/tutor?section=withdraw',
      component: TutorWithdrawPage,
    },
  ],
};