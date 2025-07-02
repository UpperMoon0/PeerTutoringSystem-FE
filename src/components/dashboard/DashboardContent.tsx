import React from 'react';
import { cn } from '@/lib/utils';
import type { DashboardContentProps } from '@/types/dashboard.types';

const DashboardContent: React.FC<DashboardContentProps> = ({
  config,
  activeSection,
  onSectionChange,
  children,
  className
}) => {
  const sectionConfig = config.sections[activeSection];
  
  if (!sectionConfig) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Section Not Found</h2>
          <p className="text-muted-foreground">The requested section "{activeSection}" could not be found.</p>
        </div>
      </div>
    );
  }

  // Render section component if it exists
  const SectionComponent = sectionConfig.component;
  
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="bg-card border-b border-border px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-card-foreground">
                {sectionConfig.title}
              </h1>
              <p className="text-muted-foreground mt-1 text-sm lg:text-base">
                {sectionConfig.subtitle}
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className={cn(
        "flex-1 p-6 overflow-auto bg-background",
        className
      )}>
        {SectionComponent ? (
          <SectionComponent onNavigateToSection={onSectionChange || (() => {})} />
        ) : (
          children
        )}
      </main>
    </div>
  );
};

export default DashboardContent;