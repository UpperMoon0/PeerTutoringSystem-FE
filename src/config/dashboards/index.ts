import type { DashboardConfig, UserRole, SidebarItem } from '@/types/dashboard.types';
import type { ConfigRegistry, CreateDashboardConfig } from './types';
import { adminConfig } from './adminConfig';
import { tutorConfig } from './tutorConfig';

// Configuration registry
export const configRegistry: ConfigRegistry = {
  admin: adminConfig,
  tutor: tutorConfig,
};

// Helper function to create sidebar items from sections
const createSidebarItems = (
  sections: typeof adminConfig.sections,
  indicatorCallback?: (sectionId: string) => SidebarItem['indicator']
): SidebarItem[] => {
  return sections.map((section) => ({
    icon: section.icon,
    label: section.title,
    href: section.path,
    indicator: indicatorCallback ? indicatorCallback(section.id) : undefined,
  }));
};

// Helper function to create dashboard configuration
export const createDashboardConfig: CreateDashboardConfig = (
  role: UserRole,
  indicatorCallback?: (sectionId: string) => SidebarItem['indicator']
) => {
  const config = configRegistry[role];
  if (!config) {
    return null;
  }

  // Convert config sections to the format expected by DashboardConfig
  const sections: Record<string, import('@/types/dashboard.types').SectionConfig> = {};
  
  config.sections.forEach((section) => {
    sections[section.id] = {
      title: section.title,
      subtitle: section.subtitle,
      component: section.component as React.ComponentType<import('@/types/dashboard.types').SectionComponentProps>,
    };
  });

  const dashboardConfig: DashboardConfig = {
    role: config.role,
    title: config.title,
    subtitle: config.subtitle,
    basePath: config.basePath,
    sections,
    sidebarItems: createSidebarItems(config.sections, indicatorCallback),
    theme: config.theme,
  };

  return dashboardConfig;
};

// Export individual configs for direct access
export { adminConfig, tutorConfig };

// Export types for external use
export type { ConfigRegistry, DashboardConfigFactory, ConfigSectionConfig } from './types';