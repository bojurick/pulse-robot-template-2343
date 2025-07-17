
import React from "react";
import { BackButton } from "./BackButton";
import { AppBreadcrumb } from "./AppBreadcrumb";

interface PageHeaderProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  showBreadcrumbs?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  showBackButton = true,
  showBreadcrumbs = true,
  children,
  className = ""
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {showBreadcrumbs && <AppBreadcrumb />}
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {showBackButton && <BackButton />}
          {title && (
            <div>
              <h1 className="text-heading-2 font-bold">{title}</h1>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>
          )}
        </div>
        {children && <div className="flex items-center gap-2">{children}</div>}
      </div>
    </div>
  );
};
