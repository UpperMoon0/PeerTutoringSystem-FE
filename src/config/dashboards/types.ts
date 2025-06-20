import type { ComponentType } from 'react';
import type { LucideIcon } from 'lucide-react';
import type { DashboardConfig, UserRole } from '@/types/dashboard.types';

// Configuration section interface for the config system
export interface ConfigSectionConfig {
  id: string;
  title: string;
  subtitle: string;
  icon: LucideIcon;
  path: string;
  component?: ComponentType<{ onNavigateToSection?: (section: string) => void }>;
}

// Dashboard configuration factory interface
export interface DashboardConfigFactory {
  role: UserRole;
  title: string;
  subtitle: string;
  basePath: string;
  theme: {
    primaryColor: string;
    iconColor: string;
    gradientColors: [string, string];
  };
  sections: ConfigSectionConfig[];
}

// Configuration registry type
export type ConfigRegistry = {
  admin: DashboardConfigFactory;
  tutor: DashboardConfigFactory;
};

// Helper function type for creating dashboard config
export type CreateDashboardConfig = (
  role: UserRole,
  indicatorCallback?: (sectionId: string) => import('@/types/dashboard.types').SidebarItem['indicator']
) => DashboardConfig | null;