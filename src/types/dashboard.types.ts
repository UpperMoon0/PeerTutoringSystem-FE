import type { ReactNode } from 'react';

// User role types
export type UserRole = 'admin' | 'tutor';

// Dashboard section types
export type DashboardSection = 'overview' | string;
export type AdminSection = 'overview' | 'tutor-verifications' | 'manage-users' | 'manage-skills' | 'manage-bookings';
export type TutorSection = 'overview' | 'availability' | 'bookings' | 'profile';

// Sidebar item interface
export interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  href: string; 
  onClick?: () => void; 
  indicator?: {
    show: boolean;
    variant: 'warning' | 'info' | 'success' | 'error';
    tooltip?: string;
  };
}

// Dashboard configuration interface
export interface DashboardConfig {
  role: UserRole;
  title: string;
  subtitle: string;
  basePath: string;
  sections: Record<string, SectionConfig>;
  sidebarItems: SidebarItem[];
  theme: {
    primaryColor: string;
    iconColor: string;
    gradientColors: [string, string];
  };
}

// Section configuration interface
export interface SectionComponentProps {
  onNavigateToSection: (section: string) => void;
}

export interface SectionConfig {
  title: string;
  subtitle: string;
  component?: React.ComponentType<SectionComponentProps>;
}

// Dashboard props interface
export interface DashboardProps {
  config: DashboardConfig;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  children?: ReactNode;
  className?: string;
}

// Sidebar props interface
export interface SidebarProps {
  config: DashboardConfig;
  activeSection?: string;
  onSectionChange?: (section: string) => void;
  className?: string;
  additionalProps?: Record<string, unknown>;
}

// Content props interface
export interface DashboardContentProps {
  config: DashboardConfig;
  activeSection: string;
  onSectionChange?: (section: string) => void;
  children?: ReactNode;
  className?: string;
}

// Overview component props
export interface OverviewProps {
  role: UserRole;
  loading?: boolean;
  error?: string | null;
}