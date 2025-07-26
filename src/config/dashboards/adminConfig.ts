import { Shield, UserCheck, Users, BookOpen, Calendar, DollarSign } from 'lucide-react';
import type { DashboardConfigFactory } from './types';
import AdminOverview from '@/components/dashboard/overviews/AdminOverview';
import ManageUsersSection from '@/components/admin/ManageUsersSection';
import ManageSkillsSection from '@/components/admin/ManageSkillsSection';
import TutorVerificationSection from '@/components/admin/TutorVerificationSection';
import ManageBookingsSection from '@/components/admin/ManageBookingsSection';
import ManageFinanceSection from '@/components/admin/ManageFinanceSection';

export const adminConfig: DashboardConfigFactory = {
  role: 'admin',
  title: 'Admin Portal',
  subtitle: 'System Management',
  basePath: '/admin',
  theme: {
    primaryColor: 'red',
    iconColor: 'text-red-400',
    gradientColors: ['from-red-500', 'to-orange-600'],
  },
  sections: [
    {
      id: 'overview',
      title: 'Overview',
      subtitle: 'Dashboard overview and system metrics',
      icon: Shield,
      path: '/admin?section=overview',
      component: AdminOverview,
    },
    {
      id: 'tutor-verifications',
      title: 'Tutor Verifications',
      subtitle: 'Review and approve tutor applications',
      icon: UserCheck,
      path: '/admin?section=tutor-verifications',
      component: TutorVerificationSection,
    },
    {
      id: 'manage-users',
      title: 'Manage Users',
      subtitle: 'User management and moderation',
      icon: Users,
      path: '/admin?section=manage-users',
      component: ManageUsersSection,
    },
    {
      id: 'manage-skills',
      title: 'Manage Skills',
      subtitle: 'Skill categories and subjects',
      icon: BookOpen,
      path: '/admin?section=manage-skills',
      component: ManageSkillsSection,
    },
    {
      id: 'manage-bookings',
      title: 'Manage Bookings',
      subtitle: 'System-wide booking oversight',
      icon: Calendar,
      path: '/admin?section=manage-bookings',
      component: ManageBookingsSection,
    },
    {
      id: 'manage-finance',
      title: 'Manage Finance',
      subtitle: 'System-wide finance oversight',
      icon: DollarSign,
      path: '/admin?section=manage-finance',
      component: ManageFinanceSection,
    },
  ],
};